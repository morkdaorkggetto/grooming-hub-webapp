# Incarico GH-117 — Le fasce su due righe

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.3.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 11 novembre 2026
**Nasce da:** l'eccezione testuale di `GH-116` (registro, riga 40) e dalla consegna `CD-13`, verificata dalla regia l'11/11 alle 07:30.
**Fonte di design:** `docs/consegne/CD-13-consegna/CD-13-handoff.md` (MD5 `86ea87b99f7789c7156a62be73bef4cb`), §3, §4, §5 e §10, e le tavole in `project/`. Dove questo incarico e l'handoff dicono cose diverse, vale l'incarico: l'handoff propone, qui c'è ciò che Luigi ha deciso.

**Base:** ramo `main`, commit `131d735`. Dopo quel commit possono esserci solo commit di `docs/`. Impronte MD5 dei file del perimetro, misurate dalla regia l'11/11 alle 07:34 su `webapp/`:

| File | MD5 |
|---|---|
| `src/shared/tenant/bookingSchedule.js` | `5589e9884e196810b067f42a07c1d03f` |
| `src/apps/customer/components/BookingTimePreferenceChips.jsx` | `17d6a1e57cc8e9f4d479c35e3afdbaf4` |
| `src/apps/customer/pages/Book.jsx` | `53a1b779e2250b5f8bd38fc736d23a31` |
| `src/apps/customer/pages/Book.css` | `3744db4f91975175907c08f642d43039` |
| `src/apps/customer/components/PendingRequest.jsx` | `f4927f616bf21c3ea25fcc2b9451ba1d` |
| `src/shared/ui/DesiredDateStrip.css` | `9acf517cc576644d43a1db9c1cb67470` |

Se un'impronta non coincide, fermati e dichiaralo. Nessun altro incarico aperto tocca questi file.

**Perimetro:** i sei file della tabella, e nient'altro. In `Book.jsx` solo il passo 3; in `PendingRequest.jsx` solo il blocco delle fasce e le due frasi indicate al punto 5.

**Database**, nelle tre categorie del canone:

- **lettura del demo:** ammessa;
- **dati di prova temporanei sul demo:** ammessi, con ripristino verificato. Servono per aprire il riquadro «Scegli un'altra data» e per provare un pomeriggio chiuso con una chiave di prova in `tenants.settings` del tenant demo, da rimettere com'era;
- **qualunque accesso al prodotto:** no.

Nessuna migrazione. Nessun push, merge o deploy.

## Da dove nasce

Le tre fasce dell'app cliente oggi dicono «Mattina (9–13)», «Pomeriggio (13–19)», «Per me è uguale». A 375px «Pomeriggio (13–19)» va a capo dove capita (misura di `CD-13`, §6). Il lunedì la chiusura della mattina è detta tre volte: «Non disponibile» nel pulsante, «Mattina chiusa. Per quel giorno scegli un'altra preferenza.» sotto, «lun solo pomeriggio» nella legenda del calendario.

`CD-13` ha composto i pulsanti su due righe. **Decisione di Luigi dell'11/11:** si applicano i punti che non chiedono uno stato nuovo nell'interfaccia. Resta fuori la frase «abbiamo tolto la tua preferenza» (handoff §5, caso 7).

**Il vincolo che regge tutto, misurato sul codice:** l'etichetta lunga nasce in `bookingSchedule.js` (righe 47–53) e la leggono anche tre frasi del gestionale (`CustomerRequests.jsx` 78, 182, 331), il riepilogo e il messaggio WhatsApp (`Book.jsx` 160 e 141). Il gestionale legge anche il solo nome e `closedLabel`. **Quei valori non devono cambiare di un carattere.** Il pulsante smette di usare l'etichetta lunga e compone le sue due righe dagli stessi dati.

## Cosa fare

### 1. I pulsanti delle fasce su due righe

