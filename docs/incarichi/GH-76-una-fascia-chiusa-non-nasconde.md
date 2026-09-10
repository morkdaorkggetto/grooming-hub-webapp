# Incarico GH-76 — Una fascia chiusa non nasconde

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 10 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.**
**Segnalato dal salone.** Superficie: `/calendar` — griglia e modulo «Nuovo appuntamento». File attesi: `components/CalendarKit.jsx`, `pages/Calendar.jsx`, eventualmente `pages/Calendar.css`. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

Il salone ha prenotato per errore **lunedì 12 ottobre alle 10:30**, cioè in una fascia che il tenant dichiara **chiusa** (`closed_time_preferences: {monday: ["morning"]}`). L'applicazione **ha accettato senza dire niente**.

Misurato in produzione il 10/9, lunedì 12 ottobre:

| pet | ora | creato |
|---|---|---|
| **Cipino** | **10:30**, 90 min — **fascia chiusa** | 10:24 |
| Cipino | 17:00, 90 min | **10:25** |
| volpino 2 | 16:00 | 11:13 |
| volpino 1 | 16:00 | 11:13 |

**E l'intestazione conta «4 prenotati» mentre la griglia ne mostra tre.**

> **Un appuntamento che esiste, viene contato, e non si può guardare.** Se Roby non avesse aperto per caso il dettaglio dell'altro Cipino, quel cane sarebbe rimasto invisibile fino al 12 ottobre.

## 1 — La fascia chiusa deve mostrare quello che contiene

**Causa misurata**, in `PlanningBand`:

```jsx
{band.isClosed ? (
  <p className="gh-planning-closed">chiuso</p>
) : ( … richieste, appuntamenti, margine, «Prenota qui» … )}
```

Una fascia chiusa **sostituisce il proprio contenuto con la parola «chiuso»**. Chi l'ha scritta assumeva che dentro non potesse esserci niente. Ci può essere.

**Correzione: «chiuso» resta, e accanto compare quello che c'è dentro**, marcato come fuori orario.

- **la fascia chiusa e vuota resta identica a oggi**: la parola «chiuso», niente altro;
- **la fascia chiusa con qualcosa dentro** mostra la parola **e** le sue schede;
- **le schede in fascia chiusa si distinguono** da quelle in orario: chi guarda deve capire a colpo d'occhio che quella prenotazione è fuori dagli orari dichiarati. **Nessun colore nuovo**;
- **«Prenota qui» resta assente** in una fascia chiusa: si può prenotare per eccezione dal modulo, non con un gesto che suggerisce che la fascia sia libera;
- **il margine per chi arriva resta assente**: in una fascia chiusa non si tiene spazio per nessuno;
- **le postazioni occupate**: oggi il conteggio non compare in fascia chiusa. **Se dentro c'è qualcosa, deve comparire** — altrimenti tre cani prenotati per errore alla stessa ora restano senza guardia visibile.

> **È la regola che abbiamo già scritto tre volte**: `GH-64` con «in questa settimana», `GH-69` con la ricerca incompleta, e adesso qui. **Non dire che una cosa non c'è quando c'è.**

## 2 — Il modulo manuale deve conoscere le chiusure

**Causa misurata**, in `submitManual`: l'unico controllo è la capienza.

```js
if (manualConflict) { setError(APPOINTMENT_CAPACITY_MESSAGE); return; }
```

`getDateClosure` **esiste, funziona e conosce anche le chiusure di fascia**, ma è collegata solo a due posti: il disegno della griglia, e il modale «Conferma richiesta», dove **avvisa e lascia decidere**:

> *«Attenzione: … Puoi confermare comunque se è un'eccezione voluta.»*

**Nel modulo «Nuovo appuntamento» non è mai stata collegata.**

**Correzione: stesso comportamento del modale richieste — avvisa, non blocca.**

**E non blocca per una ragione deliberata**: se Davide apre di lunedì mattina per un cliente, l'applicazione non deve impedirglielo. **Un divieto che si può aggirare solo cambiando le impostazioni del salone è un divieto che verrà aggirato cambiando le impostazioni del salone.**

**L'avviso deve dire quale chiusura sta violando** — il giorno intero o la fascia — usando le parole che `getDateClosure` produce già. **Non inventarne di nuove.**

**Vale per tutte le strade che aprono quel modulo**: pulsante in intestazione, «Prenota qui» da una fascia, «Nuovo per lo stesso cliente» dal dettaglio.

> **Non è in questo mandato**: rendere bloccante l'avviso di doppione di `GH-41`. Ha funzionato — nello screenshot dice *«Cipino ha già un appuntamento lunedì 12 alle 10:30»* — ed è stato scavalcato volontariamente, probabilmente per correggere il primo errore. Che prenotare di nuovo **non cancelli il primo** è corretto e resta così.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.** Se ti trovi a scrivere SQL, ti sei perso.

**Nessun appuntamento esistente viene spostato, annullato o eliminato.** Cipino delle 10:30 resta dov'è: **questo mandato lo rende visibile, non lo ripara.** Cosa farne lo decide il salone.

**Le chiusure si leggono dal tenant**, con la funzione condivisa. **Nessun giorno, nessuna fascia e nessun orario scritto nella vista** — vale da `GH-54`.

**L'avviso non blocca il salvataggio**, in nessuna delle due superfici.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-75`: grana a mezza giornata, lavorazioni senza ora mai in fascia, `flex-shrink: 0` e `min-height: 0` sotto i 640px, lessico ammesso solo `lavorati sul momento`, `chi arriva`, `senza ora fissata`, il peso segue l'agibilità, l'arretramento appartiene al contenitore.

## Controprove

Dichiara nel registro. **Numeri e testi esatti — e una prova a schermo.**

- **il caso vero riprodotto**: lunedì con la mattina chiusa e un appuntamento alle 10:30. La fascia mostra **«chiuso» e la scheda**; il conteggio in alto e le schede visibili **coincidono**;
- **fascia chiusa e vuota**: identica al commit base — confronto misurato;
- **giorno intero chiuso con qualcosa dentro**: stesso comportamento della fascia;
- **le schede fuori orario si distinguono** da quelle in orario: riporta i valori misurati di ciò che le separa;
- **«Prenota qui» e il margine restano assenti** in fascia chiusa, anche quando contiene qualcosa;
- **le postazioni occupate compaiono** in fascia chiusa non vuota, con il numero giusto;
- **il modulo manuale avvisa** prenotando in una fascia chiusa, e **avvisa diversamente** per un giorno intero chiuso: riporta i due testi esatti;
- **l'avviso non blocca**: si salva comunque, e l'appuntamento nasce;
- **nessun avviso** prenotando in orario: prova di non-regressione;
- **le tre strade** che aprono il modulo avvisano tutte;
- **una prova a schermo con screenshot allegato** del lunedì con la mattina chiusa e la scheda dentro. **Se il banco non riesce a renderlo, fermati e dichiaralo** invece di consegnare senza;
- **a 1365, 1024 e 375px**: nessuno sbordamento, nessun bersaglio sotto i 44px;
- build verde. **Suite RLS: da non rieseguire** — nessuna policy toccata. Ultima misura viva: `GH-74`, **60 PASS dell'8/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R, **sulla settimana del 12 ottobre**:

1. **Cipino delle 10:30 si vede?** È l'unica domanda che conta;
2. **si capisce che è fuori orario**, o sembra una prenotazione come le altre?
3. **prova a prenotare tu lunedì mattina**: l'avviso arriva, e ti lascia comunque salvare?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-76-una-fascia-chiusa-non-nasconde-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
