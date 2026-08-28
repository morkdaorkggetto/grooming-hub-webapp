# Consegna GH-27 - Riparazioni pre-lancio

**Root dichiarata come primo atto:** `/Users/luigimaisto/Desktop/grooming-hub-web/`

**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`

**Stato:** completato

**Branch:** `feat/customer-app`

**Base Git:** `4197cceed63ddfcca73d1635785cf54eb5d1d9e1`

**Database usato:** solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`)

**Commit:** `HEAD` del commit che contiene questo registro; hash riportato anche nella consegna a Luigi.

Produzione e progetto temporaneo non sono stati letti o modificati. Nessun push,
deploy o invio WhatsApp e' stato eseguito.

## File della consegna

| File | Intervento |
| --- | --- |
| `docs/incarichi/GH-27-riparazioni-pre-lancio.md` | Mandato ricevuto e conservato con la consegna. |
| `docs/consegne/GH-27-riparazioni-pre-lancio.md` | Registro unico di esecuzione, misure ed eccezioni. |
| `supabase/migrations/20260828043652_gh27_prelaunch_repairs.sql` | Timezone salone, QR atomico, controproposte, blocco duplicati, chiusure, RPC data/ora locale e chiusura atomica visita-appuntamento. |
| `supabase/migrations/20260828044014_gh27_qr_backfill_privileged_fix.sql` | Correzione idempotente del backfill QR privilegiato senza allargare le scritture customer. |
| `src/apps/staff/lib/database.js` | Nuovi campi richiesta, RPC GH-27, inviti con destinatario e aggiornamento anagrafico completo. |
| `src/apps/staff/lib/whatsapp.js` | Sette testi WhatsApp centralizzati, tono approvato e URL diretti per destinatario. |
| `src/apps/staff/pages/CustomerRequests.jsx` | Chiusure, tre azioni, controproposte, stato risposta, blacklist, griglia e handoff WhatsApp persistente. |
| `src/apps/staff/pages/Calendar.jsx` | Conferma con data/ora locale, avviso chiusura, handoff persistente e accesso alla lavorazione. |
| `src/apps/staff/pages/DailyAppointments.jsx` | Handoff persistente e passaggio esplicito alla lavorazione senza chiusura separata. |
| `src/apps/staff/pages/AddVisit.jsx` | Un solo salvataggio atomico per visita nata da appuntamento. |
| `src/apps/staff/pages/AddClient.jsx` | Dopo il salvataggio porta alla scheda appena creata. |
| `src/apps/staff/pages/ClientDetail.jsx` | Completamento anagrafica, invito WhatsApp con destinatario e QR senza messaggi tecnici. |
| `src/apps/customer/hooks/useAppointmentRequests.js` | Lettura RLS delle richieste del cliente. |
| `src/apps/customer/hooks/useRewardPoints.js` | Lettura del saldo punti, incluso zero. |
| `src/apps/customer/pages/Home.jsx` | Richieste pendenti/rifiutate, alternative, appuntamento confermato e saldo punti. |
| `src/apps/customer/pages/Book.jsx` | Blocco doppioni, vocabolario Indicazione e nuovo codice `regular_grooming`. |
| `src/apps/customer/pages/Book.css` | Chip regolarita' senza a capo a 320 px. |

## Controprove 1-12

| # | Esito e misura |
| --- | --- |
| 1 | RPC locale riletta dal DB in sessioni UTC, New York, Tokyo e Honolulu: giorno/ora salone invariati, incluse `00:15` e `23:45`. Esempio Roma `2026-09-03 00:15` -> UTC `2026-09-02 22:15`. Domenica respinta nelle alternative; il dialogo staff espone l'avviso senza blocco assoluto. I 3 appuntamenti prova Luigi (`eb090eef`, `0fbb337c`, `d45e06a6`) sono passati da 3 a 0. |
| 2 | Demo: 7 pet, 7 token distinti, 0 token mancanti dopo backfill; nessun token preesistente riscritto. Scheda Pepe verificata con QR e comandi presenti. |
| 3 | Giro reale Mario/Luna: dopo l'invio la home mostra data, Bagno, fascia, ora invio e non mostra il falso vuoto; la CTA nuova punta a Pepe. Dopo controproposta mostra entrambe le alternative; dopo approvazione mostra l'appuntamento. Il ramo `rejected` usa la stessa query RLS ed espone l'invito a riprenotare. |
| 4 | RPC provata: una visita collegata porta l'appuntamento a `completed`; la seconda chiamata resta a una sola visita. UI reale verificata fino a `Salva e chiudi appuntamento`, senza salvare una visita fittizia. |
| 5 | Invito demo Pepe generato mostrando `Mario Rossi` e `+393331112233`; presenti `Apri WhatsApp` e copia link. URL preparato, mai aperto; invito poi rimosso. |
| 6 | Dopo la conferma il pannello separa chiaramente dato salvato e messaggio non inviato; testo, apertura e copia restano disponibili. Nessun WhatsApp aperto. |
| 7 | Mario vede `0 punti` e la spiegazione dell'accumulo sia con richiesta pendente sia con appuntamento confermato. |
| 8 | Il salvataggio nuovo cliente conduce alla scheda con prompt di completamento; specie, nascita, sesso, microchip, peso, colore e sterilizzazione sono modificabili senza renderli obbligatori nel primo form. |
| 9 | Card richiesta misurata: a 1440 px colonne `285.328/285.328/285.344`, a 768 px `148/148/148`; a 320 px entrambe le righe collassano nella stessa colonna senza overflow. |
| 10 | Giro reale richiesta -> stato `Risposto` -> alternative 8/9 settembre -> conferma. La richiesta e' rimasta pending durante la controproposta; domenica respinta con SQLSTATE `22023`; blacklist visibile solo staff. |
| 11 | Testi riuniti in `whatsapp.js`: `Ciao`, voce plurale, nessun nome sistema o stato interno. Messaggio reale di conferma reso visibile ma non inviato. |
| 12 | Wizard verificato a 320, 768 e 1440 px: `Indicazione`, nessun prezzo/durata nei chip, frase esatta sulla permanenza e chip `Lo porto regolarmente` largo 164.6 px, alto 44 px, senza a capo. Vincolo demo migrato e backfill idempotente. |

