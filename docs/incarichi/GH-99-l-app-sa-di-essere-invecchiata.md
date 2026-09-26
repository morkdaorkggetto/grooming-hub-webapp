# Incarico GH-99 — L'app sa di essere invecchiata

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 26 settembre 2026
**Superficie**: `vite.config.js`, un file statico in `public/`, `apps/staff/components/StaffKit.jsx`, `apps/customer/`.
**Nasce da un dubbio che non si è potuto sciogliere**: al salone sta girando la versione nuova o quella di una settimana fa?

**Perimetro**: nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta. Database ammesso **solo il demo**; nessun push, merge o deploy.

## Da dove nasce

Il 26 settembre un terzo cane si è presentato senza essere in agenda. `GH-93` e `GH-98` erano già pubblicati e avrebbero dovuto renderlo impossibile, o almeno visibile.

Misurato lo stesso giorno: negli **ultimi quattro giorni** i clienti abituali registrati **a ridosso della propria ora** sono **quattro**, contro due o tre a settimana nelle tre settimane precedenti. **Il fenomeno non è calato.**

Restano due spiegazioni, e **non abbiamo modo di distinguerle**:

- Davide ha registrato quell'appuntamento **prima** che le correzioni fossero pubblicate;
- **il Mac del salone sta ancora eseguendo il pacchetto vecchio.** Vercel serve quello nuovo, ma una scheda rimasta aperta continua a far girare il JavaScript caricato all'apertura — e un gestionale in negozio **sta aperto per giorni**.

> **Il problema non è Clover: è che non sappiamo cosa stia girando al banco.** Pubblichiamo correzioni e non sappiamo se siano in servizio. In due settimane sono dieci mandati consegnati dando per scontato che arrivassero il giorno stesso.

Misurato il 26/9: **nessun service worker**, nessun identificativo di build, `package.json` fermo a `1.0.0`. Non c'è niente su cui appoggiarsi.

## Cosa fare

### 1. Il pacchetto porta un'impronta

**Alla costruzione, l'app riceve un identificativo univoco di quella build** e lo porta dentro di sé. Come ricavarlo lo decidi tu — commit, istante di costruzione, altro — ma deve cambiare **a ogni pubblicazione** e **non deve cambiare** fra un ricaricamento e l'altro della stessa versione.

### 2. Lo stesso identificativo sta in un file che non viene messo in cache

Accanto al pacchetto, un file statico minuscolo che dichiara l'identificativo della versione **attualmente pubblicata**.

> **Il punto delicato è qui, e se sbagli il mandato non serve a niente**: quel file **non deve essere servito dalla cache**. Se il browser lo rilegge dalla propria copia, l'app confronterà sempre sé stessa con sé stessa e non si accorgerà mai di niente. **Dichiara come te ne sei assicurato e come l'hai verificato**, non come pensi che funzioni.

Va **generato dalla costruzione**, non scritto a mano: un file aggiornato a mano è un file che prima o poi resta indietro.

### 3. L'app se ne accorge e lo dice

Confronto fra ciò che il pacchetto porta dentro e ciò che dice il file. **Diversi: c'è una versione nuova.**

**Quando controllare**: a intervalli radi e **al ritorno sulla scheda**, che è il momento in cui una persona torna a lavorare. **Non ogni minuto**: non è un'emergenza, è una manutenzione. Scegli tu il ritmo e dichiaralo, in un posto solo — come il `60_000` di `GH-81`.

**Come dirlo**: un avviso **discreto e non bloccante**, dove si vede senza cercarlo. Lo stesso posto del pallino di `GH-81` è il candidato naturale, ma **decidi tu e dichiara perché**.

**E qui l'invariante che conta più di tutti:**

> **Non si ricarica da soli. Mai.** Chi sta compilando un appuntamento, scrivendo una nota o ritagliando una foto **non deve perdere quello che ha in mano** perché è uscita una versione nuova. Il ricaricamento lo chiede la persona, quando ha finito.

Se il mandato ti porta a scrivere un ricaricamento automatico, anche «solo quando la pagina è ferma», **fermati e dichiaralo**.

### 4. La versione si legge, senza doverla cercare

