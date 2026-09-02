# Consegna GH-69 - Portami alla sua settimana

## Esito, base e perimetro

- **PASS tecnico locale**: ricerca fuori settimana, salto con testo conservato e scheda marcata; una sola lettura aggiuntiva all'apertura. Resta il passo visivo di Luigi dopo il rilascio.
- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`, branch **main**, base **`11bd03fae9e3ab03db567acf793dd1b99493da5b`**. Git pulito all'avvio; alla ripresa soltanto i quattro sorgenti gia modificati da Codex.
- Mandato `docs/incarichi/GH-69-portami-alla-sua-settimana.md`. **Nessun accesso a produzione o demo**, nessuna migration, policy, scrittura dati o modifica credenziali. Fixture esclusivamente locali. Nessun push, merge o deploy.

## Implementazione e confini

`getCalendarWeekData` accetta `includeSearchIndex`, falso per default. Solo il primo caricamento del planner lo attiva: stessa guardia staff e stesso tenant delle letture esistenti, una select aggiuntiva di `appointments` con **`status = scheduled`**, senza filtro temporale o di approvazione. Richiede anche il conteggio esatto nella stessa richiesta REST: se il limite API tronca i risultati, la UI dichiara che la ricerca e incompleta invece di negare corrispondenze.

**Le richieste strutturate non stanno in appointments.** Riutilizzate da `data.openBookings`, che gia le legge tutte da `appointment_requests` con stato pending. Le richieste legacy vengono invece dalla nuova select scheduled. Nessuna seconda query aggiunta per le richieste.

La promessa dell'indice iniziale e conservata in un ref: un cambio settimana anticipato non la duplica e non ne perde il risultato. Ricerca in memoria con **normalizzazione e funzione di confronto GH-65 invariate**, stessi campi nome/proprietario/razza/servizio/sottotitolo e telefono numerico. Le letture ordinarie delle settimane aggiornano in memoria la corrispondente porzione dell'indice; fuori dalle settimane rilette resta una fotografia dell'apertura. Non introdotto polling o aggiornamento realtime.

**Conseguenza necessaria del criterio "qualunque approvazione"**: la lettura della settimana ora include anche scheduled/rejected e scheduled/pending di origine operatore, altrimenti il salto porterebbe a una settimana senza la scheda trovata. La richiesta pending di origine customer resta nella sua lista, esclusa dagli appuntamenti per non duplicarla. Nessuna modifica degli stati nel DB. Le tre controprove fuori settimana per completed/cancelled/no_show sono escluse dall'indice; la griglia conserva i propri stati e conteggi settimanali, non diventa una vista filtrata sull'aperto.

Elenco nel flusso normale sotto la barra di ricerca, massimo **10 voci**, altezza scorrevole **264 px**. Ordinamento cronologico crescente per data e poi ora, con chiave stabile a parita: comprende anche il passato ancora aperto, prima delle date future. Le richieste senza orario mostrano la fascia, non un'ora inventata. Salto sempre alla settimana della voce, anche partendo dalla vista giorno; il testo cercato non viene cancellato.

## Chiamate misurate

Modulo dati e client Supabase reali compilati nel banco; REST intercettato e risposto con dati sintetici. `getCurrentUser` sostituito con identita fixture, membership risolta dal modulo reale. **Sono conteggi REST locali, non misure di esecuzioni SQL sul server o una prova RLS viva.** Ogni scrittura del banco era vietata.

| Azione | Prima | Dopo |
| --- | ---: | ---: |
| Apertura: letture dati + membership | **8** (7 + 1) | **9** (8 + 1) |
| Apertura e tre avanzamenti di settimana, cumulativo | **32** | **33** |
| Digitazione, cancellazione e cambio testo | **0 nuove** | **0 nuove** |
| Salto a una settimana diversa | 8 ordinarie | **8 ordinarie**, nessuna rilettura dell'indice |

La verifica Auth `getCurrentUser` esisteva e resta una per caricamento: nel banco e sostituita, non inclusa nei conteggi sopra. L'indice viene interrogato **una sola volta** anche navigando prima che la prima risposta arrivi (ritardo sintetico di 150 ms). Apertura misurata sulla build production; il doppio ciclo effetti di sviluppo React StrictMode non e stato misurato.

## Controprove e parole esatte

Fixture: **23 appointments** (20 scheduled, 1 completed, 1 cancelled, 1 no_show) e **1 richiesta strutturata pending**; data del browser fissata al 2 settembre 2026, Chromium **151.0.7922.34**, Playwright gia installato. Stesso dataset su baseline dal commit base e sorgente finale.

| Caso | Risultato |
| --- | --- |
| SoloOttobre, unico appuntamento 6 ottobre | 0 schede marcate qui, 1 voce altrove; clic: 1 scheda marcata nella settimana 5-11 ottobre, testo conservato |
| Leo, 2 settembre e 23 settembre | **1 scheda marcata + 1 voce altrove** contemporaneamente |
| `7890`, `333456`, `456-7890`, proprietario | ciascuno trova SoloOttobre; salto provato anche con `456-7890`, campo e marcatura conservati |
| RichiestaLegacy, 15 settembre | elenco con **09:00, Da confermare**; salto e marcatura PASS |
| RichiestaNuova, 2 ottobre | elenco con **Mattina, Da confermare**; salto e marcatura PASS |
| PassatoAperto, 24 agosto | compare e si raggiunge con scheda marcata |
| Scheduled/rejected e pending operatore | entrambi trovati e marcati dopo il salto, senza modificare i loro dati |
| SoloCompletato / SoloAnnullato / SoloAssenza | **0 voci e 0 marcature**, tre ricerche distinte dalla settimana iniziale |
| 12 corrispondenze Serie | **10 voci**, dal 7 al 16 settembre in ordine; `Altre 2 corrispondenze non mostrate.` |

Le tre frasi effettive, riportate dal DOM:

1. **Qui e altrove**: `1 corrispondenza in questa settimana. 1 corrispondenza nelle altre settimane.`
2. **Solo altrove**: `Nessun appuntamento in questa settimana. 1 corrispondenza nelle altre settimane.`
3. **Nessuna**: `Nessun appuntamento aperto trovato.`

Durante caricamento: `Ricerca degli appuntamenti aperti in corso.` Con errore sintetico 503: `Non riesco a cercare fuori settimana. Ricarica la pagina per riprovare.` Con risposta troncata: `Ricerca fuori settimana incompleta: non posso escludere altre corrispondenze.` In entrambi gli errori **non compare il falso esito "nessun appuntamento"**.

Conteggi della settimana iniziale **2 prenotati, 0 sul momento**, invariati scrivendo; dopo il salto a ottobre **5 prenotati, 0 sul momento**, identici con ricerca valorizzata e vuota. Sono i conteggi della settimana raggiunta, non il numero delle corrispondenze. Stili calcolati della scheda non corrispondente identici prima/dopo ricerca; **7 giorni, 7 piedi**, nessun filtraggio o smorzamento. Marcatura calcolata con alpha **0,45**, razza conservata. Segnaposto, frecce e ritorno a oggi non modificati; avanzamenti e ritorni esercitati nelle prove.

## Ingombro e accessibilita

Misure con 12 risultati, 10 inseriti nell'elenco; screenshot controllati visivamente. Le voci oltre l'altezza massima sono raggiungibili con lo scorrimento dell'elenco.

| Viewport | Blocco risultati: y / altezza | Griglia: y | Singolo bersaglio | Righe di testo per voce | Sovrapposizione / overflow |
| --- | --- | --- | --- | --- | --- |
| 1365 x 900 | 208,30 / 306,50 px | 528,80 px | **1140 x 44 px** | 1, data e identita affiancate | **0 / 0 px** |
| 1024 x 900 | 208,30 / 306,50 px | 528,80 px | **984 x 44 px** | 1, data e identita affiancate | **0 / 0 px** |
| 375 x 900 | 353 / 323,75 px | 690,75 px | **349 x 61 px** | 2, data sopra identita | **0 / 0 px** |

Nessun nuovo bersaglio sotto **44 px**. Sul telefono l'elenco **non copre la griglia (0 px)**: occupa spazio prima di essa e la spinge in basso. Sei righe da 44 px circa nella finestra desktop, quattro righe complete da 61 px sul telefono, le successive scorrono. `flex-shrink: 0` dei giorni e `min-height: 0px` del contenitore mobile conservati. Elenco semantico con pulsanti, focus visibile, esito in `role=status`; nessuna prova vocale VoiceOver o Safari viva dichiarata.

**0 errori applicativi, 0 richieste esterne bloccate** nel giro finale. RLS non rieseguita: ultima misura viva [GH-63](GH-63-il-demo-torna-a-pari-esito.md), **60 PASS, 0 FAIL, 0 SKIP**. Nessuna policy o modalita di autorizzazione modificata; la query nuova mantiene guardia staff, filtro tenant e client soggetto alle policy esistenti.

## Tempi, impedimenti e pulizia

- Intervallo misurato **02/09/2026 19:25:23 - 19:58:14 CEST: 32 min 51 s**, dall'avvio alla pulizia. Pausa con processi arrestati **19:37:04 - 19:52:16: 15 min 12 s**, esclusa dal tempo operativo: **17 min 39 s**, incluse le attese prima della sospensione. Redazione finale e commit successivi esclusi.
- Prima dello scaricamento forzato da Luigi: avvii del banco interrotti dopo **98,22 s** e **313,48 s**; anche `git diff` rimasto in lettura. Luigi ha segnalato file rimossi localmente da iCloud nonostante "conserva come scaricato". Nessuna impostazione iCloud cambiata o cartella spostata da Codex.
- Dopo lo scaricamento: `git status` **0,11 s**, banco baseline **0,62 s**, banco finale **0,37 s**. Miglioramento osservato immediatamente; non e una garanzia che l'evizione iCloud non si ripeta.
- Verifica completa finale **6,71 s** reali, user 3,40 s, sys 1,10 s. **Build PASS: 1,79 s** reali, Vite 1,35 s, 159 moduli; user 2,66 s, sys 0,31 s. `git diff --check` PASS. Warning preesistenti: Browserslist datato, bundle oltre 500 kB.
- Correzioni del solo banco: import Supabase inizialmente puntato a un percorso distribuito non presente, sostituito con import dal package; due assert iniziali contavano letture ancora in partenza dal cambio settimana come se dipendessero dal testo. Attesa finale vincolata all'avvio di tutte le letture previste e al loro completamento. **Nessuna modifica dell'app per mascherare questi fallimenti.**
- Browser isolati chiusi, server **4189 arrestato**, `/tmp/gh69` rimossa: **0 fixture DB, 0 file fixture temporanei residui, 0 processi del banco lasciati attivi**. Restano soltanto evidenze sintetiche. Nessuna attivita fuori istruzione, nessuna modifica parallela inattesa.

## File esaustivi e commit

| File | Atto |
| --- | --- |
| `src/apps/staff/pages/Calendar.jsx` | indice iniziale condiviso, confronto in memoria, salto; +64/-1 |
| `src/apps/staff/components/CalendarKit.jsx` | esiti, elenco e limite; +34/-4 |
| `src/apps/staff/pages/Calendar.css` | elenco nel flusso, responsive e focus; +55/-1 |
| `src/apps/staff/lib/database.js` | lettura aggiuntiva opzionale, selezione settimanale coerente e guardia troncatura; +16/-4 |
| `docs/consegne/GH-69-portami-alla-sua-settimana-esito.md` | questo registro |
| `docs/consegne/evidenze/GH-69/results-1365.png` | elenco lungo desktop |
| `docs/consegne/evidenze/GH-69/results-1024.png` | elenco a larghezza intermedia |
| `docs/consegne/evidenze/GH-69/results-375.png` | ingombro sul telefono |
| `docs/consegne/evidenze/GH-69/here-and-elsewhere.png` | marcatura e risultato altrove insieme |
| `docs/consegne/evidenze/GH-69/measures.json` | chiamate prima/dopo, assert, geometria e frasi |

Commit locale unico `feat(staff): find open appointments across calendar weeks`; hash nella risposta finale, ricavabile con `git log -1 --format=%H -- docs/consegne/GH-69-portami-alla-sua-settimana-esito.md`. Nessun push. Sintassi dei filtri verificata sulla [documentazione ufficiale Supabase](https://supabase.com/docs/reference/javascript/using-filters-or); nessun nuovo contratto SQL.

## Passo Luigi e nota a Cowork

Dopo rilascio e ricarica dall'origine: cercare un pet a ottobre, uno con prenotazioni qui e piu avanti, infine uno senza appuntamenti aperti. **Cosa non ti torna?** L'accettazione visiva resta aperta. Limite dichiarato: l'indice e una fotografia locale aggiornata per le settimane rilette; modifiche fatte altrove da un altro dispositivo richiedono una nuova apertura della pagina. Non aggiungere polling per risolverlo dentro questo mandato: violerebbe la lettura unica.
