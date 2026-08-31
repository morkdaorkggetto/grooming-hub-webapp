-- GH-52: an absence is a dated appointment state, never a visit or revenue.
-- Source: GH-52 mandate, Luigi decision 2026-08-31.
BEGIN;

CREATE OR REPLACE FUNCTION public.set_staff_appointment_status(
  p_appointment_id text,
  p_status text
)
RETURNS public.appointments
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_appointment public.appointments;
  v_updated public.appointments;
  v_pet_rows integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('scheduled', 'completed', 'cancelled', 'no_show') THEN
    RAISE EXCEPTION 'Invalid appointment status' USING ERRCODE = '22023';
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

  IF v_appointment.approval_status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved appointments can change status'
      USING ERRCODE = '23514', DETAIL = 'GH52_APPOINTMENT_NOT_APPROVED';
  END IF;

  IF v_appointment.status = p_status THEN
    RETURN v_appointment;
  END IF;

  IF p_status = 'no_show' THEN
    IF v_appointment.status <> 'scheduled' OR EXISTS (
      SELECT 1 FROM public.visits v WHERE v.appointment_id = v_appointment.id
    ) THEN
      RAISE EXCEPTION 'Only a scheduled appointment without a visit can become an absence'
        USING ERRCODE = '23514', DETAIL = 'GH52_ABSENCE_REQUIRES_SCHEDULED';
    END IF;
  ELSIF v_appointment.status = 'no_show' AND p_status <> 'scheduled' THEN
    RAISE EXCEPTION 'An absence can only be restored to scheduled'
      USING ERRCODE = '23514', DETAIL = 'GH52_ABSENCE_RESTORE_ONLY';
  END IF;

  UPDATE public.appointments
     SET status = p_status,
         updated_at = now()
   WHERE id = v_appointment.id
  RETURNING * INTO v_updated;

  IF v_appointment.status <> 'no_show' AND p_status = 'no_show' THEN
    UPDATE public.pets
       SET no_show_score = COALESCE(no_show_score, 0) - 1,
           is_blacklisted = (COALESCE(no_show_score, 0) - 1) <= -3
     WHERE id = v_appointment.pet_id
       AND tenant_id = v_appointment.tenant_id;
    GET DIAGNOSTICS v_pet_rows = ROW_COUNT;
  ELSIF v_appointment.status = 'no_show' AND p_status = 'scheduled' THEN
    UPDATE public.pets
       SET no_show_score = COALESCE(no_show_score, 0) + 1,
           is_blacklisted = (COALESCE(no_show_score, 0) + 1) <= -3
     WHERE id = v_appointment.pet_id
       AND tenant_id = v_appointment.tenant_id;
    GET DIAGNOSTICS v_pet_rows = ROW_COUNT;
  END IF;

  IF (v_appointment.status <> 'no_show' AND p_status = 'no_show')
     OR (v_appointment.status = 'no_show' AND p_status = 'scheduled') THEN
    IF v_pet_rows <> 1 THEN
      RAISE EXCEPTION 'Appointment pet is missing'
        USING ERRCODE = '23503', DETAIL = 'GH52_APPOINTMENT_PET_MISSING';
    END IF;
  END IF;

  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION public.set_staff_appointment_status(text, text) IS
  'GH-52: atomically changes an approved appointment status and keeps the dated no-show score reversible and idempotent.';

REVOKE ALL ON FUNCTION public.set_staff_appointment_status(text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_staff_appointment_status(text, text)
  TO authenticated, service_role;

COMMIT;
