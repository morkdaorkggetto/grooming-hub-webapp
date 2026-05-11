# Diario di progetto — Grooming Hub

Collante temporale del progetto. "Stato attuale" in cima, sempre aggiornata. "Cronologia" sotto, append-only, ordine cronologico inverso (più recente in cima).

Documento gestito da Cowork secondo la skill `grooming-hub-saas`.

---

## Stato attuale

*Aggiornato l'11 maggio 2026.*

- **Schema multi-tenant**: applicato sul DB demo `grooming-hub-demo` (Gate 2 chiuso, 25 aprile 2026). Demo Supabase riattivato manualmente l'11 maggio dopo auto-pause.
- **DB produzione** `grooming`: intatto, schema vecchio (`clients` legacy), 189 clienti reali. `ACTIVE_HEALTHY`.
- **App staff sul demo**: rotta — `webapp/src/lib/database.js` contiene 13 chiamate `from('clients')` su tabella droppata da M11-bis, più 3 chiamate a `customer_client_links` (anch'essa droppata) e 48 occorrenze testuali di `client_id`. Refactor previsto al Gate 5.
- **App customer**: non scaffolded. Pre-Gate 3 in corso, **1 decisione presa su 8** (prenotazione customer in stato `pending` in attesa di conferma staff). 7 decisioni di prodotto ancora aperte.
- **Refactor monorepo-ready** (`src/apps/staff/` + `src/apps/customer/` + `src/shared/`): non avviato. La cartella `webapp/src/` è ancora piatta. Gate 6 vergine.
- **Documento partecipato salone**: tre round completati (terzo parziale, maggio 2026). Sezioni 2 e 8 ora hanno la prima risposta di Davide e Roby; restano aperti alcuni dettagli per un eventuale quarto round (pet difficili da fotografare, convenzioni interne, momenti "uffa, di nuovo" del gestionale).
- **Bundle Claude Design** (`design_handoff_customer_app/`): parzialmente superato dalle decisioni di Gate 2 e Gate 5. In particolare il signup pubblico previsto dal bundle è incompatibile con la Decisione 12 di Gate 2 ("no autocreazione customer, solo via invito").

**Prossimo passo**: aprire una sessione sulle 7 decisioni di prodotto aperte del pre-Gate 3, strutturandole in un file dedicato `webapp/docs/pre-gate3-decisioni.md`. Mappa di partenza già abbozzata nel report di lettura Cowork dell'11 maggio.

---

## Cronologia

### 11 maggio 2026 — Terzo round parziale con Davide e Roby (sezioni 2 e 8)

**Attori**: Luigi (ha inviato le domande via WhatsApp), Davide e Roby (hanno risposto), Cowork (ha integrato risposte nel documento partecipato e nel diario).

**Decisioni emerse dalla risposta del salone**:

- **Foto del pet — esiste una foto principale, con criterio funzionale.** Per il gestionale staff la foto principale di un pet è «quella che descrive meglio le condizioni del cane e la sua riconoscibilità all'atto dell'accoglienza». Non è una foto affettiva: è funzionale, scelta dallo staff, e va riaggiornata con le nuove accoglienze.
- **Foto affettiva del customer — coesistenza approvata.** Sulla app cliente, il proprietario può caricare la sua foto preferita del pet senza che dia fastidio al gestionale. Le due foto sono *due viste* dello stesso pet: vista staff (operativa, da `client-photos`) e vista customer (affettiva, da `pet-avatars`).
- **Note libere su clienti e pet — confermate come pratica quotidiana.** Davide e Roby «aggiungono sempre note sia sul cliente che sul pet». Sono appunti operativi internal-only, da prevedere come campi `notes text` libero su `customers` e su `pets`. Non in conflitto con la Decisione 3 di Gate 5 (che escludeva campi qualitativi *strutturati*, non testo libero).

**Lavori completati**:

- Aggiornato `webapp/docs/workflows/flussi-operativi-salone.md` con un terzo round parziale: sezione 2 (foto pet) + sezione 8 (note libere), e storico revisioni in fondo.
- Aggiornato lo "Stato attuale" del diario per riflettere il terzo round.

**Aperto**:

- **Verifica schema**: confermare se `customers.notes` e `pets.notes` esistono già nel DB demo dopo M11-bis. Il bundle Design li prevedeva (vedi `02-database.md`), il piano Gate 2 non li menziona esplicitamente. Da ispezionare in sessione Code (query su `information_schema.columns` per le due tabelle).
- **Eventuale migration aggiuntiva** se i campi mancano: `ALTER TABLE customers ADD COLUMN notes text;` e/o `ALTER TABLE pets ADD COLUMN notes text;`. Aggiungere policy RLS staff-only (no SELECT customer).
- **Decisione UX fallback foto pet**: nella scheda customer, quando il proprietario non ha caricato la sua foto, mostriamo (a) la foto operativa più recente dello staff, oppure (b) un avatar con iniziali del pet? Proposta Cowork: opzione (b) — la foto operativa potrebbe non essere quella che il cliente vuole vedere come "home page del suo pet". Da confermare in sede di decisione di prodotto pre-Gate 3.
- **Punti residui sezioni 2 e 8 del documento partecipato**: pet difficili da fotografare, convenzioni interne tra staff, momenti "uffa, di nuovo", cosa non vorreste perdere del gestionale attuale. Eventuale quarto round, non urgente.

**Prossimo passo**:

- Sessione Code di verifica schema (`customers.notes` e `pets.notes`) + eventuale migration aggiuntiva. 15-20 minuti.

---

### 11 maggio 2026 — Apertura diario, archiviazione documenti pre-skill, sintesi stato dell'arte

**Attori**: Luigi, Cowork, Code.

**Decisioni prese**:

- Archiviare in un'unica operazione gli 8 file storici (pre-skill, pre-Gate 2) di root e di `/docs/` (root) in `webapp/docs/archivio/2025-2026-iniziali/`. Nessun file referenziato da codice o documenti vivi, verificato via grep da Code.
- Spostare `environment-map.md` in `webapp/docs/` invece di archiviarlo (ancora utile per orientamento ambienti Vercel/Supabase), con TODO in cima sui punti datati.
- Lasciare in piedi temporaneamente la cartella `/docs/` (root) ormai vuota — il sandbox Cowork non ha permessi per rimuoverla; rimozione manuale a carico di Luigi.
- Workflow di lavoro a tre attori (Cowork pianifica, Code esegue sul filesystem nativo macOS) confermato come pattern operativo quando Cowork incontra limiti di sandbox su `.git/`.

**Lavori completati**:

- Creata cartella `webapp/docs/archivio/2025-2026-iniziali/`.
- Archiviati 8 file: `CODEX_HANDOFF.md`, `COWORK_INSTRUCTIONS.md`, `FASE4B_SETUP_INSTRUCTIONS.md`, `PROMPT_COWORK.md`, `STRUTTURA_CARTELLE.md` (dalla root), `api-spec.md`, `schema.md`, `logic.md` (da `/docs/` root).
- Spostato `environment-map.md` da `/docs/` (root) a `webapp/docs/` con TODO di revisione in cima.
- Code ha prodotto un report tecnico/ambientale di stato in `_temp_updates/stato-arte-2026-05-11.md` (verifica livelli git, codice staff, migration Supabase, Vercel, ambienti Supabase).
- Riattivato manualmente il progetto Supabase `grooming-hub-demo` (era `INACTIVE` per auto-pause).
- Commit `11c9162` su `feat/customer-app`: `docs: archive early Cowork instructions and pre-Gate 2 specs` (9 file aggiunti, 1571 righe). Push non eseguito.
- Creato questo diario (`webapp/docs/diario-progetto.md`).

**Aperto**:

- Le 7 decisioni di prodotto del pre-Gate 3, mappate dal report di lettura Cowork ma non ancora discusse. Tra le più strutturali: contraddizione `/u/register` vs Decisione 12 di Gate 2 (no autocreazione customer); biforcazione clienti nuovi/storici nel flusso prenotazione; semplificazione del wizard servizi (due pacchetti, non un menù modulare); distinzione "consiglio condivisibile" vs "nota interna" nelle visite; rapporto tra app e WhatsApp come canale primario; perimetro delle promozioni Fase 1 rispetto all'aspettativa fedeltà del salone.
- Discrepanza migration: il piano dichiara 33 file (10 retrospettivi + 23 nuovi), in repo all'11 maggio ne risultano **34**. Da verificare quale file aggiuntivo e se è applicato sul demo. Richiede query su `supabase_migrations.schema_migrations`.
- Commit orfano su `main`: `c9a3678 Protect operator accounts from customer bootstrap` (25 aprile 2026, hotfix di produzione) mai mergiato in `feat/customer-app`. Da cherry-pickare prima del prossimo merge feat→main.
- `webapp/.vercel/project.json` non esiste — repo non linkato a Vercel localmente. Da fare con `vercel link` prima del primo deploy dell'app customer.
- Sezioni 2 (foto pet identificativa vs operativa) e 8 (zona grigia delle pratiche quotidiane) del documento partecipato `flussi-operativi-salone.md` in attesa di terzo round con Davide e Roby.
- Cartella `/docs/` (root) vuota da rimuovere manualmente: `rmdir /Users/luigimaisto/Desktop/grooming-hub-web/docs`.
- Cleanup di `_temp_updates/stato-arte-2026-05-11.md` (skill §5: cartella di lavoro temporaneo da svuotare a fine uso).
- "Branch zoo" del repo: 12 branch locali, di cui 7 `codex/*` orfane mai mergiate. Cleanup non urgente.

**Prossimo passo**:

- Aprire la sessione sulle 7 decisioni di prodotto aperte del pre-Gate 3 in un futuro file dedicato `webapp/docs/pre-gate3-decisioni.md`. Cowork ha la mappa di partenza nel report di lettura del primo turno di questa sessione (10 documenti letti, 7 punti di tensione identificati).

---

### Aprile 2026 — Sintesi retroattiva pre-Gate 3

> Entry compatta scritta a posteriori l'11 maggio 2026 sulla base dei materiali esistenti (commit history, `migration-plan.md`, `gate5-design-decisions.md`, `flussi-operativi-salone.md`, bundle Claude Design). Non sostituisce una ricostruzione puntuale del lavoro di aprile — è una fotografia di stato al momento dell'apertura del diario.

**Attori**: Luigi, Chat, Code (sintesi a posteriori da Cowork).

**Decisioni prese** (registrate in altri documenti):

- **Gate 2 chiuso**: 19 punti decisionali registrati in `webapp/supabase/docs/migration-plan.md`. Punti chiave: split atomico `clients` → `customers` + `pets` (M11-bis prod-safe con backfill via `legacy_client_id`), nuove tabelle multi-tenant (`tenants`, `tenant_memberships`, `profiles`, `customers`, `promotions`, `services`), RLS per tabella con helper `has_tenant_access`, bucket `pet-avatars` separato da `client-photos`, **no autocreazione customer al signup** (solo via `accept_customer_invite`), schema `customers` Modello B con `phone NOT NULL` in formato E.164.
- **33 file SQL scritti** in `webapp/supabase/migrations/` (10 retrospettivi + 23 nuovi) — applicati sul demo `grooming-hub-demo` il 25 aprile 2026. *Nota*: il count effettivo in repo all'11 maggio è 34, discrepanza da chiarire.
- **Gate 5 preliminare**: 5 decisioni registrate in `webapp/supabase/docs/gate5-design-decisions.md`. Vista staff = lista pet (non clienti); inserimento cliente+pet in schermata unica con transazione DB; `contacts` deprecato e fuso in `customers`; bucket vetrina vs operativo mantenuti separati; `pets.owner_user_id` mantenuto come debito tecnico per Fase 2.
- **Pre-Gate 3 — prima decisione**: prenotazione customer creata in stato `pending` in attesa di conferma staff. Coerente con il posizionamento "il salone mantiene il controllo della relazione" (ISTRUZIONI.md, principio 2).
- **Documento partecipato `flussi-operativi-salone.md`**: due round con Davide e Roby integrati. Nove osservazioni di prodotto fissate (luogo di accoglienza, due fasi di raccolta dati, foto operativa, listino a due pacchetti, visita = singolo appuntamento, biforcazione clienti nuovi/storici, WhatsApp come canale primario, missione naturalistica come postura del salone).

**Lavori completati** (verificati da Code l'11 maggio):

- 22 commit su `feat/customer-app` rispetto a `main` (Gate 2 + fix apply + docs partecipativi).
- 33 (o 34) migration applicate sul DB demo. Stato registrato il 25 aprile in `schema_migrations`: 33 entry.
- Documento partecipato in due round con il salone.
- Bundle Claude Design (`design_handoff_customer_app/`) consegnato come materiale di riferimento per Fase 1 dell'app customer.

**Aperto** (eredità a maggio):

- 7 decisioni di prodotto del pre-Gate 3 (vedi entry dell'11 maggio per il dettaglio).
- Refactor `database.js` staff (Gate 5 vero, ancora da pianificare).
- Migration produzione (Gate "production plan", ancora da definire).
- Sezioni 2 e 8 del documento flussi salone.

**Prossimo passo** (storico):

- Sessione di apertura del diario e ricalibratura, eseguita l'11 maggio 2026 — vedi entry sopra.

---

## Storico revisioni del diario

- **11 maggio 2026** — Diario creato. Tre entry: terzo round parziale con Davide e Roby (sezioni 2 e 8), apertura diario + archiviazione + sintesi stato dell'arte, entry retroattiva di aprile 2026.
