-- ============================================================================
-- Gate 2 · Fase E — RLS `customer_invitations`
-- ----------------------------------------------------------------------------
-- Staff/owner del tenant: ALL.
-- Customer: nessun accesso diretto. L'invito viene consumato dalla RPC
-- `accept_customer_invite` (SECURITY DEFINER) che bypassa RLS.
-- ============================================================================

BEGIN;

-- Cleanup policy originali (operator-scoped via user_id) + policy legacy
-- introdotta da M11-bis come ponte fino a questo file.
DROP POLICY IF EXISTS "Operators can view their customer invitations"   ON public.customer_invitations;
DROP POLICY IF EXISTS "Operators can create customer invitations"       ON public.customer_invitations;
DROP POLICY IF EXISTS "Operators can delete their customer invitations" ON public.customer_invitations;
DROP POLICY IF EXISTS customer_invitations_operator_legacy              ON public.customer_invitations;

CREATE POLICY customer_invitations_staff_all
  ON public.customer_invitations FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

COMMIT;
