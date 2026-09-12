# Incarico GH-87 — La conferma è un momento

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Superficie**: `apps/staff/lib/whatsapp.js`, `apps/customer/`, `apps/staff/pages/CustomerRequests.jsx`.
**Trovato analizzando fase per fase il percorso di una prenotazione**, il 12 settembre, con il salone.

**Perimetro**: la migrazione `gh87_customer_alternative_choice` è **già applicata in produzione da Cowork**. Database ammesso **solo il demo**; nessuna migrazione nuova, nessuna colonna nuova, nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

Davide ha mandato la fotografia di un messaggio partito davvero dal salone:

> **«Ciao 3339509149, ti aspettiamo 10/10/2026, 15:00 con Lacky.»**

Da lì abbiamo ripercorso l'intero giro, e il difetto non è il messaggio: è che **il momento in cui il salone conferma non esiste da nessuna parte.**

- **il messaggio** saluta un numero di telefono e detta una data come un modulo;
- **l'app del cliente** registra la conferma **facendo sparire la richiesta**: `useAppointmentRequests` legge solo `pending` e `rejected`, quindi ad approvazione avvenuta la riga esce dall'elenco e al suo posto compare un appuntamento. Nessuno dice che è stato confermato;
- **e se il salone propone delle alternative**, la Home del cliente le elenca e poi dice testualmente **«controlla il messaggio WhatsApp»**. Non c'è nessun modo di accettarne una. Il giro esce dall'app e non ci rientra.

> **Il salone compie un atto e il cliente non lo vede compiere.** Lo deduce da una cosa che sparisce, o lo legge in una lingua che non è la nostra.

## Tre pezzi

### 1. I messaggi WhatsApp parlano italiano

`apps/staff/lib/whatsapp.js` contiene **tre famiglie di messaggi con tre formati di data diversi**: `10/10/2026, 15:00` dal calendario, `venerdì 10 ottobre 2026` dalle alternative, un intervallo `15:00-16:00` dall'approvazione. **Nessuna ha una preposizione.**

**Una sola grammatica delle date**, e la scegli tu dichiarandola: *«venerdì 10 ottobre alle 15:00»* è la direzione, non la dettatura. L'anno si dice solo se serve.

**E non si saluta un numero.** `ownerName` legge `client.owner`, che per **133 clienti su 322** contiene un numero di telefono invece di un nome. **Se il valore non sembra un nome di persona, il messaggio si apre senza nome** — non con «cliente», non col numero. Dichiara la regola che hai usato per decidere cosa non è un nome, e le sue eccezioni.

**È la voce di `GH-83`**, portata fuori dall'app: è il salone che scrive a una persona.

**Non cambia nessun comportamento**: gli stessi messaggi, negli stessi punti, con le stesse chiamate.

### 2. La conferma si vede nell'app

Quando un appuntamento nasce da una richiesta del cliente — `appointments.appointment_source = 'customer'` — **la Home lo dice**, per qualche giorno: è stato **confermato dal salone**, non è comparso da solo.

**Nessuna colonna nuova**: il dato esiste. **Decidi tu per quanti giorni** e dichiara il valore e il motivo.

### 3. L'alternativa si accetta dall'app

**È il pezzo che manca.** La migrazione `gh87_customer_alternative_choice` ha già aggiunto a `appointment_requests` le colonne `chosen_date`, `chosen_time_preference`, `customer_response`, `customer_responded_at`, e la funzione:

```
respond_appointment_request_alternatives(p_request_id, p_response, p_date, p_time_preference)
```

`p_response` vale `'accepted'` o `'declined'`. La funzione verifica da sé che la richiesta sia del chiamante, che sia ancora `pending`, e che la coppia scelta sia **esattamente una** di quelle proposte. **Non inventarti un secondo controllo lato client al posto suo**: puoi validare per dare un messaggio gentile, non per decidere.

**Nell'app del cliente**: le alternative proposte diventano **scegliebili**, una per una. Più **«nessuna di queste mi va bene»**, che è `declined`.

