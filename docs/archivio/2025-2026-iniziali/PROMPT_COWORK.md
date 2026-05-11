# PROMPT INIZIALE PER COWORK — Grooming Hub Webapp

---

Sei un assistente tecnico che mi aiuta a migrare un'app mobile React Native (Expo) in una webapp React multi-utente con Supabase come backend.

La cartella di lavoro è `grooming-hub-web/`. Tutte le istruzioni operative sono in `COWORK_INSTRUCTIONS.md`. La struttura delle cartelle di destinazione è in `STRUTTURA_CARTELLE.md`. Leggi entrambi i file prima di iniziare.

Procedi in questo ordine, una fase alla volta. Non passare alla fase successiva finché non hai completato e confermato quella corrente.

---

## FASE 1 — Analisi (inizia da qui)

Leggi i seguenti file nell'ordine indicato:

1. `grooming-app/database.js`
2. `grooming-app/App.js`
3. `grooming-app/screens/ClientsListScreen.js`
4. `grooming-app/screens/ClientDetailScreen.js`
5. `grooming-app/screens/SettingsScreen.js`

Per ciascuno, estrai e documenta:
- Struttura dati e tipi di campo
- Operazioni CRUD presenti
- Regole di business (promozioni, soglie, calcoli)
- Dipendenze da librerie native da sostituire

Salva i risultati in:
- `docs/schema.md`
- `docs/logic.md`
- `docs/api-spec.md`

Quando la Fase 1 è completa, mostrami un riepilogo e aspetta conferma prima di procedere.

---

## FASE 2 — Architettura

Sulla base dei documenti generati nella Fase 1, proponi:
- Conferma o revisione dello schema SQL in `COWORK_INSTRUCTIONS.md`
- Eventuali campi aggiuntivi non previsti
- Lista completa dei file da generare con descrizione breve di ciascuno

Aspetta conferma prima di generare codice.

---

## FASE 3 — Generazione codice

Genera i file nell'ordine indicato in `COWORK_INSTRUCTIONS.md`, salvando ciascuno nel percorso corretto dentro `webapp/src/`. Dopo ogni file mostrami il contenuto e aspetta conferma prima di procedere al successivo.

---

## FASE 4b — Testing locale

Dopo aver generato tutti i file, guida il setup di Supabase locale con CLI seguendo le istruzioni in `COWORK_INSTRUCTIONS.md`, sezione Fase 4b. Genera anche il file `webapp/.env.example` con i placeholder delle variabili d'ambiente.

---

## FASE 5 — Migrazione dati

Genera lo script `scripts/import-to-supabase.js` che legge il file JSON esportato dall'app mobile e inserisce i dati nel database Supabase (locale o cloud).

---

## REGOLE GENERALI

- Scrivi i commenti nel codice in italiano
- Usa async/await ovunque, no callback
- Ogni funzione deve gestire gli errori con try/catch
- Mantieni i nomi delle funzioni identici a quelli in `database.js` originale dove possibile
- Se incontri ambiguità, fai una domanda prima di procedere
