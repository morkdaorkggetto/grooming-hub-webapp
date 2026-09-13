# GH-92 - I campi affiancati si allineano: esito

## Esito e perimetro

**Mandato eseguito.** I controlli dei gruppi `.gh-dialog-fields` si allineano
ora sul fondo della propria cella: un'etichetta su piu' righe sposta l'intera
riga, non il solo campo che la segue. Nel modale di conferma l'etichetta e'
stata abbreviata in **`Durata (min)`**, mantenendo esplicita l'unita' di
misura.

Root `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree `webapp/`.
Base `main`: **147875586819f057d394c2ada9f9142a74f442c8**.
Commit previsto: `fix: align adjacent dialog fields (GH-92)`.
Hash risolvibile con
`git log -1 --format=%H -- docs/consegne/GH-92-i-campi-affiancati-si-allineano-esito.md`.

Nessun database letto o scritto, nemmeno il demo. Tutte le prove usano
fixture HTTP in memoria. Nessuna migrazione, policy, colonna, dato, account,
password, rotta o dipendenza toccata. Nessun push, merge o deploy.

## Tabella esaustiva dei file del commit

| File | Intervento / motivo |
|---|---|
| `src/apps/staff/styles/gh15-staff.css` | Una proprieta' `align-items: end` sulla regola condivisa `.gh-dialog-fields` |
| `src/apps/staff/pages/CustomerRequests.jsx` | Una sola stringa: `Durata prevista (min)` diventa `Durata (min)` nel modale di conferma |
| `docs/consegne/GH-92-i-campi-affiancati-si-allineano-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-92/browser-check.mjs` | Banco riproducibile baseline/corrente con app e SDK reali, HTTP in memoria |
| `docs/consegne/evidenze/GH-92/browser.json` | Misure pixel, righe etichette, colonne, target, errori e destinazioni |
| `docs/consegne/evidenze/GH-92/ui-invariants.sha256` | Coppie di impronte per 68 file customer/staff |
| `docs/consegne/evidenze/GH-92/approval-before-1365.png` | Difetto originale riprodotto dalla base dichiarata |
| `docs/consegne/evidenze/GH-92/approval-after-1365.png` | Modale corretto a 1365 px |
| `docs/consegne/evidenze/GH-92/approval-after-375.png` | Modale corretto a 375 px |
| `docs/consegne/evidenze/GH-92/approval-after-forced-label-1365.png` | Controprova visiva con etichetta volutamente lunga |

Fuori da modifica, stage e commit:
`docs/incarichi/GH-92-i-campi-affiancati-si-allineano.md`, documento
Cowork non versionato presente al preflight. Nessun diario, altro mandato o
brief CD toccato.

## Misure dell'allineamento

Il banco carica due volte la vera pagina `/requests`: prima sostituisce i soli
CSS e JSX coinvolti con quelli del commit base, poi usa il worktree corrente.
Viewport desktop `1365 x 900`, coordinate verticali in pixel:

| Stato | Giorno | Ora | Durata | Esito |
|---|---:|---:|---:|---|
| Prima, bordo superiore | 412,375 | 412,375 | 424,719 | disallineato di 12,344 px |
| Prima, bordo inferiore | 450,375 | 450,375 | 462,719 | disallineato di 12,344 px |
| Dopo, bordo superiore | 418,547 | 418,547 | 418,547 | coincidente |
| Dopo, bordo inferiore | 456,547 | 456,547 | 456,547 | coincidente |

La griglia conserva le stesse tre tracce
`132,656 / 132,672 / 132,672 px`; cambia soltanto `align-items` da `normal` a
`end`. Altezze dei controlli, raggi, bordi, gap e margini non cambiano.

Controprova indipendente dalla stringa: `Giorno` viene sostituito nel DOM con
`Giorno richiesto con una etichetta volutamente molto lunga`, che occupa
**5 righe**. I tre bordi superiori restano tutti a **443,234 px** e quelli
inferiori tutti a **481,234 px**.

## Etichetta, gruppi e mobile

Testo scelto: **`Durata (min)`**. Il conteggio dei rettangoli di testo e'
**1 riga a 1365 px** e **1 riga a 375 px**. L'unita' `min` resta esplicita.

Ricerca esaustiva eseguita:

```sh
rg -n --glob '!dist/**' "gh-dialog-fields" src
```

Occorrenze applicative trovate: due, entrambe in `CustomerRequests.jsx`:

- modale di conferma, gruppo a tre colonne;
- modale delle alternative GH-89, due gruppi data/ora a due colonne.

Le due righe GH-89 restano allineate e invariate prima/dopo: prima riga
`400,516 / 400,516 px`, seconda `485,859 / 485,859 px`; tracce sempre
`204 / 204 px` e overflow **0 px**.

A 375 px la media query esistente prevale: ogni gruppo ha **una sola traccia
da 335 px**. Non e' stata modificata. Nel modale di conferma i campi iniziano
a `397,219`, `470,563` e `543,906 px`, nell'ordine verticale previsto.
Ispezione delle schermate: modale interamente nel viewport, nessuna
sovrapposizione, nessun testo troncato e overflow orizzontale **0 px**.

Sui bersagli touch visibili del modale a 375 px: larghezza minima **335 px**,
altezza minima **46 px**, quindi nessuno sotto 44 px. A desktop i controlli
restano al valore preesistente di 38 px: la coppia prima/dopo e' identica,
coerentemente col divieto di cambiare geometrie.

## Impronte e diff

`ui-invariants.sha256` contiene **68 coppie**: 30 file customer e 38 staff.
**66 coincidono** con la base; differiscono soltanto i due file applicativi
autorizzati:

- `CustomerRequests.jsx`:
  `3808d517...2b8d -> e90969a9...477a`;
- `gh15-staff.css`:
  `a56d7933...c5df -> fd140e20...3154`.

`git diff --numstat` sui file applicativi: una riga sostituita nel JSX e una
riga aggiunta nel CSS. `git diff --word-diff=porcelain` mostra esclusivamente
la rimozione della parola `prevista` dalla stringa e l'aggiunta della
proprieta' `align-items: end`. `git diff --check`: verde.

Nessun colore, font, spaziatura fra gruppi, altezza, raggio, bordo, testo di
aiuto, fascia di carico o posizione dei comandi e' stato modificato. Pagine e
componenti customer completamente invariati.

## Verifiche e tempi

Banco browser finale: Chromium, app e Supabase SDK reali, Auth/REST in
memoria, WebSocket chiusi e font remoti neutralizzati; **0 page error, 0
destinazioni impreviste**, durata **3,525 s**. Le schermate a 375 e 1365 px,
compresa la controprova lunga, sono state ispezionate visivamente.

`npm run build`: **167 moduli**, Vite **1,18 s**, totale **1,551 s**, verde.
Avvisi non bloccanti preesistenti: `caniuse-lite` datato e chunk JS oltre
500 kB. Nessuna dipendenza aggiornata.

Finestra dalla prima modifica applicativa al completamento del banco finale:
**08:23:28-08:26:40 CEST, 3 min 12 s**; esclude ricognizione iniziale,
ispezione visiva e stesura del registro. Il primo avvio nel sandbox e' stato
respinto subito con `EPERM` sulla porta locale; il banco autorizzato e' sempre
durato circa 3,5-4,5 s. Due asserzioni del banco sono state precisate prima
del giro finale: larghezza mobile verificata come singola traccia, non come
valore inventato, e soglia touch verificata a 375 px come nelle consegne
GH-89/GH-91. Nessun rallentamento persistente osservato.

Suite RLS **non rieseguita**, come prescritto: GH-92 non tocca dati o
permessi. Ultima misura viva dichiarata dal mandato: GH-91 del 13/9,
**60 PASS**; non viene presentata come misura GH-92.

## Eccezioni e passo finale

Nessuna estensione funzionale o fuori istruzione. Gli script e le immagini
sono soltanto evidenze della superficie prescritta; nessun dato vivo e'
stato coinvolto.

Resta lo sguardo di Luigi su telefono e computer: verificare che i tre campi
appaiano composti, che i minuti siano inequivocabili e annotare **cosa non
torna**, non un generico "funziona".
