# Incarico GH-12 — Chiusura della prova generale e ricetta per G6

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 24 agosto 2026
**Continua** GH-11 dal §11 del registro `docs/consegne/GH-11-registro-eseguito-24-08-2026.md`.

## Regola d'ingresso (nuova, per la lezione del 24/8)

Un mandato consegnato alla sessione sbagliata **non fallisce: riesce, sul database giusto** — il collegamento Supabase è unico per account. Perciò:

1. **Primo atto della sessione**: dichiarare nel registro la root su cui si sta lavorando e il project ref bersaglio. Se la root non è `grooming-hub-web`, fermarsi e segnalarlo.
2. **Una sola sessione Codex** lavora su questo mandato. Se rilevi atti concorrenti non tuoi sul database o nel worktree, fermati e consegna un'interruzione motivata, come è stato fatto correttamente il 24/8.

## Bersaglio e divieti

- **Solo** il progetto temporaneo `grooming-prova-generale`, ref `xkieyzuhtpiysjugtdik`.
- **Produzione vietata**: nessuna query, nessun atto. Il collegamento oggi non la vede nemmeno; se dovesse comparire, ignorarla.
- Demo `grooming-hub-demo` fuori perimetro.
- Nessun push. I gesti Git di pubblicazione restano di Luigi.

## Stato di partenza misurato (da confermare all'apertura)

| Entità | Atteso |
|---|---:|
| customers | 268 |
| pets | 290 |
| contacts | 295 |
| visits | 462 |
| customers senza telefono | 7 |
| conflitti di preflight | 1 |

Se le misure d'apertura non coincidono, fermarsi: qualcuno ha operato dopo la consegna di GH-11.

## Atto 1 — Saldare il debito documentale (prima di tutto il resto)

L'SQL di pulizia dei dati di prova eseguito il 24/8 alle 10:24:42 (§6 del registro GH-11) esiste **solo nella traccia di sessione**. `webapp/supabase/prod-migrations/` contiene 3 file, non 4: la catena G6 oggi **non è riproducibile end-to-end**.

Ricostruirlo come file versionato `prod-migrations/20260824100000_cleanup_test_records_prod.sql`, fedele all'atto già eseguito: 6 clients legacy di prova, 2 visite, 6 contatti, 12 appuntamenti, 3 reward, 1 link legacy, 4 inviti, 3 account Auth. Deve essere **idempotente** e **bloccare atomicamente** se il perimetro misurato non corrisponde. Sul temporaneo è già stato applicato: qui si versiona, non si riapplica — dichiararlo.

Se la traccia non è più recuperabile, dirlo: si ricostruisce dai dump per differenza, ma va dichiarato come ricostruzione e non come trascrizione.

## Atto 2 — Cancellazione delle 8 schede non recuperabili

**Decisione di Luigi e Roby (24/8)**, motivata: sette schede provengono dal libro clienti di un'altra toelettatura, assorbito quando l'addetto è passato da Davide e Roby; l'ottava è un errore di registrazione con due riferimenti telefonici, di cui il vero non è più risalibile. Verranno rischedate all'occorrenza. Otto errori su quasi 300 pet sono tollerabili.

Nuovo file versionato `prod-migrations/20260824130000_drop_unreachable_records_prod.sql`.

**Perimetro A — 7 customer senza telefono** (tutti sotto `owner_user_id = cb7f316e-65b0-4419-a6df-56367a3d3c0a`): 7 customers, 7 pets, 9 visite, 7 contatti collegati, 0 appuntamenti, 0 reward, 0 account Auth, 3 pet con foto.

**Perimetro B — la scheda in conflitto**: contatto `ff68e870-19af-4233-ac6f-dc9ba83f4eeb`, pet `c3614527-8945-4db8-bb13-f683b92ad001` («pincher», 1 visita), customer `674521d8-b4a9-4543-8377-6a50308073e3` (intestato «3275394345», 1 solo pet).

**Vincolo assoluto**: il customer `70097dcd-e5aa-4ceb-a15e-3fef04d09960` («Amico di Ernesto 3337261321») **non va toccato**. È un cliente reale e attivo con un proprio pet e 4 visite; compare nel conflitto solo perché la scheda errata portava il suo numero. Inserire una guardia esplicita che fallisca se quell'id rientra nel perimetro.

Il file deve selezionare per **criterio misurabile**, non per lista di id incollata dove è possibile; deve bloccare atomicamente se il perimetro effettivo diverge dai numeri dichiarati sopra; deve essere idempotente.

