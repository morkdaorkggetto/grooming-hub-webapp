# Incarico GH-07-bis — Contacts: assorbimento customer-first sul demo (Fase 2)

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 21 agosto 2026
**Base:** HEAD post GH-06 (`c65601b`) — dichiarare l'effettiva. Perimetro: branch `feat/customer-app`, DB **demo soltanto**. Prod intoccabile: il preflight prod read-only (§7.2 della tua ricognizione) è in carico a Cowork, in atto separato pre-G6. Niente push.

## Decisione di Luigi (21/8, a diario)

**Customer-first, opzione raccomandata della tua consegna GH-07**: i lead identificabili sono customer senza pet in stato operativo; nessuna tabella `inquiries`; i residui non identificabili si risolvono a mano prima del drop; `customers.phone` resta NOT NULL. Motivazione di contesto: al salone le richieste arrivano su WhatsApp, un telefono c'è sempre.

## Autorizzazioni

**Una migration additiva** (unica DDL del mandato): `customers.acquisition_source` e `customers.relationship_status` (mappa `new→lead`, `contacted→contacted`, `converted→active`, `archived→archived`), più la RPC staff `upsert_customer_lead` (SECURITY INVOKER, guard staff, telefono normalizzato obbligatorio, niente pet). Idempotente, fonte in commento, pattern M11-bis sul timestamp, ACL esplicita come GH-05-rpc. **La tabella `contacts` NON si droppa** e il suo automatismo resta spento.

## Lavori

1. **Backfill demo transazionale e idempotente** secondo le regole di match e fusione della §6 della tua ricognizione (priorità: link → telefono unico → nome assistito; nome pet mai da solo; conflitto = blocco riga; customer esistente vince; note con dedup esatta e destinazione semantica; nessuna perdita silenziosa — mapping nel registro). Sul demo attesi 5/5 assorbimenti puliti su customer esistenti: se la realtà diverge, è un finding, non un ostacolo da aggirare.
2. **Refactor `Contacts.jsx`** in direttorio customer secondo la tua mappa API (§3): `getCustomerDirectory` (customers ⨝ pets), `updateCustomerRelationshipStatus`, conversione lead = `addPetToCustomer` + stato `active` senza mai duplicare il customer, helper WhatsApp su customer. Multi-pet: riga unica per persona, scelta esplicita all'apertura scheda (tua proposta, adottata). Nessun redesign visivo oltre il necessario funzionale.
3. **Gateway**: rimozione degli alias deprecati e delle funzioni contacts sostituite; `from('contacts')` può restare solo se serve alla lettura del mapping pre-drop — se resta, dichiararlo con motivo.

## Controprove obbligatorie (dalla §9 della ricognizione, ridotte al demo)

1. Backfill: seconda esecuzione → 0 customer e 0 pet nuovi; nessun duplicato per telefono normalizzato; baseline 7 customer /7 pet spiegata riga per riga nel mapping.
2. Lead senza pet: creazione via UI, lista, WhatsApp, cambio stato, poi aggiunta pet → stesso customer, stato `active`.
3. Multi-pet: una riga persona, elenco pet, routing non ambiguo.
4. Fusione campi: tabella campione per ogni regola, inclusa la dedup delle note (le 5 note demo = note pet: attesa **nessuna copia**).
5. Suite RLS GH-06 rieseguita (con seed sonda GH-04 riapplicato e rismontato nello stesso ciclo, come da tua indicazione operativa n.2) + un test nuovo: il customer non legge `relationship_status`/`acquisition_source`/note operatore altrui.
6. Regressione: creazione customer+pet ordinaria, inviti, portale customer invariati. Build verde, zero warning nuovi.
7. Network: la pagina Contatti non chiama più `/rest/v1/contacts` (log della finestra di prova).

## Consegna

Registro in `docs/consegne/`: base, migration registrata, mapping di assorbimento esaustivo, tabella file, hash commit atomici, esiti controprove, eccezioni e fuori-istruzione, note per il preflight prod (cosa Cowork deve misurare sulle 301 righe alla luce di ciò che il demo ha insegnato). Interruzione motivata sempre ammessa.
