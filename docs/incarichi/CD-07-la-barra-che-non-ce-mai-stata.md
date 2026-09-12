# CD-07 — Brief per Claude Design: la barra che non c'è mai stata

**Progetto: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi, via Cowork · **Data:** 12 settembre 2026
**Esito atteso:** composizione, non codice. Realizzerà Codex in un mandato successivo.
**Superficie:** il gestionale, tutte le pagine. **Nessuna rotta nuova.**

## La cosa che manca, e che nessuno aveva mai nominato

**Il gestionale non ha una navigazione.**

Dieci pagine — dashboard, calendario, contatti, richieste, report incassi, scheda cliente, nuovo cliente, nuova visita, promozioni, giornata — e **nessun modo di passare dall'una all'altra** se non i pulsanti che ogni pagina si porta nella propria intestazione, diversi ogni volta.

Non è mai stato progettato: **è cresciuto**. Ogni giro ha aggiunto una pagina e un pulsante per raggiungerla dal punto in cui serviva, e nessuno ha mai guardato l'insieme.

L'app **clienti** invece ce l'ha — `CustomerNav`, tre voci: Home, Promozioni, Profilo. **Il salone, che ci lavora otto ore al giorno, no.**

## L'occasione: un avviso che oggi non arriva

L'11 settembre è arrivata **la prima richiesta di prenotazione di un cliente vero**. Alle **16:29 di venerdì — in pieno orario di apertura.**

**È rimasta senza risposta per diciotto ore.**

Non perché il salone fosse chiuso o distratto: **perché erano su un'altra pagina.** L'avviso esiste — la dashboard dice *«n richieste cliente da confermare»*, il calendario dice *«n da confermare»* — ma **bisogna essere lì per vederlo.**

> **Il guasto non è «nessuno era davanti allo schermo»: è «nessuno era su quella schermata».**

E fra poche settimane il salone inviterà **322 clienti**. Con uno, diciotto ore di silenzio sono un aneddoto. Con trecento, **le richieste marciscono senza che nessuno lo sappia**, e la prima cosa che il salone perde è la fiducia di chi ha scritto per primo.

## Cosa ti chiediamo

**Una navigazione per il gestionale**, che porti anche **un indicatore delle richieste in attesa**.

Le due cose insieme, perché l'indicatore ha bisogno di un posto che ci sia sempre, e la navigazione è quel posto. **Ma la barra non è un supporto per il pallino**: è una mancanza vecchia che l'avviso ha reso visibile.

### Decisioni già prese, non sono domande

**Il numero conta una cosa sola: le richieste dei clienti in attesa.** Non «le cose da fare». Un indicatore che somma oggetti diversi non dice più niente e nessuno se ne fida.

**Il suono lo progetta Codex, non tu**, ma sappilo: all'arrivo di una richiesta ci sarà anche un suono, **silenziabile e con la scelta ricordata**. In un salone ci sono cani e phon. Il pallino dice **quante ne aspettano**; il suono dice **che ne è arrivata una adesso**. Sono due informazioni diverse.

**Nessun colore nuovo.** Eredita `design_handoff_staff_app/`: token, scala, geometria, **un solo punto di rottura a 640px**, e al banco la regola è **44px**.

> ⚠ **Il materiale in `design_handoff_staff_app/` è indietro di due giri**: documenta rese superate da `GH-55` e `GH-56`. **Fidati dei token, non degli esempi.** Riallinearlo è una coda nostra, non tua.

### Le domande che ti chiediamo di nominare

1. **Dove sta, su uno schermo largo?** Al banco c'è un **27 pollici**: il caso normale è il desktop, il telefono è il ripiego — **l'inverso** dell'app clienti.
2. **Quali voci?** Le pagine sono dieci, ma non tutte sono destinazioni: «nuova visita» e «nuovo cliente» si raggiungono facendo qualcosa, non navigando. **Quali meritano una voce e quali no?**
3. **Come convive con le intestazioni esistenti?** Ogni pagina ha un `Hero` con titolo, sottotitolo e i suoi pulsanti d'azione. La barra **non deve duplicarli**, e nemmeno svuotarli.
4. **Che forma ha l'indicatore quando è a zero?** Che è **quasi sempre**: al 12 settembre le richieste in attesa sono **zero**, e ne è arrivata **una** in tutta la storia. Sparisce, resta spento, o resta con lo zero?
5. **E quando sono tante?** Dopo il lancio potrebbero arrivarne parecchie insieme. Il numero cresce all'infinito, o si ferma?

### Una cosa che ti chiediamo di guardare, non di risolvere

Il gestionale è cresciuto per pagine. Componendo la barra **vedrai l'insieme per la prima volta**: se qualcosa ti sembra fuori posto — una pagina che non dovrebbe esistere, due che sono la stessa — **dillo**. Non è il mandato, ma è la cosa che nessuno ha mai potuto vedere.

## Vincoli

- **Nessuna rotta nuova**, nessuna pagina nuova.
- **Nessuna promessa che il database non regge**: l'unico numero disponibile è il conteggio delle richieste in attesa.
- **Marca con ⚠ ogni campo che non sei certa esista.** Ha prodotto correzioni sostanziali in tutti i giri, compresa una che ha scoperto un difetto in produzione.
- **Dichiara le domande aperte invece di risolverle in silenzio.** In `CD-05` ne hai lasciata una — *«il proprietario vede la foto di riconoscimento?»* — e ha fatto bene: nessuno l'aveva decisa, ed è stata decisa il 12 settembre, un mese dopo. **Quella dichiarazione ha funzionato.**

## Due stati che saranno la norma

- **Indicatore a zero.** È lo stato di oggi e resterà il più frequente anche dopo il lancio: un salone riceve qualche richiesta al giorno, non una al minuto.
- **Il gestionale aperto tutto il giorno sullo stesso schermo.** Dodici sessioni contemporanee, misurate. La barra sarà guardata migliaia di volte e usata poche: **deve sopportare di essere ignorata.**

Compone bene chi compone prima questi due.
