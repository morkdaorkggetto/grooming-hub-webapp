-- ============================================================================
-- Gate 2 · Fase E — RLS `contacts` (inbox lead operatore)
-- ----------------------------------------------------------------------------
-- Staff/owner: ALL nel tenant. Nessun accesso customer-side.
-- ============================================================================

BEGIN;

DROP POLICY IF EXISTS "Users can view their own contacts"   ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;

CREATE POLICY contacts_staff_all
  ON public.contacts FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

COMMIT;
