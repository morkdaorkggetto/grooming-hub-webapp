# GH-87 - La conferma e' un momento: esito dopo Emendamento 1

## Esito e perimetro

**Tre parti implementate.** Prove funzionali browser e demo riuscite; suite
RLS **60 PASS, 0 FAIL, 0 SKIP**. La controprova globale dei bersagli >=44 px
a 375 px ha **un'eccezione preesistente**, misurata sotto: non dichiarata PASS
senza riserve. Restano lo sguardo di Luigi e la valutazione dell'eccezione.

Root `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree `webapp/`.
Mandato GH-87 ed Emendamento 1 letti integralmente; conferma di Luigi
sull'applicazione al demo ricevuta prima della ripresa.
Base `main`: **b4f77c40ca7c0c52b46a2b54a98c2c1c84544ead**, post interruzione.
La prima interruzione resta nella storia Git (commit b4f77c4): questo registro
la aggiorna, non la presenta retroattivamente come implementazione.

Solo demo **grooming-hub-demo, qttpinkslhenxrsbhhhg**. Prod mai letto o scritto.
**Nessuna migrazione applicata da Codex**. La fonte SQL di Cowork entra nel
commit per l'autorizzazione esplicita dell'Emendamento 1: `salva.sh` non
pubblicherebbe `supabase/`. Nessuna nuova colonna o policy progettata.
Nessun account creato, password cambiata, push, merge o deploy.

Commit di codice e registro: `feat: make appointment confirmations and alternative choices visible (GH-87)`.
Hash identificabile con
`git log -1 --format=%H -- docs/consegne/GH-87-la-conferma-e-un-momento-esito.md`.

## Tabella esaustiva dei file del commit

| File | Modifica |
|---|---|
| `src/apps/staff/lib/whatsapp.js` | Grammatica unica delle date, saluto senza dati non nominativi, istruzioni di scelta nell'app, fallback pet |
| `src/apps/customer/hooks/useAppointmentRequests.js` | Lettura delle quattro colonne; risultato booleano del refetch per distinguere un errore di rilettura |
| `src/apps/customer/hooks/useNextAppointment.js` | Lettura source/created_at e appuntamenti futuri per non nascondere conferme successive; data resta il primo appuntamento |
| `src/apps/customer/lib/appointmentResponses.js` | Regole pure di risposta corrente, 72 ore e messaggi d'errore |
| `src/apps/customer/components/PendingRequest.jsx` | Scheda esistente estratta, scelta via RPC, riepilogo, cambio esplicito, blocco doppio tocco e recupero |
| `src/apps/customer/pages/Home.jsx` | Conferma visibile, tutte le richieste pending azionabili anche con appuntamento presente, errore di rilettura |
| `src/apps/staff/pages/CustomerRequests.jsx` | Lettura supplementare delle risposte, etichette e dettaglio, data/fascia scelta nel modale, parole aggiornate |
| `supabase/migrations/20260912165822_gh87_customer_alternative_choice.sql` | Fonte di Cowork fornita da Luigi, inclusa senza modificarla o applicarla |
| `docs/consegne/GH-87-la-conferma-e-un-momento-esito.md` | Questo registro aggiornato |
| `docs/consegne/evidenze/GH-87/browser-check.mjs` | Banco riproducibile, fixture HTTP in memoria e nessuna richiesta esterna inoltrata |
| `docs/consegne/evidenze/GH-87/browser.json` | Input/output WhatsApp completi, gruppi di prove, dimensioni di tutti i controlli misurati |
| `docs/consegne/evidenze/GH-87/baseline.json` | Misura del link staff sulla pagina precedente |
| `docs/consegne/evidenze/GH-87/invariants.json` | 26 impronte SHA-256 prima/dopo |
| `docs/consegne/evidenze/GH-87/live.json` | SQL effettivo, quattro colonne rilette, rifiuti, impronte dati e pulizia |
| `docs/consegne/evidenze/GH-87/choices-375.png` | Alternative, viewport mobile |
| `docs/consegne/evidenze/GH-87/accepted-375.png` | Riepilogo accettazione |
| `docs/consegne/evidenze/GH-87/declined-375.png` | Riepilogo rifiuto |
| `docs/consegne/evidenze/GH-87/rejected-pair-375.png` | Errore gentile dopo rifiuto RPC |
| `docs/consegne/evidenze/GH-87/staff-accepted-375.png` | Risposta nella pagina staff |
| `docs/consegne/evidenze/GH-87/approval-375.png` | Modale con la data scelta |
| `docs/consegne/evidenze/GH-87/confirmed-multiple-375.png` | Home con conferma e richieste contemporanee |
| `docs/consegne/evidenze/GH-87/confirmed-later-375.png` | Conferma successiva visibile anche dopo un appuntamento creato dal salone |
| `docs/consegne/evidenze/GH-87/choices-1365.png` | Vista desktop |

Fuori da stage e commit tutti i documenti in `docs/incarichi/`: CD-08,
GH-84, GH-85, GH-86, GH-87, GH-87-emendamento-1, GH-88. Sono di Luigi/Cowork.
Nessun diario toccato; GH-84 non riaperto.

## WhatsApp: grammatica e regola dei nomi

Date in italiano e fuso `Europe/Rome`: **sabato 10 ottobre alle 15:00**;
intervallo **sabato 10 ottobre dalle 15:00 alle 16:00**; fascia senza ora
**lunedì 12 ottobre di mattina** / **martedì 13 ottobre nel pomeriggio**.
Anno presente solo se diverso dall'anno corrente a Roma. Attraversando la
mezzanotte si nominano entrambi i giorni. Le date senza ora sono ancorate
a mezzogiorno UTC per non dipendere dal fuso del browser. Il ramo legacy
con data+ora senza offset conserva l'interpretazione locale della coppia.
Non cambia normalizzazione telefono, URL, destinatario o punto di chiamata.
Nessun invio automatico e nessun WhatsApp aperto durante le prove.

Nome: spazi normalizzati, almeno due lettere Unicode; ammessi lettere,
segni diacritici, spazi, apostrofi, trattini e punti; rifiutati cifre, @,
parentesi, altri simboli e i segnaposto cliente/proprietario/sconosciuto/
non indicato/n.d. Fallback **Ciao,**: mai il numero o la parola cliente.
E' un filtro lessicale conservativo, non un riconoscitore anagrafico:
un'attivita' dal nome alfabetico puo' passare; un nome autentico con cifre
o una sola lettera viene omesso. Nessuna bonifica dei dati.

Casi limite misurati: `+39 333 950 9149` -> vuoto;
`  Anna-Maria D’Angelo  ` -> `Anna-Maria D’Angelo`;
`J.` -> vuoto. Inoltre `李明` conservato, email/`Anna 2`/`cliente` omessi.

### Testi esatti

Input completi in `browser.json.whatsapp`, accanto a ogni testo. Base A:
pet **Lacky**, razza **Barboncino**, owner **3339509149**, destinatario sintetico
**+393330000087**, scheduled_at **2026-10-10T15:00:00+02:00**, durata **60**,
desired_date **2026-10-10**. Named: owner **Mario Rossi**. Undated: solo client.
Alternative: **2026-10-12/morning**, **2026-10-13/afternoon**.
Directory: owner_name numerico, pet_name Lacky. Request: data 10/10,
`di mattina`, servizio Bagno, pet omesso. Next year: 10/01/2027 ore 15 +01.
Midnight: 10/10/2026 ore 23:30 +02, durata 60. Boutique: pet omesso;
order: 1 Shampoo. Timed request: 10/10/2026, 15:00, durata 60, note Pelo lungo.

| Caso / input sopra | Messaggio completo |
|---|---|
| contact numeric | Ciao, ti scriviamo per Lacky. |
| calendar numeric | Ciao, ti aspettiamo sabato 10 ottobre alle 15:00 con Lacky. |
| calendar named | Ciao Mario Rossi, ti aspettiamo sabato 10 ottobre alle 15:00 con Lacky. |
| approved | Ciao, abbiamo confermato l'appuntamento per Lacky: sabato 10 ottobre dalle 15:00 alle 16:00. A presto! |
| approved undated | Ciao, abbiamo confermato l'appuntamento per Lacky. A presto! |
| rejected | Ciao, purtroppo sabato 10 ottobre dalle 15:00 alle 16:00 siamo pieni. Per Lacky scegli un'altra fascia nella tua area e riproviamo. |
| rejected undated | Ciao, per Lacky in quella fascia siamo pieni. Scegli un'altra fascia nella tua area e riproviamo. |
| alternatives | Ciao, purtroppo sabato 10 ottobre siamo pieni. Per Lacky avremmo lunedì 12 ottobre di mattina oppure martedì 13 ottobre nel pomeriggio. Scegli nella tua area la fascia che preferisci: poi ti confermiamo l'ora. |
| request | Ciao, abbiamo appena inviato una richiesta per il mio pet. Ci andrebbe bene sabato 10 ottobre. Preferenza oraria: di mattina. Indicazione: Bagno. |
| directory | Ciao, ti scriviamo per Lacky. |
| next year | Ciao, ti aspettiamo domenica 10 gennaio 2027 alle 15:00 con Lacky. |
| midnight | Ciao, abbiamo confermato l'appuntamento per Lacky: da sabato 10 ottobre alle 23:30 a domenica 11 ottobre alle 00:30. A presto! |
| boutique | Ciao, per il nostro pet vorremmo informazioni sulla boutique. |
| boutique order | Ciao, per il nostro pet vorremmo mettere da parte questi prodotti: 1x Shampoo. |
| timed request | Ciao, abbiamo appena inviato una richiesta per il mio pet. Preferenza oraria: sabato 10 ottobre dalle 15:00 alle 16:00. Note: Pelo lungo. |

Il numero owner non compare in nessuno dei testi; il numero di destinazione
resta nell'URL, come deve. Invito e richiesta pubblica generica non modificati.
Ricerca eseguita:
```sh
rg -n 'toLocale|Intl.DateTimeFormat|formatDay|formatDateTime|formatDesiredDate|formatAppointmentRange' src/apps/staff/lib/whatsapp.js
```
Tutte le date passano da `formatDay`; ore da `formatTime`. Il solo
`toLocaleLowerCase` rimasto normalizza nomi pet, non date. Nessun formatter
data numerico alternativo, nessun `toLocaleString` o `toLocaleDateString`.

## La conferma e la scelta nell'app

**Confermato dal salone** compare nella scheda del prossimo appuntamento
solo con source customer, approval_status approved, status scheduled e
created_at non futuro entro **72 ore**. Tre giorni permettono di vederlo
anche non aprendo la Home ogni giorno; non diventa un'etichetta permanente.

Se esiste un appuntamento precedente, anche le conferme successive recenti
restano visibili in Home: **Confermato dal salone: Lacky, mercoledì 21 ottobre
alle 15:00.** Provato con un appuntamento operator del 20 ottobre prima di
quello customer del 21. La scheda del prossimo appuntamento resta invariata;
l'hook conserva `data` come primo risultato e aggiunge la raccolta futura.

Motivo del timestamp: nella richiesta strutturata l'appuntamento nasce
quando il salone approva. Non si usa updated_at, che cambierebbe anche per
modifiche estranee alla conferma. Limite dichiarato: le vecchie richieste
legacy, create prima dell'approvazione, non hanno un timestamp autonomo di
conferma; non vengono artificiosamente rese recenti. Non creata una colonna.
Prove: 71 ore visibile; 72 ore non visibile; created_at futuro non visibile;
source operator non visibile; vecchio created_at con updated_at recente
non visibile. Per i due ruoli nessun cambio di permessi.

Le alternative sono comandi separati della richiesta, piu' **Nessuna di
queste mi va bene**. Dopo l'invio:
- **Hai scelto lunedì 12 ottobre, Mattina (9–13). Ora tocca al salone confermare l'ora.**
- **Hai risposto che nessuna di queste fasce ti va bene. Ora tocca al salone proporti un’alternativa.**

Un ref blocca immediatamente il secondo tocco, anche prima del render
disabled: **due tocchi consecutivi, una RPC**. Dopo il salvataggio le scelte
sono sostituite dal riepilogo. **Cambia risposta** apre esplicitamente un
nuovo giro con **Scegli una nuova risposta: sostituirà quella precedente.**
La funzione consente questo cambio: misurato accepted -> declined.
Non promessa immutabilita' server-side: tra due dispositivi con pagine gia'
aperte la funzione puo' ancora accettare entrambe le chiamate (ultima
scrittura valida). Nessun guard aggiunto fingendo di sostituire quello SQL.

Una proposta staff piu' recente della risposta precedente riapre la scelta;
una scelta che non appartiene piu' alle proposte non viene mostrata come
attuale. Necessario perche' la funzione di proposta preesistente non azzera
i quattro campi. Sono controlli di presentazione: l'autorizzazione resta RPC.

La Home rende **tutte** le pending, non solo la prima, anche se mostra gia'
un prossimo appuntamento: provate due richieste e due gruppi di scelte.
Errore RPC 22023 mostrato come **Questa alternativa non è più disponibile.
Aggiorna le proposte e riprova.** Nessun errore tecnico stampato.
In caso di salvataggio riuscito e rilettura fallita: messaggio esplicito,
aggiornamento manuale che recupera la risposta **senza una seconda RPC**.

Staff: **Fascia scelta** / **Nessuna fascia va bene**, dettaglio e data della
risposta. Modale: richiesta originaria 10/10 mattina; scelta **13/10/2026
pomeriggio**; apertura con **date=2026-10-13, time=13:00** (default esistente
del pomeriggio), durata 60. Ora e durata restano editabili dal salone.
Le quattro colonne sono caricate in una query batch nella sola pagina
autorizzata, senza modificare `database.js`. Non cambiano lista o polling
condivisi del pallino.

## Prove vive sul demo

Preflight ripetuto: **4 colonne presenti** con tipi date/text/text/timestamptz
e **1 funzione** `respond_appointment_request_alternatives(uuid,text,date,text)`.
ACL misurata: anon EXECUTE false, authenticated EXECUTE true.
Fonte migration SHA-256:
`f1503b7da7588467769b36c8515bedae5c13677e755771951a1e3f130c1ec2e1`.

Prova aggiuntiva autorizzata dall'emendamento: account demo esistenti Mario,
Luca e sonda staff, ruolo SQL **authenticated** e claims impostate nel banco
amministrativo. Chiamate vere alle funzioni e SELECT vere alla tabella, non
mock; non e' presentata come login browser reale. La suite distinta effettua
invece i login via API. SQL integrale e risultati in `live.json`.

Richiesta creata via submit RPC, marker `[DEMO GH-87]`, alternative proposte
via RPC staff. Scelte future compatibili con le chiusure del demo:
**14/09/2026 afternoon**, **15/09/2026 afternoon**.

| SELECT sulla richiesta | Prima | Dopo accepted | Dopo declined |
|---|---|---|---|
| status | pending | pending | pending |
| chosen_date | null | 2026-09-14 | null |
| chosen_time_preference | null | afternoon | null |
| customer_response | null | accepted | declined |
| customer_responded_at | null | 2026-09-12T17:47:35.580847+00:00 | 2026-09-12T17:47:35.580847+00:00 |
| appointment_id | null | null | null |

I due timestamp coincidono perche' `now()` e' stabile nella transazione
della prova, non perche' si sia simulata la lettura.
Coppia non proposta: **22023 / Chosen slot was not proposed**.
Luca sulla richiesta Mario: **42501 / Appointment request not available to current customer**.
Richiesta gia' risolta: **23514 / Appointment request already resolved**.
UPDATE diretto come customer: **0 righe**.

Pallino GH-81: lista staff pending **1 prima / 1 dopo la proposta**, sia
nella misura SQL sia nel componente vero a schermo; badge **1 richiesta
in attesa** anche dopo risposta. Non corretto il conteggio: resta lavoro
aperto per il salone. Appuntamenti visibili a Mario **1 -> 1**; nessuna
creazione per accettazione/rifiuto.

La prova e' racchiusa in un sottoblocco transazionale annullato alla fine:
richieste globali **0 -> 0**, appuntamenti **8 -> 8**, fixture GH-87 **0**.
Nessun DDL, nessun oggetto schema temporaneo, nessun dato della prova mantenuto.

Suite esistente:
```sh
env GH_RLS_EXPECTED_PROJECT_REF=qttpinkslhenxrsbhhhg GH_RLS_EXPECTED_PET_COUNT=7 GH_RLS_SUITE_LABEL='GH-87 - Suite RLS demo' node scripts/rls-tests/run.mjs
```
**60 PASS, 0 FAIL, 0 SKIP**, exit 0, **32.18 s wall**. Script invariato,
SHA-256 `e0d6bfe12333148486fe6494414c78d03224d29fd0950db2913d73c5510ca7bc`.
La suite verifica anche whitelist pet e isolamento, senza account nuovi.
Log completo locale `/private/tmp/gh87-rls.log`; sintesi permanente in live.json.

**Ripristino misurato:** 14/14 conteggi e impronte uguali prima e dopo prova
dedicata + suite. Pet 7, visite 90, customers 7, appuntamenti 8, richieste 0;
tutte le altre impronte e query di calcolo sono in live.json.
Marker operativi suite e GH-87 a zero; Storage a zero. Sonde permanenti
conservate. **Eccezione audit:** customer_account_unlink_audit **8 -> 10**,
due righe prodotte dalla suite e conservate, non cancellate. Gli updated_at
automatici e lo stato di login Auth non sono dichiarati ripristinati
byte-per-byte; le impronte operative escludono i timestamp volatili e
quelle Auth confrontano soltanto gli identificativi.

## Browser, invarianti e limite dei 44 px

Banco reale App/SDK con rete intercettata; nessun WhatsApp inviato, nessuna
credenziale reale nel banco. **11 gruppi funzionali PASS**, **9 viste**
(8 mobile 375x812, 1 desktop 1365x900), **0 overflow orizzontale**, **0 controlli
troncati**, 0 pageerror e 0 richieste esterne inattese.
Tutti i nuovi comandi >=44 px; alternative di due righe 67 px.
Scelte mobili portate a vista sopra la navigazione fissa, non considerate
visibili solo perche' presenti nel DOM. Screenshot ispezionati.

**Eccezione alla controprova globale:** link staff `Grooming Hub`, aria-label
`Torna alla Dashboard`: **102.015625 x 12.34375 px**, identico caricando
CustomerRequests dalla base b4f77c4 e dalla versione corrente. Non corretto:
appartiene a StaffKit/CSS condivisi, fuori superficie; il mandato vieta
modifiche geometriche. A desktop rilevati anche target preesistenti nella
nav customer (nome 32 px, Home/Promozioni 43 px, avatar 40x40): non modificati.
Non si dichiara quindi che ogni bersaglio dell'intera app superi 44 px.

**Proposta concreta a Cowork:** micro-mandato di accessibilita' su
`src/apps/staff/components/StaffKit.jsx` e relativa regola CSS del link
Hero: area interattiva minima 44x44 preservando posizione e carattere del
wordmark. Controprove 375/desktop, link funzionante, nessuna collisione con
pallino/suono/titolo. Trattare nello stesso controllo i target nav customer
se esplicitamente autorizzati. Non ampliare questo giro.

`invariants.json`: **26 coppie SHA-256 identiche**, comprese **19 pagine/file
staff diversi da CustomerRequests.jsx**, client Supabase, database.js,
StaffKit, StaffRequestAlerts, CSS staff e package/lock. Nessuna modifica a
token, CSS, griglia, geometria dei componenti condivisi o dipendenze.
Le schede della richiesta riusano padding e struttura esistenti; si
aggiungono i controlli necessari e gli elementi pending prima nascosti.
Helper puro sotto customer riusato anche dalla pagina staff, senza ciclo
di dipendenze o nuove letture condivise.

Comandi:
```sh
git diff --name-only b4f77c4 -- src/apps/staff/pages src/shared
git diff --check
node docs/consegne/evidenze/GH-87/browser-check.mjs
node docs/consegne/evidenze/GH-87/browser-check.mjs --baseline
npm run build
```
Primo comando: solo CustomerRequests.jsx. Diff check pulito.
Build finale **165 moduli**, **1.09 s Vite / 1.44 s wall**, PASS.
Avvisi preesistenti Browserslist e chunk >500 kB. Nessun deploy.
Anteprima: **http://127.0.0.1:4189/u/login**, configurazione verificata demo;
per lo staff **/login**. Login renderizzato senza effettuare accessi.
Fixture delle prove non lasciate nel demo per riempire la schermata.

## Tempi, eccezioni e passo di Luigi

Intervallo misurato della ripresa tecnica fino alla chiusura delle verifiche:
**12/09/2026 17:39:12-18:01:17 UTC, 22 min 05 s**, inclusi banco e prima
stesura del registro; esclusi lettura iniziale, precedente interruzione,
rifinitura finale del registro e commit. Banco finale **7.251 s**;
suite viva **32.18 s**.
Nessun blocco persistente locale/iCloud osservato; alcune letture SQL remote
hanno richiesto diversi secondi, senza errori di connessione.

Correzioni del banco, non del prodotto: percorso staff inizialmente errato
(/customer-requests invece di /requests); attesa iniziale dell'ora 15:00
invece del default reale 13:00; estensione del controllo bersagli che ha
scoperto i limiti preesistenti della navigazione condivisa. Gli esiti finali
sono quelli allegati, non i tentativi intermedi. La prova dati non ha
richiesto tentativi di DDL o modifiche al testo della migrazione.
Non svolte attivita' fuori istruzione; l'eccezione geometrica e' dichiarata,
non corretta fuori perimetro. Browser/banchi chiusi, anteprima 4189 lasciata
disponibile; nessuna sessione di test necessaria ancora in esecuzione.

**Da Luigi, su telefono e gestionale su altro dispositivo:**
1. Richiesta, due alternative, scelta nell'app: il salone vede la risposta?
2. Rilettura del messaggio: lo manderesti cosi'?
3. Conferma dal salone: la Home rende chiaro l'atto?
4. Il giro resta dentro l'app? **Cosa non ti torna?**

Le prove non equivalgono a invio WhatsApp reale o alla verifica sul telefono
di Luigi, che rimangono il passo finale umano.
