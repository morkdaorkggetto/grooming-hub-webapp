-- GH-37, fonte: segnalazione del salone riportata da Luigi, 29 agosto 2026.
-- La capienza misura le postazioni, non gli addetti. Il controllo vive nel
-- database e serializza le scritture per tenant tramite un lock transazionale.

BEGIN;

UPDATE public.tenants
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{workstation_capacity}',
  '2'::jsonb,
  true
)
WHERE slug = 'grooming-hub'
  AND NOT (COALESCE(settings, '{}'::jsonb) ? 'workstation_capacity');

DO $$
DECLARE
  v_violation record;
BEGIN
  WITH events AS (
    SELECT a.tenant_id, a.scheduled_at AS event_at, 1 AS delta
    FROM public.appointments a
    WHERE a.status <> 'cancelled'
      AND a.approval_status = 'approved'
    UNION ALL
    SELECT a.tenant_id,
           a.scheduled_at + make_interval(mins => a.duration_minutes),
           -1
    FROM public.appointments a
    WHERE a.status <> 'cancelled'
      AND a.approval_status = 'approved'
  ), running AS (
    SELECT tenant_id,
           sum(delta) OVER (
             PARTITION BY tenant_id
             ORDER BY event_at, delta
             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
           ) AS concurrent_count
    FROM events
  ), peaks AS (
    SELECT tenant_id, max(concurrent_count)::integer AS peak
    FROM running
    GROUP BY tenant_id
  )
  SELECT p.tenant_id,
         p.peak,
         CASE
           WHEN t.settings ->> 'workstation_capacity' ~ '^[1-9][0-9]*$'
             THEN (t.settings ->> 'workstation_capacity')::integer
           ELSE 1
         END AS capacity
    INTO v_violation
  FROM peaks p
  JOIN public.tenants t ON t.id = p.tenant_id
  WHERE p.peak > CASE
    WHEN t.settings ->> 'workstation_capacity' ~ '^[1-9][0-9]*$'
      THEN (t.settings ->> 'workstation_capacity')::integer
    ELSE 1
  END
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'Existing appointments exceed workstation capacity for tenant %', v_violation.tenant_id
      USING ERRCODE = '23514',
            DETAIL = format('Peak %s, capacity %s', v_violation.peak, v_violation.capacity);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_appointment_workstation_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_capacity integer;
  v_peak integer;
  v_raw_capacity text;
BEGIN
  IF NEW.status = 'cancelled' OR NEW.approval_status <> 'approved' THEN
    RETURN NEW;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.tenant_id::text, 370037)
  );

  SELECT t.settings ->> 'workstation_capacity'
    INTO v_raw_capacity
  FROM public.tenants t
  WHERE t.id = NEW.tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found for appointment capacity check'
      USING ERRCODE = '23503';
  END IF;

  v_capacity := CASE
    WHEN v_raw_capacity ~ '^[1-9][0-9]*$' THEN v_raw_capacity::integer
    ELSE 1
  END;

  WITH intervals AS (
    SELECT a.scheduled_at AS starts_at,
           a.scheduled_at + make_interval(mins => a.duration_minutes) AS ends_at
    FROM public.appointments a
    WHERE a.tenant_id = NEW.tenant_id
      AND a.status <> 'cancelled'
      AND a.approval_status = 'approved'
      AND (TG_OP <> 'UPDATE' OR a.id <> NEW.id)
      AND a.scheduled_at < NEW.scheduled_at + make_interval(mins => NEW.duration_minutes)
      AND a.scheduled_at + make_interval(mins => a.duration_minutes) > NEW.scheduled_at
    UNION ALL
    SELECT NEW.scheduled_at,
           NEW.scheduled_at + make_interval(mins => NEW.duration_minutes)
  ), events AS (
    SELECT starts_at AS event_at, 1 AS delta FROM intervals
    UNION ALL
    SELECT ends_at, -1 FROM intervals
  ), running AS (
    SELECT sum(delta) OVER (
      ORDER BY event_at, delta
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS concurrent_count
    FROM events
  )
  SELECT COALESCE(max(concurrent_count), 0)::integer
    INTO v_peak
  FROM running;

  IF v_peak > v_capacity THEN
    RAISE EXCEPTION 'Le postazioni sono tutte occupate nella fascia scelta.'
      USING ERRCODE = 'P0001',
            DETAIL = 'GH37_APPOINTMENT_CAPACITY';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_appointment_workstation_capacity()
IS 'GH-37: serialize appointment writes per tenant and reject peak concurrency above workstation_capacity.';

REVOKE ALL ON FUNCTION public.enforce_appointment_workstation_capacity()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS appointments_enforce_workstation_capacity
ON public.appointments;

CREATE TRIGGER appointments_enforce_workstation_capacity
BEFORE INSERT OR UPDATE OF tenant_id, scheduled_at, duration_minutes, status, approval_status
ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.enforce_appointment_workstation_capacity();

CREATE OR REPLACE FUNCTION public.guard_tenant_workstation_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_capacity integer;
  v_peak integer;
  v_raw_capacity text;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.id::text, 370037)
  );

  v_raw_capacity := NEW.settings ->> 'workstation_capacity';

  IF v_raw_capacity IS NULL OR v_raw_capacity !~ '^[1-9][0-9]*$' THEN
    RAISE EXCEPTION 'workstation_capacity must be a positive integer'
      USING ERRCODE = '22023';
  END IF;

  v_capacity := v_raw_capacity::integer;

  WITH events AS (
    SELECT a.scheduled_at AS event_at, 1 AS delta
    FROM public.appointments a
    WHERE a.tenant_id = NEW.id
      AND a.status <> 'cancelled'
      AND a.approval_status = 'approved'
    UNION ALL
    SELECT a.scheduled_at + make_interval(mins => a.duration_minutes), -1
    FROM public.appointments a
    WHERE a.tenant_id = NEW.id
      AND a.status <> 'cancelled'
      AND a.approval_status = 'approved'
  ), running AS (
    SELECT sum(delta) OVER (
      ORDER BY event_at, delta
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS concurrent_count
    FROM events
  )
  SELECT COALESCE(max(concurrent_count), 0)::integer
    INTO v_peak
  FROM running;

  IF v_peak > v_capacity THEN
    RAISE EXCEPTION 'La capienza scelta e inferiore alle lavorazioni gia pianificate.'
      USING ERRCODE = '23514',
            DETAIL = format('Peak %s, capacity %s', v_peak, v_capacity);
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.guard_tenant_workstation_capacity()
IS 'GH-37: prevent tenant capacity changes that invalidate existing approved appointments.';

REVOKE ALL ON FUNCTION public.guard_tenant_workstation_capacity()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tenants_guard_workstation_capacity
ON public.tenants;

CREATE TRIGGER tenants_guard_workstation_capacity
BEFORE UPDATE OF settings
ON public.tenants
FOR EACH ROW
WHEN (
  (OLD.settings ->> 'workstation_capacity')
    IS DISTINCT FROM
  (NEW.settings ->> 'workstation_capacity')
)
EXECUTE FUNCTION public.guard_tenant_workstation_capacity();

COMMIT;
