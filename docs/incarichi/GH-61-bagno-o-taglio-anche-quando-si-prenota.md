# Incarico GH-61 — Bagno o taglio, anche quando si prenota

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 1 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna nuova, nessuna policy.**
**Chiesto dal salone — Roby e Davide.** Superficie: il modulo «Nuovo appuntamento» in `/calendar` **e il modulo della lavorazione**. File attesi: `pages/Calendar.jsx`, `pages/Calendar.css`, `components/VisitForm.jsx`, eventualmente `pages/AddVisit.jsx` e `pages/ClientDetail.jsx`. **Nessuna rotta nuova.**

> **Un pensiero solo, visto da due parti**: **il servizio classifica, il testo libero descrive.** Le voci 1 e 2 mettono la classificazione dove manca; la voce 3 toglie al testo libero il compito che non è più suo. Separarle costringerebbe a rifare due volte lo stesso controllo sullo stesso modulo.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy.

## Da dove nasce

Roby chiede di **uniformare il comportamento dello staff a quello del cliente**: quando il cliente chiede un appuntamento dalla sua app sceglie il tipo di lavorazione fra i due servizi del salone. **Quando è il salone a prenotare al banco, quel campo non esiste.**

`appointments.service_id` **esiste dal principio** e l'app clienti lo riempie già. Manca solo il campo nel modulo dello staff.

### E misurando si è visto quanto pesa

| in produzione l'1/9 | |
|---|---:|
| appuntamenti | **51** |
| **con un servizio indicato** | **0** |
| durate usate | **60** e 90 |
| appuntamenti da **60 minuti** | **50 su 51** |
| listino | Bagno **45 min / 20 €** · Taglio **90 min / 30 €** |

**Sessanta minuti non è nessuno dei due servizi.** È il valore predefinito del modulo, e non corrisponde a niente di reale.

> **Tutta la vista «Dove lo metto» sta calcolando su durate inventate.** «2/3 postazioni occupate», il margine per chi arriva e la guardia sulla capienza di `GH-37` trattano ogni cane come un'ora tonda: un bagno ne occupa **un quarto d'ora di meno**, un taglio **mezz'ora di più**. Roby ha chiesto una tendina e ha trovato un errore di misura in tutta la settimana.

## Cosa fare

**Il modulo «Nuovo appuntamento» guadagna la scelta del servizio**, letta da `services` — **nessun nome, prezzo o durata scritto nel codice**, come in `GH-60`.

**Scegliendo il servizio, la durata si propone dal servizio** — 45 o 90 — al posto del 60 di oggi. **Resta modificabile**: un cane grosso può volerci di più, e imporre la durata di listino produrrebbe la stessa famiglia di dati falsi del costo obbligatorio del 31 agosto.

**Il servizio non è obbligatorio.** Se al banco non si sa ancora cosa serve, l'appuntamento si prenota lo stesso e il servizio resta vuoto. In quel caso **la durata predefinita resta quella di oggi**, e non cambia comportamento.

**Vale per tutti i modi di aprire quel modulo**: il pulsante «Nuovo appuntamento», «Prenota qui» da una fascia, e «Nuovo per lo stesso cliente» dal dettaglio.

## E la scheda lo dice

Oggi la scheda di un appuntamento nel planner porta **«Appuntamento · 60′»**.

**Le diciture attuali restano — decisione di Luigi.** Il nome del servizio **si aggiunge**, non sostituisce niente: `Bagno`, `Taglio`, letto dalla tabella. Quando il servizio non c'è — i 51 esistenti e chiunque prenoti senza sceglierlo — **la scheda resta identica a oggi**. Nessun riempimento, nessuna differenza da rimediare.

> **Vincolo misurato, ed è il punto delicato**: nella colonna della settimana **«Appuntamento · 60′» si tronca già oggi** e legge «Appuntament…». Aggiungendo il servizio la riga diventa più lunga di quella che non ci stava. **La disposizione la decidi tu** — su due righe, o il servizio accanto alla durata — ma con un vincolo: **il nome del servizio deve restare leggibile nella colonna settimanale, e non essere il primo a sparire.** Dichiara come l'hai risolto.

