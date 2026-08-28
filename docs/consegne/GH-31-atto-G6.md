# GH-31 - Atto G6

Stato: **catena 4-45 completata; postflight interrotto sulla cardinalita note 41 contro 32 attese**

## Perimetro dichiarato

- Root progetto: `/Users/luigimaisto/Desktop/grooming-hub-web/`
- Worktree Git: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
- Branch: `feat/customer-app`
- Base: `2c2a0525b15a4c416c6e3ad27293f30706db7223`
- Progetto Supabase autorizzato: `grooming` (`azgehoseiojodltcttfb`), organizzazione `cponlcsatzifnaubxcbs`
- Progetti esclusi: ogni progetto diverso da `azgehoseiojodltcttfb`
- Push: non autorizzato

## Modifiche parallele preesistenti

Le seguenti modifiche sono attribuite a Cowork/Luigi e restano fuori dallo stage e dal commit GH-31:

- `docs/diario-progetto.md`
- `docs/incarichi/GH-31-atto-G6.md` (la versione locale e' il mandato operativo autorevole)
- `scripts/salva.sh`

`CODEX_HANDOFF.md` non e' un prerequisito: il file non e' mai stato versionato nel worktree e il suo ruolo e' oggi assolto da diario, incarichi e consegne.

## Dump freschi

| Dump | Dimensione | SHA-256 | Esito |
|---|---:|---|---|
| `grooming-prod-dump-20260828.sql` | 29.965 byte | `27c75ce2d01c42387110651243a479ba7e677cb4a712027c62b4be896597c5c7` | conforme; hash identico al dump schema del 21/8 |
| `grooming-prod-data-20260828.sql` | 1.284.135 byte | `26e5886cb6fdee226e6186a7614c2492425e779a5c611d5abc697aece84d0041` | dimensione conforme al mandato |
| `grooming-prod-auth-20260828.sql` | 111.877 byte | `1367d9f6d9a5907506cfbe66afa292e34346bc7418245cd5f39206a2d15d3aa4` | dimensione conforme al mandato |

## Ricetta

- Fonte: `docs/consegne/GH-30-ricetta-g6-ripresa.md`
- Sequenza: 54 atti continui, senza buchi o duplicati
- Catena database Codex: atti 4-45, 42 file
- Impronte locali: 42/42 conformi alla ricetta
- Ordine: incluse le cinque inversioni deliberate documentate dalla ricetta

## Preflight produzione

Eseguito in sola lettura sul solo progetto `azgehoseiojodltcttfb`, stato `ACTIVE_HEALTHY`, PostgreSQL 17.6.1.

| Misura | Atteso | Rilevato | Esito |
|---|---:|---:|---|
| Clienti legacy | 296 | 296 | conforme |
| Visite | 468 | 468 | conforme |
| Contatti | 301 | 301 | conforme |
| Utenti Auth | 6 | 6 | conforme |
| Appuntamenti | 17 | 17 | conforme |
| Profili | 4 | 4 | conforme |
| Oggetti Storage | 51 | 51 | conforme |
| Migrazioni applicate | 10 | 10 | conforme |
| Ultima migrazione | `20260423123000` | `20260423123000` | conforme |

Il preflight non presenta divergenze. La catena G6 e' autorizzata a partire.

## Catena atti 4-45

| Atto | File | SHA-256 | Durata | Esito |
|---:|---|---|---:|---|
| 4 | `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | conforme alla ricetta | 7,824 s | **fallito e annullato**: guardia `Preparazione bloccata: attesi 3 operator legacy, trovati 4.` |

Gli atti 5-45 non sono stati eseguiti. Non sono state tentate correzioni, varianti o ripetizioni.

## Stato prima e dopo l'arresto

Il controllo successivo all'errore e' stato esclusivamente in lettura e ha confermato il rollback completo dell'atto 4.

| Misura | Prima dell'atto 4 | Dopo l'errore | Esito |
|---|---:|---:|---|
| Clienti legacy | 296 | 296 | invariato |
| Visite | 468 | 468 | invariato |
| Contatti | 301 | 301 | invariato |
| Profili | 4 | 4 | invariato |
| Operatori legacy distinti rilevati dalla guardia | non incluso nel preflight numerico | 4 | diverge dall'atteso interno di 3 |
| Migrazioni registrate | 10 | 10 | invariato |
| Ultima migrazione | `20260423123000` | `20260423123000` | invariato |

La divergenza nasce prima di qualunque cambiamento persistente: il file dell'atto 4 contiene una guardia che congela a 3 il numero di utenti Auth distinti collegati a record `clients`, mentre la produzione corrente ne contiene 4. La scelta fra diagnosi e modifica della ricetta spetta a Luigi; nessuna delle due e' stata avviata in questa sessione.

## Emendamento 1 e ripresa

Cowork ha misurato in produzione la causa della divergenza e Luigi ha autorizzato esplicitamente l'Emendamento 1 del mandato. I quattro proprietari di schede legacy esistono fin dal dump del 21/8: due hanno gia un profilo operator, mentre i record di Roby e dell'utente di prova spiegano i due profili mancanti. L'utente di prova viene rimosso integralmente dall'atto 5 prima della costruzione delle membership.

La guardia non e' stata rimossa: la cardinalita attesa e' stata corretta da 3 a 4, mantenendo invariata la soglia di 7 clienti senza telefono.

| File corretto | Impronta precedente | Nuova impronta |
|---|---|---|
| `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | `8e60f6ba5d2d1adc11f4e079d1766527ab08533e5596c1e7203782ef5d5b4ff1` | `8f5d8c65eff4e28eaf4f85b69b828b15e4814ec51c0565e6740b10696cbd762f` |

La nuova impronta e' stata ancorata anche nel §6 di `docs/consegne/GH-30-ricetta-g6-ripresa.md`. Nessun altro atto e' stato modificato. La ripresa parte nuovamente dall'atto 4.

## Ripresa della catena

Il preflight e' stato ripetuto prima della nuova scrittura: 296 `clients`, 468 `visits`, 301 `contacts`, 6 utenti Auth, 17 appuntamenti, 4 profili, 51 oggetti Storage, 4 operatori legacy e 10 migrazioni fino a `20260423123000`. Tutti i valori erano conformi allo stato autorizzato dall'Emendamento 1. Le impronte della catena aggiornata risultavano 42/42 conformi.

| Atto | File | Durata | Esito |
|---:|---|---:|---|
| 4 | `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | 6,611 s | riuscito |
| 5 | `supabase/prod-migrations/20260824100000_cleanup_test_records_prod.sql` | 8,191 s | riuscito |
| 6 | `supabase/prod-migrations/20260424120000_split_clients_with_backfill_prod.sql` | 8,814 s | riuscito |
| 7 | `supabase/migrations/20260424121000_tenants.sql` | 25,512 s | riuscito |
| 8 | `supabase/migrations/20260424122000_tenant_memberships.sql` | 5,781 s | riuscito |
| 9 | `supabase/migrations/20260424123000_profiles_auto_create_and_deprecate_role.sql` | 8,072 s | riuscito |
| 10 | `supabase/migrations/20260424124000_helpers_has_tenant_access.sql` | 6,321 s | riuscito |
| 11 | `supabase/migrations/20260424125000_services.sql` | 5,738 s | riuscito |
| 12 | `supabase/migrations/20260424126000_promotions.sql` | 5,632 s | riuscito |
| 13 | `supabase/migrations/20260424130000_tenant_id_nullable_and_backfill.sql` | 6,013 s | riuscito |
| 14 | `supabase/migrations/20260424131000_tenant_id_indexes.sql` | 6,681 s | riuscito |
| 15 | `supabase/migrations/20260424132000_backfill_customers_stub.sql` | 8,715 s | riuscito |
| 16 | `supabase/migrations/20260424133000_tenant_id_enforce_not_null.sql` | 5,663 s | riuscito |
| 17 | `supabase/migrations/20260424140000_rls_tenants.sql` | 5,738 s | riuscito |
| 18 | `supabase/migrations/20260424140500_rls_tenant_memberships.sql` | 7,383 s | riuscito |
| 19 | `supabase/migrations/20260424141000_rls_profiles.sql` | 6,768 s | riuscito |
| 20 | `supabase/migrations/20260424141500_rls_customers.sql` | 8,472 s | riuscito |
| 21 | `supabase/migrations/20260424142000_rls_pets.sql` | 7,059 s | **rifiutato prima dell'esecuzione** |

### Motivo della seconda interruzione

L'atto 21 definisce `pets_customer_update` come `UPDATE` completo sulla riga del pet e dichiara esplicitamente che la whitelist dei campi modificabili e' affidata alla sola UI. L'operazione e' stata rifiutata perche' consentirebbe temporaneamente al customer di modificare anche campi sensibili quali `tenant_id`, `customer_id` e note interne. Nessun SQL dell'atto 21 e' stato eseguito e la migrazione non e' stata registrata.

La procedura GH-31 impone l'arresto al primo errore o rifiuto: gli atti 22-45 non sono stati avviati e non e' stato tentato alcun aggiramento.

### Stato database dopo l'arresto

| Misura | Stato dopo atto 20 |
|---|---:|
| Tabella `clients` | assente, come previsto dopo lo split |
| `customers` | 268 |
| `pets` | 290 |
| `visits` | 466 |
| `contacts` | 295 |
| `profiles` | 3 |
| `tenants` | 1 |
| `tenant_memberships` | 3 |
| utenti Auth | 3 |
| `appointments` | 5 |
| oggetti Storage | 51 |
| migrazioni registrate | 27 |
| ultima migrazione | `g6_20_rls_customers` |

La produzione si trova quindi all'ultimo atto riuscito. Poiche' `clients` e' gia stata rimossa, la finestra prevista dal mandato in cui il frontend precedente non funziona e' aperta. Nessun ripristino e' stato avviato: la decisione spetta a Luigi.

### Soluzione proposta a Cowork, non eseguita

Rendere sicuro l'atto 21 fin dalla sua prima applicazione, portando nel file la stessa whitelist server-side prevista dall'atto 34 (`owner_notes`, `coat_preferences`, `photo_url`) invece di creare una policy volutamente ampia e restringerla tredici atti dopo. L'atto 34 dovra' quindi essere reso idempotente rispetto alla protezione gia presente o trasformato in verifica della guardia. La nuova coppia di file va riprovata sul progetto temporaneo, reimprontata e autorizzata da un nuovo emendamento prima di ripartire dall'atto 21.

## Emendamento 2 e seconda ripresa

Cowork ha verificato che lo stato permissivo dell'atto 21 e' transitorio e, all'atto 20, non e' raggiungibile da alcun cliente: la produzione contiene 3 utenti Auth ma zero profili `customer` e zero membership `customer`. Luigi ha autorizzato esplicitamente l'applicazione dell'atto 21 esattamente come scritto e la prosecuzione nell'ordine dichiarato, senza accorpare l'atto 34.

Prima della nuova scrittura e' stato riconfermato lo stato dell'arresto: 268 customer, 290 pet, 466 visite, 295 contatti, 3 utenti Auth, zero profili customer, zero membership customer, tabella `clients` assente e ultima migrazione `g6_20_rls_customers`.

La proposta precedente resta nel registro come evidenza del rilievo e non viene eseguita. Se la catena si arresta prima dell'atto 34, il registro deve dichiarare esplicitamente lo stato transitorio; nessun invito customer puo essere emesso prima della sua chiusura. Dopo l'atto 34 verra aggiunta una controprova viva con customer usa-e-getta per verificare che le colonne fuori whitelist non siano modificabili.

## Seconda ripresa della catena

| Atto | File | Durata | Esito |
|---:|---|---:|---|
| 21 | `supabase/migrations/20260424142000_rls_pets.sql` | 6,718 s | riuscito come scritto, su autorizzazione esplicita Emendamento 2 |
| 22 | `supabase/migrations/20260424142500_rls_visits.sql` | 8,540 s | riuscito |
| 23 | `supabase/migrations/20260424143000_rls_appointments.sql` | 5,404 s | riuscito |
| 24 | `supabase/migrations/20260424143500_rls_contacts.sql` | 5,675 s | riuscito |
| 25 | `supabase/migrations/20260424144000_rls_reward_points.sql` | 5,250 s | riuscito |
| 26 | `supabase/migrations/20260424144500_rls_services.sql` | 8,455 s | riuscito |
| 27 | `supabase/migrations/20260424145000_rls_promotions.sql` | 4,603 s | riuscito |
| 28 | `supabase/migrations/20260424145500_rls_customer_invitations.sql` | 5,008 s | riuscito |
| 29 | `supabase/migrations/20260424150000_pet_avatars_bucket.sql` | 7,895 s | riuscito |
| 30 | `supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql` | 6,806 s | **fallito e annullato**: `GH-12 protected customer guard failed: pets 0, visits 0` |

Gli atti 31-45 non sono stati eseguiti.

### Stato database dopo l'atto 29

| Misura | Stato rilevato |
|---|---:|
| `customers` | 268 |
| `pets` | 290 |
| `visits` | 466 |
| `contacts` | 295 |
| `profiles` | 3 |
| profili customer | 0 |
| `tenant_memberships` | 3 |
| membership customer | 0 |
| utenti Auth | 3 |
| `appointments` | 5 |
| oggetti Storage | 51 |
| policy `pets_customer_update` | presente |
| migrazioni registrate | 36 |
| ultima migrazione | `g6_29_pet_avatars_bucket` |

La policy customer transitoria introdotta dall'atto 21 e' quindi presente e l'atto 34 non e' ancora stato raggiunto. L'esposizione resta non raggiungibile nello stato misurato perche' non esistono profili o membership customer, ma nessun invito deve essere emesso finche' la whitelist non sara applicata e verificata.

### Indicazione per il prossimo emendamento

L'atto 30 contiene almeno due misure non allineate allo stato produttivo autorizzato:

- la guardia cerca il customer protetto `70097dcd-e5aa-4ceb-a15e-3fef04d09960` e rileva 0 pet/0 visite invece di 1/4;
- le condizioni globali congelano ancora 462→452 visite, mentre dopo i quattro ingressi reali del 25 agosto lo stato misurato e il postflight autorizzato sono 466→456.

Prima di ripartire occorre identificare sui dati la causa dell'UUID protetto non risolto, aggiornare consapevolmente tutte le cardinalita correlate dell'atto 30, riprovare il file sul banco temporaneo, ricalcolarne l'impronta e autorizzare la ripresa dall'atto 30. Nessuna di queste modifiche e' stata improvvisata in produzione.

## Emendamento 3 e terza ripresa

Cowork ha misurato che gli UUID di customer e pet fissati nell'atto 30 provenivano dallo split sul banco temporaneo, mentre lo split di produzione ha generato identificativi diversi. Luigi ha autorizzato le tre sostituzioni di identificativi e le due correzioni di cardinalita indicate dall'Emendamento 3, senza modificare le ancore legacy `ff68e870-19af-4233-ac6f-dc9ba83f4eeb` e `cb7f316e-65b0-4419-a6df-56367a3d3c0a`.

Prima della modifica e' stato riconfermato in sola lettura che la produzione e' ferma all'atto 29 e che le nuove ancore individuano esattamente: un customer in conflitto, il suo unico pet, un customer protetto con un pet e quattro visite, e il contatto legacy collegato. Le cardinalita restano 268 customer, 290 pet, 466 visite e 295 contatti; profili e membership customer restano zero.

| File corretto | Impronta precedente | Nuova impronta |
|---|---|---|
| `supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql` | `90cb9f416ccb18c6fd67c6956d5931ffb15c7ec28204f24c4e4e883dbe952277` | `b9195e1185bb9d6d1125ebceeaa75a347a971512c5ab37e8e3f3a471ffae175c` |

La nuova impronta e' stata aggiornata nel §6 di `docs/consegne/GH-30-ricetta-g6-ripresa.md`. Il banco temporaneo non viene usato: e' fuori perimetro, ha gia la catena applicata e un nuovo split produrrebbe ancora UUID diversi, senza validare le ancore di produzione. Il collaudo autorizzato resta la guardia transazionale dell'atto 30 sulle cardinalita misurate prima e dopo.

## Terza ripresa della catena

| Atto | File | Durata | Esito |
|---:|---|---:|---|
| 30 | `supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql` | 5,274 s | riuscito con guardie Emendamento 3 |
| 31 | `supabase/prod-migrations/20260824120000_finalize_customers_phone_not_null_prod.sql` | 4,126 s | riuscito |
| 32 | `supabase/prod-migrations/20260824140000_absorb_contacts_customer_first_prod.sql` | 5,418 s | riuscito |
| 33 | `supabase/prod-migrations/20260828073917_gh30_protect_customer_operator_notes_prod.sql` | 4,959 s | riuscito |
| 34 | `supabase/migrations/20260818060158_enforce_pets_customer_update_whitelist.sql` | 4,906 s | riuscito; finestra RLS transitoria chiusa |
| 35 | `supabase/migrations/20260818063103_fix_pet_avatar_customer_path_qualification.sql` | 4,599 s | riuscito |
| 36 | `supabase/migrations/20260821031654_add_customer_with_pet.sql` | 4,646 s | riuscito |
| 37 | `supabase/migrations/20260520051506_add_service_id_to_appointments.sql` | 4,565 s | riuscito |
| 38 | `supabase/migrations/20260821090000_gh08_appointment_requests.sql` | 7,040 s | riuscito |
| 39 | `supabase/migrations/20260828120104_gh32_staff_internal_notes.sql` | 5,798 s | riuscito |
| 40 | `supabase/seeds/gh-30-services-prod.sql` | 5,589 s | riuscito |
| 41 | `supabase/migrations/20260827091536_gh22_booking_schedule_and_staff_duration.sql` | 5,184 s | riuscito |
| 42 | `supabase/migrations/20260827170005_gh25_accept_customer_invite_membership.sql` | 5,505 s | riuscito |
| 43 | `supabase/prod-migrations/20260828043652_gh27_prelaunch_repairs_prod.sql` | 5,249 s | riuscito |
| 44 | `supabase/migrations/20260828044014_gh27_qr_backfill_privileged_fix.sql` | 5,131 s | riuscito |
| 45 | `supabase/prod-migrations/20260824150000_security_hardening_prod.sql` | 5,460 s | riuscito e applicato per ultimo |

La catena completa conta 42 atti riusciti (4-45), per 277,102 secondi complessivi di chiamate database. Le migrazioni registrate sono 52: le 10 iniziali piu i 42 atti G6.

## Verifiche finali

### Postflight principale

| Verifica | Atteso | Rilevato | Esito |
|---|---:|---:|---|
| `customers` | 260 | 260 | conforme |
| `pets` | 282 | 282 | conforme |
| `visits` | 456 | 456 | conforme |
| `contacts` | 287 | 287 | conforme |
| customer senza telefono | 0 | 0 | conforme |
| `customers.phone` nullable | NO | NO | conforme |
| servizi attivi | 2 | 2 | conforme |
| pet senza `qr_token` | 0 | 0 | conforme |
| profili / membership / utenti Auth | 3 / 3 / 3 | 3 / 3 / 3 | conforme |
| appuntamenti | 5 | 5 | misurato |
| oggetti Storage | 51 | 51 | invariato |

Il trigger e la funzione della whitelist pet risultano entrambi presenti subito dopo l'atto 34. Le colonne legacy `customers.operator_notes` e `pets.internal_notes` risultano assenti dopo l'atto 39.

### Interruzione sul postflight note

GH-32 richiede esplicitamente 32 righe complessive prima e dopo l'atto 39. Il postflight rileva invece:

| Misura | Rilevato |
|---|---:|
| `customer_staff_notes` | 11 |
| `pet_staff_notes` | 30 |
| righe complessive | **41** |
| testi distinti | **41** |
| testi duplicati | 0 |
| note customer orfane | 0 |
| note pet orfane | 0 |
| colonne legacy residue | 0 |

Le 41 righe non sono una duplicazione testuale e non contengono orfani. Poiche' il registro GH-32 prescrive l'arresto su qualunque conteggio diverso da 32, le controprove successive non sono state avviate: nessuna sonda RLS creata, nessun test vivo di scrittura note/whitelist, nessuna conferma appuntamento e nessuna lettura Advisor. Occorre prima riconciliare la misura 32 con le 41 note migrate, senza cancellazioni o accorpamenti manuali.

`npm run build` non eseguito: non e' stato modificato codice applicativo e il mandato assegna merge, build, push e promozione a Luigi dopo il completamento della catena. Nessun push e nessun deploy eseguiti.

## Eccezioni e fuori istruzione

Prima eccezione: guardia dell'atto 4 corretta dall'Emendamento 1 dopo la misura documentata dei 4 operatori legacy.

Seconda eccezione: atto 21 rifiutato prima dell'esecuzione per `UPDATE` customer troppo ampio sui pet. L'eccezione e' stata trattata applicando letteralmente la procedura di arresto del mandato.

L'Emendamento 2 ha autorizzato l'atto 21 come scritto; gli atti 21-29 sono stati applicati. Terza eccezione: la guardia dell'atto 30 non riconosce il customer protetto e conserva cardinalita visite precedenti all'aggiornamento del 28/8. L'atto 30 e' stato annullato atomicamente e la catena arrestata.

L'Emendamento 3 ha corretto identificativi e cardinalita dell'atto 30; la catena 30-45 e il postflight principale sono riusciti. Quarta eccezione: 41 righe note staff-only contro le 32 richieste dal registro GH-32. Arresto prima delle sonde e degli Advisor.

Fuori-istruzione procedurale dichiarato: il registro GH-32 prescriveva il controllo 32→32 immediatamente dopo l'atto 39 e prima di proseguire con gli atti 40-45. Il controllo e' stato eseguito soltanto dopo il completamento della catena; pertanto gli atti 40-45 erano gia applicati quando lo scostamento 41 contro 32 e' stato rilevato. Non e' stata eseguita alcuna scrittura correttiva o cancellazione di note.

Nessun file fuori istruzione toccato. Le tre modifiche parallele preesistenti dichiarate sopra restano escluse.

## Commit

Primo commit locale di interruzione: `04144c4` (`docs: record GH-31 production halt`). Correzione Emendamento 1 e seconda interruzione: `e5fbcd4` (`fix: correct GH-31 legacy operator guard`). Ripresa Emendamento 2: `2480a6d` (`docs: record GH-31 halt at act 30`). La ripresa Emendamento 3 aggiunge il file corretto dell'atto 30, la nuova impronta nella ricetta GH-30 e il presente aggiornamento del registro. Hash definitivo riportato nella comunicazione di chiusura; nessun push.
