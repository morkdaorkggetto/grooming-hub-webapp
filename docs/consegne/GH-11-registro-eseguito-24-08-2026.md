# GH-11 — Registro completo degli atti effettivamente eseguiti il 24/08/2026

**Progetto temporaneo:** `grooming-prova-generale` (`xkieyzuhtpiysjugtdik`)
**Stato della consegna:** registro completo del lavoro eseguito, non chiusura di GH-11
**Fuso orario degli orari:** Europe/Rome, CEST (UTC+2)
**Confine:** dopo la richiesta di Luigi non è stata eseguita alcuna ulteriore lettura o scrittura sul database. Questo documento è ricostruito esclusivamente dalle tracce locali della sessione e dai file locali.

## 1. Esito in breve

Il restore schema → dati → auth è riuscito e la controprova ha restituito esattamente le cardinalità del dump prod: **296 clients, 464 visits, 301 contacts e 6 utenti Auth**.

Prima dello split sono poi stati rimossi, su decisione esplicita, sei record legacy di prova/non reali e i loro dati relazionali. Le cardinalità sono quindi passate in modo spiegato a **290 clients, 462 visits e 295 contacts**. Lo split prod-safe ha prodotto **290 pets e 268 customers**, senza orfani nelle tabelle operative misurate. La differenza 290→268 è la deduplicazione per telefono normalizzato di proprietari con più animali, non una perdita di pet.

Il lavoro si è fermato al preflight dei contatti, davanti a **un caso di conflitto** e **sette customer senza telefono reale** che richiedevano decisione manuale. Non sono stati applicati il backfill contatti, l'atto finale `phone NOT NULL`, la restante catena prod, la suite RLS, il collaudo dell'app o lo smontaggio del temporaneo.

## 2. Impronte dichiarate prima del restore

| Dump del 21/08 | Byte | SHA-256 |
|---|---:|---|
| `grooming-prod-dump-20260821.sql` | 29.965 | `27c75ce2d01c42387110651243a479ba7e677cb4a712027c62b4be896597c5c7` |
| `grooming-prod-data-20260821.sql` | 1.327.527 | `c2c7fdb64edabc4d925814896fc0542382a1e6535c06645498a9c612678bd3a6` |
| `grooming-prod-auth-20260821.sql` | 117.907 | `7e3ac7d775f2e195cac892df0cf68101b61c737e3716c49407969c0bb7e5f3c6` |

Il progetto era visibile al collegamento Codex ed era `ACTIVE_HEALTHY`. Nessuna password, token, hash o riga Auth è stata scritta in chat o nel repository.

## 3. Restore dello schema

| Ora | Atto | Durata | Misura successiva |
|---|---|---:|---|
| 09:41:41.765 | applicazione `restore_prod_schema_20260821` | 2,403 s | misura alle 09:41:49.343: 8 tabelle legacy presenti e vuote; 3 funzioni attese presenti |

Cardinalità dopo lo schema: `clients=0`, `visits=0`, `contacts=0`, `appointments=0`, `customer_client_links=0`, `customer_invitations=0`, `profiles=0`, `reward_points=0`.

## 4. Restore dei dati public e storage

Il dump dati conteneva anche Auth. Per non importare Auth due volte, è stato diviso per namespace: prima sole tabelle `public` e `storage`, mantenendo ogni istruzione SQL intera; poi il dump Auth dedicato. La grande istruzione di `clients`, che includeva dati binari incorporati, è rimasta un unico atto.

| Ora | Atto | Durata | Cardinalità immediata |
|---|---|---:|---|
| 09:43:46.866 | import `public.clients` | 3,127 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:00.332 | import `public.appointments` | 1,357 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:02.262 | import `public.contacts` | 1,876 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:03.285 | import `public.customer_client_links` | 0,969 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:05.076 | import `public.customer_invitations` | 1,729 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:06.268 | import `public.profiles` | 1,134 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:07.177 | import `public.reward_points` | 0,856 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:08.472 | import `public.visits` | 1,234 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:10.340 | import `storage.buckets` | 1,811 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:11.739 | import `storage.objects` | 1,341 s | non misurata singolarmente; inclusa nella controprova di fase |

