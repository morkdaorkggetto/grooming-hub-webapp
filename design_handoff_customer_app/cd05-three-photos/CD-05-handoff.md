# CD-05 · Handoff — le tre fotografie

**Da:** Claude Design · **A:** Cowork / Codex · **Data:** 31 agosto 2026
**Esito:** composizione. Non codice.
**Superfici:** `/u/pet/:id` (app clienti), scheda cane nel gestionale, `/client-card/:qrToken` (solo per la scelta di cosa mostra). **Nessuna rotta nuova.**
**Contratto «prima» misurato su:** `cd04-card-kit.jsx` e `gh15-ed-kit.jsx` — il ceppo consegnato.

**⚠ Questo giro chiede due colonne nuove.** È la prima volta in cinque. Vedi §8 — la decisione è vostra e la composizione non si regge senza.

---

## 1 · I file di composizione

| File | Cosa contiene |
|---|---|
| `cd05-foto-kit.jsx` | `Ph`, `DualMedallion`, `AlbumGesture`, `AlbumSheet`, `AttachSlot` |
| `cd05-foto-viste.jsx` | `PetOwner` (6 stati), `PetStaff` (2 stati) |
| `cd05-foto-note.jsx` | Le tavole: colonne, medaglione, album, le cinque domande, campi ⚠ |
| `CD-05 Le Tre Fotografie.html` | Il canvas |

**Dipendenze, tutte già consegnate:** `tokens.css`, `shared-ui.jsx`, `gh15-ed-kit.jsx`, `gh15-ed-riferimenti.jsx`, `cd01-cal-note.jsx` (solo `QRow`), `cd04-card-kit.jsx`.

`Ph` è un **segnaposto di composizione** (blocchi grigi etichettati) e non va portato in produzione: serve solo a distinguere le tre fotografie a vista.

---

## 2 · Colori — zero nuovi, zero token nuovi

Nessun colore nuovo e nessun token nuovo. In uso: `--color-primary`, `--color-bg-main`, `--color-surface-main`, `--color-border`, `--color-text-primary/-secondary`, `--gh-tint`, `--color-warning-text/-bg`, `--tier-*`.

Due `rgba` inline, entrambi già in uso da CD-04: `rgba(111,151,146,.30)` (anello del medaglione) e `rgba(43,37,37,.52)` (velo della sovrapposizione). I gradienti dentro `Ph` non contano: sono segnaposto, non design.

---

## 3 · Densità

Eredita CD-04 nell'app clienti (**nessun bersaglio sotto 54px**) e GH-15 al banco (**44px**). Aggiunge:

| Elemento | Valore |
|---|---:|
| Pastiglia del controcampo | 34% del medaglione (45px a 132, 35px a 104) |
| Foto d'album, griglia a due colonne | metà colonna, quadrata |
| Foto d'album, una sola | larghezza piena, quadrata |
| Riquadro «allega» nel gestionale | 44 (60 su telefono) |
| Miniature d'album al banco | 4 per 380px, sola lettura |

**La pastiglia è un bersaglio** (scambia le due foto): a 45px è sotto i 54 nominali, ma non è un'azione irreversibile — il gesto di ritorno è identico. Se volete la regola rigida, il medaglione va a 160 e la pastiglia a 54.

---

## 4 · Componenti

**Riusati senza toccarli:** `GH`, `Phone`, `Hero`, `HeroBtn`, `Btn`, `Panel`, `Eyebrow`, `Icon`, `RefCard`, `QRow`, `BigGesture`, `RelationLine`, `CardShell`, `SalonMark`.

**`Medallion` di CD-04: non toccato.** `DualMedallion` è un componente **nuovo e distinto**, non una sua estensione — `Medallion` resta in uso sulla card pubblica, dove il controcampo non deve esistere (§7.9).

**Nuovi — cinque:**

| Nome | Cosa fa |
|---|---|
| `Ph` | Segnaposto fotografia, tre tipi. **Non per la produzione** |
| `DualMedallion` | Il medaglione con il controcampo. Chi sta al centro è un parametro |
| `AlbumGesture` | Il pulsante album, con il testo che conta il contenuto |
| `AlbumSheet` | La galleria come foglio dal basso: griglia e foto aperta |
| `AttachSlot` | Il riquadro «allega», dentro la registrazione visita |

