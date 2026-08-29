# Consegna GH-37 - Postazioni e capienza

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `c630331`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: fuori perimetro, non letta e non scritta.
- Nessuna rotta nuova. Nessun push, merge o deploy.

## Esito

GH-37 e' completato. La capienza iniziale del salone e' `2` e vive in
`tenants.settings.workstation_capacity`. Inserimenti, conferme, ripristini e
riprogrammazioni vengono respinti dal database quando il picco di lavorazioni
contemporanee supererebbe la capienza. Il controllo non dipende dal browser e
serializza le scritture concorrenti per tenant.

Il calendario usa lo stesso algoritmo per collocazione manuale, conferma delle
richieste, riprogrammazione, etichette e suggerimento dell'orario successivo.
Il messaggio non nomina piu' un altro cane: dichiara che le postazioni sono
tutte occupate.

## Modello adottato

- Intervalli semiaperti: una lavorazione che termina alle 10:00 non collide con
  una che inizia alle 10:00.
- Occupano una postazione solo appuntamenti approvati e non annullati. Le
  richieste ancora `pending` non sono lavorazioni confermate.
- La regola misura il picco reale con una scansione degli eventi inizio/fine;
  non conta il numero totale di intervalli che toccano il candidato.
- Il trigger `appointments_enforce_workstation_capacity` copre ogni canale di
  scrittura. Un advisory lock di transazione derivato dal tenant impedisce a
  due dispositivi di consumare contemporaneamente l'ultimo posto.
- Il trigger `tenants_guard_workstation_capacity` usa lo stesso lock e vieta
  di abbassare la capienza sotto il picco gia' pianificato.
- Se la chiave manca, la guardia appuntamenti conserva il comportamento storico
  prudente di capienza `1`; sul tenant pilota la migration scrive `2` una sola
  volta e non sovrascrive futuri passaggi a `3`.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/shared/tenant/workstationCapacity.js` | aggiunto | Centralizza lettura impostazione, picco, conflitti e primo orario disponibile. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Adegua inserimento, conferma, riprogrammazione, tag e suggerimento alla capienza configurata. |
| `src/apps/staff/lib/database.js` | modificato | Traduce il rifiuto atomico del database nel messaggio operativo unico su tutte le superfici staff. |
| `supabase/migrations/20260829100319_gh37_appointment_capacity.sql` | aggiunto | Imposta capienza demo, verifica lo storico e installa le due guardie atomiche. |
| `docs/consegne/GH-37-postazioni-e-capienza.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex. La modifica locale a
`docs/diario-progetto.md` era preesistente, attribuita a Cowork e autorizzata
da Luigi: resta fuori dallo stage e dal commit GH-37.

## Database demo

- Migration nel ledger: versione `20260829100319`, nome
  `gh37_appointment_capacity`.
- Impostazione finale: `workstation_capacity = 2`.
- Funzioni trigger `SECURITY INVOKER`, `search_path` vuoto, non eseguibili da
  `PUBLIC`, `anon` o `authenticated` come RPC.
- Baseline trovata al preflight: 8 appuntamenti, non i 5 dichiarati nel
  mandato. Sono tutti passati; picco storico misurato `1` prima e dopo.
- La migration contiene un preflight che interrompe l'atto se appuntamenti
  esistenti superano gia' la capienza configurata.

## Controprove

