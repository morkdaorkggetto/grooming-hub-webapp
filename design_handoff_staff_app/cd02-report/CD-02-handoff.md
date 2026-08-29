# CD-02 · Handoff — il report incassi

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 28 agosto 2026
**Esito:** composizione. Non codice. Realizzerà Codex in `GH-33`.
**Rotta:** `/reports/weekly`, componente `WeeklyRevenue`. **Nessuna rotta nuova.**
**Contratto «prima» misurato su:** `gh15-ed-kit.jsx` e `gh15-ed-riferimenti.jsx` — il ceppo GH-15 consegnato.

Stessa struttura numerata di GH-15 e CD-01: le stesse voci nello stesso posto.

---

## 1 · I file di composizione

| File | Cosa contiene |
|---|---|
| `cd02-report-kit.jsx` | Componenti nuovi: `BigNum`, `Delta`, `DayBar`, `TrendStrip`, `AmountSpread`, `VisitLine`, `DayHead`, `WeekNav`, `eur()` |
| `cd02-report-viste.jsx` | Le viste e i dati: settimana da 1, da 58, futura, media, caricamento, telefono |
| `cd02-report-note.jsx` | Le tavole: decisione sconti, fusione grafico+schede, le quattro domande, campi ⚠ |
| `CD-02 Report Incassi.html` | Il canvas che monta tutto, con le note di sezione |

**Dipendenze, tutte già in produzione:** `tokens.css`, `shared-ui.jsx`, `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`, `cd01-cal-note.jsx` (solo per `QRow`).

---

## 2 · Colori — nessuno nuovo

**Nessun colore nuovo oltre i tre già dichiarati in GH-15.**

**L'arancione `#b45309` non è stato ricondotto a un token: è sparito insieme al riquadro che coloriva.** Compare una volta sola nella tavola delle decisioni, dentro il «prima» barrato, per mostrare cosa è stato tolto. Non va portato nel codice.

Derivati d'opacità usati inline, tutti da `--color-primary` (`#6f9792`), nessuno nuovo:

- `rgba(111,151,146,.16)` — fondo della riga-barra nel giorno pieno
- `rgba(111,151,146,.08)` — fondo della riga-barra negli altri giorni
- `rgba(111,151,146,.22)` — barre non selezionate nella striscia andamento
- `rgba(111,151,146,.35)` — bande non evidenziate nella distribuzione importi
- `rgba(111,151,146,.06)` — fondo della scheda «dopo» nella tavola sconti
- `rgba(207,193,196,.12)` — fondo delle righe che raccontano un'assenza (= `--color-border` 12%)

**Terza volta che segnalo la stessa cosa:** se volete zero `rgba` sparsi, dichiarateli come token una volta per tutte. Il valore non cambia.

---

## 3 · Densità — eredita GH-15, aggiunge quattro righe

| Elemento | Banco | Telefono |
|---|---:|---:|
| Riga-barra del giorno | 44 | 60 |
| Riga visita del dettaglio | 44 | 60 |
| Intestazione di giorno nel dettaglio | 32 | 32 |
| Navigatore settimana | 34 | 46 |

L'intestazione di giorno a 32px **non è un bersaglio**: è un'etichetta di gruppo, non si tocca. Sul telefono i tre bottoni del navigatore sono a 46px come da regola.

Regola invariata: comprime la tipografia, mai il bersaglio. Nessun target sotto 44px sotto i 640px.

---

## 4 · Componenti

**Riusati senza toccarli:** `GH`, `Hero`, `HeroBtn`, `Btn`, `Panel`, `Eyebrow`, `EmptyState`, `SkeletonRow`, `Phone`, `TouchCtx`/`useTouch`, `RefCard`, `Icon`, `PetAvatar`, `QRow`.

**Da estendere:** nessuno.

**Nuovi:**

| Nome | Cosa fa |
|---|---|
| `eur(n)` | Formato importo italiano, senza decimali |
| `BigNum` | Numero grande serif con confronto incorporato |
| `Delta` | Il confronto: ↑/↓ percentuale, o «come la scorsa» se nullo |
| `DayBar` | **La riga del giorno che È la barra** — sostituisce schede + grafico |
| `TrendStrip` | Dodici settimane senza assi: la forma, non i valori |
| `AmountSpread` | Distribuzione degli importi, cinque bande |
| `VisitLine` | Riga del dettaglio, regge anche le righe di assenza |
| `DayHead` | Intestazione di giorno: serve a 58 righe, non a 6 |
| `WeekNav` | Navigatore settimana |