---

## 5 · Responsive

**App clienti:** regola di CD-04 invariata — il telefono è il caso normale, una colonna, massimo 390px. La sovrapposizione occupa l'88% dell'altezza e sale dal basso.

**Gestionale:** regola di GH-15 — due colonne `1fr / 380px` sopra 640px, una sotto. Le miniature d'album passano da 4 a 3 per riga sul telefono.

---

## 6 · Stati — otto, e i primi tre sono i probabili

**App clienti:**

| Stato | Cosa si vede |
|---|---|
| **Nessuna delle due foto, nessun album** — l'85% oggi | glifo al centro, **nessuna pastiglia, nessun invito** |
| **Solo la foto del salone** | quella al centro, nessuna pastiglia, **e l'invito arriva qui** |
| **Due foto** | ritratto al centro, riconoscimento in pastiglia, riga che lo spiega |
| **Album a una foto** | pulsante al singolare, foto a larghezza piena |
| **Album a due/quattro** | griglia a due colonne |
| **Foto aperta** | un gesto solo: «Salva o inoltra» |

**Gestionale:** riconoscimento al centro + ritratto in pastiglia; oppure riconoscimento solo, **medaglione identico** (nessuno spazio in attesa).

**Album vuoto:** non è uno stato vuoto della galleria — **il pulsante non esiste** (§7.4). La galleria non ha uno stato vuoto per costruzione.

**Caricamento / errore:** non composti. Le fotografie caricano progressivamente: serve un fondo `--gh-tint` sotto ogni riquadro, che è già la forma del segnaposto.

---

## 7 · Cosa NON cambia — deliberato

1. **`Medallion` di CD-04 non si ricompone.** `DualMedallion` aggiunge una pastiglia e nient'altro: cornice, anello, glifo restano quelli.
2. **Chi sta al centro dipende da chi guarda, e non è configurabile.** Al banco il riconoscimento, nell'app il ritratto. Non è una preferenza: è la stessa scheda letta da due persone che cercano cose diverse.
3. **Quando la seconda foto non c'è, la pastiglia non c'è.** Nessun cerchietto vuoto, nessun «+» in attesa.
4. **Album vuoto = nessun pulsante.** Una riga al suo posto («Dopo il prossimo bagno troverai qui la sua foto»). Un pulsante spento su 288 cani su 288 è la barra fedeltà di CD-04 da capo.
5. **Una foto sola non si mette in griglia.** Occupa la larghezza intera. Mai quattro caselle di cui due vuote.
6. **La galleria è una sovrapposizione, non una pagina.** Zero rotte nuove, e con una foto sola navigare costa più della cosa che si va a vedere.
7. **Nessun testo dei trattamenti sotto le foto.** Vincolo vostro, e lo sottoscrivo: il campo è un diario, non una didascalia.
8. **Un solo gesto per salvare/mandare**, che apre il menù del telefono. Non due verbi nostri, non un menù nostro.
9. **Nessuna pastiglia sulla card pubblica.** Il controcampo serve a chi ha un rapporto con le due foto, non a uno sconosciuto in tre secondi.
10. **L'album non compare mai sulla card pubblica — nemmeno il numero.** «4 foto» dice che esiste un album e invita a cercarlo.
11. **Il verbo del salone è «allega», mai «scatta».**
12. **Il posto è la registrazione della visita**, non una schermata sua.
13. **Facoltativo e senza sollecito.** Nessun «hai dimenticato la foto». Se allegare diventa un dovere, quello che si perde non è la foto — è la registrazione.
14. **L'invito al proprietario arriva solo dopo la prima foto del salone.** Chiedere prima di aver dato è la regola di CD-04.
15. **L'album al banco è in sola lettura e in piccolo.** Non serve a lavorare: sta lì solo perché il salone sappia cosa vede il proprietario.

---

## 8 · Campi — due che NON esistono, e lo so

Le prime due voci sono di natura diversa dalle altre: **non sono campi che potrebbero non esistere. Non esistono.**

