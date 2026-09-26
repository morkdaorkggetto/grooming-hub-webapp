# Brief CD-09 — La tessera del cane

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`.
**Per:** Claude Design · **Da:** Luigi · **Data:** 24 settembre 2026
**Superficie:** app del proprietario, `apps/customer/pages/Home.jsx`.
**Chiesto da Luigi e Davide.** Composizione, non codice: il mandato di esecuzione verrà dopo.

## Da dove nasce, e perché non è una tessera per il wallet

Luigi e Davide volevano **una tessera da aggiungere al wallet del telefono**. Valutata il 24 settembre e **scartata**, con una ragione che conta più del costo.

Per avere una tessera con il marchio del salone servono **99 $ l'anno** ad Apple e un secondo account per Android. L'alternativa è appoggiarsi a un servizio terzo che firma le tessere **con il proprio certificato**: gratis fino a un migliaio al mese, poi a canone. Ma allora **le tessere nei telefoni dei clienti appartengono a quel servizio**: se chiude, cambia condizioni o non lo si paga più, restano lì e non si aggiornano, e non c'è modo di riprendersele.

**Parole di Luigi, 24/9:** *«abbiamo uno strumento che funziona, perché usarne uno di terze parti».*

E lo strumento c'è davvero, quasi tutto:

- **il manifest e le icone** esistono da `GH-88`: l'app si aggiunge alla schermata Home col marchio del salone, che è gran parte di ciò che fa sentire una tessera una tessera;
- **il QR di ogni cane** esiste: 351 token permanenti, già generati;
- **il livello e l'avanzamento** sono l'oggetto di questo brief.

Messi insieme sono **una tessera che il salone controlla**, dentro l'app, a costo zero.

**Cosa si perde**, e va detto: la comparsa automatica sulla schermata di blocco vicino all'ora dell'appuntamento. È l'unica cosa che il wallet fa e un'app no — e per quella la strada sono le notifiche, che servono comunque anche al salone.

**Il wallet resta una porta aperta** per dopo il lancio, e partirà da quello che esce da qui.

## Cosa c'è oggi

Nella Home del proprietario, la fedeltà è **un numero e basta**:

> **Punti**
> **0 punti**
> *Si accumulano con le visite e con gli…*

Nient'altro. Non si dice a cosa servono, né quanti ne servono, né che esistono dei livelli.

**Sul cartoncino pubblico del QR i livelli si vedono già** — Bronzo, Argento, Oro, con la scala — ed è materiale di `GH-73` e `GH-75`. **Quella resa non si rifà**: è il riferimento da cui partire, non da sostituire.

## Cosa c'è sotto, e non va costruito

`getFidelityTierSnapshot` calcola **già tutto**. Per ogni cane restituisce:

- il **livello attuale** e il **livello successivo**;
- **quante visite** ha nella finestra di quel livello, e **quante ne mancano**;
- **quanti punti** ha e quanti ne mancano;
- quale delle due strade lo sta portando avanti — visite o punti;
- e il **livello assegnato a mano** da Davide, che ha la precedenza se è più alto di quello calcolato.

Le soglie vivono nelle impostazioni del salone e **si cambiano senza toccare il codice**: oggi Bronzo 6 visite in 12 mesi oppure 100 punti; Argento 12 in 24 mesi oppure 250; Oro 36 in 36 mesi oppure 500. **I due modi sono alternativi**: basta uno dei due.

**Non c'è niente da inventare sui dati.** Il problema è di composizione.

## I numeri veri, misurati il 24 settembre

Sono la parte più importante di questo brief, perché **rendono facile disegnare la cosa sbagliata.**

| | |
|---|---:|
| movimenti di punti **in tutto il database** | **3**, su un solo cane |
| cani con almeno un punto | **1** su 374 |
| cani con 6+ visite negli ultimi 12 mesi | **4** su 374 |
| media visite per cane negli ultimi 12 mesi | **1,8** |

Sembra che le soglie siano irraggiungibili. **Non lo sono: è lo storico a essere bucato.** In dodici mesi risultano **110 giorni** con lavorazioni registrate, su circa trecento realmente lavorati. Da settembre il salone ne registra **otto o nove al giorno** — e a quel ritmo un anno fa circa **2.400 lavorazioni su 374 cani, cioè 6,4 a testa.**

> **La soglia del Bronzo è quasi esattamente il cliente medio.** Le soglie sono giuste; è il passato a non essere stato scritto.

**La conseguenza per il disegno, e va presa sul serio:** per i prossimi mesi **la maggior parte dei cani mostrerà una o due visite su sei** — non perché i loro padroni siano clienti saltuari, ma perché il salone ha cominciato a registrare a settembre.

**E i punti sono praticamente inesistenti**: tre movimenti in tutto. Un indicatore costruito sui punti mostrerebbe zero a tutti, per mesi. **La strada visibile è quella delle visite**; i punti restano una porta laterale che Davide può usare quando vorrà.

## Gli altri due pezzi della tessera

Oltre all'avanzamento, la tessera ne porta altri due — **entrambi esistono già, nessuno dei due va inventato.**

**Il ritratto e il nome.** La foto è quella che **il proprietario** ha caricato, `owner_photo_url`, ritagliata tonda. **Mai quella del salone**: `photo_url` è la foto di riconoscimento, serve a Roby per riconoscere il cane da un particolare e **non esce dal gestionale**. È l'invariante di `GH-77` e `GH-79`, e non si discute. Se manca il ritratto c'è l'iniziale, come già fa `PetAvatar`.

**Il QR.** Ogni cane ha un token permanente. Letto dal salone apre la sua scheda: è il gesto che il gadget fisico farà, e che qui sta nel telefono del proprietario.

> **Attenzione a una cosa, e va decisa disegnando**: il QR si mostra al banco, in piedi, magari con il cane al guinzaglio. **Deve essere leggibile da uno schermo tenuto a mezz'aria, in un negozio illuminato**, senza dover alzare la luminosità a mano. Quanto grande e quanto in evidenza è una scelta di composizione, e cambia tutto il resto della tessera.

## Dove sta, e come ci si arriva

**È una pagina sua**, decisione di Luigi del 24/9 — non la testa della scheda del pet, che è già piena di note, preferenze e album.

Ma una pagina in più è un posto in più da cercare, e **una tessera che non si trova non è una tessera**. Quindi il vero lavoro qui è il secondo: **come ci si arriva, e come la si riconosce.**

Oggi la barra del proprietario ha **tre voci**: Home (zampa), Promozioni (scintilla), Profilo. **Una quarta voce non si aggiunge senza ripensare la barra** — è un componente condiviso, e a 375px quattro bersagli da 44px cambiano il ritmo di tutto.

**Le strade sono almeno tre, e la scelta è tua:**

- **una quarta voce nella barra**, con la sua icona. Diretta, ma ridisegna la barra;
- **un accesso in evidenza dalla Home**, che non tocca la navigazione ma si vede meno;
- **una propria icona sulla schermata del telefono.** Aggiungendo alla Home la pagina della tessera invece della radice dell'app, il telefono crea **un'icona separata** che apre direttamente lì. È la cosa più vicina a una tessera nel wallet che si possa avere senza wallet — e **non costa niente**, perché il manifest e le icone esistono da `GH-88`.

**La terza va verificata tecnicamente prima di prometterla**, e la verifica la fa Cowork, non tu. Ma se è quella che regge meglio il disegno, **dillo**: cambia cosa chiediamo di fare al proprietario la prima volta che apre l'app.

**Quale che sia la strada, serve un'icona.** Deve stare accanto a zampa e scintilla senza stonare, e dire «tessera» a chi non ha ancora letto la parola.

## La domanda da sciogliere

**Come si mostra un avanzamento a qualcuno che è quasi all'inizio, senza che sembri un giudizio su di lui?**

È il nodo. Una barra vuota al 17% accanto al nome del proprio cane dice *«sei un cliente marginale»* — e lo dice a qualcuno che magari viene da otto anni, ma di cui abbiamo scritto solo le ultime tre volte.

Tre tensioni da sciogliere, non da nascondere:

**Incoraggiare senza mentire.** Non si può gonfiare il numero, e non si può nemmeno tacere quanto manca: sarebbe inutile. Ma *«ti mancano 5 visite»* e *«sei alla prima delle sei»* sono la stessa informazione con due effetti opposti.

**Lo storico incompleto.** Vale la pena dirlo al proprietario? *«Contiamo da settembre»* è onesto e toglie l'amaro, ma ammette in faccia al cliente che prima non segnavamo. **Decidilo tu e dichiara perché** — e se la risposta è «non si dice», allora la composizione deve reggere lo stesso.

**Chi è già arrivato.** Quattro cani hanno il Bronzo, due ce l'hanno **perché Davide gliel'ha dato a mano** — sono clienti storici, ed è una scelta discrezionale che deve restare invisibile: nessuno deve poter capire che il suo livello è un regalo.

## Vincoli

**La voce è quella di `GH-83`**: nell'app del proprietario **è il salone che parla a una persona**. Non «utente», non «cliente», non linguaggio da programma fedeltà di catena.

**Il livello assegnato a mano non si contraddice mai.** È l'errore che è costato `GH-75`: la scala diceva *«3 visite al Bronzo»* sotto un'intestazione che diceva *«Livello Bronzo»*. **Se il livello c'è, quanto manca riguarda quello dopo.**

**Nessun colore nuovo.** La tavolozza dei livelli esiste — Bronzo `#cd7f32`, Argento `#94a3b8`, Oro `#d4a017`, con i rispettivi fondi chiari — ed è quella del cartoncino pubblico. **Un livello non raggiunto è neutro**, non spento e non grigio-triste.

