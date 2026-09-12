# GH-83 - L'app e del proprietario, e la lingua e del salone

## Esito e perimetro

**Concluso lato implementazione e banco automatico.** Le tre pagine customer
indicate dal mandato ora parlano direttamente alla persona con la voce del
salone. Non chiamano piu la persona `cliente`, non la descrivono come
`proprietario` e non usano `Anagrafica` o `registrato` nei testi visibili
oggetto dell'inventario.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`7e09a8fa0acac617f71d0124aaa2439da309bae4`**;
  stato iniziale pulito.
- Commit locale: ricavabile con `git log -1 --format=%H --
  docs/consegne/GH-83-l-app-e-del-proprietario-esito.md` e comunicato a Luigi
  alla chiusura.
- Nessun database letto o scritto. Il banco ha usato soltanto fixture in
  memoria; produzione non letta e non scritta.
- Nessuna migration, colonna, policy, rotta, dipendenza, logica, condizione
  applicativa, colore o geometria modificati.
- Nessun push, merge o deploy.
- Suite RLS non rieseguita come richiesto. Ultima misura viva dichiarata dal
  mandato: GH-78, **60 PASS del 12/9**.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `src/apps/customer/pages/Home.jsx` | Saluto senza nome e due testi di assenza/annotazione riscritti |
| `src/apps/customer/pages/Pet.jsx` | Eyebrow, sezione dati, note lasciate e visite vuote riscritti |
| `src/apps/customer/pages/Redeem.jsx` | Voce diretta del salone nel percorso invito e rimozione di `cliente` riferito alla persona |
| `docs/consegne/evidenze/GH-83/gh83-browser-measures.json` | Testi resi e misure di dieci viste a 375 px |
| `docs/consegne/evidenze/GH-83/home-no-name-375.png` | Home senza nome a 375 px |
| `docs/consegne/evidenze/GH-83/pet-empty-375.png` | Scheda di Rumba con note e visite vuote a 375 px |
| `docs/consegne/evidenze/GH-83/redeem-form-375.png` | Modulo di riscatto a 375 px |
| `docs/consegne/evidenze/GH-83/redeem-staff-375.png` | Riscatto con account del salone a 375 px |
| `docs/consegne/GH-83-l-app-e-del-proprietario-esito.md` | Questo registro |

## Testi nuovi, per esteso

### `Pet.jsx`

1. `Il tuo pet` - sostituisce entrambe le occorrenze di `Scheda pet`.
2. `Quello che sappiamo del tuo pet`.
3. `Le note che ci hai lasciato`.
4. `Non ci hai ancora lasciato note.`.
5. `Non abbiamo ancora annotato visite.`.

### `Home.jsx`

1. Con nome: `Bentornato, {nome}.` - resa invariata, solo esplicitata nella
   formattazione condizionale.
2. Senza nome: **`Bentornato.`**. Non contiene `cliente`.
3. `Non vediamo ancora un pet nella tua area. Per aggiungerlo, contattaci
   direttamente.`.
4. `Si accumulano con le visite e con gli eventuali movimenti che annotiamo
   per te.`.

### `Redeem.jsx`

1. `Apri il link completo che ti abbiamo inviato. Se non lo trovi più,
   chiedici un nuovo invito.`.
2. `Il codice non corrisponde a uno dei nostri inviti. Controlla di aver
   aperto il link completo.`.
3. `Per proteggere la tua scheda, i nostri inviti hanno una durata limitata.
   Chiedicine uno nuovo.`.
4. `L’invito appartiene a un account già in uso. Accedi con quell’account
   oppure contattaci.`.
5. `Questo invito era già associato al tuo account. Puoi continuare nella tua
   area.`.
6. `Account del salone riconosciuto`.
7. `Usa un account personale separato`.
8. `La scheda non è stata modificata. Esci e accedi con l’account personale
   che usi per il tuo pet.`.
9. `La scheda del tuo pet è ora collegata. Ti portiamo nella tua area.`.
10. `Riprova tra poco o contattaci.`.
11. `L’account richiede una conferma non prevista. Contattaci.`.
12. `Il tuo invito`.
13. `Crea il tuo accesso oppure usa un account personale che hai già. Il
    collegamento avverrà automaticamente.`.
