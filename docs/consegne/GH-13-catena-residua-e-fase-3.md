# GH-13 - Catena residua e Fase 3

**Mandato:** `docs/incarichi/GH-13-catena-residua-e-fase-3.md`
**Base Git dichiarata:** `24c5af4` (`feat/customer-app`)
**Root operativa dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web/`
**Worktree:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`
**Bersaglio esclusivo:** `grooming-prova-generale` (`xkieyzuhtpiysjugtdik`)
**Produzione e demo:** fuori perimetro; nessuna lettura o scrittura
**Push/deploy:** non eseguiti

## 1. Esito

GH-13 e completato sul solo progetto temporaneo. Il preflight contatti ha
restituito zero casi manuali e zero conflitti; l'assorbimento customer-first,
la catena residua e l'hardening sono stati applicati e verificati. La suite RLS
finale ha chiuso con **26 PASS, 0 FAIL, 1 SKIP** motivato dal fatto che il dump
contiene un solo tenant. Tutte le sonde e i loro dati sono stati smontati.

L'app locale costruita contro il temporaneo ha autenticato l'account staff
migrato `ggetto@gmail.com` e lo ha instradato a `/dashboard`, mostrando 282
schede pet e 452 visite senza errori browser. Il progetto temporaneo non e
stato smontato, come prescritto.

## 2. Stato di ingresso e preflight contatti

La misura e stata eseguita prima della prima scrittura e coincideva con il
mandato: `customers=260`, `pets=282`, `visits=452`, `contacts=287`,
`customers.phone IS_NULLABLE=NO` e conflitti noti pari a zero.

Il preflight completo e durato **12,344 s**:

| Misura | Valore |
|---|---:|
| contacts | 287 |
| customers | 260 |
| pets | 282 |
| match per `linked_pet_id` | 282 |
| match per telefono normalizzato | 5 |
| match assistito dal nome | 0 |
| nuovi lead | 0 |
| casi manuali | 0 |
| conflitti fra segnali | 0 |
| telefoni contatto non validi | 12 |
| gruppi customer duplicati per telefono normalizzato | 0 |
| gruppi contact duplicati per telefono normalizzato | 21 |
| converted senza match sicuro | 0 |
| note duplicate esatte del pet | 29 |
| note divergenti dal pet | 1 |
| note destinate al customer | 0 |
| ogni contatto classificato una sola volta | si |

La nota divergente era trattabile con la regola marker gia approvata in
GH-07-bis; non ha richiesto un allargamento del matching.

## 3. Assorbimento contatti prod-safe

Creato e applicato
`supabase/prod-migrations/20260824140000_absorb_contacts_customer_first_prod.sql`.
Il file non contiene UUID, ref, tenant o cardinalita demo hardcoded. Aggiunge i
due campi operativi e la RPC `upsert_customer_lead`, esegue il backfill con le
priorita link -> telefono -> nome controllato, conserva `contacts` e protegge
note e duplicati con guardie transazionali.

| Atto | Durata |
|---|---:|
| applicazione `absorb_contacts_customer_first_prod` | 2,298 s |
| misura post-applicazione | 1,282 s |
| seconda esecuzione di idempotenza | 1,816 s |
| seconda misura e impronte | circa 1,0 s |

Controprova: `customers=260`, `pets=282`, `contacts=287`, lead senza pet `0`,
duplicati customer per telefono normalizzato `0`, destinazioni customer dei
contatti `287/287`. La seconda esecuzione non ha cambiato cardinalita o
impronte dati (`customers=556db0cf8117b2c3071ce36f77804847`,
`pets=9feb2f7f7fcc457cd55b671dd0f02e14`).

## 4. Catena residua applicata

| Ordine di ricetta | Migration | Durata DB | Esito |
|---:|---|---:|---|
| 1 | whitelist update pet `20260818060158` | 0,986 s | riuscita |
| 2 | qualificazione path Storage `20260818063103` | 0,927 s | riuscita |
| 3 | RPC `add_customer_with_pet` `20260821031654` | 1,460 s | riuscita |
| 4 | campi/RPC GH-07-bis | inclusi nell'Atto 2 | riuscita |
| 5 | prerequisito `appointments.service_id` `20260520051506` | 0,940 s | riuscita |
| 6 | `appointment_requests` e due RPC `20260821090000` | 1,033 s | riuscita |
| 7 | hardening prod-safe | 1,235 s | riuscita |

