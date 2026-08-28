-- GH-30 seed prod dei servizi iniziali.
-- Fonte: Davide via Luigi, 28 agosto 2026; mandato GH-30.
-- L'esistenza si valuta per tenant e nome normalizzato. Le righe gia presenti
-- non vengono aggiornate, riattivate o altrimenti sovrascritte.

BEGIN;

DO $$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT t.id
    INTO v_tenant_id
  FROM public.tenants t
  WHERE t.slug = 'grooming-hub';

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'GH-30 services seed: tenant slug grooming-hub not found';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('gh30:services:' || v_tenant_id::text, 0)
  );

  INSERT INTO public.services (
    tenant_id,
    name,
    description,
    duration_minutes,
    price_cents,
    is_active,
    display_order
  )
  SELECT
    v_tenant_id,
    seed.name,
    seed.description,
    seed.duration_minutes,
    seed.price_cents,
    true,
    seed.display_order
  FROM (
    VALUES
      ('Bagno'::text, 'solo bagno'::text, 45, 2000, 10),
      ('Taglio'::text, 'include il bagno'::text, 90, 3000, 20)
  ) AS seed(name, description, duration_minutes, price_cents, display_order)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.services existing
    WHERE existing.tenant_id = v_tenant_id
      AND pg_catalog.lower(pg_catalog.btrim(existing.name)) =
          pg_catalog.lower(pg_catalog.btrim(seed.name))
  );
END;
$$;

COMMIT;
