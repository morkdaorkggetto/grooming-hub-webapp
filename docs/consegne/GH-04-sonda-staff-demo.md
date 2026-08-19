# Consegna GH-04 - Sonda staff usa-e-getta sul demo

**Data:** 18 agosto 2026
**Branch:** `feat/customer-app`
**Base dichiarata:** `3254c95`
**Ambiente toccato:** solo Supabase demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`, stato `ACTIVE_HEALTHY`)
**Produzione:** non interrogata e non toccata
**Push/deploy:** non eseguiti

## Atto eseguito

Creata la sonda `staff.sonda@test.example` con identita email confermata,
profilo legacy `[DEMO] Sonda staff GH-04` con ruolo `operator` e membership
moderna `staff` sul tenant `grooming-hub`. Il profilo legacy e necessario
allo stato attuale per il login nell'app staff; l'autorizzazione RLS deriva
dalla membership `staff`.

Password pubblica, usa-e-getta e non segreta della sonda:
`demo-gh04-staff-2026`.

Il seed non crea righe in `public.customers` e contiene una guard che annulla
l'intera transazione se la sonda risultasse collegata a un customer.

Il seed e stato eseguito due volte con successo. Stato finale dopo la seconda
esecuzione: 1 utente Auth, 1 identita, 1 profilo `[DEMO]`, 1 membership
`staff`, 0 membership di altri ruoli e 0 customer.

## File esaustivi

| File | Azione | Commit |
|---|---|---|
| `supabase/seeds/gh-04-staff-probe-demo.sql` | Creato; seed idempotente della sonda | incluso |
| `docs/consegne/GH-04-sonda-staff-demo.md` | Creato; questo registro | escluso per disposizione `commit chore: del solo seed` |

Nessun file applicativo e stato modificato da GH-04.

## Commit

`8588bdd08dc087909a8e6880da9a3f112ae13bf9`
Messaggio: `chore: add disposable demo staff probe`

Il commit contiene esclusivamente
`supabase/seeds/gh-04-staff-probe-demo.sql`.

## Controprove misurate

| # | Controprova | Esito |
|---|---|---|
| 1 | Login API `staff.sonda@test.example` | Riuscito; access token rilasciato |
| 2 | Lettura pet del tenant con sessione sonda | Riuscita; 7 pet visibili, membership rilevata solo come `staff` |
| 3 | Nessun effetto lato Mario | Login riuscito; invariati 1 customer, 2 pet (`Luna`, `Pepe`) e 5 visite |
| 4 | Sonda assente dai customer | 0 righe sia via sessione sonda sia via verifica SQL diretta |

Baseline Mario prima dell'atto: 1 customer, 2 pet, 5 visite. Gli stessi
conteggi sono stati rimisurati dopo l'applicazione e la riesecuzione del seed.

## Eccezioni

I primi due tentativi di esecuzione sono stati respinti e annullati
integralmente da Postgres prima del commit della transazione:

1. `min(uuid)` non disponibile: sostituito con conteggio e lettura separati;
2. `auth.identities.email` e una colonna generata: rimossa dall'INSERT e
   dall'UPDATE.

Il terzo tentativo e riuscito; la seconda esecuzione idempotente e riuscita
senza creare duplicati. Nessun dato parziale e rimasto dai tentativi falliti.

## Fuori istruzione e stato parallelo

- L'account operatore reale non e stato interrogato o modificato.
- Gli account customer non sono stati promossi, demoliti o modificati.
- Nessuna policy, funzione o migration e stata creata.
- `src/shared/auth/AuthProvider.jsx` resta modificato localmente dal precedente
  GH-02-quater; GH-04 non lo ha toccato e non lo ha incluso nel commit.
- `docs/diario-progetto.md` e gli altri documenti locali erano gia modificati
  o untracked e non sono stati inclusi nel commit.
- GH-02-quater non ha ancora un commit o un registro locale e conserva 3 delle
  4 controprove: manca il login operator. Questa consegna non lo dichiara
  completato.

## Raccomandazione a Cowork per la chiusura G3

Alla chiusura di G3 conviene autorizzare un teardown separato, limitato
all'identita con email e UUID fissi della sonda. Soluzione minima consigliata:

1. rimuovere `auth.users` solo se email e UUID coincidono con quelli GH-04;
2. lasciare alle foreign key `ON DELETE CASCADE` la rimozione di identita,
   profilo e membership;
3. verificare 0 righe residue nelle quattro tabelle e 0 customer;
4. provare il login con la password dichiarata e registrare
   `invalid_credentials`.

Questa raccomandazione non autorizza lo smontaggio anticipato: la sonda resta
attiva esclusivamente per G3 e va rimossa nella relativa consegna.
