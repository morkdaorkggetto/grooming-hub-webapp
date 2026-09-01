# Incarico GH-55 — Quattro correzioni alla settimana di Roby

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Forma breve (regola 4).** Superficie sola, **nessuna migrazione, nessun dato toccato**.
**Superficie:** `/calendar`. File attesi: `pages/Calendar.jsx`, `components/CalendarKit.jsx`, `pages/Calendar.css`. **Nessuna rotta nuova.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy.

## Da dove nasce

`GH-54` è in produzione da ieri sera e Roby e Davide la stanno usando. Quattro cose viste guardandola. **Nessuna è un difetto di esecuzione**: tre correggono la composizione, una corregge una parola che dice il falso.

---

## 1 — L'annullato esce dalla griglia

Oggi un appuntamento annullato **non conta** nella capienza né nei «prenotati» — verificato — ma **occupa una scheda alta quanto un appuntamento vero**. La settimana sembra più piena di com'è, proprio nella vista che serve a capire quanto è vuota.

**In vista settimana**: l'annullato **esce dalla fascia** e scende nel piede della giornata, come conteggio, accanto agli entrati senza appuntamento. Il piede è già il posto delle cose **che non occupano una postazione**.

**In vista giorno**: resta intero, con la sua etichetta «Annullato». Lì si lavora la giornata e la sua storia serve.

**Invariante**: da entrambe le viste l'annullato deve restare **raggiungibile**. Il conteggio nel piede si apre e porta al dettaglio, perché è da lì che si preme «Ripristina programmato». Un annullato che non si può più aprire è un annullato che non si può più disfare.

> **Non è in questo mandato**: il gesto «Elimina», per la riga inserita per errore. Chiede una migrazione e ha una trappola sul punteggio delle assenze. Mandato separato.

## 2 — L'intestazione sul telefono

Sotto i 640px l'interruttore `Settimana / Giorno` occupa da solo una riga intera, il riepilogo ne prende altre due, e **due bottoni spariscono**: «Vai a data» e **«Questa settimana»** (`Calendar.css`, regola a `display: none`).

**Il che significa che oggi, sul telefono, non esiste un gesto per tornare a oggi.** Avanti di quattro settimane, si rientra solo premendo `‹` quattro volte. È sparito in silenzio nel formato di ripiego — la stessa famiglia di guasto contro cui `CD-06` aveva messo in guardia per il piede.

Tre correzioni, che stanno insieme:

**a. Una riga sola**: interruttore e frecce sulla stessa riga, con l'intervallo in mezzo. **L'aritmetica è stretta e va rispettata**: interruttore ≈ 178px + due frecce da 46 + spazi ≈ 286px su 343 disponibili a 375px. Ci sta se **l'intervallo perde l'anno** — navigando di settimana in settimana non è mai in dubbio — e se l'interruttore torna al padding stretto **restando sopra i 44px di altezza**, che è la regola del banco. Sotto i 390px l'intervallo **va a capo da solo**: dichiaralo nel registro, non forzarlo.

**b. Il riepilogo su una linea**, con un separatore che lo renda un riassunto: `13 prenotati · 2 da confermare · 5 entrati senza appuntamento`. **Le voci possono essere quattro, non tre** — «da confermare» compare solo con richieste in attesa. **Togli «n postazioni»**: è già scritto in ogni fascia come «2/3 postazioni occupate», e in alto è una ripetizione. Restano tre voci nel caso peggiore.

**c. L'intervallo diventa il ritorno a oggi.** Non un bottone in più: si tocca «31 Ago – 6 Set» e si è tornati a questa settimana. Con la sua etichetta accessibile esplicita.

> **Attenzione al modo giorno**: l'etichetta cambia («Oggi» invece di «Questa settimana»). Il gesto deve funzionare in entrambi i modi.

## 3 — Il fatto si distingue dal piano

Chi guarda deve distinguere **ciò che è stato deciso** da **ciò che è già successo**, senza leggere le parole.

**Nessun colore nuovo** — vincolo di `CD-06`, e va tenuto: due tinte diverse suggerirebbero due categorie pari, mentre qui la differenza è di **natura**. L'appuntamento è un piano, la lavorazione senza ora è un fatto compiuto.

Quella differenza si legge come **pieno contro contorno**: l'appuntamento resta la scheda con la barra d'accento a sinistra; la lavorazione senza ora — i puntini del piede e le righe del modo giorno — diventa **piena, compatta, nel neutro forte**. A colpo d'occhio: **ciò che è vuoto è da fare, ciò che è pieno è fatto.**

