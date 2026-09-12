# GH-87 - La conferma e' un momento: interruzione al preflight

## Esito e perimetro

**NON IMPLEMENTATO: prerequisito assente sul demo.** Nessuna modifica al
codice applicativo. La migrazione citata come applicata in produzione nel
mandato non risulta disponibile nello schema del solo ambiente ammesso.
Non e' stata verificata ne' letta la produzione.

Root: `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree: `webapp/`.
Mandato nominativo: `docs/incarichi/GH-87-la-conferma-e-un-momento.md`, letto
integralmente nella versione locale. Base `main`:
`54524ca72cbf1cb77aaa4ddf9427dca2936a4d6f` (post GH-88), avanti di 4 commit
rispetto al riferimento locale `origin/main`; nessun fetch.

Unico ambiente interrogato: **grooming-hub-demo, qttpinkslhenxrsbhhhg**.
Sole letture dello stato progetto e del catalogo SQL, non delle righe utente.
Nessuna scrittura, DDL, nuova dipendenza, account, password, push, merge o deploy.
Non applicata la migrazione esistente: il mandato vieta nuove colonne e non
autorizza l'allineamento del demo.

## Misure vive

Misurato il 12 settembre 2026, intervallo 17:27:42-17:28:26 UTC.

| Oggetto | Esito |
|---|---|
| Progetto demo | `ACTIVE_HEALTHY` |
| `public.appointment_requests` | Presente, 16 colonne |
| `status`, `proposed_alternatives`, `staff_responded_at` | Tutte presenti |
| `chosen_date` | Assente |
| `chosen_time_preference` | Assente |
| `customer_response` | Assente |
| `customer_responded_at` | Assente |
| `public.respond_appointment_request_alternatives` | 0 funzioni/overload trovati |

Query discriminanti eseguite sul demo:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'appointment_requests'
  AND column_name IN ('chosen_date', 'chosen_time_preference',
                      'customer_response', 'customer_responded_at')
ORDER BY column_name;
-- Risultato: []

SELECT p.oid::regprocedure::text AS signature,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'respond_appointment_request_alternatives';
-- Risultato: []
```

Controllo distinto su `to_regclass` e sulle altre colonne: la tabella esiste,
il catalogo ne restituisce 16 e riconosce i tre campi preesistenti sopra.
Non e' una deduzione da un errore di login o da un progetto in pausa.

Ricerca locale:
```sh
rg -n 'gh87_customer_alternative_choice|respond_appointment_request_alternatives' supabase docs --glob '*.md' --glob '*.sql'
```
Prima di questo registro: solo tre riferimenti nel mandato GH-87, nessuna
fonte SQL corrispondente sotto `supabase/`. L'assenza del file locale non
dimostra lo stato prod; il blocco e' la misura viva sul demo.

## Perche' interrompere

La Parte 3 richiede il varco RPC e la lettura dei quattro nuovi campi.
Un frontend costruito ora contro quel contratto non funzionerebbe sul demo;
mock che lo inventassero non proverebbero le protezioni reali della funzione.
Non e' stato introdotto un fallback con scritture dirette alla tabella.
Non consegnata una modifica parziale alle sole parole WhatsApp come se
l'intero percorso fosse chiuso.

La ricognizione del codice conferma le aree da riprendere: formattazioni e
saluti in `src/apps/staff/lib/whatsapp.js`; query dei campi in
`src/apps/customer/hooks/useAppointmentRequests.js`; alternative oggi solo
testuali in `src/apps/customer/pages/Home.jsx`; risposta e preselezione data
in `src/apps/staff/pages/CustomerRequests.jsx`. Questi file sono invariati.

## Soluzione consigliata a Cowork

1. Rendere disponibile la **fonte esatta della migrazione esistente**
   `gh87_customer_alternative_choice`, compresi guard, ACL e comportamento
   della seconda risposta. Non ricostruirla dalla sola firma del mandato.
2. Farla applicare al **solo demo** da un attore autorizzato, oppure fornire
   a Codex un'autorizzazione nominativa per applicare quel preciso artefatto.
   Non serve una nuova migrazione progettata da Codex e non serve leggere il prod.
3. Ricontrollare quattro colonne, firma/definizione RPC, autorizzazioni e
   guard su proprietario, pending e coppia proposta. Poi riprendere qui GH-87.
4. Chiarire prima delle prove vive il perimetro delle fixture: il mandato
   prescrive fixture in memoria ma chiede anche le quattro colonne lette dal
   database dopo accepted/declined e il rifiuto RPC di una coppia estranea.
   L'eccezione di scrittura esplicita riguarda la **suite RLS esistente**.
   Raccomandato autorizzare anche un piccolo ciclo dedicato sul demo, con
   sonde gia' presenti, dati marcati e ripristino verificato, senza nuovi
   account/password; altrimenti quelle controprove vanno dichiarate simulate.

Alla ripresa: tre percorsi accepted/declined/coppia estranea, doppio tocco,
stato sempre pending senza appuntamento creato, lettura staff e data scelta
nel modale, conteggio GH-81 invariato, testi WhatsApp esatti, resa 375 px,
build e suite RLS autorizzata. La selezione frontend non deve sostituire i
controlli della funzione.

## File, verifiche e tempi

| File incluso nel commit | Modifica |
|---|---|
| `docs/consegne/GH-87-la-conferma-e-un-momento-esito.md` | Solo questo registro di interruzione |

Fuori da stage e commit: i documenti non versionati CD-08, GH-84, GH-85,
GH-86, GH-87, GH-88 sotto `docs/incarichi/`, attribuiti a Luigi/Cowork e
autorizzati come esclusi. GH-84 non riaperto; nessun diario modificato.

Verifica `git diff --name-only HEAD -- src public index.html package.json
package-lock.json`: nessun file. `git diff --check`: nessun errore.
Build e RLS **non eseguite per GH-87**: nessun codice cambiato e nessun nuovo
varco disponibile da provare. Non riutilizzati i PASS di altri mandati come
controprove di questo. Nessuna fixture creata, nessun ripristino necessario.

Durata misurata della ricognizione tecnica e del preflight: **44 secondi**,
17:27:42-17:28:26 UTC; escluse lettura iniziale, stesura registro e commit.
Nessun rallentamento locale persistente rilevato. Nessuna attivita' fuori
istruzione; blocco dichiarato prima di modificare l'app.

Commit documentale: `docs: record GH-87 demo prerequisite interruption`.
Hash recuperabile senza autoreferenza con:
`git log -1 --format=%H -- docs/consegne/GH-87-la-conferma-e-un-momento-esito.md`.
**La presenza di questo registro non significa che GH-87 sia implementato.**
