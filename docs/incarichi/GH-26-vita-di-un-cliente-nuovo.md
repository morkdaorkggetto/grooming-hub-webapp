# Incarico GH-26 — La vita di un cliente nuovo, da capo

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 28 agosto 2026

> **Mandato di ricognizione: si percorre e si riporta, non si ripara.** Anche quando la correzione sembra ovvia e piccola. Le riparazioni arrivano in un mandato successivo, scritto da ciò che questo trova.
>
> L'unica eccezione ammessa è ciò che serve a proseguire il giro, e va dichiarata come tale.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessuna migration, nessun deploy, nessun push. **Database ammesso: solo il demo**; produzione e progetto temporaneo vietati.

## Perché esiste

In un solo giorno sono emersi tre difetti della stessa specie, e nessuno cercandoli:

- `services` vuota in produzione: il wizard non avrebbe avuto nulla da offrire;
- l'app clienti senza porta: inviti e QR portavano al vecchio portale, e la pagina d'accoglienza era un segnaposto;
- il `qr_token` che non si genera per i pet nuovi: il pulsante QR Card risponde parlando di migration.

Hanno in comune una cosa sola: **funzionano sui dati che esistono già e si rompono sul primo dato nuovo.** Le nostre controprove hanno sempre usato Mario, Luna e Pepe — che c'erano da maggio. Nessuna ha mai fatto nascere un cliente e lo ha seguito fino in fondo.

Il 1° settembre Davide farà esattamente quello, con una persona vera davanti.

## Cosa percorrere

Una sola storia, dall'inizio alla fine, sul demo. **Ogni passaggio fatto dal gesto reale nell'interfaccia**, non da query: la domanda non è se il database regge, è se il salone ce la fa.

1. **Nasce il cliente.** Lo staff crea cliente e pet da «Nuovo cliente».
2. **La scheda esiste.** Anagrafica, note, foto — cosa è disponibile e cosa manca su un pet appena creato.
3. **Il QR.** Generazione della card, sua apertura pubblica, e cosa vede chi la inquadra senza essere registrato. *(Difetto già noto: il token non viene generato. Riportare il comportamento esatto e ciò che l'operatore legge a schermo.)*
4. **L'invito.** Generazione del link e **come arriva al cliente**: cosa deve fare materialmente l'operatore per recapitarlo.
5. **Il primo accesso.** Il cliente apre il link, si registra, accetta, atterra.
6. **Il cliente si guarda intorno.** Home, il suo pet, promozioni: cosa vede uno che non ha storico — nessuna visita, nessun punto, nessuna promozione attiva.
7. **La richiesta.** Compila e invia una richiesta di appuntamento.
8. **Il salone la riceve.** Dove compare, quanto è evidente, cosa deve fare per accorgersene.
9. **La conferma.** Giorno, ora e durata scelti dallo staff, messaggio preparato.
10. **Il cliente lo scopre.** Cosa vede nella sua app dopo la conferma — se vede qualcosa.
11. **La lavorazione.** Registrata a lavoro finito dallo staff.
12. **Il cerchio si chiude.** La visita compare nello storico del pet lato cliente, e nel calendario lato salone.

## Cosa riportare, per ogni passaggio

**Cosa succede davvero**, non cosa dovrebbe. E dove qualcosa non funziona o manca: **che cosa vede la persona** — l'operatore o il cliente — con le parole che legge a schermo.

Distinguere tre cose, perché richiedono risposte diverse:

- **rotto**: non si può proseguire, o si prosegue con un dato sbagliato;
- **mancante**: si prosegue, ma manca qualcosa che servirebbe il primo giorno;
- **grezzo**: funziona, ma la persona non capisce cosa deve fare.

Per ciascuno, una **riparazione minima consigliata** con il motivo — nella forma già usata nelle consegne con blocco. Proposta, non applicata.

## Le domande che portano fuori dallo schermo

Alcune risposte non stanno nel codice, e vanno **nominate** anche se non risolvibili qui:

- il link d'invito **come raggiunge il cliente**? Oggi si copia a mano, uno per volta. Con quanti clienti diventa insostenibile?
- dopo la conferma su WhatsApp, il cliente ha modo di **ritrovare** giorno e ora, o deve cercare il messaggio?
- un cliente senza storico vede schermate vuote: **capisce cosa può fare**, o sembra un'app rotta?

## Invarianti del giro

Nessuna migration, nessuna riparazione applicativa, nessuna route toccata. Se qualcosa va sistemato per poter proseguire, **dichiaralo come deviazione** e ripristina alla fine: il diff applicativo di questo mandato dovrebbe essere zero, come in GH-24.

Tutte le fixture create sul demo vanno rimosse nella stessa sessione con controprova di zero residui. Nessun account reale toccato.

## Chiusura

Registro in `docs/consegne/`, con l'elenco dei difetti classificato e ordinato **per quanto farebbe male il 1° settembre**, non per difficoltà tecnica. Da lì si scrive il mandato di riparazione.

Niente push.
