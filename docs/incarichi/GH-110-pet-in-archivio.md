# Incarico GH-110 — Pet in Archivio

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.2.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 17 ottobre 2026
**Nasce da:** una domanda di Davide: *a cosa si riferisce «Clienti attivi», e perché a volte sale e a volte scende?*

**Perimetro**: `src/apps/staff/pages/Dashboard.jsx`, una sola stringa. **Nessuna scrittura sul database, nessun dato di prova, nessuna altra pagina.** **Ammessa la lettura del demo**, aprendo la dashboard con l'account staff di prova, per le verifiche a schermo. *(Precisazione di Cowork del 17/10, su domanda di Codex: la prima stesura diceva «nessun database» e insieme chiedeva il confronto sul demo.)* Nessun push, merge o deploy. Base: `65c48cd`.

## Da dove nasce

Nella dashboard, la prima casella del riepilogo dice «Clienti attivi» (`Dashboard.jsx:196`). Il valore è `clients.length`, dove `clients` viene da `getAllPets()` (`database.js:551`): **tutte le schede cane del salone, senza filtri**. Non conta i proprietari e non guarda se il cane è venuto di recente.

Misure di Cowork nel prodotto, 16/10: **411 schede cane**, 380 proprietari, 22 cani senza nessuna visita. Il numero sale quando si crea una scheda e scende quando se ne cancella una.

**Il nome sbaglia due volte**: non sono clienti ma cani, e non sono solo gli attivi ma tutti.

## Cosa fare

**Decisione di Luigi e Davide del 17/10:** la casella si chiama **«Pet in Archivio»**.

Cambia la sola etichetta in `Dashboard.jsx`: `label: 'Pet in Archivio'`. Il maiuscolo lo fa già l'occhiello (`Eyebrow`, in `StatStrip`): **non scriverlo a mano**. A schermo si leggerà «PET IN ARCHIVIO», come oggi si legge «CLIENTI ATTIVI».

**Il valore non cambia**, e nemmeno la riga sotto («N con score positivo»).

## Controprove

- **ricerca** di «Clienti attivi» in `src/`: dopo, zero risultati;
- **la casella a schermo**, a 375px e a 1365px: «PET IN ARCHIVIO», nessun troncamento, nessuno sbordamento accanto alle altre due;
- **il valore** uguale prima e dopo, sullo stesso demo;
- build verde. Nessun'altra prova: è una stringa.

## Chiusura

Registro breve in `docs/consegne/GH-110-pet-in-archivio-esito.md`, committato col codice. Niente push.
