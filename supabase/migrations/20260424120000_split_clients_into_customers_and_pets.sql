-- ============================================================================
-- Gate 2 · Fase B — Split atomico `clients` → `customers` + `pets`
-- ----------------------------------------------------------------------------
-- ⚠ DEMO-ONLY: questa migration è progettata per `grooming-hub-demo`, dove
--   `clients` e `customer_client_links` hanno 0 righe. Usa `DROP COLUMN` +
--   `ADD COLUMN` diretto, che sarebbe distruttivo su un DB con dati reali.
--
-- ⚠ Per produzione (`grooming`) sarà scritta una migration separata —
--   working name: `M11-prod_split_clients_with_backfill.sql` — che in
--   aggiunta al DDL qui presente includerà:
--     a) `ALTER TABLE pets ADD COLUMN legacy_client_id text UNIQUE` (ponte).
--     b) `INSERT INTO pets (…, legacy_client_id) SELECT …, id FROM clients`.
--     c) Per ogni tabella dipendente:
--          - `ADD COLUMN pet_id uuid` (nullable),
--          - `UPDATE … SET pet_id = (SELECT p.id FROM pets p
--                                     WHERE p.legacy_client_id = T.client_id)`,
--          - `ALTER COLUMN pet_id SET NOT NULL`,
--          - `DROP COLUMN client_id`.
--     d) `ALTER TABLE pets DROP COLUMN legacy_client_id`.
--   Quel file sarà rivisto e approvato prima del merge in produzione. Non
--   usare **questa** migration sul DB prod.
-- ----------------------------------------------------------------------------
-- `clients` oggi contiene, in un'unica riga, sia il pet (name, breed, photo,
-- qr_token, is_blacklisted…) sia il contatto del padrone (owner, phone).
-- Lo split crea due entità separate:
--   `customers` (persona con account Supabase, 1 riga per tenant per user)
--   `pets`      (animale, con FK `customer_id` → `customers.id` opzionale)
--
-- `customer_client_links` viene dismesso: la relazione customer↔pet diventa
-- diretta via `pets.customer_id`. `customer_invitations.client_id` viene
-- rinominato `pet_id` (FK a pets).
--
-- Tutto in una transazione: se una qualsiasi istruzione fallisce si torna
-- allo stato precedente.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Nuova tabella `customers`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid,                          -- nullable finché M20 non lo enforce
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text NOT NULL,
  phone              text,
  email              text,
  marketing_opt_in   boolean NOT NULL DEFAULT false,
  operator_notes     text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Unicità per-utente per ora; in M20 diventerà (tenant_id, user_id) — lasciata
-- su user_id finché tenant_id non è NOT NULL.
CREATE UNIQUE INDEX customers_user_id_unique ON public.customers (user_id);
CREATE INDEX customers_phone_idx            ON public.customers (phone);

