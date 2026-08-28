# Incarico GH-31 — L'atto G6: la migrazione della produzione

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) + Luigi · **Data:** 28 agosto 2026
**Ricetta:** §6 del registro `docs/consegne/GH-30-ricetta-g6-ripresa.md` — 53 atti ordinati con impronte.
**Sostituisce** `GH-14`, fermo al 24 agosto e ignaro di tutto ciò che è stato costruito dopo.

> ## ⛔ NON ESEGUIBILE SU ORDINE GENERICO
>
> Mandato di produzione. Non rientra in un ordine del tipo «esegui l'ultimo elaborato»: richiede un'istruzione **esplicita e nominativa** di Luigi che citi GH-31 e dichiari soddisfatti tutti i cancelli.
>
> Se lo raggiungi tramite un ordine generico: fermati e dichiaralo.

> **Questo mandato è diverso da tutti gli altri.** Fin qui un fallimento si ricominciava. Qui il bersaglio è la produzione: 296 clienti, 464 visite, la memoria di lavoro di due persone. Non esiste «riprova»: esiste «fermati e ripristina». Leggere **Arresto e ripristino** prima di iniziare, non quando serve.

---

## Parte prima — i cancelli di Luigi

Nessun atto inizia se manca anche uno solo. Sono in ordine: i primi si fanno con calma nei giorni precedenti, gli ultimi il giorno stesso.

### Da fare prima, con calma

**1. ~~Spot-check delle cinque schede~~ — spostato dopo il rilascio.** *(Decisione Luigi, 28/8.)* Il confronto dei dati è già stato fatto da Cowork il 25/8 e coincide, incluso il caso difficile di Carnevale — due schede legacy fuse in un cliente con due cani, tutte e tre le visite conservate. Restava l'occhio, e farlo prima avrebbe richiesto di riallestire l'anteprima locale puntata al progetto di prova: allestimento vero per guardare come il **banco di prova** disegna delle schede.

È stato quindi assorbito nell'**atto 49** della ricetta, la verifica dal vivo dopo il rilascio, dove diventa più utile: **cinque clienti che Luigi riconosce**, sulla produzione reale invece che sulla copia. Se qualcosa non torna si vede lì, e le vie di ripristino restano tutte disponibili.

**2. Password nota su `frogletinpond@gmail.com`.** L'account con i 289 clienti lavora da tre mesi su una sessione che si rinnova da sola, e nessuno ricorda la password. Impostarne una nota **non interrompe la sessione**: continuano a lavorare come sempre, e in più esiste una credenziale se qualcosa si rompe. **Va fatto prima della migrazione, non dopo.**

**3. Decisione sull'account di Roby.** `zavaroby@gmail.com` non ha ruolo nel profilo, quindi la catena non gli creerà una membership e dopo G6 non funzionerebbe. Oggi è irrilevante — usano l'accesso di Davide — ma va deciso consapevolmente: dargli un ruolo prima della migrazione, oppure lasciarlo dormiente e saperlo.

**4. Impostazioni Auth sul progetto di produzione.** Registrazioni **abilitate**, conferma email **disattivata**, come già fatto sul demo il 27/8. Senza, nessun cliente invitato può creare il proprio accesso. Sono due interruttori in `Authentication → Sign In / Providers`.

**5. Decisione sulla lettura delle note interne.** `customers.operator_notes` e `pets.internal_notes` sono leggibili dal cliente attraverso l'interfaccia di programmazione, anche se l'app non li mostra. **Non è una regressione** — esiste già — e non blocca la migrazione. Ma diventa concreta al primo invito, quindi va decisa prima di invitare: tabella separata con regole solo-staff, oppure una superficie di lettura che non esponga quelle colonne. **Può essere anche una rinuncia consapevole, purché scritta.**

### Da fare il giorno stesso, in quest'ordine

**6. Dump fresco. ✅ ESEGUITO — 28/8, 19:58-20:13.** Tre file sulla Scrivania di Luigi:

| File | Byte |
|---|---:|
| `grooming-prod-dump-20260828.sql` (schema) | 29.965 |
| `grooming-prod-data-20260828.sql` (dati, `COPY`) | 1.284.135 |
| `grooming-prod-auth-20260828.sql` (autenticazione) | 111.877 |

Lo schema è **identico al byte** a quello del 21 agosto: la struttura non è cambiata in una settimana.

