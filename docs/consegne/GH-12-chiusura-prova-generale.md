# GH-12 — Chiusura prova generale, checkpoint Atti 1-3

**Mandato:** `docs/incarichi/GH-12-chiusura-prova-generale.md`
**Base Git dichiarata:** `1191b89` (`feat/customer-app`)
**Root operativa:** `/Users/luigimaisto/Desktop/grooming-hub-web/`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`
**Project ref bersaglio esclusivo:** `xkieyzuhtpiysjugtdik` (`grooming-prova-generale`)
**Produzione e demo:** fuori perimetro; nessuna lettura o scrittura
**Push:** vietato

## 1. Regola d'ingresso

La root coincide con quella prescritta dal mandato e il bersaglio dichiarato
e il solo progetto temporaneo. Il progetto era attivo e raggiungibile. Nessuna
query e stata rivolta a produzione o demo.

All'apertura erano presenti modifiche parallele di Cowork in
`docs/diario-progetto.md`, `docs/consegne/README.md` e nel mandato GH-11. Luigi
ha confermato esplicitamente che anche la modifica al README e di Cowork e va
ignorata. Questi tre file restano fuori dallo stage e dal commit GH-12. Il
registro GH-11 e il mandato GH-12, entrambi nuovi e prodotti da Cowork, sono
invece inclusi nella consegna: sono rispettivamente la prima meta della ricetta
G6 e la fonte normativa di questo checkpoint.

`CODEX_HANDOFF.md` non e presente nella root ne nel worktree applicativo.

## 2. Stato d'apertura

La misura d'ingresso e stata eseguita prima di ogni scrittura e ha coinciso in
ogni punto con il mandato:

| Entita | Atteso | Misurato |
|---|---:|---:|
| customers | 268 | 268 |
| pets | 290 | 290 |
| contacts | 295 | 295 |
| visits | 462 | 462 |
| customers senza telefono | 7 | 7 |
| conflitti di preflight | 1 | 1 |

Non sono stati rilevati atti concorrenti sul database.

## 3. Atto 1 - SQL di pulizia versionato

Creato
`supabase/prod-migrations/20260824100000_cleanup_test_records_prod.sql` come
trascrizione fedele dell'atto registrato il 24/08/2026 alle 10:24:42 nel
registro GH-11. La traccia completa era disponibile: non si tratta di una
ricostruzione per differenza.

Il file:

- ammette soltanto lo stato iniziale esatto o lo stato gia pulito;
- misura 6 clients legacy, 2 visite, 6 contatti, 12 appuntamenti, 3 reward,
  1 link, 4 inviti e 3 account Auth da rimuovere;
- usa una transazione e fallisce atomicamente su stati parziali o divergenti;
- non disabilita trigger e non opera su Storage;
- conserva l'account `ggetto@gmail.com`.

Come prescritto, il file **non e stato riapplicato** al temporaneo: la pulizia
era gia avvenuta prima dello split legacy e nello schema corrente la tabella
`clients` non esiste piu. L'idempotenza riguarda i due stati legacy ammessi al
punto corretto della futura catena G6.

Impronta: `d8f883f7770ce71e1d0c0e01cca918c4ee1b0870b2b234d159fd4acac8f0c6d9`
(SHA-256, 201 righe, 5.379 byte).

## 4. Atto 2 - Schede non recuperabili

Creato e applicato al solo progetto temporaneo
`supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql`.
Prima dell'applicazione il perimetro e stato rimisurato:

| Perimetro | Customer | Pet | Visite | Contatti | Appuntamenti | Reward | Pet con foto | Auth |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A, telefono mancante | 7 | 7 | 9 | 7 | 0 | 0 | 3 | 0 |
| B, conflitto noto | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| Totale | 8 | 8 | 10 | 8 | 0 | 0 | 3 | 0 |

Il perimetro A e selezionato per criterio misurabile; il perimetro B usa gli
identificativi espliciti autorizzati. Il file contiene guardie sulle
cardinalita globali e locali, sullo stato prima/dopo e sul customer protetto
`70097dcd-e5aa-4ceb-a15e-3fef04d09960`. Tutto e racchiuso in una transazione.

Applicazione Supabase: `drop_unreachable_records_prod`, versione registrata
`20260824124231`, riuscita in 1.482 ms.
Impronta file:
`90cb9f416ccb18c6fd67c6956d5931ffb15c7ec28204f24c4e4e883dbe952277`
(SHA-256, 279 righe, 8.564 byte).

### Storage

Non e stata tentata alcuna cancellazione SQL in Storage. Due oggetti reali del
bucket `client-photos` restano intenzionalmente orfani per il futuro gesto
separato via Storage API:

1. `cb7f316e-65b0-4419-a6df-56367a3d3c0a/301a4643-3ed8-49fc-920e-ba4ca806a927-1775057002870.jpg`
2. `cb7f316e-65b0-4419-a6df-56367a3d3c0a/04bc45e9-d5f5-47d5-be43-26115fb970ab-1773492470924.jpg`

Il terzo `photo_url` del perimetro A era un data URL incorporato nella riga pet
(916.607 caratteri), non un oggetto Storage: e scomparso con la riga. Il
perimetro B non aveva foto.

### Controprova post-Atto 2

| Entita | Prima | Atteso dopo | Misurato dopo |
|---|---:|---:|---:|
| customers | 268 | 260 | 260 |
| pets | 290 | 282 | 282 |
| visits | 462 | 452 | 452 |
| contacts | 295 | 287 | 287 |
| customers senza telefono | 7 | 0 | 0 |
| conflitti di preflight | 1 | 0 | 0 |

Il customer protetto e rimasto presente con 1 pet e 4 visite. Il contatto, il
customer e il pet del conflitto sono tutti assenti.

## 5. Atto 3 - `customers.phone NOT NULL`

Verificata prima dell'uso l'impronta prescritta del file:
`8cc8c2d38ba6dc0f84cb271d6a1e99adeb9d5aebaaccc3b5dd1bd3643d5a6065`.

Applicata al solo progetto temporaneo la migration
`finalize_customers_phone_not_null_prod`, versione registrata
`20260824124651`, in 1.175 ms. La guardia preliminare ha trovato zero telefoni
nulli o vuoti e l'`ALTER TABLE` e riuscito senza forzature.

Controprova finale:

| Verifica | Risultato |
|---|---:|
| `customers.phone IS_NULLABLE` | `NO` |
| customers senza telefono | 0 |
| customers / pets / visits / contacts | 260 / 282 / 452 / 287 |
| record B residui (contact/customer/pet) | 0 / 0 / 0 |
| customer protetto / pet / visite | 1 / 1 / 4 |

La prima query diagnostica finale ha riferito `column c.name does not exist`
in una sottoquery di sola lettura sul preflight. Nessun dato e cambiato. La
verifica e stata corretta usando l'assenza dei tre identificativi del solo
conflitto noto e ripetuta con esito positivo.

## 6. Tabella esaustiva dei file

| File | Provenienza | Azione GH-12 | Commit |
|---|---|---|---|
| `supabase/prod-migrations/20260424120000_split_clients_with_backfill_prod.sql` | GH-11 | invariato, incluso nella ricetta | incluso |
| `supabase/prod-migrations/20260824100000_cleanup_test_records_prod.sql` | GH-12 Atto 1 | creato, non riapplicato | incluso |
| `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | GH-11 | invariato, incluso nella ricetta | incluso |
| `supabase/prod-migrations/20260824120000_finalize_customers_phone_not_null_prod.sql` | GH-11/GH-12 Atto 3 | applicato al temporaneo | incluso |
| `supabase/prod-migrations/20260824130000_drop_unreachable_records_prod.sql` | GH-12 Atto 2 | creato e applicato al temporaneo | incluso |
| `docs/consegne/GH-11-registro-eseguito-24-08-2026.md` | Cowork | invariato, prima meta ricetta G6 | incluso |
| `docs/incarichi/GH-12-chiusura-prova-generale.md` | Cowork | invariato, fonte del mandato | incluso |
| `docs/consegne/GH-12-chiusura-prova-generale.md` | GH-12 | creato e completato | incluso |
| `docs/consegne/README.md` | Cowork parallelo | ignorato su conferma di Luigi | escluso |
| `docs/diario-progetto.md` | Cowork parallelo | ignorato | escluso |
| `docs/incarichi/GH-11-prova-generale-migrazione.md` | Cowork parallelo | ignorato | escluso |

