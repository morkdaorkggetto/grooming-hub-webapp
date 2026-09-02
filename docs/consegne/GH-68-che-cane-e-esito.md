# Consegna GH-68 - Che cane e

## Esito e perimetro

- **PASS tecnico locale**. La razza sostituisce "Appuntamento" sulla scheda; senza razza resta il testo precedente. Resta aperta la valutazione visiva di Luigi.
- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`, branch **main**, base **`e9c7249183a47d18c112a0014e3cab38b4f7e814`**. Git pulito all'avvio.
- Eseguito `docs/incarichi/GH-68-che-cane-e.md`: **nessun accesso DB, query aggiunta, migration, dato o credenziale modificati; nessun push, merge o deploy**. Le misure prod citate nel mandato non sono state rilette.
- Basta **CalendarKit.jsx**, +2/-1 righe: valore dal dato, fallback, attributo `title`. Nessuna modifica necessaria a `Calendar.jsx` o `Calendar.css`; troncatura CSS gia presente. Nessun nome di razza nel codice applicativo, nessuna normalizzazione, nessun proprietario aggiunto alla scheda.

## Testo e geometria

Banco con componenti e CSS reali, **9 appuntamenti e 1 richiesta sintetici in memoria**, settimana 31 agosto - 6 settembre. Baseline con `CalendarKit.jsx` letto dal commit base, stesso identico insieme di fixture prima/dopo. Chromium isolato **151.0.7922.34**, Playwright gia installato, viewport alti 900 px. Nessuna sessione personale; sole risorse localhost e font gia previsti dall'app.

| Caso | Testo integrale DOM e tooltip | Visibile nella settimana a 1365 px |
| --- | --- | --- |
| Primo Leo | `barboncino · 60′` | `barboncino · 60′` |
| Secondo Leo | `maltese · 60′` | `maltese · 60′` |
| Poldo, grafia maiuscola | `Barboncino · 60′` | `Barboncino · 6…` |
| Lola, razza null | `Appuntamento · 60′` | `Appuntament…`, come prima |
| Arturo, razza lunga | `Barboncina bianca e nera · 60′` | `Barboncina bi…` |

Anche stringa vuota (Tobia) e valore assente (Olivia) conservano **`Appuntamento · 60′`**. A 375 px il testo integrale di tutti questi casi entra; nessun avviso o invito aggiunto. La diversa grafia `barboncino` / `Barboncino` rimane nel DOM, nel tooltip e per intero sul telefono.

| Arturo | Larghezza disponibile della riga | Cosa si legge |
| --- | --- | --- |
| Settimana 1365 | 82,5625 px | `Barboncina bi…` |
| Settimana 1024 | 60,28125 px | `Barboncin…` |
| Giorno 1365 | 467 px | `Barboncina bianca e nera · 60′` |
| Settimana 375 | 242 px | `Barboncina bianca e nera · 60′` |

Prefisso visibile misurato con DOM Range, larghezze frazionarie effettive e larghezza del glifo di ellissi, confrontato con gli screenshot. Questo calcolo appartiene **solo al banco di misura**, non all'app: il codice applicativo non conta caratteri. A 1024 anche il valore breve puo accorciarsi (`barboncin…`): effetto della colonna esistente, non testo eliminato dal dato.

**Valore esteso**: `title` completo anche quando troncato. Snapshot accessibile della scheda: `button "11:00 Arturo Barboncina bianca e nera · 60′ Servizio: Bagno"`. Verificato l'albero accessibile, non simulata una lettura vocale con VoiceOver.

- Altezza **prima/dopo 64,25 / 64,25 px**, con e senza razza, a 1365/1024/375 e in vista giorno. Otto schede senza badge mantengono questa misura; Kira con badge preesistente mantiene **92,25 / 92,25 px**. Confrontate tutte e nove, non solo i due esempi.
- Tre elementi di testo nella colonna prima/dopo: nome, descrizione, servizio. Servizio **Bagno/Taglio invariato**, sulla propria riga; offset relativo **x=54, y=42,5 px**, altezza riga **15,75 px**. Etichette, colori, pesi e bordi confrontati senza differenze.
- A 375 px nessun overflow orizzontale; scheda di Arturo larga **305 px**. Piede della giornata **45 px**, visibile, testo `0 lavorati sul momento`; `flex-shrink: 0` e `min-height: 0px` conservati. Screenshot mobile acquisito dopo scorrimento su Arturo e sul piede, non del solo primo viewport.

## Dato gia presente e non regressioni

Catena esistente, non modificata: `src/apps/staff/lib/database.js`, `APPOINTMENT_SELECT` include gia `pet:pets(...breed...)`; `getCalendarWeekData` usa quella select, `mapPet` conserva il campo con lo spread, `mapAppointment` espone il pet anche come `client`. In `src/apps/staff/pages/Calendar.jsx` la mappa gia assegna `breed: appointment.client?.breed || ''`. `AppointmentChip` ora usa quel valore. **Una chiamata al caricamento settimana nel banco, prima e dopo; zero letture aggiuntive.** Non e una misura di traffico Supabase: quel traffico e escluso dal banco.

- Ricerca `Leo`: **2 corrispondenze**; `Carlo Test`: **1**, secondo Leo; `Proprietario Arturo`, `7890`, `333456`, `456-7890`: **1 ciascuna**, Arturo.
- Marcatura invariata: sfondo calcolato `color(srgb 0.435294 0.592157 0.572549 / 0.45)`, secondario `rgb(43, 37, 37)`, outline assente. Stili calcolati delle nove schede non corrispondenti identici prima/dopo ricerca.
- Conteggi sempre **9 prenotati, 1 da confermare, 0 lavorati sul momento**; 10 schede e 7 piedi giornata. Scheda richiesta Ada con HTML identico prima/dopo. Segnaposto, telefono, frecce e ritorno a oggi non modificati; passaggio settimana/giorno esercitato. Nessuna nuova prova estesa della navigazione oltre quelle del giro GH-67.
- **0 errori applicativi, 0 richieste esterne bloccate** nei giri finali. Screenshot desktop, giorno e mobile ispezionati visivamente. Nessuna prova Safari viva dichiarata.
- Suite RLS **non rieseguita**, come richiesto. Ultima misura viva: [GH-63](GH-63-il-demo-torna-a-pari-esito.md), **60 PASS, 0 FAIL, 0 SKIP**.

## Tempi, eccezioni e pulizia

- Intervallo misurato **02/09/2026 19:03:24 - 19:16:24 CEST: 13 minuti**, dall'avvio alla pulizia, comprese le attese. Nessuna pausa sottratta; redazione finale e commit successivi esclusi.
- Caricamento iniziale delle dipendenze lento, concentrato nell'import di Tailwind; esbuild e postcss rispondevano in circa 10,6 e 7,1 ms nella sonda. Un tentativo di preparazione e una sonda duplicata interrotti. Non attribuita una causa certa a RAM, disco o sandbox.
- Ricompilazione banco dopo il caricamento: **0,425 s**. Prove complete: **1,61 s**; ultima ripetizione con misure di larghezza frazionarie: **2,29 s** reali, user 1,85, sys 0,67.
- **Due build PASS**, 159 moduli, stesso risultato: prima **117,63 s** reali (Vite 1 min 46 s); ripetuta senza cambiare codice/configurazione **1,42 s** reali (Vite 1,11 s), user 2,19, sys 0,20. Miglioramento a dipendenze gia caricate, **non dimostrazione che la lentezza iniziale sia risolta**. Aggiornamenti inviati a Luigi, come richiesto durante il giro. Warning preesistenti: Browserslist datato e bundle oltre 500 kB.
- Un primo confronto del banco aveva un badge aggiunto alla fixture dopo la compilazione della baseline: ricompilata la baseline dal sorgente originale con fixture identiche; nessuna correzione dell'app per far passare la prova. Raffinata inoltre la misura del testo da larghezze intere a frazionarie per non perdere troncature al limite. Evidenze allegate solo del giro finale.
- Browser chiusi, server localhost **4188 arrestato**, `/tmp/gh68` rimossa: **0 file fixture residui, 0 fixture DB, 0 accessi DB**. Restano solo evidenze sintetiche. Nessuna attivita fuori istruzione; nessuna modifica parallela inattesa.

## File esaustivi e commit

| File | Contenuto |
| --- | --- |
| `src/apps/staff/components/CalendarKit.jsx` | razza/fallback e tooltip, +2/-1 righe |
| `docs/consegne/GH-68-che-cane-e-esito.md` | questo registro |
| `docs/consegne/evidenze/GH-68/week-1365.png` | settimana desktop |
| `docs/consegne/evidenze/GH-68/week-1024.png` | colonna stretta |
| `docs/consegne/evidenze/GH-68/day-1365.png` | valore integrale in vista giorno |
| `docs/consegne/evidenze/GH-68/mobile-375.png` | schede e piede sul telefono |
| `docs/consegne/evidenze/GH-68/measures.json` | misure prima/dopo, accessibilita e ricerca |

Commit locale unico `feat(staff): show pet breed in appointment cards`, hash comunicato nella risposta finale e ricavabile con `git log -1 --format=%H -- docs/consegne/GH-68-che-cane-e-esito.md`. Nessun push.

## Passo Luigi e nota a Cowork

Dopo il rilascio e ricarica dall'origine su Safari: guardare l'intera settimana, cercare i due Leo e osservare una scheda senza razza. **Cosa non ti torna?** Valutazione visiva ancora aperta. Limite misurato da tenere presente: a 1024 px una razza lunga conserva solo `Barboncin…`; taglia e colore sono nel tooltip e nel giorno, non nel colpo d'occhio settimanale. Nessuna estensione proposta o applicata ora: va prima raccolto quel giudizio del salone.
