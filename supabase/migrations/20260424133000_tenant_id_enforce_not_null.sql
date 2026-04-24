-- ============================================================================
-- Gate 2 · Fase D · step 2 — enforce `tenant_id NOT NULL`
-- ----------------------------------------------------------------------------
-- Eseguire solo dopo M18 (backfill). In produzione pianificare una finestra
-- separata con verifica del conteggio `tenant_id IS NULL` = 0 prima di lanciare.
-- Include anche la riscrittura dell'UNIQUE su `customers` per essere
-- per-tenant anziché per-utente globale.
-- ============================================================================

BEGIN;

-- Verifica pre-condizione (fallisce la migration se ci sono NULL residui)
DO $$
DECLARE
  v_null_count bigint := 0;
  v_tbl text;
  v_tables text[] := ARRAY[
    'customers','pets','visits','appointments','contacts',
    'reward_points','customer_invitations','services','promotions'
  ];
BEGIN
  FOREACH v_tbl IN ARRAY v_tables LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE tenant_id IS NULL', v_tbl) INTO v_null_count;
    IF v_null_count > 0 THEN
      RAISE EXCEPTION 'Tabella %: % righe con tenant_id NULL. Esegui backfill prima di M21.', v_tbl, v_null_count;
    END IF;
  END LOOP;
END $$;

-- Enforce NOT NULL
ALTER TABLE public.customers            ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.pets                 ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.visits               ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.appointments         ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.contacts             ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.reward_points        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.customer_invitations ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.services             ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.promotions           ALTER COLUMN tenant_id SET NOT NULL;

-- Ora che tenant_id è garantito, customers.UNIQUE diventa (tenant_id, user_id)
DROP INDEX IF EXISTS public.customers_user_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS customers_tenant_user_unique
  ON public.customers (tenant_id, user_id);

-- Post-condition sanity check. Ridondante formalmente — `SET NOT NULL`
-- avrebbe già rifiutato NULL residui — ma esplicita l'invariante per chi
-- legge il file e resta valido se un domani la logica della migration
-- cambia senza che l'autore ricordi di aggiornare l'invariante.
DO $$
DECLARE
  v_null_count bigint := 0;
  v_tbl text;
  v_tables text[] := ARRAY[
    'customers','pets','visits','appointments','contacts',
    'reward_points','customer_invitations','services','promotions'
  ];
BEGIN
  FOREACH v_tbl IN ARRAY v_tables LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE tenant_id IS NULL', v_tbl) INTO v_null_count;
    IF v_null_count > 0 THEN
      RAISE EXCEPTION 'Post-condition violata: % ha % righe con tenant_id NULL dopo SET NOT NULL (non dovrebbe succedere).', v_tbl, v_null_count;
    END IF;
  END LOOP;
END $$;

-- Riscrivi `accept_customer_invite` per usare il nuovo UNIQUE (tenant_id, user_id).
-- Senza questa riscrittura, la versione attuale della funzione fallirebbe con
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification".
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

  INSERT INTO public.profiles (id, business_name, role)
  VALUES (v_user_id, COALESCE(split_part(v_user_email, '@', 1), 'Cliente'), 'customer')
  ON CONFLICT (id) DO UPDATE SET role = 'customer';

  -- Il tenant dell'invito è ora garantito da `customer_invitations.tenant_id`
  -- (NOT NULL da M21).
  INSERT INTO public.customers (tenant_id, user_id, full_name, email)
  VALUES (
    v_invitation.tenant_id,
    v_user_id,
    COALESCE(split_part(v_user_email, '@', 1), 'Cliente'),
    v_user_email
  )
  -- email preservata se già valorizzata: l'invito non sovrascrive un'email
  -- che il customer ha già validato. Solo backfill per customer esistenti
  -- con email NULL. auth.users resta comunque la fonte di verità per il
  -- login; questo campo è un mirror per query di dominio.
  ON CONFLICT (tenant_id, user_id) DO UPDATE
    SET email = COALESCE(public.customers.email, EXCLUDED.email)
  RETURNING id INTO v_customer_id;

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
    'tenantId', v_invitation.tenant_id
  );
END;
$function$;

COMMIT;