**Restano gli invarianti da `GH-54` in poi**: il peso visivo segue l'agibilità e non la categoria; l'arretramento appartiene al contenitore, non alle lettere; i campi affiancati si allineano sulla riga del campo. E il caso normale è **il telefono a 375px**, con i bersagli non sotto i 44px.

**Niente che prometta qualcosa che non c'è.** Oggi non esiste nessun premio dichiarato: raggiungere il Bronzo non dà, ad oggi, nulla di scritto. **Non inventare il premio** — se la composizione ne ha bisogno per avere senso, **fermati e dillo**: è una decisione di Davide, non di chi disegna.

## Cosa consegnare

La composizione, con le sue ragioni, negli stati che contano — **e gli stati li scegli tu**, ma almeno questi devono esserci:

- **cane all'inizio**: una visita su sei. È il caso della maggioranza;
- **cane a metà strada**;
- **cane che ha appena raggiunto un livello**;
- **cane che ha il livello assegnato a mano** e sta andando verso quello dopo;
- **cane all'ultimo livello**, dove non c'è più un «dopo».

Più la **variante a 375px** di ciascuno, che è la sola che il proprietario vedrà davvero.

E due stati che riguardano la tessera nel suo insieme:

- **cane senza ritratto**, che oggi è il caso della quasi totalità;
- **la tessera mostrata al banco**: come si presenta quando serve a farsi leggere il QR, che è l'unico momento in cui il proprietario la tira fuori davanti a qualcun altro.

