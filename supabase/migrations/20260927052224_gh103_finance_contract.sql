-- GH-103, atto B DOPO il deploy e la verifica dei client staff aggiornati.
-- Fonte: mandato Luigi 27/9/2026. Non eseguire con vecchie schede browser aperte.
BEGIN;
LOCK TABLE public.visits, public.services, public.visit_financials, public.service_financials IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.visits v FULL JOIN public.visit_financials f ON f.visit_id=v.id
   WHERE v.id IS NULL OR f.visit_id IS NULL OR v.cost IS DISTINCT FROM f.cost OR v.discount_percent IS DISTINCT FROM f.discount_percent)
 OR EXISTS (SELECT 1 FROM public.services s FULL JOIN public.service_financials f ON f.service_id=s.id
   WHERE s.id IS NULL OR f.service_id IS NULL OR s.price_cents IS DISTINCT FROM f.price_cents)
 THEN RAISE EXCEPTION 'GH103 contract blocked: finance mismatch'; END IF;
END $$;
DROP TRIGGER gh103_visits_finance ON public.visits;
DROP TRIGGER gh103_services_finance ON public.services;
DROP TRIGGER gh103_visit_financials_legacy ON public.visit_financials;
DROP TRIGGER gh103_service_financials_legacy ON public.service_financials;
DROP FUNCTION public.gh103_finance_bridge();
ALTER TABLE public.visits DROP COLUMN cost, DROP COLUMN discount_percent;
ALTER TABLE public.services DROP COLUMN price_cents;
NOTIFY pgrst, 'reload schema';
COMMIT;