Somma delle durate delle dieci chiamate: **15,432 s**. Prima dell'Auth, alle 09:44:27.765, la misura ha confermato `auth.users=0`, `auth.identities=0`, `auth.sessions=0`, `auth.refresh_tokens=0`.

## 5. Restore Auth

| Ora | Atto | Durata | Cardinalità immediata |
|---|---|---:|---|
| 09:44:40.253 | import `auth.users` | 1,575 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:41.753 | import `auth.identities` | 1,442 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:42.803 | import `auth.sessions` | 0,994 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:47.012 | import `auth.mfa_amr_claims` | 4,154 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:49.167 | import `auth.refresh_tokens` | 2,095 s | non misurata singolarmente; inclusa nella controprova di fase |
| 09:44:50.284 | riallineamento sequenza Auth | 1,058 s | non cambia la cardinalità |

Somma delle durate delle sei chiamate: **11,318 s**.

### Controprova completa del restore — 09:44:57.662 (0,905 s)

| Entità | Cardinalità |
|---|---:|
| clients | 296 |
| visits | 464 |
| contacts | 301 |
| auth users | 6 |
| appointments | 17 |
| customer_client_links | 1 |
| customer_invitations | 4 |
| profiles | 4 |
| reward_points | 6 |
| storage buckets | 1 |
| storage objects | 51 |
| auth identities | 6 |
| auth sessions | 7 |
| auth refresh tokens | 447 |

Questa è la controprova richiesta dalla Fase 1 ed è coincidente con prod per le cardinalità principali.

## 6. Pulizia autorizzata dei dati di prova

### Misura prima dell'atto — 10:22:47.331 (1,826 s)

Senza riportare dati personali, il perimetro approvato comprendeva:

- 5 clients legacy di prova dell'operatore, con 2 visite e 5 contatti;
- 1 client legacy di un account usa-e-getta, con 1 contatto;
- 12 appuntamenti, 3 reward, 4 inviti, 1 link legacy e 3 oggetti Storage riconducibili al perimetro di prova.

### Tentativo fallito e correzione

| Ora | Operazione | Durata | Esito |
|---|---|---:|---|
| 10:23:20.144 | pulizia relazionale + Storage in una transazione | 3,101 s | fallita e interamente annullata: `storage.protect_delete()` vieta la cancellazione SQL diretta |
| 10:23:39.581 | sola misura degli oggetti Storage coinvolti | 1,123 s | 3 oggetti; nessuna scrittura |
| 10:24:42.487 | pulizia corretta, limitata ai dati relazionali/Auth | 1,119 s | riuscita; tutti i 51 oggetti Storage lasciati intatti per lo smontaggio del temporaneo |

La correzione è stata quindi **non aggirare la protezione Storage**: nessuna disabilitazione di trigger e nessuna cancellazione forzata. L'atto SQL di pulizia è presente nella traccia della sessione ma non è stato ancora trasformato in un file versionato per G6; questo è un debito documentale prima della produzione.

### Misura dopo la pulizia — 10:24:53.817 (4,838 s)

| Entità | Prima | Dopo | Scarto spiegato |
|---|---:|---:|---|
| clients | 296 | 290 | −6 record legacy di prova/non reali approvati |
| visits | 464 | 462 | −2 visite appartenenti ai cinque clients di prova dell'operatore |
| contacts | 301 | 295 | −5 contatti dei clients di prova e −1 contatto dell'account usa-e-getta |
| appointments | 17 | 5 | −12 appuntamenti di prova |
| reward_points | 6 | 3 | −3 reward di prova |
| customer_client_links | 1 | 0 | −1 link legacy di prova |
| customer_invitations | 4 | 0 | −4 inviti di prova |
| auth users | 6 | 3 | −3 account di prova/usa-e-getta approvati |
| storage objects | 51 | 51 | nessuna cancellazione SQL; 1 oggetto risultava senza proprietario Auth dopo la pulizia |

