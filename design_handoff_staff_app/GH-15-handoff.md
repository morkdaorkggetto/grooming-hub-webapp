# GH-15 · Handoff — la veste del gestionale

**Da:** design · **A:** Cowork / Codex
**Veste approvata:** editoriale (serif + sans). **La variante grigia con banda teal piena è scartata: non implementarla.**

Questo documento risponde punto per punto ai nove requisiti richiesti.

---

## 1 · File di composizione (non screenshot)

Un file per schermata, apribile e confrontabile riga per riga. Sono JSX leggibili, senza build: si aprono in editor e nel browser tramite il canvas.

| File | Contenuto | Route |
|---|---|---|
| `gh15-ed-kit.jsx` | primitive e **valori normativi** (bottoni, pannelli, righe, stati, campi) | — |
| `gh15-ed-dashboard.jsx` | Dashboard clienti, desktop + mobile + stati caricamento/vuoto | `/dashboard` |
| `gh15-ed-scheda.jsx` | Scheda cliente, 7 sezioni, desktop 2 colonne + mobile 2 viste | `/client/:id` |
| `gh15-ed-visita.jsx` | Registra visita, modale desktop + schermo pieno mobile + errore | `/client/:id/add-visit` |
| `gh15-ed-riferimenti.jsx` | tavole stati e specifiche misurabili | — |
| `gh15-staff.css` | **le stesse regole già in CSS**, classi `.gh-*`, pronte per `src/` | — |
| `GH-15 Gestionale Staff (editoriale).html` | canvas che monta tutto (riferimento visivo) | — |

Ogni misura è nel codice come numero, non come intenzione: `height: t ? 46 : 38` significa 46px sul telefono, 38 al banco. Dove un valore è normativo sta in `GH` (`gh15-ed-kit.jsx`, righe iniziali) — raggi, bordi, serif, tabular-nums.

**Il CSS e il JSX dicono la stessa cosa.** Se divergono, vince `gh15-staff.css`: è la forma in cui il valore va a finire in produzione.

---

## 2 · Colori — nessuno inventato, tre nuovi dichiarati

**Confermo: nessun colore fuori da `tokens.css`,** con tre eccezioni dichiarate qui sotto per nome e valore esatto.

### Token esistenti, usati così come sono
`--color-primary` · `--color-primary-hover` · `--color-secondary` · `--color-secondary-hover` · `--color-surface-main` · `--color-surface-soft` · `--color-border` · `--color-text-primary` · `--color-text-secondary` · `--color-placeholder` · `--color-success-text` / `-bg` · `--color-danger-text` / `-bg` · `--color-warning-text` / `-bg` / `-border` · `--tier-bronze` / `-silver` / `-gold` · `--font-sans` / `--font-serif`

### Nuovi — da aggiungere a `index.css`

```css
--gh-bridge:     #f7f1ea;                  /* fondo del SOLO pannello «Area cliente digitale» */
--gh-border-60:  rgba(207,193,196,.6);     /* bordo standard  = --color-border @ 60% */
--gh-border-35:  rgba(207,193,196,.35);    /* separatore riga = --color-border @ 35% */
```

`--gh-bridge` è l'unico colore nuovo in senso proprio: serve perché il pannello che collega il gestionale all'app cliente deve *sentirsi* più caldo degli altri. Gli altri due sono opacità di un token esistente, nominate per non farle ricomparire come letterali sparsi.

### Derivati d'opacità usati inline
Non sono colori nuovi — sono token esistenti con alpha. Elencati perché in `grep` sembrano letterali:

```
rgba(79,139,103,.35)    bordo bottone success   ← --color-success-text
rgba(184,94,105,.5)     bordo bottone danger    ← --color-danger-text
rgba(103,56,63,.08)     fondo operatore attivo  ← --color-secondary
rgba(43,37,37,.34)      velo dietro la modale   ← --color-text-primary
rgba(111,151,146,.45)   ombra FAB               ← --color-primary
rgba(43,37,37,.16/.28)  ombra telefono/modale   ← --color-text-primary
```

Se preferite zero rgba nel codice, dichiarateli come token: la scelta è vostra, il valore non cambia.

### Letterali da estirpare dal codice attuale

