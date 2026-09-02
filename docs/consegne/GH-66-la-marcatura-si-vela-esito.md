# Consegna GH-66 - La marcatura si vela

## Esito e perimetro

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`.
- Branch `main`; base `3faa9cc5d9c576347914ff979f87b0872455eaa0`. Git inizialmente pulito; nessuna modifica parallela incontrata.
- GH-66 implementato e verificato localmente: velatura, bordo invariato, testo ripristinato e segnaposto completo. Resta lo sguardo finale di Luigi.
- Estensione nominativa ricevuta in chat durante il giro: verificare il mini calendario che resta aperto in Safari e documentare l'esito. **Diagnosi eseguita, difetto confermato; nessuna correzione del picker applicata.**
- Nessuna query, migration, scrittura dati, credenziale, push, merge o deploy. Nessun collegamento al DB demo o prod. Eccezione di osservazione UI accidentale descritta sotto.

## Scelta e misure

Il fondo usa `color-mix(in srgb, var(--color-primary) 5%, transparent)`: solo il primario esistente, senza nuovi token o colori assoluti. Il 5% mantiene il testo secondario originale sopra 4,5:1. Tolti sia il contorno aggiunto sia la regola che scuriva le scritte della trovata.

| Misura | Prima, GH-65 | Dopo, GH-66 |
| --- | --- | --- |
| Fondo reso della trovata | `#6f9792` | `#f8fafa` sul pannello bianco |
| Bordo appuntamento, alto/destra/basso/sinistra | `#2b2525`, 1/1/1/3 px | identico |
| Contorno aggiunto | 2 px, offset 1 px | nessuno, spessore effettivo 0 |
| Nome / peso | `#2b2525`, 650 | identico |
| Secondario appuntamento | `#2b2525` nella trovata | `#7f6f73`, identico alla scheda non marcata |
| Secondario richiesta | override scuro | colore originale `#7f5d60`, identico alla richiesta non marcata |
| Dimensione appuntamento, 1365 px | 145,56 x 64,25 px | identica |

**Contrasto:** bordo/tinta **14,38:1**, bordo/bianco esterno **15,06:1**. Il bordo soddisfa la soglia non testuale di 3:1; la velatura porta l'area. Testo secondario/tinta **4,53:1**, calcolato con luminanza relativa sRGB.

**Pixel:** stesso metodo e stesse coordinate GH-65, due campioni di **144 x 62 = 8.928 pixel**. Arturo `(448,400)`: **7.708 pixel** della velatura, **86,34%**. Lola `(448,330)`: **162 pixel** del primario dell'accento preesistente, **1,81%**. Rapporto area velata/accento **47,58x**. Distinzione necessaria: ora si confrontano due intensita dello stesso primario; contando invece l'esatto colore velato anche sulla vicina, la vicina ha **0 pixel / 0%**, quindi quel rapporto non ha denominatore non nullo. Non e piu il confronto dello stesso RGB di GH-65.

## Controprove locali

Banco temporaneo con il calendario reale compilato e **9 appuntamenti + 1 richiesta sintetici in memoria**, settimana 31 agosto - 6 settembre 2026. Sostituiti nel solo banco modulo dati e contesto tenant; le scritture sollevavano errore. Nessuna nuova rotta o dipendenza applicativa. Chromium isolato **151.0.7922.34**, Playwright gia disponibile; `agent-browser` non installato. Ammesse solo risorse locali e font gia usati dall'app.

