> **⚠ Da rivedere — segnalazione 11 maggio 2026.**
>
> Documento spostato qui da `/docs/` (root) in occasione della creazione del diario di progetto. Contenuto **parzialmente datato**: i comandi `supabase link` indicano `cd /Users/luigimaisto/Desktop/grooming-hub-web` ma il progetto Supabase vive in `webapp/`, e attualmente il link CLI è attivo **solo** nel worktree subordinato `webapp/.claude/worktrees/kind-faraday-956d1a/`, non nel main worktree. La mappa Vercel demo/prod è coerente con quanto rilevato l'11 maggio 2026 ma va riverificata con cura. Aggiornamento da pianificare in sessione dedicata.

# Mappa ambienti Grooming Hub

Nota veloce per orientarsi tra demo e produzione senza dover ricostruire tutto ogni volta.

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
