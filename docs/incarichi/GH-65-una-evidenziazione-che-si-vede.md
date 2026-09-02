# Incarico GH-65 — Un'evidenziazione che si vede

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Modello: SOL.** Il precedente giro su questa superficie è stato eseguito con Spark: **il codice regge, le misure no.** Qui serve giudizio visivo, non solo esecuzione.
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna query, nessun dato toccato.**
**Superficie:** la barra e la griglia del calendario. File attesi: `components/CalendarKit.jsx`, `pages/Calendar.css`. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy.

## Da dove nasce

`GH-64` ha costruito la ricerca nel planner. **La struttura è corretta**: lo stato è calcolato, il telefono si confronta sulle sole cifre, la classe `gh-planning-chip--search-match` viene applicata sia agli appuntamenti sia alle richieste.

**Ma provata in produzione da Luigi, la ricerca sembra non trovare niente.**

Misurato leggendo il foglio di stile, tutta l'evidenziazione è questa:

```css
.gh-planning-chip--search-match {
  border-color: color-mix(in srgb, var(--color-primary) 64%, var(--gh-border-35));
}
```

**Un bordo appena più verde del bordo normale** — e per giunta nello stesso colore della barra d'accento che la scheda porta già. È la scelta meno visibile disponibile nella tavolozza.

> **Il meccanismo funziona: è il segnale a essere sotto la soglia di essere notato.** Non è un difetto di logica, è un difetto di misura — la controprova «confronta l'aspetto delle schede prima e durante la ricerca» non è stata eseguita, e sarebbe bastata.

## 1 — L'evidenziazione deve reggere lo sguardo su una settimana intera

**Il criterio non è «è diverso»: è «lo trovo senza cercarlo».** Sette colonne, fino a una decina di schede, un colpo d'occhio.

**Nessun colore nuovo** — il vincolo resta. Ma la tavolozza ha più del bordo: campitura, peso, contorno, una marca esplicita.

**E c'è un argomento già nostro da usare**: *il peso visivo segue l'agibilità, non la categoria*. **Durante una ricerca, la scheda trovata è quella su cui si può agire** — quindi può legittimamente prendere peso. Le altre **non si spengono**: `GH-64` aveva ragione a non filtrare e a non smorzare la settimana, e quella scelta resta.

**Decidi tu la forma.** Dichiara nel registro **perché** quella scelta si vede, con i valori misurati — non «più evidente», ma il contrasto o la differenza di superficie fra scheda trovata e scheda vicina.

## 2 — Il calendarietto si apre e non si chiude più

Provato da Luigi: l'icona apre il selettore, **e il selettore resta aperto e fisso**.

**Causa probabile, da verificare e non da assumere**: il pulsante dell'icona sta **dentro l'etichetta** del campo data, e l'etichetta inoltra il clic al campo che il pulsante ha appena aperto — due aperture in conflitto.

```jsx
<label className="gh-calendar-date-jump">
  <span className="gh-sr-only">Vai a data</span>
  <input ref={dateInputRef} type="date" … />
  <button … onClick={openDatePicker}><Icon name="calendar" /></button>
</label>
```

**Misura la causa prima di correggerla**, e dichiarala. Il fallimento onesto quando `showPicker()` non è disponibile — messa a fuoco del campo più l'avviso «Il browser non consente l'apertura rapida.» — **è giusto e va conservato**.

## 3 — Il campo su mobile va dichiarato

Sotto i 640px la ricerca finisce **in seconda riga**. `GH-64` lo consentiva ma chiedeva di **dichiararlo**, e il registro non lo dice.

**Va scritto nel registro con le misure**, o alla prossima verifica sembrerà un difetto nuovo. Se la seconda riga è la scelta giusta — e probabilmente lo è — resta com'è: **manca il verbale, non la soluzione.**

## Invarianti

**Nessuna migrazione, nessuna query, nessun dato toccato.**

**La ricerca continua a marcare e non filtrare**: non nasconde giorni, fasce, margini o piedi, **non smorza le schede non corrispondenti**, e i conteggi in alto non cambiano mentre si scrive.

**Nessun colore nuovo.** La normalizzazione del telefono sulle sole cifre **non si tocca**: è corretta.

**Restano gli invarianti di `GH-54` → `GH-64`**: grana a mezza giornata, lavorazioni senza ora mai in fascia, margine che non si toglie a settimana vuota, `flex-shrink: 0` e `min-height: 0` sotto i 640px, lessico ammesso solo `lavorati sul momento`, `chi arriva`, `senza ora fissata`, il peso segue l'agibilità, **l'arretramento appartiene al contenitore, non alle lettere**.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta, rimosse a fine sessione. **Numeri, non aggettivi**: «si vede bene» non è una misura.

- **scheda trovata contro scheda vicina non trovata**, nella stessa settimana: riporta i valori misurati di ciò che le distingue — sfondo, bordo, peso — e il rapporto di contrasto dove è testo;
- **una settimana con dieci schede e una sola corrispondenza**: la si individua senza scorrere? Riporta cosa cambia e dove;
- **le schede non corrispondenti sono identiche** a prima della ricerca: confronto misurato, non affermato;
- **conteggi in alto invariati** mentre si scrive;
- **l'icona apre il calendarietto e lo chiude**: descrivi la causa misurata del blocco e cosa l'ha risolta;
- **`showPicker()` assente**: l'avviso e la messa a fuoco funzionano ancora;
- **telefono parziale in formato diverso** — cifre nude contro `+39 333 …` — **trova ancora**: è una non-regressione, non una novità;
- **a 1365, 1024 e 375px**: dove sta il campo, quali bersagli sotto i 44px, nessuno sbordamento;
- build verde. **Suite RLS: da non rieseguire.** Dichiara l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **cerca le ultime quattro cifre di un numero vero**: la scheda salta all'occhio, o la devi cercare sapendo già dov'è?
2. **guarda il resto della settimana mentre cerchi**: è rimasta leggibile?
3. **apri e chiudi il calendarietto tre volte**.

La prima è l'unica che conta: **se devi sapere dov'è per vederla, non è un'evidenziazione.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-65-una-evidenziazione-che-si-vede-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
