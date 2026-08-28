# Consegna GH-30 - Ricetta G6 aggiornata e protezione operator notes

**Root dichiarata come primo atto:** `/Users/luigimaisto/Desktop/grooming-hub-web/`

**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`

**Stato:** in esecuzione

**Branch:** `feat/customer-app`

**Base Git:** `631992accebb60cb8ba17f423367b237bae882e7`

Il mandato produce esclusivamente file e documentazione. Nessun database demo,
di produzione o temporaneo viene modificato.

Modifiche parallele presenti all'ingresso e escluse da stage e commit GH-30:

- `docs/diario-progetto.md`, aggiornamento Cowork collegato a GH-29/GH-30;
- `scripts/salva.sh`, modifica locale preesistente gia esclusa in GH-29.

## 1. Esito

La ricetta G6 e aggiornata con:

- la protezione prod-safe mancante su `customers.operator_notes`;
- una variante prod-safe di GH-27, necessaria per eliminare dal file il
  riferimento esplicito all'ambiente demo;
- le migration GH-22, GH-25 e GH-27 QR gia neutrali, riusate senza copie;
- il seed non distruttivo dei servizi Bagno e Taglio;
- l'esclusione motivata della migration legacy `20260511070742`;
- l'hardening spostato in fondo, dopo tutte le migration che sostituiscono
  funzioni sottoposte a hardening.

Nessun file e stato applicato a un database.

## 2. Varianti prod-safe

| Atto mancante | File scelto per G6 | Misura | Esito |
|---|---|---|---|
| GH-22 | `supabase/migrations/20260827091536_gh22_booking_schedule_and_staff_duration.sql` | il tenant e selezionato con `slug = 'grooming-hub'`, chiave stabile creata dalla catena; nessun UUID o riferimento ambiente | applicabile cosi com'e |
| GH-25 | `supabase/migrations/20260827170005_gh25_accept_customer_invite_membership.sql` | opera sui dati dell'invito corrente e su `auth.uid()`; nessun dato ambiente | applicabile cosi com'e |
| GH-27 principale | `supabase/prod-migrations/20260828043652_gh27_prelaunch_repairs_prod.sql` | l'originale conteneva la parola `demo` nell'intestazione; la variante ha SQL operativo identico dopo l'intestazione | variante necessaria |
| GH-27 fix QR | `supabase/migrations/20260828044014_gh27_qr_backfill_privileged_fix.sql` | nessun dato o cardinalita ambiente | applicabile cosi com'e |

Scansione sui quattro atti selezionati, sulla protezione GH-30 e sul seed: zero
project ref demo/prod/temporaneo, zero account sonda o customer di prova, zero
UUID letterali e zero occorrenze della parola `demo`. `gen_random_uuid()` e il
tipo `uuid` sono costrutti, non identificativi ambiente.

## 3. Protezione `operator_notes`

Il nuovo atto
`supabase/prod-migrations/20260828073917_gh30_protect_customer_operator_notes_prod.sql`
si colloca dopo l'assorbimento contatti, che crea la funzione da estendere, e
prima dell'hardening finale. Le invarianti sono esplicite nel file:

- una guardia arresta l'atto se funzione prerequisita o colonna non esistono;
- per un attore non-staff vengono ripristinati da `OLD`
  `acquisition_source`, `relationship_status` e `operator_notes`;
- il trigger scatta anche quando l'UPDATE nomina soltanto `operator_notes`;
- lo staff passa senza riscritture;
- restano `SECURITY INVOKER`, `search_path = ''` e la revoca a `PUBLIC`,
  `anon`, `authenticated` e `service_role`;
- `CREATE OR REPLACE FUNCTION` e `DROP/CREATE TRIGGER` rendono l'atto
  riapplicabile allo stesso stato finale.

Le controprove sono statiche per vincolo del mandato, che vieta di applicare i
file: assegnazioni `NEW := OLD`, lista `BEFORE UPDATE OF`, profilo funzione e
revoche sono state verificate automaticamente, 7/7. Le prove vive non sono
state eseguite e restano parte del futuro atto G6 sul bersaglio autorizzato.

Il trigger pet non viene modificato dal nuovo atto.

## 4. Seed servizi

`supabase/seeds/gh-30-services-prod.sql` seleziona il tenant tramite lo slug
stabile e inserisce:

| Nome | Descrizione | `price_cents` | `duration_minutes` |
|---|---|---:|---:|
| Bagno | solo bagno | 2000 | 45 |
| Taglio | include il bagno | 3000 | 90 |

Per ogni nome il seed usa `WHERE NOT EXISTS` sullo stesso tenant e sul nome
normalizzato. Non contiene `UPDATE`, `UPSERT` o `ON CONFLICT DO UPDATE`: una
riga esistente, inclusi prezzo, durata, descrizione, stato e ordine, resta
inalterata. Alla seconda esecuzione entrambe le righe soddisfano la clausola di
esistenza e vengono inserite zero righe. Un advisory lock transazionale scoped
al tenant serializza anche due esecuzioni concorrenti. Se il tenant non esiste,
il seed si ferma invece di concludere silenziosamente.

## 5. Esclusione intenzionale di `20260511070742`

`supabase/migrations/20260511070742_enforce_staff_only_notes_columns.sql` non
compare nella ricetta, deliberatamente:

- `pets.internal_notes` e coperto meglio da
  `trg_pets_customer_update_whitelist`, che ripristina tutta la riga e riapre
  solo `owner_notes`, `coat_preferences` e `photo_url`;
- `customers.operator_notes` e ora coperto dall'atto GH-30, insieme ai due
  campi directory gia protetti;
- non vengono reintrodotte le due funzioni legacy `SECURITY DEFINER`, la cui
  assenza e un preflight esplicito dell'hardening prod.

La copertura in scrittura e quindi pari o migliore senza duplicare trigger.

## 6. Ricetta unica ordinata

I primi tre file sono gli input storici con cui la prova generale ha ricostruito
lo stato di partenza. In G6 il dump fresco richiesto dal cancello di GH-14 resta
il primo paracadute; questi tre sono il secondo paracadute. Dopo il restore
schema/dati/Auth, se necessario per una ricostruzione, gli atti SQL vanno
trascritti nell'ordine seguente. Non usare `supabase db push`.

| # | Tipo | File o gesto | SHA-256 | Provenienza |
|---:|---|---|---|---|
| 1 | dump schema | `grooming-prod-dump-20260821.sql` | `27c75ce2d01c42387110651243a479ba7e677cb4a712027c62b4be896597c5c7` | GH-11, 29.965 byte |
| 2 | dump dati | `grooming-prod-data-20260821.sql` | `c2c7fdb64edabc4d925814896fc0542382a1e6535c06645498a9c612678bd3a6` | GH-11, 1.327.527 byte |
| 3 | dump Auth | `grooming-prod-auth-20260821.sql` | `7e3ac7d775f2e195cac892df0cf68101b61c737e3716c49407969c0bb7e5f3c6` | GH-11, 117.907 byte |
| 4 | migration | `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | `8e60f6ba5d2d1adc11f4e079d1766527ab08533e5596c1e7203782ef5d5b4ff1` | GH-13 atto 1 |
| 5 | migration | `supabase/prod-migrations/20260824100000_cleanup_test_records_prod.sql` | `d8f883f7770ce71e1d0c0e01cca918c4ee1b0870b2b234d159fd4acac8f0c6d9` | GH-13 atto 2 |
| 6 | migration | `supabase/prod-migrations/20260424120000_split_clients_with_backfill_prod.sql` | `a184567baaf32fcd372b915fa2519cebd74c921aa18b9865d54796d6533ff3a2` | GH-13 atto 3 |
| 7 | migration | `supabase/migrations/20260424121000_tenants.sql` | `2052025095429ec806d9e932ff95e40f9b5d37870ca9d9ba58c433e82d21b292` | GH-13 atto 4 |
| 8 | migration | `supabase/migrations/20260424122000_tenant_memberships.sql` | `ff4c34ee5be27b11dc7558140404ae3d2e67a797e5c1eead4ca0ed8a213fb31f` | GH-13 atto 5 |
| 9 | migration | `supabase/migrations/20260424123000_profiles_auto_create_and_deprecate_role.sql` | `79a6ca30da4ef08076447c98fae1c907650cf98b75c89a7e3dfd40c1ba5603fe` | GH-13 atto 6 |
| 10 | migration | `supabase/migrations/20260424124000_helpers_has_tenant_access.sql` | `dec8aa73d76ab94b322d61dd2463029c1ac0fbf0d167effd3d9a791d4e345ff3` | GH-13 atto 7 |
| 11 | migration | `supabase/migrations/20260424125000_services.sql` | `88d0d9943589aa7c35ee4ce577e7aa3b47c4be7333d93e65bc56a96d1031d2bd` | GH-13 atto 8 |
| 12 | migration | `supabase/migrations/20260424126000_promotions.sql` | `2a3db05581024fecc6f3fc16bbf77eb188914aebf3fce0658c87270957a52040` | GH-13 atto 9 |
| 13 | migration | `supabase/migrations/20260424130000_tenant_id_nullable_and_backfill.sql` | `4bef1d203c4d799d612afb9f86f511aa13bcf80c200c581d5d3c0de483df5b32` | GH-13 atto 10 |
| 14 | migration | `supabase/migrations/20260424131000_tenant_id_indexes.sql` | `64c0ec1baf7831435977b1a6c4dd58a4d8f2ac304f5be2d4a8f56e6576d1aaa0` | GH-13 atto 11 |
| 15 | migration | `supabase/migrations/20260424132000_backfill_customers_stub.sql` | `e83f88e1ad5fcc1b6597c01b2471a0b15175b933adc5895169595a07a6b8e98b` | GH-13 atto 12 |
| 16 | migration | `supabase/migrations/20260424133000_tenant_id_enforce_not_null.sql` | `c50eee250871a02078c9dd649e6320c0e453134758163e0a0c37dff92f9b839f` | GH-13 atto 13 |
| 17 | migration | `supabase/migrations/20260424140000_rls_tenants.sql` | `7aea46bac40965a6d662a1e7082c98c49a1d2c19b7b235de88f76e6c93faa3e2` | GH-13 atto 14 |
| 18 | migration | `supabase/migrations/20260424140500_rls_tenant_memberships.sql` | `c79426a0b400f8aa67c58e36537eaac213babd8462e12366db5a2604a6b8a502` | GH-13 atto 15 |
| 19 | migration | `supabase/migrations/20260424141000_rls_profiles.sql` | `773ca540714559c2e43a842283a73a1962638e562b9b8a5a7247e163b71bf58e` | GH-13 atto 16 |
| 20 | migration | `supabase/migrations/20260424141500_rls_customers.sql` | `d735fab6008c9b1b7024499fe874d70a8ba8df3bcb1bd4afe2b567bb1c9e6a9a` | GH-13 atto 17 |
| 21 | migration | `supabase/migrations/20260424142000_rls_pets.sql` | `b7e8e309d8c831e2d4e75a88b31184ea4254b99249dd9c617aed9b5b0b4d386a` | GH-13 atto 18 |
| 22 | migration | `supabase/migrations/20260424142500_rls_visits.sql` | `df6b21efb01001979a410c191ae3d57c1a69fb0a20fc7a56c211ae04469be00a` | GH-13 atto 19 |
| 23 | migration | `supabase/migrations/20260424143000_rls_appointments.sql` | `e20be7c87092f2cc3c150dacfec081c72635306afaf7b0b1ca2d559ad7e6bd20` | GH-13 atto 20 |
| 24 | migration | `supabase/migrations/20260424143500_rls_contacts.sql` | `06a19ea18a740020d3c91b33a3cccffe3c7987f1303ea9f357af988f0ce1c230` | GH-13 atto 21 |
| 25 | migration | `supabase/migrations/20260424144000_rls_reward_points.sql` | `d02254741b1e77cb9bb5849f594bd291137cac12e490f182b2b37c34ec555873` | GH-13 atto 22 |
| 26 | migration | `supabase/migrations/20260424144500_rls_services.sql` | `9eb5ce4be170e1a2809fe05efd0fc8a5074710638e19fc1493e403ad5883bc77` | GH-13 atto 23 |
| 27 | migration | `supabase/migrations/20260424145000_rls_promotions.sql` | `9d4d19a9d1f6ab37788ba9f6cb89197c37cc6b7c31ce4b453b16dbdcf272a333` | GH-13 atto 24 |
| 28 | migration | `supabase/migrations/20260424145500_rls_customer_invitations.sql` | `a56c31593c57a64a4a531c38c6dd2cba70685dd5a7fb01d205c1898afc84283a` | GH-13 atto 25 |
| 29 | migration | `supabase/migrations/20260424150000_pet_avatars_bucket.sql` | `92a0b3be380a01830d336c3dabe0308e56b9f772b87abbe51f9803dc9572aef0` | GH-13 atto 26 |
| 30 | migration | `supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql` | `90cb9f416ccb18c6fd67c6956d5931ffb15c7ec28204f24c4e4e883dbe952277` | GH-13 atto 27 |
| 31 | migration | `supabase/prod-migrations/20260824120000_finalize_customers_phone_not_null_prod.sql` | `8cc8c2d38ba6dc0f84cb271d6a1e99adeb9d5aebaaccc3b5dd1bd3643d5a6065` | GH-13 atto 28 |
| 32 | migration | `supabase/prod-migrations/20260824140000_absorb_contacts_customer_first_prod.sql` | `02ea9a26f4b1db512093d201343e2777e9c74f652f769122796f10ca54036a8c` | GH-13 atto 29 |
| 33 | migration | `supabase/prod-migrations/20260828073917_gh30_protect_customer_operator_notes_prod.sql` | `3fa8a3f99192b352eac0bbda69dd44c46076ba00d758302aeaa8dc6da89f8cf0` | GH-30 protezione mancante |
| 34 | migration | `supabase/migrations/20260818060158_enforce_pets_customer_update_whitelist.sql` | `fa6844fa430b52aed3dc73b46d49c9d445e954bbcff7b47ce0e31cce264ba46a` | GH-13 atto 30 |
| 35 | migration | `supabase/migrations/20260818063103_fix_pet_avatar_customer_path_qualification.sql` | `e7117084826a69c3e8a6d02bae9fc873fa6e8b791fe697ddc6800ad2f6600c87` | GH-13 atto 31 |
| 36 | migration | `supabase/migrations/20260821031654_add_customer_with_pet.sql` | `442ba9bc8c7274958109ccedfe18a6c62d1ce21fc9c2d9f0ec2ef50fd59b6db9` | GH-13 atto 32 |
| 37 | migration | `supabase/migrations/20260520051506_add_service_id_to_appointments.sql` | `2e335febc3e8171d1bb12b2d25b8aa643300441f6e1353ccdfc22c9d5fa3f820` | GH-13 atto 33, prerequisito del seguente |
| 38 | migration | `supabase/migrations/20260821090000_gh08_appointment_requests.sql` | `c3ca45fa6cbf42fa0f8c92cc3af8a624decf0d902d35e8050d4bdcb2512e6f86` | GH-13 atto 34 |
| 39 | migration | `supabase/migrations/20260828120104_gh32_staff_internal_notes.sql` | `50b6de8cb6df7b2a19cd506694bb1df9af4ad1a21c1f4db32c6e50d923045940` | GH-32, note staff-only e contract colonne legacy |
| 40 | seed | `supabase/seeds/gh-30-services-prod.sql` | `cd416268a93dcf471b272bf326583a47fb5277027396488d6dc996d25e05ffa5` | GH-30, decisione Davide/Luigi 28/8 |
| 41 | migration | `supabase/migrations/20260827091536_gh22_booking_schedule_and_staff_duration.sql` | `5691601a5322b60f5e4a63328c660e54ac56797a253ab8b1e53de71f0fce2bcb` | GH-22, neutra |
| 42 | migration | `supabase/migrations/20260827170005_gh25_accept_customer_invite_membership.sql` | `b26bf374e75905887b27b27fbdc568f6dfd5980b3ee50b3f43ded7af85609f8e` | GH-25, neutra |
| 43 | migration | `supabase/prod-migrations/20260828043652_gh27_prelaunch_repairs_prod.sql` | `90d5b1c563e892d32f65d8961802bda471028c34349f07acf6bc8bd3f438654f` | GH-27, variante prod-safe GH-30 |
| 44 | migration | `supabase/migrations/20260828044014_gh27_qr_backfill_privileged_fix.sql` | `4d32cc32f535d27ccf373f8b0d88a86962f1fe06aaf8ecaaa808a07a1e203a70` | GH-27 follow-up, neutra |
| 45 | migration | `supabase/prod-migrations/20260824150000_security_hardening_prod.sql` | `c9537584c2b768294cc58a4533fc43a2e522b517486ad1e3e5e81fb43bcb2c79` | GH-13 atto 35, spostato in fondo |
| 46 | gesto Luigi | merge locale `feat/customer-app` -> `main` | n/a | GH-14; solo dopo catena e controprove DB riuscite |
| 47 | gesto Luigi | `npm run build` sul `main` risultante | n/a | cancello obbligatorio prima del push |
| 48 | gesto Luigi | push e promozione Vercel Production di `grooming-hub-webapp` | n/a | GH-14 |
| 49 | gesto Luigi | verifica live: login staff, dashboard, rubrica, e **cinque schede di clienti riconoscibili** — nomi che Luigi sa a memoria, con i loro cani e le loro visite. Assorbe lo spot-check che GH-31 collocava prima della migrazione: il confronto dei dati è già stato fatto da Cowork il 25/8 e coincide, incluso il caso Carnevale (due schede legacy fuse in un cliente con due cani e tutte e tre le visite). Qui resta l'occhio, e si fa sulla cosa vera invece che sul banco di prova | n/a | GH-14, modificato 28/8 con Luigi |
| 50 | gesto Luigi | rimuovere via Storage API `cb7f316e-65b0-4419-a6df-56367a3d3c0a/301a4643-3ed8-49fc-920e-ba4ca806a927-1775057002870.jpg` | n/a | GH-12 sezione 4 |
| 51 | gesto Luigi | rimuovere via Storage API `cb7f316e-65b0-4419-a6df-56367a3d3c0a/04bc45e9-d5f5-47d5-be43-26115fb970ab-1773492470924.jpg` | n/a | GH-12 sezione 4 |
| 52 | gesto Luigi | revocare a Codex l'accesso all'organizzazione Supabase di produzione | n/a | GH-14 |
| 53 | gesto Luigi | attivare Leaked password protection sul progetto prod | n/a | GH-14, dopo la migrazione |
| 54 | gesto Luigi | smontare il progetto temporaneo solo dopo G6 riuscito e verificato | n/a | GH-14 |

