# Schema Baseline — Grooming Hub (staff-side esistente)

> **Gate 1** della `design_handoff_customer_app/06-procedura-approvazione.md` — ispezione read-only dello schema Supabase in uso dal repo staff, **prima** di qualsiasi migration.

## Metadati progetto ispezionato

| Campo | Valore |
|---|---|
| Nome progetto | `grooming-hub-demo` |
| Ref / ID | `qttpinkslhenxrsbhhhg` |
| Host | `db.qttpinkslhenxrsbhhhg.supabase.co` |
| Region | `eu-north-1` |
| Postgres | 17.6.1.084 |
| Status | ACTIVE_HEALTHY |
| Collegamento repo | `VITE_SUPABASE_URL` in `.env.example` punta qui |
| Data ispezione | 2026-04-24 |

> Altri progetti visibili nell'org `wttcyfrwatmibpkamcxs`: `grooming` (`azgehoseiojodltcttfb`, eu-central-2, ACTIVE) e `nesting-pro` (`xvahvdulmmfvuaozhiqk`, eu-west-1, INACTIVE). **Da decidere con l'autore** quale è il tenant pilota di produzione vs. demo prima di toccare migration reali.

---

## Estensioni installate (schema `public`/`extensions`)

Solo quelle con `installed_version` non nullo:

| Estensione | Schema | Versione | Note |
|---|---|---|---|
| `plpgsql` | `pg_catalog` | 1.0 | default |
| `pgcrypto` | `extensions` | 1.3 | usato per `gen_random_uuid()` |
| `uuid-ossp` | `extensions` | 1.1 | — |
| `pg_stat_statements` | `extensions` | 1.11 | — |
| `pg_graphql` | `graphql` | 1.5.11 | — |
| `supabase_vault` | `vault` | 0.3.1 | — |

Le altre estensioni (postgis, vector, pg_net, pgtap, ecc.) sono disponibili ma **non installate**.

---

## Migration applicate al DB (`supabase_migrations.schema_migrations`)

> **Importante:** il repo non contiene ancora una cartella `supabase/migrations/`. Le migration qui sotto sono state applicate al progetto (probabilmente via dashboard o CLI) ma non risultano versionate nel branch `feat/customer-app`. Da allineare prima di aggiungerne di nuove — cfr. `06-procedura-approvazione.md`.

| Versione | Nome |
|---|---|
| 20260305145000 | `init_schema` |
| 20260306193000 | `storage_client_photos` |
| 20260312101500 | `appointments_and_blacklist` |
| 20260318101500 | `client_qr_cards` |
| 20260408093000 | `public_pet_card_rpc` |
| 20260409103000 | `contacts_inbox` |
| 20260409131500 | `backfill_contacts_from_clients` |
| 20260422110000 | `reward_points` |
| 20260423110000 | `customer_portal_foundation` |
| 20260423123000 | `customer_appointment_requests` |

---

## Schema `public` — 8 tabelle

> Convenzione osservata: **PK `text`** con prefisso (`cli_…`, `appt_…`, `ccl_…`) generato applicativamente; **`profiles.id`** usa invece direttamente `uuid` = `auth.users.id`. Nessuna `tenant_id` presente in nessuna tabella. Nessun enum Postgres custom — i vincoli di dominio sono `text` + `CHECK` constraint.

### `public.profiles` — dati utente e ruolo app-level

- **Scopo:** estende `auth.users` con nome business e ruolo (`operator` | `customer`).
- **RLS:** ✅ abilitata.
- **Rows:** 0 (dev/demo).

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `uuid` | no | — | PK, FK → `auth.users(id)` |
| `business_name` | `text` | sì | — | |
| `created_at` | `timestamptz` | sì | `now()` | |
| `role` | `text` | no | `'operator'` | CHECK: `role IN ('operator','customer')` |

**Indici:** `profiles_pkey (id)`.

**Policy RLS:**
| Policy | Cmd | Condizione |
|---|---|---|
| Users can view their own profile | SELECT | `auth.uid() = id` |
| Users can insert their own profile | INSERT | `with check auth.uid() = id` |
| Users can update their own profile | UPDATE | `auth.uid() = id` (using + with check) |

