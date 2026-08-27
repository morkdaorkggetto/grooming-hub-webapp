# Incarico GH-20 — Il calendario: esecuzione

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 agosto 2026
**Continua** `GH-19`, il cui registro — inventario, scostamenti, conferma dei campi — **è approvato ed è il contratto di questo mandato**.

> **Mandato unico e ampio, senza fasi.** Non è una svista: gli input sono verificati. L'inventario delle trenta funzioni esiste, gli undici campi sono confermati dal codice e dallo schema, le dodici decisioni sono prese. Secondo la regola scritta il 27/8 in `docs/consegne/README.md`, la dimensione di un mandato è inversamente proporzionale alle assunzioni non verificate su cui poggia: qui non ne restano.
>
> **Questo mandato dichiara le invarianti, non la procedura.** Cosa deve essere vero alla fine è scritto; come arrivarci lo scegli tu, che su quello sbagli meno di chi scrive i mandati.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessuna migration, nessun deploy, nessun push. Il demo è ammesso per le controprove; produzione e progetto temporaneo sono vietati.

## Le dodici decisioni, risolte

Undici come raccomandato in GH-19. La settima è modificata, e il motivo è dichiarato.

1. **Creazione manuale: conservata**, come azione secondaria in modale compatta. Mantiene `?clientId=`. Toglierla costringerebbe a inventare una richiesta cliente finta per registrare una telefonata.
2. **Griglia oraria, vista elenco e trascinamento: rimossi.**
3. **Destinazioni delle righe**: richiesta → conferma; appuntamento → gestione; lavorazione → scheda pet. Nessuna route nuova.
4. **Cancellazione definitiva: rimossa dalla UI.** Si usa «Annulla», che conserva il record. Il delete fisico perde la storia e sgancia in silenzio il legame con la richiesta GH-08.
5. **Conflitti: conservati** in conferma, creazione e riprogrammazione. Il controllo resta lato client e **non impedisce due scritture simultanee**: limite noto e accettato — con diciassette appuntamenti in un anno non è un rischio reale, e un vincolo a livello di database sarebbe un mandato a sé.
6. **«Conferma e prepara WhatsApp».** La RPC salva prima, poi si apre il messaggio modificabile. Rimuovere «Solo salva l'ora». Se manca il telefono: richiesta confermata, messaggio non preparabile, e lo si dice.
7. **Testo del rifiuto: si usa quello standard esistente, ma è dichiarato provvisorio.** Divergenza dalla raccomandazione di GH-19, con motivo: quel testo **non è di Davide, l'abbiamo scritto noi**, ed è nel registro di un call center — «ti chiediamo di selezionare un'altra fascia oraria» — mentre loro dicono «bagnetto» 129 volte su 298. CD al §9.4 chiedeva la frase di Davide, non la nostra. Serve adesso perché nulla si blocchi; **annotare nel registro che i quattro messaggi automatici (proposta, promemoria, conferma, rifiuto) attendono le parole del salone.** È una stringa ciascuno.
8. **WhatsApp dal draft: rimosso.** Prima si persiste, poi si comunica dal record reale: due verità parallele sono peggio di un messaggio in meno.
9. **Storico**: frecce, «Questa settimana», «Vai a data». Nessun `Dal/Al` permanente, nessun limite arbitrario.
10. **Appuntamento e lavorazione nello stesso giorno: distinti, nessuna deduplica.** Non esiste alcun legame fra le due tabelle e inventarlo sarebbe fabbricare un dato.
11. **Export Google e Apple: conservato** come azione secondaria nel dettaglio.
12. **Route `/requests`: mantenuta** per compatibilità finché dashboard e collegamenti non sono migrati.

## Il contratto anti-regressione

Queste funzioni **esistono oggi e devono esistere anche dopo**. È la ragione per cui GH-19 è stato scritto: una vista che nessuno guarda da quattro mesi può perdere pezzi senza che nessuno se ne accorga fino a novembre.

| Deve sopravvivere | Deve sparire |
|---|---|
| Apertura da `?clientId=` · creazione manuale · conflitto in creazione · prossimo orario libero · avviso conflitti esistenti · riprogrammazione · promemoria WhatsApp · export calendario · stato completato · no-show con punteggio · annullamento · apri cliente · nuovo per lo stesso cliente · evidenza «imminente» · guardia di scrittura demo | WhatsApp dal draft · filtro `Dal/Al` permanente · vista elenco · griglia 08-20 · trascinamento · delete definitivo |

## Invarianti — cosa deve essere vero alla fine

**Composizione.** I tre oggetti si distinguono per forma secondo CD-01: cifre serif tabulari per il confermato, capsula tratteggiata per la richiesta, barretta per la lavorazione. Le tre forme restano tre: la capsula promette «da qualche parte qui dentro», e su una lavorazione già svolta sarebbe falsa.

**Dati.** Nessuna ora dedotta per le lavorazioni, da nessuna fonte — né `created_at`, né ordine di inserimento, né medie. Nessuna traccia d'invio inventata. Nessuna promozione mostrata. Nessun operatore: «Chi lavora» va rimosso, non reso opzionale. Il testo scritto dal salone si stampa **verbatim**: «bagnetto» resta «bagnetto», e «non è venuto» non diventa un no-show da solo.

**Lettura.** Il calendario legge **la sola settimana visibile**, componendo appuntamenti, richieste pendenti e visite. Oggi carica tutti i pet con tutte le loro visite: con 282 pet regge, non reggerà. Nessuna migration serve.

**Resa.** Un solo punto di rottura a 640px; sotto, un giorno alla volta. Nessun bersaglio interattivo sotto 44px sotto i 640px. Cifre tabulari ovunque. Nessun colore letterale oltre i bianchi di sistema e i tre token GH-15, di cui il calendario usa i due bordi.

**Stati.** Devono avere un posto anche `completed` e `cancelled`, che la composizione CD non rappresenta esplicitamente. I segnali derivati — imminente, conflitto, blacklist — non sono stati nuovi e non vanno persistiti.

**Vuoti.** I due vuoti restano distinti: la settimana deserta mostra comunque i sette giorni, perché deve somigliare a una settimana e non a un errore; il giorno vuoto dentro una settimana piena è una riga sola.

## Controprove

Dichiara nel registro, misurate: che ogni funzione della colonna «deve sopravvivere» è raggiungibile e funziona, provata dal gesto reale; che ogni funzione della colonna «deve sparire» non è più raggiungibile; le tre larghezze senza overflow e senza bersagli sotto soglia; il ciclo completo di una richiesta dal demo — arrivo, conferma con ora, comparsa come appuntamento — con pulizia e zero residui; righe e stili inline prima e dopo; build verde.

Il metodo lo scegli tu. Se una controprova richiede scritture sul demo, usale e ripulisci nella stessa sessione: **il mandato non si contraddice come GH-17**, il demo è ammesso.

## Se qualcosa non torna

Se un'invariante non è raggiungibile senza toccare flussi, route o schema — fermati e dichiaralo. Un'interruzione motivata resta una consegna valida.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push.
