# GH-15 — Brief per Claude Design: la veste del gestionale

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 24 agosto 2026
**Esito atteso:** composizione, non codice. Realizzerà Codex in un mandato successivo.

## Perché

Grooming Hub oggi ha due facce che non si somigliano. L'app dei clienti ha la veste che hai composto tu — token, Fraunces, registro editoriale. Il gestionale che usano Davide e Roby ha ancora l'aspetto di cinque mesi fa: al Gate 5 ne abbiamo rifatto il motore, non la carrozzeria.

Devono sembrare **lo stesso prodotto**. È questo il lavoro.

## Chi lo usa, e come

Davide e Roby sono due toelettatori. Usano il gestionale **tutto il giorno, di corsa, spesso col telefono in mano e un cane sul tavolo**. Non lo contemplano: lo consultano fra un'asciugatura e l'altra.

Questo è il punto di calibrazione più importante del brief. L'app customer è un luogo dove ci si ferma: c'è spazio, c'è respiro, c'è un titolo grande. Il gestionale è uno strumento di lavoro: deve dire molte cose in poco spazio e farsi leggere in un colpo d'occhio, a mezzo metro di distanza, con le mani bagnate.

**Stesso vocabolario, registro diverso.** Non copiare la composizione del customer: eredita colori, famiglia tipografica, raggi, ombre e componenti, e trovane la densità giusta. Se il customer è l'articolo di apertura, il gestionale è la sezione di consultazione della stessa rivista.

C'è una tensione vera qui, e te la nomino perché la sciolga tu: **più densità significa bersagli tattili più piccoli**, e chi tocca lo schermo ha le dita umide. Dove non si può avere entrambi, dimmi tu cosa vince e perché.

## Stato di fatto, misurato

Il gestionale è 22 file, circa 10.300 righe. **Non contiene nemmeno un file CSS**: 787 blocchi `style={{` scritti dentro il JSX, mescolati a classi Tailwind. L'adozione dei token è iniziata e lasciata a metà — alcune pagine usano già `var(--color-text-primary)`, altre hanno colori letterali fuori palette (per esempio `#7c2d12` nella Dashboard).

Esiste già un `AppHeader` con schema titolo + sottotitolo, usato dalle pagine principali.

## Le tre schermate di questo giro

Sono quelle in cui il salone vive tutto il giorno. Le altre seguiranno.

**1. Dashboard clienti** (659 righe) — la porta d'ingresso. Ricerca per nome, razza, proprietario o telefono; elenco clienti; aree operative; dati chiave. È la schermata più aperta della giornata: la ricerca deve essere il gesto più naturale della pagina.

**2. Scheda cliente** (1.235 righe) — la più densa. Anagrafica del pet e del proprietario, storico visite con trattamenti e problemi rilevati, incassi, punti fedeltà, invito all'app customer, QR. Qui c'è anche il registro dell'incasso: **i prezzi lato staff restano e sono importanti**, a differenza del customer dove non compaiono mai.

**3. Registrazione visita** (`AddVisit`, 361 righe) — il gesto più ripetuto della giornata. Trattamenti eseguiti, problemi rilevati sul pet, incasso. Da qui passano le 464 visite dello storico, 176 delle quali negli ultimi due mesi: è la schermata che il salone tocca più spesso di qualunque altra, probabilmente con il cane ancora sul tavolo.

### Il calendario NON è in questo giro, e il motivo conta

Il calendario è la schermata più grande dell'app (1.572 righe), ma la misura sul database di produzione dice che **è fermo dal 23 aprile**: 17 appuntamenti in tutto, tutti fra l'11 marzo e il 23 aprile, zero da allora. Nello stesso periodo il salone ha registrato 464 visite.

Non è stato rifiutato: è stato lasciato a digiuno. Senza un lato clienti che ci facesse entrare qualcosa, tenerlo aggiornato a mano era lavoro doppio. Dopo il lancio dell'app customer le richieste si convertiranno in appuntamenti e il calendario potrebbe riempirsi da solo per la prima volta.

Lo comporremo nel giro successivo, quando sapremo **come verrà usato davvero** — e dopo aver chiesto a Davide se la giornata diventerà «calendario-primo», cioè organizzata guardando l'agenda la mattina invece che accogliendo chi si presenta. Rivestire al buio la schermata più costosa dell'app sarebbe lo spreco maggiore possibile.

## Regola non negoziabile: stesse ossa, pelle nuova

**Non riorganizzare i flussi, non spostare le funzioni, non rinominare le voci.** Davide e Roby usano questo strumento da mesi e hanno memoria muscolare: sanno dove cade il dito senza guardare. Cambiare l'architettura dell'informazione mentre cambia l'aspetto significherebbe far ripartire due persone da zero il primo giorno dopo le ferie.

Se durante il lavoro vedi qualcosa che secondo te è organizzato male, **dillo separatamente come proposta**, non incorporarlo nella composizione. Lo valuteremo come capitolo a sé.

## Vincoli

- Solo la palette di `shared/tokens/tokens.css`. Nessun colore nuovo: i letterali fuori palette vanno ricondotti ai token, non sostituiti con altri letterali.
- Riusa i componenti condivisi già esistenti: `Button`, `Card`, `Icon`, `StatusBadge`, `Eyebrow`, `Skeleton`, `Brandmark`. Se ne serve uno nuovo, dichiaralo e nominalo.
- Gli stati devono essere leggibili a colpo d'occhio: confermato, in attesa, no-show, blacklist.
- Responsive reale: si usa da telefono in piedi e da desktop al banco.
- Non comporre l'app customer: è già fatta e non si tocca.

## Cosa ti serve da Luigi

Screenshot delle tre schermate dal vivo, desktop e telefono. Sono l'unica fonte attendibile: nel repo non esiste alcun prototipo del gestionale, e i file sorgente non restituiscono l'aspetto reale.

## Fuori scope, dichiarato

`CustomerPortal.jsx`, `CustomerLogin.jsx` e `CustomerInvite.jsx` sono circa 1.800 righe del vecchio portale clienti, superato dall'app customer nuova. **Non vanno rivestite**: probabilmente vanno rimosse, in un mandato di pulizia separato per Codex. Da confermare prima di cancellare.

## Cosa consegni

Composizione delle tre schermate con le indicazioni che Codex potrà applicare: gerarchia, spaziature, dimensioni tipografiche riferite ai token, uso dei componenti, comportamento responsive, stati. Come sempre: componi, non scrivere codice.

Dichiara esplicitamente le questioni che ritieni aperte, invece di risolverle da solo — su questo progetto le decisioni restano di Luigi e hanno funzionato meglio quando sono state nominate per tempo.
