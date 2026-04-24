-- ============================================================================
-- Gate 2 · Fase D · indici composti `tenant_id`-first
-- ----------------------------------------------------------------------------
-- Ogni query customer/staff parte da `tenant_id = :current`. `tenant_id`
-- è prima colonna degli indici composti quando c'è una seconda colonna ad
-- alta cardinalità. Per `customers`/`pets` l'indice semplice su tenant_id è
-- già stato creato nelle rispettive migration.
-- ============================================================================

BEGIN;

-- Appointments: tenant + calendario (dashboard staff, next appointment customer)
CREATE INDEX IF NOT EXISTS appointments_tenant_scheduled_idx
  ON public.appointments (tenant_id, scheduled_at);

-- Appointments: tenant + status (filtro scheduled/completed/cancelled)
CREATE INDEX IF NOT EXISTS appointments_tenant_status_idx
  ON public.appointments (tenant_id, status);

-- Appointments: tenant + approval_status (inbox richieste customer)
CREATE INDEX IF NOT EXISTS appointments_tenant_approval_idx
  ON public.appointments (tenant_id, approval_status);

-- Visits: tenant + data (storico pet/tenant)
CREATE INDEX IF NOT EXISTS visits_tenant_date_idx
  ON public.visits (tenant_id, date DESC);

-- Contacts: tenant + status (inbox richieste)
CREATE INDEX IF NOT EXISTS contacts_tenant_status_idx
  ON public.contacts (tenant_id, status);

-- Reward points: tenant + pet (aggregato per pet)
CREATE INDEX IF NOT EXISTS reward_points_tenant_pet_idx
  ON public.reward_points (tenant_id, pet_id);

-- Customer invitations: tenant + expires (cleanup)
CREATE INDEX IF NOT EXISTS customer_invitations_tenant_expires_idx
  ON public.customer_invitations (tenant_id, expires_at);

-- Pets: tenant + customer (dashboard utente, lista pet del customer)
CREATE INDEX IF NOT EXISTS pets_tenant_customer_idx
  ON public.pets (tenant_id, customer_id);

-- Customers: tenant + user (lookup customer corrente)
CREATE INDEX IF NOT EXISTS customers_tenant_user_idx
  ON public.customers (tenant_id, user_id);

COMMIT;