| Ora | Dove | Va a |
|---|---|---|
| blu (`#2563eb` o simile) | «QR Card», «Apri area operatore» | `--color-secondary` |
| giallo | banner countdown fidelity | `--color-warning-bg` + `-border` + `-text` |
| **tre** rossi diversi | «Elimina», «No-show», «Blacklist» | **un solo** `--color-danger-text` |
| `#7c2d12` | Dashboard | `--color-secondary` — marcava una **categoria**, non uno stato |

Il **verde WhatsApp** `--color-success-text` `#4f8b67` resta pieno sui bottoni WhatsApp: è colore di marca esterno e i clienti lo riconoscono. È l'unica eccezione ammessa al principio «una primaria per gruppo».

---

## 3 · Densità, in numeri

> **La densità comprime la tipografia e lo spazio verticale. Non comprime mai il bersaglio.**

### Altezze

| Elemento | Al banco | Sul telefono |
|---|---|---|
| Riga di lista (cliente, visita) | **44** | **60** |
| Bottone | **38** | **46** |
| Campo form | 38 | 46 |
| Search bar | 40 | 46 |
| Pill filtro | 32 | 40 |
| Chip data (Oggi/Ieri/…) | 48 | 54 |
| Chip servizio | 38 | 44 |
| Pick operatore | 40 | 46 |
| Riga slot orario (dentro tessera) | 30 | 30 |
| FAB | — | 56 |

Nessun bersaglio tattile sotto **44px** sul telefono. L'area attiva si ottiene **estendendo l'area cliccabile oltre il testo**, non ingrassando il testo: una riga da 44px con testo a 13px è densa da leggere e generosa da toccare.

### Ritmo verticale

```
gap tra pannelli          14–16
gap tra controlli affiancati 6–9
padding pagina            20 desktop / 13 mobile
testa pannello            12 verticale · 16 orizzontale
corpo pannello            13
tessera area operativa    16
```

### Geometria

```
raggio campo / controllo   12
raggio bottone             14
raggio striscia / modale   16
raggio pannello / tessera  20
raggio pill / FAB          999
```

Il customer usa 24–28. Qui 20: stessa famiglia, un grado più operativo. **Questa differenza è deliberata** (vedi §7).

### Tipografia

| Ruolo | Desktop | Mobile | Famiglia |
|---|---|---|---|
| Eyebrow | 9.5 / .19em / 700 / uppercase | 9.5 | sans |
| H1 pagina | 32 | 25 | **serif 400** |
| Titolo pannello | 16 | 16 | **serif 500** |
| Titolo tessera area | 18 | 18 | **serif 500** |
| Nome cane · scheda | 32 | 26 | **serif 400** |
| Nome cane · riga lista | 16 | 16 | **serif 500** |
| Numero panoramica | 30 | 30 | **serif 400** |
| Prezzo visita | 16 | 16 | **serif 500** |
| Corpo / riga | 13 | 13 | sans |
| Meta / nota | 11–12 | 11–12 | sans |
| Sottotitolo hero | 12.5 | 12.5 | sans |

**Criterio serif/sans:** serif per i **nomi propri e le cifre che si guardano**; sans per tutto ciò che si **scandisce** (righe, orari, telefoni, etichette, meta, campi). Nel dubbio: **sans**. Serif anche sulle liste dense le rende belle da fermo e illeggibili a colpo d'occhio — al banco si scorre, non si legge.

Minimo **11px per il testo corrente**. Eccezioni dichiarate e vincolate: eyebrow uppercase **9.5** (solo con `letter-spacing: .19em`), tag di stato **10**, soglie fidelity e orari secondari **10.5**. **Sotto 9.5 nulla, mai.** Tutti i numeri (telefoni, orari, importi, date, contatori) con `font-variant-numeric: tabular-nums`, altrimenti le colonne ballano.

---

## 4 · Componenti

### Riusati dai condivisi, invariati
`Icon` (nomi già presenti: `search`, `plus`, `chevron`, `calendar`, `user`, `qr`, `whatsapp`, `pencil`, `camera`, `check`, `clock`, `logout`, `bell`, `paw`, `sparkle`, `arrow`) · `PetAvatar` · `FidelityBadge`.