Il dump dati è stato **verificato contro il preflight, riga per riga**: `clients` 296, `visits` 468, `contacts` 301, `appointments` 17, `profiles` 4, `auth.users` 6, `storage.objects` 51. Tutte e sei le misure del preflight coincidono.

È **43.392 byte più piccolo** di quello del 21 agosto pur avendo quattro visite in più: la differenza è di formato, non di contenuto (vedi la nota sulle vie di ripristino).

Quelli del 21/8 restano sulla Scrivania come secondo paracadute e il piano Pro fornisce il terzo con i backup giornalieri.

**7. Autorizzare Codex su `Webapp_Project`.** Il suo collegamento è distinto da quello di Cowork e va concesso a parte. **Si revoca subito dopo.**

**8. Salone fermo e Luigi presente** per tutta la durata.

---

## Parte seconda — il perimetro di Codex

**Bersaglio unico: `grooming`, ref `azgehoseiojodltcttfb`.**

Nella stessa organizzazione vivono **`bea-scuola-musica` (`scbcpjtmgelpgtdjvmue`)** e **`caveabay-prenotazioni` (`nlratfznwohwjpmhroid`)**, che appartengono ad altri progetti e **non vanno né letti né scritti**. Il collegamento li espone per come è fatta l'organizzazione, non perché siano in perimetro. **Ogni chiamata porta il ref esplicito del bersaglio**: mai affidarsi a un progetto «corrente».

Demo e progetto temporaneo: fuori perimetro.

**Vietato `supabase db push`** in qualunque forma: ordina i file lessicalmente ed eseguirebbe la catena sbagliata. La ricetta ha **quattro inversioni deliberate**, spiegate nel §6 di GH-30.

---

## Parte terza — il preflight

Prima di qualunque scrittura, misurare e riportare:

| Verifica | Atteso |
|---|---:|
| clients | 296 |
| **visits** | **468** |
| contacts | 301 |
| utenti auth | 6 |
| appointments | 17 |
| profiles | 4 |
| migration registrate | 10, ultima `20260423123000` |

> **Correzione del 28/8 sera, misurata prima di partire.** Le visite erano 464 nella ricetta e sono **468**: il salone **ha lavorato il 25 agosto** — quattro bagni reali su Nathan, Athena, Hermes e Milo, inseriti dall'account di Davide. Non sono dati di prova. Le ferie erano meno ferme di come erano state assunte, e **il dump del 21 agosto non è più una fotografia fedele**: resta un paracadute, ma il dump fresco di stasera è quello che conta.
>
> Luigi ha avvisato Davide e Roby di non usare l'app durante l'atto. Una scrittura mentre la catena gira è l'unica cosa che può fare danni veri.

Più: **l'impronta SHA-256 di ogni file della ricetta**, confrontata con quella dichiarata nel §6 di GH-30, e le impronte dei tre dump freschi.

**Se una sola misura o impronta diverge, fermarsi e consegnare un'interruzione motivata.**

---

## Parte quarta — la catena

I 44 atti SQL del §6 di GH-30, **nell'ordine dichiarato**, uno alla volta: impronta verificata, applicato, misurato, **durata annotata**.

Riferimento dalla prova generale: **84,3 secondi** di sole chiamate DB per la catena completa, più il tempo del restore se servisse. Finestra raccomandata: **15 minuti** per il tratto database.

Attenzione ai punti che la prova ha già insegnato: la preparazione precede la pulizia; la cancellazione delle schede irrecuperabili precede il vincolo sul telefono; `service_id` precede `appointment_requests`; **l'hardening è l'ultimo**, perché deve operare sulle definizioni finali delle funzioni.

### Dopo la catena, prima di toccare l'app

| Verifica | Atteso |
|---|---:|
| customers | 260 |
| pets | 282 |
| **visits** | **456** |
| contacts | 287 |
| customers senza telefono | 0 |
| `customers.phone` nullable | NO |
| servizi attivi | 2 |
| pet senza `qr_token` | 0 |

Più: suite RLS con sonde usa-e-getta smontate nella stessa sessione; Advisor Security e Performance; **prova viva della protezione appena aggiunta** — un non-staff non modifica `operator_notes`, né da solo né insieme ad altre colonne; e una conferma appuntamento riletta dal database per accertare che **giorno e ora siano quelli scelti**, nel fuso del salone.

---

## Arresto e ripristino

**Cosa è un fallimento**: un atto che ritorna errore; una cardinalità che non coincide; una guardia che scatta; qualunque risultato che non sappiate spiegare **prima** di procedere all'atto successivo.

