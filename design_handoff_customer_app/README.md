# Handoff — Grooming Hub · Customer App (Fase 1)

Questo pacchetto è destinato a **Claude Code**, che lavorerà sul repository locale `grooming-hub-webapp`. Contiene la specifica tecnica, le decisioni architetturali, e i mockup HTML di riferimento per costruire l'app customer di Grooming Hub.

---

## Natura dei file in questo bundle

I file `.html` e `.jsx` allegati sono **prototipi di design** creati in HTML+React (via Babel standalone, tutto inline). Non sono production code: servono a mostrare **l'aspetto visivo e il comportamento atteso** delle schermate.

Il compito di Claude Code è **ricostruire queste schermate dentro l'ambiente reale del repo** (`grooming-hub-webapp` — React + Vite + Supabase + Tailwind/CSS vars), usando i pattern già in uso nel codebase staff e le convenzioni indicate nei documenti di questa cartella.

I file HTML vanno letti come **reference visivo e comportamentale**, non copiati alla lettera.

---

## Fidelity

**High-fidelity.** Colori, tipografia, spacing e comportamenti sono definitivi. La palette e i token sono già allineati a `src/index.css` del repo staff (stessa brand identity, stesse variabili CSS). La direzione visiva è curata dall'autore e non va rinegoziata.

---

## Scope — Fase 1

Quattro schermate lato customer, prefisso di routing `/u/*`:

1. **Dashboard utente** (`/u/home`) — saluto, prossimo appuntamento, card pet, promozioni attive, CTA prenota
2. **Scheda pet** (`/u/pet/:petId`) — anagrafica, storico appuntamenti, preferenze, note
3. **Prenotazione** (`/u/book` + `/u/book/confirm/:id`) — wizard pet → servizio → data/ora → conferma
4. **Promozioni** (`/u/promotions`) — lista sola lettura

**Fuori scope in Fase 1** (esistono i mockup, ma non vanno implementati ora): shop/boutique, profilo esteso, fedeltà/affiliazione, notifiche push, recensioni.

---

## Modalità di lavoro richieste

### 1. Branch separata
Tutto il lavoro avviene su `feat/customer-app`. L'app staff in `main` non viene toccata, **salvo le migration Supabase necessarie** (che andranno approvate una per una — vedi `06-procedura-approvazione.md`).

### 2. Approvazione prima del codice
Prima di scrivere qualsiasi linea di codice applicativo, Claude Code deve produrre e farsi approvare:
1. Ispezione dello **schema Supabase esistente** (tabelle dominio staff: appuntamenti, clienti, pet, servizi, ecc.) con export strutturato
2. **Migration proposte** sullo schema esistente (aggiunta `tenant_id` NOT NULL — strategia in due step)
3. **Schema nuove tabelle** fase 1 (`tenants`, `tenant_memberships`, `customers`, `promotions`, + eventuali ausiliarie)
4. **Policy RLS** per ogni tabella toccata/creata

Ogni artefatto va mostrato al proprietario e approvato **una alla volta**, in quest'ordine. Non bundlare tutto insieme. Niente migration applicate direttamente: si lavora su **branch Supabase di sviluppo**, mai sulla produzione del tenant pilota.

### 3. Completezza attesa
End-to-end reale:
- Auth Supabase funzionante (login/register/forgot)
- Query reali su Supabase con RLS attive
- Tutti gli stati: `idle`/`loading`/`error`/`empty`/`success`
- Accessibilità di base (focus visibile, contrasto, ARIA sui pattern standard)
- Mobile-first, poi desktop

Notifiche email/SMS: **stub** (interfacce chiamabili che loggano). Niente provider reali in Fase 1.

### 4. Struttura monorepo-ready
Anche se oggi è un repo singolo, la struttura va pensata **come se domani diventasse un monorepo**. Isolare da subito in cartelle condivise:
- client Supabase
- tipi (generati da `supabase gen types`)
- design tokens
- componenti UI riusabili (Button, Card, Input, Badge, ecc.)

Vedi `01-architettura.md` per lo schema di cartelle proposto.

### 5. Multi-tenancy dal giorno 1
Schema unico, `tenant_id` su tutte le tabelle di dominio, RLS che filtra per tenant sempre. In Fase 1 esiste **un solo tenant attivo** (il salone pilota), ma il codice e le policy devono già comportarsi come se fossero molti. Nessuna scorciatoia tipo "tanto c'è un solo salone".

### 6. Routing predisposto per sottodominio
I path customer stanno sotto `/u/*`. L'architettura deve rendere **banale** il passaggio futuro a sottodominio dedicato (`app.groominghub.com` per staff, `clienti.groominghub.com` per customer, o per-tenant). Vedi `01-architettura.md`.

---

## Indice documentazione

| File | Contenuto |
|---|---|
| `README.md` | Questo documento — overview e regole d'ingaggio |
| `01-architettura.md` | Struttura cartelle, routing, shared packages, sottodominio-ready |
| `02-database.md` | Schema esistente, migration, nuove tabelle, indici |
| `03-auth-e-rls.md` | Flusso auth, ruoli, `tenant_memberships`, policy RLS |
| `04-schermate.md` | Specifica dettagliata delle 4 schermate Fase 1 |
| `05-design-tokens.md` | Colori, tipografia, spacing, componenti |
| `06-procedura-approvazione.md` | Gate di approvazione prima del codice applicativo |

## File di riferimento (mockup)

In `reference/`:
- `Grooming Hub - Prototipo.html` — prototipo cliccabile completo (tutte le schermate, anche quelle fuori scope)
- `Dashboard Utente.html` — canvas di design con tutte le varianti viste durante la fase esplorativa
- `auth.jsx`, `dashboard-b.jsx`, `pet-page.jsx`, `booking.jsx`, `shop.jsx`, `shared-ui.jsx` — componenti React usati dai prototipi
- `tokens.css` — design tokens allineati a `src/index.css` del repo staff
- `proto/` — versione modulare del prototipo cliccabile

Per vedere i mockup: aprire `Grooming Hub - Prototipo.html` in un browser. Il prototipo è standalone, funziona offline, include viewport switcher mobile/desktop.
