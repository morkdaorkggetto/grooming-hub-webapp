# Consegna GH-29 - Interruzione per copertura security non equivalente

**Root dichiarata come primo atto:** `/Users/luigimaisto/Desktop/grooming-hub-web/`

**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`

**Stato:** interrotto alla controprova di equivalenza richiesta dal mandato

**Branch:** `feat/customer-app`

**Base Git:** `90d445fea3dbeeed55e519eba70768b22dfd479d`

Questo mandato ha prodotto esclusivamente il presente registro. Nessun database
(demo, produzione o progetto temporaneo) e stato letto o modificato.

## 1. Esito vincolante

La copertura di `20260511070742_enforce_staff_only_notes_columns.sql` **non e
equivalente** a quella ottenuta con i due trigger indicati nel mandato.

La meta relativa ai pet e coperta in modo piu ampio; la meta relativa ai
customer non lo e:

| Protezione legacy da sostituire | Copertura nella catena G6 | Esito |
|---|---|---|
| `pets.internal_notes` | `trg_pets_customer_update_whitelist` ripristina l'intera riga da `OLD` per un non-staff, poi riapplica solo `owner_notes`, `coat_preferences` e `photo_url` | equivalente o migliore |
| `customers.operator_notes` | `trg_customers_protect_directory_fields` ripristina soltanto `acquisition_source` e `relationship_status`; il trigger scatta soltanto per update di queste due colonne | **non coperta** |

Il mandato GH-29, sezione "L'esclusione dichiarata", ordina di fermarsi se la
copertura non e equivalente. Per questo non sono stati creati il seed servizi,
varianti prod-safe o una ricetta G6 parziale.

## 2. Evidenze misurate sui file

1. La policy `customers_self_update` consente al customer di aggiornare la
   propria riga e non puo limitare singole colonne
   (`supabase/migrations/20260424141500_rls_customers.sql`, righe 35-39).
2. La migration esclusa ripristina esplicitamente
   `NEW.operator_notes := OLD.operator_notes` per chi non ha accesso staff e
   installa `trg_customers_protect_operator_notes`
   (`supabase/migrations/20260511070742_enforce_staff_only_notes_columns.sql`,
   righe 27-51).
3. La funzione attuale `enforce_customer_directory_fields_staff_only` ripristina
   esclusivamente `acquisition_source` e `relationship_status`; anche la lista
   `BEFORE UPDATE OF` contiene solo questi due campi
   (`supabase/prod-migrations/20260824140000_absorb_contacts_customer_first_prod.sql`,
   righe 448-474).
4. La whitelist pet ripristina `NEW := OLD` e lascia ai non-staff soltanto i tre
   campi previsti; `internal_notes` resta quindi protetto
   (`supabase/migrations/20260818060158_enforce_pets_customer_update_whitelist.sql`,
   righe 12-51).
5. La variante prod di security hardening dichiara e verifica che le routine
   legacy delle note siano assenti; non introduce una protezione alternativa
   per `customers.operator_notes`
   (`supabase/prod-migrations/20260824150000_security_hardening_prod.sql`,
   righe 1-56).

## 3. Soluzione raccomandata a Cowork, una tantum

Questa raccomandazione fuori dal perimetro esecutivo e stata autorizzata
esplicitamente da Luigi il 28/8/2026 come consiglio una tantum.

Autorizzare un piccolo atto prod-safe dedicato, da collocare **dopo**
`20260824140000_absorb_contacts_customer_first_prod.sql` e **prima**
`20260824150000_security_hardening_prod.sql`, che:

1. sostituisca idempotentemente
   `public.enforce_customer_directory_fields_staff_only()` aggiungendo
   `NEW.operator_notes := OLD.operator_notes` nel ramo non-staff;
2. ricrei `trg_customers_protect_directory_fields` come `BEFORE UPDATE OF
   acquisition_source, relationship_status, operator_notes`;
3. conservi `SECURITY INVOKER`, `search_path = ''` e le revoche gia presenti;
4. non reintroduca le due routine legacy e non tocchi il trigger pet, gia piu
   restrittivo e corretto.

Questa soluzione evita di applicare integralmente la migration legacy: la sua
meta pet sarebbe ridondante, mentre le sue funzioni `SECURITY DEFINER`
contraddirebbero il preflight esplicito dell'hardening prod. Dopo
l'autorizzazione, GH-29 puo riprendere includendo il nuovo atto nella ricetta e
verificando la copertura completa.

## 4. Impronte delle evidenze

| File | SHA-256 |
|---|---|
| `docs/incarichi/GH-29-ricetta-g6-aggiornata.md` | `38e4d46fedf36fb47750a0c162d688ae97395708e4d0026c40bb61c2dc7d2019` |
| `supabase/migrations/20260511070742_enforce_staff_only_notes_columns.sql` | `ffbf4320736cdba1884d1645110287e7baa9cf3c23ab25ef16639aeb6af71b28` |
| `supabase/migrations/20260818060158_enforce_pets_customer_update_whitelist.sql` | `fa6844fa430b52aed3dc73b46d49c9d445e954bbcff7b47ce0e31cce264ba46a` |
| `supabase/prod-migrations/20260824140000_absorb_contacts_customer_first_prod.sql` | `02ea9a26f4b1db512093d201343e2777e9c74f652f769122796f10ca54036a8c` |
| `supabase/prod-migrations/20260824150000_security_hardening_prod.sql` | `c9537584c2b768294cc58a4533fc43a2e522b517486ad1e3e5e81fb43bcb2c79` |
| `supabase/migrations/20260424141500_rls_customers.sql` | `d735fab6008c9b1b7024499fe874d70a8ba8df3bcb1bd4afe2b567bb1c9e6a9a` |

## 5. File della consegna

| File | Azione |
|---|---|
| `docs/consegne/GH-29-ricetta-g6-aggiornata.md` | creato come registro di interruzione |

## 6. Verifiche, eccezioni e fuori istruzione

- Verifica statica completa delle policy customer e delle tre implementazioni
  trigger pertinenti: **fallita** sul campo `customers.operator_notes`.
- Nessuna applicazione a database e nessuna verifica live, come richiesto dal
  mandato.
- Nessun seed, migration o variante prod-safe creati dopo l'esito negativo.
- Nessun secret, password, token o identificativo ambiente scritto nel
  registro.
- `scripts/salva.sh` era gia modificato all'ingresso, e stato ignorato e resta
  fuori dalla consegna.
- Nessun push e nessun deploy.
