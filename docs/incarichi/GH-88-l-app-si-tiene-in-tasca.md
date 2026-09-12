# Incarico GH-88 — L'app si tiene in tasca

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto, nessuna rotta.**
**Superficie**: `index.html`, una cartella `public/` che oggi non esiste.

**Perimetro**: nessun database, nemmeno il demo. Nessun push, merge o deploy. **Fixture in memoria.**

> **Blocca il lancio.** Prima di mandare il link a trecentoventi persone, l'app deve poter essere tenuta.

## Da dove nasce

Misurato il 12 settembre:

- **non esiste la cartella `public/`**;
- **non esiste nessun manifest**;
- `index.html` dichiara `<link rel="icon" href="/vite.svg" />` — il segnaposto di Vite. **Quel file non esiste**: in produzione l'app non ha nemmeno una favicon;
- il titolo è `🐕 Grooming Hub`, con l'emoji.

Le conseguenze sono due, e la seconda è quella che conta.

**La prima**: chi apre il link vede una scheda senza icona e con un'emoji nel titolo.

**La seconda**: **l'app non si può aggiungere alla schermata Home.** Chi la riceve la apre una volta e poi deve ritrovare il messaggio WhatsApp per riaprirla. Un servizio che si usa ogni due mesi, e che si trova solo scorrendo una chat vecchia, **non si usa.**

E c'è un terzo motivo, che oggi non serve ma che questo mandato apparecchia: **senza manifest e senza installazione non esistono le notifiche a app chiusa**, che è l'unico modo per avvisare il salone la sera.

## Cosa fare

### Un manifest solo

Le due app vivono sulla stessa origine, e `/` smista già per ruolo: `/dashboard` per l'operatore, `/u/home` per il cliente. **Quindi `start_url` è `/`**, e un manifest solo serve entrambi. **Non farne due.**

Il resto — nome, nome breve, `display`, `scope`, `background_color` — lo decidi tu e **lo dichiari con il motivo**. Il nome è quello che una persona legge sotto l'icona sul proprio telefono: **non è il nome del repository.**

### L'icona si ricava, non si inventa

Il marchio esiste: `src/shared/ui/Brandmark.jsx` — quadrato arrotondato, zampa, `--color-primary` **`#6f9792`**.

**Derivane le icone da lì**, fedelmente. Servono le misure per gli store dei sistemi operativi e **la variante mascherabile**, che su Android viene ritagliata: se il margine è sbagliato, la zampa perde le dita. **Dichiara le misure prodotte e perché.**

**iOS ignora le icone del manifest** per l'aggiunta alla schermata Home e usa il proprio collegamento dedicato: se manca, il sistema mette una miniatura della pagina. **Va messo.**

### Il colore dichiarato e il colore vero

`index.html` dichiara `theme-color` **`#d4a574`**, un sabbia arancione. Il marchio è **`#6f9792`**, verde.

**Uno dei due è sbagliato, e non decidi tu quale**: misura dove ciascuno dei due compare oggi nell'interfaccia, **riporta la misura e proponi**. Se non è dimostrabile quale sia quello giusto, **fermati e dichiaralo**: lo decide Luigi.

### Il titolo

`🐕 Grooming Hub` diventa un titolo. **L'emoji esce**: è il nome che compare nella scheda del browser, nei preferiti e nella cronologia.

### Il caso iOS, da misurare non da assumere

Su iPhone, un'app aggiunta alla schermata Home **può avere un deposito separato da Safari**. Se è così, chi l'aggiunge **si ritrova a dover rifare l'accesso dentro l'icona**, anche se in Safari era già dentro.

**Misuralo e dichiaralo.** Non ripararlo qui: se il comportamento c'è, è un mandato successivo — e cambia le istruzioni che daremo ai clienti al lancio.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato, nessuna rotta, nessuna dipendenza nuova.**

**Nessun colore nuovo**: le icone usano i colori del marchio esistente.

**Nessuna schermata dell'app cambia.** Se un diff tocca qualcosa sotto `src/apps`, **fermati e dichiaralo**.

**Nessuna libreria di generazione PWA**: il manifest è un file, le icone sono immagini. Se ti trovi a installare un plugin, ti sei perso.

**Restano gli invarianti di `GH-54` → `GH-87`.**

## Controprove

Dichiara nel registro. **File e misure, non aggettivi.**

- **il manifest per intero**, campo per campo, **con il motivo di ciascuna scelta**;
- **ogni icona prodotta**: nome, misura, peso, e **l'impronta**;
- **la mascherabile**: la prova che dentro la zona di ritaglio il marchio resta intero. Una prova a schermo, non un'affermazione;
- **il collegamento icona di iOS**: c'è, e a quale file punta;
- **`/vite.svg` non è più referenziato**: ricerca esaustiva, con il comando;
- **il titolo nuovo**, per esteso, **senza emoji**;
- **i due colori**: dove compaiono oggi, la misura, e la tua proposta. **Se non è dimostrabile, fermati**;
- **su Android e su iPhone**: cosa vede una persona che aggiunge l'app alla schermata Home — nome sotto l'icona, icona, e se si apre a schermo intero o dentro il browser. **Prove a schermo**;
- **il deposito separato su iOS**: misurato, con l'esito;
- **`start_url` porta al posto giusto per entrambi i ruoli**: misura le due destinazioni partendo da `/` con una sessione operatore e con una sessione cliente;
- **nessun diff sotto `src/apps`**: dimostralo;
- build verde, e **il manifest e le icone sono nel pacchetto costruito** — non solo nel repository. Verifica dentro `dist/`;
- **Suite RLS: da non rieseguire**, questo mandato non tocca dati né permessi. Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Sul telefono, dal link vero:**

1. **aggiungi l'app alla schermata Home**: l'icona è la nostra, o è una miniatura della pagina?
2. **chiudi tutto e riaprila dall'icona**: si apre dove ti aspetti? Sei ancora dentro?
3. **fallo fare a Paola** senza spiegarle come: ci arriva?
4. **e la domanda che conta**: fra due mesi, quando le servirà, **saprà dove trovarla?**

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-88-l-app-si-tiene-in-tasca-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
