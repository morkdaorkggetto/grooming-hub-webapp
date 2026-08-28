-- GH-32: sposta le note del salone fuori dalle righe leggibili dai customer.
-- Fonte: docs/incarichi/GH-32-note-interne-fuori-portata.md, decisione Luigi
-- 28/8/2026. L'atto segue GH-30 e GH-08 nella ricetta G6: conserva le firme
-- RPC esistenti, ma rende le note dati del salone protetti da RLS staff-only.

BEGIN;

CREATE TABLE IF NOT EXISTS public.customer_staff_notes (
  customer_id uuid PRIMARY KEY
    REFERENCES public.customers(id) ON DELETE CASCADE,
  notes text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT customer_staff_notes_not_blank
    CHECK (NULLIF(pg_catalog.btrim(notes), '') IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.pet_staff_notes (
  pet_id uuid PRIMARY KEY
    REFERENCES public.pets(id) ON DELETE CASCADE,
  notes text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT pet_staff_notes_not_blank
    CHECK (NULLIF(pg_catalog.btrim(notes), '') IS NOT NULL)
);

COMMENT ON TABLE public.customer_staff_notes IS
  'GH-32 note customer riservate al salone; nessun accesso customer.';
COMMENT ON TABLE public.pet_staff_notes IS
  'GH-32 note pet riservate al salone; nessun accesso customer.';

ALTER TABLE public.customer_staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_staff_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.customer_staff_notes
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE public.pet_staff_notes
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customer_staff_notes
  TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pet_staff_notes
  TO authenticated, service_role;

DROP POLICY IF EXISTS customer_staff_notes_staff_all
  ON public.customer_staff_notes;
CREATE POLICY customer_staff_notes_staff_all
  ON public.customer_staff_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.customers c
      WHERE c.id = customer_staff_notes.customer_id
        AND public.has_tenant_any_staff_access(c.tenant_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.customers c
      WHERE c.id = customer_staff_notes.customer_id
        AND public.has_tenant_any_staff_access(c.tenant_id)
    )
  );

DROP POLICY IF EXISTS pet_staff_notes_staff_all
  ON public.pet_staff_notes;
CREATE POLICY pet_staff_notes_staff_all
  ON public.pet_staff_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.pets p
      WHERE p.id = pet_staff_notes.pet_id
        AND public.has_tenant_any_staff_access(p.tenant_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.pets p
      WHERE p.id = pet_staff_notes.pet_id
        AND public.has_tenant_any_staff_access(p.tenant_id)
    )
  );

DROP TRIGGER IF EXISTS trg_customer_staff_notes_updated_at
  ON public.customer_staff_notes;
CREATE TRIGGER trg_customer_staff_notes_updated_at
  BEFORE UPDATE ON public.customer_staff_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_pet_staff_notes_updated_at
  ON public.pet_staff_notes;
CREATE TRIGGER trg_pet_staff_notes_updated_at
  BEFORE UPDATE ON public.pet_staff_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Copia prima, verifica contenuto e legame, poi consente il contract finale.
-- Il SQL dinamico rende il blocco rieseguibile anche dopo la rimozione delle
-- colonne legacy.
DO $$
DECLARE
  v_has_customer_source boolean;
  v_has_pet_source boolean;
  v_mismatch boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute a
    WHERE a.attrelid = 'public.customers'::pg_catalog.regclass
      AND a.attname = 'operator_notes'
      AND NOT a.attisdropped
  ) INTO v_has_customer_source;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute a
    WHERE a.attrelid = 'public.pets'::pg_catalog.regclass
      AND a.attname = 'internal_notes'
      AND NOT a.attisdropped
  ) INTO v_has_pet_source;

  IF v_has_customer_source THEN
    EXECUTE $sql$
      SELECT EXISTS (
        SELECT 1
        FROM public.customers c
        JOIN public.customer_staff_notes n ON n.customer_id = c.id
        WHERE NULLIF(pg_catalog.btrim(c.operator_notes), '') IS NOT NULL
          AND n.notes IS DISTINCT FROM c.operator_notes
      )
    $sql$ INTO v_mismatch;
    IF v_mismatch THEN
      RAISE EXCEPTION 'GH-32 conflict: customer note destination differs from source';
    END IF;

    EXECUTE $sql$
      INSERT INTO public.customer_staff_notes (customer_id, notes, created_at, updated_at)
      SELECT c.id, c.operator_notes, c.created_at, c.updated_at
      FROM public.customers c
      WHERE NULLIF(pg_catalog.btrim(c.operator_notes), '') IS NOT NULL
      ON CONFLICT (customer_id) DO NOTHING
    $sql$;

    EXECUTE $sql$
      SELECT EXISTS (
        SELECT 1
        FROM public.customers c
        LEFT JOIN public.customer_staff_notes n ON n.customer_id = c.id
        WHERE NULLIF(pg_catalog.btrim(c.operator_notes), '') IS NOT NULL
          AND n.notes IS DISTINCT FROM c.operator_notes
      )
    $sql$ INTO v_mismatch;
    IF v_mismatch THEN
      RAISE EXCEPTION 'GH-32 verification failed: customer notes not copied exactly';
    END IF;
  END IF;

  IF v_has_pet_source THEN
    EXECUTE $sql$
      SELECT EXISTS (
        SELECT 1
        FROM public.pets p
        JOIN public.pet_staff_notes n ON n.pet_id = p.id
        WHERE NULLIF(pg_catalog.btrim(p.internal_notes), '') IS NOT NULL
          AND n.notes IS DISTINCT FROM p.internal_notes
      )
    $sql$ INTO v_mismatch;
    IF v_mismatch THEN
      RAISE EXCEPTION 'GH-32 conflict: pet note destination differs from source';
    END IF;

    EXECUTE $sql$
      INSERT INTO public.pet_staff_notes (pet_id, notes, created_at, updated_at)
      SELECT p.id, p.internal_notes, p.created_at, p.updated_at
      FROM public.pets p
      WHERE NULLIF(pg_catalog.btrim(p.internal_notes), '') IS NOT NULL
      ON CONFLICT (pet_id) DO NOTHING
    $sql$;

    EXECUTE $sql$
      SELECT EXISTS (
        SELECT 1
        FROM public.pets p
        LEFT JOIN public.pet_staff_notes n ON n.pet_id = p.id
        WHERE NULLIF(pg_catalog.btrim(p.internal_notes), '') IS NOT NULL
          AND n.notes IS DISTINCT FROM p.internal_notes
      )
    $sql$ INTO v_mismatch;
    IF v_mismatch THEN
      RAISE EXCEPTION 'GH-32 verification failed: pet notes not copied exactly';
    END IF;
  END IF;
