# M11-bis — note di integrazione nel repo

> **Scopo**: mappa dei file che andranno toccati quando `M11-bis_split_with_backfill.sql` sarà scritta e sostituirà l'attuale `M11_split_clients_into_customers_and_pets.sql`. Produci questo documento così che, al rientro dalle decisioni operative (punti 1-4 aperti), l'integrazione sia già pianificata file per file.
>
> **Stato**: pseudocodice di M11-bis concordato al 2026-04-24. Nessun SQL scritto ancora.

## Contesto del cambio

M11-bis introduce, rispetto a M11 originale:

1. **Schema `customers` diverso**: `first_name` / `last_name` / `email` / `phone` (sostituiscono `full_name`). `user_id nullable`. `CHECK` su presenza alternativa (`user_id` OR anagrafica completa). UNIQUE parziali `(tenant_id, user_id)` e `(tenant_id, phone)`.
2. **Helper `normalize_phone_it(text)`** come funzione SQL riusabile.
3. **Backfill non-triviale** dei 6 clients demo verso `customers` + `pets` con colonna-ponte `legacy_client_id`, dedup report, split report.
4. **`accept_customer_invite` più complessa**: matching e "adozione" di anagrafica esistente via `phone` prima dell'INSERT customer.
5. **Trigger `sync_customers_email_from_auth`** su `auth.users` → propagazione `NEW.email` su tutte le righe `customers.user_id = NEW.id`.
6. **Mini-seed `tenant_memberships`** dal profilo demo esistente, incluso in M11-bis (non più rimandato al Gate production).

Conseguenza: M11-bis è **già produzione-safe**. La variante `M11-prod` abbozzata in precedenza non è più necessaria come file separato — la strategia di backfill è unica e vale per demo + prod.

---

## File migration che cambiano contenuto

### Sostituiti completamente

| File attuale | Azione |
|---|---|
| `20260424120000_split_clients_into_customers_and_pets.sql` | **Sostituito** da `20260424120000_split_clients_with_backfill.sql`. Il timestamp resta invariato per non disallineare i file successivi. Il nome del file cambia per riflettere il nuovo pattern. Il commit di sostituzione farà `git rm` + `git add` del nuovo. |

### Toccati per allineamento

| File | Modifica prevista | Motivo |
|---|---|---|
| `20260424133000_tenant_id_enforce_not_null.sql` (M21) | Rimuovere `DROP INDEX customers_user_id_unique` e `CREATE UNIQUE INDEX customers_tenant_user_unique`. Il UNIQUE parziale è già creato da M11-bis. Verifica post-condition resta. | In M11 originale l'UNIQUE era globale su `user_id`; M21 lo swappava. Con M11-bis l'UNIQUE nasce già per-tenant + parziale. |
| `20260424133000_tenant_id_enforce_not_null.sql` (M21 — secondo punto) | Rewrite di `accept_customer_invite` va **semplificato** o **rimosso**: la versione definitiva (con adozione via phone) è già in M11-bis. M21 può limitarsi a un no-op comment che rimanda a M11-bis, oppure contenere solo il rewrite minimale per `ON CONFLICT` se M11-bis non lo fa. | Duplicazione da evitare. |
| `20260424123000_profiles_auto_create_and_deprecate_role.sql` (M14) | **Nessuna modifica al trigger** (continua a creare solo `profiles`, non `customers`). Da verificare che il COMMENT di deprecazione su `profiles.role` non entri in conflitto con il seed memberships che lo **legge** in M11-bis. | Il seed memberships usa `profiles.role` per determinare il ruolo target. Il COMMENT "deprecato" resta coerente: leggere un campo deprecato una volta per seed non significa continuare a usarlo. |
| `20260424141500_rls_customers.sql` (M25) | **Verifica** che le policy funzionino con `user_id IS NULL`: `customers_self_select USING (user_id = auth.uid())` restituisce `false` quando `user_id IS NULL` (comportamento SQL standard). Le anagrafiche senza account sono invisibili al customer, visibili solo allo staff. Aggiungere commento inline che documenti questo comportamento. | Preserva la sicurezza: un customer non vede anagrafiche con `user_id NULL` (inclusa la propria pre-invito). Staff le vede tutte via `customers_staff_all`. |
| `20260424142000_rls_pets.sql` (M26) | Nessuna modifica. La policy `pets_customer_select` filtra via `customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid() …)` — i customers senza `user_id` non matchano, quindi i pet legati ad anagrafiche pre-invito non sono visibili al customer. | Comportamento corretto by-design. |
| `20260424130000_tenant_id_nullable_and_backfill.sql` (M18) | Nessuna modifica strutturale. Opzionale: aggiornare il commento di testata per menzionare che `customers` già ha `tenant_id` popolato da M11-bis (non solo "creato nullable in M11"). | Chiarezza. |
| Tutti gli altri file RLS (M22-M24, M27-M33) | Nessuna modifica prevista. Non referenziano campi di `customers` né `clients`/`customer_client_links`. | — |

