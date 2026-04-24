-- ============================================================================
-- Gate 2 · Fase C — Enum `tenant_role` + tabella `tenant_memberships`
-- ----------------------------------------------------------------------------
-- L'autorizzazione app-level passa qui. `profiles.role` (legacy) resta fino a
-- deprecazione completa (vedi M14).
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

CREATE INDEX tenant_memberships_user_idx        ON public.tenant_memberships (user_id);
CREATE INDEX tenant_memberships_tenant_role_idx ON public.tenant_memberships (tenant_id, role);

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

COMMIT;
