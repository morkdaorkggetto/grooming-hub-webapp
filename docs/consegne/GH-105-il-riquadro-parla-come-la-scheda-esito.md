# GH-105 - Esito

**Completato. Grafica allineata, controprove GH-104 PASS, fixture demo ripristinate a zero.**
Root `/Users/luigimaisto/Desktop/grooming-hub-web`, worktree `webapp`, branch `main`.
Base `f5d6e3165eb90c4d17a27dad2259bb6247e6c2c6`. Mandato locale GH-105 di Luigi.
Canone 1.2 letto integralmente, coerente con ISTRUZIONI.md; SHA256
`28a1c8d407c3bb624a4c0d499e14aee926472843e5192e3f70d4e961f8b82e71`.

## Modifica e prove

- Aggiunto occhiello Agenda; testo corrente `gh-body`, dettagli `gh-meta`, date `gh-num` (gia' usato nella scheda). Enfasi con `strong`, come il destinatario dell'invito. Nessun cambiamento a logica, righe, ordine o destinazioni.
- Prima/dopo misurati con `getComputedStyle`: corrente 16 -> 13 px; data e stato 16 -> 13 px, peso 700; servizio 16 -> 11,5 px e colore secondario. Occhiello 9,5 px/700. Tutte e cinque le proprieta' coincidono con i riferimenti.
- Affidabilita' fornisce occhiello e testo secondario, ma non un `gh-body` o `gh-body strong`: per questi il confronto riproduce il markup esistente di note/invito. Limite dichiarato, non confronto inventato con un elemento assente.
- Browser: quattro casi PASS (375/1365 px, vuoto/popolato). Frammenti JSX estratti dal file reale, StaffKit e CSS reali, dati sintetici esclusivamente locali. Schermate di confronto, non dell'intera app autenticata. Il prima blocca tutta la rete esterna; il dopo consente soltanto Google Fonts per rendere anche il serif effettivo. Font corrente di sistema in entrambi.
- Nessun overflow; bottone 46 px, righe almeno 60 px. Screenshot mobile/desktop ispezionati.
- `rg -n 'font-family|font-size|color:' src/apps/staff/pages/ClientDetail.css`: nessun risultato (exit 1).
- `npm run build`: PASS, 170 moduli, 2,90 s. Avvisi preesistenti: Browserslist e bundle oltre 500 kB. Suite RLS non eseguita.

## Deroga autorizzata e controprova viva

Il mandato vieta il database ma prescrive lo stesso `GH-104/browser-checks.mjs`, che scrive fixture. Luigi ha autorizzato esplicitamente in chat la deroga per queste sole scritture temporanee e il ripristino verificato. Eseguita copia byte-identica in GH-105, per non sovrascrivere evidenze storiche; SHA256 di entrambi gli script `9678f42e3ffd7d64738dfc52da59a44e48a4c533b9602006814d5f253b3a5a5f`.

`PLAYWRIGHT_MODULE=.../playwright/index.mjs node docs/consegne/evidenze/GH-105/browser-checks.mjs`: PASS, 19 registrazioni di esito, nessun errore browser. Provati stato vuoto, azioni e destinazioni, ordine, esclusioni, tre stati concordanti con dashboard, date invalide e layout mobile/desktop. Solo demo `qttpinkslhenxrsbhhhg`: creati 2 pet, 10 appuntamenti, 4 richieste; riletti dopo eliminazione per ID: **0 / 0 / 0**. Account esistenti e password non modificati. Produzione mai raggiunta; nessuna migration e nessuna suite RLS.

Nota a Cowork: nei futuri mandati grafici distinguere il divieto di modificare il database applicativo dall'eventuale permesso per fixture di regressione.

## File propri (elenco esaustivo)

| File | Intervento |
|---|---|
| `src/apps/staff/pages/ClientDetail.jsx` | Solo classi e occhiello del riquadro |
| `src/apps/staff/pages/ClientDetail.css` | Rimosse due dichiarazioni di colore del testo |
| `docs/consegne/evidenze/GH-105/visual-checks.mjs` | Sonda locale dei frammenti reali e confronto tipografico |
| `docs/consegne/evidenze/GH-105/before-styles.json` | Misure precedenti alla modifica |
| `docs/consegne/evidenze/GH-105/after-styles.json` | Misure successive e riferimenti |
| `docs/consegne/evidenze/GH-105/empty-375.png` | Confronto vuoto mobile |
| `docs/consegne/evidenze/GH-105/empty-1365.png` | Confronto vuoto desktop |
| `docs/consegne/evidenze/GH-105/populated-375.png` | Confronto popolato mobile |
| `docs/consegne/evidenze/GH-105/populated-1365.png` | Confronto popolato desktop |
| `docs/consegne/evidenze/GH-105/browser-checks.mjs` | Copia immutata dello script GH-104 |
| `docs/consegne/evidenze/GH-105/browser-results.json` | Esiti vivi e conteggi di pulizia |
| `docs/consegne/evidenze/GH-105/detail-375.png` | Scheda reale demo mobile prima della pulizia |
| `docs/consegne/evidenze/GH-105/detail-1365.png` | Scheda reale demo desktop prima della pulizia |
| `docs/consegne/GH-105-il-riquadro-parla-come-la-scheda-esito.md` | Questo registro |

Mandato e materiali paralleli non toccati; cartelle private non lette. Nessun push, merge, deploy o lavoro fuori istruzione. Commit unico di codice e registro, identificabile con `git log -1 --format=%H -- docs/consegne/GH-105-il-riquadro-parla-come-la-scheda-esito.md` (l'hash del commit contenitore non si puo' auto-includere).

## Tempi e residui

Intervallo misurato 30/9/2026 17:10:46-17:17:36 Europe/Rome: 6m50s, non comprende la lettura iniziale non cronometrata. Comprende preparazione e recupero del test; non e' tempo di sola modifica. Avvio iniziale rallentato, segnalato: sandbox `listen EPERM`, poi timeout della sonda locale. Ripresa fuori sandbox autorizzata e correzione dell'HTML di prova; nessun guasto applicativo rilevato. Due rilanci di recupero; un passaggio chiesto a Luigi per il conflitto del mandato; costo aggiuntivo dei controlli non separato dal totale.

Ripresa autorizzata: suite viva 17:19:53-17:20:28 Europe/Rome, 35,157 s, inclusa pulizia. Attesa della risposta esclusa da questa misura. Chiusura documentale non cronometrata separatamente.

Preview locale demo: `http://127.0.0.1:4177/clients`. Controllo soggettivo affidato a Luigi: aprire una scheda e guardare Prossimo appuntamento; il riquadro sembra nato con gli altri? Le quattro immagini di confronto sono disponibili anche senza login.
