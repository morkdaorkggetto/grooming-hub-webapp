# Incarico GH-50 — Le tre fotografie: esecuzione della composizione CD-05

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 31 agosto 2026
**Realizza:** la composizione `CD-05`, consegnata da Claude Design.
**Superfici:** scheda cane nell'**app clienti** (`/u/pet/:id`), scheda cane nel **gestionale**, registrazione visita. **Nessuna rotta nuova.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy.

## Dove sono i materiali

`Prototipo/CD-05-consegna/` — fuori dal worktree: `CD-05-handoff.md`, `cd05-foto-kit.jsx`, `cd05-foto-viste.jsx`, `cd05-foto-note.jsx`, il canvas. **Da versionare in `design_handoff_customer_app/`.**

`Ph` è un **segnaposto di composizione** e non va portato in produzione.

---

## Il fatto: una colonna sola per tre cose diverse

Oggi esiste **una** fotografia per cane, `pets.photo_url`, e ci finiscono dentro tre cose in conflitto:

| | chi la mette | a cosa serve |
|---|---|---|
| **riconoscimento** | il salone | distinguere *questo* barboncino nero dagli altri undici |
| **ritratto** | il proprietario | il suo cane come lo vede lui |
| **album** | il salone, una per lavorazione | il cane dopo il bagno |

**Parole del salone**: la loro foto non è un ritratto — inquadra il dettaglio storto, la macchia, l'orecchio piegato. Se il proprietario la sostituisce con la posa migliore, restano «mille barboncini che si assomigliano tutti». **Parole di Luigi**: mettere la foto del proprio cane è il gesto per cui una persona riapre un'applicazione, e rinunciarci significa rinunciare all'unica interazione affettiva del prodotto.

`GH-49` ha protetto il salone togliendo `photo_url` dai campi scrivibili dal cliente. **Era una difesa temporanea: questo mandato la scioglie dando a ciascuno la propria colonna.**

## Le due colonne nuove

`CD-05` le dichiara in testa — **è la prima volta in cinque giri che una composizione chiede uno schema nuovo**, e la composizione non si regge senza:

- **`pets.owner_photo_url`** — il ritratto, scritto dal proprietario;
- **`visits.photo_url`** — la foto dell'album, **una per lavorazione**.

`pets.photo_url` **resta e diventa esplicitamente del salone**. Il permesso tolto al cliente da `GH-49` **non va ripristinato: va spostato** sulla colonna nuova.

## Risposte alle domande aperte di CD-05

| | Domanda | Risposta |
|---|---|---|
| 9.1 | le due colonne si aprono? | **sì**, sono il punto del mandato |
| 9.2 | una foto per lavorazione o più? | **una**. Un bagno una foto è un ritmo; quattro sono un servizio fotografico che a fine serata nessuno farà |
| 9.3 | le 42 foto sono tutte del salone? | **sì, misurato**: nessun cliente ha mai avuto una membership, quindi nessun proprietario ha mai potuto caricarne una. Il caso che temeva non esiste |
| — | esisteva un canale di caricamento dal cliente? | **sì**, nello spazio di archiviazione: `pet-avatars` ha i permessi per il cliente sui propri cani. Mai usato perché non c'erano clienti |
| 9.4 | la foto allegata si può togliere? | **sì, lato salone**, dentro la visita. Una foto sbagliata a fine giornata è un caso normale |
| 9.5 | il proprietario può togliere una foto dal suo album? | **no, per ora.** Nascondere-solo-per-sé è raffinato ma è complessità che nessuno ha chiesto. Da riportare come coda |

## Invarianti

**Ciascuna fotografia ha una colonna sua, e nessuna sovrascrive l'altra.** È l'invariante che dà senso a tutto il resto e va provata dal vivo: il proprietario mette la sua, e quella del salone **è ancora lì**.

**Chi scrive cosa**: il salone scrive `pets.photo_url` e `visits.photo_url`; il proprietario scrive **solo** `pets.owner_photo_url`. La whitelist passa da due campi a tre — `owner_notes`, `coat_preferences`, `owner_photo_url` — **e nient'altro**. Nessun ripristino di `photo_url`.

