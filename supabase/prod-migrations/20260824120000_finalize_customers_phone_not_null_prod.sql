-- GH-11 · Finalizzazione telefono customer per produzione.
-- Fonte: docs/incarichi/GH-11-prova-generale-migrazione.md, Fase 2.
-- Applicare solo dopo che ogni caso manuale senza telefono e stato risolto
-- con un valore reale e normalizzato. Non inventa placeholder e fallisce in
-- modo atomico se resta anche una sola riga incompleta.

BEGIN;

DO $$
DECLARE
  v_missing integer;
BEGIN
  SELECT count(*)
  INTO v_missing
  FROM public.customers
  WHERE phone IS NULL OR btrim(phone) = '';

  IF v_missing > 0 THEN
    RAISE EXCEPTION
      'Finalizzazione bloccata: % customers senza telefono reale.',
      v_missing;
  END IF;
END $$;

ALTER TABLE public.customers
  ALTER COLUMN phone SET NOT NULL;

COMMIT;
