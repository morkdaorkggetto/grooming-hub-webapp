# Incarico GH-51 — Il cartoncino mostra il ritratto del proprietario

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 31 agosto 2026
**Chiude:** la domanda **9.2** di `CD-05`, rimasta aperta. **Da fare prima del primo invito.**

> **Forma breve** (regola 4 del canone): una riga di logica, nessuna colonna nuova, nessun dato toccato.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto

`CD-05` aveva lasciato aperta la domanda **«la card pubblica cosa mostra?»**, propendendo per il ritratto: *«è il cartoncino stampato, l'oggetto del proprietario»*.

Il mandato `GH-50` diceva invece *«sulla card pubblica non cambia niente»*, ed è stato applicato alla lettera — correttamente. Risultato: **una domanda aperta è stata chiusa per omissione**, e oggi il cartoncino mostra la **foto di riconoscimento del salone**, cioè quella fatta apposta per inquadrare il dettaglio storto.

**Decisione di Luigi, 31/8**: il cartoncino mostra il **ritratto del proprietario**. Sua motivazione: *«il cartoncino resta al padrone, e a Davide e Roby interessa il QR in definitiva»* — il codice funziona identico qualunque foto ci sia sopra.

## Invarianti

**La card pubblica mostra il ritratto se esiste; altrimenti la foto del salone; altrimenti il medaglione disegnato.** Tre gradini, in quest'ordine, nessuno saltato: nessun cane che aveva una foto smette di averla.

**Il cambio vive nella funzione pubblica**, non nell'interfaccia. È l'unico posto che serve tutte le card, comprese quelle già stampate.

**Firma e permessi invariati**: `get_public_pet_card` resta pubblica e continua a non richiedere autenticazione.

**Nient'altro cambia sulla card**: nessuna pastiglia, nessun album, nessun conteggio — restano le decisioni di `CD-05`.

**Il testo alternativo dell'immagine resta corretto** rispetto a ciò che mostra.

**La scheda del gestionale non cambia**: al banco resta al centro la foto di riconoscimento. È la stessa distinzione di `GH-50` e non va toccata.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- cane **con solo la foto del salone** → la card mostra quella, come oggi;
- lo stesso cane **dopo che il proprietario aggiunge il ritratto** → la card mostra **il ritratto**, e la foto del salone **è ancora nella sua colonna**, verificata sul valore;
- cane **senza nessuna delle due** → medaglione disegnato, invariato;
- la card resta **raggiungibile senza autenticazione**;
- le **42 foto esistenti** ancora tutte visibili sulle rispettive card: contate prima e dopo;
- build verde; suite RLS invariata.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro: **inquadrare con il telefono il QR di un cane dal gestionale** e verificare che la pagina mostri la foto giusta.

> **Nota, corretta il 31/8**: **nessun cartoncino è ancora stato stampato né consegnato.** Un'affermazione contraria comparsa in `GH-36`, `GH-38` e nel diario era un'inferenza di Cowork da un gesto osservato, non una misura. Le card si stamperanno con la campagna inviti.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy. **La migration in produzione la applica Luigi, o Cowork su sua autorizzazione, prima del rilascio del frontend.**
