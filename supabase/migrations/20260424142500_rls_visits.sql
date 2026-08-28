-- ============================================================================
-- Gate 2 · Fase E — RLS `visits`
-- ----------------------------------------------------------------------------
-- Staff/owner: ALL nel tenant.
-- Customer: SELECT sulle visite dei propri pet.
-- ============================================================================

BEGIN;

DROP POLICY IF EXISTS visits_staff_legacy ON public.visits;

-- Staff/owner: accesso completo
CREATE POLICY visits_staff_all
  ON public.visits FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

-- Customer: SELECT sulle visite dei propri pet
CREATE POLICY visits_customer_select
  ON public.visits FOR SELECT
  USING (
    public.has_tenant_access(tenant_id, 'customer')
    AND pet_id IN (
      SELECT p.id
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid() AND c.tenant_id = visits.tenant_id
    )
  );

COMMIT;
