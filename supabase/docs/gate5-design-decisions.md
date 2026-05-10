# Gate 5 — Decisioni di design preliminari

Questo documento raccoglie le decisioni di design prese prima dell'avvio del Gate 5 (refactor di `src/lib/database.js` per allineare il codice staff al nuovo schema multi-tenant introdotto al Gate 2).

Le decisioni rispondono ai 5 punti aperti identificati nell'ispezione del codice staff (vedi `staff-code-touchpoints.md`). Sono state prese sulla base di:

- I due round di contributi di Davide e Roby (vedi `docs/workflows/flussi-operativi-salone.md`).
- Le caratteristiche dello schema attuale (vedi `schema-baseline.md`) e di quello nuovo introdotto da M11-bis.
- Il principio guida: **rispettare il modello mentale del salone**, evitare strutture forzate quando l'ambiguità è semanticamente sensata.

---

## Decisione 1 — Vista principale staff = lista pet, non lista clienti

**Domanda originale:** la nuova `getAllClients` (che diventa `getAllPets`) ritorna customer, ritorna pet, o ritorna una vista combinata?

**Decisione:** la vista principale dello staff è una **lista di pet con padrone in evidenza**. La funzione si chiama `getAllPets()` e ritorna pet + customer collegato in un'unica struttura (join lato query, non chiamata separata).

**Razionale:**

Il pet è il centro del lavoro del salone. Davide e Roby pensano in termini di "Pepe il carlino di Giulia Fontana", non in termini di "Giulia Fontana che ha un pet". L'unità mentale è il pet, contestualizzato dal padrone.

Inoltre, dai dati di produzione (189 clients, 205 visits) emerge che ogni padrone ha in media 1.08 pet — quasi tutti hanno un pet solo. La distinzione customer-vs-pet diventa rilevante solo nei pochi casi multi-pet, che vanno gestiti come eccezione visualizzata (righe distinte ma visivamente raggruppate per padrone).

**Implicazioni implementative:**

- Funzione DB: `getAllPets(tenant_id, filters)` che fa join `pets ⨝ customers`.
- Sorting di default: per `last_visit_at` discendente (i più recenti in alto), o alfabetico per nome pet a scelta dell'utente.
- UI: ogni riga mostra nome pet, razza, foto, nome padrone, telefono padrone (per chiamata rapida).

---

## Decisione 2 — Inserimento cliente+pet = schermata unica con due sezioni

**Domanda originale:** dopo lo split, l'inserimento di un nuovo cliente+pet si fa in una sola schermata o in due step separati?

**Decisione:** **schermata unica** con due sezioni visive — "Padrone" in alto, "Pet" sotto. Compilazione e salvataggio creano customer + pet in una **transazione DB unica**. Plus: percorso secondario "aggiungi pet a customer esistente" per i casi multi-pet.

**Razionale:**

Roby ha specificato che l'inserimento nel gestionale avviene "esclusivamente quando il cane è fisicamente presente in sede". Significa che lo staff ha il cane davanti, le informazioni in mano (raccolte al telefono o al momento), e vuole inserire tutto rapidamente. Dividere in due step (prima customer, poi pet) sarebbe artificiale per un'operazione che in pratica avviene tutta insieme.

**Implicazioni implementative:**

- Funzione DB: `addCustomerWithPet(customer_data, pet_data, tenant_id)` che crea le due entità in una transazione.
- UI: form unico con sezioni espandibili o accordion. Validazione lato client che permette il salvataggio solo se entrambe le sezioni sono complete.
- Percorso secondario: ricerca customer per nome/telefono → trovato → "aggiungi pet" → form solo con dati pet → salva. Funzione DB: `addPetToCustomer(customer_id, pet_data)`.

---

## Decisione 3 — `contacts` come concetto separato deprecato

**Domanda originale:** dopo lo split, cosa diventa `convertContactToClient`? E qual è il ruolo della tabella `contacts` esistente?

**Decisione:** **`contacts` non è un'entità separata da `customers`** nel modello mentale del salone. Sono la stessa entità vista da angolazioni diverse — anagrafica e relazionale. La distinzione dell'attuale schema è artefatto storico, non distinzione semantica reale.

**Azioni:**

- La funzione `convertContactToClient` viene **deprecata** nel nuovo `database.js`. Se ci sono chiamate residue, vengono riscritte come operazioni dirette su `customers`.
- I record esistenti nella tabella `contacts` (5 sul demo dopo la pulizia, 193 in produzione) vengono **migrati** in `customers` con una sotto-migration nel Gate 5. Match per telefono/nome con customer esistenti per evitare duplicati; in caso di match, fusione delle informazioni.
- La tabella `contacts` viene **rimossa** in una migration successiva, dopo che il refactor di `database.js` non la referenzia più.

**Decisione collaterale:** **niente campi qualitativi strutturati** sul customer. Le caratterizzazioni informali ("anziano", "premuroso", "diffidente") restano nello scambio orale del salone. Eventuale aggiunta in futuro solo se emergerà un'esigenza concreta.

**Razionale:**

Dalla descrizione del flusso operativo, "contacts" sono il pacchetto di informazioni che lo staff usa per **comunicare con il cliente** durante e dopo il lavoro. Ma ogni numero che lo staff annota appartiene a un padrone di un pet che è già loro cliente. Non esistono "contacts senza customer". La separazione era una sovrastruttura non corrispondente al modello mentale reale.