**Nessuno stato nuovo:** `STATES` di GH-15 non serve in questa pagina — il report non ha stati di riga, ha importi.

---

## 5 · Responsive — un solo punto di rottura, 640px

**Sopra 640px:** due colonne, `1fr / 380px`. Sinistra i due numeri grandi, le sette righe-barra, il dettaglio visite. Destra la striscia andamento, la distribuzione importi, la nota sulle annotazioni.

**Sotto 640px:** una colonna. **La settimana ci sta intera** — sette righe da 60px sono 420px, si leggono senza navigazione a giorni (a differenza del calendario, dove ogni giorno porta più righe). Il navigatore diventa tre bottoni in riga: `←` / «Questa settimana» / `→`. Il dettaglio visite mostra il giorno corrente e si espande.

**La colonna destra scende sotto**, non sparisce: striscia andamento e distribuzione importi restano leggibili a piena larghezza.

**Dettaglio a 58 visite:** raggruppato per giorno con `DayHead`, primi due giorni mostrati, «Mostra tutte» in coda. Sopra le 20 visite il raggruppamento è obbligatorio; sotto le 6 non compare.

---

## 6 · Stati

**Caricamento:** `SkeletonRow` di GH-15, stessa geometria della riga vera.

**Vuoto — tre vuoti distinti, ed è deliberato:**

1. **Settimana passata senza visite** (la settimana da 1, i periodi di chiusura) — i due numeri grandi restano, `EmptyState` spiega che capita nei periodi di chiusura, **e sotto restano i sette giorni**. Una settimana deserta deve somigliare a una settimana.
2. **Settimana futura** — nessun numero grande, nessun giorno: `EmptyState` che dice che il report racconta il lavoro già fatto, con il ritorno a questa settimana. È diverso dal precedente: non è vuota, **non è ancora arrivata**.
3. **Giorno senza visite dentro una settimana piena** — trattino, nessuna barra. Nessuna illustrazione: sarebbe rumore ripetuto sette volte.

**Errore:** `ErrorState` di GH-15. In sola lettura non ci sono errori di scrittura: l'unico caso è il fallimento del caricamento.

**Righe di assenza:** fondo `rgba(207,193,196,.12)`, nome e importo in grigio, importo `—`. Non sono un errore e non sono uno stato: sono una visita registrata che racconta un'assenza.

---

## 7 · Cosa NON cambia — deliberato, non da migliorare

1. **«Sconti applicati» non torna fra i numeri grandi.** Il campo resta nello schema e compare nella riga di dettaglio quando esiste. Non è una dimenticanza.
2. **I numeri grandi sono due, non quattro.** La media per visita è la riga sotto «cani passati». Non va promossa.
3. **La riga del giorno è la barra.** Non aggiungere un grafico sotto: era la ridondanza che questa composizione toglie.
4. **La striscia andamento non ha assi né griglia.** Serve a vedere la forma. Aggiungere etichette la trasformerebbe nel cruscotto che questa pagina non è.
5. **Nessun conteggio per servizio.** «12 bagni e 6 tagli» non è ricavabile: i trattamenti sono scritti a mano. La distribuzione degli importi è l'unico appiglio, ed è dichiarata come inferenza.
6. **Il testo dei trattamenti si stampa verbatim, tra virgolette, in corsivo.** Non si riscrive, non si normalizza, non si mappa su un listino.
7. **Le righe di assenza restano in elenco a 0 €.** Non vanno filtrate: sono successe.
8. **`issues` è un pallino, mai un'etichetta.** Sono note del salone, non una tassonomia: dargli un nome sarebbe inventare una categoria.
9. **Il titolo è «Come è andata».** Non «Report incassi», non «Controllo business». Vale anche per la tessera in Dashboard.
10. **Nessun export e nessuna stampa.** Non composti perché nessuno li ha chiesti — vedi §9.5, è una domanda, non un'omissione.
11. **Sul telefono la settimana si vede intera.** A differenza del calendario, dove si va per giorni: qui ogni giorno è una riga sola.
12. **La rotta resta `/reports/weekly`.** Anche se penso che il mese sarebbe l'unità giusta — vedi §9.2.