| Campo | Cosa serviva |
|---|---|
| ⚠ **`pets.owner_photo_url`** | la colonna del ritratto. **Senza, la composizione non si regge** |
| ⚠ **`visits.photo_url`** | la foto d'album, una per lavorazione |
| ⚠ una sola foto per visita? | compongo per una. Se il salone ne allega tre, «le ultime quattro» diventano una visita sola |
| ⚠ canale di upload dal cliente | esisteva un meccanismo prima della revoca del permesso? |
| ⚠ provenienza delle 42 foto | le assumo tutte del salone. È un'assunzione, non una misura |
| ⚠ `MIN(visits.date)` | ereditato da CD-04 |

`pets.photo_url` **resta e diventa esplicitamente del salone**: non per anzianità, ma perché è l'unica delle tre già popolata. Il permesso di modifica tolto al cliente **non va ripristinato: va spostato** sulla colonna sua.

---

## 9 · Domande aperte

**9.1 · Le due colonne si aprono?**
Se no, la scelta onesta non è arbitrare: è **dire al cliente che la foto la mette il salone, e togliere l'invito**. Un permesso che si può revocare è peggio di un permesso che non c'è.

**9.2 · Una foto per lavorazione, o più?**
Compongo per una: una foto per bagno è un ritmo, quattro foto di un bagno sono un servizio fotografico che a fine serata nessuno farà.

**9.3 · Le 42 foto sono tutte del salone?**
Se qualcuna fosse stata messa da un proprietario prima della revoca, quel cane si ritrova la foto del proprietario al centro della scheda al banco. Pochi casi, ma **vanno guardati a mano**.

**9.4 · La foto allegata si può togliere o sostituire?**
Non composto. Serve almeno la rimozione, e sta **nella visita registrata**, non nell'album del cliente: una foto sbagliata a fine serata è un caso normale.

**9.5 · Il proprietario può togliere una foto dal suo album?**
Non composto, e non so la risposta giusta. Nascondere solo per sé è la più gentile; cancellare toglie una cosa al salone. Ma qualcuno lo chiederà.

---

## 10 · Le parole

**«Galleria» / «Album fotografico» → «Le foto di {nome}».** Nessuno chiama «galleria» quattro foto del proprio cane. Al singolare quando è una: **«La foto di Nina»**.

**Sottotitolo del pulsante: «dall'ultima lavorazione» / «le ultime N lavorazioni».** Il pulsante conta il contenuto, non la funzione.

**Titolo della galleria: «dopo il bagno» + «{nome} da noi»** — o «{nome}, l'ultima volta» quando è una sola.

**Ogni foto: la data della lavorazione + la distanza in parole** («18 agosto» / «due settimane fa»). La data dice quando, la distanza dice quanto tempo è passato — ed è la seconda quella che una persona sente.

**«Salva o inoltra»**, sottotitolo «si apre il menù del telefono». Un pulsante che apre un menù di sistema senza preavviso sembra un errore.

**La riga sulla pastiglia, nell'app:** «La foto piccola è quella che usiamo noi al banco per riconoscerlo. Toccala per scambiarle.» Detta così, **una foto sgraziata diventa un segno di mestiere** invece di una foto brutta.

**L'invito:** «Questa è la foto che facciamo noi, per riconoscerlo. Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto.» Tre cose che un invito normale non fa: spiega perché la foto è quella che è, chiede di **aggiungere** e non di sostituire, e **promette che la nostra non sparisce** — la paura simmetrica a quella del salone.

**«Allega una foto dalla galleria»**, sottotitolo «quella che avete già mandato su WhatsApp». Il verbo e la sorgente nella stessa riga.

Tutte reversibili in una stringa.

---

## Verifiche fatte prima di consegnare

- Console pulita, tutti i token risolvono. **Zero token nuovi: verificato, non asserito.**
- `Medallion` e `CardShell` di CD-04 verificati intatti.
- **Difetto trovato e corretto, il più serio dei cinque giri:** l'artboard del caso più comune — l'85% dei cani — mostrava esattamente la configurazione che la mia stessa tavola argomenta contro: glifo al centro con la foto del salone degradata a pastiglia, più un invito e la didascalia «toccala per scambiarle» in presenza di una foto sola. Ora `ow-0` è il vuoto vero (glifo, nessuna pastiglia, nessun invito) e `ow-sb` è «solo foto del salone»: foto al centro, e **lì** arriva l'invito — la regola che avevo scritto in §7.14 e non applicato.
- Le etichette dei segnaposto si tagliavano dentro le pastiglie da 34px: ora si sopprimono sotto la soglia.
