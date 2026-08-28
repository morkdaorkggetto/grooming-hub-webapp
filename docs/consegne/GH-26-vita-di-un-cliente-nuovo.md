# Consegna GH-26 - La vita di un cliente nuovo, da capo

**Root dichiarata come primo atto:** `/Users/luigimaisto/Desktop/grooming-hub-web/`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`
**Esito:** ricognizione completata, nessuna riparazione applicata
**Data:** 28 agosto 2026
**Branch:** `feat/customer-app`
**Base Git:** `9c27d76c5753b8badde1a0cc89109da101c4b265`
**Commit:** presente commit; hash finale riportato nella risposta di consegna per
evitare un riferimento circolare nel file committato.
**Database usato:** solo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`,
`ACTIVE_HEALTHY`, PostgreSQL `17.6.1.084`).

Produzione e progetto temporaneo non sono stati consultati. Nessuna migration,
nessun deploy e nessun push.

## Perimetro ricevuto

Il mandato era una ricognizione di una sola storia reale, dalla creazione di un
cliente da parte dello staff fino alla comparsa della prima lavorazione nello
storico customer e nel calendario staff. Ogni passaggio di prodotto e stato
eseguito con gesti dell'interfaccia; le query sono state usate soltanto per la
fotografia iniziale, la verifica dei dati scritti e il teardown finale.

Non era autorizzata alcuna riparazione. Quando un passaggio non ha funzionato,
il comportamento e stato registrato e il giro e proseguito solo dove possibile.

## File della consegna

| File | Stato | Funzione |
|---|---|---|
| `docs/incarichi/GH-26-vita-di-un-cliente-nuovo.md` | nuovo, acquisito | Mandato ricevuto da Cowork e autorizzato da Luigi; non modificato da Codex. |
| `docs/consegne/GH-26-vita-di-un-cliente-nuovo.md` | nuovo | Registro del giro, difetti, proposte e cleanup. |

Il diff applicativo finale rispetto alla base e zero. `scripts/salva.sh` era una
modifica parallela preesistente di Cowork, gia esclusa da Luigi: non e stata
messa in stage ne inclusa nel commit GH-26.

## Fotografia iniziale

| Oggetto demo | Prima del giro |
|---|---:|
| Customer | 7 |
| Pet | 7 |
| Inviti | 0 |
| Richieste appuntamento | 3 |
| Appuntamenti | 8 |
| Visite | 89 |
| Account/identita GH-26 o sonda staff | 0 |

Fixture del giro:

- staff usa-e-getta `staff.sonda@test.example`, creato con il seed GH-04;
- customer `[DEMO GH-26] Ada Nuova`, telefono `+393260000026`;
- pet `[DEMO GH-26] Primo`, razza `Barboncino`;
- account usa-e-getta `gh26.customer@test.example`;
- un invito, una richiesta, un appuntamento e una visita, tutti legati al pet.

Nessuna password e stata stampata o scritta in file.

## Storia percorsa