| Controprova | Esito misurato |
| --- | --- |
| Cerca Arturo / Proprietario Arturo | 1 corrispondenza ciascuno |
| Cerca `7890`, `333456`, `456-7890` contro `+39 333 456 7890` | 1 corrispondenza ciascuno; normalizzazione e oggetto di confronto non modificati |
| Cerca Ada, richiesta | bordi 1/1/1/1 px tratteggiati invariati, nessun contorno; colori e pesi del testo uguali alla baseline |
| Nove schede non corrispondenti | identiche prima/dopo ricerca, confronto di tutti gli stili calcolati anche dei discendenti |
| Conteggi / griglia | sempre 9 prenotati, 1 da confermare, 0 sul momento; 7 giorni, 14 margini |
| 1365 x 900 e 1024 x 900 | tutte le 10 schede nel viewport; una sola marcata, visibile senza scorrere |
| Testi e spessori trovata | confronto automatico con la stessa scheda non marcata: colori, pesi e bordi invariati |
| Picker Chromium | tre cicli apertura/chiusura PASS; non estendere questo esito a Safari |
| Errori app / richieste di rete bloccate | 0 / 0 |

Segnaposto esatto **`pet, proprietario, cell`**, 23 caratteri, larghezza testo misurata **113,92 px**. Etichetta visibile e nome accessibile **Cerca**, invariati.

| Viewport | Campo | Spazio interno disponibile | Overflow orizzontale pagina |
| --- | --- | --- | --- |
| 1365 px | 201,03 x 44 px | 183 px | 0 |
| 1024 px | 201,03 x 44 px | 183 px | 0 |
| 375 px | 310,03 x 44 px | 292 px | 0 |

Screenshot ispezionati: [1365](evidenze/GH-66/final-1365.png), [1024](evidenze/GH-66/final-1024.png), [segnaposto e pagina mobile](evidenze/GH-66/placeholder-375.png). Sul mobile i giorni restano impilati: Arturo e a y=1344,75 e richiede scorrimento, come prima. Le misure complete sono in [measures.json](evidenze/GH-66/measures.json).

## Fuori mandato autorizzato: Safari

Luigi ha chiesto esplicitamente di controllare il mini calendario in Safari e riportarlo in consegna. Usato **Computer Use su Safari 26.5 reale**, non Playwright su Safari; solo pagine locali senza backend. La prima acquisizione UI ha avuto un errore ScreenCaptureKit, poi recuperato. All'aggancio iniziale lo strumento ha restituito automaticamente lo stato del pannello produzione gia aperto dall'utente: osservazione incidentale, **nessuna navigazione, ricarica, interazione o query volontaria sulla produzione**; aperto subito un pannello separato localhost. Nessun dato reale riportato nelle evidenze.

**Difetto riprodotto nel calendario reale locale**, anche dopo ricarica e usando clic visibili: primo clic apre; secondo clic lascia il mini calendario visibile. Nella sequenza osservata rimane anche dopo Esc e clic esterno. Una ricarica locale lo elimina. Il picker non e stato toccato da GH-66: la modifica JSX e solo il segnaposto.

Una seconda pagina diagnostica minima ha separato le operazioni e mostrato lo stato `:open`:

| Sequenza | Osservazione Safari |
| --- | --- |
| Solo `focus()` | `:open=false`, nessun popup |
| `showPicker()` senza focus attivo, poi `blur()` ed Esc | popup ancora visibile, `:open=true` |
| `focus()` + `showPicker()`, poi sfocatura | in questa sequenza minima chiude, `:open=false` |
| Stessa logica toggle/rAF dell'app, due clic | al secondo handler lo stato ricordato e gia `false`: viene eseguita una nuova apertura |
| Clic esterno dopo quel toggle minimo | chiude: il difetto non e universale a ogni sequenza |
| Campo del popup bloccato portato a `display:none` | popup sparisce e `:open=false` al successivo aggiornamento; non sincronicamente |

**Causa misurata e limite:** il contratto di chiusura basato su `blur()` e sul campionamento rAF dello stato nativo non e affidabile in Safari. La prova minima dimostra sia la mancata chiusura senza focus sia la riapertura quando il flag si azzera prima di `click`; non prova che tutta la sequenza interna del componente reale sia identica alla pagina minima. Non attribuisco il problema alla RAM o al nuovo CSS.