### Da rivedere con attenzione

| File | Verifica |
|---|---|
| Tutte le policy RLS di Fase E | Dopo il seed memberships di M11-bis, al commit della transazione esiste 1 riga in `tenant_memberships` (per il profilo demo) con ruolo `owner`. Le policy M22-M33 si attivano correttamente per quel profilo; uno staff login nell'app demo continua a funzionare. **Da testare manualmente** dopo l'apply. |
| `20260424132000_backfill_customers_stub.sql` (M23) | Era stub no-op documentale. Con M11-bis il backfill è fatto — questo file diventa doppiamente no-op. Valutare se **mantenere** (coerenza con il piano) o **rimuovere**. Proposta: mantenere con commento aggiornato "backfill anticipato in M11-bis; questo file resta come segnaposto per eventuali backfill successivi di customer orfani". |

### Non toccati

Tutti i 10 file retrospettivi (`20260305145000_` … `20260423123000_`). Il consolidated snapshot resta il baseline autoritativo del DB demo prima di Gate 2.

---

## File docs che cambiano

### `supabase/docs/migration-plan.md`

| Sezione | Modifica |
|---|---|
| **Decisioni acquisite #3** | Riscrivere: "M11-bis è prodotta con backfill completo, unica versione valida sia per demo che per produzione. La variante `M11-prod_split_clients_with_backfill.sql` originariamente pianificata è assorbita da M11-bis". Rimuovere il riferimento a "DEMO-ONLY". |
| **Decisioni acquisite** | Aggiungere **#13** (schema customers con anagrafica + account): "`customers.user_id` nullable. CHECK alternativo `user_id NOT NULL OR (first_name AND last_name AND phone)`. UNIQUE parziali `(tenant_id, user_id) WHERE user_id IS NOT NULL` e `(tenant_id, phone) WHERE phone IS NOT NULL`. Modello B: le anagrafiche possono esistere senza account Supabase associato, popolate dall'operatore in fase di registrazione clienti." |
| **Decisioni acquisite** | Aggiungere **#14** (self-registration customer senza invito, da confermare): "Customer che si registra all'app senza essere già anagrafica di un tenant → stato transitorio 'utente senza tenant'. Gestione via UI del Gate 3+ (flow di selezione tenant o inserimento codice invito). Non richiede modifiche di schema per Fase 1." |
| **Decisioni acquisite** | Aggiungere **#15** (normalizzazione phone E.164): "Helper `normalize_phone_it(text)` come funzione SQL. Numeri senza prefisso internazionale assunti italiani (+39). Riusato in backfill M11-bis e disponibile per future INSERT/UPDATE su `customers.phone`." |
| **Decisioni acquisite** | Aggiungere **#16** (trigger email sync): "Trigger `sync_customers_email_from_auth` su `auth.users AFTER UPDATE OF email`. `customers.email` è un mirror denormalizzato di `auth.users.email`, mai fonte di verità indipendente. La cascata tocca tutte le righe `customers` dell'utente (multi-tenant-safe)." |
| **File SQL — Fase B** | Sostituire nome file: `20260424120000_split_clients_with_backfill.sql`. Rimuovere descrizione "Demo-only"; sostituire con "Include backfill dei 6 clients demo via colonna-ponte `legacy_client_id`, helper `normalize_phone_it`, report dedup + split, rewire FK, rewrite RPC, trigger sync email, seed tenant_memberships dal profilo demo." |
| **Considerazioni per produzione — punto 1** | Semplificare: "M11-bis è già produzione-safe via backfill. Nessuna migration separata `-prod` necessaria per lo split. Il pattern demo è generalizzabile senza rischi di distruttività." |
| **Considerazioni per produzione — punto 6** | Semplificare: "Seed `tenant_memberships` già incluso in M11-bis (applicato sul demo con 1 profilo)" + mantenere nota che in prod il seed potrebbe necessitare di mapping più raffinato (owner vs staff) quando ci saranno più profili operator. Il `pattern seed memberships per produzione` resta documentato ma va adattato al fatto che la logica è ora **espressa** in M11-bis, non un progetto futuro. |
| **Pattern seed memberships per produzione** | Aggiornare: il blocco SQL diventa il contenuto effettivo dello step [13] di M11-bis. La sezione passa da "abbozzo futuro" a "template già implementato, da adattare al volume prod". |

### `supabase/docs/staff-code-touchpoints.md`

