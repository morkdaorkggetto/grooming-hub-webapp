-- GH-07-bis, decisione Luigi 21/8/2026, sulla proposta GH-07 accettata.
-- Registrata sul demo come migration 20260821055259.
--
-- Assorbe il direttorio operativo in customers senza rimuovere contacts.
-- La sezione di backfill e deliberatamente protetta sul tenant UUID del demo:
-- il preflight delle 301 righe produzione e un atto separato pre-G6.

BEGIN;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS acquisition_source text;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS relationship_status text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.customers'::regclass
      AND conname = 'customers_acquisition_source_check'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_acquisition_source_check
      CHECK (acquisition_source IN ('manual', 'whatsapp', 'qr'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.customers'::regclass
      AND conname = 'customers_relationship_status_check'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_relationship_status_check
      CHECK (relationship_status IN ('lead', 'contacted', 'active', 'archived'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS customers_tenant_relationship_status_idx
  ON public.customers (tenant_id, relationship_status);

CREATE OR REPLACE FUNCTION public.upsert_customer_lead(
  p_tenant_id uuid,
  p_first_name text,
  p_phone text,
  p_last_name text DEFAULT NULL,
  p_operator_notes text DEFAULT NULL,
  p_acquisition_source text DEFAULT 'manual',
  p_relationship_status text DEFAULT 'lead'
)
RETURNS TABLE(customer_id uuid, created boolean)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_customer_id uuid;
  v_phone text;
  v_source text;
  v_status text;
  v_notes text;
  v_match_ids uuid[];
BEGIN
  IF NOT public.has_tenant_any_staff_access(p_tenant_id) THEN
    RAISE EXCEPTION 'Accesso negato: membership staff richiesta per il tenant indicato'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(pg_catalog.btrim(p_first_name), '') IS NULL THEN
    RAISE EXCEPTION 'Il nome del lead e obbligatorio'
      USING ERRCODE = '22023';
  END IF;

  v_phone := public.normalize_phone_it(p_phone);
  IF v_phone IS NULL OR v_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Il telefono del lead deve essere valido e normalizzabile'
      USING ERRCODE = '22023';
  END IF;

  v_source := COALESCE(NULLIF(pg_catalog.btrim(p_acquisition_source), ''), 'manual');
  IF v_source NOT IN ('manual', 'whatsapp', 'qr') THEN
    RAISE EXCEPTION 'Origine lead non valida'
      USING ERRCODE = '22023';
  END IF;

  v_status := COALESCE(NULLIF(pg_catalog.btrim(p_relationship_status), ''), 'lead');
  IF v_status NOT IN ('lead', 'contacted', 'archived') THEN
    RAISE EXCEPTION 'Stato iniziale lead non valido'
      USING ERRCODE = '22023';
  END IF;

  v_notes := NULLIF(pg_catalog.btrim(p_operator_notes), '');

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_tenant_id::text || ':' || v_phone, 0)
  );

  SELECT pg_catalog.array_agg(c.id ORDER BY c.id)
  INTO v_match_ids
  FROM public.customers c
  WHERE c.tenant_id = p_tenant_id
    AND public.normalize_phone_it(c.phone) = v_phone;

  IF COALESCE(pg_catalog.cardinality(v_match_ids), 0) > 1 THEN
    RAISE EXCEPTION 'Telefono normalizzato associato a piu customer nel tenant'
      USING ERRCODE = '23505';
  END IF;

  v_customer_id := v_match_ids[1];

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (
      tenant_id,
      first_name,
      last_name,
      phone,
      operator_notes,
      acquisition_source,
      relationship_status
    )
    VALUES (
      p_tenant_id,
      pg_catalog.btrim(p_first_name),
      NULLIF(pg_catalog.btrim(p_last_name), ''),
      v_phone,
      v_notes,
      v_source,
      v_status
    )
    RETURNING id INTO v_customer_id;

    RETURN QUERY SELECT v_customer_id, true;
    RETURN;
  END IF;

  UPDATE public.customers c
  SET
    first_name = CASE
      WHEN NULLIF(pg_catalog.btrim(c.first_name), '') IS NULL
        THEN pg_catalog.btrim(p_first_name)
      ELSE c.first_name
    END,
    last_name = CASE
      WHEN NULLIF(pg_catalog.btrim(c.last_name), '') IS NULL
        THEN NULLIF(pg_catalog.btrim(p_last_name), '')
      ELSE c.last_name
    END,
    operator_notes = CASE
      WHEN v_notes IS NULL THEN c.operator_notes
      WHEN NULLIF(pg_catalog.btrim(c.operator_notes), '') IS NULL THEN v_notes
      WHEN c.operator_notes = v_notes THEN c.operator_notes
      WHEN pg_catalog.strpos(
        E'\n' || c.operator_notes || E'\n',
        E'\n' || v_notes || E'\n'
      ) > 0 THEN c.operator_notes
      ELSE c.operator_notes || E'\n' || v_notes
    END,
    acquisition_source = COALESCE(c.acquisition_source, v_source),
    relationship_status = CASE
      WHEN c.relationship_status = 'active' THEN 'active'
      WHEN c.relationship_status = 'contacted' AND v_status = 'lead' THEN 'contacted'
      ELSE v_status
    END
  WHERE c.id = v_customer_id;

  RETURN QUERY SELECT v_customer_id, false;
END;
$$;

COMMENT ON FUNCTION public.upsert_customer_lead(
  uuid, text, text, text, text, text, text
) IS
  'GH-07-bis, decisione Luigi 21/8/2026. Crea o riusa per telefono normalizzato un customer lead senza pet. SECURITY INVOKER; la guard staff e la prima istruzione e RLS resta applicata.';

REVOKE ALL ON FUNCTION public.upsert_customer_lead(
  uuid, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.upsert_customer_lead(
  uuid, text, text, text, text, text, text
) TO authenticated;

DO $$
DECLARE
  v_demo_tenant_id constant uuid := '8ad7489b-15f9-44f5-8d50-cc89506c3ac9';
  v_contact record;
  v_linked_customer_id uuid;
  v_phone_ids uuid[];
  v_name_ids uuid[];
  v_customer_id uuid;
  v_phone text;
  v_status text;
  v_owner_parts text[];
  v_first_name text;
  v_last_name text;
  v_pet_notes text;
  v_marker text;
  v_absorbed integer := 0;
  v_customer_count integer;
  v_pet_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.tenants
    WHERE id = v_demo_tenant_id
      AND slug = 'grooming-hub'
  ) THEN
    RAISE EXCEPTION 'GH-07-bis demo guard failed: expected tenant missing';
  END IF;

  IF (SELECT pg_catalog.count(*) FROM public.contacts WHERE tenant_id = v_demo_tenant_id) <> 5 THEN
    RAISE EXCEPTION 'GH-07-bis demo guard failed: expected exactly 5 contacts';
  END IF;

  IF (SELECT pg_catalog.count(*) FROM public.customers WHERE tenant_id = v_demo_tenant_id) <> 7
     OR (SELECT pg_catalog.count(*) FROM public.pets WHERE tenant_id = v_demo_tenant_id) <> 7 THEN
    RAISE EXCEPTION 'GH-07-bis demo guard failed: expected baseline 7 customers / 7 pets';
  END IF;

  FOR v_contact IN
    SELECT *
    FROM public.contacts
    WHERE tenant_id = v_demo_tenant_id
    ORDER BY created_at, id
  LOOP
    v_phone := public.normalize_phone_it(v_contact.phone);
    IF v_phone IS NULL OR v_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
      RAISE EXCEPTION 'GH-07-bis contact % has invalid phone', v_contact.id;
    END IF;

    v_linked_customer_id := NULL;
    IF v_contact.linked_pet_id IS NOT NULL THEN
      SELECT p.customer_id
      INTO v_linked_customer_id
      FROM public.pets p
      WHERE p.id = v_contact.linked_pet_id
        AND p.tenant_id = v_contact.tenant_id;

      IF v_linked_customer_id IS NULL THEN
        RAISE EXCEPTION 'GH-07-bis contact % has invalid linked pet', v_contact.id;
      END IF;
    END IF;

    SELECT pg_catalog.array_agg(c.id ORDER BY c.id)
    INTO v_phone_ids
    FROM public.customers c
    WHERE c.tenant_id = v_contact.tenant_id
      AND public.normalize_phone_it(c.phone) = v_phone;

    IF COALESCE(pg_catalog.cardinality(v_phone_ids), 0) > 1 THEN
      RAISE EXCEPTION 'GH-07-bis contact % has ambiguous normalized phone', v_contact.id;
    END IF;

    SELECT pg_catalog.array_agg(DISTINCT c.id ORDER BY c.id)
    INTO v_name_ids
    FROM public.customers c
    JOIN public.pets p
      ON p.customer_id = c.id
     AND p.tenant_id = c.tenant_id
    WHERE c.tenant_id = v_contact.tenant_id
      AND pg_catalog.regexp_replace(
        pg_catalog.lower(pg_catalog.btrim(pg_catalog.concat_ws(' ', c.first_name, c.last_name))),
        '\s+', ' ', 'g'
      ) = pg_catalog.regexp_replace(
        pg_catalog.lower(pg_catalog.btrim(v_contact.owner_name)),
        '\s+', ' ', 'g'
      )
      AND pg_catalog.regexp_replace(
        pg_catalog.lower(pg_catalog.btrim(p.name)), '\s+', ' ', 'g'
      ) = pg_catalog.regexp_replace(
        pg_catalog.lower(pg_catalog.btrim(v_contact.pet_name)), '\s+', ' ', 'g'
      );

    IF COALESCE(pg_catalog.cardinality(v_name_ids), 0) > 1 THEN
      RAISE EXCEPTION 'GH-07-bis contact % has ambiguous assisted name match', v_contact.id;
    END IF;

    IF v_linked_customer_id IS NOT NULL
       AND v_phone_ids[1] IS NOT NULL
       AND v_linked_customer_id IS DISTINCT FROM v_phone_ids[1] THEN
      RAISE EXCEPTION 'GH-07-bis contact % conflicts between link and phone', v_contact.id;
    END IF;

    IF v_linked_customer_id IS NOT NULL
       AND v_name_ids[1] IS NOT NULL
       AND v_linked_customer_id IS DISTINCT FROM v_name_ids[1] THEN
      RAISE EXCEPTION 'GH-07-bis contact % conflicts between link and assisted name', v_contact.id;
    END IF;

    IF v_phone_ids[1] IS NOT NULL
       AND v_name_ids[1] IS NOT NULL
       AND v_phone_ids[1] IS DISTINCT FROM v_name_ids[1] THEN
      RAISE EXCEPTION 'GH-07-bis contact % conflicts between phone and assisted name', v_contact.id;
    END IF;

    v_customer_id := COALESCE(v_linked_customer_id, v_phone_ids[1], v_name_ids[1]);
    IF v_customer_id IS NULL THEN
      RAISE EXCEPTION 'GH-07-bis contact % has no safe demo match', v_contact.id;
    END IF;

    v_status := CASE v_contact.status
      WHEN 'new' THEN 'lead'
      WHEN 'contacted' THEN 'contacted'
      WHEN 'converted' THEN 'active'
      WHEN 'archived' THEN 'archived'
      ELSE NULL
    END;
    IF v_status IS NULL THEN
      RAISE EXCEPTION 'GH-07-bis contact % has unsupported status', v_contact.id;
    END IF;

    v_owner_parts := pg_catalog.regexp_split_to_array(
      pg_catalog.btrim(v_contact.owner_name), '\s+'
    );
    IF COALESCE(pg_catalog.array_length(v_owner_parts, 1), 0) = 1 THEN
      v_first_name := v_owner_parts[1];
      v_last_name := NULL;
    ELSE
      v_first_name := pg_catalog.array_to_string(
        v_owner_parts[1:pg_catalog.array_length(v_owner_parts, 1) - 1], ' '
      );
      v_last_name := v_owner_parts[pg_catalog.array_length(v_owner_parts, 1)];
    END IF;

    UPDATE public.customers c
    SET
      first_name = CASE
        WHEN NULLIF(pg_catalog.btrim(c.first_name), '') IS NULL THEN v_first_name
        ELSE c.first_name
      END,
      last_name = CASE
        WHEN NULLIF(pg_catalog.btrim(c.last_name), '') IS NULL THEN v_last_name
        ELSE c.last_name
      END,
      acquisition_source = COALESCE(c.acquisition_source, v_contact.source),
      relationship_status = CASE
        WHEN EXISTS (SELECT 1 FROM public.pets p WHERE p.customer_id = c.id) THEN 'active'
        ELSE v_status
      END,
      created_at = LEAST(c.created_at, COALESCE(v_contact.created_at, c.created_at))
    WHERE c.id = v_customer_id;

    IF NULLIF(pg_catalog.btrim(v_contact.notes), '') IS NOT NULL THEN
      IF v_contact.linked_pet_id IS NOT NULL THEN
        SELECT p.internal_notes
        INTO v_pet_notes
        FROM public.pets p
        WHERE p.id = v_contact.linked_pet_id;

        IF NULLIF(pg_catalog.btrim(v_pet_notes), '') IS NULL THEN
          UPDATE public.pets
          SET internal_notes = v_contact.notes
          WHERE id = v_contact.linked_pet_id;
        ELSIF v_pet_notes IS DISTINCT FROM v_contact.notes THEN
          v_marker := '[GH-07 contact ' || v_contact.id || '] ' || v_contact.notes;
          IF pg_catalog.strpos(v_pet_notes, v_marker) = 0 THEN
            UPDATE public.pets
            SET internal_notes = v_pet_notes || E'\n' || v_marker
            WHERE id = v_contact.linked_pet_id;
          END IF;
        END IF;
      ELSE
        v_marker := '[GH-07 contact ' || v_contact.id || '] ' || v_contact.notes;
        UPDATE public.customers c
        SET operator_notes = CASE
          WHEN NULLIF(pg_catalog.btrim(c.operator_notes), '') IS NULL THEN v_marker
          WHEN pg_catalog.strpos(c.operator_notes, v_marker) > 0 THEN c.operator_notes
          ELSE c.operator_notes || E'\n' || v_marker
        END
        WHERE c.id = v_customer_id;
      END IF;
    END IF;

    v_absorbed := v_absorbed + 1;
  END LOOP;

  IF v_absorbed <> 5 THEN
    RAISE EXCEPTION 'GH-07-bis demo backfill expected 5 absorptions, got %', v_absorbed;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.tenant_id = v_demo_tenant_id
    GROUP BY public.normalize_phone_it(c.phone)
    HAVING pg_catalog.count(*) > 1
  ) THEN
    RAISE EXCEPTION 'GH-07-bis demo backfill produced normalized phone duplicates';
  END IF;

  SELECT pg_catalog.count(*) INTO v_customer_count
  FROM public.customers WHERE tenant_id = v_demo_tenant_id;

  SELECT pg_catalog.count(*) INTO v_pet_count
  FROM public.pets WHERE tenant_id = v_demo_tenant_id;

  IF v_customer_count <> 7 OR v_pet_count <> 7 THEN
    RAISE EXCEPTION 'GH-07-bis demo baseline changed: % customers / % pets',
      v_customer_count, v_pet_count;
  END IF;
END $$;

UPDATE public.customers c
SET acquisition_source = 'manual'
WHERE c.acquisition_source IS NULL;

UPDATE public.customers c
SET relationship_status = CASE
  WHEN EXISTS (
    SELECT 1
    FROM public.pets p
    WHERE p.customer_id = c.id
      AND p.tenant_id = c.tenant_id
  ) THEN 'active'
  ELSE 'lead'
END
WHERE c.relationship_status IS NULL;

ALTER TABLE public.customers
  ALTER COLUMN acquisition_source SET DEFAULT 'manual',
  ALTER COLUMN acquisition_source SET NOT NULL,
  ALTER COLUMN relationship_status SET DEFAULT 'active',
  ALTER COLUMN relationship_status SET NOT NULL;

CREATE OR REPLACE FUNCTION public.enforce_customer_directory_fields_staff_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW.acquisition_source := OLD.acquisition_source;
    NEW.relationship_status := OLD.relationship_status;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_customer_directory_fields_staff_only() IS
  'GH-07-bis: impedisce ai customer di modificare i campi operativi del direttorio. Le RLS continuano a governare le righe; il trigger aggiunge enforcement column-level.';

REVOKE ALL ON FUNCTION public.enforce_customer_directory_fields_staff_only()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trg_customers_protect_directory_fields ON public.customers;
CREATE TRIGGER trg_customers_protect_directory_fields
  BEFORE UPDATE OF acquisition_source, relationship_status
  ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_customer_directory_fields_staff_only();

COMMIT;
