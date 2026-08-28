-- ============================================================================
-- Gate 2 · Fase E — RLS `pets`
-- ----------------------------------------------------------------------------
-- Staff/owner del tenant: ALL.
-- Customer: SELECT + UPDATE sui propri pet (via customers.user_id).
-- Customer: **nessun INSERT** (decisione acquisita: no self-service pet in
-- Fase 1; il pet lo crea lo staff).
-- ============================================================================

BEGIN;

-- Rimuove policy legacy da M11
DROP POLICY IF EXISTS pets_staff_legacy ON public.pets;

-- Staff/owner: accesso completo
CREATE POLICY pets_staff_all
  ON public.pets FOR ALL
  USING (public.has_tenant_any_staff_access(tenant_id))
  WITH CHECK (public.has_tenant_any_staff_access(tenant_id));

-- Customer: vede i pet legati alla propria riga `customers` per questo tenant.
-- Double-filter `c.tenant_id = pets.tenant_id` ridondante (l'unicità di pets.id
-- lo implica già), mantenuto come difesa in profondità contro anomalie dati
-- o modifiche future dello schema.
CREATE POLICY pets_customer_select
  ON public.pets FOR SELECT
  USING (
    public.has_tenant_access(tenant_id, 'customer')
    AND customer_id IN (
      SELECT id FROM public.customers
      WHERE user_id = auth.uid() AND tenant_id = pets.tenant_id
    )
  );

-- Il customer ha UPDATE completo a livello colonna su `pets`. La limitazione
-- ai campi writable (`owner_notes`, `coat_preferences`, `photo_url`) è
-- enforced dalla UI, non dal DB. Rivalutare con trigger BEFORE UPDATE se
-- emergono requisiti di audit o compliance che impongano l'enforcement
-- server-side.
CREATE POLICY pets_customer_update
  ON public.pets FOR UPDATE
  USING (
    public.has_tenant_access(tenant_id, 'customer')
    AND customer_id IN (
      SELECT id FROM public.customers
      WHERE user_id = auth.uid() AND tenant_id = pets.tenant_id
    )
  )
  WITH CHECK (
    public.has_tenant_access(tenant_id, 'customer')
    AND customer_id IN (
      SELECT id FROM public.customers
      WHERE user_id = auth.uid() AND tenant_id = pets.tenant_id
    )
  );

-- Intenzionalmente: nessuna policy INSERT customer-side (decisione di
-- prodotto: no self-service pet in Fase 1). Nessuna policy DELETE customer
-- (il pet resta in carico allo staff per l'intero ciclo di vita).

COMMIT;
