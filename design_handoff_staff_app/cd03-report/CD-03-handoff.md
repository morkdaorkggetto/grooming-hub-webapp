# CD-03 · Handoff — la stessa pagina, a distanza di un mese

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 29 agosto 2026
**Esito:** composizione. Non codice. Realizzerà Codex in `GH-35`.
**Rotta:** sempre `/reports/weekly`. **Nessuna rotta nuova.**
**Contratto «prima» misurato su:** `gh15-ed-kit.jsx`, `cd02-report-kit.jsx`, `cd02-report-viste.jsx` — il ceppo consegnato in CD-02.

Non ho ricomposto la pagina: **dico cosa cambia quando l'unità cambia.**

---

## 1 · I file di composizione

| File | Cosa contiene |
|---|---|
| `cd03-mese-kit.jsx` | I componenti nuovi: `UnitSwitch`, `WeekRow`, `MonthTrend`, `PartialNote` |
| `cd03-mese-viste.jsx` | Le viste e i mesi veri: aprile, giugno, agosto incompleto, telefono |
| `cd03-mese-note.jsx` | Le tavole: le quattro domande, i giorni chiusi, campi ⚠, domande aperte |
| `CD-03 Report Mensile.html` | Il canvas che monta tutto |

**Dipendenze, tutte già consegnate:** `tokens.css`, `shared-ui.jsx`, `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`, `cd01-cal-note.jsx` (solo `QRow`), `cd02-report-kit.jsx`, `cd02-report-viste.jsx`.

**⚠ Correzione retroattiva su CD-02.** `eur()` in `cd02-report-kit.jsx` usava `toLocaleString('it-IT')`, che in questo ambiente **non applica il separatore delle migliaia**: rendeva «3547 €» invece di «3.547 €». Sostituito con un raggruppamento esplicito. **Se Codex ha già preso lo zip CD-02, quel file va rifatto** — la copia in questa consegna è quella giusta.

---

## 2 · Colori — nessuno nuovo

**Nessun colore nuovo.** I sei derivati d'opacità che avevo segnalato tre volte sono ora token, e li uso **per nome**: `--gh-bar-peak`, `--gh-bar`, `--gh-trend-off`, `--gh-band-off`, `--gh-tint`, `--gh-absent`. Nessun `rgba` scritto a mano nel kit CD-03.

Il tratteggio del mese in corso nella striscia usa `border: 1px dashed var(--color-primary)`: **è una forma, non un colore**.

---

## 3 · Densità — eredita CD-02, aggiunge due righe

| Elemento | Banco | Telefono |
|---|---:|---:|
| Riga-settimana | 44 | 60 |
| Interruttore settimana / mese | 34 | 46 |

Stessa geometria della riga-giorno di CD-02: il modo mese **non è più denso né più arioso**, è la stessa pagina con righe diverse dentro. Nessun target sotto 44px sotto i 640px.

---

## 4 · Componenti

**Riusati senza toccarli:** `GH`, `Hero`, `HeroBtn`, `Btn`, `Panel`, `Eyebrow`, `Phone`, `TouchCtx`/`useTouch`, `RefCard`, `QRow`, `Icon`, `BigNum`, `Delta`, `AmountSpread`, `eur()`.

**Da estendere:** nessuno. `DayBar` non è stata toccata: `WeekRow` è un componente a sé perché porta **quattro** valori invece di tre, e il quarto (i giorni lavorati) cambia l'ordine di lettura.

**Nuovi — quattro:**

| Nome | Cosa fa |
|---|---|
| `UnitSwitch` | L'interruttore settimana / mese, dentro il navigatore |
| `WeekRow` | La riga-settimana: intervallo, giorni, cani, incassato — e la settimana ferma |
| `MonthTrend` | La striscia dei mesi **che esistono**, con etichette e il corrente tratteggiato |
| `PartialNote` | La nota del mese in corso, con la base del confronto dichiarata |

