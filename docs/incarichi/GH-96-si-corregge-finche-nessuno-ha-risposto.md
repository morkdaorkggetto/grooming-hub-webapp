# Incarico GH-96 — Si corregge finché nessuno ha risposto

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 18 settembre 2026
**Superficie**: `apps/customer/`, `apps/staff/lib/database.js`, `apps/staff/pages/CustomerRequests.jsx`.
**Chiesto dal salone in vista del lancio della versione clienti.**

**Perimetro**: la migrazione `gh96_withdraw_pending_request` è **già applicata in produzione da Cowork e al demo da Luigi**. Database ammesso **solo il demo**; nessuna migrazione, nessuna colonna nuova; nessun push, merge o deploy.

## Da dove nasce

Domanda del salone: **se un cliente sbaglia la data, come fa a rimediare?**

Misurato il 18/9: **non può fare niente.** La Home mostra la richiesta in attesa con data, pet e servizio, e **nessun comando**. Se prova a riprenotare lo stesso cane l'app lo ferma e gli offre **«Chiedi di spostarlo su WhatsApp»**. La riparazione esiste, ma **esce dall'app e non rientra** — la stessa cosa che `GH-87` e `GH-91` hanno appena chiuso per le alternative.

## La regola, decisa il 18/9

**Si corregge finché il salone non ha risposto.** Non una soglia di ore: un confine naturale. Appena qualcuno in salone tocca quella richiesta, l'orario è una cosa che esiste per due persone e non si disfa da soli.

**Dopo la conferma non si disdice dall'app: si scrive al salone.** La decisione nasce dai numeri di produzione — **9 assenze e 10 annullamenti su 278 appuntamenti**. Rendere la disdetta costosa o scomoda sposterebbe quei dieci nella colonna delle nove, dove il posto resta vuoto davvero. **Chi avvisa va agevolato, non scoraggiato.**

**Il punteggio `no_show` non si tocca e non si automatizza.** Resta quello che è: lo mette il salone, a mano, a chi non si è presentato.

## Tre pezzi

### 1. Il proprietario ritira la richiesta

Finché è in attesa, la scheda in Home ha un comando per **ritirarla**. La funzione esiste:

```
withdraw_appointment_request(p_request_id)
```

Verifica da sé che sia la propria, che sia ancora `pending` e che non ci sia già un appuntamento. **Non replicare quei controlli per decidere**: puoi validare per dare un messaggio gentile, non per autorizzare.

**Chiedi conferma prima**: è un gesto che si fa con il pollice, e va distinto dal tocco per sbaglio. **Una sola conferma**, non due.

**Dopo il ritiro può riprenotare subito**: il blocco del doppione cade da sé, perché una richiesta ritirata non è più aperta. **Verificalo**, non darlo per scontato — e **portacelo**: chi ritira una data sbagliata vuole rifarla giusta, non tornare alla Home.

### 2. Le due frasi

**Mentre la richiesta è in attesa**, la scheda dice che c'è ancora tempo. Direzione, non dettatura — questa è la sostanza:

> *Puoi ancora correggerla: appena ti rispondiamo, l'orario è fissato.*

**Dopo la conferma**, sulla scheda dell'appuntamento:

> *Se non riesci più a venire, scrivici il prima possibile: proviamo a dare il posto a qualcun altro.*

con il collegamento WhatsApp del salone **che esiste già** in `Home.jsx`, e il messaggio già scritto.

**La seconda frase è una richiesta di collaborazione, non un avviso di penale.** Nessun testo deve minacciare conseguenze: il tono è quello di `GH-83`, è il salone che parla a una persona. **Se ti viene da scrivere «altrimenti», riscrivila.**

**Oggi quella via è raggiungibile solo per caso** — provando a riprenotare. Deve stare dove sta l'appuntamento.

### 3. Il salone lo vede