| # | Passaggio | Comportamento misurato |
|---:|---|---|
| 1 | Nasce il cliente | Da `Nuovo Cliente` lo staff puo inserire proprietario, telefono, nome pet, razza, note e una foto facoltativa. `Salva Cliente` riesce, porta alla dashboard e il contatore passa da 7 a 8. Per completare la scheda bisogna ritrovare e riaprire il pet dall'archivio. |
| 2 | La scheda esiste | La scheda staff mostra nome, razza, proprietario, telefono, note, fidelity a 0 e storico vuoto. Il nuovo pet non ha foto. Lato customer appare `Nessuna foto per [DEMO GH-26] Primo` con il comando per cambiarla. Specie, data di nascita, sesso, microchip, peso, colore e sterilizzazione risultano `Non indicato`; preferenze e note del proprietario sono vuote. La nota inserita dallo staff resta correttamente solo operatore. |
| 3 | QR | Il pet nasce senza `qr_token`. Premendo `QR Card` lo staff legge `Operazione non completata` e `QR cliente non disponibile. Applica prima la migration dedicata.. La scheda e i dati gia inseriti restano visibili.` La doppia punteggiatura e testuale. Non esiste quindi una card da aprire o inquadrare per questo nuovo pet. Nessuna sostituzione con un pet storico e stata usata, perche avrebbe falsato la storia richiesta. |
| 4 | Invito | `Genera invito` crea un URL `/u/redeem/ghi_*` e mostra `Link copiato negli appunti. Scade tra 30 giorni.` Non esiste un invio: l'operatore deve aprire WhatsApp/email fuori dal gestionale e incollare il link, una persona alla volta. |
| 5 | Primo accesso | Il cliente apre il link, sceglie `Crea account`, inserisce email e password, preme `Crea e collega` e atterra direttamente su `/u/home`. Il pet e gia collegato e visibile senza reload manuale. |
| 6 | Cliente senza storico | La home dice `Non hai appuntamenti in programma`; la scheda pet dice `Nessuna visita registrata`; le promozioni dicono `Nessuna promozione attiva al momento. Torna a trovarci.` Questi tre vuoti sono comprensibili. I punti non compaiono affatto lato customer, mentre lo staff vede `Punti premio 0`: il cliente non puo distinguere uno zero da una funzione assente. |
| 7 | Prima richiesta | Il wizard richiede pet, servizio, data, eventuale fascia, condizioni del manto e, per il pet senza anagrafica, anche l'eta dichiarata. Dopo l'invio mostra `In attesa di conferma`, `Ci pensiamo noi da qui.` e il riepilogo corretto. Offre anche `Scrivici su WhatsApp`. Tornando alla home, pero, il cliente legge ancora `Non hai appuntamenti in programma` e vede di nuovo `Prenota ora`: la richiesta pendente non compare in nessun punto persistente. |
| 8 | Il salone la riceve | Al login staff il riquadro in cima alla dashboard passa da `3 richieste cliente da confermare` a `4 richieste cliente da confermare` e mette `[DEMO GH-26] Primo` come prima riga. `Gestisci richieste` apre la card completa con proprietario, telefono, data, servizio, fascia, manto, eta e note. La richiesta e molto evidente a chi apre la dashboard. |
| 9 | Conferma | `Approva e WhatsApp` apre il dialogo `Scegli giorno e ora precisi`, precompilato con il giorno desiderato, `09:00` per la mattina e 90 minuti dal servizio. Sono stati digitati `10:00` e `75`; la durata salvata e 75, ma l'ora salvata e rimasta 09:00. L'esito visibile e `Richiesta approvata. WhatsApp di conferma pronto.` Nell'IAB non si e aperta alcuna scheda WhatsApp e il testo non resta consultabile nel gestionale. Dal template e dal dato effettivamente salvato, il messaggio preparato e `Buongiorno [DEMO GH-26] Ada Nuova, la richiesta registrata in Grooming Hub per [DEMO GH-26] Primo e confermata nella fascia sabato 29 agosto 2026 alle ore 09:00-10:15.` |
| 10 | Il cliente lo scopre | Al nuovo login la home customer mostra subito il badge `Confermato`, `sabato 29 agosto`, `Ore 09:00 - Toelettatura Completa` e il testo `La giornata di [DEMO GH-26] Primo inizia domani.` La conferma e quindi ritrovabile nell'app finche e il prossimo appuntamento. Non esiste una sezione richieste/prenotazioni che conservi pendenti, rifiutate, confermate passate o uno storico degli appuntamenti. |
| 11 | Lavorazione | Dalla scheda pet lo staff preme `Registra la prima visita`, compila trattamenti, problematiche e costo e salva. La visita viene creata e la scheda passa a `1 registrate - 45,00 EUR nel periodo`. Anche qui la data digitata `29/08` non e stata recepita dal controllo IAB: e rimasto il default `28/08`. La registrazione della visita non chiude automaticamente l'appuntamento, che nel calendario resta `Appuntamento confermato`; completamento appuntamento e lavorazione sono due gesti separati senza richiamo reciproco. |
| 12 | Il cerchio si chiude | Lato customer la scheda mostra `1 visita`, data `28 ago 26`, trattamenti e problematiche. Lato staff il calendario mostra il 28 agosto una lavorazione `Senza orario` e il 29 agosto l'appuntamento delle 09:00 ancora confermato. I dati compaiono su entrambi i lati, ma il ciclo operativo non risulta chiuso in un solo gesto. |

## Difetti ordinati per danno al 1 settembre

### 1. Rotto - il QR non nasce con il pet

**Danno:** l'operatore non puo stampare o consegnare la card al primo cliente
nuovo. La UI propone comunque `QR Card`, `Apri area operatore` e `Stampa card`,
ma non esiste alcun codice.

**Riparazione minima consigliata a Cowork:** un mandato dati separato che
generi `pets.qr_token` in modo atomico e idempotente alla creazione del pet,
con backfill soltanto dove nullo e vincolo di unicita gia esistente. La UI deve
mostrare i comandi di apertura/stampa solo dopo aver ricevuto il token, con una
spiegazione operativa neutra in caso di errore, non un invito ad applicare una
migration.

