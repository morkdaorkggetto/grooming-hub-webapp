-- GH-78: normalize usable phone numbers at the staff-calendar write boundary
-- and preserve original values for the strictly scoped historical backfill.
-- Source: GH-78 mandate, 2026-09-12.
BEGIN;

CREATE TABLE public.gh78_customer_phone_backup (
  customer_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  original_phone text NOT NULL,
  normalized_phone text NOT NULL,
  backed_up_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.gh78_customer_phone_backup IS
  'GH-78 rollback support: original values for customer phones changed from ten-digit Italian mobile form to +39 form.';

ALTER TABLE public.gh78_customer_phone_backup ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.gh78_customer_phone_backup FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_calendar_customer_pet(
  p_tenant_id uuid,
  p_customer_first_name text,
  p_pet_name text,
  p_customer_phone text DEFAULT NULL,
  p_phone_not_provided boolean DEFAULT false,
  p_customer_last_name text DEFAULT NULL,
  p_pet_species text DEFAULT NULL,
  p_pet_breed text DEFAULT NULL,
  p_pet_sex text DEFAULT NULL
)
RETURNS TABLE(
  outcome text,
  customer_id uuid,
  pet_id uuid,
  existing_first_name text,
  existing_last_name text,
  existing_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_customer_id uuid;
  v_pet_id uuid;
  v_raw_phone text := NULLIF(pg_catalog.btrim(p_customer_phone), '');
  v_normalized_phone text := public.normalize_phone_it(p_customer_phone);
  v_phone text := CASE
    WHEN v_normalized_phone ~ '^\+[0-9]{8,15}$' THEN v_normalized_phone
    ELSE v_raw_phone
  END;
  v_raw_phone_digits text := pg_catalog.regexp_replace(
    COALESCE(p_customer_phone, ''),
    '[^0-9]',
    '',
    'g'
  );
  v_phone_digits text := pg_catalog.regexp_replace(
    COALESCE(public.normalize_phone_it(p_customer_phone), ''),
    '[^0-9]',
    '',
    'g'
  );
  v_existing_customer public.customers%ROWTYPE;
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.tenant_memberships AS membership
    WHERE membership.user_id = v_user_id
      AND membership.tenant_id = p_tenant_id
      AND membership.role IN ('owner', 'staff')
  ) THEN
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

  IF COALESCE(p_phone_not_provided, false) THEN
    IF v_phone IS NOT NULL THEN
      RAISE EXCEPTION 'Il telefono va rimosso quando si dichiara che non e stato fornito'
        USING ERRCODE = '22023';
    END IF;
    v_phone := NULL;
  ELSIF v_phone IS NULL OR pg_catalog.length(v_phone_digits) = 0 THEN
    RAISE EXCEPTION 'Inserisci il telefono oppure dichiara che non e stato fornito'
      USING ERRCODE = '22023';
  END IF;

  IF NOT COALESCE(p_phone_not_provided, false)
     AND pg_catalog.length(v_raw_phone_digits) >= 8 THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(p_tenant_id::text || ':' || v_phone_digits, 0)
    );

    SELECT customer.*
    INTO v_existing_customer
    FROM public.customers AS customer
    WHERE customer.tenant_id = p_tenant_id
      AND pg_catalog.regexp_replace(
        COALESCE(public.normalize_phone_it(customer.phone), ''),
        '[^0-9]',
        '',
        'g'
      ) = v_phone_digits
    ORDER BY customer.created_at, customer.id
    LIMIT 1;

    IF v_existing_customer.id IS NOT NULL THEN
      RETURN QUERY SELECT
        'phone_conflict'::text,
        v_existing_customer.id,
        NULL::uuid,
        v_existing_customer.first_name,
        v_existing_customer.last_name,
        v_existing_customer.phone;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.customers (
    tenant_id,
    first_name,
    last_name,
    phone,
    acquisition_source,
    relationship_status
  ) VALUES (
    p_tenant_id,
    pg_catalog.btrim(p_customer_first_name),
    NULLIF(pg_catalog.btrim(p_customer_last_name), ''),
    v_phone,
    'manual',
    'active'
  )
  RETURNING id INTO v_customer_id;

  INSERT INTO public.pets (
    tenant_id,
    customer_id,
    owner_user_id,
    name,
    species,
    breed,
    sex
  ) VALUES (
    p_tenant_id,
    v_customer_id,
    v_user_id,
    pg_catalog.btrim(p_pet_name),
    NULLIF(pg_catalog.btrim(p_pet_species), ''),
    NULLIF(pg_catalog.btrim(p_pet_breed), ''),
    NULLIF(pg_catalog.btrim(p_pet_sex), '')
  )
  RETURNING id INTO v_pet_id;

  RETURN QUERY SELECT
    'created'::text,
    v_customer_id,
    v_pet_id,
    NULL::text,
    NULL::text,
    NULL::text;
END;
$$;

COMMENT ON FUNCTION public.create_calendar_customer_pet(
  uuid, text, text, text, boolean, text, text, text, text
) IS
  'GH-78: crea customer e pet atomicamente dal calendario; salva i telefoni utilizzabili in forma normalizzata, conserva il testo non normalizzabile e confronta i doppioni sulle sole cifre.';

REVOKE ALL ON FUNCTION public.create_calendar_customer_pet(
  uuid, text, text, text, boolean, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.create_calendar_customer_pet(
  uuid, text, text, text, boolean, text, text, text, text
) TO authenticated;

DO $$
DECLARE
  v_collision_count integer;
BEGIN
  WITH phone_rows AS (
    SELECT
      id,
      tenant_id,
      pg_catalog.regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') AS raw_digits,
      pg_catalog.regexp_replace(
        COALESCE(public.normalize_phone_it(phone), ''),
        '[^0-9]',
        '',
        'g'
      ) AS normalized_digits
    FROM public.customers
  ),
  candidates AS (
    SELECT id, tenant_id, raw_digits
    FROM phone_rows
    WHERE raw_digits ~ '^3[0-9]{9}$'
  )
  SELECT COUNT(DISTINCT candidate.id)::integer
  INTO v_collision_count
  FROM candidates AS candidate
  JOIN phone_rows AS other
    ON other.tenant_id = candidate.tenant_id
   AND other.id <> candidate.id
   AND other.normalized_digits = '39' || candidate.raw_digits;

  IF v_collision_count > 0 THEN
    RAISE EXCEPTION 'GH78_PHONE_COLLISION: % customer candidates collide after normalization', v_collision_count
      USING ERRCODE = '23505';
  END IF;
END;
$$;

INSERT INTO public.gh78_customer_phone_backup (
  customer_id,
  tenant_id,
  original_phone,
  normalized_phone
)
SELECT
  customer.id,
  customer.tenant_id,
  customer.phone,
  public.normalize_phone_it(customer.phone)
FROM public.customers AS customer
WHERE pg_catalog.regexp_replace(COALESCE(customer.phone, ''), '[^0-9]', '', 'g') ~ '^3[0-9]{9}$';

UPDATE public.customers AS customer
SET phone = backup.normalized_phone
FROM public.gh78_customer_phone_backup AS backup
WHERE customer.id = backup.customer_id
  AND customer.tenant_id = backup.tenant_id
  AND customer.phone = backup.original_phone;

COMMIT;
