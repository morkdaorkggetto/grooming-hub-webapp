# Incarico GH-19 — Il calendario: inventario funzionale e confronto

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 agosto 2026
**Prerequisito:** `GH-18` chiuso e consegnato. Se non lo è, fermarsi e dirlo.
**Struttura:** Fase 1 con fermata obbligatoria. L'esecuzione sarà un mandato separato.

## Regola d'ingresso

**Primo atto**: dichiarare nel registro la root. Se non è `grooming-hub-web`, fermarsi. Una sola sessione.

**Nessun database, nessuna migration, nessun deploy, nessun push.** Fase documentale.

## Fonti

1. `design_handoff_staff_app/cd01-calendario/CD-01-handoff.md` — la composizione di Claude Design, dieci sezioni.
2. `design_handoff_staff_app/cd01-calendario/` — i file di composizione: `cd01-cal-kit.jsx`, `cd01-cal-viste.jsx`, `cd01-cal-note.jsx`, più il canvas.
3. `docs/incarichi/CD-01-verifica-schema-campi-dubbi.md` — **verifica Cowork degli undici campi ⚠, già fatta. Non rifarla: usala.**
4. `design_handoff_staff_app/GH-15-handoff.md` — il ceppo da cui il calendario eredita densità, tipografia e geometria.
5. L'implementazione corrente: `src/apps/staff/pages/Calendar.jsx`, 1.572 righe.

## Perché questa fase esiste, e in cosa differisce da GH-16

Su Dashboard e scheda cliente il rischio era **toccare abitudini**: Davide e Roby le usano ogni giorno. Qui il rischio è opposto e più insidioso.

Il calendario è fermo dal 23 aprile, quindi non c'è memoria muscolare da proteggere — ed è per questo che CD ha avuto mandato di **ripensarlo**, non di rivestirlo: niente griglia oraria, tre tipi di oggetto, un giorno alla volta sul telefono.

Ma dentro quelle 1.572 righe vive del **comportamento reale**, scritto e collaudato, che nessuno ha inventariato: creazione e modifica di appuntamenti, gestione degli stati, no-show, navigazione settimanale, forse altro. Una composizione nuova può, senza che nessuno se ne accorga, **far sparire una funzione che serviva** — e nessuno se ne accorgerebbe subito, proprio perché quella vista non la guarda nessuno da mesi.

**Il compito della Fase 1 è quindi l'inventario funzionale prima del confronto estetico.**

## Cosa produrre

### 1. Inventario di ciò che il calendario fa oggi

Ogni azione che l'utente può compiere, ogni stato che la vista può assumere, ogni lettura e scrittura verso il database. Non «com'è fatto», ma **cosa permette di fare**. Per ciascuna voce: dove si trova, cosa fa, e se la composizione CD la prevede.

Esito per ogni funzione, dichiarato:

- **coperta** — la composizione CD la prevede, cambia solo la forma;
- **non coperta, da conservare** — esiste, serve, e la composizione non la contempla: va portata dentro, e come è una domanda per Luigi;
- **non coperta, da lasciare cadere** — esiste ma è un residuo di un uso mai avvenuto: proponilo con il motivo misurato, non deciderlo.

Questa terza categoria richiede prudenza: 17 appuntamenti in tutto e zero da maggio significano che quasi tutto qui è stato usato pochissimo. **Poco usato non vuol dire inutile**: qualcosa serviva quando il calendario era vivo, e servirà di nuovo quando le richieste dei clienti lo riempiranno.

### 2. Tabella degli scostamenti compositivi

Sul modello di GH-16: una riga per area, esito `allineare` / `tenere` / `decisione a Luigi`, motivo misurato. Copri la grammatica dei tre oggetti, le due viste, gli stati, il responsive a 640px, la modale di conferma, la coda delle richieste, la striscia di chiusura settimana.

### 3. Conferma della verifica campi

La verifica Cowork dice: otto campi su undici esistono; **`appointments.scheduled_at` contiene l'ora**, quindi i tre oggetti reggono. Confermala dal codice o segnala la divergenza — e se ne trovi una, fermati: significa che una delle due misure è sbagliata.

**Due campi non esistono e non si compensano in nessun modo:**

- **traccia dell'invio del messaggio.** Non esiste alcuna tabella di messaggi né campo `sent_at`. L'app costruisce un collegamento `wa.me` e lo apre: l'invio avviene fuori dall'applicazione. «Confermato» resta dichiarato e non verificabile. Non inventare una traccia, nemmeno derivandola dall'apertura del collegamento.
- **promozioni.** La tabella `promotions` esiste ma è vuota in produzione. CD non le ha composte: non comporle nemmeno tu.

E per la terza volta in tre giri: **`visit.operator` non esiste.** Il campo «Chi lavora» presente nella modale di conferma della composizione **va rimosso**, non reso opzionale.

### 4. Le decisioni che servono a Luigi

Raccogli in fondo, numerate, con la tua raccomandazione e il motivo — come in GH-16, dove le otto decisioni hanno fatto risparmiare un giro intero. Includi le domande aperte di CD che dipendono dal codice e non dal salone.

Non risolverle. La tabella approvata da Luigi sarà il contratto della fase esecutiva.

## Vincoli che valgono già da ora

- Nessuna route nuova: la conferma è una modale, non una pagina.
- Nessun colore nuovo oltre i tre di GH-15, di cui il calendario usa solo i due bordi.
- Il testo scritto dal salone si stampa **verbatim**: «bagnetto» resta «bagnetto», e non si normalizza né si mappa su un catalogo. Dentro quel campo c'è anche il diario — «non è venuto», «ha saltato l'appuntamento» — e nessuna classificazione automatica va introdotta.
- Nessuna ora dedotta per le lavorazioni registrate: `visits.date` è di tipo `date` e la colonna resta muta.

## Chiusura

**Consegna il registro della Fase 1, chiudi la sessione e attendi un mandato separato.** Non iniziare l'esecuzione, nemmeno se il lavoro appare ovvio, nemmeno se ricevi un messaggio che suona come un'approvazione generica.