**Cosa non si fa mai**: improvvisare una correzione sul prod, allentare una guardia per farla passare, saltare un atto, disabilitare un trigger, aggirare `storage.protect_delete()`, «provare» una variante. Sul temporaneo era legittimo; qui no.

**Cosa si fa**: fermarsi, non eseguire altri atti, e consegnare un registro che dica **a quale atto**, **quale era lo stato prima** e **quale dopo**. La scelta fra ripristinare e diagnosticare è **di Luigi**.

**Vie di ripristino, in ordine** (le esegue Luigi): backup giornaliero automatico del piano Pro; dump fresco del giorno; dump del 21 agosto.

> **I due dump non hanno la stessa forma.** Verificato il 28/8 sera. Quello di stasera è in formato `COPY`: blocchi tabellari terminati da `\.`, una riga per record. Quello del 21 agosto è in formato `INSERT` multi-riga — **quindici istruzioni in tutto**, una per tabella non vuota, ciascuna con migliaia di tuple su una riga sola. È anche il motivo per cui è più grande pur contenendo meno dati: ogni tupla si porta dietro la sintassi.
>
> Conseguenza pratica: **non si ripristinano allo stesso modo**, e su quello vecchio non funzionano i tagli per riga. Chi lo usa deve saperlo prima, non mentre cade.

La catena è fatta di atti transazionali con guardie: un fallimento lascia il database all'ultimo atto riuscito, non a metà di uno.

---

## La finestra in cui l'app è rotta

La catena **droppa `clients`**, che l'app in produzione interroga. Fra la fine della migrazione e la promozione del nuovo frontend **l'app di produzione non funziona**. È aritmetica, non un incidente: con il salone chiuso è accettabile, ed è stato deciso il 24 agosto.

Sequenza, senza pause fra i punti:

1. **Codex**: catena e verifiche.
2. **Luigi**: merge `feat/customer-app` → `main`, `npm run build` come cancello, push, promozione a Production su `grooming-hub-webapp`.
3. **Luigi**: verifica dal vivo — login staff, dashboard, una scheda pet, la rubrica.

*(Nota: anche il progetto `-aish` ha oggi promosso un deployment di `feat/customer-app`. Dopo il merge, **due siti** serviranno il codice nuovo.)*

---

## Dopo, e non prima

| Gesto | Perché dopo |
|---|---|
| Rimuovere le due foto orfane via Storage API — percorsi nel §4 di `GH-12` | `storage.protect_delete()` vieta la via SQL |
| Revocare a Codex l'accesso a `Webapp_Project` | l'accesso è per l'atto, non permanente |
| Attivare «Leaked password protection» sul prod | tocca le password degli operatori: meglio a migrazione stabilizzata |
| Smontare `grooming-prova-generale` | solo a G6 riuscito e verificato |

---

## Emendamento 1 — La guardia dell'atto 4 conta male (28/8, ore 20:55)

**Cosa è successo.** Codex si è fermato all'atto 4 come prescritto: la guardia attendeva **3 operator legacy** e in produzione ne ha trovati **4**. Rollback confermato, database intatto — 296 clienti, 468 visite, 301 contatti, 4 profili, 10 migration.

**La guardia è sbagliata, non il database.** Misurato da Cowork sulla produzione:

| proprietario di schede legacy | schede | profilo prima dell'atto 4 |
|---|---:|---|
| `frogletinpond@gmail.com` | 289 | operator |
| `ggetto@gmail.com` | 5 | operator |
| `zavaroby@gmail.com` | 1 | nessuno |
| `sofaj99831@izkat.com` | 1 | nessuno |

L'atto 4 promuove a `operator` ogni proprietario di schede: sono **quattro**, e lo erano già il 21 agosto. Nessuna scheda è stata creata dopo il dump (`created_at` massimo: 8 agosto), il totale è invariato a 296, e le righe di Roby e di sofaj risalgono a marzo. Il 3 congelato il 24 agosto è stato contato in un mondo dove la pulizia era già avvenuta — sul banco di prova, dove il cliente di sofaj non esisteva più.

**Il quarto non costa nulla.** L'atto 4 crea un profilo `operator` per sofaj; **l'atto 5 lo cancella per intero** — cliente, rubrica, profilo, utente — e solo all'atto 6 lo split costruisce le membership. Sofaj non diventa mai staff di nulla. La differenza rispetto al mondo provato è una riga che nasce e muore dentro la stessa catena.