### Da estendere
| Componente | Estensione |
|---|---|
| `Icon` | nessun'icona nuova richiesta — se ne serve una, chiedere prima di disegnarla |
| `PetAvatar` | accetta già `size` e `tier`; usato a 76 / 64 / 38 / 30 / 28 / 24 |
| `FidelityBadge` | usato in `compact` accanto al nome nella scheda |

### Nuovi — nomi definitivi
| Nome | Ruolo | File |
|---|---|---|
| `Hero` | header di pagina, superficie calda, H1 serif | kit |
| `HeroBtn` | azione nell'header (outline) | kit |
| `Btn` | bottone, 7 varianti: `primary` `secondary` `outline` `ghost` `success` `danger` `whatsapp` | kit |
| `Panel` | contenitore con testa eyebrow + titolo serif | kit |
| `Field` | campo con etichetta eyebrow; `area` per textarea | kit |
| `SearchBar` | ricerca | kit |
| `Pill` | filtro con contatore, stato via `aria-pressed` | kit |
| `StatStrip` | striscia di celle numeriche (era «tre card») | kit |
| `AreaTile` | tessera area operativa, **la tessera è il bersaglio** | kit |
| `SlotRow` | riga `ora · pet+servizio · operatore · pallino` | kit |
| `TierDot` | pallino livello fidelity 8px | kit |
| `StateTag` | tag di stato, 6 varianti | kit |
| `Skeleton` / `SkeletonRow` | caricamento con geometria della riga vera | kit |
| `EmptyState` | vuoto che insegna il gesto | kit |
| `ErrorState` | errore che dice cosa resta salvo | kit |
| `Notice` | avviso warm, **mai bloccante** | kit |
| `ClientRow` | riga archivio, 6 colonne desktop / flex mobile | kit |
| `Fab` | azione flottante mobile 56px | kit |
| `IdentityCard` `TierCell` `FidelityPanel` `QrPanel` `BridgePanel` `ScorePanel` `VisitRow` `VisitsPanel` | sezioni della scheda cliente | scheda |
| `DayChip` `OpPick` `SvcChip` `VisitForm` | registrazione visita | visita |

I nomi in CSS sono gli stessi in kebab: `.gh-btn--primary`, `.gh-panel`, `.gh-row`, `.gh-tile`, `.gh-strip`, `.gh-pill`, `.gh-tag--blacklist`, `.gh-daychip`, `.gh-oppick`, `.gh-svcchip`, `.gh-notice`, `.gh-fab`, `.gh-modal`.

---

## 5 · Responsive

**Un solo punto di rottura: `max-width: 640px`.** Sotto, tutto passa in modalità touch (le altezze della colonna destra di §3). Non servono breakpoint intermedi: il gestionale si usa al banco su desktop o in mano su telefono, non su tablet in verticale.

### Cosa succede a elenchi e tabelle

**Archivio clienti** — desktop: griglia `1.5fr 1.4fr .9fr 84px 74px 20px`, header di colonna in `--color-surface-soft`, riga 44px.
Sotto 640px: **la griglia diventa flex, l'header di colonna sparisce**, e la riga si ricompone su due livelli dentro 60px:

```
[avatar 38] Nome (serif 16) · pallino tier · tag se ≠ attivo        18 ago
            Razza · Proprietario
```

Telefono e conteggio visite **escono dalla riga** — non si comprimono, non si troncano: si trovano nella scheda. Una riga che tenta sei colonne su 390px non è densa, è illeggibile.

**Storico visite** — desktop: `data+ora | servizio+nota | operatore | importo`. Sotto 640px la riga sale a 60px e mantiene le stesse quattro informazioni: ci stanno perché la data occupa 52px fissi e il servizio tronca con ellipsis.

**Aree operative** — desktop: griglia 4 colonne, `Pianificazione` e `Richieste` su 2 colonne. Sotto 640px: **una colonna**, e la tessera `Pianificazione` diventa un pannello «Oggi in salone» con le tre righe orario.

**Scheda cliente** — desktop: due colonne `1fr / 440px`. Sotto 640px: **una colonna, ordine di lettura invariato** (identità → visite → fidelity → affidabilità → QR → area cliente), distribuita su tre schermate: `1/3` identità + storico visite · `2/3` fidelity + affidabilità · `3/3` QR + area cliente digitale. Le sette sezioni **non stanno in due schermi da 844px** senza comprimersi: tre schermate senza compressione battono due con i pannelli schiacciati.

