# Incarico GH-103 — Prima degli inviti

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 settembre 2026
**Nasce da `GH-102`**: registro `docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md`, sezione «Prima del lancio: lista consolidata per Cowork».

**Perimetro**: codice applicativo e **file** di migrazione. Database ammesso **solo il demo** `qttpinkslhenxrsbhhhg`: per questo mandato sei autorizzato ad **applicarvi le tue migrazioni** e a creare fixture sintetiche, con ripristino a zero. **La produzione non la tocchi**: la applica Cowork, atto per atto, con l'autorizzazione di Luigi. Nessun push, merge o deploy.

## Da dove nasce

`GH-102` ha risposto alla domanda: **nessun cliente vede i dati di un altro**, salvo chi ha in mano una chiave — un invito inoltrato, oppure l'indirizzo esatto di una foto. Ha però lasciato un **NO al via libera**, e un elenco di quattro cose da chiudere prima di invitare trecentoventi persone.

Questo mandato le chiude **in un giro solo**, in ordine di gravità.

Misure di Cowork in **produzione**, 27/9:

| Cosa | Misura |
|---|---|
| visite con importo | **670 su 670** |
| visite con sconto | **0** |
| servizi con prezzo | **2 su 2** |
| pet con foto di riconoscimento (`pets.photo_url`) | **44**, tutte nel bucket `client-photos` |
| oggetti in `client-photos` | **53** (44 referenziati, **9 orfani**) |
| oggetti in `pet-avatars` | **5** (2 ritratti del proprietario, 3 altri — probabilmente immagini promozioni) |
| foto di visita | **0** |
| appuntamenti creati direttamente da un cliente | **2**, entrambi approvati; il codice cliente oggi **non scrive** su `appointments` |
| funzioni del database che leggono o scrivono importi | **una sola**: `complete_appointment_with_visit` |

## Cosa fare

### 1. La foto di riconoscimento non si apre più con l'indirizzo

La foto di riconoscimento (`pets.photo_url`) **non esce dal gestionale**: decisione del 12/9. Oggi è in un bucket **pubblico**: chi ha l'indirizzo la apre, e gli indirizzi di 42 pet sono stati esposti sul cartoncino pubblico fino al 12/9 (`GH-77`).

**La strada che ti indico**, perché è la più piccola che chiude davvero: **`client-photos` diventa privato.** Contiene solo foto di riconoscimento e 9 orfani. Nessun oggetto da spostare, nessun indirizzo da riscrivere: `pets.photo_url` resta com'è, e l'app ne ricava il percorso — come già fa `publicStoragePath` — per chiedere un **URL firmato breve**.

Dopo la correzione:

- lo staff vede le foto di riconoscimento **ovunque le vede oggi** — scheda, calendario, elenchi — tramite URL firmati. Se in una vista ne servono molte insieme, **chiedile in blocco**, non una per una;
- chi possiede un vecchio indirizzo pubblico **non apre più niente**. Nessun cliente, anonimo o staff di un altro salone;
- il caricamento e la rimozione dello staff funzionano come oggi.

**`pet-avatars` resta pubblico.** Contiene i ritratti del proprietario e le foto di visita, che il proprietario **condivide di proposito** (`Pet.jsx`, «dopo il bagno»), e le immagini delle promozioni. **Non va toccato.**

**L'ordine conta, perché il salone lavora ogni giorno**: prima l'app che usa URL firmati — funzionano anche su un bucket pubblico, grazie alla policy `Client photos staff select` —, poi il bucket che diventa privato. **Scrivi il bucket privato come migrazione a sé**, da applicare **dopo** il deploy.

**I 9 orfani non si cancellano.** Elencali nel registro, solo i percorsi: decide Luigi.

### 2. Importi, sconti e prezzi li legge solo il salone

`GH-102` ha misurato che un cliente con la sua sessione normale legge `visits.cost`, `visits.discount_percent` e `services.price_cents`. **Le policy limitano le righe, non le colonne.**

Luigi ha deciso di seguire **lo schema già usato per le note interne** (`20260828120104_gh32_staff_internal_notes.sql`): i dati economici escono dalle righe che il cliente può leggere ed entrano in relazioni **solo staff**, con RLS. Revocare le colonne a `authenticated` **non si può**: staff e clienti condividono quel ruolo, e si romperebbe il gestionale.

**Il vincolo che non si discute: in nessun momento un salvataggio del salone deve fallire.** Fra una migrazione e il deploy passano minuti, a volte ore, e il salone lavora. Un salvataggio che fallisce in silenzio è esattamente **la causa dei cani fantasma** che abbiamo appena curato (`GH-100`, `GH-101`).

