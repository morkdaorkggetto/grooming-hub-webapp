# Consegna GH-44 - Tetto richieste e scollegamento account

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `3117df8`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessun push, merge, deploy, nuova rotta o modifica alle policy di `pets`,
  `customers` e `visits`.

## Esito

GH-44 e' completato. Il numero massimo di richieste `pending` vive in
`tenants.settings.open_appointment_request_limit`, inizializzato a `3` e
validato come intero positivo. Il trigger esistente ora serializza gli insert
per coppia tenant/customer con advisory lock, conserva il rifiuto del
duplicato sullo stesso pet e rifiuta il superamento del tetto con SQLSTATE
`23514`, dettaglio `GH44_OPEN_REQUEST_LIMIT` e messaggio non accusatorio.
L'indice parziale copre soltanto le richieste `pending`.

Lo staff puo scollegare l'account dalla scheda cliente con conferma esplicita.
La RPC `unlink_customer_account(uuid)` controlla la membership staff nel
database, porta a `NULL` il solo `customers.user_id`, rimuove la membership
`customer` solo quando non serve ad altre schede dello stesso tenant e non
cancella account, customer, pet o visite. Dopo il gesto la scheda torna alla
vista non collegata e consente subito di generare un nuovo invito.

L'audit durevole vive in `public.customer_account_unlink_audit`: registra
tenant, customer, user scollegato, `performed_by_user_id`, nome e telefono
fotografati al momento del gesto e timestamp. La tabella ha RLS e una sola
policy SELECT staff; anon e customer non leggono il registro. La RPC e'
eseguibile dagli autenticati per essere esposta via API, ma il controllo staff
interno ha respinto entrambe le chiamate customer con `42501`.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260830055303_gh44_request_limit_and_customer_unlink.sql` | aggiunto | Configurazione tenant, constraint, indice pending, guardia database, RPC staff e audit RLS. Timestamp allineato alla versione registrata sul demo. |
| `src/apps/customer/pages/Book.jsx` | modificato | Rende visibile il messaggio specifico del tetto e conserva messaggi sicuri per duplicati ed errori generici. |
| `src/apps/staff/lib/database.js` | modificato | Espone il wrapper staff per la RPC di scollegamento con guard ambiente demo. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Mostra stato collegato, conferma e gesto di scollegamento; dopo il refresh ripristina il generatore di invito. |
| `scripts/rls-tests/run.mjs` | modificato | Estende la suite con tetto, sblocco, divieto customer, audit, scollegamento e nuovo riscatto su fixture autonoma. |
| `supabase/seeds/gh-44-customer-probe-demo.sql` | aggiunto | Seed idempotente e custodito della sonda customer usa-e-getta autorizzata sul demo. La password e' pubblica e non e' un segreto. |
| `scripts/rls-tests/teardown-gh44-customer-probe.sql` | aggiunto | Teardown custodito che rifiuta di eliminare la sonda se esistono ancora legami o dati GH-44. |
| `docs/consegne/GH-44-invito-tetto-e-scollegamento-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex. Il mandato successivo
`docs/incarichi/GH-45-prima-del-primo-invito.md`, comparso durante il lavoro e
attribuito da Luigi a Cowork, e' rimasto intatto e fuori dal commit.

## Migrazione demo

- Applicazione: PASS, una sola migration nominativa sul progetto
  `qttpinkslhenxrsbhhhg`.
- Versione remota e locale: `20260830055303`.
- Nome: `gh44_request_limit_and_customer_unlink`.
- Stato finale: limite `3`, tabella audit presente con RLS, una policy staff,
  indice `appointment_requests_customer_pending_idx`, anon senza EXECUTE sulla
  RPC e authenticated con EXECUTE sottoposto alla guard staff interna.

## Controprove vive

