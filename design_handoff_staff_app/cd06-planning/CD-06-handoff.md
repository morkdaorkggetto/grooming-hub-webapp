# CD-06 · Handoff — la settimana di Roby

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 31 agosto 2026
**Esito:** composizione. Non codice.
**Superficie:** `/calendar`. **Nessuna rotta nuova.**
**Contratto «prima» misurato su:** `gh15-ed-kit.jsx` e `cd01-cal-kit.jsx` — il ceppo consegnato.

---

## 1 · I file di composizione

| File | Cosa contiene |
|---|---|
| `cd06-planning-kit.jsx` | `CAP`, `PlanSwitch`, `ApptChip`, `ReqChip`, `Margine`, `SenzaOra`, `Vuoto`, `DayHead`, `Fascia` |
| `cd06-planning-viste.jsx` | Le tre settimane (tipo, vuota, piena), telefono, modo giorno |
| `cd06-planning-note.jsx` | Le tavole: grana, occupazione senza ora, margine, forma, campi ⚠ |
| `CD-06 La Settimana Di Roby.html` | Il canvas |

**Dipendenze:** `tokens.css`, `shared-ui.jsx`, `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`, `cd01-cal-note.jsx` (solo `QRow`).

### ⚠ Due modifiche retroattive a file già consegnati

**`gh15-ed-kit.jsx` — `STATES` passa da 6 a 8 voci.** Il commento diceva «vocabolario unico, 7 voci» e ne conteneva sei: **`completato` e `annullato` non esistevano**, pur essendo due delle etichette che la vostra tabella tiene esplicitamente. Aggiunte entrambe; `annullato` è neutro (`--color-text-secondary` su `--color-surface-soft`), non danger — è un fatto, non un allarme.

**`gh15-ed-kit.jsx` — `StateTag` ha una guardia.** Leggeva `STATES[s][0]` senza controllo, quindi **una chiave sbagliata azzerava l'intero documento** (è successo: pagina bianca, quattro errori in console). Ora una chiave sconosciuta degrada a un'etichetta neutra. Il componente è condiviso da GH-15, CD-01 e CD-06: la rete vale per tutti.

**`shared-ui.jsx` — due icone nuove:** `chevron-left`, `arrow-left`. La direzione vive nell'icona come da vincolo: nessuna rotazione locale nei fogli di stile.

**Se Codex ha già gli zip GH-15 o CD-01, quei due file vanno sostituiti** con le copie di questa consegna.

---

## 2 · Colori — nessuno nuovo

Nessun colore nuovo, nessun token nuovo. In uso: `--color-primary`, `--color-warning-text/-bg/-border`, `--color-danger-text/-bg`, `--color-success-*`, `--color-text-primary/-secondary`, `--color-surface-main/-soft`, `--color-border`, `--gh-tint`, `--gh-bar`, `--gh-absent`.

**Nota sul riuso di `--gh-absent`:** è il terzo giro che lo uso per la stessa cosa — righe di assenza in CD-02, settimane ferme in CD-03, piede «entrati senza appuntamento» qui. **È diventato il colore di «è successo, ma non sappiamo quando».** Vale la pena saperlo: è un significato, non solo un valore.

---

## 3 · Densità

Eredita GH-15: **44px al banco, 60px sotto i 640**. Nuovi elementi:

| Elemento | Banco | Telefono |
|---|---:|---:|
| Riquadro appuntamento / richiesta | 44 | 60 |
| Margine | 38 | 38 |
| Piede «senza appuntamento» | 36 | 44 |
| Vuoto «prenota qui» | 38 | *assente* |
| Interruttore modo | 34 | 46 |
| Navigatore | 34 | 46 |

**Margine e piede non sono bersagli** — sono letture, non azioni: 38 e 36 sono legittimi. Tutto ciò che si tocca sta a 44 o sopra.

---

## 4 · Componenti

**Riusati senza toccarli:** `GH`, `Hero`, `HeroBtn`, `Btn`, `Panel`, `Eyebrow`, `Phone`, `Notice`, `StateTag`, `STATES`, `Icon`, `RefCard`, `QRow`, `TouchCtx`/`useTouch`.

**Nuovi — nove:**

| Nome | Cosa fa |
|---|---|
| `CAP` | I parametri del salone. **Nessun numero scritto a mano** |
| `PlanSwitch` | Interruttore Settimana / Giorno |
| `ApptChip` | Appuntamento: **l'ora è la prima cosa** |
| `ReqChip` | Richiesta: capsula tratteggiata con la fascia, non un'ora |
| `Margine` | Lo spazio tenuto per chi entra. Due registri: tenuto, e stretto |
| `SenzaOra` | Il piede: pallini + conteggio, nessuna posizione oraria |
| `Vuoto` | «prenota qui» — apre il modulo, non crea niente |
| `DayHead` | Testa di colonna: giorno, e «oggi» |
| `Fascia` | La mezza giornata: il contenitore di tutto il resto |

