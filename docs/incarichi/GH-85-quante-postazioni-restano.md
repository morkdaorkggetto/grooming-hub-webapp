# Incarico GH-85 — Quante postazioni restano

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun campo nuovo.**
**Segnalato da Davide.** Superficie: `apps/staff/pages/CustomerRequests.jsx`. **Nessuna rotta nuova, nessuna pagina nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

Parole di Davide: **se non ha il calendario sottomano, non riesce a capire se la data e l'ora che sta per proporre siano concedibili.**

Misurato il 12/9 in `CustomerRequests.jsx`:

- **le chiusure le conosce.** Importa `getDateClosure` e `isTimePreferenceClosed`: se propone un lunedì mattina, il modale lo blocca. È quello che ha sistemato `GH-76`;
- **il carico non lo conosce.** `capacity` compare **zero volte** nel file, e la pagina **non carica nessun appuntamento**. Delle tre postazioni non sa niente.

Il risultato non è un doppio appuntamento: in produzione esistono `enforce_appointment_workstation_capacity` e `guard_tenant_workstation_capacity`, e **il database rifiuta**.

> **Il difetto vero è un altro: Davide propone alla cieca e scopre di aver sbagliato dopo, davanti al cliente.** L'app sa già la risposta e non gliela dice.

## Cosa fare

**Il modale di approvazione e quello delle alternative dicono quante postazioni restano, mentre lui sceglie.**

**Non si costruisce niente di nuovo.** Tutto esiste in `shared/tenant/workstationCapacity.js`, ed è quello che usa già il calendario:

```
getAppointmentWindowLoad · isAppointmentCapacityAvailable
findNextCapacityAvailableTime · findFirstCapacityAvailableTime
getAppointmentLoadNotice · getWorkstationCapacity · APPOINTMENT_CAPACITY_MESSAGE
```

**Usa quelle.** Se ti trovi a riscrivere il conteggio, ti sei perso: **non deve nascere un secondo criterio di occupazione.** È la stessa regola che ha retto in `GH-81` per il conteggio delle richieste.

### Nel modale di approvazione

**Scelta la data, si legge il carico di quel giorno** e si mostra, sotto i campi, **quante postazioni sono occupate su quante** nella fascia dell'ora scelta.

**Se l'ora scelta è piena**, non basta dirlo: **si dice qual è il primo momento libero**, e lo si può prendere **con un solo gesto**. `findNextCapacityAvailableTime` fa già questo calcolo per il calendario.

### Nel modale delle alternative

Oggi propone **tre date senza sapere se sono libere**. Ogni riga dice il carico della fascia scelta, con la stessa lingua.

### La lingua

**Esiste già**, in `CalendarKit.jsx`:

> *«**2/3** postazioni occupate»*

**Si riusa quella.** Non inventare una seconda formula per la stessa cosa: il salone legge le due schermate nello stesso pomeriggio.

**Nessun testo che prometta qualcosa che non c'è**: se il carico non è stato letto — errore, o data non ancora scelta — **non si scrive niente**, non si scrive «libero».

### Cosa non si tocca

**Il rifiuto del database resta l'ultima parola.** Questo mandato **non sostituisce** il controllo: lo anticipa. Se il carico letto e il database dovessero dissentire, **vince il database**, e il messaggio d'errore esistente resta.

**Le chiusure restano come sono.** `GH-76` non si tocca.

**Il lato cliente non cambia.** Nessun diff sotto `src/apps/customer`.

**Il calendario non cambia.** Nessun diff in `Calendar.jsx` e `CalendarKit.jsx`, **salvo** l'estrazione di un pezzo condiviso: se serve, dichiarala e dimostra che il calendario rende identico.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun campo nuovo, nessuna rotta nuova.**

**Un solo criterio di occupazione**, quello di `shared/tenant/workstationCapacity.js`.

**Nessuna lettura che rallenti la pagina**: il carico si legge **per la data scelta**, non per tutte le richieste in elenco. Misura quante letture parte ad aprire la pagina e quante a cambiare data.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-84`.

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

- **giorno con posto**: carico riportato per esteso, e il testo esatto mostrato;
- **giorno pieno nella fascia scelta**: il testo esatto, **il primo momento libero indicato**, e la prova che **prenderlo con un gesto compila davvero il campo**;
- **giorno pieno tutto il giorno**: cosa dice. **Non deve mentire e non deve restare muto**;
- **data non ancora scelta**: **nessun testo sul carico**;
- **errore di lettura**: nessun messaggio inventato, **conteggio assente**, **0 errori in console**;
- **giorno chiuso**: il blocco di `GH-76` **funziona ancora**, e non litiga col nuovo testo;
- **il modale delle alternative**: le tre righe, ciascuna col proprio carico. Riporta i testi;
- **lo stesso giorno letto nel calendario e nel modale danno lo stesso numero**: è la controprova che conta, ed è la regola del canone del 10/9 — **il conteggio e ciò che si vede devono coincidere**. Riporta i due valori affiancati;
- **letture**: quante ad aprire la pagina, quante a cambiare data;
- **il database resta l'ultima parola**: forza una condizione in cui il carico letto dice libero e il vincolo rifiuta, e **dimostra che l'errore arriva ancora all'operatore**;
- **`src/apps/customer` non ha diff**: dimostralo;
- **`Calendar.jsx` e `CalendarKit.jsx`**: nessun diff, oppure la parte condivisa dichiarata con le impronte prima e dopo;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio sotto i 44px. **È il caso di Davide**, che guarda le richieste dal telefono. Riporta i punti più lunghi;
- build verde. **Suite RLS: da non rieseguire.** Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Sul telefono**, su una richiesta vera:

1. **scegli un giorno affollato**: capisci quante postazioni restano **senza aprire il calendario**?
2. **scegli un'ora piena**: ti propone il primo posto libero, e lo prendi in un tocco?
3. **e la domanda che conta**: Davide riesce a rispondere al cliente **mentre è al telefono con lui**?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Nota di coda — non è in questo mandato

Luigi aveva ipotizzato il planner affiancato al modale, navigabile di settimana in settimana. **Resta una buona idea per il desktop** ed è depositata come brief per Claude Design: è una questione di impaginato, non di dati. Qui si risponde alla domanda di Davide dove Davide lavora, cioè sul telefono. **Non anticipare niente della vista affiancata.**

## Chiusura

Registro in `docs/consegne/GH-85-quante-postazioni-restano-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
