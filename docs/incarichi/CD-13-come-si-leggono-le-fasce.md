# Incarico CD-13 — Come si leggono le fasce

**Progetto:** Grooming Hub — root `~/Desktop/grooming-hub-web/`.
**Per:** chat UI (chi compone) · **Da:** Luigi · **Data:** 11 novembre 2026
**Nasce da:** l'eccezione testuale dichiarata nel registro `docs/consegne/GH-116-il-calendario-del-mese-esito.md` (riga 40) e dalla tela di `CD-12`.
**Esito atteso:** composizione, non codice. Consegna in `Prototipo/CD-13-consegna/`.

**Perimetro:** una tavola Design e il suo handoff. Leggi il codice, non lo modifichi. Non vedi il prodotto né i dati dei clienti. Nessuna struttura dei dati si decide qui: ciò che la tua proposta richiede al codice lo dichiari, e diventa esecutivo solo con l'incarico `GH-117`.

**Base misurata:** ramo `main`, commit `131d735`, l'11/11/2026 alle 06:55. Impronte MD5 dei file letti:

| File | MD5 |
|---|---|
| `src/shared/tenant/bookingSchedule.js` | `5589e9884e196810b067f42a07c1d03f` |
| `src/apps/customer/components/BookingTimePreferenceChips.jsx` | `17d6a1e57cc8e9f4d479c35e3afdbaf4` |
| `src/apps/customer/pages/Book.jsx` | `53a1b779e2250b5f8bd38fc736d23a31` |
| `src/apps/customer/pages/Book.css` | `3744db4f91975175907c08f642d43039` |
| `src/apps/customer/components/PendingRequest.jsx` | `f4927f616bf21c3ea25fcc2b9451ba1d` |
| `src/shared/ui/DesiredDateStrip.css` | `9acf517cc576644d43a1db9c1cb67470` |
| `src/apps/staff/pages/CustomerRequests.jsx` | `3264c5545e4a44f63dfad62778387fd6` |
| `src/shared/ui/DesiredDateStrip.jsx` | `f2cb66003c2d2a929fdb60f950c8d94a` |

Se un'impronta non coincide con quella che misuri tu, fermati e dichiaralo.

## Da dove nasce

`CD-12` ha composto le tre fasce con etichette brevi: «Mattina», «Pomeriggio», «Per me è uguale», e sotto la fascia chiusa «chiusa il lunedì» (`cd12-calendario-kit.jsx`, `Fasce12`, righe 142–162). `GH-116` ha applicato griglia e altezza ma non i testi, perché il componente era fuori dal suo perimetro. Oggi nell'app si legge:

- «Mattina (9–13)», «Pomeriggio (13–19)», «Per me è uguale»;
- dentro la fascia chiusa, in piccolo e maiuscolo: «Non disponibile»;
- sotto le fasce, quando il giorno scelto ha una fascia chiusa: «Mattina chiusa. Per quel giorno scegli un'altra preferenza.»

La domanda non è solo «brevi o lunghe»: le etichette nascono in un punto solo e vanno in undici posti, tre dei quali nel gestionale. Per questo serve una composizione prima del codice.

## I dati con cui comporre (misurati sul codice)

**Da dove vengono le etichette.** Tutte da `src/shared/tenant/bookingSchedule.js`:

| Che cosa | Riga | Valore oggi |
|---|---|---|
| nome della fascia (`BOOKING_TIME_WINDOWS.*.name`) | 15, 22 | «Mattina», «Pomeriggio» |
| orari della fascia (`start`, `end`) | 16–17, 23–24 | 09:00–13:00, 13:00–19:00 |
| etichetta lunga (`BOOKING_TIME_PREFERENCES`) | 47–53 | nome + «(9–13)» / «(13–19)»; terza voce «Per me è uguale» |
| testo di fascia chiusa (`closedLabel`) | 18, 25 | «Mattina chiusa», «Pomeriggio chiuso» |
| «Non disponibile» | `BookingTimePreferenceChips.jsx` riga 23 | scritto nel componente |

**Dove compaiono le fasce come pulsanti** (lo stesso componente, `BookingTimePreferenceChips`):

| Posto | File e riga | Intorno |
|---|---|---|
| pagina di prenotazione, passo 3 | `Book.jsx` 434–438 | sopra c'è il titolo «Mattina o pomeriggio?» (riga 433), sotto la riga «L'orario preciso lo concordiamo noi su WhatsApp.» |
| riquadro «Scegli un'altra data» | `PendingRequest.jsx` 204–208 | **nessun titolo** sopra le fasce: vengono subito dopo il calendario |

