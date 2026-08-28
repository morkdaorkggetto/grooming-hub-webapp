# Staff-code touchpoints — dipendenze da risolvere prima del Gate 5

> **Scopo**: mappa dei punti del codice staff esistente (`webapp/src/`) che dovranno essere aggiornati quando la migration `M11-bis_split_with_backfill` rimpiazzerà `clients` con `customers` + `pets` e dismetterà `customer_client_links`. Nessuna modifica al codice è prevista in questo documento — serve solo da checklist di dipendenze.
>
> **Scadenza**: chiudere prima del Gate 5 (RPC `available_slots` / `book_appointment` + wiring customer-app). Il codice staff non può restare rotto dopo l'apply di M11-bis in demo.

## Gateway unico: `src/lib/database.js` (1655 righe)

Tutta l'interazione col DB Supabase lato repo passa per questo file. Nessuna pagina usa `supabase.from('…')` direttamente — le pagine importano funzioni da `database.js`. Questo significa che **il costo di aggiornamento è concentrato qui**: se `database.js` espone la stessa API esterna con i nuovi nomi di colonna dietro, le 15 pagine in `src/pages/` continuano a funzionare (quasi) senza toccarle.

### Funzioni esportate da `database.js` — impatto per gruppo

| Gruppo | Funzioni | Impatto |
|---|---|---|
| **Profilo / auth** | `getUserProfile`, `ensureCustomerProfile`, `ensureOperatorProfile` | **Basso**. Operano solo su `profiles`, che resta invariato. Post-M14 conviveranno col trigger `handle_new_auth_user` (rischio duplicazione insert: mitigato da `ON CONFLICT`). |
| **Invite flow** | `createCustomerPortalInvite(clientId, email)`, `acceptCustomerPortalInvite(token)`, `getCustomerPortalData()` | **Alto**. `createCustomerPortalInvite` chiama `.from('customer_invitations').insert({ client_id, … })` — la colonna diventa `pet_id`. `acceptCustomerPortalInvite` invoca RPC `accept_customer_invite` e oggi legge `data.clientId`; dopo M11 la RPC restituisce `{customerId, petId, operatorUserId, tenantId}`. `getCustomerPortalData` fa 4 query separate su `customer_client_links`, `clients`, `visits`, `appointments`, `reward_points` — da riscrivere completamente contro `customers`+`pets`+`customer_id` diretto. |
| **Clients CRUD → Pets + Customers CRUD** | `getAllClients`, `addClient`, `updateClient`, `deleteClient`, `getClientById`, `getClientCardByToken` | **Alto**. Tutte le chiamate `.from('clients')` vanno cambiate in `.from('pets')` e il mapping dei campi va riorientato: `clients.owner`, `clients.phone` non esistono più (andrebbero letti da `customers`). Per Fase 1 il customer è opzionale (pet può esistere senza customer): valutare se `getAllClients` deve fare LEFT JOIN con `customers`, o se restituire due collezioni separate. `addClient` va pensata: oggi crea 1 riga clients; domani potrebbe creare 1 riga pets + (opzionalmente) 1 riga customers se l'operatore fornisce un'email per l'invito. Decisione di design da prendere. |
| **Visits** | `addVisit(clientId, …)`, `deleteVisit(visitId, clientId)`, `getWeeklyRevenueReport` | **Medio**. Rename argomento `clientId` → `petId`; `.from('visits')` con `client_id` → `pet_id`. Il rewire è meccanico. |
| **Appointments (operator + customer)** | `addAppointment`, `createCustomerAppointmentRequest(clientId, …)`, `getAppointments`, `getPendingAppointmentRequests`, `updateAppointmentStatus`, `updateAppointmentApproval`, `updateAppointmentSchedule`, `deleteAppointment` | **Alto**. 11 call site a `.from('appointments')`. `client_id` → `pet_id`. `createCustomerAppointmentRequest` oggi legge `customer_client_links` (riga 1055) per verificare il legame customer↔pet → con lo split quella verifica è ridondante (la RLS di M28 già la fa) **e** il file `customer_client_links` non esiste più. Da **rimuovere**. |
| **Contacts** | `getAllContacts`, `addContact`, `updateContactStatus`, `convertContactToClient(contactId, clientId)`, `createContactFromClient(clientId, clientData)` | **Medio**. `.from('contacts')` in 5 call site. Il campo `linked_client_id` diventa `linked_pet_id`. `convertContactToClient` oggi insert in `clients`: post-split deve insert in `pets` (+ forse `customers` se l'operatore sta convertendo anche il padrone a customer formale). Ridefinire signature: `convertContactToPet` + flag `alsoCreateCustomer`? Decisione. |
| **Reward points** | `addRewardPointMovement(clientId, …)` | **Basso**. Rename parametro `clientId` → `petId` e colonna `client_id` → `pet_id`. Nessuna riscrittura logica. |
| **No-show / blacklist** | `updateClientNoShowScore(clientId, delta)`, `setClientBlacklistStatus(clientId, isBlacklisted)` | **Basso**. Rename parametro a `petId` e tabella `clients` → `pets`. Campi `no_show_score` / `is_blacklisted` esistono già identici su `pets`. |
| **Export dati** | `exportData()` | **Medio**. Oggi esporta `clients`, `visits`, `appointments`, `contacts`, `reward_points`. Post-split va aggiunto l'export di `customers` + `pets` separati e rinominata la sezione `clients` → `pets`. Eventuale back-compat output per chi scarica il dump. |
| **Public QR card (RPC)** | `getPublicPetCardByToken(qrToken)` | **Minimo**. Invoca RPC `get_public_pet_card` che ho già riscritta in M11. Il field name `photo` nell'output JSON è invariato (era `clients.photo`, ora è `pets.photo_url` mappato a `'photo'`). Nessuna modifica necessaria al client.|

### Grep di riferimento

- **45 occorrenze** di `.from('<legacy>')` in `database.js` (al Gate 1). Tutte da riorientare.
- **98 occorrenze** di `clientId` / `client_id` / `linked_client_id` nel singolo file `database.js`. La maggioranza sono nomi di parametri e variabili locali: rinominazione meccanica, `clientId` → `petId` dove la semantica è "identificativo del pet" (quasi sempre). `clientId` resterà dove indica *una riga `customers`*, che dopo lo split è `customerId`.
- **7 pagine** toccano `client_id` come valore (non come SELECT su `.from('clients')`):
  - `Dashboard.jsx`, `Calendar.jsx`, `DailyAppointments.jsx`, `Contacts.jsx`, `CustomerRequests.jsx`, `CustomerPortal.jsx`, `ClientDetail.jsx` — ma in tutti i casi lo prendono/passano a database.js via funzioni. Se `database.js` rinomina le sue API con `petId`, le pagine vanno aggiornate in meccanico find-replace.

## Helper interni (non esportati) da toccare

- `getOwnedClient(clientId, userId)` (riga 109) — guard di proprietà: diventa `getOwnedPet(petId, userId)`. Oggi controlla `clients.user_id`. Con lo split `pets.owner_user_id` è il campo equivalente, ma la policy RLS **sostituisce** questa guard: eliminabile completamente in favore di una SELECT RLS-protetta.
- `uploadClientPhoto(userId, clientId, file)` (riga 70) — upload su bucket `client-photos` con path `<userId>/<clientId>-<timestamp>`. Due problemi con M34 (`pet-avatars`):
  1. Il bucket cambia (se il codice staff continua a usare `client-photos` va bene, sono coesistenti — ma per la customer-app serve il nuovo bucket `pet-avatars` con path `<tenant_id>/<pet_id>/<file>`).
  2. La path convention diverge. Decisione architetturale: lo staff usa `client-photos` (legacy) o si allinea a `pet-avatars`? Meglio unificare in un secondo step.
- `deleteClientPhotoByUrl(url)` (riga 90) — parsing path bucket-specifico. Stessa decisione.

## RPC — compatibilità client ↔ server

**`accept_customer_invite(p_token)`** — riscritta in M11 + M21. L'output JSON è cambiato:

| Vecchio | Nuovo |
|---|---|
| `{ clientId, operatorUserId, customerUserId }` | `{ customerId, petId, operatorUserId, tenantId }` |

Chiamante in `acceptCustomerPortalInvite` (riga 298) legge `data.clientId` → adeguare a `data.customerId` o `data.petId` a seconda della logica successiva (probabilmente `petId` per redirect al profilo pet).

**`get_public_pet_card(p_qr_token)`** — output identico lato client (il campo `photo` resta, mappa `pets.photo_url`). Nessun cambiamento necessario in `getPublicPetCardByToken`.

## Decisioni di design da prendere prima di M11-bis

1. **`getAllClients` ritorna cosa?** Lista di pet (più semplice, coerente con "scheda cliente" = "scheda pet")? Lista di customer con pet annidati (più ricco, richiede GROUP BY)? Due funzioni distinte `getAllPets` + `getAllCustomers`?
2. **`addClient` UX**: l'operatore aggiunge un pet senza customer? Con customer (email obbligatoria per invito)? Con customer opzionale?
3. **`convertContactToClient`**: converti in pet o in customer o in entrambi?
4. **Uniformazione storage**: tutto su `pet-avatars` (con migrazione dati da `client-photos`) o coesistenza dei due bucket?
5. **Owner fields di `pets`**: oggi `pets.owner_user_id` (l'operatore) esiste come back-compat. Se il codice staff inizia a usare `customer_id` + RLS tenant-aware, `owner_user_id` diventa vestigiale — candidato alla rimozione in Fase 2.

## Stima di sforzo (indicativa)

- `database.js` rewiring completo: **4-6 ore** di lavoro mirato, molto trovare-sostituire guidato da test di compilazione.
- Pagine effetto-a-cascata: **2-3 ore** di adattamenti (rename prop, eventuali shift di semantica tipo "showing client X" → "showing pet X of customer Y").
- Decisioni di design (punti sopra): **1 sessione di 30-60 min** con l'autore, dopo M11-bis ma prima del Gate 5.

## Stato

- [x] Mappa prodotta (questo file).
- [ ] Decisioni di design (1-5) — da discutere con l'autore.
- [ ] Scrittura `M11-bis_split_with_backfill.sql` — dopo decisione su approccio (preserve vs wipe dati demo).
- [ ] Apply M11-bis su demo → rottura temporanea staff app.
- [ ] Aggiornamento `database.js` + pagine → ripristino funzionalità staff.
- [ ] Verifica end-to-end staff prima del Gate 5.
