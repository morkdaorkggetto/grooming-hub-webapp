# GH-77 - Ogni fotografia ha i suoi occhi

## Esito e perimetro

**Concluso.** Nell'app cliente la foto tecnica del salone non viene piu resa,
l'invito al ritratto compare anche quando manca quella foto e il proprietario
puo cambiare o togliere il proprio ritratto. La migration pubblica soltanto il
ritratto owner sulla card QR ed e stata provata sul demo con rollback.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`869e07ddba21fcf9556beaa811b020c6e1d93af7`**; stato iniziale pulito.
- Unico database letto e usato: demo `grooming-hub-demo`, ref
  `qttpinkslhenxrsbhhhg`. Produzione **mai letta e mai scritta**.
- Il link CLI locale punta alla produzione: nessun comando CLI remoto e stato
  eseguito; ogni chiamata viva ha indicato il ref demo.
- Nessun push, merge, deploy o migration applicata. La history GH-77 sul demo
  contiene **0 righe**.
- Commit locale: ricavabile con `git log -1 --format=%H --
  docs/consegne/GH-77-quello-che-paola-non-poteva-fare-esito.md` e comunicato
  a Luigi alla chiusura.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/apps/customer/pages/Pet.jsx` | Ritratto owner esclusivo, invito incondizionato, rimozione ritratto e specie vuota omessa |
| `src/apps/customer/pages/Pet.css` | Rimossi miniatura/spiegazione; disposizione dei due comandi owner |
| `supabase/migrations/20260912041539_gh77_public_card_owner_portrait_only.sql` | RPC pubblica con solo `owner_photo_url`, senza schema o policy nuove |
| `docs/consegne/GH-77-quello-che-paola-non-poteva-fare-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-77/gh77-browser-measures.json` | 17 controprove DOM/browser e misure responsive |
| `docs/consegne/evidenze/GH-77/gh77-demo-transaction.json` | Impronte RPC/whitelist, casi SQL e stato dopo rollback |
| `docs/consegne/evidenze/GH-77/gh77-rls-result.json` | Suite RLS e pulizia |
| `docs/consegne/evidenze/GH-77/gh77-elliot-1365.png` | Prova a schermo desktop |
| `docs/consegne/evidenze/GH-77/gh77-elliot-375.png` | Controprova telefono |

SHA-256 dei sorgenti provati: `Pet.jsx`
`ce15914dd0cf56f9ad7b3fb7ceefb46f0c9ddc1533b6f0a17c95a053863908f9`;
`Pet.css` `7eb47350e86dc4ecb7e272ab162d15ca080f5ef28c11525ad338831f85ffe18d`;
migration `41cb0f8aa247c8e35e036e828e638a877e5e5dbfa3f9750b06e3889c8e665ba6`.

## Implementazione cliente

`PetMedallion` legge soltanto `owner_photo_url`: `pets.photo_url` non entra piu
nel medaglione, nel testo o nella galleria. Senza ritratto mostra l'iniziale;
con ritratto espone `Cambia la tua foto` e `Togli la tua foto`. La rimozione
azzera solo `owner_photo_url`, prova a rimuovere il relativo oggetto owner e
torna all'invito; la foto salone resta invariata.

I due testi esatti dell'invito sono:

- **`Metti qui il ritratto di Elliot.`**
- **`Scegli una foto che ti piace: apparirà nella tua area e sulla sua card.`**

La riga meta di Elliot e **`Shi-tzu`**: nessun `Specie non
indicata`. Se la specie esiste resta, per esempio **`Cane · Shi-tzu`**; se
nessun dato meta esiste la riga non viene resa.

Ricerca in `src/apps/customer`: **0** occorrenze di `Scambia le due foto`,
`foto che facciamo noi` e `foto del salone`. Il lato staff, dove le due foto
hanno entrambe un lavoro, non e stato modificato.

## Controprove browser

Banco Vite con i veri `Pet` e `PublicPetCard` e soli adattatori dati in
memoria: **17/17 PASS in 10,99 s**, errori runtime/console **0**.

| Caso | Misura |
| --- | --- |
| Elliot, nessuna foto/specie | meta `Shi-tzu`; invito e iniziale visibili |
| Solo foto salone | URL di riconoscimento assente dall'intero DOM; immagini medaglione `0` |
| Solo ritratto / entrambe | una sola immagine, sempre `owner-portrait.jpg`; URL salone assente |
| Upload owner | `owner_photo_url` valorizzato; `photo_url` prima/dopo identico |
| Rimozione owner | immagini medaglione `0`, iniziale e invito tornati; `photo_url` identico |
| Album vuoto | testo base invariato: `Dopo il prossimo bagno troverai qui la sua foto` |
| Album con lavorazione | unica immagine `visit-album.jpg`; foto riconoscimento assente |
| Card pubblica | foto salone sola: icona paw e 0 immagini; owner: un ritratto |
| 1365 / 375 px | overflow `0 / 0`; altezza minima bersagli `44 / 44 px` |
| Comandi owner | 2 per viewport; minimo `120,34 x 44 px` |

La sezione `AlbumSheet` ha la stessa impronta della base e del risultato:
`c09c0a5c236d8024d3e69aa1b0a9e6c5e1260025b3b8823cc82ddf068d3b36d6`.
Gli screenshot sono **1365 x 1321** e **375 x 1423**; SHA-256 desktop
`d726acc5b0cfac7dddb4a04cdd1698c7c560e3d8b8a5c8c37fdf5999d430b20f`,
telefono `3f929a501cd681a5ecd7f1ecbabcb6bad5fe39bda162c4452d6dbd36ff40dbfd`.

## Migration e database demo

La funzione della migration e identica a GH-73 salvo una riga:
`COALESCE(p.owner_photo_url, p.photo_url)` diventa `p.owner_photo_url`.
Restano firma, `SECURITY DEFINER`, `search_path`, ACL e le stesse 18 chiavi.
Nessuna chiave album e presente.

Il demo ha oggi **7 pet e 7 token**, non i 347 citati nel mandato. Tutti i 7
token sono stati eseguiti nella prova: **0 risultati null**, una sola forma di
chiavi, minimo/massimo **18/18**. Fixture SQL: solo salone restituisce `photo:
null`; entrambe restituisce il ritratto owner.

La whitelist viva contiene esattamente **3** assegnazioni:
`coat_preferences`, `owner_notes`, `owner_photo_url`; impronta prima, durante e
dopo `3a098454689e2d8f94cf077aa4f5933f`. Impronta RPC prima
`e3bc0f5c4b98a58fc39f29c8b1a1a6b2`, durante GH-77
`70e28d87d90e92494814862f8fde11b4`, dopo rollback nuovamente la prima.

Stato finale indipendente: 7 pet, 90 visite, 8 appuntamenti, 0 foto salone, 0
ritratti owner, 0 foto album, 0 fixture GH-77, colonna GH-73 ancora assente, 0
righe migration GH-77. Le tre sonde permanenti GH-74 restano presenti.

## Verifiche tecniche, tempi ed eccezioni

- `npm run build`: **PASS**, 159 moduli, Vite 1,28 s e **1,70 s reali**;
  restano gli avvisi preesistenti Browserslist e chunk oltre 500 kB.
- Suite RLS demo: **60 PASS, 0 FAIL, 0 SKIP in 27,56 s**; upload owner senza
  sovrascrittura salone e pulizia a zero inclusi.
- `git diff --check`: **PASS**.
- Lint non eseguito: `node_modules/.bin/eslint` non e installato, condizione
  gia registrata da GH-73. Nessuna dipendenza e stata aggiunta.

Due richieste SQL iniziali sono state respinte dal controllo automatico prima
dell'esecuzione per un falso rilevamento di commit. Dopo autorizzazione
esplicita di Luigi e stata usata una singola istruzione che termina con
l'eccezione attesa `GH77_EXPECTED_ROLLBACK`, quindi non puo lasciare DDL o
fixture persistenti.

Il primo banco SQL eseguito ha poi trovato la deriva attesa: GH-73 e nel repo
ma non applicata al demo, quindi `awarded_fidelity_tier` mancava. L'istruzione
e stata annullata automaticamente. La prova valida ha creato il solo
prerequisito GH-73 dentro la stessa istruzione rollback-only, senza alterare la
migration GH-77. Nessuna attivita fuori istruzione.

**Indicazione operativa a Cowork:** prima dell'applicazione eseguire un
preflight che confermi `pets.awarded_fidelity_tier`; applicare GH-73 prima di
GH-77 se manca. Dopo GH-77 verificare firma/ACL/search path, le 18 chiavi e
tutti i token del database di destinazione. Non applicare GH-77 da sola a un
database fermo prima di GH-73.

## Passo finale Luigi

Dopo applicazione e rilascio, sul telefono: aprire Elliot come Paola, mettere
e togliere un ritratto, poi inquadrare il QR di un pet con sola foto tecnica.
Il risultato atteso e il medaglione, mai la foto di lavoro. Domanda: **cosa non
ti torna?**
