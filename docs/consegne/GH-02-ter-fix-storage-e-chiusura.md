# Consegna GH-02-ter — Fix Storage e Scheda pet

**Data:** 18 agosto 2026
**Esecutore:** Codex
**Incarico:** `docs/incarichi/GH-02-ter-fix-storage-e-chiusura.md`
**Esito:** perimetro GH-02-ter completato; eccezione Auth preesistente registrata

## Perimetro e base

| Voce | Valore |
|---|---|
| Branch | `feat/customer-app` |
| Base dichiarata | `f83e8d4947c669f6dba4b1c3a28c309a0fc88337` |
| HEAD alla consegna | `3254c950a46e06fcc05895b919ad8ce5ba8866b9` |
| Distanza da `origin/feat/customer-app` | 4 commit locali avanti, nessun push |
| Progetto DB usato | `grooming-hub-demo` |
| Ref demo | `qttpinkslhenxrsbhhhg` |

Il progetto demo era `ACTIVE_HEALTHY`. Il progetto produzione `grooming` non e
stato interrogato, modificato, collegato o distribuito.

## Parte 1 — Migration Storage

Supabase ha registrato sul solo demo la migration:

`20260818063103_fix_pet_avatar_customer_path_qualification`

La migration idempotente ricrea esclusivamente le policy:

- `Pet avatars customer insert`;
- `Pet avatars customer update`;
- `Pet avatars customer delete`.

Dentro ogni subquery il path e ora qualificato come
`storage.objects.name`. Le due condizioni `IS NOT NULL` dell'INSERT sono
rimaste invariate. Le policy `Pet avatars staff all` e `client-photos` non sono
state toccate. La lettura dal catalogo dopo l'applicazione mostra
`storage.foldername(objects.name)` e non piu `storage.foldername(p.name)`.

### Controprove vive Storage

Le prove hanno usato le API Supabase Auth e Storage, non inserimenti diretti in
`storage.objects`.

| Prova | Esito misurato |
|---|---|
| Mario carica su `<tenant_id>/<pet_Luna>/...` | riuscito |
| Mario sovrascrive lo stesso oggetto con `upsert` | riuscito; esercitata anche la policy UPDATE |
| Mario usa il pet `Fido`, appartenente allo staff demo | respinto con HTTP 403 RLS |
| Mario usa un `tenant_id` diverso | respinto con HTTP 403 RLS |
| Staff carica su un pet del tenant | riuscito |

Per la prova staff non e stata cercata o modificata la password dell'account
operatore. Mario, account esclusivamente di test, e stato promosso
temporaneamente da `customer` a `owner`, ha caricato sul proprio pet ed e stato
subito ripristinato a `customer`. Il ruolo finale e stato riletto dal DB.

Tutti gli oggetti creati sono stati eliminati tramite Storage API. Controllo
finale: `0` oggetti con marker `gh02-ter` nel bucket `pet-avatars`.

L'advisor Security dopo la migration conserva i 21 warning preesistenti e non
segnala nuovi problemi riferiti alle policy corrette.

## Parte 2 — A1-A4

### A1 — Lettura scheda

La rotta `/u/pet/:petId` mostra foto o iniziale, anagrafica, preferenze, note e
visite ordinate per data. Sono presenti loading, errore, empty/RLS, viewing,
editing, saving e saved: 7 stati distinti.

Verifica Mario nel browser:

- Luna e Pepe visibili dalla dashboard;
- scheda Luna con 6 campi anagrafici read-only;
- 3 visite demo visibili e ordinate;
- nessun errore console;
- restano solo i 2 warning React Router future flags gia presenti.

### A2 — Modifica whitelist e guard

Il frontend invia soltanto `owner_notes`, `coat_preferences` e `photo_url`.
Microchip, peso e gli altri dati staff non sono controlli modificabili.

Controprove browser:

- il pulsante Salva e disabilitato prima delle modifiche;
- dopo una modifica alle note diventa attivo;
- il click su Promozioni apre il dialog modifiche non salvate;
- rifiutando il dialog si resta sulla stessa URL e il testo non viene perso;
- il salvataggio mostra `Modifiche salvate`;
- la nota temporanea e stata poi ripristinata al valore demo originale.

I due textarea hanno ora un nome accessibile verificato nel DOM.

### A3 — Foto

Nel browser e stata selezionata un'immagine di prova da `1600 x 1600` pixel.
L'anteprima e apparsa prima del salvataggio; l'oggetto finale scaricato dal
bucket misura `1024 x 1024`, quindi il limite client-side e rispettato.

Il salvataggio di `photo_url` e la visualizzazione pubblica sono riusciti. A
prova conclusa `photo_url` e stato ripristinato a `NULL` e l'oggetto e stato
eliminato. La UI riletta via navigazione SPA mostra di nuovo l'iniziale.

Misure responsive dopo la rifinitura:

