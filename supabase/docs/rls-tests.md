# Suite RLS demo GH-06 / GH-32

Ultima esecuzione misurata: **28 agosto 2026**.

Questa suite verifica le policy RLS e Storage sul solo progetto Supabase demo
`grooming-hub-demo` (`qttpinkslhenxrsbhhhg`). Lo script interrompe l'esecuzione
se `VITE_SUPABASE_URL` non punta esattamente a quel project ref.

## Prerequisiti

- `.env.local` contiene `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` del demo.
- `.env.local` contiene le password locali delle fixture nelle variabili
  `GH_RLS_MARIO_PASSWORD`, `GH_RLS_LUCA_PASSWORD` e `GH_RLS_STAFF_PASSWORD`.
- Le fixture customer Mario e Luca sono presenti.
- La sonda staff GH-04 e presente con UUID ed email dichiarati in
  `supabase/seeds/gh-04-staff-probe-demo.sql`.
- Node.js e le dipendenze del progetto sono installati.

La suite usa esclusivamente anon key e login API degli account di test. Non usa
service role e non contiene o committa password.

## Esecuzione

Dalla cartella `webapp`:

```sh
node scripts/rls-tests/run.mjs
```

Lo script crea un pet e una visita temporanei per Luca con marker
`[DEMO GH-06]`, esegue le prove e ripulisce i dati e gli oggetti Storage anche
in caso di errore. Un esito FAIL produce exit code diverso da zero.

## Esiti misurati

| Test | Atteso | Misurato il 2026-08-21 | Esito |
| --- | --- | --- | --- |
| Login sonda staff | Sessione API disponibile | UUID GH-04 atteso | PASS |
| Login Mario | Sessione API disponibile | UUID fixture Mario atteso | PASS |
| Login Luca | Sessione API disponibile | UUID fixture Luca atteso | PASS |
| Lettura staff baseline | 7 pet nel tenant demo | 7 pet | PASS |
| Portale customer, nucleo proprio | 1 customer e 2 pet di Mario | 1 customer, 2 pet | PASS |
| Staff legge e scrive note riservate | Due marker leggibili dallo staff | 2 marker scritti e riletti | PASS |
| Customer legge note riservate | 0 note pet, 0 note customer | 0, 0 | PASS |
| Portale incorpora note riservate | Due pet, relazioni note vuote | 2 pet, 0 relazioni note | PASS |
| Customer scrive note riservate | Due rifiuti RLS | 2 rifiuti `42501`/RLS | PASS |
| Colonne note legacy | `operator_notes` e `internal_notes` assenti | 2 errori `42703` | PASS |
| Mario verso Luca | 0 customer, 0 pet, 0 visite | 0, 0, 0 | PASS |
| Luca verso Mario | 0 customer, 0 pet, 0 visite | 0, 0, 0 | PASS |
| Customer verso sonda | 0 membership, 0 profili staff | 0, 0 | PASS |
| Campi direttorio customer altrui | 0 righe con status o source | 0 righe | PASS |
| Scrittura campi direttorio propri | `relationship_status` e `acquisition_source` invariati | Invariati (`active`, `manual`) | PASS |
| RPC staff da customer | SQLSTATE `42501`, nessuna scrittura | `42501`, 0 customer | PASS |
| Whitelist `microchip` | Valore invariato | Invariato (`null`) | PASS |
| Whitelist `name` | Valore invariato | Invariato (`Luna`) | PASS |
| Whitelist `owner_notes` | Modifica consentita | Marker scritto e ripristinato | PASS |
| Storage su pet proprio | Upload e delete consentiti | Upload 200, delete riuscita | PASS |
| Storage su pet altrui | HTTP 403 | HTTP 403 | PASS |
| Storage su tenant estraneo | HTTP 403 | HTTP 403 | PASS |
| Aggiornamento staff-only | Nota pet modificabile dallo staff | Marker scritto e ripristinato | PASS |
| Staff fuori tenant | 0 righe da secondo tenant reale | Secondo tenant non disponibile | SKIP |
| Pulizia fixture | 0 residui marker | 0 pet, 0 visite, 0 customer | PASS |

Totale misurato: **30 PASS, 0 FAIL, 1 SKIP**.

Lo SKIP cross-tenant e esplicito e previsto dal mandato: il progetto demo ha un
solo tenant. Il test potra diventare una controprova reale quando sara
disponibile una fixture appartenente a un secondo tenant.

## Sonda GH-04

GH-06 smonta la sonda staff al termine delle verifiche. Dopo il teardown, il
login della sonda deve restituire `invalid_credentials`; per rieseguire la suite
completa occorre prima riapplicare in modo controllato il seed idempotente
`supabase/seeds/gh-04-staff-probe-demo.sql` sul solo demo.
