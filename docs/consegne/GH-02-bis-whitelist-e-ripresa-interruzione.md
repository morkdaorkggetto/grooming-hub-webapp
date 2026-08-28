# Consegna GH-02-bis — Whitelist pets e ripresa: interruzione motivata

**Data:** 18 agosto 2026  
**Esecutore:** Codex  
**Incarico:** `docs/incarichi/GH-02-bis-whitelist-e-ripresa.md`  
**Natura:** nuovo mandato specifico e una tantum, successivo a GH-02

## Perimetro ricevuto

Il mandato autorizzava:

1. una sola migration whitelist su `public.pets`;
2. applicazione e controprove esclusivamente sul demo `grooming-hub-demo`;
3. dopo la verifica della migration, ripresa A1-A4 di GH-02;
4. commit locali atomici, ma nessun push senza conferma di Luigi.

Il database produzione `grooming` restava intoccabile. Nessuna autorizzazione
di questo incarico si estende ad altri ambienti o lavori futuri.

## Base Git

| Voce | Valore |
|---|---|
| Branch | `feat/customer-app` |
| Base iniziale | `90d7e26b5f1458e01c4173639436f3fb81106159` |
| HEAD alla consegna | `f83e8d4` |
| Distanza da `origin/feat/customer-app` | 1 commit locale avanti, nessun push |
| Progetto DB usato | `grooming-hub-demo` |
| Ref demo | `qttpinkslhenxrsbhhhg` |

## Parte 1 — Migration whitelist

Migration applicata con successo al solo demo e registrata da Supabase come:

`20260818060158_enforce_pets_customer_update_whitelist`

La funzione `public.enforce_pets_customer_update_whitelist()` ricostruisce
`NEW` da `OLD` per i non-staff, conservando da `NEW` soltanto:

- `owner_notes`;
- `coat_preferences`;
- `photo_url`.

Il vecchio trigger `trg_pets_protect_internal_notes` è stato rimosso e
sostituito da `trg_pets_customer_update_whitelist`. Il trigger su `customers`
non è stato modificato. La funzione ha `SECURITY DEFINER`, `search_path`
pinnato e permesso `EXECUTE` revocato a `PUBLIC`, `anon` e `authenticated`,
perché è una trigger function e non una RPC.

### Controprove vive

Le prove sono state eseguite sul demo in contesti autenticati equivalenti agli
utenti indicati e dentro sottotransazioni rollbackate.

| Attore | Operazione | Esito misurato |
|---|---|---|
| Mario customer | UPDATE `owner_notes` | passa |
| Mario customer | UPDATE `microchip` | valore restituito da `OLD` |
| Mario customer | UPDATE `name` | valore restituito da `OLD` |
| Owner staff demo | UPDATE `microchip` | passa |

Trigger vivi rilevati su `pets`: whitelist + `update_pets_timestamp`; il vecchio
trigger non compare più.

### Advisor

Il primo controllo advisor ha segnalato `EXECUTE` pubblico sulla nuova funzione.
La revoca è stata aggiunta alla stessa migration e allineata sul demo senza
creare una seconda migration. Il controllo successivo riporta 21 warning
preesistenti e nessun warning riferito alla nuova funzione whitelist.

### Commit Parte 1

| Hash | Messaggio |
|---|---|
| `f83e8d4` | `fix: enforce pets customer update whitelist` |

## Parte 2 — A1-A4

### Lavoro preparato localmente

- Hook `usePet(petId)` e `usePetVisits(petId)` con filtri tenant e RLS.
- Scheda pet con hero, anagrafica read-only, preferenze, note e storico visite.
- Stati implementati nel codice: loading, error, 404/RLS, viewing, editing,
  saving e saved (7 stati).
- UPDATE frontend limitato espressamente alle tre colonne whitelisted.
- Guard modifiche non salvate integrato nella navigazione customer globale.
- Resize foto client-side a massimo 1024 px con `canvas.toBlob` e upload nel
  path `<tenant_id>/<pet_id>/<file>`.
- Seed demo idempotente e marcato `[DEMO GH-02]` per Pepe e Luna.

Questa parte è rimasta **non committata**, perché la controprova Storage ha
evidenziato un secondo difetto di schema che impedisce di completare A3.

### Seed demo applicato

Il seed è stato applicato solo al ref demo:

| Pet | Preferenze/note | Visite demo |
|---|---|---:|
| Luna | marcate `[DEMO GH-02]` | 3 |
| Pepe | marcate `[DEMO GH-02]` | 2 |