| Sezione | Modifica |
|---|---|
| **Gruppo Invite flow** | Aggiornare output atteso di `accept_customer_invite`: oggi documentato `{customerId, petId, operatorUserId, tenantId}`. Con M11-bis logica "adottata anagrafica" il payload può arricchirsi con `adopted: boolean` per indicare se è stata adottata un'anagrafica pre-esistente vs creato customer nuovo. Confermare formato con l'autore. |
| **Gruppo Clients CRUD** | Aggiornare: il mapping `clients.owner` → `customers.full_name` descritto diventa `clients.owner` → `customers.first_name + last_name` (split). `clients.phone` → `customers.phone` passa per `normalize_phone_it` in fase di scrittura. Stimare impatto su UI staff che oggi mostra un solo campo "proprietario": decisione di design (mostrare "Nome Cognome" concatenato, o due campi separati in form?). |
| **Helper interni** | Documentare che `normalize_phone_it` è disponibile come funzione SQL per chiamate lato staff-backend (se serve). Client-side JS continuerà a necessitare di una implementazione gemella (libphonenumber-js? sono ~150KB però). |
| **Decisioni di design** | Aggiungere: **(6)** `full_name` concatenato vs first/last separati in UI; **(7)** form AddClient oggi ha un campo "proprietario" unico — diventa due? con migration della label UI. |

### `supabase/docs/schema-baseline.md`

Nessuna modifica. Questo doc cattura lo stato **pre**-Gate 2 e resta storico.

### `supabase/docs/_remote_schema_dump.sql` / `_remote_schema_public.sql`

Nessuna modifica. Reference file prodotti via `pg_dump` 2026-04-24, restano immutati come riferimento.

---

## Decisioni aperte che sbloccano la scrittura di M11-bis

Sono i 4 punti rimandati al gestore della struttura. Li ripeto qui per chiusura:

| # | Domanda | Opzioni proposte |
|---|---|---|
| 1 | **CHECK su `customers`** stretto o permissivo per mononomi? | (a) `first_name AND last_name AND phone NOT NULL` (stretto, rifiuta "Luna" owner). (b) `first_name NOT NULL AND phone NOT NULL` (permissivo, `last_name` opzionale). |
| 2 | **Fallback quando `clients.phone IS NULL`** in backfill | (a) Skip customer generation, pet con `customer_id NULL`. (b) Relax del CHECK per casi senza phone. (c) Prompt manuale fittizio. |
| 3 | **Matching via phone** in `accept_customer_invite` — adottare anagrafica pre-esistente o sempre creare nuova? | (a) Adotta se matcha phone (scelta per "salone aveva il tuo numero"). (b) Sempre crea nuova (pulizia, no rischi di matching sbagliato). |
| 4 | **`customer_invitations.phone`** — aggiungere colonna per guidare il matching del punto 3? | (a) Aggiungere. (b) Lasciare solo `customer_email`, matching via phone resta implicito (meno affidabile). |

Quando rispondi, aggiornerò lo pseudocodice con le scelte, poi scriverò `M11-bis_split_clients_with_backfill.sql` + aggiornerò i file documentati sopra in un unico commit.

---

## Stato attuale del repo

- Branch `feat/customer-app` @ `8eea8bc` — Gate 2 committato e pushato.
- DB demo `grooming-hub-demo`: intatto, nessuna migration di Gate 2 applicata (M11 originale rollback-ato per presenza dati live).
- `M11-bis_split_clients_with_backfill.sql`: **non scritto**. Attende decisioni 1-4.
- Pseudocodice di M11-bis: concordato nella sessione del 2026-04-24 (non persistito in repo, tracciato nella conversazione).

## Checklist di esecuzione al rientro

Quando le decisioni 1-4 sono chiuse:

1. [ ] Aggiornare pseudocodice con le risposte.
2. [ ] Scrivere `supabase/migrations/20260424120000_split_clients_with_backfill.sql` (sostituisce il file M11 originale; stesso timestamp, nome diverso, contenuto aggiornato).
3. [ ] Aggiornare `20260424133000_tenant_id_enforce_not_null.sql` rimuovendo l'UNIQUE swap e semplificando il rewrite di `accept_customer_invite` (duplicato).
4. [ ] Aggiornare `20260424141500_rls_customers.sql` con commento sul comportamento `user_id IS NULL`.
5. [ ] Aggiornare `supabase/docs/migration-plan.md` con decisioni #13-#16 + modifiche alla sezione file e considerazioni produzione.
6. [ ] Aggiornare `supabase/docs/staff-code-touchpoints.md` con punti 6-7 di design + formato output RPC.
7. [ ] Commit: `feat: M11-bis split with backfill + related doc updates`.
8. [ ] Push su `origin/feat/customer-app`.
9. [ ] Apply `supabase db push` sul demo. Verifica post-apply: schema consistente, 1 membership seeded, 6 customers + 6 pets + 7 appointments + 84 visits + 6 contacts migrati correttamente.
10. [ ] Aggiornare in conversazione lo stato (report dedup + report split + count post-migration).