| Viewport | Overflow orizzontale | Titolo Luna |
|---|---:|---|
| 390 x 844 | no, `bodyScrollWidth = 390` | una riga, 204 x 38 px |
| 320 x 740 | no, `bodyScrollWidth = 320` | una riga, 272 x 38 px |

### A4 — Seed

Il seed idempotente gia applicato al demo e stato registrato nel repo. Tutti i
testi fittizi sono riconoscibili tramite marker `[DEMO GH-02]` o `[DEMO]`.

| Pet | Visite demo |
|---|---:|
| Luna | 3 |
| Pepe | 2 |

## RLS finale

Login API come `luca.bianchi@test.example` riuscito. La lettura del pet Luna di
Mario restituisce `0` righe, come previsto dalla RLS.

## Commit locali

| Hash | Messaggio | Contenuto |
|---|---|---|
| `4d87e22` | `fix: qualify pet avatar storage paths` | migration Storage |
| `4e57b77` | `feat: add editable customer pet page` | A1-A3 e navigazione protetta |
| `3254c95` | `chore: add demo pet page seed` | seed A4 |

## File esaustivi

| File | Stato | Intervento |
|---|---|---|
| `supabase/migrations/20260818063103_fix_pet_avatar_customer_path_qualification.sql` | committato | tre policy customer Storage |
| `src/apps/customer/CustomerApp.jsx` | committato | provider modifiche non salvate |
| `src/apps/customer/pages/Pet.jsx` | committato | scheda A1-A3, stati e responsive |
| `src/apps/customer/hooks/usePet.js` | committato | lettura e update whitelist pet |
| `src/apps/customer/hooks/usePetVisits.js` | committato | storico visite |
| `src/apps/customer/lib/petPhoto.js` | committato | resize, upload e cleanup foto |
| `src/shared/navigation/UnsavedChangesProvider.jsx` | committato | guard navigazione e beforeunload |
| `src/shared/ui/CustomerNav.jsx` | committato | guard link globali e logout |
| `src/shared/ui/Icon.jsx` | committato | icone camera e modifica |
| `supabase/seeds/gh-02-pet-page-demo.sql` | committato | seed demo idempotente |
| `docs/consegne/GH-02-ter-fix-storage-e-chiusura.md` | locale | questo registro |

Le modifiche documentali gia presenti nel worktree, inclusi diario e incarichi,
non sono state incluse nei commit.

## Verifiche tecniche

| Verifica | Esito |
|---|---|
| Build prima del commit migration | verde, 133 moduli |
| Build prima del commit A1-A3 | verde, 133 moduli |
| Build prima del commit seed | verde, 133 moduli |
| Ultimo bundle JS | 635,04 kB; gzip 162,43 kB |
| `git diff --check` | riuscito |
| `npm run lint` | non disponibile: `eslint` non installato |

Le build conservano due warning preesistenti: Browserslist non aggiornato e
chunk Vite superiore a 500 kB. Non sono comparsi warning nuovi attribuibili a
GH-02-ter.

## Eccezione misurata e soluzione consigliata a Cowork

### Reload diretto con sessione esistente

Dopo un salvataggio riuscito, il reload diretto di `/u/pet/:petId` resta nello
skeleton: rilevati 7 skeleton e nessun contenuto testuale nel `main` anche dopo
oltre 3 secondi. La navigazione SPA login -> home -> scheda funziona.

La causa e nel file preesistente `src/shared/auth/AuthProvider.jsx`, fuori dai
file autorizzati da GH-02-ter: il callback `onAuthStateChange` e `async` e attende
`refreshMemberships()`, che esegue un'altra chiamata sul medesimo client
Supabase. La guida ufficiale descrive questo caso come deadlock:

`https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0`

**Soluzione minima consigliata:** nuovo mandato limitato ad
`AuthProvider.jsx`; rendere sincrono il callback `onAuthStateChange` affinche
aggiorni soltanto la sessione, e spostare `refreshMemberships(userId)` in un
`useEffect` separato dipendente dall'id utente, con guard di annullamento.

**Controprove consigliate:**

1. login Mario, apertura Luna e hard reload: lo skeleton scompare e compaiono
   le 3 visite;
2. hard reload di `/u/home` e `/u/promotions`;
3. logout e nuovo login senza membership o ruolo obsoleti;
4. login operator e customer per verificare che il routing di ruolo resti
   bidirezionale.

Questa proposta non autorizza l'intervento. Codex non ha modificato
`AuthProvider.jsx` e non ha esteso il perimetro.

## Fuori-istruzione dichiarati

- Per la controprova staff e stata usata la promozione temporanea dell'account
  test Mario, poi ripristinata e verificata.
- Il reload Auth e stato soltanto diagnosticato e documentato.
- Nessun push, deploy, merge o modifica Vercel.
- Nessuna password, chiave privata o secret e stata scritta nei file o nei
  commit.
