# GH-10 - Security hardening pre-merge prod

**Stato:** completato e verificato per la parte Codex/demo
**Data:** 24 agosto 2026
**Branch:** `feat/customer-app`
**Base dichiarata:** `b603e593476a449ddbaea3307aef49e8654036ac`
**Commit:** commit unico GH-10, soggetto `chore: harden demo database security`; hash riportato nella risposta di consegna per evitare un riferimento circolare al commit che contiene questo registro
**Ambiente modificato:** solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)
**Produzione:** non interrogata e non modificata da Codex; la misura prod resta assegnata a Cowork
**Push:** non eseguito

## Perimetro ricevuto

- misura Security e Performance Advisor sul demo prima di ogni fix;
- una sola migration idempotente `security_hardening` sul demo;
- pinning `search_path`, revisione ACL/`EXECUTE`, verifica Storage e soli fix
  meccanici che non riscrivano le RLS gia controprovate;
- Advisor post-fix, suite RLS completa con ciclo sonda, smoke customer/staff e
  build;
- nessun gesto dashboard Auth, nessuna migration prod, nessun push;
- registro nello stesso commit della migration.

## Fase 0 - Misura Advisor demo

Il progetto e risultato `ACTIVE_HEALTHY`, Postgres 17, regione `eu-north-1`.

| Advisor | Prima | Dopo | Delta |
|---|---:|---:|---:|
| Security | 21 | 6 | -15 |
| Performance | 115 | 113 | -2 |

### Tabella completa avviso, gravita e destino

| Avviso / oggetti completi | Gravita | Prima -> dopo | Destino demo | Destino prod / motivo |
|---|---|---:|---|---|
| [`function_search_path_mutable`](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable): `update_timestamp()`, `normalize_phone_it(text)` | WARN | 2 -> 0 | **Fix ora sul demo**: path `pg_catalog` | **Fix nell'atto G6 se presente** dopo confronto con la misura Cowork |
| [`anon_security_definer_function_executable`](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable): `accept_customer_invite`, `current_tenant_ids_for_role`, `enforce_customers_operator_notes_staff_only`, `enforce_pets_internal_notes_staff_only`, `handle_new_auth_user`, `has_tenant_access`, `has_tenant_any_staff_access`, `sync_customers_email_from_auth` | WARN | 8 -> 0 | **Fix ora sul demo**: revocati `PUBLIC` e `anon`; le funzioni trigger/future non sono piu endpoint Data API | **Fix nell'atto G6 se le firme coincidono** |
| Stesso lint su `get_public_pet_card(text)` | WARN | 1 -> 1 | **Accettato con motivo**: endpoint QR pubblico per disegno; token opaco e payload pubblico sono il suo contratto | Accettare in G6 solo se Cowork conferma lo stesso flusso QR pubblico |
| [`authenticated_security_definer_function_executable`](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable): `current_tenant_ids_for_role`, `enforce_customers_operator_notes_staff_only`, `enforce_pets_internal_notes_staff_only`, `handle_new_auth_user`, `sync_customers_email_from_auth` | WARN | 5 -> 0 | **Fix ora sul demo**: revocato `authenticated`; trigger e helper futuro non sono RPC applicative | **Fix nell'atto G6 se presenti** |
| Stesso lint su `accept_customer_invite`, `get_public_pet_card`, `has_tenant_access`, `has_tenant_any_staff_access` | WARN | 4 -> 4 | **Accettato con motivo**: invito autenticato, QR leggibile anche da utenti loggati e due helper necessari alle RLS | Mantenere in G6 solo dopo verifica dei consumer e delle policy prod |
| [`auth_leaked_password_protection`](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) | WARN | 1 -> 1 | **Accettato temporaneamente**: toggle dashboard riservato a Luigi | Stesso gesto separato sul progetto prod, non parte di G6 SQL |
| [`unindexed_foreign_keys`](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys): `customer_invitations.accepted_by`, `customers.user_id` | INFO | 2 -> 0 | **Fix ora sul demo**: due indici additivi | **Fix nell'atto G6 se il preflight Cowork conferma le FK senza indice** |
| [`auth_rls_initplan`](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan): `reward_points_customer_select`; `tenants_members_select`; `tenant_memberships_own_select`; `profiles_self_select`, `profiles_tenant_members_select`, `profiles_self_insert`, `profiles_self_update`; `customers_self_select`, `customers_self_update`; `pets_customer_select`, `pets_customer_update`; `visits_customer_select`; `appointments_customer_select`, `appointments_customer_request_insert`, `appointments_customer_request_update` | WARN | 15 -> 15 | **Accettato con motivo**: il fix riscrive espressioni RLS; GH-10 vieta di toccare le RLS verificate oltre pinning/ACL | Non includere in G6; candidato per mandato performance separato con suite identica |
| [`unused_index`](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index): `services_category_idx`, `promotions_valid_to_idx`, `visits_tenant_date_idx`, `contacts_tenant_status_idx`, `idx_contacts_user_id`, `idx_contacts_status`, `idx_contacts_created_at`, `idx_contacts_linked_pet_id`, `idx_reward_points_created_at`, `appointment_requests_service_idx`, `idx_customer_invitations_token`, `idx_appointments_user_id`, `appointments_tenant_status_idx`, `appointments_service_id_idx`, `idx_appointments_approval_status`, `idx_appointments_appointment_source`, `idx_appointments_requested_by_customer`, `pets_blacklist_idx` | INFO | 18 -> 18 | **Accettato con motivo**: demo a traffico minimo; rimuovere indici su statistiche demo sarebbe una decisione non rappresentativa | Decidere su statistiche prod reali, non copiare il destino demo |
| [`multiple_permissive_policies`](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0006_multiple_permissive_policies): `appointment_requests` 2; `appointments` 18; `customers` 12; `pets` 12; `profiles` 6; `promotions` 6; `reward_points` 6; `services` 6; `tenant_memberships` 6; `visits` 6 | WARN | 80 -> 80 | **Accettato con motivo**: totale 80, dovuto soprattutto a policy `TO public` e coppie staff/customer; consolidarle cambia il contratto RLS e non e meccanico | Non includere in G6; mandato RLS dedicato se la misura prod ne dimostra il costo |
| Storage `client-photos`: bucket pubblico e policy `Public can view client photos`; anche `pet-avatars` e pubblico | Scelta verificata, non lint Advisor | invariato | **Accettato con motivo**: le immagini devono essere leggibili dalle QR card pubbliche; upload/update/delete restano limitati al proprietario e a percorsi qualificati | Verificare separatamente bucket e policy prod nel preflight G6 |

