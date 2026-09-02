# Incarico GH-69 — Portami alla sua settimana

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 2 settembre 2026
**Forma breve (regola 4).** **Nessuna migrazione, nessuna policy, nessun dato scritto.** **Una lettura in più**, e una sola.
**Chiesto dal salone.** Superficie: la ricerca del planner. File attesi: `pages/Calendar.jsx`, `components/CalendarKit.jsx`, `pages/Calendar.css`, `apps/staff/lib/database.js`. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria**, non nel database, salvo dove la controprova richiede esplicitamente il contrario.

## Da dove nasce

`GH-64` ha costruito la ricerca **limitata alla settimana visibile**, e ha dichiarato il limite: *«nessun appuntamento in questa settimana»*. Il salone ha usato la ricerca, l'ha apprezzata, e ha chiesto la cosa che mancava: **andare alla settimana dove quel cane è prenotato.**

> **È anche la sostituzione buona del comando che abbiamo tolto stamattina.** «Vai a data» chiedeva di sapere *quando*; questa chiede di sapere *chi* — che al banco è l'unica cosa che si sa davvero.

### E una misura che è invecchiata in sei ore

`GH-67` ha rimosso il selettore di data motivandolo così: *nessuno prenota oltre due settimane, il più lontano è a dieci giorni.* Contato la sera stessa:

| appuntamenti, 2/9 sera | |
|---|---:|
| totali | **130** (erano 51 la mattina, 36 il giorno prima) |
| **non completati** | **88** — 82 futuri, **6 passati mai chiusi** |
| il più lontano programmato | **6 ottobre** |

**Il più lontano è passato da dieci giorni a un mese nel giro di una giornata.** La motivazione della rimozione non regge più; **la rimozione sì**, perché questa funzione fa quel lavoro meglio.

> **Regola 3 applicata a noi**: un numero porta con sé il momento in cui vale. Il mio valeva la mattina.

## Cosa fare

### 1 — Una lettura in più, non una a ogni tasto

Gli appuntamenti **non completati sono 88**, e restano nell'ordine delle centinaia anche a regime: quelli chiusi escono dall'insieme. **Si caricano una volta all'apertura della pagina** e si cercano in memoria, con la logica già esistente — nome del pet, proprietario, **cifre del telefono** (`GH-65`, da non toccare).

**Perimetro dell'insieme**: appuntamenti con stato **`scheduled`**, qualunque sia lo stato di approvazione — quindi anche le **richieste da confermare**. Dentro ci sono anche i **6 passati mai chiusi**: sono esattamente quelli che qualcuno cerca al telefono — *«ma lunedì poi è venuto?»* — e oggi non li trova nessuno.

**Fuori**: completati, annullati, assenze. Il planner risponde a *dove lo metto*, non a *quando è venuto*: lo storico vive nella scheda del cane.

**Una lettura sola, all'apertura.** Non una per battuta, non una per settimana sfogliata. Se ti trovi a interrogare il database mentre l'utente scrive, ti sei perso.

### 2 — L'elenco compare anche quando nella settimana c'è già qualcosa

Le corrispondenze nella settimana visibile **si accendono come adesso** (`GH-67`, velatura al 45%).

**E sotto il campo compare l'elenco delle corrispondenze altrove**, con data, ora, pet, proprietario.

> **Anche quando nella settimana una corrispondenza c'è.** Un cane può avere un appuntamento oggi **e** uno fra tre settimane: mostrarne uno solo farebbe rispondere male al telefono, che è il difetto già evitato con la frase «in questa settimana».

**Toccando una voce si va a quella settimana, e la scheda è già accesa**: il testo cercato resta nel campo.

**L'elenco è corto e ordinato per data, il più vicino per primo.** Se le corrispondenze superano una decina, mostra le prime e dichiara quante restano — **non è un secondo calendario.**

### 3 — Le parole

Oggi: *«Nessun appuntamento in questa settimana.»* e *«**n** corrispondenze in questa settimana.»*

Devono diventare tre casi distinti, e **nessuno dei tre deve far credere che non esista quel che esiste**:

- corrispondenze qui **e** altrove;
- **nessuna qui, ma altrove sì** — è il caso che ha generato la richiesta;
- **nessuna da nessuna parte**: e allora la frase lo dice per intero, senza «in questa settimana», perché la ricerca ha guardato **tutto l'aperto**.

**Non sono da inventare in codice a caso**: scrivile, e dichiarale nel registro come le hai scritte.

## Invarianti

**Nessuna migrazione, nessuna policy, nessuna scrittura.**

**Una sola lettura aggiuntiva, all'apertura della pagina.** Dichiara quante chiamate partono, prima e dopo, aprendo la pagina e sfogliando tre settimane.

**Non si toccano**: la normalizzazione del telefono e l'oggetto passato al confronto (`GH-65`), la velatura al 45% (`GH-67`), il segnaposto (`GH-66`), la razza sulla scheda (`GH-68`), le frecce e il ritorno a oggi.

**La ricerca continua a marcare e non filtrare** la griglia: non nasconde giorni, fasce, margini o piedi, **non smorza le schede non corrispondenti**, e **i conteggi in alto non cambiano** mentre si scrive — restano i conteggi della settimana visibile, non della ricerca.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-68`.

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

- **numero di chiamate al database**: aprendo la pagina e sfogliando tre settimane, prima e dopo il giro. **Scrivendo nel campo: zero chiamate nuove**;
- **cane con un appuntamento solo, fuori dalla settimana visibile**: non si accende niente nella griglia, **l'elenco lo mostra**, e toccandolo si arriva alla sua settimana con la scheda **già accesa** e il testo ancora nel campo;
- **cane con un appuntamento questa settimana e uno fra tre**: la griglia accende il primo **e** l'elenco mostra il secondo;
- **ricerca per cellulare parziale** che trova un appuntamento lontano: stessa prova;
- **una richiesta da confermare** fuori settimana compare nell'elenco;
- **un appuntamento passato e mai chiuso** compare nell'elenco;
- **un appuntamento completato, uno annullato e un'assenza NON compaiono**: tre prove distinte;
- **ordinamento**: il più vicino per primo; con più di dieci corrispondenze l'elenco è troncato e **dichiara quante ne restano**;
- **le tre frasi**, riportate testualmente, nei tre casi;
- **conteggi in alto invariati** mentre si scrive e dopo il salto;
- **le schede non corrispondenti sono identiche** a prima della ricerca;
- **a 1365, 1024 e 375px**: dove compare l'elenco, quante righe occupa, **nessun bersaglio sotto i 44px**, nessuno sbordamento. **Sul telefono dichiara se copre la griglia** e quanto;
- build verde. **Suite RLS**: nessuna policy toccata, ma **la lettura nuova passa dalle policy esistenti** — dichiara se l'hai rieseguita e, in caso contrario, qual è l'ultima misura viva.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **cerca un cane prenotato a ottobre**: l'elenco te lo mostra, e ci arrivi in un tocco?
2. **cerca un cane che ha un appuntamento questa settimana**: vedi *anche* che ne ha un altro più avanti, o l'elenco tace?
3. **cerca qualcuno che non ha niente di aperto**: la frase ti convince che non c'è, o ti lascia il dubbio che sia solo altrove?

La terza è la più importante: **è quella che dice se questa ricerca ha smesso di mentire.**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-69-portami-alla-sua-settimana-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
