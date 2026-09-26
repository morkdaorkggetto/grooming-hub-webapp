# Incarico GH-100 — Dove si perde un appuntamento

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 26 settembre 2026

> **Questo mandato non cambia niente.** Nessuna riga di codice applicativo, nessuna migrazione, nessun file sotto `src/`. **La consegna è il registro**, e il registro è il prodotto.

**Perimetro**: lettura del codice; database **in sola lettura**, e **solo il demo** — la produzione non si legge e non si scrive. Nessun push, merge o deploy.

## Da dove nasce

**Tre cani in due settimane** si sono presentati in salone senza essere in agenda, dopo che Davide aveva registrato l'appuntamento:

- **`Snoopy`**, 22 settembre. Esisteva un appuntamento **datato il giorno prima**, creato il 16: ancora `scheduled`, mai completato;
- **`fara`**, 22 settembre. Il pet **creato il 16 alle 18:11**, l'appuntamento **mai**;
- **`Clover`**, 26 settembre. **Nessuna traccia** di un appuntamento precedente, da nessuna parte.

`GH-93` (19/9) ha reso visibili gli errori dentro i modali. `GH-98` (23/9) dichiara le date passate e nomina la data salvata. **Sono entrambi in servizio al salone**: Luigi ha forzato il ricaricamento il 26 e ha visto la coda degli appuntamenti rimasti aperti, che è di `GH-98`.

Misurato il 26/9: negli ultimi quattro giorni i clienti abituali registrati **a ridosso della propria ora** sono **quattro**, contro due o tre a settimana prima. **Il fenomeno non è calato.**

> **Cowork ha misurato molto e concluso poco.** Restano tre spiegazioni — il salvataggio non è mai partito, l'appuntamento è stato creato e poi eliminato, non è mai stato registrato — e **con i dati di oggi sono indistinguibili**, perché di un salvataggio fallito e di una riga eliminata **non resta traccia**.
>
> Serve qualcuno che percorra il codice invece di interrogare i dati.

## Cosa fare

**Percorrere ogni strada per cui un appuntamento può non esistere dopo che un operatore era convinto di averlo creato.** Non scegliere la più probabile: **elencarle tutte**.

Almeno queste quattro famiglie, e **se ne trovi una quinta è la risposta più preziosa del mandato**:

### 1. Il salvataggio non parte

Dal tocco sul pulsante fino alla riga inserita, **ogni punto in cui il percorso può interrompersi senza che l'operatore lo sappia**. Comprese le condizioni che tengono il pulsante disabilitato: **una persona che preme un pulsante disattivato non riceve niente, e pensa di aver premuto.**

**Elenca ogni condizione che disabilita il salvataggio** nel modale «Nuovo appuntamento», e per ciascuna dichiara **se a schermo si capisce perché**.

### 2. Il salvataggio parte e fallisce

Ogni errore che può tornare dal database, e **dove finisce a schermo dopo `GH-93`**. Verifica che la copertura di `GH-93` sia davvero completa su questo percorso e **non solo sui casi che quel mandato aveva in mente**.

**Un caso da guardare in particolare**: cosa succede se la sessione è scaduta o il collegamento cade a metà. L'operatore vede un errore comprensibile, o qualcosa che somiglia a un successo?

### 3. La riga esiste e poi sparisce

`deleteAppointment` **cancella davvero**, e `GH-58` lo vieta solo per completati, assenze, origine cliente e visite collegate. **Un appuntamento «programmato» creato da operatore si può eliminare, e non resta niente.**

Misura: **da dove si raggiunge quel comando**, quanti tocchi servono, **cosa c'è accanto**, e se è possibile colpirlo credendo di fare altro. È l'unica delle tre ipotesi che si può indagare guardando l'interfaccia.

### 4. La riga esiste ma non si vede

Un appuntamento fuori dalla settimana mostrata, in una fascia chiusa, su un pet omonimo, con uno stato o un'origine che il planner filtra. **`GH-55` aveva già trovato un appuntamento contato e non disegnato**: verifica che quella famiglia sia chiusa davvero, su tutte le viste — settimana, giorno, operatività giornaliera.

## Come lavorare

**Misura, non dedurre.** Per ogni strada: il percorso nel codice con i riferimenti, e **una prova che la percorre** sul banco o sul demo. Una strada dichiarata possibile e non provata **va marcata come tale**.

**Distingui tre cose, e tienile separate nel registro:**

- **osservato** — l'ho fatto accadere e l'ho misurato;
- **possibile** — il codice lo consente, non l'ho riprodotto;
- **escluso** — l'ho cercato e non c'è, con la prova.

**Dichiara cosa non hai potuto stabilire.** È la parte più utile: dice a Cowork dove serve una traccia che oggi non teniamo.

**Non riparare niente.** Se trovi un difetto evidente e la tentazione di sistemarlo in due righe, **scrivilo e fermati**: la correzione sarà un mandato suo, scritto sapendo cosa ha trovato questo.

## Invarianti

**Nessun file sotto `src/`, nessuna migrazione, nessuna dipendenza, nessun file di configurazione.** L'unico file nuovo è il registro con le sue evidenze.

**La produzione non si tocca, nemmeno in lettura.** Le misure sui dati reali le ha già fatte Cowork e sono in questo mandato; se te ne serve un'altra, **chiedila invece di prenderla**.

**Il demo si legge, non si scrive** — salvo le fixture temporanee necessarie a riprodurre un percorso, dichiarate e smontate come sempre.

## Cosa consegnare

Il registro, con:

- **la mappa delle strade**, una per una, ciascuna marcata osservato / possibile / escluso;
- **per ogni strada percorsa**: il percorso nel codice, la prova, e **cosa vede l'operatore** — testo esatto, o «niente»;
- **le condizioni che disabilitano il salvataggio**, tutte, e quali sono mute;
- **la valutazione dei tre casi veri**: per `Snoopy`, `fara` e `Clover`, quali delle strade trovate sono **compatibili** con quello che i dati mostrano, e quali **no**. Non serve indovinare quale sia stata: serve **escludere**;
- **cosa non si può stabilire con i dati di oggi**, e **quale traccia servirebbe** per poterlo stabilire domani;
- **la tua ipotesi più probabile**, se ne hai una, **dichiarata come ipotesi** e separata dalle misure.

## Passo finale — lo legge Luigi

Non c'è niente da provare al telefono. La domanda è:

**dopo aver letto il registro, sappiamo dove guardare la prossima volta?**

## Chiusura

Registro in `docs/consegne/GH-100-dove-si-perde-un-appuntamento-esito.md`, committato da solo. Niente push, niente merge, niente deploy.
