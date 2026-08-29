-- GH-38: public card identity and salon contact for the demo tenant.
-- Source: docs/incarichi/GH-38-card-pubblica-e-identita-del-salone.md.

BEGIN;

UPDATE public.tenants
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{whatsapp_phone}',
  to_jsonb('393332979797'::text),
  true
)
WHERE slug = 'grooming-hub'
  AND COALESCE(settings->>'whatsapp_phone', '') IS DISTINCT FROM '393332979797';

CREATE OR REPLACE FUNCTION public.get_public_pet_card(p_qr_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
DECLARE
  v_pet RECORD;
  v_visits_total INTEGER := 0;
  v_visits_12 INTEGER := 0;
  v_visits_24 INTEGER := 0;
  v_visits_36 INTEGER := 0;
  v_reward_points INTEGER := 0;
  v_first_visit DATE;
  v_use_points BOOLEAN := FALSE;
  v_current_tier TEXT := 'base';
  v_next_tier TEXT := 'bronze';
  v_remaining_visits INTEGER := 12;
  v_remaining_points INTEGER := 100;
BEGIN
  IF p_qr_token IS NULL OR btrim(p_qr_token) = '' THEN
    RETURN NULL;
  END IF;

  SELECT
    p.id,
    p.qr_token,
    p.name,
    p.breed,
    p.photo_url,
    COALESCE(NULLIF(btrim(t.name), ''), 'Il tuo salone') AS business_name,
    NULLIF(btrim(t.settings->>'whatsapp_phone'), '') AS salon_phone
  INTO v_pet
  FROM public.pets p
  JOIN public.tenants t ON t.id = p.tenant_id
  WHERE p.qr_token = p_qr_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '12 months')::DATE)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '24 months')::DATE)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '36 months')::DATE)::INTEGER,
    MIN(v.date)
  INTO v_visits_total, v_visits_12, v_visits_24, v_visits_36, v_first_visit
  FROM public.visits v
  WHERE v.pet_id = v_pet.id;

  SELECT COALESCE(SUM(rp.points), 0)::INTEGER
  INTO v_reward_points
  FROM public.reward_points rp
  WHERE rp.pet_id = v_pet.id;

  v_use_points := v_reward_points > 0;

  IF v_use_points THEN
    IF v_reward_points >= 500 THEN
      v_current_tier := 'gold'; v_next_tier := NULL; v_remaining_points := 0;
    ELSIF v_reward_points >= 250 THEN
      v_current_tier := 'silver'; v_next_tier := 'gold'; v_remaining_points := GREATEST(0, 500 - v_reward_points);
    ELSIF v_reward_points >= 100 THEN
      v_current_tier := 'bronze'; v_next_tier := 'silver'; v_remaining_points := GREATEST(0, 250 - v_reward_points);
    ELSE
      v_current_tier := 'base'; v_next_tier := 'bronze'; v_remaining_points := GREATEST(0, 100 - v_reward_points);
    END IF;
    v_remaining_visits := 0;
  ELSE
    IF v_visits_36 >= 36 THEN
      v_current_tier := 'gold'; v_next_tier := NULL; v_remaining_visits := 0;
    ELSIF v_visits_24 >= 24 THEN
      v_current_tier := 'silver'; v_next_tier := 'gold'; v_remaining_visits := GREATEST(0, 36 - v_visits_36);
    ELSIF v_visits_12 >= 12 THEN
      v_current_tier := 'bronze'; v_next_tier := 'silver'; v_remaining_visits := GREATEST(0, 24 - v_visits_24);
    ELSE
      v_current_tier := 'base'; v_next_tier := 'bronze'; v_remaining_visits := GREATEST(0, 12 - v_visits_12);
    END IF;
    v_remaining_points := 0;
  END IF;

  RETURN jsonb_build_object(
    'id', v_pet.id,
    'qrToken', v_pet.qr_token,
    'name', v_pet.name,
    'breed', v_pet.breed,
    'photo', v_pet.photo_url,
    'businessName', v_pet.business_name,
    'salonPhone', v_pet.salon_phone,
    'firstVisitDate', v_first_visit,
    'visitsCount', v_visits_total,
    'visits12Months', v_visits_12,
    'visits24Months', v_visits_24,
    'visits36Months', v_visits_36,
    'rewardPointsTotal', v_reward_points,
    'fidelityMode', CASE WHEN v_use_points THEN 'points' ELSE 'visits' END,
    'fidelityTier', v_current_tier,
    'nextTier', v_next_tier,
    'remainingVisits', v_remaining_visits,
    'remainingPoints', v_remaining_points
  );
END;
$function$;

COMMENT ON FUNCTION public.get_public_pet_card(text) IS
  'Public QR-card projection. Salon identity and contact come from the pet tenant.';

CREATE OR REPLACE FUNCTION public.get_public_salon_identity(p_tenant_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT jsonb_build_object(
    'businessName', COALESCE(NULLIF(btrim(t.name), ''), 'Il tuo salone'),
    'salonPhone', NULLIF(btrim(t.settings->>'whatsapp_phone'), '')
  )
  FROM public.tenants t
  WHERE t.slug = p_tenant_slug
  LIMIT 1;
$function$;

COMMENT ON FUNCTION public.get_public_salon_identity(text) IS
  'Public salon name and WhatsApp contact used by the invalid public-card state.';

REVOKE ALL ON FUNCTION public.get_public_salon_identity(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_salon_identity(text)
  TO anon, authenticated, service_role;

COMMIT;