Sui campi qualitativi: forzare lo staff a tag soggettivi ("è premuroso? è diffidente?") richiederebbe giudizi che è meglio restino conversazionali. La scheda customer resta neutra, descrittiva, non valutativa — più rispettosa del cliente e più semplice da manutenere.

---

## Decisione 4 — Bucket storage `pet-avatars` e `client-photos` separati con ruoli distinti

**Domanda originale:** unificare i due bucket o mantenerli separati?

**Decisione:** **mantenuti separati**, con ruoli ufficialmente chiariti:

- `pet-avatars`: foto identificativa principale del pet. Una sola per pet. Modificabile dal customer (entro limiti) e dallo staff (sempre). Path: `<tenant_id>/<pet_id>/<file>`.
- `client-photos`: documentazione operativa multipla (foto del manto, dell'orecchio, di condizioni speciali). Solo staff. Non visibile al customer di default. Path: `<operator_uid>/<file>` (mantenuto invariato per retrocompatibilità).

**Razionale:**

Roby ha chiarito che le foto sono **strumentali** alla pratica del salone — riconoscere il pet, documentare condizioni, gestire situazioni speciali. Esistono quindi due funzioni distinte:

- *Foto vetrina*: la "faccia" del pet, quella che il customer si aspetta di vedere nell'app, quella che gli ricorda il suo pet con affetto.
- *Foto operativa*: la documentazione clinica, parte della cartella di lavoro, eventualmente plurale per pet.

Forzare un unico bucket sarebbe stata semplificazione apparente — i due usi hanno permessi diversi, accesso diverso, semantica diversa.

**Eventuale rinomina futura:** `client-photos` in `pet-clinical-photos` per riflettere la realtà semantica. Posticipata a Fase 2 — è un cambio cosmetico che richiederebbe migration di tutti i path esistenti, non urgente.

---

## Decisione 5 — `pets.owner_user_id` mantenuto, rimozione programmata in Fase 2

**Domanda originale:** dopo lo split, `pets.owner_user_id` è ridondante (raggiungibile via `pets.customer_id` → `customers.user_id`)?

**Decisione:** **mantenuto** nel nuovo schema. Rimozione programmata come cleanup di Fase 2.

**Razionale:**

`pets.owner_user_id` è effettivamente ridondante dal punto di vista del modello dati (denormalizzazione di `pets.customer_id` → `customers.user_id`). Tuttavia:

- Le policy legacy temporanee in M11-bis [step 13] lo referenziano direttamente per le RLS staff. Rimuoverle richiederebbe riscrivere quelle policy ora, in un momento di lavoro denso.
- Le query staff esistenti in `database.js` lo usano per shortcut. Il refactor di Gate 5 le aggiornerà, ma non in modo aggressivo.

Tenere il campo per ora costa zero (è già lì) e aiuta la transizione. La denormalizzazione è gestita dal trigger `sync_customers_email_from_auth` per quanto riguarda l'email, ma non c'è trigger analogo per `owner_user_id` — quindi può andare fuori sincrono se un customer cambia `user_id`. Questo è il debito tecnico noto da ripagare in Fase 2.

**Azione in Fase 2:**

1. Verificare che nessuna RLS lo usi più (le RLS finali di Fase E già non lo usano).
2. Verificare che nessuna funzione DB lo legga (gli helper `has_tenant_access` non lo usano).
3. Aggiornare le query in `database.js` perché passino sempre via `customer_id` → `customers.user_id`.
4. Migration di rimozione del campo.

---

## Sintesi e prossimi passi

Le 5 decisioni sono **prese e documentate**. Diventano il riferimento per il Gate 5 vero (refactor di `database.js`).

**Lavoro previsto al Gate 5** (stima dall'analisi `staff-code-touchpoints.md`):

- 6-9 ore di refactor di `database.js`: 45 chiamate `.from()` da aggiornare, 98 occorrenze di `client_id` da sostituire.
- Sotto-migration per migrare `contacts` in `customers` (parte della Decisione 3).
- Aggiornamento delle 7 pagine staff che chiamano funzioni di `database.js` (find-replace meccanico una volta aggiornate le funzioni del gateway).

**Prerequisiti residui prima del Gate 5:**

- Eventuale terzo round con Davide e Roby sulle sezioni rimaste del documento flussi (sezione 2 dettagli foto, sezione 8 zona grigia). Non bloccante per Gate 5 — può procedere in parallelo.

**Dopo il Gate 5:**

- Gate 4 (test policy RLS): verificare che il sistema multi-tenant impedisca leak tra tenant. 2-4 ore.
- Gate 3 (app customer): scrittura delle 4 schermate Fase 1. Lavoro distribuito su più sessioni.
- Gate 6 (migration produzione): migration production-safe per merge in `grooming`. Da pianificare con finestra di manutenzione concordata col salone.

---

**Storico revisioni:**

- *Aprile 2026*: documento creato a chiusura del preliminare di Gate 5. Decisioni prese in sessione di lavoro insieme a Luigi, sulla base dei contributi di Davide e Roby raccolti nei due round di `flussi-operativi-salone.md`.