END;
$$;

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
    RAISE EXCEPTION 'Il nome del customer e obbligatorio' USING ERRCODE = '22023';
  END IF;
  IF NULLIF(pg_catalog.btrim(p_pet_name), '') IS NULL THEN
    RAISE EXCEPTION 'Il nome del pet e obbligatorio' USING ERRCODE = '22023';
  END IF;

  v_phone := public.normalize_phone_it(p_customer_phone);
  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'Il telefono del customer e obbligatorio' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.customers (
    tenant_id, first_name, last_name, email, phone, marketing_opt_in
  ) VALUES (
    p_tenant_id,
    pg_catalog.btrim(p_customer_first_name),
    NULLIF(pg_catalog.btrim(p_customer_last_name), ''),
    NULLIF(pg_catalog.btrim(p_customer_email), ''),
    v_phone,
    COALESCE(p_customer_marketing_opt_in, false)
  ) RETURNING id INTO v_customer_id;

  INSERT INTO public.pets (
    tenant_id, customer_id, owner_user_id, name, species, breed, birth_date,
    sex, microchip, weight_kg, neutered, color, coat_preferences, owner_notes,
    photo_url
  ) VALUES (
    p_tenant_id, v_customer_id, auth.uid(), pg_catalog.btrim(p_pet_name),
    NULLIF(pg_catalog.btrim(p_pet_species), ''),
    NULLIF(pg_catalog.btrim(p_pet_breed), ''), p_pet_birth_date,
    NULLIF(pg_catalog.btrim(p_pet_sex), ''),
    NULLIF(pg_catalog.btrim(p_pet_microchip), ''), p_pet_weight_kg,
    p_pet_neutered, NULLIF(pg_catalog.btrim(p_pet_color), ''),
    p_pet_coat_preferences, NULLIF(pg_catalog.btrim(p_pet_owner_notes), ''),
    NULLIF(pg_catalog.btrim(p_pet_photo_url), '')
  ) RETURNING id INTO v_pet_id;

  IF NULLIF(pg_catalog.btrim(p_customer_operator_notes), '') IS NOT NULL THEN
    INSERT INTO public.customer_staff_notes (customer_id, notes)
    VALUES (v_customer_id, pg_catalog.btrim(p_customer_operator_notes));
  END IF;
  IF NULLIF(pg_catalog.btrim(p_pet_internal_notes), '') IS NOT NULL THEN
    INSERT INTO public.pet_staff_notes (pet_id, notes)
    VALUES (v_pet_id, pg_catalog.btrim(p_pet_internal_notes));
  END IF;

  RETURN QUERY SELECT v_customer_id, v_pet_id;
END;
$$;

COMMENT ON FUNCTION public.add_customer_with_pet(
  uuid, text, text, text, text, text, boolean, text, text, text, date, text,
  text, numeric, boolean, text, jsonb, text, text, text
) IS
  'GH-32: stessa API staff atomica di GH-05-rpc; le note sono salvate nelle tabelle staff-only.';

