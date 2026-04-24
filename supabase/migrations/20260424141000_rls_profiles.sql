-- ============================================================================
-- Gate 2 · Fase E — RLS `profiles` (aggiornamento)
-- ----------------------------------------------------------------------------
-- Il pattern esistente (visualizza/aggiorna solo il proprio profilo) resta.
-- Aggiunto: staff può leggere i profili basic di altri membri del proprio
-- tenant (utile per mostrare nomi staff in UI, es. groomer nell'appuntamento).
-- ============================================================================

BEGIN;

-- Cleanup policy pre-esistenti
DROP POLICY IF EXISTS "Users can view their own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"  ON public.profiles;

CREATE POLICY profiles_self_select
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Staff vede i profili dei membri del proprio tenant
CREATE POLICY profiles_tenant_members_select
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.tenant_memberships tm_viewer
      JOIN public.tenant_memberships tm_target
        ON tm_viewer.tenant_id = tm_target.tenant_id
      WHERE tm_viewer.user_id = auth.uid()
        AND tm_viewer.role IN ('owner','staff')
        AND tm_target.user_id = profiles.id
    )
  );

CREATE POLICY profiles_self_insert
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_self_update
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMIT;
