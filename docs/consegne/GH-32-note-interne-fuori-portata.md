# Consegna GH-32 - Note interne fuori dalla portata customer

**Root dichiarata come primo atto:** `/Users/luigimaisto/Desktop/grooming-hub-web/`

**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`

**Stato:** completato

**Branch:** `feat/customer-app`

**Base Git dichiarata:** `7251fc819858333d55a73c65ef0799914466d586`

**Commit della consegna:** il commit che contiene questo registro; SHA riportato
nella risposta finale e ricavabile con `git log -1 -- docs/consegne/GH-32-note-interne-fuori-portata.md`.

**Database ammesso e usato:** solo demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`). Produzione e progetto temporaneo non letti e non
modificati. Nessun push, deploy, merge o promozione.

## 1. Modello scelto e invarianti

Le note del salone sono state spostate in due tabelle di proprieta del salone:

- `customer_staff_notes`, collegata a `customers` con chiave primaria e foreign
  key `ON DELETE CASCADE`;
- `pet_staff_notes`, collegata a `pets` con la stessa struttura.

Entrambe hanno RLS attiva e una sola policy `ALL TO authenticated`, vincolata a
`has_tenant_any_staff_access()` attraverso la riga padre. `anon` non ha grant e
un customer autenticato non soddisfa la policy. Il legame al tenant non e
duplicato: deriva dalla riga padre, evitando divergenze.

Le colonne `customers.operator_notes` e `pets.internal_notes` sono state
rimosse dopo backfill e verifica esatta del contenuto. L'interfaccia staff
continua a ricevere in memoria gli stessi alias legacy, quindi componenti,
etichette e gesto di salvataggio non cambiano.

## 2. Migrazione e coordinamento GH-30

La migration `20260828120104_gh32_staff_internal_notes.sql`:

1. crea tabelle, constraint, grant, RLS e trigger timestamp;
2. copia ogni nota legacy non vuota e interrompe la transazione su conflitto o
   mancata corrispondenza;
3. sostituisce `add_customer_with_pet` e `upsert_customer_lead` mantenendone
   firma, guard staff e atomicita;
4. sostituisce il trigger GH-30, conservando la protezione di
   `acquisition_source` e `relationship_status`;
5. rimuove trigger/funzioni legacy delle note e infine le due colonne esposte.

GH-30 non e stato modificato: nella ricetta resta atto 33 e viene eseguito
mentre `operator_notes` esiste. GH-32 entra come atto 39, dopo GH-08 e dopo le
RPC che fanno ancora riferimento alle colonne legacy, e prima di seed, GH-22,
GH-25, GH-27 e hardening. Il §6 di GH-30 e stato rinumerato fino a 54 senza
perdere le inversioni gia motivate.

## 3. Misure dati

| Misura | Prima sul demo | Dopo sul demo |
|---|---:|---:|
| note customer non vuote | 0 | 0 in `customer_staff_notes` |
| note pet non vuote | 5 | 5 in `pet_staff_notes` |
| totale note | **5** | **5** |
| note orfane | n/a | 0 |
| colonne legacy presenti | 2 | 0 |

Il **32 -> 32** richiesto dal mandato riguarda la misura produzione fornita da
Cowork. Codex non ha accesso alla produzione per verificarla senza violare il
perimetro. La ricetta G6 ora richiede esplicitamente preflight e postflight
**32 -> 32** intorno all'atto 39.

## 4. Controprove live

Sessione customer reale `mario.rossi@test.example`, autenticata via anon key:

| Controprova | Esito misurato |
|---|---|
| lettura diretta `pet_staff_notes` | 0 righe |
| lettura diretta `customer_staff_notes` | 0 righe |
| query annidata del portale | 2 pet, 0 relazioni note |
| scrittura nota pet e customer | 2 rifiuti `42501`/RLS |
| query colonne legacy | 2 errori `42703`, colonne assenti |
| modifica campi direttorio propri | `relationship_status` e `acquisition_source` invariati |

Sessione staff usa-e-getta GH-04:

- login e dashboard staff riusciti, 7 pet visibili;
- apertura scheda Luna di Mario e gesto `Modifica -> Note -> Salva Modifiche`;
- marker mostrato come `Indicazioni operatore` e riletto identico nel modulo;
- nessun errore console; presenti solo due warning React Router preesistenti;
- marker eliminato e conteggio note tornato da 6 a 5.

