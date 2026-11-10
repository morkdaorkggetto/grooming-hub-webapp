# Incarico GH-116 — Il calendario del mese

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`. Canone adottato: 1.3.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 10 novembre 2026
**Base:** `b162a07` (incarichi GH-115 e CD-12, sopra `1597404` di GH-115; nessun file applicativo cambiato fra i due). Rettificata da Cowork il 10/11 su segnalazione di Codex.
**Fonte di design:** `docs/consegne/CD-12-consegna/`, in particolare `CD-12-handoff.md`, `cd12-calendario-kit.jsx` e la tela `CD-12 Il Calendario Del Mese.html`. Il mandato di Claude Design è `docs/incarichi/CD-12-il-calendario-del-mese.md`.

**Perimetro:**

- `src/shared/ui/DesiredDateStrip.jsx` e `.css`: sostituisci il componente oppure affiancagli un `DesiredDateCalendar`, dichiarando la scelta;
- `src/apps/customer/pages/Book.jsx` e `Book.css`, solo il passo 3;
- `src/apps/customer/components/PendingRequest.jsx` e il suo CSS, solo la scelta della data;
- `src/apps/customer/lib/bookingDates.js`;
- `src/shared/tenant/bookingSchedule.js`.

**Database**, nelle tre categorie del canone:

- **lettura del demo:** ammessa;
- **dati di prova temporanei sul demo:** ammessi, con ripristino verificato. Vale anche per una chiave di prova in `tenants.settings` del tenant demo: va rimessa com'era e il ripristino dichiarato;
- **qualunque accesso al prodotto:** no.

Nessuna migrazione: le chiavi nuove stanno in `settings.booking_schedule`, che oggi non ha vincoli. Nessun push, merge o deploy.

## Da dove nasce

Sul telefono la striscia `DesiredDateStrip` mostra solo 6 giorni (dal 7° in poi sono nascosti, `:nth-child(n + 7)`), domenica compresa. Non c'è modo di andare avanti: il cliente vede in pratica una settimana. **Decisione di Luigi e Davide del 10/11:** un calendario del mese con le frecce, selezionabile **fino a 2 mesi**, come impostazione del salone. Claude Design ha composto il calendario in CD-12.

## Cosa fare

1. **Il calendario come da CD-12**, in `Book.jsx` (passo 3) e nel riquadro «Scegli un'altra data» di `PendingRequest.jsx`. Dimensioni, stati, legenda e ordine sotto la griglia sono quelli dei §2-§4 dell'handoff, incluse le varianti a 375px, a 1365px e dentro il riquadro.
2. **L'orizzonte come impostazione del salone.** Leggi `settings.booking_schedule.max_months_ahead` (intero positivo). Se manca o non è valido, il valore è **2**. Il limite è «stesso giorno, N mesi dopo» (handoff §4.5). La riga «Si può chiedere fino a …» indica **l'ultimo giorno davvero chiedibile**, calcolato saltando i giorni chiusi (handoff §8.2).
3. **I giorni chiusi per data**, per le feste (handoff §8.3). Leggi `settings.booking_schedule.closed_dates`, un elenco di date `YYYY-MM-DD`; se manca vale vuoto. Quei giorni si comportano come la domenica. Non riempire niente nel prodotto: le date reali le inserisce Cowork con un atto, dopo la risposta di Davide.
4. **La legenda nasce dalle stesse impostazioni** che spengono i giorni (handoff §8.4): `closed_weekdays`, `closed_time_preferences` e `closed_dates`, non un testo scritto a parte.
5. **Il primo mese:** il corrente, oppure il successivo se nel corrente restano meno di 7 giorni chiedibili (handoff §4.6).
6. **I periodi pieni** restano quelli di `getBookingFullPeriod` (date fisse). In griglia diventano il punto della consegna, e l'avviso a data scelta resta.

## Cosa NON cambia

- **Il pulsante di GH-115 resta com'è nel prodotto:** il suo stile, la riga «Manca: …» e il tocco che porta al campo. La tela di CD-12 mostra un pulsante grigio con «Manca il giorno»: è un'illustrazione e non va seguita.
- **Le regole di invio** (`canSubmit`). La fascia oraria **non diventa obbligatoria**. Se il lunedì la fascia «Mattina» scelta viene spenta, si deseleziona come oggi.
- **Il server:** la data resta valida se è successiva a oggi. L'orizzonte dei 2 mesi è un limite dell'app: il salone conferma comunque ogni richiesta.
- **I testi degli avvisi** «Periodo pieno» e «Sei un po' a corto di preavviso»: si usano quelli di oggi, non i segnaposto della tela.
- **Nessun colore nuovo** e nessuna classe tipografica scritta a mano.

## Controprove

Dichiara nel registro testi esatti e misure.

- **A 375px**, aperto il 10/11: novembre, freccia sinistra spenta, domeniche e oggi spenti, legenda «dom chiuso · lun solo pomeriggio».
- **Avanti fino a gennaio:** freccia destra spenta; l'ultimo giorno chiedibile è sabato 9 gennaio; la riga «Si può chiedere fino a …» lo dice.
- **Con `max_months_ahead: 3`** (chiave di prova sul demo, poi ripristinata): il limite si sposta.
- **Con `closed_dates: ["2026-12-25"]`** (stessa regola): il 25 dicembre è spento e la legenda lo dice.
- **Simulando la data del 26/11** si apre su dicembre.
- **Lunedì scelto:** «Mattina» spenta.
- **Un giorno di Natale scelto:** punto in griglia e avviso.
- **Una richiesta inviata dal calendario:** arriva con la data giusta; poi rimossa, residui a zero.
- **Riquadro «Scegli un'altra data»:** la stessa scelta funziona.
- **A 375px e a 1365px:** nessuno sbordo, e il pulsante di GH-115 non copre le fasce, salvo il caso dei due avvisi insieme già dichiarato in CD-12 (§8.1).
- **Build verde.**

## Chiusura

Registro in `docs/consegne/GH-116-il-calendario-del-mese-esito.md`, committato col codice. Niente push, niente merge, niente deploy.