### Spiegazione puntuale degli scarti richiesti

- **296→290 pet:** lo split crea un pet per ciascun client legacy rimasto. Sei clients approvati come dati di prova/non reali sono stati eliminati prima dello split; perciò 296−6 = **290 pets**. Non sono sei pet persi durante la migrazione.
- **464→462 visite:** due visite erano collegate ai cinque clients di prova dell'operatore rimossi; 464−2 = **462**.
- **301→295 contatti:** cinque contatti erano collegati ai clients di prova dell'operatore e uno al record usa-e-getta; 301−6 = **295**.

Il confronto corretto è quindi: **prod grezza → pulizia deliberata → migrazione**, non prod grezza → perdita inattesa.

## 7. Preflight e varianti prod-safe

### Misure prima della preparazione

| Ora | Durata | Misure principali |
|---|---:|---|
| 10:25:31.202 | 1,235 s | 9 clients senza telefono; 18 gruppi telefono condiviso; 12 gruppi con nominativi divergenti; 22 clients ulteriori nei gruppi; 0 proprietari orfani; 1 profilo operator mancante |
| 10:26:01.912 | 1,208 s | 2 telefoni risolvibili deterministicamente; 7 senza fonte; 0 ambigui; 11 gruppi telefono multi-nominativo; massimo 2 nominativi per telefono |
| 10:26:27.922 | 1,060 s | 0 risoluzioni dal contatto collegato; 2 dalla fonte univoca dello stesso nominativo; 7 ancora senza telefono; 0 fonti telefoniche ambigue |

### Correzioni introdotte rispetto alla migrazione demo

Sono stati prodotti tre file locali, tutti nel repository Grooming e ancora non tracciati da Git al momento di questa consegna:

1. `20260824110000_prepare_legacy_data_prod.sql`
   - completa/porta a `operator` i tre profili che possiedono record legacy;
   - ripara solo i 2 telefoni con una fonte reale, univoca e deterministica fra clients e contacts;
   - blocca atomicamente se le misure non sono esattamente 3 operator e 7 casi senza telefono.
2. `20260424120000_split_clients_with_backfill_prod.sql`
   - mantiene `customers.phone` nullable durante lo split: nessun numero inventato;
   - usa un indice univoco parziale per i soli telefoni reali;
   - anticipa in modo idempotente `tenants`, `tenant_memberships` e il mini-seed necessario alla catena;
   - conserva in `operator_notes` le varianti del nominativo quando più pet confluiscono nello stesso customer per telefono;
   - elimina esplicitamente le policy legacy che dipendevano da `client_id`, incluse quelle di `customer_invitations` e la policy trasversale su `clients` che bloccavano il drop;
   - esegue rewire e guardie anti-orfano dentro un unico `BEGIN…COMMIT`.
3. `20260824120000_finalize_customers_phone_not_null_prod.sql`
   - è separato e **non è stato applicato**;
   - deve essere eseguito solo dopo la risoluzione reale dei sette casi manuali;
   - fallisce atomicamente se resta un telefono nullo/vuoto, poi impone `NOT NULL`.

Impronte locali correnti:

| File | Righe | Byte | SHA-256 |
|---|---:|---:|---|
| `20260824110000_prepare_legacy_data_prod.sql` | 104 | 3.740 | `8e60f6ba5d2d1adc11f4e079d1766527ab08533e5596c1e7203782ef5d5b4ff1` |
| `20260424120000_split_clients_with_backfill_prod.sql` | 876 | 37.860 | `a184567baaf32fcd372b915fa2519cebd74c921aa18b9865d54796d6533ff3a2` |
| `20260824120000_finalize_customers_phone_not_null_prod.sql` | 28 | 715 | `8cc8c2d38ba6dc0f84cb271d6a1e99adeb9d5aebaaccc3b5dd1bd3643d5a6065` |