**Osservazioni per il piano Fase 1:** qui esiste già un ruolo `customer` non multi-tenant. Il design `03-auth-e-rls.md` prevede `tenant_memberships` con enum `tenant_role`. Da decidere: tenere `profiles.role` come "ruolo principale/legacy" e usare `tenant_memberships` come sorgente di verità, oppure rimuoverlo. Nessuna riga oggi → deprecazione praticabile.

---

### `public.clients` — anagrafica pet + padroncino (operatore-owned)

- **Scopo:** nel linguaggio del repo staff, `clients` rappresenta **il pet** con i campi del proprietario in linea (`owner`, `phone`). Non è una tabella di "cliente umano" separata. Chiaramente da confrontare col modello `customer_app` (`pets` + `customers` distinti).
- **RLS:** ✅ abilitata.
- **Rows:** 0.

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `text` | no | — | PK, assegnato client-side (`cli_…`) |
| `user_id` | `uuid` | no | — | FK → `auth.users(id)` — operatore proprietario |
| `name` | `text` | no | — | nome **del pet** |
| `breed` | `text` | sì | — | |
| `owner` | `text` | no | — | nome del padrone (plain text, non FK) |
| `phone` | `text` | sì | — | |
| `notes` | `text` | sì | — | |
| `photo` | `text` | sì | — | URL/path in storage |
| `created_at` | `timestamptz` | sì | `now()` | |
| `updated_at` | `timestamptz` | sì | `now()` | trigger `update_timestamp` |
| `no_show_score` | `int4` | no | `0` | |
| `is_blacklisted` | `bool` | no | `false` | |
| `qr_token` | `text` | no | — | token pubblico scheda pet |

**Indici:**
- `clients_pkey (id)`
- `idx_clients_user_id (user_id)`
- `idx_clients_name (name)`
- `idx_clients_qr_token (qr_token)` UNIQUE
- `idx_clients_blacklist (is_blacklisted, no_show_score)`

**FK in ingresso:** `visits.client_id`, `appointments.client_id`, `reward_points.client_id`, `customer_client_links.client_id`, `customer_invitations.client_id`, `contacts.linked_client_id`.

**Policy RLS:**
| Policy | Cmd | Condizione |
|---|---|---|
| Users can view their own clients | SELECT | `auth.uid() = user_id` |
| Users can insert their own clients | INSERT | `with check auth.uid() = user_id` |
| Users can update their own clients | UPDATE | `auth.uid() = user_id` |
| Users can delete their own clients | DELETE | `auth.uid() = user_id` |
| Customers can view linked clients | SELECT | `EXISTS (customer_client_links WHERE client_id = clients.id AND customer_user_id = auth.uid())` |

**Osservazione chiave:** `clients` **mescola pet + proprietario** in una sola riga. Il design `02-database.md` presuppone `pets` distinto da `customers`. Decisione architetturale da prendere con l'autore **prima** di migration:
- (A) mantenere `clients` come "pet" e aggiungere `owner_customer_id uuid references customers(id) nullable` — riconciliazione via `customer_client_links`;
- (B) scorporare: creare `pets` nuova, migrare dati, deprecare `clients`;
- (C) rinominare `clients` → `pets` con alias/view di backward-compat.

---

### `public.appointments` — prenotazioni operatore + richieste customer

- **Scopo:** agenda appuntamenti. Già predisposta per richieste customer via `appointment_source` + `approval_status`.
- **RLS:** ✅ abilitata.
- **Rows:** 0.

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `text` | no | — | PK |
| `user_id` | `uuid` | no | — | FK → `auth.users(id)` — operatore titolare |
| `client_id` | `text` | no | — | FK → `clients(id)` |
| `scheduled_at` | `timestamptz` | no | — | |
| `duration_minutes` | `int4` | no | `60` | CHECK: `> 0 AND <= 480` |
| `status` | `text` | no | `'scheduled'` | CHECK: `IN ('scheduled','completed','cancelled','no_show')` |
| `notes` | `text` | sì | — | |
| `external_calendar` | `text` | sì | — | CHECK: `IS NULL OR IN ('google','icloud')` |
| `created_at` | `timestamptz` | sì | `now()` | |
| `updated_at` | `timestamptz` | sì | `now()` | trigger `update_timestamp` |
| `appointment_source` | `text` | no | `'operator'` | CHECK: `IN ('operator','customer')` |
| `approval_status` | `text` | no | `'approved'` | CHECK: `IN ('pending','approved','rejected')` |
| `requested_by_customer_id` | `uuid` | sì | — | FK → `auth.users(id)` |