Una richiesta ritirata **esce dalla lista di ciò che tocca al salone** — lo stato non è più `pending`, quindi la classificazione di `GH-90` la ignora da sé. **Non toccare quel criterio.**

Ma **non deve sparire in silenzio**: se Roby ha appena proposto tre orari e il cliente si ritira, deve leggerlo, non trovare l'elenco più corto senza sapere perché. **Per qualche giorno la richiesta ritirata resta visibile in `/requests`**, marcata, con quando è stata ritirata — e **fuori dai conteggi**.

**Quanti giorni lo decidi tu e lo dichiari**, in un posto solo, come il `72` di `GH-87` e il `48` di `GH-91`.

**Il pallino e il suono non cambiano.** Un ritiro non suona: toglie lavoro, non lo aggiunge.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy nuova, nessuna rotta.**

**Nessuna disdetta dall'app per un appuntamento confermato.** Se ti trovi a chiamare `set_staff_appointment_status` o a scrivere su `appointments` dal lato cliente, ti sei perso.

**`no_show_score` e `is_blacklisted` non si toccano**, né in lettura per decidere qualcosa, né in scrittura.

**Un solo criterio di conteggio e una sola classificazione**: quelli di `GH-90`.

**Il cliente non acquista nessun permesso di scrittura diretta**: l'unico varco è la funzione.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-95`, compresa l'eccezione dichiarata da `GH-87` sul link `Grooming Hub`.

## Controprove

Dichiara nel registro. **Testi esatti e misure.**

- **tutti i testi nuovi, per esteso**, dei due lati. **Nessuno minaccia niente**: dichiara come l'hai verificato;
- **ritiro di una richiesta in attesa**: stato e `withdrawn_at` riletti **dal demo**, e la prova che l'appuntamento non esiste;
- **la conferma prima del ritiro**: una sola, e annullandola **non parte nessuna chiamata**;
- **ritiro di una richiesta già gestita**: la funzione rifiuta. Riporta il codice e **il testo non tecnico** che vede la persona;
- **dopo il ritiro si può riprenotare lo stesso pet**: misuralo, e riporta dove si trova la persona subito dopo;
- **la frase dopo la conferma**: dove appare, e che il collegamento porti al numero letto dalle impostazioni;
- **il salone vede il ritiro**: cosa compare in `/requests`, per quanti giorni, e **che non entri in nessun conteggio**. Riporta pallino e riquadro dashboard prima e dopo un ritiro: **devono calare, non salire**;
- **zero toni** su un ritiro;
- **la classificazione di `GH-90` non è stata modificata**: impronta di `getAppointmentRequestStaffAction` e `summarizePendingAppointmentRequests` prima e dopo;
- **il numero di giorni**: dove sta. Un posto solo, con il percorso del file;
- **`no_show_score` e `is_blacklisted`**: ricerca esaustiva che dimostri che il lato cliente non li legge né li scrive. Comando riportato;
- **le altre pagine staff e customer**: impronte, come in `GH-93`;
- **a 375px**: nessuno sbordamento, nessun troncamento, nessun bersaglio nuovo sotto i 44px;
- build verde. **Suite RLS: da rieseguire, e le sue scritture temporanee sul demo sono autorizzate** — nasce un varco di scrittura nuovo per il cliente. Ultima misura viva: `GH-91`, **60 PASS del 13/9**.

## Passo finale — lo guarda Luigi (regola 5)

Dal telefono, con il gestionale aperto sull'altro dispositivo:

1. **manda una richiesta con la data sbagliata e ritirala**: quanti tocchi servono, e dove ti ritrovi?
2. **rifalla giusta subito dopo**: l'app ti lascia fare?
3. **fatti confermare un appuntamento e cerca come disdire**: trovi la via senza cercarla?
4. **e la domanda che conta**: quella frase ti farebbe scrivere al salone, o ti farebbe rimandare?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-96-si-corregge-finche-nessuno-ha-risposto-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
