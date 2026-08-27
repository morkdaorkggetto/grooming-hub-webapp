# Incarico GH-23 — Verifica della veste staff

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 27 agosto 2026
**Chiude** le «attività aperte» dichiarate in fondo alla consegna `GH-21`.

> Mandato di sola verifica. Se non trova nulla **è comunque una consegna piena**: serve a togliere un dubbio prima della produzione, non a trovare per forza un difetto. Se invece trova, si corregge qui.
>
> Dichiara le invarianti, non la procedura: cosa deve essere vero è scritto, il metodo lo scegli tu.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessuna migration, nessun deploy, nessun push. **Database ammesso: solo il demo** `grooming-hub-demo`; produzione e progetto temporaneo vietati.

## Perché esiste

GH-21 ha riscritto **otto superfici, da 3.128 a 1.784 righe**, e ha dichiarato onestamente in chiusura che le controprove non erano state eseguite: verificate solo costruibilità e refactor, non le tre larghezze né i flussi reali.

Due rischi, entrambi già visti in questo progetto.

**Il primo è la porta.** `LoginForm` è stata riscritta. È la schermata da cui si entra: se si è rotta, non si rompe una pagina — diventa inaccessibile l'intero gestionale. Nessuno ci è entrato dopo la modifica.

**Il secondo è la fondazione condivisa, e nel frattempo è cresciuto.** `gh15-staff.css` è arrivato a **2.477 righe** ed è stato modificato in quattro giri: GH-17, GH-20, GH-21 e GH-22. Misura: **dodici superfici staff lo consumano**. Alcune sono state verificate in GH-17 o GH-20, cioè **prima** delle due modifiche successive; otto non lo sono mai state.

È esattamente la situazione di GH-18 — dove il ritocco di un componente condiviso aveva alterato in silenzio l'ombra delle card dell'app clienti, con la build verde. **La build vede gli errori di importazione, non le regressioni visive.**

*Aggiornamento del 27/8, dopo GH-22*: il mandato è stato eseguito prima di questo e ha aggiunto uno strato — ma ha anche portato con sé le proprie controprove complete, incluse le tre larghezze su wizard e calendario. Quindi **Calendario e `CustomerRequests` risultano riverificati** dopo l'ultima modifica del foglio; restano da coprire le altre dieci superfici. Verificato inoltre che `DesiredDateStrip`, toccato da GH-22, **è consumato dal solo `Book.jsx`**, già verificato in quella consegna: **l'app clienti non è esposta questa volta.**

## Invarianti — cosa deve essere vero alla fine

**Le otto superfici nuove** — `Contacts`, `AddClient`, `DailyAppointments`, `CustomerRequests`, `LoginForm`, `ClientCard` pagina e componente, `VisitCard` — sono raggiungibili, si comportano come prima e si vedono correttamente a **1440, 390 e 320 px**: nessun overflow orizzontale, nessuna sovrapposizione, nessun bersaglio interattivo sotto 44px sotto i 640px, nessun errore in console.

**Le quattro superfici già verificate** — Dashboard, scheda cliente, form visita, calendario — **non hanno subito regressioni** dopo l'estensione del foglio di stile. Il confronto è con il contratto già misurato in GH-17 e GH-20: altezze delle righe, geometrie, scala tipografica, stati. Dove possibile misurare il valore reso e confrontarlo, non giudicare a vista.

**L'accesso funziona.** Login staff reale dal gesto reale, non simulato: si entra e si arriva alla dashboard.

**La creazione cliente funziona.** `AddClient` passa dalla RPC atomica di GH-05: un cliente marcato creato dal gesto reale sul demo, verificato in elenco e in scheda, poi rimosso nella stessa sessione con controprova di zero residui. **Provare anche il fallimento**: un errore forzato non deve lasciare un customer orfano — era la garanzia costruita in GH-05 e va riconfermata dopo la riscrittura.

**La rubrica funziona.** `Contacts` è il direttorio customer dopo GH-07-bis: lead senza pet, cliente con più pet, apertura WhatsApp. Nessuna chiamata a `contacts` legacy.

**Le richieste funzionano.** `CustomerRequests` mostra le pendenti e la conferma resta operativa — non ricostruire il ciclo completo, già provato in GH-20: basta che la superficie non si sia rotta.

**Nessuna regressione funzionale**: nessuna route cambiata, nessuna query o mutazione alterata, copy semantico invariato — incluso `da gestire`, che resta tale perché non esiste un flag di non letto.

## Se trovi una regressione

Correggila nel punto giusto: se il difetto è nel foglio condiviso, si corregge lì in modo che tutte le superfici ne beneficino, **non con una eccezione locale** che rimanda il problema. Se non fosse possibile senza duplicare, fermati e dichiaralo: è una decisione di Luigi.

## Controprove

Dichiara nel registro, misurate: la matrice dodici superfici × tre larghezze con esito per cella; l'esito del login reale; il ciclo di creazione cliente con conteggio prima, dopo e dopo la rimozione, più l'esito del fallimento forzato; l'elenco puntuale delle proprietà confrontate sulle quattro superfici già verificate, **anche se gli scostamenti sono zero**; build verde.

Ogni fixture creata sul demo va rimossa nella stessa sessione, con controprova di zero residui. Nessun account reale toccato.

## Chiusura

Registro in `docs/consegne/`, committato col codice se ci sono correzioni, altrimenti come commit documentale. Niente push.