**Divieto esplicito**: non rimuovere sofaj a mano. La guardia dell'atto 5 pretende di trovare i quattro utenti di prova intatti oppure la pulizia già fatta; uno stato intermedio blocca la catena più avanti, con una scrittura manuale sul prod alle spalle.

### La correzione

Nel file `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` — impronta prima della modifica `8e60f6ba5d2d1adc11f4e079d1766527ab08533e5596c1e7203782ef5d5b4ff1`:

1. la guardia `IF v_operators <> 3` diventa `<> 4`, e il messaggio d'eccezione dice 4;
2. il commento in testa (riga 7) va allineato: **4 operator**, non 3, con la ragione — la misura del 24/8 era stata presa dopo la pulizia;
3. ricalcolare l'impronta SHA-256 del file e **aggiornarla nel §6 di `GH-30`**, dove è ancorata;
4. nel registro dell'atto: l'evidenza sopra, l'impronta vecchia e la nuova.

Nient'altro cambia. La soglia dei **7 clienti senza telefono** resta 7. Gli altri atti non si toccano. Poi si riparte dall'atto 4.

**Perché questo non è allentare una guardia.** Il canone vieta di ammorbidire un controllo per farlo passare. Qui non stiamo ammorbidendo: stiamo **correggendo una misura sbagliata che la guardia ha fatto bene a segnalare**, dopo averne accertato la causa sui dati e non sul ragionamento. La distinzione va tenuta ferma: se la causa non fosse stata dimostrabile, la strada giusta era fermarsi.

### Ricaduta su un cancello già dichiarato

Il cancello 3 diceva che l'account di Roby, senza ruolo nel profilo, non avrebbe ricevuto una membership. **È falso**: Roby possiede una scheda, quindi l'atto 4 gli assegna `operator` e la catena gli creerà una membership. In pratica non cambia niente — nessuno conosce la sua password, l'accesso operativo resta uno solo — ma l'affermazione era sbagliata e non va lasciata in giro.

## Emendamento 2 — L'atto 21 si applica come scritto (28/8, ore 21:15)

**Cosa è successo.** Atti 4-20 applicati. Codex ha **rifiutato l'atto 21 prima di eseguirlo**, non per una guardia scattata ma per un proprio giudizio: `pets_customer_update` concede ai clienti un aggiornamento troppo ampio dei pet. `clients` è già stata rimossa: **l'app di produzione è nella finestra di indisponibilità prevista.**

**Il rilievo è tecnicamente corretto.** La policy è per riga, e RLS non sa limitare le colonne: finché vale da sola, un cliente potrebbe scrivere qualunque campo dei propri pet. È scritto nel file stesso, che rimanda a un enforcement server-side.

**Ma è uno stato intermedio, e stasera non è raggiungibile da nessuno.** Misurato sulla produzione all'atto 20:

| | valore |
|---|---:|
| utenti auth | 3 (Davide, Luigi, Roby) |
| profili `customer` | **0** |
| membership `customer` | **0** |

Non esiste un solo account che possa autenticarsi come cliente. La whitelist per colonna arriva all'**atto 34**, dentro la stessa catena, prima che chiunque riceva un invito. Lo stato finale è identico a quello provato e verificato dalla suite RLS sul banco di prova.

Le cardinalità intermedie confermano che la catena è in rotta: 268 customers, 290 pets, 466 visite — meno le otto schede irrecuperabili e le loro dieci visite fanno esattamente i **260 / 282 / 456** attesi.

### La decisione

**L'atto 21 si applica come scritto. La catena prosegue nell'ordine dichiarato fino all'atto 34 e oltre.**

**Non si accorpa l'atto 34 dentro il 21.** Sarebbe una riscrittura di due file provati, con due impronte da rifare e una catena che non è più quella rehearsata — a produzione ferma e app giù, è la strada peggiore. Il canone vieta di improvvisare sul prod: vale anche per le correzioni che sembrano migliorative.

**Se la catena si fermasse fra il 21 e il 34**, l'esposizione resta comunque nulla per la stessa ragione — zero account cliente — ma va dichiarata nel registro come stato lasciato aperto, e chiusa prima di qualunque invito.

### Cosa aggiungere alle controprove finali

Oltre a quelle già previste, dopo l'atto 34: **provare dal vivo che un cliente non scrive le colonne fuori whitelist**, con una sessione customer usa-e-getta smontata nella stessa sessione. Non basta constatare che il trigger esiste.

## Emendamento 3 — L'atto 30 insegue identificativi che la catena stessa ha creato (28/8, ore 21:35)

