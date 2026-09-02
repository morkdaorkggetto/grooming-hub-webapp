# Consegna GH-65 - Un'evidenziazione che si vede

## Base, perimetro e stato

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`; worktree `webapp/`.
- Branch: `main`; base `d20ebc86960f20545eb3affe45f32b0d3324cbd5`.
- Mandato: `docs/incarichi/GH-65-una-evidenziazione-che-si-vede.md`, richiesto nominativamente da Luigi.
- Stato iniziale Git pulito. Nessuna modifica parallela incontrata.
- Implementazione e controprove locali concluse. Resta il passo visivo di Luigi sul browser abituale; nessuna verifica Safari dichiarata come eseguita.
- Nessuna migration, query, modifica di dati, credenziale, push, merge o deploy. Produzione non letta e non scritta.

## Metodo e limite delle prove

Il mandato vieta qualsiasi query o dato toccato ma chiede fixture sul demo.
Ho usato **fixture sintetiche in memoria sul calendario reale compilato localmente**, non righe inserite in Supabase: nove appuntamenti e una richiesta, distribuiti dal 31 agosto al 6 settembre 2026. Il modulo dati e il contesto tenant erano sostituiti solo nel banco temporaneo; ogni funzione di scrittura del banco sollevava un errore. La pagina, i componenti, la ricerca e gli stili erano quelli del repository.

Nessun collegamento a Supabase, neppure al demo `qttpinkslhenxrsbhhhg`: queste sono controprove della superficie, **non prove vive del backend demo o dell'accesso staff**. Nessuna nuova rotta applicativa o dipendenza installata. Le sole risorse esterne ammesse dal browser di prova erano i font Google gia usati dall'app; Fraunces risulta caricato. Non e stata usata la sessione personale di Luigi.

`agent-browser` non era installato; usato Playwright gia disponibile con Chromium isolato **151.0.7922.34**. Il primo avvio del server nel sandbox e stato negato (`EPERM`); avvio autorizzato riuscito. Un primo tentativo di lancio Playwright cercava una revisione Chromium non presente: usato esplicitamente l'eseguibile gia installato, senza download.

## 1. Evidenziazione: misura, non solo bordo

La scheda trovata usa `--color-primary` su tutta la superficie, bordo e contorno `--color-text-primary`. Le scritte secondarie della sola scheda trovata diventano scure per conservare il contrasto. Dimensioni, peso del nome e posizione nella fascia restano invariati; la richiesta conserva il bordo tratteggiato e la propria etichetta. Nessun colore nuovo.

| Misura nella medesima settimana | Trovata, Arturo | Vicina non trovata, Lola |
| --- | --- | --- |
| Sfondo visibile | `#6f9792` | bianco del pannello; background della scheda trasparente |
| Bordo | `#2b2525`, spessori 1/1/1/3 px | `rgba(207,193,196,.6)`, accento sinistro `#6f9792`, stessi spessori |
| Contorno aggiunto | 2 px `#2b2525`, offset 1 px | nessuno |
| Nome e testo secondario | `#2b2525` | nome `#2b2525`, secondario `#7f6f73` |
| Peso nome | 650 | 650 |
| Dimensioni a 1365 px | 145,56 x 64,25 px | 145,56 x 64,25 px |
| Contrasto testo/sfondo della trovata | **4,68:1** | nome sul bianco **15,06:1** |

Rapporto fra campitura trovata e bianco della vicina: **3,22:1**; rispetto a `--color-surface-main`: **3,00:1**. Rapporti calcolati sulla luminanza relativa sRGB, non sulla distanza tra valori RGB.

Controllo sui pixel dello screenshot finale a 1365 px: due campioni interni di **144 x 62 = 8.928 pixel**. Campione Arturo `(448,400)`: **7.721 pixel** esattamente `#6f9792` (**86,48%**). Campione Lola `(448,330)`: **162 pixel** dello stesso verde (**1,81%**), limitati all'accento. La superficie verde misurata e **47,66 volte** quella della vicina: questa, insieme al contorno scuro, e la ragione visiva della scelta.

Nella settimana di dieci schede la corrispondenza e una: a 1365 x 900 px Arturo occupa `(447,64;399,30)` ed e visibile senza scorrere; a 1024 x 900 `(310,56;400,05)`. Tutte e dieci le schede sono nel viewport nei due casi. A 375 px i giorni restano impilati: Arturo e a `y=1344,75`, quindi richiede scorrimento. Non e stato introdotto uno spostamento automatico della pagina.

## 2. Calendarietto: causa osservata e correzione

La causa ipotizzata nel mandato **non e confermata** su Chromium: un clic sull'icona produce un evento sul suo SVG, una chiamata `showPicker()` e **zero clic inoltrati all'input**. E coerente con il comportamento previsto per i discendenti interattivi di un'etichetta nella [specifica HTML](https://html.spec.whatwg.org/multipage/forms.html#the-label-element).