Il prerequisito `service_id` non era elencato nel testo GH-13, ma e una
migration gia approvata e dichiarata come prerequisito dal file
`appointment_requests`. La sua assenza e emersa nella seconda esecuzione RLS.
Sul temporaneo e stato applicato dopo `appointment_requests` per correggere la
prova; nella ricetta G6 e riportato nel punto corretto, immediatamente prima.
Non e stata scritta alcuna nuova migration per questa dipendenza.

### Hardening misurato

Il preflight `pg_proc` ha trovato esattamente le 10 routine attese. Le due
routine trigger legacy delle note, presenti solo nel demo, erano assenti e non
sono state create. Sono state confermate le firme, `prosecdef`, `proconfig`, ACL,
i consumer del QR pubblico e degli inviti, gli helper usati dalle policy, le
due FK senza indice guida e le decisioni distinte dei bucket `client-photos` e
`pet-avatars` (pubblici, 5 MB, JPEG/PNG/WebP/GIF).

La variante mantiene `anon` soltanto su `get_public_pet_card`, mantiene i grant
autenticati necessari e crea gli indici su
`customer_invitations.accepted_by` e `customers.user_id`.

## 5. Suite RLS e teardown

La suite e stata resa parametrica tramite variabili d'ambiente, conservando i
default demo. Sono stati creati tre account propri usa-e-getta, due customer,
due pet e un servizio temporaneo, tutti marcati GH-13.

| Ciclo | Durata | Esito | Diagnosi |
|---|---:|---|---|
| 1 | 8,518 s | 20 PASS, 6 FAIL, 1 SKIP | dump senza servizi attivi |
| 2 | 9,264 s | 25 PASS, 1 FAIL, 1 SKIP | colonna `appointments.service_id` assente |
| 3 finale | 7,475 s | **26 PASS, 0 FAIL, 1 SKIP** | contratto completo verificato |

Le controprove finali comprendono: login delle tre sonde, lettura baseline
staff, isolamento customer in entrambe le direzioni, campi protetti, diniego
RPC staff al customer, richiesta/risoluzione appuntamento, whitelist pet,
Storage proprio/estraneo/tenant estraneo e aggiornamento campi staff.

Il teardown finale ha riportato a zero utenti Auth, identities, profiles,
membership, customer, pet, visite, richieste, appuntamenti, servizio e oggetti
Storage della sonda. Stato finale: `customers=260`, `pets=282`, `visits=452`,
`contacts=287`, `services=0`, `appointment_requests=0`.

## 6. Advisor finali

| Advisor | Baseline demo GH-10 | Temporaneo finale | Differenza |
|---|---:|---:|---:|
| Security | 6 | 6 | 0 |
| Performance | 113 | 99 | -14 |

Security conserva 1 warning per la RPC QR pubblica, 4 warning per routine
`SECURITY DEFINER` accessibili agli autenticati e 1 warning Auth sulla
protezione password compromesse. Sono concessioni deliberate o configurazioni
di progetto, non regressioni introdotte da GH-13.

I 99 advisor Performance sono 15 `auth_rls_initplan`, 17 `unused_index` e 67
`multiple_permissive_policies`. Rispetto al demo risultano 13 policy permissive
multiple e 1 indice inutilizzato in meno; la differenza deriva dallo schema
prod e dal fatto che le due routine/policy demo-only non esistono nel dump.

## 7. Build, login staff e spot-check

`npm run build` e stato eseguito con URL e chiave pubblicabile del solo
temporaneo passati in memoria, senza modificare `.env`: **PASS**, 138 moduli,
1,23 s Vite e 1,860 s complessivi. Restano i warning preesistenti su
Browserslist e chunk principale da 648 kB.

`npm run lint` non e eseguibile nello stato corrente del repository:
lo script richiama `eslint`, ma il pacchetto non e dichiarato fra le
`devDependencies` e non e installato. Non sono state aggiunte dipendenze fuori
mandato. `node --check scripts/rls-tests/run.mjs` e `git diff --check` passano.

La preview locale `http://127.0.0.1:4175/login` ha autenticato
`ggetto@gmail.com`, instradato a `/dashboard` e mostrato 282 schede e 452
visite. Log errori browser: zero.

