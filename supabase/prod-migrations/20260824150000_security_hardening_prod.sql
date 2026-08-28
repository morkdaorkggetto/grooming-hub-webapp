-- GH-13 Atto 3.6: hardening prod-safe misurato sul gemello prod temporaneo.
-- Fonte: docs/incarichi/GH-13-catena-residua-e-fase-3.md e registro GH-10.
-- A differenza del demo, qui non esistono le due funzioni trigger legacy
-- enforce_*_notes_staff_only: la variante non le crea e non le referenzia.

BEGIN;

DO $$
DECLARE
  v_target_count integer;
BEGIN
  SELECT pg_catalog.count(*)
  INTO v_target_count
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND (
      (p.proname = 'accept_customer_invite'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'p_token text')
      OR (p.proname = 'current_tenant_ids_for_role'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'required_role tenant_role')
      OR (p.proname = 'enforce_pets_customer_update_whitelist'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = '')
      OR (p.proname = 'get_public_pet_card'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'p_qr_token text')
      OR (p.proname = 'handle_new_auth_user'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = '')
      OR (p.proname = 'has_tenant_access'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'tenant_uuid uuid, required_role tenant_role')
      OR (p.proname = 'has_tenant_any_staff_access'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'tenant_uuid uuid')
      OR (p.proname = 'normalize_phone_it'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'p_phone text')
      OR (p.proname = 'sync_customers_email_from_auth'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = '')
      OR (p.proname = 'update_timestamp'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = '')
    );

  IF v_target_count <> 10 THEN
    RAISE EXCEPTION 'GH-13 hardening guard failed: expected 10 measured routines, got %',
      v_target_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'enforce_customers_operator_notes_staff_only',
        'enforce_pets_internal_notes_staff_only'
      )
  ) THEN
    RAISE EXCEPTION 'GH-13 hardening guard failed: unexpected demo-only note trigger routine';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint c
    WHERE c.conrelid = 'public.customer_invitations'::pg_catalog.regclass
      AND c.conname = 'customer_invitations_accepted_by_fkey'
      AND c.contype = 'f'
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint c
    WHERE c.conrelid = 'public.customers'::pg_catalog.regclass
      AND c.conname = 'customers_user_id_fkey'
      AND c.contype = 'f'
  ) THEN
    RAISE EXCEPTION 'GH-13 hardening guard failed: measured foreign keys differ';
  END IF;
END $$;

ALTER FUNCTION public.accept_customer_invite(text)
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.current_tenant_ids_for_role(public.tenant_role)
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.enforce_pets_customer_update_whitelist()
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.get_public_pet_card(text)
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.handle_new_auth_user()
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.has_tenant_access(uuid, public.tenant_role)
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.has_tenant_any_staff_access(uuid)
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.sync_customers_email_from_auth()
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.normalize_phone_it(text)
  SET search_path = pg_catalog;
ALTER FUNCTION public.update_timestamp()
  SET search_path = pg_catalog;

REVOKE ALL ON FUNCTION public.accept_customer_invite(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.current_tenant_ids_for_role(public.tenant_role)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_public_pet_card(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_auth_user()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_tenant_access(uuid, public.tenant_role)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_tenant_any_staff_access(uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_customers_email_from_auth()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.normalize_phone_it(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_timestamp()
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.accept_customer_invite(text)
  TO authenticated, service_role;

-- Il consumer staff espone ancora la QR card pubblica tramite token opaco.
GRANT EXECUTE ON FUNCTION public.get_public_pet_card(text)
  TO anon, authenticated, service_role;

-- Le policy RLS misurate usano entrambi gli helper per sessioni autenticate.
GRANT EXECUTE ON FUNCTION public.has_tenant_access(uuid, public.tenant_role)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_tenant_any_staff_access(uuid)
  TO authenticated, service_role;

-- Le RPC invoker chiamate dagli utenti autenticati normalizzano il telefono.
GRANT EXECUTE ON FUNCTION public.normalize_phone_it(text)
  TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.current_tenant_ids_for_role(public.tenant_role)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_pets_customer_update_whitelist()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_customers_email_from_auth()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.update_timestamp()
  TO service_role;

CREATE INDEX IF NOT EXISTS customer_invitations_accepted_by_idx
  ON public.customer_invitations (accepted_by);
CREATE INDEX IF NOT EXISTS customers_user_id_idx
  ON public.customers (user_id);

COMMIT;
