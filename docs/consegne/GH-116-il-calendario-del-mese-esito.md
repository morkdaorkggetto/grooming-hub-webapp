# GH-116 - Il calendario del mese

**Esito:** implementato e verificato sul solo demo. Base `b162a07d3314eb86eceb3721b3d0c9b6fe58d075`, branch `main`; commit locale: quello che contiene questo registro (`git log -1 --format=%H -- docs/consegne/GH-116-il-calendario-del-mese-esito.md`). Nessun push, merge, deploy, migrazione o accesso alla produzione. Canone 1.3 verificato il 10/11, fonte `~/Desktop/_metodo/CANONE.md`, SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43`.

## Scelta e regole

`DesiredDateStrip` e stato **sostituito** dal calendario del mese mantenendo i due percorsi di importazione esistenti: nessun terzo selettore. Sei righe fisse, frecce 44px, caselle 44px (40 nel riquadro, 50 nella colonna desktop), punto dei periodi pieni. Le tre fasce hanno la griglia e l'altezza 54px di CD-12; il componente condiviso e i suoi testi preesistenti restano invariati. `max_months_ahead` e intero positivo con default 2; `closed_dates` e elenco validato di date con default vuoto. Le chiusure vengono da `getBookingSchedule`/`getDateClosure`, la legenda dalle stesse regole. Il limite e lo stesso giorno N mesi dopo; l'ultima data mostrata nella frase salta domeniche e date chiuse. Il primo mese passa al successivo se restano meno di sette date chiedibili. `canSubmit`, fascia facoltativa, avvisi esistenti e pulsante GH-115 non sono stati modificati.

## Controprove

| Prova | Risultato misurato |
| --- | --- |
| 10/11, 375px | Novembre 2026; freccia sinistra disabilitata; 10/11 e domenica 15 disabilitati; legenda `dom chiuso · lun solo pomeriggio`; sei righe da 44px; `scrollWidth=375`. |
| Mese limite | Dopo due frecce: gennaio 2027, freccia destra disabilitata, 9/1 selezionabile, 10/1 chiuso; testo `Si può chiedere fino a sabato 9 gennaio.` |
| Impostazioni temporanee demo | `max_months_ahead=3`: febbraio 2027 e testo `Si può chiedere fino a mercoledì 10 febbraio.`; `closed_dates=["2026-12-25"]`: 25/12 disabilitato, legenda `25 dic chiuso`. Prima MD5 di `tenants.settings` `26327442803a6426d07c74c8feca0f33`; dopo il ripristino esatto lo stesso MD5, entrambe le chiavi di prova assenti. |
| 26/11 simulato | Helper puro: primo mese dicembre 2026. Non e stato alterato l'orologio della webapp. |
| Lunedì | Selezionata prima Mattina sul 12/11, poi lunedì 16/11: Mattina `disabled=true`, `aria-pressed=false`; testo `Hai scelto lunedì 16 novembre`. |
| Natale | Il 25/12, prima della chiusura di prova, aveva il punto in griglia e l'avviso esistente `Periodo pieno (Natale):`; testo `Hai scelto venerdì 25 dicembre`. |
| Invio da calendario | Richiesta demo per Luna/Bagno, 17/11/2026, fascia facoltativa non scelta. UI: `Ci pensiamo noi da qui.` e `martedì 17 novembre 2026`; riga DB `desired_date=2026-11-17`, `time_preference=NULL`. |
| Riquadro alternativa | Sulla stessa fixture, due alternative sintetiche; `Nessuna di queste mi va bene` apre il calendario, selezione 24/11 mostra `Hai scelto martedì 24 novembre`. Invio della nuova disponibilita non eseguito: bastava verificare la scelta. A 375px riquadro largo 303px, righe 40px e frecce 44px. |
| Ripristino fixture | Richieste di Mario 0 prima, 1 durante, 0 dopo; ID della sola fixture `a2b87978-4b4d-42e4-b238-50fdd8d543ed` eliminato, conteggio ID 0. Nessuna altra riga creata. |
| Layout | A 1365px `scrollWidth=1365`, calendario largo 440px, sei righe da 50px, tre fasce alte 54px. A 375px `scrollWidth=375`, tre colonne da 111.7px e fasce alte 54px; fasce bottom 433px, barra GH-115 top 629px, sovrapposizione 0 nella prova di selezione. Il caso con due avvisi insieme, gia dichiarato da CD-12, non e stato prodotto. |
| Build e statico | `npm run build` riuscito (183 moduli), `git diff --check` riuscito. Avvisi esistenti Browserslist e bundle >500 kB. 13 assert su date/chiusure/limiti passati. `npm run lint` non eseguibile: `eslint: command not found`; nessuna dipendenza aggiunta fuori perimetro. |

Un primo tentativo di assegnare **una** alternativa alla fixture e stato rifiutato dal vincolo demo `appointment_requests_alternatives_valid` (`23514`, ammesse 0/2/3): nessuna scrittura prodotta. La prova e stata rifatta con due alternative e la fixture interamente rimossa.

## File consegnati

| File | Modifica |
| --- | --- |
| `src/shared/ui/DesiredDateStrip.jsx` | Calendario condiviso, navigazione, stati, legenda e data scelta. |
| `src/shared/ui/DesiredDateStrip.css` | Misure CD-12, griglia delle fasce nel riquadro e correzione della regola preesistente che forzava a 54px i pulsanti del calendario. |
| `src/apps/customer/lib/bookingDates.js` | Orizzonte, primo mese, celle e ultima data chiedibile. |
| `src/shared/tenant/bookingSchedule.js` | Lettura e validazione delle due nuove chiavi, chiusura per data. |
| `src/apps/customer/pages/Book.jsx` | Calendario e ordine del passo 3, senza cambiare gli avvisi o l'invio. |
| `src/apps/customer/pages/Book.css` | Spazi e tre fasce da 54px del solo passo 3, riuso dello stile testuale esistente. |
| `src/apps/customer/components/PendingRequest.jsx` | Calendario nel riquadro della nuova data, con gancio di stile circoscritto. |
| `docs/consegne/GH-116-il-calendario-del-mese-esito.md` | Questo registro, nello stesso commit del codice. |

**Eccezione testuale:** le fasce conservano le etichette preesistenti con gli orari e `Non disponibile` invece delle etichette brevi della tela CD-12; `BookingTimePreferenceChips.jsx` non e nel perimetro. La disposizione e l'altezza richieste sono applicate senza cambiarne comportamento o testo. **Fuori istruzione:** nessuna modifica. Il mandato GH-116, la consegna CD-12, le cartelle private `controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/` e i file SQL/rollback preesistenti restano fuori da stage e commit; i materiali privati non sono stati letti. **Scoperte:** 2 (regola CSS a 54px nel riquadro; vincolo DB sulle alternative). **Recuperi:** 1 (override CSS mirato). **Passaggi richiesti a Luigi:** 2 (uso login demo; invio e pulizia della richiesta). **Tempo:** avvio 13:15 CET, verifica finale 13:38 CET, circa 23 minuti misurati.
