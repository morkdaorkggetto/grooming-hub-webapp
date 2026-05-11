# Grooming Hub - Handoff per nuova chat Codex

Questo file serve a far ripartire una nuova chat Codex senza perdere il contesto operativo accumulato fin qui.

## Regola di partenza

Prima di modificare codice:

1. leggere questo file;
2. controllare lo stato git in `webapp`;
3. distinguere sempre demo, produzione e database Supabase collegato;
4. non committare segreti, password Supabase o chiavi private.

## Struttura progetto

- Root workspace: `/Users/luigimaisto/Desktop/grooming-hub-web`
- Frontend webapp Vite/React: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
- Migration Supabase: `/Users/luigimaisto/Desktop/grooming-hub-web/supabase/migrations`
- Prototipo frontend cliente: `/Users/luigimaisto/Desktop/grooming-hub-web/Prototipo`
- Documenti utili:
  - `/Users/luigimaisto/Desktop/grooming-hub-web/docs/environment-map.md`
  - `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/ENVIRONMENT_MAP.md`

La repo git principale dell'app e' dentro `webapp`, non nella root superiore.

## Stack

- React 18
- Vite
- React Router
- Supabase JS
- Tailwind/CSS custom
- Deploy su Vercel
- Database/Auth/RLS su Supabase

Comandi principali:

```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web/webapp
npm run dev
npm run build
git status --short
```

## Ambienti

### Demo

- Vercel project: `grooming-hub-webapp-aish`
- Dominio stabile: `https://grooming-hub-webapp-aish.vercel.app`
- Supabase project name: `grooming-hub-demo`
- Supabase ref: `qttpinkslhenxrsbhhhg`
- Supabase URL: `https://qttpinkslhenxrsbhhhg.supabase.co`

Nota: la demo puo' andare in pausa su Supabase free tier dopo inattivita. Se la demo non risponde, controllare prima che il progetto Supabase non sia in pausa.

### Produzione

- Vercel project: `grooming-hub-webapp`
- Dominio stabile: `https://grooming-hub-webapp.vercel.app`
- Supabase ref: `azgehoseiojodltcttfb`
- Supabase URL: `https://azgehoseiojodltcttfb.supabase.co`

### Variabili Vercel importanti

Su ciascun progetto Vercel devono puntare all'ambiente giusto:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_APP_URL`

`VITE_PUBLIC_APP_URL` e' fondamentale per link QR pubblici e inviti cliente. Deve essere il dominio stabile dell'ambiente, non una preview Vercel protetta.

## Supabase migrations

Le migration sono in `/Users/luigimaisto/Desktop/grooming-hub-web/supabase/migrations`.

Migration rilevanti gia create:

- `20260408093000_public_pet_card_rpc.sql`
- `20260409103000_contacts_inbox.sql`
- `20260409131500_backfill_contacts_from_clients.sql`
- `20260422110000_reward_points.sql`
- `20260423110000_customer_portal_foundation.sql`
- `20260423123000_customer_appointment_requests.sql`

Comandi:

```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web
supabase link --project-ref qttpinkslhenxrsbhhhg
export SUPABASE_DB_PASSWORD='PASSWORD_DEMO'
supabase db push
```

```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web
supabase link --project-ref azgehoseiojodltcttfb
export SUPABASE_DB_PASSWORD='PASSWORD_PRODUZIONE'
supabase db push
```

Non scrivere password reali in questo file o nei commit.

## Funzioni principali gia implementate

### Gestionale operatori

- Dashboard clienti.
- Archivio clienti.
- Schede cliente.
- Calendario appuntamenti.
- Operativita giornaliera.
- Report incassi.
- Rubrica contatti.
- Card QR cliente.
- Stampa card A4.
- Download retro PNG trasparente con QR, codice e nome cane.

### Demo

La demo deve consentire di provare comandi e form, ma impedire salvataggi reali dove previsto. L'obiettivo e' far capire il flusso senza sporcare i dati.

### QR pubblico cliente

Il QR della card apre una pagina pubblica senza login:

- profilo cane sintetico;
- fidelity/status premio;
- pulsante WhatsApp verso Grooming Hub;
- pulsante discreto area riservata/autenticazione.

Nella pagina pubblica cliente:

- non mostrare foto reale del cane agli utenti finali;
- usare clipart generica coerente con la palette;
- non mostrare la razza al cliente finale;
- la parte operatore invece puo' continuare a mostrare foto e razza.

Numero WhatsApp Grooming Hub:

- `+39 3332979797`

### Fidelity / punti premio

La logica e' stata spostata da sole visite a punti premio discrezionali:

- tabella `reward_points`;
- operatori possono aggiungere/rimuovere punti;
- livelli indicativi:
  - Bronzo: 100 punti;
  - Argento: 250 punti;
  - Oro: 500 punti.