**Registra visita** — desktop: modale 620px centrata. Sotto 640px: **schermo pieno**, senza raggi né bordi, footer fisso in basso con la primaria a larghezza piena. L'incasso scende sotto il servizio invece di stare in riga.

---

## 6 · Stati

### Appuntamento
| Stato | Testo | Fondo | Quando |
|---|---|---|---|
| Confermato | `--color-success-text` | `--color-success-bg` | confermato dal salone |
| In attesa | `--color-warning-text` | `--color-warning-bg` | richiesta arrivata, non confermata |
| No-show | `--color-danger-text` | `--color-danger-bg` | cliente non presentato, score −1 |

### Cliente
| Stato | Testo | Fondo | Quando |
|---|---|---|---|
| Attivo | `--color-success-text` | `--color-success-bg` | score ≥ 0 — **default** |
| A rischio | `--color-warning-text` | `--color-warning-bg` | score negativo, non ancora blacklist |
| Blacklist | `--color-danger-text` | `--color-danger-bg` | score ≤ −3, automatico |

Tag: `10px / 700 / radius 5 / padding 3-7`.
**Regola:** nelle liste dense lo stato è un **pallino 7px**; il tag testuale compare solo nelle schede singole. E **«Attivo» non si stampa in lista** — è il default: mostrarlo su 129 righe di 132 è rumore. In lista si stampa solo ciò che devia.

### Caricamento
Scheletro con la **stessa geometria della riga vera** (44px, avatar 30px, due linee di testo). Niente spinner, niente salto di layout quando arrivano i dati. Gradiente `#efe7e4 → #f6f0ed`.

### Vuoto
Titolo serif 18 + corpo sans 12.5 + azione facoltativa. **Il vuoto insegna il gesto, non si scusa** e non usa tono d'errore. Testo dell'archivio visite vuoto — usare questo: «Ancora nessuna visita. Le visite si registrano da qui, anche a lavoro finito. Puoi inserire anche una visita di ieri o della settimana scorsa.»

### Errore
Pannello `--color-danger-bg`, titolo che dice **cosa non è successo** («Non è stato salvato»), corpo che dice **cosa resta salvo**. **Mai svuotare un form per un errore di rete.**

---

## 7 · Cosa NON cambia — elenco esplicito

Tutto ciò che segue è **deliberato**. Se sembra migliorabile, non lo è in questo giro: segnalatelo, non correggetelo.

1. **Le sezioni, il loro numero e il loro ordine.** Nessuna aggiunta, nessuna rimossa, nessun riordino, in nessuna delle tre viste.
2. **Le sei azioni della scheda cliente** — Registra visita, Appuntamento, WhatsApp, Modifica, QR Card, Elimina — restano tutte, in questo ordine. Cambia solo il **peso** visivo.
3. **Le tre azioni di affidabilità** — Presenza +1, No-show −1, Inserisci in blacklist — restano tutte e tre.
4. **Le cinque aree operative** e le loro etichette di categoria.
5. **Le route.** Nessuna route nuova, nessuna rinominata, nessuna rimossa.
6. **L'app customer.** `CustomerPortal.jsx`, `CustomerLogin.jsx`, `CustomerInvite.jsx` non si toccano: non vanno vestiti, non vanno riallineati, non vanno rimossi. Sono il riferimento, non l'oggetto del lavoro. **I QR stampati e i link di invito già spediti devono continuare a risolvere.**
7. **Il raggio 20 invece di 24–28.** Non è una dimenticanza né un'incoerenza col customer: è il grado di differenza che distingue lo strumento di lavoro dalla casa del cliente.
8. **Il verde WhatsApp pieno** anche dove la gerarchia direbbe outline.
9. **La mancanza del tag «Attivo» in lista.**
10. **La FAB soppressa** sulla vista 2/2 della scheda mobile: copriva «Genera invito». Nessuna FAB sopra un'azione primaria.
11. **Il calendario** resta fuori da questo giro (vedi §9).
12. **Il numero di righe visibili** negli artboard non è normativo: è quanto sta nel frame. Le liste sono scrollabili in produzione.

---

## 8 · Campi che potrebbero non esistere

**Marcati `⚠` nel codice, accanto al punto d'uso.** Nessuno di questi è dato per esistente: **misurare lo schema prima di scrivere.**

