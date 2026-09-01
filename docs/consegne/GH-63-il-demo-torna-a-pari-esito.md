# Consegna GH-63 - Il demo torna a pari

## Base e perimetro

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `b574a2e20a392ae1acad5fa3fd81452d93eae812`.
- Database letto e scritto: soltanto `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), rilevato `ACTIVE_HEALTHY`.
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge o deploy. Nessun codice applicativo modificato.

Il collegamento Supabase CLI del worktree punta alla produzione. Per evitare
qualunque ambiguita non e stato usato: tutte le operazioni remote hanno
indicato esplicitamente il ref demo attraverso il connettore Supabase.

## Esito

Il demo e allineato ai quattro file gia applicati in produzione. Le migration
sono state eseguite senza modificare i file e compaiono nella history remota
con le versioni originali, quindi un futuro confronto non le considerera piu
mancanti:

| Versione | Nome | SHA-256 del file eseguito |
| --- | --- | --- |
| `20260901044304` | `gh57_calendar_customer_pet` | `d667870c06404c9a4cc25c06f74564beb8e1f41ac26eee9eb3c392cf7f8ac181` |
| `20260901060131` | `gh58_delete_staff_appointment` | `98d24d886352d4dff80c7da4903a7e1ba720dcb71574b71cb8437fdc988e8606` |
| `20260901070901` | `gh59_appointments_staff_no_direct_delete` | `6800a45b3846661c08065a1221dfaa1d7b6bf9dd7c2101761e073ba729fd78b4` |
| `20260901113254` | `gh60_visit_service` | `aee3138810f325ed756c176bb55aa6d36ffa7f312d50d652a72a3a8fe1f38a7a` |

Il connettore assegna inizialmente una versione pari all'ora di esecuzione.
Dopo ogni applicazione riuscita, una guardia ha verificato nome univoco e
assenza della versione di destinazione, quindi ha sostituito esattamente una
riga con il timestamp del file. La history finale e stata riletta sia via SQL
sia tramite l'elenco migration Supabase.

## Preflight

| Requisito prima dell'applicazione | Misura demo | Esito |
| --- | --- | --- |
| `customers.phone` `NOT NULL` | `is_nullable = NO` | PASS |
| `public.normalize_phone_it` presente | 1 firma `(text)` | PASS |
| Policy `appointments_staff_all FOR ALL` | 1 policy, `cmd = ALL` | PASS |
| RPC completamento a cinque parametri | 1 sola firma `(text, date, text, text, numeric)` | PASS |
| `visits.service_id` assente | assente | PASS |
| `delete_staff_appointment` assente | 0 firme | PASS |
| `create_calendar_customer_pet` assente | 0 firme | PASS |
| History migration | 56 righe; nessuna delle quattro versioni target | PASS |

Tutti i requisiti coincidevano; non e stato necessario adattare alcun SQL.

## Controprove schema e policy

| Prova finale | Misura demo | Esito |
| --- | --- | --- |
| Telefono customer facoltativo | `is_nullable = YES` | PASS |
| RPC calendario customer + pet | 1 firma a 9 parametri | PASS |
| RPC eliminazione appuntamento staff | 1 firma `(text)` | PASS |
| `visits.service_id` | presente, nullable, 1 FK e 1 indice parziale | PASS |
| Storico classificato | 0 su 90 visite, quindi tutta la colonna e nulla | PASS |
| RPC completamento | 1 sola firma a 6 parametri; ultimo UUID facoltativo | PASS |
| ACL RPC completamento | `postgres`, `authenticated`, `service_role`; nessun `anon` | PASS |
| Policy appuntamenti | 6 in tutto | PASS |
| Policy staff | `SELECT`, `INSERT`, `UPDATE` | PASS |
| Policy customer | `SELECT`, `INSERT`, `UPDATE`, invariate | PASS |
| Policy `DELETE` | 0 | PASS |
| Policy `FOR ALL` | 0 | PASS |
| History finale | 60 righe; quattro target presenti con nome e versione esatti | PASS |

## Integrita dati

| Misura | Prima | Dopo suite e teardown | Esito |
| --- | ---: | ---: | --- |
| Customer | 7 | 7 | PASS |
| Pet | 7 | 7 | PASS |
| Visite | 90 | 90 | PASS |
| Appuntamenti | 8 | 8 | PASS |
| Visite con `treatments` | 90 | 90 | PASS |
| Visite con `issues` | 24 | 24 | PASS |
| Digest ordinato `id/treatments/issues` | `208e20c0658a665597028c172cc5e50e` | identico | PASS |

Nessuna delle quattro migration contiene `UPDATE` o `DELETE` sui dati
applicativi. La suite ha usato soltanto le sonde e fixture canoniche gia
versionate, poi rimosse nella stessa sessione.

## Suite RLS e browser

- Suite `scripts/rls-tests/run.mjs`: **60 PASS, 0 FAIL, 0 SKIP**.
- Il primo avvio nel sandbox si e fermato prima del login per DNS non
  disponibile: `0 PASS, 1 FAIL`; rilancio con rete autorizzata riuscito.
- Prova rinviata da GH-61: login della sonda staff nel browser locale, apertura
  della scheda `Pepe - Mario Rossi`, visita del `08/08/2026` visibile con
  problematica storica `Dato dimostrativo GH-02: trattamento tranquillo.`.
- Errori applicativi durante la lettura della scheda: 0.
- Salvataggi o scritture dal browser: 0.

La sessione browser e stata chiusa. La cancellazione custodita dell'utente
sonda ha revocato anche le sue sessioni remote.

## Advisor e sicurezza

- Advisor Security: 11 warning. Due riguardano le RPC GH-57/GH-58
  `SECURITY DEFINER` eseguibili da `authenticated`; sono funzioni intenzionali
  con controllo interno di `auth.uid()`, membership e tenant, `search_path = ''`
  e ACL revocata a `PUBLIC`/`anon`. Nessuna modifica fuori mandato.
- Restano warning preesistenti sulle RPC pubbliche intenzionali e sulla
  protezione password compromesse disabilitata. Riferimento:
  <https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection>.
- Advisor Performance: 104 warning (`15` initplan RLS, `14` indici non usati,
  `75` policy permissive multiple), nessuno riferito ai nuovi oggetti GH-63.
  Riferimento:
  <https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select>.
- La RPC GH-60 resta `SECURITY INVOKER`; nessuna esecuzione per `anon`.

## Pulizia finale

Misura unica successiva a suite, prova browser e teardown:

- sonde GH-04, GH-44 e GH-49: 0 Auth, identities, profiles e membership;
- customer e pet posseduti dalle sonde: 0;
- tenant estraneo GH-49: 0;
- audit unlink riferibile alle sonde: 0;
- marker suite: 0 customer, pet, visite, richieste, promozioni e appuntamenti;
- oggetti Storage GH-06/GH-45/GH-50: 0;
- `visits.service_id` non nulli: 0;
- server locale e scheda browser chiusi.

Le due righe audit create dalla suite GH-44 sono state rimosse prima dei
teardown con guardia su entrambi gli UUID, i due ID esatti, etichetta e
telefono della sonda. Nessuna riga non marcata e stata coinvolta.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `docs/consegne/GH-63-il-demo-torna-a-pari-esito.md` | aggiunto | Registro unico di preflight, applicazione, controprove e pulizia. |

I quattro file migration elencati sopra sono stati soltanto letti ed eseguiti:
non sono stati modificati. Nessun file in `src/`, script, seed o teardown e
stato toccato.

## Verifiche tecniche

- Supabase changelog corrente: richiesta eseguita; endpoint Markdown non
  renderizzato dal lettore web. La documentazione ufficiale corrente su
  migration history, `migration list` e `migration repair` e stata verificata.
- `git diff --check`: PASS.
- `npm run build`: PASS; Vite 5.4.21, 159 moduli, 1,19 s; bundle JS
  `713,68 kB` (gzip `201,48 kB`). Warning non bloccanti: Browserslist datato
  e chunk principale oltre 500 kB.
- `npm run lint`: non richiesto su codice invariato; il repository continua a
  non installare `eslint`.

## Eccezioni e fuori istruzione

- Il collegamento CLI locale alla produzione e stato rilevato e lasciato
  invariato; nessun comando Supabase CLI remoto e stato eseguito.
- Nessuna modifica locale parallela o inattesa rilevata.
- Nessun file applicativo, migration, seed o teardown modificato.
- Produzione non letta e non scritta.

## Passo finale di Luigi

Nessuna prova visiva richiesta: da questo giro il demo e allineato e i mandati
successivi non devono piu installare temporaneamente GH-57, GH-58, GH-59 o
GH-60.

## Commit

Commit locale previsto: `chore: align demo migration history`. Hash nella
risposta finale. Nessun push.
