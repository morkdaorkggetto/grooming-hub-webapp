-- GH-59, mandato Luigi 1/9/2026.
-- Lo staff continua a leggere, inserire e aggiornare gli appuntamenti con la
-- condizione esistente; il DELETE diretto resta senza policy e passa soltanto
-- dalla RPC pubblica dedicata.

BEGIN;

DROP POLICY appointments_staff_all ON public.appointments;

CREATE POLICY appointments_staff_select
  ON public.appointments FOR SELECT
  USING (public.has_tenant_any_staff_access(tenant_id));

CREATE POLICY appointments_staff_insert
  ON public.appointments FOR INSERT
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

CREATE POLICY appointments_staff_update
  ON public.appointments FOR UPDATE
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

COMMIT;
