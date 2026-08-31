# Consegna GH-49 - Promozioni e foto protetta

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `cbf0fcf`.
- Database usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), verificato `ACTIVE_HEALTHY` prima della migration.
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessun push, merge o deploy.

## Esito

GH-49 e' completato. Lo staff dispone della nuova rotta `/promotions` per
creare, modificare, attivare o disattivare e riordinare le promozioni del
proprio salone. La Dashboard mostra una constatazione con collegamento alla
gestione soltanto quando non esiste alcuna promozione visibile in quel momento.

La visibilita customer applica entrambe le estremita della finestra temporale
anche a livello RLS. Il riordino passa da una RPC `SECURITY INVOKER` che accetta
solo una lista completa, senza duplicati e appartenente a un solo tenant
visibile alla sessione.

La whitelist customer di `pets` conserva soltanto `owner_notes` e
`coat_preferences`: `photo_url` torna invariata per ogni aggiornamento non
staff. Nell'app customer la fotografia continua a essere letta, ma il gesto di
caricamento o sostituzione e' stato rimosso. E' una difesa temporanea fino al
mandato che introdurra' fotografie distinte per scopi distinti.

L'immagine promozionale facoltativa non e' stata implementata: le nuove
promozioni possono essere composte integralmente senza immagine e un eventuale
`image_url` gia presente viene preservato in modifica.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260831045114_gh49_promotions_and_photo_protection.sql` | aggiunto | Whitelist pet a due campi, finestra completa nella policy customer e RPC tenant-safe di riordino. |
| `supabase/seeds/gh-49-foreign-staff-demo.sql` | aggiunto | Tenant e staff estranei idempotenti, marcati demo e usa-e-getta. |
| `scripts/rls-tests/teardown-gh49-foreign-staff.sql` | aggiunto | Smontaggio custodito della sonda cross-tenant GH-49. |
| `scripts/rls-tests/run.mjs` | modificato | Casi promozioni, sessione staff estranea, whitelist foto, preferenze e ripristino fixture. |
| `src/apps/staff/StaffApp.jsx` | modificato | Registra la rotta staff protetta `/promotions`. |
| `src/apps/staff/lib/database.js` | modificato | API tenant-scoped di lettura, conteggio, creazione, modifica e riordino promozioni. |
| `src/apps/staff/pages/Dashboard.jsx` | modificato | Accesso rapido e promemoria condizionale sulle promozioni visibili. |
| `src/apps/staff/pages/PromotionsManager.jsx` | aggiunto | Schermata staff completa con form, stati, disattivazione e riordino. |
| `src/apps/staff/pages/PromotionsManager.css` | aggiunto | Layout operativo responsive della nuova schermata. |
| `src/apps/customer/hooks/usePromotions.js` | modificato | Replica esplicita del filtro `valid_from` e `valid_to` nella query customer. |
| `src/apps/customer/hooks/usePet.js` | modificato | Payload customer ridotto a note proprietario e preferenze manto. |
| `src/apps/customer/pages/Pet.jsx` | modificato | Foto resa di sola lettura e rimozione completa del flusso upload customer. |
| `src/apps/customer/pages/Pet.css` | modificato | Rimossi gli stili orfani del gesto foto customer. |
| `docs/consegne/GH-49-promozioni-e-foto-protetta-esito.md` | aggiunto | Registro unico di implementazione, prove e teardown. |

Nessun altro file appartiene alla consegna.

## Migration e policy

Migration applicata una sola volta sul demo:

`gh49_promotions_and_photo_protection`

Invarianti misurate:

- `enforce_pets_customer_update_whitelist()` ripristina tutta la riga a `OLD`
  per i non-staff e riapplica soltanto `owner_notes` e `coat_preferences`;
- `promotions_customer_select_active` richiede stato attivo, inizio raggiunto,
  fine non superata e membership customer nel tenant;
- `reorder_promotions(uuid[])` rifiuta lista vuota, duplicati, righe non
  visibili e liste che mescolano tenant;
- la policy staff preesistente resta il gate CRUD del proprio tenant.

Advisor post-migration:

- sicurezza: 9 warning preesistenti, nessuno riferito agli oggetti GH-49;
- prestazioni: 104 warning complessivi; uno riguarda le due policy SELECT
  permissive di `promotions`, separate per customer e staff. Non e' un difetto
  funzionale o di isolamento emerso dalle controprove e non e' stato esteso il
  perimetro per accorparle.

## Controprove promozioni

| Prova | Misura | Esito |
| --- | --- | --- |
| Creazione staff | 3 fixture API e 1 promozione dal form reale | PASS |
| Modifica staff | titolo via API e testo via form reale persistiti | PASS |
| Disattivazione staff | via API e poi dal pulsante reale | PASS |
| Riordino staff | ordine API `10/20/30`; promozione reale spostata di una posizione | PASS |
| Finestra customer | attiva/in-finestra: 1 visibile; inattiva: 0; futura: 0 | PASS |
| Isolamento tenant | staff estraneo reale: 0 lette, 0 modificate, RPC `42501` | PASS |
| Promemoria Dashboard | presente con 0 visibili, assente con 1, nuovamente presente dopo disattivazione | PASS |

La promozione scritta dal gestionale per la prova finale era:

> **[DEMO GH-49] Il tuo pet splende**
>
> Una coccola speciale per il tuo pet, disponibile nel salone questa settimana.

Titolo e testo sono stati riletti identici in `/u/promotions` con una sessione
reale di Mario. Dopo la disattivazione non erano piu' eleggibili. La riga e'
stata eliminata nel teardown.

## Controprove foto

| Prova | Misura | Esito |
| --- | --- | --- |
| UPDATE customer diretto su `photo_url` | valore `null` rimasto invariato | PASS |
| UI customer | foto leggibile, nessun pulsante o input di sostituzione | PASS |
| `owner_notes` customer | marker scritto e poi ripristinato | PASS |
| `coat_preferences` customer | JSON scritto e poi ripristinato | PASS |
| Foto staff | upload e sostituzione storage, `photo_url` aggiornato, HTTP 200, valore originale ripristinato | PASS |
| Storage fuori perimetro | customer su pet altrui e tenant estraneo: HTTP 403 | PASS |

Il mandato riporta 42 foto esistenti come misura di produzione. La produzione
era contemporaneamente vietata, quindi quel numero ricevuto non e' stato
riletto. Sul solo ambiente ammesso, il demo, la misura verificabile e':

| Misura demo | Prima | Dopo |
| --- | ---: | ---: |
| `pets.photo_url IS NOT NULL` | 0 | 0 |
| oggetti `pet-avatars` | 0 | 0 |
| oggetti `client-photos` | 0 | 0 |

La prova staff ha introdotto un oggetto temporaneo e lo ha rimosso; nessuna
foto preesistente e' stata modificata.

## Suite e verifiche

| Prova | Misura | Esito |
| --- | --- | --- |
| Suite RLS demo estesa | `49 PASS`, `0 FAIL`, `0 SKIP` | PASS |
| Build finale | Vite `5.4.21`, 156 moduli, JS 682.80 kB (gzip 192.78 kB) | PASS |
| Sintassi suite | `node --check scripts/rls-tests/run.mjs` | PASS |
| `git diff --check` | nessun errore | PASS |
| Lint | script presente, ma `eslint` non installato (`command not found`) | NON ESEGUITO |

Warning build non bloccanti: database Browserslist datato e chunk principale
oltre 500 kB.

## Baseline e teardown

| Oggetto demo | Prima | Dopo | Residui GH-49 |
| --- | ---: | ---: | ---: |
| promozioni totali | 3 | 3 | 0 |
| promozioni con flag attivo | 2 | 2 | 0 |
| promozioni eleggibili customer | 0 | 0 | 0 |
| sonde `auth.users` GH-04/GH-44/GH-49 | 0 | 0 | 0 |
| membership sonde | 0 | 0 | 0 |
| tenant estraneo GH-49 | 0 | 0 | 0 |

Ordine di teardown:

1. pulizia automatica delle fixture create dalla suite;
2. eliminazione custodita della promozione scritta dalla UI;
3. eliminazione degli audit temporanei GH-44;
4. teardown custodito di staff e tenant estranei GH-49;
5. teardown custodito della sonda customer GH-44;
6. teardown custodito della sonda staff GH-04;
7. conteggi finali su promozioni, foto, storage, identita e membership.

## Eccezioni e fuori istruzione

- Il primo tentativo del seed GH-49 e' stato rifiutato dal vincolo
  `tenants_fidelity_tiers_valid`; il seed e' stato allineato alla configurazione
  fidelity obbligatoria gia esistente e poi applicato con successo.
- La suite eseguita nel sandbox non aveva rete; e' stata rilanciata con la
  stessa istruzione e accesso di rete autorizzato al solo demo.
- Nessun segreto e' stato stampato o committato. Le credenziali presenti nei
  seed sono pubbliche, marcate demo e sono state smontate.
- Nessuna modifica fuori istruzione.

## Commit

Commit locale previsto con messaggio
`feat: manage promotions and protect pet photos`. Il suo hash e' riportato
nella risposta finale. Nessun push eseguito.
