# 03 · Auth & RLS

## Un solo pool Supabase Auth

Staff e customer condividono `auth.users`. Il ruolo è determinato da `tenant_memberships`, non da metadati JWT hardcoded.

### Regole d'accesso

- `/u/*` accessibile a un utente se esiste una riga `tenant_memberships(user_id = auth.uid(), tenant_id = :current, role = 'customer')`
- `/dashboard` (staff) accessibile se esiste `role in ('owner', 'staff')`
- Un utente può avere **entrambi i ruoli** nello stesso tenant (l'owner del salone è anche cliente dei servizi? caso raro ma possibile) o in tenant diversi (staff del salone A, customer del salone B).

### Flusso

**Login:**
1. `supabase.auth.signInWithPassword({ email, password })`
2. Fetch `tenant_memberships` dell'utente per il `tenantId` corrente (risolto da `TenantProvider`)
3. Redirect:
   - ha `customer` → `/u/home`
   - ha `staff` o `owner` → `/dashboard`
   - ha entrambi → UI di scelta contesto (semplice: "Entra come cliente" / "Entra come staff"), ultima scelta in `localStorage`
   - nessun ruolo per il tenant corrente → errore "Non hai accesso a questo salone"

**Register (customer):**
1. Form in `/u/register` (o `/register?role=customer`)
2. `supabase.auth.signUp({ email, password, options: { data: { full_name, phone } }})`
3. Trigger DB crea `profiles`
4. Server-side (Edge Function o RPC) crea `tenant_memberships` con `role='customer'` per il tenant corrente e `customers` row
5. Email di verifica standard Supabase
6. Dopo verifica: login automatico → `/u/home`

Niente registrazione self-service staff in Fase 1 — gli staff vengono creati dall'owner via invito (fuori scope).

**Forgot password:**
`supabase.auth.resetPasswordForEmail(email, { redirectTo: '<url>/reset' })` — template email standard Supabase per ora, customizzazione in Fase 2.

### `AuthProvider` condiviso

`src/shared/auth/AuthProvider.tsx` espone via context:
```ts
{
  session: Session | null,
  user: User | null,
  loading: boolean,
  memberships: TenantMembership[],  // tutte le membership dell'utente
  currentRole: 'owner' | 'staff' | 'customer' | null, // nel tenant corrente
  signOut: () => Promise<void>,
}
```

`useRequireCustomer()` hook: se `currentRole !== 'customer'`, redirect a login o a `/dashboard`.

---

## Row-Level Security

**Regola madre:** ogni tabella di dominio ha RLS **abilitata**. Nessuna query passa senza una policy esplicita che matcha. Deny by default.

### Helper functions

Creare una funzione SQL helper per la comodità delle policy:
```sql
create or replace function current_tenant_ids_for_role(required_role tenant_role)
returns setof uuid
language sql stable security definer
as $$
  select tenant_id from tenant_memberships
  where user_id = auth.uid() and role = required_role;
$$;
```

Oppure più semplice, se preferito:
```sql
create or replace function has_tenant_access(t uuid, required_role tenant_role)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from tenant_memberships
    where user_id = auth.uid() and tenant_id = t and role = required_role
  );
$$;
```

### Policy pattern

Per ogni tabella con `tenant_id`, almeno due policy: una per staff, una per customer. Esempi.

**`pets`** (staff vede tutti i pet del tenant, customer vede solo i propri):
```sql
alter table pets enable row level security;

create policy pets_staff_all on pets
  for all using (
    has_tenant_access(tenant_id, 'staff') or has_tenant_access(tenant_id, 'owner')
  );

create policy pets_customer_own on pets
  for select using (
    has_tenant_access(tenant_id, 'customer')
    and owner_id in (select id from customers where user_id = auth.uid() and tenant_id = pets.tenant_id)
  );

create policy pets_customer_insert on pets
  for insert with check (
    has_tenant_access(tenant_id, 'customer')
    and owner_id in (select id from customers where user_id = auth.uid() and tenant_id = pets.tenant_id)
  );

create policy pets_customer_update on pets
  for update using (
    has_tenant_access(tenant_id, 'customer')
    and owner_id in (select id from customers where user_id = auth.uid() and tenant_id = pets.tenant_id)
  );
```

(`owner_id` qui suppone che nel DB staff esista una FK dai pet a una tabella `customers` o equivalente — da allineare dopo l'ispezione.)

**`appointments`:** stessa logica, il customer vede i propri.

**`promotions`:** customer può SELECT dove `is_active = true` e tenant membership = customer; staff può tutto.

**`customers`:** il customer vede solo la propria riga; lo staff del tenant le vede tutte.

**`tenant_memberships`:** ciascuno vede solo le proprie; lo staff/owner del tenant vede anche quelle degli altri membri del proprio tenant.

**`profiles`:** SELECT pubblico ristretto (solo i campi necessari: full_name, avatar) se servisse visualizzare nomi staff, ma sicuri che sia voluto; UPDATE solo `auth.uid() = user_id`.

### Test RLS

Almeno **un test manuale** documentato in `supabase/docs/rls-tests.md`:
1. Utente A (customer tenant-1) → SELECT appointments: vede solo i suoi, 0 quelli di B
2. Utente A → SELECT appointments forzando `tenant_id = tenant-2`: 0 righe
3. Staff tenant-1 → vede tutti gli appointments del tenant-1, 0 quelli del tenant-2

Scrivere anche **un test automatizzato** (pgtap o uno script JS che logga in come utenti diversi e conta le righe). In Fase 1 basta lo script JS se pgtap non è già in uso.

---

## Output atteso

Un file `<timestamp>_rls_<tabella>.sql` per tabella, da mostrare insieme alla migration che crea/modifica la tabella. Approvazione una per volta.