### Perche l'ordine non e alfabetico

- L'atto 4 (`...110000_prepare...`) precede l'atto 5
  (`...100000_cleanup...`): la preparazione mette in sicurezza i dati che la
  pulizia seleziona.
- L'atto 30 (`...130000_drop...`) precede l'atto 31
  (`...120000_finalize...`): le righe irrecuperabili vanno eliminate prima di
  rendere `customers.phone` obbligatorio.
- L'atto 37, nonostante il timestamp di maggio, deve stare immediatamente prima
  dell'atto 38: `service_id` e prerequisito di `appointment_requests`.
- L'atto 39 segue GH-30 e le RPC degli atti 32 e 36: prima conserva e usa le
  colonne legacy; poi sposta le note, sostituisce le RPC e rimuove le colonne.
- L'atto 45 ha timestamp 24/8 ma resta dopo gli atti 27-28/8: GH-25 e GH-27
  sostituiscono funzioni; l'hardening deve operare sulle definizioni finali.

## 7. Controprove e impronte

| Controprova | Esito misurato |
|---|---|
| 35 file della ricetta GH-13 ancora esistenti e con hash invariato | 35/35 |
| 7 nuovi file SQL/seed presenti e con hash dichiarato | 7/7 |
| SQL operativo variante GH-27 uguale all'originale, intestazioni escluse | identico |
| identificativi/riferimenti/cardinalita ambiente nei 7 file selezionati | 0 |
| asserzioni statiche su trigger, revoche, seed e variante | 19/19 |
| verifica automatica ricetta, dipendenze ed esclusione | 42/42 hash; sequenza 1-54 continua |
| `npm run build` | riuscita, Vite 147 moduli, 1,34 s |
| ordine della ricetta uguale all'ordine alfabetico | no; cinque inversioni motivate sopra |
| applicazioni a database | GH-32 solo sul demo; produzione 0 |