**Indici:**
- `appointments_pkey (id)`
- `idx_appointments_user_id`, `idx_appointments_client_id`, `idx_appointments_scheduled_at`
- `idx_appointments_appointment_source`, `idx_appointments_approval_status`, `idx_appointments_requested_by_customer`

**Policy RLS:**
| Policy | Cmd | Condizione |
|---|---|---|
| Users can view their own appointments | SELECT | `auth.uid() = user_id` |
| Users can insert their own appointments | INSERT | `with check auth.uid() = user_id` |
| Users can update their own appointments | UPDATE | `auth.uid() = user_id` |
| Users can delete their own appointments | DELETE | `auth.uid() = user_id` |
| Customers can view linked appointments | SELECT | `EXISTS(customer_client_links WHERE client_id = appointments.client_id AND customer_user_id = auth.uid())` |
| Customers can request linked appointments | INSERT | `source='customer' AND approval_status='pending' AND status='scheduled' AND requested_by_customer_id = auth.uid() AND EXISTS(link ccl.client_id=... AND ccl.customer_user_id=auth.uid() AND ccl.operator_user_id = appointments.user_id)` |

**Osservazione per Fase 1:** lo schema `customer_app` parla di `status IN ('pending','confirmed')` per le prenotazioni; qui la **macchina di stato** è già `scheduled/completed/cancelled/no_show` + `approval_status` separato. Da riconciliare: si usa `approval_status=pending` per le richieste customer non ancora confermate. **Da confermare con l'autore** se resta questa convenzione o se lo stato prenotazione customer diventa un enum unico.

---

### `public.visits` — storico visite completate

- **Scopo:** log delle visite avvenute, con costo e trattamenti.
- **RLS:** ✅ abilitata.
- **Rows:** 0.

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `text` | no | — | PK |
| `client_id` | `text` | no | — | FK → `clients(id)` |
| `date` | `date` | no | — | |
| `treatments` | `text` | sì | — | |
| `issues` | `text` | sì | — | |
| `cost` | `numeric` | no | — | |
| `discount_percent` | `numeric` | sì | `0` | |
| `created_at` | `timestamptz` | sì | `now()` | |
| `updated_at` | `timestamptz` | sì | `now()` | trigger `update_timestamp` |

**Indici:** `visits_pkey`, `idx_visits_client_id`, `idx_visits_date (date DESC)`.

**Policy RLS** (autorizzazione mediata via `clients.user_id`):
| Policy | Cmd | Condizione |
|---|---|---|
| Users can view visits of their clients | SELECT | `EXISTS(clients WHERE clients.id = visits.client_id AND clients.user_id = auth.uid())` |
| Users can insert visits to their clients | INSERT | idem `with check` |
| Users can update visits of their clients | UPDATE | idem |
| Users can delete visits of their clients | DELETE | idem |
| Customers can view visits of linked clients | SELECT | via `customer_client_links` |

**Osservazione:** `visits` **non ha `user_id` proprio** — l'autorizzazione è sempre attraverso `clients`. Pattern coerente, da replicare quando si aggiungerà `tenant_id`.

---

### `public.contacts` — inbox "richieste / lead" lato operatore

