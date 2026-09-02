# Consegna GH-67 - La velatura giusta, e il calendarietto che se ne va

## Esito, base e mandato effettivo

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`; branch `main`, base **`03808068d59a055cf867848af8fb7eb5acaa19b4`**. Git pulito all'avvio.
- **Eseguita la versione locale aggiornata di GH-67**: velatura al 45% e rimozione completa del comando "Vai a data". Build e controprove locali PASS; resta lo sguardo di Luigi su Safari dopo il rilascio.
- Durante il giro Luigi ha prima sospeso il lavoro sul picker. Successivamente Cowork ha aggiornato il mandato sostituendo la riparazione con la rimozione; mi sono fermato e Luigi ha confermato: **"si lavora sul task aggiornato"**. Questa e l'istruzione finale applicata, non la sospensione intermedia.
- Documento Cowork modificato: `docs/incarichi/GH-67-la-velatura-giusta-e-il-calendarietto-che-si-chiude.md`, impronta Git del contenuto **`c3719b83b0eccb37a5111242e839bbfe6f99fc2e`**. Autorizzato da Luigi, non modificato da Codex, completamente escluso da stage e commit.
- Nessuna query, migration, modifica di dati o credenziali; nessun collegamento a Supabase, nessun push, merge o deploy. Le misure di produzione presenti nel mandato sono di Cowork e non sono state rilette sul DB.

## 1. Velatura e leggibilita

Usato il primario esistente al **45%**, senza nuovi token o colori assoluti. Il pixel risultante e **`#bed0ce`**. Il bordo conserva colore e spessori; cambia il testo secondario solo nella scheda marcata, usando `--color-text-primary`.

| Misura sul risultato | Valore |
| --- | --- |
| Velatura / pannello bianco effettivo `#ffffff` | **1,60:1**, dentro 1,3-1,8 |
| Velatura / superficie pagina `#fbf6f3` | **1,49:1**, dentro 1,3-1,8 |
| Secondario originale `#7f6f73` sulla nuova velatura | **2,96:1**, insufficiente: motivo dello scurimento |
| Secondario richiesta originale `#7f5d60` sulla nuova velatura | **3,60:1**, insufficiente: scurito anche questo |
| Secondario dopo, `#2b2525` / velatura | **9,40:1**, sopra 4,5 |
| Bordo `#2b2525` / velatura; bordo / bianco esterno | **9,40:1; 15,06:1** |
| Bordo appuntamento, alto/destra/basso/sinistra | prima e dopo **1/1/1/3 px** |
| Bordo richiesta | prima e dopo **1/1/1/1 px**, tratteggiato |
| Contorno aggiunto | prima e dopo **0 px** |

Nome, peso del nome (650), orario e servizio gia scuro non cambiano. La banda della richiesta conserva il proprio bordo originale: scurito il testo, non il bordo. I rapporti sono calcolati con luminanza relativa sRGB, sul colore reso misurato.

**Pixel, stesso metodo GH-65:** campioni interni di **144 x 62 = 8.928 pixel**, Arturo `(448,400)`, Lola `(448,330)`. Arturo: **7.739 pixel** esattamente `#bed0ce`, **86,68%**. Lola: **162 pixel** del primario pieno dell'accento preesistente, **1,81%**. Rapporto fra area velata e area dell'accento **47,77x**. Si contano due intensita diverse dello stesso primario; l'esatto RGB della velatura sulla vicina compare **0 volte**, quindi il rapporto dello stesso RGB non ha denominatore non nullo.

## 2. Rimozione e percorsi rimasti

**Prerequisito verificato prima di rimuovere il comando**, poi ripetuto sul codice finale: clic sul venerdi 4 settembre dalla settimana apre la vista giorno; freccia avanti porta al sabato 5, indietro al venerdi 4; clic sull'intervallo torna a mercoledi 2. Una freccia settimana e un clic sul sabato 12 raggiungono il giorno a dieci giorni da oggi in **2 clic**. Interruttore Settimana/Giorno e ritorno alla settimana corrente funzionanti.

