-- GH-27, fonte: incarico docs/incarichi/GH-27-riparazioni-pre-lancio.md.
-- Riparazioni pre-lancio demo: orari nel fuso del tenant, QR pet, risposta
-- staff alle richieste e chiusura atomica di visita + appuntamento.

BEGIN;

UPDATE public.tenants
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{booking_schedule,timezone}',
  '"Europe/Rome"'::jsonb,
  true
)
WHERE slug = 'grooming-hub'
  AND COALESCE(settings #>> '{booking_schedule,timezone}', '') = '';

ALTER TABLE public.pets
  ALTER COLUMN qr_token SET DEFAULT ('ghp_' || replace(gen_random_uuid()::text, '-', ''));

UPDATE public.pets
SET qr_token = 'ghp_' || replace(gen_random_uuid()::text, '-', '')
WHERE NULLIF(btrim(qr_token), '') IS NULL;

CREATE OR REPLACE FUNCTION public.ensure_pet_qr_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NULLIF(btrim(NEW.qr_token), '') IS NULL THEN
    NEW.qr_token := 'ghp_' || replace(gen_random_uuid()::text, '-', '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_pet_qr_token_before_insert ON public.pets;
CREATE TRIGGER ensure_pet_qr_token_before_insert
  BEFORE INSERT ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.ensure_pet_qr_token();

ALTER TABLE public.appointment_requests
  ADD COLUMN IF NOT EXISTS staff_responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS proposed_alternatives jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.appointment_requests'::regclass
      AND conname = 'appointment_requests_alternatives_valid'
  ) THEN
    ALTER TABLE public.appointment_requests
      ADD CONSTRAINT appointment_requests_alternatives_valid CHECK (
        jsonb_typeof(proposed_alternatives) = 'array'
        AND jsonb_array_length(proposed_alternatives) IN (0, 2, 3)
      );
  END IF;
END;
$$;

UPDATE public.appointment_requests
SET coat_condition_codes = array_replace(
  coat_condition_codes,
  'sensitive_skin'::text,
  'regular_grooming'::text
)
WHERE coat_condition_codes @> ARRAY['sensitive_skin'::text];

ALTER TABLE public.appointment_requests
  DROP CONSTRAINT IF EXISTS appointment_requests_coat_codes_valid;

ALTER TABLE public.appointment_requests
  ADD CONSTRAINT appointment_requests_coat_codes_valid CHECK (
    coat_condition_codes <@ ARRAY[
      'some_knots',
      'very_matted',
      'heavy_shedding',
      'regular_grooming',
      'clean_long'
    ]::text[]
    AND cardinality(coat_condition_codes) <= 5
  );

CREATE OR REPLACE FUNCTION public.prevent_duplicate_pending_appointment_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(NEW.tenant_id::text || ':' || NEW.pet_id::text, 0)
    );

    IF EXISTS (
      SELECT 1
      FROM public.appointment_requests ar
      WHERE ar.tenant_id = NEW.tenant_id
        AND ar.pet_id = NEW.pet_id
        AND ar.status = 'pending'
    ) THEN
      RAISE EXCEPTION 'Esiste gia una richiesta in attesa per questo pet'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_pending_appointment_request_before_insert
  ON public.appointment_requests;
CREATE TRIGGER prevent_duplicate_pending_appointment_request_before_insert
  BEFORE INSERT ON public.appointment_requests
  FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_pending_appointment_request();