**Se durante il lavoro ti accorgi che qualcosa non torna** — nei dati, nelle soglie, nella premessa stessa di questo brief — **dichiaralo a parte**, come hai fatto in `CD-06`. Una proposta che contraddice il brief con una ragione vale più di una che lo esegue.

## Cosa non è in questo brief

**La tessera per il wallet del telefono.** Scartata il 24/9, per le ragioni in cima a questo brief. Se un giorno si farà, sarà dopo il lancio e **partirà da quello che esce da qui.**

**Le notifiche.** La tessera non avvisa nessuno di niente: né il proprietario del suo appuntamento, né il salone di una richiesta a gestionale chiuso. Sono un giro a sé, e servono a entrambi i lati.

**Il gadget fisico con il QR.** 351 medagliette, già generate, in attesa del dominio e dei nomi da recuperare.

**Fanno lo stesso gesto e non devono somigliarsi** — decisione di Luigi del 24/9. Sono due oggetti diversi: uno sta al collare di un cane e lo legge un operatore, l'altro sta nel telefono di una persona e lo guarda lei. **Non cercare continuità grafica fra i due**, e non lasciarti condizionare dal ritaglio quadrato in bianco e nero della medaglietta.

**Il ripensamento delle soglie.** I numeri dicono che sono giuste; è lo storico a essere incompleto. Si rivedranno fra sei mesi, quando ci saranno sei mesi di registrazioni piene.

**Il premio.** Cosa dà un livello è ancora una domanda aperta al salone, da prima dell'estate.
