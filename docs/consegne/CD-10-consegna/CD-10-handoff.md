# CD-10 · Handoff — la tessera, rivista sul vero

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 2 ottobre 2026
**Esito:** composizione. Non codice. Sostituisce la tessera di CD-09 dove indicato; tutto il resto di CD-09 resta valido.
**Contratto «prima» misurato su:** le schermate di GH-107 (`tessera-320.png`, `tessera-375.png`, `tessera-1365.png`).

---

## 1 · I file

| File | Cosa contiene |
|---|---|
| `cd10-tessera-kit.jsx` | `G10`, `V10` (la griglia), `Ritratto10`, `Tiles`, `racconto10()`, `Regola`, `Tessera10`, `Testata`, `BancoBtn`, `Invito10`, `Pagina10`, `HomeStrip10` |
| `cd10-tessera-note.jsx` | Le tavole: misure sul vero, meno cerchi, valori, cosa non torna |
| `CD-10 La Tessera Rivista.html` | Il canvas |

**Dipendenze:** quelle di CD-09 più `cd09-tessera-kit.jsx` (riusa `TIER`, `TierChip`, `Tacche`, `FakeQR`, `TabBar`). **La modalità banco di CD-09 non è toccata.**

`FakeQR` resta un segnaposto: non è un codice.

---

## 2 · Colori — nessuno nuovo

Solo token esistenti. Il pulsante passa a `--color-primary-hover` (vedi §7.1).

---

## 3 · La griglia — valori normativi

| Elemento | 375 e oltre | 320 |
|---|---|---|
| margine pagina | 16 | **12** |
| padding tessera | 24 sopra/sotto · 20 ai lati | 24 · 16 |
| colonna | max 390, centrata | piena |
| testata | 56 · colonne **44 \| 1fr \| 44** | 56 · titolo 17px |
| asse | uno, centrale — **tutto centrato**, invito compreso | uguale |

**Ritmo verticale dentro la tessera:**

