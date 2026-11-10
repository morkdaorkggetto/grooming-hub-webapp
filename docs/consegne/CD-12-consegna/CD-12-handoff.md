# CD-12 · Handoff — il calendario del mese

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 10 novembre 2026
**Esito:** composizione, non codice. Sostituisce `shared/ui/DesiredDateStrip` nei due posti in cui si sceglie la data.
**Superfici:** `apps/customer/pages/Book.jsx` (passo 3) · `components/PendingRequest.jsx` (il riquadro «Scegli un'altra data» di CD-11).

---

## 1 · I file

| File | Cosa contiene |
|---|---|
| `cd12-calendario-kit.jsx` | `SAL12`, `primoMese`, `stato12`, `celle12`, `Calendario12`, `Giorno12`, `Freccia12`, `Avvisi12`, `Fasce12`, `Invia12`, `Passo3`, `Foglio12`, `Desktop12` |
| `cd12-calendario-note.jsx` | Le tavole: prima → dopo, decisioni, cosa non torna |
| `CD-12 Il Calendario Del Mese.html` | La tela |

**Dipendenze:** `tokens.css`, `shared-ui.jsx`, `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`, `cd01-cal-note.jsx` (solo `QRow`). Nessun file già consegnato è stato modificato.

`SAL12` e `OGGI12` sono valori di prova per la tela: in produzione vengono dalle impostazioni del salone e dalla data reale.

---

## 2 · Prima → dopo

| | DesiredDateStrip, oggi | Calendario del mese |
|---|---|---|
| forma | striscia di 12 giorni da domani | **un mese per volta, sei righe fisse** |
| al telefono | se ne vedono 6, domenica compresa | il mese intero: 7 colonne da circa 45 · caselle alte **44** |
| avanti / indietro | impossibile | **frecce 44×44** ai lati del mese; spente al primo mese e al mese limite |
| fino a quando | 12 giorni | **fino a 2 mesi da oggi** (impostazione del salone) |
| primo mese | — | il corrente; **il dopo se nel corrente restano meno di 7 giorni da chiedere** |
| passati e oggi | non c'erano | numeri spenti (opacità .45); oggi ha un trattino 14×2 primary sotto |
| domenica | nella striscia, non selezionabile | spenta (.45), intestazione «dom» a .5, **«dom chiuso» sotto la griglia** |
| lunedì | come gli altri | come gli altri; **«lun solo pomeriggio» sotto la griglia**, «Mattina» spenta se scelto |
| oltre il limite | — | spenti (.32); nel mese limite la riga **«Si può chiedere fino a …»** |
| periodo pieno | avviso a data scelta | **punto 5px `--color-warning-text`** sotto il numero + avviso a data scelta |
| poco preavviso | avviso a data scelta | **invariato**: nessun segno in griglia, avviso a data scelta |
| giorno scelto | casella evidenziata | **tondo pieno `--color-primary-hover`**, numero bianco 700; sotto, la data per esteso |

---

## 3 · I valori

**Il calendario (375)**
| Elemento | Valore |
|---|---|
| contenitore | `--color-surface-main`, bordo 1px `--color-border`, raggio 18, padding 10 12 10 |
| testata | griglia `44 \| 1fr \| 44`, gap sotto 4 · mese 19px serif, minuscolo |
| freccia | 44×44, raggio 12, bordo 1px, `chevron-left` / `chevron` 20px · spenta a opacità .35 |
| riga dei giorni | alta 18, 11px 700 maiuscolo, `lun … dom` |
| casella | alta **44**, tondo 40 · numero 15px, 600 (700 se scelto), cifre tabulari |
| legenda | sotto un filetto `--gh-border-35`, 11.5px, centrata; mostra «periodo pieno» solo se nel mese ce n'è uno |

**Nel riquadro «Scegli un'altra data»:** stesso calendario **senza bordo**, caselle alte **40** (dentro il riquadro c'è già un bordo, e servono fasce e pulsante).
**A 1365:** colonna del modulo, calendario largo **al massimo 440**, caselle alte **50**.

**Sotto il calendario, in quest'ordine**
1. **la data per esteso**: prima della scelta «Tocca il giorno che ti andrebbe bene.» (13px, mute); dopo «Hai scelto lunedì 16 novembre» (15px serif)
2. **gli avvisi della data**, solo a data scelta: alti almeno 40, raggio 12, fondo e bordo warning, icona 16px, 13px
3. **le fasce**: titolo «Mattina o pomeriggio?», tre riquadri alti 54 · scelta: bordo 2px primary su `--gh-tint` · lunedì: «Mattina» tratteggiata e spenta, con «chiusa il lunedì» sotto

**Spazi del passo 3 a 375:** padding laterale 16, gap 10 fra intestazione, calendario, avvisi e fasce.

