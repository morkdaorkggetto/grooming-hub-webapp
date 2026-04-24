-- ============================================================================
-- Gate 2 · Fase E — RLS `customers`
-- ----------------------------------------------------------------------------
-- Staff/owner del tenant vedono tutte le righe customers del tenant.
-- Il customer vede solo la propria riga.
-- INSERT lato customer: gestito dalla RPC `accept_customer_invite`
-- (SECURITY DEFINER bypassa RLS).
-- ============================================================================

BEGIN;

-- Rimuove le policy legacy create in M11
DROP POLICY IF EXISTS customers_staff_legacy_select ON public.customers;
DROP POLICY IF EXISTS customers_self_update         ON public.customers;

-- Staff/owner: accesso completo nel proprio tenant
CREATE POLICY customers_staff_all
  ON public.customers FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

-- Customer: vede solo la propria riga
CREATE POLICY customers_self_select
  ON public.customers FOR SELECT
  USING (user_id = auth.uid());

-- Customer: può aggiornare campi propri (es. marketing_opt_in, phone)
CREATE POLICY customers_self_update
  ON public.customers FOR UPDATE
  USING (user_id = auth.uid() AND public.has_tenant_access(tenant_id, 'customer'))
  WITH CHECK (user_id = auth.uid() AND public.has_tenant_access(tenant_id, 'customer'));

COMMIT;