- **Riga 1, il nome:** `BOOKING_TIME_WINDOWS[x].name`. **Riga 2, l'orario:** «9–13», «13–19», composto da `start` e `end` con la stessa funzione che oggi compone l'etichetta lunga (`formatRangeHour`, `bookingSchedule.js` riga 35), così pulsante e frasi non possono divergere.
- **«Per me è uguale»:** stesso testo, a capo fisso dopo «Per me».
- **Fascia chiusa:** la riga 2 dice «chiusa» / «chiuso» al posto dell'orario. Oggi quella parola esiste solo dentro `closedLabel`: aggiungi in `bookingSchedule.js` un campo per fascia accanto a `closedLabel`, senza toccare `closedLabel`. Il nome del campo lo scegli tu e lo dichiari.
- **Via «Non disponibile»** dal componente delle fasce (`BookingTimePreferenceChips.jsx` 23).
- **Via la frase fissa sotto le fasce** nei due posti (`Book.jsx` 439–443, `PendingRequest.jsx` 209–211). La riga «L'orario preciso lo concordiamo noi su WhatsApp.» resta.
- **Valori:** quelli dell'handoff, §4, tabelle «La riga delle fasce» e degli stati aperta e chiusa. Griglia, gap, altezza minima 54, raggio e padding di `GH-116` non cambiano.

### 2. La fascia scelta

Tre scostamenti da `GH-116`, firmati da Luigi: bordo 2px `var(--color-primary-hover)` al posto di `var(--color-primary)`; padding 5px 3px; nome a peso 700. Nei due posti (`Book.css` 171, `DesiredDateStrip.css` 21).

### 3. Il titolo, nei due posti

«Mattina o pomeriggio? (facoltativo)», con lo stile che il titolo ha oggi nella pagina di prenotazione. Nel riquadro «Scegli un'altra data» oggi manca: va aggiunto, a 8px dalle fasce. Se lo scrivi una volta sola dentro il componente o due volte nei chiamanti lo decidi tu e lo dichiari; il testo deve essere lo stesso.

### 4. Lo stile non deve uscire dalle fasce

La classe `.gh-book-chip` è usata anche dai pulsanti del passo 4, «Come sta il pelo» (`Book.jsx` 73 e 449–455), che hanno il loro «Non disponibile». **Quelli non cambiano.** Le regole nuove vanno legate alle sole fasce.

### 5. Due frasi di `PendingRequest.jsx`

- **Riga 158:** chi ha scelto «Per me è uguale» oggi legge «Nessuna preferenza». Dopo: «[pet] · [servizio] · Per me è uguale». Senza fascia resta «Nessuna preferenza».
- **Riga 183:** la fascia sta dentro una frase, quindi iniziale minuscola: «Hai indicato giovedì 19 novembre, mattina (9–13). Ora tocca al salone proporti un'alternativa.» Con «Per me è uguale» e senza fascia la frase resta com'è oggi.

## Cosa non è in questo incarico

- **La frase «abbiamo tolto la tua preferenza»** (handoff §5 caso 7, §10 riga g): rinviata. Conseguenza nota e accettata: se il cliente ha scelto una fascia e passa a un giorno in cui è chiusa, la scelta si toglie come oggi e nessuna frase lo dice; lo dice il pulsante, che diventa «chiusa». Dichiaralo nel registro come incompletezza con questo nome: **«scelta tolta senza avviso»**.
- **La frase F5** dell'handoff (`PendingRequest.jsx` 28–30): non si tocca.
- **Il gestionale**, in ogni sua parte.
- **Il calendario, gli avvisi, il pulsante «Invia la richiesta»** e la riga «Manca: …» (`Book.jsx` 255–264).
- **Le regole:** la fascia resta facoltativa, toccarla di nuovo la toglie, «Per me è uguale» non si spegne mai.
- Il caso di due fasce chiuse nello stesso giorno (handoff §12.6): nessuna composizione nuova, i due pulsanti dicono «chiusa» e «chiuso».

## Invarianti

- **Le stringhe che legge il gestionale restano identiche:** `BOOKING_TIME_PREFERENCES` → «Mattina (9–13)», «Pomeriggio (13–19)», «Per me è uguale»; `name` → «Mattina», «Pomeriggio»; `closedLabel` → «Mattina chiusa», «Pomeriggio chiuso». Le firme e i valori di ritorno di `getBookingTimePreferenceLabel`, `getBookingTimePreferenceName` e `getDateClosure` non cambiano.
- **Nessun file fuori perimetro cambia.** Impronte MD5 dei cinque file del gestionale che leggono questi valori, misurate dalla regia l'11/11 alle 07:35 e rimisurate alla consegna:

| File | MD5 |
|---|---|
| `src/apps/staff/pages/CustomerRequests.jsx` | `3264c5545e4a44f63dfad62778387fd6` |
| `src/apps/staff/components/CalendarKit.jsx` | `1dd8f84440e4a0363603124f5fd6e6ec` |
| `src/apps/staff/lib/whatsapp.js` | `f12f7e7aad52185d494301988e76ac85` |
| `src/shared/appointments/openPetBookings.js` | `81d9baa74bca97278b8cdb6cd5bfc4a5` |
| `src/apps/staff/pages/Calendar.jsx` | `1b5c312ba646d275a1286f12ce2ea070` |