Il comportamento riprodotto e diverso: il popup nativo si chiude **prima del `pointerdown`** del secondo clic, poi il gestore dell'icona invoca nuovamente `showPicker()`. Dopo due clic il selettore risulta ancora aperto (`input.matches(':open') = true`). Esc, invece, chiude gia la versione precedente: non dichiaro riprodotto un blocco assoluto del selettore.

Correzione: contenitore neutro con etichetta associata tramite `htmlFor`, focus sul campo prima dell'apertura e osservazione dello stato nativo `:open` tramite un frame programmato solo mentre il picker e aperto. Il riferimento conserva lo stato precedente alla chiusura nativa provocata dal clic: il secondo clic chiude senza riaprire. Dopo Esc o selezione, il frame rileva la chiusura e permette la successiva apertura; si interrompe da solo e viene cancellato allo smontaggio. Nessun polling quando il picker e chiuso.

Se `showPicker()` manca, genera un errore, non apre nulla, oppure `:open` non e supportato, rimangono **avviso e focus**, e il campo data diventa visibile e modificabile. L'avviso e nel flusso del layout, senza sovrapporsi alla griglia. Riferimenti: [showPicker](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker), [:open](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:open). La compatibilita concreta e verificata su Chromium; Safari resta nel passo Luigi.

## 3. Controprove funzionali

| Controprova | Risultato misurato |
| --- | --- |
| Dieci schede, ricerca `Arturo` | 10 presenti, 1 evidenziata |
| Nove non corrispondenti | confronto di tutte le proprieta CSS calcolate della scheda e dei discendenti: identiche prima e durante la ricerca |
| Conteggi superiori | sempre 9 prenotati, 1 da confermare, 0 lavorati sul momento |
| Struttura durante ricerca | sempre 7 giorni, 14 fasce, 14 margini, 7 piedi |
| Ricerca senza risultati / cancellata | 10 schede, 0 evidenziate in entrambi i casi |
| Ricerca richiesta `Ada` | 1 richiesta evidenziata, bordo tratteggiato conservato |
| Telefono `+39 333 456 7890` | `7890`, `333456`, numero intero formattato e `456-7890`: sempre 1 risultato |
| Nome / proprietario | `Arturo` e `Proprietario Arturo`: sempre 1 risultato |
| Icona, tre cicli | stato nativo `true,false` per ciascuno dei 3 cicli |
| Altre chiusure | Esc, clic esterno e selezione nativa del 3 settembre: chiusi, successiva riapertura riuscita |
| Tastiera | Space apre dall'icona, Esc chiude |
| Fallback | assenza API, eccezione, API senza effetto, assenza `:open`: avviso presente e focus sul campo visibile |
| Campo fallback | modifica al 10 settembre riuscita, nessuno sbordamento a 1024 px |
| Settimana vuota | 0 schede, 14 margini, 7 piedi conservati |
| Errori applicativi browser | 0 |

### Difetto telefonico trovato nella controprova

La funzione di normalizzazione era corretta ed e **identica alla base**. Ma `calendarItems` aggiungeva `phoneDigits` all'oggetto restituito e chiamava `isSearchMatch(item)` sull'oggetto originale, che ancora non aveva quella proprieta. La base, provata con `7890`, produceva **0 risultati**.

Modifica strettamente locale aggiunta in `Calendar.jsx`: costruire prima l'oggetto con `phoneDigits` e passare quello al confronto. Nessuna query o nuova logica di normalizzazione. E il terzo file applicativo, ulteriore ai due *attesi* nel mandato, necessario per soddisfare la controprova telefonica e il passo finale richiesto a Luigi. Non e una reinterpretazione grafica.

## 4. Dimensioni e bersagli

Viewport di prova alto 900 px; screenshot mobile a pagina intera. Coordinate del campo riferite al viewport in cima alla pagina.

| Larghezza | Campo ricerca: x, y; larghezza x altezza | Riga | Overflow orizzontale |
| --- | --- | --- | --- |
| 1365 | 672,77;149,30; 201,03 x 44 px | prima, con navigazione e conteggi a destra | 0 px |
| 1024 | 580,27;149,30; 201,03 x 44 px | prima; conteggi nella riga sotto | 0 px |
| 640 | 51,97;198; 575,03 x 44 px | seconda | 0 px |
| 390 | 51,97;213,25; 325,03 x 44 px | seconda | 0 px |
| 375 | 51,97;265,25; 310,03 x 44 px | **terza**, intervallo date in seconda | 0 px |

Quindi la seconda riga vale fra **390 e 640 px inclusi**; sotto 390 e la terza, come gia stabilito dal CSS di GH-64. Il selettore data resta nascosto sotto i 641 px. `min-height:0` e `flex-shrink:0` dei giorni mobile conservati e misurati.

