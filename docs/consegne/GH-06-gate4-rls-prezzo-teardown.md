# Consegna GH-06 - Gate 4 RLS, prezzo customer e teardown sonda

**Data:** 21 agosto 2026  
**Branch:** `feat/customer-app`  
**Base dichiarata:** `50a41b57c973a227a86eb78f09fa1a2e1c58b69c`  
**Ambiente toccato:** solo Supabase demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`, stato `ACTIVE_HEALTHY`)  
**Produzione:** non interrogata e non toccata  
**Migration:** nessuna  
**Push/deploy:** non eseguiti

## Esito

La suite RLS ripetibile copre isolamento customer/customer e customer/staff,
ACL della RPC staff, whitelist delle colonne pet, policy Storage e facolta
staff. L'esecuzione viva prima del teardown ha prodotto **17 PASS, 0 FAIL e 1
SKIP**. Lo SKIP cross-tenant e quello nominato dal mandato: sul demo esiste un
solo tenant reale.

Il prezzo e lo sconto sono stati rimossi dalle righe dello storico visite in
`Pet.jsx`; servizio, note e problemi restano invariati, senza anticipare il
redesign R2.

La sonda GH-04 e stata rimossa per ultima, con guardia esatta su email e UUID.
La cascata ha lasciato zero righe in Auth, identita, profilo, membership e
customer. Il login successivo e stato rifiutato con `invalid_credentials`. Il
seed GH-04 resta nel repository per una ricreazione futura controllata.

## Commit atomici

| Commit | Oggetto |
|---|---|
| `728f4dfcd8c7b63f43e8edfd2cb1e576a5116d14` | `test: add repeatable demo RLS suite` |
| `6ee31f656f4ca246432cee9df6a492cae7991fc2` | `fix: hide visit prices from customer pet history` |
| `c65601b691c620acb9381e596eb600d8f7145acb` | `chore: add guarded demo staff probe teardown` |

## File esaustivi

| File | Azione | Commit/stato |
|---|---|---|
| `scripts/rls-tests/run.mjs` | Nuova suite API ripetibile con guardia sul project ref demo, reporting PASS/FAIL/SKIP e pulizia in `finally` | `728f4df` |
| `supabase/docs/rls-tests.md` | Istruzioni, prerequisiti ed esiti misurati | `728f4df` |
| `src/apps/customer/pages/Pet.jsx` | Rimossi importo, sconto e `MONEY_FORMAT` dallo storico customer | `6ee31f6` |
| `scripts/rls-tests/teardown-staff-probe.sql` | Teardown idempotente con controllo email+UUID e verifiche residue | `c65601b` |
| `.env.local` | Aggiunte solo localmente le tre variabili password delle fixture; file ignorato da Git, valori non committati | locale, escluso |
| `docs/consegne/GH-06-gate4-rls-prezzo-teardown.md` | Creato; questo registro | escluso dai commit applicativi |

## Controprove RLS misurate

| # | Controprova | Esito |
|---|---|---|
| 1 | Login API sonda, Mario e Luca | PASS; i tre UUID attesi prima del teardown |
| 2 | Baseline staff | PASS; 7 pet nel tenant demo |
| 3 | Isolamento Mario verso Luca | PASS; 0 customer, 0 pet e 0 visite visibili |
| 4 | Isolamento Luca verso Mario | PASS; 0 customer, 0 pet e 0 visite visibili |
| 5 | Isolamento customer verso staff | PASS; Mario vede 0 membership e 0 profili della sonda |
| 6 | RPC `add_customer_with_pet` da Mario | PASS; SQLSTATE `42501`, 0 scritture marker |
| 7 | Whitelist pet customer | PASS; `microchip`, `name`, `internal_notes` invariati; `owner_notes` scritto e ripristinato |
| 8 | Storage pet proprio | PASS; upload 200 e cancellazione riuscita |
| 9 | Storage pet altrui e tenant estraneo | PASS; entrambi HTTP 403 |
| 10 | Facolta staff | PASS; lettura 7 pet e modifica `internal_notes`, poi ripristino |
| 11 | Staff fuori tenant | SKIP dichiarato; manca un secondo tenant reale sul demo |
| 12 | Pulizia `[DEMO GH-06]` | PASS; 0 pet, 0 visite, 0 customer e 0 oggetti Storage residui |

Per rendere l'isolamento bidirezionale non vacuo, la suite ha creato per Luca
un pet e una visita temporanei marcati `[DEMO GH-06]`. Luca non aveva pet
persistenti. I record sono stati rimossi automaticamente e la baseline finale
e tornata a 7 pet.

## Teardown misurato

Preflight prima della cancellazione:

- progetto confermato `grooming-hub-demo`, stato `ACTIVE_HEALTHY`;
- 1 utente per email, 1 per UUID e 1 corrispondenza esatta email+UUID;
- 0 customer e 0 pet appartenenti alla sonda.

Stato dopo la cancellazione protetta:

| Tabella/prova | Misurato |
|---|---|
| `auth.users` | 0 |
| `auth.identities` | 0 |
| `public.profiles` | 0 |
| `public.tenant_memberships` | 0 |
| `public.customers` | 0 |
| Account fixture Mario + Luca | 2, invariati |
| Pet totali | 7, invariati |
| Marker GH-06 pet/visite/Storage | 0 / 0 / 0 |
| Login sonda | `invalid_credentials` |

Il teardown e stato eseguito una seconda volta a sonda gia assente ed e
terminato correttamente, confermandone l'idempotenza.

## Verifiche tecniche

- `node scripts/rls-tests/run.mjs`: 17 PASS, 0 FAIL, 1 SKIP, prima del teardown.
- `node --check scripts/rls-tests/run.mjs`: riuscito.
- Scan credenziali sui file GH-06 committati: nessuna password presente.
- Grep `MONEY_FORMAT|currency|cost|discount|prezzo|EUR` su `Pet.jsx`: nessun
  risultato.
- `npm run build`: riuscito, Vite 5.4.21, 132 moduli.
- `git diff --check`: pulito per i file GH-06.
- Warning preesistenti: database Browserslist non aggiornato e chunk JavaScript
  oltre 500 kB.

## Eccezioni e fuori istruzione

- La prova staff cross-tenant resta SKIP per assenza di un secondo tenant demo;
  non e stata creata una fixture di tenant fuori mandato.
- La suite completa non e rieseguibile dopo il teardown finche non viene
  riapplicato il seed idempotente GH-04; la procedura e dichiarata in
  `supabase/docs/rls-tests.md`.
- Le password demo necessarie alla prova sono state lette solo da `.env.local`,
  ignorato da Git. Nessuna password o service-role key e stata committata.
- La guardia di teardown verifica anche che la sonda non possieda pet: controllo
  di sicurezza aggiuntivo, senza cancellazioni extra.
- Le modifiche parallele a `docs/diario-progetto.md`,
  `docs/environment-map.md`, `docs/incarichi/GH-03-brief-claude-design.md` e
  `docs/incarichi/GH-05-bis-staff-refactor.md` sono attribuite a Cowork e
  autorizzate da Luigi; sono rimaste fuori dallo stage e dai commit.
- I registri non tracciati GH-05-rpc e GH-05-bis non sono stati modificati o
  inclusi. Il mandato GH-06 non tracciato e rimasto fuori dai commit.
- Nessuna migration di schema, nessun accesso alla produzione, nessun deploy e
  nessun push.

## Indicazioni operative per Cowork

1. Per chiudere lo SKIP senza test artificiali, autorizzare in un mandato
   futuro un secondo tenant demo con fixture usa-e-getta e teardown associato.
2. Se una fase futura richiede nuovamente prove staff vive, riapplicare prima
   il seed GH-04 sul solo demo e smontarlo nello stesso ciclo di consegna.
3. Mantenere le password fixture fuori dai file versionati e predisporle nel
   solo ambiente locale/CI protetto prima dell'esecuzione della suite.

