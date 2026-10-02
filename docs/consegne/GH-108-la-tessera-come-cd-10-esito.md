# GH-108 — La tessera come CD-10

**Esito: implementazione e controprove locali PASS.** Resta il giudizio visivo di Luigi sul telefono: «cosa non ti torna?». Nessun push, merge o deploy; nessuna operazione su database, produzione o demo. Fixture persistenti create: 0, residue: 0.

## Identita e perimetro

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, repository `webapp/`, branch `main`.
- Base `8cdb70f7cab4cd9cb17b14bd0185d9d91e6c025b`; canone 1.2 letto integralmente. Mandato GH-108 e contratto CD-10 locali letti prima delle modifiche.
- Codice e registro nello stesso commit: identificabile con `git log -1 --format='%H %s' -- docs/consegne/GH-108-la-tessera-come-cd-10-esito.md`. Nessuna dipendenza database aggiunta.
- Tempo misurato dal 2/10/2026 04:38:51 al 04:54:08 CEST: 15m17s fino a build, verifiche principali e decodifica QR. Rifinitura della prova striscia e redazione successive escluse da tale intervallo, non cronometrate separatamente. Nessuna pausa utente. Letture/browser regolari; compilazione del verificatore Swift sensibilmente piu lenta, segnalata.

## Prima della correzione: causa del pulsante

`pulsante-prima.mjs`, eseguito prima di modificare i sorgenti: a 375 e 1365 px, riposo `rgb(111,151,146)`, testo `rgb(251,246,243)`, opacita elemento e antenati 1, hover/focus falsi. In hover il fondo diventava `rgb(94,133,128)`. La differenza misurata e fra riposo e hover, non fra larghezze: regole `.gh-btn--primary` e relativo `:hover` in `gh15-staff.css`. Un hover nella vecchia cattura e una spiegazione possibile, non una condizione storica dimostrata.

Ora fondo `--color-primary-hover` anche a riposo, opacita 1 a caricamento terminato: riposo/hover/focus identici. Contrasto calcolato **3,807:1**. Etichetta «Mostra al banco» 19px/700, una riga anche a 320; altezza 54, raggio 14, icona 20. Nessun ritocco allo stile staff comune.

## Misure contro il contratto

`verifica.json` conserva ogni misura delle sei combinazioni 320/375/1365, con/senza foto. Valori CD = valori GH-108 salvo la quantizzazione del bordo dichiarata sotto.

| Misura | CD-10 | GH-108 |
|---|---|---|
| Colonna, margini | max390; 12 a320, 16 altrove | 320/375/390; 12/16/16 |
| Padding tessera | verticale24, orizzontale16 a320/20 altrove | identico |
| Testata e titolo | 56; 44 / 1fr / 44; centrato | identico, titolo17 a320 |
| Indietro | 44x44, raggio12, icona20 | identico |
| Marchio → identita | 20 | 20 in tutte le viste |
| Ritratto → nome | 14 | 14 |
| Nome → razza; razza → chip | 4; 12 | 4; 12 |
| Identita → racconto; titolo → sottotitolo | 24; 6 | 24; 6 |
| Sottotitolo → timbri; timbri → regola | 16; 12 | 16; 12 |
| Regola → QR | 20 | 20 |
| Tessera → pulsante → invito | 12; 12 | 12; 12 |
| Ritratto | 88x88, raggio18, filo1,5 del livello | 88x88/r18; CSS1,5, Chromium calcola1px |
| QR normale | immagine76, padding6, raggio10 | identico |
| Miniatura Home | 48x48, raggio12, foto o tessera24 | identico |

Il bordo e dichiarato 1,5px come il kit; Chromium headless lo quantizza a 1px anche con DPR emulato2. Verificati sia dichiarazione sia valore calcolato, senza spacciare quest'ultimo per 1,5. Le tavole affiancano il kit CD con cornice/padding del suo simulatore alla superficie applicativa, senza alterare la cattura per allinearle artificialmente.

## Controprove e limiti

