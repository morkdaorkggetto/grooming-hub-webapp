# Incarico GH-64 — Trovare un cane nella settimana

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna query nuova, nessun dato toccato.**
**Chiesto dal salone.** Superficie: la barra del calendario in `/calendar`. File attesi: `components/CalendarKit.jsx`, `pages/Calendar.jsx`, `pages/Calendar.css`. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy.

**Modello suggerito: SPARK** — problema già misurato e circoscritto, nessuna decisione architetturale aperta. **È anche il primo test dell'instradamento** proposto nella nota dell'1/9: **dichiara nel registro quale modello ha eseguito**, e se c'è stato un passaggio a Sol, con il motivo.

> **Un solo punto di incertezza reale**: `showPicker()` sul Safari del banco. Se non funziona, **non compensare esplorando**: fermati e dichiaralo con la forma dell'escalation — motivo, evidenza raccolta, punto esatto in cui il mandato ha smesso di essere deterministico.

## 1 — Un riquadro di ricerca nella barra

Al banco arriva una telefonata: «sono il proprietario di Nina, a che ora dovevo venire?». Oggi per rispondere si scorre la settimana a occhio.

**Un campo di ricerca nella stessa riga di `Settimana / Giorno`**, compatto. Scrivendo, gli appuntamenti che corrispondono **si evidenziano nella griglia**.

**Cerca su**: nome del pet, nome del proprietario, **e telefono anche parziale**.

> **Il telefono si confronta sulle sole cifre, non sul testo.** In produzione i numeri sono scritti `+39 333 5700003`: digitando `3335700003` un confronto letterale non trova niente. È la stessa normalizzazione della guardia di `GH-57`, e senza di essa la funzione sembra rotta proprio nel caso per cui è nata.

**I dati ci sono già nel browser**: la vista carica per ogni appuntamento il proprietario e il suo telefono, e in `CalendarKit.jsx` esiste già un filtro che guarda `[nome, proprietario, telefono, razza]`. **Nessuna query nuova.**

### Si marca chi corrisponde, non si spegne il resto

**Le schede che corrispondono si marcano.** Le altre **restano come sono**: spegnere la settimana intera per trovare un cane la rende illeggibile proprio mentre la stai guardando.

### E deve dire quando non trova

**La ricerca vede solo la settimana visibile.** Se il cane cercato è fra dieci giorni non si accende niente, e chi guarda conclude «non c'è» — una risposta sbagliata data con sicurezza, al telefono, a un cliente.

**Quindi quando non trova nulla lo dice**, con parole che nominano il limite: *nessun appuntamento **in questa settimana***. Non «nessun risultato».

**Quando trova, dice quanti.**

> **Non è in questo mandato**: cercare oltre le date visibili. Chiede una query e va deciso a parte.

## 2 — «Vai a data» diventa un'icona

Il pulsante dice **«Vai a data»**, ma cliccandolo si apre un **calendarietto** da cui si scelgono giorno e mese. La scritta promette un campo da compilare e apre un calendario: **inganna**.

**Diventa l'icona di un calendario**, con nome accessibile esplicito — chi non vede l'icona deve sentirsi dire cosa apre.

**Vincolo tecnico**: un `input[type=date]` nudo si veste in modo diverso su ogni browser, e Safari è quello dove il salone lavora. La strada solida è **un pulsante con l'icona che apre il selettore** (`showPicker()`), con l'input nascosto alla vista ma raggiungibile. Se sul Safari del banco non funzionasse, **fermati e dichiaralo** invece di lasciare un'icona che non apre niente.

## 3 — E la riga deve reggere

La barra oggi porta già interruttore, frecce, intervallo, «Questa settimana» e «Vai a data». **Ci aggiungiamo un campo di ricerca e togliamo due parole.**

**Sopra i 640px**: tutto su una riga, il campo compatto, **nessun bottone sotto i 44px**.

**Sotto i 640px**: l'aritmetica non regge — `GH-55` aveva già misurato 286px su 343 disponibili senza la ricerca. **Decidi tu dove va il campo** — seconda riga, o assente — **ma dichiaralo**, e non lasciare che si stringa in silenzio finché non si può più scrivere dentro. Ricorda che sul telefono «Questa settimana» e «Vai a data» sono già nascosti e il ritorno a oggi vive sull'intervallo.

## Invarianti

**Nessuna query, nessuna migrazione, nessun dato toccato.** Se ti trovi a scrivere SQL, ti sei perso.

**La ricerca non filtra la griglia**: non nasconde giorni, fasce, margini o piedi. **Marca e basta.** I conteggi in alto — prenotati, lavorati sul momento — **non cambiano** mentre si scrive.

**Nessun colore nuovo**, e restano gli invarianti di `GH-54` → `GH-61`: grana a mezza giornata, lavorazioni senza ora mai in fascia, margine che non si toglie a settimana vuota, `flex-shrink: 0` e `min-height: 0` sotto i 640px, lessico ammesso solo `lavorati sul momento`, `chi arriva`, `senza ora fissata`, il peso segue l'agibilità, l'arretramento appartiene al contenitore.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta, rimosse a fine sessione:

- ricerca per **nome del pet**, per **proprietario**, e per **telefono parziale**: tre prove, tre esiti;
- **telefono scritto in un formato diverso da quello in archivio** — cifre nude contro `+39 333 …` — **trova lo stesso**;
- **le schede non corrispondenti restano invariate**: dimostralo confrontando il loro aspetto prima e durante la ricerca;
- **conteggi in alto invariati** mentre si scrive;
- **nessuna corrispondenza**: compare il messaggio che nomina *questa settimana*, non un generico «nessun risultato»;
- **con corrispondenze**: compare quante sono;
- **l'icona del calendario apre il selettore** su Safari e su Chrome: riporta entrambi, e il nome accessibile;
- **a 1365 e a 1024px**: tutto su una riga, nessun bersaglio sotto 44px, nessuno sbordamento;
- **a 375px**: dichiara dove è finito il campo e misura che gli altri controlli siano ancora usabili;
- build verde. **Suite RLS: da non rieseguire** — nessuna policy o funzione toccata. Dichiara l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **cerca le ultime quattro cifre di un numero vero**: si accende la scheda giusta, e la settimana resta leggibile intorno?
2. **cerca un cane che ha l'appuntamento la settimana prossima**: il messaggio ti convince che devi guardare avanti, o ti fa credere che non esista?
3. **apri il calendarietto dall'icona**: si capisce cosa fa prima di premerlo?

La seconda è la più importante: **è quella che decide se questa ricerca aiuta o mente.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-64-trovare-un-cane-nella-settimana-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
