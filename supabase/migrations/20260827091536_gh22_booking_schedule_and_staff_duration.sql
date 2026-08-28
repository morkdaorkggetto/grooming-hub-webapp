-- GH-22, fonte: Davide e Roby via Luigi, 27 agosto 2026.
-- Il tenant pilota chiude la domenica e il lunedi mattina. La struttura
-- supporta giorni interi e fasce parziali senza impostare valori per altri tenant.

BEGIN;

UPDATE public.tenants
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{booking_schedule}',
  '{
    "closed_weekdays": ["sunday"],
    "closed_time_preferences": {
      "monday": ["morning"]
    }
  }'::jsonb,
  true
)
WHERE slug = 'grooming-hub';

CREATE OR REPLACE FUNCTION public.resolve_appointment_request_with_duration(
  p_request_id uuid,
  p_decision text,
  p_scheduled_at timestamptz,
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

  IF p_duration_minutes IS NULL OR p_duration_minutes < 15 THEN
    RAISE EXCEPTION 'A duration of at least 15 minutes is required' USING ERRCODE = '22023';
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
    p_scheduled_at,
    p_duration_minutes,
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

COMMENT ON FUNCTION public.resolve_appointment_request_with_duration(uuid, text, timestamptz, integer)
IS 'GH-22: resolve a customer request using the duration chosen by staff.';

REVOKE ALL ON FUNCTION public.resolve_appointment_request_with_duration(uuid, text, timestamptz, integer)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_appointment_request_with_duration(uuid, text, timestamptz, integer)
TO authenticated, service_role;

COMMIT;
