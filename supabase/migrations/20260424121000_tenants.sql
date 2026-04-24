-- ============================================================================
-- Gate 2 · Fase C — Tabella `tenants` (radice del multi-tenant) + seed pilota
-- ----------------------------------------------------------------------------
-- Decisione acquisita: slug = 'grooming-hub', name = 'Grooming HUB'.
-- L'UUID generato sarà usato come `tenant_id` nei backfill di M18/M19.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  -- Timezone lasciato `text` libero in Fase 1 perché c'è un solo tenant
  -- italiano. Rivalutare validazione (via funzione `is_valid_timezone` o
  -- enum di timezone supportate) quando il sistema sarà multi-tenant con
  -- saloni in geografie potenzialmente diverse.
  timezone    text NOT NULL DEFAULT 'Europe/Rome',
  locale      text NOT NULL DEFAULT 'it-IT',
  settings    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenants_slug_idx ON public.tenants (slug);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Seed tenant pilota (idempotente).
INSERT INTO public.tenants (slug, name)
VALUES ('grooming-hub', 'Grooming HUB')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