14. `Questo link collega esclusivamente la scheda che abbiamo preparato per
    te.`.

La frase tecnica richiesta dal mandato resta leggibile per intero dentro il
nuovo contorno: `Esci e accedi con l’account personale`.

## Percorso di riscatto

Il codice corrente espone **sette** esiti nominati in `VIEW_COPY`, non sei.
Per non saltare una condizione, il banco li ha verificati tutti e sette, oltre
al modulo iniziale. I testi completi degli esiti sono:

| Esito | Eyebrow | Titolo | Corpo |
| --- | --- | --- | --- |
| `missing` | `Invito non disponibile` | `Manca il codice invito` | `Apri il link completo che ti abbiamo inviato. Se non lo trovi più, chiedici un nuovo invito.` |
| `not_found` | `Invito non riconosciuto` | `Questo link non è valido` | `Il codice non corrisponde a uno dei nostri inviti. Controlla di aver aperto il link completo.` |
| `expired` | `Invito scaduto` | `Serve un nuovo link` | `Per proteggere la tua scheda, i nostri inviti hanno una durata limitata. Chiedicine uno nuovo.` |
| `used` | `Invito già utilizzato` | `Questo link è già stato collegato` | `L’invito appartiene a un account già in uso. Accedi con quell’account oppure contattaci.` |
| `already` | `Scheda già collegata` | `È tutto a posto` | `Questo invito era già associato al tuo account. Puoi continuare nella tua area.` |
| `staff` | `Account del salone riconosciuto` | `Usa un account personale separato` | `La scheda non è stata modificata. Esci e accedi con l’account personale che usi per il tuo pet.` |
| `success` | `Collegamento completato` | `Benvenuto nella tua area` | `La scheda del tuo pet è ora collegata. Ti portiamo nella tua area.` |

Sono stati inoltre letti il modulo (`Invito personale`, `Entra nell’area del
tuo pet`), lo stato transitorio (`Il tuo invito`, `Colleghiamo la tua scheda`)
e il ripiego di errore (`Collegamento non riuscito`, `Non siamo riusciti a
completare l’invito`, `Riprova tra poco o contattaci.`). Nessuno chiama la
persona `cliente`.

## Ricerca esaustiva e invarianti

Comando richiesto:

```sh
rg -n -i 'proprietario|Anagrafica|registrat|cliente' src/apps/customer
```

Occorrenze rimaste, esaustive:

```text
src/apps/customer/pages/Login.jsx:14: *   - NIENTE link "Registrati" pubblico — /u/redeem/:token è l'unica via.
src/apps/customer/pages/Login.jsx:22: *   - Footer asciutto (no link "Registrati").
```

Restano perche sono **commenti tecnici non visibili** che documentano
l'assenza della registrazione pubblica. Non chiamano la persona `cliente` e
non appartengono all'inventario di testi UI.

- `git diff --quiet -- src/apps/staff` ha restituito `0`: nessun file e nessuna
  stringa staff modificati.
- `git diff --check` e passato.
- Diff sorgente: `Home.jsx` 4 aggiunte/4 rimozioni, `Pet.jsx` 6/6,
  `Redeem.jsx` 14/14. Ogni hunk cambia esclusivamente contenuto testuale o,
  per il saluto, la sua formattazione condizionale gia prevista da `greeting`.
  Import, hook, chiamate dati, callback, destinazioni, props di comportamento
  e condizioni di dominio non hanno diff.

## Frasi modello

Le due frasi modello presenti nel sorgente alla base hanno la stessa impronta
prima e dopo:

| Frase | SHA-256 base | SHA-256 dopo |
| --- | --- | --- |
| `Dopo il prossimo bagno troverai qui la sua foto` | `0ebffe539e6dfee90a8d587525b69546e9f958b0076ca77eeac6aa36cb40d9f1` | `0ebffe539e6dfee90a8d587525b69546e9f958b0076ca77eeac6aa36cb40d9f1` |
| `Metti qui il ritratto di {pet.name}.` | `7797c8beb2da97ad72332f8fdf5ba94e2a6aba6e293fb72f5e406a66144dc159` | `7797c8beb2da97ad72332f8fdf5ba94e2a6aba6e293fb72f5e406a66144dc159` |

