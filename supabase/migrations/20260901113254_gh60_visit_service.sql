-- GH-60, mandato Luigi 1/9/2026.
-- Classifica le nuove lavorazioni con il catalogo servizi senza inferire o
-- riscrivere lo storico esistente.

BEGIN;

ALTER TABLE public.visits
  ADD COLUMN service_id uuid NULL;

ALTER TABLE public.visits
  ADD CONSTRAINT visits_service_id_fkey
  FOREIGN KEY (service_id)
  REFERENCES public.services(id)
  ON DELETE SET NULL;

CREATE INDEX visits_service_id_idx
  ON public.visits (service_id)
  WHERE service_id IS NOT NULL;

COMMENT ON COLUMN public.visits.service_id
IS 'GH-60: optional service classification selected by staff for this visit.';

DROP FUNCTION public.complete_appointment_with_visit(text, date, text, text, numeric);

CREATE FUNCTION public.complete_appointment_with_visit(
  p_appointment_id text,
  p_date date,
  p_treatments text,
  p_issues text,
  p_cost numeric,
  p_service_id uuid DEFAULT NULL
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

  IF p_service_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.services s
    WHERE s.id = p_service_id
      AND s.tenant_id = v_appointment.tenant_id
  ) THEN
    RAISE EXCEPTION 'Service not available to appointment tenant'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.visits (
    id, pet_id, tenant_id, appointment_id, service_id, date, treatments, issues, cost
  ) VALUES (
    gen_random_uuid()::text,
    v_appointment.pet_id,
    v_appointment.tenant_id,
    v_appointment.id,
    p_service_id,
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

COMMENT ON FUNCTION public.complete_appointment_with_visit(text, date, text, text, numeric, uuid)
IS 'GH-60: atomically add a service-classified visit linked to an approved appointment and mark it completed.';

REVOKE ALL ON FUNCTION public.complete_appointment_with_visit(text, date, text, text, numeric, uuid)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_appointment_with_visit(text, date, text, text, numeric, uuid)
TO authenticated, service_role;

COMMIT;
