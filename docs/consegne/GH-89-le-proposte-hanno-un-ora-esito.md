# GH-89 - Le proposte hanno un'ora: esito

## Esito e perimetro

**Mandato eseguito.** Le alternative staff portano giorno e ora, il carico
delle postazioni e' visibile nei due modali, la persona sceglie lo slot esatto
e il salone conserva l'atto finale di prenotazione. Build verde, banco browser
verde e suite RLS **60 PASS, 0 FAIL, 0 SKIP**.

Root `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree `webapp/`.
Base `main`: **4bb68069a0df58d99cedd8a52734481b3d40a501**.
Commit di codice e registro: `feat: add timed appointment alternatives (GH-89)`.
Hash risolvibile con
`git log -1 --format=%H -- docs/consegne/GH-89-le-proposte-hanno-un-ora-esito.md`.

Database letto e scritto soltanto per le controprove temporanee:
**grooming-hub-demo**, ref **qttpinkslhenxrsbhhhg**, stato
`ACTIVE_HEALTHY`. Produzione mai letta o scritta. Nessun account creato,
nessuna password toccata, nessuna prenotazione automatica, nessun push,
merge o deploy.

La fonte `20260913_gh89_alternatives_with_time.sql`, fornita da Luigi, entra
nel commit per autorizzazione esplicita: e' stata inclusa **senza modificarla
e senza applicarla**. Era gia' applicata da Cowork in produzione e da Luigi
al demo. SHA-256 prima e al termine:
`82f3a476c38af8deeb7918634784323b9749864706bc2ce2efecc36834a752ea`.

## Tabella esaustiva dei file del commit

| File | Intervento / motivo |
|---|---|
| `src/apps/staff/pages/CustomerRequests.jsx` | Giorno+ora nelle proposte, letture giornaliere cache, carico e primo slot libero nei due modali, precompilazione della scelta, errore capienza concorrente in italiano |
| `src/apps/staff/lib/whatsapp.js` | Alternative WhatsApp con ore e grammatica date preesistente; compatibilita' con proposte senza ora |
| `src/apps/customer/hooks/useAppointmentRequests.js` | Lettura di `chosen_time` |
| `src/apps/customer/lib/appointmentResponses.js` | Confronto per data+ora quando presente e fallback data+fascia legacy |
| `src/apps/customer/components/PendingRequest.jsx` | Etichette degli slot esatti e sola RPC `respond_appointment_request_slot` |
| `supabase/migrations/20260913_gh89_alternatives_with_time.sql` | Fonte SQL autorizzata, inclusa immutata e non applicata da Codex |
| `docs/consegne/GH-89-le-proposte-hanno-un-ora-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-89/browser-check.mjs` | Banco riproducibile con app e SDK reali, HTTP in memoria e rete reale bloccata |
| `docs/consegne/evidenze/GH-89/browser.json` | Risultati funzionali, letture, payload, testo WhatsApp e misure layout |
| `docs/consegne/evidenze/GH-89/live-demo.json` | Misure schema/RPC, prova transazionale demo, rollback e suite RLS |
| `docs/consegne/evidenze/GH-89/staff-invariants.sha256` | Impronte delle 28 pagine/componenti staff fuori dalla superficie modificata |
| `docs/consegne/evidenze/GH-89/staff-alternatives-375.png` | Tre alternative temporizzate e carico a 375 px |
| `docs/consegne/evidenze/GH-89/customer-timed-choice-375.png` | Riepilogo della scelta esatta a 375 px |
| `docs/consegne/evidenze/GH-89/staff-approval-race-375.png` | Errore concorrente nel modale a 375 px |
| `docs/consegne/evidenze/GH-89/staff-invalid-time-375.png` | Ora fuori apertura e testo operativo a 375 px |

Fuori da modifica, stage e commit:
`docs/incarichi/GH-85-quante-postazioni-restano.md` modificato e
`docs/incarichi/GH-89-le-proposte-hanno-un-ora.md` non versionato. Sono file
di Luigi/Cowork; GH-85 e' soltanto marcato ritirato. Nessun altro documento,
diario, brief CD o file parallelo incluso.

## Comportamento realizzato

Nel modale delle alternative restano due righe, con terza opzionale. Ogni riga
ha data e ora a passi di 15 minuti. `time_preference` non ha un controllo
separato: viene derivata dall'ora tramite
`getBookingTimeWindowForTime`, quindi l'interfaccia non puo' produrre una
coppia incoerente. Due ore diverse nello stesso giorno sono ammesse.

Il carico viene letto solo dopo la selezione della data e soltanto per quel
giorno. La cache e' per tenant+data: due righe sullo stesso giorno generano
una lettura, cambiare soltanto l'ora non rilegge. Se la lettura e' in corso o
fallisce non appare ne' un numero ne' la parola "libero".

Il numeratore dell'ora scelta e la disponibilita' usano esclusivamente gli
helper di `shared/tenant/workstationCapacity.js`. Caso misurato:
**16:30 = 3/3**, primo momento libero **17:30**; un tocco su
**Usa le 17:30** compila il campo e il carico diventa **0/3**. Il confronto
con il calendario sullo slot pieno e' **3/3 nel calendario, 3/3 nel modale**.
Nessun calcolo alternativo introdotto.

Il modale di conferma parte da `chosen_date` e `chosen_time`; data, ora e
durata restano modificabili. Il salone crea l'appuntamento soltanto premendo
la conferma esistente. Se il database rifiuta per una capienza cambiata nel
frattempo, il modale resta aperto e mostra:

> Nel frattempo quell’orario si è riempito. Scegli un altro orario e riprova.

Il messaggio non resta come errore globale dopo la chiusura del modale.

La persona vede **lunedì 12 ottobre alle 17:30** e chiama soltanto
`respond_appointment_request_slot` con i cinque argomenti. Dopo l'accettazione:

> Hai scelto lunedì 12 ottobre alle 17:30. Ora tocca al salone confermare l'appuntamento.

Nessuna disponibilita' altrui viene esposta nell'area customer. Le proposte
storiche prive di `time` restano leggibili e rispondibili per data+fascia.
"Nessuna di queste mi va bene" usa la nuova RPC e lascia la richiesta pending.

## Controprove browser

Banco finale: Chromium, viewport 375x812, fuso `Europe/Rome`, applicazione e
Supabase SDK reali. Auth/REST risposti in memoria; WebSocket chiusi, font
neutralizzati, **0 destinazioni impreviste**, **0 page error**. Sei gruppi
funzionali e quattro screenshot; durata **4,446 s**.

| Prova | Esito misurato |
|---|---|
| Apertura alternative senza data | 0 letture appuntamenti; nessun testo di carico |
| Tre alternative, due stesso giorno | Payload `12/10 17:30 afternoon`, `12/10 18:00 afternoon`, `13/10 10:00 morning` |
| Cache giornaliera | Date lette una volta per stato del modale; cambio sola ora: 0 letture aggiuntive |
| Pieno e suggerimento | 16:30 `3/3`; pulsante `Usa le 17:30`; dopo il tocco campo `17:30`, carico `0/3` |
| Confronto calendario/modale | `3/3` e `3/3` sullo stesso slot pieno |
| Scelta customer | RPC con date `2026-10-12`, time `17:30`, preference `afternoon`; stato `pending` |
| Proposta legacy | `p_time=null`, fascia `morning`, risposta riuscita e stato `pending` |
| Rifiuto customer | Nuova RPC, stato `pending` |
| Coppia non proposta | Testo: `Questa alternativa non è più disponibile. Aggiorna le proposte e riprova.` |
| Modale conferma | Apertura `date=2026-10-13`, `time=10:00`, durata 60; campi editabili |
| Race capienza | Testo italiano integrale riportato sopra, modale ancora aperto |
| Ora 20:00 | Blocco: `Ogni alternativa deve avere una data e un’ora fra le fasce di apertura: 09:00–19:00.` |
| Fascia incoerente | Nessun input fascia; per 17:30 il payload derivato e' `afternoon` |
| Mobile 375 px | overflow massimo 0 px, 0 troncamenti, 0 nuovi target sotto 44 px |

L'eccezione nota `Grooming Hub` sotto 44 px resta preesistente e fuori
perimetro, come prescritto da GH-87. Nessun colore o geometria globale toccati.

Messaggio WhatsApp completo misurato:

> Ciao Ada Prova, purtroppo sabato 10 ottobre siamo pieni. Per Lacky avremmo lunedì 12 ottobre alle 17:30, lunedì 12 ottobre alle 18:00 oppure martedì 13 ottobre alle 10:00. Scegli nella tua area l'orario che preferisci: poi ti confermiamo l'appuntamento.

Ricerca grammatica eseguita:

```sh
rg -n 'formatDesiredDate|toLocaleDateString\('it-IT'|respond_appointment_request_alternatives' src/apps/staff/lib/whatsapp.js src/apps/customer src/apps/staff
```

Le alternative passano dal solo `formatDesiredDate` esistente in
`whatsapp.js`; l'ora viene aggiunta come `HH:MM`. Ricerca esaustiva in `src/`:
**0 chiamate** a `respond_appointment_request_alternatives`, **1 chiamata**
alla nuova `respond_appointment_request_slot`.

## Controprove vive sul demo

Preflight: le cinque colonne esistono con i tipi attesi. La nuova RPC e'
`SECURITY DEFINER`, `search_path=''`, eseguibile da `authenticated`, non da
`anon`; la vecchia RPC resta presente. La prova e' avvenuta in un blocco con
subtransazione e rollback intenzionale: nessuna fixture GH-89 e' rimasta.

| Prova | Esito demo |
|---|---|
| Tre alternative rilette | `15/09 10:00 morning`; `15/09 11:00 morning`; `16/09 15:30 afternoon` |
| Ora non valida | SQLSTATE `22023`, `Invalid alternative time` |
| Accettazione esatta | `chosen_date=2026-09-15`; `chosen_time=10:00:00`; `chosen_time_preference=morning`; `customer_response=accepted`; `customer_responded_at=2026-09-13T04:04:05.00667Z`; status `pending`; appointment null |
| Proposta legacy | `chosen_time=null`, data/fascia accettate, status `pending`, appointment null |
| Nessuna proposta adatta | response `declined`; tre campi scelta null; status `pending`; appointment null |
| Coppia non proposta | SQLSTATE `22023`, `Chosen slot was not proposed` |
| Race con 2/2 postazioni | SQLSTATE `P0001`, detail `GH37_APPOINTMENT_CAPACITY`, richiesta ancora `pending` |
| Pulizia transazionale | requests `0 -> 1 -> 0`; appointments `8 -> 10 -> 8`; fixture residue 0/0 |

La coppia DB `17:30 + morning` e' stata accettata: e' il limite esplicitamente
richiesto dal mandato, perche' gli orari di apertura vivono ancora nel codice.
La UI impedisce la contraddizione strutturalmente derivando la fascia.

Suite RLS sul demo:

```text
60 PASS, 0 FAIL, 0 SKIP
real 25.73 s; user 1.14 s; sys 0.19 s
```

Prima/dopo: 14 oggetti operativi identici per conteggio e impronta; pets 7,
visits 90, customers 7, appointments 8, requests 0, storage objects 0,
auth users 6. `customer_account_unlink_audit` **10 -> 12**: sono le due righe
di audit che la suite conserva intenzionalmente, non fixture dimenticate.
Script RLS immutato, SHA-256
`e0d6bfe12333148486fe6494414c78d03224d29fd0950db2913d73c5510ca7bc`.

## Invarianti, build e tempi

`Calendar.jsx` e `CalendarKit.jsx` non hanno diff e conservano le impronte:

- Calendar: `a11796d61136af77fa6467f042ac3af78b94f2c8e7c3032eb41c680e6a0ccbd0`
- CalendarKit: `029b08d5d9a80b762b0e9a24c49ed56bd76216729dfd1954e74cb6ceadc33088`

Il confronto fra base e worktree sotto `src/apps/staff/pages` e
`src/apps/staff/components` trova un solo file diverso:
`CustomerRequests.jsx`. Le altre **28 impronte** sono in
`staff-invariants.sha256` e coincidono una per una con la base. Nessun file
in `src/shared` modificato.

`npm run build`: **165 moduli**, completato in **1,56 s** (Vite 1,22 s).
Avvisi non bloccanti preesistenti: `caniuse-lite` non aggiornato e chunk JS
oltre 500 kB. Nessuna dipendenza aggiornata.

`npm run lint` tentato: non eseguibile, perche' lo script richiama `eslint`
ma il binario non e' installato (`eslint: command not found`). Non sono state
installate dipendenze ne' modificati manifest o lockfile per aggirare il limite.

Finestra operativa misurabile dalla prima modifica ai file applicativi:
**05:54:59-06:09:54 CEST, 14 min 55 s**. Include correzione del banco e
controllo visivo; esclude la ricognizione iniziale precedente alla prima
scrittura. Misure isolate: browser finale 4,446 s; suite RLS 25,73 s; build
1,56 s. Nessun rallentamento anomalo del filesystem osservato.

## Eccezioni e indicazione a Cowork

Nessuna estensione fuori mandato. La migrazione e' l'unica eccezione al
normale perimetro file, autorizzata da Luigi; non e' stata modificata o
applicata. I due documenti paralleli sono rimasti fuori.

**Indicazione operativa adottabile da Cowork, non eseguita qui:** dopo il
rilascio e quando non esistono piu' client pubblicati che usano la firma
precedente, misurare le chiamate residue e rimuovere la vecchia
`respond_appointment_request_alternatives` con un mandato SQL dedicato. Quando
gli orari di apertura passeranno nelle impostazioni tenant, aggiungere nella
RPC il controllo server della coerenza ora/fascia; fino ad allora non duplicare
nel database la tabella oraria oggi definita dal codice.

## Passo finale di Luigi

Resta la verifica umana prescritta: gestionale su un dispositivo, area
customer sull'altro; tre ore vere proposte guardando il carico, una scelta dal
telefono e conferma dal gestionale. Annotare quanti tocchi servono e rispondere
alla domanda: **cosa non ti torna mentre Davide parla al telefono con la
persona?**
