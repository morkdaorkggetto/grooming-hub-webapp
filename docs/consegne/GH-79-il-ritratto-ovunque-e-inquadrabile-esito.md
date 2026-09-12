# GH-79 - Il ritratto, ovunque, e inquadrabile

## Esito e perimetro

**Concluso.** Home, prenotazione e scheda pet mostrano esclusivamente il
ritratto scelto dal proprietario, con iniziale quando manca. Il cliente puo
inquadrare il nuovo ritratto prima dell'upload; lo staff continua a usare lo
stesso ritaglio con il comportamento precedente.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`b496cc7d55bfb5083f933fc20ec4765e322d2d4f`**;
  stato iniziale pulito.
- Nessun database letto o scritto: tutte le fixture erano in memoria. Il demo
  `qttpinkslhenxrsbhhhg` era l'unico ambiente ammesso ma non e stato
  necessario collegarlo. Produzione mai letta e mai scritta.
- Nessuna migration, colonna, policy, rotta, dipendenza, push, merge o deploy.
- Commit locale: ricavabile con `git log -1 --format=%H --
  docs/consegne/GH-79-il-ritratto-ovunque-e-inquadrabile-esito.md` e
  comunicato a Luigi alla chiusura.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/apps/customer/hooks/usePet.js` | Rimossa `pets.photo_url` dalla select della scheda customer |
| `src/apps/customer/hooks/usePets.js` | L'elenco pet carica `owner_photo_url` al posto di `photo_url` |
| `src/apps/customer/pages/Home.jsx` | Card pet collegata al ritratto owner, con iniziale di riserva |
| `src/apps/customer/pages/Book.jsx` | Scelta pet collegata al ritratto owner, con iniziale di riserva |
| `src/apps/customer/pages/Pet.jsx` | Selezione file, ritaglio circolare, upload solo dopo conferma |
| `src/apps/staff/components/ImageCropModal.jsx` | Componente rimosso dalla collocazione staff |
| `src/apps/staff/lib/imageCrop.js` | Helper rimosso dalla collocazione staff |
| `src/apps/staff/pages/AddClient.jsx` | Solo import del componente condiviso |
| `src/apps/staff/pages/ClientDetail.jsx` | Solo import del componente condiviso |
| `src/shared/media/imageCrop.js` | Helper trasferito senza modifiche |
| `src/shared/ui/ImageCropModal.jsx` | Componente condiviso, variante owner circolare opzionale |
| `docs/consegne/evidenze/GH-79/gh79-browser-measures.json` | Misure del banco browser in memoria |
| `docs/consegne/evidenze/GH-79/gh79-home-rumba-1365.png` | Screenshot Home con ritratto di Rumba |
| `docs/consegne/evidenze/GH-79/gh79-pet-rumba-1365.png` | Screenshot scheda dello stesso pet e ritratto |
| `docs/consegne/evidenze/GH-79/gh79-crop-touch-375.png` | Screenshot ritaglio circolare a 375 px |
| `docs/consegne/GH-79-il-ritratto-ovunque-e-inquadrabile-esito.md` | Questo registro |

SHA-256 principali:

- helper condiviso: `9964c735f7ee5fd7cfbd3e5f9f641611cca18d3f7bd9780b8c80c5c03a7743a6`;
- componente condiviso: `05a2b55f2040857e044ad87cf1a28261ae9bc4e18cc580c1a7d4681df35055ee`;
- misure browser: `83fa5db26c6bd031032b07afa2f71e4b28337e46af00f0db2bc660f2d1167716`.

## Ricerca esaustiva foto

Comando principale:

```sh
rg -n '\b(pet|p)\.photo_url\b' src/apps/customer
```

Esito: **0 occorrenze**. Sono stati esaminati tutti i file sotto
`src/apps/customer`; la seconda ricerca `rg -n 'photo_url'
src/apps/customer` ha classificato le sole occorrenze non-owner rimaste:

- `src/apps/customer/hooks/usePetVisits.js`: select della foto visita;
- `src/apps/customer/pages/Pet.jsx`: `active.photo_url`, `photo.photo_url` e
  `visit.photo_url`, tutti appartenenti all'album di fine lavorazione.

La select della singola scheda in `usePet.js` non richiede piu la foto di
riconoscimento. Nessun punto della superficie customer riceve o rende
`pets.photo_url`.

Select elenco prima:

```text
id, name, species, breed, sex, birth_date, weight_kg, color, photo_url
```

Select elenco dopo:

```text
id, name, species, breed, sex, birth_date, weight_kg, color, owner_photo_url
```

## Matrice ritratto

Banco Playwright con Supabase, Auth e Storage sostituiti da fixture locali in
memoria. Il valore owner era unico e il valore salone era
`https://salon.invalid/rumba-recognition.jpg`.

| Fixture | Home | Prenotazione | Scheda | URL salone nel DOM | Overflow |
| --- | --- | --- | --- | ---: | ---: |
| Solo foto salone | iniziale `R` | iniziale `R` | iniziale `R` | 0/3 | 0 px |
| Solo ritratto owner | stesso ritratto | stesso ritratto | stesso ritratto | 0/3 | 0 px |
| Entrambe | ritratto owner | ritratto owner | ritratto owner | 0/3 | 0 px |

Risultato: **9/9 combinazioni PASS**. Gli screenshot Home e scheda mostrano
lo stesso asset owner. Dimensioni e SHA-256:

