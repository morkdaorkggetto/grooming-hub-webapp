# GH-98 - Quello che hai messo in agenda si vede: esito

## Esito

Mandato eseguito su `main`, base **a99a372ba471485bae7591ddc78dc2d1e7867747**.
Commit previsto: `feat: surface unfinished calendar work (GH-98)`.
Hash risolvibile con `git log -1 --format=%H -- docs/consegne/GH-98-quello-che-hai-messo-in-agenda-si-vede-esito.md`.

Il calendario avverte quando si sceglie un giorno passato senza vietarlo, nomina data e ora dopo ogni creazione o spostamento, mostra gli appuntamenti passati ancora `scheduled` e distingue quelli con una visita nello stesso giorno. Chi crea un pet nel modale e chiude prima di salvare l'appuntamento riceve un avviso; il pet resta intatto.

Nessuna migrazione, policy, rotta o dipendenza. Produzione non letta e non scritta; il solo database contattato è stato il demo `qttpinkslhenxrsbhhhg`. Nessun push, merge o deploy.

## File del commit

| File | Motivo |
|---|---|
| `src/apps/staff/pages/Calendar.jsx` | Avviso data passata, conferme datate, indice visite aggregato, coda e avviso pet incompleto |
| `src/apps/staff/components/CalendarKit.jsx` | Righe della coda con distinzione visita/non visita |
| `docs/consegne/GH-98-quello-che-hai-messo-in-agenda-si-vede-esito.md` | Registro |
| `docs/consegne/evidenze/GH-98/browser-check.mjs` | Banco browser con Supabase simulato in memoria |
| `docs/consegne/evidenze/GH-98/browser.json` | Esiti, letture, testi e misure browser |
| `docs/consegne/evidenze/GH-98/live-demo-check.mjs` | Fixture marcate, riletture e teardown sul solo demo |
| `docs/consegne/evidenze/GH-98/live-demo.json` | Esiti e baseline della prova demo |
| `docs/consegne/evidenze/GH-98/live-sql.json` | Confronto conteggio API/SQL sul demo |
| `docs/consegne/evidenze/GH-98/queue-full-375.png` | Coda piena a 375 px |
| `docs/consegne/evidenze/GH-98/queue-full-1365.png` | Coda piena a 1365 px |
| `docs/consegne/evidenze/GH-98/past-date-warning-375.png` | Avviso giorno passato nel modale |
| `docs/consegne/evidenze/GH-98/save-points.txt` | Ricerca esaustiva dei punti di salvataggio calendario |
| `docs/consegne/evidenze/GH-98/ui-invariants.sha256` | Impronte e superfici escluse |

Fuori da modifiche, stage e commit: `docs/diario-progetto.md`, i mandati `GH-97` e `GH-98`, `nomi-da-recuperare/`, `qr-gadget/` e `controlli-salone/`. Quest'ultima cartella è comparsa durante il lavoro ed è stata attribuita da Luigi a Luigi/Cowork; tutte le voci sono rimaste intatte.

## Testi esatti

- giorno passato: `Attenzione: stai scegliendo martedì 22 settembre, un giorno già passato. Puoi salvare comunque.`
- salvataggio oggi: `Appuntamento salvato per mercoledì 23 settembre alle 08:00. Il prossimo orario libero è già pronto.`
- salvataggio settimana prossima: `Appuntamento salvato per mercoledì 30 settembre alle 10:00. Il prossimo orario libero è già pronto.`
- salvataggio mese prossimo: `Appuntamento salvato per venerdì 23 ottobre alle 11:00. Il prossimo orario libero è già pronto.`
- conferma richiesta: `Richiesta confermata: appuntamento salvato per mercoledì 30 settembre alle 12:00. Ora puoi avvisare il cliente.`
- spostamento: `Appuntamento spostato a venerdì 23 ottobre alle 14:00.`
- intestazione coda: `Appuntamenti rimasti programmati`
- titolo misurato: `2 appuntamenti passati da verificare`
- riga con visita: `Lavorazione registrata quel giorno`
- riga senza visita: `Nessuna lavorazione registrata quel giorno`
- pet lasciato a metà: `Pet creato. L’appuntamento non è stato salvato.`