- **Scopo:** lead/contatti pre-cliente (da WhatsApp, QR, manuali). Convertiti in `clients` via `linked_client_id`.
- **RLS:** ✅ abilitata.
- **Rows:** 0.

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `text` | no | — | PK |
| `user_id` | `uuid` | no | — | FK → `auth.users(id)` |
| `pet_name` | `text` | no | — | |
| `owner_name` | `text` | sì | — | |
| `phone` | `text` | sì | — | |
| `source` | `text` | no | `'manual'` | CHECK: `IN ('manual','whatsapp','qr')` |
| `status` | `text` | no | `'new'` | CHECK: `IN ('new','contacted','converted','archived')` |
| `notes` | `text` | sì | — | |
| `linked_client_id` | `text` | sì | — | FK → `clients(id)` |
| `created_at` / `updated_at` | `timestamptz` | sì | `now()` | trigger `update_timestamp` |

**Indici:** `contacts_pkey`, `idx_contacts_user_id`, `idx_contacts_status`, `idx_contacts_linked_client_id`, `idx_contacts_created_at (created_at DESC)`.

**Policy RLS:** classiche `auth.uid() = user_id` su SELECT/INSERT/UPDATE/DELETE. **Nessuna policy customer-side.**

---

### `public.reward_points` — fedeltà a punti

- **Scopo:** crediti punti per cliente. Fuori scope Fase 1 ma va mantenuto intatto.
- **RLS:** ✅ abilitata.
- **Rows:** 0.

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `text` | no | — | PK |
| `user_id` | `uuid` | no | — | FK → `auth.users(id)` — operatore |
| `client_id` | `text` | no | — | FK → `clients(id)` |
| `points` | `int4` | no | — | CHECK: `<> 0` |
| `reason` | `text` | no | `'manual'` | CHECK: `IN ('visit','manual','promotion','redeem','correction')` |
| `note` | `text` | sì | — | |
| `created_at` | `timestamptz` | sì | `now()` | |

**Indici:** `reward_points_pkey`, `idx_reward_points_user_id`, `idx_reward_points_client_id`, `idx_reward_points_created_at (DESC)`.

**Policy RLS:**
| Policy | Cmd | Condizione |
|---|---|---|
| Users can view their own reward points | SELECT | `auth.uid() = user_id` |
| Users can insert their own reward points | INSERT | `auth.uid() = user_id AND EXISTS(clients WHERE clients.id = reward_points.client_id AND clients.user_id = auth.uid())` |
| Users can delete their own reward points | DELETE | `auth.uid() = user_id` |
| Customers can view linked reward points | SELECT | via `customer_client_links` |

---

### `public.customer_client_links` — mappatura customer ↔ pet (già esistente!)

- **Scopo:** collega un account Supabase customer (`customer_user_id`) a una riga `clients` di un dato operatore. **Già in uso come surrogato del join customer ↔ pet.**
- **RLS:** ✅ abilitata.
- **Rows:** 0.

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `text` | no | — | PK (`ccl_…`) |
| `operator_user_id` | `uuid` | no | — | FK → `auth.users(id)` |
| `customer_user_id` | `uuid` | no | — | FK → `auth.users(id)` |
| `client_id` | `text` | no | — | FK → `clients(id)` |
| `created_at` | `timestamptz` | sì | `now()` | |

**Constraint:** UNIQUE `(customer_user_id, client_id)`.

**Indici:** `customer_client_links_pkey`, UNIQUE `(customer_user_id, client_id)`, `idx_customer_client_links_client`, `idx_customer_client_links_customer`, `idx_customer_client_links_operator`.

**Policy RLS:**
| Policy | Cmd | Condizione |
|---|---|---|
| Operators and customers can view client links | SELECT | `auth.uid() = operator_user_id OR auth.uid() = customer_user_id` |
| Operators can create client links | INSERT | `auth.uid() = operator_user_id AND EXISTS(clients c WHERE c.id = client_id AND c.user_id = auth.uid())` |
| Operators and customers can remove client links | DELETE | `auth.uid() = operator_user_id OR auth.uid() = customer_user_id` |

**Osservazione:** copre il caso "un customer vede i propri pet presso un operatore". Non è un sostituto di `tenant_memberships` (quello veicola il ruolo nel tenant). Possono convivere: `tenant_memberships` = ruolo, `customer_client_links` = appartenenza pet. Da chiarire in Fase 1.

---

### `public.customer_invitations` — token d'invito operatore → customer