Eccezione: i tre dump del 21/8 non sono presenti sotto la root del progetto ne
sono reperibili dall'indice locale del Mac. Le dimensioni e le impronte in
tabella sono quelle misurate e registrate due volte in GH-11, non una nuova
misura GH-30. Prima di G6 Luigi deve recuperarli come secondo paracadute oppure
registrare esplicitamente che il dump fresco e il backup Supabase Pro li
sostituiscono. Non vanno ricreati, committati o dedotti dagli hash.

## 8. Rischio GH-30 chiuso da GH-32

GH-32 adotta la soluzione separata prevista da questo registro: note in
`customer_staff_notes` e `pet_staff_notes`, entrambe con RLS staff-only, e
rimozione delle colonne `customers.operator_notes` e `pets.internal_notes`.
La sessione customer reale sul demo ha misurato zero righe leggibili, due
scritture negate e le due colonne legacy assenti. In G6 il preflight e il
postflight dell'atto 39 devono registrare il conteggio produzione **32 -> 32**.

## 9. File della consegna

| File | Azione | SHA-256 pre-commit |
|---|---|---|
| `docs/incarichi/GH-30-ricetta-g6-ripresa.md` | mandato Cowork ricevuto, incluso nel commit | `d260988be414372a800dd6495c687167b77d5444ee1490a2a1cc7f3b96eda3c7` |
| `docs/consegne/GH-30-ricetta-g6-ripresa.md` | registro e ricetta completa | calcolata sullo stato finale |
| `supabase/prod-migrations/20260828043652_gh27_prelaunch_repairs_prod.sql` | variante prod-safe creata | `90d5b1c563e892d32f65d8961802bda471028c34349f07acf6bc8bd3f438654f` |
| `supabase/prod-migrations/20260828073917_gh30_protect_customer_operator_notes_prod.sql` | migration prod-safe creata | `3fa8a3f99192b352eac0bbda69dd44c46076ba00d758302aeaa8dc6da89f8cf0` |
| `supabase/migrations/20260828120104_gh32_staff_internal_notes.sql` | migration GH-32 aggiunta alla ricetta | `50b6de8cb6df7b2a19cd506694bb1df9af4ad1a21c1f4db32c6e50d923045940` |
| `supabase/seeds/gh-30-services-prod.sql` | seed idempotente creato | `cd416268a93dcf471b272bf326583a47fb5277027396488d6dc996d25e05ffa5` |

## 10. Eccezioni e fuori istruzione

- Nessun database letto o modificato; nessun progetto Supabase selezionato.
- Nessun secret, token, password o chiave committibile letto o scritto.
- Nessun push, deploy, merge o promozione eseguiti.
- La build segnala soltanto Browserslist non aggiornato e il chunk principale
  oltre 500 kB; sono avvisi preesistenti, non errori GH-30.
- `docs/diario-progetto.md` e `scripts/salva.sh` restano modifiche parallele
  fuori da stage e commit.
- La perdita di riservatezza richiamata da GH-30 e chiusa da GH-32 sul demo e
  inserita come atto 39 nella ricetta G6; produzione non e stata toccata.