CREATE OR REPLACE TRIGGER update_customers_timestamp
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Nuova tabella `pets` (rimpiazza `clients`)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pets (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid,                          -- NOT NULL in M20
  customer_id        uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  owner_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               text NOT NULL,
  species            text,                          -- 'dog' | 'cat' | 'other' (libero per ora)
  breed              text,
  birth_date         date,
  sex                text CHECK (sex IS NULL OR sex IN ('m','f')),
  microchip          text,
  weight_kg          numeric(5,2),
  neutered           boolean,
  color              text,
  coat_preferences   jsonb,                         -- taglio, shampoo, tolleranze
  owner_notes        text,                          -- editabile lato customer
  internal_notes     text,                          -- operator-only
  photo_url          text,
  no_show_score      integer NOT NULL DEFAULT 0,
  is_blacklisted     boolean NOT NULL DEFAULT false,
  qr_token           text UNIQUE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pets_tenant_id_idx     ON public.pets (tenant_id);
CREATE INDEX pets_customer_id_idx   ON public.pets (customer_id);
CREATE INDEX pets_owner_user_id_idx ON public.pets (owner_user_id);
CREATE INDEX pets_name_idx          ON public.pets (name);
CREATE INDEX pets_blacklist_idx     ON public.pets (is_blacklisted, no_show_score);

CREATE OR REPLACE TRIGGER update_pets_timestamp
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Drop esplicito delle policy pre-esistenti che fanno riferimento a
--    `clients` o `customer_client_links`. Queste policy sono definite su
--    tabelle diverse da `clients` — non verrebbero quindi distrutte dal DROP
--    TABLE successivo e romperebbero al primo uso.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers can view linked appointments"     ON public.appointments;
DROP POLICY IF EXISTS "Customers can request linked appointments"  ON public.appointments;
DROP POLICY IF EXISTS "Customers can view linked reward points"    ON public.reward_points;
DROP POLICY IF EXISTS "Users can insert their own reward points"   ON public.reward_points;
DROP POLICY IF EXISTS "Customers can view visits of linked clients" ON public.visits;
DROP POLICY IF EXISTS "Users can view visits of their clients"     ON public.visits;
DROP POLICY IF EXISTS "Users can insert visits to their clients"   ON public.visits;
DROP POLICY IF EXISTS "Users can update visits of their clients"   ON public.visits;
DROP POLICY IF EXISTS "Users can delete visits of their clients"   ON public.visits;
-- Policy su `clients` (si autodistruggono col DROP TABLE ma le elenchiamo per
-- trasparenza):
--   Users can view/insert/update/delete their own clients
--   Customers can view linked clients

-- ----------------------------------------------------------------------------
-- 4. Rewire FK su tabelle dipendenti (0 righe → DROP + ADD sicuro)
-- ----------------------------------------------------------------------------

-- 4a. visits.client_id (text) → visits.pet_id (uuid)
ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_client_id_fkey;
DROP INDEX  IF EXISTS public.idx_visits_client_id;
ALTER TABLE public.visits DROP COLUMN  client_id;
ALTER TABLE public.visits ADD  COLUMN  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE;
CREATE INDEX idx_visits_pet_id ON public.visits (pet_id);

-- 4b. appointments.client_id (text) → appointments.pet_id (uuid)
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;
DROP INDEX  IF EXISTS public.idx_appointments_client_id;
ALTER TABLE public.appointments DROP COLUMN  client_id;
ALTER TABLE public.appointments ADD  COLUMN  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE;
CREATE INDEX idx_appointments_pet_id ON public.appointments (pet_id);

-- 4c. reward_points.client_id (text) → reward_points.pet_id (uuid)
ALTER TABLE public.reward_points DROP CONSTRAINT IF EXISTS reward_points_client_id_fkey;
DROP INDEX  IF EXISTS public.idx_reward_points_client_id;
ALTER TABLE public.reward_points DROP COLUMN  client_id;
ALTER TABLE public.reward_points ADD  COLUMN  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE;
CREATE INDEX idx_reward_points_pet_id ON public.reward_points (pet_id);

-- 4d. contacts.linked_client_id (text, nullable) → contacts.linked_pet_id (uuid, nullable)
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_linked_client_id_fkey;
DROP INDEX  IF EXISTS public.idx_contacts_linked_client_id;
ALTER TABLE public.contacts DROP COLUMN  linked_client_id;
ALTER TABLE public.contacts ADD  COLUMN  linked_pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL;
CREATE INDEX idx_contacts_linked_pet_id ON public.contacts (linked_pet_id);

-- 4e. customer_invitations.client_id (text) → customer_invitations.pet_id (uuid, nullable)
--     L'invito diventa a livello tenant, con eventuale pet associato (se operatore lo specifica)
ALTER TABLE public.customer_invitations DROP CONSTRAINT IF EXISTS customer_invitations_client_id_fkey;
DROP INDEX  IF EXISTS public.idx_customer_invitations_client;
ALTER TABLE public.customer_invitations DROP COLUMN  client_id;
ALTER TABLE public.customer_invitations ADD  COLUMN  pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE;
CREATE INDEX idx_customer_invitations_pet ON public.customer_invitations (pet_id);

-- ----------------------------------------------------------------------------
-- 5. Dismissione `customer_client_links` e `clients`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.customer_client_links;
DROP TABLE IF EXISTS public.clients;  -- CASCADE non serve: tutte le FK sono già state rimosse

-- ----------------------------------------------------------------------------
-- 6. Riscrittura RPC `get_public_pet_card` per pesare su `pets` (invece di
--    `clients`) e `visits.pet_id`.
-- ----------------------------------------------------------------------------
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
    p.id,
    p.qr_token,
    p.name,
    p.breed,
    p.photo_url,
    COALESCE(pr.business_name, 'Grooming Hub') AS business_name
  INTO v_pet
  FROM public.pets p
  LEFT JOIN public.profiles pr ON pr.id = p.owner_user_id
  WHERE p.qr_token = p_qr_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '12 months')::DATE)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '24 months')::DATE)::INTEGER,
    COUNT(*) FILTER (WHERE v.date >= (CURRENT_DATE - INTERVAL '36 months')::DATE)::INTEGER
  INTO v_visits_total, v_visits_12, v_visits_24, v_visits_36
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

