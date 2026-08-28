-- GH-27 follow-up: il trigger whitelist GH-02-bis deve limitare gli utenti
-- customer, non le operazioni privilegiate senza JWT (migration/service role).

BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_pets_customer_update_whitelist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_owner_notes       text  := NEW.owner_notes;
  v_coat_preferences  jsonb := NEW.coat_preferences;
  v_photo_url         text  := NEW.photo_url;
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW := OLD;
    NEW.owner_notes := v_owner_notes;
    NEW.coat_preferences := v_coat_preferences;
    NEW.photo_url := v_photo_url;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_pets_customer_update_whitelist()
IS 'GH-02-bis whitelist for authenticated non-staff customers; GH-27 preserves privileged maintenance writes without a JWT.';

REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM authenticated;

UPDATE public.pets
SET qr_token = 'ghp_' || replace(gen_random_uuid()::text, '-', '')
WHERE NULLIF(btrim(qr_token), '') IS NULL;

COMMIT;