Quindi **due atti**, come in ogni cambio di schema sotto un'app viva:

- **primo atto, prima del deploy — solo aggiunte.** Nuove relazioni, copia verificata di tutti i valori, e un modo per cui **la vecchia app continua a funzionare**: se scrive ancora sulle colonne vecchie, il valore arriva anche nel posto nuovo. La scelta del meccanismo è tua; dichiarala;
- **secondo atto, dopo il deploy — la chiusura.** Le colonne economiche escono da `visits` e da `services`. Solo allora il cliente non le legge più.

Adatta **tutto quello che legge o scrive importi**: la funzione `complete_appointment_with_visit`, il modulo visita, l'aggiunta visita, gli incassi settimanali, il catalogo servizi e la scheda cliente. **Censiscili con una ricerca**, non a memoria. `GH-102` ne ha trovati otto file; verifica tu.

**Prima e dopo, i conti devono tornare al centesimo**: somma degli importi, conteggio, e il totale degli incassi di una settimana di prova letto nella pagina.

### 3. L'invito dice che è personale, e il salone vede chi è entrato

Il link d'invito **resta una chiave al portatore**: è un rischio accettato da Luigi (`GH-102`, emendamento 2). Se ne riduce il danno.

**Il messaggio WhatsApp** (`getCustomerInviteWhatsAppMessage`, in `apps/staff/lib/whatsapp.js`) aggiunge una frase breve che dice che **il link è personale e non va inoltrato**. Tono del messaggio di oggi, nessuna minaccia.

**Il salone vede chi si è collegato.** Oggi lo vede **solo aprendo la scheda**: l'email dell'account e il pulsante «Scollega account» (`ClientDetail.jsx`). Non basta, perché nessuno apre trecento schede per controllare. Serve che Davide possa vedere **da un posto solo** gli account collegati di recente — con cane, email e data — così da accorgersi di un collegamento che non si aspettava, e da lì arrivare allo scollegamento che esiste già.

**Scegli la forma più piccola** che lo permette dentro le pagine che ci sono: un filtro, un elenco, un segno. **Se ti serve una superficie nuova, fermati e proponila**: la compone Claude Design, non questo mandato.

### 4. Il cliente non legge mai un messaggio grezzo del database

`Redeem.jsx`, riga 68: la vista d'errore generica stampa `error` così com'è arriva dal database. È da lì che `GH-102` ha visto uscire **il telefono di un altro cliente**: corretto nella funzione il 27/9, ma **la porta è ancora aperta** per il prossimo messaggio.

**La regola: su ogni superficie che vede il cliente, il testo lo sceglie l'app, a partire da un codice.** Mai il testo del database, mai quello di Supabase Auth in inglese. Codice sconosciuto → frase generica, e il dettaglio va solo nella console.

Oggi in `src/apps/customer` passano testi grezzi almeno in `Redeem.jsx`, `Pet.jsx`, `Book.jsx`, `Login.jsx`. Vale anche per la rotta legacy `/portal/invite` (`CustomerInvite.jsx`) e per il cartoncino pubblico. **Censiscile con una ricerca.**

Nello stesso giro, `Redeem.jsx` riconosce il nuovo codice **`GH_INVITE_ASSIGNED_ELSEWHERE`**, che arriva nel campo `details` e non nel messaggio: la persona legge che l'invito è già collegato a un altro account e che deve contattare il salone.

### 5. La vecchia porta sugli appuntamenti si chiude

`GH-102` ha trovato ancora aperte le policy `appointments_customer_request_insert` e `appointments_customer_request_update`: un cliente può creare un appuntamento in attesa, e modificarne le note, **scrivendo direttamente** sulla tabella, di fianco al percorso vero delle richieste. Non è stata trovata una fuga, ma **è una seconda strada che nessuno usa più**, e le strade che nessuno usa non le controlla nessuno.

**Chiudila**, dopo aver dimostrato con una ricerca che nessun codice la usa, e che le funzioni che trasformano una richiesta in appuntamento non ne hanno bisogno.

## Cosa non è in questo mandato

**La verifica via SMS** degli inviti: è la cura vera, e arriverà quando si sceglierà un fornitore di messaggi.

**Il dominio e l'invio delle email**, **`GH-99`** (sapere quale versione dell'app è aperta), **la traccia delle scritture** proposta da `GH-100`, **la cascata di cancellazione**: restano aperti, e non si anticipano qui.

