# Incarico GH-79 — Il ritratto, ovunque, e inquadrabile

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 12 settembre 2026
**Forma breve (regola 4).** Superficie sola: **nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.**
**Trovato da Luigi usando l'app come cliente.** Superficie: app clienti. File attesi: `apps/customer/hooks/usePets.js`, `pages/Home.jsx`, `pages/Book.jsx`, `pages/Pet.jsx`, `apps/staff/components/ImageCropModal.jsx` da spostare in `shared/`. **Nessuna rotta nuova.**

**Perimetro**: database ammesso **solo il demo**; nessun push, merge o deploy. **Fixture in memoria.**

## Da dove nasce

`GH-77` ha stabilito che la foto di riconoscimento del salone **non compare nell'area del proprietario**. Luigi ha caricato il ritratto di Rumba dall'app clienti e ha trovato due cose.

## 1 — La foto del salone è ancora in tre punti

**Misurato il 12/9**, nell'app clienti:

| dove | cosa mostra |
|---|---|
| **Home**, riquadro «Il tuo pet» | `p.photo_url` — la foto del salone |
| **Prenotazione**, avatar accanto al nome | `pet.photo_url` — idem |
| **`usePets`** | seleziona `photo_url` e **non seleziona affatto `owner_photo_url`** |

**La radice è la terza riga**: l'elenco dei pet **non carica il ritratto**. La Home non sceglie la foto sbagliata — **ha solo quella.**

> **È un buco del mandato precedente, non dell'esecuzione.** `GH-77` diceva *«nell'area clienti non compare più, in nessuna forma»*, **ma tutte le sue controprove parlavano della scheda del pet.** Codex ha provato con precisione quello che gli era stato chiesto, e il suo elenco dei file lo dichiara: `Pet.jsx` e `Pet.css`, nient'altro.

**Correzione:**

- **`usePets` carica anche `owner_photo_url`**;
- **Home e Prenotazione mostrano il ritratto**; se manca, **l'iniziale**, come fa già la scheda del pet. **Mai `photo_url`**;
- **l'album non si tocca**: le occorrenze di `visit.photo_url` in `Pet.jsx` sono le foto di fine lavorazione e sono giuste.

**La controprova non è un esempio: è una ricerca.** Vedi sotto.

## 2 — Il proprietario non può inquadrare il suo ritratto

Il salone può ritagliare la foto: esiste **`ImageCropModal`**, 230 righe, usato da `ClientDetail` e `AddClient`. **L'app clienti non ha nessun ritaglio**: prende il file e lo infila nel medaglione così com'è.

**È al contrario di come dovrebbe essere.** Il ritratto è la cosa a cui il proprietario tiene, ed è l'unica immagine che sceglie lui.

**Correzione: lo stesso ritaglio, anche lato cliente.**

- **il componente si sposta in `shared/`**, non si duplica. **Due ritagli che divergono sono peggio di nessun ritaglio**;
- **le due pagine staff che lo usano oggi continuano a funzionare identiche**: cambia da dove lo importano, non cosa fa. **Dimostralo;**
- **il proprietario ritaglia prima di caricare**, con la stessa inquadratura tonda del medaglione;
- **sul telefono deve funzionare col dito** — è il caso normale per il cliente, e il componente è nato per il desktop del banco. **Se non regge al tocco, dichiaralo** invece di consegnarlo a metà.

> **Non è in questo mandato**: cambiare l'inquadratura di una foto già caricata. Oggi si sostituisce o si toglie, e basta. Se servirà, sarà un giro suo.

## Invarianti

**Nessuna migrazione, nessuna colonna, nessuna policy, nessun dato scritto.** Se ti trovi a scrivere SQL, ti sei perso.

**Nessun permesso nuovo**: la lista dei campi scrivibili dal cliente resta di tre.

**La foto di riconoscimento resta in archivio e resta visibile al salone.** Questo giro cambia chi la guarda, non dove sta — come `GH-77`.

**Il ritaglio non si riscrive**: si sposta. Se durante lo spostamento ti accorgi che va migliorato, **fermati e dichiaralo**: migliorarlo qui cambierebbe anche le due pagine del salone senza che nessuno l'abbia chiesto.

**Nessun colore nuovo, nessuna rotta nuova.** Restano gli invarianti di `GH-54` → `GH-78`.

## Controprove

Dichiara nel registro. **Numeri e testi esatti, più una prova a schermo.**

**Sulla foto, e la prima è la più importante:**

- **ricerca esaustiva in `src/apps/customer`**: **zero** punti in cui si renda `pets.photo_url`. Elenca i file esaminati e riporta il comando. **Le occorrenze ammesse sono solo `visits.photo_url` dell'album**;
- **pet con solo la foto del salone**: Home, Prenotazione e scheda mostrano **l'iniziale**, e l'indirizzo di quella foto **non compare nel DOM** di nessuna delle tre;
- **pet con il ritratto**: le tre pagine mostrano **lo stesso ritratto**;
- **pet con entrambe**: le tre pagine mostrano **il ritratto**, mai l'altra;
- **`usePets` carica `owner_photo_url`**: riporta la selezione prima e dopo.

**Sul ritaglio:**

- **le due pagine staff funzionano identiche**: impronta del comportamento prima e dopo lo spostamento;
- **il proprietario carica e inquadra**: `owner_photo_url` valorizzato, **`photo_url` invariato**, verificato sul valore della colonna;
- **il ritaglio funziona col dito a 375px**: se non regge, **dichiaralo e fermati**;
- **annullando il ritaglio** non si carica niente e la scheda resta com'era.

**E poi:**

- **una prova a schermo con screenshot allegato** di Home e scheda dello stesso pet, con il ritratto. **Se il banco non riesce a renderle, fermati e dichiaralo;**
- **a 375px**: nessuno sbordamento, nessun bersaglio sotto i 44px;
- build verde. **Suite RLS: da non rieseguire** — nessuna policy toccata. Ultima misura viva: `GH-78`, **60 PASS del 12/9**.

## Passo finale — lo guarda Luigi (regola 5)

**Sul telefono**, sulla scheda di Rumba:

1. **Home e scheda mostrano la stessa foto?** È la domanda che ha generato il mandato;
2. **carica un ritratto e inquadralo col dito**: si riesce, o si combatte?
3. **guarda un pet fotografato solo dal salone** — se ne hai uno collegato: da nessuna parte deve comparire quella foto.

La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-79-il-ritratto-ovunque-e-inquadrabile-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
