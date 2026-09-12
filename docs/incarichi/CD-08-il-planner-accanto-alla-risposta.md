# Brief CD-08 — Il planner accanto alla risposta

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi · **Data:** 12 settembre 2026
**Stato: ⛔ DEPOSITATO — NON ESEGUIBILE SU ORDINE GENERICO.** Si apre solo quando Luigi lo nomina.

## Da dove nasce

Davide, il 12 settembre: quando risponde a una richiesta di prenotazione, **se non ha il calendario sottomano non sa se la data e l'ora che sta per proporre siano concedibili.**

Luigi ha proposto di **spostare il modale a destra e mostrare il planner accanto**, navigabile di settimana in settimana.

## Cosa è già stato deciso senza CD

`GH-85` risponde alla domanda **dove Davide lavora davvero, cioè sul telefono**: il carico delle postazioni compare dentro il modale, con la lingua del planner — «2/3 postazioni occupate» — e il primo momento libero proponibile in un tocco.

**Quella parte non è in discussione qui.** CD-08 non la rifà e non la sostituisce.

## Cosa resta a CD

**La versione desktop**: rispondere a una richiesta **guardando la settimana**, non un numero.

È una questione di impaginato, non di dati: i dati esistono già in `shared/tenant/workstationCapacity.js` e il planner esiste già in `CalendarKit.jsx` — `CalendarPlanningWeek`, `CalendarPlanningDay`, `PlanningBand`, `PlanningMargin`.

Le domande che deve sciogliere il disegno:

- **dove sta la risposta** rispetto alla settimana: accanto, sotto, sovrapposta;
- **cosa succede quando cambia la data nel modale**: la settimana lo segue, o si naviga a mano?
- **e il contrario**: toccando una fascia del planner, la si prende come proposta?
- **cosa si vede sotto una certa larghezza**, dove il planner accanto non ci sta: torna la forma di `GH-85`, e il passaggio dev'essere una cosa sola, non due schermate diverse;
- **il peso visivo**: il planner qui è uno strumento di lettura, non la pagina. Vale l'invariante — **il peso visivo segue l'agibilità, non la categoria**.

## Invarianti che restano

**Nessun colore nuovo.** **La grana resta la mezza giornata.** **I moduli che nascono dalla griglia si accostano, quelli dell'intestazione restano centrati.**

**Un solo criterio di occupazione**, quello di `shared/tenant/workstationCapacity.js`.

## Dipendenza

**Non si apre prima che `GH-85` sia consegnato e visto da Davide.** Se il carico nel modale gli basta, questo brief può restare chiuso — ed è un esito legittimo.