## Controprove

### Date e salvataggi

- oggi, qualche ora prima: nessun avviso; pulsante di salvataggio abilitato;
- giorno precedente: avviso presente col testo riportato sopra; pulsante abilitato;
- data futura: nessun avviso;
- i tre salvataggi manuali, l'approvazione richiesta strutturata/legacy e lo spostamento nominano data e ora complete;
- ricerca eseguita: `rg -n "addAppointment|resolveAppointmentRequest|updateAppointmentSchedule" src/apps/staff/pages/Calendar.jsx`; esito annotato integralmente in `save-points.txt`;
- il rifiuto di una richiesta compare nella ricerca ma non crea né sposta un appuntamento, quindi non richiede una conferma datata.

### Coda e letture

- demo dopo teardown: **7** appuntamenti passati ancora `scheduled` via API;
- stessa interrogazione SQL sul demo: **7**; corrispondenza esatta;
- durante la fixture: **9**, cioè i 7 preesistenti più i 2 marcati;
- fixture a schermo nel banco browser: una riga `Lavorazione registrata quel giorno`, una `Nessuna lavorazione registrata quel giorno`;
- letture banco con coda vuota e piena, identiche: `tenant_memberships 9`, `profiles 4`, `tenants 1`, `appointments 10`, `appointment_requests 5`, `visits 3`;
- l'indice visite viene richiesto una sola volta e non cresce col numero di fantasmi;
- pallino richieste prima/dopo: **0 / 0**; nessun fantasma entra nei conteggi richieste;
- nessuna azione automatica sugli appuntamenti della coda.

### Pet lasciato a metà

- dopo creazione e chiusura senza appuntamento: frase presente, chiamate `DELETE`: **0**;
- chiusura senza creare un pet: frase assente;
- sul demo il pet `[DEMO GH-98] Solo pet` è stato riletto dal database con **0 appuntamenti** prima del teardown;
- teardown: marker residui pet/appuntamenti/visite **0 / 0 / 0**;
- baseline e conteggi finali demo: pet **7 / 7**, appuntamenti **8 / 8**, visite **90 / 90**.

### Invarianti e layout

- `getAppointmentRequestStaffAction`: SHA-256 base/corrente `63bf16bf5ec0c935cd127b4fe97277e70f2be7afc109a35b25852af9a62859b9`;
- `summarizePendingAppointmentRequests`: SHA-256 base/corrente `aa506ba0bdffde8e49d5bbf43a6ad10bfcdf5b6b6e23ec28ece715b488f3dc52`;
- `src/apps/customer`: diff vuoto;
- altre superfici staff, esclusi i due file GH-98: **36/36** identiche alla base;
- `src/shared/tenant/workstationCapacity.js`: diff vuoto;
- 375 x 812 e 1365 x 900: overflow **0**, troncamenti **0**; i due nuovi bersagli misurano **64,25 px** in altezza;
- ispezione visiva delle tre schermate: nessuna sovrapposizione o perdita di testo;
- `git diff --check`: verde;
- `npm run build`: **167 moduli**, Vite **1,24 s**, verde; soli avvisi preesistenti su `caniuse-lite` e chunk oltre 500 kB.

Banco browser finale: **3,985 s**, 0 errori pagina e 0 richieste impreviste. Prova demo: **13,479 s**, teardown incluso. Suite RLS non rieseguita come prescritto; ultima misura dichiarata: GH-96, **60 PASS del 19/9**.

## Passo Luigi

Resta la prova manuale prevista dal mandato. L'app non vieta a Davide di registrare ieri, ma rende visibile l'errore prima del salvataggio e ripete giorno e ora nella conferma. La domanda da porre resta: **«cosa non ti torna?»**.
