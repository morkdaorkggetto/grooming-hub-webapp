# CD-13 · Handoff — come si leggono le fasce

**Da:** chat UI (chi compone) · **A:** regia / Codex · **Data:** 11 novembre 2026
**Esito:** composizione, non codice. Nessun file del repository è stato modificato.
**Tavola Design:** «CD-13 · Come si leggono le fasce» — https://claude.ai/artifact/CMnCn3m55oMnHGJKiL5Gph (privata, versione `1794377406-2868`).

**Base letta**

| Che cosa | Valore |
|---|---|
| incarico `CD-13-come-si-leggono-le-fasce.md` | MD5 `bc5ba63ab8f50e2410e564cfaa5ad55a` — coincide |
| canone | versione **1.3**, `~/Desktop/_metodo/CANONE.md`, MD5 `be5f2d64efa553ec5d34a194c71418b6` |
| commit su cui ho misurato | `131d735`, ramo `main` |

Impronte MD5 rimisurate da me alle 07:02 dell'11/11: **otto su otto coincidono** con l'incarico.

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

---

## 0 · La forma della consegna è cambiata

Da questa consegna **la tela è un artifact di tipo Design**, non più un file HTML che monta kit `.jsx`. Decisione di regia dell'11/11. Il kit sono le tavole stesse (`project/*.dc.html`, markup statico con gli stili scritti sugli elementi) più i valori di questo handoff. Codice da riusare non ce n'è: Codex costruisce dai valori del §4 e dai testi del §3.

---

## 1 · I file