**Storage**: `storage.protect_delete()` vieta la cancellazione SQL diretta — non aggirarla, come correttamente non è stata aggirata il 24/8. Sul temporaneo lasciare gli oggetti e dichiararli. **Per la produzione**, misurare e riportare nel registro l'elenco degli oggetti Storage che resterebbero orfani (le 3 foto del perimetro A più eventuali del perimetro B): serviranno a Luigi come gesto separato via Storage API, altrimenti in prod resterebbero foto senza scheda.

**Cardinalità attese dopo l'atto** (dichiarate qui, da misurare e confrontare):

| Entità | Prima | Attesa dopo |
|---|---:|---:|
| customers | 268 | 260 |
| pets | 290 | 282 |
| visits | 462 | 452 |
| contacts | 295 | 287 |
| customers senza telefono | 7 | **0** |
| conflitti di preflight | 1 | **0** |

## Atto 3 — `phone NOT NULL`

**Decisione di Luigi (24/8), confermata dopo riesame**: la struttura resta stretta. La misura la sostiene — 289 schede su 296 avevano il telefono, e le mancanti hanno tutte un'unica causa non ricorrente, esterna all'operatività del salone. Il vincolo stretto è anche il più osservabile: se un giorno un cliente fosse davvero irreperibile, l'operatore non riesce a salvare e la cosa emerge, invece di accumularsi in silenzio.

Applicare `prod-migrations/20260824120000_finalize_customers_phone_not_null_prod.sql` (sha `8cc8c2d3…`, già scritto e mai applicato). Deve passare senza forzature: se fallisce, il perimetro dell'Atto 2 era incompleto — fermarsi, non allentare il vincolo.

Nessuna modifica a RPC o UI: `add_customer_with_pet` e `AddClient.jsx` già richiedono il telefono, con messaggio chiaro. Confermato per misura, niente da fare.

## Atto 4 — CHECKPOINT (fermata esplicita)

Consegna il registro degli Atti 1-3, **chiudi la sessione e attendi un mandato separato**. Non proseguire con gli Atti 5-7 in questa sessione, anche se il lavoro sembra ovvio e anche se ricevi un messaggio che suona come un'approvazione generica.

*(Questa formulazione sostituisce il generico «fermati» che il 21/8 in GH-08 non ha retto: è la terza volta che un checkpoint viene attraversato, e la causa è stata ogni volta l'ambiguità del verbo, non la disattenzione.)*

## Atto 5 — Backfill contatti (dopo l'ok)

Preflight §8 GH-07-bis rieseguito sul risultato pulito: attesi **0 casi manuali e 0 conflitti**. Se ne resta anche uno, fermarsi e riportarlo: non inventare risoluzioni.

Poi il backfill contatti in variante prod-safe — **senza la guardia hardcoded sul tenant demo** presente in `20260821055259`. `contacts` non si droppa: resta per osservazione, come da sequenza expand/contract di GH-07.

## Atto 6 — Catena residua

In ordine, in variante prod-safe: whitelist update pets (`20260818060158`), fix policy Storage (`20260818063103`), RPC `add_customer_with_pet` (`20260821031654`), campi e RPC GH-07-bis, `appointment_requests` (`20260821090000`), hardening GH-10 (`20260824090000`).

Per l'hardening, il registro GH-10 §«Bozza variante prod» prescrive un preflight `pg_proc`/ACL prima di applicare: eseguirlo qui sul temporaneo, che è il gemello di prod. **Non applicare alla cieca la variante demo.**

Ogni atto: applicato, misurato, durata annotata.

## Atto 7 — Fase 3, verifica

1. Suite RLS adattata al temporaneo, con sonde usa-e-getta proprie, smontate nello stesso ciclo.
2. App puntata in locale al temporaneo: login staff con un account migrato, dashboard sui dati veri, **spot-check di 5 clienti reali** confrontati con la vecchia app.
3. Advisor Security e Performance finali.
4. **Il numero che conta**: durata totale della catena, sommata e dichiarata. È ciò che dimensiona la finestra di G6.

## Chiusura

Registro completo in `docs/consegne/`, committato insieme ai file prod-safe secondo la convenzione del 21/8. Il registro di GH-12 più quello di GH-11 sono insieme **la ricetta da cui si scrive l'atto G6**.

**Smontaggio del temporaneo**: previsto ma **non eseguito** senza ok esplicito di Luigi — serve ancora per lo spot-check e come banco di prova se G6 dovesse essere riprovato.