**Controprove:** pet nuovo da `Nuovo Cliente`, pet aggiunto a customer
esistente, collisione token, card anonima, stampa, zero variazioni sui token
esistenti.

### 2. Rotto osservato - giorno e ora digitati non vengono persistiti

Nel dialogo di conferma e stato digitato `10:00`, ma UI customer, calendario e
database hanno conservato `09:00`; la durata digitata nello stesso dialogo e
stata invece salvata correttamente. Nel form visita e stata digitata la data
29 agosto, ma UI e database hanno conservato 28 agosto.

Il comportamento e stato osservato con gesti Playwright nell'IAB. Prima di
attribuirne la causa al prodotto va riprodotto manualmente una volta in Safari
o Chrome: i due casi coinvolgono entrambi controlli nativi `date/time`, mentre
testo e numeri nello stesso giro hanno recepito correttamente i valori.

**Riparazione minima consigliata a Cowork:** primo checkpoint umano sui due
controlli; se confermato, correggere il binding del componente `Field` o dei due
form senza cambiare il contratto database. Aggiungere una prova browser che
scelga un valore diverso dal default e confronti campo visibile, payload e dato
riletto. Non iniziare con una modifica database: la durata dimostra che RPC e
persistenza accettano valori modificati.

### 3. Rotto - una richiesta pendente scompare dalla home customer

Dopo l'invio il solo riepilogo vive nella schermata finale del wizard. Tornando
alla home si legge `Non hai appuntamenti in programma` e si offre `Prenota ora`.
Il cliente puo quindi credere che l'invio sia fallito e creare duplicati.

**Riparazione minima consigliata a Cowork:** leggere l'ultima
`appointment_requests` pendente del customer e sostituire il vuoto con una card
`Richiesta in attesa`, riepilogo data/fascia/servizio e data d'invio. Il CTA
nuova richiesta va disambiguato o disabilitato per lo stesso pet finche la
richiesta e pendente. Includere anche lo stato rifiutato con invito a scegliere
un'altra fascia.

**Controprove:** invio, reload, logout/login, secondo tentativo sullo stesso pet,
approvazione, rifiuto e customer multi-pet.

### 4. Mancante - lavorazione e appuntamento non si chiudono insieme

Registrare la visita aggiorna storico e calendario, ma lascia l'appuntamento
`scheduled/approved`. L'operatore deve aprire separatamente l'appuntamento e
premere `Completato`; la UI di registrazione non lo ricorda e non propone il
collegamento.

**Riparazione minima consigliata a Cowork:** quando `Registra lavorazione` nasce
da un appuntamento, passare l'id dell'appuntamento al form e, nello stesso gesto
esplicito di salvataggio, registrare la visita e marcare l'appuntamento
completato. Se si vuole conservare la separazione tecnica, mostrare almeno un
secondo comando immediato `Segna anche l'appuntamento come completato`.

**Controprove:** lavoro da appuntamento, lavoro libero senza appuntamento,
doppio click/retry, visita gia esistente e annullamento del form.

### 5. Mancante - consegna dell'invito manuale e uno-a-uno

Il link viene copiato, non inviato. Per ogni cliente l'operatore deve cambiare
app, trovare la conversazione corretta e incollare il token giusto. Gia con
5-10 attivazioni consecutive il rischio non e solo il tempo: e associare il
link alla persona sbagliata.

**Riparazione minima consigliata a Cowork:** accanto al link aggiungere `Apri
WhatsApp con invito`, usando il telefono gia presente e un messaggio standard
che contenga il token. Conservare `Copia link` come alternativa e mostrare il
destinatario prima dell'apertura. Un invio massivo non e necessario per il
primo giorno e allargherebbe inutilmente il rischio.

### 6. Grezzo - WhatsApp dichiarato pronto ma senza fallback visibile

L'esito dichiara `WhatsApp di conferma pronto`, ma nell'IAB non si e aperta una
nuova scheda e l'app non mostra ne il testo ne un comando di riprova. Il dato e
gia confermato, quindi l'operatore puo pensare che anche la comunicazione sia
partita.

**Riparazione minima consigliata a Cowork:** dopo la conferma mostrare sempre il
messaggio in un riquadro con `Apri WhatsApp` e `Copia messaggio`; il successo
database non deve essere formulato come successo del canale esterno.

### 7. Mancante - i punti non sono leggibili dal customer

