-- ============================================================================
-- Gate 2 · Fase E — RLS `appointments`
-- ----------------------------------------------------------------------------
-- Staff/owner: ALL nel tenant.
-- Customer:
--   SELECT sugli appuntamenti dei propri pet;
--   INSERT solo per richieste pending (appointment_source='customer',
--   approval_status='pending', status='scheduled', requested_by_customer_id=uid);
--   UPDATE solo sulle proprie richieste pending (es. annullamento prima
--   dell'approvazione).
-- ============================================================================

BEGIN;

-- Cleanup policy legacy (le staff basate su user_id sono ancora attive dal
-- retrospettivo; le sostituiamo con quelle tenant)
DROP POLICY IF EXISTS "Users can view their own appointments"   ON public.appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

-- Staff/owner: accesso completo
CREATE POLICY appointments_staff_all
  ON public.appointments FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

-- Customer: SELECT sui propri appuntamenti.
-- Double-filter `c.tenant_id = appointments.tenant_id` ridondante (l'unicità
-- di pets.id/customers.id lo implica già), mantenuto come difesa in
-- profondità contro anomalie dati o modifiche future dello schema.
CREATE POLICY appointments_customer_select
  ON public.appointments FOR SELECT
  USING (
    public.has_tenant_access(tenant_id, 'customer')
    AND pet_id IN (
      SELECT p.id
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid() AND c.tenant_id = appointments.tenant_id
    )
  );

-- Customer: INSERT richiesta pending
CREATE POLICY appointments_customer_request_insert
  ON public.appointments FOR INSERT
  WITH CHECK (
    public.has_tenant_access(tenant_id, 'customer')
    AND appointment_source = 'customer'
    AND approval_status   = 'pending'
    AND status            = 'scheduled'
    AND requested_by_customer_id = auth.uid()
    AND pet_id IN (
      SELECT p.id
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid() AND c.tenant_id = appointments.tenant_id
    )
  );

-- Customer: UPDATE solo sulle proprie richieste ancora pending
CREATE POLICY appointments_customer_request_update
  ON public.appointments FOR UPDATE
  USING (
    public.has_tenant_access(tenant_id, 'customer')
    AND requested_by_customer_id = auth.uid()
    AND approval_status = 'pending'
  )
  WITH CHECK (
    public.has_tenant_access(tenant_id, 'customer')
    AND requested_by_customer_id = auth.uid()
    AND approval_status = 'pending'
    -- il customer non può approvarsi né cambiare status (resta 'scheduled')
    AND status = 'scheduled'
  );

-- No DELETE customer in Fase 1. Annullamento richieste rinviato a RPC
-- `cancel_appointment_request(id)` al Gate 5 (permetterà delete + notifica
-- staff in modo transazionale). Fino ad allora la UI segue il design di
-- `04-schermate.md` §04.1: modal "contatta il salone", nessuna operazione DB.

COMMIT;