In entrambi: tre colonne uguali, alte almeno 54px, raggio 12, testo 12,5px peso 600, centrato, può andare a capo. Scelta: bordo 2px `var(--color-primary)` su `var(--gh-tint)`. Chiusa: bordo tratteggiato, fondo `var(--color-surface-soft)`, testo `var(--color-text-secondary)`, con la riga piccola a 9px maiuscola (`Book.css` 169–171 e 176–203; `DesiredDateStrip.css` 19–21). Secondo il registro di `GH-116` (riga 22), a 375px ogni colonna è larga 111,7px.

**Dove va la stessa etichetta lunga, come testo:**

| # | App | File e riga | Frase |
|---|---|---|---|
| 1 | cliente | `Book.jsx` 160 | riepilogo dopo l'invio: «Preferenza · Mattina (9–13)» |
| 2 | cliente | `Book.jsx` 141 | entra nel messaggio WhatsApp che il cliente manda al salone |
| 3 | cliente | `PendingRequest.jsx` 158 | «[pet] · [servizio] · Mattina (9–13)» |
| 4 | cliente | `PendingRequest.jsx` 183 | «Hai indicato [giorno], Mattina (9–13). Ora tocca al salone…» |
| 5 | cliente | `PendingRequest.jsx` 30 | un'alternativa senza ora: «[giorno], Mattina (9–13)» |
| 6 | staff | `CustomerRequests.jsx` 78 | alternativa senza ora |
| 7 | staff | `CustomerRequests.jsx` 182 | fascia della richiesta |
| 8 | staff | `CustomerRequests.jsx` 331 | «fascia scelta / preferenza ricevuta: Mattina (9–13)» |

Il gestionale usa anche il solo nome («mattina», «pomeriggio», «a piacere») in `CalendarKit.jsx` 59, `whatsapp.js` 182 e `openPetBookings.js` 67, e il testo di fascia chiusa in `Calendar.jsx` 1156–1158.

**Le regole, come sono nel codice:**

