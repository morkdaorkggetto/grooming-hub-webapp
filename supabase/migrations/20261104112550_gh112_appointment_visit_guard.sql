-- GH-112. Fonte: docs/incarichi/GH-112-un-appuntamento-chiuso-ha-la-sua-visita.md,
-- decisione Luigi 04/11/2026 sulla differenza GH-103 atto B fra demo e prodotto.
-- Non usa colonne finanziarie legacy ne gh103_finance_bridge: resta compatibile
-- prima e dopo l'atto B. Mantiene le firme delle RPC gia chiamate dal client.
BEGIN;

CREATE OR REPLACE FUNCTION public.complete_appointment_with_visit(
  p_appointment_id text, p_date date, p_treatments text, p_issues text,
  p_cost numeric, p_service_id uuid DEFAULT NULL
) RETURNS public.visits
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_appointment public.appointments;
  v_visit public.visits;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_appointment FROM public.appointments
    WHERE id = p_appointment_id FOR UPDATE;
  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_appointment.tenant_id) THEN
    RAISE EXCEPTION 'Appointment not available to current staff user' USING ERRCODE = '42501';
  END IF;
  IF v_appointment.approval_status <> 'approved'
    OR v_appointment.status IN ('cancelled', 'no_show') THEN
    RAISE EXCEPTION 'Appointment cannot be completed' USING ERRCODE = '23514';
  END IF;
  IF (v_appointment.scheduled_at AT TIME ZONE 'Europe/Rome')::date
    > (now() AT TIME ZONE 'Europe/Rome')::date THEN
    RAISE EXCEPTION 'Appointment day is in the future'
      USING ERRCODE = '23514', DETAIL = 'GH112_APPOINTMENT_IN_FUTURE';
  END IF;
  IF p_date IS NULL OR p_cost IS NULL OR p_cost <= 0 THEN
    RAISE EXCEPTION 'A visit date and positive cost are required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_visit FROM public.visits WHERE appointment_id = v_appointment.id;
  IF FOUND THEN RETURN v_visit; END IF;
  SELECT * INTO v_visit FROM public.create_staff_visit(
    v_appointment.pet_id, p_date, p_cost,
    NULLIF(btrim(p_treatments), ''), NULLIF(btrim(p_issues), ''),
    0, p_service_id, v_appointment.id
  );
  UPDATE public.appointments SET status = 'completed', updated_at = now()
    WHERE id = v_appointment.id;
  RETURN v_visit;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_staff_appointment_status(
  p_appointment_id text, p_status text
) RETURNS public.appointments
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
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
  SELECT * INTO v_appointment FROM public.appointments a
    WHERE a.id = p_appointment_id FOR UPDATE;
  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_appointment.tenant_id) THEN
    RAISE EXCEPTION 'Appointment not available to current staff user' USING ERRCODE = '42501';
  END IF;
  IF v_appointment.approval_status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved appointments can change status'
      USING ERRCODE = '23514', DETAIL = 'GH52_APPOINTMENT_NOT_APPROVED';
  END IF;
  IF p_status = 'completed' AND
    (v_appointment.scheduled_at AT TIME ZONE 'Europe/Rome')::date
      > (now() AT TIME ZONE 'Europe/Rome')::date THEN
    RAISE EXCEPTION 'Appointment day is in the future'
      USING ERRCODE = '23514', DETAIL = 'GH112_APPOINTMENT_IN_FUTURE';
  END IF;
  IF v_appointment.status = p_status THEN RETURN v_appointment; END IF;
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
  UPDATE public.appointments SET status = p_status, updated_at = now()
    WHERE id = v_appointment.id RETURNING * INTO v_updated;
  IF v_appointment.status <> 'no_show' AND p_status = 'no_show' THEN
    UPDATE public.pets SET
      no_show_score = COALESCE(no_show_score, 0) - 1,
      is_blacklisted = (COALESCE(no_show_score, 0) - 1) <= -3
      WHERE id = v_appointment.pet_id AND tenant_id = v_appointment.tenant_id;
    GET DIAGNOSTICS v_pet_rows = ROW_COUNT;
  ELSIF v_appointment.status = 'no_show' AND p_status = 'scheduled' THEN
    UPDATE public.pets SET
      no_show_score = COALESCE(no_show_score, 0) + 1,
      is_blacklisted = (COALESCE(no_show_score, 0) + 1) <= -3
      WHERE id = v_appointment.pet_id AND tenant_id = v_appointment.tenant_id;
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

CREATE OR REPLACE FUNCTION public.delete_staff_visit_reopen_appointment(
  p_visit_id text, p_pet_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_visit public.visits;
  v_appointment public.appointments;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_visit FROM public.visits
    WHERE id = p_visit_id AND pet_id = p_pet_id;
  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_visit.tenant_id) THEN
    RAISE EXCEPTION 'Visit not available to current staff user' USING ERRCODE = '42501';
  END IF;
  IF v_visit.appointment_id IS NOT NULL THEN
    SELECT * INTO v_appointment FROM public.appointments
      WHERE id = v_visit.appointment_id FOR UPDATE;
    IF NOT FOUND OR v_appointment.tenant_id <> v_visit.tenant_id
      OR v_appointment.pet_id <> v_visit.pet_id THEN
      RAISE EXCEPTION 'Linked appointment does not match visit' USING ERRCODE = '23503';
    END IF;
    IF v_appointment.status = 'no_show' THEN
      RAISE EXCEPTION 'A no-show cannot have a linked visit' USING ERRCODE = '23514';
    END IF;
  END IF;
  SELECT * INTO v_visit FROM public.visits
    WHERE id = p_visit_id AND pet_id = p_pet_id FOR UPDATE;
  IF NOT FOUND OR v_visit.appointment_id IS DISTINCT FROM v_appointment.id THEN
    RAISE EXCEPTION 'Visit changed while deleting' USING ERRCODE = '40001';
  END IF;
  DELETE FROM public.visits WHERE id = p_visit_id AND pet_id = p_pet_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Visit not deleted' USING ERRCODE = '40001'; END IF;
  IF v_appointment.id IS NOT NULL THEN
    UPDATE public.appointments SET status = 'scheduled', updated_at = now()
      WHERE id = v_appointment.id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Appointment not reopened' USING ERRCODE = '40001'; END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_staff_visit_reopen_appointment(text, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_staff_visit_reopen_appointment(text, uuid)
  TO authenticated;
COMMENT ON FUNCTION public.delete_staff_visit_reopen_appointment(text, uuid) IS
  'GH-112: remove a staff visit and reopen its linked appointment in one transaction.';
NOTIFY pgrst, 'reload schema';
COMMIT;
