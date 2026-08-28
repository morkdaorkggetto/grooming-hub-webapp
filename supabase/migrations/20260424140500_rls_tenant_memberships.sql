-- ============================================================================
-- Gate 2 · Fase E — RLS `tenant_memberships`
-- ----------------------------------------------------------------------------
-- Ogni utente vede le proprie membership. Owner/staff del tenant vedono anche
-- le membership degli altri membri del proprio tenant.
-- INSERT/UPDATE/DELETE gestiti da RPC o admin, non dall'app in Fase 1.
-- ============================================================================

BEGIN;

DROP POLICY IF EXISTS tenant_memberships_own_select   ON public.tenant_memberships;
DROP POLICY IF EXISTS tenant_memberships_staff_select ON public.tenant_memberships;

-- L'utente vede le proprie membership
CREATE POLICY tenant_memberships_own_select
  ON public.tenant_memberships FOR SELECT
  USING (user_id = auth.uid());

-- Owner/staff vedono tutte le membership del proprio tenant
CREATE POLICY tenant_memberships_staff_select
  ON public.tenant_memberships FOR SELECT
  USING (public.has_tenant_any_staff_access(tenant_id));

COMMIT;
