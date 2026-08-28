# Mappa ambienti Grooming Hub

Nota veloce per orientarsi tra demo e produzione senza dover ricostruire tutto ogni volta.

## Assetto account Supabase (fonte: screenshot dashboard di Luigi, 21 agosto 2026)

| Organizzazione | Piano | Progetti | Note |
|---|---|---|---|
| `morkdaorkggetto's Org` | Free | `grooming` (prod, Nano, eu-central-2) · `grooming-hub-demo` (Nano, eu-north-1) | Assetto storico: la prod fu messa su free contando sull'uso quotidiano per evitare l'auto-pausa |
| `Webapp_Project` | **Pro** | `bea-scuola-musica` (Micro) · `caveabay-prenotazioni` (Nano) | Org Pro esistente, NON è del progetto Grooming |
| `cantiere` | Free | — | |

**Decisione 21/8 (Luigi)**: `grooming` si trasferisce in `Webapp_Project` (Pro) — costo +~$10/mese (Nano fatturato come Micro nelle org a pagamento; il credito incluso è già assorbito da BEA). Supera la decisione 18/8 dell'org dedicata (+$25), presa quando l'assetto reale non era noto. Il demo resta su `morkdaorkggetto's Org` (free, auto-pausa tollerata). Sequenza: dump di sicurezza PRIMA del transfer.

**Errore corretto**: versioni precedenti dei documenti collocavano i progetti Grooming in "webapp_project" — falso: `Webapp_Project` è l'org Pro di BEA/Caveabay. Questa tabella è la fonte; in caso di conflitto con altri documenti, vince questa.

## Vercel

### Demo
- Progetto: `grooming-hub-webapp-aish`
- Dominio: `https://grooming-hub-webapp-aish.vercel.app`

### Produzione
- Progetto: `grooming-hub-webapp`
- Dominio: `https://grooming-hub-webapp.vercel.app`

## Supabase

### Demo
- Nome progetto: `grooming-hub-demo`
- Project ref: `qttpinkslhenxrsbhhhg`
- URL: `https://qttpinkslhenxrsbhhhg.supabase.co`

### Produzione
- Project ref: `azgehoseiojodltcttfb`
- URL: `https://azgehoseiojodltcttfb.supabase.co`

## Regola pratica di troubleshooting

### Se la demo non va ma la produzione sì
Primo controllo:
- il progetto Supabase demo è in pausa?

Messaggio tipico:
- progetto free-tier pausato dopo 7 giorni di inattività

Azione:
- aprire il dashboard Supabase del progetto demo
- cliccare `Resume` / `Unpause`

### Se produzione e demo vanno entrambe
- il backend è attivo
- il problema non è nel pause automatico di Supabase

### Se il demo è stato riattivato dopo una pausa lunga
Sintomo:
- `supabase db push` ritorna `password authentication failed for user "postgres"`
- al riattivarsi del progetto la password DB del pooler può essere stata ruotata da Supabase

Mitigazione:
- recuperare la nuova password dal dashboard Supabase (Settings → Database → Connection string), aggiornare `SUPABASE_DB_PASSWORD` e ritentare `supabase db push`
- in alternativa, per apply puntuali di una singola migration: usare `mcp__supabase__apply_migration` via MCP binding (bypassa il pooler con OAuth)

*Osservato l'11 maggio 2026 dopo riattivazione manuale di `grooming-hub-demo`. Apply della migration `20260511070742_enforce_staff_only_notes_columns` riuscito col fallback MCP.*

## Comandi utili

### Collegare Supabase demo
```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web
supabase link --project-ref qttpinkslhenxrsbhhhg
```

### Collegare Supabase produzione
```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web
supabase link --project-ref azgehoseiojodltcttfb
```

### Push migration
```bash
cd /Users/luigimaisto/Desktop/grooming-hub-web
export SUPABASE_DB_PASSWORD='PASSWORD_DEL_PROGETTO'
supabase db push
```

## Note sul comportamento attuale dell'app

- Demo e produzione sono separate.
- La demo può andare in pausa su Supabase se resta inattiva troppo a lungo.
- I QR pubblici usano `VITE_PUBLIC_APP_URL` per puntare al dominio stabile dell'ambiente.
- La rubrica `Contatti` esiste sia in demo sia in produzione.

## Flussi già attivi

### Rubrica contatti
- nuovo contatto manuale
- apertura WhatsApp
- stato `Contattato`
- conversione `Contatto -> Cliente`
- creazione automatica della voce rubrica quando nasce un cliente dalla dashboard

### QR pubblico cliente
- pagina pubblica cliente senza login
- `Area riservata` / `Apri scheda completa`
- WhatsApp pubblico verso Grooming Hub

## Promemoria operativo

Se devi capire rapidamente dove intervenire:
1. controlla se stai lavorando su demo o produzione
2. controlla il project ref Supabase giusto
3. controlla il progetto Vercel giusto
4. solo dopo fai migration o redeploy
