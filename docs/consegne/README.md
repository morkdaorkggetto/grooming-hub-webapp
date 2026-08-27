# Consegne Codex

Questa cartella è la sede permanente delle consegne Codex per Grooming Hub.

## Convenzione

- Ogni incarico produce un file separato in questa cartella.
- Il nome segue, quando disponibile, il formato `GH-NN-descrizione-esito.md`.
- Il registro indica almeno: incarico e perimetro ricevuti, base Git, file
  toccati, commit, verifiche, eccezioni, attività fuori istruzione e note aperte.
- Anche un'interruzione motivata è una consegna e viene registrata qui.
- Il file viene creato o aggiornato prima della risposta finale dell'incarico.
- Quando emerge un blocco, la consegna include una **soluzione consigliata a
  Cowork**: causa misurata, modifica minima proposta, file o oggetti coinvolti,
  controprove da eseguire e rischi residui. La proposta deve essere concreta e
  restare nei limiti informativi del mandato; non autorizza Codex ad applicarla.
- Se esistono più strade, Codex indica quella raccomandata e spiega in breve i
  compromessi delle alternative, così il mandato successivo può essere scritto
  senza procedere per tentativi.

## Limite della convenzione

Questa regola stabilisce soltanto **dove documentare le consegne**. Non concede
a Codex autorizzazioni operative permanenti. Branch, ambienti, database,
migration, seed, commit, push, merge e deploy restano soggetti al perimetro e
alle conferme esplicite del singolo incarico.

**Aggiornamento 21/8/2026 (decisione Luigi)**: il registro va **committato nello
stesso commit del codice** cui si riferisce (o in un commit documentale
consecutivo `docs: record GH-NN delivery` se il codice è stato committato
prima). Motivazione: il codice e la sua prova viaggiano insieme, il repo è la
memoria unica, nessuna finestra in cui il push contiene codice senza registro.
Il push resta un gesto di Luigi.

*Regola precedente superata (era: «salvo istruzione diversa le consegne
restano locali»). La nuova convenzione consolida quanto già fatto da Codex in
GH-08 con `bdecf94`.*

## Aggiornamento 24/8/2026 (decisione Luigi) — i mandati non si incollano

**Regola di sistema, permanente.** Gli incarichi non vengono più consegnati per
copia-incolla. Il mandato vive come file in `docs/incarichi/`; Luigi dice
soltanto a Codex di **eseguire l'ultimo elaborato**, e Codex lo trova da sé
nella root del progetto su cui è aperto.

**Definizione di «ultimo elaborato»**: il `GH-NN` di numero più alto presente in
`docs/incarichi/` che non abbia un registro corrispondente in `docs/consegne/`.
Deterministica, calcolabile da Codex, si autocorregge man mano che le consegne
arrivano.

**Prerequisito**: il mandato deve essere raggiungibile da Codex, quindi
**prima il push di Luigi, poi l'ordine di eseguire**. Coincide con la coda già
stabilita il 21/8 (un gesto solo a fine giro), quindi non aggiunge cerimonia.

**In testa a ogni mandato** va dichiarato il progetto di appartenenza e la root.
**Primo atto di ogni sessione Codex**: dichiarare nel registro su quale root sta
lavorando. Se non corrisponde, fermarsi.

**Motivazione misurata (24/8)**: un mandato GH-11 incollato nella sessione Codex
di un altro progetto è stato **eseguito con successo sul database giusto**, perché
il collegamento Supabase è unico per account. L'isolamento fra progetti stava
nella mano che incollava, non nell'infrastruttura. Con questa regola
l'indirizzamento passa alla root del progetto — un confine fisico — e il guasto
peggiore possibile diventa «non trovo nessun task nuovo»: risultato nullo,
innocuo e visibile, invece di un'azione sbagliata riuscita in silenzio.

**Conseguenza per Cowork**: non produce più blocchi di testo da incollare;
chiude indicando dove sta il mandato e che serve il push.

### Come si scrivono i mandati — affinamento del 27/8

