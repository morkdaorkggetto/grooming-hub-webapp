# GH-76 — Emendamento 1: il tratteggio è già occupato

**Emendamento a** `GH-76-una-fascia-chiusa-non-nasconde.md` · **Da:** Luigi, via Cowork · **Data:** 10 settembre 2026
**Emesso a mandato in corso.** Il mandato originale **non è stato modificato**: questa correzione vive accanto, come gli emendamenti della catena G6.

## Cosa cambia

Codex ha dichiarato, prima di editare:

> *«La marcatura userà esclusivamente token cromatici già presenti, con fondo neutro, bordo tratteggiato e dicitura "fuori orario".»*

**Il bordo tratteggiato non si usa.** Fondo neutro e dicitura restano.

## Perché

Sulla stessa griglia il tratteggio significa **già due cose**:

| elemento | misurato in |
|---|---|
| **`RequestChip`** — richiesta da confermare, bordi tratteggiati 1/1/1/1 | `GH-66`, `GH-75` |
| **`.gh-planning-margin`** — spazio tenuto per chi arriva, `1px dashed` col primario | `GH-64` |

Aggiungendo «fuori orario» diventerebbero **tre significati per lo stesso segno**, tutti visibili nella stessa settimana.

> **È la famiglia di difetto che abbiamo passato tre giri a togliere dalla marcatura della ricerca** — `GH-65`, `GH-66`, `GH-67` — dove il problema era esattamente che un segno diceva troppe cose o troppo poche.

**E non serve**: la dicitura **«fuori orario»** è inequivocabile da sola. Il tratteggio non aggiunge informazione, aggiunge un omonimo.

## Cosa fare

**Il bordo della scheda fuori orario resta quello pieno delle altre schede.** La distinzione la portano il **fondo neutro** e la **dicitura**.

**Nessun colore nuovo**, come già prescritto.

## Controprova aggiuntiva

Nel registro, misurata: **il bordo della scheda fuori orario è identico per stile e spessore a quello di una scheda in orario** — e **diverso** da quello tratteggiato della richiesta e del margine. Riporta i tre valori.

## Cosa resta invariato

Tutto il resto del mandato, e in particolare le due letture che Codex ha fatto **meglio di come era scritto** e che vanno conservate:

- **il giorno interamente chiuso mostra le fasce solo quando contengono elementi** — così la domenica vuota resta identica a oggi;
- **l'avviso del modulo manuale è limitato alla fascia dell'ora selezionata**, non al giorno intero: prenotando lunedì pomeriggio non deve comparire nessun avviso.