Con un cliente nuovo lo staff vede 0 punti, mentre il customer non vede alcuna
sezione loyalty. Lo storico vuoto e chiaro, lo zero punti no.

**Riparazione minima consigliata a Cowork:** mostrare nella scheda o home una
card compatta `0 punti` con una frase di avvio, senza inventare premi o soglie
non configurate.

### 8. Grezzo - la prima anagrafica resta intenzionalmente incompleta

`Nuovo Cliente` raccoglie solo i dati minimi e poi torna alla dashboard. Specie,
nascita, sesso, microchip, peso, colore e sterilizzazione restano vuoti; per
completarli l'operatore deve ritrovare il pet e aprire `Modifica`, senza una
richiesta esplicita.

**Riparazione minima consigliata a Cowork:** dopo il salvataggio aprire la nuova
scheda e mostrare `Completa anagrafica` come prossimo gesto. Non serve rendere
tutti i campi obbligatori nel primo form.

## Risposte alle domande fuori schermo

- **Come arriva l'invito:** oggi non arriva da solo. L'operatore copia e incolla
  un link alla volta. Il rischio operativo diventa concreto gia in una piccola
  sessione di attivazione, perche i token sono indistinguibili a colpo d'occhio.
- **Come si ritrova la conferma:** la home mostra bene il prossimo appuntamento,
  quindi il cliente non dipende solo da WhatsApp finche quell'appuntamento e il
  prossimo. Non esiste pero un archivio di richieste e prenotazioni; pendenti,
  rifiutate e conferme passate non sono ritrovabili.
- **Gli empty state sembrano rotti:** visite, appuntamenti e promozioni sono
  spiegati e hanno CTA coerenti. Punti e richiesta pendente sono invece assenti;
  il secondo caso comunica addirittura lo stato opposto (`Non hai appuntamenti
  in programma`) e invita a ripetere il gesto.

## Eccezioni e fuori istruzione

- La sonda staff GH-04 e stata ricreata sul solo demo tramite il seed
  idempotente esistente e rimossa nella stessa sessione. Non e una modifica di
  schema o codice.
- Account, customer, pet e oggetti collegati sono nati dai gesti UI richiesti.
  Il teardown e stato eseguito con SQL protetto dopo il logout, per garantire
  zero residui senza toccare account reali.
- Il QR pubblico non e stato aperto perche il pet nuovo non aveva token. Non e
  stato assegnato un token a mano e non e stato sostituito con un pet storico.
- Nessun messaggio WhatsApp e stato inviato. Il tentativo di apertura esterna
  nell'IAB non ha prodotto una seconda scheda; il testo riportato e stato
  ricostruito dal template applicativo e dai dati effettivamente persistiti.
- L'anomalia `date/time` e dichiarata come osservata ma da riprodurre
  manualmente prima di un mandato di correzione.
- Nessuna route, file applicativo, configurazione Auth o dato reale e stato
  modificato.

## Cleanup e controprova finale

Prima del teardown erano presenti esattamente: 1 pet, 1 customer, 1 auth user,
1 identita, 1 profilo, 1 membership customer, 1 invito, 1 richiesta, 1
appuntamento e 1 visita GH-26; nessun contatto o punto premio collegato.

Il teardown ha verificato relazioni pet/customer/auth e assenza di contatti
prima di cancellare. La sonda staff e stata rimossa con guardia email/UUID.

| Oggetto demo | Dopo il giro | Confronto iniziale |
|---|---:|---:|
| Customer | 7 | identico |
| Pet | 7 | identico |
| Inviti | 0 | identico |
| Richieste appuntamento | 3 | identico |
| Appuntamenti | 8 | identico |
| Visite | 89 | identico |
| Auth user GH-26/sonda | 0 | identico |
| Identita GH-26/sonda | 0 | identico |
| Membership sonda | 0 | identico |
| Marker customer/pet GH-26 | 0 | identico |

Nessun account reale e stato modificato.

## Verifiche

- Giro browser completo staff -> customer -> staff -> customer: eseguito.
- Confronto UI/database su richiesta, appuntamento e visita: eseguito.
- Cleanup con conteggi iniziali/finali: PASS, zero residui.
- Diff applicativo finale: zero.
- `git diff --check`: PASS.
- `npm run build`: PASS, 145 moduli trasformati. Resta il warning preesistente
  sul chunk JavaScript oltre 500 kB e sul database Browserslist non aggiornato.
- Nessuna migration, deploy, push o accesso a produzione/progetto temporaneo.
