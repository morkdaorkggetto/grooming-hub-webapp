-- ============================================================================
-- Gate 2 · Fase E — RLS `promotions`
-- ----------------------------------------------------------------------------
-- Staff/owner: ALL nel tenant.
-- Customer: SELECT delle promozioni attive del tenant (+ scadenza valida).
-- ============================================================================

BEGIN;

CREATE POLICY promotions_staff_all
  ON public.promotions FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

CREATE POLICY promotions_customer_select_active
  ON public.promotions FOR SELECT
  USING (
    is_active = true
    AND (valid_to IS NULL OR valid_to >= now())
    AND public.has_tenant_access(tenant_id, 'customer')
  );

COMMIT;
