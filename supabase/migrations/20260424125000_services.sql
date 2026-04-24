-- ============================================================================
-- Gate 2 · Fase C — Tabella `services` (catalogo servizi per tenant)
-- ----------------------------------------------------------------------------
-- Necessaria per il wizard di prenotazione (`04-schermate.md` §04.3). Non era
-- prevista nel design originale di `02-database.md`, l'abbiamo aggiunta nel
-- piano. `tenant_id` nullable qui, enforce in M20.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.services (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  duration_minutes  int  NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  price_cents       int  NOT NULL CHECK (price_cents >= 0),
  category          text,
  is_active         boolean NOT NULL DEFAULT true,
  display_order     int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX services_tenant_active_idx ON public.services (tenant_id, is_active, display_order);
CREATE INDEX services_category_idx      ON public.services (tenant_id, category) WHERE category IS NOT NULL;

CREATE OR REPLACE TRIGGER update_services_timestamp
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

COMMIT;
