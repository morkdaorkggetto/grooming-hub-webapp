# Incarico GH-18 — Regressione app customer e ciclo visita reale

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 25 agosto 2026
**Chiude** i due punti rimasti aperti da `GH-17`. Entrambi richiedono il demo: per questo stanno in un mandato solo.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi.

**Database ammesso: solo il demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`).** Produzione e progetto temporaneo `grooming-prova-generale` sono vietati — nessuna lettura, nessuna scrittura. Nessuna migration. Nessun deploy, nessun push.

*(Questo mandato corregge esplicitamente il difetto di GH-17, che chiedeva una controprova sul database e nello stesso testo vietava ogni uso del database. La contraddizione era mia; Codex ha fatto bene a dichiararla invece di obbedire a metà.)*

## Perché esiste questo giro

GH-17 ha modificato sette componenti condivisi — `Button`, `Card`, `Icon`, `Skeleton`, `Eyebrow`, `StatusBadge`, `WarmNotice` — dichiarandone le estensioni retrocompatibili. Misura Cowork: **sette pagine dell'app customer li importano**. Le controprove di GH-17 hanno coperto le sole tre superfici staff.

La build è verde, ma la build intercetta errori di importazione, non regressioni visive. L'app customer è finita, verificata e prossima al rilascio: le sue fondamenta sono state toccate senza riguardarla. Questo giro la riguarda.

## Parte 1 — Regressione visiva dell'app customer

Aprire e verificare, con sessione customer sul demo, tutte e sette le pagine che importano i componenti modificati:

`/u/home` · `/u/login` · `/u/promotions` · `/u/pet/:id` · `/u/book` · `/u/redeem/:token` · `/u/forgot`

Per ciascuna, a **1440, 390 e 320 px**: nessun overflow orizzontale, nessuna sovrapposizione, nessun bersaglio interattivo sotto 44px sotto i 640px, zero errori in console.

Verificare inoltre, perché sono i punti dove un'estensione retrocompatibile può rompere in silenzio:

- che le **card** dell'app customer conservino raggi e ombre precedenti (il customer usa 24-28, lo staff 20: la differenza è deliberata e non deve essersi propagata);
- che gli **eyebrow** customer non abbiano ereditato la variante staff da 9.5px;
- che gli **skeleton** di caricamento mantengano la geometria delle rispettive pagine;
- che i **badge di stato** nel customer non abbiano cambiato semantica o colore;
- che `WarmNotice` nel wizard di prenotazione si comporti come prima;
- che nessun colore dell'app customer sia cambiato.

**Confronto, non impressione**: dove possibile misurare il valore reso (dimensione, raggio, colore calcolato) e confrontarlo con il contratto del bundle customer, non giudicare a occhio.

Se emerge una regressione: **correggerla nel componente condiviso** in modo che entrambe le app siano servite, non introducendo una copia per lo staff. Se non fosse possibile senza duplicare, fermarsi e dichiararlo: è una decisione di Luigi.

## Parte 2 — Ciclo reale di registrazione visita

La controprova che GH-17 non ha potuto eseguire.

Sul demo, su un pet esistente: registrare una visita marcata **`[DEMO][GH-18]`** nel campo trattamenti, con data, costo e problemi valorizzati. Verificare che compaia nello storico della scheda cliente. Poi ripetere l'apertura **dalla rotta diretta** `/client/:id/add-visit`, per provare che il form condiviso regge entrambe le superfici e salva allo stesso modo.

**Rimuovere la visita di prova nella stessa sessione**, con controprova di zero residui: nessuna riga marcata `[DEMO][GH-18]`, e cardinalità delle visite del pet identica a prima. Riportare a registro il conteggio prima e dopo.

Nessun account nuovo, nessuna sonda che sopravviva alla sessione.

## Controprove richieste

- tabella delle sette pagine customer × tre larghezze, con esito misurato;
- elenco puntuale delle proprietà confrontate col bundle customer e degli scostamenti trovati, anche se zero;
- conteggio visite del pet prima, dopo l'inserimento e dopo la rimozione;
- prova che entrambe le superfici della visita salvano allo stesso modo;
- `npm run build` verde.

## Chiusura

Registro in `docs/consegne/`, committato con il codice se ci sono correzioni, altrimenti come commit documentale. Niente push.

Se la Parte 1 non trova nulla, **è comunque una consegna piena**: la sua funzione è togliere un dubbio prima della produzione, non trovare per forza un difetto.
