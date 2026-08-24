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