`TrendStrip` di CD-02 resta in uso nel modo settimana e **non va sostituita**: le dodici settimane hanno abbastanza barre da leggersi senza etichette, i sei mesi no.

---

## 5 · Responsive — un solo punto di rottura, 640px

**Sopra 640px:** identico a CD-02. Due colonne `1fr / 380px`, l'interruttore in testa al navigatore.

**Sotto 640px:** **il mese ci sta intero** — quattro o cinque righe da 60px. L'interruttore va su una riga propria sopra il navigatore (in linea non ci sta con le frecce), a 46px. La colonna destra scende sotto.

La regola è la stessa di CD-02: qui non serve navigazione a unità inferiori, perché ogni settimana è una riga sola.

---

## 6 · Stati

**Caricamento:** `SkeletonRow` di GH-15, quattro righe invece di sette.

**Vuoto — a distanza di mese i vuoti sono tre, e sono diversi da quelli di CD-02:**

1. **Settimana ferma dentro un mese** — riga intera su `--gh-absent`, «settimana ferma — non è passato nessuno» in corsivo, importo `—`. Nessuna barra. **Non è un errore e non è un avviso.**
2. **Mese senza visite** — non ne esistono nei sei mesi misurati, ma la vista lo regge: i numeri grandi restano a 0, le righe-settimana ci sono tutte, e l'`EmptyState` di CD-02 spiega che capita nei periodi di chiusura.
3. **Mese futuro** — come in CD-02: nessun numero, nessuna riga, `EmptyState` «non è ancora arrivato».

**Mese in corso:** non è uno stato vuoto, è uno stato **parziale** — `PartialNote` più il tratteggio nella striscia. Vedi §7.2.

**Errore:** `ErrorState` di GH-15. Caso nuovo: il mese in corso richiede **due query** (§8) — se la seconda fallisce, il numero grande si mostra **senza delta**, non con un delta sbagliato.

---

## 7 · Cosa NON cambia — deliberato

Tutto il §7 di CD-02 resta valido. In più, specifico del modo mese:

1. **I giorni lavorati vengono prima dei cani** nella riga-settimana. Non è un ordine estetico: sono la scala di lettura. Senza, «110 contro 67» dice una cosa falsa.
2. **Nessun pro-quota, nessuna proiezione a fine mese.** Un numero stimato con l'aria di essere misurato è la cosa peggiore che questa pagina può fare. Il confronto cambia **base**, non il numero.
3. **Nessuno spazio apparecchiato per «lo stesso mese dell'anno prima».** Non esiste fino a marzo 2027, e un posto vuoto invita a riempirlo con una stima.
4. **La striscia mostra i mesi che esistono, non dodici.** Sei barre e sei etichette. Non disegnare caselle vuote per far sembrare completa una storia breve: la striscia crescerà da sola.
5. **Le settimane a cavallo sono tagliate al mese.** Così le righe sommano esattamente al numero grande. Aprendo la riga si vede la settimana intera, giorni dell'altro mese compresi. L'alternativa — righe che non sommano — è peggio.
6. **Il mese non contiene un secondo elenco visite.** Scendere di scala vuol dire **cambiare unità**, non aprire un pannello: toccare la riga-settimana porta al modo settimana.
7. **Passando di unità resta la data al centro.** Non si torna al presente: il posto è l'unica cosa che il lettore stava tenendo.
8. **Le frecce significano la stessa cosa nei due modi:** un'unità indietro, un'unità avanti. «Questa settimana» diventa «Questo mese», stessa posizione.
9. **L'interruttore sta dentro il navigatore, prima delle frecce.** Non in un menù, non fra i filtri.
10. **Nessun modo «anno».** Con sei mesi di storia sarebbe una pagina con una riga — vedi §9.4.
11. **«Quali giorni erano chiusi» non si dice a distanza di mese.** L'informazione sopravvive come rapporto («20 giorni lavorati su 30»), non come etichetta.

---

