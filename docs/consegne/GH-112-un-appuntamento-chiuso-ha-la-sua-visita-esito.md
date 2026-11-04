# GH-112 - Un appuntamento chiuso ha la sua visita

## Ripresa esecutiva del 04/11/2026, dalle 12:23 CET

**Stato: implementazione e prove completate sul demo; nessun atto sul prodotto.** Base applicativa `a9b7f8c64c8bb0b6ba9ead68280700699a40ecb2`, branch `main`. Il commit `4b95420` aggiungeva soltanto il registro della seconda interruzione. Canone adottato e corrente **1.3**, fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md`, SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43`.

**Ordine per la promozione:** applicare l'atto GH-112 nel prodotto, verificare firme/guardia e prova di vecchia chiamata PostgREST, poi pubblicare il codice. Il demo `qttpinkslhenxrsbhhhg` ha gia ricevuto l'atto; il prodotto non e stato letto o scritto da Codex. L'atto e una transazione `BEGIN ... COMMIT`: se fallisce a meta, PostgreSQL annulla tutto. Se fosse gia applicato e occorresse tornare indietro, serve un nuovo atto numerato che ripristini le due definizioni precedenti dalle fonti GH-103/GH-52 e rimuova la nuova RPC; non tentare rollback parziali dal browser.

**Verifica dopo l'atto:** rieseguire la query sulle firme e gli MD5 qui sotto, attesi sul demo dopo GH-112: `complete_appointment_with_visit(text,date,text,text,numeric,uuid)` = `e11fb0645ab8c0721439ef84e7806ff8`, `set_staff_appointment_status(text,text)` = `e3ed83d0a820a253929de287c688d276`, `delete_staff_visit_reopen_appointment(text,uuid)` = `980489a4240bc55af73fa20598cba1f9`; una riga per firma, `security_definer=false`, `anon_execute=false`, `authenticated_execute=true`. Gli MD5 potrebbero cambiare fra ambienti per la normalizzazione del DDL: nel prodotto verificare prima corpo, firme e comportamento, non assumere che l'MD5 del demo sia un target inter-ambiente.

```sql
select p.oid::regprocedure::text obj, md5(pg_get_functiondef(p.oid)) md5,
       p.prosecdef security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') authenticated_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in
 ('complete_appointment_with_visit', 'set_staff_appointment_status',
  'delete_staff_visit_reopen_appointment')
order by 1;
```

**Preflight rettificato da Luigi:** le tre impronte demo/prodotto delle RPC coincidono; `gh103_finance_bridge()` assente sul demo e presente nel prodotto e l'eccezione GH-103 atto B gia accettata in GH-107. Cowork aveva omesso questa eccezione dal mandato. Per compatibilita, la migrazione GH-112 non legge ne scrive `visits.cost`, `visits.discount_percent`, `services.price_cents` e non richiama il bridge. Riusa la firma e la chiamata a `create_staff_visit` esistenti: la definizione di questa funzione era identica per MD5 nei due ambienti e sceglie dinamicamente il ramo con/senza colonne legacy. Il ramo senza colonne e stato eseguito vivo sul demo. Il ramo con colonne del prodotto e verificato **per struttura del codice e confronto della definizione preflight**, non eseguito vivo da Codex: resta una controprova di Cowork durante l'atto sul prodotto.