**Soluzione consigliata a Cowork, non applicata:** micro-mandato dedicato a `CalendarNavigation` in `CalendarKit.jsx`. Introdurre una chiusura esplicita centralizzata con rimozione temporanea del campo dal rendering (primitiva verificata nella pagina minima), ripristino del valore e del focus sul comando; evitare che l'intenzione di chiudere sia ricalcolata come apertura dopo la chiusura nativa, verificando l'ordine `pointerdown`/`focusout`/`click` in entrambi i browser. Non basta sostituire un singolo `blur()` ne aggiungere un ritardo arbitrario. Mantenere fallback e nome accessibile.

Controprove del prossimo giro: tre cicli sullo stesso pulsante in Safari e Chromium, clic esterno, Esc, selezione effettiva della data, apertura successiva, uso da tastiera, fallback, cambio vista e smontaggio senza popup residuo. **Rischio residuo:** la tecnica `display:none` e verificata solo isolatamente, non e una correzione dell'app gia collaudata. Il difetto rimane aperto e non va promosso come PASS Safari.

## Verifiche, tempi e pulizia

- Build PASS: 159 moduli, Vite **1,36 s**; tempo reale **1,96 s**, user 2,40 s, sys 0,33 s. Warning preesistenti Browserslist datato e bundle oltre 500 kB.
- Ultimo giro automatico: **3,43 s** reali, user 2,02 s, sys 0,92 s; runtime interno 2,96 s. `git diff --check`: PASS.
- RLS non rieseguita, come richiesto. Ultima misura viva [GH-63](GH-63-il-demo-torna-a-pari-esito.md): **60 PASS, 0 FAIL, 0 SKIP**.
- Intervallo misurato **02/09/2026 07:21:02 - 07:34:26 CEST**, **13 min 24 s**, dall'avvio alla fine prove/pulizia, inclusa la diagnosi Safari; redazione finale e commit successivi esclusi. Non rilevato un cronometro separato dell'estensione Safari; nessuna pausa sottratta.
- Nessuna misura indica saturazione RAM/disco. Primo aggancio Computer Use fallito dopo circa 38 s, poi recuperato; non scambiato per rallentamento dell'app.
- Browser isolati chiusi; pannello Safari di prova svuotato su `about:blank`; server localhost 4186 arrestato. `/tmp/gh66` rimossa: **0 file fixture residui**. **0 fixture inserite nel DB, 0 accessi DB**. Restano solo evidenze sintetiche elencate sotto.

## File esaustivi e commit

| File | Contenuto |
| --- | --- |
| `src/apps/staff/pages/Calendar.css` | velatura 5%, rimozione contorno e override testo |
| `src/apps/staff/components/CalendarKit.jsx` | solo segnaposto abbreviato |
| `docs/consegne/GH-66-la-marcatura-si-vela-esito.md` | questo registro e diagnosi aggiuntiva |
| `docs/consegne/evidenze/GH-66/final-1365.png` | calendario desktop marcato |
| `docs/consegne/evidenze/GH-66/final-1024.png` | calendario intermedio marcato |
| `docs/consegne/evidenze/GH-66/placeholder-375.png` | pagina mobile, segnaposto vuoto |
| `docs/consegne/evidenze/GH-66/measures.json` | misure e confronti locali, senza dati reali |

Codice, registro ed evidenze nello stesso commit locale `fix(staff): soften calendar search highlighting`. Hash nella risposta finale e ricavabile da `git log -1 --format=%H -- docs/consegne/GH-66-la-marcatura-si-vela-esito.md`; non incorporato qui per evitare autoreferenzialita. Nessun push.

## Sguardo finale di Luigi

Dopo il rilascio gestito da Luigi e ricarica dall'origine: cercare un pet in una settimana piena, confrontare la trovata con le vicine, leggere tutto il segnaposto. **Cosa non ti torna?** L'approvazione visiva non e anticipata da questo registro. Nell'attesa gli screenshot documentano il risultato locale, non una modifica gia pubblicata.