| File | Che cosa contiene |
|---|---|
| `CD-13-handoff.md` | questo documento |
| `project/Main.dc.html` | prenotazione, passo 3, un lunedì (375 × 656) |
| `project/Riquadro.dc.html` | riquadro «Scegli un'altra data», un giovedì con il pomeriggio scelto (375 × 804) |
| `project/Stati-prenotazione.dc.html` | i sette stati, colonne da 111,7 (375 × 1202) |
| `project/Stati-riquadro.dc.html` | i sette stati, colonne da 95,7 (375 × 1283) |
| `project/Prima-dopo.dc.html` | oggi e dopo, un lunedì, nei due posti (790 × 436) |
| `project/canvas.json` | l'indice della tela |
| `project/ds/groominghub/tokens.json` | copia del design system (sha256 `c1754de34f3ff396…`, lo stesso dell'artifact) |
| `project/ds/groominghub/tokens.css` | le variabili CSS, compilate da `tokens.json` (vedi «Cosa non torna», 13) |
| `misure/` | `genera.py` (scrive le tavole), `misura.py` (le rende e le misura), `misure-tavole.json` (tutti i numeri), il banco di prova delle etichette di oggi, cinque catture. I due script hanno dentro i percorsi del mio ambiente: sono la traccia di come ho misurato, non uno strumento pronto da rilanciare |

Nelle due tavole di contesto il calendario, i testi intorno e i tre pulsanti del riquadro sono ridisegnati dal codice di `GH-116` solo per mostrare dove stanno le fasce: **non sono oggetto di questa consegna**.

---

## 2 · La proposta, in cinque risposte

1. **Le tre fasce aperte: due righe per pulsante.** Sopra il nome, sotto l'orario. Gli orari **restano nel pulsante**, su una seconda riga loro: è l'unico punto in cui il cliente li impara, e le cinque frasi dopo li citano. Oggi l'a capo lo decide il carattere: «Pomeriggio (13–19)» si spezza in «Pomeriggio (13–» / «19)» a 111,7 e in «Pomeriggio» / «(13–19)» a 95,7. Dopo, l'a capo è nel markup e non dipende più dalla larghezza.
2. **La fascia chiusa: si dice due volte, non tre.** Una volta come **regola**, nella legenda del calendario («lun solo pomeriggio», già composta dai dati, non toccata). Una volta come **stato**, nel pulsante: la seconda riga dice «chiusa» / «chiuso» **al posto dell'orario**. «Non disponibile» sparisce: sa di posto già preso, e la pagina non deve sembrare un sistema di posti liberi. La frase fissa sotto le fasce sparisce.
3. **La frase sotto le fasce resta per un solo caso:** quando il cliente aveva scelto una fascia e, cambiando giorno, la scelta è stata tolta. Lì qualcosa è successo senza un suo gesto, e va detto.
4. **«Per me è uguale» non cambia mai:** stesso testo, nessuna riga che la spiega, anche accanto a una fascia chiusa. Resta vera: il salone sceglie in ciò che è aperto.
5. **Il titolo va in tutti e due i posti, e dice che è facoltativo:** «Mattina o pomeriggio? (facoltativo)». Nel riquadro oggi manca; e nella prenotazione il titolo senza «(facoltativo)» si legge come una domanda obbligata, mentre la richiesta parte anche senza fascia. La forma «(facoltativo)» è già nella stessa pagina, al passo 4.

Per le frasi (§3, righe F1–F5): **l'etichetta lunga non cambia.** Il pulsante smette di usarla e compone le sue due righe dagli stessi dati. Così il gestionale non si muove (§7).

---

## 3 · Prima → dopo — i testi esatti

### Pulsanti, titolo e righe intorno

| Dove | Oggi | Dopo |
|---|---|---|
| titolo, prenotazione | «Mattina o pomeriggio?» | «Mattina o pomeriggio? (facoltativo)» |
| titolo, riquadro | — (non c'è) | «Mattina o pomeriggio? (facoltativo)» |
| pulsante mattina, aperta | «Mattina (9–13)» | riga 1 «Mattina» · riga 2 «9–13» |
| pulsante pomeriggio, aperta | «Pomeriggio (13–19)» | riga 1 «Pomeriggio» · riga 2 «13–19» |
| pulsante «Per me è uguale» | «Per me è uguale» | riga 1 «Per me» · riga 2 «è uguale» (stesso testo, a capo fisso) |
| dentro la mattina chiusa | «Mattina (9–13)» + «NON DISPONIBILE» | riga 1 «Mattina» · riga 2 «chiusa» |
| dentro il pomeriggio chiuso | «Pomeriggio (13–19)» + «NON DISPONIBILE» | riga 1 «Pomeriggio» · riga 2 «chiuso» |
| sotto le fasce, giorno con fascia chiusa | «Mattina chiusa. Per quel giorno scegli un'altra preferenza.» | — (tolta) |
| sotto le fasce, **solo** se una scelta è stata tolta | — | «Mattina chiusa in quel giorno: abbiamo tolto la tua preferenza. Scegline un'altra, o lascia così.» (con il pomeriggio: «Pomeriggio chiuso in quel giorno: …») |
| sotto le fasce, prenotazione | «L'orario preciso lo concordiamo noi su WhatsApp.» | invariata |
| legenda del calendario | «dom chiuso · lun solo pomeriggio» | invariata (è di `GH-116`) |

### Le cinque frasi del cliente

Esempi con giovedì 19 novembre; «uguale» = il cliente ha scelto «Per me è uguale»; «assente» = nessuna fascia.

| # | Dove | Oggi | Dopo |
|---|---|---|---|
| F1 | `Book.jsx` 160, riepilogo dopo l'invio | «Preferenza · Mattina (9–13)» · uguale: «Per me è uguale» · assente: «Nessuna preferenza» | **invariata**, tutte e tre |
| F2 | `Book.jsx` 141, messaggio WhatsApp | «… Preferenza oraria: Mattina (9–13). …» · uguale: «Preferenza oraria: Per me è uguale.» · assente: la frase non c'è | **invariata**, tutte e tre |
| F3 | `PendingRequest.jsx` 158 | «Luna · Bagno · Mattina (9–13)» · uguale: «Luna · Bagno · **Nessuna preferenza**» · assente: «Luna · Bagno · Nessuna preferenza» | «Luna · Bagno · Mattina (9–13)» · uguale: «Luna · Bagno · **Per me è uguale**» · assente: «Luna · Bagno · Nessuna preferenza» |
| F4 | `PendingRequest.jsx` 183 | «Hai indicato giovedì 19 novembre, **M**attina (9–13). Ora tocca al salone proporti un'alternativa.» · uguale: «…, senza preferenza oraria. …» · assente: «Hai indicato giovedì 19 novembre. …» | «Hai indicato giovedì 19 novembre, **m**attina (9–13). Ora tocca al salone proporti un'alternativa.» · uguale e assente: invariate |
| F5 | `PendingRequest.jsx` 30, alternativa senza ora (testo del pulsante e di «Hai scelto …», riga 182) | «giovedì 19 novembre, **M**attina (9–13)» · uguale: «giovedì 19 novembre, Per me è uguale» · assente: «giovedì 19 novembre, » | «giovedì 19 novembre, **m**attina (9–13)» · uguale: «giovedì 19 novembre, mattina o pomeriggio» · assente: «giovedì 19 novembre» |

Tre cambi, tutti piccoli: in F3 chi ha detto «Per me è uguale» rilegge quello che ha detto (oggi F1 e F3 gli rispondono in due modi diversi); in F4 e F5 l'iniziale è minuscola perché la fascia sta dentro una frase; in F5 l'alternativa è proposta dal salone, e «Per me è uguale» è la voce del cliente.

---

## 4 · I valori

### La riga delle fasce

| Elemento | Valore |
|---|---|
| griglia | 3 colonne `minmax(0, 1fr)`, gap **8** — come `GH-116` |
| pulsante | altezza minima **54**, raggio **12**, padding **6 4**, bordo 1px — come `GH-116` |
| dentro il pulsante | colonna, centrata nei due sensi, gap **2** fra le due righe |
| riga 1, il nome | **12,5px / 16px**, peso **600**; **700** se la fascia è scelta |
| riga 2, l'orario | **11,5px / 14px**, peso **500**, cifre tabulari, `var(--color-text-primary)` |
| riga 2, lo stato | **11,5px / 14px**, peso **600**, `var(--color-warning-text)` |
| «Per me è uguale» | due righe di nome (12,5 / 16, peso 600), a capo fisso dopo «Per me» |

| Stato | Bordo | Fondo | Testo riga 1 | Altro |
|---|---|---|---|---|
| aperta | 1px `var(--color-border)` | `var(--color-surface-main)` | `var(--color-text-primary)` | — |
| scelta | **2px `var(--color-primary-hover)`** | `var(--gh-tint)` | `var(--color-text-primary)`, peso 700 | padding **5 3**, così il contenuto non si sposta di 1px |
| chiusa | 1px tratteggiato `var(--color-border)` | `var(--color-surface-soft)` | `var(--color-text-secondary)` | `disabled`; riga 2 in `var(--color-warning-text)` |

### Intorno

| Elemento | Valore |
|---|---|
| titolo | **13px / 18px**, peso **700**, `var(--color-text-primary)`; margine sotto **8** |
| frase «abbiamo tolto la tua preferenza» | **12px / 17px**, peso **600**, `var(--color-warning-text)`, margine sopra **8**, `role="status"` |
| prenotazione | titolo a 10 dalla riga «Hai scelto …»; riga «L'orario preciso…» a 7 sotto le fasce — come oggi |
| riquadro | titolo e fasce sono **un blocco solo** dentro la colonna a gap 10; il titolo sta a 8 dalle fasce |

---

## 5 · La matrice degli stati

Vale identica nei due posti: cambiano solo le larghezze (§6). Tavole `Stati-prenotazione` e `Stati-riquadro`.

| # | Stato | Mattina | Pomeriggio | Per me è uguale | Frase sotto |
|---|---|---|---|---|---|
| 1 | nessun giorno scelto | aperta · «9–13» | aperta · «13–19» | aperta | — |
| 2 | giorno con tutte le fasce aperte | aperta · «9–13» | aperta · «13–19» | aperta | — |
| 3 | giorno con la mattina chiusa | **chiusa · «chiusa»** | aperta · «13–19» | aperta | — |
| 4 | giorno con il pomeriggio chiuso | aperta · «9–13» | **chiusa · «chiuso»** | aperta | — |
| 5 | una fascia scelta (pomeriggio) | aperta | **scelta** | aperta | — |
| 6 | «Per me è uguale» scelta, di lunedì | chiusa · «chiusa» | aperta · «13–19» | **scelta** | — |
| 7 | fascia scelta che si spegne cambiando giorno | chiusa · «chiusa» | aperta · «13–19» | aperta | «Mattina chiusa in quel giorno: abbiamo tolto la tua preferenza. Scegline un'altra, o lascia così.» |

Il caso 4 è di prova: oggi nel salone nessun pomeriggio è chiuso. La frase del caso 7 sparisce alla prima scelta successiva, di fascia o di giorno.

---

## 6 · Le misure — prese sul rendering

Rese in Chrome senza interfaccia, dai file `.dc.html` consegnati, con due caratteri: **Inter** (il carattere di sistema del mio ambiente) e **Roboto** (quello di Android, caricato da Google Fonts). San Francisco, cioè l'iPhone, non l'ho potuto misurare (vedi «Cosa non torna», 3).

### Dopo

| | Prenotazione | Riquadro |
|---|---:|---:|
| larghezza della riga | 351 | 303 |
| larghezza delle colonne | 111,66 · 111,67 · 111,66 | 95,66 · 95,67 · 95,66 |
| larghezza utile al testo (aperta, chiusa e scelta) | **101,67** | **85,67** |
| righe di testo per pulsante | 2 · 2 · 2 | 2 · 2 · 2 |
| altezza dei pulsanti, in tutti e sette gli stati | **54** | **54** |
| il testo più largo: «Pomeriggio» a peso 700 | 69,94 (Inter) · 65,16 (Roboto) | gli stessi |
| margine che resta al testo più largo | 31,7 | **15,7** |
| qualcosa esce dal pulsante | no | no |
| titolo | 1 riga · 222,61 (Inter) · 206,38 (Roboto) | 1 riga, gli stessi |
| frase del caso 7 | 2 righe, alta 34 | 2 righe, alta 34 |
| blocco titolo + fasce | 80; con la frase 122 | 80; con la frase 122 |

Le altre larghezze, 12,5px peso 600 o 11,5px: «Mattina» 45,25 / 43 · «Pomeriggio» 69,11 / 64,89 · «Per me» 42,13 / 39,86 · «è uguale» 51,52 / 47,59 · «9–13» 24,98 / 27 · «13–19» 29,75 / 33,53 · «chiusa» 36,72 / 33,92 · «chiuso» 37,13 / 34,25 (Inter / Roboto).

### Oggi — misurato come chiedeva l'incarico

Ricostruito dal CSS di oggi (`Book.css` 169–204, `DesiredDateStrip.css` 19–21), tavola `Prima-dopo` e banco `misure/oggi-*.html`.

| Etichetta | A 111,7 (utile 101,7) | A 95,7 (utile 85,7) |
|---|---|---|
| «Mattina (9–13)» — larga 85,2 / 84,22 | 1 riga | 1 riga, con 0,5–1,5px di margine |
| «Pomeriggio (13–19)» — larga 114,36 / 113,25 | **2 righe**; in Inter si spezza dentro l'orario: «Pomeriggio (13–» / «19)» | 2 righe: «Pomeriggio» / «(13–19)» |
| «Per me è uguale» — larga 96,78 / 90,55 | 1 riga | **2 righe**: «Per me è» / «uguale» |
| altezza della riga | 54 | 54 |
| con il pomeriggio chiuso | la riga sale a **55,89** | la riga sale a **55,89** |

Nessuna etichetta di oggi esce dal pulsante. Dove cade l'a capo in Roboto a 111,7 non l'ho guardato: so solo che le righe sono 2.

### Il giorno dentro il pulsante — perché non c'è

| Testo, 11,5px peso 600 | Inter | Roboto | Utile nel riquadro |
|---|---:|---:|---:|
| «chiusa il lunedì» | 82,61 | 77,17 | 85,67 |
| «chiuso il mercoledì» | 104,09 | 97,38 | 85,67 |
| «chiuso la domenica» | 107,33 | 99,88 | 85,67 |

«chiusa il lunedì» entra, ma solo perché è lunedì. Con il giorno come variabile due casi su tre escono, anche nella prenotazione (utile 101,67).

---

## 7 · Il gestionale

**La proposta lo lascia com'è.** `BOOKING_TIME_PREFERENCES[].label` («Mattina (9–13)»), `BOOKING_TIME_WINDOWS[].name` e `closedLabel` non cambiano: le righe 6–8 dell'incarico e gli usi in `CalendarKit.jsx`, `whatsapp.js`, `openPetBookings.js` e `Calendar.jsx` leggono gli stessi valori di oggi. Non ho letto `CustomerRequests.jsx`: ne ho misurato solo l'impronta.

---

## 8 · I token usati

| Variabile | Dove |
|---|---|
| `--color-text-primary` | nome e orario delle fasce, titolo |
| `--color-text-secondary` | nome della fascia chiusa |
| `--color-warning-text` | «chiusa» / «chiuso», frase del caso 7 |
| `--color-border` | bordo della fascia aperta e chiusa |
| `--color-primary-hover` | bordo della fascia scelta |
| `--color-surface-main` | fondo della fascia aperta |
| `--color-surface-soft` | fondo della fascia chiusa |
| `--gh-tint` | fondo della fascia scelta |
| `--font-sans` | tutto il testo delle fasce |

Solo nel contesto ridisegnato (calendario, scheda, pulsanti del riquadro): `--color-bg-main`, `--color-primary`, `--gh-border-35`, `--font-serif`, `--r-md`, `--r-lg`, `--shadow-sm`.

Nei cinque file `.dc.html` non c'è nessun esadecimale e nessun `rgb()`: contati, zero.

**Contrasti**, calcolati dagli esadecimali del design system:

| Coppia | Rapporto |
|---|---:|
| `--color-text-primary` su `--color-surface-main` | 14,04 |
| `--color-warning-text` su `--color-surface-soft` | 4,94 |
| `--color-warning-text` su `--color-bg-main` / `--color-surface-main` | 4,94 / 5,38 |
| `--color-text-secondary` su `--color-surface-soft` | **4,06** |
| `--color-primary-hover` su `--color-bg-main` / `--color-surface-main` | 3,49 / 3,81 |
| `--color-primary` su `--color-bg-main` / `--color-surface-main` | **2,75** / 3,00 |
| `--color-border` su `--color-bg-main` / `--color-surface-main` | **1,49** / **1,62** |

---

## 9 · Le cinque domande del canone, sull'intreccio fra giorno e fascia

1. **Il verbo mantiene la promessa?** «Per me è uguale» di lunedì promette «l'una o l'altra» quando di fatto resta solo il pomeriggio: resta vera, non promette la mattina. «(facoltativo)» promette che si può non scegliere: il codice lo mantiene (`Book.jsx` 246–254). Non mantiene da solo la promessa il gesto «tocca di nuovo per togliere»: nessuna parola lo dice (Cosa non torna, 8).
2. **Due variabili che erano lo stesso numero possono separarsi?** Sì, ed è il punto della proposta: oggi pulsante e frasi usano la stessa `label`; dopo, il pulsante compone da `name` + `start`/`end` e le frasi da `label`. Non possono divergere negli orari **solo se** il pulsante usa lo stesso `formatRangeHour` della riga 35, che oggi non è esportato. Una seconda coppia già separata oggi: «Per me è uguale» e «nessuna fascia» sono due valori nei dati (`flexible` e `NULL`) ma F3 li scrive uguali.
3. **Le due sorgenti sono d'accordo?** Chi offre (`BookingTimePreferenceChips`, riga 12) e chi rifiuta (`canSubmit`, `Book.jsx` 251; il pulsante del riquadro, `PendingRequest.jsx` 215) chiamano la stessa `isTimePreferenceClosed` sulla stessa chiusura del giorno scelto: d'accordo. La legenda legge le stesse impostazioni per un'altra strada (`DesiredDateStrip.jsx` 25–31) e parla **solo se la fascia chiusa è una**: con due tace (Cosa non torna, 6).
4. **Ciò che si offre si può ancora fare?** Di lunedì «Pomeriggio», «Per me è uguale» e «nessuna fascia» si possono fare tutte e tre. In un giorno con tutte e due le fasce chiuse ma non segnato chiuso, «Per me è uguale» e «nessuna fascia» restano offerte e la richiesta parte (Cosa non torna, 6).
5. **Uscendo per guardare, si perde il lavoro?** Sì, oggi in silenzio: chi ha scelto «Mattina» e tocca un lunedì per guardarlo perde la scelta, e tornando a giovedì non la ritrova. La proposta lo dice (caso 7) ma **non la ripristina**.

---

## 10 · Che cosa chiede al codice

Niente di questo è esecutivo: lo diventa con `GH-117`.

| # | Testo o comportamento | Da quale dato si compone |
|---|---|---|
| a | riga 1 del pulsante | `BOOKING_TIME_WINDOWS[x].name` |
| b | riga 2, l'orario | `start` e `end` della stessa fascia, con `formatRangeHour` (oggi privata, `bookingSchedule.js` 35) e il trattino «–» |
| c | riga 2, lo stato «chiusa» / «chiuso» | **dato che oggi non c'è**: la parola esiste solo dentro `closedLabel` («Mattina chiusa»). Serve un campo per fascia, o si ricava togliendo il nome da `closedLabel`. Lo decide `GH-117` |
| d | «Per me è uguale» su due righe | testo invariato (`bookingSchedule.js` 52); l'a capo dopo «Per me» è del componente |
| e | via «Non disponibile» | `BookingTimePreferenceChips.jsx` 23 |
| f | via la frase fissa sotto le fasce | `Book.jsx` 439–443, `PendingRequest.jsx` 209–211 |
| g | frase «… abbiamo tolto la tua preferenza …» | `closedLabel` della fascia tolta + testo fisso. Serve uno stato d'interfaccia, non un dato: nasce dove oggi la scelta viene azzerata (`Book.jsx` 292, `PendingRequest.jsx` 199), muore alla scelta successiva di fascia o di giorno |
| h | titolo «Mattina o pomeriggio? (facoltativo)» nei due posti | testo fisso; oggi è in `Book.jsx` 433 e manca in `PendingRequest.jsx` |
| i | fascia scelta: padding 5 3, nome a peso 700, bordo `--color-primary-hover` | stile; oggi `Book.css` 171 e `DesiredDateStrip.css` 21 |
| l | F3: «Per me è uguale» al posto di «Nessuna preferenza» per `flexible` | `PendingRequest.jsx` 158: oggi passa `'Nessuna preferenza'` come etichetta di `flexible` |
| m | F4 e F5: iniziale minuscola | `label` con la prima lettera in minuscolo |
| n | F5: `flexible` → «mattina o pomeriggio»; fascia assente → nessuna virgola | `PendingRequest.jsx` 28–30 |

---

## 11 · Scostamenti da `GH-116`

Griglia, gap, altezza minima, raggio e padding **non cambiano**. Tre scostamenti, tutti da firmare o rifiutare:

1. **Bordo della fascia scelta:** da `--color-primary` a `--color-primary-hover`. Motivo: su `--color-bg-main`, dove sta nella prenotazione, `--color-primary` fa 2,75:1; `--color-primary-hover` 3,49:1. È lo stesso colore del giorno scelto nel calendario.
2. **Padding della fascia scelta:** 5 3 invece di 6 4, perché il bordo passa da 1 a 2px. Oggi la larghezza utile al testo scende di 2px quando si sceglie.
3. **Nome a peso 700 quando è scelta**, come il numero del giorno scelto.

---

## 12 · Cosa non torna

**1 · Il giorno non è nel pulsante, e l'incarico lo lasciava intendere.** «chiusa il lunedì» andava bene «se il giorno è una variabile»: con il giorno variabile non entra («chiuso il mercoledì» 97–104px, «chiuso la domenica» 100–107px, contro 85,67 utili nel riquadro). Ho messo solo «chiusa» / «chiuso». Il giorno lo dice la legenda, che è composta dagli stessi dati; la frase del caso 7 dice «in quel giorno». Se la regia vuole il giorno nel pulsante, l'unica forma che entra è l'abbreviata della legenda, «chiuso il mer» (70,66 / 66,25).

**2 · «chiusa» / «chiuso» non è un dato.** Oggi il genere sta solo dentro `closedLabel`. La proposta ha bisogno di quella parola da sola: è una richiesta sulla struttura, e non la decido io (§10, c).

**3 · L'iPhone non è misurato.** Ho misurato in Inter e in Roboto. San Francisco nel mio ambiente non c'è. Il progetto regge perché gli a capo sono nel markup e il testo più largo ha 15,7px di margine nel caso peggiore, ma è un ragionamento, non una misura.

**4 · Il bordo della scelta di oggi è sotto 3:1.** `--color-primary` su `--color-bg-main` fa 2,75:1. Ho proposto `--color-primary-hover`, che è uno scostamento da `GH-116` (§11). Se non viene firmato si torna a `--color-primary`, e lo stato «scelta» resta affidato soprattutto al fondo.

**5 · Il nome della fascia chiusa fa 4,06:1.** `--color-text-secondary` su `--color-surface-soft`, come oggi. È un controllo spento, e la parola che conta («chiusa») è a 4,94:1; ma il nome sotto 4,5:1 resta.

**6 · Due fasce chiuse nello stesso giorno.** Le impostazioni lo permettono senza segnare chiuso il giorno. In quel caso la legenda tace (parla solo se la fascia chiusa è una), i due pulsanti dicono «chiusa» e «chiuso», «Per me è uguale» resta accesa e la richiesta parte, con o senza fascia. Non l'ho composto: è una regola, non un'etichetta.

**7 · Di lunedì «Pomeriggio» e «Per me è uguale» portano allo stesso esito.** Due pulsanti accesi per una sola possibilità. Ho lasciato com'è, perché «Per me è uguale» non si spegne mai; ma chi legge con attenzione se ne accorge.

**8 · Togliere una scelta toccandola di nuovo non è scritto da nessuna parte.** «(facoltativo)» dice che si può lasciare vuoto, non come si torna a vuoto.

**9 · Il caso 7 avvisa ma non restituisce.** Chi torna al giorno di prima non ritrova la fascia che aveva scelto.

**10 · F5, due casi letti dal codice e non verificati.** Un'alternativa senza ora con preferenza `flexible` oggi si leggerebbe «giovedì 19 novembre, Per me è uguale»; senza preferenza, «giovedì 19 novembre, » con la virgola in coda. Non so se il gestionale possa produrre queste alternative: non ho letto come le costruisce.

**11 · «Manca: un'altra fascia» (`Book.jsx` 260).** Con la scelta che si azzera da sola al cambio di giorno, non vedo come quella frase possa comparire. Non l'ho toccata e non l'ho composta.

**12 · `formatRangeHour` scarta i minuti.** Una fascia che cominciasse alle 9:30 si leggerebbe «9». Gli orari non sono in questo incarico; lo segnalo perché la riga 2 del pulsante mostra proprio quel numero.

**13 · Il `tokens.css` della tela l'ho compilato io.** L'artifact del design system non ne serve ancora uno (lo genera la sua pagina). Le variabili delle tavole vengono da `project/ds/groominghub/tokens.css`, scritto da `misure/genera.py` a partire da `tokens.json`. I valori sono gli stessi; il file no.

**14 · Le tavole le ho rese dal file, non dentro l'editor.** Le misure vengono dai `.dc.html` aperti in Chrome come pagine statiche. La tela aperta nell'artifact non l'ho vista: se lì un'altezza taglia, è da correggere nell'indice.

**15 · La larghezza del riquadro non è mia.** 303px viene dal registro di `GH-116`; non vedo il prodotto. Nella tavola di contesto ho messo 15px di margine di pagina per arrivare a 303: quel 15 è una mia supposizione. La variante `embedded` del riquadro (dentro la tessera, `pet-card.css` 87) non so quanto è larga. A 1365 non ho misurato niente; dal CSS, nella prenotazione le fasce prendono tutta la colonna del modulo mentre il calendario si ferma a 440.

**16 · Oggi, con il pomeriggio chiuso, la riga delle fasce sale da 54 a 55,89.** Misurato sul banco di prova con il CSS di oggi. Nel prodotto non si vede perché nessun pomeriggio è chiuso. Dopo è 54 in tutti gli stati.

**17 · Due sostituzioni nel contesto.** Nel calendario ridisegnato il numero del giorno scelto è in `var(--color-surface-main)`: nel codice è `white`, che non è un token. La scheda del riquadro ha `var(--shadow-sm)`: nel codice l'ombra è un `rgba` scritto a mano in `Card.jsx`. Sono fuori dall'oggetto della tavola; le dichiaro perché «mai un esadecimale» nel prodotto non vale ancora.

**18 · Il bordo della fascia non scelta fa 1,49–1,62:1.** `--color-border` sui due fondi. È di tutta l'app, non di questa tavola.

**19 · Ho letto quattro file che l'incarico non elenca.** `apps/staff/lib/whatsapp.js` righe 118–150 (la frase F2 nasce lì, chiamata da `Book.jsx` 136–143), `apps/customer/components/pet-card.css` riga 87, `shared/ui/Card.jsx`, `shared/ui/Button.jsx`. Sola lettura.

---

## Verifiche

- Markup: cinque tavole, markup statico, pulsanti veri (`<button>`, `aria-pressed`, `disabled`); nessun esadecimale, nessun `rgb()`.
- `project/ds/groominghub/tokens.json`: sha256 uguale a quello dell'artifact del design system.
- Gli otto file di `project/` in questa cartella hanno lo stesso sha256 di quelli nella tela, letti dall'artifact dopo la pubblicazione.
- Le misure del §6 sono lette da `misure/misure-tavole.json`, prodotto da `misure/misura.py` sui file consegnati. Prima stesura: nella tavola `Prima-dopo` il riquadro risultava largo 302 e nel contesto 301; corretti i margini, rimisurato: 303 in tutti e due.
- Non verificato: la tela dentro l'artifact, l'iPhone, il riquadro a 1365 e nella variante `embedded`.
