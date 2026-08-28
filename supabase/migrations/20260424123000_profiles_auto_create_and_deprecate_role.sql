-- ============================================================================
-- Gate 2 · Fase C — Trigger auto-create `profiles` + deprecazione soft di
-- `profiles.role`.
-- ----------------------------------------------------------------------------
-- 1. Trigger `on auth.users insert` crea una riga `profiles` vuota se mancante.
-- 2. `profiles.role` viene commentato come deprecato. Il ruolo effettivo sta
--    su `tenant_memberships.role`. Rimozione della colonna posticipata a Fase
--    successiva, dopo aver ripulito tutti i riferimenti client-side.
-- ============================================================================

BEGIN;

-- 1. Funzione + trigger per upsert profilo al signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, role)
  VALUES (NEW.id, NULL, 'customer')   -- default post-signup è 'customer'; lo staff viene creato via invite/seed
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Il trigger vive in schema `auth` perché è ON INSERT su auth.users.
-- DROP/CREATE per idempotenza.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 2. Deprecazione soft di profiles.role
COMMENT ON COLUMN public.profiles.role IS
  'DEPRECATO: il ruolo effettivo vive su tenant_memberships.role. '
  'Conservato transitoriamente per compat con lo staff app. Non usare per '
  'nuove autorizzazioni — interrogare tenant_memberships.';

COMMIT;
