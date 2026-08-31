# CD-06 — Brief per Claude Design: la settimana di Roby

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 31 agosto 2026
**Esito atteso:** composizione, non codice. Realizzerà Codex in un mandato successivo.
**Superficie:** il calendario del gestionale, `/calendar`. **Nessuna rotta nuova.**
**Priorità dichiarata dal salone: è la cosa più urgente adesso.**

## La richiesta, con le parole di chi l'ha fatta

Roby vuole **«una vista tipo planning dove avere un quadro sinottico della settimana, per sapere dove collocare le prenotazioni dei clienti che arrivano in negozio»**.

Il contesto fisico conta: **è al banco, con una persona davanti e un cane al guinzaglio**, e deve rispondere «quando la faccio venire?» senza far aspettare nessuno.

**Perché arriva adesso**: fino a sabato il calendario era fermo da quattro mesi. Da quando il salone ha ripreso a prenotare — **26 appuntamenti in tre giorni, contro 17 in tutta la storia precedente** — la domanda «dove lo metto?» è diventata quotidiana. Oggi il calendario risponde male perché è costruito **per giorno**: scegli una data, vedi la sua lista, e per capire dove c'è spazio devi aprire sette giorni uno alla volta.

## Le misure — contate sulla produzione il 31/8

| | |
|---|---:|
| giorni di lavoro registrati | 90 |
| **cani al giorno, mediana** | **5** |
| media | 5,2 — ultimi tre mesi **4,7** |
| giornata piena (nono decile) | 10 |
| record assoluto | 14 |
| **postazioni** | **3** (portate da 2 a 3 oggi) |
| appuntamenti futuri in agenda | 7 |
| durate dei due servizi | bagno **45 min**, taglio **90 min** |
| orari | mattina **9–13**, pomeriggio **13–19** |
| chiusure dichiarate | **domenica**; **lunedì mattina** |

### La conseguenza che decide tutto: la settimana è quasi vuota

Tre postazioni per nove ore fanno circa ventisette ore-postazione al giorno; con turni da tre quarti d'ora o un'ora e mezza, **cinque cani sono circa un quinto della capienza teorica**.

**Questa vista non serve a incastrare in uno spazio scarso. Serve a orientarsi senza aprire sette pagine**, e a non ammucchiare tutto alla stessa ora. Una griglia fitta da agenda medica sarebbe lo strumento sbagliato per un problema che non esiste.

**Compone bene chi compone prima la settimana con tre appuntamenti**, non quella piena.

## I tre oggetti da collocare — e uno di loro non ha un'ora

| Oggetto | Certezza temporale | Origine |
|---|---|---|
| **richiesta in attesa** | giorno + fascia (mattina / pomeriggio) | cliente, dall'app |
| **appuntamento** | data e **ora precisa** | salone, al banco o confermando una richiesta |
| **lavorazione registrata** | **solo il giorno, nessuna ora** | salone, a lavoro finito |

**La terza è il nodo, e non è transitoria.** `visits.date` è di tipo `date`: non contiene l'orario e non lo conterrà. Il salone registra a lavoro finito, spesso a fine serata.

> **Decisione di Luigi, 31/8, ed è la ragione per cui questo brief esiste in questa forma**: la registrazione a posteriori si ridurrà col tempo, ma **il cliente che entra e lascia il cane, avviandolo subito alla lavorazione, ci sarà sempre.** Non è un difetto da eliminare: è un modo di lavorare, e la vista deve distinguerlo, non nasconderlo.

**Ne discende una cosa che nessuno aveva ancora detto**: la capienza vera di una giornata non è tre postazioni — è **tre postazioni meno chi arriverà senza avvisare**. Se Roby riempie giovedì con tre prenotazioni contemporanee e poi entrano quattro persone col cane in braccio, il problema non è dell'applicazione.

**La vista dovrebbe aiutarlo a lasciare spazio, non solo a occuparlo.**

## Le domande che ti chiediamo di nominare