| Controprova | Esito misurato sul demo |
| --- | --- |
| Domani, chiusura con visita e cambio stato diretto | Entrambe le RPC rifiutano con `23514`, `DETAIL=GH112_APPOINTMENT_IN_FUTURE`; nessuna visita creata. |
| Oggi alle 18:00, ora non ancora arrivata; ieri | Entrambe le chiusure con visita riuscite. |
| Elimina visita collegata | RPC unica: visita assente, appuntamento tornato `scheduled`. |
| Errore simulato dopo il DELETE | Trigger temporaneo di prova blocca l'UPDATE dello stato; la RPC fallisce e la visita resta, appuntamento `completed`. Transazione di prova annullata. |
| Visita senza appuntamento | Eliminata; l'appuntamento di prova non collegato resta `scheduled`. |
| Chiamate PostgREST della vecchia base | Account staff demo esistente, argomenti nominati identici a `database.js` della base: futuro rifiutato con codice; oggi chiuso; nuova RPC elimina e riapre. Nessuna firma duplicata. |
| Nuova RPC come customer | Rifiuto `42501` su visita sintetica, riga invariata riletta con ruolo amministrativo. |
| Suite RLS esistente | `node scripts/rls-tests/run.mjs`: **62 PASS, 0 FAIL, 0 SKIP**, pulizia fixture PASS. |
| Residui GH-112 | Query indipendente dopo le prove API e dopo quelle visive: **0 customer, 0 pet, 0 appuntamenti, 0 visite** con marker GH-112. |
| Build | `npm run build` verde, 183 moduli; soli avvisi preesistenti Browserslist e bundle >500 kB. |
| UI: due Leo | Fixture sintetiche `Leo` Barboncino di `[DEMO GH-112] Bruno Prova`, oggi 18:00, e `Leo` Labrador di `[DEMO GH-112] Ada Prova`, domani 18:00. Il calendario mostra due righe distinte. Domani: nel dettaglio manca `Registra lavorazione`; il link diretto mostra `Appuntamento non chiudibile` e `Questo appuntamento è di un giorno che non è ancora arrivato.`, senza form. Oggi: il pulsante apre la pagina con `Leo · Barboncino · [DEMO GH-112] Bruno Prova · 4 novembre 2026 ore 18:00`. |
| UI: selettore | `Milo` unico scritto per intero: `1 risultato`, `Salva appuntamento` disabilitato e frase `Scegli un pet dall’elenco per salvare l’appuntamento.`; Invio da solo non sceglie. Freccia giu poi Invio sceglie `Milo · Meticcio · Sara Neri`; modificare in `Mil` azzera la scelta e disabilita il pulsante; clic sulla riga lo riabilita. Con i due Leo, l'elenco mostra razza e proprietario distinti. Fixture sintetica `Clover`: digitazione completa senza clic, pulsante disabilitato e stessa frase; nessun appuntamento salvato. |
| UI: eliminazione collegata | Visita sintetica di oggi salvata dal form (costo `1,00 €`, minimo positivo richiesto), appuntamento chiuso. `Elimina visita` ha aperto una conferma; il testo nel codice e `Eliminare questa visita? L'appuntamento del 4 novembre 2026 tornerà da completare.`. Dopo l'eliminazione autorizzata, scheda: `0 registrate`, prossimo appuntamento `4 novembre 2026 alle ore 18:00`; query amministrativa: `scheduled`, nessuna visita collegata. Il dialogo nativo non e acquisibile nello snapshot del browser, quindi non presento il testo del popup come lettura visiva indipendente. |
| UI: 375/1365 px | Pagina di chiusura: `documentElement.scrollWidth=innerWidth` a 375 e 1365; a 375 la schermata e leggibile, a 1365 il pannello e largo 700 px e resta dentro il viewport. Dialogo nuovo appuntamento con elenco aperto: 375/375 e 1365/1365, rettangolo del dialogo dentro il viewport. |

Il primo lancio della prova API non ha eseguito JavaScript per quoting della shell; la fixture e stata pulita subito (0/0/0), poi la prova corretta e passata. Un primo controllo customer sulla permanenza della visita ha letto la riga con RLS customer e l'ha vista vuota; transazione annullata e prova rifatta con rilettura amministrativa, passata. Nessuna di queste due prove difettose e usata come evidenza positiva.

Per le prove visive Luigi ha autorizzato il login della sonda staff demo, senza password in chat. Il primo tentativo di preparare le fixture non e partito (`42703` nella CTE); il secondo ha scelto per errore il tenant tecnico GH-49 con `limit 1`, percio il calendario le mostrava come assenti. Ho rimosso quelle righe, ricreato le fixture nel tenant misurato della membership staff e ripetuto la prova. La verifica finale indipendente sul demo ha restituito `customers=0, pets=0, appointments=0, visits=0`. Nessun account e stato creato o modificato.