**Cosa è successo.** Atto 21 applicato com'era, atti 22-29 riusciti. L'atto 30 si è annullato sulla propria guardia: cercava il cliente protetto `70097dcd-…` e lo trovava con 0 pet e 0 visite invece di 1 e 4.

**La causa, misurata.** Gli identificativi di `customers` e `pets` **sono generati dallo split**, cioè da un atto della catena stessa. Quelli scritti nell'atto 30 vengono dallo split eseguito sul banco di prova: sulla produzione lo split ne ha generati altri, e quei tre non esistono. Verificato uno per uno:

| identificativo nel file | esiste in produzione |
|---|---|
| `674521d8-…` cliente in conflitto | **no** |
| `c3614527-…` pet «pincher» | **no** |
| `70097dcd-…` cliente protetto | **no** |
| `ff68e870-…` contatto | **sì** |

L'unico che regge è il contatto, perché `contacts` è una tabella legacy che conserva i propri identificativi. **L'atto 30, così scritto, non poteva funzionare in produzione in nessun caso.**

Il mandato GH-12 lo aveva previsto: *«deve selezionare per criterio misurabile, non per lista di id incollata dove è possibile»*. Il perimetro A l'ha fatto e infatti regge; il perimetro B è stato ancorato agli identificativi, e questo è il costo.

> **Regola che ne discende, valida oltre stasera.** Un atto non può fissare identificativi che un atto precedente della stessa catena genera a caso. Se deve puntare a una riga nata dalla migrazione, la punta per criterio — un nome, un legame, una tabella legacy — mai per identificativo osservato altrove.

**Le àncore stabili.** I nomi sopravvivono allo split. Cercati sui dati, i due clienti si ritrovano e corrispondono alla descrizione di GH-12 riga per riga:

| ruolo | descrizione GH-12 | identificativo in produzione | pet | visite |
|---|---|---|---|---:|
| conflitto | intestato «3275394345», 1 solo pet «pincher», 1 visita | `68462033-9b85-44f5-8ae9-8db7f9a490d1` | pincher | 1 |
| pet del conflitto | — | `2e49f611-1b15-496b-9d8b-6ad0a84990bf` | — | 1 |
| protetto | «Amico di Ernesto 3337261321», reale e attivo | `912c5a1c-1c69-4033-a9f2-fc9eb1fb8443` | Gianni | **4** |

Il cliente protetto è vivo e integro: quattro visite, esattamente come dichiarato il 24 agosto. Il contatto `ff68e870` risulta collegato al pet del conflitto.

**Tutto il resto del perimetro coincide con GH-12**, misurato stasera sullo stato all'atto 29:

| | GH-12 | ora |
|---|---:|---:|
| A: customers / pets / visite / contatti | 7 / 7 / 9 / 7 | **7 / 7 / 9 / 7** |
| A: appuntamenti / reward / foto | 0 / 0 / 3 | **0 / 0 / 3** |
| B: pet / visite / appuntamenti / reward / foto | 1 / 1 / 0 / 0 / 0 | **1 / 1 / 0 / 0 / 0** |
| account Auth nel perimetro | 0 | **0** |

### La correzione

Nel file `supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql`, cinque sostituzioni e nient'altro:

1. `674521d8-b4a9-4543-8377-6a50308073e3` → `68462033-9b85-44f5-8ae9-8db7f9a490d1`
2. `c3614527-8945-4db8-bb13-f683b92ad001` → `2e49f611-1b15-496b-9d8b-6ad0a84990bf` (tutte le occorrenze)
3. `70097dcd-e5aa-4ceb-a15e-3fef04d09960` → `912c5a1c-1c69-4033-a9f2-fc9eb1fb8443` (tutte le occorrenze)
4. stato **prima**: `ROW(268, 290, 462, 295, 7)` → `ROW(268, 290, 466, 295, 7)`
5. stato **dopo**, in entrambi i punti in cui compare: `ROW(260, 282, 452, 287, 0)` → `ROW(260, 282, 456, 287, 0)`

`ff68e870-…` e `cb7f316e-…` **non si toccano**: il primo è un identificativo legacy valido, il secondo è l'utente Auth di Davide.

Poi: ricalcolare l'impronta SHA-256, aggiornarla nel §6 di `GH-30`, riportare vecchia e nuova nel registro, e riprendere dall'atto 30.

### Sulla proposta di riprovare sul banco temporaneo

