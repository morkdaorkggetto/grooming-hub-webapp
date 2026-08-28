# CD-01 · Handoff — il calendario

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 27 agosto 2026
**Esito:** composizione. Non codice.
**File di composizione:** `CD-01 Calendario.html` (canvas) + `cd01-cal-kit.jsx`, `cd01-cal-viste.jsx`, `cd01-cal-note.jsx`
**Contratto «prima» misurato su:** `gh15-ed-kit.jsx` e `gh15-ed-riferimenti.jsx` — il ceppo GH-15 consegnato, non una work-directory.

Struttura identica all'handoff GH-15, così Codex trova le stesse voci nello stesso ordine.

---

## 1 · I file di composizione

Aprili, non guardare gli screenshot: da un'immagine non si ricava se un titolo è 15 o 17px.

| File | Cosa contiene |
|---|---|
| `cd01-cal-kit.jsx` | I componenti nuovi: `CalFascia`, `CalWhen`, `CalRow`, `CalDay`, `CalQueue`, `CalWeekStrip`, `CalNav`, `CalDayStrip` |
| `cd01-cal-viste.jsx` | Le viste e i dati: settimana vuota, solo-registrato, piena, caricamento, telefono, conferma |
| `cd01-cal-note.jsx` | Le tavole: grammatica dei tre oggetti, vocabolario, campi ⚠, domande aperte |
| `CD-01 Calendario.html` | Il canvas che le monta tutte, con le note di sezione |

**Dipendenze, tutte già in produzione:** `tokens.css`, `shared-ui.jsx` (`Icon`, `PetAvatar`), `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`. Nulla di GH-15 è stato sostituito o riscritto: solo aggiunte.

---

## 2 · Colori — nessuno nuovo

**Nessun colore nuovo oltre i tre già dichiarati in GH-15** (`--gh-bridge`, `--gh-border-60`, `--gh-border-35`), e di quei tre il calendario usa solo i due bordi.

Tutto il resto viene da `tokens.css` così com'è: `--color-primary`, `--color-warning-text/-bg/-border`, `--color-success-text/-bg`, `--color-danger-text`, `--color-text-primary/-secondary`, `--color-surface-main/-soft`, `--color-border`, `--color-placeholder`, `--font-sans/-serif`.

Due derivati d'opacità usati inline, **entrambi ricavati da token esistenti**, nessuno nuovo:

- `rgba(111,151,146,.05)` — fondo del giorno corrente = `--color-primary` al 5%
- `rgba(111,151,146,.06)` — fondo della scheda «Bagno» scelta nella tavola parole

Se preferite zero `rgba` sparsi, dichiarateli come token: il valore non cambia. **È la stessa decisione rimasta in sospeso su GH-15 — vale la pena prenderla una volta per tutte, non due.**

---

## 3 · Densità — eredita GH-15, aggiunge cinque righe

La tabella di GH-15 resta valida senza modifiche. Nuovi elementi:

| Elemento | Banco | Telefono |
|---|---:|---:|
| Riga oggetto calendario | 44 | 60 |
| Chip giorno (striscia telefono) | — | 54 |
| Capsula fascia | 22 | 22 |
| Bottone «Conferma» in riga | 32 | — |
| Navigatore settimana | 34 | — |

Regola invariata: **comprime la tipografia, mai il bersaglio.** La capsula fascia è alta 22px ma **non è un bersaglio** — è un'etichetta dentro una riga da 44/60px, che è il bersaglio vero. Il bottone «Conferma» a 32px esiste **solo su desktop**; sotto 640px la riga si tocca per intero e apre la conferma a schermo pieno. Nessun target sotto 44px sotto i 640px.

Cella dell'ora: **76px** al banco, **66px** sul telefono.

---

## 4 · Componenti

**Riusati da `gh15-ed-kit.jsx` senza toccarli:** `GH` (costanti), `Hero`, `HeroBtn`, `Btn`, `Panel`, `Field`, `Eyebrow`, `StatStrip`, `StateTag`, `EmptyState`, `SkeletonRow`, `Notice`, `Phone`, `Fab`, `TouchCtx`/`useTouch`.
**Riusati da `gh15-ed-riferimenti.jsx`:** `RefCard`, `RefRow`.
**Riusati da `shared-ui.jsx`:** `Icon`, `PetAvatar`.

**Da estendere:** nessuno.

**Nuovi:**

| Nome | Cosa fa |
|---|---|
| `CalFascia` | Capsula tratteggiata con la fascia oraria richiesta |
| `CalWhen` | La cella sinistra: le tre forme dei tre oggetti |
| `CalRow` | Riga di un oggetto qualsiasi, `kind` = `conf` / `req` / `reg` |
| `CalDay` | Sezione giorno: ordina i tre registri e la riga «registrato dal salone» |
| `CalQueue` | La coda delle richieste in attesa, nella spalla |
| `CalWeekStrip` | Chiusura settimana: presenze e ritorni, non denaro |
| `CalNav` | Navigatore settimana |
| `CalDayStrip` | Striscia dei sette giorni, solo telefono |

