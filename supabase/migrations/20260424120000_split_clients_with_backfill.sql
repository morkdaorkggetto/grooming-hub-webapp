-- ============================================================================
-- Gate 2 · Fase B (revisione M11-bis) — Split `clients` → `customers` + `pets`
-- con BACKFILL DATI completo. Sostituisce la M11 originale (DEMO-ONLY) con
-- una versione produzione-safe.
-- ----------------------------------------------------------------------------
-- Atomicità totale: tutto in una `BEGIN…COMMIT`. In caso di errore, rollback
-- completo e DB allo stato pre-M11-bis. Il timestamp 20260424120000 è
-- mantenuto invariato rispetto a M11 originale per non disallineare i file
-- successivi della Fase C/D/E.
-- ----------------------------------------------------------------------------
-- Differenze chiave rispetto a M11 originale:
--
--   • Anticipa qui CREATE TABLE `tenants` + `tenant_memberships` + ENUM
--     `tenant_role` (idempotenti con M12/M13 successivi: i due file restano
--     no-op grazie a `CREATE TABLE IF NOT EXISTS` e `DO BEGIN ... EXCEPTION
--     WHEN duplicate_object`). Necessario per poter fare il mini-seed
--     memberships in coda a questa stessa transazione.
--
--   • Schema `customers` rifinito: `first_name`/`last_name`/`email`/`phone`
--     in luogo di `full_name`. `user_id` nullable. CHECK
--     `user_id NOT NULL OR first_name NOT NULL`. UNIQUE parziali
--     `(tenant_id, user_id) WHERE user_id IS NOT NULL` e
--     `(tenant_id, phone)`.
--
--   • Backfill dei `clients` esistenti via colonna-ponte `pets.legacy_client_id`,
--     dedup conservativo su `(owner_normalized, phone_normalized)`,
--     normalizzazione phone E.164 (default +39).
--
--   • Helper SQL `normalize_phone_it(text)` riusabile.
--
--   • `customer_invitations` arricchito con `phone NOT NULL`, `first_name`,
--     `last_name` per supportare la logica adottiva.
--
--   • `accept_customer_invite` riscritta con matching adottivo via phone.
--
--   • Trigger `sync_customers_email_from_auth` su `auth.users AFTER UPDATE
--     OF email` → mirror su `customers.email` per `user_id = NEW.id`.
--
--   • Mini-seed `tenant_memberships` dal `profiles.role` esistente (1 riga
--     sul demo).
--
-- Pre-condition (verificata all'inizio): tutti i `clients.phone` sono
-- non-NULL e non-vuoti. Se anche un solo record ha phone mancante, la
-- transazione si interrompe con messaggio diagnostico esplicito.
-- ============================================================================

BEGIN;

-- ============================================================================
-- [0] Pre-flight: rifiuta clients con phone NULL/vuoto.
-- ============================================================================
DO $$
DECLARE
  v_bad_rows text;
BEGIN
  SELECT string_agg(
           format('%s ("%s" / "%s")', id, coalesce(name, '?'), coalesce(owner, '?')),
           ', '
         )
  INTO v_bad_rows
  FROM public.clients
  WHERE phone IS NULL OR btrim(phone) = '';

  IF v_bad_rows IS NOT NULL THEN
    RAISE EXCEPTION
      'Backfill bloccato: i seguenti `clients` hanno phone mancante. '
      'Pulisci/rimuovi manualmente prima di rilanciare M11-bis: %',
      v_bad_rows;
  END IF;
END $$;

-- ============================================================================
-- [1] Anticipa DDL `tenants` + ENUM `tenant_role` + `tenant_memberships`
--     (necessari per il mini-seed in coda alla transazione). Idempotenti
--     con M12/M13 successivi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  -- Timezone lasciato `text` libero in Fase 1 (vedi M12 per razionale).
  timezone    text NOT NULL DEFAULT 'Europe/Rome',
  locale      text NOT NULL DEFAULT 'it-IT',
  settings    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenants_slug_idx ON public.tenants (slug);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

INSERT INTO public.tenants (slug, name)
VALUES ('grooming-hub', 'Grooming HUB')
ON CONFLICT (slug) DO NOTHING;

DO $$ BEGIN
  CREATE TYPE public.tenant_role AS ENUM ('owner', 'staff', 'customer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.tenant_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS tenant_memberships_user_idx
  ON public.tenant_memberships (user_id);
CREATE INDEX IF NOT EXISTS tenant_memberships_tenant_role_idx
  ON public.tenant_memberships (tenant_id, role);

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- [2] Helper SQL `normalize_phone_it(text)` — normalizzazione E.164 con
--     default Italia (+39). Riusato in backfill e disponibile per app/RPC.
--
-- Regole (semplici, non sostituiscono libphonenumber per casi complessi):
--   - NULL / vuoto              → NULL
--   - Spazi/trattini/parentesi  → strip
--   - Già con prefisso "+"      → invariato
--   - Inizia con "00" + ≥10cif. → "+" + cifre dopo "00"
--   - Inizia con "39" + ≥11cif. → "+" + tutto
--   - Altrimenti                → "+39" + cifre
-- ============================================================================
CREATE OR REPLACE FUNCTION public.normalize_phone_it(p_phone text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_clean text;
BEGIN
  IF p_phone IS NULL OR btrim(p_phone) = '' THEN
    RETURN NULL;
  END IF;

  -- Rimuovi spazi, trattini, parentesi, slash, punti
  v_clean := regexp_replace(p_phone, '[\s\-\(\)\.\/]', '', 'g');

  -- Se inizia con "+", lascia
  IF v_clean LIKE '+%' THEN
    RETURN v_clean;
  END IF;

  -- "00" prefisso internazionale → sostituisci con "+"
  IF v_clean LIKE '00%' AND length(v_clean) >= 12 THEN
    RETURN '+' || substr(v_clean, 3);
  END IF;

  -- "39" prefisso italiano senza "+" → aggiungi "+"
  IF v_clean LIKE '39%' AND length(v_clean) >= 11 THEN
    RETURN '+' || v_clean;
  END IF;

  -- Default: numero italiano locale, aggiungi "+39"
  RETURN '+39' || v_clean;
END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_phone_it(text)
  TO authenticated, anon, service_role;

COMMENT ON FUNCTION public.normalize_phone_it(text) IS
$$Normalizzazione E.164 di un numero di telefono, default Italia (+39).
Implementazione semplice basata su prefissi noti; non sostituisce
libphonenumber per scenari internazionali complessi.

Uso previsto: backfill M11-bis e UPDATE/INSERT lato applicazione su
`customers.phone` e `customer_invitations.phone`.

Nota tecnica: IMMUTABLE (ottimizzabile come funzione pura), invocabile da
authenticated/anon/service_role.$$;

-- ============================================================================
-- [3] Crea `customers`
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NOT NULL in M21
  user_id            uuid REFERENCES auth.users(id) ON DELETE SET NULL,     -- nullable: anagrafica può non avere account
  first_name         text,                                                  -- nullable a livello colonna; CHECK forza presenza
  last_name          text,                                                  -- sempre opzionale
  email              text,                                                  -- mirror di auth.users.email se user_id presente
  phone              text NOT NULL,                                         -- sempre obbligatorio (E.164)
  marketing_opt_in   boolean NOT NULL DEFAULT false,
  operator_notes     text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),

  -- Anagrafica completa OR account associato (almeno uno dei due).
  -- `phone` è già coperto dal NOT NULL di colonna; il CHECK serve solo a
  -- garantire `first_name` quando il customer non ha ancora account.
  CONSTRAINT customers_identity_check
    CHECK (user_id IS NOT NULL OR first_name IS NOT NULL)
);

-- UNIQUE parziale su (tenant_id, user_id): un utente Supabase può avere al
-- massimo 1 riga customer per tenant. Le anagrafiche pure (user_id NULL) non
-- partecipano al vincolo e possono coesistere senza limiti.
CREATE UNIQUE INDEX IF NOT EXISTS customers_tenant_user_unique
  ON public.customers (tenant_id, user_id)
  WHERE user_id IS NOT NULL;

-- UNIQUE (tenant_id, phone): vincolo pieno (phone è NOT NULL). Garantisce
-- che lo stesso numero non compaia due volte nello stesso tenant; serve al
-- matching adottivo in `accept_customer_invite`.
CREATE UNIQUE INDEX IF NOT EXISTS customers_tenant_phone_unique
  ON public.customers (tenant_id, phone);

CREATE INDEX IF NOT EXISTS customers_phone_idx ON public.customers (phone);

CREATE OR REPLACE TRIGGER update_customers_timestamp
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- [4] Crea `pets` con colonna-ponte `legacy_client_id` (rimossa a fine
--     transazione una volta completato il rewire).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NOT NULL in M21
  customer_id        uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  owner_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               text NOT NULL,
  species            text,
  breed              text,
  birth_date         date,
  sex                text CHECK (sex IS NULL OR sex IN ('m','f')),
  microchip          text,
  weight_kg          numeric(5,2),
  neutered           boolean,
  color              text,
  coat_preferences   jsonb,
  owner_notes        text,                            -- editabile customer
  internal_notes     text,                            -- operator-only; raccoglie clients.notes nel backfill
  photo_url          text,
  no_show_score      integer NOT NULL DEFAULT 0,
  is_blacklisted     boolean NOT NULL DEFAULT false,
  qr_token           text UNIQUE,
  legacy_client_id   text UNIQUE,                     -- ponte temporaneo per il rewire FK
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pets_tenant_id_idx     ON public.pets (tenant_id);
CREATE INDEX IF NOT EXISTS pets_customer_id_idx   ON public.pets (customer_id);
CREATE INDEX IF NOT EXISTS pets_owner_user_id_idx ON public.pets (owner_user_id);
CREATE INDEX IF NOT EXISTS pets_name_idx          ON public.pets (name);
CREATE INDEX IF NOT EXISTS pets_blacklist_idx     ON public.pets (is_blacklisted, no_show_score);

CREATE OR REPLACE TRIGGER update_pets_timestamp
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- [5] Drop policy pre-esistenti che fanno riferimento a `clients` o
--     `customer_client_links` (orfane dopo il drop tabelle in [9]).
-- ============================================================================
DROP POLICY IF EXISTS "Customers can view linked appointments"      ON public.appointments;
DROP POLICY IF EXISTS "Customers can request linked appointments"   ON public.appointments;
DROP POLICY IF EXISTS "Customers can view linked reward points"     ON public.reward_points;
DROP POLICY IF EXISTS "Users can insert their own reward points"    ON public.reward_points;
DROP POLICY IF EXISTS "Customers can view visits of linked clients" ON public.visits;
DROP POLICY IF EXISTS "Users can view visits of their clients"      ON public.visits;
DROP POLICY IF EXISTS "Users can insert visits to their clients"    ON public.visits;
DROP POLICY IF EXISTS "Users can update visits of their clients"    ON public.visits;
DROP POLICY IF EXISTS "Users can delete visits of their clients"    ON public.visits;
-- customer_invitations: la policy "Operators can create customer invitations"
-- referenzia direttamente `client_id`. Postgres rifiuta DROP COLUMN se una
-- policy dipende dalla colonna; questa MANCAVA nel primo apply (errore
-- SQLSTATE 2BP01 in 7e). Le altre due (view/delete) non sono bloccanti ma
-- vengono droppate per coerenza: M33 (rls_customer_invitations) le sostituisce
-- comunque con la versione tenant-aware.
DROP POLICY IF EXISTS "Operators can create customer invitations"   ON public.customer_invitations;
DROP POLICY IF EXISTS "Operators can view their customer invitations"   ON public.customer_invitations;
DROP POLICY IF EXISTS "Operators can delete their customer invitations" ON public.customer_invitations;
-- Bloccante cross-table: la policy è ON clients, ma referenzia
-- customer_client_links nel suo predicato (EXISTS subquery). Postgres
-- registra la dipendenza in pg_depend (deptype 'n'). Rifiuta DROP TABLE
-- customer_client_links finché la policy esiste. Auto-droppata sarebbe
-- dal DROP TABLE clients, ma quel drop arriva dopo ccl in step [8] →
-- l'ordine è incompatibile senza questo drop esplicito qui.
DROP POLICY IF EXISTS "Customers can view linked clients" ON public.clients;
-- Le altre policy su `clients` e `customer_client_links` si autodistruggono
-- col DROP TABLE in [8] (verificato via pg_depend deptype='a').

-- ============================================================================
-- [6] Backfill: per ogni client crea (o riusa) customer + crea pet.
--     - dedup_key = (lower(trim(owner)) collassato spazi, normalize_phone_it(phone))
--     - first_name/last_name = split greedy su owner (ultima parola = last)
--     - mononomi → first_name=full, last_name=NULL
--     - phone normalizzato E.164
--     - pets.legacy_client_id = clients.id (ponte FK rewire)
--     - pets.internal_notes = clients.notes
--     - pets.photo_url = clients.photo
--     - pets.tenant_id, customers.tenant_id rimangono NULL (popolati in M18)
-- ============================================================================
DO $$
DECLARE
  rec_client RECORD;
  v_dedup_owner text;
  v_dedup_phone text;
  v_first_name text;
  v_last_name text;
  v_owner_parts text[];
  v_customer_id uuid;
  v_pet_id uuid;
  v_total_clients int := 0;
  v_new_customers int := 0;
  v_reused_customers int := 0;
BEGIN
  FOR rec_client IN
    SELECT id, name, breed, owner, phone, notes, photo,
           qr_token, no_show_score, is_blacklisted,
           user_id, created_at, updated_at
    FROM public.clients
    ORDER BY created_at NULLS FIRST, id
  LOOP
    v_total_clients := v_total_clients + 1;

    -- Normalizzazione + split
    v_dedup_phone := public.normalize_phone_it(rec_client.phone);
    v_dedup_owner := lower(regexp_replace(btrim(rec_client.owner), '\s+', ' ', 'g'));
    v_owner_parts := string_to_array(btrim(rec_client.owner), ' ');

    IF v_owner_parts IS NULL OR array_length(v_owner_parts, 1) IS NULL THEN
      v_first_name := NULL;
      v_last_name := NULL;
    ELSIF array_length(v_owner_parts, 1) = 1 THEN
      v_first_name := v_owner_parts[1];
      v_last_name := NULL;
    ELSE
      v_first_name := array_to_string(
        v_owner_parts[1:array_length(v_owner_parts, 1) - 1],
        ' '
      );
      v_last_name := v_owner_parts[array_length(v_owner_parts, 1)];
    END IF;

    -- Cerca customer esistente con stesso phone (dedup keyed only on phone
    -- per ora — owner non è ancora popolato sulle righe customers in modo
    -- normalizzato, e phone è UNIQUE per-tenant; bastano l'identità via phone).
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE phone = v_dedup_phone
      AND tenant_id IS NOT DISTINCT FROM NULL  -- backfill scope: tenant_id ancora NULL
    LIMIT 1;

    IF v_customer_id IS NULL THEN
      INSERT INTO public.customers (
        tenant_id, user_id, first_name, last_name, phone, operator_notes
      )
      VALUES (
        NULL,                         -- popolato in M18
        NULL,                         -- anagrafica pre-account
        v_first_name,
        v_last_name,
        v_dedup_phone,
        NULL
      )
      RETURNING id INTO v_customer_id;
      v_new_customers := v_new_customers + 1;
      RAISE NOTICE 'BACKFILL CUSTOMER NEW: client_id=% owner="%" phone="%" → first="%", last="%", customer_id=%',
        rec_client.id, rec_client.owner, v_dedup_phone, v_first_name, coalesce(v_last_name, '<null>'), v_customer_id;
    ELSE
      v_reused_customers := v_reused_customers + 1;
      RAISE NOTICE 'BACKFILL CUSTOMER REUSE: client_id=% owner="%" phone="%" → customer_id=% (dedup hit)',
        rec_client.id, rec_client.owner, v_dedup_phone, v_customer_id;
    END IF;

    -- Crea pet
    INSERT INTO public.pets (
      tenant_id, customer_id, owner_user_id, name, breed,
      internal_notes, photo_url, qr_token, no_show_score, is_blacklisted,
      legacy_client_id, created_at, updated_at
    )
    VALUES (
      NULL,                            -- tenant_id popolato in M18
      v_customer_id,
      rec_client.user_id,              -- operatore titolare (back-compat)
      rec_client.name,
      rec_client.breed,
      rec_client.notes,                -- clients.notes → pets.internal_notes
      rec_client.photo,
      rec_client.qr_token,
      rec_client.no_show_score,
      rec_client.is_blacklisted,
      rec_client.id,                   -- ponte
      coalesce(rec_client.created_at, now()),
      coalesce(rec_client.updated_at, now())
    )
    RETURNING id INTO v_pet_id;

    RAISE NOTICE 'BACKFILL PET: client_id=% → pet_id=% (customer_id=%, name="%", qr="%")',
      rec_client.id, v_pet_id, v_customer_id, rec_client.name, rec_client.qr_token;
  END LOOP;

  RAISE NOTICE '----------------------------------------------------------------';
  RAISE NOTICE 'BACKFILL SUMMARY: % clients processed, % customers created, % reused (dedup)',
    v_total_clients, v_new_customers, v_reused_customers;
  RAISE NOTICE '----------------------------------------------------------------';
END $$;

-- ============================================================================
-- [7] Rewire FK delle tabelle dipendenti tramite `legacy_client_id`.
--     Pattern per ciascuna: ADD pet_id nullable → UPDATE da clients.id →
--     SET NOT NULL → DROP COLUMN client_id → indici.
-- ============================================================================

-- 7a. visits
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE;
UPDATE public.visits v
SET pet_id = p.id
FROM public.pets p
WHERE p.legacy_client_id = v.client_id;
DO $$
DECLARE v_orphans int;
BEGIN
  SELECT count(*) INTO v_orphans FROM public.visits WHERE pet_id IS NULL;
  IF v_orphans > 0 THEN
    RAISE EXCEPTION 'Visits orfane post-rewire: % righe (client_id originale non matchava pets.legacy_client_id). Backfill incoerente o FK precedenti violate.', v_orphans;
  END IF;
END $$;
ALTER TABLE public.visits ALTER COLUMN pet_id SET NOT NULL;
ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_client_id_fkey;
DROP INDEX IF EXISTS public.idx_visits_client_id;
ALTER TABLE public.visits DROP COLUMN client_id;
CREATE INDEX IF NOT EXISTS idx_visits_pet_id ON public.visits (pet_id);

-- 7b. appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE;
UPDATE public.appointments a
SET pet_id = p.id
FROM public.pets p
WHERE p.legacy_client_id = a.client_id;
DO $$
DECLARE v_orphans int;
BEGIN
  SELECT count(*) INTO v_orphans FROM public.appointments WHERE pet_id IS NULL;
  IF v_orphans > 0 THEN
    RAISE EXCEPTION 'Appointments orfani post-rewire: % righe (client_id originale non matchava pets.legacy_client_id).', v_orphans;
  END IF;
END $$;
ALTER TABLE public.appointments ALTER COLUMN pet_id SET NOT NULL;
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;
DROP INDEX IF EXISTS public.idx_appointments_client_id;
ALTER TABLE public.appointments DROP COLUMN client_id;
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON public.appointments (pet_id);

-- 7c. reward_points
ALTER TABLE public.reward_points ADD COLUMN IF NOT EXISTS pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE;
UPDATE public.reward_points r
SET pet_id = p.id
FROM public.pets p
WHERE p.legacy_client_id = r.client_id;
DO $$
DECLARE v_orphans int;
BEGIN
  SELECT count(*) INTO v_orphans FROM public.reward_points WHERE pet_id IS NULL;
  IF v_orphans > 0 THEN
    RAISE EXCEPTION 'Reward_points orfani post-rewire: % righe (client_id originale non matchava pets.legacy_client_id).', v_orphans;
  END IF;
END $$;
ALTER TABLE public.reward_points ALTER COLUMN pet_id SET NOT NULL;
ALTER TABLE public.reward_points DROP CONSTRAINT IF EXISTS reward_points_client_id_fkey;
DROP INDEX IF EXISTS public.idx_reward_points_client_id;
ALTER TABLE public.reward_points DROP COLUMN client_id;
CREATE INDEX IF NOT EXISTS idx_reward_points_pet_id ON public.reward_points (pet_id);

-- 7d. contacts.linked_client_id (nullable) → contacts.linked_pet_id (nullable)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS linked_pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL;
UPDATE public.contacts c
SET linked_pet_id = p.id
FROM public.pets p
WHERE p.legacy_client_id = c.linked_client_id;
-- Orphan check: per le righe contacts che AVEVANO linked_client_id valorizzato,
-- il rewire deve aver popolato linked_pet_id. NULL su entrambi è ok (contact
-- mai convertito); NOT NULL → NULL invece è un orfano.
DO $$
DECLARE v_orphans int;
BEGIN
  SELECT count(*) INTO v_orphans FROM public.contacts
   WHERE linked_client_id IS NOT NULL AND linked_pet_id IS NULL;
  IF v_orphans > 0 THEN
    RAISE EXCEPTION 'Contacts orfani post-rewire: % righe con linked_client_id valorizzato ma nessun match in pets.legacy_client_id.', v_orphans;
  END IF;
END $$;
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_linked_client_id_fkey;
DROP INDEX IF EXISTS public.idx_contacts_linked_client_id;
ALTER TABLE public.contacts DROP COLUMN linked_client_id;
CREATE INDEX IF NOT EXISTS idx_contacts_linked_pet_id ON public.contacts (linked_pet_id);

-- 7e. customer_invitations: rewire client_id → pet_id (nullable, l'invito può
-- essere a livello tenant senza pet specifico) + nuove colonne phone/first/last.
ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE;
UPDATE public.customer_invitations ci
SET pet_id = p.id
FROM public.pets p
WHERE p.legacy_client_id = ci.client_id;
-- Orphan check (originariamente client_id era NOT NULL su customer_invitations,
-- quindi ogni riga doveva ricevere un pet_id). Lasciamo pet_id nullable per
-- futuri inviti a livello tenant, ma i record migrati devono essere completi.
DO $$
DECLARE v_orphans int;
BEGIN
  SELECT count(*) INTO v_orphans FROM public.customer_invitations
   WHERE client_id IS NOT NULL AND pet_id IS NULL;
  IF v_orphans > 0 THEN
    RAISE EXCEPTION 'Customer_invitations orfani post-rewire: % righe con client_id valorizzato ma nessun match in pets.legacy_client_id.', v_orphans;
  END IF;
END $$;
ALTER TABLE public.customer_invitations DROP CONSTRAINT IF EXISTS customer_invitations_client_id_fkey;
DROP INDEX IF EXISTS public.idx_customer_invitations_client;
ALTER TABLE public.customer_invitations DROP COLUMN client_id;
CREATE INDEX IF NOT EXISTS idx_customer_invitations_pet ON public.customer_invitations (pet_id);

-- Nuove colonne per logica adottiva. customer_invitations ha 0 righe in demo,
-- quindi `phone NOT NULL` direttamente è sicuro. In prod con righe esistenti
-- la migration prod-equivalente dovrà popolarle prima del NOT NULL.
ALTER TABLE public.customer_invitations
  ADD COLUMN IF NOT EXISTS phone      text NOT NULL,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name  text;

-- ============================================================================
-- [8] Rimozione colonna-ponte e drop tabelle dismissate.
-- ============================================================================
-- Drop esplicito del UNIQUE constraint generato dall'inline
-- `legacy_client_id text UNIQUE` allo step [4]. Postgres genera anche un
-- indice `pets_legacy_client_id_key` *legato al constraint*, quindi un
-- `DROP INDEX` puro fallisce con SQLSTATE 2BP01 ("constraint requires it").
-- DROP CONSTRAINT cascadea anche l'indice. DROP COLUMN sotto cascadeerebbe
-- comunque, ma esplicitiamo per chiarezza e pulizia.
ALTER TABLE public.pets DROP CONSTRAINT IF EXISTS pets_legacy_client_id_key;
ALTER TABLE public.pets DROP COLUMN legacy_client_id;

DROP TABLE IF EXISTS public.customer_client_links;
DROP TABLE IF EXISTS public.clients;

-- ============================================================================
-- [9] Trigger di sync email auth.users → customers
--     Scope: AFTER UPDATE OF email su auth.users, propaga NEW.email a tutte
--     le righe customers con user_id = NEW.id (multi-tenant safe).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_customers_email_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.customers
    SET email = NEW.email
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_customers_email_on_auth_update ON auth.users;
CREATE TRIGGER sync_customers_email_on_auth_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_customers_email_from_auth();

COMMENT ON FUNCTION public.sync_customers_email_from_auth() IS
$$Propaga `auth.users.email` a `customers.email` per tutte le righe customers
del medesimo `user_id`. Trigger AFTER UPDATE OF email su auth.users.

`customers.email` è un mirror denormalizzato — `auth.users.email` resta la
fonte di verità. Multi-tenant safe: aggiorna tutte le righe customers
dell'utente in tutti i tenant.

Nota tecnica: SECURITY DEFINER, search_path='public'.$$;

-- ============================================================================
-- [10] Riscrittura RPC `get_public_pet_card` per `pets`/`visits.pet_id`.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_public_pet_card(p_qr_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pet RECORD;
  v_visits_total INTEGER := 0;
  v_visits_12 INTEGER := 0;
  v_visits_24 INTEGER := 0;
  v_visits_36 INTEGER := 0;
  v_reward_points INTEGER := 0;
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
    p.id, p.qr_token, p.name, p.breed, p.photo_url,
    COALESCE(pr.business_name, 'Grooming Hub') AS business_name
  INTO v_pet
  FROM public.pets p
  LEFT JOIN public.profiles pr ON pr.id = p.owner_user_id
  WHERE p.qr_token = p_qr_token
  LIMIT 1;

  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '12 months')::DATE)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '24 months')::DATE)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '36 months')::DATE)::INTEGER
  INTO v_visits_total, v_visits_12, v_visits_24, v_visits_36
  FROM public.visits v WHERE v.pet_id = v_pet.id;

  SELECT COALESCE(SUM(rp.points), 0)::INTEGER
  INTO v_reward_points
  FROM public.reward_points rp WHERE rp.pet_id = v_pet.id;

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
    'id', v_pet.id, 'qrToken', v_pet.qr_token, 'name', v_pet.name,
    'breed', v_pet.breed, 'photo', v_pet.photo_url,
    'businessName', v_pet.business_name,
    'visitsCount', v_visits_total, 'visits12Months', v_visits_12,
    'visits24Months', v_visits_24, 'visits36Months', v_visits_36,
    'rewardPointsTotal', v_reward_points,
    'fidelityMode', CASE WHEN v_use_points THEN 'points' ELSE 'visits' END,
    'fidelityTier', v_current_tier, 'nextTier', v_next_tier,
    'remainingVisits', v_remaining_visits, 'remainingPoints', v_remaining_points
  );
