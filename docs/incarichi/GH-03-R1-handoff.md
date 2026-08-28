# GH-03 · R1 — Handoff composizione: richiesta di appuntamento `/u/book`

**Da:** Claude Design · **Per:** Luigi → Cowork → mandato Codex · **Data:** 19 agosto 2026
**Fonte visiva:** canvas `GH-03 Wizard Prenotazione.html` (7 artboard, approvati a vista da Luigi il 19/8).
**Vincoli rispettati:** requisiti Davide 18/8 (fonte congelata `docs/workflows/flussi-operativi-salone.md` §11); pending-only; invito-only; nessun riferimento a boutique/fedeltà.

---

## 1 · Impianto della schermata

**Single-page a sezioni numerate (1–4), niente stepper a schermate separate.**
Motivazione: lo stepper è la grammatica del booking transazionale (una pratica che avanza per stati); la pagina unica a sezioni si legge come un messaggio che si compone — coerente col posizionamento "richiesta, non booking". Le sezioni sono numerate con cifra serif corsiva (Fraunces, italic, `--color-primary`) seguita da titolo sans bold: il numero è ritmo editoriale, non progress indicator.

- **Desktop:** griglia `1.5fr 1fr`, form a sinistra, riepilogo sticky a destra (Card su `--color-bg-main`, radius 20). CTA "Invia la richiesta" vive **dentro il riepilogo**, non in fondo al form.
- **Mobile:** colonna unica, CTA in bottone flottante sopra la `CustomerNav` bottom (shadow `0 8px 24px -8px rgba(43,37,37,.3)`), visibile solo quando le sezioni obbligatorie sono complete (in composizione è mostrato nello stato "scrolled").

### Gerarchia tipografica
| Elemento | Stile |
|---|---|
| Eyebrow pagina | `Eyebrow` esistente ("Richiesta di appuntamento") |
| H1 | Fraunces 500, 42px desktop / 30px mobile, letter-spacing −0.02em — copy: **"Quando ce lo porti?"** |
| Intro | sans 14/13px, `--color-text-secondary` — "Dicci cosa serve e quando preferiresti passare. Poi ci pensiamo noi: ti confermiamo giorno e ora su WhatsApp." |
| Numero step | Fraunces italic 24px desktop / 20px mobile, `--color-primary` |
| Titolo step | sans 700, 17/15px |
| Hint step | sans 12.5px, `--color-text-secondary` |

## 2 · Le quattro sezioni

### Step 1 — "Per chi?"
Card pet selezionabili (riuso pattern: `Card` con avatar + nome Fraunces 16 + razza secondary 11; selezione = bordo 2px `--color-primary`, fondo `--color-surface-main`; non selezionate: bordo 1px `--color-border`, fondo `--color-bg-main`). `?petId=` preseleziona.

**Età mancante (condizionale):** se il pet non ha età in anagrafica, sotto le card appare un blocco su `--color-surface-soft` (radius 14): titolo "Quanti anni ha {nome}?", hint **"Non ce l'hai ancora detto — ci serve solo la prima volta."**, input singolo largo 140px, placeholder "Es. 3 anni". Non appare mai per pet con età nota.

### Step 2 — "Cosa serve?"
Hint: **"In negozio decidiamo insieme i dettagli."** Card servizio in griglia 2 colonne (anche mobile — validato: a colonna singola il fold sborda), icona in quadratino `--color-surface-soft` 34px (28 mobile), nome 700 + durata secondary. **Nessun prezzo in composizione** — questione aperta, vedi §6.
Servizi usati come **placeholder dichiarati**: Bagno & asciugatura ~45min · Bagno & tosatura ~90min · Trattamento completo ~2h · Taglio unghie ~15min. **La lista reale (nomi, durate, eventuali prezzi) va iniettata dal salone.**

### Step 3 — "Quando ti andrebbe bene?"
**Pattern: strip di date desiderate** — 12 giorni desktop / 6 mobile, card verticali (giorno settimana uppercase 9.5px + numero Fraunces 20), selezione piena `--color-primary`. **Niente semantica libero/occupato**: nessuna casella disabilitata, nessuna griglia oraria, nessuno slot. Il micro-copy sotto la strip àncora la semantica: **"È la data che *preferiresti* — la confermiamo noi insieme all'orario."**

**Avvisi (mai bloccanti, mai punitivi)** — entrambi su token warning (`--color-warning-bg/border/text`), radius 14, icona `Icon` esistente (clock / bell), corpo 12.5px:
- **Preavviso <7gg:** "**Sei un po' a corto di preavviso.** La richiesta parte lo stesso — faremo il possibile per trovarti spazio, e ti diciamo subito su WhatsApp come siamo messi."
- **Periodo di piena:** "**Periodo pieno (Ferragosto):** stanno arrivando più richieste del solito, quindi potremmo metterci un po' di più a risponderti. Mandala comunque — le leggiamo tutte."
Il nome del periodo è dinamico (Capodanno, Natale…). La CTA resta attiva in entrambi i casi.

