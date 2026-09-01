-- GH-58, mandato Luigi 1/9/2026.
-- Un errore di inserimento puo essere eliminato senza trasformarlo in una
-- disdetta, ma soltanto se non porta storia operativa o del cliente.

BEGIN;

CREATE OR REPLACE FUNCTION public.delete_staff_appointment(
  p_appointment_id text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_appointment public.appointments%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  SELECT appointment.*
    INTO v_appointment
  FROM public.appointments AS appointment
  WHERE appointment.id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND OR NOT EXISTS (
    SELECT 1
    FROM public.tenant_memberships AS membership
    WHERE membership.user_id = v_user_id
      AND membership.tenant_id = v_appointment.tenant_id
      AND membership.role IN ('owner', 'staff')
  ) THEN
    RAISE EXCEPTION 'Appointment not available to current staff user'
      USING ERRCODE = '42501';
  END IF;

  IF v_appointment.status = 'completed' THEN
    RAISE EXCEPTION 'A completed appointment is part of the service history'
      USING ERRCODE = '23514', DETAIL = 'GH58_APPOINTMENT_COMPLETED';
  END IF;

  IF v_appointment.status = 'no_show' THEN
    RAISE EXCEPTION 'Restore the absence before deleting the appointment'
      USING ERRCODE = '23514', DETAIL = 'GH58_APPOINTMENT_NO_SHOW';
  END IF;

  IF v_appointment.appointment_source <> 'operator' OR EXISTS (
    SELECT 1
    FROM public.appointment_requests AS request
    WHERE request.appointment_id = v_appointment.id
  ) THEN
    RAISE EXCEPTION 'A customer-originated appointment must remain visible in customer history'
      USING ERRCODE = '23514', DETAIL = 'GH58_APPOINTMENT_CUSTOMER_SOURCE';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.visits AS visit
    WHERE visit.appointment_id = v_appointment.id
  ) THEN
    RAISE EXCEPTION 'An appointment linked to a visit is part of the service history'
      USING ERRCODE = '23514', DETAIL = 'GH58_APPOINTMENT_VISIT_LINKED';
  END IF;

  DELETE FROM public.appointments AS appointment
  WHERE appointment.id = v_appointment.id;

  RETURN v_appointment.id;
END;
$$;

COMMENT ON FUNCTION public.delete_staff_appointment(text) IS
  'GH-58: elimina soltanto appuntamenti operator scheduled/cancelled senza visita o richiesta cliente, dopo verifica diretta della membership staff.';

REVOKE ALL ON FUNCTION public.delete_staff_appointment(text)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.delete_staff_appointment(text)
  TO authenticated;

COMMIT;
