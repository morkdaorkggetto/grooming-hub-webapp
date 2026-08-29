# Incarico GH-37 — Le postazioni: la capienza del salone

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Origine:** segnalazione del salone, riportata da Luigi il 29/8.

> Dichiara le invarianti, non la procedura. Il modello lo scegli tu; qui è scritto cosa deve essere vero e dove **non** deve vivere la regola.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun push, merge o deploy. **Database ammesso: solo il demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)**; produzione esclusa. Nessuna rotta nuova.

## Il fatto dal salone

**Il salone ha più postazioni: due oggi, tre entro poche settimane** — stanno aggiungendo una postazione e un addetto. C'è anche un'area di attesa, quindi un cane può aspettare **senza occupare una postazione**: l'unità giusta è la postazione, non la persona.

L'app invece impedisce di collocare **due lavorazioni sovrapposte, punto**. Capienza uno, mai dichiarata da nessuno: è implicita nel fatto che basta *un* conflitto per bloccare.

## Cosa è stato misurato

**Nel codice** (`Calendar.jsx`): `appointmentsOverlap` confronta due intervalli costruiti da `scheduled_at` e `duration_minutes`; il blocco scatta se **esiste almeno un** appuntamento non annullato che si sovrappone. Stessa assunzione in `findNextAvailableTime`, che scorre di 15 minuti finché non trova il vuoto assoluto, e nelle etichette «Conflitto» della vista settimanale.

**Nel database**: nessun vincolo di sovrapposizione. I soli controlli su `appointments` riguardano durata (`> 0` e `<= 480`), stato, sorgente e approvazione. **Verificato leggendo i vincoli della tabella in produzione.**

Quindi oggi **la regola vive solo nel browser**. Con una persona e un dispositivo era tollerabile. Con tre postazioni, un addetto in più e i clienti che chiedono appuntamenti dall'app, due dispositivi possono prenotare lo stesso momento e nulla lo impedisce.

## Invarianti

**1 · In nessun istante il numero di lavorazioni in corso supera le postazioni disponibili.**

Questa è la regola, ed è diversa da quella che sembra. **Non basta contare quanti appuntamenti si sovrappongono al nuovo**: se quattro lavorazioni toccano l'orario scelto ma non sono mai più di due nello stesso istante, con tre postazioni ci si sta. Conta la **contemporaneità massima** dentro l'intervallo del candidato, non il numero di sovrapposizioni.

> **Avvertenza sul modello.** Un vincolo di esclusione su intervalli impone la non-sovrapposizione **a coppie**, cioè capienza uno: da solo non risolve questo problema. Se scegli quella strada serve qualcosa che distingua le postazioni. Se ne scegli un'altra, va bene lo stesso — ma dichiara come garantisci la regola sopra, e provala.

**2 · Il numero di postazioni sta in `tenants.settings`**, accanto a `booking_schedule`. **Mai nel codice.** Due ragioni, entrambe misurate: cambierà da 2 a 3 per questo salone entro poche settimane, e il prossimo salone avrà un numero diverso. **Cambiarlo non deve richiedere una build.**

Valore iniziale: **2**, che è la verità di oggi. Passerà a 3 il giorno in cui la postazione apre — una riga di impostazioni, non un rilascio.

*Consapevolmente non modellato*: la capienza che cambia nel tempo. Un appuntamento fissato oggi per una data successiva all'apertura della terza postazione sarà valutato con la capienza corrente. Con cinque appuntamenti in tutto nello storico, il rischio è teorico; se un giorno diventasse concreto, sarà un mandato suo.

**3 · La regola vale anche fuori dall'interfaccia.** Il browser non è il confine: due dispositivi devono poter chiedere lo stesso orario e **uno solo deve riuscire**. Come lo garantisci lo decidi tu, purché la garanzia non dipenda da chi guarda lo schermo.

**4 · Tutte le superfici che oggi assumono capienza uno si adeguano**: la collocazione manuale, la conferma di una richiesta cliente, le etichette «Conflitto» della vista settimanale e il suggerimento del primo orario libero. Una che resta indietro rende le altre bugiarde.

**5 · Un appuntamento annullato non occupa una postazione.** Vale già oggi e deve continuare a valere.

**6 · Nessun appuntamento esistente diventa invalido.** Ce ne sono cinque, tutti passati. Se l'introduzione della regola ne marcasse anche uno come conflitto, fermati e dichiaralo.

**7 · Il messaggio di conflitto dice la verità nuova.** Oggi recita «Conflitto con {nome}, {ora}». Con più postazioni la ragione non è più «c'è già quel cane»: è **«le postazioni sono tutte occupate»**. Chi legge deve capire perché non può, non con chi.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- con capienza **2**: due lavorazioni sovrapposte accettate, la terza rifiutata;
- con capienza **3**: la terza accettata, la quarta rifiutata — **cambiando solo l'impostazione, senza ricostruire l'app**;
- il caso che distingue le due regole: **quattro lavorazioni che toccano lo stesso candidato ma non sono mai più di due insieme**, con capienza 3, deve essere **accettato**. È la prova che stai contando contemporanei e non sovrapposizioni;
- il suggerimento del primo orario libero propone un orario che rispetta la capienza, non il primo vuoto assoluto;
- **due richieste simultanee** sullo stesso ultimo posto: una sola riesce, e il rifiuto arriva anche senza passare dall'interfaccia;
- un appuntamento annullato **non** occupa;
- i cinque appuntamenti storici restano senza conflitti;
- build verde; suite RLS invariata o estesa se hai toccato le policy.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Lascia nel registro due cose da fare con gli occhi sulla vista settimanale: **collocare tre pet nella stessa fascia** e vedere che il calendario resti leggibile, e **provare il quarto** per leggere il messaggio di rifiuto. La densità visiva a tre lavorazioni contemporanee non l'ha mai vista nessuno: finora era impossibile.

## Coda che questo mandato non chiude

Tre questioni diverse sono arrivate allo stesso posto mancante: i **giorni di chiusura**, le **soglie fedeltà** e ora le **postazioni** vivono tutte in `tenants.settings` e nessuna si può cambiare senza SQL. Serve una schermata di impostazioni del salone. **Non in questo mandato** — ma va scritto che manca.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
