# Incarico GH-109 — La tessera in cima alla Home

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 2 ottobre 2026
**Nasce da:** la decisione di Luigi del 2/10 (*la tessera è la prima cosa che si vede aprendo l'app*) e la composizione **CD-11**, consegnata il 2/10 in `docs/consegne/CD-11-consegna/`.

**Perimetro**: `src/apps/customer/pages/Home.jsx`, i componenti della tessera di `GH-107`/`GH-108` (`PetCard*.jsx`, `pet-card.css`), `components/PendingRequest.jsx` solo se serve a riusarlo dentro il foglio, e i loro stili. **Nessun database, nessuna migrazione, nessuna policy.** Dati di prova temporanei sul demo **ammessi**, con ripristino a zero. Nessun push, merge o deploy. Base: `c71240d`.

## La decisione, come l'ha composta CD

CD ha trovato una forma migliore della richiesta iniziale (handoff §2): **la tessera non è una pagina davanti alla Home, è la cima della Home**, per chi ha un cane solo. L'app si apre su `/u/home` come sempre: **nessun reindirizzamento cambia**.

## Il contratto

**`docs/consegne/CD-11-consegna/CD-11-handoff.md`**, con `cd11-home-kit.jsx`. Tutto CD-10 resta valido, testata a parte. In sintesi:

- **un cane solo**: testata senza «indietro» e senza saluto; **avviso** se c'è qualcosa da fare; **la tessera intera**; «Mostra al banco»; l'invito; poi il resto della Home **invariato** (prossimo appuntamento, prenotazione, promozioni). Tolte la striscia della tessera e le schede delle richieste da fare;
- **più cani**: in cima le richieste da fare **con il nome del cane**, poi le strisce delle tessere, poi il resto. La pagina della tessera di CD-10 resta, con il suo «indietro»;
- **l'avviso** (§3): una riga, nessuna pila, nessuna ×, sparisce quando il gesto è fatto;
- **il foglio dal basso** (§4) quando si tocca l'avviso;
- **il QR sulla tessera si tocca** e apre la stessa modalità banco del pulsante (§7).

## Tre precisazioni di Cowork

**1. Cosa è «da fare»: la definizione c'è già, usala.** La Home oggi mostra al proprietario due schede che chiedono un gesto: le proposte del salone da scegliere (`PendingRequest`) e la richiesta da riprogrammare (`rejectedRequest`, `Home.jsx` intorno alla riga 387). **L'avviso e la Home di chi ha più cani leggono la stessa definizione**, ricavata una volta dal codice: *le due sorgenti devono essere d'accordo* (canone §3, le cinque domande, n. 3). Una richiesta in attesa del salone e un appuntamento confermato **non** sono da fare. **Verificala per prima**, e se trovi più di una definizione, fermati.

**2. Il foglio non duplica i percorsi che esistono.** CD scrive che la scelta di giorni e fasce «la prende Codex dal flusso che esiste già». Precisazione:

- **proposte del salone**: il foglio contiene **il componente `PendingRequest`**, o le sue parti, con le stesse funzioni e gli stessi messaggi di oggi. Nessuna logica di risposta nuova;
- **data non disponibile**: oggi la Home porta al percorso di prenotazione (`/u/book?petId=…`), che controlla chiusure, capienza e richieste doppie. **Non rifare quel percorso dentro il foglio.** Se riesci a ospitarlo nel foglio così com'è, bene; altrimenti il foglio ha il titolo e il perché di CD e un pulsante che porta al percorso di prenotazione. **Scegli e dichiara.**

**3. Il numero delle richieste.** CD ha composto «**Due** richieste aspettano te». Rendilo generale: «{n} richieste aspettano te», con il numero in lettere fino a dieci, e il pallino sulla campanella. **Una richiesta sola** usa il testo del suo caso.

## Cosa non torna, già dichiarato da CD e accettato

- Sui telefoni alti 667px, con l'avviso, «Mostra al banco» finisce sotto la barra (handoff §8.1): il QR si tocca e resta nel primo schermo;
- con ritratto e livello la tessera è al limite già a 812 (§8.2);
- chi ha un cane solo perde il saluto (§8.3).

Misura tu queste tre cose sul rendering, e riporta i numeri accanto a quelli di CD (§5).

## Cosa non è in questo incarico

- **La modalità banco**, la tessera e la sua griglia: CD-10, invariate.
- **La regola dei livelli** e il Bronzo proiettato.
- **Il gestionale**: nessun diff sotto `src/apps/staff`.
- **L'apertura dell'app dall'icona sul telefono** di `GH-107`: invariata.

## Invarianti

- **Nessun gesto del proprietario si perde**: ogni richiesta che oggi la Home mostra come «da fare» resta raggiungibile, dall'avviso o in cima alla Home.
- **Prossimo appuntamento, prenotazione, promozioni**: presenti come oggi, sotto.
- **Nessun colore nuovo**: i token warning esistono già (`index.css`, righe 47-49).
- **Bersagli** almeno 44px; gesto principale 54px.

## Controprove

Dichiara nel registro. **Testi esatti e misure.** Dati di prova sul demo, ripristino a zero.

- **definizione di «da fare»**: la sorgente unica e i suoi casi; avviso e Home di più cani la usano entrambe;
- **un cane, niente da fare**: nessun avviso; tessera in cima; niente saluto, niente striscia; sotto, il resto della Home;
- **un cane, proposte del salone**: avviso «Scegli un orario» → foglio → scelta di un orario → **la richiesta passa allo stato di oggi** e l'avviso sparisce. Anche «nessuno va bene»;
- **un cane, data non disponibile**: avviso «Scegli un'altra data» → il percorso che hai scelto → richiesta nuova inviata → avviso sparito;
- **un cane, due e tre richieste insieme**: un avviso solo, testo e numero giusti, foglio con una riga per richiesta;
- **una richiesta in attesa del salone**: nessun avviso;
- **più cani**: richieste in cima con il nome, poi le strisce, poi il resto; la pagina della tessera con «indietro»;
- **QR toccato**: apre la modalità banco, identica a quella del pulsante;
- **le misure del §5 di CD** sul rendering, a 375×812, 375×667, 320×568;
- **le controprove di `GH-107` e `GH-108`** ripetute con i loro script: tutte PASS;
- schermate dei casi sopra **accanto alle tavole di CD-11**;
- build verde. **Suite RLS: non serve** se non aggiungi letture; se ne aggiungi una, rieseguila.

## Passo finale — lo guarda Luigi

Apri l'app sul telefono: **vedi la tessera di Rumba appena entri?** E se c'è una richiesta che aspetta te, la noti senza cercarla?

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-109-la-tessera-in-cima-alla-home-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
