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

**6. Dump fresco.** Tre file, la stessa procedura del 21 agosto, con Docker in funzione. Quelli del 21/8 restano sulla Scrivania come secondo paracadute — verificati presenti il 28/8 — e il piano Pro fornisce il terzo con i backup giornalieri.

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
| visits | 464 |
| contacts | 301 |
| utenti auth | 6 |
| appointments | 17 |
| profiles | 4 |
| migration registrate | 10, ultima `20260423123000` |

Più: **l'impronta SHA-256 di ogni file della ricetta**, confrontata con quella dichiarata nel §6 di GH-30, e le impronte dei tre dump freschi.

**Se una sola misura o impronta diverge, fermarsi e consegnare un'interruzione motivata.** La ricetta è calibrata su questa fotografia esatta, misurata il 24 e riconfermata il 27 agosto.

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
| visits | 452 |
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

## Chiusura

Registro in `docs/consegne/` con tutti gli atti, le impronte, le durate e le cardinalità prima e dopo ogni tratto. **Niente push da parte di Codex**: merge, build, push e promozione sono gesti di Luigi.
