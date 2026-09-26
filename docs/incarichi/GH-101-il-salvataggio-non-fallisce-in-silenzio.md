# Incarico GH-101 — Il salvataggio non fallisce in silenzio

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 26 settembre 2026
**Superficie**: `apps/staff/components/CalendarKit.jsx`, `apps/staff/pages/Calendar.jsx`, `shared/ui/Modal.jsx`.
**Nasce da `GH-100`**, che ha percorso il codice invece di interrogare i dati.

**Perimetro**: nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta. Database ammesso **solo il demo**; nessun push, merge o deploy.

## Da dove nasce

Tre cani in due settimane si sono presentati senza essere in agenda. `GH-100` ha trovato **il punto ancora muto** dopo `GH-93` e `GH-98`, e lo ha misurato:

```js
// CalendarKit.jsx:286-290
onChange={(event) => {
  setQuery(event.target.value);
  onSelect('');          // ← azzera la scelta a ogni battuta
```

**Chi scrive il nome del cane, lo vede comparire giusto e non tocca la riga dell'elenco, non ha selezionato niente.** «Salva appuntamento» resta spento, **senza una parola**.

E c'è un dettaglio che rende il difetto invisibile anche a noi: **un elemento HTML `disabled` non riceve il click.** Chi lo preme non ottiene niente, e non resta traccia del tentativo. *«Ho salvato»* è, dal suo punto di vista, la verità.

`GH-100` lo dichiara l'ipotesi più probabile per **Clover**, e compatibile con gli altri due.

## Cosa fare

### 1. Scrivere non cancella quello che hai scelto

Digitare nel selettore **non deve azzerare in silenzio una scelta già fatta**. Come risolverlo lo decidi tu — la scelta resta finché il testo la descrive ancora, oppure si riaggancia da sola quando c'è **una sola corrispondenza esatta**, o altro.

**Ma il criterio è uno: nessuno deve poter avere davanti agli occhi il cane giusto e non averlo scelto.**

Se la tua soluzione riaggancia da sola, **guarda il caso degli omonimi**: 157 pet su 374 condividono il nome, e agganciare quello sbagliato è peggio di non agganciare niente. **Se non è univoco, non si sceglie per conto della persona.**

### 2. Un comando spento dice perché

**Nessun pulsante di salvataggio resta spento senza una parola accanto.** Vale per il modale «Nuovo appuntamento» e per ogni altro salvataggio del calendario.

`GH-100` ha elencato le condizioni che oggi lo disabilitano: pet non scelto **(muta)**, creazione pet ancora aperta (spiegata), capienza esaurita (spiegata), richiesta in corso (solo i puntini). **La prima è quella che conta**, ma la regola vale per tutte.

> **Attenzione al modo.** Un `disabled` vero non riceve il click: se la spiegazione compare solo premendo, non comparirà mai. **La ragione deve essere leggibile prima di premere**, accanto al comando. In alternativa il pulsante resta attivo e premendolo dice cosa manca — **scegli tu e dichiara perché**.

### 3. Mentre salva, il modale non si chiude

Oggi durante il salvataggio **restano attivi** il `Chiudi` in testata, il `Chiudi` nel piede e lo sfondo. Chi chiude non vede l'esito, e l'inserimento **si conclude lo stesso**.

**Finché la richiesta è in volo, il modale resta.** Nessuna chiusura, nessun tocco fuori. Quando finisce — bene o male — **l'esito si legge lì dentro**, come da `GH-93`.

### 4. La riga in un giorno chiuso non sparisce

`GH-100` ha misurato che in un **giorno interamente chiuso**, una riga fuori dalle fasce 9–19 **è nascosta** nella vista settimana. Nella vista giorno compare in «Da collocare».

> È la stessa famiglia del difetto di `GH-55` — *«contato e non disegnato»* — che credevamo chiusa. **Il conteggio e ciò che si vede devono coincidere**, regola del canone del 10/9: qui non coincidono.

**Una lavorazione non sparisce mai da una vista perché il salone quel giorno è chiuso.**

## Cosa non è in questo mandato

**La traccia delle scritture.** `GH-100` propone un identificativo di operazione e un registro append-only, con l'inserimento reso idempotente. È la cosa giusta e **la scrive Cowork**, con il database: qui non si anticipa niente.

**La cascata di cancellazione.** Eliminare un pet elimina i suoi appuntamenti. È una decisione sui dati, non sull'interfaccia: **non toccarla.**

**Il flusso del proprietario**, escluso da `GH-100` come causa: non è ancora aperto ai clienti.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza.**

**Nessuna scelta fatta al posto della persona quando è ambigua.** Con 157 pet omonimi su 374, agganciare il cane sbagliato in silenzio sarebbe **peggio** del difetto che stiamo curando.

**Nessun comportamento nuovo di salvataggio**: stessa funzione, stessi controlli, stesso vincolo del database come ultima parola.

**`Modal.jsx` è condiviso**: se lo tocchi, **misura tutti i suoi usi** e dimostra che gli altri non cambiano.

**Il lato cliente non cambia**: nessun diff sotto `src/apps/customer`.

**Il pallino e il suono di `GH-81` non cambiano.**

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-99`, compresa l'eccezione dichiarata da `GH-87` sul link `Grooming Hub`.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **il caso di Clover, riprodotto**: scrivi il nome, non toccare la riga, premi Salva. **Prima**: cosa succede. **Dopo**: cosa succede. Entrambi con prova a schermo;
- **due pet omonimi**: scrivendo il nome comune, **non viene scelto nessuno dei due** in automatico. Riporta cosa vede l'operatore;
- **ogni condizione che disabilita il salvataggio**: elencale tutte con una ricerca, e per ciascuna **il testo che la spiega**. Nessuna resta muta;
- **la spiegazione si legge senza premere**: dimostralo, dato che un `disabled` non riceve il click;
- **chiusura durante il salvataggio**: i tre modi — testata, piede, sfondo — **tutti e tre bloccati**. Misurali uno per uno;
- **e l'esito arriva comunque**: salvataggio riuscito e salvataggio rifiutato, entrambi letti dentro il modale;
- **giorno chiuso con una sola riga fuori fascia**: **si vede nella settimana**. Prova a schermo prima e dopo;
- **il conteggio e le righe coincidono** in quel giorno: riporta i due numeri;
- **`Modal.jsx`**: tutti gli usi elencati con una ricerca, e la prova che gli altri non cambiano;
- **`src/apps/customer` non ha diff**: dimostralo;
- **le altre pagine staff**: impronte, come in `GH-98`;
- **a 375px e a 1365px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px;
- build verde. **Suite RLS: da non rieseguire**, nessun dato né permesso toccato. Ultima misura viva: `GH-96`, **60 PASS del 19/9**.

## Passo finale — lo guarda Luigi (regola 5)

Sul gestionale:

1. **scrivi il nome di un cane senza toccare la riga e prova a salvare**: capisci cosa manca?
2. **fallo con due cani che si chiamano uguale**: l'app sceglie per te? *(non deve)*
3. **salva e prova a chiudere subito**: ci riesci? E l'esito lo vedi?
4. **e la domanda che conta**: il 26 settembre, questa app avrebbe salvato Clover — o almeno avrebbe detto a Davide che non l'aveva salvato?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-101-il-salvataggio-non-fallisce-in-silenzio-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