- **La fascia è facoltativa.** La richiesta parte anche senza (`Book.jsx` 245–264; `GH-116` l'ha provato: `time_preference = NULL`). Nella tela di `CD-12` il pulsante diceva «Manca la fascia»: nel codice quella frase compare solo se la fascia scelta è chiusa, come «un'altra fascia». Componi con la regola del codice.
- **Toccare la fascia già scelta la toglie** (`BookingTimePreferenceChips.jsx` riga 20).
- **Una fascia chiusa non si può scegliere.** Se era scelta e si passa a un giorno in cui è chiusa, si deseleziona da sola (`Book.jsx` 289–293; `PendingRequest.jsx` 196–201).
- **Le chiusure sono impostazioni del salone**, non il lunedì in sé: `closed_time_preferences` può spegnere qualunque fascia di qualunque giorno. Oggi nel prodotto è chiusa solo la mattina del lunedì (misurato alle 06:46).
- **«Per me è uguale» non si spegne mai**, nemmeno nel giorno in cui una fascia è chiusa.
- **Prima di scegliere il giorno** nessuna fascia è chiusa.

## Cosa ti chiediamo

### 1. Le tre fasce, quando sono tutte aperte

Come si leggono a 375px, in tre colonne, nei due posti. Di' se gli orari restano nel pulsante, se scendono su una seconda riga, o se vanno altrove. Se li togli dal pulsante, di' dove il cliente legge che la mattina è 9–13: oggi è l'unico punto in cui lo impara.

### 2. La fascia chiusa

Oggi il lunedì la stessa cosa è detta in due punti: «Non disponibile» dentro il pulsante e «Mattina chiusa. Per quel giorno scegli un'altra preferenza.» sotto. Il calendario di `GH-116` lo dice una terza volta nella legenda sotto la griglia, composta dalle impostazioni: «lun solo pomeriggio» (`src/shared/ui/DesiredDateStrip.jsx`, righe 20–40). Decidi quante volte va detto e con quali parole. Il testo deve potersi comporre dai dati (nome del giorno, nome della fascia), perché domani la chiusura può essere un'altra: «chiusa il lunedì» va bene solo se il giorno è una variabile.

### 3. «Per me è uguale» nel giorno con una fascia chiusa

Il lunedì resta acceso accanto a «Mattina» spenta. Di' come si legge: resta com'è, cambia testo, o ha una riga che lo spiega.

### 4. I due posti

Componi la pagina di prenotazione e il riquadro «Scegli un'altra data». Nel riquadro manca il titolo sopra le fasce: di' se serve, o perché può mancare.

### 5. Le cinque frasi del cliente che usano la stessa etichetta

Per le righe 1–5 della tabella, di' quale forma vuoi: breve, lunga, o un'altra. Scrivi la frase per intero, con «Per me è uguale» e con la fascia assente.

## Cosa non è in questo incarico

- **Il gestionale.** Le righe 6–8 e gli altri usi dello staff non si compongono qui. Ti chiediamo solo una dichiarazione: la tua proposta li lascia come sono, oppure li cambierebbe? Se li cambierebbe, è una decisione di Luigi.
- **Il calendario del mese**, gli avvisi e il pulsante «Invia la richiesta»: sono di `CD-12`, `GH-115` e `GH-116`.
- **I valori e gli orari delle fasce**, e il fatto che la fascia sia facoltativa.
- **I giorni di festa**: sono entrati oggi nelle impostazioni come giorni chiusi interi, e spengono il giorno, non una fascia.

## Invarianti

- **Solo i token del design system «Grooming Hub»** (artifact di tipo Design System, https://claude.ai/artifact/Q1XXHLBwnSL6Yn1SJGfBuV; copia in `Prototipo/DS-consegna/`). Nessun colore nuovo, mai un esadecimale: sempre `var(--nome)`. La regia l'ha verificato l'11/11 alle 06:55: 59 righe su 59 di `DS-tabella.md` coincidono con le due fonti, e i tre file di `project/` hanno lo stesso sha256 dell'artifact.
- Spazi, corpi e pesi non sono token: li dichiari in px nell'handoff.
- **Tre colonne, altezza minima 54px, bersaglio di tocco almeno 44px.** Se la tua proposta cambia griglia o altezza, lo dichiari come scostamento da `GH-116`, con il motivo.
- La pagina non deve sembrare un sistema di posti liberi: la fascia è una preferenza, l'ora la conferma il salone su WhatsApp.

## Che cosa non ho misurato

- **Come vanno a capo le etichette di oggi a 375px.** So la larghezza della colonna (111,7px, dal registro di `GH-116`) ma non ho visto il rendering. Misuralo tu sulla tavola e dichiaralo.
- **Il riquadro «Scegli un'altra data» a 1365px**: non so quanto è largo.

## Controprove

Dichiara nell'handoff. **Testi esatti e misure.**

- **La tabella prima → dopo**, una riga per ogni testo: i tre pulsanti, la riga dentro la fascia chiusa, la riga sotto le fasce, l'eventuale titolo, le cinque frasi del punto 5. Colonne: dove, oggi, dopo.
- **La matrice degli stati**, per ciascuno dei due posti: nessun giorno scelto · giorno con tutte le fasce aperte · giorno con la mattina chiusa · giorno con il pomeriggio chiuso · una fascia scelta · «Per me è uguale» scelta · fascia scelta che si spegne cambiando giorno.
- **Le misure a 375px**: larghezza delle colonne, numero di righe di testo di ogni pulsante, altezza risultante. La più lunga non deve uscire dal pulsante.
- **L'elenco dei token usati**, con il nome della variabile.
- **Le cinque domande del canone** (§3), sull'intreccio fra giorno scelto e fascia: in particolare la 3 (chi offre e chi rifiuta leggono lo stesso dato) e la 4 (ciò che si offre si può ancora fare).
- **Che cosa chiede al codice**: per ogni testo nuovo, da quale dato si compone.

## Consegna

In `~/Desktop/grooming-hub-web/Prototipo/CD-13-consegna/`:

- `CD-13-handoff.md`, con il collegamento alla tavola Design, la tabella prima → dopo, la matrice, le misure e una sezione **«Cosa non torna»**;
- i file della tavola, nella forma delle consegne precedenti (tela e kit);
- in testa all'handoff: versione e impronta MD5 del canone letto, il commit su cui hai misurato, e le impronte dei file qui sopra rimisurate da te.

La regia copia la consegna in `docs/consegne/CD-13-consegna/` dopo la verifica.

## Chiusura

Dimmi «consegnato» a Luigi con il solo nome della cartella. La domanda a cui l'handoff risponde è **«cosa non ti torna?»**, non «è finito?».