- **Scopo:** token one-shot che un customer usa per linkarsi al pet di un operatore; consumato da RPC `accept_customer_invite`.
- **RLS:** ✅ abilitata.
- **Rows:** 0.

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | `text` | no | — | PK |
| `token` | `text` | no | — | UNIQUE, usato nel link d'invito |
| `operator_user_id` | `uuid` | no | — | FK → `auth.users(id)` |
| `client_id` | `text` | no | — | FK → `clients(id)` |
| `customer_email` | `text` | sì | — | |
| `accepted_by` | `uuid` | sì | — | FK → `auth.users(id)` |
| `accepted_at` | `timestamptz` | sì | — | |
| `expires_at` | `timestamptz` | sì | `now() + interval '30 days'` | |
| `created_at` | `timestamptz` | sì | `now()` | |

**Indici:** `customer_invitations_pkey`, UNIQUE `token`, `idx_customer_invitations_client`, `idx_customer_invitations_operator`, `idx_customer_invitations_token`.

**Policy RLS:**
| Policy | Cmd | Condizione |
|---|---|---|
| Operators can view their customer invitations | SELECT | `auth.uid() = operator_user_id` |
| Operators can create customer invitations | INSERT | `auth.uid() = operator_user_id AND EXISTS(clients ...)` |
| Operators can delete their customer invitations | DELETE | `auth.uid() = operator_user_id` |

**Osservazione:** l'ispezione di un invito lato customer avviene solo via RPC `accept_customer_invite` (SECURITY DEFINER). Nessuna SELECT customer-side.

---

## Enum custom (tipo `pg_enum`)

**Nessuno.** Tutti i "ruoli/stati" sono `text` con `CHECK` constraint. Se si introdurrà `tenant_role` come da `02-database.md`, sarà il primo enum nativo.

---

## Funzioni `public`

| Nome | Firma | Security | Scopo |
|---|---|---|---|
| `update_timestamp()` | `trigger` | invoker | aggiorna `NEW.updated_at = NOW()`; usato dai trigger `BEFORE UPDATE` su `appointments`, `clients`, `contacts`, `visits`. |
| `accept_customer_invite(p_token text)` | returns `jsonb` | **definer** | consuma un invito: upsert `profiles(role='customer')`, crea `customer_client_links`, marca invito accettato. Solleva eccezione se: utente non loggato, invito assente/scaduto, profilo già `operator`. |
| `get_public_pet_card(p_qr_token text)` | returns `jsonb` | **definer** | endpoint pubblico della scheda pet via QR: legge `clients` + conta `visits` a 12/24/36 mesi + somma `reward_points`, deriva tier fedeltà. Non richiede auth. |

Entrambe le RPC definer impostano `search_path` esplicito (`'public'`, o `'public','auth'`).

## Trigger

| Schema | Tabella | Trigger | Quando | Funzione |
|---|---|---|---|---|
| public | appointments | `update_appointments_timestamp` | BEFORE UPDATE | `update_timestamp()` |
| public | clients | `update_clients_timestamp` | BEFORE UPDATE | `update_timestamp()` |
| public | contacts | `update_contacts_timestamp` | BEFORE UPDATE | `update_timestamp()` |
| public | visits | `update_visits_timestamp` | BEFORE UPDATE | `update_timestamp()` |
| storage | buckets | `enforce_bucket_name_length_trigger`, `protect_buckets_delete` | (Supabase system) | — |
| storage | objects | `protect_objects_delete`, `update_objects_updated_at` | (Supabase system) | — |

**Nessun trigger `on auth.users insert`** per creare automaticamente `profiles` (il design `02-database.md` lo prevede — è una mancanza da colmare).

---

## Storage

### Bucket

| Id | Public | Size limit | MIME consentiti |
|---|---|---|---|
| `client-photos` | ✅ true | 5 MiB | image/jpeg, image/png, image/webp, image/gif |

Nessun bucket `pet-avatars` (previsto da `04-schermate.md` §04.2 per le foto pet). Oggi le foto pet risiedono in `client-photos` → da riconciliare.

### Policy `storage.objects` per bucket `client-photos`

