-- GH-103, dopo deploy dei redirect legacy e prova del wizard /u/book.
-- Fonte: mandato Luigi 27/9/2026, punto 5 e autorizzazione dismissione /portal.
BEGIN;
DROP POLICY appointments_customer_request_insert ON public.appointments;
DROP POLICY appointments_customer_request_update ON public.appointments;
COMMIT;
