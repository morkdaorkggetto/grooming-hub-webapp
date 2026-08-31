# Incarico GH-49 — Le promozioni si possono scrivere, e la foto di riconoscimento si difende

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 30 agosto 2026
**La seconda parte va chiusa prima del primo invito a un cliente reale.**

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy.

---

## 1 · Il salone non può scrivere una promozione

**Misurato il 30/8.** La tabella `promotions` esiste dai tempi di G6 ed è **completa**: titolo, testo, immagine, validità dal/al, etichetta e indirizzo per un pulsante, ordine di visualizzazione, attiva sì/no. L'app clienti ha già la pagina `/u/promotions` che la legge.

Ma **nel gestionale non esiste nessuna schermata per crearne una**: cercata in tutto `apps/staff`, l'unica occorrenza della parola è un'etichetta nei motivi dei punti premio. Risultato: **zero promozioni in produzione**, e una delle quattro sezioni dell'area cliente è vuota per costruzione.

**Non è un difetto della sezione: è un gesto che manca.**

### Invarianti

- **Lo staff può creare, modificare, disattivare e riordinare le promozioni** del proprio salone, senza passare da SQL.
- **Il perimetro è il tenant.** Uno staff non vede né tocca le promozioni di un altro salone — vale a livello di database, non di interfaccia.
- **Una promozione non attiva, o fuori dalla finestra di validità, non compare ai clienti.** È la ragione per cui quei campi esistono: va provato, non dedotto.
- **Nessun campo nuovo.** La tabella basta. Se ti sembra che manchi qualcosa, **fermati e dichiaralo** invece di aggiungere colonne.
- **Il promemoria sta dove sta chi può agire**: una riga nella Dashboard del gestionale quando non c'è nessuna promozione attiva. Non un allarme — una constatazione con il collegamento al gesto.

> **Perché il promemoria non va nell'app clienti.** Una sezione vuota là dentro non stimola nessuno: **Davide non la vede mai**, perché è l'app dei suoi clienti, e anche vedendola non avrebbe un pulsante. Un promemoria funziona solo se sta accanto alla mano che può agire.

- **L'immagine è facoltativa.** Se la si carica, vale la regola del secchio `pet-avatars`: percorsi verificati, niente scritture fuori dal proprio salone. Se questo complica il giro, **componi la promozione senza immagine e dichiaralo**: il testo da solo è già più di quello che c'è oggi.

---

## 2 · La foto di riconoscimento non deve poterla cambiare il proprietario

**Il fatto, dal salone.** La fotografia che Davide e Roby fanno al cane **non è un ritratto: è un segno di riconoscimento.** Serve a distinguere *questo* barboncino nero dagli altri, e per questo inquadra il dettaglio particolare invece della posa migliore.

Il proprietario, appena avrà accesso, vorrà mettere **il suo cane come lo vede lui** — ed è giusto, ed è anche la ragione per cui riaprirebbe l'app. Ma con una colonna sola, **il ritratto cancella il riferimento alla foto di riconoscimento**, e il salone perde la capacità di riconoscere l'animale.

**Il problema è già attivo**: `photo_url` è uno dei **tre** campi che la whitelist consente al cliente di modificare — insieme a `owner_notes` e `coat_preferences`. Dal primo invito in poi, il primo proprietario che carica una foto fa sparire quella del salone.

### Invarianti

- **Il cliente non può più modificare `photo_url`.** La whitelist scende da tre campi a due: restano `owner_notes` e `coat_preferences`. **Nient'altro cambia** in quel meccanismo.
- **Nessuna foto esistente viene toccata.** Le 42 attuali restano dove sono e continuano a vedersi ovunque si vedano oggi, card pubblica compresa.
- **Lo staff continua a caricare e sostituire come adesso**, senza passaggi in più.
- Se l'interfaccia clienti offre oggi un gesto per cambiare la foto, **va tolto**, non lasciato a fallire: un pulsante che dà errore è peggio di un pulsante assente.

> **È una difesa temporanea, ed è giusto che il registro lo dica.** L'interazione che il proprietario vorrebbe gli verrà restituita quando esisterà una colonna sua — e a quel punto sarà migliore, perché il suo ritratto non cancellerà niente.

---

## Cosa questo mandato NON fa

**Non costruisce il modello a tre fotografie.** Sono emerse tre fotografie con tre scopi distinti, e vanno decise insieme, non una alla volta:

| | chi la mette | a cosa serve | dove si vede |
|---|---|---|---|
| **riconoscimento** | salone | distinguere questo cane dagli altri | gestionale |
| **ritratto** | proprietario | il suo cane come lo vede lui | app clienti, card pubblica |
| **album** | salone, una per visita | il cane dopo il bagno | app clienti, scheda del cane |

Costruire le prime due senza sapere della terza produrrebbe uno schema da rifare. Sarà un giro suo, con una composizione di Claude Design che decida **quale si vede dove**.

**Non tocca il secchio legacy** né sposta file: quel lavoro è già chiuso con `GH-45` e la sua coda è annotata.

## Controprove

Dichiara nel registro, misurate sul demo con fixture usa-e-getta:

**Promozioni**

- creazione, modifica, disattivazione e riordino dal gestionale, provati dal gesto;
- una promozione **non attiva** e una **fuori finestra** non compaiono nell'app clienti; una attiva e in finestra compare;
- uno staff di un altro tenant **non vede né modifica** le promozioni del primo — provato con una sessione reale, non ragionando sulle policy;
- la riga di promemoria compare in Dashboard **solo** quando non ci sono promozioni attive, e sparisce quando ne esiste una.

**Foto**

- una **sessione cliente reale** non riesce più a modificare `photo_url`, né dall'app né chiamando direttamente;
- lo stesso cliente **riesce ancora** su `owner_notes` e `coat_preferences`;
- lo staff carica e sostituisce una foto come prima;
- le **42 foto esistenti** sono ancora tutte visibili: contate prima e dopo;
- nessun gesto lato cliente rimane a fallire in silenzio.

Build verde; suite RLS estesa con i casi nuovi. Ogni fixture rimossa nella stessa sessione, zero residui.

## Passo finale — lo guarda Luigi (regola 5)

Nel registro: **scrivere una promozione vera dal gestionale e aprirla dall'app clienti**, per vedere le stesse parole nei due posti. È la prima volta che una cosa nasce nel gestionale e arriva al cliente senza passare da WhatsApp.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
