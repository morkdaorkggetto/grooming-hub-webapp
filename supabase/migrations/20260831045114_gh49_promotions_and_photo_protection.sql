-- GH-49, decisione Luigi 30/8/2026.
-- Le promozioni customer rispettano entrambe le estremita della finestra di
-- validita. La whitelist pet dei non-staff conserva solo note proprietario e
-- preferenze manto: photo_url torna a essere un dato gestito dal salone.

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
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW := OLD;
    NEW.owner_notes := v_owner_notes;
    NEW.coat_preferences := v_coat_preferences;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_pets_customer_update_whitelist()
IS 'GH-49 whitelist for authenticated non-staff customers: only owner_notes and coat_preferences are writable; staff and privileged maintenance remain unchanged.';

REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM authenticated;

DROP POLICY IF EXISTS promotions_customer_select_active ON public.promotions;

CREATE POLICY promotions_customer_select_active
  ON public.promotions
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_to IS NULL OR valid_to >= now())
    AND public.has_tenant_access(tenant_id, 'customer')
  );

CREATE OR REPLACE FUNCTION public.reorder_promotions(p_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_visible integer;
  v_tenants integer;
  v_updated integer;
BEGIN
  IF p_ids IS NULL
     OR cardinality(p_ids) = 0
     OR cardinality(p_ids) <> (
       SELECT count(DISTINCT item_id) FROM unnest(p_ids) AS item(item_id)
     ) THEN
    RAISE EXCEPTION 'GH49_INVALID_PROMOTION_ORDER' USING ERRCODE = '22023';
  END IF;

  SELECT count(*), count(DISTINCT tenant_id)
  INTO v_visible, v_tenants
  FROM public.promotions
  WHERE id = ANY (p_ids);

  IF v_visible <> cardinality(p_ids) OR v_tenants <> 1 THEN
    RAISE EXCEPTION 'GH49_PROMOTION_ORDER_FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  UPDATE public.promotions AS promotion
  SET display_order = (ordered.position * 10)::integer
  FROM unnest(p_ids) WITH ORDINALITY AS ordered(id, position)
  WHERE promotion.id = ordered.id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> cardinality(p_ids) THEN
    RAISE EXCEPTION 'GH49_PROMOTION_ORDER_FORBIDDEN' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_promotions(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reorder_promotions(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.reorder_promotions(uuid[]) TO authenticated;

COMMIT;