Per consentire anche la prova manuale di Luigi, su sua conferma e stata
impostata una nuova password **solo per questo account nel temporaneo**. E
stata consegnata esclusivamente tramite Appunti macOS, mai stampata in chat,
file o log, e resta attiva per lo spot-check di Luigi. Nessun account in prod o
demo e stato toccato.

Cinque schede recenti, con sequenze numeriche mascherate nel registro:

| Intestatario | Pet | Visite | Ultima visita | Contatto assorbito |
|---|---|---:|---|---:|
| Signora capodichino | Ariel, barboncino | 2 | 2026-08-13 | 1, link diretto |
| Davide e Nunzia | Nobu, Akita | 2 | 2026-08-11 | 1, link diretto |
| Moglie polleria [telefono mascherato] | Rocky, meticcio taglia media | 4 | 2026-08-10 | 1, link diretto |
| [telefono mascherato] | Specie JackRussel | 1 | 2026-08-08 | 1, link diretto |
| Carnevale [telefono mascherato] | Schila e Specie di Volpino | 3 | 2026-08-08 | 2, link diretto |

## 8. Durate per G6

La **somma delle sole chiamate DB necessarie alla ricetta**, ricostruita dai
registri GH-11, GH-12 e GH-13, e **84,343 s**:

| Tratto | Chiamate DB |
|---|---:|
| restore schema | 2,403 s |
| restore dati public/storage | 15,432 s |
| restore Auth | 11,318 s |
| pulizia dati test | 1,119 s |
| prepare legacy + split | 6,229 s |
| Gate 2, 23 migration | 36,306 s |
| drop irraggiungibili + phone NOT NULL | 2,657 s |
| GH-13 assorbimento + catena residua + hardening | 8,879 s |

Non sono inclusi nella somma: query di misura, il rerun di idempotenza, suite
RLS, build e i tentativi falliti interamente annullati.

Un unico **tempo di parete end-to-end** non e stato osservabile senza mentire:
GH-11, GH-12 e GH-13 erano separati da checkpoint obbligatori e pause di
decisione. Le misure di parete disponibili sono: Gate 2 **circa 37,6 s**;
GH-13 dalla prima scrittura alla migration hardening prevista **circa 2 min
44 s**; fino alla correzione del prerequisito `service_id` **circa 7 min 27 s**.
Quest'ultimo valore include diagnosi e due cicli RLS e non rappresenta il run
corretto futuro.

Per G6 si raccomanda quindi una finestra minima di **15 minuti per il tratto
DB**, che include ampio margine rispetto agli 84,343 s misurati e tempo per le
controprove. Vanno aggiunti separatamente i gesti manuali di Luigi: Storage
API per i due oggetti orfani, merge, deploy, promozione e verifica finale.

## 9. Ricetta ordinata e impronte

I dump di partenza restano quelli misurati in GH-11:

| File | SHA-256 |
|---|---|
| `grooming-prod-dump-20260821.sql` | `27c75ce2d01c42387110651243a479ba7e677cb4a712027c62b4be896597c5c7` |
| `grooming-prod-data-20260821.sql` | `c2c7fdb64edabc4d925814896fc0542382a1e6535c06645498a9c612678bd3a6` |
| `grooming-prod-auth-20260821.sql` | `7e3ac7d775f2e195cac892df0cf68101b61c737e3716c49407969c0bb7e5f3c6` |

Dopo restore schema/dati/Auth, la trascrizione G6 deve usare questo ordine.
L'ordine e intenzionale e prevale sui timestamp dei nomi file:

