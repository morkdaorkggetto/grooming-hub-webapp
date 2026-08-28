# Incarico GH-06 — Gate 4 (test RLS) + rimozione prezzo customer + smontaggio sonda

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 21 agosto 2026
**Perimetro:** branch `feat/customer-app`, base = HEAD corrente post GH-05-bis (dichiararla). DB demo `grooming-hub-demo` per test e smontaggio. **Nessuna migration di schema.** Prod intoccabile. Niente push.
**Nota di calibrazione:** la migrazione `contacts`→`customers` annunciata per GH-06 slitta a mandato dedicato (GH-07) con ricognizione propria — decisione Cowork, motivata dalla complessità del matching. Qui si chiude tutto il resto del giro G3.

## Parte 1 — Gate 4: suite di test RLS ripetibile

Script in `scripts/rls-tests/` (JS, anon key + login via API), rieseguibile con un comando, che misura e riporta esiti PASS/FAIL:

1. **Isolamento customer↔customer**: Mario non legge customer/pet/visite di Luca e viceversa (già provato a spot, qui diventa suite).
2. **Isolamento customer↔staff**: Mario non legge `tenant_memberships` altrui, non vede la sonda, non chiama funzioni staff (RPC `add_customer_with_pet` → `42501`).
3. **Protezione colonne** (trigger whitelist GH-02-bis): UPDATE di Mario su `microchip`, `name`, `internal_notes` → valori invariati; su `owner_notes` → passa.
4. **Storage** (policy GH-02-ter): upload Mario su pet proprio → ok; su pet altrui / tenant estraneo → 403. Pulizia oggetti di prova.
5. **Staff**: la sonda legge i 7 pet, aggiorna un campo staff-only, non vede nulla fuori tenant (per ora un solo tenant sul demo: il test cross-tenant si scrive comunque, marcato SKIP finché non esiste un secondo tenant di prova — nominato, non nascosto).

Esiti documentati in `supabase/docs/rls-tests.md`: tabella test/atteso/misurato/data, istruzioni di riesecuzione. I dati di prova marcati `[DEMO GH-06]` e ripuliti.

## Parte 2 — Rimozione prezzo dal lato customer

Decisione Luigi 21/8 (a diario): nessun prezzo visibile al customer, mai. In `src/apps/customer/pages/Pet.jsx`: rimuovere l'importo dalle righe dello storico visite (e `MONEY_FORMAT` se resta orfano). Al posto del prezzo, per ora, solo servizio/nota già presenti — la ricomposizione della riga arriverà dalla calibrazione R2 di CD, non anticiparla. Nessun altro redesign.

## Parte 3 — Smontaggio sonda (chiusura ciclo GH-04)

Secondo la raccomandazione della consegna GH-04, **da eseguire per ultima** (le Parti 1 usano la sonda): rimozione `auth.users` solo se email e UUID coincidono con quelli GH-04; cascata su identità/profilo/membership; verifica 0 righe residue nelle quattro tabelle e 0 customer; login con la password dichiarata → `invalid_credentials` misurato. Il seed resta nel repo per ricreazioni future.

## Controprove di consegna

Suite RLS: tutti PASS (o FAIL motivati e nominati); grep `MONEY_FORMAT`/importi in Pet.jsx = assenti; build verde; smontaggio misurato. Registro in `docs/consegne/` con base, tabella esaustiva file, hash commit atomici (`test:`, `fix:`, `chore:`), eccezioni e fuori-istruzione. Interruzione motivata sempre ammessa.
