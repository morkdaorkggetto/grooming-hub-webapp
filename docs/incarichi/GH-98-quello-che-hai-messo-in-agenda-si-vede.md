# Incarico GH-98 — Quello che hai messo in agenda si vede

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 23 settembre 2026
**Superficie**: `apps/staff/pages/Calendar.jsx`, `apps/staff/components/CalendarKit.jsx`.
**Nasce da due cani presentatisi in salone senza essere in agenda**, martedì 22 settembre.

**Perimetro**: nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta. Database ammesso **solo il demo**; nessun push, merge o deploy.

## Da dove nasce

Davide ha registrato due appuntamenti **il 16 settembre, dal Mac del salone**. Il **22** i due cani si sono presentati e **non erano nel planner**.

Ricostruito dai dati di produzione — **due guasti diversi, una sola radice**:

**`Snoopy`** — appuntamento creato il **16 alle 14:14**, datato **15 settembre**: il giorno prima. È ancora `scheduled`, mai completato, mai annullato. **Un appuntamento nel passato è invisibile**: il planner apre sulla settimana corrente e nessuno torna indietro. In produzione ce ne sono **nove** così.

**`fara`** — il pet è stato **creato il 16 alle 18:11**, l'appuntamento **mai**. Su 78 pet creati a settembre, in **74** l'appuntamento nasce pochi secondi dopo il pet: è la regola, e questa è l'eccezione. Verificato che in quel momento le postazioni del 22 alle 15:00 erano **libere**: non è stato il vincolo a rifiutare. **È rimasto a metà, e niente l'ha detto.**

Misurato il 23/9 nel modale «Nuovo appuntamento»:

```jsx
// Calendar.jsx:975 — nessun min
<Field label="Data" type="date" value={manualForm.date} … required />
```

Il modale di approvazione delle richieste ha `min={minDate}`. **Quello con cui il salone prenota tutti i giorni non ha nessun limite inferiore.**

> **La radice è una sola: il gestionale non dice mai all'operatore cosa è finito davvero in agenda.** Salvi, la finestra si chiude, e se la data era un'altra settimana il planner dietro non te lo mostra — perché mostra la tua, non quella dell'appuntamento.

**Attenzione a non curare la cosa sbagliata**: `GH-93` ha già reso visibili gli errori dentro i modali, dal 19 settembre. Questo mandato non rifà quello.

## Quattro pezzi

### 1. Una data passata si dichiara, non si vieta

**Non bloccarla.** Misurato: dal 1° settembre ci sono **dieci** appuntamenti creati dopo la propria ora, quasi tutti di una o due ore — è il salone che registra chi è arrivato al banco, ed è una pratica legittima.

**Ma distinguere i due casi**: qualche ora fa oggi è normale; **un giorno diverso da oggi va detto**, chiaramente, accanto al campo, prima di salvare. Le parole le scegli tu e le dichiari.

### 2. Il salvataggio dice cosa ha salvato

Dopo aver salvato, la conferma **nomina la data per esteso**: non «appuntamento creato», ma il giorno, il mese e l'ora. Una data sbagliata si vede **mentre il cliente è ancora davanti**.

**Vale per il salvataggio da qualunque modale del calendario** che crei o sposti un appuntamento. Trovali con una ricerca ed elencali.

**La lingua è quella già introdotta in `whatsapp.js` da `GH-87`**: una sola grammatica delle date. Se esiste un formattatore condiviso riusalo; **se sta solo in `whatsapp.js`, non importarlo da lì** — dichiara cosa hai fatto e perché.

### 3. I fantasmi hanno una coda

Gli appuntamenti ancora **«programmati» con la data passata** sono una coda di lavoro: o sono stati fatti e nessuno li ha chiusi, o sono finiti sulla data sbagliata. **Oggi sono nove.**

Vanno **visti**, in un posto che il salone guarda: quanti sono e quali. **Dove metterli lo decidi tu e lo dichiari** — ma non dentro il pallino delle richieste clienti, che ha un significato suo e non si allarga (regola di `GH-90`).

**Nessuna azione automatica**: non si chiudono, non si annullano, non si spostano da soli. Si mostrano.

> Era già in coda nel diario dai tempi di `GH-41`, messa da parte perché il problema di allora era un altro. Adesso il problema è questo.

**I nove non sono tutti uguali, e la coda deve dirlo.** Misurato il 23/9: **due hanno una visita registrata proprio quel giorno** — il cane è venuto, il lavoro è stato fatto, nessuno ha chiuso la riga. **Sette non ce l'hanno**, né quel giorno né nei tre giorni intorno: quei cani non sono venuti.