La terza frase citata dal mandato, `Se ne hai una che ti piace di più,
mettila tu: la nostra resta qui sotto`, era gia assente da
`src/apps/customer` alla base ed e assente dopo GH-83. La ricerca base e
quella finale hanno entrambe prodotto l'impronta SHA-256 del flusso vuoto
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`:
GH-83 non l'ha rimossa ne modificata.

## Prova a 375 px

Banco Chromium su fixture esclusivamente in memoria, viewport **375 x 812
px**, dieci viste:

| Vista | Overflow orizzontale | Elementi oltre viewport | Testi troncati | Termini vietati visibili |
| --- | ---: | ---: | ---: | ---: |
| Home senza nome | 0 px | 0 | 0 | 0 |
| Pet senza note e visite | 0 px | 0 | 0 | 0 |
| Riscatto `missing` | 0 px | 0 | 0 | 0 |
| Riscatto modulo | 0 px | 0 | 0 | 0 |
| Riscatto `not_found` | 0 px | 0 | 0 | 0 |
| Riscatto `expired` | 0 px | 0 | 0 | 0 |
| Riscatto `used` | 0 px | 0 | 0 | 0 |
| Riscatto `already` | 0 px | 0 | 0 | 0 |
| Riscatto `staff` | 0 px | 0 | 0 | 0 |
| Riscatto `success` | 0 px | 0 | 0 | 0 |

I punti piu lunghi verificati nel rendering sono:

- `Crea il tuo accesso oppure usa un account personale che hai già. Il
  collegamento avverrà automaticamente.`;
- `La scheda non è stata modificata. Esci e accedi con l’account personale che
  usi per il tuo pet.`;
- `Apri il link completo che ti abbiamo inviato. Se non lo trovi più, chiedici
  un nuovo invito.`;
- `Quello che sappiamo del tuo pet`;
- `Si accumulano con le visite e con gli eventuali movimenti che annotiamo per
  te.`.

Tutte le stringhe attese sono presenti nel DOM; zero errori console. Le
quattro schermate salvate sono state ispezionate a dimensione originale.

## Verifiche, tempi ed eccezioni

- Banco Chromium finale: **PASS**, 10 viste, **6,80 s reali**, zero errori
  console.
- Ispezione visiva di home, pet, modulo invito e blocco account del salone:
  **PASS**.
- `npm run build`: **PASS**, 159 moduli, Vite **1,25 s**, **1,63 s reali**.
- Ricerca esaustiva, impronte, `git diff --check`, diff staff e revisione delle
  24 sostituzioni testuali: **PASS**.
- Avviso build non bloccante e preesistente: bundle JavaScript oltre 500 kB.

La prima esecuzione del banco, durata 7,80 s, e stata scartata: il mock
temporaneo restituiva un nuovo oggetto `pet` a ogni render e innescava il
limite di aggiornamenti React; inoltre due eyebrow trasformati in maiuscolo
dal CSS falsavano un confronto sensibile al caso. Le fixture sono state rese
stabili e il confronto allineato alla resa tipografica; il banco finale e
passato integralmente. Il difetto era nel solo banco temporaneo, poi rimosso,
non nel codice applicativo. Nessuna attivita fuori istruzione.

Non sono emersi rallentamenti del pacchetto: Vite si e avviato in 116 ms, il
banco finale ha impiegato 6,80 s e la build 1,63 s reali.

## Passo finale Luigi

Sul telefono:

1. percorrere la scheda di Rumba dall'alto in basso e indicare ogni punto in
   cui l'app sembra ancora parlare di Luigi anziche a Luigi;
2. rileggere il riscatto come primo contatto con il salone;
3. chiedersi se sembra l'area di un negozio che conosce la persona oppure una
   scheda di archivio;
4. farla leggere a Paola chiedendo soltanto: `cosa non ti torna?`.
