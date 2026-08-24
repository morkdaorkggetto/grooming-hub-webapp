# Consegna GH-07-bis - Contacts: assorbimento customer-first sul demo

**Data:** 21 agosto 2026  
**Esecutore:** Codex  
**Mandato:** `docs/incarichi/GH-07-bis-contacts-assorbimento.md`

## 1. Base e perimetro dichiarati

- Branch: `feat/customer-app`.
- Base effettiva: `c65601b691c620acb9381e596eb600d8f7145acb`.
- Supabase interessato: solo `grooming-hub-demo`, ref
  `qttpinkslhenxrsbhhhg`, stato verificato `ACTIVE_HEALTHY`.
- Tenant demo: `8ad7489b-15f9-44f5-8d50-cc89506c3ac9`.
- Produzione: non interrogata e non modificata.
- Push/deploy: non eseguiti.
- `contacts`: mantenuta, senza DDL distruttiva e senza chiamate dal codice
  applicativo.

## 2. Migration registrata

- File: `supabase/migrations/20260821055259_gh07_absorb_contacts_customer_first.sql`.
- Registrazione remota demo: versione `20260821055259`, nome
  `gh07_absorb_contacts_customer_first`.
- Una sola migration additiva:
  - `customers.acquisition_source`, `NOT NULL`, default `manual`, dominio
    `manual | whatsapp | qr`;
  - `customers.relationship_status`, `NOT NULL`, default `active`, dominio
    `lead | contacted | active | archived`;
  - indice `(tenant_id, relationship_status)`;
  - RPC `upsert_customer_lead`, `SECURITY INVOKER`, guard staff come prima
    istruzione, telefono normalizzato obbligatorio, lock transazionale per
    tenant+telefono, nessun pet;
  - ACL RPC: solo `authenticated` oltre al proprietario Postgres;
  - trigger column-level che impedisce ai customer di mutare origine e stato;
  - backfill transazionale protetto da UUID e slug del tenant demo e dalle
    cardinalita attese 5 contacts / 7 customers / 7 pets.
- La stessa migration e stata rieseguita integralmente dopo la registrazione:
  nessuna nuova riga e impronte dati invariate.

## 3. Mapping di assorbimento dei cinque contacts

Priorita applicata: link al pet, poi telefono normalizzato univoco, poi nome
assistito proprietario+pet. Ogni riga aveva link, telefono e nome concordi.
Il customer esistente ha sempre vinto; non e stato creato alcun customer o pet.

| Contact | Proprietario / pet | Customer | Pet | Stato | Fonte | Note |
| --- | --- | --- | --- | --- | --- | --- |
| `ctc_3131d8c683574383bc` | Luigi Rossi / Fido | `775abed2-60cb-4e02-8cbc-98fad4c18bd7` | `16d14bbe-94ea-4292-8f60-aca6e6cd6d3b` | `converted -> active` | `manual` | identiche a `pets.internal_notes`, nessuna copia |
| `ctc_43afa8d3ffb34befb6` | Paolo Verdi / Rocky | `8b2d6973-aee6-4b64-8e1d-9c1fb9310e45` | `7ffe38d5-4b11-451b-8b61-163c71708c68` | `converted -> active` | `manual` | identiche, nessuna copia |
| `ctc_a71fec813bb44e5c90` | Giulia Fontana / Pepe | `35c05767-017c-4311-b633-800f8c737883` | `e5482b14-2525-4883-8377-bbf121da63fd` | `converted -> active` | `manual` | identiche, nessuna copia |
| `ctc_cb4c4a4a4d04427dbd` | Sara Neri / Milo | `ef52d5c7-0af6-4e98-8d4f-1aa92520bf18` | `387957ad-8435-4169-911c-13b6ac6ce12f` | `converted -> active` | `manual` | identiche, nessuna copia |
| `ctc_ea2584f719644d0aa2` | Martina Bianchi / Luna | `f5163342-f11f-4c70-8738-332666ac64b3` | `2e1c752d-c159-4832-b2eb-f5211afc6596` | `converted -> active` | `manual` | identiche, nessuna copia |

## 4. Baseline 7 customer / 7 pet, riga per riga

