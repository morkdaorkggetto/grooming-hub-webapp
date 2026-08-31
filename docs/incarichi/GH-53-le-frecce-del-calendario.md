# Incarico GH-53 — Le frecce del calendario puntano al contrario

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 31 agosto 2026
**Origine:** segnalazione di Luigi guardando il calendario in produzione.

> **Forma breve** (regola 4 del canone): una riga di foglio di stile, nessun dato in gioco, nessuna migrazione.

**Perimetro**: root dichiarata nel registro; nessun accesso al database necessario; nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto, misurato

Nel navigatore settimanale del calendario le due frecce **convergono** invece di divergere: a sinistra `→`, a destra `←`. Chi legge i simboli fa il gesto sbagliato.

La causa è in `pages/Calendar.css`:

```css
.gh-calendar-next svg { transform: rotate(180deg); }
```

L'icona `arrow` punta **a destra** per costruzione. In `CalendarNavigation` la classe che ruota è applicata al pulsante **successivo**, che quindi punta a sinistra, mentre il pulsante **precedente** non ha nessuna classe e resta puntato a destra. **La rotazione è sul pulsante sbagliato.**

**Il comportamento invece è corretto**: il pulsante di sinistra toglie sette giorni, quello di destra ne aggiunge sette. Non c'è nessun dato coinvolto — c'è solo che i simboli dicono il contrario di ciò che i pulsanti fanno.

*Per confronto*: il navigatore del report incassi (`WeeklyRevenue`) è fatto correttamente — `gh-icon--back` sta sul pulsante precedente. Sono due componenti distinti e solo uno sbaglia.

## Invarianti

**La freccia del pulsante precedente punta a sinistra, quella del successivo a destra.** Le due divergono.

**Il comportamento non cambia**: precedente resta −7 giorni, successivo +7.

**Nessun altro navigatore cambia aspetto.** Quello del report incassi è già giusto e non va toccato.

**La direzione della freccia smette di essere una decisione del foglio di stile.** È la causa vera: due file diversi ruotano la stessa icona con due meccanismi diversi — `gh-icon--back` in uno, `.gh-calendar-next svg` nell'altro — e uno dei due l'ha applicata al pulsante sbagliato. Finché la direzione si decide nel CSS, l'errore può ripetersi in ogni nuova schermata.

Dopo questo mandato **esiste un modo solo** di ottenere una freccia rivolta a sinistra, e vive **con l'icona**, non nei fogli di stile delle pagine. Come — una `arrow-left` accanto ad `arrow`, un parametro di direzione, o altro — **lo decidi tu**: qui è scritto che il risultato non deve più dipendere da una regola scritta a mano in ogni pagina.

**Entrambi i navigatori usano quel modo**: il calendario e il report incassi. Nessuna rotazione locale sopravvive in nessuno dei due fogli di stile.

**Cercare le altre occorrenze.** **Elenca nel registro tutti i punti in cui l'icona veniva ruotata**, con l'esito di ciascuno: convertito, oppure lasciato con la ragione.

> **Quello che questo mandato NON fa**: unificare i due navigatori in un componente solo. Hanno bisogni diversi — il report ha l'interruttore settimana/mese e il limite di marzo 2026, il calendario ha «vai a data» e la striscia dei giorni. **A essere comune è la freccia, non il navigatore.**

## Controprove

Dichiara nel registro:

- le due frecce del calendario **divergono**, verificate a schermo;
- il pulsante di sinistra porta alla settimana **precedente** e quello di destra alla **successiva**, provati dal gesto;
- il navigatore del report incassi **invariato a vista**, confrontato prima e dopo — cambia il modo, non il risultato;
- **nessuna rotazione dell'icona resta scritta nei fogli di stile delle pagine**: cercata e non trovata;
- elenco dei punti in cui l'icona `arrow` veniva ruotata, con esito per ciascuno;
- build verde; suite RLS invariata — questo mandato non tocca il database.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