-- ----------------------------------------------------------------------------
-- 7. Riscrittura RPC `accept_customer_invite`
--    Semantica nuova: accettare un invito crea (o aggiorna) la riga `customers`
--    del chiamante per il tenant dell'invito, e — se l'invito ha `pet_id` —
--    assegna quel pet al customer. Niente più `customer_client_links`.
-- ----------------------------------------------------------------------------
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
  v_operator_tenant uuid;
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

  -- Blocco (transitorio, finché profiles.role esiste): un account operator non
  -- può accettare inviti customer.
  IF EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = v_user_id AND p.role = 'operator'
  ) THEN
    RAISE EXCEPTION 'Questo account è un account operatore. Usa o crea un account cliente separato.';
  END IF;

  -- Upsert `profiles` per nome di comodo (mantenuto finché profiles.role vive).
  INSERT INTO public.profiles (id, business_name, role)
  VALUES (v_user_id, COALESCE(split_part(v_user_email, '@', 1), 'Cliente'), 'customer')
  ON CONFLICT (id) DO UPDATE SET role = 'customer';

  -- Il tenant dell'invito lo deriviamo da tenant_memberships dell'operatore
  -- (l'operatore ha role='owner' o 'staff' nel tenant). Finché i memberships
  -- non esistono (M13), `v_operator_tenant` resta NULL e la customer row avrà
  -- tenant_id NULL. M20 correggerà il backfill via seed.
  SELECT tm.tenant_id
  INTO v_operator_tenant
  FROM public.tenant_memberships tm
  WHERE tm.user_id = v_invitation.operator_user_id
    AND tm.role IN ('owner','staff')
  ORDER BY tm.created_at ASC
  LIMIT 1;

  -- Upsert `customers` (user_id unico finché tenant_id non è NOT NULL).
  INSERT INTO public.customers (tenant_id, user_id, full_name, email)
  VALUES (
    v_operator_tenant,
    v_user_id,
    COALESCE(split_part(v_user_email, '@', 1), 'Cliente'),
    v_user_email
  )
  ON CONFLICT (user_id) DO UPDATE
    SET tenant_id = COALESCE(public.customers.tenant_id, EXCLUDED.tenant_id)
  RETURNING id INTO v_customer_id;

  -- Se l'invito menziona un pet, collegalo al customer
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
    'operatorUserId', v_invitation.operator_user_id,
    'tenantId', v_operator_tenant
  );
END;
$function$;

-- ----------------------------------------------------------------------------
-- 8. Policy legacy minimali — per non lasciare `visits` / `reward_points`
--    con RLS abilitato e zero policy tra il merge di M11 e l'applicazione
--    delle policy finali (M21-M32). Staff-only, basate su `pets.owner_user_id`.
--    Verranno sostituite in M27-M30.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 9. Policy legacy su pets/customers (staff-only) per non bloccare l'app
--    operatore. Verranno sostituite in M27 / M28.
-- ----------------------------------------------------------------------------
CREATE POLICY pets_staff_legacy
  ON public.pets FOR ALL
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Nessuna policy INSERT customer su pets in Fase 1 (decisione: no self-service).
-- Customer SELECT/UPDATE saranno aggiunte in M28.

CREATE POLICY customers_staff_legacy_select
  ON public.customers FOR SELECT
  USING (true);  -- ampissima di proposito, ristretta in M27 con tenant/role

CREATE POLICY customers_self_update
  ON public.customers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMIT;
