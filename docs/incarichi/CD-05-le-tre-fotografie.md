# CD-05 — Brief per Claude Design: le tre fotografie

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 30 agosto 2026
**Esito atteso:** composizione, non codice. Realizzerà Codex in un mandato successivo.
**Superfici:** scheda del cane nell'**app clienti** (`/u/pet/:id`), scheda del cane nel **gestionale**, e la **card pubblica** solo per la scelta di cosa mostra. **Nessuna rotta nuova.**

## Il fatto: una colonna sola per tre cose diverse

Oggi esiste **una** fotografia per cane, `pets.photo_url`. Dentro ci finiscono, in conflitto, tre cose con tre scopi:

| | chi la mette | a cosa serve | chi la guarda |
|---|---|---|---|
| **riconoscimento** | il salone | distinguere *questo* barboncino nero dagli altri undici | Davide e Roby, al banco |
| **ritratto** | il proprietario | il suo cane come lo vede lui | il proprietario, e chiunque inquadri il cartoncino |
| **album** | il salone, una per lavorazione | il cane dopo il bagno | il proprietario |

**Il conflitto, parole del salone**: la foto che fanno loro *non è un ritratto*. Inquadra il dettaglio storto, la macchia, l'orecchio piegato — serve a riconoscere. Se il proprietario la sostituisce con la posa migliore, il salone si ritrova «mille barboncini che si assomigliano tutti».

**Il conflitto, dall'altra parte**: mettere la foto del proprio cane è esattamente il gesto per cui una persona riapre un'applicazione. Toglierlo significa rinunciare all'unica interazione affettiva che questo prodotto ha.

Non sono in contraddizione: sono **due fotografie**, e oggi si contendono un posto solo. Nel frattempo, per protezione, al cliente è stata **tolta** la possibilità di modificare la foto — provvisoriamente, in attesa di questa composizione.

## Le misure — contate sulla produzione il 30/8

| | |
|---|---:|
| cani | **288** |
| cani **con una foto** | **42 (15%)** |
| visite registrate | 458 |
| visite per cane, **media** | **1,6** |
| visite per cane, **massimo** | **6** |
| cani con **zero** visite | 7 |

**Due conseguenze che decidono la composizione:**

**L'85% dei cani non ha nessuna foto**, e questo non cambierà presto. Hai già affrontato il problema in `CD-04` progettando il medaglione **per il caso senza foto**, che è la norma e non l'eccezione. Vale ancora.

**L'album sarà quasi sempre corto.** Luigi chiede «le ultime quattro foto»: con 1,6 visite di media per cane e un massimo storico di 6, **una galleria da quattro piena è un caso raro**. Compone bene chi compone prima **zero, una e due**, non quattro.

## Cosa ti chiediamo

### 1 · Il pulsante e la galleria dell'album

Un **pulsante** dalla scheda del cane che porta alle **ultime quattro fotografie** delle lavorazioni.

- Dove sta il pulsante, cosa dice, e cosa succede quando non c'è ancora nessuna foto — che oggi è il caso di **tutti** i cani.
- Come si vede la galleria con **una** foto sola: è lo stato più probabile per mesi.
- Se la galleria è una pagina, un pannello o una sovrapposizione. **Non introdurre rotte nuove**: se la tua risposta ne richiede una, dillo e spiega perché.
- **Ogni foto porta la data della lavorazione.** Le date esistono e sono affidabili.
- **Nessuna foto porta il testo dei trattamenti.** Quel campo è un diario del salone e a volte dice «non è venuto» o «rimandato per ciclo»: sotto una fotografia diventerebbe assurdo.
- Il proprietario vorrà **salvare o mandare a qualcuno** una di quelle foto. Dillo se lo prevedi, e come.

### 2 · Due visualizzazioni della foto del cane

La stessa scheda, letta da due persone che cercano cose diverse.

- **Al banco**, quello che serve è **riconoscere**: la foto del salone è la protagonista.
- **Nell'app del proprietario**, la protagonista è **la sua**.
- Il medaglione di `CD-04` resta il contenitore: **non ricomporlo**, dicci come si comporta quando le fotografie diventano due.

## Le domande che ti chiediamo di nominare

1. **Il proprietario vede la foto di riconoscimento?** È il suo cane, quindi nulla di riservato — ma è una foto fatta per uno scopo tecnico, spesso poco lusinghiera. Mostrarla, nasconderla o mostrarla altrove sono tre risposte legittime.
2. **La card pubblica cosa mostra?** È il cartoncino stampato, l'oggetto del proprietario: verosimilmente il ritratto. Ma se esiste **solo** la foto di riconoscimento, meglio mostrare quella o il medaglione disegnato? **L'album non compare mai sulla card pubblica** — è del proprietario, non del mondo: questa è una decisione già presa.
3. **Il salone vede il ritratto del proprietario?** Potrebbe essere utile («ah, è Nina») o rumore in una schermata che serve a lavorare.
4. **Cosa succede quando il proprietario non ne mette nessuna**, che sarà il caso più comune anche dopo gli inviti.
5. **Il gesto del salone è «allega», non «scatta».** La fotografia esiste già: la fanno per mandarla su WhatsApp. E la registrazione avviene **a fine serata**, quando i cani sono stati consegnati di fretta. Se la tua composizione chiede uno scatto sul momento, non accadrà mai.

## Vincoli

- **Vocabolario dell'app clienti** sulla scheda del proprietario, **del gestionale** al banco: sono due lingue e questa è una delle pochissime superfici che le tocca entrambe.
- La scheda del proprietario segue la regola di `CD-04`: **il telefono è il caso normale**, il banco l'eccezione. Nessun bersaglio sotto **54px** là dentro; **44px** nel gestionale.
- **Nessun colore nuovo.** I token esistono e sono dichiarati.
- **Nessuna rotta nuova**, nessuna promessa che il database non regge.
- **Marca con ⚠ ogni campo che non sei certa esista.** La convenzione ha prodotto correzioni sostanziali in `CD-02`, `CD-03` e `CD-04`, fra cui una che ha scoperto un difetto in produzione.
- Dichiara le domande aperte invece di risolverle in silenzio.

## Una nota sul perché conta

Questa è **l'unica cosa affettiva del prodotto**. Tutto il resto — visite, appuntamenti, incassi, fedeltà — è amministrazione, e un cliente non riapre un'applicazione per l'amministrazione. La foto del proprio cane dopo il bagno è la sola ragione per cui qualcuno tornerebbe a guardare, e l'unica cosa che mostrerebbe a un altro.
