-- GH-02-bis, decisione Luigi 18/8/2026, a valle di consegna
-- GH-02-interruzione.
--
-- Un customer puo aggiornare una riga `pets` completa per effetto della policy
-- RLS `pets_customer_update`. Il trigger precedente proteggeva soltanto
-- `internal_notes`; questa whitelist rende modificabili ai non-staff solo
-- owner_notes, coat_preferences e photo_url. Tutte le altre colonne vengono
-- ripristinate al valore precedente dal database.

BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_pets_customer_update_whitelist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_owner_notes       text  := NEW.owner_notes;
  v_coat_preferences  jsonb := NEW.coat_preferences;
  v_photo_url         text  := NEW.photo_url;
BEGIN
  IF NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW := OLD;
    NEW.owner_notes := v_owner_notes;
    NEW.coat_preferences := v_coat_preferences;
    NEW.photo_url := v_photo_url;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_pets_customer_update_whitelist() IS
  'GH-02-bis customer column whitelist: non-staff can update only owner_notes, coat_preferences and photo_url; every other pets column is restored from OLD.';

-- E una funzione di trigger, non una RPC: nessun client deve poterla invocare
-- attraverso la Data API. Il trigger continua a eseguirla come table owner.
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM authenticated;

-- Il trigger precedente e superato dalla whitelist, che include anche
-- internal_notes fra tutte le colonne ripristinate da OLD.
DROP TRIGGER IF EXISTS trg_pets_protect_internal_notes ON public.pets;
DROP TRIGGER IF EXISTS trg_pets_customer_update_whitelist ON public.pets;

CREATE TRIGGER trg_pets_customer_update_whitelist
  BEFORE UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_pets_customer_update_whitelist();

COMMIT;