Le 80 righe `multiple_permissive_policies` sono esaustive per famiglia: i
conteggi per tabella sommano a 80 e coprono tutte le combinazioni ruolo/azione
restituite dall'Advisor. Nessun avviso demo resta senza destino.

## Migration demo

- file locale: `supabase/migrations/20260824090000_security_hardening.sql`;
- atto remoto Supabase: versione `20260824062146`, nome
  `security_hardening`;
- tutte le 10 funzioni `SECURITY DEFINER` legacy hanno path fisso
  `pg_catalog, public, auth`;
- le due funzioni invoker segnalate hanno path `pg_catalog`;
- rimosso il grant implicito `PUBLIC` e riaperti solo i ruoli necessari;
- `get_public_pet_card`: `anon`, `authenticated`, `service_role`;
- `accept_customer_invite`: `authenticated`, `service_role`;
- helper RLS: `authenticated`, `service_role`;
- trigger e helper futuro: non esposti a `anon`/`authenticated`;
- aggiunti `customer_invitations_accepted_by_idx` e
  `customers_user_id_idx`.

La migration usa solo `ALTER FUNCTION`, `REVOKE`/`GRANT` e `CREATE INDEX IF
NOT EXISTS`; una riesecuzione ripete lo stesso stato senza aggiungere oggetti.

## Delta Advisor post-fix

- Security: eliminate le 2 segnalazioni `search_path`, 8 ACL anon e 5 ACL
  authenticated; restano 5 ACL intenzionali e il toggle password di Luigi.
- Performance: eliminate entrambe le FK senza indice. Lo smoke degli indici ha
  misurato `idx_scan=3` e `idx_scan=8`; l'Advisor finale non li classifica come
  inutilizzati. Restano esattamente i 18 indici gia presenti prima, 15
  `auth_rls_initplan` e 80 policy multiple.
- Nessun nuovo avviso finale rispetto alla misura iniziale.

## Toggle dashboard riservati a Luigi

Nessun toggle e stato eseguito da Codex.