Due regole nate dal bilancio dei primi diciotto mandati, non da un principio astratto. Il conto misurato: **un errore di Codex** (il checkpoint attraversato in GH-08, causato dall'ambiguità della parola «fermati») contro **cinque difetti di Cowork** — elenco file incompleto in GH-05, prerequisito omesso in GH-13, contraddizione interna in GH-17, `git add -A` in `salva.sh`, nome di variabile sbagliato in GH-18.

**1. Il mandato dichiara le invarianti, non la procedura.**

Il filo dei difetti di Cowork è univoco: sbaglia dove prescrive **il come**, mai dove dichiara **il cosa**. Un mandato deve quindi definire che cosa dev'essere vero alla fine — quali misure, quali controprove, quali stati vietati — e lasciare a Codex la scelta del metodo, che è la parte in cui è più affidabile di chi scrive il mandato.

Corollario pratico: dove il mandato prescrive una procedura specifica, quella riga è il punto più probabile di errore. Se serve davvero, va verificata due volte.

**2. La dimensione del mandato è inversamente proporzionale alle assunzioni non verificate su cui poggia.**

Non «i mandati piccoli sono più sicuri». GH-17 è stato un mandato unico e ampio — quattro tappe, 2.255 righe riscritte — ed è andato liscio, **perché GH-16 aveva già verificato tutto ciò su cui si appoggiava**. GH-19 ha invece bisogno di una fase separata non per difficoltà tecnica, ma perché nessuno ha ancora inventariato cosa quella schermata sa fare.

Quando gli input sono misurati, il mandato può essere grande. Quando poggiano su documenti non ancora confrontati con la realtà, serve prima la fase che li confronta.

**Perché esistono le fasi di confronto.** Da correggere un'interpretazione facile e sbagliata: le Fasi 1 non hanno mai trovato difetti di Codex — hanno trovato difetti **negli input**. L'operatore inesistente in GH-09, le otto decisioni e la pagina murata in GH-16, i quattro campi caduti nella verifica CD-01. Non sono un controllo sull'esecutore: sono un controllo sulle **assunzioni** di chi scrive mandati e di chi compone. Ogni volta che un documento è stato confrontato con la realtà, la realtà era diversa.

**Cosa non si tocca**, perché è ciò che ha retto: la regola che **un'interruzione motivata è una consegna valida**, e il diario che conserva le decisioni con la loro fonte. Senza la prima, GH-11 avrebbe fatto un restore su un database popolato e GH-17 avrebbe obbedito a metà di una contraddizione. Il prodotto vero di questo metodo non è il codice, che si riscrive: è una catena di decisioni tracciabile.

**Il rischio da presidiare**: mandati più ampi tolgono il battito in cui Luigi legge un registro prima di autorizzare il seguito, ed è lì che molti difetti sono stati intercettati. Quel battito va conservato dove gli input non sono verificati — non ovunque per abitudine.

### Due serie distinte: `GH-` per Codex, `CD-` per Claude Design (24/8)

**Decisione Luigi.** Gli incarichi ai due attori usano prefissi diversi e contatori separati:

| Prefisso | Destinatario | Natura | Esito |
|---|---|---|---|
| `GH-nn` | **Codex** | mandato di implementazione | codice + registro in `consegne/` |
| `CD-nn` | **Claude Design** | brief di composizione | handoff + bundle di riferimento |

**Conseguenza sulla regola «ultimo elaborato»**: si applica **solo alla serie `GH-`**. Codex non deve mai considerare un `CD-` come lavoro proprio. Questo elimina alla radice l'ambiguità, invece di affidarla alla lettura attenta.

Le misure di supporto prodotte da Cowork non sono incarichi e conservano il nome del mandato che servono (esempio: `GH-15-verifica-schema-campi-dubbi.md`).

**Eccezioni storiche, non si rinominano**: `GH-03-brief-claude-design.md` e `GH-15-brief-claude-design-veste-staff.md` erano brief per Claude Design nati dentro la serie `GH-`, quando la distinzione non esisteva. Restano com'è: sono citati da troppi registri e riscrivere la storia costerebbe più della piccola irregolarità. Il prossimo brief a Claude Design sarà `CD-01`.

*Nato dalla domanda di Luigi del 24/8: «GH-15 è di CD?». Se la domanda si pone, il nome non sta facendo il suo lavoro.*

### Eccezione: mandati depositati ma non attivati (24/8)

Un mandato può essere **scritto in anticipo** e restare in attesa di condizioni
esterne (decisioni, verifiche umane, finestre operative). Poiché vive nella
stessa cartella di quelli eseguibili, «ultimo elaborato» da solo non basta a
distinguerlo.

**Regola**: un mandato che agisce sulla **produzione**, o che dipende da
cancelli non ancora soddisfatti, porta in testa un blocco
`⛔ NON ESEGUIBILE SU ORDINE GENERICO` e richiede un'istruzione **esplicita e
nominativa** di Luigi. Raggiunto per scorrimento numerico, Codex si ferma, lo
dichiara, e considera corrente il primo `GH-NN` precedente ancora privo di
registro.

*Nato da GH-14 (atto G6): scritto il 24/8 con i cancelli ancora aperti.*