Dopo la cancellazione la scheda mostrava ancora il messaggio di navigazione `Visita registrata e appuntamento chiuso insieme.` nonostante storico e agenda corretti. Ho corretto `ClientDetail.jsx` affinche, dopo la cancellazione riuscita, azzeri quello stato e l'eventuale errore foto mantenendo il resto dello stato di navigazione. Il fix e stato letto nel codice e ricompilato; non ho ripetuto una seconda scrittura/cancellazione via browser solo per questo messaggio. Questa e l'unica controprova UI post-fix non eseguita vivo.

| File nel candidato GH-112 | Motivo |
| --- | --- |
| `supabase/migrations/20261104112550_gh112_appointment_visit_guard.sql` | Guardie del giorno a Roma nelle due RPC; eliminazione/riapertura atomica staff-only. Applicato solo al demo. |
| `src/apps/staff/lib/database.js` | Errore GH-112 in italiano, nuova RPC di eliminazione, lettura contesto appuntamento. |
| `src/apps/staff/pages/AddVisit.jsx` | Identita del cane e giorno/ora; blocco di appuntamento futuro anche da link diretto. |
| `src/apps/staff/pages/ClientDetail.jsx` | Avviso del giorno prima di eliminare una visita collegata; rimozione del messaggio di successo obsoleto dopo la cancellazione. |
| `src/apps/staff/pages/Calendar.jsx` | Nessun gesto di chiusura offerto per giorno futuro, con data di Roma coerente con la RPC. |
| `src/apps/staff/pages/DailyAppointments.jsx` | Stesso blocco nella vista giornaliera. |
| `src/apps/staff/components/CalendarKit.jsx` | Scelta del pet solo con clic/tocco o frecce poi Invio; cambio testo azzera la scelta. |
| `docs/consegne/GH-112-un-appuntamento-chiuso-ha-la-sua-visita-esito.md` | Questo registro, con le due interruzioni conservate sotto. |

Fuori istruzione: nessuno. Il mandato GH-112, `docs/incarichi/GH-111-...`, la migrazione dati di Cowork `20261104_gh112_reopen_leo_labrador.sql`, gli altri SQL preesistenti non versionati, il diario e le cartelle private del salone restano fuori da modifiche, stage e commit. Nessun push, merge o deploy.

## Ripresa del 04/11/2026 alle 12:20-12:21 CET

**Esito: ancora interrotto, per una nuova differenza misurata.** Il collegamento al demo `qttpinkslhenxrsbhhhg` ora funziona: `select 1 as verifica;` ha restituito `1` sia nel SQL Editor sia tramite il connettore Supabase. Il precedente `28P01` non si riproduce. Non e stata cambiata alcuna password o impostazione.

Il progetto dichiara ora il canone **1.3**, coincidente con la fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md` (SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43`, misurato alle 12:21 CET). La base applicativa resta `a9b7f8c`: HEAD `3cbb43b` aggiunge soltanto questo registro (`git diff --name-status a9b7f8c..HEAD`). Nessun file applicativo e cambiato rispetto alla base.

Alle 12:21 CET ho rieseguito **identica** la query di preflight riportata sotto, sul solo demo, con `supabase_execute_sql`. Confronto con le impronte MD5 del prodotto citate da Cowork nel mandato (04/11/2026, 11:30:24 Europe/Rome):

| Oggetto | Prodotto, MD5 citato | Demo, MD5 misurato | Esito |
| --- | --- | --- | --- |
| `complete_appointment_with_visit(text,date,text,text,numeric,uuid)` | `848d3557add8cfc69b1e367dc161ca67` | `848d3557add8cfc69b1e367dc161ca67` | coincide |
| `create_staff_visit(uuid,date,numeric,text,text,numeric,uuid,text)` | `9d87519547e553d211bba15a3845a003` | `9d87519547e553d211bba15a3845a003` | coincide |
| `gh103_finance_bridge()` | `bc62652be087008365c615bee911012d` | **riga assente** | **differisce** |
| `set_staff_appointment_status(text,text)` | `47946d65580eda6691340f0b0ba3deec` | `47946d65580eda6691340f0b0ba3deec` | coincide |

