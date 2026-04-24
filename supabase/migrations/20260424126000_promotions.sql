-- ============================================================================
-- Gate 2 · Fase C — Tabella `promotions`
-- ----------------------------------------------------------------------------
-- Sola lettura lato customer in Fase 1. `tenant_id` nullable qui, enforce in
-- M20.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.promotions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  title          text NOT NULL,
  body           text,
  image_url      text,
  valid_from     timestamptz,
  valid_to       timestamptz,
  cta_label      text,
  cta_url        text,
  display_order  int NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX promotions_tenant_active_idx ON public.promotions (tenant_id, is_active, display_order);
CREATE INDEX promotions_valid_to_idx      ON public.promotions (valid_to);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

COMMIT;
