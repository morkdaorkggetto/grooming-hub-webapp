# Migration Plan — Gate 2 (customer app, Fase 1)

> **Stato:** file SQL completi scritti in `supabase/migrations/` — **nessuna
> migration è stata applicata al DB**. Pronti per review file per file.
>
> **Ambiente target review:** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`).
> Produzione (`grooming` / `azgehoseiojodltcttfb`) **non toccata** fino al
> merge finale approvato.

---

## Decisioni acquisite

| # | Decisione |
|---|---|
| 1 | Staging: `grooming-hub-demo`. Prod (`grooming`) intoccata. |
| 2 | Pull retrospettivo via `supabase db dump` (Docker), lo stato catturato è nel repo come **9 stub + 1 consolidated snapshot** con timestamp uguali alle 10 entry di `supabase_migrations.schema_migrations`. |
| 3 | Split `clients` → `customers` + `pets` come **transazione atomica unica** (un solo file M11-bis con `BEGIN…COMMIT`). **M11-bis è prod-safe**: include backfill dei dati esistenti via colonna-ponte `pets.legacy_client_id`, dedup su `(owner normalizzato, phone E.164)`, normalizzazione phone, split owner→first/last greedy, mini-seed `tenant_memberships`. La variante `M11-prod` separata pianificata in precedenza è assorbita: M11-bis vale per demo + prod (con eventuali parametri di tuning sui mapping owner→staff in prod). File: `20260424120000_split_clients_with_backfill.sql`. |
| 4 | `customer_client_links` dismesso: FK pet↔customer diretta. |
| 5 | `profiles.role` deprecato soft (commentato, lasciato per back-compat staff); ruolo effettivo su `tenant_memberships.role`. |
| 6 | `status` + `approval_status` su appointments restano **`text` + CHECK**. Enum Postgres rinviato a Fase 2. |
| 7 | PK: `uuid` per tutte le tabelle nuove (`tenants`, `tenant_memberships`, `customers`, `pets`, `services`, `promotions`). Le tabelle pre-esistenti (`visits`, `appointments`, `contacts`, `reward_points`, `customer_invitations`, `profiles`) mantengono `text`/`uuid` originali. |
| 8 | Tenant pilota: `slug='grooming-hub'`, `name='Grooming HUB'`. |
| 9 | Pet insert customer-side: **non consentito** in Fase 1 (policy INSERT customer assente su `pets`). Empty-state lato app customer richiama l'operatore. |
| 10 | `M23 backfill customers`: file stub no-op, tenuto come segnaposto documentale. |
| 11 | Bucket `pet-avatars` **separato** da `client-photos`. Path `<tenant_id>/<pet_id>/<file>`. Write permesso solo al customer proprietario del pet. |
| 12 | **No autocreazione di `customers`** al primo login / signup. Un utente che si registra via `auth.users` NON diventa automaticamente `customers` di alcun tenant. L'unico percorso per diventare customer è `accept_customer_invite(token)` su un invito emesso dallo staff. Razionale: il salone mantiene il controllo sulla customer base; l'invito esplicito preserva la qualità della relazione tenant↔customer. Il trigger `handle_new_auth_user` di M14 crea solo la riga `profiles` (generica per-utente), non la riga `customers` (per-tenant). |
| 13 | **Schema `customers` con anagrafica + account (Modello B)**: `user_id uuid NULL` (un'anagrafica può esistere senza account Supabase associato). `first_name text` (nullable a livello colonna; CHECK forza presenza quando `user_id IS NULL`). `last_name text` opzionale. `email text` nullable, mirror di `auth.users.email` se `user_id` valorizzato. `phone text NOT NULL`, sempre obbligatorio in formato E.164. CHECK: `user_id IS NOT NULL OR first_name IS NOT NULL`. UNIQUE parziale `(tenant_id, user_id) WHERE user_id IS NOT NULL` + UNIQUE pieno `(tenant_id, phone)`. |
| 14 | **Self-registration customer senza invito**: Customer che si registra all'app senza essere già anagrafica di un tenant → stato transitorio "utente senza tenant". Gestione via UI del Gate 3+ (flow di selezione tenant o inserimento codice invito). Non richiede modifiche di schema per Fase 1. |
| 15 | **Normalizzazione phone E.164**: helper `normalize_phone_it(text)` come funzione SQL `IMMUTABLE`. Numeri senza prefisso internazionale assunti italiani (`+39`). Riusato in backfill M11-bis e disponibile per future INSERT/UPDATE su `customers.phone` e `customer_invitations.phone`. Implementazione semplice (regexp + prefissi noti); non sostituisce libphonenumber per scenari internazionali complessi. |
| 16 | **Trigger `sync_customers_email_from_auth`**: AFTER UPDATE OF email su `auth.users` → `UPDATE customers SET email = NEW.email WHERE user_id = NEW.id`. `customers.email` è un mirror denormalizzato; `auth.users.email` resta la fonte di verità. Multi-tenant safe: aggiorna tutte le righe `customers` dell'utente in tutti i tenant. SECURITY DEFINER, search_path pinnato. |
| 17 | **Logica adottiva in `accept_customer_invite`**: cerca `customers (tenant_id, phone) WHERE user_id IS NULL`. Se trovato con `user_id` libero: ADOPT (UPDATE user_id + email). Se trovato ma `user_id` già diverso: RAISE EXCEPTION ("phone già associato ad altro utente in questo tenant"). Se non trovato: INSERT nuovo customer da dati invito. Output JSON arricchito con `adopted: boolean`. |
| 18 | **`customer_invitations` arricchito**: `phone text NOT NULL` (chiave matching), `first_name text NULL` + `last_name text NULL` (per popolare nuovo customer in caso di no-match). `customer_email` esistente preservato come hint. |
| 19 | **Mini-seed `tenant_memberships` in M11-bis**: legge `profiles WHERE role='operator'` e crea righe `tenant_memberships (tenant_pilota_uuid, profile.id, 'owner')`. Sul demo: 1 riga generata (l'unico profilo operator esistente). Idempotente via `ON CONFLICT (tenant_id, user_id, role) DO NOTHING`. |

---

## File SQL nel repo (ordine di applicazione)

### Fase A — Pull retrospettivo (snapshot congelato dal DB demo)

| Timestamp | File | Tipo | Righe |
|---|---|---|---|
| 20260305145000 | `20260305145000_init_schema.sql` | stub | ~8 |
| 20260306193000 | `20260306193000_storage_client_photos.sql` | stub | ~8 |
| 20260312101500 | `20260312101500_appointments_and_blacklist.sql` | stub | ~8 |
| 20260318101500 | `20260318101500_client_qr_cards.sql` | stub | ~8 |
| 20260408093000 | `20260408093000_public_pet_card_rpc.sql` | stub | ~8 |
| 20260409103000 | `20260409103000_contacts_inbox.sql` | stub | ~8 |
| 20260409131500 | `20260409131500_backfill_contacts_from_clients.sql` | stub | ~8 |
| 20260422110000 | `20260422110000_reward_points.sql` | stub | ~8 |
| 20260423110000 | `20260423110000_customer_portal_foundation.sql` | stub | ~8 |
| 20260423123000 | `20260423123000_customer_appointment_requests.sql` | **consolidated snapshot** (dump pg_dump `--schema public` + policy/bucket `client-photos`) | 1374 |

> I 9 stub non contengono DDL: allineano solo la `schema_migrations` per far
> credere al CLI che il repo è coerente con il DB demo. Tutto il DDL storico
> è in `20260423123000_customer_appointment_requests.sql`. Lo snapshot è
> **idempotente** se riapplicato (usa `CREATE TABLE IF NOT EXISTS`,
> `ON CONFLICT DO NOTHING`, `DROP POLICY IF EXISTS`).
>
> Il dump grezzo di riferimento resta in `supabase/docs/_remote_schema_dump.sql`
> (completo, con schema storage di sistema) e `_remote_schema_public.sql`
> (solo public). Tenerli in `docs/` per ispezione, non rientrano nella history.

### Fase B — Split `clients` → `customers` + `pets` (transazione atomica)

| Timestamp | File | Righe | Contenuto |
|---|---|---|---|
| 20260424120000 | `20260424120000_split_clients_with_backfill.sql` | ~600 | **Prod-safe (M11-bis).** Anticipa CREATE TABLE `tenants` + `tenant_memberships` + ENUM (idempotenti con M12/M13). Helper `normalize_phone_it`. Crea `customers` (con CHECK + UNIQUE parziali) + `pets` (con `legacy_client_id`). Drop policy pre-esistenti dipendenti. **Backfill** dei clients esistenti via dedup `(owner, phone E.164)` + split owner→first/last (greedy: ultima parola = last_name; mononomi → first_name=full, last_name=NULL). Pre-condition: phone NULL → RAISE EXCEPTION. Rewire FK `visits/appointments/reward_points/contacts/customer_invitations` via `legacy_client_id` (ADD nullable → UPDATE → SET NOT NULL → DROP). Drop `customer_client_links` + `clients`. Trigger `sync_customers_email_from_auth`. Riscrive `get_public_pet_card` e `accept_customer_invite` (logica adottiva). Mini-seed `tenant_memberships` da profiles operator. Policy *legacy staff-only* (sostituite in Fase E). |

### Fase C — Nuove tabelle multi-tenant + helper

| Timestamp | File | Contenuto |
|---|---|---|
| 20260424121000 | `20260424121000_tenants.sql` | Tabella `tenants` + seed `(slug='grooming-hub', name='Grooming HUB')`. RLS abilitata (policy in Fase E). |
| 20260424122000 | `20260424122000_tenant_memberships.sql` | Enum `tenant_role`, tabella `tenant_memberships`, UNIQUE `(tenant_id, user_id, role)`, indici. RLS abilitata. |
| 20260424123000 | `20260424123000_profiles_auto_create_and_deprecate_role.sql` | Trigger `on_auth_user_created` su `auth.users` → upsert `profiles` vuoto con role='customer'. `COMMENT ON COLUMN profiles.role` marca il campo deprecato. |
| 20260424124000 | `20260424124000_helpers_has_tenant_access.sql` | `has_tenant_access(uuid, tenant_role)`, `has_tenant_any_staff_access(uuid)`, `current_tenant_ids_for_role(tenant_role)`. SECURITY DEFINER + search_path pinnato. |
| 20260424125000 | `20260424125000_services.sql` | Tabella `services` + indici + trigger timestamp. |
| 20260424126000 | `20260424126000_promotions.sql` | Tabella `promotions` + indici. |

### Fase D — Backfill `tenant_id` (due step enforced)

| Timestamp | File | Contenuto |
|---|---|---|
| 20260424130000 | `20260424130000_tenant_id_nullable_and_backfill.sql` | `ADD COLUMN tenant_id` (nullable) su `visits/appointments/contacts/reward_points/customer_invitations`; backfill di tutte le tabelle al seed pilota. |
| 20260424131000 | `20260424131000_tenant_id_indexes.sql` | Indici composti `tenant_id`-first (appointments, visits, contacts, reward_points, customer_invitations, pets, customers). |
| 20260424132000 | `20260424132000_backfill_customers_stub.sql` | **No-op intenzionale** (stub doc per futura riconciliazione clients→customers). |
| 20260424133000 | `20260424133000_tenant_id_enforce_not_null.sql` | Verifica pre-condizione (COUNT righe null = 0), `ALTER COLUMN SET NOT NULL` su tutte le tabelle. Post-condition sanity check. **Semplificato post-M11-bis**: nessun rewrite UNIQUE customers (già installato in M11-bis come parziale per-tenant), nessun rewrite RPC (già definitiva in M11-bis). |

### Fase E — RLS (staff-tenant + customer)

| Timestamp | File | Tabella |
|---|---|---|
| 20260424140000 | `20260424140000_rls_tenants.sql` | `tenants` |
| 20260424140500 | `20260424140500_rls_tenant_memberships.sql` | `tenant_memberships` |
| 20260424141000 | `20260424141000_rls_profiles.sql` | `profiles` (self + staff tenant) |
| 20260424141500 | `20260424141500_rls_customers.sql` | `customers` |
| 20260424142000 | `20260424142000_rls_pets.sql` | `pets` (staff ALL, customer SELECT/UPDATE, **no INSERT customer**) |
| 20260424142500 | `20260424142500_rls_visits.sql` | `visits` |
| 20260424143000 | `20260424143000_rls_appointments.sql` | `appointments` (customer insert richieste pending) |
| 20260424143500 | `20260424143500_rls_contacts.sql` | `contacts` (staff-only) |
| 20260424144000 | `20260424144000_rls_reward_points.sql` | `reward_points` |
| 20260424144500 | `20260424144500_rls_services.sql` | `services` |
| 20260424145000 | `20260424145000_rls_promotions.sql` | `promotions` |
| 20260424145500 | `20260424145500_rls_customer_invitations.sql` | `customer_invitations` (staff-only; customer via RPC) |

### Fase G — Storage

| Timestamp | File | Contenuto |
|---|---|---|
| 20260424150000 | `20260424150000_pet_avatars_bucket.sql` | Bucket `pet-avatars` pubblico in lettura; policy INSERT/UPDATE/DELETE customer-proprietario del pet + staff-tenant ALL. Path `<tenant_id>/<pet_id>/<file>`. |

### Fase H — RPC critiche (rinviata al Gate 5)

Non incluse in Gate 2. Saranno:
- `available_slots(tenant_id, service_id, date)`
- `book_appointment(tenant_id, customer_id, pet_id, service_id, scheduled_at, notes)`

---

## Invarianti e rischi noti

### Cosa va bene se applicato in ordine
- Fase A è un no-op sul demo (schema già in produzione demo) → solo riempie il repo.
- Fasi B–G applicate in sequenza mantengono il DB coerente. Le policy *legacy* create in M11 coprono il gap tra lo split e le RLS tenant-aware (Fase E), così lo staff può continuare a leggere/scrivere.

### Gap da gestire nell'applicazione
1. **Tra M11 e M22**: `customer_invitations` perde le policy operator-scoped (droppate in M22) ma fino a M22 è ancora regolata dalle policy storiche (non droppate da M11). Se c'è una finestra tra M11 e M22 dove lo staff legge inviti → funziona ancora con le policy legacy. OK.
2. **M11 riscrive `accept_customer_invite`** per usare `tenant_memberships`, che però è creato in M13. Il riferimento è late-bound (plpgsql), quindi la `CREATE FUNCTION` non fallisce. Ma chiamare la funzione tra M11 e M13 fallirebbe con "relation tenant_memberships does not exist". Applicare le migration **consecutivamente** evita il problema.
3. **M21 riscrive `accept_customer_invite`** con `ON CONFLICT (tenant_id, user_id)`. Se chiamata tra M11 e M21, funziona (allora l'UNIQUE è ancora su `(user_id)` e la versione M11 usava `ON CONFLICT (user_id)`).
4. **Produzione (`grooming`)**: la strategia applicabile è diversa — il tenant_id del backfill potrebbe non essere `grooming-hub`. Da ridiscutere con l'autore prima di qualsiasi apply su prod.

### Gestione errori durante apply
- Ogni file è in `BEGIN…COMMIT`: in caso di errore, rollback completo del singolo step.
- Nessun file modifica globalmente il DB (niente DROP DATABASE, niente TRUNCATE).
- Il verify pre-condition di M21 rifiuta l'apply se ci sono `tenant_id IS NULL` residui.

---

## Come applicare (solo dopo review approvata)

Sul demo, dopo OK file-per-file:

```bash
# il link al worktree è già su qttpinkslhenxrsbhhhg
SUPABASE_DB_PASSWORD='…' supabase db push \
  --workdir /Users/luigimaisto/Desktop/grooming-hub-web/webapp/.claude/worktrees/kind-faraday-956d1a