**In un punto discreto e stabile**, l'app dice quale versione sta eseguendo. Serve a una cosa sola e concreta: **poter chiedere al telefono «che versione vedi?» e avere una risposta in cinque secondi.**

Vale per **entrambe le app**: il gestionale e quella del proprietario.

**Non un numero da programmatori in mezzo alla pagina.** Piccolo, in fondo, dove sta l'uscita o il profilo.

## Invarianti

**Nessun service worker.** È la scorciatoia che sembra ovvia e non lo è: porta una gestione di cache, un ciclo di aggiornamento e una categoria nuova di difetti — pagine che restano vecchie *in modo persistente*, che è peggio del problema di oggi. **Se ti trovi a registrarne uno, ti sei perso.**

**Nessun ricaricamento automatico, in nessuna condizione.**

**Nessuna migrazione, nessuna colonna, nessuna policy, nessuna rotta, nessuna dipendenza nuova.**

**Il pallino e il suono di `GH-81` non cambiano**, né cosa contano né come suonano. Se l'avviso vive accanto a loro, **non entra nel loro conteggio**.

**Nessun colore nuovo, nessuna geometria toccata.** Restano gli invarianti di `GH-54` → `GH-98`, compresa l'eccezione dichiarata da `GH-87` sul link `Grooming Hub`.

**La lingua è quella di `GH-83`** nell'app del proprietario: l'avviso lo legge una persona, non un tecnico. Niente «build», niente «deploy», niente numeri di commit a schermo.

## Controprove

Dichiara nel registro. **Misure, non affermazioni.**

- **l'identificativo cambia fra due costruzioni** e **resta uguale** fra due caricamenti della stessa: due prove, valori riportati;
- **il file non arriva dalla cache**: la prova, non il ragionamento. Riporta cosa hai misurato — intestazioni, comportamento a ricaricamenti ripetuti, o quello che hai usato;
- **versione uguale**: nessun avviso, e **quante richieste** parte in dieci minuti;
- **versione diversa**: l'avviso compare. Riporta il testo esatto, nei due lati;
- **al ritorno sulla scheda** il controllo riparte: misuralo;
- **a scheda nascosta** non si controlla: misuralo, come in `GH-81`;
- **se il file non risponde** — rete assente, errore — **non succede niente**: nessun avviso, nessun errore a schermo, **zero errori in console**. È il caso che capiterà davvero, e un falso allarme qui insegna a ignorare l'avviso;
- **nessun ricaricamento automatico**: dimostralo. Lascia l'avviso a schermo e misura che la pagina resti dov'è, con un modulo compilato a metà **ancora compilato**;
- **la versione a schermo**: dove sta, nelle due app, con prove a schermo;
- **il ritmo del controllo**: dove sta scritto, un posto solo, con il percorso del file;
- **nessun service worker registrato**: ricerca esaustiva, comando riportato;
- **il pallino di `GH-81` non cambia**: impronte di `StaffRequestAlerts.jsx` e conteggio prima e dopo;
- **le altre pagine**: impronte, come in `GH-98`;
- **a 375px e a 1365px**: nessuno sbordamento, nessun bersaglio nuovo sotto i 44px;
- build verde, e **il file della versione è dentro `dist/`** con il valore giusto: verificalo nel pacchetto costruito, non solo nel repository;
- **Suite RLS: da non rieseguire**, nessun dato né permesso toccato. Ultima misura viva: `GH-96`, **60 PASS del 19/9**.

## Passo finale — lo guarda Luigi (regola 5)

1. **apri l'app e lasciala aperta**, poi pubblica qualcosa: dopo quanto te ne accorgi, e come?
2. **con un modulo compilato a metà**, lascia comparire l'avviso: hai perso qualcosa?
3. **chiedi a Davide al telefono che versione vede**: ci arriva in cinque secondi?
4. **e la domanda che conta**: fra una settimana, sapremo dire se una correzione è arrivata al banco?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Nota di coda — non è in questo mandato

**Il caso di Clover resta aperto.** Questo mandato non lo risolve: rende possibile sapere se `GH-93` e `GH-98` fossero in servizio quando è successo. **Se scopriremo che lo erano, il difetto è altrove e va cercato da capo.**

## Chiusura

Registro in `docs/consegne/GH-99-l-app-sa-di-essere-invecchiata-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