Correzione gia fatta:

- nella card operatore deve apparire anche il livello premiale;
- il banner vecchio "visite per lo sconto" non deve confondere quando si usano i punti.

### Rubrica contatti

Funzioni attive:

- nuovo contatto manuale;
- apertura WhatsApp;
- stato `Contattato`;
- conversione da contatto a cliente;
- creazione automatica contatto quando nasce un cliente dalla dashboard;
- ricerca per telefono cliente/contatto.

### Area cliente digitale

E' stata aggiunta una fondazione per far accedere il cliente a un portale autonomo ma collegato al gestionale.

Flusso:

- operatore genera invito dalla scheda cliente;
- cliente apre link e crea account;
- account cliente deve arrivare nel portale cliente, non nella dashboard operatore;
- cliente vede profilo cane, fidelity, prossimi appuntamenti, WhatsApp;
- cliente puo' richiedere appuntamento;
- operatore deve confermare/rifiutare lato gestionale.

Rotte principali:

- `/portal/login`
- `/portal`
- `/client-card/:token`
- `/dashboard`
- `/calendar`

Attenzione: ci sono stati bug di routing ruoli. Ultimi commit rilevanti:

- `54f4ec6 Harden role routing and bootstrap operator profile`
- `c0a6101 Fix portal login loop when role is missing`

## Stato attuale al momento di questo handoff

Data: 2026-04-23.

Branch webapp: `main`.

Ultima richiesta utente: dopo aver richiesto un appuntamento dal portale cliente, la richiesta appare nel portale cliente ma non e' abbastanza visibile nel gestionale. Si e' deciso di aggiungere un alert per gli operatori.

Modifiche locali non ancora committate al momento della scrittura:

- `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/src/lib/database.js`
- `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/src/pages/Dashboard.jsx`
- `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/src/pages/Calendar.jsx`

Cosa fanno queste modifiche:

- `getPendingAppointmentRequests()` carica appuntamenti cliente con `appointment_source = customer` e `approval_status = pending`;
- la dashboard mostra un alert arancione "Richieste appuntamento" se esistono richieste cliente da confermare;
- l'alert mostra fino a 3 richieste con nome cane e data/ora;
- l'alert porta a operativita o calendario;
- il calendario include anche richieste pending usando `includePending: true`;
- le richieste pending in calendario hanno label "Richiesta in attesa" e colore giallo/arancio.

Verifica gia eseguita:

```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web/webapp
npm run build
```

Esito: build passata. Solo warning noto su chunk JS sopra 500 kB.

Prima cosa da fare nella nuova chat:

```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web/webapp
git status --short
git diff -- src/lib/database.js src/pages/Dashboard.jsx src/pages/Calendar.jsx
npm run build
```

Se tutto e' coerente:

```bash
git add src/lib/database.js src/pages/Dashboard.jsx src/pages/Calendar.jsx
git commit -m "Show pending customer appointment alerts"
git push origin main
```

Poi attendere deploy Vercel e testare:

1. account cliente richiede appuntamento da `/portal`;
2. operatore apre `/dashboard`;
3. deve comparire alert "Richieste appuntamento";
4. aprendo calendario, la richiesta deve essere visibile come "Richiesta in attesa".

## Convenzioni operative

- Prima di pushare fare sempre `npm run build`.
- Quando si toccano DB/RLS, creare migration in `supabase/migrations` e applicarla sia a demo sia a produzione se la feature deve vivere in entrambe.
- Non usare comandi distruttivi git senza richiesta esplicita.
- Non resettare modifiche locali dell'utente.
- Se ci sono modifiche non proprie in file correlati, leggerle e integrarle invece di sovrascriverle.

## Prompt da copiare nella nuova chat

```text
Sto lavorando sul progetto Grooming Hub in locale.

Workspace:
/Users/luigimaisto/Desktop/grooming-hub-web

Prima di fare qualunque modifica, leggi:
/Users/luigimaisto/Desktop/grooming-hub-web/CODEX_HANDOFF.md

Poi entra nella webapp:
/Users/luigimaisto/Desktop/grooming-hub-web/webapp

Vorrei che recuperassi il contesto del progetto, verificassi lo stato git e riprendessi dal punto indicato nel file di handoff. In particolare controlla le modifiche locali non ancora committate su alert richieste appuntamento cliente, esegui la build, poi se e' tutto coerente committa e pusha su main.

Attenzione:
- demo e produzione hanno Supabase/Vercel separati;
- non inserire o committare password o secret;
- prima di qualunque deploy o push verifica sempre `npm run build`;
- se trovi modifiche locali inattese, fermati e chiedimi conferma.
```

