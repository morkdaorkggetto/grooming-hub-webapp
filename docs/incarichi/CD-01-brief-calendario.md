# CD-01 — Brief per Claude Design: il calendario

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 25 agosto 2026
**Esito atteso:** composizione, non codice. Realizzerà Codex in un mandato successivo.
**Primo brief della serie `CD-`**: da oggi gli incarichi a Claude Design hanno prefisso proprio, distinto dai `GH-` di Codex.

## Da dove veniamo

Nel tuo handoff GH-15 avevi tenuto fuori il calendario con una motivazione che condividiamo — «vestire una stanza senza mobili non serve» — e avevi lasciato al §9.1 una domanda per Davide: *se il calendario mostrasse la settimana già passata, con dentro le visite registrate, la guarderebbe?*

**Luigi gliel'ha chiesta. La risposta è arrivata, ed è più ricca della domanda.**

## La risposta del salone (fonte: incontro diretto, 25 agosto)

Non «calendario-primo», e nemmeno «come adesso». **Il calendario si riempie da due direzioni.**

- **In avanti.** Le richieste dei clienti, una volta confermate, vengono registrate assegnando data **e orario**. L'orario lo decide il salone al momento della conferma, perché **dipende dalle condizioni del pet e non è determinabile prima**.
- **All'indietro.** Chi arriva direttamente in negozio col pet viene registrato come si fa oggi, a lavoro finito, e quella lavorazione **integra il calendario a posteriori**.

Perché lo vogliono, parole loro: per avere un quadro chiaro di **clienti, incassi, promozioni e status del cliente**. Il calendario non è quindi solo un'agenda: è il punto dove le due strade convergono e da cui si legge l'andamento del salone.

Dichiarato esplicitamente come assetto **transitorio**, «almeno finché il meccanismo non sarà rodato». Non progettare per l'eternità.

## I tre oggetti — è il cuore del brief

Al §10 ne avevi previsti due, fatti e desiderata. Dalla risposta ne emergono **tre**, e si distinguono per quanta certezza hanno sull'ora:

| Oggetto | Certezza temporale | Origine |
|---|---|---|
| **Richiesta pendente** | giorno desiderato + fascia (mattina / pomeriggio / indifferente) | cliente, dall'app |
| **Appuntamento confermato** | data e ora precise | salone, al momento della conferma |
| **Lavorazione registrata** | **solo il giorno, nessuna ora** | salone, a lavoro finito |

### Il vincolo che devi conoscere prima di comporre

`visits.date` è di tipo **`date`: non contiene l'orario**. Misurato sullo schema reale.

Una lavorazione registrata a posteriori **non ha un'ora e non ne avrà una**. Abbiamo valutato di aggiungerla e l'abbiamo scartata: loro registrano a lavoro finito, non cronometrano, e un orario dedotto sarebbe un dato falso che sembra vero — la stessa ragione per cui l'operatore è stato escluso dalla scheda pet.

**Decisione presa da Luigi: il calendario deve reggere oggetti privi di ora.** Non è un caso limite da gestire: è un terzo dei suoi contenuti, e nelle prime settimane sarà la maggioranza.

C'è una convergenza che ti semplifica il lavoro: **richieste e lavorazioni a posteriori hanno lo stesso problema visivo**, cioè non stanno a un'ora precisa. La forma «banda invece di blocco» che proponevi per le richieste serve a due dei tre oggetti — anche se per ragioni opposte, una perché l'ora non è ancora stata decisa, l'altra perché non è mai stata registrata. Se la stessa forma debba dire due cose diverse, o se servano due trattamenti, è una tua scelta.

## Cosa porta con sé una richiesta

Dalla tabella reale, così componi su dati esistenti:

pet · servizio · **data desiderata** · fascia oraria facoltativa (`mattina` / `pomeriggio` / `indifferente`) · condizioni del manto scelte fra cinque codici (qualche nodo, molto infeltrito, perde molto pelo, pelle sensibile, pulito e lungo) · nota libera sul manto · età dichiarata se mancava in anagrafica · stato (`in attesa` / `approvata` / `rifiutata`).

Alla conferma, la richiesta si converte in un appuntamento con l'orario scelto dal salone, e resta legata a esso.

## Cos'è davvero un «servizio» — precisazione del salone, 25 agosto

Attenzione, perché ribalta il senso di un campo.

Quello che il cliente indica — bagno, taglio, toelettatura completa — **non è un servizio che sceglie da un listino: è un'esigenza che segnala.** Saranno Davide e Roby a consigliare o disporre le lavorazioni necessarie, dopo aver valutato **di persona** le condizioni del pelo, le caratteristiche del pet e le sue abitudini.

Tre conseguenze compositive:

1. **Il registro della parola è sbagliato oggi.** Nel wizard clienti e nella vista richieste il campo si chiama «Servizio», che suggerisce un menu da cui si ordina. Il vocabolario giusto è quello dell'indicazione: cosa serve, di cosa ha bisogno, cosa chiede il cliente. Va corretto — e in quel momento vale la pena scegliere una parola sola e usarla ovunque.
2. **Ciò che il cliente chiede e ciò che viene fatto sono due cose distinte, e possono legittimamente differire.** Nel calendario un appuntamento confermato porta con sé **l'esigenza indicata**; la lavorazione registrata porta **quello che è stato realmente fatto**, che è testo libero scritto dal salone. Comporre come se fossero lo stesso dato sarebbe un errore di modello, non di grafica.
3. **Nessun prezzo, e nemmeno una durata.** Se la lavorazione si decide guardando il pet, non esiste un preventivo né un tempo prevedibile. È la ragione strutturale per cui questo calendario non può avere una griglia a slot.