1. **A che grana si guarda una settimana?** Ore, mezze giornate, o giorni con dentro un elenco? Con cinque cani al giorno e due sole durate, una griglia oraria potrebbe essere più precisione di quanta ne serva — ma sei tu a dirlo.
2. **Come si mostra l'occupazione che non ha un'ora?** È la domanda più difficile del brief: un giorno può avere due appuntamenti alle 10 e alle 16 **e quattro cani entrati senza appuntamento**. Chi guarda deve capire quanto è stata piena davvero quella giornata.
3. **Come si vede lo spazio lasciato libero apposta?** Vedi sopra: riempire fino a tre è un errore, non un risultato.
4. **Cosa succede toccando un vuoto?** Il gesto naturale sarebbe «prenota qui», con data e ora già compilate. È quello che serve al banco — ma è anche una scorciatoia che può far saltare i controlli esistenti.
5. ~~Su cosa la guarda Roby?~~ **Risposto da Luigi il 31/8: telefono e computer, con preferenza per il computer.** Al banco c'è uno schermo largo, ma il telefono resta in uso. È l'**inverso** della card pubblica di `CD-04`, dove il telefono era il caso normale: qui il caso normale è il computer, e il telefono è il ripiego che deve funzionare comunque. **Non è più una domanda: è un vincolo.**
6. **Questa vista sostituisce quella per giorno o le si affianca?** Oggi il calendario è per giorno e serve a lavorare la giornata; il planning serve a decidere. Potrebbero essere due modi della stessa pagina — come settimana/mese nel report — oppure due cose distinte.

## Le etichette — decisione già presa, non è una domanda

Sul calendario compaiono oggi cinque etichette. Dopo una discussione con Luigi del 31/8:

| Etichetta | Sull'appuntamento | Perché |
|---|---|---|
| **Blacklist**, **A rischio** | **restano** | sono proprietà del cane, valgono sempre |
| **Postazioni piene** | **resta** | è un vincolo, e si può agire: spostarlo |
| **Completato / Annullato / Non venuto** | **restano** | sono fatti |
| **Imminente** | **via** | è un conto alla rovescia: su una lista di oggi tutto è imminente, e non ha nessuna azione attaccata |

**Cosa nasce al suo posto, ma altrove**: il **preavviso** — quanto tempo passa fra quando il cliente chiede e quando vorrebbe venire — vive sulla **richiesta**, dove Davide decide se accettarla. «Me lo chiede per domani mattina» è un'informazione; «l'appuntamento è domani mattina» no. Il dato per calcolarlo esiste già.

## Vincoli

- Eredita il vocabolario di `design_handoff_staff_app/`: token, scala, geometria, **un solo punto di rottura a 640px**. Al banco la regola è **44px**, non 54.
- **Il computer è il caso normale, il telefono il ripiego** — l'opposto della card pubblica. Una settimana di sette colonne sta su uno schermo largo e non sta su un telefono: **sotto i 640px la vista deve cambiare forma, non rimpicciolirsi.** Come, lo decidi tu.
- **Nessun colore nuovo.** La direzione delle frecce, da oggi, **vive nell'icona e non nei fogli di stile**: non introdurre rotazioni locali.
- **Nessuna rotta nuova**, nessuna promessa che il database non regge.
- **La capienza è un dato del salone, non una costante**: è passata da 2 a 3 stamattina e vive in `tenants.settings`. Nessun numero scritto nella composizione.
- **Marca con ⚠ ogni campo che non sei certa esista.** Ha prodotto correzioni sostanziali in tutti i giri, compresa una che ha scoperto un difetto in produzione.
- Dichiara le domande aperte invece di risolverle in silenzio.

## Due stati che saranno la norma

- **La settimana con due o tre appuntamenti e qualche lavorazione senza ora.** È la settimana tipo di oggi, e per mesi.
- **La settimana futura completamente vuota.** Roby guarderà avanti proprio perché deve collocare: la settimana prossima sarà quasi sempre bianca.

Compone bene chi compone prima questi due, non la settimana piena.