| # | File | SHA-256 |
|---:|---|---|
| 1 | `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | `8e60f6ba5d2d1adc11f4e079d1766527ab08533e5596c1e7203782ef5d5b4ff1` |
| 2 | `supabase/prod-migrations/20260824100000_cleanup_test_records_prod.sql` | `d8f883f7770ce71e1d0c0e01cca918c4ee1b0870b2b234d159fd4acac8f0c6d9` |
| 3 | `supabase/prod-migrations/20260424120000_split_clients_with_backfill_prod.sql` | `a184567baaf32fcd372b915fa2519cebd74c921aa18b9865d54796d6533ff3a2` |
| 4 | `supabase/migrations/20260424121000_tenants.sql` | `2052025095429ec806d9e932ff95e40f9b5d37870ca9d9ba58c433e82d21b292` |
| 5 | `supabase/migrations/20260424122000_tenant_memberships.sql` | `ff4c34ee5be27b11dc7558140404ae3d2e67a797e5c1eead4ca0ed8a213fb31f` |
| 6 | `supabase/migrations/20260424123000_profiles_auto_create_and_deprecate_role.sql` | `79a6ca30da4ef08076447c98fae1c907650cf98b75c89a7e3dfd40c1ba5603fe` |
| 7 | `supabase/migrations/20260424124000_helpers_has_tenant_access.sql` | `dec8aa73d76ab94b322d61dd2463029c1ac0fbf0d167effd3d9a791d4e345ff3` |
| 8 | `supabase/migrations/20260424125000_services.sql` | `88d0d9943589aa7c35ee4ce577e7aa3b47c4be7333d93e65bc56a96d1031d2bd` |
| 9 | `supabase/migrations/20260424126000_promotions.sql` | `2a3db05581024fecc6f3fc16bbf77eb188914aebf3fce0658c87270957a52040` |
| 10 | `supabase/migrations/20260424130000_tenant_id_nullable_and_backfill.sql` | `4bef1d203c4d799d612afb9f86f511aa13bcf80c200c581d5d3c0de483df5b32` |
| 11 | `supabase/migrations/20260424131000_tenant_id_indexes.sql` | `64c0ec1baf7831435977b1a6c4dd58a4d8f2ac304f5be2d4a8f56e6576d1aaa0` |
| 12 | `supabase/migrations/20260424132000_backfill_customers_stub.sql` | `e83f88e1ad5fcc1b6597c01b2471a0b15175b933adc5895169595a07a6b8e98b` |
| 13 | `supabase/migrations/20260424133000_tenant_id_enforce_not_null.sql` | `c50eee250871a02078c9dd649e6320c0e453134758163e0a0c37dff92f9b839f` |
| 14 | `supabase/migrations/20260424140000_rls_tenants.sql` | `7aea46bac40965a6d662a1e7082c98c49a1d2c19b7b235de88f76e6c93faa3e2` |
| 15 | `supabase/migrations/20260424140500_rls_tenant_memberships.sql` | `c79426a0b400f8aa67c58e36537eaac213babd8462e12366db5a2604a6b8a502` |
| 16 | `supabase/migrations/20260424141000_rls_profiles.sql` | `773ca540714559c2e43a842283a73a1962638e562b9b8a5a7247e163b71bf58e` |
| 17 | `supabase/migrations/20260424141500_rls_customers.sql` | `d735fab6008c9b1b7024499fe874d70a8ba8df3bcb1bd4afe2b567bb1c9e6a9a` |
| 18 | `supabase/migrations/20260424142000_rls_pets.sql` | `b7e8e309d8c831e2d4e75a88b31184ea4254b99249dd9c617aed9b5b0b4d386a` |
| 19 | `supabase/migrations/20260424142500_rls_visits.sql` | `df6b21efb01001979a410c191ae3d57c1a69fb0a20fc7a56c211ae04469be00a` |
| 20 | `supabase/migrations/20260424143000_rls_appointments.sql` | `e20be7c87092f2cc3c150dacfec081c72635306afaf7b0b1ca2d559ad7e6bd20` |
| 21 | `supabase/migrations/20260424143500_rls_contacts.sql` | `06a19ea18a740020d3c91b33a3cccffe3c7987f1303ea9f357af988f0ce1c230` |
| 22 | `supabase/migrations/20260424144000_rls_reward_points.sql` | `d02254741b1e77cb9bb5849f594bd291137cac12e490f182b2b37c34ec555873` |
| 23 | `supabase/migrations/20260424144500_rls_services.sql` | `9eb5ce4be170e1a2809fe05efd0fc8a5074710638e19fc1493e403ad5883bc77` |
| 24 | `supabase/migrations/20260424145000_rls_promotions.sql` | `9d4d19a9d1f6ab37788ba9f6cb89197c37cc6b7c31ce4b453b16dbdcf272a333` |
| 25 | `supabase/migrations/20260424145500_rls_customer_invitations.sql` | `a56c31593c57a64a4a531c38c6dd2cba70685dd5a7fb01d205c1898afc84283a` |
| 26 | `supabase/migrations/20260424150000_pet_avatars_bucket.sql` | `92a0b3be380a01830d336c3dabe0308e56b9f772b87abbe51f9803dc9572aef0` |
| 27 | `supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql` | `90cb9f416ccb18c6fd67c6956d5931ffb15c7ec28204f24c4e4e883dbe952277` |
| 28 | `supabase/prod-migrations/20260824120000_finalize_customers_phone_not_null_prod.sql` | `8cc8c2d38ba6dc0f84cb271d6a1e99adeb9d5aebaaccc3b5dd1bd3643d5a6065` |
| 29 | `supabase/prod-migrations/20260824140000_absorb_contacts_customer_first_prod.sql` | `02ea9a26f4b1db512093d201343e2777e9c74f652f769122796f10ca54036a8c` |
| 30 | `supabase/migrations/20260818060158_enforce_pets_customer_update_whitelist.sql` | `fa6844fa430b52aed3dc73b46d49c9d445e954bbcff7b47ce0e31cce264ba46a` |
| 31 | `supabase/migrations/20260818063103_fix_pet_avatar_customer_path_qualification.sql` | `e7117084826a69c3e8a6d02bae9fc873fa6e8b791fe697ddc6800ad2f6600c87` |
| 32 | `supabase/migrations/20260821031654_add_customer_with_pet.sql` | `442ba9bc8c7274958109ccedfe18a6c62d1ce21fc9c2d9f0ec2ef50fd59b6db9` |
| 33 | `supabase/migrations/20260520051506_add_service_id_to_appointments.sql` | `2e335febc3e8171d1bb12b2d25b8aa643300441f6e1353ccdfc22c9d5fa3f820` |
| 34 | `supabase/migrations/20260821090000_gh08_appointment_requests.sql` | `c3ca45fa6cbf42fa0f8c92cc3af8a624decf0d902d35e8050d4bdcb2512e6f86` |
| 35 | `supabase/prod-migrations/20260824150000_security_hardening_prod.sql` | `c9537584c2b768294cc58a4533fc43a2e522b517486ad1e3e5e81fb43bcb2c79` |

## 10. File della consegna e Git

| File | Azione | SHA-256 prima del commit |
|---|---|---|
| `docs/incarichi/GH-13-catena-residua-e-fase-3.md` | mandato Cowork incluso | `91acc555603f5acf29c0456f4342fd52c1a3d41c97aac69e80e467626c7e9acf` |
| `supabase/prod-migrations/20260824140000_absorb_contacts_customer_first_prod.sql` | creato | `02ea9a26f4b1db512093d201343e2777e9c74f652f769122796f10ca54036a8c` |
| `supabase/prod-migrations/20260824150000_security_hardening_prod.sql` | creato | `c9537584c2b768294cc58a4533fc43a2e522b517486ad1e3e5e81fb43bcb2c79` |
| `scripts/rls-tests/run.mjs` | parametrizzato, default demo invariati | `41c3e4bc35a767678b9d71868b991e27914a95a940781b714375816b068ae1cf` |
| `docs/consegne/GH-13-catena-residua-e-fase-3.md` | creato | calcolata nello stato finale |

Il commit e quello che contiene questo registro; l'hash viene comunicato nella
consegna finale, per evitare il riferimento circolare di un hash scritto dentro
il commit che lo determina. Nessun push.

## 11. Eccezioni, fuori istruzione e raccomandazioni

- Nessuna query o modifica su prod o demo; nessun oggetto Storage orfano
  indicato in GH-12 e stato toccato.
- Nessun atto concorrente rilevato nel worktree o nel temporaneo.
- Nessun secret, password, token o chiave privata e stato scritto o committato.
- La modifica temporanea della password staff e stata autorizzata da Luigi,
  limitata al temporaneo e lasciata attiva per il suo confronto manuale.
- L'applicazione del prerequisito `service_id` e una correzione necessaria
  emersa dalla suite; usa un file approvato preesistente e non allarga lo schema
  oltre il contratto GH-08.
- Il progetto temporaneo e la preview locale restano disponibili per Luigi.

**Indicazione a Cowork per G6:** trascrivere l'ordine del §9 senza affidarsi
all'ordinamento lessicale dei timestamp; inserire esplicitamente `service_id`
prima di `appointment_requests`; riservare almeno 15 minuti al tratto DB e
tenere fuori dalla somma i gesti Storage/API e di rilascio. Prima di ogni
scrittura prod, ripetere cardinalita, preflight contatti, firme/ACL hardening e
impronte dei file. Dopo la catena, eseguire suite RLS con sonde proprie,
advisor, login staff e confronto manuale delle cinque schede.