**Il nome non si abbrevia nel codice.** Una forma contratta scritta nella vista sarebbe un nome di servizio dentro il codice, cioè la cosa che questo mandato e `GH-60` vietano. Se serve troncare, si tronca **con i puntini**, e il nome completo resta disponibile per esteso a chi passa sopra e a chi legge con uno screen reader. In **vista giorno** lo spazio c'è: lì si legge tutto.

> **Nota per Luigi, non per l'esecuzione**: in produzione i due servizi si chiamano **Bagno** e **Taglio**; «Toelettatura Completa» è il nome sul demo. L'etichetta viene dalla tabella, quindi per cambiarla basta rinominare il servizio nel listino — **non è un mandato**.

> **Non è in questo mandato**: la ricerca del pet nel modale «Registra lavorazione», la creazione di un cliente dal calendario, e l'unificazione delle funzioni di creazione. Sono `GH-62`, e non c'entrano con la richiesta di Roby.

## E il modulo della lavorazione perde una casella

Con `GH-60` il servizio classifica la lavorazione. Il campo **«Trattamenti eseguiti»** non serve più a elencare cosa è stato fatto.

E c'era di peggio dentro: il campo porta il suggerimento **«Es. Bagno, taglio, asciugatura, spazzolatura…»**, che è **letteralmente l'istruzione che ha prodotto le sei grafie** misurate in `GH-60` — 88 `bagnetto`, 44 `Bagnetto`, 168 con «bagno», 125 con «taglio». Il campo insegnava a scriverci dentro la classificazione, e la gente ha obbedito.

> **Un esempio dentro un campo libero insegna cosa scriverci.** Non è un aiuto neutro: decide il contenuto di quel campo per gli anni successivi.

**Il modulo ha una casella libera sola.** «Problematiche riscontrate» **esce dal modulo**; resta quella basata su `visits.treatments`, che è la sola già mostrata ovunque nello storico.

**Si chiama «Note della lavorazione»**, è **facoltativa**, e **non ha alcun suggerimento**. Nessun esempio, nemmeno buono: una casella vuota non chiede niente e si riempie solo quando c'è qualcosa da dire. È l'uso voluto — Roby e Davide ci scrivono a mano il particolare, quando c'è.

### Ma il campo esce da dove si scrive, non da dove si legge

Misurato in produzione l'1/9: **39 visite su 477 hanno `issues` compilato**, tutte diverse, e sono le annotazioni più utili dell'archivio — `aggredisce`, `anziano e iperattivo`, `6 mesi pieno di nodi e non si fa toccare`, `calore`, `irritazione`, `forforina consistente`.

**Ovunque lo storico mostri oggi le problematiche, deve continuare a mostrarle.** Toglierle dal modulo e insieme dalla vista significherebbe **nascondere trentanove note in silenzio**, e fra queste `aggredisce`.

**La colonna `issues` non si elimina e non si svuota.** Resta nello schema, smette di essere offerta in scrittura, continua a essere letta. **E i due testi non si fondono**: nessun `UPDATE` che accoda le problematiche alle note.

> **Coda annotata, non da fare qui**: `aggredisce` è un'informazione di **sicurezza** sepolta in una visita di mesi fa. Una nota così appartiene al **cane**, non alla lavorazione — accanto alla blacklist e al punteggio. Il posto esiste già (`pets.owner_notes` e le note staff). Da valutare con Davide.

## Invarianti

**Nessuna migrazione, nessuna colonna aggiunta o rimossa, nessuna policy, nessuna funzione nuova.** `appointments.service_id` e `visits.issues` esistono già. Se ti trovi a scrivere SQL, ti sei perso.

**Nessun dato riscritto.** Né `treatments`, né `issues`, né fusioni fra i due.

**Nessun esempio, segnaposto o testo di aiuto dentro la casella delle note.** È il punto della voce, non un dettaglio: se aggiungi un suggerimento «più corretto», hai rifatto l'errore con parole diverse.

**Nessun riempimento dei 51 appuntamenti esistenti.** Restano senza servizio, e la loro durata resta quella registrata. **Da adesso in avanti** — è la decisione di Luigi dell'1/9, la stessa di `GH-60`. E come lì, **nessun avviso, badge o «da completare»** sulle righe vecchie.

