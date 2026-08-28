-- GH-08 — Wizard richiesta appuntamento /u/book.
-- Fonte: docs/incarichi/GH-08-wizard-richiesta-appuntamento.md e proposta
-- approvata in docs/consegne/GH-08-fase0-atterraggio-db.md.
-- Una richiesta non occupa il calendario finche' lo staff non concorda un
-- orario preciso e la converte atomicamente in public.appointments.

BEGIN;

CREATE TABLE IF NOT EXISTS public.appointment_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id                 uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  service_id             uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  desired_date           date NOT NULL,
  time_preference        text,
  coat_condition_codes   text[] NOT NULL DEFAULT ARRAY[]::text[],
  coat_condition_notes   text,
  declared_pet_age       text,
  status                 text NOT NULL DEFAULT 'pending',
  appointment_id         text UNIQUE REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointment_requests_time_preference_valid
    CHECK (time_preference IS NULL OR time_preference IN ('morning', 'afternoon', 'flexible')),
  CONSTRAINT appointment_requests_coat_codes_valid
    CHECK (
      coat_condition_codes <@ ARRAY[
        'some_knots',
        'very_matted',
        'heavy_shedding',
        'sensitive_skin',
        'clean_long'
      ]::text[]
      AND cardinality(coat_condition_codes) <= 5
    ),
  CONSTRAINT appointment_requests_coat_notes_length
    CHECK (coat_condition_notes IS NULL OR char_length(coat_condition_notes) <= 500),
  CONSTRAINT appointment_requests_coat_condition_present
    CHECK (
      cardinality(coat_condition_codes) > 0
      OR NULLIF(pg_catalog.btrim(coat_condition_notes), '') IS NOT NULL
    ),
  CONSTRAINT appointment_requests_declared_age_length
    CHECK (declared_pet_age IS NULL OR char_length(declared_pet_age) <= 80),
  CONSTRAINT appointment_requests_status_valid
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.appointment_requests
  DROP CONSTRAINT IF EXISTS appointment_requests_resolution_consistent;

ALTER TABLE public.appointment_requests
  ADD CONSTRAINT appointment_requests_resolution_consistent
  CHECK (status = 'approved' OR appointment_id IS NULL);

CREATE INDEX IF NOT EXISTS appointment_requests_tenant_status_created_idx
  ON public.appointment_requests (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS appointment_requests_customer_created_idx
  ON public.appointment_requests (customer_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS appointment_requests_pet_idx
  ON public.appointment_requests (pet_id);

CREATE INDEX IF NOT EXISTS appointment_requests_service_idx
  ON public.appointment_requests (service_id);

CREATE OR REPLACE TRIGGER update_appointment_requests_timestamp
  BEFORE UPDATE ON public.appointment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS appointment_requests_staff_all ON public.appointment_requests;
CREATE POLICY appointment_requests_staff_all
  ON public.appointment_requests FOR ALL
  TO authenticated
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

DROP POLICY IF EXISTS appointment_requests_customer_select ON public.appointment_requests;
CREATE POLICY appointment_requests_customer_select
  ON public.appointment_requests FOR SELECT
  TO authenticated
  USING (
    customer_user_id = (SELECT auth.uid())
    AND public.has_tenant_access(tenant_id, 'customer')
  );

DROP POLICY IF EXISTS appointment_requests_customer_insert ON public.appointment_requests;
CREATE POLICY appointment_requests_customer_insert
  ON public.appointment_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_user_id = (SELECT auth.uid())
    AND status = 'pending'
    AND appointment_id IS NULL
    AND desired_date > CURRENT_DATE
    AND public.has_tenant_access(tenant_id, 'customer')
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id = appointment_requests.pet_id
        AND p.tenant_id = appointment_requests.tenant_id
        AND c.tenant_id = appointment_requests.tenant_id
        AND c.user_id = (SELECT auth.uid())
        AND (
          (p.birth_date IS NULL AND NULLIF(pg_catalog.btrim(appointment_requests.declared_pet_age), '') IS NOT NULL)
          OR (p.birth_date IS NOT NULL AND appointment_requests.declared_pet_age IS NULL)
        )
    )
    AND EXISTS (
      SELECT 1
      FROM public.services s
      WHERE s.id = appointment_requests.service_id
        AND s.tenant_id = appointment_requests.tenant_id
        AND s.is_active = true
    )
  );