- Nessun ritratto/iniziale senza `owner_photo_url`; elementi circolari contati nella tessera normale e nella striscia: **0**. Con foto: ritratto rettangolare. La striscia usa il componente reale `CardPortrait`; contenitore locale equivalente, non Home autenticata.
- 4/5/6 caselle: tutte larghe complessivamente343px nel banco375; 8 e12 su due righe, 36 tacche su due righe. Altezze44/36/14, numeri sulle caselle non piene.
- 3/4: **«La prossima è quella del Bronzo.»** / **«3 visite fatte, ne basta una.»**. Il 6/11 quattro caselle; il 7/11 cinque, **«La prossima è la quarta.»**, tre timbri pieni invariati.
- Bronzo proiettato: **«Ogni visita da noi è un timbro.»**, nessuna data. Al 6/3/2027: **«Contano le visite degli ultimi 12 mesi.»**; verso Argento24, verso Oro36. Oro raggiunto: **«Il livello più alto della tessera.»**.
- Invito: **«Tienila a portata. Aggiungila alla schermata Home.»**; istruzioni iPhone/Android distinte verificate con user-agent simulati, desktop solo titolo. Nessun telefono fisico provato.
- `regola.mjs`: 308 confronti legacy identici, 8 proiezioni invalide gestite, qualifica e punti PASS. `browser.mjs`: 11 stati, tre larghezze, QR banco300, manifest/errori pagina0. `interazioni.mjs`: quattro casi Wake Lock, fallback foto, nome lungo, QR bianconero PASS. `letture-locali.mjs`: paginazione1201 visite/1001 punti, pet mancante ed errore pagina successiva PASS. I quattro script sono copie immutate GH-107, risultati separati in GH-108.
- Decoder Vision GH-107 riusato: QR customer/banco/cartoncino tutti `http://127.0.0.1:4178/client-card/ghp_gh107_probe_4`. Regola condivisa, generatore QR, hook, manifest e modalita banco invariati; nessun diff staff. Prove vive GH-107 non ripetute; suite RLS esclusa dal mandato, nessuna lettura nuova.
- `npm run build`: PASS, 180 moduli, 1,15s. Avvisi preesistenti Browserslist e bundle >500kB, non modificati. `git diff --check`: PASS.
- Preview sintetica `http://127.0.0.1:4179/__gh108` (aggiungere `?photo` per foto); nessuna chiamata DB. Foto di prova: bitmap locale dell'app, non ritratto reale; QR CD e foto CD segnaposto. Screenshot confrontati visivamente a320 senza foto e375 con foto; sei confronti salvati.

## Tabella esaustiva dei file

Tutti i percorsi relativi a `webapp/`; per le evidenze il prefisso e `docs/consegne/evidenze/GH-108/`.

| File | Atto |
|---|---|
| `src/apps/customer/components/PetCardParts.jsx` | Ritratto, miniatura, caselle |
| `src/apps/customer/components/pet-card.css` | Griglia CD-10 e controlli locali |
| `src/apps/customer/lib/petCardCopy.js` | Ultimo passo e finestra |
| `src/apps/customer/pages/PetCard.jsx` | Composizione, testata condivisa con prova, invito e pulsante |
| `src/shared/ui/Icon.jsx` | Icona tessera identica al kit |
| `docs/consegne/GH-108-la-tessera-come-cd-10-esito.md` | Questo registro |
| `preview.mjs`, `preview.jsx` | Banco sintetico e confronto col kit locale |
| `pulsante-prima.mjs`, `pulsante-prima.json` | Misura antecedente al fix |
| `verifica.mjs`, `verifica.json` | Contratto grafico e copie |
| `regola.mjs`, `regola.json` | Regressione regola |
| `browser.mjs`, `browser.json` | Regressione resa |
| `interazioni.mjs`, `interazioni.json` | Regressione banco |
| `letture-locali.mjs`, `letture-locali.json` | Regressione letture simulate |
| `qr-decodifica.json` | Comando e tre esiti Vision |
| `qr-banco.png`, `qr-cartoncino.png`, `qr-customer.png` | QR sintetici decodificati |
| `banco-375.png` | Banco invariato |
| `tessera-320.png`, `tessera-375.png`, `tessera-1365.png` | Output script regressione GH-107 |
| `confronto-320-foto.png`, `confronto-320-senza-foto.png` | Tavole affiancate320 |
| `confronto-375-foto.png`, `confronto-375-senza-foto.png` | Tavole affiancate375 |
| `confronto-1365-foto.png`, `confronto-1365-senza-foto.png` | Tavole affiancate1365 |

## Recuperi, esclusioni, passaggio

Recuperi Codex: porta4178 gia occupata dal banco GH-107, riusato senza interromperlo e nuovo banco4179; altezza indietro46 imposta dalla regola mobile comune, circoscritta a44; misura dell'opacita spostata a fine transizione di caricamento; bordo frazionario registrato come sopra. Il vecchio preview GH-107 non riproduceva il vero indietro: il banco GH-108 usa la testata reale. Nessuna estensione o attivita fuori istruzione.

Lasciati intatti e fuori stage/commit tutti i materiali preesistenti Luigi/Cowork: consegna CD-10, mandati CD-10/GH-106/GH-107/GH-108 e impronte GH-107, SQL riallineamento demo27/9, tre migrazioni GH-10227/9 e `supabase/rollback/`. Cartelle private `controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/` non lette ne incluse. Diario non modificato. Nessun intervento di Luigi richiesto durante l'esecuzione.

Per Cowork: nessun blocco aperto o nuova soluzione dati proposta. Prima di pubblicare, Luigi confronta la tessera reale sul proprio telefono con CD-10, con e senza foto: **cosa non ti torna?**
