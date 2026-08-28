-- ============================================================================
-- Gate 2 · Fase E — RLS `services`
-- ----------------------------------------------------------------------------
-- Staff/owner: ALL nel tenant.
-- Customer: SELECT dei servizi attivi del tenant.
-- ============================================================================

BEGIN;

CREATE POLICY services_staff_all
  ON public.services FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

CREATE POLICY services_customer_select_active
  ON public.services FOR SELECT
  USING (
    is_active = true
    AND public.has_tenant_access(tenant_id, 'customer')
  );

COMMIT;
