# GH-75 - La scala si accorge del conferimento

## Esito e perimetro

**Concluso: intestazione e scala staff ora rappresentano lo stesso livello,
senza alterare i numeri reali.** La prova richiesta e stata eseguita sul vero
`ClientDetail` e lo screenshot e allegato. Nessun accesso al database, nessuna
migration, colonna, policy, rotta o dato scritto. Nessun push, merge o deploy.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`91c2dc4405ec6747a3d04e04e1973543343f4351`**;
  stato iniziale pulito.
- Fixture esclusivamente in memoria. Produzione e demo non letti ne scritti.
- Commit locale: ricavabile con
  `git log -1 --format=%H -- docs/consegne/GH-75-la-scala-si-accorge-del-conferimento-esito.md`
  e comunicato a Luigi alla chiusura.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/apps/staff/lib/fidelity.js` | Stato di presentazione delle righe fino al livello conferito, con deficit visivo azzerato |
| `src/apps/staff/pages/ClientDetail.jsx` | Barra piena per livello posseduto e causa distinta fra calcolo e salone |
| `src/apps/staff/styles/gh15-staff.css` | La causa della riga resta visibile anche nel layout mobile |
| `docs/consegne/GH-75-la-scala-si-accorge-del-conferimento-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-75/gh75-fidelity-cases.json` | Sette confronti logici contro il commit base |
| `docs/consegne/evidenze/GH-75/gh75-browser-measures.json` | Testi, barre, visibilita, overflow ed errori del browser |
| `docs/consegne/evidenze/GH-75/gh75-clover-1365.png` | Screenshot del pannello Fidelity del vero `ClientDetail` |

Impronte SHA-256 dei sorgenti provati: `fidelity.js`
`897a34f69ec3b629a86fc86e89a2081faf2d79c469e7f13548618af96875121e`;
`ClientDetail.jsx`
`31be429890945b35be27104c26e218d19e02ebaf134e0f6e249fde059da66c84`;
`gh15-staff.css`
`a9a1faaaefc3a1d1c790a0a1302afef669e687ac478168cdd407c811dda1dbae`.

## Implementazione

Il calcolo originario continua a produrre `achieved`, deficit, livello
calcolato, livello effettivo, fonte complessiva e livello successivo come nel
commit base. Una seconda lettura, usata soltanto dalla scala staff, aggiunge:

- riga posseduta per calcolo o conferimento;
- indicazione che il possesso deriva dal salone quando non e gia raggiunto per
  visite o punti;
- deficit di presentazione a zero per una riga posseduta;
- barra piena come stato, lasciando accanto i conteggi reali.

Se una riga e gia raggiunta matematicamente, quella causa prevale sulla
qualifica: con bronzo da visite e argento conferito si leggono rispettivamente
`Raggiunto con visite` e `Conferito dal salone`. Non nasce una seconda
grammatica rispetto alla motivazione introdotta in GH-73.

**Estensione dichiarata:** il CSS non era nell'elenco indicativo dei file. E
stata cambiata una sola regola preesistente per non nascondere su mobile la
causa che GH-75 richiede di distinguere. Nessun colore nuovo.

## Controprove logiche

Suite isolata sulla funzione reale, confrontata con la stessa funzione letta
dal commit base: **7 casi PASS in 0,30 s**.

| Caso | Misura |
| --- | --- |
| Clover: 3 visite, bronzo conferito | `3 / 6 visite in 12 mesi · 0 / 100 punti` · `Conferito dal salone`; raggiunta; deficit `0/0`; barra 100% |
| Argento nello stesso caso | `3 / 12 visite in 24 mesi · 0 / 250 punti`; mancano 9 visite oppure 250 punti; barra 25% |
| Oro nello stesso caso | `3 / 36 visite in 36 mesi · 0 / 500 punti`; mancano 33 visite oppure 500 punti; barra 8,33% |
| Argento conferito | righe raggiunte `[true, true, false]` |
| Oro conferito | righe raggiunte `[true, true, true]`; livello successivo `null` |
| Bronzo da visite, argento conferito | `Raggiunto con visite` / `Conferito dal salone`; oro non raggiunto |
| Nessuna qualifica e revoca | resa della scala identica al commit base in entrambi i confronti |

Per gli scenari provati, `currentTier`, `nextTier`, `calculatedTier`,
`awardedTier`, `currentTierSource`, `mode`, punti, visite nelle finestre e
deficit matematici originali coincidono con il commit base.

## Prova a schermo

Banco Vite isolato con il vero `ClientDetail`, i componenti reali e soli
adattatori in memoria per database e tenant. Chromium ha reso Clover a 1365 e
375 px in **1,67 s**.

- testi delle tre righe uguali alle misure della tabella sopra;
- valori delle barre: `100`, `25`, `8,3333` in entrambi i viewport;
- causa visibile: `[true, true, true]` in entrambi i viewport;
- overflow orizzontale: `0 px` a 1365 e 375;
- errori JavaScript e console: `0`.

Lo screenshot desktop allegato misura **941 x 364 px**, SHA-256
`849689368b117f9599e0c6d1cde173576888429f78e70489e9c3860e55559e39`.
Una cattura mobile di lavoro non e stata conservata: il ritaglio del solo
pannello includeva il FAB fisso preesistente sopra l'ultima barra. La misura
DOM mobile resta valida e non mostra overflow o cause nascoste; il FAB non e
stato modificato fuori perimetro.

## Lato cliente e verifiche tecniche

La funzione fidelity e condivisa con `CustomerPortal`, ma il portale usa solo
livello e prossimo traguardo e non rende le righe della scala. La card pubblica
usa la propria proiezione RPC. Ricerca di `scaleReachedByAward`,
`Conferito dal salone`, `currentTierSource` e `awarded_fidelity` nelle due app
cliente e nella card pubblica: **0 corrispondenze**. Il cliente continua quindi
a vedere il livello senza origine.

- `npm run build`: **PASS**, 159 moduli, Vite 1,24 s e **1,72 s reali**;
  restano gli avvisi preesistenti su Browserslist e chunk oltre 500 kB.
- `git diff --check`: **PASS**.
- Suite RLS non rieseguita, come ordinato. Ultima misura viva: GH-74,
  **60 PASS, 0 FAIL, 0 SKIP**, 8 settembre 2026.

## Tempi, pulizia e passo finale

Il tempo totale non e stato misurato dall'avvio e non viene ricostruito.
Misure puntuali: suite logica **0,30 s**, banco browser **1,67 s**, build **1,72
s reali**. Un controllo locale leggero sull'immagine ha impiegato **20,0 s**:
rallentamento circoscritto alla lettura del file appena scritto nella cartella
sincronizzata, segnalato subito a Luigi. Build e sorgenti sono rimasti rapidi.

Il banco temporaneo e il server sulla porta 4195 vengono rimossi prima del
commit. Nessuna attivita fuori istruzione.

**A Luigi, dopo rilascio e ricarica dall'origine con Opzione-Comando-R:** sulla
scheda di Clover confronta scala e intestazione, verifica che le tre visite
vere restino leggibili e confronta con Benny, che il bronzo lo ha guadagnato.
La domanda resta: **cosa non ti torna?**
