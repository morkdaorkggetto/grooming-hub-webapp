# Consegna GH-61 - Bagno o taglio, anche quando si prenota

## Base e perimetro

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `ff91c9b99662afff3eb0064471aa8f3ef31b3ad7`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), rilevato `ACTIVE_HEALTHY`.
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy, rotta, dipendenza, policy, funzione o migration.
- Le sole scritture remote sono state fixture dati `[DEMO GH-61]`, rimosse
  nella stessa sessione con guardie sugli identificativi e sui marker.

## Esito

Il modulo staff `Nuovo appuntamento` legge i servizi attivi dal catalogo. Il
servizio resta facoltativo; quando viene scelto, la durata di listino viene
proposta nel campo durata, che resta modificabile. L'appuntamento salva
`service_id` insieme alla durata effettivamente confermata.

Le tre strade esistenti aprono lo stesso modulo: pulsante in intestazione,
`Prenota qui` dalla griglia e `Nuovo per lo stesso cliente` dal dettaglio.
Nessuna guardia e stata scavalcata: la durata proposta alimenta subito il
candidato usato dalla capienza GH-37.

La scheda conserva la riga `Appuntamento · durata` e, soltanto quando esiste,
aggiunge il servizio su una riga separata con ellissi CSS, `title` completo e
nome accessibile. Le righe senza servizio sono identiche nel contenuto e non
ricevono badge, avvisi o inviti a completare.

Il modulo lavorazione ha ora una sola casella libera: `Note della
lavorazione`, facoltativa e senza `placeholder`. Il valore continua a essere
salvato in `visits.treatments`. `issues` non viene piu offerto in scrittura,
ma tutti i punti di lettura preesistenti restano intatti.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Catalogo nel modulo, proposta durata, salvataggio `service_id`, tre ingressi e servizio nel dettaglio. |
| `src/apps/staff/pages/Calendar.css` | modificato | Distingue sobriamente la riga servizio usando colori e pesi esistenti. |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | Mantiene la dicitura appuntamento e aggiunge il servizio leggibile/accessibile. |
| `src/apps/staff/components/VisitForm.jsx` | modificato | Unica nota libera, nessun esempio e nessun campo `issues`. |
| `src/apps/staff/pages/AddVisit.jsx` | modificato | Non trasmette piu `issues` dal modulo. |
| `src/apps/staff/lib/database.js` | modificato | Estende il contratto catalogo GH-60 con `duration_minutes`; nessuna nuova query o scrittura. |
| `docs/consegne/GH-61-bagno-o-taglio-anche-quando-si-prenota-esito.md` | aggiunto | Registro unico del giro. |

`CalendarKit.jsx` e `database.js` non erano nell'elenco indicativo iniziale:
il primo possiede realmente la scheda del planner; il secondo possiede la query
catalogo gia introdotta da GH-60 e doveva restituire la durata senza duplicare
la lettura in `Calendar.jsx`.

Nessun altro file appartiene alla consegna.

## Baseline demo

All'ingresso:

- servizi attivi: primo servizio `60` minuti, secondo `90` minuti;
- appuntamenti: `8`;
- appuntamenti senza servizio: `7`;
- durate appuntamenti: `45 x 2`, `60 x 4`, `90 x 1`, `120 x 1`;
- visite: `90`;
- visite con `treatments`: `90`;
- visite con `issues`: `24`;
- digest congiunto `treatments/issues`:
  `4e4488c87eb90c68e3de0610c9199a83`.

Il dato produzione riportato nel mandato non e stato verificato: la produzione
era fuori perimetro e non e stata interrogata.

## Controprove appuntamento

| Prova | Misura demo | Esito |
| --- | --- | --- |
| Primo servizio | proposta `60` minuti, letta dal demo | PASS |
| Secondo servizio | proposta `90` minuti, letta dal demo | PASS |
| Durata manuale | sostituita con `75`; il campo resta `75` dopo il cambio focus | PASS |
| Riga con servizio | fixture riletta con `service_id` del secondo servizio e durata `75` | PASS |
| Riapertura | dettaglio: `Fido / Luigi Rossi · Programmato / Toelettatura Completa` | PASS |
| Riga senza servizio | fixture riletta con `service_id = null`, durata predefinita `60` | PASS |
| Listino dinamico | primo servizio `60 -> 75`; nuova apertura propone `75` senza build; ripristino `60` | PASS |
| Pulsante intestazione | campo servizio visibile, opzioni lette dal catalogo | PASS |
| `Prenota qui` | campo visibile; data `2026-09-01`, ora `09:00` precompilate | PASS |
| Stesso cliente | campo visibile; pet precompilato `Fido · Luigi Rossi` | PASS |

Le fixture appuntamento erano quattro e portavano gli id esatti
`gh61-cap-a`, `gh61-cap-b`, `gh61-service-override`, `gh61-no-service`.
Nessun salvataggio e stato eseguito dal browser.

## Capienza GH-37

Due appuntamenti alle `09:00` e alle `10:00`:

- a `60` minuti: conflitti `[]`;
- a `90` minuti con capienza teorica `1`: conflitti `[a, b]`;
- sul demo, con capienza reale `2`, i due intervalli portano la fascia a
  `2/2`; un terzo candidato alle `10:00` da `90` minuti viene rifiutato;
- il modulo mostra `Le postazioni sono tutte occupate nella fascia scelta.` e
  disabilita `Salva appuntamento`.

La guardia usa quindi la durata proposta dal servizio e reagisce subito al
cambio, senza nuove scorciatoie.

## Schede planner

Nella stessa settimana erano presenti tre fixture con servizio e una senza.

