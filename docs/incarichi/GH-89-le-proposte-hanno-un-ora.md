# Incarico GH-89 — Le proposte hanno un'ora

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 13 settembre 2026
**Superficie**: `apps/staff/pages/CustomerRequests.jsx`, `apps/staff/lib/whatsapp.js`, `apps/customer/`.
**Chiesto da Davide.** **Assorbe e sostituisce `GH-85`**, ritirato.

**Perimetro**: la migrazione `gh89_alternatives_with_time` è **già applicata in produzione da Cowork e al demo da Luigi**. Database ammesso **solo il demo**; nessuna migrazione, nessuna colonna nuova; nessun push, merge o deploy.

## Da dove nasce

Parole di Davide, 13 settembre:

> *«quando faccio le proposte, l'app non mi fa proporre l'orario. Non si può fare così: mi chiedi 15 settembre pomeriggio, io potrei dirti (una volta consultato il planner): ok, puoi venire il 17 settembre alle 17:30, il 18 alle 16:00 oppure il 19 alle 10 del mattino. A quel punto, a stretto giro, il cliente conferma **e io prenoto**.»*

Due cose in quella frase, e la seconda è la più importante.

**Le proposte devono portare l'ora.** Oggi il salone può offrire solo «venerdì mattina», e il cliente accetta una mezza giornata.

**A prenotare resta il salone.** *«il cliente conferma e io prenoto»*: il modello non cambia. Non si costruisce nessuna prenotazione automatica.

E c'è un inciso che vale quanto il resto: **«una volta consultato il planner»**. Per proporre le 17:30, Davide deve sapere che alle 17:30 c'è posto. Oggi il modale non glielo dice: `capacity` compare **zero volte** in `CustomerRequests.jsx`, e la pagina non carica nessun appuntamento. **Era `GH-85`, ed è qui dentro** — perché è lo stesso modale.

## Quattro pezzi

### 1. Le alternative si propongono con l'ora

Nel modale delle alternative ogni riga diventa **giorno più ora**. Restano due o tre.

**La fascia si continua a mandare** insieme all'ora: il database la usa per il controllo delle chiusure, e **non può ricavarla da sé** perché gli orari di apertura vivono in `src/shared/tenant/bookingSchedule.js` e non nelle impostazioni. **Calcolala dall'ora** con gli strumenti che ci sono già, non farla scegliere a mano: due campi che possono contraddirsi sono un difetto in attesa.

La funzione `propose_appointment_request_alternatives` **accetta già** l'ora e la valida. Due alternative lo stesso giorno a ore diverse **sono ammesse**.

### 2. Il carico delle postazioni, in tutti e due i modali

Tutto esiste in `shared/tenant/workstationCapacity.js`, ed è quello che usa il calendario:

```
getAppointmentWindowLoad · isAppointmentCapacityAvailable
findNextCapacityAvailableTime · findFirstCapacityAvailableTime
getAppointmentLoadNotice · getWorkstationCapacity
```

**Usa quelle.** Se ti trovi a riscrivere il conteggio, ti sei perso: **non deve nascere un secondo criterio di occupazione**, ed è la stessa regola che ha retto in `GH-81` per il conteggio delle richieste.

**Nel modale delle alternative**: ogni riga dice, per l'ora scelta, **quante postazioni sono occupate su quante**. Se l'ora è piena, si dice **qual è il primo momento libero** e lo si prende con un tocco.

**Nel modale di approvazione**: la stessa cosa per l'ora che l'operatore sta scrivendo.

**La lingua esiste già** in `CalendarKit.jsx` — *«2/3 postazioni occupate»*. **Si riusa quella.**

**Se il carico non è stato letto** — errore, o ora non ancora scelta — **non si scrive niente.** Non si scrive «libero».

### 3. Il cliente sceglie un'ora

Nell'app, le alternative diventano *«giovedì 17 settembre alle 17:30»* invece che *«giovedì 17 settembre, mattina»*. Resta **«nessuna di queste mi va bene»**.

**Cambia la funzione da chiamare.** Non più `respond_appointment_request_alternatives`, ma:

```
respond_appointment_request_slot(p_request_id, p_response, p_date, p_time, p_time_preference)
```

La vecchia **resta viva apposta**, perché l'app pubblicata la chiama: Cowork la toglie dopo il push. **Non toglierla tu.**

La nuova regge anche le proposte già in tabella **senza ora**: confronta l'ora se c'è, la fascia altrimenti. **Misura entrambi i casi.**

**Lo stato resta `pending`.** Accettare **non crea nessun appuntamento**.

### 4. Il salone prenota con un tocco

Quando il cliente ha accettato, il modale di approvazione si apre **con la data e l'ora scelte già dentro** — non più solo la data. All'operatore resta da confermare.

