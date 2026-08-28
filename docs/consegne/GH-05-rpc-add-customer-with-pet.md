# Consegna GH-05-rpc - RPC atomica customer + pet

**Data:** 21 agosto 2026
**Branch:** `feat/customer-app`
**Base richiesta dal mandato:** `db3e3c2`
**Base operativa dichiarata:** `0356f77`
**Ambiente toccato:** solo Supabase demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`, stato `ACTIVE_HEALTHY`, PostgreSQL 17.6)
**Produzione:** non interrogata e non toccata
**Push/deploy:** non eseguiti

La base operativa contiene `db3e3c2` come antenato diretto, seguito soltanto
dal commit documentale BEA `0356f77`. All'avvio era presente la modifica
parallela `docs/diario-progetto.md`, attribuita a Cowork: non e stata letta,
modificata, messa in stage o inclusa nei commit GH-05-rpc.

## Esito

Creata `public.add_customer_with_pet(...)`, `SECURITY INVOKER`, con guard
esplicita `public.has_tenant_any_staff_access(p_tenant_id)` come prima
istruzione eseguibile. Customer e pet vengono inseriti nella stessa chiamata
Postgres: qualsiasi errore del pet annulla anche l'INSERT del customer.

La funzione usa `SET search_path = ''`, mantiene attive le RLS delle tabelle,
revoca `EXECUTE` a `PUBLIC`, `anon`, `authenticated` e `service_role`, quindi
lo riassegna soltanto ad `authenticated`. L'ACL misurata e:
`postgres=X/postgres, authenticated=X/postgres`.

`pets.owner_user_id` riceve `auth.uid()` della sessione staff come ponte
transitorio imposto dal vincolo `NOT NULL`. Il commento DB dichiara
esplicitamente che questo valore non rappresenta l'identita del customer.

## Griglia delle cinque domande

| Domanda | Decisione applicata |
|---|---|
| Chi agisce? | Un utente autenticato con membership canonica `owner` o `staff` nel tenant richiesto |
| Su quali dati? | Una nuova anagrafica `customers` e il suo primo record `pets`, entrambi nello stesso tenant |
| Dove si autorizza? | Guard esplicita all'ingresso e RLS tenant-aware, entrambe basate su `tenant_memberships` |
| Quale atomicita serve? | I due INSERT sono una singola invocazione SQL; errore del pet = rollback del customer |
| Quale compatibilita resta? | `owner_user_id = auth.uid()` e soltanto un ponte legacy; il legame di dominio e `pets.customer_id` |

## Firma dichiarata

```sql
public.add_customer_with_pet(
  p_tenant_id uuid,
  p_customer_first_name text,
  p_customer_phone text,
  p_pet_name text,
  p_customer_last_name text default null,
  p_customer_email text default null,
  p_customer_marketing_opt_in boolean default false,
  p_customer_operator_notes text default null,
  p_pet_species text default null,
  p_pet_breed text default null,
  p_pet_birth_date date default null,
  p_pet_sex text default null,
  p_pet_microchip text default null,
  p_pet_weight_kg numeric default null,
  p_pet_neutered boolean default null,
  p_pet_color text default null,
  p_pet_coat_preferences jsonb default null,
  p_pet_owner_notes text default null,
  p_pet_internal_notes text default null,
  p_pet_photo_url text default null
) returns table(customer_id uuid, pet_id uuid)
```

I primi quattro parametri sono obbligatori. Il telefono passa attraverso
`public.normalize_phone_it`; nome customer, telefono e nome pet vuoti vengono
rifiutati prima degli INSERT.

## File esaustivi

| File | Azione | Commit |
|---|---|---|
| `supabase/migrations/20260821031654_add_customer_with_pet.sql` | Creato e applicato al solo demo; funzione, commento e ACL | incluso |
| `docs/consegne/GH-05-rpc-add-customer-with-pet.md` | Creato; questo registro | escluso dal commit applicativo per rispettare il requisito del solo file migration |

Nessun file applicativo e stato modificato.

## Commit

`a3d40e8eb654eb5af6146781d3ab45e4d26fb5e9` -
`feat: add atomic customer and pet RPC`

Il commit contiene esclusivamente la migration. Il file e stato creato con
Supabase CLI e poi rinominato da `20260821031545` a `20260821031654` per
allinearlo alla versione registrata dal Supabase MCP sul demo.

## Controprove misurate

| # | Controprova | Esito |
|---|---|---|
| 1 | Login sonda staff e creazione `[DEMO GH-05]` | Login riuscito; RPC riuscita; ritornati customer `be3323a5-cbe1-41ef-aa82-2cecb7468c5f` e pet `61beb7e5-5da2-445c-ace1-82c99f6ac8cf`; legame e ponte staff verificati |
| 2 | Sessione Mario customer | Login riuscito; RPC respinta con SQLSTATE `42501`, prima di qualsiasi scrittura |
| 3 | Errore pet forzato (`sex = 'x'`) | Vincolo pet respinto con `23514`; customer con il telefono di prova dopo il fallimento: `0` |
| 4 | Tenant UUID estraneo | RPC respinta con `42501` |
| 5 | Pulizia marker `[DEMO GH-05]` | `0` customer, `0` pet e `0` telefoni di prova residui |

Baseline finale rimisurata: 7 customer e 7 pet, identica alla baseline iniziale.
La funzione risulta una sola volta nel catalogo e la migration remota e
registrata come `20260821031654_add_customer_with_pet`.

## Verifiche tecniche

- `npm run build`: riuscito, Vite 5.4.21, 133 moduli.
- `git diff --check`: pulito.
- Advisor post-migration: 21 avvisi security e 124 performance complessivi;
  nessun finding riferito a `add_customer_with_pet`.
- Restano i warning preesistenti di build su Browserslist non aggiornato e
  chunk JavaScript oltre 500 kB.
- Le modifiche Supabase 2026 su auto-esposizione di nuove tabelle non incidono:
  GH-05-rpc non crea tabelle e assegna esplicitamente `EXECUTE` alla funzione.

## Eccezioni e fuori istruzione

- Nessuna eccezione funzionale nelle cinque controprove.
- Un tentativo di interrogazione di verifica locale ha avuto un errore di
  sintassi JavaScript nell'orchestrazione prima di raggiungere Supabase; e
  stato corretto senza effetti sul DB.
- Nessun account e stato creato, promosso, retrocesso o modificato.
- La sonda GH-04 e Mario sono stati usati soltanto per autenticazione e prove;
  le sessioni sono state chiuse.
- Nessun file applicativo, seed, policy o tabella e stato modificato.
- Nessun accesso a produzione, deploy o push.

## Indicazioni operative per Cowork / GH-05-bis

Soluzione minima consigliata, coerente con la firma gia verificata:

1. `addCustomerWithPet(tenantId, customerData, petData)` deve essere un wrapper
   sottile di `supabase.rpc('add_customer_with_pet', params)` e restituire la
   coppia `{ customer_id, pet_id }`; non deve compensare con DELETE lato client.
2. `AddClient.jsx` oggi presenta il telefono come opzionale, ma
   `customers.phone` e `NOT NULL`: renderlo obbligatorio e validarlo prima
   della RPC, mantenendo invariato il layout.
3. Il singolo campo proprietario puo restare tale: trim; se contiene una sola
   parola usarla come `first_name`, altrimenti usare l'ultima parola come
   `last_name` e il prefisso come `first_name`, lo stesso criterio del backfill
   M11-bis.
4. Per la controprova UI di atomicita usare `p_pet_sex = 'x'` in un percorso di
   test controllato: il segnale atteso e `23514` e il customer deve restare a
   zero.
5. L'upload foto non fa parte dell'atomicita customer+pet della RPC. Nel
   refactor va dichiarato come passo successivo sulla riga pet gia creata; un
   errore storage non deve innescare cancellazioni compensative silenziose.

Queste indicazioni non estendono GH-05-rpc e non autorizzano modifiche
applicative: servono come calibrazione verificabile per il mandato GH-05-bis.