---

## 8 · Campi che potrebbero non esistere — 6 marcati ⚠

| Campo | Cosa serviva |
|---|---|
| ⚠ `visits.discount_percentage` | mai usato in 456 visite: la riga di dettaglio lo prevede, i numeri grandi no |
| ⚠ `visits.issues` | 33 visite — note del salone, **non** una tassonomia: pallino, mai etichetta |
| ⚠ `week.previous_total` | il confronto: il dato esiste ma **va calcolato**, non è una colonna |
| ⚠ `visits→client` | nome e cognome del proprietario nella riga di dettaglio |
| ⚠ `visits→dog.breed` | la razza: nei dati ma non mostrata in questa pagina |
| ⚠ `salone.closing_days` | i giorni «chiuso» sono **inferiti** dall'assenza di visite, non dichiarati |

**L'ultimo è il più insidioso.** «Chiuso» e «non è passato nessuno» non sono la stessa cosa, e oggi il dato non distingue. Nella composizione ho scritto «chiuso» solo dove il contesto lo rendeva certo. **Se lo schema non lo regge, quella parola va tolta ovunque e resta il trattino.** Meglio muti che bugiardi.

Confermato dalle vostre misure e dato per certo: `visits.date` è `date` senza ora, `visits.amount` esiste ed è sempre valorizzato (0 visite senza importo).

---

## 9 · Domande aperte — dichiarate, non risolte

**9.1 · «Chiuso» esiste come dato, o lo stiamo deducendo?**
Senza il dato la parola va tolta. Un trattino è onesto, «chiuso» a caso no.

**9.2 · Il mese sarebbe più utile della settimana?**
Loro ragionano a mesi; `weekly` è una scelta ereditata. La mia proposta, se un giorno si potesse aggiungere una vista: **questa stessa pagina ribaltata**, mesi come contenitore e settimane come righe. È una rotta nuova, quindi è vostra.

**9.3 · Quante lavorazioni di ogni tipo** — la domanda che il brief mi chiede di nominare.
**Non è ricavabile.** Se serve il numero vero servirebbe un campo strutturato, e sarebbe un lavoro sul **form visita**, non sul report.

**9.4 · Le righe di assenza contano come «visite registrate»?**
Oggi sì, e il conteggio le include. Le tengo dentro a 0 €. Ma se «18 visite» deve voler dire «18 cani lavati», il numero è un altro e va deciso da voi.

**9.5 · Serve stampare o esportare la settimana?**
Non composto perché nessuno l'ha chiesto, ma un report è la pagina dove la domanda arriva.

---

## 10 · Le parole

**«Report incassi» → «Come è andata».** È l'unica pagina del gestionale che parla la lingua dei numeri invece di quella del lavoro: che almeno usi le loro parole. Sottotitolo: «Cani passati e incassato, settimana per settimana».

**«Controllo business» → «Come è andata»** anche nella tessera in Dashboard. Stessa cosa, detta senza la parola che nessuno dei due userebbe.

**«Visite registrate» → «Cani passati».** È come lo direbbero.

**«Picco» → «giorno pieno».** Stessa informazione, lingua loro.

**«0%» → «come la scorsa».** Una percentuale nulla si legge peggio di tre parole.

Tutte reversibili in una stringa.

---

## Verifiche fatte prima di consegnare

- Console pulita, tutti i token risolvono.
- Riuso di `gh15-ed-kit.jsx` verificato: nessun componente sostituito o riscritto.
- Tre artboard tagliavano contenuto — corretti. Il taglio su «settimana media» costava la riga di *Nuvola* («appuntamento rimandato per ciclo», 0 €), una delle sole due che dimostrano il trattamento delle assenze.
- L'intervallo di date era stampato due volte nella stessa riga di intestazione — tolto dal titolo del pannello, resta nel navigatore. Su una pagina che argomenta contro la ridondanza, era una contraddizione a vista.
