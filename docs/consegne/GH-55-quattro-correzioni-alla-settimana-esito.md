# Consegna GH-55 - Quattro correzioni alla settimana

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `fd57a3b` (`GH-55 scritto + diario 1/9: quattro correzioni alla settimana di Roby`).
- Database ammesso: solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy, nuova rotta, migration o policy.

## Esito

La settimana non colloca piu gli appuntamenti annullati nelle fasce: li conta
nel piede del giorno, accanto alle lavorazioni senza appuntamento, e mantiene
ogni elemento apribile. Il giorno conserva invece la scheda completa con lo
stato `Annullato`. Gli annullati restano esclusi da capienza, riepilogo e stato
di occupazione della settimana, inclusi quelli privi di una fascia valida.

Sul telefono interruttore e frecce condividono la prima riga; a partire da
390 px anche l'intervallo resta sulla stessa riga, mentre sotto 390 px va a
capo da solo. L'intervallo e il comando accessibile per tornare alla settimana
corrente o a oggi. Il riepilogo resta su una linea, usa separatori e non ripete
la capienza.

Le lavorazioni senza ora sono rese come fatto pieno nel neutro forte, con testo
chiaro; gli appuntamenti restano piani a contorno con barra d'accento. Il
margine usa soltanto `chi entra` e dichiara lo spazio realmente libero. La
chiusura dei modali usa il comando `Chiudi`, cosi il vecchio carattere
moltiplicatore non compare in alcun punto della vista.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Separa annullati e attivi, calcola il riepilogo corretto, produce l'intervallo compatto e conserva gli annullati senza fascia nel solo giorno. |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | Aggiunge il piede annullati, distingue settimana e giorno, rende cliccabile l'intervallo e aggiorna margine e riepilogo. |
| `src/apps/staff/pages/Calendar.css` | modificato | Compone intestazione responsive, bersagli touch, piede annullati e distinzione pieno/contorno senza nuovi colori. |
| `docs/consegne/GH-55-quattro-correzioni-alla-settimana-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna. Il banco browser locale, composto
da due file non versionati e alimentato solo in memoria, e stato rimosso prima
della chiusura.

## Scostamenti da CD-06

| Voce GH-55 | Scostamento dichiarato |
| --- | --- |
| 1 - annullato | In settimana la scheda esce dalla fascia e diventa conteggio apribile nel piede; nel giorno resta intera. |
| 2 - intestazione telefono | Interruttore, frecce e intervallo sono compressi in una riga da 390 px; sotto 390 px il solo intervallo occupa la seconda riga. |
| 3 - fatto contro piano | Le lavorazioni senza ora passano da resa neutra a contorno a resa piena nel neutro forte; gli appuntamenti conservano contorno e accento. |

## Controprove

| Prova | Misura | Esito |
| --- | --- | --- |
| Due appuntamenti e un annullato | Settimana: 2 schede in fascia, 1 annullato nel piede; giorno: 3 schede, `Tito` con etichetta `Annullato` | PASS su fixture in memoria |
| Raggiungibilita annullato | Dal piede settimana e dalla scheda giorno si apre il dettaglio; `Ripristina programmato` porta allo stato misurato `Ripristinato` | PASS su fixture in memoria |
| Capienza e prenotati | Fascia `2/3`; annullato non porta a `3/3`; riepilogo conta solo attivi | PASS |
| Telefono 375 px | Documento 375/375 px; interruttore 44 px; frecce 46 px; intervallo 44 px; riepilogo 320/320 px su una linea | PASS |
| Punto di ritorno a capo | A 390 px tutti i controlli hanno quota 40/41; a 375 px l'intervallo passa da quota 40 a quota 94 da solo | PASS, scostamento dichiarato |
| Ritorno al presente | Settimana `3 -> 0`; giorno `1 -> 0`, mediante il pulsante intervallo | PASS |
| Riepilogo con richiesta | `13 prenotati`, `2 da confermare`, `5 entrati senza appuntamento`; nessuna `postazione` | PASS |
| Riepilogo senza richiesta | `13 prenotati`, `5 entrati senza appuntamento`; nessuna `postazione` | PASS |
| Piano contro fatto | Appuntamento trasparente con bordo d'accento `rgb(111, 151, 146)`; fatto pieno `rgb(43, 37, 37)` con testo `rgb(251, 246, 243)` | PASS |
| Lessico | 0 occorrenze di `tenuto`, `Poco spazio` e `×` moltiplicatore; presenti solo `chi entra` ed `entrati senza appuntamento` | PASS |
| Piede telefono | Primo giorno: piede presente, 45 px per la lavorazione e 44 px per l'annullato; `flex-shrink: 0` e `min-height: 0` conservati | PASS |
| Desktop 1365 px | 7 colonne da 186 px, nessun overflow orizzontale | PASS |
| Build | Vite 5.4.21, 157 moduli, 1,13 s; JS 701,89 kB (gzip 198,27 kB) | PASS |
| Controllo whitespace | `git diff --check` senza segnalazioni | PASS |
| Lint | `eslint` non installato (`command not found`) | NON ESEGUIBILE |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## RLS, dati ed eccezione del mandato

Il testo contiene due prescrizioni incompatibili: `nessun dato toccato` e,
nello stesso incarico, controprove con fixture usa-e-getta sul demo. La sonda
staff risultava correttamente assente e il login restituiva
`Invalid login credentials`. Il tentativo di applicare il seed custodito e
stato bloccato prima dell'esecuzione proprio per il divieto di toccare dati;
non sono stati cercati aggiramenti.

Di conseguenza:

- nessuna fixture Supabase e stata creata e nessun dato e stato scritto;
- la suite RLS non e stata rieseguita, perche richiede la sonda staff;
- l'ultima misura integra resta quella di GH-54: `60 PASS, 0 FAIL, 0 SKIP`;
- `scripts/rls-tests/` e `supabase/` hanno zero differenze in questo giro;
- le controprove GH-55 sono state eseguite nel browser contro i componenti
  reali con fixture soltanto in memoria, poi integralmente rimosse.

La vista modifica solo composizione e presentazione e non introduce accessi,
query, policy o scritture nuove. L'invariante RLS e quindi strutturalmente
immutato, ma la riesecuzione viva resta dichiarata non eseguita.

## Controllo finale di Luigi

Il passo umano resta aperto. Aprire prima sul computer e poi sul telefono:

1. la settimana corrente con annullati veri: deve sembrare piu vuota, e deve
   esserlo davvero;
2. una giornata con appuntamenti e lavorazioni senza ora: deve essere evidente
   quale gruppo e gia successo;
3. il telefono avanti di tre settimane: un tocco sull'intervallo deve tornare
   al presente.

La domanda da porre e: `cosa non ti torna?`.

## Commit

Commit locale previsto con messaggio `fix: refine staff calendar planning`.
L'hash e riportato nella risposta finale. Nessun push eseguito.