**Lo stato resta `pending`**: l'ora la mette il salone, come sempre. Dopo la scelta il cliente deve capire **che ha risposto e che ora tocca al salone** — e non deve poter scegliere due volte senza accorgersene.

**Nella pagina delle richieste del salone**: una richiesta a cui il cliente **ha risposto** si distingue da una a cui non ha ancora risposto. Se ha accettato, il modale di approvazione **parte dalla data scelta**, non da quella chiesta all'inizio. Se ha rifiutato tutte, si vede.

> **Attenzione a una cosa e dichiarala**: una richiesta con alternative proposte **resta `pending`**, quindi continua a contare nel pallino di `GH-81` anche mentre aspetta il cliente. Non cambiare il conteggio in questo mandato — **misura il comportamento e scrivilo**.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy nuova.** Se ti trovi a scrivere DDL, ti sei perso.

**Il cliente non acquista nessun permesso di scrittura diretta**: l'unico varco è la funzione. La whitelist dei pet resta di tre colonne — `owner_notes`, `coat_preferences`, `owner_photo_url`.

**Il salone continua a mettere l'ora.** Accettare un'alternativa **non crea un appuntamento**.

**Nessuna modifica a `shared/supabase/client.js`.**

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-86`.

**La lingua**: quella di `GH-83`. **Nessuno chiama la persona «cliente».**

## Controprove

Dichiara nel registro. **Testi esatti e misure, non aggettivi.**

- **tutti i messaggi WhatsApp nuovi, per esteso**, uno per uno, con l'input che li ha prodotti;
- **la data ha una sola forma**: dimostra con una ricerca che non restano formati diversi in `whatsapp.js`. Riporta il comando;
- **il saluto con un `owner` che è un numero**: il testo esatto. **Non contiene il numero**;
- **e con un `owner` che è un nome vero**: il nome c'è. Riporta entrambi;
- **la regola** che distingue un nome da un non-nome, e **tre casi limite** che hai deciso;
- **la conferma in Home**: il testo esatto, e la prova che compare **solo** per `appointment_source = 'customer'` — misura anche il caso di un appuntamento creato dal salone, che **non deve dirlo**;
- **accettazione di un'alternativa**: stato prima e dopo, **le quattro colonne lette dal database**, e la prova che **lo stato resta `pending`**;
- **«nessuna mi va bene»**: stesse misure;
- **una coppia non proposta**: la funzione rifiuta. Riporta l'errore e **il testo che vede il cliente**, che non dev'essere tecnico;
- **doppia scelta**: cosa succede se tocca due alternative di seguito. Dichiara il comportamento;
- **il salone vede la risposta**: cosa cambia nella pagina delle richieste, e che **il modale parte dalla data scelta**. Riporta i valori;
- **il pallino di `GH-81`**: quante richieste conta prima e dopo una proposta di alternative. **Misura, non correggere**;
- **`src/apps/staff/pages` diverso da `CustomerRequests.jsx` non ha diff**: impronte come in `GH-81`;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio sotto i 44px;
- build verde. **Suite RLS: da rieseguire, e le sue scritture temporanee sul demo sono autorizzate** — questo mandato aggiunge un varco di scrittura per il cliente. Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

Con il tuo account cliente e il gestionale su un altro dispositivo:

1. **manda una richiesta**, fatti proporre due alternative, **accettane una dal telefono**: il salone la vede?
2. **rileggi il messaggio WhatsApp**: lo manderesti a un cliente vero così com'è?
3. **fatti confermare l'appuntamento**: sull'app si capisce che è stato il salone a confermarlo?
4. **e la domanda che conta**: il giro si chiude **dentro l'app**, o a un certo punto bisogna uscire?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Nota di coda — non è in questo mandato

**Il campo `owner` sporco.** 133 clienti su 322 hanno un numero al posto del nome: qui lo nascondiamo, non lo ripariamo. La bonifica è un lavoro sui dati, con Davide che legge, e resta in coda.

## Chiusura

Registro in `docs/consegne/GH-87-la-conferma-e-un-momento-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