- **Riepilogo e messaggio WhatsApp** (`Book.jsx` 160 e 141) dicono le stesse parole di oggi.
- **Nessun colore nuovo:** solo variabili già in `src/index.css` e `src/shared/tokens/tokens.css`.
- **Altezza dei pulsanti 54px in tutti gli stati**, e nessun testo esce dal pulsante.

## Che cosa non ho misurato

- **La larghezza vera della riga delle fasce nel riquadro a 375px.** L'handoff usa 303px, che nel registro di `GH-116` è la larghezza del riquadro. Misurala tu.
- **La variante del riquadro dentro la tessera del cane** (`pet-card.css` 87): non so quanto è larga.
- **Il rendering su iPhone** (San Francisco): `CD-13` ha misurato in Inter e Roboto. Lo guarda Luigi dal vivo.
- **Come si comporta a 1365px**: nessuna misura.

## La prova mirata, prima di implementare

La premessa più critica è l'invariante del gestionale, perché un errore lì arriva al banco senza che nessuno guardi l'app cliente. **Prima di toccare l'interfaccia**, dopo la modifica di `bookingSchedule.js`, verifica con un controllo eseguito che le sei stringhe dell'invariante siano identiche a prima. Se non lo sono, fermati.

Seconda, se la prima passa: misura la larghezza della riga delle fasce nel riquadro a 375px. Se la larghezza utile al testo è sotto 70px («Pomeriggio» a peso 700 misura 69,94px in Inter), fermati e dichiaralo.

Se ritieni più critica un'altra premessa, dillo: è un contributo.

## Controprove

Dichiara nel registro. **Testi esatti e misure.** Le attese vengono dall'handoff di `CD-13` (§3, §5, §6), non dal codice.

- **Le sei stringhe dell'invariante**, prima e dopo.
- **Pagina di prenotazione, 375px**, nei sette stati dell'handoff §5 tranne la frase del caso 7: testi delle due righe di ogni pulsante, altezza 54, larghezza delle colonne, nessuno sbordo. Giovedì: «Mattina / 9–13», «Pomeriggio / 13–19», «Per me / è uguale». Lunedì: «Mattina / chiusa», pulsante spento.
- **Pomeriggio chiuso** (chiave di prova sul demo, poi ripristinata): «Pomeriggio / chiuso», altezza della riga 54.
- **Fascia scelta:** bordo, fondo, peso del nome; il contenuto non si sposta fra scelta e non scelta.
- **Riquadro «Scegli un'altra data», 375px:** titolo presente, stessi testi, larghezza misurata della riga, altezza 54.
- **Riquadro dentro la tessera del cane:** larghezza misurata, nessuno sbordo.
- **1365px**, pagina di prenotazione: nessuno sbordo.
- **Passo 4, «Come sta il pelo»:** i pulsanti sono identici a prima (testo, altezza, stile).
- **Le due frasi del punto 5**, nei tre casi: fascia, «Per me è uguale», nessuna fascia.
- **Riepilogo dopo l'invio e messaggio WhatsApp:** testi uguali a prima.
- **«Non disponibile» e «Per quel giorno scegli un'altra preferenza»:** cercati in `src/apps/customer/`, con il comando e l'esito. Il primo deve restare solo nel passo 4.
- **Le cinque domande del canone** sull'intreccio fra giorno e fascia, in particolare la 2: nome e orario del pulsante e etichetta lunga vengono dalla stessa fonte.
- **Dati di prova:** creati, rimossi, residui a zero, chiave di prova ripristinata.
- **Build verde**; `git diff --stat` con i soli file del perimetro.

Ogni rilievo porta la parola **scoperta** o **recupero**. In fondo al registro: recuperi, passaggi richiesti a Luigi, tempo aggiunto dalla prova mirata.

## Passo finale — lo guarda Luigi

Sul telefono, dopo il deploy: apri la prenotazione e scegli un giovedì, poi un lunedì; scegli «Pomeriggio» e toccalo di nuovo; apri «Scegli un'altra data» da una richiesta con alternative. La domanda è **«cosa non ti torna?»**, non «funziona?».

## Chiusura

Registro in `docs/consegne/GH-117-le-fasce-su-due-righe-esito.md`, committato col codice. In testa: versione e impronta MD5 del canone letto. Niente push, niente merge, niente deploy.
