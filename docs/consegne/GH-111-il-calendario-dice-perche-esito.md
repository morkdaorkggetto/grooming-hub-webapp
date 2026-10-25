# GH-111 - Il calendario dice perche: eseguito

25/10/2026, 06:12-06:23 CET (circa 11 minuti). Base effettiva `6dd5d842982a1d0c9d023776b107ba1bb7eb1a63`, branch corrente `main`. Canone 1.2 letto integralmente, SHA-256 `28a1c8d407c3bb624a4c0d499e14aee926472843e5192e3f70d4e961f8b82e71`. Unica sessione Codex; nessun push, merge, deploy o accesso al prodotto.

## Esito

Il calendario ora legge tutte le visite a pagine da 1.000, prendendo solo `pet_id,date`. Il report incassi usa la stessa paginazione per la lettura completa o per intervallo; mappatura e calcoli invariati. Un errore su qualunque pagina invalida l'intero indice. L'errore conserva classe, messaggio e oggetto nella console, ma all'utente resta la frase italiana. Il pulsante `Riprova` rilegge solo l'indice visite; un tentativo automatico segue il ritorno in primo piano o della rete. L'avviso mostra il tentativo in corso e scompare alla riuscita.

## Controprove

| Prova | Misura ed esito |
| --- | --- |
| Prima delle modifiche, demo sano | Chrome 155.0.8059.85: avviso assente, riquadro presente. Chrome 116 non disponibile su questo Mac. La causa dell'episodio del salone resta ignota. |
| Prima delle modifiche, rete interrotta solo sulla lettura iniziale delle visite | `net::ERR_INTERNET_DISCONNECTED`; avviso esatto `Non riesco a distinguere le lavorazioni negli appuntamenti passati.`; riquadro assente. |
| Prima delle modifiche, sessione scaduta simulata | Risposta 401 `PGRST301`, messaggio `JWT expired` sulla lettura; stesso avviso, riquadro assente. Non e una scadenza reale/rinnovo reale del token. |
| Dopo, errore e schermo | Console `Calendar visit index failed: Object TypeError: Failed to fetch` oppure `Object JWT expired`, con oggetto originale; sullo schermo solo il testo italiano e `Riprova`, nessun dettaglio grezzo. |
| Riprova manuale | Dopo primo errore simulato, `Riprovo a leggere le lavorazioni negli appuntamenti passati...` visibile; 2 richieste all'indice in totale; stesso URL `/calendar`, nessun reload, avviso 1 -> 0, riquadro 0 -> 1. La lettura della settimana non viene ripetuta. |
| Ritorno della rete e pagina visibile | Eventi `online` e `visibilitychange` provati separatamente: 2 richieste all'indice in ciascuna prova; avviso 1 -> 0 e riquadro 0 -> 1 senza intervento manuale. |
| Limite effettivo demo | Baseline 90 visite; inserite 1.001 fixture `[DEMO GH-111] cap-` solo sul demo: 1.091 righe, richiesta 0-2000 -> **1.000** righe con conteggio esatto 1.091, richiesta 1000-1999 -> 91. Il calendario reale ha fatto 2 richieste all'indice. Eliminate 1.001 fixture; **verifica separata dopo il DELETE: 90 visite, 0 fixture residue**. Il primo conteggio nella stessa istruzione `DELETE` vedeva ancora lo snapshot pre-cancellazione. |
| Visita oltre la prima pagina | Lettura simulata da 1.001 righe (nessuna scrittura): 1000 + 1; la seconda porta la visita di un appuntamento passato. Due richieste `offset=0` e `offset=1000`; una riga `Lavorazione registrata quel giorno`, sei `Nessuna lavorazione registrata quel giorno`; avviso assente. |
| Errore pagina 2 | Risposta simulata 500 alla seconda pagina: 2 richieste, avviso presente, riquadro assente, nessuna lista parziale. |
| Report incassi | Demo 90 visite. Query precedente e paginata: stessi 90 ID. Settimane dal 24/08, 03/08 e 06/07: rispettivamente **20,00 -> 20,00**, **70,00 -> 70,00**, **67,80 -> 67,80** euro. Massimo osservato 3 visite/settimana. Il totale storico era sotto la soglia, ma la lettura globale del report aveva lo stesso rischio futuro; corretto nella stessa funzione. `/reports/weekly` apre senza errore. |
| Impaginazione | 375 px: avviso x=13, largo349, pulsante alto46; documento largo375. 1365 px: avviso x=112,5, largo1140, pulsante alto44; documento largo1365. Nessuno sbordamento. |
| Build e controlli | `npm run build` verde (183 moduli, 1,25 s), `git diff --check` verde. Avvisi preesistenti Browserslist e bundle grande. `npm run lint -- --quiet` non eseguibile: `eslint: command not found` nelle dipendenze installate. |

Nessuna suite RLS: la lettura dedicata resta nello stesso `visits` staff gia accessibile e richiede soltanto `pet_id,date`. Nessuna nuova tabella, funzione, policy o migration. Nessuna scrittura definitiva: solo fixture temporanee sul demo e ripristino verificato.

## File del commit

Percorsi relativi a `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`:

| File | Modifica |
| --- | --- |
| `src/apps/staff/lib/database.js` | Lettura completa paginata; indice leggero calendario e report protetto dal limite. |
| `src/apps/staff/pages/Calendar.jsx` | Errore tracciabile, retry manuale/automatico isolato, avviso con stato. |
| `docs/consegne/GH-111-il-calendario-dice-perche-esito.md` | Questo registro. |

Mandato `docs/incarichi/GH-111-il-calendario-dice-perche.md`, SQL preesistenti, `controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/` e `supabase/rollback/` non modificati, non messi in stage e fuori commit; le cartelle private non sono state lette. Diario intatto. Ausili browser in `/tmp` non versionati. Fuori istruzione: nessuno. Commit identificabile con `git log -1 --format='%H %s' -- docs/consegne/GH-111-il-calendario-dice-perche-esito.md`; hash nella risposta finale.

Passo finale rimesso a Luigi e Davide: sul Chrome 116 del salone, a pagina ricaricata, se torna l'avviso annotare classe/messaggio in console e verificare se `Riprova` lo rimuove. Chiedere **cosa non torna**, non solo se funziona.