```

`db push` applica **solo** le migration la cui entry non è in `schema_migrations`. Le 10 retrospettive sono già registrate → skipped. Verranno applicate le 23 nuove (Fase B/C/D/E/G) in ordine di timestamp.

Per un'applicazione step-by-step con verifica manuale tra ciascun file, meglio:
```bash
# esegue il singolo SQL via psql dentro il container docker del CLI
supabase db execute -f supabase/migrations/20260424120000_split_....sql
```
(o eseguire manualmente il contenuto di ciascun file via dashboard SQL editor del demo).

Su produzione (`grooming`): **mai** `db push` automatico. Apply manuale per-file, in finestra di manutenzione, dopo un backup.

---

---

## Considerazioni per l'applicazione su produzione

Le migration in questa cartella sono ottimizzate per `grooming-hub-demo`: DB vuoto o quasi, nessun traffico concorrente, possibilità di lockare tabelle senza impatto. La migration su produzione (`grooming`) richiede uno sforzo di pianificazione **aggiuntivo** che non anticipiamo qui per non sovraingegnerizzare. Questa sezione raccoglie i punti concreti di divergenza noti, da riaprire al Gate "migration production plan" prima del merge.

### Punti di divergenza noti

| # | File demo | Divergenza attesa in prod | Mitigazione proposta |
|---|---|---|---|
| 1 | `M11-bis split_clients_with_backfill` | **Risolto**: M11-bis è già prod-safe (backfill via `legacy_client_id`). Nessuna variante prod separata necessaria per lo split. Eventuali tuning prod (mapping owner→staff, normalize_phone per altri paesi): via parametri/decisioni puntuali al Gate production. | — |
| 2 | `M21 tenant_id_enforce_not_null` | 9 × `ALTER COLUMN SET NOT NULL` + 1 `DROP INDEX` + 1 `CREATE UNIQUE INDEX` dentro una sola transazione: su prod con traffico reale accumula lock AccessExclusive su 9 tabelle. Finestra di blocco ridotta ma reale per utenti attivi. | Variante split: una transazione per tabella (`ALTER … SET NOT NULL`), poi una transazione finale per il rehash dell'indice + rewrite RPC. Scelta "uno-per-volta vs atomico" da decidere con l'autore in base alla tolleranza al downtime. Considerare anche `CREATE UNIQUE INDEX CONCURRENTLY` (fuori da transazione) per evitare il lock lungo. |
| 3 | `M18 tenant_id_nullable_and_backfill` | Con dati reali il `UPDATE … SET tenant_id = v_tenant_id WHERE tenant_id IS NULL` su 9 tabelle può essere lento. | Fattibile online, ma valutare batch per evitare long-running transaction (es. `UPDATE … WHERE tenant_id IS NULL AND id IN (SELECT …)` a chunk di 10k righe). Nessun rischio di correttezza, solo performance. |
| 4 | Seed tenant pilota in M12 | `slug='grooming-hub'` è ok per demo. In prod il tenant "pilota" potrebbe già avere uno slug diverso, o ce ne sarebbero più. | Backfill potrebbe richiedere più di un tenant; la guardia di M18 `WHERE slug='grooming-hub'` va sostituita con logica di mapping (es. per-operator). Da discutere. |
| 5 | `schema_migrations` allineato via stub + consolidated | Su prod la history coincide già con il DB → la Fase A è no-op identica. OK. | Nessuna divergenza prevista. |
| 6 | `tenant_memberships` vuota dopo M13 | **Risolto sul demo**: M11-bis include il mini-seed da `profiles.role='operator'` (1 riga generata sul demo, ruolo `owner` nel tenant pilota). In prod il pattern resta valido ma con scelte di mapping più ricche (vedi **"Pattern seed memberships per produzione"** sotto). | Sul demo: incluso in M11-bis. In prod: pattern documentato, da adattare. |
| 7 | Nessuna strategia di rollback granulare | Ogni file è atomico (`BEGIN…COMMIT`): se fallisce, rollback singolo. Ma non c'è una migration "down" che reverta Fase B/C/D in ordine inverso. | In prod: pianificare un backup logico pre-migration (snapshot del DB) come fallback, invece di affidarsi a migration reverse. Consueto per Supabase, che non distribuisce down migration di default. |

### Principio guida

**Le migration demo vanno in repo così come sono**. Quando si arriverà al piano di produzione, si scriveranno migration di produzione dedicate (con suffisso `-prod` o timestamp separato) che possono riusare blocchi delle demo ma con guardrail aggiuntivi (batch UPDATE, CREATE INDEX CONCURRENTLY, seed preliminari). Non tentiamo di scrivere un'unica migration che vada bene per entrambi gli ambienti.

### Pattern seed memberships per produzione (nota per il Gate production — NON scritto in file SQL ora)

Approccio di partenza scelto per la migration di seed `tenant_memberships` in prod:

```sql
-- Bozza per il Gate production — NON applicare ora.
INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
SELECT
  t.id,
  p.id,
  CASE p.role
    WHEN 'operator' THEN 'owner'::public.tenant_role   -- o 'staff', da decidere per utente
  END