**Chi sta al centro dipende da chi guarda, e non è configurabile.** Al banco il riconoscimento, nell'app il ritratto. Non è una preferenza: è la stessa scheda letta da due persone che cercano cose diverse.

**Quando la seconda foto non c'è, la pastiglia non c'è.** Nessun cerchietto vuoto, nessun «+» in attesa.

**Album vuoto significa nessun pulsante**, non un pulsante spento. Al suo posto una riga: *«Dopo il prossimo bagno troverai qui la sua foto»*. Oggi sarebbe spento su **288 cani su 288**.

**Una foto sola non si mette in griglia**: occupa la larghezza intera.

**La galleria è una sovrapposizione, non una pagina.** Nessuna rotta nuova.

**Sulla card pubblica non cambia niente**: nessuna pastiglia, nessun album, **nemmeno il numero delle foto**. Il medaglione di `CD-04` resta quello che è.

**Il verbo del salone è «allega», mai «scatta»**, e il posto è **la registrazione della visita**, non una schermata sua. La fotografia esiste già: la fanno per mandarla su WhatsApp, e la registrazione avviene a fine serata con i cani già consegnati. **Se la composizione chiede uno scatto sul momento, non accadrà mai.**

**Facoltativo e senza sollecito.** Nessun «hai dimenticato la foto». Se allegare diventa un dovere, quello che si perde non è la foto: è la registrazione della visita.

**L'invito al proprietario arriva solo dopo la prima foto del salone.** Chiedere prima di aver dato è la regola di `CD-04`.

**Nessun testo dei trattamenti sotto le foto**: quel campo è un diario e a volte dice «non è venuto».

**Le 42 foto esistenti non si muovono e non cambiano significato**: erano e restano del salone.

**I permessi delle foto nuove seguono `pet-avatars`**, non il secchio legacy: percorsi verificati contro il database, niente scritture fuori dal proprio salone. `GH-45` ha chiuso `client-photos` proprio per questo.

## Cosa non decidi tu

I quindici punti del §7 di `CD-05` sono dichiarati deliberati. **Non sono da migliorare.** Se uno ti sembra sbagliato, fermati e dichiaralo.

Le parole del §10 sono **approvate**, comprese le due che fanno il lavoro più delicato:

> «La foto piccola è quella che usiamo noi al banco per riconoscerlo. Toccala per scambiarle.»

> «Questa è la foto che facciamo noi, per riconoscerlo. Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto.»

La prima trasforma una foto sgraziata in un segno di mestiere; la seconda promette al proprietario che la sua non cancella niente. **Sono la ragione per cui questo mandato non genera un conflitto fra salone e cliente.**

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- il proprietario carica il **ritratto**: la foto del salone **è ancora lì**, verificata sul valore della colonna, non a schermo;
- il proprietario **non riesce** a scrivere `photo_url` né `visits.photo_url`, provato chiamando direttamente;
- il salone allega una foto alla visita e **la rimuove**;
- gli **otto stati** di `cd05-foto-viste.jsx` resi dal vivo, a partire dai tre probabili;
- **album vuoto: nessun pulsante**, e la riga al suo posto;
- **album con una foto**: larghezza piena, non griglia;
- la **card pubblica invariata**: nessuna pastiglia, nessun album, nessun conteggio — confrontata prima e dopo;
- un cliente **non vede né tocca** foto di cani che non sono suoi;
- le **42 foto esistenti** ancora tutte visibili, contate prima e dopo;
- build verde; suite RLS estesa con i casi nuovi.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro, tre cose da fare con gli occhi **sul telefono**:

1. una scheda **senza nessuna foto** — l'85% dei cani — che non deve sembrare rotta né in attesa;
2. una scheda con **entrambe**, toccando la pastiglia per scambiarle, leggendo la riga che lo spiega;
3. l'**album con una foto sola**, che è lo stato più probabile per mesi.

## Chiusura

Registro in `docs/consegne/`, committato col codice, con i materiali di `CD-05` in `design_handoff_customer_app/`. Niente push, niente merge, niente deploy.
