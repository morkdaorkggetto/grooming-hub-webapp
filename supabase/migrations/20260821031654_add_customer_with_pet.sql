-- GH-05-rpc, decisione Luigi 18/8/2026, a valle della consegna
-- GH-05-interruzione.
--
-- Crea customer e pet con un'unica chiamata atomica. La funzione resta
-- SECURITY INVOKER: le RLS delle tabelle continuano quindi ad applicarsi al
-- chiamante, oltre alla guard staff esplicita eseguita prima di ogni scrittura.

BEGIN;

CREATE OR REPLACE FUNCTION public.add_customer_with_pet(
  p_tenant_id                    uuid,
  p_customer_first_name          text,
  p_customer_phone               text,
  p_pet_name                     text,
  p_customer_last_name           text DEFAULT NULL,
  p_customer_email               text DEFAULT NULL,
  p_customer_marketing_opt_in    boolean DEFAULT false,
  p_customer_operator_notes      text DEFAULT NULL,
  p_pet_species                  text DEFAULT NULL,
  p_pet_breed                    text DEFAULT NULL,
  p_pet_birth_date               date DEFAULT NULL,
  p_pet_sex                      text DEFAULT NULL,
  p_pet_microchip                text DEFAULT NULL,
  p_pet_weight_kg                numeric DEFAULT NULL,
  p_pet_neutered                 boolean DEFAULT NULL,
  p_pet_color                    text DEFAULT NULL,
  p_pet_coat_preferences         jsonb DEFAULT NULL,
  p_pet_owner_notes              text DEFAULT NULL,
  p_pet_internal_notes           text DEFAULT NULL,
  p_pet_photo_url                text DEFAULT NULL
)
RETURNS TABLE(customer_id uuid, pet_id uuid)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_customer_id uuid;
  v_pet_id uuid;
  v_phone text;
BEGIN
  IF NOT public.has_tenant_any_staff_access(p_tenant_id) THEN
    RAISE EXCEPTION 'Accesso negato: membership staff richiesta per il tenant indicato'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(pg_catalog.btrim(p_customer_first_name), '') IS NULL THEN
    RAISE EXCEPTION 'Il nome del customer e obbligatorio'
      USING ERRCODE = '22023';
  END IF;

  IF NULLIF(pg_catalog.btrim(p_pet_name), '') IS NULL THEN
    RAISE EXCEPTION 'Il nome del pet e obbligatorio'
      USING ERRCODE = '22023';
  END IF;

  v_phone := public.normalize_phone_it(p_customer_phone);
  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'Il telefono del customer e obbligatorio'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.customers (
    tenant_id,
    first_name,
    last_name,
    email,
    phone,
    marketing_opt_in,
    operator_notes
  )
  VALUES (
    p_tenant_id,
    pg_catalog.btrim(p_customer_first_name),
    NULLIF(pg_catalog.btrim(p_customer_last_name), ''),
    NULLIF(pg_catalog.btrim(p_customer_email), ''),
    v_phone,
    COALESCE(p_customer_marketing_opt_in, false),
    NULLIF(pg_catalog.btrim(p_customer_operator_notes), '')
  )
  RETURNING id INTO v_customer_id;

  INSERT INTO public.pets (
    tenant_id,
    customer_id,
    owner_user_id,
    name,
    species,
    breed,
    birth_date,
    sex,
    microchip,
    weight_kg,
    neutered,
    color,
    coat_preferences,
    owner_notes,
    internal_notes,
    photo_url
  )
  VALUES (
    p_tenant_id,
    v_customer_id,
    auth.uid(),
    pg_catalog.btrim(p_pet_name),
    NULLIF(pg_catalog.btrim(p_pet_species), ''),
    NULLIF(pg_catalog.btrim(p_pet_breed), ''),
    p_pet_birth_date,
    NULLIF(pg_catalog.btrim(p_pet_sex), ''),
    NULLIF(pg_catalog.btrim(p_pet_microchip), ''),
    p_pet_weight_kg,
    p_pet_neutered,
    NULLIF(pg_catalog.btrim(p_pet_color), ''),
    p_pet_coat_preferences,
    NULLIF(pg_catalog.btrim(p_pet_owner_notes), ''),
    NULLIF(pg_catalog.btrim(p_pet_internal_notes), ''),
    NULLIF(pg_catalog.btrim(p_pet_photo_url), '')
  )
  RETURNING id INTO v_pet_id;

  RETURN QUERY SELECT v_customer_id, v_pet_id;
END;
$$;

COMMENT ON FUNCTION public.add_customer_with_pet(
  uuid, text, text, text, text, text, boolean, text, text, text, date, text,
  text, numeric, boolean, text, jsonb, text, text, text
) IS
  'GH-05-rpc, decisione Luigi 18/8/2026, a valle di GH-05-interruzione. Crea customer e pet atomicamente per lo staff del tenant. pets.owner_user_id usa auth.uid() come ponte transitorio e non identifica il customer; autorizzazione e isolamento restano tenant-aware via membership e RLS.';

REVOKE ALL ON FUNCTION public.add_customer_with_pet(
  uuid, text, text, text, text, text, boolean, text, text, text, date, text,
  text, numeric, boolean, text, jsonb, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.add_customer_with_pet(
  uuid, text, text, text, text, text, boolean, text, text, text, date, text,
  text, numeric, boolean, text, jsonb, text, text, text
) TO authenticated;

COMMIT;