| Customer | Stato / fonte | Pet risultanti | Spiegazione |
| --- | --- | --- | --- |
| Giulia Fontana `35c05767-017c-4311-b633-800f8c737883` | `active / manual` | Pepe `e5482b14-2525-4883-8377-bbf121da63fd` | assorbito contact Giulia/Pepe sul customer esistente |
| Luca Bianchi `916e8f06-4a58-436b-a4a9-a7822e2a8da7` | `lead / manual` | nessuno | customer identificabile senza pet, coerente con decisione customer-first |
| Luigi Rossi `775abed2-60cb-4e02-8cbc-98fad4c18bd7` | `active / manual` | Fido `16d14bbe-94ea-4292-8f60-aca6e6cd6d3b` | assorbito contact Luigi/Fido |
| Mario Rossi `82ff8524-4854-4bd5-96cb-a67232ed8a35` | `active / manual` | Luna `4dd2ce7a-298c-44cc-8a16-206e401fbfc0`; Pepe `869bf0fc-9a09-4254-8a98-6220f96383e0` | nessun contact da assorbire; customer multi-pet preservato |
| Martina Bianchi `f5163342-f11f-4c70-8738-332666ac64b3` | `active / manual` | Luna `2e1c752d-c159-4832-b2eb-f5211afc6596` | assorbito contact Martina/Luna |
| Paolo Verdi `8b2d6973-aee6-4b64-8e1d-9c1fb9310e45` | `active / manual` | Rocky `7ffe38d5-4b11-451b-8b61-163c71708c68` | assorbito contact Paolo/Rocky |
| Sara Neri `ef52d5c7-0af6-4e98-8d4f-1aa92520bf18` | `active / manual` | Milo `387957ad-8435-4169-911c-13b6ac6ce12f` | assorbito contact Sara/Milo |

Totali finali: 7 customer, 7 pet, 5 contacts legacy preservati, zero duplicati
per telefono normalizzato.

## 5. File esaustivi e commit

| File | Intervento | Commit |
| --- | --- | --- |
| `supabase/migrations/20260821055259_gh07_absorb_contacts_customer_first.sql` | campi, RPC, ACL, trigger e backfill demo | `ae9819fbf67a53f4930afd53f0ad5ea5a6c287dd` |
| `src/apps/staff/lib/database.js` | gateway customer directory, lead RPC, stato relazione, add pet sul customer | `efa1c7b20dac44173931a6837e9d4e075387a2dc` |
| `src/apps/staff/lib/whatsapp.js` | helper WhatsApp customer-first | `efa1c7b20dac44173931a6837e9d4e075387a2dc` |
| `src/apps/staff/pages/Contacts.jsx` | direttorio customer, lead, stati e selezione multi-pet | `efa1c7b20dac44173931a6837e9d4e075387a2dc` |
| `src/apps/staff/pages/AddClient.jsx` | aggiunta pet al customer esistente senza duplicazione | `efa1c7b20dac44173931a6837e9d4e075387a2dc` |
| `scripts/rls-tests/run.mjs` | campi direttorio e contratto dati portale | `f5cd321dc2e1cacbafd0192fd04609003ccfe2d2` |
| `supabase/docs/rls-tests.md` | esiti misurati aggiornati | `f5cd321dc2e1cacbafd0192fd04609003ccfe2d2` |
| `docs/consegne/GH-07-bis-contacts-assorbimento.md` | presente registro | non incluso nei commit funzionali |

## 6. Controprove eseguite

### 6.1 Backfill e idempotenza

- Prima e dopo la seconda esecuzione: 7 customer, 7 pet, 5 contacts.
- Duplicati telefono normalizzato: 0.
- Impronta customer invariata:
  `b8f0cb1189a850ebc8c67dac5dd42298`.
- Impronta pet invariata: `5bfe0deeb1fbe76f4836baa628defc30`.

### 6.2 Lead senza pet e conversione

Fixture UI `[DEMO GH-07] Ada Prova`, telefono sintetico dedicato:

- creata da `Contacts.jsx` come customer `lead`, fonte `whatsapp`, pet
  dichiarato Nebbia ma nessuna riga pet;
- visibile nel direttorio;
- azione WhatsApp eseguita e stato passato a `contacted`;
- `Aggiungi pet` ha riusato lo stesso customer;
- dopo il salvataggio: un pet Nebbia, customer `active`, nota trasferita a
  `pets.internal_notes`, marker e duplicato rimossi da `operator_notes`;
- fixture rimossa con guardie sugli ID; baseline ripristinata.

### 6.3 Multi-pet

- Mario compare in una sola riga con Luna e Pepe.
- Selettore obbliga una scelta esplicita.
- Selezionato Pepe e aperta la scheda
  `/client/869bf0fc-9a09-4254-8a98-6220f96383e0`: intestazione misurata
  `Pepe - Mario Rossi - Carlino`.

### 6.4 Fusione campi