| Evidenza | Dimensioni | SHA-256 |
| --- | --- | --- |
| `gh79-home-rumba-1365.png` | 1365 x 900 | `a44ea3ec7e6431232a8cfc20beb6f4feb21cc83b5b1e7443f01efb53fa52575c` |
| `gh79-pet-rumba-1365.png` | 1365 x 1194 | `cb0d286811a3364f568cb223bb1162aa957fe71005d02729f3cec8edb3a843ab` |
| `gh79-crop-touch-375.png` | 375 x 1451 | `187ac3707632c42244f129ce06ec5a29d5f1997d69dc6552c384a02d8d83fb20` |

Ispezione visiva: ritratto leggibile e coerente fra Home e scheda; modale
centrale, inquadratura tonda e controlli senza sovrapposizioni a 375 px.

## Ritaglio e invarianti

Il file scelto apre il componente condiviso e non viene caricato finche il
cliente non conferma. Il gesto touch simulato a 375 px ha spostato
l'inquadratura di **34 px in orizzontale e 22 px in verticale**.

| Controprova | Esito |
| --- | --- |
| Cornice customer | circolare, 280 x 280 px |
| Overflow a 375 px | 0 px |
| Bersaglio minimo | 44 px |
| Annulla | 0 upload, 0 scritture, ritratto ancora nullo |
| Conferma | 1 JPEG ritagliato da 20.890 byte, 1 upload e 1 update in memoria |
| Campo aggiornato | solo `owner_photo_url` |
| `photo_url` salone | identico prima e dopo: `https://salon.invalid/rumba-recognition.jpg` |
| Whitelist customer | invariata: `owner_notes`, `coat_preferences`, `owner_photo_url` |

## Impronta staff

L'helper spostato e byte-per-byte identico: SHA-256 prima e dopo
`9964c735f7ee5fd7cfbd3e5f9f641611cca18d3f7bd9780b8c80c5c03a7743a6`.
I blocchi di invocazione delle due pagine sono identici prima e dopo:

- `AddClient.jsx`: `d77f3f75a1338a06018afad5ff6ae44bce370cdc6ef7626ed276a377af9e0ed7`;
- `ClientDetail.jsx`: `9f1f26006f9045733af76c737988e5c29492d543f2997afd30df78ff7bf82e66`.

Il fingerprint runtime predefinito dello staff conferma descrizione originale
`Trascina l'immagine e regola lo zoom per centrare il muso del cane.`, cornice
`rounded-3xl` 280 x 280, nessuna cornice circolare e pulsanti `Chiudi`,
`Annulla`, `Usa questa foto`. Le sole opzioni nuove (`round` e `description`)
sono esplicite nella chiamata customer; i default conservano il contratto
staff.

## Verifiche, tempi ed eccezioni

- Banco browser finale: **PASS**, 9/9 casi foto, gesto touch, annulla,
  conferma, fingerprint staff e 0 errori console inattesi.
- Asserzioni JSON, ricerca esaustiva e `git diff --check`: **PASS**; ultimo
  controllo statico in circa **0,02 s**.
- `npm run build`: **PASS**, 159 moduli, Vite **1,23 s**, **1,69 s reali**.
- Revisione React: nessuna nuova waterfall, listener globale non ripulito,
  stato derivato ridondante o regressione accessibilita rilevata.
- Suite RLS non rieseguita come richiesto. Ultima misura viva dichiarata dal
  mandato: GH-78, **60 PASS del 12/9**.
- Lint non eseguito: lo script esiste ma il binario locale ESLint non e
  installato. La build e i controlli mirati sono verdi.
- Restano i soli avvisi build preesistenti: dati Browserslist vecchi di sette
  mesi e chunk JavaScript oltre 500 kB.

Il banco ha richiesto alcuni aggiustamenti confinati in `/private/tmp`: root
ESM per Vite, rete locale autorizzata, una fixture servizi non vuota, CSS
compilato reale e gesto touch Playwright al posto del setter sintetico. Un
annullamento immediato ha prodotto il solo rumore Chromium atteso
`ERR_FILE_NOT_FOUND` su un blob gia revocato; e classificato separatamente e
non compare fra gli errori console inattesi. Nessuna di queste correzioni ha
toccato il codice applicativo o un database.

Un primo controllo statico aggregato si e fermato per un conteggio rigido
errato delle stringhe `photo_url`; le asserzioni semantiche separate sono poi
passate. Nessuna attivita fuori istruzione.

Durante le prove sono comparsi `docs/consegne/README.md` modificato e il nuovo
`docs/incarichi/GH-80-che-mangia-il-tuo-pet.md`. Luigi ne ha autorizzato
l'esclusione: non sono stati modificati, messi in stage o inclusi nel commit
GH-79.

## Indicazione operativa a Cowork

Per i prossimi giri foto conviene mantenere come contratto automatico la
matrice `solo salone / solo owner / entrambe` su ogni nuova superficie
customer. Cosi una nuova card non puo reintrodurre per distrazione
`pets.photo_url`, mentre l'album visite resta verificato separatamente.

## Passo finale Luigi

Sul telefono, nella scheda di Rumba:

1. confrontare Home e scheda e indicare cosa non torna nel ritratto;
2. caricare un ritratto e inquadrarlo col dito, valutando se il gesto e
   naturale;
3. aprire un pet con sola foto salone e verificare che mostri sempre
   l'iniziale.
