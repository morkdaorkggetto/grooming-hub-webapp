# Incarico GH-05-bis — Gate 5, refactor staff (ripresa corretta)

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**AGGIORNAMENTO 21/8 — GH-05-rpc consegnato e verificato** (commit `a3d40e8`, migration `20260821031654`). Base di partenza: HEAD corrente post-rpc. Le **5 indicazioni operative** della consegna GH-05-rpc (§ Indicazioni operative) sono adottate come parte di questo mandato: wrapper sottile senza compensazioni DELETE client-side; telefono reso obbligatorio in `AddClient.jsx` (è `NOT NULL` a schema) mantenendo il layout; split nome/cognome col criterio del backfill M11-bis; controprova di atomicità UI con `p_pet_sex='x'` → atteso `23514` e 0 customer; upload foto dichiarato passo successivo alla creazione, mai cancellazioni compensative silenziose su errore storage.

**Secondo atto ordinato**: parte solo a consegna GH-05-rpc verificata. Sostituisce GH-05, i cui difetti di mandato (contraddizione RPC/no-migration, elenco file incompleto, colonna `last_visit_at` inesistente) sono riconosciuti come errori di Cowork e corretti qui. Perimetro DB: demo solo per controprove, **nessuna nuova migration**. Prod intoccabile. Niente push. Base: HEAD post GH-05-rpc, da dichiarare.

## File autorizzati (elenco completo, dalla misura di Codex)

`src/apps/staff/lib/database.js` · le 7 pagine dati staff · `src/apps/staff/pages/AddClient.jsx` · e i consumer dello shim: `StaffApp.jsx`, `components/Auth/LoginForm.jsx`, `pages/CustomerInvite.jsx`, `pages/CustomerLogin.jsx`, `pages/PublicPetCard.jsx`, `pages/ResetPassword.jsx` · rimozione `src/apps/staff/lib/supabaseClient.js`. Se durante il lavoro emerge un consumer non elencato: dichiaralo e includilo, con nota nel registro (non è estensione di perimetro, è completamento dell'inventario).

## Parte 0 — Bootstrap (6 punti della tua proposta + regola di adattamento)

`tenant_memberships` decide l'accesso; il ruolo per i consumer legacy si adatta **in memoria** (`owner|staff → operator`, `customer → customer`), **nessun UPDATE automatico al DB** per far coincidere le due fonti; via la dipendenza da `customer_client_links` e `clients` dal bootstrap; contratto pubblico di `getUserProfile()` invariato.

## Parte 1 — Refactor per Decisioni Gate 5, con i contratti corretti

- `getAllPets(tenant_id, filters)`: join `pets ⨝ customers`; **ordinamento per ultima visita derivato da `visits.date` lato client** — contratto dichiarato per il dataset pilota (7 pet); la vista/RPC DB per ordinamento scalabile è annotata come debito di Fase 2, non si fa qui.
- `addCustomerWithPet` = wrapper della RPC `add_customer_with_pet` di GH-05-rpc.
- `addPetToCustomer(customer_id, pet_data)` diretto (singolo INSERT, nessuna atomicità multi-tabella richiesta).
- `convertContactToClient` e `createContactFromClient` deprecate; chiamate residue riscritte su `customers`; dipendenze residue da `contacts` dichiarate per GH-06.
- `owner_user_id`: nei nuovi inserimenti lo valorizza la RPC; nelle query preferire `customer_id → customers.user_id` senza caccia aggressiva (Decisione 5).

## Parte 2 — Pagine e shim

Aggiornamento delle pagine autorizzate guidato dalla build; `AddClient.jsx` passa al flusso `addCustomerWithPet`/`addPetToCustomer` mantenendo la schermata unica a due sezioni (Decisione 2 — nessun redesign, il cappello visivo è di CD). Rimozione dello shim con cablaggio su `src/shared/supabase`.

## Controprove obbligatorie

1. Login sonda → dashboard staff visibile, niente errori `customer_client_links`/`clients`.
2. Lista pet con padrone in evidenza: 7 pet misurati, ordinamento per ultima visita verificato su 2 casi noti del seed.
3. Creazione cliente+pet `[DEMO GH-05]` **via UI AddClient** → riuscita → pulizia misurata.
4. Errore forzato nella creazione via UI → 0 customer orfani.
5. Mario: app customer invariata (conteggi baseline).
6. Routing bidirezionale sonda/Mario.
7. Zero richieste a tabelle legacy (network misurato); build verde; `from('clients')` = 0 e `customer_client_links` = 0 in tutto `src/apps/staff/`.

## Consegna

Registro in `docs/consegne/`: base dichiarata, tabella esaustiva file, commit atomici, esiti misurati delle 7 controprove, dipendenze residue per GH-06 (contacts, test RLS Gate 4, smontaggio sonda), eccezioni e fuori-istruzione. Interruzione motivata sempre ammessa.