## 8. Applicazione delle prime due varianti prod-safe

| Ora | Atto | Durata | Misura successiva |
|---|---|---:|---|
| 10:29:28.590 | `prepare_legacy_data_prod` | 4,370 s | alle 10:29:36.846: 7 clients senza telefono; 3 profili operator, tutti con utente Auth |
| 10:29:48.898 | `split_clients_with_backfill_prod` | 1,859 s | alle 10:29:58.667: split completo e tabelle legacy eliminate |

Misura post-split:

| Voce | Valore |
|---|---:|
| clients legacy eliminata | sì |
| customer_client_links legacy eliminata | sì |
| pets | 290 |
| customers | 268 |
| customers senza telefono | 7 |
| customers con alias conservati | 11 |
| owner memberships | 3 |
| visits senza pet | 0 |
| appointments senza pet | 0 |
| reward_points senza pet | 0 |
| contacts senza pet collegato | 5 |

**Perché 290 pets ma 268 customers:** lo split preserva tutti i 290 animali, ma accorpa come un unico customer le anagrafiche con lo stesso telefono normalizzato. I 22 customer in meno corrispondono ai clients ulteriori dei gruppi condivisi già misurati nel preflight; 11 variazioni di nominativo sono state preservate nelle note. È deduplicazione dell'intestatario, non perdita di entità animale.

## 9. Catena Gate 2 applicata dopo lo split

Le 23 migration seguenti sono state applicate serialmente e tutte hanno restituito successo. Durata complessiva delle sole chiamate DB: **36,306 s**; tempo di parete osservato per la catena: circa **37,6 s**.

Non fu eseguito un conteggio separato dopo ciascuna migration: attribuire una cardinalità puntuale a ogni riga sarebbe retroattivamente falso. La controprova disponibile è il preflight post-catena al §10. Le migration sono prevalentemente DDL/RLS; gli atti di seed/backfill erano idempotenti rispetto a quanto già preparato dallo split.

| Ora | Migration | Durata |
|---|---|---:|
| 10:30:25.087 | `20260424121000_tenants` | 1,163 s |
| 10:30:26.518 | `20260424122000_tenant_memberships` | 1,373 s |
| 10:30:29.797 | `20260424123000_profiles_auto_create_and_deprecate_role` | 3,222 s |
| 10:30:31.050 | `20260424124000_helpers_has_tenant_access` | 1,194 s |
| 10:30:32.149 | `20260424125000_services` | 1,043 s |
| 10:30:33.584 | `20260424126000_promotions` | 1,389 s |
| 10:30:35.119 | `20260424130000_tenant_id_nullable_and_backfill` | 1,484 s |
| 10:30:36.769 | `20260424131000_tenant_id_indexes` | 1,588 s |
| 10:30:37.886 | `20260424132000_backfill_customers_stub` | 1,047 s |
| 10:30:40.010 | `20260424133000_tenant_id_enforce_not_null` | 2,068 s |
| 10:30:40.927 | `20260424140000_rls_tenants` | 0,867 s |
| 10:30:42.197 | `20260424140500_rls_tenant_memberships` | 1,214 s |
| 10:30:43.611 | `20260424141000_rls_profiles` | 1,356 s |
| 10:30:44.996 | `20260424141500_rls_customers` | 1,326 s |
| 10:30:46.044 | `20260424142000_rls_pets` | 0,989 s |
| 10:30:47.479 | `20260424142500_rls_visits` | 1,376 s |
| 10:30:49.192 | `20260424143000_rls_appointments` | 1,648 s |
| 10:30:51.042 | `20260424143500_rls_contacts` | 1,792 s |
| 10:30:52.430 | `20260424144000_rls_reward_points` | 1,331 s |
| 10:30:53.756 | `20260424144500_rls_services` | 1,268 s |
| 10:30:59.184 | `20260424145000_rls_promotions` | 5,367 s |
| 10:31:00.384 | `20260424145500_rls_customer_invitations` | 1,139 s |
| 10:31:01.500 | `20260424150000_pet_avatars_bucket` | 1,061 s |

