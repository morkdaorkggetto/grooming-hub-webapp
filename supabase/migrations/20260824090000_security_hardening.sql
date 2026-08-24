-- GH-10 security hardening for the Grooming Hub demo database.
-- Source: docs/incarichi/GH-10-security-hardening.md.
--
-- This migration deliberately leaves the verified RLS policy expressions
-- unchanged. It narrows routine ACLs, pins routine search paths, and adds the
-- two covering indexes reported by the demo Performance Advisor.

BEGIN;

-- Pin every legacy SECURITY DEFINER routine to trusted schemas. Most already
-- had a fixed path; repeating ALTER FUNCTION makes the migration idempotent
-- and documents the complete security boundary in one place.
ALTER FUNCTION public.accept_customer_invite(text)
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.current_tenant_ids_for_role(public.tenant_role)
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.enforce_customers_operator_notes_staff_only()
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.enforce_pets_customer_update_whitelist()
  SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.enforce_pets_internal_notes_staff_only()
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

-- These invoker routines were the two mutable-search-path findings.
ALTER FUNCTION public.normalize_phone_it(text)
  SET search_path = pg_catalog;
ALTER FUNCTION public.update_timestamp()
  SET search_path = pg_catalog;

-- Remove PostgreSQL's default PUBLIC execute privilege and all historical
-- broad grants before reopening only the intended application entry points.
REVOKE ALL ON FUNCTION public.accept_customer_invite(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.current_tenant_ids_for_role(public.tenant_role)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_customers_operator_notes_staff_only()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_pets_internal_notes_staff_only()
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

-- Authenticated customer flow.
GRANT EXECUTE ON FUNCTION public.accept_customer_invite(text)
  TO authenticated, service_role;

-- Public QR cards are intentionally available without authentication.
GRANT EXECUTE ON FUNCTION public.get_public_pet_card(text)
  TO anon, authenticated, service_role;

-- RLS helpers must be callable by signed-in users while evaluating policies.
GRANT EXECUTE ON FUNCTION public.has_tenant_access(uuid, public.tenant_role)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_tenant_any_staff_access(uuid)
  TO authenticated, service_role;

-- Invoker RPCs normalize phone numbers under the caller's identity.
GRANT EXECUTE ON FUNCTION public.normalize_phone_it(text)
  TO authenticated, service_role;

-- Trigger-only and currently unused future helpers remain inaccessible through
-- the Data API; service_role keeps maintenance access where it already existed.
GRANT EXECUTE ON FUNCTION public.current_tenant_ids_for_role(public.tenant_role)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_customers_operator_notes_staff_only()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_pets_customer_update_whitelist()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_pets_internal_notes_staff_only()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_customers_email_from_auth()
  TO service_role;
GRANT EXECUTE ON FUNCTION public.update_timestamp()
  TO service_role;

-- Additive, idempotent fixes for the two unindexed foreign keys reported by
-- the Performance Advisor. No existing index has these columns first.
CREATE INDEX IF NOT EXISTS customer_invitations_accepted_by_idx
  ON public.customer_invitations (accepted_by);
CREATE INDEX IF NOT EXISTS customers_user_id_idx
  ON public.customers (user_id);

COMMIT;