| Vista | Misura | Cosa si legge |
| --- | --- | --- |
| settimana 1365 px | riga servizio `83/119 px` | `Toelettatura…`; titolo completo `Toelettatura Completa` |
| settimana 1024 px | riga servizio `60/119 px` | `Toelettat…`; titolo completo `Toelettatura Completa` |
| giorno 1024 px | riga servizio `389/389 px` | `Toelettatura Completa` intero |
| riga senza servizio | nessuna terza riga | `Appuntamento · 60′`, nessun avviso |

Il servizio e su una riga propria e con maggior contrasto rispetto alla riga
generica. Nelle colonne strette `Appuntamento` e gia troncato come prima, ma il
servizio resta presente e riconoscibile; non e stato abbreviato nel codice.

## Modulo lavorazione e storico

- textarea libere nel modulo: `1`;
- etichetta: `Note della lavorazione`;
- attributo `placeholder`: `null`, quindi assente;
- etichetta `Problematiche riscontrate`: `0` nel modulo;
- fixture `gh61-note`: `treatments = [DEMO GH-61] Nota identica`, riletta
  identica, `issues = null`;
- fixture `gh61-empty`: `treatments = null`, salvataggio riuscito,
  `issues = null`;
- la stringa `Es. Bagno, taglio` non compare piu in `src/`;
- nessun riferimento a `formData.issues`, `value.issues` o
  `updateField('issues')` nei due consumer del modulo.

I punti di lettura storica di `issues` sono rimasti:

1. `StaffKit.jsx`, riga visita nella scheda pet;
2. `VisitCard.jsx`, sezione problematiche della card storica;
3. `Pet.jsx`, nota della visita lato cliente;
4. `WeeklyRevenue.jsx`, indicatore e conteggio delle annotazioni.

## Impronta e pulizia

Dopo teardown:

- appuntamenti: `8`, di cui `7` senza servizio;
- distribuzione durate: `45 x 2`, `60 x 4`, `90 x 1`, `120 x 1`;
- visite: `90`, di cui `90` con trattamenti e `24` con problematiche;
- digest `treatments/issues`:
  `4e4488c87eb90c68e3de0610c9199a83`, identico alla baseline;
- fixture GH-61: `0` appuntamenti, `0` visite;
- durata temporaneamente modificata: ripristinata a `60`;
- sonda staff: `0` Auth, profiles e memberships;
- server locale chiuso; browser isolato chiuso.

Nessun testo e stato riscritto o fuso.

## Verifiche tecniche

- Supabase changelog corrente: nessuna breaking change pertinente alla
  selezione/ordinamento usati qui.
- Documentazione Supabase corrente verificata per `.select()` e `.order()`.
- `npm run build`: PASS; Vite `5.4.21`, `159` moduli, `1,10 s`;
  JS `713,68 kB` (gzip `201,82 kB`). Warning non bloccanti: Browserslist
  datato e chunk oltre 500 kB.
- `git diff --check`: PASS.
- `npm run lint`: non eseguibile perche `eslint` non e installato
  (`eslint: command not found`); nessuna dipendenza aggiunta.
- Suite RLS non rieseguita come prescritto. Ultima misura viva: GH-60,
  `60 PASS, 0 FAIL, 0 SKIP`.

## Eccezioni e fuori istruzione

### Demo non avanzato a GH-60

Sul demo `visits.service_id` e assente e la migration GH-60 ha `0` righe nella
history. GH-61 vieta migrazioni e SQL di schema, quindi la migration precedente
non e stata applicata neppure temporaneamente.

Conseguenza misurata: il modulo lavorazione e stato verificato nel DOM, le due
scritture `treatments` sono state verificate come fixture dati e tutti i punti
di lettura `issues` sono stati verificati nel codice; non e stato possibile
caricare dal browser la scheda pet completa per la controprova visiva della
problematica storica, perche la query GH-60 chiede una colonna che sul demo non
esiste ancora. La prova visiva va ripetuta dopo l'applicazione di GH-60, senza
alcuna modifica GH-61.

### Ricerca globale dei nomi

Nei sei file di codice GH-61 non compare alcun nome del catalogo. Una ricerca
globale in `src/` trova testi preesistenti in `CustomerPortal.jsx` (vecchia
superficie con catalogo dimostrativo incorporato) e frasi dell'album cliente
`dopo il bagno`. Erano gia presenti alla base, non alimentano il nuovo modulo
calendario e sono rimasti fuori perimetro; non vengono nascosti nel registro.

### Rallentamenti ambiente

- Primo `npm run build`: rimasto bloccato in trasformazione; i due processi
  esatti sono stati chiusi. I due tentativi finali hanno poi chiuso in `8,23 s`
  e `1,10 s`.
- Browser integrato: navigazione locale in timeout; sostituito con Playwright
  isolato autorizzato da Luigi. Nessuna credenziale e stata stampata o salvata.
- Prima fixture SQL: errore di tipo `text/uuid`, transazione annullata senza
  scritture; corretta una volta e riuscita.

Nessuna modifica locale parallela o fuori istruzione e stata rilevata.

## Controllo finale di Luigi

Dopo che Cowork avra applicato GH-60 sul demo, ricaricare dall'origine con
`⌥⌘R` e:

1. prenotare un taglio da una fascia gia mezza piena e osservare la settimana;
2. prenotare senza servizio e valutare se l'assenza resta neutra;
3. aprire un appuntamento precedente e verificare che non chieda integrazioni;
4. aprire una visita con una problematica storica e confermare che sia ancora
   leggibile.

La domanda resta `cosa non ti torna?`.

## Commit

Commit locale previsto: `feat: add services to staff bookings`. Hash nella
risposta finale. Nessun push.