**Le foto di visita e i ritratti** in `pet-avatars`: restano pubblici **per scelta**, perché il proprietario li condivide.

## Invarianti

**Nessun salvataggio del salone fallisce in nessun momento del passaggio** — né fra un atto e il deploy, né fra il deploy e il secondo atto.

**Nessun valore economico si perde o cambia**: le somme prima e dopo coincidono.

**Nessun oggetto di Storage viene cancellato.**

**La whitelist delle scritture del cliente sui pet resta esattamente di tre colonne**: `owner_notes`, `coat_preferences`, `owner_photo_url`.

**Il cartoncino pubblico non mostra niente di più di oggi.**

**Nessun colore nuovo, nessuna geometria toccata** fuori da quanto serve al punto 3; restano gli invarianti di `GH-54` → `GH-101`.

**Il pallino e il suono di `GH-81` non cambiano.**

**Prima di tutto, le impronte**: la metà di produzione l'ha misurata Cowork ed è in `GH-103-impronte-produzione.md`, insieme alla query. Eseguila identica sul demo e confronta **prima di cominciare**. Se non coincidono, fermati e scrivilo: è la regola nata con `GH-102`.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **foto di riconoscimento**: dopo il bucket privato, un anonimo, Luca e uno staff di un altro salone **non aprono** la foto di Mario, **nemmeno avendone l'indirizzo**. Lo staff del salone la vede in scheda, in calendario e negli elenchi. Carica e togli: entrambi funzionano;
- **un vecchio indirizzo pubblico**: prima si apre, dopo no. Dichiara quanto resta in cache e da cosa lo misuri;
- **`pet-avatars`**: ritratto del proprietario, foto di visita e immagine di una promozione **si aprono ancora** dall'indirizzo pubblico;
- **dati economici**: Mario chiede esplicitamente importo, sconto e prezzo, e chiede `*`: **non riceve nessun valore economico**. Lo staff li legge e li scrive come prima;
- **i conti**: somma e conteggio degli importi prima e dopo, **identici**; totale di una settimana negli incassi, identico;
- **la vecchia app sopra il primo atto**: salva una visita con importo usando il codice di **prima** del tuo diff, e dimostra che il valore arriva nel posto nuovo;
- **messaggio d'invito**: il testo esatto, prima e dopo;
- **gli ultimi collegamenti**: cosa vede Davide, con una fixture collegata oggi;
- **testi grezzi**: l'elenco completo dei punti censiti, e per ciascuno il testo che la persona legge **dopo**. Provocane almeno tre, incluso `GH_INVITE_ASSIGNED_ELSEWHERE`;
- **vecchia porta sugli appuntamenti**: Mario tenta l'inserimento e la modifica diretti → rifiutati. Una richiesta fatta dal percorso vero, accettata dal salone, **diventa appuntamento come prima**;
- **suite RLS**: aggiornala. Oggi una prova si aspetta **HTTP 200 pubblico su entrambi i bucket**: per `client-photos` non deve più. Aggiungi le prove dei punti 1, 2 e 5. Riporta PASS, FAIL e SKIP;
- **a 375px e a 1365px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px;
- build verde;
- **ripristino del demo a zero**: stessi conteggi dell'inizio.

## Cosa consegnare a Cowork

Nel registro, **in cima**:

1. **l'ordine esatto degli atti in produzione**, con il nome di ogni file e il momento in cui va applicato rispetto al deploy di Luigi. Per esempio: *atto A prima del deploy · deploy · atto B dopo il deploy · atto C dopo la verifica delle foto*;
2. per ogni atto, **la query di verifica** che Cowork esegue in produzione subito dopo, con il risultato atteso;
3. **cosa succede se un atto fallisce a metà**, e come si torna indietro.

## Passo finale — lo guarda Luigi (regola 5)

Sul gestionale e sull'app cliente, dopo il deploy:

1. **apri la scheda di un cane con la foto di riconoscimento**: la vedi come prima?
2. **copia l'indirizzo di quella foto e aprilo in una finestra anonima**: si apre? *(non deve)*
3. **registra una visita con importo**, poi guarda gli incassi della settimana: tornano?
4. **genera un invito** e leggi il messaggio: si capisce che è personale, senza spaventare?
5. **e la domanda che conta**: se domani qualcuno si collegasse alla scheda sbagliata, Davide se ne accorgerebbe?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-103-prima-degli-inviti-esito.md`, committato col codice e con i file di migrazione. Niente push, niente merge, niente deploy.