**Ora e durata restano modificabili**: è lui che prenota.

## Il limite da dire, non da risolvere

**Il cliente non può sapere se lo slot è ancora libero quando accetta**, e non deve: un cliente non legge gli appuntamenti degli altri, ed è giusto così.

La rete di sicurezza è il vincolo del database quando il salone prenota. **Non tentare di mostrare la disponibilità al cliente**, e **non tentare di riservare lo slot**: l'opzione a scadenza è stata valutata il 13/9 e scartata — costerebbe l'invariante dell'occupazione per un rischio mai osservato. Se un giorno servirà, sarà un giro suo.

**Ma il rifiuto deve arrivare in italiano.** Se il salone prenota e il vincolo rifiuta perché nel frattempo si è riempito, l'operatore deve capire **cosa è successo e cosa fare**, non leggere un errore tecnico. Dichiara il testo.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy nuova.** Se scrivi DDL, ti sei perso.

**Nessuna prenotazione automatica.** Il salone prenota.

**Un solo criterio di occupazione**, quello di `shared/tenant/workstationCapacity.js`.

**Nessuna lettura che rallenti**: il carico si legge per la data in esame, non per tutte le richieste dell'elenco. Misura le letture all'apertura e al cambio di data.

**Il calendario non cambia**: nessun diff in `Calendar.jsx` e `CalendarKit.jsx`, salvo un'estrazione condivisa dichiarata con le impronte.

**La lingua è quella di `GH-83` e `GH-87`**: nessuno chiama la persona «cliente», e la grammatica delle date è **una sola** — quella già introdotta in `whatsapp.js`.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-88`, **compresa l'eccezione dichiarata da GH-87**: il link `Grooming Hub` sotto i 44px è preesistente e **non si tocca qui**.

## Controprove

Dichiara nel registro. **Numeri e testi esatti.**

- **tre alternative con ore diverse**, di cui **due lo stesso giorno**: proposta accettata, e le tre righe rilette dal database;
- **un'ora non valida** e **una fascia incoerente con l'ora**: cosa succede, e il testo che vede l'operatore;
- **il carico nel modale delle alternative**: giorno con posto, ora piena con il primo momento libero indicato, e la prova che **prenderlo con un tocco compila il campo**;
- **lo stesso nel modale di approvazione**;
- **lo stesso giorno letto nel calendario e nei modali dà lo stesso numero**: riporta i valori affiancati. È la regola del canone del 10/9 — **il conteggio e ciò che si vede devono coincidere**;
- **il cliente accetta un'ora**: le **cinque colonne rilette dal demo** — `chosen_date`, `chosen_time`, `chosen_time_preference`, `customer_response`, `customer_responded_at` — e **lo stato ancora `pending`**;
- **una proposta vecchia senza ora**: il cliente riesce ancora a rispondere. Misuralo;
- **«nessuna mi va bene»** dopo il cambio di funzione;
- **una coppia non proposta**: rifiuto della funzione, e il testo non tecnico mostrato;
- **il modale si apre con data e ora scelte**: riporta i valori;
- **il rifiuto per postazioni piene al momento della prenotazione**: forzalo, e riporta **il testo che legge l'operatore**;
- **il messaggio WhatsApp delle alternative con le ore**, per esteso, e la prova che **la grammatica delle date resta una sola** — ricerca, con il comando;
- **`respond_appointment_request_alternatives` non è più chiamata da nessuna parte** nel codice: ricerca esaustiva;
- **`Calendar.jsx` e `CalendarKit.jsx`**: nessun diff, o l'estrazione dichiarata con impronte;
- **le altre pagine staff**: impronte, come in `GH-81` e `GH-87`;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px. **È il caso di Davide**, che risponde dal telefono;
- build verde. **Suite RLS: da rieseguire, e le sue scritture temporanee sul demo sono autorizzate** — cambia il varco di scrittura del cliente. Ultima misura viva: `GH-87`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

Con il gestionale su un dispositivo e il telefono sull'altro:

1. **proponi tre ore vere** guardando il carico: riesci a sceglierle **senza aprire il calendario**?
2. **accettane una dal telefono**;
3. **prenota dal gestionale**: quanti tocchi servono?
4. **e la domanda che conta**: Davide riesce a fare tutto questo **mentre il cliente è al telefono con lui?**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Nota di coda — non è in questo mandato

**Gli orari di apertura stanno nel codice**, in `bookingSchedule.js`, e non nelle impostazioni del tenant: è per questo che il database non può verificare la coerenza fra l'ora e la fascia. Coda già aperta, non si tocca qui.

## Chiusura

Registro in `docs/consegne/GH-89-le-proposte-hanno-un-ora-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