`CalFascia` e gli altri componenti di `cd01-cal-kit.jsx` **non sono stati riusati**: quella era una lista per giorno, questa è una griglia per settimana. La grammatica dei tre oggetti è la stessa, i componenti no.

---

## 5 · Responsive — un punto di rottura, 640px, e la forma cambia

**Sopra 640px** (il caso normale): sette colonne uguali, ognuna con testa, due fasce, piede. La legenda dei quattro oggetti sta sotto la griglia.

**Sotto 640px** (il ripiego): **la settimana si ribalta.** Il giorno diventa una scheda, la settimana scorre in verticale. Sette colonne su 390px darebbero colonne da 50px, e in 50px non ci sta un nome proprio — stessa misura che in CD-01 aveva fatto scegliere un giorno alla volta. Qui un giorno alla volta non basta, perché lo scopo *è* vedere la settimana: si perde il colpo d'occhio, si tiene l'ordine.

**⚠ Vincolo di implementazione, imparato correggendo:** le schede giorno devono avere `flex-shrink: 0` e il contenitore `min-height: 0`. Con i valori di default le schede assorbono il deficit di altezza **restringendosi in silenzio**, e la prima cosa che spariva era il piede «entrati senza appuntamento» — cioè la risposta alla domanda più difficile del brief, invisibile proprio nel formato di ripiego.

---

## 6 · Stati

**I tre oggetti** (che sono tipi, non stati — §7.2):

| Oggetto | Forma | Certezza |
|---|---|---|
| Appuntamento | riquadro pieno, bordo sinistro primary, **ora in serif tabulare** | data e ora |
| Richiesta | riquadro tratteggiato warning, **capsula con la fascia** | giorno + fascia |
| Lavorazione registrata | **pallini nel piede**, nessun riquadro | solo il giorno |

**Etichette del cane** (`blacklist`, `rischio`) e **dell'appuntamento** (`completato`, `annullato`, `noshow`): sull'appuntamento, non sulla colonna — sono del cane o del fatto, non del giorno. `confermato` non si stampa: è il default di un appuntamento in griglia.

**Vuoto — due, distinti:**
1. **Settimana futura bianca** — `Notice` in testa che dice che è la condizione normale quando si guarda avanti, **e la griglia resta tutta**. Non un `EmptyState`: una settimana vuota deve somigliare a una settimana.
2. **Fascia senza niente** — il margine e il «prenota qui». Non c'è uno stato vuoto della fascia: c'è lo spazio tenuto.

**Giorno chiuso:** fondo `--gh-absent`, «chiuso» in corsivo, nessuna fascia. **Lunedì mattina** è una fascia chiusa dentro un giorno aperto — caso reale del salone, e la griglia lo regge.

**Caricamento:** `SkeletonRow` non serve — la griglia ha una forma sua. Sette colonne con teste vere e fasce in `--gh-tint` bastano.

**Errore:** `ErrorState` di GH-15.

---

## 7 · Cosa NON cambia — deliberato

1. **La grana è la mezza giornata.** Non ore. Una griglia oraria sarebbe vuota per l'80% e direbbe a vista «sei quasi fermo» — falso, e demoralizzante. Non è una semplificazione provvisoria.
2. **Le tre forme restano tre.** Non unificarle: la capsula tratteggiata promette «da qualche parte qui dentro» — vero su una richiesta, **falso** su una lavorazione registrata.
3. **Le lavorazioni senza ora stanno nel piede, mai in una fascia.** Nemmeno a occhio, nemmeno da `created_at`. `visits.date` è di tipo `date`: la colonna resta muta.
4. **Il margine non è un posto libero: è un posto tenuto.** Non toglierlo quando la settimana è vuota — è lì che serve di più.
5. **Il margine non blocca.** Quando finisce cambia registro e avvisa; Roby prenota comunque, e a volte deve. Un avviso che blocca al banco, con una persona davanti, viene aggirato entro una settimana.
6. **«Prenota qui» apre il modulo esistente, non crea l'appuntamento.** Precompila giorno, fascia e un'ora proposta. Il cliente resta da scegliere — ed è lì che vivono i controlli su blacklist e affidabilità.
7. **In settimana il vuoto non dice l'ora, nel modo giorno sì.** In una fascia da quattro ore l'ora proposta cambia a ogni prenotazione, e il pulsante mentirebbe.
8. **Settimana e giorno sono due modi, non due pagine.** Stesso interruttore e stessa posizione di CD-03: in testa al navigatore, prima delle frecce.
9. **Passando di modo resta la data.** Toccare la testa di una colonna porta al modo giorno su quel giorno.
10. **Sul telefono la settimana si ribalta, non si rimpicciolisce.**
11. **⚠ Sul telefono la fascia non porta il «prenota qui».** Non è solo un recupero di 176px: il telefono è il ripiego per **leggere** la settimana, e prenotare avviene al banco dove c'è il computer. Se lo rimettete, il piede torna a sparire.
12. **«Imminente» non c'è**, come deciso. Il preavviso vive sulla **richiesta**, non qui.
13. **Nessun numero di capienza scritto in composizione.** Tutto da `tenants.settings`.
14. **Le postazioni non hanno nomi.** Vedi §9.3.