`STATES` di GH-15 copre già tutto: `attesa` per le richieste, `noshow`, `rischio`, `attivo`. **Nessuno stato nuovo aggiunto.**

---

## 5 · Responsive — un solo punto di rottura, 640px

**Sopra 640px:** due colonne, `1fr / 380px`. Sinistra la settimana (sette sezioni giorno), destra la coda richieste + chiusura settimana. Riga oggetto 44px, «Conferma» in riga.

**Sotto 640px:** **un giorno alla volta**, non la settimana. La settimana su 390px non si legge: sette colonne da 50px non reggono un nome proprio. Navigazione con la striscia dei sette chip da 54px, un pallino se il giorno ha contenuto (warning se ci sono richieste da confermare). Riga oggetto 60px, `chevron` a destra, il bottone «Conferma» sparisce dalla riga e la riga apre la conferma a schermo pieno.

**Cosa succede alla coda richieste sul telefono:** non ha una spalla dove stare. Le richieste restano visibili **dentro il giorno a cui appartengono**, in testa, con il tag «In attesa». La FAB resta «Registra lavorazione», che è il gesto più frequente.

---

## 6 · Stati

**I tre oggetti** (non sono stati, sono tipi — vedi §7):

| Oggetto | Cella ora | Colore |
|---|---|---|
| Appuntamento confermato | cifre serif 17 tabulari | pallino `--color-success-text` |
| Richiesta pendente | capsula tratteggiata | `--color-warning-text` su `-bg` |
| Lavorazione registrata | barretta 14×2px | `--color-border` |

**Stati di riga:** `attesa` sulle richieste, `noshow` e `rischio` come tag accanto al nome quando presenti. `attivo` non si stampa (regola GH-15: in lista si stampa solo ciò che devia dal default).

**Caricamento:** `SkeletonRow` di GH-15, stessa geometria della riga vera. Nessuno spinner.

**Vuoto — due vuoti distinti, ed è deliberato:**
1. **Settimana vuota** — `EmptyState` in testa al pannello che spiega le due direzioni, con due azioni; **e sotto restano i sette giorni**. Una settimana deserta deve somigliare a una settimana, non a un errore.
2. **Giorno vuoto dentro una settimana piena** — una riga corsiva sola, «Nessuna richiesta, nessuna lavorazione.» Nessuna illustrazione, nessuna azione: sarebbe rumore ripetuto sette volte.

**Errore:** `ErrorState` di GH-15. Caso specifico del calendario: se la conferma va a buon fine ma **il messaggio non parte**, non è un successo — la richiesta resta «in attesa» e l'errore dice che l'ora è salvata ma il cliente non è stato avvisato. Vedi §9.2.

---

## 7 · Cosa NON cambia — deliberato, non da migliorare

1. **Nessuna griglia oraria.** Non è una semplificazione né una vista provvisoria: senza durata e senza prezzo una griglia mostra blocchi tutti alti uguali — un dato inventato — e spreca l'altezza in ore vuote. Se sembra che «manchi il calendario vero», è questo.
2. **Le tre forme della cella ora restano tre.** Non unificarle. La capsula tratteggiata promette «da qualche parte qui dentro»: vero su una richiesta, **falso** su una lavorazione registrata. Sarebbe l'errore dell'operatore accanto alla visita.
3. **La lavorazione non ha ora, e non va dedotta.** Né da `created_at`, né dall'ordine di inserimento, né da una media. `visits.date` è `date`: la colonna resta muta.
4. **Il testo del salone si stampa verbatim, tra virgolette, in corsivo.** Non si riscrive, non si normalizza, non si mappa su un listino. «bagnetto» resta «bagnetto». Dentro c'è il diario.
5. **Nessuna classificazione automatica** del campo libero. «non è venuto» non si trasforma in un no-show da solo: è il salone che lo marca, se vuole.
6. **Nessun prezzo e nessuna durata lato cliente.** Sarebbero un preventivo che nessuno può fare.
7. **Gli incassi non entrano nel calendario.** La striscia settimanale conta presenze e ritorni e rimanda a `/reports/weekly`. Due luoghi dove si legge lo stesso numero: il primo che sbaglia rovina la fiducia in entrambi.
8. **Lo status del cliente non va in lista.** Su sette righe è rumore. Compare dentro la conferma, dove serve.
9. **«Conferma e invia» è un bottone.** Non due. Non un bottone più un promemoria.
10. **Sul telefono si vede un giorno, non la settimana.** Non è una riduzione da recuperare in futuro.
11. **Nessuna route nuova.** Il calendario resta dov'è; la conferma è una modale, non una pagina.
12. **Ordine di lettura dentro il giorno:** da decidere → deciso → già accaduto. Non cronologico, non alfabetico.

---

## 8 · Campi che potrebbero non esistere — 11 marcati ⚠

**Misurate lo schema prima di scrivere.** Se un campo non c'è: **non inventarlo e non inferirlo.** La riga perde quella parte e non si muove — le celle sono dimensionate per reggerlo.

