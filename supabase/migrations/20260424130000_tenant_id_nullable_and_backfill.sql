-- ============================================================================
-- Gate 2 · Fase D · step 1 — aggiunta `tenant_id` nullable + backfill al seed
-- ----------------------------------------------------------------------------
-- Strategia in due step (02-database.md §Passo 1): prima colonna nullable,
-- backfill delle righe esistenti (oggi 0 in demo), poi in M21 enforce NOT NULL.
-- In produzione questi due step vanno in finestre separate con verifica
-- manuale tra l'uno e l'altro.
--
-- `customers`, `pets`, `services`, `promotions` hanno già `tenant_id` nullable
-- (creato in M11/M16/M17): il file si limita al backfill per loro.
-- ============================================================================

BEGIN;

-- Riferimento al seed tenant pilota
DO $$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'grooming-hub' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant pilota `grooming-hub` mancante. Applica prima 20260424121000_tenants.sql.';
  END IF;

  -- -------- Tabelle che NON avevano `tenant_id`: ADD COLUMN + backfill --------
  ALTER TABLE public.visits               ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
  ALTER TABLE public.appointments         ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
  ALTER TABLE public.contacts             ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
  ALTER TABLE public.reward_points        ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
  ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

  -- -------- Backfill delle righe esistenti al tenant pilota --------
  -- In demo tutte queste sono 0 righe → UPDATE no-op. Lo script resta corretto
  -- nel caso in cui il backfill venga riapplicato dopo un seed di dati.
  UPDATE public.customers           SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.pets                SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.visits              SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.appointments        SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.contacts            SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.reward_points       SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.customer_invitations SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.services            SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.promotions          SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
END $$;

COMMIT;