FROM public.profiles p
CROSS JOIN public.tenants t
WHERE p.role IN ('operator')
  AND t.slug = '<tenant-slug-per-utente>'  -- mapping reale va definito al Gate
ON CONFLICT (tenant_id, user_id, role) DO NOTHING;
```

**Procedura attesa al Gate production**:
1. **Query diagnostica pre-apply**: prima dell'esecuzione, eseguire una SELECT di preview che elenchi gli utenti che stanno per essere seedati, con i rispettivi tenant e ruolo. Richiedere conferma manuale all'autore.
2. **Mapping utente↔tenant**: in prod potrebbero esserci più tenant e la query `CROSS JOIN t` non basta. Va definita una tabella di mapping temporanea o una logica per-utente al momento del Gate.
3. **`operator` → `owner` vs `staff`**: in prod esistono owner del salone (tipicamente 1-2) e staff puri (groomer, receptionist). Il seed diretto da `profiles.role='operator'` li tratta indistintamente come `owner`: da raffinare al Gate con una lista manuale owner vs staff, oppure con un criterio tipo "primo registrato = owner, resto = staff".
4. **Gestione customer già in `profiles.role='customer'` senza invito accettato**: **decisione rinviata** al Gate production. Opzioni:
   - (a) Backfill esplicito: `INSERT INTO customers (tenant_id, user_id, ...) SELECT ... FROM profiles WHERE role='customer'` + seed corrispondente di `tenant_memberships` con role `customer`. Richiede di scegliere un tenant per ciascuno (se ce n'è più d'uno in prod).
   - (b) Lasciarli senza membership né riga `customers`: al primo accesso post-migration l'app li redirige a una UX di "contatta il tuo salone per un invito". Documentare esplicitamente questo caso come parte del runbook di produzione.
   - La scelta dipende da quanti customer ci sono e dalla qualità del dato — valutare al Gate production con conteggio reale.
5. **Idempotenza**: `ON CONFLICT (tenant_id, user_id, role) DO NOTHING` permette rerun sicuro. L'UNIQUE di `tenant_memberships` creato in M13 supporta esattamente questa colonna tripla.
6. **Ordinamento rispetto a M21**: il seed va **prima** di M21. Motivo: dopo M21 le policy RLS di Fase E sono attive; senza memberships, un operatore che accede al DB via app è bloccato. Ordine: M18 (backfill `tenant_id` nullable) → seed memberships → M21 (enforce) → M22-M33 (RLS).

**Stato**: la migration di seed non esiste ancora come file SQL. Verrà scritta al Gate production dopo che l'autore avrà deciso il mapping reale utente↔tenant↔ruolo sulla base dei dati di prod.

---

## Stato

- [x] Gate 1 — `supabase/docs/schema-baseline.md`.
- [x] Gate 2 — 33 file `.sql` in `supabase/migrations/` (10 retrospettivi + 23 nuovi).
- [ ] Review file-per-file con l'autore.
- [ ] Apply su demo (solo dopo OK).
- [ ] Gate 3+ (RPC, seed, codice applicativo).

## File ausiliari

- `supabase/docs/schema-baseline.md` — baseline Gate 1.
- `supabase/docs/migration-plan.md` — questo file.
- `supabase/docs/_remote_schema_dump.sql` — dump completo (public+storage) per riferimento.
- `supabase/docs/_remote_schema_public.sql` — dump solo public.
- `supabase/config.toml` — init CLI (linkato a `qttpinkslhenxrsbhhhg` via `.temp/project-ref`).