### Step 4 — "Come sta il pelo di {nome}?"
Hint: **"Ci aiuta a prepararci — poi lo guardiamo insieme all'arrivo."** (il copy NON promette che l'auto-dichiarazione basti: il salone verifica).
Chips selezionabili (pill, selezione piena primary): *Qualche nodo · Molto annodato · Perde tanto pelo · Cute sensibile · Pulito, solo lungo* + input libero "Vuoi aggiungere altro? (facoltativo)". Chips multi-selezione.

## 3 · Riepilogo e submit

Riepilogo (desktop sticky / mobile implicito nel flusso): righe chiave-valore (Pet, Servizio, **Data desiderata**, Manto), poi la frase che prepara l'esito: **"Ti rispondiamo noi su WhatsApp con giorno e ora — di solito in pochi minuti."** CTA: **"Invia la richiesta"** (mai "Prenota", mai "Conferma").

## 4 · Pagina esito — "in attesa di conferma" come accoglienza

- Icona WhatsApp in cerchio su `--color-warning-bg` (84px desktop / 68 mobile)
- `StatusBadge` pending: "In attesa di conferma"
- H1 Fraunces: **"Ci pensiamo noi da qui."**
- Corpo: "La tua richiesta è arrivata al salone. Ti scriviamo noi su WhatsApp con giorno e ora — di solito in pochi minuti. Se preferisci anticiparci, il numero è sempre lo stesso."
- Card riepilogo read-only
- CTA primaria **verde WhatsApp** "Scrivici su WhatsApp" (icona whatsapp) + secondaria ghost "Torna alla home"
- Nota `.ics`: "Quando il salone conferma, qui troverai anche 'Aggiungi al calendario' (.ics)." — il download esiste **solo post-conferma**, non alla richiesta.

Il registro è "la palla ce l'abbiamo noi, stai tranquillo" — nessun numero di pratica, nessun "richiesta #1234", nessuna barra di avanzamento.

## 5 · Stati

| Stato | Composizione |
|---|---|
| Loading (servizi/date) | `Skeleton` esistente su card servizi e strip date |
| Preavviso corto | avviso warm sotto step 3 (§2) — non blocca |
| Periodo di piena | avviso warm sotto step 3 (§2) — non blocca |
| Errore submit | banner su token danger: "**Non siamo riusciti a inviare la richiesta.** Riprova tra un momento — o scrivici direttamente su WhatsApp, va benissimo uguale." Dati del form preservati. |
| Empty (servizi non caricabili) | card tratteggiata senza tono d'errore: titolo Fraunces "Qui non carica, ma noi ci siamo.", corpo "Scrivici su WhatsApp e prenotiamo a voce, come sempre.", CTA WhatsApp verde |
| Conflitto slot | **non esiste più come stato**: senza slot garantiti non c'è conflitto da mostrare. Se il DB rifiuta per motivi tecnici → stato "errore submit". |

## 6 · Token e componenti nuovi (con motivazione)

| Novità | Motivazione | Nota |
|---|---|---|
| `--color-whatsapp: #4f8b67`? | La CTA WhatsApp usa oggi il valore di `--color-success-text` come fondo pieno. Funziona ed è in palette; se WhatsApp diventa pattern ricorrente (lo è, da posizionamento) conviene **nominare il token** anziché riusare semanticamente "success". | Decisione a Luigi: alias `--color-whatsapp → var(--color-success-text)` o lasciare success. Nessun colore nuovo fuori palette. |
| Componente `WarmNotice` | Avviso informativo non bloccante (warning tokens + icona + strong iniziale). Usato 2 volte qui, riusabile ovunque serva "ti avviso ma non ti fermo". | Nuovo in `shared/ui`. |
| Componente `DesiredDateStrip` | La strip di date desiderate è un pattern nuovo, distinto da qualsiasi date-picker: nessuno stato disabled/occupato. | Nuovo. Non chiamarlo DatePicker. |
| Numero step serif | Solo tipografia (Fraunces italic + primary), non serve componente: pattern `StepHead` locale alla pagina. | — |

Nessun altro token nuovo. I 2 colori fuori token citati nel brief (`#3f6658`, `#8f3f49`) appartengono alla Scheda pet → verdetto in R2.

## 7 · Questioni aperte (nominate, non risolte)

1. **Lista servizi reale** — nomi, durate e se mostrare prezzi. La composizione attuale non mostra prezzi: col posizionamento "non transazionale" il prezzo in-app spinge verso il preventivo automatico; ma nasconderlo può generare richieste WhatsApp evitabili. Decidere con Davide.
2. **Fascia oraria** — i requisiti congelati non la includono (solo data desiderata). La composizione non la mostra. Se il salone la volesse, è un'aggiunta compatibile (chips mattina/pomeriggio sotto la strip), ma va deciso, non presunto.
3. **Chips manto** — le 5 etichette sono mie proposte; validarle col vocabolario che il salone usa davvero al telefono.
4. **Numero WhatsApp** — unico per tenant, da config (`tenants.settings`), mai hardcoded.
5. **Soglia "periodo di piena"** — chi la dichiara e dove (config tenant? tabella periodi?): questione di prodotto/DB, non di composizione.

---
*Riferimenti file: canvas `GH-03 Wizard Prenotazione.html` + `gh03-book.jsx` (mockup, non codice da copiare). Componenti citati: Button, Card, Skeleton, Eyebrow, Icon (paw/clock/bell/whatsapp/chevron/bath/scissors/sparkle/drop), StatusBadge, CustomerNav, BackgroundDecor. Token: palette e radii invariati.*