1. **Leaked password protection:** progetto demo -> `Authentication` ->
   `Sign In / Providers` -> provider `Email` -> sezione sicurezza password ->
   attivare la protezione password compromesse; poi ripetere l'Advisor Security.
2. **MFA:** progetto demo -> `Authentication` -> `Multi-Factor`; verificare e
   abilitare i fattori desiderati solo dopo aver definito il flusso di recovery
   per operatori e customer.

## Bozza variante prod per G6 - non applicata

La variante prod candidata e la migration demo
`20260824090000_security_hardening.sql`, ma **non va applicata alla cieca**.
L'atto G6 deve costruirne il sottoinsieme concreto dopo la tabella Advisor
Cowork e questi preflight:

1. confrontare con `pg_proc` firme, `prosecdef`, `proconfig`, ACL e dipendenze
   trigger di ogni funzione;
2. mantenere grant `anon` su `get_public_pet_card` solo se il QR pubblico prod
   usa quella RPC;
3. mantenere `authenticated` su invito e helper RLS solo se consumer e policy
   coincidono;
4. creare i due indici solo se FK e indici di copertura prod coincidono;
5. verificare `client-photos` e `pet-avatars` come decisioni distinte;
6. rieseguire Advisor, suite RLS e smoke prima del merge/deploy.

Raccomandazione a Cowork: prod e stato spostato e la sua misura non e presente
in questo worktree. La soluzione minima e allegare al mandato G6 l'export
Advisor prod e una query `pg_proc`/ACL equivalente a quella usata qui; da quel
diff si genera la variante, evitando di assumere che il nuovo progetto prod
abbia lo stesso debito storico del demo.

## Controprove

| # | Verifica | Esito misurato |
|---|---|---|
| 1 | Advisor finale | PASS: Security 6, Performance 113; zero nuovi avvisi; delta spiegato sopra. |
| 2 | ACL e path vivi | PASS: tutti i 12 oggetti verificati; nessun `PUBLIC` implicito; grant effettivi uguali al contratto della migration. |
| 3 | Suite RLS completa | PASS: **26 PASS, 0 FAIL, 1 SKIP** previsto (demo con un solo tenant). Include Mario, Luca, sonda staff, RPC, booking e Storage. |
| 4 | Pulizia fixture suite | PASS: 0 pet, 0 visite, 0 customer, 0 richieste marker. |
| 5 | Smoke customer | PASS: sessione Mario, home `Bentornato, Mario`, due pet, scheda Luna con anagrafica, preferenze, note e 3 visite; zero errori console. |
| 6 | Smoke staff | PASS: sonda su `/dashboard`, 7 clienti; `/contacts` con 7 risultati, Mario multi-pet e Luca lead; zero errori console. |
| 7 | Teardown sonda | PASS due cicli: login finale `invalid_credentials`; 0 auth user, profilo, membership, customer e pet associati. |
| 8 | Build | PASS: `npm run build`, Vite 5.4.21, 138 moduli. Restano solo Browserslist datato e chunk oltre 500 kB, preesistenti. |

## File esaustivi

| File | Intervento | Commit |
|---|---|---|
| `supabase/migrations/20260824090000_security_hardening.sql` | unica migration: path, ACL minimi e due indici FK | questo commit |
| `docs/consegne/GH-10-security-hardening.md` | registro, tabella Advisor, controprove e bozza prod | questo commit |

## Eccezioni e fuori istruzione

- La misura Advisor prod assegnata a Cowork non era disponibile nel worktree al
  momento della consegna. Codex non ha compensato interrogando il prod: ha
  lasciato una bozza condizionata e il preflight concreto sopra.
- Nessuna policy RLS e stata modificata: gli avvisi performance che richiedono
  riscrittura restano dichiarati con motivo.
- Le policy Storage pubbliche non sono state cambiate perche necessarie alle QR
  card; limiti MIME e 5 MB verificati su entrambi i bucket.
- Per lo smoke UI e stata ricreata la sonda usa-e-getta GH-04 e smontata nello
  stesso ciclo; nessun account reale operatore e stato toccato.
- Il login customer ha usato la sessione Mario gia valida nel browser locale;
  nessuna password e stata letta o riportata nel registro.
- Nessun file fuori dalla tabella esaustiva e stato modificato.
- Nessuna modifica, query, migration o login sul progetto produzione.
- Nessun secret scritto o committato; nessun push, deploy o merge.
