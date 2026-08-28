# Consegna GH-05-bis - Gate 5, refactor staff

**Data:** 21 agosto 2026  
**Branch:** `feat/customer-app`  
**Base dichiarata:** `a3d40e8eb654eb5af6146781d3ab45e4d26fb5e9`  
**Ambiente toccato:** solo Supabase demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`)  
**Produzione:** non interrogata e non toccata  
**Migration:** nessuna  
**Push/deploy:** non eseguiti

## Esito

Il gateway staff usa `tenant_memberships` come fonte canonica di accesso e
adatta il ruolo soltanto in memoria (`owner|staff -> operator`,
`customer -> customer`). Non esegue aggiornamenti automatici su `profiles`.

Il modello dati staff e stato riallineato a `customers` + `pets`: elenco pet
con join del padrone, ultima visita derivata lato client da `visits.date`,
appuntamenti/visite/reward/inviti su `pet_id` e operazioni tenant-aware. La
creazione con primo pet usa la RPC atomica `add_customer_with_pet`; l'upload
foto resta un passo successivo e un suo errore viene segnalato senza DELETE
compensative.

`AddClient` resta una schermata unica, ora divisa nelle sezioni Padrone e Pet;
il telefono e obbligatorio e lo split del nome usa lo stesso criterio del
backfill M11-bis. Lo shim Supabase staff e stato rimosso e tutti i consumer
autorizzati usano il client condiviso.

## Commit atomici

| Commit | Oggetto |
|---|---|
| `9317b786178fb72c9d58a585afa775433e656069` | `refactor: align staff data with customers and pets` - gateway dati, AddClient e pagine operative |
| `50a41b57c973a227a86eb78f09fa1a2e1c58b69c` | `refactor: remove staff Supabase auth shim` - client condiviso, flusso invito e rimozione shim |

## File esaustivi

| File | Azione | Commit |
|---|---|---|
| `src/apps/staff/lib/database.js` | Refactor completo tenant-aware su memberships, customers e pets; wrapper RPC; mapping compatibile per le pagine | `9317b78` |
| `src/apps/staff/pages/AddClient.jsx` | Flusso RPC atomico, telefono obbligatorio, split padrone, due sezioni e sonda locale di rollback | `9317b78` |
| `src/apps/staff/pages/Dashboard.jsx` | Elenco via `getAllPets` e client Supabase condiviso | `9317b78` |
| `src/apps/staff/pages/Calendar.jsx` | Elenco pet e payload/navigazione su `pet_id` | `9317b78` |
| `src/apps/staff/pages/DailyAppointments.jsx` | Navigazione dettaglio su `pet_id` | `9317b78` |
| `src/apps/staff/pages/Contacts.jsx` | Collegamento convertito su `linked_pet_id` | `9317b78` |
| `src/apps/staff/pages/CustomerRequests.jsx` | Apertura scheda su `pet_id` | `9317b78` |
| `src/apps/staff/pages/CustomerPortal.jsx` | Payload live/demo su `pet_id` e logout condiviso | `9317b78` |
| `src/apps/staff/pages/ClientDetail.jsx` | Ispezionato e provato; nessuna modifica necessaria grazie al mapping compatibile del gateway | non modificato |
| `src/apps/staff/StaffApp.jsx` | Listener auth dal client condiviso | `50a41b5` |
| `src/apps/staff/components/Auth/LoginForm.jsx` | Login dal client condiviso | `50a41b5` |
| `src/apps/staff/pages/CustomerInvite.jsx` | Client condiviso; accettazione invito prima della validazione membership customer | `50a41b5` |
| `src/apps/staff/pages/CustomerLogin.jsx` | Client condiviso | `50a41b5` |
| `src/apps/staff/pages/PublicPetCard.jsx` | Client condiviso | `50a41b5` |
| `src/apps/staff/pages/ResetPassword.jsx` | Client condiviso | `50a41b5` |
| `src/apps/staff/lib/supabaseClient.js` | Rimosso | `50a41b5` |
| `docs/consegne/GH-05-bis-staff-refactor.md` | Creato; questo registro | escluso dai commit applicativi |

Nessun consumer ulteriore rispetto all'inventario autorizzato e emerso.

## Controprove misurate

| # | Controprova | Esito |
|---|---|---|
| 1 | Login `staff.sonda@test.example` | Login riuscito; routing su `/dashboard`; dashboard visibile con 7 pet e nessun errore legacy |
| 2 | Lista pet e ordinamento | 7 pet; padrone visibile; primi due casi noti: Pepe / Mario Rossi, ultima visita `2026-08-08`, poi Luna / Mario Rossi, `2026-08-04` |
| 3 | Creazione UI `[DEMO GH-05]` | `AddClient` ha creato 1 customer + 1 pet; pet visibile in dashboard (conteggio temporaneo 8); pulizia esatta riuscita; baseline finale 7 pet |
| 4 | Errore UI forzato | `p_pet_sex = 'x'` respinto da `pets_sex_check`; customer con telefono di rollback dopo l'errore: 0 |
| 5 | Baseline Mario | Login portale riuscito; pet visibili: Pepe e Luna; visite rispettivamente 2 e 3, totale 5; nessun dato marker residuo |
| 6 | Routing bidirezionale | Sonda: tentativo `/portal` -> `/dashboard`; Mario: tentativo `/dashboard` -> `/portal` |
| 7 | Legacy e build | Log API demo della finestra di prova `03:44:31-03:45:06` senza richieste a `/rest/v1/clients` o `/rest/v1/customer_client_links`; scan sorgenti: 0 `from('clients')`, 0 `customer_client_links`, 0 `client_id|linked_client_id`, 0 import shim; build riuscita |

Smoke test delle sette pagine dati: `Dashboard`, `Calendar`,
`DailyAppointments`, `Contacts`, `CustomerRequests`, `CustomerPortal` e
`ClientDetail` caricate con dati reali e senza nuovi errori console. Il
calendario ha completato il caricamento e mostrato le sette opzioni pet con
proprietario.

## Verifiche tecniche

- `npm run build`: riuscito, Vite 5.4.21, 132 moduli.
- `git diff --check`: pulito prima dei commit.
- Supabase API logs del solo progetto demo: richieste osservate verso
  `tenant_memberships`, `profiles`, `pets`, `customers`, `visits`,
  `appointments`, `contacts` e `reward_points`; nessun endpoint legacy nella
  finestra delle prove UI.
- `npm run lint`: non eseguibile perche il repository definisce lo script ma
  non include il pacchetto `eslint` tra le dipendenze installate
  (`eslint: command not found`). Nessuna dipendenza e stata aggiunta fuori
  mandato.
- Restano i warning preesistenti di build su Browserslist non aggiornato e
  chunk JavaScript oltre 500 kB.

## Dipendenze residue per GH-06 / Fase 2

- `contacts` resta temporaneamente operativo; `convertContactToClient` e un
  alias deprecato di `markContactConverted`, mentre
  `createContactFromClient` e stato rimosso. Migrazione e chiusura definitiva
  restano in GH-06.
- Test RLS Gate 4 e smontaggio della sonda staff restano in GH-06.
- `getAllPets` ordina l'ultima visita lato client, adeguato al pilota da 7 pet;
  vista/RPC scalabile rinviata alla Fase 2.
- `pets.owner_user_id`, gli alias pubblici legacy del gateway e il bucket
  `client-photos` restano ponti transitori; le autorizzazioni usano membership,
  tenant e `customer_id -> customers.user_id`.

## Eccezioni e fuori istruzione

- Una prima query diagnostica scritta per la verifica ha richiesto per errore
  il campo inesistente `visits.status`; il gateway applicativo non lo
  richiedeva e non e stato modificato per quel falso allarme. La query corretta
  ha poi restituito i 7 pet.
- Il logout di un client diagnostico Supabase ha invalidato una sessione
  browser della sonda; il login e stato ripetuto e le prove successive sono
  risultate pulite. Nessun account o ruolo e stato modificato.
- Le modifiche parallele a `docs/environment-map.md` e
  `docs/diario-progetto.md` sono attribuite a Cowork e autorizzate da Luigi;
  la modifica Cowork al mandato `docs/incarichi/GH-05-bis-staff-refactor.md`
  era anch'essa presente. Tutte sono rimaste fuori dallo stage e dai commit.
- Il registro preesistente non tracciato
  `docs/consegne/GH-05-rpc-add-customer-with-pet.md` non e stato modificato o
  incluso.
- Nessuna migration nuova, nessuna query a produzione, nessun deploy e nessun
  push.