CREATE OR REPLACE FUNCTION public.submit_appointment_request(
  p_tenant_id uuid,
  p_pet_id uuid,
  p_service_id uuid,
  p_desired_date date,
  p_time_preference text DEFAULT NULL,
  p_coat_condition_codes text[] DEFAULT ARRAY[]::text[],
  p_coat_condition_notes text DEFAULT NULL,
  p_declared_pet_age text DEFAULT NULL
)
RETURNS public.appointment_requests
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_pet_birth_date date;
  v_result public.appointment_requests;
  v_coat_codes text[] := COALESCE(p_coat_condition_codes, ARRAY[]::text[]);
  v_coat_notes text := NULLIF(pg_catalog.btrim(p_coat_condition_notes), '');
  v_declared_age text := NULLIF(pg_catalog.btrim(p_declared_pet_age), '');
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF NOT public.has_tenant_access(p_tenant_id, 'customer') THEN
    RAISE EXCEPTION 'Customer membership required' USING ERRCODE = '42501';
  END IF;

  SELECT p.birth_date
    INTO v_pet_birth_date
  FROM public.pets p
  JOIN public.customers c ON c.id = p.customer_id
  WHERE p.id = p_pet_id
    AND p.tenant_id = p_tenant_id
    AND c.tenant_id = p_tenant_id
    AND c.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pet not available to current customer' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.services s
    WHERE s.id = p_service_id
      AND s.tenant_id = p_tenant_id
      AND s.is_active = true
  ) THEN
    RAISE EXCEPTION 'Service not available' USING ERRCODE = '22023';
  END IF;

  IF p_desired_date IS NULL OR p_desired_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Desired date must be in the future' USING ERRCODE = '22023';
  END IF;

  IF p_time_preference IS NOT NULL
     AND p_time_preference NOT IN ('morning', 'afternoon', 'flexible') THEN
    RAISE EXCEPTION 'Invalid time preference' USING ERRCODE = '22023';
  END IF;

  IF cardinality(v_coat_codes) = 0 AND v_coat_notes IS NULL THEN
    RAISE EXCEPTION 'Coat condition is required' USING ERRCODE = '22023';
  END IF;

  IF v_pet_birth_date IS NULL AND v_declared_age IS NULL THEN
    RAISE EXCEPTION 'Declared age is required for this pet' USING ERRCODE = '22023';
  END IF;

  IF v_pet_birth_date IS NOT NULL AND v_declared_age IS NOT NULL THEN
    RAISE EXCEPTION 'Declared age is not accepted for a pet with birth date' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.appointment_requests (
    tenant_id,
    customer_user_id,
    pet_id,
    service_id,
    desired_date,
    time_preference,
    coat_condition_codes,
    coat_condition_notes,
    declared_pet_age
  ) VALUES (
    p_tenant_id,
    v_user_id,
    p_pet_id,
    p_service_id,
    p_desired_date,
    p_time_preference,
    v_coat_codes,
    v_coat_notes,
    v_declared_age
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_appointment_request(
  p_request_id uuid,
  p_decision text,
  p_scheduled_at timestamptz DEFAULT NULL
)
RETURNS public.appointment_requests
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_request public.appointment_requests;
  v_appointment_id text;
  v_duration integer;
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
    RAISE EXCEPTION 'Appointment request not available to current staff user' USING ERRCODE = '42501';
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
       SET status = 'rejected'
     WHERE id = v_request.id
     RETURNING * INTO v_request;
    RETURN v_request;
  END IF;

  IF p_scheduled_at IS NULL OR p_scheduled_at <= now() THEN
    RAISE EXCEPTION 'A future appointment time is required' USING ERRCODE = '22023';
  END IF;

  SELECT s.duration_minutes
    INTO v_duration
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
    p_scheduled_at,
    v_duration,
    'scheduled',
    'approved',
    'customer',
    v_request.customer_user_id,
    v_request.service_id
  );

  UPDATE public.appointment_requests
     SET status = 'approved', appointment_id = v_appointment_id
   WHERE id = v_request.id
   RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

REVOKE ALL ON TABLE public.appointment_requests FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.appointment_requests TO authenticated;
GRANT ALL ON TABLE public.appointment_requests TO service_role;

REVOKE ALL ON FUNCTION public.submit_appointment_request(uuid, uuid, uuid, date, text, text[], text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_appointment_request(uuid, uuid, uuid, date, text, text[], text, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.resolve_appointment_request(uuid, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_appointment_request(uuid, text, timestamptz) TO authenticated, service_role;

COMMIT;
