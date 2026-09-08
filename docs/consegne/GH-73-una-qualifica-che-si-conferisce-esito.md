# GH-73 - Una qualifica che si conferisce

## Esito e perimetro

**Implementazione conclusa e migration provata sul demo con rollback; suite RLS
completa non eseguibile per assenza della sonda staff.** La migration resta nel
repository e non e applicata ne al demo ne alla produzione. Nessun push, merge o
deploy.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`5a081af2b67a9f820f77bedef779be7680087bc3`**;
  stato iniziale pulito.
- Unico database letto e usato per le prove: demo `grooming-hub-demo`, ref
  `qttpinkslhenxrsbhhhg`.
- Produzione `azgehoseiojodltcttfb`: **mai letta e mai scritta**.
- Il collegamento locale Supabase risultava puntato alla produzione: per questo
  non e stato eseguito alcun comando CLI remoto. Ogni interrogazione viva ha
  indicato esplicitamente il ref demo.
- Commit locale: ricavabile con
  `git log -1 --format=%H -- docs/consegne/GH-73-una-qualifica-che-si-conferisce-esito.md`
  e comunicato a Luigi nella chiusura.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `supabase/migrations/20260908055623_gh73_awarded_fidelity_tier.sql` | Colonna nullable vincolata e aggiornamento della proiezione pubblica al livello effettivo |
| `src/apps/staff/lib/fidelity.js` | Massimo fra livello calcolato e conferito, prossimo livello relativo all'effettivo, motivazione staff |
| `src/apps/staff/lib/database.js` | Mutazione staff protetta per conferimento e revoca |
| `src/apps/staff/pages/ClientDetail.jsx` | Lettura della motivazione e comando di conferimento/revoca nella scheda pet |
| `src/apps/staff/styles/gh15-staff.css` | Solo spaziatura e peso della motivazione, senza nuovi colori |
| `docs/consegne/GH-73-una-qualifica-che-si-conferisce-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-73/gh73-demo-transaction.json` | Misure vive demo, casi transazionali e stato dopo rollback |
| `docs/consegne/evidenze/GH-73/gh73-fidelity-unit.json` | Sette casi sul calcolo reale della fidelity |
| `docs/consegne/evidenze/GH-73/gh73-verification-limits.json` | Limiti misurati di suite RLS, banco browser e ricerca customer |

Impronte SHA-256 dei cinque file funzionali al momento delle prove:

- `database.js`: `3f5fa166fb3ad771e829cecb8e6887b4bc10a36ba2574df69ae4d3764c199506`
- `fidelity.js`: `0a6a3c2d7bf881f87f6ba6371b6e39c6a06d3482588bcd47a032024402272b3e`
- `ClientDetail.jsx`: `0ada0fcdb588eec5462c82abf3367a7beeaf6ad34a1fb7e259107dacb9d3cca1`
- `gh15-staff.css`: `72148c1f3614e4a57a8a9875f431b4599f6f51df61c9fa914eb5888649b44ca9`
- migration: `7f1ded91b644f25fa6d4965090eb7bcf84c651f578d87888d0deb2a20d576e43`

## Implementazione

`pets.awarded_fidelity_tier` e nullable, senza default, e ammette soltanto
`bronze`, `silver`, `gold`. Il livello effettivo e il massimo per rango fra
quello calcolato da visite/punti e quello conferito. Il prossimo livello parte
dal livello effettivo; finestre, soglie, conteggi e punti conservano la
matematica precedente.

In caso di parita fra livello calcolato e conferito la sorgente mostrata allo
staff resta quella calcolata. Questo evita la doppia rappresentazione e fa
leggere una sola ragione. Le diciture misurate sono:

- `Oro · 36 visite negli ultimi 36 mesi`
- `Oro · conferito dal salone`

La mutazione applicativa passa dalle guardie staff gia usate dal gestionale e
filtra sia `id` sia `tenant_id`. Il valore vuoto revoca la qualifica. Visite,
punti, soglie e appartenenza del livello al singolo pet non vengono modificati.

La proiezione QR pubblica calcola lo stesso livello effettivo ma non restituisce
la fonte del conferimento. Anche il portale cliente legacy usa lo snapshot
condiviso senza mostrare la sorgente. Nell'app cliente moderna non esisteva una
vista fidelity da estendere, quindi non e stata inventata una nuova superficie.

Un pet senza livello non mostra motivazioni, segnaposti o inviti testuali. Il
pulsante neutro `Qualifica` resta il comando operativo necessario allo staff.

**Estensione rispetto all'elenco indicativo del mandato:** sono state aggiunte
sei righe in `gh15-staff.css`, esclusivamente per la resa tipografica della
motivazione con variabili gia esistenti. Nessun colore e nessuna rotta aggiunti.

## Prova della migration sul demo

La sintassi completa della migration e stata eseguita sul demo dentro una
transazione conclusa da un'eccezione deliberata. Marker:
`GH73_EXACT_MIGRATION_ROLLBACK_OK`. Una seconda transazione ha costruito e
smontato le fixture prima del rollback finale.

