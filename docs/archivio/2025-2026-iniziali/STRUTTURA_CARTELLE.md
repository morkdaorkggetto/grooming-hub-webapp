# Struttura Cartelle — Grooming Hub Webapp

```
grooming-hub-web/                    ← ROOT del progetto
│
├── COWORK_INSTRUCTIONS.md           ← questo file di istruzioni
│
├── grooming-app/                    ← app mobile originale (sorgente)
│   ├── App.js
│   ├── database.js
│   ├── app.json
│   ├── package.json
│   └── screens/
│       ├── ClientsListScreen.js
│       ├── ClientDetailScreen.js
│       └── SettingsScreen.js
│
├── docs/                            ← documentazione generata da Cowork
│   ├── schema.md                    ← schema entità-relazioni
│   ├── logic.md                     ← regole di business
│   └── api-spec.md                  ← specifiche operazioni CRUD
│
├── webapp/                          ← nuovo progetto React
│   ├── .env                         ← chiavi Supabase (NON caricare su git)
│   ├── .env.example                 ← template chiavi senza valori reali
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   │
│   └── src/
│       ├── App.jsx                  ← routing + protezione auth
│       ├── main.jsx
│       │
│       ├── lib/
│       │   ├── supabaseClient.js    ← configurazione client
│       │   └── database.js          ← tutte le funzioni CRUD
│       │
│       ├── pages/
│       │   ├── Dashboard.jsx        ← lista clienti
│       │   ├── ClientDetail.jsx     ← dettaglio + visite
│       │   ├── AddClient.jsx        ← form nuovo cliente
│       │   └── AddVisit.jsx         ← form nuova visita
│       │
│       └── components/
│           ├── Auth/
│           │   └── LoginForm.jsx
│           ├── PromoBadge.jsx       ← badge sconti automatici
│           ├── ClientCard.jsx
│           └── VisitCard.jsx
│
└── scripts/                         ← utility
    └── import-to-supabase.js        ← migrazione dati dal JSON mobile
```

---

## Come usare questa struttura con Cowork

1. Crea la cartella root `grooming-hub-web/` in locale
2. Sposta la cartella `grooming-app/` dentro di essa
3. Crea le cartelle vuote: `docs/`, `webapp/`, `scripts/`
4. Posiziona questo file e `COWORK_INSTRUCTIONS.md` nella root
5. Punta Cowork sulla root e avvia la Fase 1

## .gitignore consigliato

```
node_modules/
.env
*.log
dist/
.expo/
```