**Non si fa, e non perché abbiamo fretta.** Il banco di prova è fuori dal perimetro concesso a Codex dopo la riautorizzazione di stasera, ha già la catena applicata, e soprattutto **una nuova prova là genererebbe l'ennesima terna di identificativi diversi**: non validerebbe nulla di ciò che stiamo correggendo. Il collaudo di questa correzione è la guardia del file stesso, che confronta lo stato prima e dopo su diciotto cardinalità. Se una sola delle misure qui sopra fosse sbagliata, l'atto si annulla di nuovo e non scrive niente.

### Verifica fatta sul resto della catena

Cercati gli identificativi fissi in tutti i file della ricetta: **l'atto 30 è l'unico** che ne contiene di generati dalla catena. Gli atti successivi non ripropongono questo difetto.

## Emendamento 4 — Le note sono 41, e 41 è il numero giusto (28/8, ore 21:50)

**Cosa è successo.** La catena è **completa**: atti 30-45 applicati, hardening per ultimo. Il postflight principale coincide senza scarti — **260 customer, 282 pet, 456 visite, 287 contatti**, telefoni completi, 2 servizi attivi, tutti i pet con `qr_token`. Codex si è fermato prima delle sonde RLS e degli Advisor su una sola divergenza: le note staff sono **41 righe** (11 customer + 30 pet) contro le **32** che il registro di GH-32 chiedeva di ritrovare.

**Il 32 è un errore di Cowork, ed è il terzo della stessa famiglia stasera.** L'ho misurato il 28 agosto su `clients.notes`, **prima della catena**, e l'ho scritto come traguardo di un atto che gira **dopo**. In mezzo succedono due cose che quel numero non poteva sapere:

1. la catena **cancella 14 schede legacy** prima di arrivare a GH-32 — 6 di prova all'atto 5, 8 irrecuperabili all'atto 30 — e le loro note se ne vanno con le righe, come deciso il 24 agosto;
2. il **lato customer non era nella mia misura**: `customers.operator_notes` non esisteva ancora e si popola dall'assorbimento dei contatti, una sorgente che contavo zero volte.

**Misurato ora sulla produzione:**

| | valore |
|---|---:|
| righe in `customer_staff_notes` | 11 |
| righe in `pet_staff_notes` | 30 |
| clienti con nota propria | 11 |
| clienti con nota su un pet | 29 |
| **clienti distinti con note** | **38** |
| clienti con note da entrambi i lati | 2 |

Solo due sovrapposizioni: **non è una duplicazione dello split**, sono due sorgenti diverse che confluiscono in due tabelle diverse.

**La garanzia che nulla sia andato perso non è il conteggio: è la migration stessa.** GH-32 copia ogni nota non vuota e **interrompe la transazione su conflitto o mancata corrispondenza**. Ha committato: al momento in cui è girata, il travaso era completo. Le uniche note sparite sono quelle delle righe che abbiamo deliberatamente cancellato, e quelle cancellazioni hanno passato guardie proprie sulle cardinalità.

### La decisione

**Il traguardo corretto del postflight è 41 righe, non 32.** L'indicazione del §9 del registro `GH-32` — *«32 righe complessive nelle due tabelle staff-only»* — è **superata**: era calcolata nel mondo sbagliato. Restano valide e verificate le altre condizioni: zero orfani, entrambe le colonne legacy assenti, trigger direttorio sui due campi superstiti.

**Codex prosegue** con le sonde RLS usa-e-getta, le controprove customer e staff, gli Advisor Security e Performance, la prova viva sulla protezione di `operator_notes`, la prova che un cliente non scrive le colonne fuori whitelist, e la conferma appuntamento riletta nel fuso del salone.

> **La lezione della serata, da portare nel canone.** Tre arresti su quattro hanno la stessa causa: **un numero misurato in un mondo e congelato come traguardo di un altro mondo.** Gli operatori contati dopo la pulizia, le visite contate prima del 25 agosto, le note contate prima delle cancellazioni. Un traguardo non è un numero: è un numero **più il momento in cui vale**. Se il momento non è scritto accanto al numero, il numero è una trappola.
>
> Le guardie hanno funzionato tutte e quattro le volte, e il database non è mai stato lasciato a metà. Il difetto non era nella catena: era nelle mie misure.

---

## Chiusura

Registro in `docs/consegne/` con tutti gli atti, le impronte, le durate e le cardinalità prima e dopo ogni tratto. **Niente push da parte di Codex**: merge, build, push e promozione sono gesti di Luigi.