La query restituisce **3 righe, non 4**. In base alla guardia del mandato ("se una riga differisce, fermati"), non ho iniziato l'implementazione e non ho cercato di ricreare la funzione. Serve una decisione documentata su questa assenza: riallineare il demo alla definizione misurata nel prodotto, oppure rettificare il preflight se la funzione non e una premessa di GH-112; poi rifare il confronto. La prima opzione tocca lo schema e non e autorizzata da questa ripresa.

**File e atti della ripresa:** modificato solo questo registro. Nessuna migrazione applicata, fixture, suite RLS, build, lettura del prodotto, push o deploy. Le cartelle private del salone, il mandato e la migrazione non versionati restano intatti e fuori stage. Recuperi: 1 (differenza gia visibile nella query richiesta dal mandato); passaggi richiesti a Luigi: 1 (decisione sul riallineamento); tempo aggiunto dal controllo: circa 1 minuto. Fuori istruzione: nessuno.

## Interruzione originaria del 04/11/2026 alle 12:01-12:03 CET

**Canone adottato dal progetto: 1.2; fonte corrente letta: 1.3 (SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43`).** Misura del 04/11/2026, 12:01-12:03 CET, fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md`. Base effettiva `a9b7f8c64c8bb0b6ba9ead68280700699a40ecb2`, branch `main`, verificata con `git rev-parse HEAD` prima di qualsiasi modifica.

## Esito e confine

La query di preflight prescritta dal mandato, eseguita **due volte sul solo demo `qttpinkslhenxrsbhhhg`** tramite Supabase `execute_sql`, ha restituito in entrambi i casi `FATAL: 28P01: password authentication failed for user "postgres"`. Nessuna riga o MD5 e stata ottenuta. Le quattro impronte di produzione riportate nel mandato restano **citazioni di Cowork del 04/11/2026 alle 11:30:24 Europe/Rome**, non confronti verificati da Codex. Il requisito "rifalla identica sul demo prima di cominciare; se una riga differisce, fermati" non consente di iniziare senza il confronto. Non ho inferito concordanza dai file locali.

Query da rieseguire, identica al mandato:

```sql
select p.oid::regprocedure::text obj, md5(pg_get_functiondef(p.oid)) md5
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('complete_appointment_with_visit','create_staff_visit','set_staff_appointment_status','gh103_finance_bridge')
order by 1;
```

**Ripresa:** ripristinare l'autenticazione PostgreSQL del collegamento al demo, oppure far eseguire a Luigi questa query nel SQL Editor del solo demo e riportare le quattro righe con ora e metodo. Prima di cambiare codice o schema, Codex deve rifare la misura dal proprio collegamento, confrontarla riga per riga con il mandato e fermarsi se diverge. Non occorre inviare password in chat.

## File e atti

| File | Stato |
| --- | --- |
| `docs/consegne/GH-112-un-appuntamento-chiuso-ha-la-sua-visita-esito.md` | Solo questo registro di interruzione. |

Nessun file applicativo o migrazione creato/modificato; nessuna fixture, nessuna scrittura al demo, nessun accesso alla produzione. Nessuna build o suite RLS eseguita, perche l'implementazione non e iniziata. I file non versionati preesistenti, incluso il mandato GH-112, la migrazione di Cowork `supabase/migrations/20261104_gh112_reopen_leo_labrador.sql` e le cartelle private del salone restano fuori da modifiche, stage e commit. Diario intatto. Recuperi: 0; passaggi richiesti a Luigi: 1 (ripristino connessione o risultato della query); tempo aggiunto dal controllo: circa 2 minuti. Fuori istruzione: nessuno. Nessun push, merge o deploy.