CREATE OR REPLACE FUNCTION public.resolve_appointment_request_local(
  p_request_id uuid,
  p_decision text,
  p_scheduled_date date,
  p_scheduled_time time without time zone,
  p_duration_minutes integer
)
RETURNS public.appointment_requests
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_request public.appointment_requests;
  v_appointment_id text;
  v_timezone text;
  v_scheduled_at timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_request
  FROM public.appointment_requests ar
  WHERE ar.id = p_request_id
  FOR UPDATE;

  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_request.tenant_id) THEN
    RAISE EXCEPTION 'Appointment request not available to current staff user'
      USING ERRCODE = '42501';
  END IF;

  IF p_decision IS NULL OR p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid appointment request decision' USING ERRCODE = '22023';
  END IF;

  IF v_request.status <> 'pending' THEN
    IF v_request.status = p_decision THEN
      RETURN v_request;
    END IF;
    RAISE EXCEPTION 'Appointment request already resolved' USING ERRCODE = '23514';
  END IF;

  IF p_decision = 'rejected' THEN
    UPDATE public.appointment_requests
       SET status = 'rejected',
           staff_responded_at = now(),
           proposed_alternatives = '[]'::jsonb
     WHERE id = v_request.id
     RETURNING * INTO v_request;
    RETURN v_request;
  END IF;

  IF p_scheduled_date IS NULL OR p_scheduled_time IS NULL THEN
    RAISE EXCEPTION 'A date and time are required' USING ERRCODE = '22023';
  END IF;

  IF p_duration_minutes IS NULL OR p_duration_minutes < 15 THEN
    RAISE EXCEPTION 'A duration of at least 15 minutes is required' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(NULLIF(t.settings #>> '{booking_schedule,timezone}', ''), 'Europe/Rome')
    INTO v_timezone
  FROM public.tenants t
  WHERE t.id = v_request.tenant_id;

  IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = v_timezone) THEN
    RAISE EXCEPTION 'Invalid tenant timezone' USING ERRCODE = '22023';
  END IF;

  v_scheduled_at := (p_scheduled_date + p_scheduled_time) AT TIME ZONE v_timezone;
  IF v_scheduled_at <= now() THEN
    RAISE EXCEPTION 'A future appointment time is required' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.services s
  WHERE s.id = v_request.service_id
    AND s.tenant_id = v_request.tenant_id
    AND s.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not available' USING ERRCODE = '22023';
  END IF;

  v_appointment_id := gen_random_uuid()::text;

  INSERT INTO public.appointments (
    id,
    user_id,
    pet_id,
    tenant_id,
    scheduled_at,
    duration_minutes,
    status,
    approval_status,
    appointment_source,
    requested_by_customer_id,
    service_id
  ) VALUES (
    v_appointment_id,
    auth.uid(),
    v_request.pet_id,
    v_request.tenant_id,
    v_scheduled_at,
    p_duration_minutes,
    'scheduled',
    'approved',
    'customer',
    v_request.customer_user_id,
    v_request.service_id
  );

  UPDATE public.appointment_requests
     SET status = 'approved',
         appointment_id = v_appointment_id,
         staff_responded_at = now(),
         proposed_alternatives = '[]'::jsonb
   WHERE id = v_request.id
   RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

COMMENT ON FUNCTION public.resolve_appointment_request_local(uuid, text, date, time without time zone, integer)
IS 'GH-27: resolve a request by composing the chosen local date/time in the tenant timezone.';

REVOKE ALL ON FUNCTION public.resolve_appointment_request_local(uuid, text, date, time without time zone, integer)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_appointment_request_local(uuid, text, date, time without time zone, integer)
TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.propose_appointment_request_alternatives(
  p_request_id uuid,
  p_alternatives jsonb
)
RETURNS public.appointment_requests
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_request public.appointment_requests;
  v_settings jsonb;
  v_alternative jsonb;
  v_date date;
  v_preference text;
  v_weekday text;
  v_seen text[] := ARRAY[]::text[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_request
  FROM public.appointment_requests ar
  WHERE ar.id = p_request_id
  FOR UPDATE;

  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_request.tenant_id) THEN
    RAISE EXCEPTION 'Appointment request not available to current staff user'
      USING ERRCODE = '42501';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Appointment request already resolved' USING ERRCODE = '23514';
  END IF;

  IF jsonb_typeof(p_alternatives) <> 'array'
     OR jsonb_array_length(p_alternatives) NOT IN (2, 3) THEN
    RAISE EXCEPTION 'Choose two or three alternatives' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(t.settings #> '{booking_schedule}', '{}'::jsonb)
    INTO v_settings
  FROM public.tenants t
  WHERE t.id = v_request.tenant_id;

  FOR v_alternative IN SELECT value FROM jsonb_array_elements(p_alternatives)
  LOOP
    BEGIN
      v_date := (v_alternative ->> 'date')::date;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid alternative date' USING ERRCODE = '22023';
    END;
    v_preference := v_alternative ->> 'time_preference';

    IF v_date <= current_date OR v_preference NOT IN ('morning', 'afternoon') THEN
      RAISE EXCEPTION 'Invalid alternative' USING ERRCODE = '22023';
    END IF;

    IF (v_date::text || ':' || v_preference) = ANY(v_seen) THEN
      RAISE EXCEPTION 'Alternatives must be distinct' USING ERRCODE = '22023';
    END IF;
    v_seen := array_append(v_seen, v_date::text || ':' || v_preference);

    v_weekday := (ARRAY[
      'sunday', 'monday', 'tuesday', 'wednesday',
      'thursday', 'friday', 'saturday'
    ])[extract(dow FROM v_date)::integer + 1];

    IF COALESCE(v_settings -> 'closed_weekdays', '[]'::jsonb) ? v_weekday
       OR COALESCE(v_settings #> ARRAY['closed_time_preferences', v_weekday], '[]'::jsonb) ? v_preference THEN
      RAISE EXCEPTION 'Alternative falls in a declared closure' USING ERRCODE = '22023';
    END IF;
  END LOOP;

  UPDATE public.appointment_requests
     SET proposed_alternatives = p_alternatives,
         staff_responded_at = now()
   WHERE id = v_request.id
   RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

COMMENT ON FUNCTION public.propose_appointment_request_alternatives(uuid, jsonb)
IS 'GH-27: record two or three open alternatives for a pending customer request.';

REVOKE ALL ON FUNCTION public.propose_appointment_request_alternatives(uuid, jsonb)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.propose_appointment_request_alternatives(uuid, jsonb)
TO authenticated, service_role;

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS appointment_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.visits'::regclass
      AND conname = 'visits_appointment_id_fkey'
  ) THEN
    ALTER TABLE public.visits
      ADD CONSTRAINT visits_appointment_id_fkey
      FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS visits_appointment_id_unique_idx
  ON public.visits (appointment_id)
  WHERE appointment_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.complete_appointment_with_visit(
  p_appointment_id text,
  p_date date,
  p_treatments text,
  p_issues text,
  p_cost numeric
)
RETURNS public.visits
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_appointment public.appointments;
  v_visit public.visits;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_appointment
  FROM public.appointments a
  WHERE a.id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_appointment.tenant_id) THEN
    RAISE EXCEPTION 'Appointment not available to current staff user'
      USING ERRCODE = '42501';
  END IF;

  IF v_appointment.approval_status <> 'approved'
     OR v_appointment.status IN ('cancelled', 'no_show') THEN
    RAISE EXCEPTION 'Appointment cannot be completed' USING ERRCODE = '23514';
  END IF;

  IF p_date IS NULL OR p_cost IS NULL OR p_cost <= 0 THEN
    RAISE EXCEPTION 'A visit date and positive cost are required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_visit
  FROM public.visits v
  WHERE v.appointment_id = v_appointment.id;

  IF FOUND THEN
    RETURN v_visit;
  END IF;

  INSERT INTO public.visits (
    id, pet_id, tenant_id, appointment_id, date, treatments, issues, cost
  ) VALUES (
    gen_random_uuid()::text,
    v_appointment.pet_id,
    v_appointment.tenant_id,
    v_appointment.id,
    p_date,
    NULLIF(btrim(p_treatments), ''),
    NULLIF(btrim(p_issues), ''),
    p_cost
  )
  RETURNING * INTO v_visit;

  UPDATE public.appointments
     SET status = 'completed', updated_at = now()
   WHERE id = v_appointment.id;

  RETURN v_visit;
END;
$$;

COMMENT ON FUNCTION public.complete_appointment_with_visit(text, date, text, text, numeric)
IS 'GH-27: atomically add a visit linked to an approved appointment and mark it completed.';

REVOKE ALL ON FUNCTION public.complete_appointment_with_visit(text, date, text, text, numeric)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_appointment_with_visit(text, date, text, text, numeric)
TO authenticated, service_role;

COMMIT;
