# Consegna GH-07 - Contacts: ricognizione e proposta di assorbimento

**Data:** 21 agosto 2026  
**Branch:** `feat/customer-app`  
**Base dichiarata:** `c65601b691c620acb9381e596eb600d8f7145acb`  
**Perimetro:** Fase 1, sola lettura  
**Demo interrogato:** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`,
`ACTIVE_HEALTHY`)  
**Produzione:** non interrogata; usate solo le misure Cowork riportate nel
mandato  
**Scritture DB / migration / codice / commit / push:** nessuno

## Esito in una frase

Raccomando di assorbire la rubrica in `customers` con un modello
**customer-first**: un customer identificabile puo esistere senza pet e avere
uno stato operativo da lead. `contacts` non resta una seconda anagrafica. I
record privi di telefono o identita sufficiente non devono pero generare
customer fittizi: vanno risolti manualmente prima del drop, salvo decisione
esplicita di Luigi di creare una casa separata per le sole richieste anonime.

## 1. Misure demo

### Popolazione e campi

| Misura | Valore |
|---|---:|
| Contacts totali | 5 |
| `pet_name` popolato | 5/5 |
| `owner_name` popolato | 5/5 |
| `phone` popolato | 5/5 |
| `notes` popolato | 5/5 |
| `linked_pet_id` popolato e valido | 5/5 |
| `created_at` / `updated_at` popolati | 5/5 / 5/5 |
| Source | 5 `manual` |
| Status | 5 `converted` |
| Tenant | 1 solo tenant, 5/5 righe |
| Autori delle righe | 1 solo utente staff, valido per 5/5 |

Il demo ha inoltre 7 customer e 7 pet. Esiste **1 customer senza pet**, con
account Auth, e 1 customer con 2 pet. Quindi il vincolo "ogni customer nasce
con un pet" non e un vincolo relazionale: e soltanto il percorso principale
della UI/RPC. Il modello dati ammette gia il customer senza pet.

### Matching

| Segnale | Match | Ambigui |
|---|---:|---:|
| `linked_pet_id -> pets.customer_id` | 5/5 | 0 |
| Telefono con `normalize_phone_it` | 5/5, un solo customer | 0 |
| Nome proprietario esatto normalizzato | 5/5, un solo customer | 0 |
| Nome pet esatto normalizzato | 5/5 | 2/5 |

Per tutte le 5 righe, link esplicito, telefono e nome proprietario indicano lo
stesso customer. Il nome pet e invece ambiguo in 2 casi (`Luna` e `Pepe`
esistono per piu customer). **Il nome pet non puo essere una chiave di
fusione**; puo essere solo un controllo di coerenza subordinato.

Tutti i 5 telefoni raw vengono modificati dal normalizzatore e diventano
numeri di forma E.164 italiana. Non risultano telefoni null, malformati o
gruppi duplicati dopo normalizzazione, ne tra contacts ne tra customers.

### Semantica delle note

Le 5 `contacts.notes` coincidono esattamente con
`pets.internal_notes` del pet collegato; i 5 `customers.operator_notes` sono
null. Nel demo le note contact sono quindi **note del pet duplicate**, non note
della persona. Copiarle sempre in `customers.operator_notes` cambierebbe
semantica e produrrebbe duplicati.

## 2. Differenze di schema e sorte delle colonne

| Colonna `contacts` | Destinazione raccomandata | Regola |
|---|---|---|
| `id` (`text`) | Nessun campo customer | Usato solo nel report/mapping di migrazione finche `contacts` resta disponibile |
| `tenant_id` | `customers.tenant_id` | Deve coincidere in ogni match; conflitto = blocco manuale |
| `user_id` | Non copiare in `customers.user_id` | Nel contact e lo staff autore; nel customer e l'account del cliente: semantiche incompatibili |
| `owner_name` | `first_name` + `last_name` | Customer esistente vince; riempire solo campi vuoti. Per nuovi record, split con la regola M11-bis |
| `phone` | `customers.phone` | Normalizzare con `normalize_phone_it`; il telefono customer esistente e canonico |
| `pet_name` | Pet collegato o nota lead | Se `linked_pet_id` esiste, solo verifica. Per lead senza pet, non creare un pet fittizio: preservare temporaneamente come "pet dichiarato" nella nota operatore, salvo conferma in conversione |
| `notes` | `pets.internal_notes` oppure `customers.operator_notes` | Se uguale alla nota del pet: nessuna copia. Se chiaramente pet-specifica: append deduplicato al pet. Se lead/persona senza pet: append con provenienza a `operator_notes` |
| `source` | Nuovo campo operativo customer, es. `acquisition_source` | Valori `manual/whatsapp/qr`; non e un tratto qualitativo del cliente |
| `status` | Nuovo campo operativo customer, es. `relationship_status` | Mappa `new -> lead`, `contacted -> contacted`, `converted -> active`, `archived -> archived` |
| `linked_pet_id` | Relazione gia derivabile da `pets.customer_id` | Non duplicare sul customer; serve solo per il match e il controllo pre-drop |
| `created_at` | `customers.created_at` | Nuovo customer: conservare data contact. Customer esistente: `least` tra le date se il contact e davvero storico |
| `updated_at` | `customers.updated_at` | Non sovrascrivere con una vecchia data contact; la fusione produce il nuovo `updated_at` |

`customers.email`, `marketing_opt_in` e l'eventuale `user_id` Auth non devono
mai essere sovrascritti da un contact. I nuovi campi operativi proposti non
contraddicono la Decisione 3: lo stato del rapporto resta sulla persona, senza
creare una seconda entita anagrafica. Non sono neppure i campi qualitativi
soggettivi esclusi dal Gate 5.

## 3. Uso reale nel codice

### Gateway

| Funzione | Operazione attuale | Colonne |
|---|---|---|
| `getAllContacts` | SELECT tenant-aware, ordine `created_at desc` | `select('*')` |
| `addContact` | INSERT staff | `id`, `user_id`, `tenant_id`, `pet_name`, `owner_name`, `phone`, `source`, `status`, `notes` |
| `updateContactStatus` | UPDATE staff | `status`, `updated_at` |
| `markContactConverted` | Verifica pet e UPDATE | `status='converted'`, `linked_pet_id`, `updated_at` |
| `convertContactToClient` | Alias deprecato | Alias di `markContactConverted`, nessun consumer attuale |

### Consumer

`Contacts.jsx` legge e usa realmente:

- `id`, `pet_name`, `owner_name`, `phone`, `notes` per lista, ricerca e WA;
- `status` per contatori, filtri e azioni;
- `source` per etichetta;
- `created_at` per data;
- `linked_pet_id` per aprire la scheda pet.

Scrive tramite il gateway: creazione lead, passaggi di stato
`new/contacted/archived` e marcatura automatica `contacted` all'apertura di
WhatsApp. `AddClient.jsx` riceve i dati del contact, crea customer+pet tramite
RPC e poi chiama `markContactConverted`.

Per vivere su `customers`, la pagina dovra usare un elenco customer con join
dei pet e le due colonne operative proposte. La conversione di un lead gia
presente in `customers` non dovra creare un secondo customer: dovra aggiungere
il pet al customer esistente e portare lo stato ad `active`. Con piu pet, la
riga customer mostra l'elenco e l'apertura della scheda richiede una scelta;
non si puo piu assumere un solo `linked_pet_id`.

Mappa API suggerita per la Fase 2:

| Oggi | Dopo assorbimento |
|---|---|
| `getAllContacts` | `getCustomerDirectory` su `customers` + `pets` |
| `addContact` | RPC staff `upsert_customer_lead` con owner+telefono obbligatori |
| `updateContactStatus` | `updateCustomerRelationshipStatus` |
| `markContactConverted` | `addPetToCustomer` + stato `active`, nella stessa operazione atomica se possibile |
| `getContactWhatsAppUrl(contact)` | Helper su customer + pet dichiarato/primo pet |

## 4. Automatismo "cliente -> rubrica"

L'automatismo era applicativo: la vecchia `AddClient.jsx` chiamava
`createContactFromClient` dopo la creazione del client. GH-05-bis lo ha gia
**spento** nel commit `9317b78`; la funzione e stata rimossa e il flusso
customer+pet non inserisce piu contacts.

Sul database demo non esistono funzioni o trigger che creino contacts. L'unico
trigger sulla tabella aggiorna `updated_at`. Oggi nascono nuove righe soltanto
dal form "Nuovo contatto"; il flusso inverso contact -> customer+pet resta
attivo.

Raccomandazione: **non ripristinare e non invertire l'automatismo**. Dopo il
cutover esiste una sola anagrafica customer. La pagina Contatti e una vista
operativa su quella anagrafica, non una copia sincronizzata.

## 5. Nodo lead puri

### Opzione raccomandata - Customer senza pet

Un lead con persona identificabile (almeno nome e telefono valido) e un
customer in stato `lead` o `contacted`, anche senza pet. Lo schema lo consente
gia; serve un flusso staff separato dalla RPC customer+pet. Quando il pet viene
confermato, si aggiunge al customer esistente e lo stato diventa `active`.

**Vantaggi:** una sola identita, niente matching futuro tra due tabelle, nessun
duplicato, Decisione 3 rispettata.  
**Costo:** due campi operativi customer, un RPC customer-only e adeguamento
della pagina/routing per customer senza pet.

### Alternativa - Tabella `inquiries`

Solo se il salone vuole conservare richieste senza telefono o persona
identificabile, queste non sono anagrafiche ma eventi operativi. Una tabella
`inquiries` sarebbe semanticamente piu corretta di `contacts` e avrebbe stato,
source, testo e dati dichiarati; la persona verrebbe creata solo alla
qualificazione.

**Vantaggi:** nessun customer incompleto, supporto a richieste anonime.  
**Costo:** resta una seconda coda da migrare e governare, con nuove RLS/API e
una decisione che modifica il senso stretto della Decisione 3.

### Alternativa non raccomandata - Forzare sempre customer+pet

Creare sempre customer e pet da un lead evita nuove colonne, ma trasforma una
richiesta non verificata in due anagrafiche reali e non risolve i record senza
telefono. Produce dati prematuri e rende piu costose fusioni e cancellazioni.

### Decisione richiesta a Luigi

Confermare una delle seguenti:

1. **Raccomandata:** i lead identificabili vivono in `customers` senza pet; i
   lead non identificabili vengono corretti/archiviati manualmente e non si
   introduce una nuova tabella.
2. Il salone necessita davvero una coda persistente per richieste anonime;
   autorizzare allora una `inquiries` minimale con mandato dedicato.

Non raccomando di rendere nullable `customers.phone`: il telefono e la chiave
operativa di deduplica/invito e il vincolo attuale protegge il modello.

## 6. Regole di match e fusione

### Priorita di match

1. `linked_pet_id -> pets.customer_id`, ma solo se tenant coerente.
2. Telefono normalizzato, solo con **un** customer candidato nel tenant.
3. Nome proprietario esatto normalizzato solo come supporto. Senza telefono,
   auto-match ammesso esclusivamente se il nome e unico **e** un pet-name unico
   conferma lo stesso customer; altrimenti revisione manuale.
4. Nome pet mai usato da solo.
5. Nessun fuzzy match automatico. Conflitto tra link, telefono e nome = blocco
   della singola riga, non scelta per maggioranza.

Prima del backfill vanno bloccati: telefoni non validi, duplicati dopo
normalizzazione, link cross-tenant, status `converted` senza pet e qualunque
contact che produca piu customer candidati.

### Chi vince

- Customer esistente vince su `id`, `user_id`, nome non vuoto, telefono,
  email e marketing consent.
- Contact riempie solo campi customer vuoti; differenze non vuote entrano nel
  report manuale.
- Stato: `active` se esiste un pet/converted valido; altrimenti precedenza
  `contacted > lead`; `archived` solo se la riga non e gia customer attivo.
- Source: conservare la prima origine nota; non sovrascrivere una source gia
  presente sul customer.
- Note: deduplica esatta prima di appendere; pet-specifiche sul pet,
  person-specifiche sul customer, sempre con marker di provenienza se fuse.
- Nessun valore viene silenziosamente perso. I campi tecnici non trasferiti
  (`contacts.id`, autore staff) restano nel report di mapping fino al drop.

## 7. Sequenza raccomandata per la Fase 2

1. **Decisione Luigi sul lead model.** Senza questa, la migration non e
   eseguibile in sicurezza.
2. **Preflight read-only su prod:** classificare tutte le 301 righe in bucket
   disgiunti (link, telefono, nome assistito, nuovo lead, manuale, conflitto).
3. **Risoluzione manuale del residuo:** nessuna riga senza telefono/identita o
   ambigua puo arrivare al drop.
4. **Migration additiva sul demo:** campi operativi customer, RPC staff e
   mapping idempotente. `contacts` resta intatta.
5. **Backfill transazionale sul demo:** salvare su ogni contact il customer
   assorbente o produrre un report di mapping; riesecuzione = zero duplicati.
6. **Refactor codice:** pagina Contatti su customers+pets, scritture solo su
   customer, conversione senza duplicare il customer, helper WA adattato.
7. **Controprove complete sul demo**, incluse RLS e customer senza pet.
8. **Produzione in finestra controllata:** backup, blocco temporaneo delle
   scritture staff, preflight identico, backfill, deploy e smoke test.
9. **Periodo di osservazione:** zero chiamate Data API a `/contacts` e conteggi
   riconciliati. Nessuna nuova riga contact.
10. **Drop separato:** rimuovere `contacts` solo con irrisolti = 0, riferimenti
    codice = 0 e rollback verificato.

L'ordine e volutamente expand/contract. Migrare dati e droppare tabella nello
stesso atto renderebbe fragile il rollback e nasconderebbe errori sui 13 casi
residui.

## 8. Prod-safety

Misure Cowork, usate senza interrogare produzione:

| Classe prod | Righe | Percentuale |
|---|---:|---:|
| Contacts totali | 301 | 100% |
| Telefono coincidente con client | 288 | 95,7% |
| Senza telefono | 10 | 3,3% |
| Telefono senza match | 3 | 1,0% |
| Residuo complessivo | 13 | 4,3% |

La massa dei 288 specchi e adatta a un backfill deterministico, ma il demo non
rappresenta il residuo prod: ha 5/5 righe perfette, convertite e collegate. Non
permette di validare lead reali, telefoni assenti, status intermedi o note non
duplicate.

Prima della Fase 2 su prod mancano ancora misure vincolanti:

- owner/pet name popolati nei 13 residui;
- distribuzione status/source e presenza `linked_pet_id`;
- telefoni malformati e duplicati **dopo** `normalize_phone_it`;
- conflitti link vs telefono vs nome;
- duplicati di nome proprietario/pet;
- note uguali a note pet/client oppure realmente lead-specifiche;
- piu contacts che convergono sullo stesso customer.

Questi conteggi devono essere zero o risolti prima della scrittura. Le vecchie
stime nei documenti Gate 5 (193 contacts prod) sono superate dalla misura
Cowork corrente di 301.

## 9. Controprove richieste alla Fase 2

1. Report preflight: 301 righe classificate una volta sola; 0 non classificate
   e 0 conflitti prima dell'atto prod.
2. Idempotenza: seconda esecuzione del backfill crea 0 customer e 0 pet.
3. Conteggi: customer finali = baseline + soli nuovi lead ammessi; nessun
   customer duplicato per telefono normalizzato.
4. Fusione campi: tabella campione per ogni regola, inclusa dedup note pet.
5. Lead customer senza pet: creazione, lista, WA, cambio stato e successiva
   aggiunta pet senza duplicare il customer.
6. Customer multi-pet: una sola riga persona, elenco pet corretto e routing
   non ambiguo.
7. RLS: staff del tenant vede/gestisce; customer non vede stati/source/note
   operatore altrui; tenant estraneo legge 0.
8. Codice/network: 0 riferimenti `.from('contacts')`, 0 chiamate REST a
   `/contacts`, alias deprecati rimossi.
9. Regressione: creazione ordinaria customer+pet, inviti, appuntamenti e portale
   customer invariati.
10. Drop gate: backup disponibile, 0 irrisolti, 0 nuove contacts durante
    osservazione, build verde e rollback provato su copia.

## 10. Rischi residui

- Il normalizzatore e intenzionalmente italiano e non sostituisce
  libphonenumber; numeri internazionali o testuali richiedono revisione.
- Il vincolo unique attuale e sul telefono memorizzato, non sull'espressione
  normalizzata: due formati diversi possono collidere solo in migrazione.
- `Contacts.jsx` oggi mescola persona e singolo pet; il customer multi-pet
  richiede una scelta UI esplicita.
- Le note demo provano che una copia cieca verso `operator_notes` sarebbe
  semanticamente sbagliata.
- Un deploy non coordinato potrebbe lasciare una finestra in cui il vecchio
  codice continua a scrivere contacts dopo il backfill. Serve manutenzione o
  una strategia transitoria esplicita.
- Se Luigi sceglie `inquiries`, una nuova tabella esposta richiedera grant e
  RLS esplicite; le tabelle nuove non sono piu necessariamente esposte
  automaticamente dalla Data API Supabase.

## Verifiche e fonti

- Schema e dati demo misurati con sole query `SELECT` su PostgreSQL 17.6.
- Codice letto su HEAD `c65601b`: `Contacts.jsx`, `AddClient.jsx`,
  `database.js`, helper WhatsApp, migration e Decisioni Gate 5.
- Sul demo: nessuna funzione DB contiene riferimenti a `contacts`; unico
  trigger della tabella = aggiornamento timestamp.
- Changelog Supabase corrente consultato: nessuna breaking change modifica le
  conclusioni della ricognizione. La variazione Data API per nuove tabelle e
  rilevante solo per l'alternativa `inquiries`.
- Documentazione Supabase corrente consultata per comportamento sequenziale e
  rollback delle migration/branch.

## File esaustivi

| File | Azione | Stato |
|---|---|---|
| `docs/consegne/GH-07-contacts-ricognizione.md` | Creato; unico output della Fase 1 | non committato |

## Fuori istruzione e stato parallelo

- Nessuna scrittura sul demo, nemmeno fixture o cleanup.
- Produzione non interrogata e non toccata.
- Nessuna modifica a `Contacts.jsx` o ad altri file applicativi.
- Nessuna migration, build applicativa, commit, deploy o push.
- Le modifiche parallele a `docs/diario-progetto.md`,
  `docs/environment-map.md`, `docs/incarichi/GH-03-brief-claude-design.md` e
  `docs/incarichi/GH-05-bis-staff-refactor.md` sono preesistenti e attribuite a
  Cowork; non sono state modificate.
- I registri GH-05-rpc, GH-05-bis e GH-06 e i mandati GH-06/GH-07 non tracciati
  sono rimasti fuori da qualunque stage.

