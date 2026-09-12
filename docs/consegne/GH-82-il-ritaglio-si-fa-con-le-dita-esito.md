# GH-82 - Il ritaglio si fa con le dita

## Esito e perimetro

**Concluso lato implementazione e banco automatico.** Il cropper condiviso
gestisce pizzicata a due dita e trascinamento a un dito come gesti distinti,
arriva a 8x e salva la stessa inquadratura mostrata. Il medaglione customer e
un pulsante accessibile: vuoto apre la scelta file, pieno riapre il ritratto
corrente nel cropper.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`9e9e5fc4af2fd55ff4a727b500a56b04f31de50c`**;
  stato iniziale pulito.
- Nessun database letto o scritto. Fixture, upload, update e rimozioni sono
  rimasti in memoria; produzione mai letta e mai scritta.
- Nessuna migration, colonna, policy, rotta, dipendenza, push, merge o deploy.
- Suite RLS non rieseguita come richiesto. Ultima misura viva dichiarata dal
  mandato: GH-78, **60 PASS del 12/9**.
- Commit locale: ricavabile con `git log -1 --format=%H --
  docs/consegne/GH-82-il-ritaglio-si-fa-con-le-dita-esito.md` e comunicato a
  Luigi alla chiusura.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/shared/ui/ImageCropModal.jsx` | Multi-pointer pinch/drag, zoom massimo 8x e conversione corretta dell'offset |
| `src/apps/customer/lib/petPhoto.js` | Caricamento temporaneo del ritratto pubblico corrente come `File` |
| `src/apps/customer/pages/Pet.jsx` | Medaglione azionabile e riapertura del ritratto esistente |
| `src/apps/customer/pages/Pet.css` | Reset del pulsante, focus visibile e stato occupato |
| `docs/consegne/evidenze/GH-82/gh82-browser-measures.json` | Misure complete del banco in memoria |
| `docs/consegne/evidenze/GH-82/gh82-crop-zoom-8-375.png` | Cropper a 375 px, zoom 8x sul muso |
| `docs/consegne/evidenze/GH-82/gh82-after-three-retouches-375.png` | Scheda dopo tre ritocchi |
| `docs/consegne/evidenze/GH-82/gh82-retouch-1.jpg` | JPEG dopo il primo ritocco consecutivo |
| `docs/consegne/evidenze/GH-82/gh82-retouch-3.jpg` | JPEG dopo il terzo ritocco consecutivo |
| `docs/consegne/GH-82-il-ritaglio-si-fa-con-le-dita-esito.md` | Questo registro |

## Gesti e zoom

Il componente conserva una mappa dei pointer attivi. Con un pointer registra
origine e offset e sposta la foto; con due pointer annulla il drag e cambia
solo lo zoom in proporzione alla distanza. Quando una delle due dita si alza,
il pointer rimasto puo iniziare un nuovo trascinamento dalla posizione
corrente, senza salto.

| Controprova touch Chromium, viewport 375 px | Prima | Dopo |
| --- | ---: | ---: |
| Pizzicata verso l'esterno | 1x | 3x |
| Pizzicata verso l'interno | 3x | 1,5x |
| Deriva massima del centro durante pinch | - | 0,0078125 px |
| Drag a un dito, asse X | 0 px | 34 px |
| Drag a un dito, asse Y | 0 px | 22 px |

Il cursore desktop resta e ora dichiara `min=1`, `max=8`, `step=0.05`.
L'8x e stato scelto su una fotografia reale larga **1000 x 709 px** con un
cane piccolo nel prato: al massimo il lato sorgente inquadrato e **88,625
px**, sufficiente a portare il muso dentro tutto il medaglione. La prova a
schermo `gh82-crop-zoom-8-375.png` mostra il muso nella cornice circolare.

Foto di prova: *Small dog in a field (5993847709).jpg*, autore waferboard,
licenza CC BY 2.0:
`https://commons.wikimedia.org/wiki/File:Small_dog_in_a_field_(5993847709).jpg`.
La sorgente e stata usata solo da `/private/tmp` e non e inclusa nel commit;
le evidenze sono ritagli di prova derivati e mantengono qui attribuzione e
licenza.

## Medaglione e comandi

| Caso | Esito misurato |
| --- | --- |
| Medaglione senza ritratto | 1 apertura del selettore file, nessun crop prematuro |
| Medaglione con ritratto | cropper aperto sul file corrente, 0 aperture selettore |
| Tastiera sul ritratto | `Enter` apre il cropper, 0 aperture selettore |
| Nome accessibile vuoto | `Scegli un ritratto per Rumba` |
| Nome accessibile pieno | `Modifica inquadratura del ritratto di Rumba` |
| Elemento semantico | `BUTTON` |
| `Cambia la tua foto` | apre ancora il selettore file |
| `Togli la tua foto` | azzera ancora solo `owner_photo_url` |
| Annulla ritocco | 0 upload, 0 update, entrambi gli URL invariati |

La whitelist customer resta esattamente `owner_notes`, `coat_preferences`,
`owner_photo_url`. In tutte le prove `photo_url` del salone e rimasto
`https://salon.invalid/rumba-recognition.jpg`.

