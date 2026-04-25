-- ============================================================================
-- Gate 2 · Fase C — Enum `tenant_role` + tabella `tenant_memberships`
-- ----------------------------------------------------------------------------
-- L'autorizzazione app-level passa qui. `profiles.role` (legacy) resta fino a
-- deprecazione completa (vedi M14).
--
-- NOTA: a seguito di M11-bis, l'enum `tenant_role`, la tabella
-- `tenant_memberships` e una prima riga di seed (l'operatore demo come
-- `owner` del tenant pilota) potrebbero già esistere. Tutto il DDL qui è
-- idempotente (`CREATE TYPE` in `DO BEGIN ... EXCEPTION WHEN duplicate_object`,
-- `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). M13 può
-- girare dopo M11-bis senza effetti collaterali. La duplicazione strutturata
-- è intenzionale: M11-bis anticipa il DDL per poter eseguire il mini-seed
-- nella stessa transazione.
-- ============================================================================

BEGIN;

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

CREATE INDEX IF NOT EXISTS tenant_memberships_user_idx        ON public.tenant_memberships (user_id);
CREATE INDEX IF NOT EXISTS tenant_memberships_tenant_role_idx ON public.tenant_memberships (tenant_id, role);

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

COMMIT;