## 7. Verifiche, eccezioni e fuori istruzione

- progetto bersaglio verificato: `xkieyzuhtpiysjugtdik`;
- misure d'ingresso, perimetro, post-Atto 2 e post-Atto 3 eseguite dal vivo;
- hash SHA-256 e dimensioni dei file calcolati localmente;
- controllo whitespace Git eseguito senza errori sui file tracciati;
- nessuna password letta, modificata, stampata o versionata;
- nessuna query a produzione o demo;
- nessuna RPC o UI modificata;
- nessun oggetto Storage cancellato;
- nessun deploy e nessun push;
- nessun atto fuori istruzione.

`npm run build` non e stato eseguito: il checkpoint modifica solo SQL e
documentazione, non prevede deploy o push e non autorizza il collaudo app
dell'Atto 7.

## 8. Indicazioni per Cowork e checkpoint

Per la futura ricetta G6 si consiglia di mantenere esplicito questo ordine:
prepare legacy -> cleanup test -> split -> drop unreachable -> finalize phone.
La pulizia test deve restare prima dello split; la cancellazione delle otto
schede deve restare dopo lo split e prima del `NOT NULL`. I due oggetti Storage
vanno gestiti come gesto separato e verificabile via API, senza introdurre nel
SQL scorciatoie contro `storage.protect_delete()`.

**Checkpoint Atto 4 raggiunto.** Gli Atti 5-7 non sono stati iniziati. Il
progetto temporaneo non e stato smontato e resta disponibile. La sessione si
chiude qui in attesa di un mandato separato e specifico.