Sono due cose diverse e richiedono due gesti diversi — uno si chiude, l'altro è un'assenza o una data sbagliata. **Distinguili nella coda**: il dato c'è già, sono le visite del pet a quella data. **Non decidere tu quale sia quale oltre a questo**, e non proporre l'azione: la scelta è di Davide.

**Non aggiungere una lettura per riga.** Se distinguere costa una query per ogni fantasma, **fermati e dichiaralo**: meglio la coda senza distinzione che una pagina che rallenta.

### 4. Un pet creato e lasciato a metà non passa in silenzio

Chi crea un pet dentro «Nuovo appuntamento» e **chiude senza salvare l'appuntamento** si lascia dietro un cane senza prenotazione — è il caso di `fara`.

**Chiudendo il modale in quello stato, dillo.** Una frase, non un blocco: il pet resta creato, ed è giusto che resti. **Non inventare un annullamento del pet**: cancellare dati per una finestra chiusa è peggio del difetto.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza.**

**Nessuna data viene vietata.** Il salone deve poter registrare chi è arrivato un'ora fa, e anche ieri se serve.

**Nessuna azione automatica sugli appuntamenti esistenti.**

**Il pallino e il suono non cambiano**, né cosa contano né come suonano. La classificazione di `GH-90` non si tocca: impronte prima e dopo.

**Un solo criterio di occupazione**, quello di `shared/tenant/workstationCapacity.js`.

**Il lato cliente non cambia**: nessun diff sotto `src/apps/customer`.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-97`, compresa l'eccezione dichiarata da `GH-87` sul link `Grooming Hub`.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **i testi nuovi, per esteso**, uno per uno;
- **data di oggi qualche ora fa**: cosa si vede. **Il salvataggio resta possibile**;
- **data di un giorno passato**: l'avviso compare, il salvataggio **resta possibile**. Riporta il testo;
- **data futura normale**: nessun avviso;
- **la conferma dopo il salvataggio**: il testo esatto, con la data per esteso, in tre casi — oggi, settimana prossima, mese prossimo;
- **tutti i punti di salvataggio del calendario**: elencali con una ricerca, comando riportato, e dichiara per ciascuno se la conferma nomina la data;
- **la coda dei fantasmi**: quanti ne conta sul demo, e la prova che il numero **coincide con la stessa interrogazione fatta in SQL**. È la regola del canone del 10/9 — il conteggio e ciò che si vede devono coincidere;
- **la distinzione fra i due tipi**: un fantasma con la visita di quel giorno e uno senza, entrambi a schermo, con i testi esatti. **E le letture: quante all'apertura della pagina, con la coda vuota e con la coda piena.** Se cresce con il numero di fantasmi, fermati;
- **i fantasmi non entrano nel pallino né nei conteggi delle richieste**: misura prima e dopo;
- **il pet lasciato a metà**: chiudendo il modale dopo aver creato il pet senza salvare, **la frase compare**; chiudendo senza aver creato niente, **non compare**. Riporta entrambi;
- **il pet non viene cancellato**: verificalo sul demo, riletto dal database;
- **`GH-90` intatta**: impronte di `getAppointmentRequestStaffAction` e `summarizePendingAppointmentRequests`;
- **`src/apps/customer` non ha diff**: dimostralo;
- **le altre pagine staff**: impronte, come in `GH-93` e `GH-97`;
- **a 375px e a 1365px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px. **Il Mac del salone è il caso normale qui**, ma il telefono resta;
- build verde. **Suite RLS: da non rieseguire**, nessun permesso toccato. Ultima misura viva: `GH-96`, **60 PASS del 19/9**.

## Passo finale — lo guarda Luigi (regola 5)

Sul gestionale, rifacendo quello che ha fatto Davide il 16:

1. **prenota mettendo una data della settimana scorsa**: te ne accorgi prima di salvare?
2. **salva un appuntamento per la settimana prossima**: la conferma ti dice quale giorno, o devi andare a controllare?
3. **crea un pet dentro il modale e chiudi senza salvare**: l'app ti avverte?
4. **e la domanda che conta**: il 16 settembre, questa app avrebbe fermato Davide?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Nota di coda — non è in questo mandato

**I nove fantasmi esistenti vanno guardati da Davide**, non chiusi d'ufficio: alcuni sono di marzo e aprile. Quando la coda esisterà, sarà lui a dire quali erano lavorazioni fatte e mai chiuse e quali date sbagliate.

## Chiusura

Registro in `docs/consegne/GH-98-quello-che-hai-messo-in-agenda-si-vede-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
