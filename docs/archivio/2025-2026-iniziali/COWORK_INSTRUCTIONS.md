# COWORK — Grooming Hub Webapp
## Istruzioni operative per la migrazione da app mobile a webapp multi-utente

---

## FASE 1 — Analisi dei file sorgente

**Obiettivo:** estrarre lo schema dati e la logica applicativa dall'app mobile esistente.

### File da analizzare (in ordine):
1. `grooming-app/database.js` → schema tabelle, tipi di dato, relazioni
2. `grooming-app/App.js` → struttura navigazione, flusso principale
3. `grooming-app/screens/ClientsListScreen.js` → logica lista clienti, filtri, promozioni
4. `grooming-app/screens/ClientDetailScreen.js` → gestione visite, calcolo sconti
5. `grooming-app/screens/SettingsScreen.js` → export dati, preferenze utente

### Output atteso dalla Fase 1:
- `docs/schema.md` — schema entità-relazioni con tutti i campi e tipi
- `docs/logic.md` — regole di business (calcolo promozioni, soglie visite)
- `docs/api-spec.md` — lista delle operazioni CRUD necessarie

---

## FASE 2 — Definizione architettura

### Stack tecnologico target:
- **Frontend:** React + Vite + Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL hosted, API REST automatica, autenticazione built-in)
- **Autenticazione:** Supabase Auth (email/password o magic link)
- **Hosting frontend:** Vercel o Netlify (gratuito)

### Schema database Supabase (da generare):

```sql
-- Tabella utenti (gestita da Supabase Auth)
-- profiles estende auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  business_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella clienti (cani)
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  owner TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella visite
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  treatments TEXT,
  issues TEXT,
  cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS):
Ogni utente vede solo i propri clienti. Le policy RLS vanno abilitate su tutte le tabelle.

---

## FASE 3 — Generazione file progetto

### File da generare in ordine:

1. `webapp/src/lib/supabaseClient.js` — configurazione client Supabase
2. `webapp/src/lib/database.js` — tutte le funzioni CRUD migrate dalla versione mobile
3. `webapp/src/components/Auth/LoginForm.jsx` — form login/registrazione
4. `webapp/src/pages/Dashboard.jsx` — lista clienti con ricerca e filtri
5. `webapp/src/pages/ClientDetail.jsx` — dettaglio cliente con storico visite
6. `webapp/src/pages/AddClient.jsx` — form aggiunta cliente
7. `webapp/src/pages/AddVisit.jsx` — form aggiunta visita
8. `webapp/src/components/PromoBadge.jsx` — badge promozioni automatiche
9. `webapp/src/App.jsx` — routing principale con protezione auth

### Regole di migrazione logica:
- `SQLite.openDatabaseSync` → query Supabase async/await
- `db.getAllSync()` → `supabase.from('table').select()`
- `db.runSync()` → `supabase.from('table').insert/update/delete()`
- Le promozioni (5 visite → 10%, 10 visite → 20%) rimangono lato client

---

## FASE 4 — Setup Supabase

### Passi manuali da eseguire una sola volta:
1. Creare account su https://supabase.com
2. Creare nuovo progetto
3. Copiare `SUPABASE_URL` e `SUPABASE_ANON_KEY` dal dashboard
4. Eseguire le query SQL dello schema nel SQL Editor di Supabase
5. Abilitare RLS e creare le policy
6. Inserire le chiavi nel file `.env` della webapp

---

## FASE 4b — Testing in locale (opzionale ma consigliato)

### Obiettivo: testare la webapp completa offline prima del deploy online.

### Opzione A — Supabase locale con CLI (consigliata)
Avvia un'istanza Supabase completa sul Mac, identica a quella online:

```bash
# Installa Supabase CLI
brew install supabase/tap/supabase

# Dalla root del progetto
cd grooming-hub-web
supabase init
supabase start
```

Al termine restituisce credenziali locali da copiare in `webapp/.env.local`:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<chiave-locale-generata>
```

Per applicare lo schema del database locale:
```bash
supabase db push
```

Per fermare l'istanza locale:
```bash
supabase stop
```

Quando sei pronto per andare online, basta sostituire `.env.local` con `.env`
contenente le chiavi del progetto Supabase cloud.

### Opzione B — Flag ambiente con localStorage (più leggera)
Senza installare nulla, usa localStorage come database temporaneo nel browser.
Aggiungere al file `webapp/.env.local`:
```
VITE_USE_LOCAL=true
```

Generare il file `webapp/src/lib/localDatabase.js` con le stesse funzioni
di `database.js` ma che leggono/scrivono su `localStorage` invece di Supabase.

Nel file `webapp/src/lib/database.js` aggiungere lo switch:
```javascript
// Usa database locale o Supabase in base alla variabile d'ambiente
export * from import.meta.env.VITE_USE_LOCAL
  ? './localDatabase'
  : './supabaseDatabase';
```

Quando si passa online: rimuovere `VITE_USE_LOCAL` da `.env.local`.

### Avvio webapp in locale (entrambe le opzioni)
```bash
cd grooming-hub-web/webapp
npm install
npm run dev
```
La webapp sarà disponibile su `http://localhost:5173`

---

## FASE 5 — Export dati dall'app mobile

### Migrazione dati esistenti:
1. Nell'app mobile, usa la funzione ESPORTA in Impostazioni
2. Ottieni il file `grooming-backup-YYYY-MM-DD.json`
3. Usa lo script di import `scripts/import-to-supabase.js` (da generare)
   per caricare i dati esistenti nel nuovo database

---

## NOTE OPERATIVE PER COWORK

- Elaborare un file alla volta, completare prima di passare al successivo
- Ogni file generato va salvato nel percorso indicato nella struttura cartelle
- Mantenere coerenza dei nomi tra schema SQL e variabili JavaScript
- Aggiungere commenti in italiano nel codice per facilità di manutenzione
- Testare ogni componente isolatamente prima dell'integrazione
