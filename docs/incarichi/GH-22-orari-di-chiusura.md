# Incarico GH-22 — Gli orari di chiusura del salone

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 agosto 2026
**Prerequisito:** `GH-21` consegnato. Se non lo è, fermarsi e dirlo — questo mandato tocca il calendario, che GH-21 non modifica ma che conviene non incrociare.

> Dichiara le invarianti, non la procedura. Cosa deve essere vero alla fine è scritto; il metodo lo scegli tu.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push. **Migration ammessa** — una sola, additiva. Database ammesso: **solo il demo**; produzione e progetto temporaneo vietati.

## Il fatto

Il salone è chiuso **la domenica** e **il lunedì mattina** (fonte: Davide e Roby via Luigi, 27 agosto).

Verifica Cowork su 464 visite di un anno: **domenica zero visite, confermato.** Il lunedì lavorano — 71 visite — quindi la chiusura riguarda davvero solo la mattina; questo però **non è verificabile dai dati**, perché `visits.date` non contiene l'ora. Il dato è coerente con la dichiarazione, non la dimostra.

*(Nota: fra i 17 appuntamenti storici ne esiste uno di domenica alle 07:00 e altri prima dell'apertura dichiarata. Sono residui del periodo in cui il calendario veniva provato, non testimonianze d'uso: non usarli come fonte.)*

## Il problema che risolve

Oggi il wizard clienti accetta **qualunque data desiderata**. Un cliente può chiedere una domenica, e il salone è costretto a rispondere di no — producendo il messaggio più delicato del prodotto per una richiesta che l'applicazione non avrebbe dovuto accogliere. Lo stesso vale per la fascia «Mattina» scelta di lunedì.

E nel calendario un giorno di chiusura oggi appare identico a un giorno vuoto: «nessuna richiesta, nessuna lavorazione» di domenica non è vero, è **fuorviante**.

## Il vincolo che governa la soluzione

**Gli orari non vanno nel codice.** Grooming Hub sta diventando un prodotto per più saloni e il secondo avrà giorni diversi: una chiusura scritta in una costante sarebbe un difetto strutturale che si scopre al primo cliente nuovo, cioè nel momento peggiore.

Devono vivere nella **configurazione del tenant**. Oggi non esiste: `tenants.settings` era annotato come sede prevista per il numero WhatsApp e i periodi di piena, ma non è mai stato costruito. Questo mandato lo introduce, dimensionandolo per ciò che serve adesso — non per tutto ciò che potrebbe servire un giorno.

## Invarianti — cosa deve essere vero alla fine

**Configurazione.** Esiste un posto, per tenant, dove sono dichiarati i giorni di chiusura completa e le fasce di chiusura parziale. Il tenant pilota vi trova i propri: domenica chiusa, lunedì mattina chiuso. Una migration sola, additiva, con valori di partenza per il pilota. Nessun dato inventato per altri tenant.

Il modello deve reggere **la chiusura di una fascia, non solo di un giorno intero** — perché il caso reale è già così — e restare leggibile da chi un domani dovrà modificarlo senza rileggere il codice.

**Wizard clienti.** Non offre ciò che non esiste: i giorni di chiusura completa non sono selezionabili, e la fascia chiusa non è scegliibile nei giorni in cui è chiusa. **La forma della rinuncia conta**: un giorno non disponibile va mostrato come non disponibile, non semplicemente omesso — sparire senza spiegazione fa credere a un difetto. Il tono resta quello del wizard, che avvisa e non sgrida.

**Calendario staff.** Un giorno di chiusura si legge come chiuso, e si distingue dal giorno aperto senza contenuto. Se una richiesta o una lavorazione dovesse comunque cadere in un giorno chiuso — succede, per registrazioni a posteriori o eccezioni — **non va nascosta**: si mostra. Il calendario racconta cosa è successo, non cosa avrebbe dovuto succedere.

