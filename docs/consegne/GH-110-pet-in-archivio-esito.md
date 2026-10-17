# GH-110 — Pet in Archivio: eseguito

17/10/2026, chiusura controlli ore 06:16 CEST. Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, repository `webapp/`, base verificata `65c48cd81802d27cfe46d659b25921ab2d63d569`.
Canone adottato/corrente 1.2, letto integralmente; SHA-256 `/Users/luigimaisto/Desktop/_metodo/CANONE.md`: `28a1c8d407c3bb624a4c0d499e14aee926472843e5192e3f70d4e961f8b82e71`.

Una sola stringa applicativa: `Clienti attivi` → `Pet in Archivio`. Maiuscolo affidato allo stile esistente. Confronto automatico con `git show 65c48cd:src/apps/staff/pages/Dashboard.jsx`: file identico salvo quella sostituzione; `clients.length` e helper invariati.

## Verifiche

- `rg -n 'Clienti attivi' src/`: zero risultati (exit1).
- Demo `qttpinkslhenxrsbhhhg`, sonda staff esistente, lettura autorizzata da Luigi e precisata da Cowork nel mandato durante il giro. Nessuna fixture, scrittura applicativa o accesso produzione; richieste mutative bloccate preventivamente, unico POST ammesso il login Auth. Nessuna richiesta applicativa mutativa tentata.
- Prima/dopo stessa dashboard e stesso demo: **7 → 7**, helper **3 con score positivo → 3 con score positivo**. Anche le altre due celle invariate: storico90, blacklist1. Il prima usa il modulo servito con la sola etichetta ripristinata al testo della base nel browser, senza modificare i dati o il file locale.
- Browser Chromium, viewport375/1365: testo computed uppercase, nessun troncamento o sbordamento. Larghezza testo111.45px; spazio etichetta293/120.83px. Screenshot del solo riepilogo, senza nomi o telefoni. Console senza errori. Misura ore06:15:29 CEST in `browser.json`; prova eseguita con `node /private/tmp/gh110-browser.mjs` (ausilio temporaneo, non applicativo).
- `npm run build`: verde,183 moduli; prima52.02s, ripetizione dopo intervento di Luigi sui file cloud1.36s. Miglioramento osservato, non isolata la componente cache. Avvisi preesistenti Browserslist/chunk grande. `git diff --check`: passa.

## File del commit

Percorsi relativi a `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`:

| File | Modifica |
|---|---|
| `src/apps/staff/pages/Dashboard.jsx` | Sola etichetta |
| `docs/consegne/GH-110-pet-in-archivio-esito.md` | Registro |
| `docs/consegne/evidenze/GH-110/browser.json` | Misure prima/dopo e geometria |
| `docs/consegne/evidenze/GH-110/stat-strip-375.png` | Riepilogo mobile |
| `docs/consegne/evidenze/GH-110/stat-strip-1365.png` | Riepilogo desktop |

Commit identificabile con `git log -1 --format='%H %s' -- docs/consegne/GH-110-pet-in-archivio-esito.md`; hash nella risposta finale. Nessun push, merge o deploy. Mandato, SQL preesistenti e cartelle private esclusi; diario intatto. Fuori istruzione: nessuno. Un recupero e un passaggio a Luigi per chiarire il contrasto «nessun database»/verifica demo, risolto. Durata totale non cronometrata dall'ingresso; tempi build misurati sopra, controllo Git iniziale oltre10s segnalato. Nessuna nota aperta.
