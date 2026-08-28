-- ============================================================================
-- Gate 2 · Fase E — RLS `reward_points`
-- ----------------------------------------------------------------------------
-- Staff/owner: ALL nel tenant.
-- Customer: SELECT dei reward_points dei propri pet.
-- ============================================================================

BEGIN;

-- Cleanup: il policy legacy `reward_points_staff_legacy_insert` di M11 +
-- le policy originali ancora eventualmente presenti.
DROP POLICY IF EXISTS reward_points_staff_legacy_insert          ON public.reward_points;
DROP POLICY IF EXISTS "Users can view their own reward points"   ON public.reward_points;
DROP POLICY IF EXISTS "Users can delete their own reward points" ON public.reward_points;

CREATE POLICY reward_points_staff_all
  ON public.reward_points FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

CREATE POLICY reward_points_customer_select
  ON public.reward_points FOR SELECT
  USING (
    public.has_tenant_access(tenant_id, 'customer')
    AND pet_id IN (
      SELECT p.id
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid() AND c.tenant_id = reward_points.tenant_id
    )
  );

COMMIT;
