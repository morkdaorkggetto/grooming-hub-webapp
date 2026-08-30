# Consegna GH-45 - Prima del primo invito

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `961bb11`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessun push, merge, deploy, nuova rotta o spostamento di oggetti Storage.

## Esito

GH-45 e' completato. Le policy permissive di `client-photos` sono state
rimosse e sostituite da tre policy staff per insert, update e delete. Il
percorso legacy resta quello usato dall'app (`{auth.uid()}/...`), mentre la
lettura pubblica resta invariata. Le policy gia' presenti su `pet-avatars`
continuano a consentire al customer le operazioni soltanto sui propri pet.

La durata dei nuovi inviti vive ora in
`tenants.settings.customer_invite_expiry_days`, inizializzata a `3`. Un
constraint accetta soltanto interi positivi e il trigger `BEFORE INSERT`
calcola sempre `expires_at` dal valore corrente del tenant: il chiamante non
puo imporre una finestra diversa. Gli inviti gia' emessi non vengono
aggiornati. Il frontend staff non calcola piu' trenta giorni e mostra la data
e l'ora di scadenza restituite dal database.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260830083041_gh45_storage_and_invite_expiry.sql` | aggiunto | Configurazione e validazione tenant, trigger di scadenza e policy staff sul bucket legacy. Timestamp allineato alla versione registrata sul demo. |
| `src/apps/staff/lib/database.js` | modificato | Rimuove il calcolo frontend dei trenta giorni e lascia al database l'assegnazione di `expires_at`. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Mostra allo staff data e ora effettive di scadenza dell'invito. |
| `scripts/rls-tests/run.mjs` | modificato | Estende la suite viva con matrice Storage e stati/durata degli inviti. |
| `docs/consegne/GH-45-prima-del-primo-invito-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex.

## Migrazione demo

- Applicazione: PASS, una sola migration nominativa sul progetto
  `qttpinkslhenxrsbhhhg`.
- Versione remota e locale: `20260830083041`.
- Nome: `gh45_storage_and_invite_expiry`.
- Stato finale: durata `3`, default colonna `now() + interval '3 days'`, trigger
  attivo, constraint presente, lettura pubblica presente e tre sole policy di
  scrittura staff su `client-photos`.
- Oggetti demo prima: `client-photos = 0`, `pet-avatars = 0`.
- Oggetti demo dopo suite e teardown: `client-photos = 0`,
  `pet-avatars = 0`.

## Controprove foto

| Prova | Misurato | Esito |
| --- | --- | --- |
| Staff | 2 upload e 2 sostituzioni riuscite, una per bucket | PASS |
| Lettura pubblica | 2 URL letti senza sessione, HTTP 200 | PASS |
| Customer su oggetti altrui | 2 update rifiutati; 2 delete senza effetto; oggetti ancora leggibili | PASS |
| Customer sul proprio pet | Upload, update e delete in `pet-avatars` riusciti | PASS |
| Utente autenticato senza legami | 4 scritture rifiutate; 2 delete senza effetto | PASS |
| Conteggio | `0/0` prima e `0/0` dopo il teardown | PASS |

## Controprove inviti

| Prova | Misurato | Esito |
| --- | --- | --- |
| Durata iniziale | `259200` secondi, cioe' 3 giorni; un valore esplicito a 30 giorni e' stato ignorato dal trigger | PASS |
| Cambio senza build | Impostazione portata da 3 a 5; nuovo invito a `432000` secondi | PASS |
| Invito precedente | Scadenza identica prima e dopo il cambio a 5 | PASS |
| Valori non validi | `0`, `1.5` e testo rifiutati dal constraint | PASS |
| Stati di riscatto | Errori distinti `GH_INVITE_EXPIRED` e `GH_INVITE_ALREADY_USED` | PASS |
| Ripristino | Impostazione tornata a `3`; inviti SQL e fixture a `0` | PASS |

La pagina di riscatto conserva le due viste distinte gia' esistenti: invito
scaduto e invito gia' utilizzato non condividono testo o stato.

## Suite, build e Advisor

- Suite RLS demo estesa: `41 PASS, 0 FAIL, 1 SKIP`. Lo skip e' quello gia'
  previsto per l'assenza di un secondo tenant reale.
- `npm run build`: PASS, Vite 5.4.21, `155` moduli trasformati, bundle JS
  673.98 kB (gzip 190.55 kB).
- `git diff --check`: PASS.
- `node --check scripts/rls-tests/run.mjs`: PASS.
- `npm run lint`: non eseguibile, perche' lo script richiama `eslint` ma il
  pacchetto non e' installato. Nessuna dipendenza aggiunta fuori mandato.
- Warning build non bloccanti: Browserslist datato e chunk principale sopra
  500 kB.
- Advisor Security: `9 WARN`, invariati rispetto alla base GH-44. La funzione
  introdotta da GH-45 e' `SECURITY INVOKER`, non e' esposta via API e non ha
  aggiunto rilievi.
- Advisor Performance: `110` rilievi = 15 `auth_rls_initplan`, 15
  `unused_index`, 80 `multiple_permissive_policies`. Il conteggio e' inferiore
  di uno alla base registrata da GH-44; la differenza riguarda un indice
  inutilizzato e puo dipendere dalle statistiche d'uso, non da una modifica
  GH-45.
- Riferimenti Advisor:
  [SECURITY DEFINER eseguibile](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
  [indice inutilizzato](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Teardown e stato finale demo

- Sonde Auth GH-04/GH-44: `0`.
- Profili sonda: `0`; membership sonda: `0`; customer sonda: `0`.
- Audit di prova: `0`; inviti GH-45: `0`; marker GH-44: `0`.
- Oggetti nei due bucket: `0`.
- `customer_invite_expiry_days`: `3`.
- I tre account demo preesistenti non sono stati modificati o rimossi.

## Foto legacy di produzione: proposta, non eseguita

I numeri `51` oggetti in `client-photos` e `42` riferimenti pet provengono dal
mandato e non da una lettura Codex della produzione. Un futuro mandato
separato dovrebbe: produrre un manifest sorgente/destinazione; copiare gli
oggetti in `pet-avatars` senza cancellare gli originali; verificare conteggi e
checksum; aggiornare i 42 `photo_url` in una transazione; mantenere un periodo
di doppia lettura e un rollback che ripristini i riferimenti legacy; eliminare
gli originali soltanto dopo la verifica visiva e l'accettazione di Luigi.

## Eccezioni e fuori istruzione

- Il primo avvio della suite e' stato bloccato dalla rete sandbox prima del
  login (`ENOTFOUND`); la riesecuzione autorizzata verso il solo demo e'
  riuscita integralmente.
- Le sonde usa-e-getta gia' previste da GH-04 e GH-44 sono state create solo
  sul demo, usate per le prove e smontate nella stessa sessione.
- Produzione non letta e non scritta. Nessun push, merge o deploy.
- Nessun segreto e' stato letto, stampato o committato.

## Passo umano di Luigi

Dopo il rilascio, aprire la card pubblica di un cane che ha una foto e
verificare che l'immagine sia ancora visibile. E' la superficie in cui un
errore sui permessi apparirebbe come un riquadro vuoto invece che come un
messaggio tecnico.

## Commit

Commit locale della consegna con messaggio
`fix: secure legacy photos and shorten invites`. Nessun push eseguito.