## 10. Preflight post-catena e punto di arresto

La prima query di preflight, alle 10:32:05.110, è fallita dopo 2,458 s perché PostgreSQL 17 non supporta `min(uuid)`. Era una query di sola lettura: nessun dato è cambiato. È stata corretta usando la prima UUID di un `array_agg` ordinato e ripetuta.

### Misura corretta — 10:32:31.986 (1,877 s)

| Voce | Valore |
|---|---:|
| contacts | 295 |
| customers | 268 |
| pets | 290 |
| match per link pet | 289 |
| match per telefono | 5 |
| match assistito dal nome | 0 |
| nuovi lead | 0 |
| casi manuali | 1 |
| conflitti fra segnali | 1 |
| telefoni non validi secondo la regola di preflight | 19 |
| candidati duplicati per telefono normalizzato | 0 |
| converted senza match | 0 |
| note duplicate esatte del pet | 30 |
| note divergenti dal pet | 1 |
| note destinate al customer | 0 |

Seconda misura alle 10:32:51.920 (1,080 s): tutti i 295 contacts avevano `source=manual` e `status=converted`; telefoni `blank=10`, `valid=276`, `nonblank invalid=9`; 21 gruppi telefono duplicato per 45 righe; 7 customers con telefono nullo; nessun valore source/status fuori dominio.

Il lavoro si è fermato qui, correttamente, perché il conflitto singolo e i sette telefoni senza fonte reale richiedevano una decisione di Luigi. Non è stata inventata una risoluzione automatica.

## 11. Atti non eseguiti

- nessuna applicazione di `20260824120000_finalize_customers_phone_not_null_prod.sql`;
- nessun backfill/svuotamento dei contacts GH-07-bis;
- nessuna applicazione della restante catena whitelist, RPC e hardening prod;
- nessuna suite RLS sul risultato finale;
- nessun login dell'app o spot-check dei clienti;
- nessuna modifica o reset di password;
- nessuna misura conclusiva della durata end-to-end;
- nessuno smontaggio del progetto temporaneo;
- nessun push Git.

Di conseguenza GH-11 non va marcato completo e questo stato non è ancora una ricetta pronta per G6.

## 12. File e collocazione nei repository

### Repository Grooming — collocazione corretta

I tre file prod-safe sono in:

`/Users/luigimaisto/Desktop/grooming-hub-web/webapp/supabase/prod-migrations/`

Questo registro è in:

`/Users/luigimaisto/Desktop/grooming-hub-web/webapp/docs/consegne/GH-11-registro-eseguito-24-08-2026.md`

Al momento della ricognizione il worktree Grooming aveva inoltre modifiche concorrenti a `docs/diario-progetto.md` e `docs/incarichi/GH-11-prova-generale-migrazione.md`: non sono state toccate per questa consegna.

### Repository BEA — materiale Grooming da separare

È stato individuato un solo file scritto nel giro errato che contiene una sezione operativa Grooming:

`/Users/luigimaisto/Desktop/BEA_ScuolaMusica/_temp_updates/108-registro-ultimi-task-codex.md`

Il file è misto: i punti 1 e 2 appartengono a BEA, mentre il punto 3 (`Grooming Hub — GH-11`) appartiene a Grooming ed è anche superato da questo registro completo. Non conviene spostare l'intero file: la sistemazione corretta è rimuovere solo il §3 dalla copia BEA, oppure archiviare il 108 come registro dell'errore, usando questo documento come fonte Grooming.

Non risultano nel repository BEA dump, SQL prod-safe o altri file creati per GH-11. I riferimenti Grooming già presenti nel quaderno di metodo e nel diario BEA sono riferimenti intenzionali preesistenti al trasferimento del metodo, non artefatti dell'incarico incollato nel progetto sbagliato.
