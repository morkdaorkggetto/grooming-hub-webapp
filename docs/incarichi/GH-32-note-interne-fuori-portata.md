# Incarico GH-32 — Le note interne fuori dalla portata del cliente

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 28 agosto 2026
**Precede** l'atto G6 (`GH-31`): al termine, la ricetta del §6 di `GH-30` va aggiornata.

> Dichiara le invarianti, non la procedura. Il modello dei dati lo scegli tu: qui è scritto **cosa deve essere vero**, e i vincoli che non puoi violare.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push. **Database ammesso: solo il demo**; produzione e progetto temporaneo vietati.

## Il fatto

Le note che il salone scrive per sé — `pets.internal_notes` e `customers.operator_notes` — **vivono su righe che il cliente possiede e può leggere**. Le policy `pets_customer_select` e `customers_self_select` restituiscono la riga intera, e le policy sono per riga: non sanno escludere una colonna. L'interfaccia non le mostra, ma **l'interfaccia non è il confine**.

La protezione aggiunta in GH-30 chiude la **scrittura**. La lettura resta aperta.

**Misura sul prod (28/8)**: 296 clienti, **32 con note**, lunghezza media **20 caratteri**, massima 48. Zero menzioni di morsi o aggressività; due note contengono un giudizio sulla persona, una riguarda denaro o ritardi.

**Decisione di Luigi (28/8)**: *«il cliente non può e non deve vederle»*. La ragione non è il rischio di oggi — due note imbarazzanti su 296 — ma quello di domani: **da settembre il salone avrà un campo pulito etichettato «note interne» e scriverà di più, fidandosi.** Siamo noi a invitare quella franchezza chiamando «interno» un campo che il database non protegge. E le 32 note di oggi si spostano in un momento; le trecento dell'anno prossimo no.

## Invarianti

**Un cliente non può leggere le note del salone.** Non attraverso l'interfaccia, non attraverso l'interfaccia di programmazione, non chiedendo la propria riga o quella dei propri pet, non in nessun altro modo che il suo accesso gli consenta. **La verifica va fatta come lo farebbe lui**: con una sessione customer reale, non ragionando sulle policy.

**Un cliente non può scriverle**, e resta vero il divieto che GH-30 ha stabilito.

**Le colonne esposte non restano lì con dentro i dati.** Spostare le note lasciando le vecchie colonne popolate non chiude niente: l'esposizione resterebbe identica. Come si chiude — svuotandole, rimuovendole, o in altro modo — lo decidi tu, purché alla fine **da quelle superfici non si legga più nulla di riservato**.

**Nessuna nota va persa.** Le 32 esistenti sopravvivono con il loro contenuto e il loro legame al pet giusto. Il conteggio prima e dopo va riportato.

**Per lo staff non cambia niente.** Dove oggi legge e scrive le note continua a farlo, con lo stesso gesto e senza passaggi in più. Se una superficie staff smette di funzionare, l'invariante non è soddisfatta.

**Le note del salone appartengono al salone**, non alla riga del cliente: è il principio da cui discende tutto il resto, e va rispettato anche nella forma che sceglierai.

## Il nodo da sciogliere: l'atto di GH-30

`20260828073917_gh30_protect_customer_operator_notes_prod.sql` estende un trigger a `BEFORE UPDATE OF ... operator_notes`. **Se quella colonna cambia natura o sparisce, quell'atto va coordinato**: un trigger che nomina una colonna inesistente non è un dettaglio, è una migration che fallisce a metà catena in produzione.

Risolvilo e **dichiara come**: sostituendo quell'atto, modificandolo, o collocando il tuo dopo di esso in modo che entrambi restino coerenti. Le due protezioni sui campi direttorio — `acquisition_source` e `relationship_status` — **devono sopravvivere in ogni caso**.

## La ricetta

Al termine, il §6 di `GH-30` va aggiornato: il nuovo atto inserito nella posizione giusta con la sua impronta, l'atto GH-30 aggiornato se l'hai toccato, e la numerazione ricomposta. **Le ragioni delle inversioni d'ordine già dichiarate restano valide e vanno conservate.**

Vale ancora: la ricetta deve poter essere **trascritta senza dedurre nulla**.

## Controprove

Dichiara nel registro, misurate: che una **sessione customer reale** non ottiene le note, provando le superfici che oggi le restituiscono; che lo staff le legge e le scrive dalle stesse schermate di prima, provate dal gesto; il conteggio delle note prima e dopo, **32 e 32**; che i due campi direttorio restano protetti; suite RLS; build verde.

Ogni fixture rimossa nella stessa sessione, zero residui, nessun account reale toccato.

## Se qualcosa non torna

Se l'invariante non è raggiungibile senza rompere una superficie staff o senza perdere note, **fermati e dichiaralo**. Meglio arrivare a G6 con l'esposizione documentata e consapevole che con le note al sicuro e il salone che non riesce più a scriverle.

## Chiusura

Registro in `docs/consegne/`, committato col codice, con la ricetta aggiornata. Niente push.