---

## 4 · Le decisioni

1. **Non deve sembrare un sistema di posti liberi.** Tutti i giorni che si possono chiedere hanno lo stesso aspetto: nessun colore per «libero» o «occupato», nessun conteggio.
2. **Le regole stanno una volta, sotto la griglia**, non in ogni casella.
3. **L'unico segno dentro la griglia è il punto del periodo pieno**: è l'unica cosa utile prima di scegliere. Il poco preavviso riguarderebbe sempre la prima settimana e la segnerebbe tutta.
4. **Sei righe fisse**: l'altezza non cambia fra un mese e l'altro, quindi fasce e pulsante non saltano.
5. **Il limite è «stesso giorno, due mesi dopo»** (dal 10 novembre: il 10 gennaio). La freccia a destra si spegne sul mese limite.
6. **Il primo mese:** il corrente, oppure il dopo se nel corrente restano meno di 7 giorni da chiedere (da domani, domeniche escluse). Il 26 novembre si apre su dicembre; la freccia a sinistra riporta a novembre.
7. **Il lunedì** la fascia «Mattina» si spegne; se era già scelta, si deseleziona e la riga sopra il pulsante dice cosa manca.
8. **Il pulsante fisso di GH-115** resta in fondo: grigio (`--color-border`) con «Manca il giorno» / «Manca la fascia», pieno (`--color-primary-hover`) quando c'è tutto.
9. **Lo stesso calendario va nel riquadro «Scegli un'altra data»**: il cliente ci arriva proprio perché la sua data non andava bene, e con sei giorni non può cercarne un'altra più in là. Il motivo sta sotto il titolo, in una riga.
10. **La frase «È un desiderio: l'ora te la conferma il salone su WhatsApp.»** resta sotto il titolo del passo.

---

## 5 · Le misure — prese sul rendering, a 375 × 812

Fondo delle fasce rispetto al bordo alto della barra del pulsante (negativo = sopra, visibile):

| Caso | Scarto |
|---|---:|
| niente scelto | −63 |
| lunedì 16 · un avviso (poco preavviso) | −26 |
| martedì 22 dicembre · un avviso (periodo pieno) + «Manca la fascia» | **−5** |
| gennaio, mese limite | −67 |
| aperto il 26 novembre | −63 |
| due avvisi insieme | circa **+40** (si scorre) |

Per arrivarci ho stretto gli spazi del passo, **non le caselle**, che restano alte 44.

---

## 6 · Cosa NON cambia

- Passi 1, 2 e 4 e il riepilogo.
- Il pulsante «Invia la richiesta» (GH-115).
- Il testo degli avvisi «Periodo pieno» e «Sei un po' a corto di preavviso»: nella tela la seconda metà della frase è un segnaposto; si usa quella che c'è già.
- **Nessun colore nuovo.** Le sedici voci del §7 di CD-09.

---

## 7 · Campi da verificare

| Campo | Cosa serve |
|---|---|
| ⚠ **mesi di anticipo** | impostazione del salone, oggi 2 |
| ⚠ **periodi pieni** | da dove vengono oggi gli avvisi: date fisse o impostazione? |
| ⚠ **giorni e fasce chiusi** | domenica e lunedì mattina, già in `booking_schedule` |
| ⚠ **preavviso** | 7 giorni, lo stesso valore che oggi accende l'avviso |

---

## 8 · Cosa non torna

**8.1 · Con due avvisi insieme le fasce scendono di circa 40px sotto il pulsante: si scorre.** Capita solo con poco preavviso e periodo pieno insieme, cioè per una data a pochi giorni da Natale.

**8.2 · Il limite cade di domenica.** Il 10 gennaio 2027 è chiuso: l'ultimo giorno che si può chiedere è sabato 9. La riga «Si può chiedere fino a …» deve indicare **l'ultimo giorno chiedibile**, calcolato, non la data del limite. Nella tela il caso è lasciato visibile apposta.

**8.3 · Le feste** (8, 25 e 26 dicembre, 1 e 6 gennaio): non so se il salone è chiuso, nei dati non c'è. Nella tela sono giorni normali dentro il periodo pieno. Se chiude, vanno trattate come la domenica, da un elenco nelle impostazioni.

**8.4 · La legenda va costruita dalle stesse impostazioni che spengono i giorni**, non scritta a parte: se il salone cambia orari, «lun solo pomeriggio» deve cambiare da sé.

---

## Verifiche

- Console pulita, nessun colore nuovo.
- La prima stesura copriva le fasce anche con un solo avviso (18–38px), e la nota diceva il contrario: corretti gli spazi e il testo, misure rifatte sul rendering.
- La tavola a 1365 tagliava il passo 4: alzata a 970.
