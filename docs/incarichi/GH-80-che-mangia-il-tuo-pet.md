# ⛔ Incarico GH-80 — Che mangia il tuo pet

> **⛔ NON ESEGUIBILE SU ORDINE GENERICO.**
> **Mandato depositato.** Va eseguito **dopo il lancio degli inviti**, e richiede un'istruzione esplicita e nominativa di Luigi. Raggiunto per scorrimento numerico, **fermarsi e dichiararlo**.
> **Cancello aperto**: la lista dei mangimi deve essere confermata da Davide (§1).

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex · **Da:** Luigi · **Data di deposito:** 12 settembre 2026
**Porta una migrazione.** Una sola. **Non la applichi tu.**
**Superficie:** scheda del pet lato cliente e lato salone. **Nessuna rotta nuova.**

## Da dove nasce

Il salone di toelettatura è **una delle linee di ZavaRoby Pet Station**, che è anche un negozio di mangimi. **Davide vuole razionalizzare il magazzino** tenendo quello che i suoi clienti usano davvero, e per saperlo serve chiederlo.

**Idea di Davide, forma decisa con Luigi il 12 settembre.**

### Perché sta dopo il lancio, e non dentro

**Non va messo nel percorso di iscrizione.** Parole di Luigi:

> *«I padroni potrebbero prenderla come una trappola, e invece l'app resta un servizio e un'interfaccia con il salone.»*

Chiedere un dato commerciale sulla porta trasforma un servizio in un imbuto. **La domanda vive nella scheda del cane, accanto alle preferenze di toelettatura**, dove è una cosa che si dice del proprio animale.

E sta **dopo** il lancio per una ragione misurata: al deposito di questo mandato gli account clienti sono **due su 322**. Prima degli inviti, la raccolta non misurerebbe niente.

## 1 — La lista, e il cancello

**La lista dei mangimi vive nel database**, nelle impostazioni del tenant, accanto alle altre sette cose che ci abitano. **Nessun nome scritto nel codice** — è la regola che vale da `GH-54`, e qui pesa doppio: **è l'elenco che cambierà più spesso.**

> **⛔ Cancello: i nomi li conferma Davide prima di eseguire.**
> Se nella lista finiscono marche che **non tiene in negozio**, i clienti sceglieranno quelle e il dato non servirà a decidere il magazzino — che era lo scopo. **Una lista sbagliata è peggio di nessuna lista.**

**Lista di partenza, da correggere con Davide** — serve solo perché abbia qualcosa su cui dire «questa sì, questa no» invece di un foglio bianco:

`Royal Canin` · `Monge` · `Almo Nature` · `Hill's` · `Purina Pro Plan` · `Farmina N&D` · `Acana` · `Trainer` · `Schesir` · `Forza10`

**Il formato** — secco, umido, taglia del sacco — **lo decide Davide con la stessa lista**: può essere una voce sola (`Monge — secco 12 kg`) o due campi separati. **Chiediglielo, non deciderlo qui**: dipende da come ragiona il suo magazzino, non da come è comodo il modulo.

## 2 — Il dato

**Due colonne su `pets`**, perché il mangime è del cane e un padrone con tre cani può comprarne tre diversi:

- **la scelta dalla lista**, annullabile;
- **il testo libero di «altro»**, annullabile.

**Due e non una**, perché serve **misurare quanto spesso la lista non basta**: è il numero che dice a Davide quali voci aggiungere.

> **«Altro» non deve essere un binario morto.** Il campo razza libero ha prodotto **sei grafie per due servizi** e **dodici cani chiamati «barboncino»**; le lavorazioni libere hanno prodotto `bagnetto`, `Bagnetto`, `bagno`, `Bagno`. Se «altro» resta libero e nessuno lo guarda, fra sei mesi ci saranno `royal canin`, `Royal Canin`, `royalcanin` e `quello verde`.
>
> **La difesa è che il salone veda cosa ci finisce dentro**, e possa promuovere le voci ricorrenti nella lista. **Come mostrarglielo lo decidi tu**, purché non richieda di aprire 322 schede una per una.

**La scelta entra fra i campi scrivibili dal cliente.** Oggi sono **tre** — `owner_notes`, `coat_preferences`, `owner_photo_url` — imposti dal database. **Diventano cinque.** È una guardia difesa in tre mandati diversi: **aprirla è giusto qui, ma va fatto sapendo che la si tocca.**

## 3 — Dove si compila

**Nella scheda del pet lato cliente**, accanto alle preferenze di toelettatura, con la stessa grammatica.

**E nella scheda lato salone**, perché al banco Davide e Roby già sanno cosa comprano molti clienti. **Con due account su 322, senza questa metà non si raccoglie niente.**

**È facoltativo, e si vede che lo è.** Nessun asterisco, nessun avviso, nessun invito a completare su chi non l'ha detto.

**E si dice perché lo chiediamo**, con una frase sola. Al deposito la proposta è:

> **«Ce lo dici così lo teniamo in negozio.»**

**Nessuna promessa di avvisi automatici**: non esistono. Se poi il dato arriverà, il promemoria del sacco che sta finendo sarà un giro suo, costruito su qualcosa che c'è.

## Invarianti

**La migrazione non la applichi.**

**Nessun nome di marca, formato o prodotto scritto nel codice.**

**Nessuna raccolta dentro il percorso di iscrizione o di riscatto.** È la decisione di Luigi che dà forma a tutto il mandato.

**Il dato è del pet, non del cliente.**

**Il campo non diventa mai obbligatorio**, né lato cliente né lato salone. *Un campo obbligatorio che non si può soddisfare onestamente produce dati falsi* — 31 agosto.

**Restano gli invarianti di `GH-54` in avanti.**

## Controprove

Dichiara nel registro. **Numeri, non aggettivi.**

- **la lista arriva dalle impostazioni**: cambiandola, il modulo cambia **senza ricostruire l'app**;
- **nessun nome di marca nel codice**: ricerca esaustiva, comando riportato;
- **scelta dalla lista**, **«altro» con testo**, **nessuna delle due**: tre casi, tre esiti;
- **pet con tre cani**: tre mangimi diversi, indipendenti;
- **il cliente può scrivere le due colonne nuove e nient'altro**: la lista dei campi scrivibili è **cinque**, e le altre tabelle restano chiuse. Impronta della funzione prima e dopo;
- **il salone compila la stessa cosa** dal suo lato, e i due lati leggono lo stesso valore;
- **nessun invito a completare** su chi non ha risposto: verificato su un pet vuoto;
- **il salone vede cosa è stato scritto in «altro»** senza aprire le schede una per una;
- **suite RLS rieseguita**: il giro tocca colonne e whitelist;
- build verde.

## Passo finale — lo guarda Luigi (regola 5)

1. **compila come cliente, dal telefono**: sembra una domanda o un modulo?
2. **guarda la stessa scheda dal salone**: si legge la stessa cosa?
3. **e la domanda vera**: se fossi un cliente qualunque, la riempiresti — o ti chiederesti perché te lo stanno chiedendo?

La terza decide se questa funzione produce dati o silenzio.

## Chiusura

Registro in `docs/consegne/GH-80-che-mangia-il-tuo-pet-esito.md`, committato col codice. Niente push, niente merge, niente deploy, **e la migrazione resta non applicata.**