| Campo | Cosa serviva |
|---|---|
| ⚠ `requests[]` | la tabella richieste esiste già? con quali colonne |
| ⚠ `requests.fascia` | mattina / pomeriggio / indifferente |
| ⚠ `requests.manto[]` | i cinque codici condizione del manto |
| ⚠ `requests.nota` | nota libera sul manto |
| ⚠ `requests.age` | età dichiarata se mancava in anagrafica |
| ⚠ `requests.state` | in attesa / approvata / rifiutata |
| ⚠ `requests→appointment` | il legame dopo la conversione |
| ⚠ `appointments.time` | **l'ora esiste sugli appuntamenti?** Su `visits` no, misurato. Se non esiste nemmeno qui, cade l'intero oggetto «appuntamento confermato» e il calendario ha due oggetti, non tre |
| ⚠ `visits.amount` | incasso per visita — la riga registrata regge la sua assenza (mostra `—`) |
| ⚠ `message.sent_at` | traccia dell'invio: senza, «confermato» è dichiarato e non verificabile |
| ⚠ `promotions[]` | nominate dal salone, non trovate: **non composte** |

**Unico dato che dò per certo, perché misurato da voi:** `visits.date` è di tipo `date`, senza ora.

Anche `visit.operator` resta ⚠ e resta **escluso**: nella modale di conferma il campo «Chi lavora» è marcato a schermo e va rimosso se lo schema non lo regge.

---

## 9 · Domande aperte — dichiarate, non risolte

**9.1 · Le promozioni esistono come dato, o sono una cosa che Davide e Roby tengono a mente?**
Non le ho composte. Se sono a mente, il calendario non può mostrarle e la richiesta va riformulata — sospetto che la domanda vera sotto sia «chi non torna da un po'», che è un'altra vista.

**9.2 · Il messaggio parte dall'app, o si apre WhatsApp col testo già scritto?**
Cambia se «confermato» è verificabile o solo dichiarato. Con WhatsApp esterno serve almeno un segno che l'invio è avvenuto, altrimenti torniamo esattamente alla divergenza del §10.3 di GH-15 che questo disegno vuole chiudere.

**9.3 · Una lavorazione registrata su un giorno che aveva un appuntamento confermato: sono la stessa cosa?**
Oggi le mostro come due righe distinte — onesto, ma può sembrare doppio. Non ho inventato un legame che non ho misurato.

**9.4 · «Rifiuta» che messaggio manda?**
Un rifiuto senza parole è peggio del silenzio. Serve una frase scritta da Davide, non da me: chiedetegliela così com'è e usate la sua.

**9.5 · Fin dove si va indietro?**
464 visite e un anno di storia. Nessun limite tecnico, ma un «vai a una data» servirà appena lo storico si legge davvero.

**Chiusa la §9.1 di GH-15:** la domanda «Davide guarderebbe la settimana passata?» era mia, e la risposta del salone la supera — non solo la guarderebbero, la vogliono come **una delle due direzioni da cui il calendario si riempie**. Era giusto non vestirlo prima di saperlo.

---

## 10 · Le parole — tre decisioni di voce, tutte reversibili in una stringa

**«Servizio» → «Bisogno».** Il cliente non ordina da un listino: segnala. Lato cliente diventa la domanda «Di cosa ha bisogno Luna?»; lato salone l'etichetta è «Bisogno indicato». Una parola sola, in wizard, richieste, coda e calendario.

**«Servizio svolto» → «Registrato».** Ciò che il salone scrive è un'altra cosa da ciò che il cliente ha chiesto, e può legittimamente differire. La riga di coda si intitola «registrato dal salone» — neutro, perché a volte dentro c'è «non è venuto».

**«Prenotazione» → «Richiesta».** Prenotare implica che il posto sia tuo. Qui il cliente chiede e il salone dispone: la parola deve dirlo dal primo schermo, così la conferma non sembra una formalità.

**«Bagno» lato cliente, «bagnetto» intatto dove scrive il salone.** 129 volte su 298 dicono «bagnetto», ed è vero affetto — ma lo dicono *del proprio lavoro*, non offrendolo a menu. Messo in bocca al cliente come opzione preimpostata, l'affetto diventa un vezzo deciso a tavolino: il cliente sta descrivendo un bisogno e ha diritto al nome neutro della cosa. Il calore sta nelle frasi intorno al campo, non nell'etichetta del campo. Dove scrive il salone — testo libero, diario, messaggi — «bagnetto» **resta verbatim e non si normalizza mai**.

Se Davide e Roby preferiscono sentirsi chiamare così anche dal cliente, **è una stringa**: è la loro voce, non la mia.

---

## Verifiche fatte prima di consegnare

- Tutti i token risolvono, nessun errore in console.
- Riuso di `gh15-ed-kit.jsx` verificato: nessun componente sostituito o riscritto.
- Tre artboard erano più corti del contenuto e tagliavano righe vere — corretti. Il taglio su «settimana piena» costava le due voci che servivano di più: `sab 29` era l'unico posto dove compariva la fascia «a piacere», `dom 30` l'unico giorno vuoto dentro una settimana piena.