| Prova | Misurato | Esito |
| --- | --- | --- |
| Tre pending, quarta diretta | 3 richieste su 3 pet distinti; quarta su un quarto pet rifiutata con `23514/GH44_OPEN_REQUEST_LIMIT` | PASS |
| Chiusura libera il tetto | Una richiesta portata a `rejected`; richiesta sul quarto pet accettata | PASS |
| Tetto per customer | Le richieste appartengono a una sola sonda con 4 pet; il conteggio resta 3 complessivo e non si moltiplica per pet | PASS |
| Configurazione senza rebuild | Limite `1`: prima accettata e seconda rifiutata; limite portato a `2`: la stessa seconda richiesta accettata; nessuna build fra i due atti | PASS |
| Customer non scollega | Sonda customer bloccata sia sulla propria scheda sia su Mario con `42501`; audit invisibile | PASS |
| Scollegamento staff | Dopo unlink: `0` customer, `0` pet e `0` visite visibili alla sonda; account Auth ancora autenticato | PASS |
| Dati preservati | Prima e dopo unlink: customer presente allo staff, `4` pet e `1` visita | PASS |
| Audit | Prima del teardown: `2` righe di prova, entrambe con attore sonda staff e user scollegato sonda customer | PASS |
| Nuovo invito | Invito creato dopo unlink, riscatto accettato, membership ricreata e `4` pet nuovamente visibili | PASS |

## Suite, build e Advisor

- Suite RLS demo estesa: `36 PASS, 0 FAIL, 1 SKIP`. Lo skip e' quello gia'
  previsto per l'assenza di un secondo tenant reale.
- `npm run build`: PASS, Vite 5.4.21, `155` moduli trasformati, bundle JS
  673.87 kB (gzip 190.49 kB).
- `git diff --check`: PASS.
- `npm run lint`: non eseguibile, perche lo script richiama `eslint` ma il
  pacchetto non e' installato nel progetto. Nessuna dipendenza aggiunta fuori
  mandato.
- Warning build non bloccanti: Browserslist datato e chunk principale sopra
  500 kB.
- Advisor Security: `9 WARN` = 2 RPC pubbliche intenzionali, 6 RPC
  `SECURITY DEFINER` autenticate e leaked-password protection disattivata. Il
  solo incremento rispetto ai `8` warning preesistenti e' la nuova RPC
  autenticata; la suite prova la sua guard staff con due rifiuti customer.
- Advisor Performance: `111` rilievi = 15 `auth_rls_initplan`, 16
  `unused_index`, 80 `multiple_permissive_policies`. Il solo incremento
  rispetto ai `110` preesistenti e' il nuovo indice pending ancora indicato
  come inutilizzato dopo la pulizia delle richieste di prova.
- Riferimenti Advisor:
  [SECURITY DEFINER autenticato](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
  [indice inutilizzato](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Teardown e stato finale demo

- `open_appointment_request_limit`: ripristinato a `3`.
- Utenti Auth finali: `3`, uguali alla base.
- Sonde Auth GH-04/GH-44: `0`; profili sonda `0`; membership sonda `0`.
- Fixture GH-44: richieste `0`, pet `0`, visite `0`, customer `0`, inviti `0`,
  audit di prova `0`.
- Il primo tentativo di teardown staff si e' fermato sulla guardia per due pet
  configurabilita' ancora presenti: il filtro usato nel cleanup esterno era
  troppo stretto rispetto al marker `[DEMO GH-44 CONFIG]`. Misurati i due UUID,
  sono stati rimossi nominativamente; il conteggio `owner_user_id` e' tornato a
  `0` e il teardown custodito e' poi riuscito. Nessun dato non marcato e' stato
  modificato.

## Eccezioni e fuori istruzione

- I controlli di sicurezza hanno richiesto autorizzazioni esplicite separate
  per la sonda staff e la nuova sonda customer; Luigi le ha concesse. Entrambe
  sono state create solo sul demo e smontate nella stessa sessione.
- Un tentativo non eseguito di provare lo scollegamento su Mario e' stato
  bloccato prima di ogni chiamata. La suite e' stata riscritta per usare solo
  la fixture autonoma GH-44; Mario e Luca non sono stati scollegati.
- Produzione non letta e non scritta. Nessun push, merge o deploy.
- Nessun segreto e' stato stampato o committato. La password del seed GH-44 e'
  dichiaratamente pubblica e usa-e-getta, come quella della sonda GH-04.

## Passo umano di Luigi

Dopo il rilascio, aprire una scheda cliente di prova collegata, premere
`Scollega account`, confermare e rileggere il pannello. La domanda e': la
scheda sembra una normale scheda mai collegata, con il generatore di invito
immediatamente disponibile, oppure comunica ancora uno stato rotto?

## Commit

Commit locale della consegna con messaggio
`feat: limit requests and unlink customer accounts`. Nessun push eseguito.