## Giro dati e sicurezza

- Richiesta browser: Luna, Bagno, fascia mattina, marker
  `[DEMO GH-27 BROWSER] richiesta temporanea`.
- Controproposta: 8 settembre mattina e 9 settembre pomeriggio; stato lato
  cliente e staff verificato.
- Conferma finale riletta dal DB e dalla home cliente: 8 settembre 2026,
  09:00, 60 minuti.
- Duplicate pending sullo stesso pet: respinto con SQLSTATE `23505`.
- Alternative chiuse: respinte con SQLSTATE `22023`.
- Suite RLS finale prima del teardown sonda: **26 PASS, 0 FAIL, 1 SKIP**
  (skip atteso per assenza di un secondo tenant).
- Primo giro RLS, dichiarato: **20 PASS, 6 FAIL** per fixture GH-27 ancora
  presenti; dopo rimozione delle fixture il giro pulito e' quello sopra.
- Advisor demo dopo le migration: nessun nuovo rilievo GH-27; restano gli
  avvisi preesistenti su funzioni legacy security-definer e leaked-password
  protection.

## Cleanup finale

Rilettura unica sul demo dopo il teardown:

| Controllo | Residuo |
| --- | ---: |
| Utente sonda `staff.sonda@test.example` | 0 |
| Profilo e membership sonda | 0 / 0 |
| Inviti creati dalla sonda | 0 |
| Richieste marker GH-27 | 0 |
| Appuntamenti GH-27 | 0 |
| Visite GH-27 | 0 |
| Richieste pending complessive demo | 0 |
| Pet demo | 7 |
| Pet senza QR | 0 |

Nessun account customer o operatore reale e' stato modificato o rimosso.

## Verifiche locali

- `npm run build`: verde, 147 moduli; solo warning standard sulla dimensione
  del chunk.
- `git diff --check`: verde.
- `npm run lint`: non eseguibile per configurazione preesistente,
  `eslint: command not found`; `package.json` dichiara lo script ma non la
  dipendenza. Nessuna dipendenza e' stata aggiunta fuori mandato.

## Eccezioni e fuori istruzione

- Il `fill` automatico del controllo nativo `input[type=date]` mostrava l'8
  settembre nel DOM ma React manteneva il valore iniziale del 1 settembre.
  Non e' stato modificato il prodotto per accomodare l'automazione: il dato
  temporaneo e' stato riallineato sul demo all'8 settembre, riletto dal DB e
  poi rimosso. Le prove multi-fuso della RPC restano la controprova del fix.
- `docs/diario-progetto.md` e `scripts/salva.sh` sono modifiche parallele
  preesistenti attribuite a Cowork e autorizzate da Luigi a restare fuori:
  non sono state lette per il mandato, messe in stage o committate.
- La migration correttiva QR e' separata per rendere esplicita la scoperta:
  il trigger whitelist precedente annullava anche il backfill privilegiato
  senza JWT. La correzione conserva la whitelist per ogni customer autenticato
  e abilita solo manutenzione privilegiata senza sessione utente.

## Proposta operativa a Cowork

Prima del preflight produzione, eseguire su una copia del prod: inventario dei
pet senza QR, impronta dei token esistenti, prova delle RPC con timezone del
tenant e suite RLS completa. Applicare le due migration nello stesso ordine e
bloccare la promozione se token preesistenti cambiano, se una chiusura viene
accettata nelle alternative o se una conferma non torna identica rileggendo il
DB in `Europe/Rome`.
