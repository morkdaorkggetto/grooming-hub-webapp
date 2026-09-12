# Incarico GH-82 — Il ritaglio si fa con le dita

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.**
**Trovato da Luigi provando l'app come cliente, sul telefono.** Superficie: `shared/ui/ImageCropModal.jsx` e la scheda pet lato cliente. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

`GH-79` ha portato il ritaglio nell'app clienti. Luigi ha caricato il ritratto di Rumba dal telefono e **non è riuscito a inquadrare il muso**: la foto è larga, il cane è lontano, e il medaglione ha finito per contenere erba e coda.

Il banco di prova aveva misurato un gesto di trascinamento — 34 px in orizzontale, 22 in verticale — e la misura era vera. **Ma spostare non è inquadrare**, e un trascinamento simulato non è un pollice su una foto di un prato.

> **Il mandato precedente chiedeva: «se non regge al tocco, dichiaralo».** Ha retto la prova che gli era stata chiesta. Era la prova a essere più piccola del gesto.

## Le quattro cause, misurate nel componente

**1. Lo zoom è un cursore, non le dita.** `input type="range"` da 1 a 3. Sul telefono si trascina una barretta con un dito **mentre l'immagine si muove da un'altra parte**. La pizzicata **non esiste**: c'è solo `onPointerMove`, un dito per volta.

**2. Lo zoom arriva a 3×.** Su una foto larga con il cane lontano **può non bastare** ad arrivare al muso.

**3. Non si può ritoccare dopo.** Salvata la foto, l'inquadratura è quella: per cambiarla si ricarica il file da capo. **Escluso deliberatamente da `GH-79`** — *«non è in questo mandato»* — ed è esattamente la cosa che serviva.

**4. Toccare il medaglione non fa niente.** I comandi sono due voci testuali sotto — la forma del desktop. **Sul telefono si tocca l'immagine**: è il gesto che chiunque prova per primo.

## Cosa fare

### Pizzicare per ingrandire

**Due dita ingrandiscono e rimpiccioliscono**, come ovunque. **Il cursore resta** per chi usa il mouse: il banco lavora sul desktop e non deve perdere niente.

**Il trascinamento con un dito continua a spostare**, e le due cose non devono confondersi: due dita che si avvicinano **non sono** un trascinamento.

### Zoom oltre il triplo

**Alza il massimo** e dichiara il valore scelto. Il criterio non è un numero che piace: **deve essere possibile riempire il medaglione con il muso di un cane fotografato a qualche metro di distanza.** Prova con una foto larga vera, non con un ritaglio già stretto.

**Il minimo resta 1**: l'immagine intera dentro la cornice.

### Ritoccare senza ricaricare

**Toccando il medaglione, se un ritratto c'è già, si riapre il ritaglio su quella immagine.** Si sposta, si ingrandisce, si conferma.

> **Attenzione, ed è il punto delicato**: nel deposito c'è **l'immagine già ritagliata**, non l'originale. Ritagliare un ritaglio **perde qualità a ogni giro** e non permette di allargare l'inquadratura oltre quello che era stato tenuto.
>
> **Misura cosa succede** dopo tre ritocchi consecutivi — peso e dimensioni del file — e **dichiaralo**. Se il degrado è visibile, **fermati e dillo**: conservare anche l'originale è una decisione che tocca il deposito e i permessi, e **non si prende dentro questo giro.**

### Il medaglione si tocca

**Toccando il medaglione**: se non c'è ritratto si sceglie un file; se c'è, si riapre il ritaglio.

**I due comandi testuali restano** — «Cambia la tua foto» e «Togli la tua foto» — per chi naviga da tastiera e per chi legge con uno screen reader. **Il tocco è in aggiunta, non in sostituzione**, e il medaglione deve dichiarare di essere toccabile a chi non lo vede.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.** Se ti trovi a scrivere SQL, ti sei perso.

**Il contratto del banco non cambia.** Le due pagine staff che usano il ritaglio — `AddClient` e `ClientDetail` — devono comportarsi **identiche**: stesse impronte di `GH-79`, `d77f3f75…` e `9f1f2600…`. **La pizzicata e lo zoom più alto arrivano a entrambi**, perché il componente è uno solo — ma niente altro cambia, e nessuna opzione nuova diventa il predefinito.

**Nessun permesso nuovo**: la lista dei campi scrivibili dal cliente resta di tre.

**`photo_url` del salone non si tocca mai**, in nessuna delle operazioni.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-81`.

## Controprove

Dichiara nel registro. **Numeri, non aggettivi — e con un dito vero, non simulato.**

- **pizzicata a 375px**: due dita che si allontanano ingrandiscono, che si avvicinano rimpiccioliscono. **Riporta il fattore di zoom prima e dopo**;
- **un dito continua a spostare**, e una pizzicata **non produce uno spostamento** parassita: misura entrambi;
- **zoom massimo**: valore scelto, e la prova che **con una foto larga si arriva al muso** — riporta le dimensioni della foto usata;
- **toccando il medaglione senza ritratto**: si apre la scelta del file;
- **toccando il medaglione con un ritratto**: **si riapre il ritaglio su quella immagine**, non la scelta del file;
- **tre ritocchi consecutivi**: peso e dimensioni del file dopo ciascuno. **Se il degrado è visibile, fermati e dichiaralo;**
- **annullando un ritocco**: `owner_photo_url` invariato, **zero caricamenti**;
- **i due comandi testuali funzionano ancora**, e il medaglione è raggiungibile da tastiera con un nome accessibile;
- **le due pagine staff sono identiche**: impronte confrontate con quelle di `GH-79`;
- **a 1365 e 375px**: nessuno sbordamento, nessun bersaglio sotto i 44px;
- **una prova a schermo con screenshot allegato** del ritaglio a 375px con lo zoom alto. **Se il banco non riesce a renderlo, fermati e dichiaralo;**
- build verde. **Suite RLS: da non rieseguire.** Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Sul telefono, sulla foto vera di Rumba** — quella nel prato, che è il caso difficile:

1. **riesci a inquadrare il muso?** È la domanda che ha generato il mandato;
2. **tocchi il medaglione e si apre?**
3. **ritocca due volte di seguito**: la foto peggiora a occhio?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-82-il-ritaglio-si-fa-con-le-dita-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