| Controprova | Misura / esito |
| --- | --- |
| Pet senza livello | `base`, prossimo `bronze`; motivazione staff vuota |
| Bronzo conferito, zero visite | effettivo `bronze`, prossimo `silver` |
| Oro da visite, bronzo conferito | effettivo `gold`, fonte staff `visits` |
| Oro calcolato e conferito | una sola riga `gold`, visite conteggiate `36` |
| Revoca | ritorno a `base`; impronta visite prima/dopo identica: `3e46d041866ff8aa1abf5c1226f42b605e6869b42bbfa34baa2fd5f4a3764e85` |
| Valore inventato | `platinum` rifiutato con `check_violation` |
| Scrittura customer | la riga posseduta viene raggiunta, ma il trigger ripristina `awarded_fidelity_tier = null` |
| Whitelist customer | funzione invariata, MD5 `3a098454689e2d8f94cf077aa4f5933f`; restano tre soli campi: `owner_notes`, `coat_preferences`, `owner_photo_url` |
| Proiezione cliente | 0 chiavi che rivelano fonte o conferimento |
| Punti prima/dopo | 0 movimenti, somma 0 |
| Soglie prima/dopo | MD5 `d44368e26a42bf5fc45808498bb6b8ff` |

Fotografia viva finale dopo i rollback: colonna nuova `0`, customer fixture `0`,
pet fixture `0`, visite fixture `0`, visite totali `90`, movimenti punti `0`,
somma punti `0`. La funzione pubblica e tornata all'impronta iniziale
`e3bc0f5c4b98a58fc39f29c8b1a1a6b2`.

Il primo tentativo di fixture e terminato prima delle modifiche per
un'inferenza di tipo `text`/`uuid` in una `UNION`; il rollback automatico e
stato verificato a zero e il banco corretto ha poi completato tutte le prove.

## Verifiche applicative

- Suite pura `getFidelityTierSnapshot`: **7 casi PASS**, inclusi livello nullo,
  conferimento, calcolo vincente, parita, revoca, oro conferito e punti ancora
  operativi; **0,14 s reali**.
- Ricerca della distinzione lato cliente in `src/apps/customer`,
  `CustomerPortal.jsx` e `PublicPetCard.jsx`: **0 corrispondenze** per
  `awarded_fidelity`, `conferit`, `qualifica`.
- `npm run build`: **PASS**, 159 moduli; Vite **1,25 s**, **1,64 s reali**.
  Restano i soli avvisi non bloccanti gia presenti su Browserslist e chunk oltre
  500 kB.
- `git diff --check`: **PASS**.
- `npm run lint`: non eseguibile, perche il pacchetto dichiara lo script ma non
  contiene il comando locale `eslint` (`eslint: command not found`).
- Advisor demo letti in sola lettura. La migration non essendo applicata, la
  misura e solo baseline: restano avvisi preesistenti sulle funzioni
  `SECURITY DEFINER`, sull'InitPlan RLS, su indici inutilizzati e policy
  permissive multiple. Nessun advisor puo essere attribuito allo schema GH-73.

## Limiti e soluzione consigliata a Cowork

La suite `node scripts/rls-tests/run.mjs` ha raggiunto esclusivamente il demo ma
si e fermata al bootstrap: **0 PASS, 1 FAIL, 0 SKIP**, in **0,96 s**, con
`Login sonda staff: invalid_credentials Invalid login credentials`. La sonda
`staff.sonda@test.example` era stata smontata nel ciclo precedente, come
previsto dal suo mandato. Non sono stati toccati account reali e non e stato
creato un nuovo utente Auth fuori perimetro.

La protezione specifica della colonna nuova e comunque misurata direttamente
nel database: una sessione customer autenticata ha tentato l'update sulla
propria riga e la whitelist ha ripristinato il valore nullo. Quella prova non
sostituisce la regressione completa RLS, che resta esplicitamente non verde.

**Soluzione raccomandata a Cowork:** emettere un micro-mandato che autorizzi sul
solo demo la ricreazione idempotente della sonda GH-04, esegua la suite RLS
esistente e smonti Auth, profilo e membership nella stessa sessione. Non serve
applicare stabilmente GH-73 al demo: la nuova colonna e gia stata coperta dalla
prova customer transazionale con rollback.

Controprove proposte: login sonda riuscito; suite con tutti i casi PASS; account
customer reali intatti; conteggio di profilo e membership della sonda a zero;
login sonda nuovamente rifiutato dopo il teardown. Rischio residuo: lasciare una
credenziale o membership di prova; viene contenuto rendendo teardown e conteggi
finali parte dello stesso mandato. Usare l'account operatore reale e
sconsigliato perche allarga il rischio senza aumentare la copertura.

Il banco browser isolato ha compilato il componente reale ma `ClientDetail` non
ha raggiunto l'heading entro il timeout controllato di 5 secondi: **0 screenshot
prodotti**, **0 server rimasti attivi**. Un precedente tentativo e rimasto in
attesa oltre 30 secondi ed e stato interrotto e segnalato a Luigi; era il banco
di isolamento, non un rallentamento del workspace o di iCloud. Non si dichiara
una verifica visiva che non e avvenuta.

## Tempi, pulizia e passo finale

Il tempo totale della sessione non e stato misurato dall'avvio e non viene
ricostruito. Misure puntuali disponibili: suite pura **0,14 s**, bootstrap RLS
**0,96 s**, build finale **1,64 s reali**, fotografia SQL conclusiva **16,9 s**.
Le transazioni vive e la lettura Advisor non sono state cronometrate.

Pulizia finale demo: migration non applicata, colonna assente, fixture GH-73 a
zero, visite/punti/soglie invariati. Nessun file temporaneo o server del giro
deve restare attivo. Nessuna attivita fuori istruzione.

**A Luigi, dopo applicazione e rilascio, su pagina ricaricata dall'origine con
Opzione-Comando-R:** conferisci e revoca l'oro, confronta la motivazione staff
con un oro guadagnato e guarda il risultato cliente. La domanda resta: **cosa
non ti torna?**