Nella barra: **0 bersagli visibili sotto 44 px** e nessun testo dei pulsanti tagliato. Il selettore Settimana/Giorno non viene piu compresso sul desktop; il campo occupa tutta la sua riga mobile.

Nella griglia persistono bersagli preesistenti sotto soglia: **7 intestazioni giorno da 43 px** a tutte le larghezze e **14 pulsanti Prenota qui da 38 px** sul desktop (nascosti sul mobile). Dichiarati, non promossi come conformi e non ampliati in questo giro. Le schede hanno altezza minima 44 px desktop e 60 px mobile.

## 5. Evidenze e file esaustivi

| File | Atto / motivo |
| --- | --- |
| `src/apps/staff/components/CalendarKit.jsx` | apertura/chiusura nativa, etichetta, focus e fallback |
| `src/apps/staff/pages/Calendar.css` | campitura e contorno della corrispondenza; barra e campo fallback |
| `src/apps/staff/pages/Calendar.jsx` | passa al confronto l'oggetto gia dotato di telefono normalizzato |
| `docs/consegne/GH-65-una-evidenziazione-che-si-vede-esito.md` | questo registro |
| `docs/consegne/evidenze/GH-65/calendario-1365.png` | screenshot finale desktop |
| `docs/consegne/evidenze/GH-65/calendario-1024.png` | screenshot finale intermedio |
| `docs/consegne/evidenze/GH-65/calendario-375.png` | screenshot finale mobile, pagina intera |
| `docs/consegne/evidenze/GH-65/misure.json` | misure browser, controprove, baseline telefonica, contrasti e pixel |

Gli screenshot sono consultabili accanto al registro: [1365 px](evidenze/GH-65/calendario-1365.png), [1024 px](evidenze/GH-65/calendario-1024.png), [375 px](evidenze/GH-65/calendario-375.png).

## 6. Verifiche tecniche, tempi e pulizia

- `npm run build`: PASS, 159 moduli; Vite 1,27 s. Tempo reale **1,71 s**, CPU user 2,36 s, sys 0,26 s.
- Ultimo giro completo di controprove browser: PASS, tempo reale **3,98 s**, user 2,76 s, sys 0,94 s. I rilanci precedenti hanno verificato gli aggiustamenti della barra e il caricamento del font.
- `git diff --check`: PASS.
- Warning build preesistenti: Browserslist datato, bundle principale oltre 500 kB. Nessun aggiornamento di dipendenze.
- Suite RLS **non rieseguita**, come richiesto. Ultima misura viva: [GH-63](GH-63-il-demo-torna-a-pari-esito.md), **60 PASS, 0 FAIL, 0 SKIP**.
- Avvio sessione: **02/09/2026 06:44:08 CEST**. Controprove concluse entro **06:57:10 CEST**: **13 min 02 s** dall'avvio, comprensivi di ricognizione, prove della causa, implementazione e verifica. Redazione e commit successivi non inclusi in questo intervallo.
- Registro pronto alle **07:00:47 CEST**: **16 min 39 s** complessivi dall'avvio, inclusa la redazione; commit finale successivo.
- Nessun rallentamento prolungato della macchina osservato. Gli impedimenti iniziali erano permessi di avvio e selezione del runtime browser, non saturazione di RAM o disco misurata.
- Browser isolati chiusi, server `127.0.0.1:4185` arrestato. Directory temporanea `/tmp/gh65` rimossa: **0 file fixture residui**, nessuna fixture inserita nel DB, **0 accessi DB**. Restano solo gli screenshot e i numeri senza dati reali elencati sopra.

## Eccezioni e indicazioni per Cowork

Due differenze dal percorso atteso, dichiarate: fixture **locali in memoria** anziche su DB demo per rispettare il divieto di query/scritture; terzo file `Calendar.jsx` per correggere il difetto telefonico provato. Nessuna attivita su altre superfici, documenti Cowork o dati reali.

Consiglio: correggere la premessa documentale che definiva funzionante la ricerca telefonica di GH-64 e distinguere nei prossimi mandati di sola superficie tra fixture in memoria e fixture nel database. Il comportamento Safari va giudicato con il passo Luigi; nei browser privi dello stato nativo necessario il campo visibile e il ripiego deliberato, non un calendario ricostruito a mano.

## Passo finale Luigi e commit

Sul calendario aggiornato, dopo ricarica dall'origine (Option+Command+R): cercare le ultime quattro cifre di un numero presente, guardare anche le schede non trovate e aprire/chiudere il selettore tre volte. **Cosa non ti torna?** L'approvazione visiva di Luigi non e stata anticipata da Codex.

Commit locale con codice, registro ed evidenze: `fix(staff): make calendar matches visible and toggle date picker`. Hash ricavabile con `git log -1 --format=%H -- docs/consegne/GH-65-una-evidenziazione-che-si-vede-esito.md` e riportato nella risposta finale; non incorporato nel file per evitare un hash autoreferenziale. Nessun push.