| Campo | Dove appare | Nota |
|---|---|---|
| `visit.operator` | storico visite, slot «oggi», pick «Chi ha lavorato» | **è il campo che è già mancato in GH-09** — se non c'è, la colonna sparisce e il resto della riga non si muove |
| `visit.amount` | importo in storico, «Incasso» nel form, totale «145 € nel periodo» | se non c'è, spariscono importo e totale |
| `visit.duration` | «Durata» nel form | |
| `visit.photos` | «Foto prima / dopo» | se non c'è, il bottone esce dal form |
| `visit.note` | seconda riga della riga visita | |
| `appointment.state` | confermato / in attesa / no-show, pallino negli slot | se non c'è, gli slot restano senza pallino |
| `services[]` con prezzo | chip servizio con prezzo a lato | se il listino non è in tabella, il prezzo si digita a mano e il chip perde il suffisso |
| `operators[]` | pick «Chi ha lavorato» | se non esiste come tabella, diventa un campo libero |
| `client.lastVisit` | colonna «Ultima» in archivio | derivabile da `visits`, ma **verificare il costo della query su 132 schede** |
| `client.visitCount` | colonna «Visite» in archivio | idem |
| `fidelity.points` | «Punti premio» — separati dalle visite | la vista attuale dice «fallback sulle visite»: confermare che i due dati siano distinti |
| `requests.unread` | contatore «2 da leggere» nella tessera Area cliente | dipende dal fatto che le richieste customer siano già persistite |

**Regola:** se un campo non esiste, **non inventarlo e non inferirlo**. Le griglie sono dimensionate per reggere la sparizione di una colonna senza ricomporsi. Segnalatelo e lo risolviamo prima, non dopo.

---

## 9 · Domande aperte — dichiarate, non risolte da me

1. **Il calendario, quando?** L'ho tenuto fuori perché oggi è vuoto: vestire una stanza senza mobili non serve. Ma la scelta di riempirlo *a ritroso* dalla registrazione visita presuppone che qualcuno voglia guardarlo. **Domanda per Davide, non per me:** se il calendario mostrasse la settimana già passata, con dentro le visite registrate, lo guarderebbe? Se la risposta è no, la vista va ripensata, non vestita.

2. **`Salva e nuova` serve?** L'ho messo nel footer della modale supponendo che a fine giornata si registrino più visite di seguito. Se invece si registra una visita per volta appena finita, quel bottone è peso morto. Da verificare col comportamento reale.

3. **La colonna «Ultima visita» in archivio è utile o decorativa?** Sembra ovvia, ma se nessuno ordina o filtra per quella data, occupa 74px che potrebbero andare al proprietario. Da osservare nell'uso.

4. **Score di affidabilità: è mai stato usato?** La scala −3…+3 è nel prodotto, ma se in 464 visite nessuno ha mai premuto «No-show», sto vestendo una funzione morta. Se è così, il pannello si comprime e libera spazio.

5. **`--gh-bridge` o una famiglia?** Ho introdotto un solo colore nuovo per il pannello-ponte verso l'app cliente. Se in futuro serviranno altri punti di contatto (notifiche al cliente, richieste in arrivo), quel colore diventa una **famiglia** e va progettata come tale, non allargata per casi.

6. **Il tablet esiste?** Ho dichiarato un solo breakpoint a 640px assumendo desktop-al-banco o telefono-in-mano. Se in salone c'è un iPad, la scelta va rifatta.

7. **«Aree operative»: cinque tessere sono tutte vive?** Team operativo, Report, Rubrica — se due di queste portano a viste vuote o non implementate, meglio saperlo ora: una tessera che porta al nulla è peggio di una tessera assente.

---

## Verifiche prima di chiudere

- `grep -E "#[0-9a-fA-F]{6}"` sul JSX del gestionale: solo `#fff`, `#fbf6f3` (testo su primary), `#f7f1ea` (`--gh-bridge`) e i gradienti dello scheletro.
- Nessun bersaglio tattile sotto 44px sotto i 640px.
- `tabular-nums` su tutti i numeri.
- Nessuna route customer rimossa o rinominata.
- Ogni campo `⚠` di §8 verificato in schema **prima** di scrivere il componente che lo usa.
