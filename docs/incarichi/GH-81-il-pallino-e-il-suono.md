# Incarico GH-81 — Il pallino e il suono

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.**
**Cancello del lancio.** Superficie: il gestionale. File attesi: `apps/staff/components/StaffKit.jsx`, il suo CSS, e il punto in cui `Hero` viene alimentato. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

L'11 settembre è arrivata **la prima richiesta di prenotazione di un cliente vero** — alle **16:29 di venerdì, in pieno orario di apertura**. È rimasta senza risposta per **diciotto ore**.

Non perché il salone fosse chiuso: **perché erano su un'altra pagina.** L'avviso esiste già — la dashboard dice *«n richieste cliente da confermare»*, il calendario *«n da confermare»* — **ma bisogna essere lì per vederlo.**

> **Il guasto non è «nessuno era davanti allo schermo»: è «nessuno era su quella schermata».**

Fra poche settimane il salone inviterà **322 clienti**. Con uno, diciotto ore sono un aneddoto. Con trecento, **le richieste marciscono senza che nessuno lo sappia.**

### Perché questo giro è piccolo

Il gestionale **non ha una barra di navigazione** — dieci pagine e nessun modo di passare dall'una all'altra. La barra è chiesta a Claude Design in **`CD-07`**, e arriverà.

**Ma `Hero` c'è già**, è **un componente solo** in `StaffKit`, ed è usato da **tutte e dieci le pagine**. Un indicatore lì dentro **compare ovunque immediatamente**, senza inventare una barra e senza toccare dieci file.

**Quando la barra arriverà, l'indicatore ci traslocherà.** Questo giro serve a non aspettarla.

## 1 — Il pallino

**Un indicatore nell'`Hero`, su tutte le pagine**, che porta il **numero delle richieste dei clienti in attesa** e, toccandolo, **apre la pagina delle richieste**.

**Conta una cosa sola.** Non «le cose da fare»: **le richieste con stato `pending`**. Un indicatore che somma oggetti diversi non dice più niente e nessuno se ne fida.

**A zero non c'è.** Misurato il 12/9: le richieste in attesa sono **zero**, e ne è arrivata **una** in tutta la storia. **Lo stato normale è nessuna**, e un pallino spento su ogni pagina per settimane diventa arredamento. È la regola che vale da `GH-68`: **l'informazione compare dove ha un lavoro da fare.**

**Non deve rubare l'azione della pagina.** L'`Hero` porta già i pulsanti principali — «Nuovo appuntamento», «Registra lavorazione». Il pallino è **un avviso, non un comando**: sta con loro senza competere.

## 2 — Il suono

**All'arrivo di una richiesta nuova, un suono.**

**Il pallino dice quante ne aspettano, il suono dice che ne è arrivata una adesso.** Sono due informazioni diverse: senza il numero, il suono lo perdi se hai le mani in un cane; senza il suono, il numero lo scopri quando guardi.

**Si deve poter spegnere, e la scelta si ricorda.** In un salone ci sono cani e phon: se non è silenziabile, alla terza volta chiudono l'app. **Non chiedere ogni volta.**

**Suona solo per le richieste nuove**, non a ogni controllo e non al caricamento della pagina. Aprendo il gestionale con tre richieste già in attesa, **il pallino dice tre e il suono tace**: non sono arrivate adesso.

**Nessun suono al primo caricamento**, mai.

## 3 — Come si accorge

**A interrogazione periodica, non in tempo reale.**

Le richieste saranno una manciata al giorno: **sapere una prenotazione con un minuto di ritardo non cambia niente.** Il tempo reale introduce una connessione permanente che in questo progetto **non è mai esistita** — una cosa in più che si può rompere, per un vantaggio che nessuno noterebbe.

**Scegli tu l'intervallo e dichiaralo.** Vincoli:

- **una sola interrogazione per volta**, condivisa da tutta l'applicazione: non una per pagina, non una per componente. Con dieci pagine che montano lo stesso `Hero`, è l'errore facile;
- **niente interrogazioni a scheda nascosta**: se il gestionale è in secondo piano, si smette e si riprende tornando;
- **e se l'interrogazione fallisce, non succede niente di visibile**: il pallino resta com'era. **Un errore di rete non deve diventare un avviso.**

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.** Se ti trovi a scrivere SQL di schema, ti sei perso.

**Nessuna rotta nuova, nessuna pagina nuova.** Il pallino porta a una pagina che esiste.

**Nessuna barra di navigazione.** È `CD-07`, e non si anticipa qui: **il pallino vive nell'`Hero` e basta.**

**Nessun colore nuovo.** Restano gli invarianti di `GH-54` → `GH-79`, e in particolare: **l'informazione compare dove ha un lavoro da fare**; **il peso visivo segue l'agibilità**; **l'arretramento appartiene al contenitore, non alle lettere**.

**Nessuna modifica alle pagine**: si tocca `Hero`, non le dieci che lo usano. **Se ti trovi a modificarle una per una, fermati e dichiaralo.**

## Controprove

Dichiara nel registro. **Numeri e testi esatti, più una prova a schermo.**

- **zero richieste**: il pallino **non c'è**, su tutte e dieci le pagine. **Ricerca esaustiva, comando riportato** — non tre esempi;
- **una, tre, e molte richieste**: il numero è giusto; dichiara cosa succede oltre la soglia che hai scelto;
- **l'indicatore porta alla pagina delle richieste**, da tre pagine diverse;
- **una sola interrogazione attiva** con l'applicazione aperta: contala, e dimostra che **non cresce cambiando pagina**;
- **a scheda nascosta le interrogazioni si fermano**, e riprendono tornando;
- **interrogazione fallita**: il pallino resta invariato, **nessun avviso a schermo**, nessun errore in console;
- **il suono**: suona all'arrivo di una nuova, **tace al primo caricamento** anche con richieste già in attesa, **tace se spento**, e **la scelta sopravvive a un ricaricamento**;
- **i pulsanti dell'`Hero` sono invariati** in tutte e dieci le pagine: confronto misurato contro il commit base;
- **a 1365, 1024 e 375px**: nessuno sbordamento, **nessun bersaglio sotto i 44px**;
- **una prova a schermo con screenshot allegato** di una pagina con il pallino a tre e una senza. **Se il banco non riesce a renderle, fermati e dichiaralo;**
- build verde. **Suite RLS: da non rieseguire** — nessuna policy toccata. Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Su una pagina ricaricata dall'origine** — ⌥⌘R:

1. **fatti mandare una richiesta da Paola o dal tuo account cliente**, poi **vai su una pagina qualunque** che non sia la dashboard: **te ne accorgi?** È la domanda che ha generato il mandato;
2. **il suono in salone**: si sente col phon acceso, e si può spegnere senza cercarlo?
3. **con zero richieste**: la pagina è tornata identica a prima, o è rimasto qualcosa?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-81-il-pallino-e-il-suono-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