| Prova | Atteso | Misurato | Esito |
| --- | --- | --- | --- |
| Capienza 2 | Due sovrapposte accettate, terza rifiutata | 2 accettate, terza con messaggio capienza | PASS |
| Capienza 3 | Terza accettata, quarta rifiutata cambiando solo settings | 3 accettate, quarta rifiutata senza build intermedia | PASS |
| Picco, non numero di overlap | Candidato che tocca 4 intervalli ma raggiunge picco 3 accettato | Inserimento riuscito con capienza 3 | PASS |
| Primo orario disponibile | Primo slot entro capienza, non primo intervallo vuoto | Proposto `10:00` con un'altra lavorazione gia' alle 10:00 e capienza 2 | PASS |
| Due richieste simultanee | Un solo consumo dell'ultimo posto | Due INSERT API parallele: 1 riuscita, 1 rifiutata | PASS |
| Appuntamento annullato | Non occupa | Annullato + 2 attivi accettati; terzo attivo rifiutato | PASS |
| Storico | Nessun appuntamento esistente diventa invalido | 8 righe invariate, picco 1, zero conflitti | PASS |
| Calcolo frontend | Sette casi limite deterministici | `7 PASS` | PASS |
| Suite RLS demo | Invariata | `30 PASS, 0 FAIL, 1 SKIP` previsto per secondo tenant assente | PASS |
| Build | Verde | Vite 5.4.21, 153 moduli trasformati | PASS |

## Verifiche finali

- `npm run build`: PASS.
- `git diff --check`: PASS.
- `npm run lint`: non eseguibile nella base, `eslint: command not found`.
- Warning build non bloccanti e preesistenti: database Browserslist datato e
  bundle principale sopra 500 kB.
- Advisor Security: 8 warning preesistenti (`2` funzioni pubbliche anonime,
  `5` funzioni autenticate e protezione password trapelate disattivata). Le
  due funzioni GH-37 sono invoker e non hanno prodotto finding.
- Advisor Performance: 110 warning preesistenti (`15 auth_rls_initplan`,
  `15 unused_index`, `80 multiple_permissive_policies`). GH-37 non modifica
  policy o indici.
- Riferimenti Advisor:
  [database linter](https://supabase.com/docs/guides/database/database-linter),
  [RLS init plan](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select).

## Fixture e teardown

- Fixture appuntamenti con prefisso `gh37-`, create via API autenticata della
  sonda staff sul solo demo.
- Sonda GH-04 ricreata per prova autenticata e suite RLS, poi smontata con il
  teardown previsto.
- Stato finale misurato: `0` appuntamenti GH-37, `0` richieste marker suite,
  `0` auth user sonda, `0` identity, `0` profilo, `0` membership sonda.
- Baseline finale: 8 appuntamenti; capienza tenant `2`.

## Eccezioni e correzioni durante il giro

- Il primo tentativo usava `SELECT ... FOR UPDATE` sulla riga tenant. La prova
  autenticata lo ha correttamente respinto: lo staff ha diritto di leggere il
  tenant ma non di modificarlo. Prima delle controprove finali il lock e' stato
  sostituito con un advisory lock transazionale per tenant, senza ampliare RLS
  o privilegi. Tutte le prove successive sono state eseguite sulla soluzione
  finale.
- Il timestamp creato localmente dalla CLI era precedente a quello assegnato
  dal ledger Supabase. Il file e' stato rinominato a `20260829100319` per
  allineare repository e demo.
- Il lint non e' stato riparato perche' richiederebbe una dipendenza fuori
  mandato.
- La produzione non e' stata consultata ne' modificata. Nessuna attivita fuori
  perimetro applicativo; lo script temporaneo delle prove vive era in `/tmp` e
  non entra nel repository.

## Passo umano di Luigi

1. Sul demo, portare temporaneamente `workstation_capacity` a `3`, collocare
   tre pet nella stessa fascia e guardare se la settimana resta leggibile.
2. Provare a collocare il quarto pet nella stessa fascia e verificare che il
   messaggio dica: `Le postazioni sono tutte occupate nella fascia scelta.`
3. Dopo la verifica visiva, rimuovere gli appuntamenti di prova e riportare la
   capienza a `2` finche' la terza postazione non apre davvero.

## Coda dichiarata

Manca ancora una schermata impostazioni del salone per giorni di chiusura,
soglie fedelta' e postazioni. GH-37 non la introduce: oggi il cambio di
capienza resta un atto dati e non richiede una nuova build.