- Link, telefono e nome assistito concordi su 5/5 righe.
- Stato: 5 `converted -> active`.
- Fonte: 5 `manual -> manual`.
- Nome customer: il valore customer ha vinto su 5/5.
- Data creazione: minimo tra contact e customer.
- Note: 5/5 esattamente uguali alle note pet; 0 copie e 0 marker aggiunti.
- Nessuna perdita silenziosa e nessun conflitto.

### 6.5 RLS e ciclo sonda

- Seed GH-04 applicato sul demo.
- Suite finale: **20 PASS, 0 FAIL, 1 SKIP** previsto per assenza di secondo
  tenant.
- Nuove prove:
  - customer vede 0 customer altrui con `relationship_status`,
    `acquisition_source` o `operator_notes`;
  - customer non modifica i propri campi operativi;
  - Mario legge come portale esattamente 1 customer e i propri 2 pet.
- Sonda rimossa nello stesso ciclo e nuovamente dopo la verifica visuale:
  0 auth users, 0 identities, 0 profiles, 0 memberships, 0 customer;
  login finale `invalid_credentials`.

### 6.6 Regressioni applicative

- Customer+pet ordinario creato via UI: fonte `manual`, stato `active`, pet e
  note corretti.
- Invito customer generato dalla scheda pet e poi eliminato con la fixture.
- Contratto dati portale Mario verificato nella suite RLS.
- `npm run build`: PASS.
- Avvisi build preesistenti: `caniuse-lite` datato e chunk principale oltre
  500 kB; nessun nuovo warning attribuibile a GH-07-bis.
- `npm run lint`: non eseguibile perche lo script esiste ma `eslint` non e
  installato nelle dipendenze del progetto.
- `node --check scripts/rls-tests/run.mjs`: PASS.
- `git diff --check`: PASS.

### 6.7 Rete e resa visiva

- Log API della finestra: 0 occorrenze `/rest/v1/contacts`, 16 occorrenze
  `/rest/v1/customers` nel campione recente comprendente la prova.
- Pagina verificata a 1440x900 e 390x844: dati, controlli e testi leggibili,
  nessuna sovrapposizione incoerente osservata.

## 7. Eccezioni e fuori-istruzione

- Primo tentativo di applicazione migration: PostgreSQL ha rifiutato
  `pg_catalog.least(...)`. La transazione ha effettuato rollback integrale;
  sostituito con l'espressione SQL `LEAST(...)`, quindi applicazione riuscita.
  Nessuno stato parziale e rimasto sul demo.
- Gli advisor Supabase riportano avvisi storici del progetto (funzioni legacy
  con search path mutabile, ACL SECURITY DEFINER pregresse e policy permissive
  multiple). Nessun nuovo avviso specifico sulla RPC GH-07-bis; la funzione e
  `SECURITY INVOKER` e l'ACL e stata misurata.
- Nessuna nuova migration oltre quella autorizzata.
- Nessun file fuori elenco funzionale modificato da Codex.
- Modifiche parallele preesistenti di Cowork, non messe in stage e non incluse
  nei commit: `docs/diario-progetto.md`, `docs/environment-map.md`,
  `docs/incarichi/GH-03-brief-claude-design.md`,
  `docs/incarichi/GH-05-bis-staff-refactor.md` e i documenti/consegne gia
  presenti come untracked prima di GH-07-bis.

## 8. Indicazioni operative per Cowork prima di G6 sul prod

La migration consegnata contiene una guardia intenzionale sul tenant demo e
non va applicata tal quale al prod. Sul campione prod di 301 contacts misurare
e registrare prima di qualsiasi scrittura:

1. cardinalita iniziali di contacts, customers e pets e impronte ripetibili;
2. telefoni nulli, vuoti, non normalizzabili e duplicati per
   `(tenant_id, normalize_phone_it(phone))`;
3. distribuzione dei match per priorita: link valido, telefono unico, nome
   assistito; conteggio dei non risolti;
4. conflitti link/telefono/nome, da bloccare e risolvere manualmente;
5. lead puri: telefono obbligatorio, nessun pet e stato operativo da mappare;
6. distribuzione e valori fuori dominio di `source` e `status`;
7. note esattamente duplicate, note divergenti e destinazione semantica pet o
   customer, con conteggi prima/dopo;
8. conteggi attesi dopo il backfill, zero duplicati normalizzati e seconda
   esecuzione a impronta invariata;
9. compatibilita delle policy/trigger prod con i due nuovi campi e rifiuto
   customer delle scritture operative;
10. solo dopo queste misure, produrre un atto G6 separato che sostituisca le
    guardie demo con cardinalita e decisioni prod esplicite.

Questa sequenza evita di trasporre per tentativi il caso pulito 5/5 del demo
sulle 301 righe produzione, dove il 4% non specchiato e i lead puri sono il
nodo reale.
