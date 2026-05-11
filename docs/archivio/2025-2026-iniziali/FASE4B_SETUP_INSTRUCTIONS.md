# FASE 4b — Setup Supabase Locale + Testing

Guida step-by-step per configurare Supabase localmente e testare la webapp.

---

## 📋 Prerequisiti

- Node.js 18+ e npm
- Git
- Homebrew (per macOS) o apt (per Linux)
- Account Supabase (https://supabase.com)

---

## 🚀 Step 1: Installa Supabase CLI

### macOS
```bash
brew install supabase/tap/supabase
```

### Linux
```bash
curl -fsSL https://cli.supabase.io/install.sh | sh
```

### Windows (PowerShell)
```powershell
iwr -useb https://cli.supabase.io/install.ps1 | iex
```

Verifica l'installazione:
```bash
supabase --version
```

---

## 🔧 Step 2: Inizializza Supabase Localmente

Dalla root del progetto:

```bash
cd grooming-hub-web
supabase init
```

Questo creerà una cartella `supabase/` con config.toml.

---

## 🗄️ Step 3: Avvia Supabase Emulato

```bash
supabase start
```

Questo:
- Scarica Docker images (prima volta)
- Avvia i servizi locali (PostgreSQL, Auth, Storage, ecc.)
- Espone API su `http://localhost:54321`
- Mostra le credenziali da usare

**Output atteso:**
```
Started supabase local development setup.

API URL: http://localhost:54321
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
```

Copia l'**Anon Key** nel file `.env.local` di webapp (è già precompilato con una chiave di default).

---

## 🗄️ Step 4: Carica lo Schema Database

Applica le tabelle e le RLS policies al database locale:

```bash
supabase db push --local --include-all
```

Questo applica le migration presenti in `supabase/migrations/` al database locale.

Se vuoi applicare il file manualmente:
```bash
# Apri psql e esegui il file
psql postgresql://postgres:postgres@localhost:54322/postgres < scripts/database-schema.sql
```

---

## 📦 Step 5: Installa Dipendenze Webapp

```bash
cd webapp
npm install
```

Questo installa React, React Router, Supabase client, Tailwind, ecc.

---

## 🌐 Step 6: Avvia la Webapp

```bash
npm run dev
```

Questo:
- Avvia Vite dev server su http://localhost:5173
- Apre automaticamente il browser
- Hot reload attivo (modifiche al codice si riflettono in tempo reale)

---

## 🔐 Step 7: Crea un Account Test

Accedi alla webapp e registrati con:
- Email: `test@example.com`
- Password: `testpassword123` (minimo 6 caratteri)

Questo creerà:
- Account Supabase Auth
- Profilo nella tabella `profiles`

---

## ✅ Step 8: Verifica il Setup

Nella webapp:
1. ✅ Pagina Login si carica
2. ✅ Puoi registrarti
3. ✅ Dopo login, Dashboard vuoto (nessun cliente)
4. ✅ Puoi aggiungere un cliente con form
5. ✅ Il cliente appare in dashboard
6. ✅ Puoi aggiungere visite al cliente
7. ✅ Le promozioni si calcolano correttamente (5 visite → 10%, 10 visite → 20%)

---

## 🧪 Testing Checklist

### Autenticazione
- [ ] Signup funziona
- [ ] Login funziona
- [ ] Logout funziona
- [ ] Pagina protetta reindirizza a login se non autenticato

### Clienti
- [ ] Aggiungi cliente (form validation funziona)
- [ ] Dashboard mostra i clienti
- [ ] Click su cliente apre dettagli
- [ ] Modifica cliente (edit modal)
- [ ] Elimina cliente (richiede conferma)
- [ ] Ricerca clienti funziona

### Visite
- [ ] Aggiungi visita a cliente
- [ ] Visite appaiono ordinate per data
- [ ] Elimina visita
- [ ] Costo validato (obbligatorio)

### Promozioni
- [ ] 1-4 visite: messaggio "X visite per lo sconto!"
- [ ] 5-9 visite: badge sconto 10%
- [ ] 10+ visite: badge sconto 20%

### Design & UX
- [ ] Responsive su mobile/tablet/desktop
- [ ] Colori core mantenuti (#d4a574, #5a3a2a, ecc.)
- [ ] Loading states visibili
- [ ] Messaggi errore chiari

---

## 🛑 Troubleshooting

### Errore: "Docker not running"
```bash
# Assicurati che Docker sia avviato
docker ps

# Se Docker non è installato, usalo via Homebrew (macOS)
brew install docker
```

### Errore: "Port 5173 already in use"
```bash
# Cambia porta in vite.config.js oppure killia il processo
lsof -i :5173
kill -9 <PID>
```

### Errore: "VITE_SUPABASE_URL not defined"
```bash
# Assicurati che .env.local esista in webapp/
# Copia da .env.example se non c'è
cp webapp/.env.example webapp/.env.local
```

### Errore: "RLS policy violation"
- Assicurati che `supabase db push --local --include-all` abbia applicato le migration
- Verifica che le policies siano abilitate nel SQL Editor di Supabase

---

## 📊 Quando Sei Pronto per il Prodotto

Una volta testato localmente:

1. **Crea progetto Supabase cloud** su https://supabase.com
2. **Esegui script database-schema.sql** nel SQL Editor online
3. **Copia credenziali cloud** in `webapp/.env` (non .env.local)
4. **Deploy webapp** su Vercel/Netlify:
   ```bash
   npm run build
   vercel deploy
   ```

---

## 🧹 Cleanup

Quando finisci il testing locale:

```bash
# Ferma Supabase
supabase stop

# Rimuovi data locale (reset database)
supabase stop --no-backup
supabase start
```

---

## 📚 Prossimi Step

Una volta che il testing locale è soddisfacente:

- **Fase 5**: Importa dati dall'app mobile con `scripts/import-to-supabase.js`
- **Fase 6**: Deploy a produzione su Vercel/Netlify
- **Fase 7**: Monitora errori e metriche

---

Domande? Rivedi le note in `docs/` per architettura e logica applicativa.