| Policy | Cmd | Condizione |
|---|---|---|
| Public can view client photos | SELECT | `bucket_id = 'client-photos'` |
| Authenticated users can upload own client photos | INSERT | `bucket_id = 'client-photos' AND storage.foldername(name)[1] = auth.uid()::text` |
| Authenticated users can update own client photos | UPDATE | idem |
| Authenticated users can delete own client photos | DELETE | idem |

Path convention: `<auth.uid()>/<file>` dove `auth.uid()` è l'**operatore**. Quindi oggi le foto sono "di proprietà" dell'operatore, non del customer. Per il piano Fase 1 serve pensare: il customer carica la foto del pet → chi è il proprietario storage? Probabilmente resta l'operatore per retro-compat, oppure `<tenant_id>/<pet_id>.ext` (design 04) con RLS via `customers`/`tenant_memberships`.

---

## Sintesi diff vs. piano `02-database.md`

### Presenti già, ma da "multi-tenantizzare"
- `profiles`, `clients`, `visits`, `appointments`, `contacts`, `reward_points`, `customer_client_links`, `customer_invitations` → **nessuna** ha `tenant_id`. Passo 1 (migration a due step) si applica a **tutte** (tranne `profiles` che per design è per-utente).

### Mancano completamente (da Passo 2)
- `tenants` (+ seed pilota)
- `tenant_memberships` + enum `tenant_role` (`owner`/`staff`/`customer`)
- `customers` (dati customer per-tenant; oggi il ruolo `customer` vive su `profiles.role` + `customer_client_links`)
- `promotions`
- Helper SQL `has_tenant_access(...)` / `current_tenant_ids_for_role(...)`
- Trigger auto-create `profiles` su `auth.users insert`
- `services` (non nominato nel `02-database.md` ma richiesto dal booking in `04-schermate.md` §04.3 — **da aggiungere al piano**)
- RPC `available_slots(tenant_id, service_id, date)` e `book_appointment(...)` (Gate 5)
- Bucket `pet-avatars` + relative policy (se si sceglie di scorporarlo da `client-photos`)

### Overlap da chiarire prima delle migration
1. **`clients` = pet + padrone in unica riga.** Decidere mappatura vs. `pets` + `customers` del design.
2. **`profiles.role`** (`operator`/`customer`) vs. **`tenant_memberships.role`** (`owner`/`staff`/`customer`). Il primo è monovalore non-multi-tenant; il secondo è il target. Proposta: quando c'è `tenant_memberships`, `profiles.role` diventa fallback/legacy o si rimuove.
3. **Macchina di stato appuntamento**: coesistenza `status` + `approval_status` vs. stato singolo `pending|confirmed` del design. Mantenere il doppio attributo è più espressivo — confermare.
4. **`customer_client_links`** esiste già e svolge il lavoro "quale customer possiede quale pet". Se si aggiunge `customers(tenant_id, user_id)` come riga per-tenant, il link diventa ridondante o va reinterpretato (es. `customer_id` anziché `customer_user_id` + `operator_user_id`). Decidere.
5. **Convenzione PK**: oggi `text` con prefisso client-side. Le tabelle nuove del design usano `uuid primary key default gen_random_uuid()`. Scegliere se uniformare (tutto `uuid`) o mantenere `text` per coerenza col legacy.
6. **Migration non versionate nel repo**: prima di aggiungerne di nuove, decidere se ricreare la cartella `supabase/migrations/` esportando lo stato corrente (`supabase db pull` su un branch dev), oppure partire dalle nuove migration assumendo il baseline come "già applicato in produzione".

---

## Prossimo passo proposto (attende OK esplicito)

Non vengono scritte migration né codice finché l'autore non approva:
- scelte su punti 1–6 qui sopra;
- **ambiente di staging** su cui le migration verranno eventualmente applicate (branch Supabase dedicato vs. progetto `grooming` vs. nuovo);
- formato e convenzione di naming delle migration SQL da committare in `supabase/migrations/`.

Solo dopo l'OK, procedere a Gate 2 (`02-database.md` §Passo 1, strategia `tenant_id` in due step) con file SQL committati nel repo **senza applicarli**.