Il tono che ne discende: il cliente **dice come sta il suo cane**, non compila un ordine. Le condizioni del manto che accompagnano la richiesta sono parte della stessa frase, non un campo accessorio.

### Il vocabolario reale, misurato — e due cose che ti servono

Invece di far inventare un listino al salone, abbiamo contato cosa hanno scritto di loro pugno in 453 visite:

| Come lo scrivono loro | Volte |
|---|---:|
| bagno | 169 |
| **bagnetto** | 129 |
| taglio | 122 |
| bagno e taglio | 9 |
| toelettatura | 7 |
| toelettatura completa | 4 |

Quattro voci coprono il 97% di un anno. Decisione presa: si adottano quelle, «vince la consuetudine».

**Prima cosa, per te**: dicono **«bagnetto» 129 volte su 298**. Non è un refuso, è il diminutivo affettuoso per lo stesso identico lavoro — la loro voce reale, misurata e non supposta. Ti lasciamo una micro-scelta: se l'etichetta rivolta al cliente debba dire «Bagno», che è più frequente, o «Bagnetto», che è più loro. È materia di voce, quindi tua.

**Seconda cosa, e conta per la composizione**: quel campo **non contiene solo lavorazioni**. Dentro ci sono anche «ha saltato l'appuntamento senza avvisare», «non è venuto», «appuntamento rimandato per ciclo», «bagnetto (paga 15 euro perché è la prima volta)». Il salone lo usa **anche come diario**.

Significa che una riga che promette «ecco cosa è stato fatto» a volte dirà «non è venuto», e una lavorazione registrata potrebbe essere in realtà l'annotazione di un'assenza. **Il dato è più sporco di quanto qualunque prototipo lo immaginerebbe, e va composto per come è** — non per come sarebbe comodo che fosse.

## La conferma esce dall'applicazione

Al §10.3 avevi visto giusto e va portato fino in fondo: la conferma al cliente avviene **via messaggio**, quindi stato reale e stato a schermo possono divergere — messaggio scritto, richiesta rimasta «in attesa». Il tuo suggerimento era che «Conferma» fosse **un gesto solo** che include l'invio del messaggio, invece di due che si spera vengano fatti entrambi. Componilo così.

## Quanta libertà hai qui — diversa dal giro precedente

Su Dashboard e scheda cliente ti avevamo imposto «stesse ossa, pelle nuova», perché Davide e Roby le usano da mesi e hanno memoria muscolare.

**Sul calendario no.** È fermo dal 23 aprile: 17 appuntamenti in tutto, tutti fra l'11 marzo e quella data, zero da allora — contro 464 visite registrate nello stesso periodo. Nessuno ci ha costruito abitudini sopra. **Qui puoi ripensare la vista, non solo rivestirla**, ed è probabilmente necessario: quella attuale è una griglia di appuntamenti costruita per un uso che non c'è mai stato.

L'unico vincolo che resta è di non introdurre route nuove e di non promettere funzioni che il database non regge.

## Quello che il calendario deve far vedere

Oltre agli appuntamenti, il salone ha nominato **incassi, promozioni e status del cliente**. Vale la pena chiederti se questi appartengano al calendario o se stiano meglio altrove: esiste già una vista incassi settimanali (`/reports/weekly`). Se la tua risposta è che il calendario deve essere anche un quadro d'insieme, dillo e componilo; se invece pensi che stia meglio come agenda pura, dillo lo stesso. È una delle domande che ti chiediamo di nominare, non di risolvere in silenzio.

## Vincoli

- Eredita il vocabolario di `design_handoff_staff_app/`: token, scala tipografica, altezze, geometria, un solo punto di rottura a 640px. Il kit esiste già ed è implementato — `gh15-staff.css` e `StaffKit.jsx` sono in produzione sul ramo di lavoro.
- Nessun colore nuovo oltre i tre già dichiarati.
- Densità: vale la stessa regola di prima — comprimi tipografia e spazio, mai il bersaglio. Nessun target sotto 44px sotto i 640px.
- **Marca con ⚠ ogni campo che non sei certa esista.** La convenzione ha funzionato: dodici campi marcati nel giro scorso, quattro si sono rivelati inesistenti e sono stati esclusi prima che qualcuno ci costruisse sopra.
- Dichiara le domande aperte invece di risolverle da sola.

## Due stati che nella realtà saranno la norma

- **La settimana vuota.** Per mesi non c'è stato nulla, e dopo il lancio le richieste arriveranno solo quando i clienti saranno stati invitati. Lo stato vuoto qui non è un caso raro: è il primo che vedranno.
- **La giornata fatta solo di lavorazioni registrate dopo.** Nessun appuntamento, nessuna richiesta, solo il resoconto di chi è passato. Nelle prime settimane sarà la giornata tipo.

Compone bene chi compone prima questi due, non la settimana piena.