Rimossi pulsante, icona locale, campo nascosto, fallback/avviso, riferimenti e stato del picker, ciclo rAF, import `useRef` divenuto inutilizzato, regole CSS desktop/mobile e `:focus-within` del comando. Tolte anche le proprieta `dateValue`/`onDate` dal chiamante in `Calendar.jsx`: terzo file necessario alla rimozione esplicitamente richiesta, senza cambiare le altre funzioni di navigazione o la ricerca.

**Ricerca statica:** `date-jump|date-input|showPicker|dateValue|onDate|focus-within|datePicker|dateInputRef|calendarPickerUnavailable|Vai a data|apertura rapida` nei tre file del calendario: **0 corrispondenze**. Ricerca estesa a `src/apps/staff`: restano solo omonimi indipendenti in `VisitForm.jsx` e `.gh-search:focus-within` negli stili comuni, non residui di questo comando e non modificati. DOM finale: **0 pulsanti Vai a data, 0 input data nella barra, 0 wrapper date-jump, 0 avvisi fallback**.

## 3. Barra prima e dopo

Coordinate del campo di ricerca a viewport alto 900 px; larghezza/altezza del campo invariata.

| Larghezza | Ricerca prima (x,y) | Ricerca dopo (x,y) | Dimensioni | Righe navigazione prima/dopo | Bersagli finali sotto 44 px / overflow |
| --- | --- | --- | --- | --- | --- |
| 1365 | 672,77; 149,30 | 613,77; 149,30 | 201,03 x 44 | 1 / 1 | 0 / 0 px |
| 1024 | 580,27; 149,30 | 521,27; 149,30 | 201,03 x 44 | 1 / 1 | 0 / 0 px |
| 375 | 51,97; 265,25 | identiche | 310,03 x 44 | 3 / 3 | 0 / 0 px |

Sul desktop la ricerca guadagna **59 px verso sinistra** (comando, involucro e spazio fra elementi). **Sul telefono NON risale di riga**: resta la terza, come prescrive il CSS gia esistente; il comando era gia nascosto. Nessuna ricomposizione aggiunta. I sei bersagli finali della barra hanno entrambe le dimensioni almeno 44 px. Nel JSON preliminare compare anche il vecchio input invisibile da 1 px: non era un bersaglio interattivo (`opacity:0`, `pointer-events:none`), ed e stato rimosso.

## 4. Controprove ed evidenze

Solo fixture sintetiche **in memoria**, 9 appuntamenti e 1 richiesta, 31 agosto - 6 settembre 2026, su calendario reale compilato con modulo dati e contesto tenant sostituiti nel banco. Ogni scrittura del banco sollevava errore. Chromium isolato **151.0.7922.34**, Playwright gia installato, nessuna sessione personale o dipendenza nuova. Ammesse solo risorse localhost e font gia usati dall'app.

- Una corrispondenza su dieci schede: tutte le dieci visibili senza scorrimento a **1365 x 900 e 1024 x 900**; screenshot controllati visivamente.
- **Nove schede non corrispondenti identiche**, confronto di tutti gli stili calcolati dei contenitori e discendenti prima/dopo ricerca. Dieci schede non marcate identiche anche con CSS precedente e nuovo.
- Conteggi invariati: **9 prenotati, 1 da confermare, 0 sul momento; 7 giorni, 14 margini**.
- `Arturo`, `Proprietario Arturo`, `7890`, `333456`, `456-7890`: **1 corrispondenza ciascuno**, stesso pet. Normalizzazione e oggetto di confronto non modificati.
- Segnaposto `pet, proprietario, cell`, etichetta e nome accessibile `Cerca` invariati; testo completo a 1365/1024/375, nessun overflow.
- Prove di navigazione prima e dopo rimozione PASS; **0 errori app e 0 richieste esterne bloccate** nei giri finali.
- RLS non rieseguita: ultima misura viva [GH-63](GH-63-il-demo-torna-a-pari-esito.md), **60 PASS, 0 FAIL, 0 SKIP**.

## Tempi, impedimenti e pulizia