END;
$function$;

-- ============================================================================
-- [11] Riscrittura RPC `accept_customer_invite` con LOGICA ADOTTIVA.
--     Flusso:
--       1. Verifica auth + invito valido.
--       2. Cerca customers (tenant_id, phone) WHERE user_id IS NULL.
--          - Se trovato: ADOPT → UPDATE user_id, email.
--          - Se trovato ma user_id già diverso: RAISE EXCEPTION.
--       3. Se non trovato: INSERT nuovo customer con dati invito + auth.
--       4. Se invito ha pet_id: associa al customer.
--       5. Mark invito accepted.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.accept_customer_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_invitation public.customer_invitations%ROWTYPE;
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_customer_id uuid;
  v_existing_user_id uuid;
  v_adopted boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Devi effettuare l''accesso per accettare l''invito.';
  END IF;

  SELECT *
  INTO v_invitation
  FROM public.customer_invitations
  WHERE token = p_token
    AND accepted_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invito cliente non valido o scaduto.';
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  IF EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = v_user_id AND p.role = 'operator'
  ) THEN
    RAISE EXCEPTION 'Questo account è un account operatore. Usa o crea un account cliente separato.';
  END IF;

  -- Upsert profilo (back-compat con profiles.role legacy)
  INSERT INTO public.profiles (id, business_name, role)
  VALUES (v_user_id, COALESCE(split_part(v_user_email, '@', 1), 'Cliente'), 'customer')
  ON CONFLICT (id) DO UPDATE SET role = 'customer';

  -- Cerca anagrafica esistente nel tenant per phone (matching adottivo)
  SELECT id, user_id INTO v_customer_id, v_existing_user_id
  FROM public.customers
  WHERE tenant_id = v_invitation.tenant_id
    AND phone = v_invitation.phone
  LIMIT 1;

  IF v_customer_id IS NOT NULL THEN
    -- Esiste anagrafica con questo phone in questo tenant
    IF v_existing_user_id IS NOT NULL AND v_existing_user_id <> v_user_id THEN
      RAISE EXCEPTION
        'Phone % già associato ad altro utente in questo tenant. '
        'Contatta il salone per riassegnare l''anagrafica.',
        v_invitation.phone;
    END IF;

    -- Adopt: lega al chiamante e sincronizza email
    UPDATE public.customers
    SET user_id = v_user_id,
        email = v_user_email
    WHERE id = v_customer_id;

    v_adopted := true;
  ELSE
    -- Crea nuovo customer
    INSERT INTO public.customers (
      tenant_id, user_id, first_name, last_name, email, phone
    )
    VALUES (
      v_invitation.tenant_id,
      v_user_id,
      v_invitation.first_name,
      v_invitation.last_name,
      v_user_email,
      v_invitation.phone
    )
    RETURNING id INTO v_customer_id;
  END IF;

  -- Associa pet (se invito lo specifica)
  IF v_invitation.pet_id IS NOT NULL THEN
    UPDATE public.pets
    SET customer_id = v_customer_id
    WHERE id = v_invitation.pet_id
      AND (customer_id IS NULL OR customer_id = v_customer_id);
  END IF;

  UPDATE public.customer_invitations
  SET accepted_by = v_user_id,
      accepted_at = now()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'customerId', v_customer_id,
    'petId', v_invitation.pet_id,
    'tenantId', v_invitation.tenant_id,
    'adopted', v_adopted
  );