| Da → a | px |
|---|---:|
| GROOMING HUB → ritratto (o nome, se senza foto) | 20 |
| ritratto → nome | 14 |
| nome → razza | 4 |
| razza → chip livello (solo se c'è) | 12 |
| → frase | 24 *(sostituisce il filetto, tolto)* |
| frase → sottotitolo | 6 |
| sottotitolo → timbri | 16 |
| timbri → regola | 12 |
| regola → QR | 20 |
| fra tessera, pulsante, invito | 12 |

---

## 4 · Prima → dopo

| | CD-09 / GH-107 | CD-10 |
|---|---|---|
| **ritratto senza foto** | anello 76 con l'iniziale | **assente**: la tessera comincia dal nome, a **40px** |
| **ritratto con foto** | medaglione tondo | **riquadro 88×88, raggio 18**; livello = filo 1,5px nel metallo |
| **timbri** | cerchi centrati da 38 | **caselle a larghezza piena**, 44 alte (≤6) o 36 (7–12), raggio 10, gap 6, **numerate** |
| casella libera | — | bordo tratteggiato, numero in `--color-text-secondary` |
| casella prossima | bordo pieno | bordo pieno, numero in primary |
| casella fatta | pieno + zampa | pieno + zampa |
| **filetto sotto la razza** | c'era | **tolto** |
| **regola** | una frase che va a capo dove capita | **«Ogni visita da noi è un timbro.»** — vedi §7.4 |
| **QR sulla tessera** | 54 + bordo 4 | **76 + bordo 6, raggio 10** |
| **«Mostra al banco»** | 64 alto, con sottotitolo | **54**, senza sottotitolo — §7.1 |
| **indietro** | non visibile | riquadro 44 — §7.2 |
| **titolo a 320** | spostato di ~26px | centrato — §7.3 |
| **invito** | icona a sinistra, testo a sinistra | **centrato**, icona sopra; testo «Tienila a portata. Aggiungila alla schermata Home.» |
| **striscia in Home** | cerchio 48 | riquadro 48 raggio 12: miniatura del ritratto, o l'icona `tessera` su `--gh-tint` |

**Sullo stato normale (senza ritratto, pochi timbri) la pagina non ha più nessun cerchio.**

---

## 5 · La frase — un caso nuovo

`racconto10()` aggiunge **l'ultimo passo**:

- quando `done === of − 1` → **«La prossima è quella del Bronzo.»** / «{n} visite fatte, ne basta una.»

Prima, con il Bronzo a quattro, «La prossima è la quarta» e «Il Bronzo arriva alla quarta visita» dicevano la stessa cosa due volte.

Gli altri casi di CD-09 restano identici.

---

## 6 · Il numero di timbri non è fisso

La soglia del Bronzo sale (4 oggi, 5 dal 7 novembre, 6 dal 7 gennaio 2027). **Le caselle dividono sempre tutta la larghezza**: a quattro sono larghe, a sei più strette, la fila non si sposta e non si allunga. Oltre 6 vanno su due righe; oltre 12 si passa alle `Tacche` di CD-09.

---

## 7 · Le decisioni da non toccare

1. **«Mostra al banco»:** fondo `--color-primary-hover` (#5e8580), testo #fbf6f3, **opacità 1** in ogni stato tranne disabilitato, alto 54, raggio 14, icona `qr` 20px. Il contrasto è **3,8:1: basta solo per testo grande**, quindi l'etichetta è **19px / 700 su una riga**. È un vincolo, non una misura estetica: se si rimpicciolisce l'etichetta, il contrasto non regge più.
2. **Indietro:** 44×44, raggio 12, fondo `--color-surface-main`, bordo 1px `--color-border`, icona `chevron-left` 20px in `--color-text-primary`. Nella prima colonna della testata.
3. **Testata simmetrica 44 | 1fr | 44.** La terza colonna è vuota apposta: è lei che tiene il titolo al centro.
4. **La regola: solo «Ogni visita da noi è un timbro.»** — decisione di Luigi del 2/10. La riga con la data («Contano le visite dal 6 marzo 2026») **è tolta**. Per i livelli Bronzo e Argento, dove non c'è una data, resta la seconda riga «Contano le visite degli ultimi 24/36 mesi». All'Oro: «Il livello più alto della tessera».
5. **Senza foto il ritratto non c'è.** Non rimettere l'iniziale: era il cerchio più grande della pagina, per il cane che non ha niente da mostrare.
6. **Tutto centrato**, invito compreso.
7. **Restano valide le sedici voci del §7 di CD-09**, insegne comprese: fuori dalla tessera «ZavaRoby pet station», dentro «GROOMING HUB».

---

## 8 · Campi da verificare

Quelli di CD-09 restano aperti. Uno nuovo:

| Campo | Cosa serve |
|---|---|
| ⚠ **soglia corrente del Bronzo** | la tessera deve leggere la soglia del giorno (4 / 5 / 6), non averla scritta |

---

## 9 · Cosa non torna

**9.1 · Il 7 novembre il Bronzo si allontana.** Chi ha «3 di 4» si ritrova «3 di 5» senza aver fatto niente. Il 6 legge «La prossima è quella del Bronzo», il 7 «La prossima è la quarta». Ora che la data non è più scritta sulla tessera, **il cambio non ha spiegazione a vista**. Se si può, la soglia cresca solo per chi non è all'ultimo passo — ma è una regola, non un disegno: **decide Luigi.**

**9.2 · L'altezza cambia secondo il cane.** Senza ritratto la tessera è più corta di circa 100px. Lo considero un pregio, ma se si scorre fra più cani si vede.

**9.3 · Lo scostamento del pulsante chiaro non è dimostrato.** Più chiaro a 375 che a 1365 può dipendere dalla cattura (un `:hover` rimasto attivo, un'opacità ereditata). **Prima di correggerlo, Codex verifichi stato e opacità calcolati sull'elemento.**

---

## 10 · Le misure sul vero — di chi sono

Nella prima tavola del canvas le nove misure sulle schermate di GH-107:

- **Miei:** i cerchi (6 su 10 elementi), la frase doppia, la regola che spezza la data.
- **Dell'esecuzione:** pulsante a 64, pulsante più chiaro a 375, indietro non visibile, titolo spostato a 320, margine 10 a 320.
- **Conforme:** margine 16 e tessera 343 a 375.

---

## Verifiche

- Console pulita, nessun colore nuovo.
- Numeri nelle caselle libere portati a `--color-text-secondary`: in grigio chiaro non si leggevano.
- Le correzioni del 2/10 richieste da Luigi sono incluse: riga con la data tolta, QR ingrandito, invito centrato, «del telefono» tolto.