## Tre ritocchi consecutivi

Il deposito conserva il JPEG quadrato gia ritagliato. Il banco ha creato il
primo crop dalla foto larga, poi ha toccato il medaglione e confermato tre
ritocchi consecutivi senza cambiare zoom o posizione.

| Ritocco | Dimensioni | Peso | Tipo |
| ---: | ---: | ---: | --- |
| 1 | 320 x 320 px | 12.637 byte | image/jpeg |
| 2 | 320 x 320 px | 12.637 byte | image/jpeg |
| 3 | 320 x 320 px | 12.654 byte | image/jpeg |

Confronto pixel fra primo e terzo: delta medio per canale
**0,009684/255**, MSE **0,026325**, PSNR **63,927 dB**. L'ispezione affiancata
dei due JPEG e del medaglione a 88 px non mostra degrado visibile. Resta vero
il limite strutturale dichiarato dal mandato: un ritocco non puo recuperare
cio che il primo crop ha escluso; conservarne l'originale richiederebbe una
decisione futura su deposito e permessi.

## Corrispondenza cornice-output

La prima esecuzione numericamente verde ha rivelato all'ispezione una foto di
erba al posto del muso mostrato nella cornice. Causa misurata: il componente
passava offset UI in pixel a `cropImageSquare`, che usa un riquadro
normalizzato a lato 1; lo spostamento veniva quindi amplificato di 280 volte e
finiva al bordo sorgente.

La correzione minima divide `offset.x` e `offset.y` per `FRAME_SIZE` prima di
chiamare l'helper. La nuova prova produce nel JPEG lo stesso muso visibile nel
cropper. La modifica vale anche per lo staff perche corregge la corrispondenza
fra anteprima e risultato del componente unico; non cambia opzioni, testi o
invocazioni delle pagine staff.

## Contratto staff e responsive

Le invocazioni staff non hanno diff e conservano le impronte GH-79:

- `AddClient.jsx`: `d77f3f75a1338a06018afad5ff6ae44bce370cdc6ef7626ed276a377af9e0ed7`;
- `ClientDetail.jsx`: `9f1f26006f9045733af76c737988e5c29492d543f2997afd30df78ff7bf82e66`.

Fingerprint runtime staff: descrizione originale `Trascina l'immagine e
regola lo zoom per centrare il muso del cane.`, cornice `rounded-3xl` 280 x
280, nessuna cornice circolare, pulsanti `Chiudi`, `Annulla`, `Usa questa
foto`. Pinch e massimo 8x arrivano allo staff come richiesto; nessuna nuova
prop diventa predefinita.

| Viewport | Overflow | Bersaglio minimo | Medaglione |
| ---: | ---: | ---: | ---: |
| 375 px, modale aperta | 0 px | 44 px | 88 x 88 px |
| 375 px, scheda | 0 px | 44 px | 88 x 88 px |
| 1365 px, modale aperta | 0 px | 44 px | 140 x 140 px |

## Verifiche, tempi ed eccezioni

- Banco Chromium finale con touch nativo CDP: **PASS**, durata interna
  **10,721 s**, **11,03 s reali**; 0 errori console.
- Screenshot e cinque evidenze renderizzate: **PASS**; il muso mostrato e
  quello salvato, primo e terzo ritocco ispezionati a dimensione originale.
- `npm run build` finale: **PASS**, 159 moduli, Vite **1,11 s**, **1,44 s
  reali**.
- `git diff --check` e asserzioni JSON: **PASS**.
- Revisione React: pointer state transitorio nei ref, nessun listener globale,
  nessuna nuova waterfall o stato derivato ridondante; controllo accessibile
  nativo e focus visibile.

Il primo avvio Vite temporaneo non risolveva i pacchetti dalla root del banco;
due lanci browser si sono quindi fermati prima del rendering, entrambi in
circa 31 s, senza evidenze o accessi dati. Corretto il symlink temporaneo, il
primo banco completo e passato numericamente in 11,59 s ma ha fallito
l'ispezione visiva cornice-output descritta sopra. Dopo il fix, due esecuzioni
complete consecutive sono passate. Nessuna attivita fuori istruzione.

La prova automatica usa due contatti touch nativi generati da Chromium, non
dita fisiche. Non viene presentata come sostituto della controprova umana: il
giudizio sul gesto reale resta esplicitamente affidato a Luigi nel passo
finale.

## Indicazione operativa a Cowork

Se in futuro si vorra poter allargare un ritocco, la soluzione minima non e
aumentare ancora lo zoom: occorre conservare separatamente originale owner e
derivato quadrato, mantenendo `owner_photo_url` come derivato pubblico e
introducendo per l'originale un oggetto privato accessibile solo al
proprietario e allo staff. Servono mandato dati, policy Storage e prove di
cancellazione coordinata; non e stato anticipato nulla in GH-82.

## Passo finale Luigi

Sul telefono, con la foto vera di Rumba nel prato:

1. pizzicare e trascinare fino a riempire il medaglione col muso, indicando
   cosa non torna nel gesto;
2. toccare il medaglione gia pieno e verificare che il cropper si riapra;
3. confermare due ritocchi successivi e giudicare se la foto peggiora a
   occhio.