Suite RLS finale: **30 PASS, 0 FAIL, 1 SKIP**. Lo SKIP e quello previsto per
lo staff fuori tenant: il demo ha un solo tenant.

## 5. Pulizia e assenza residui

Dopo le prove:

| Residuo | Conteggio finale |
|---|---:|
| sonda in `auth.users` | 0 |
| sonda in `auth.identities` | 0 |
| sonda in `profiles` | 0 |
| sonda in `tenant_memberships` | 0 |
| fixture pet/visite/richieste GH-06/GH-08 | 0 |
| marker note GH-32 | 0 |
| note complessive demo | 5 |

Nessun account reale e stato modificato. Mario e Luca sono fixture customer;
le note temporanee sulla fixture Mario sono state ripristinate nella stessa
sessione.

## 6. File della consegna

| File | Azione | SHA-256 pre-commit |
|---|---|---|
| `docs/consegne/GH-30-ricetta-g6-ripresa.md` | aggiornato §6, numerazione, impronte e rischio chiuso | `23abc30aea6a55a4db713fc56dcf7da0776dbc6af622e25487c8d012248e1a8a` |
| `docs/consegne/GH-32-note-interne-fuori-portata.md` | registro creato | auto-riferimento non applicabile |
| `scripts/rls-tests/run.mjs` | suite adattata alle tabelle staff-only e alle nuove controprove | `4f54b353dd708e99ede4411c6e190c8a8b7bce7a42fbd05cf0dd9854f1f03bc4` |
| `src/apps/staff/lib/database.js` | adapter note staff-only con contratto UI invariato | `8a6cfc1fa4d5118a7b413f2dba09fd5a78285fd68fee47db10839ddb4a440f2b` |
| `supabase/docs/rls-tests.md` | esiti e procedura aggiornati | `aa1c29a6de909508dc3fb76123f17a7593f22809fe91cd230f27b49f87d13950` |
| `supabase/migrations/20260828120104_gh32_staff_internal_notes.sql` | migration idempotente creata e applicata solo al demo | `50b6de8cb6df7b2a19cd506694bb1df9af4ad1a21c1f4db32c6e50d923045940` |

## 7. Verifiche eseguite

- progetto demo verificato `ACTIVE_HEALTHY`, PostgreSQL 17.6.1;
- migration applicata con successo esclusivamente al demo;
- conteggio demo note **5 -> 5**, zero orfani;
- RLS e singola policy staff-only presenti su entrambe le nuove tabelle;
- trigger direttorio limitato a `acquisition_source, relationship_status`;
- advisor Supabase: nessun nuovo rilievo security o performance riferito alle
  due tabelle GH-32;
- suite RLS: **30 PASS, 0 FAIL, 1 SKIP**;
- verifica UI staff completa e ripristinata;
- ricetta: **42/42** hash validi, sequenza **1-54** continua;
- `node --check scripts/rls-tests/run.mjs`: riuscito;
- `git diff --check`: riuscito;
- `npm run build`: riuscita, Vite 147 moduli, 1,34 s.

## 8. Eccezioni e fuori istruzione

- `npm run lint` non e eseguibile: lo script esiste ma `eslint` non e
  installato in `node_modules` (`exit 127`). Nessuna dipendenza e stata
  installata fuori mandato.
- La build segnala Browserslist non aggiornato e chunk principale oltre 500 kB;
  sono warning non bloccanti e preesistenti.
- Gli advisor demo conservano rilievi preesistenti non riferiti a GH-32, tra cui
  Leaked Password Protection disattivata e warning su funzioni/policy esistenti.
- `scripts/salva.sh` era gia modificato all'ingresso: ignorato, non messo in
  stage e non incluso nel commit.
- Nessun secret, password, token o chiave scritto nei file o nell'output del
  registro.
- Nessun push, deploy, merge o accesso alla produzione.

## 9. Indicazione operativa per Cowork / G6

Trascrivere GH-32 esattamente come atto 39 della ricetta aggiornata. Subito
prima misurare le note legacy e registrare **32**; subito dopo richiedere:
**32** righe complessive nelle due tabelle staff-only, zero orfani, entrambe le
colonne legacy assenti e trigger direttorio sui due campi superstiti. Solo a
queste condizioni proseguire con gli atti 40-45 e le controprove customer/staff.
In caso di conteggio diverso, fermarsi: la migration e transazionale e non va
forzata o corretta manualmente durante G6.