## 8 · Campi che potrebbero non esistere — 6 marcati ⚠

| Campo | Cosa serviva |
|---|---|
| ⚠ `getWeeklyRevenueReport(from,to)` | **confermato da voi**: accetta un intervallo qualsiasi. Il mese è la stessa query |
| ⚠ seconda chiamata «stesso tratto» | il mese in corso richiede **due query**: 1–29 ago e 1–29 lug. Non è un campo, è una chiamata in più |
| ⚠ giorni lavorati per settimana | `DISTINCT` su `visits.date` nell'intervallo — **non è una colonna** |
| ⚠ giorni del mese nel rapporto | «su 30» sono i giorni di calendario o quelli di apertura? Vedi §9.1 |
| ⚠ `booking_schedule` | dichiara la domenica: a mesi non lo uso, ma è la fonte del «chiuso» in settimana |
| ⚠ primo giorno di storia | 2 marzo 2026: la navigazione **non deve poter andare più indietro** |

Dati per certi perché misurati da voi: i sei mesi e i loro totali, `visits.date` di tipo `date`, `visits.amount` sempre valorizzato.

---

## 9 · Domande aperte — dichiarate, non risolte

**9.1 · «20 giorni su 30» — il 30 sono i giorni di calendario o quelli di apertura?**
Scrivo i giorni di calendario perché è l'unico numero certo. Se `booking_schedule` regge il conto degli aperti, quello è meglio: **20 su 26 dice una cosa diversa da 20 su 30**.

**9.2 · Le settimane tagliate: aprendole si vede la settimana intera, giorni dell'altro mese compresi. È quello che vi aspettate?**
Sì, ed è deliberato. Ma è la scelta di composizione su cui vorrei una conferma esplicita.

**9.3 · Fin dove si torna indietro?**
La freccia sinistra su marzo 2026 va **disattivata**. Un mese prima dell'inizio della storia non è un mese magro, è un mese che non c'è, e la pagina non ha modo di dirlo.

**9.4 · Serve un modo «anno»?**
Non composto: con sei mesi sarebbe una pagina con una riga. A marzo 2027 la domanda diventa legittima, e la risposta sarà questa stessa pagina ancora una volta ribaltata. Non prima.

**Chiusa la §9.2 di CD-02:** la mia proposta del mese era giusta ma il mio vincolo era sbagliato — pensavo servisse una rotta nuova. L'interruttore fa la stessa cosa e dice una verità in più: **è la stessa domanda a due distanze.**

---

## 10 · Le parole

**«Settimana» / «Mese»** sull'interruttore. Non «vista settimanale», non «raggruppa per».

**«Settimana piena»** al posto di «giorno pieno» nel modo mese. Stessa formula, unità diversa.

**«Settimana ferma — non è passato nessuno».** Non «0 visite», non «nessun dato». È come lo direbbero.

**«Questo mese»** al posto di «Questa settimana» nel bottone di ritorno.

**«come il mese scorso»** quando il delta è nullo — regola di CD-02, unità nuova.

**«Agosto non è finito»** in apertura della nota parziale. Il fatto prima della spiegazione.

Tutte reversibili in una stringa.

---

## Verifiche fatte prima di consegnare

- Console pulita, tutti i token risolvono — compresi i sei `--gh-*` nuovi, usati per nome.
- Riuso di CD-02 verificato: nessun componente sostituito, `DayBar` e `TrendStrip` intatte.
- **`eur()` corretta:** l'ambiente non applicava la locale italiana e rendeva «3547 €». Ora raggruppamento esplicito. **Correzione retroattiva su CD-02** — vedi §1.
- Un artboard tagliava 142px e con essi l'intera risposta alla domanda 4 del brief, l'interruttore: corretto da 640 a 830.
- Le righe-settimana sommano esattamente ai totali di mese misurati sulla produzione (aprile 146 / 3.547 €, giugno 29 / 800 €, agosto 67 / 1.745 €), giorni lavorati compresi.
