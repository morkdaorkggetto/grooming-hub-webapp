# Consegna GH-05 - Interruzione motivata prima del refactor staff

**Data:** 18 agosto 2026
**Branch:** `feat/customer-app`
**Base dichiarata (HEAD post-quater):**
`db3e3c23506735a994d1dd399788571cfa23c208`
**Ambiente misurato:** solo Supabase demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`, stato `ACTIVE_HEALTHY`)
**Produzione:** non interrogata e non toccata
**Push/deploy:** non eseguiti

## Esito

GH-05 e stato interrotto prima di modificare codice. Il mandato richiede
contemporaneamente:

1. `addCustomerWithPet(...)` in una transazione DB unica;
2. controprova UI di creazione customer + pet;
3. nessuna migration.

Sul demo non esiste alcuna RPC o funzione equivalente a
`addCustomerWithPet`. Le sole funzioni pubbliche correlate a customer/pet sono
`accept_customer_invite`, `get_public_pet_card` e trigger di enforcement.

Due INSERT indipendenti eseguiti dal browser non formano una transazione. Una
cancellazione compensativa del customer in caso di errore sul pet ridurrebbe
il danno ma non manterrebbe la promessa del mandato e potrebbe fallire a sua
volta. Procedere cosi violerebbe le domande 1 e 4 della griglia BEA.

L'incarico ammette espressamente l'interruzione motivata; nessuna soluzione
parziale e stata introdotta nel gateway dati.

## Griglia delle cinque domande

### 1. Il verbo mantiene la promessa?

No, con lo schema attuale. Il verbo “crea customer + pet in una transazione
unica” richiede una funzione DB/RPC. Supabase JS dal browser non puo racchiudere
due richieste PostgREST in una singola transazione SQL.

### 2. Due variabili che erano lo stesso numero possono separarsi?

Si, ed e gia successo con la sonda GH-04:

- `profiles.role = operator` e il valore legacy per la UI;
- `tenant_memberships.role = staff` e il valore autorizzativo reale.

Il bootstrap futuro non deve modificare nessuno dei due per farli coincidere.
La membership deve decidere l'accesso; il valore restituito ai consumer legacy
puo essere adattato in memoria (`owner|staff -> operator`,
`customer -> customer`) mantenendo invariato il contratto pubblico di
`getUserProfile()`.

### 3. Le due sorgenti sono d'accordo?

Oggi no. Le RLS leggono `tenant_memberships`, mentre `StaffApp` instrada usando
`profiles.role`. `database.js` tenta inoltre di autoriparare il profilo tramite
`clients` e `customer_client_links`, tabelle legacy assenti sul demo.

La Parte 0 proposta dal mandato e corretta, ma va applicata insieme a una
regola esplicita di adattamento del ruolo, senza UPDATE automatici al DB.

### 4. Cio che si offre si puo ancora fare?

Non integralmente nel perimetro corrente:

- il login e la lista pet possono essere riparati senza migration;
- la creazione atomica customer + pet non puo essere implementata;
- la controprova UI richiede `src/apps/staff/pages/AddClient.jsx`, che usa
  ancora `addClient`, `convertContactToClient` e `createContactFromClient`, ma
  non compare tra le sette pagine nominate dal mandato.

Implementare solo letture e login lascerebbe rotto il principale gesto di
scrittura richiesto e produrrebbe una consegna parziale non autorizzata.

### 5. Uscendo per guardare, si perde il lavoro?

La schermata AddClient e oggi un form unico. Non serve introdurre navigazione
aggiuntiva, ma senza transazione un errore dopo il primo INSERT puo lasciare
un customer orfano: il lavoro non si perde solo nell'interfaccia, puo restare
parzialmente scritto nel DB. La RPC e anche la risposta a questa domanda.

## Altri vincoli misurati

### `owner_user_id`

`pets.owner_user_id` e `NOT NULL`. Sul demo:

- 7 pet totali;
- 0 `owner_user_id` null;
- 5 customer su 7 non hanno ancora un account Auth;
- solo 2 pet hanno `owner_user_id = customers.user_id`.

Per i nuovi pet creati dallo staff, la futura RPC deve quindi valorizzare
`owner_user_id = auth.uid()` come ponte di retrocompatibilita, senza
interpretarlo come identita del customer. L'autorizzazione resta tenant-aware.

### Ordinamento `last_visit_at`

La colonna `pets.last_visit_at` non esiste. `getAllPets` puo derivare l'ultima
visita dai record `visits.date` e ordinare lato client per il dataset pilota,
oppure richiedere in futuro una vista/RPC per un ordinamento DB scalabile. Il
mandato deve dichiarare quale contratto desidera.

### Rimozione shim

La rimozione di `src/apps/staff/lib/supabaseClient.js` richiede modifiche a
consumer ulteriori rispetto alle sette pagine dati nominate:

- `src/apps/staff/StaffApp.jsx`;
- `src/apps/staff/components/Auth/LoginForm.jsx`;
- `src/apps/staff/pages/CustomerInvite.jsx`;
- `src/apps/staff/pages/CustomerLogin.jsx`;
- `src/apps/staff/pages/PublicPetCard.jsx`;
- `src/apps/staff/pages/ResetPassword.jsx`.

Anche `Dashboard.jsx` e `CustomerPortal.jsx`, gia nel gruppo delle sette,
importano lo shim. La rimozione non puo compilare se l'elenco autorizzato non
include espressamente tutti i consumer.

## File esaustivi

| File | Azione |
|---|---|
| `docs/consegne/GH-05-gate5-staff-refactor-interruzione.md` | Creato; questo registro di interruzione |

Nessun file applicativo, seed, migration o dato e stato modificato da GH-05.
Non e stato creato alcun commit GH-05.

## Verifiche eseguite

- Letto integralmente `docs/incarichi/GH-05-gate5-staff-refactor.md`.
- Letto integralmente `supabase/docs/gate5-design-decisions.md`.
- Applicata la griglia delle cinque domande prima di scrivere codice.
- Interrogato `pg_proc` sul solo demo: nessuna RPC customer + pet.
- Misurati nullabilita e stato reale di `owner_user_id`/`customer_id`.
- Enumerati tutti i consumer dello shim tramite ricerca nel repository.
- Verificato che `AddClient.jsx` usa ancora il flusso legacy ed e necessario
  alla controprova 3.

Le sette controprove finali non sono state eseguite perche richiedono
l'implementazione bloccata. La sonda GH-04 resta viva e invariata.

## Dipendenze residue note per GH-06

Come gia previsto dal mandato, `contacts` resta una dipendenza temporanea:
lettura e migrazione dei record sono rinviate a GH-06. Nessuna tabella contacts
e stata modificata o rimossa.

## Soluzione consigliata a Cowork

### Percorso raccomandato

Emettere due atti distinti e ordinati:

1. **Micro-mandato DB idempotente**: autorizzare una sola migration per la RPC
   `add_customer_with_pet`, `SECURITY INVOKER`, con controllo esplicito
   `has_tenant_any_staff_access(p_tenant_id)`. La funzione inserisce customer e
   pet nello stesso corpo SQL, usa `auth.uid()` per `owner_user_id` di
   transizione e restituisce entrambi gli UUID.
2. **GH-05-bis applicativo**: riprendere Parte 0 e refactor, includendo
   esplicitamente `AddClient.jsx` e tutti i consumer dello shim sopra elencati.

Controprove preliminari della RPC prima della UI:

- staff: creazione customer + pet riuscita;
- customer: chiamata rifiutata;
- errore pet forzato: 0 customer orfani;
- tenant errato: rifiuto RLS/autorizzativo;
- pulizia dei dati `[DEMO GH-05]` dichiarata e misurata.

### Alternativa non raccomandata

Se il divieto di migration resta assoluto, il mandato deve rinunciare
esplicitamente alla parola “transazionale” e autorizzare due INSERT con
compensazione. Questa alternativa indebolisce il contratto e non soddisfa le
Decisioni Gate 5 cosi come sono scritte.

La prima soluzione e quella consigliata. Questa raccomandazione non autorizza
alcuna migration o modifica applicativa finche Luigi non emette il nuovo
mandato.

## Fuori istruzione

- GH-02-quater e stato chiuso prima di questa analisi, come richiesto, con
  commit `db3e3c2` e registro separato.
- Nessun account reale e stato usato.
- Nessuna credenziale, token o chiave e stata aggiunta ai file.
- Produzione non e stata interrogata o toccata.