---

## 8 · Campi da verificare — 7 marcati ⚠

| Campo | Cosa serviva |
|---|---|
| ⚠ `tenants.settings.postazioni` | **esiste** (2 → 3 stamattina). Nessun numero a mano |
| ⚠ orari e chiusure per fascia | domenica e lunedì mattina sono dichiarati: **dove?** La griglia li legge, non li assume |
| ⚠ `appointments.time` | l'ora precisa. **Se non esistesse, l'oggetto «appuntamento» cade su una fascia** e la griglia ha due oggetti, non tre |
| ⚠ durata dell'appuntamento | 45 / 90: è un campo, o si deduce dal servizio? |
| ⚠ servizio strutturato sull'appuntamento | serve per proporre l'ora libera |
| ⚠ **entrati di solito per fascia** | il secondo numero del margine. **È storico e va calcolato: non è una colonna.** Vedi §9.1 |
| ⚠ `requests.created_at` | il preavviso: da confermare che sia un istante e non una data |

Dati per certi perché misurati da voi: mediana 5 cani/giorno, nono decile 10, record 14, durate 45/90, orari 9–13 e 13–19, chiusure domenica e lunedì mattina, 3 postazioni, 7 appuntamenti futuri.

---

## 9 · Domande aperte

**9.1 · «Entrati di solito in questa fascia» si può calcolare? — ed è il buco della mia idea.**
Serve l'ora, e l'ora non c'è: si può contare per giorno, non per fascia. Ripiego onesto: **margine calcolato sul giorno e diviso fra le due fasce in proporzione agli orari, dichiarato come stima**. Se non vi convince, resta «postazioni meno prenotati» — più povero, ma vero. **Quello che non va fatto è riempirlo con un 2 scritto a mano.**

**9.2 · Roby può prenotare oltre il margine?**
Nella composizione sì, sempre, con l'avviso. Vedi §7.5.

**9.3 · Le tre postazioni sono intercambiabili?**
Non le distinguo: il vincolo dichiarato è la capienza, non la persona. **Ma se un taglio lo fa solo Davide, «tre postazioni» è un numero che mente** e la vista va rifatta con le persone dentro.

**9.4 · Una lavorazione registrata su un giorno che aveva un appuntamento: sono la stessa cosa?**
Rimasta aperta da CD-01, e **qui pesa il doppio**: la colonna mostra 1 appuntamento e 4 entrati — se uno dei quattro era l'appuntamento, la giornata sembra più piena di com'è stata.

**9.5 · Serve vedere due settimane insieme?**
Non composto, ma è la richiesta che arriverà per prima dopo questa — Roby colloca guardando avanti, e il confine di settimana è arbitrario. La forma a mezze giornate la regge: quattordici colonne strette no, **due righe da sette sì**.

---

## 10 · Le parole

**Titolo: «Dove lo metto».** Non «Planning», non «Calendario settimanale», non «Vista sinottica». È la domanda che Roby si fa al banco, ed è la domanda che questa pagina risponde. Sottotitolo: «La settimana a colpo d'occhio, per collocare chi arriva al banco».

**«Tenuto per chi entra ×2».** Non «disponibilità residua», non «slot liberi». Dice **per chi** è quello spazio, e è la ragione per cui il margine funziona come idea: uno spazio con un destinatario non si riempie per distrazione.

**«Poco spazio per chi entra»** quando il margine è esaurito. Non «capienza superata»: non è un errore, è una conseguenza.

**«4 entrati senza appuntamento».** Non «4 visite non pianificate», non «walk-in». È come lo direbbero, e nomina il fatto: sono entrati.

**«Registrato a fine serata»** nel modo giorno, accanto ai nomi. Dice perché non c'è un'ora, senza scusarsi.

**«Da confermare»** sulla richiesta. **«Preavviso 14 ore»** sulla richiesta, mai sull'appuntamento.

**«Chiuso»** in corsivo, minuscolo. Un giorno chiuso non è un avviso.

Tutte reversibili in una stringa.

---

## Verifiche fatte prima di consegnare

- Console pulita, **37 proprietà personalizzate risolvono, zero `var(--*)` non risolte**.
- **Difetto grave trovato e corretto: pagina bianca.** `StateTag s="annullato"` su una chiave inesistente azzerava l'intero documento. Ha portato alle due modifiche di §1 — la seconda (la guardia) protegge anche GH-15 e CD-01.
- **Tre tagli corretti**, di cui uno significativo: sul telefono il piede «entrati senza appuntamento» spariva da ogni scheda. Causa non pixel: le schede assorbivano il deficit di altezza restringendosi in silenzio. Risolto alla radice riducendo il budget di contenuto — vedi §5 e §7.11.
- Le tre settimane sono coerenti con le misure: la tipo sta sotto la mediana, la piena tocca il nono decile su due giorni, la futura è bianca.