- Intervallo totale rilevato **02/09/2026 08:02:33 - 08:19:47 CEST: 17 min 14 s**, dall'avvio alla pulizia, comprese attese e conferme; nessuna pausa sottratta. Redazione finale e commit successivi esclusi. Ripresa dopo conferma del nuovo mandato misurata da **08:14:05**, quindi **5 min 42 s** fino alla pulizia.
- Ultima verifica marcatura: **1,78 s** reali, user 2,08 s, sys 0,54 s. Ultima verifica navigazione/barra: **2,06 s**, user 1,32 s, sys 0,66 s.
- Build finale **PASS**, 159 moduli, Vite **7,33 s**; reale **7,76 s**, user 2,65 s, sys 0,28 s. `git diff --check` PASS. Warning preesistenti: Browserslist datato, bundle principale oltre 500 kB.
- Rallentamenti segnalati a Luigi: caricamento iniziale delle dipendenze e build precedente interrotta dopo **58,88 s** mentre il lavoro era sospeso per conferma. Rilancio build fuori sandbox riuscito; nessuna diagnosi di saturazione RAM/disco senza misure conclusive. Un primo assert del banco presumeva l'anno nel titolo giorno: corretto contro l'etichetta effettiva, non era un guasto della navigazione.
- Prima del cambio di mandato, Computer Use non riusciva ad acquisire Safari (`ScreenCaptureKit -3811`, anche dopo reset). **Nessuna prova Safari viva dichiarata PASS**; nessuna riparazione del picker tentata nell'app. Il mandato finale elimina il comando e affida a Luigi il controllo visivo Safari. L'inventario strumenti ha esposto titoli/indirizzi di schede gia aperte, senza consultare o ricaricare quelle pagine.
- Browser isolati chiusi, server localhost 4187 arrestato; `/tmp/gh67` rimossa: **0 file fixture residui, 0 fixture DB, 0 accessi DB**. Restano solo evidenze sintetiche sotto elencate.

## File esaustivi e commit

| File | Atto |
| --- | --- |
| `src/apps/staff/pages/Calendar.css` | 45%, secondario leggibile, rimozione stili del comando: +8/-91 righe |
| `src/apps/staff/components/CalendarKit.jsx` | rimozione completa picker e import inutile: +1/-61 |
| `src/apps/staff/pages/Calendar.jsx` | sole proprieta inutilizzate del chiamante: +0/-6 |
| `docs/consegne/GH-67-la-velatura-giusta-e-il-calendarietto-che-si-chiude-esito.md` | questo registro |
| `docs/consegne/evidenze/GH-67/baseline-1365.png` | baseline 5% con comando data |
| `docs/consegne/evidenze/GH-67/after-1365.png` | risultato desktop |
| `docs/consegne/evidenze/GH-67/after-1024.png` | risultato intermedio |
| `docs/consegne/evidenze/GH-67/toolbar-after-375.png` | barra e primo viewport mobile |
| `docs/consegne/evidenze/GH-67/measures.json` | marcatura, contrasti, pixel e ricerca |
| `docs/consegne/evidenze/GH-67/navigation-before.json` | prerequisito navigazione e barra prima |
| `docs/consegne/evidenze/GH-67/navigation-after.json` | navigazione, assenza comando e barra dopo |

Nessuna attivita fuori dal mandato finale. Scostamento dall'elenco iniziale di due file: `Calendar.jsx`, richiesto dalla rimozione delle proprieta indicate nel mandato stesso. Documento Cowork escluso, come confermato.

Commit locale unico con codice, registro ed evidenze: `fix(staff): strengthen calendar tint and remove date jump`. Hash riportato nella risposta finale, ricavabile con `git log -1 --format=%H -- docs/consegne/GH-67-la-velatura-giusta-e-il-calendarietto-che-si-chiude-esito.md`. Nessun push.

## Passo Luigi e nota a Cowork

Dopo il rilascio e ricarica dall'origine su Safari: cercare un pet in una settimana piena, confrontare la marcatura con le vicine, guardare la barra e raggiungere un giorno preciso con intestazione/frecce. **Cosa non ti torna?** L'accettazione visiva resta aperta. La rimozione evita il popup, ma non dimostra da sola che rinunciare ai salti lontani sia comodo per consultare lo storico: questo e il limite da valutare, senza reintrodurre ora controlli fuori mandato.