**Nessun numero di durata o prezzo scritto nella vista.** Tutto da `services`.

**Nessuna scorciatoia sulle guardie esistenti**: capienza di `GH-37`, avviso di doppione di `GH-41`, blacklist. Cambiando la durata proposta, **la guardia sulla capienza deve rivedere il suo conto** — è il punto in cui questo mandato tocca qualcosa di vivo.

**Nessun colore nuovo, nessuna rotta nuova**, e restano intatti gli invarianti di `GH-54` → `GH-60`: i moduli che nascono dalla griglia si accostano e quelli dell'intestazione restano centrati; grana a mezza giornata; lavorazioni senza ora mai dentro una fascia; `flex-shrink: 0` e `min-height: 0` sotto i 640px; lessico ammesso **solo** `lavorati sul momento`, `chi arriva`, `senza ora fissata`; il peso segue l'agibilità; l'arretramento appartiene al contenitore.

## Controprove

Dichiara nel registro, misurate **sul demo** con fixture usa-e-getta, rimosse a fine sessione:

- **scegliendo il primo servizio la durata proposta diventa la sua**, e con il secondo la sua: riporta i due valori letti dal demo, non quelli di produzione;
- **la durata si sovrascrive a mano e resta quella scritta**: salva un valore diverso da entrambi e rileggi la riga;
- **l'appuntamento salvato porta `service_id`**, e riaprendolo il servizio è quello scelto;
- **senza servizio si prenota lo stesso**: `service_id` nullo, durata predefinita invariata rispetto a oggi;
- **cambiando la durata del servizio nel listino**, la proposta cambia **senza ricostruire l'app**;
- **la guardia della capienza fa il conto sulla durata nuova**: due appuntamenti da 90 che prima non si sovrapponevano a 60 ora si sovrappongono, e `GH-37` reagisce come deve;
- **le tre strade** — pulsante, «Prenota qui», «Nuovo per lo stesso cliente» — offrono tutte il campo, e da «Prenota qui» giorno e fascia restano precompilati come prima;
- **gli appuntamenti esistenti sono intatti**: conteggio con `service_id` nullo e durate prima e dopo il giro;
- **nessun avviso o invito a completare** sulle righe senza servizio né senza note;
- il modulo della lavorazione ha **una sola casella libera**, si chiama «Note della lavorazione», e **non ha alcun segnaposto**: riporta l'attributo misurato, vuoto;
- una lavorazione nuova **con** nota e una **senza**: entrambe si salvano, il testo si rilegge identico;
- **una visita che ha `issues` continua a mostrarlo nello storico**: elenca i punti in cui compare e dimostra che nessuno l'ha perso;
- **`issues` non è più scrivibile dal modulo**: dimostralo con una ricerca nel codice;
- **impronta di `treatments` e `issues` prima e dopo il giro**: identiche. È la prova che nessun testo è stato toccato né fuso;
- la stringa **`Es. Bagno, taglio`** non compare più da nessuna parte;
- **la scheda aggiunge il nome del servizio** quando c'è, e **resta identica a oggi quando non c'è**: misura entrambi i casi nella stessa settimana;
- **nome lungo in colonna stretta a 1365px e a 1024px**: riporta cosa si legge davvero sulla scheda, parola per parola. **Il nome del servizio deve esserci ancora**;
- **in vista giorno il nome si legge intero**;
- **nessun nome di servizio compare nel codice**: dimostralo con una ricerca;
- build verde. **Suite RLS: da non rieseguire** — nessuna policy o funzione toccata. Dichiara che l'ultima misura viva è quella di `GH-60`.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **prenota un taglio da una fascia già mezza piena**: la settimana si comporta diversamente da prima, adesso che dura novanta minuti invece di sessanta?
2. **prenota senza scegliere il servizio**: si fa senza attriti, o il modulo fa sentire che manca qualcosa?
3. **guarda un appuntamento di ieri**: l'assenza del servizio è neutra?

La prima è la più importante: **è quella che dice se la settimana adesso misura la realtà o la misurava prima.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-61-bagno-o-taglio-anche-quando-si-prenota-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
