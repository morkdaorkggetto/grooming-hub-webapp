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