END;
$function$;

-- ============================================================================
-- [12] Mini-seed `tenant_memberships` dal `profiles.role` esistente.
--     Sul demo: 1 profilo operator → 1 riga membership con role='owner'
--     nel tenant pilota `grooming-hub`. Idempotente.
-- ============================================================================
INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
SELECT
  (SELECT id FROM public.tenants WHERE slug = 'grooming-hub'),
  p.id,
  'owner'::public.tenant_role
FROM public.profiles p
WHERE p.role = 'operator'
ON CONFLICT (tenant_id, user_id, role) DO NOTHING;

DO $$
DECLARE
  v_seeded int;
BEGIN
  SELECT count(*) INTO v_seeded FROM public.tenant_memberships;
  RAISE NOTICE 'Seed memberships: % righe in tenant_memberships dopo seed.', v_seeded;
END $$;

-- ============================================================================
-- [13] Policy legacy minimali — ponti temporanei tra M11-bis e Fase E
--     (M22-M33). Staff-only via `pets.owner_user_id` e fallback su customers.
--     Verranno sostituite dalle policy tenant-aware in M25/M26/M27/M30.
-- ============================================================================
CREATE POLICY visits_staff_legacy
  ON public.visits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = visits.pet_id AND p.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = visits.pet_id AND p.owner_user_id = auth.uid()));

CREATE POLICY reward_points_staff_legacy_insert
  ON public.reward_points FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.pets p WHERE p.id = reward_points.pet_id AND p.owner_user_id = auth.uid())
  );

CREATE POLICY pets_staff_legacy
  ON public.pets FOR ALL
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY customers_staff_legacy_select
  ON public.customers FOR SELECT
  USING (true);  -- ampia di proposito; ristretta in M25 con tenant/role

CREATE POLICY customers_self_update
  ON public.customers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- customer_invitations legacy: ponte staff-only fino a M33 (rls_customer_invitations).
-- Garantisce che lo staff possa continuare a creare/leggere/eliminare inviti se
-- l'apply si interrompe fra M11-bis e M33 (es. finestra di manutenzione spezzata).
-- Coerente con il pattern già applicato a pets/customers/visits/reward_points.
-- Colonna `operator_user_id` (uuid NOT NULL) verificata sul DB demo prima del fix.
CREATE POLICY customer_invitations_operator_legacy
  ON public.customer_invitations FOR ALL
  USING (auth.uid() = operator_user_id)
  WITH CHECK (auth.uid() = operator_user_id);

COMMIT;
