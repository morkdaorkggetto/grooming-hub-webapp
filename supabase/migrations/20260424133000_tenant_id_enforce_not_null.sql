-- ============================================================================
-- Gate 2 · Fase D · step 2 — enforce `tenant_id NOT NULL`
-- ----------------------------------------------------------------------------
-- Eseguire solo dopo M18 (backfill). In produzione pianificare una finestra
-- separata con verifica del conteggio `tenant_id IS NULL` = 0 prima di lanciare.
--
-- Nota M11-bis: l'UNIQUE su `customers` è già creato direttamente in M11-bis
-- nella forma per-tenant (parziale `(tenant_id, user_id) WHERE user_id IS NOT
-- NULL` + pieno `(tenant_id, phone)`). Questo file non lo tocca più. Il
-- rewrite di `accept_customer_invite` è anch'esso fatto in M11-bis (logica
-- adottiva); qui non serve duplicarlo.
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

-- (UNIQUE su `customers` già installati in M11-bis: niente swap qui.)

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

-- (Rewrite di `accept_customer_invite` rimosso: la versione definitiva con
-- logica adottiva via phone è già installata in M11-bis e non dipende
-- dall'UNIQUE che qui non viene più creato.)

COMMIT;
