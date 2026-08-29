# Incarico GH-42 — Il calendario e le risposte che arrivano in ritardo

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 29 agosto 2026
**Origine:** rilievo di Codex nel registro `GH-41`, emerso provando altro.

> **Forma breve** (regola 4 del canone): un file solo, nessuna migrazione, nessuna scrittura, nessun dato in gioco.

**Perimetro**: root dichiarata nel registro; database ammesso **solo il demo** `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`); nessun push, merge o deploy; nessuna rotta nuova. **File in perimetro: `src/apps/staff/pages/Calendar.jsx`.** Se la correzione ne richiede altri, dichiaralo prima di toccarli.

## Il fatto

Rilevato da Codex durante le prove di `GH-41`, **preesistente e non introdotto da quel mandato**: passando alla settimana successiva prima che termini la lettura in corso, **la risposta più vecchia può arrivare dopo e sovrascrivere quella nuova**. Il titolo mostra la settimana nuova mentre le righe appartengono, per un istante, alla precedente.

**Perché conta adesso e non prima.** Il calendario è stato inutilizzato dall'11 marzo al 23 aprile e poi fermo per quattro mesi. **Il 29 agosto il salone ci ha passato la giornata di lavoro**: nove appuntamenti creati in una mattina. Cambiare settimana in fretta è esattamente il gesto di chi cerca un buco in agenda — quindi il difetto passa da teorico a quotidiano nel giro di un giorno.

**Ed è il tipo peggiore di difetto**: non rompe niente, non dà errore, non lascia traccia. Mostra dei dati **plausibili** sotto un'intestazione sbagliata. Chi guarda non ha modo di accorgersene: vede una settimana che sembra normale e non lo è.

## Invarianti

**Solo la richiesta più recente può scrivere sullo schermo.** Una risposta relativa a un intervallo che non è più quello richiesto va **scartata**, non mostrata. Vale per i dati, per l'eventuale errore e per lo stato di caricamento: se una risposta vecchia può spegnere il caricamento di una nuova, l'invariante non è soddisfatta.

**Intestazione e contenuto non divergono mai**, nemmeno per un istante. È la formulazione visibile della regola sopra ed è quella che si prova con gli occhi.

**Il metodo lo scegli tu.** Codex ha proposto nel registro di `GH-41` un contatore in `useRef` oppure una guardia `active` nell'effetto: entrambe vanno bene, e qualunque altra che garantisca l'invariante. **Non è materia di questo mandato prescrivere quale.**

**Nessun cambiamento visibile quando la rete è veloce.** Questo non è un miglioramento dell'interfaccia: è la rimozione di un caso raro e silenzioso. Se l'aspetto o il comportamento normale cambiano, hai fatto più del richiesto.

**Nessuna altra correzione in questo giro.** Se trovando questo ne vedi altri — ed è probabile, perché è un difetto di famiglia — **elencali nel registro senza toccarli**.

## Controprove

Dichiara nel registro, misurate sul demo:

- **la prova che dimostra il difetto**: ritardando artificialmente la prima lettura e cambiando settimana prima che finisca, **prima della correzione** l'intestazione e le righe divergono, **dopo** no. Senza la misura «prima», la correzione non è dimostrata: è asserita;
- il caso normale — rete veloce, nessun ritardo — resta identico a occhio;
- cambio di settimana ripetuto rapidamente più volte di seguito: l'ultima richiesta vince sempre;
- lo stato di caricamento non viene spento da una risposta scartata;
- build verde; suite RLS invariata — questo mandato non tocca il database.

## Chiusura

Registro in `docs/consegne/`, committato col codice. Niente push, niente merge, niente deploy.
