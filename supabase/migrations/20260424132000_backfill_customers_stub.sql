-- ============================================================================
-- Gate 2 · Fase D — Backfill `customers` (stub documentale)
-- ----------------------------------------------------------------------------
-- Segnaposto richiesto dal piano: oggi `clients` è vuoto e non esistono righe
-- legacy da portare in `customers`. In futuro — quando il tenant pilota
-- avrà ricevuto dati reali e si deciderà come replicare i padroncini esistenti
-- come righe `customers` — questa migration verrà sostituita da uno script
-- che, per ogni pet orfano, crea un record `customers` da `clients.owner` +
-- `clients.phone` e popola `pets.customer_id`.
--
-- Esempio (non attivo):
--   INSERT INTO public.customers (tenant_id, user_id, full_name, phone)
--   SELECT DISTINCT p.tenant_id, auth_shadow_user(p.owner_user_id), ...
--   ...
--
-- Per ora: niente DDL, niente DML. NO-OP voluto.
-- ============================================================================

-- NO-OP intentional.
SELECT 1 WHERE false;
