-- ============================================================================
-- Gate 2 · Fase E — RLS `tenants`
-- ----------------------------------------------------------------------------
-- Gli utenti vedono solo i tenant in cui hanno una membership. Nessun
-- INSERT/UPDATE/DELETE dall'applicazione: questi sono operazioni di admin.
-- ============================================================================

BEGIN;

DROP POLICY IF EXISTS tenants_members_select ON public.tenants;

CREATE POLICY tenants_members_select
  ON public.tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.tenant_id = tenants.id AND tm.user_id = auth.uid()
    )
  );

COMMIT;
