# Incarico GH-05 — Gate 5, prima tranche: staff app verde sul demo

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Perimetro:** branch `feat/customer-app`; file autorizzati: `src/apps/staff/lib/database.js`, le 7 pagine staff che lo consumano, lo shim `supabaseClient.js` (rimozione). DB demo solo per controprove. **Nessuna migration** (la migrazione `contacts`→`customers` e i test Gate 4 sono il futuro GH-06). Prod intoccabile. Niente push.
**Non partire prima della consegna di GH-02-quater** (stesso ramo: base da dichiarare sul suo HEAD). Nota: l'ultima controprova di quater (routing di ruolo) può usare la sonda GH-04 — non serve l'account operatore reale.

## Perché

L'app staff sul demo è rotta dal Gate 2: misure Cowork del 18/8 su `database.js` — 13 `from('clients')`, 3 `customer_client_links`, 48 `client_id`. La sonda GH-04 ha misurato il sintomo d'ingresso: login ok, poi `Could not find the table 'public.customer_client_links'`. Fase B del piano: rimettere in piedi lo staff è ciò che rende la produzione pensabile.

## Parte 0 — Bootstrap (proposta Codex del 18/8, adottata da Luigi)

I 6 punti della proposta, integrali: `tenant_memberships` fonte canonica di ruolo e accesso; `profiles.role` conservato solo per compatibilità UI; via l'interrogazione obbligatoria di `customer_client_links` dal bootstrap; nessuna ricreazione/promozione/retrocessione di profili su base tabella legacy assente; contratto pubblico di `getUserProfile()` invariato verso i consumer; il codice si adatta allo schema reale.

## Parte 1 — Refactor `database.js` (Decisioni Gate 5, `supabase/docs/gate5-design-decisions.md`)

- **Decisione 1**: vista principale = pet con padrone in evidenza. `getAllPets(tenant_id, filters)` con join `pets ⨝ customers`; sorting default `last_visit_at` desc.
- **Decisione 2**: `addCustomerWithPet(customer_data, pet_data, tenant_id)` transazionale + `addPetToCustomer(customer_id, pet_data)`.
- **Decisione 3**: `convertContactToClient` **deprecata** — chiamate residue riscritte come operazioni dirette su `customers`. La tabella `contacts` NON si migra né si rimuove qui (GH-06): il codice deve solo smettere di dipenderne per i flussi principali; se una pagina la legge ancora, va dichiarato nel registro come dipendenza residua per GH-06.
- **Decisione 5**: `owner_user_id` si tocca il meno possibile; preferire il percorso `customer_id → customers.user_id` nelle query riscritte, senza caccia aggressiva.
- Rimozione dello shim `supabaseClient.js` con cablaggio sui provider shared (`src/shared/supabase`).

## Parte 2 — Le 7 pagine staff

Aggiornamento guidato dalla build (find-replace meccanico una volta riscritto il gateway). Nessun redesign: il cappello della composizione è di CD, qui si ripara il cablaggio dati.

## Griglia delle cinque domande (canone §3) — obbligatoria prima di scrivere

L'intreccio caldo è la n.2: `profiles.role` e `tenant_memberships.role` erano di fatto lo stesso valore e ora si separano — ogni uso di `role` nel codice staff va riletto chiedendosi da quale fonte legge e cosa succede se divergono (la sonda è il caso reale: profilo `operator`, membership `staff`). E la n.4: ogni operazione che lo staff faceva (inserire cliente+pet, cercare, aggiornare visite) deve potersi ancora fare.

## Controprove obbligatorie

1. Login sonda `staff.sonda@test.example` → dashboard staff visibile, niente errore `customer_client_links`.
2. Lista pet del tenant visibile dalla dashboard (7 pet attesi, conteggio misurato).
3. Creazione cliente+pet di prova marcati `[DEMO GH-05]` via UI → transazione unica riuscita → **pulizia dichiarata a fine controprova**.
4. Mario entra nell'app customer e vede solo Luna e Pepe (conteggi baseline invariati).
5. Routing bidirezionale: sonda esclusa dall'area customer, Mario escluso dall'area staff.
6. Zero richieste a `customer_client_links` e `clients` (network/console misurati), zero errori console nuovi.
7. Build verde; conteggio finale nel registro: `from('clients')` = 0, `customer_client_links` = 0 in `database.js`.

## Condizioni di consegna

Registro in `docs/consegne/`: base dichiarata (HEAD post-quater), tabella esaustiva file, hash commit atomici (`refactor:`/`fix:`), esiti misurati delle 7 controprove, dipendenze residue da `contacts` dichiarate per GH-06, eccezioni e fuori-istruzione. La sonda resta viva (smontaggio in GH-06). Interruzione motivata sempre ammessa.
