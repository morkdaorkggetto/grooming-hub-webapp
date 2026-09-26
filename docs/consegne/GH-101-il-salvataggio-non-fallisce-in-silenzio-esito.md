# GH-101 - Il salvataggio non fallisce in silenzio: esito

## Esito

Il punto muto individuato da GH-100 è chiuso. Scrivendo un nome esatto che
appartiene a un solo pet, il selettore collega quella scheda e mostra subito
l'etichetta completa con razza e proprietario. Se il nome è condiviso, non
sceglie nulla: lascia visibili le alternative e spiega prima del pulsante
`Scegli un pet dall’elenco per salvare l’appuntamento.`

Ogni condizione che spegne un comando di salvataggio nel calendario ha ora un
testo già leggibile. Durante una scrittura il modale blocca testata, piede e
sfondo e mostra `Salvataggio in corso. Attendi l’esito.`; successo o errore
restano nello stesso modale. Infine una riga fuori dalle fasce continua a
comparire in `Da collocare` anche quando l'intero giorno è chiuso.

## Base e perimetro

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `eb358894c0b07b06eaaf12dc35ec21322a2ec116`.
- Nessuna migrazione, colonna, policy, rotta, dipendenza o configurazione.
- Database demo e produzione: **non letti e non scritti**.
- Nessun push, merge o deploy.
- Suite RLS non rieseguita come prescritto; ultima misura viva dichiarata:
  GH-96, **60 PASS del 19 settembre 2026**.

Il mandato GH-101 e tutti i materiali paralleli preesistenti sono rimasti
fuori da modifiche, stage e commit.

## Scelta tecnica

`CalendarPetCombobox` applica tre regole:

1. conserva una scelta già esplicita mentre il testo continua a descriverne
   l'etichetta;
2. collega automaticamente soltanto **una corrispondenza esatta e univoca**
   sul nome o sull'etichetta completa;
3. con zero o più di una corrispondenza esatta azzera la scelta e richiede un
   tocco su una riga dell'elenco.

L'univocità viene calcolata tra tutte le opzioni, non tra le sole prime dodici
mostrate. Perciò un omonimo fuori dal tratto visibile impedisce comunque una
scelta automatica. Il salvataggio, i controlli di capienza e la funzione
database restano quelli esistenti.

Per il componente condiviso `Modal` è stata aggiunta la sola prop opt-in
`closeDisabled`. Se assente vale `false`; nessun uso cambia implicitamente.

## File del commit

| File | Intervento |
|---|---|
| `src/apps/staff/components/CalendarKit.jsx` | Selezione univoca sicura e resa permanente di `UnplacedItems` nella settimana |
| `src/apps/staff/pages/Calendar.jsx` | Motivi visibili, protezione dei quattro modali di scrittura e chiusure del piede disabilitate durante l'attesa |
| `src/shared/ui/Modal.jsx` | Blocco opt-in di testata e sfondo |
| `docs/consegne/evidenze/GH-101/browser-check.mjs` | Banco Chromium con Supabase interamente in memoria |
| `docs/consegne/evidenze/GH-101/browser.json` | Testi, esiti e misure browser |
| `docs/consegne/evidenze/GH-101/static-check.mjs` | Ricerca usi Modal e confronto SHA-256 delle superfici escluse |
| `docs/consegne/evidenze/GH-101/static.json` | Impronte e risultati statici |
| `docs/consegne/evidenze/GH-101/clover-autoselected-375.png` | Clover univoco collegato senza toccare la riga |
| `docs/consegne/evidenze/GH-101/homonyms-guidance-375.png` | Due Leo non selezionati e motivo visibile |
| `docs/consegne/evidenze/GH-101/closed-day-visible-1365.png` | Riga delle 20:00 visibile nel giorno chiuso |
| `docs/consegne/GH-101-il-salvataggio-non-fallisce-in-silenzio-esito.md` | Registro |

## Clover, prima e dopo