Una prova reale di salvataggio `owner_notes` con Mario è riuscita; il valore
temporaneo è stato poi ripristinato. Nessun marker temporaneo è rimasto nei dati.

## Motivo dell'interruzione

L'upload customer sul bucket `pet-avatars`, nel path richiesto, riceve:

`403 — new row violates row-level security policy`

Le policy vive mostrano che, dentro le subquery con alias `public.pets p`, il
riferimento non qualificato `name` è stato risolto come `p.name`. La policy
installata confronta quindi i segmenti di:

`storage.foldername(p.name)`

anziché quelli del path `storage.objects.name`. Il sorgente del problema è in
`20260424150000_pet_avatars_bucket.sql`, righe 31-90: il `name` esterno non è
qualificato e viene catturato dall'alias della tabella interna.

Di conseguenza l'`EXISTS` customer è sempre falso per path corretti come
`<tenant_id>/<pet_id>/<file>`. La prova non ha creato alcun oggetto Storage.

La correzione richiede una modifica DDL delle policy Storage, cioè una seconda
migration o un nuovo intervento schema. GH-02-bis autorizzava esclusivamente la
migration whitelist su `pets`; Codex si è quindi fermato senza estendere il
perimetro. L'ulteriore interruzione motivata è prevista come consegna valida
dall'incarico.

## File toccati nel mandato

| File | Stato | Intervento |
|---|---|---|
| `supabase/migrations/20260818060158_enforce_pets_customer_update_whitelist.sql` | committato | migration whitelist |
| `src/apps/customer/CustomerApp.jsx` | locale, non committato | provider guard navigazione |
| `src/apps/customer/pages/Pet.jsx` | locale, non committato | sostituzione stub A1-A3 |
| `src/apps/customer/hooks/usePet.js` | locale, non committato | fetch/update pet |
| `src/apps/customer/hooks/usePetVisits.js` | locale, non committato | fetch storico visite |
| `src/apps/customer/lib/petPhoto.js` | locale, non committato | resize e Storage |
| `src/shared/navigation/UnsavedChangesProvider.jsx` | locale, non committato | guard modifiche non salvate |
| `src/shared/ui/CustomerNav.jsx` | locale, non committato | consultazione guard su link/logout |
| `src/shared/ui/Icon.jsx` | locale, non committato | icone camera e modifica |
| `supabase/seeds/gh-02-pet-page-demo.sql` | locale, non committato; applicato al demo | seed A4 |
| `docs/consegne/GH-02-bis-whitelist-e-ripresa-interruzione.md` | locale, non committato | questo registro unico |

Le altre modifiche documentali presenti nel worktree erano preesistenti e non
sono state alterate da Codex durante GH-02-bis.

## Verifiche complessive

| Verifica | Esito |
|---|---|
| Demo `ACTIVE_HEALTHY`, Auth e REST | riuscita |
| Build dopo A1-A3 | riuscita, 133 moduli |
| Login API Mario | riuscito |
| Login API Luca | riuscito |
| Luca legge pet di Mario | negato da RLS, 0 righe |
| Salvataggio e ripristino `owner_notes` | riuscito |
| Seed A4 | riuscito, Luna 3 visite / Pepe 2 |
| Upload Storage customer | fallito con 403 RLS |
| Test browser autenticato | non eseguito: arresto prima dell'inserimento credenziali |
| `npm run lint` | non disponibile: `eslint` non installato nel progetto |

La build mantiene l'avviso Browserslist preesistente e l'avviso Vite sul chunk
principale, ora pari a 634,53 kB.

## Eccezioni e fuori-istruzione dichiarati

- Per verificare il target, `list_projects` ha restituito anche metadati sommari
  del progetto produzione. Non è stata fatta alcuna chiamata specifica, query,
  modifica o connessione al database produzione.
- Dopo l'advisor, i `REVOKE EXECUTE` della nuova funzione sono stati allineati
  via `execute_sql` sul demo e inseriti nel file della stessa migration già
  registrata; non è stata creata una seconda migration.
- Il seed A4 è stato applicato prima della conclusione delle controprove UI; è
  idempotente, esplicitamente demo e resta coerente dopo l'interruzione.
- Nessun push, merge o deploy eseguito.
- Nessuna password o chiave scritta nei file o nei commit.

## Condizione per una nuova ripresa

Serve un nuovo mandato esplicito che autorizzi la correzione idempotente delle
policy `Pet avatars customer insert/update/delete`, qualificando il path
dell'oggetto senza collisione con `p.name`. Dopo quella controprova A3, il codice
locale potrà essere verificato nel browser, rifinito e committato.
