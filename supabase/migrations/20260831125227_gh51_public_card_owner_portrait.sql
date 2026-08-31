-- GH-51: the public printed card prefers the owner's portrait, while preserving
-- the salon recognition photo as its fallback. Source: GH-51 mandate, 2026-08-31.
BEGIN;

CREATE OR REPLACE FUNCTION public.get_public_pet_card(p_qr_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
DECLARE
  v_pet RECORD;
  v_visits_total integer := 0;
  v_visits_bronze integer := 0;
  v_visits_silver integer := 0;
  v_visits_gold integer := 0;
  v_reward_points integer := 0;
  v_first_visit date;
  v_bronze_visits integer;
  v_silver_visits integer;
  v_gold_visits integer;
  v_bronze_months integer;
  v_silver_months integer;
  v_gold_months integer;
  v_bronze_points integer;
  v_silver_points integer;
  v_gold_points integer;
  v_visit_tier_rank integer := 0;
  v_points_tier_rank integer := 0;
  v_current_tier text := 'base';
  v_next_tier text := 'bronze';
  v_remaining_visits integer := 0;
  v_remaining_points integer := 0;
BEGIN
  IF p_qr_token IS NULL OR btrim(p_qr_token) = '' THEN
    RETURN NULL;
  END IF;

  SELECT
    p.id,
    p.qr_token,
    p.name,
    p.breed,
    COALESCE(p.owner_photo_url, p.photo_url) AS photo_url,
    COALESCE(NULLIF(btrim(t.name), ''), 'Il tuo salone') AS business_name,
    NULLIF(btrim(t.settings->>'whatsapp_phone'), '') AS salon_phone,
    t.settings -> 'fidelity_tiers' AS fidelity_tiers
  INTO v_pet
  FROM public.pets p
  JOIN public.tenants t ON t.id = p.tenant_id
  WHERE p.qr_token = p_qr_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_bronze_visits := (v_pet.fidelity_tiers #>> '{bronze,visits_required}')::integer;
  v_silver_visits := (v_pet.fidelity_tiers #>> '{silver,visits_required}')::integer;
  v_gold_visits := (v_pet.fidelity_tiers #>> '{gold,visits_required}')::integer;
  v_bronze_months := (v_pet.fidelity_tiers #>> '{bronze,months_window}')::integer;
  v_silver_months := (v_pet.fidelity_tiers #>> '{silver,months_window}')::integer;
  v_gold_months := (v_pet.fidelity_tiers #>> '{gold,months_window}')::integer;
  v_bronze_points := (v_pet.fidelity_tiers #>> '{bronze,points_required}')::integer;
  v_silver_points := (v_pet.fidelity_tiers #>> '{silver,points_required}')::integer;
  v_gold_points := (v_pet.fidelity_tiers #>> '{gold,points_required}')::integer;

  SELECT
    COUNT(*)::integer,
    COUNT(*) FILTER (
      WHERE v.date >= (CURRENT_DATE - make_interval(months => v_bronze_months))::date
    )::integer,
    COUNT(*) FILTER (
      WHERE v.date >= (CURRENT_DATE - make_interval(months => v_silver_months))::date
    )::integer,
    COUNT(*) FILTER (
      WHERE v.date >= (CURRENT_DATE - make_interval(months => v_gold_months))::date
    )::integer,
    MIN(v.date)
  INTO v_visits_total, v_visits_bronze, v_visits_silver, v_visits_gold, v_first_visit
  FROM public.visits v
  WHERE v.pet_id = v_pet.id;

  SELECT COALESCE(SUM(rp.points), 0)::integer
  INTO v_reward_points
  FROM public.reward_points rp
  WHERE rp.pet_id = v_pet.id;

  v_visit_tier_rank := CASE
    WHEN v_visits_gold >= v_gold_visits THEN 3
    WHEN v_visits_silver >= v_silver_visits THEN 2
    WHEN v_visits_bronze >= v_bronze_visits THEN 1
    ELSE 0
  END;

  v_points_tier_rank := CASE
    WHEN v_reward_points >= v_gold_points THEN 3
    WHEN v_reward_points >= v_silver_points THEN 2
    WHEN v_reward_points >= v_bronze_points THEN 1
    ELSE 0
  END;

  CASE GREATEST(v_visit_tier_rank, v_points_tier_rank)
    WHEN 3 THEN
      v_current_tier := 'gold';
      v_next_tier := NULL;
      v_remaining_visits := 0;
      v_remaining_points := 0;
    WHEN 2 THEN
      v_current_tier := 'silver';
      v_next_tier := 'gold';
      v_remaining_visits := GREATEST(0, v_gold_visits - v_visits_gold);
      v_remaining_points := GREATEST(0, v_gold_points - v_reward_points);
    WHEN 1 THEN
      v_current_tier := 'bronze';
      v_next_tier := 'silver';
      v_remaining_visits := GREATEST(0, v_silver_visits - v_visits_silver);
      v_remaining_points := GREATEST(0, v_silver_points - v_reward_points);
    ELSE
      v_current_tier := 'base';
      v_next_tier := 'bronze';
      v_remaining_visits := GREATEST(0, v_bronze_visits - v_visits_bronze);
      v_remaining_points := GREATEST(0, v_bronze_points - v_reward_points);
  END CASE;

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
    'visits12Months', v_visits_bronze,
    'visits24Months', v_visits_silver,
    'visits36Months', v_visits_gold,
    'rewardPointsTotal', v_reward_points,
    'fidelityMode', CASE
      WHEN v_points_tier_rank > v_visit_tier_rank THEN 'points'
      ELSE 'visits'
    END,
    'fidelityTier', v_current_tier,
    'nextTier', v_next_tier,
    'remainingVisits', v_remaining_visits,
    'remainingPoints', v_remaining_points
  );
END;
$function$;

COMMENT ON FUNCTION public.get_public_pet_card(text) IS
  'Public QR-card projection. Identity and fidelity scale come from the pet tenant; owner portrait is preferred over salon photo.';

COMMIT;