**Prima**, prova GH-100: scrivendo `Clover` senza toccare la riga, l'id
selezionato restava vuoto, `Salva appuntamento` era disabilitato, il tocco
produceva **0 insert** e il testo esplicativo era **niente**. Evidenza:
`docs/consegne/evidenze/GH-100/disabled-unselected-375.png`.

**Dopo**, prova GH-101 a 375 px: scritto `Clover`, senza toccare una riga,
l'input diventa `Clover · Maltese · Ada Verdi`, Salva è attivo e l'insert è
uno. Esito letto nello stesso modale:

`Appuntamento salvato per sabato 26 settembre alle 17:00. Il prossimo orario libero è già pronto.`

Evidenza: `clover-autoselected-375.png` e `browser.json`.

Con due `Leo`, entrambi Meticcio, il risultato è invece:

- `Leo · Meticcio · Ada Verdi`;
- `Leo · Meticcio · Bruno Blu`;
- selezione automatica: **no**;
- Salva disabilitato;
- testo già visibile: `Scegli un pet dall’elenco per salvare l’appuntamento.`

## Condizioni di salvataggio

Ricerca eseguita:

```sh
rg -n "Salva appuntamento|Salva orario|Conferma e prepara WhatsApp|Elimina definitivamente|loading=\{saving\}|disabled=" src/apps/staff/pages/Calendar.jsx
```

| Comando e condizione | Stato | Testo leggibile senza premere |
|---|---|---|
| Nuovo appuntamento, pet non scelto | disabilitato | `Scegli un pet dall’elenco per salvare l’appuntamento.` |
| Nuovo appuntamento, creazione pet aperta | disabilitato | `Completa o annulla la creazione del pet prima di salvare.` |
| Nuovo appuntamento, capienza esaurita | disabilitato | `Le postazioni sono tutte occupate nella fascia scelta.` |
| Nuovo appuntamento, scrittura in corso | disabilitato/loading | `Salvataggio in corso. Attendi l’esito.` |
| Conferma richiesta, capienza esaurita | disabilitato | `Le postazioni sono tutte occupate nella fascia scelta.` |
| Conferma/rifiuto richiesta, scrittura in corso | disabilitato/loading | `Salvataggio in corso. Attendi l’esito.` |
| Salva orario, appuntamento `no_show` | disabilitato | `Annulla prima l’assenza per modificare data e ora.` |
| Salva orario, capienza esaurita | disabilitato | `Le postazioni sono tutte occupate nella fascia scelta.` o il blocco di ripristino già specifico |
| Salva orario, scrittura in corso | disabilitato/loading | `Salvataggio in corso. Attendi l’esito.` |
| Elimina definitivamente, scrittura in corso | disabilitato/loading | `Salvataggio in corso. Attendi l’esito.` |

Data o ora mancanti continuano intenzionalmente a non spegnere il pulsante:
premendo compare `Pet, data e ora sono obbligatori.`. Il banco ha verificato
che l'errore resta nel modale.

Nessuna spiegazione dipende dal click di un elemento `disabled`: tutte le
frasi della tabella sono presenti nel DOM prima del tentativo.

## Modale durante il salvataggio

Con insert rallentato in memoria, il banco ha misurato separatamente:

| Via di uscita | Durante `saving` | Dopo l'esito |
|---|---|---|
| `Chiudi` in testata | disabilitato; click programmatico non chiude | riabilitato |
| `Chiudi` nel piede | disabilitato; click programmatico non chiude | riabilitato |
| sfondo | `mousedown` non chiude | torna alla funzione ordinaria |

Durante l'attesa è visibile `Salvataggio in corso. Attendi l’esito.`. Poi il
successo resta nel modale:

`Appuntamento salvato per sabato 26 settembre alle 18:15. Il prossimo orario libero è già pronto.`

La controprova di rifiuto mostra nello stesso modale:

`Non riesco a creare l'appuntamento: collegamento interrotto`

Il modale era ancora presente dopo entrambi gli esiti.

## Giorno chiuso

Fixture in memoria: domenica chiusa, un solo appuntamento alle 20:00, quindi
fuori dalle fasce 09-19. Nella settimana si leggono:

- `chiuso`;
- `Da collocare`;
- riga `FuoriFascia`, ore `20:00`.

Conteggio riepilogo: **1 prenotato**. Righe appuntamento disegnate nel giorno:
**1**. Conteggio e resa coincidono **1 / 1**. Prima di GH-101 la stessa fixture
produceva 1 contato / 0 disegnati, come registrato e fotografato da GH-100.

La correzione non riapre le fasce del giorno chiuso: sposta soltanto
`UnplacedItems` fuori dal ramo che prima lo nascondeva.

## Modal condiviso e superfici escluse

Ricerca esaustiva di import e `<Modal>` su `src/`:

- import del componente condiviso: **1**, in `Calendar.jsx`;
- usi: **5**;
- modali di scrittura protetti con `closeDisabled`: manuale, richiesta,
  dettaglio, cancellazione, **4**;
- modale `Registra lavorazione` invariato: **1**.

Sul modale invariato il banco ha chiuso con successo, in tre aperture
separate, da testata, piede e sfondo. La prop di default conserva quindi il
contratto precedente.

Impronte in `static.json`:

- altre pagine staff rispetto a `Calendar.jsx`: **19/19** SHA-256 identiche
  alla base;
- `src/apps/customer`: diff vuoto;
- cinque file del pallino e suono GH-81 (`StaffApp`, `StaffRequestAlerts`,
  `StaffKit`, `gh15-staff.css`, `Icon`): **5/5** SHA-256 identiche;
- CSS modificati: **0**; colori nuovi: **0**; geometrie CSS nuove: **0**.

## Responsive e accessibilità

| Viewport | Overflow orizzontale | Bersagli interessati | Testo guida |
|---:|---:|---|---|
| 375 px | 0 px | 44, 46 e 46 px | non troncato |
| 1365 px | 0 px | nessun bersaglio nuovo | riga chiusa leggibile |

Le schermate sono state ispezionate a dimensione originale: nessuna
sovrapposizione, nessun testo perso e nessun nuovo bersaglio sotto 44 px.

## Verifiche e tempi

| Verifica | Esito | Tempo |
|---|---|---:|
| Banco Chromium finale | PASS, 0 errori pagina, 0 richieste impreviste | 3,645 s |
| Controllo statico e impronte | PASS | < 1 s |
| Revisione React | PASS: stato derivato in render, nessun effect/listener/fetch nuovo | manuale |
| `npm run build` | PASS, Vite 5.4.21, 167 moduli | 1,25 s |
| `git diff --check` | PASS | < 1 s |
| Lint | NON ESEGUIBILE: `node_modules/.bin/eslint` assente | — |

Avvisi build non bloccanti e preesistenti: `caniuse-lite` datato e chunk JS
oltre 500 kB.

Tre passate del banco sono state scartate senza effetti applicativi: la prima
contava anche la riga «creane uno nuovo» tra gli omonimi; la seconda attendeva
un selettore globale invece del pulsante del modale corrente; la terza usava
un orario che collideva davvero con Clover appena salvato. Corrette le sole
aspettative del banco, la passata finale è verde.

## Passo Luigi

Resta la verifica umana prevista dal mandato. Sul gestionale:

1. scrivere un nome univoco senza toccare la riga: deve comparire l'etichetta
   completa e Salva deve attivarsi;
2. scrivere un nome condiviso: nessuno deve essere scelto e il motivo deve
   essere già leggibile;
3. salvare e provare immediatamente testata, piede e sfondo: il modale deve
   restare fino all'esito;
4. riportare: **«cosa non ti torna?»**.

Sul caso del 26 settembre, questa versione avrebbe salvato Clover se il nome
fosse stato univoco; se fosse stato ambiguo avrebbe detto a Davide, prima del
tocco, che doveva scegliere la riga corretta.

## Commit

Commit locale previsto: `fix: make calendar saves explicit (GH-101)`.
Hash risolvibile con
`git log -1 --format=%H -- docs/consegne/GH-101-il-salvataggio-non-fallisce-in-silenzio-esito.md`.
Nessun push eseguito.