**Nessuna regressione.** Le richieste già esistenti restano valide anche se cadono in giorni ora dichiarati chiusi: non si cancellano, non si rifiutano automaticamente, non si spostano. Nessuna route nuova. Nessun colore nuovo. Un solo breakpoint a 640px, nessun bersaglio sotto 44px sotto quella soglia.

**Fuori perimetro**: l'interfaccia con cui lo staff modificherà i propri orari. Per ora i valori si impostano con la migration; l'editing è un capitolo successivo, quando ci sarà un secondo salone che lo richiede. Dichiaralo come debito noto.

## Parte seconda — la durata non è una proprietà del servizio

Aggiunta al mandato il 27 agosto, dopo la risposta del salone. Stesso giro perché tocca gli stessi file.

**Le parole di Davide**, riportate verbatim perché sono la fonte:

> «bagnetto pelo raso 45 minuti/1 ora, bagnetto barboncino o maltese 1 e 15 minuti quando sta bene, bagnetto quando sta rovinato 1.30/2h, mediamente 2h ma anche 2,5h cani grandi 2/3h»

La durata dipende da **tipo di pelo, condizione del pelo e taglia insieme**, e va da 45 minuti a 3 ore. È una proprietà **del cane in quel giorno**, non del servizio — esattamente come il prezzo.

**Il difetto attuale, misurato.** Il wizard mostra «Bagno · circa 1 ora» mentre Davide dice «mediamente 2h»: non è un arrotondamento, è la metà. E l'origine di quel numero è nota — `const DEFAULT_DURATION = 60` in `Calendar.jsx`: su 17 appuntamenti storici, quattordici hanno esattamente 60 minuti, cioè il valore predefinito che nessuno ha mai cambiato. Le tre volte in cui qualcuno ci ha pensato ha scritto 45, 90 e 180.

**Non è un problema di copy.** `services.duration_minutes` finisce in `appointments.duration_minutes` tramite la RPC di conversione, e quella durata **alimenta il rilevamento dei conflitti** del calendario. Se ogni lavorazione occupa un'ora in agenda mentre nella realtà ne occupa due, l'app **tace su sovrapposizioni vere** — che è peggio del non avercele affatto.

### Invarianti di questa parte

**Lato cliente: una forbice, non un numero.** Il wizard mostra un intervallo nelle parole del salone, non una durata puntuale. Il senso da rendere è quello di Davide: dipende dal pelo e da com'è messo. Il tono resta quello del wizard, che informa e non si scusa. La nota sotto le schede — richiesta da Luigi — spiega che i tempi effettivi si vedono in salone; conviene che forbice e nota dicano la stessa cosa una volta sola, invece di ripetersi.

**Lato staff: la durata la decide chi ha visto il cane.** Al momento della conferma lo staff imposta la durata reale, con il valore del servizio come sola proposta di partenza modificabile — non come dato imposto. È lo stesso trattamento del prezzo, e lo stesso principio dell'orario: si decide quando si conosce il caso.

**Nessun valore inventato.** Se un servizio non ha una durata attendibile, il numero in `services` resta quello che è e **non viene mostrato come se fosse una promessa**. Non dedurre durate dallo storico: le visite non registrano quanto sono durate.

**Nessuna regressione sui conflitti.** Il rilevamento continua a funzionare sulla durata effettiva dell'appuntamento, che dopo questo mandato sarà quella scelta dallo staff invece che quella predefinita del servizio.

## Controprove

Dichiara nel registro, misurate: che dal wizard sul demo una domenica non è richiedibile e la fascia mattina di lunedì non è scegliibile; che un giorno normale resta pienamente disponibile; che il calendario distingue chiuso da vuoto; che una richiesta preesistente in giorno chiuso resta visibile e integra; le tre larghezze; build verde. Ogni fixture creata sul demo va rimossa nella stessa sessione con controprova di zero residui.

## Se qualcosa non torna

Se il modello di configurazione non regge il caso reale senza forzature, fermati e dichiaralo: meglio un mandato interrotto che una struttura che il secondo salone farà saltare.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push.
