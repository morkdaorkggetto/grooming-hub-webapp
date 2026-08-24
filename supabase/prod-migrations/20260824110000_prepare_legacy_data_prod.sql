-- GH-11 · Preparazione dati legacy prima dello split M11-bis prod.
-- Fonte: docs/incarichi/GH-11-prova-generale-migrazione.md, Fase 2.
--
-- 1. Completa il profilo operator degli utenti che possiedono record legacy.
-- 2. Compila un telefono mancante solo quando lo stesso nominativo ha una
--    singola fonte telefonica normalizzata tra clients e contacts.
-- 3. Congela le cardinalita misurate sul dump del 21/8: 3 operator e 7
--    clienti ancora senza una fonte telefonica reale.

BEGIN;

INSERT INTO public.profiles (id, business_name, role)
SELECT DISTINCT
  u.id,
  split_part(u.email, '@', 1),
  'operator'
FROM auth.users u
JOIN public.clients c ON c.user_id = u.id
ON CONFLICT (id) DO UPDATE
SET role = 'operator';

WITH client_base AS (
  SELECT
    c.id,
    lower(regexp_replace(btrim(c.owner), '\s+', ' ', 'g')) AS owner_key,
    CASE
      WHEN c.phone IS NULL OR btrim(c.phone) = '' THEN NULL
      WHEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g') LIKE '+%'
        THEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')
      WHEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g') LIKE '00%'
       AND length(regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')) >= 12
        THEN '+' || substr(regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g'), 3)
      WHEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g') LIKE '39%'
       AND length(regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')) >= 11
        THEN '+' || regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')
      ELSE '+39' || regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')
    END AS phone_key
  FROM public.clients c
),
contact_base AS (
  SELECT
    lower(regexp_replace(btrim(c.owner_name), '\s+', ' ', 'g')) AS owner_key,
    CASE
      WHEN c.phone IS NULL OR btrim(c.phone) = '' THEN NULL
      WHEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g') LIKE '+%'
        THEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')
      WHEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g') LIKE '00%'
       AND length(regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')) >= 12
        THEN '+' || substr(regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g'), 3)
      WHEN regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g') LIKE '39%'
       AND length(regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')) >= 11
        THEN '+' || regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')
      ELSE '+39' || regexp_replace(c.phone, '[\s\-\(\)\.\/]', '', 'g')
    END AS phone_key
  FROM public.contacts c
),
candidate_phones AS (
  SELECT owner_key, phone_key FROM client_base WHERE phone_key IS NOT NULL
  UNION
  SELECT owner_key, phone_key FROM contact_base WHERE phone_key IS NOT NULL
),
unique_candidates AS (
  SELECT owner_key, min(phone_key) AS phone_key
  FROM candidate_phones
  GROUP BY owner_key
  HAVING count(DISTINCT phone_key) = 1
),
resolved AS (
  UPDATE public.clients c
  SET phone = uc.phone_key
  FROM unique_candidates uc
  WHERE (c.phone IS NULL OR btrim(c.phone) = '')
    AND lower(regexp_replace(btrim(c.owner), '\s+', ' ', 'g')) = uc.owner_key
  RETURNING c.id
)
SELECT count(*) AS deterministic_phone_repairs FROM resolved;

DO $$
DECLARE
  v_operators integer;
  v_missing_phone integer;
BEGIN
  SELECT count(*) INTO v_operators
  FROM public.profiles
  WHERE role = 'operator';

  SELECT count(*) INTO v_missing_phone
  FROM public.clients
  WHERE phone IS NULL OR btrim(phone) = '';

  IF v_operators <> 3 THEN
    RAISE EXCEPTION
      'Preparazione bloccata: attesi 3 operator legacy, trovati %.',
      v_operators;
  END IF;

  IF v_missing_phone <> 7 THEN
    RAISE EXCEPTION
      'Preparazione bloccata: attesi 7 clients manuali senza telefono, trovati %.',
      v_missing_phone;
  END IF;
END $$;

COMMIT;
