# Incarico GH-41 — «Questo cane ha già un appuntamento»

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Segue:** `GH-39`, di cui riusa le tre superfici di collocazione e con cui deve convivere senza confondersi.

> **Forma breve** (regola 4 del canone): nessuna migrazione, nessuna scrittura nuova, nessun dato in gioco. Una sola informazione, in due lingue diverse.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova.

## Il fatto dal salone

**Parole di Davide, riportate da Luigi**: capita che qualcuno chieda un appuntamento, questo venga fissato, e che la persona **se ne dimentichi e ne chieda un altro** pochi giorni dopo. Oggi succede al telefono e su WhatsApp; dal giorno degli inviti succederà dentro l'app.

**Misurato sulla produzione il 29/8**: gli account cliente sono **0**, gli appuntamenti chiesti da clienti sono **0**, i cani con due appuntamenti futuri aperti sono **0**. Il caso **non si è ancora presentato nell'app perché l'app clienti non è ancora in mano a nessuno**. Non è una ragione per rimandare: è la ragione per farlo adesso, prima che i clienti arrivino.

## Invarianti

**1 · Il controllo è per cane, non per cliente.** Chi ha due cani e ne prenota due nella stessa settimana non sta sbagliando niente. Un mandato che confondesse le due cose renderebbe l'avviso rumore da ignorare.

**2 · Conta ogni appuntamento aperto, non solo quelli della settimana.** «Aperto» significa: **futuro** e non annullato — comprese le **richieste ancora in attesa di conferma**, perché anche chi ha chiesto ieri e non ha ancora risposta non deve richiedere di nuovo. Nessuna finestra temporale: la dimenticanza non rispetta i confini della settimana, e chi ha davvero bisogno di due appuntamenti li avrà comunque perché **l'avviso non impedisce nulla**.

**3 · Non blocca mai, su nessuno dei due lati.** Mostra. Chi prenota due volte quasi sempre non ne vuole due: se ne è dimenticato. Impedire lo lascia con un appuntamento che non ricorda; mostrare glielo ricorda.

**4 · L'avviso dice quando.** Un avviso che dice «ha già un appuntamento» senza dire quale è inutile: chi legge non può decidere. Deve portare **la data e l'ora** se l'appuntamento è confermato, oppure **il giorno e la fascia richiesti** se è ancora in attesa.

**5 · Lato cliente si offre lo spostamento, non il rifiuto.** La strada naturale è cambiare quello che c'è, non aggiungerne un altro. Se lo spostamento in un gesto solo non è realizzabile con le superfici esistenti, **portalo almeno all'appuntamento esistente** e dichiara nel registro perché il gesto unico non era possibile.

**6 · Lato salone compare dove si decide**: nelle tre superfici di `GH-39` — collocazione manuale, conferma di una richiesta cliente, modifica dal dettaglio. È il punto in cui Davide può fermare il doppione con cognizione di causa, perché lui vede entrambi gli appuntamenti e il cliente no.

**7 · Tre voci, tre significati, nessuna sovrapposizione.** Sulla stessa schermata possono ora comparire:

| Voce | Cosa dice | Da |
|---|---|---|
| avviso di carico | quante lavorazioni ci sono già in quella fascia | `GH-39` |
| **avviso di doppione** | questo cane ha già un appuntamento | **questo mandato** |
| rifiuto di capienza | le postazioni sono tutte occupate | `GH-37` |

Le prime due possono convivere e **dicono cose diverse**: una parla del salone, l'altra del cane. Il rifiuto è un'altra natura e ha la precedenza visiva. Se un lettore non capisce a colpo d'occhio quale delle tre sta leggendo, l'invariante non è soddisfatta.

**8 · Il cliente vede solo il proprio cane.** Ovvio, e va provato lo stesso: l'avviso lato cliente non deve poter rivelare nulla di appuntamenti altrui, nemmeno la loro esistenza.

## Le parole

**Lato salone**, sobrio, è un promemoria fra colleghi:

> **Nina** ha già un appuntamento **giovedì 3 alle 10:00**.

Se in attesa di conferma: «ha già una richiesta per **giovedì 3, mattina**».

**Lato cliente**, la voce del salone, «noi» mai «voi»:

> Hai già un appuntamento per **Nina**: **giovedì 3 settembre alle 10:00**.
> Se non ti va bene, spostalo — così non ne restano due aperti.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

- un cane con un appuntamento futuro → avviso su **tutte e tre** le superfici staff, con data e ora giuste;
- lo stesso cane con una **richiesta in attesa** invece di un appuntamento confermato → avviso con giorno e fascia;
- un cliente con **due cani**, uno dei quali ha un appuntamento: prenotando **l'altro cane, nessun avviso** — è la prova che il controllo è per cane;
- appuntamento **annullato** o **passato** → nessun avviso;
- lato cliente: avviso mostrato, e lo spostamento raggiungibile;
- **avviso di carico e avviso di doppione insieme** sulla stessa schermata: si leggono come due informazioni distinte;
- **capienza satura**: il rifiuto ha la precedenza, e le altre voci non lo confondono;
- una sessione cliente reale **non vede nulla** di appuntamenti che non le appartengono;
- build verde; suite RLS invariata o estesa.

Ogni fixture rimossa nella stessa sessione, zero residui.

## Cosa questo mandato NON fa

**Non giudica il cliente.** Nessun punteggio automatico, nessuna marcatura di comportamento. Il meccanismo esiste già — `no_show_score` e la blacklist, con i due pulsanti nel dettaglio — ed è **manuale per una ragione misurata**: il 29/8 la produzione aveva 7 appuntamenti passati e ancora «programmati», e **tutti e sette erano la giornata di lavoro in corso**, non clienti assenti. Il database non sa distinguere «non è venuto» da «non abbiamo ancora chiuso la scheda». Chi lo sa è Davide, e la decisione resta sua.

**Non costruisce la coda delle lavorazioni non chiuse.** È un problema diverso e non è questo. Resta annotato come coda.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro, una cosa da fare con gli occhi dopo il rilascio: **fissare un appuntamento a un cane che ne ha già uno** e leggere le voci che compaiono. Se sulla stessa schermata ci sono un avviso di carico e un avviso di doppione, devono sembrare due frasi, non un paragrafo.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
