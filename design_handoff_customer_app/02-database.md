# 02 · Database

## Passo 0 — Ispezione dello schema esistente

**Prima di qualunque migration**, produrre un **export leggibile** dello schema staff attuale. Output atteso:

1. Elenco tabelle dello schema `public` con:
   - nome tabella, commento/scopo desunto
   - colonne (nome, tipo, nullable, default)
   - PK e FK
   - indici esistenti
   - RLS attive: sì/no, policy presenti
2. Elenco enums custom
3. Elenco funzioni/trigger
4. Estensioni installate (`uuid-ossp`, `pgcrypto`, ecc.)

Salvare in `supabase/docs/schema-baseline.md` sulla branch. **Mostrare all'autore prima di proporre migration.**

Questo è l'input che decide le migration successive. Non tirare a indovinare i nomi delle tabelle: leggerli davvero.

---

## Passo 1 — Migration sullo schema esistente: aggiunta `tenant_id`

**Obiettivo:** ogni tabella di dominio (appuntamenti, clienti staff-side, pet, servizi, categorie servizi, ecc.) deve avere `tenant_id uuid NOT NULL REFERENCES tenants(id)`.

**Strategia in due step** — obbligatoria, per non rompere il tenant pilota in produzione:

### 1a. Prima migration — aggiungi nullable + popola
```sql
-- pseudocodice, da adattare al vero schema dopo l'ispezione
alter table appointments add column tenant_id uuid references tenants(id);
update appointments set tenant_id = '<tenant-pilota-uuid>' where tenant_id is null;
-- ripetere per ogni tabella di dominio
```

### 1b. Seconda migration — enforce NOT NULL
```sql
alter table appointments alter column tenant_id set not null;
-- ripetere
```

Le due migration vanno applicate in **finestre separate**, con verifica manuale tra l'una e l'altra. In dev possono essere consecutive, in produzione no.

**Indici:** su ogni `tenant_id` va aggiunto un indice. Composto con la PK o con colonne ad alta cardinalità quando rilevante:
```sql
create index on appointments (tenant_id, scheduled_at);
create index on pets (tenant_id, owner_id);
```

---

## Passo 2 — Nuove tabelle Fase 1

Schema proposto. Adattare i tipi al resto del DB (es. se si usa `bigint` come PK altrove, coerenza).

### `tenants` — radice del multi-tenant
```sql
create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                    -- es. "salone-pilota", usato per sottodominio futuro
  name text not null,
  timezone text not null default 'Europe/Rome',
  locale text not null default 'it-IT',
  created_at timestamptz not null default now(),
  settings jsonb not null default '{}'::jsonb   -- branding, orari, regole prenotazione
);
```

**Seed:** inserire il tenant pilota con uno `slug` scelto dall'autore. È l'UUID usato nella migration 1a.

### `tenant_memberships` — utente ↔ tenant ↔ ruolo
```sql
create type tenant_role as enum ('owner', 'staff', 'customer');

create table tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role tenant_role not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id, role)             -- un utente può avere più ruoli nello stesso tenant
);

create index on tenant_memberships (user_id);
create index on tenant_memberships (tenant_id, role);
```

Un utente può esistere in più tenant con ruoli diversi (es. `staff` del tenant A, `customer` del tenant B). Gestito dalla UNIQUE composta.

### `profiles` — dati comuni a tutti gli utenti
```sql
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  locale text default 'it-IT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Trigger `on auth.users insert` per creare automaticamente una riga `profiles` vuota — pattern standard Supabase.

### `customers` — dati customer-specifici (per tenant)
```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  marketing_opt_in boolean not null default false,
  notes text,                                   -- note private visibili allo staff
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index on customers (tenant_id);
```

**Relazione col mondo staff:** se nel DB staff esiste già una tabella tipo `clients` (con nome/telefono/ecc. inseriti a mano dallo staff), valutare insieme all'autore **se unificare** `clients` ↔ `customers` o tenere separate. Proposta default: `customers.id` va aggiunto come FK opzionale su `clients` (`clients.customer_id`), così un cliente inserito a mano dallo staff può essere "riconciliato" quando il proprietario si registra. Proporre e farsi approvare.

### `promotions` — promozioni sola lettura in Fase 1
```sql
create table promotions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  body text,
  image_url text,
  valid_from timestamptz,
  valid_to timestamptz,
  cta_label text,
  cta_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index on promotions (tenant_id, is_active, display_order);
```

### `staff_roles` — (opzionale, se serve granularità)
Se il repo staff ha già un suo sistema di ruoli staff (admin/groomer/receptionist), **non duplicarlo**. Si può:
- mantenere quella tabella e aggiungere `tenant_id`
- far convivere `staff_roles` (granulare) con `tenant_memberships` (coarse: è staff di questo tenant sì/no)

Decisione: **ispezionare prima**, proporre poi.

---

## Passo 3 — Indici e performance

Ogni query customer parte da `tenant_id = :current_tenant`. Quindi:
- `tenant_id` come **prima colonna** di ogni indice composto
- indici di copertura per le query di dashboard (next appointment by user, active promotions, ecc.) — proporre dopo aver scritto le query, non prima

---

## Passo 4 — Seed per dev

`supabase/seed.sql` deve creare:
- 1 tenant pilota (`slug: "salone-demo"`, o altro)
- 3 utenti finti (2 customer, 1 staff)
- 2 pet per customer
- 3–5 appuntamenti distribuiti (passati, oggi, futuri)
- 2–3 promozioni attive

Il seed è per sviluppo. **Mai toccare la produzione del tenant pilota reale.**

---

## Output atteso prima di scrivere codice

1. `supabase/docs/schema-baseline.md` (passo 0)
2. `supabase/migrations/<timestamp>_add_tenant_id_nullable.sql` (passo 1a)
3. `supabase/migrations/<timestamp>_add_tenant_id_enforce.sql` (passo 1b)
4. `supabase/migrations/<timestamp>_create_tenants_and_memberships.sql`
5. `supabase/migrations/<timestamp>_create_profiles.sql`
6. `supabase/migrations/<timestamp>_create_customers.sql`
7. `supabase/migrations/<timestamp>_create_promotions.sql`
8. RLS — vedi `03-auth-e-rls.md`, file separato ma da approvare insieme alla migration corrispondente

Ogni file in pull con l'autore **una alla volta**, in quest'ordine. Nessuna va applicata al DB di produzione prima dell'OK finale.