## 4 — Le parole del margine

Il badge dice **«Tenuto per chi entra ×1»**, e dice il falso. `load.available` è **capienza meno appuntamenti**: è il resto. **Nessuno lo sta tenendo** — se ci si prenota dentro, non protesta niente. La parola promette un'intenzione che il meccanismo non ha, e «×1» è un moltiplicatore senza unità, a nove pixel da una fascia che conta in postazioni.

**Nuove parole, che dicono quello che c'è:**

- spazio libero: **`1 libera per chi entra`**
- niente spazio: **`Nessuna libera per chi entra`** — sostituisce «Poco spazio per chi entra»

**E un nome solo per un oggetto solo.** Oggi la vista lo chiama in tre modi: «entrati senza appuntamento» in alto, «entrati senza appuntamento» nel piede, «chi entra» nel margine. **Uniforma**: la formula piena è *entrati senza appuntamento*, la forma corta ammessa nei riquadri stretti è *chi entra*, e non ne esistono altre.

> **Coda, non da fare qui**: rendere «tenuto» una parola vera. Il salone dichiara nelle impostazioni **quante postazioni vuole tenere libere per chi entra**, e il badge conta contro una riserva che esiste. È la stessa schermata dove finiranno gli orari 9–13 / 13–19, già in coda.

---

## Invarianti

**Nessun dato toccato, nessuna migrazione, nessuna policy.** Se ti trovi a scrivere SQL, ti sei perso.

**Nessun numero di capienza, orario o volume scritto nel codice della vista.** Vale come in `GH-54`: capienza e chiusure dal tenant, fasce dalla definizione condivisa di `GH-39`.

**Nessun colore nuovo**, e nessuna rotazione locale delle frecce: la direzione vive nell'icona (`GH-53`).

**I quattordici punti del §7 di `CD-06` restano deliberati**, salvo dove questo mandato li corregge esplicitamente. In particolare **resta intatto**: la grana è la mezza giornata; le lavorazioni senza ora **non entrano mai in una fascia**; il margine non si toglie quando la settimana è vuota; sotto i 640px le schede giorno vogliono `flex-shrink: 0` e il contenitore `min-height: 0`, **o il piede sparisce in silenzio**.

**Scostamenti da dichiarare.** Le voci 1, 2 e 3 correggono la composizione consegnata. Sono compressioni dentro la sua grammatica, non un ridisegno — ma **il registro le elenca come scostamenti da `CD-06`**, una riga ciascuna, o fra un mese il prodotto e il materiale di `design_handoff_staff_app/` raccontano due cose diverse.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- una giornata con **due appuntamenti e uno annullato**: in settimana l'annullato **non è nella fascia** ed è **contato nel piede**; in giorno è intero; da entrambe **si arriva al dettaglio** e «Ripristina programmato» funziona;
- l'annullato **continua a non contare** in capienza e in «prenotati» — invariato;
- a **375px**: intestazione su una riga, riepilogo su una linea, **nessun bottone sotto i 44px**; dichiara se e dove l'intervallo va a capo;
- a **375px**: toccando l'intervallo si torna a oggi, **in entrambi i modi**;
- il riepilogo **con** e **senza** «da confermare»: in nessuno dei due casi compare «n postazioni»;
- a colpo d'occhio, in una giornata con appuntamenti **e** lavorazioni senza ora, i due gruppi sono distinguibili **senza leggere**;
- la parola «tenuto» e il carattere `×` **non compaiono più** in nessun punto della vista; «chi entra» e «entrati senza appuntamento» sono le **uniche** due forme in uso;
- **il piede non sparisce** sul telefono — la controprova di `GH-54`, da rifare perché questo mandato tocca la stessa zona;
- build verde; suite RLS invariata — questa vista non tocca le policy.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro, tre cose da aprire con gli occhi, **prima sul computer e poi sul telefono**:

1. **la settimana corrente**, che ha annullati veri: deve sembrare più vuota di ieri, e deve essere vero;
2. **una giornata con appuntamenti e lavorazioni senza ora insieme**: si capisce quale gruppo è già successo?
3. **il telefono, avanti di tre settimane**: si torna a oggi con un gesto solo?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-55-quattro-correzioni-alla-settimana-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