REVOKE ALL ON FUNCTION public.add_customer_with_pet(
  uuid, text, text, text, text, text, boolean, text, text, text, date, text,
  text, numeric, boolean, text, jsonb, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_customer_with_pet(
  uuid, text, text, text, text, text, boolean, text, text, text, date, text,
  text, numeric, boolean, text, jsonb, text, text, text
) TO authenticated;

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
  v_existing_notes text;
  v_merged_notes text;
  v_match_ids uuid[];
BEGIN
  IF NOT public.has_tenant_any_staff_access(p_tenant_id) THEN
    RAISE EXCEPTION 'Accesso negato: membership staff richiesta per il tenant indicato'
      USING ERRCODE = '42501';
  END IF;
  IF NULLIF(pg_catalog.btrim(p_first_name), '') IS NULL THEN
    RAISE EXCEPTION 'Il nome del lead e obbligatorio' USING ERRCODE = '22023';
  END IF;

  v_phone := public.normalize_phone_it(p_phone);
  IF v_phone IS NULL OR v_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Il telefono del lead deve essere valido e normalizzabile'
      USING ERRCODE = '22023';
  END IF;

  v_source := COALESCE(NULLIF(pg_catalog.btrim(p_acquisition_source), ''), 'manual');
  IF v_source NOT IN ('manual', 'whatsapp', 'qr') THEN
    RAISE EXCEPTION 'Origine lead non valida' USING ERRCODE = '22023';
  END IF;
  v_status := COALESCE(NULLIF(pg_catalog.btrim(p_relationship_status), ''), 'lead');
  IF v_status NOT IN ('lead', 'contacted', 'archived') THEN
    RAISE EXCEPTION 'Stato iniziale lead non valido' USING ERRCODE = '22023';
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
      tenant_id, first_name, last_name, phone, acquisition_source,
      relationship_status
    ) VALUES (
      p_tenant_id, pg_catalog.btrim(p_first_name),
      NULLIF(pg_catalog.btrim(p_last_name), ''), v_phone, v_source, v_status
    ) RETURNING id INTO v_customer_id;

    IF v_notes IS NOT NULL THEN
      INSERT INTO public.customer_staff_notes (customer_id, notes)
      VALUES (v_customer_id, v_notes);
    END IF;
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
    acquisition_source = COALESCE(c.acquisition_source, v_source),
    relationship_status = CASE
      WHEN c.relationship_status = 'active' THEN 'active'
      WHEN c.relationship_status = 'contacted' AND v_status = 'lead' THEN 'contacted'
      ELSE v_status
    END
  WHERE c.id = v_customer_id;

  IF v_notes IS NOT NULL THEN
    SELECT n.notes INTO v_existing_notes
    FROM public.customer_staff_notes n
    WHERE n.customer_id = v_customer_id;

    v_merged_notes := CASE
      WHEN NULLIF(pg_catalog.btrim(v_existing_notes), '') IS NULL THEN v_notes
      WHEN v_existing_notes = v_notes THEN v_existing_notes
      WHEN pg_catalog.strpos(
        E'\n' || v_existing_notes || E'\n', E'\n' || v_notes || E'\n'
      ) > 0 THEN v_existing_notes
      ELSE v_existing_notes || E'\n' || v_notes
    END;
    INSERT INTO public.customer_staff_notes (customer_id, notes)
    VALUES (v_customer_id, v_merged_notes)
    ON CONFLICT (customer_id) DO UPDATE SET notes = EXCLUDED.notes;
  END IF;

  RETURN QUERY SELECT v_customer_id, false;
END;
$$;

COMMENT ON FUNCTION public.upsert_customer_lead(
  uuid, text, text, text, text, text, text
) IS
  'GH-32: stessa API lead di GH-13; le note sono salvate nella tabella customer staff-only.';

REVOKE ALL ON FUNCTION public.upsert_customer_lead(
  uuid, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.upsert_customer_lead(
  uuid, text, text, text, text, text, text
) TO authenticated;

-- GH-30 deve essere eseguita prima di questo atto. Qui la sua funzione viene
-- ricondotta ai due campi direttorio ancora presenti; la protezione sopravvive.
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
  'GH-32: non-staff cannot modify acquisition_source or relationship_status; row access remains governed by RLS.';
REVOKE ALL ON FUNCTION public.enforce_customer_directory_fields_staff_only()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trg_customers_protect_directory_fields ON public.customers;
CREATE TRIGGER trg_customers_protect_directory_fields
  BEFORE UPDATE OF acquisition_source, relationship_status
  ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_customer_directory_fields_staff_only();

DROP TRIGGER IF EXISTS trg_customers_protect_operator_notes ON public.customers;
DROP TRIGGER IF EXISTS trg_pets_protect_internal_notes ON public.pets;
DROP FUNCTION IF EXISTS public.enforce_customers_operator_notes_staff_only();
DROP FUNCTION IF EXISTS public.enforce_pets_internal_notes_staff_only();

ALTER TABLE public.customers DROP COLUMN IF EXISTS operator_notes;
ALTER TABLE public.pets DROP COLUMN IF EXISTS internal_notes;

COMMIT;
