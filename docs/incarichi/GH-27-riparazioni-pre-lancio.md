# Incarico GH-27 — Riparazioni pre-lancio

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 28 agosto 2026
**Fonte:** consegna `GH-26`, più le misure manuali di Luigi del 28/8 e le decisioni di prodotto prese con Davide.

> Mandato unico e ampio. Gli input sono verificati: la ricognizione è fatta, i difetti sono misurati, le decisioni sono prese.
>
> **Dichiara le invarianti, non la procedura.** Cosa deve essere vero alla fine è scritto; il metodo lo scegli tu.

## Regola d'ingresso

**Primo atto**: dichiarare la root nel registro. Se non è `grooming-hub-web`, fermarsi. Una sola sessione. Nessun deploy, nessun push. **Migration ammesse** dove servono, idempotenti. **Database ammesso: solo il demo**; produzione e progetto temporaneo vietati.

**Nota sull'ambiente**: sull'anteprima `VITE_DEMO_MODE` è tornata a `true` e blocca le scritture del gestionale. Le tue prove girano dove scrivi già oggi; non chiedere di cambiarla.

---

## 1. La data che scivola — priorità assoluta

**Misurato a mano da Luigi**, non da automazione: nel dialogo di conferma di una richiesta, scegliendo **sabato 5** l'appuntamento è stato salvato a **domenica 6**. Nello stesso giro, il form di registrazione visita ha invece salvato **la data corretta**.

La differenza è la traccia: la visita scrive `visits.date`, una data pura. La conferma **compone data e ora in `appointments.scheduled_at`**, che è `timestamptz`. Il difetto è nella composizione, non nel trattamento delle date in generale.

*(L'osservazione di GH-26 secondo cui anche il form visita slittava era un artefatto dell'automazione: la prova manuale la smentisce.)*

**Aggravante misurata**: lo slittamento ha portato l'appuntamento **di domenica**, giorno di chiusura. Le chiusure introdotte in GH-22 valgono per il wizard cliente ma **non sono controllate nella conferma staff**.

**Invarianti**: il giorno e l'ora salvati sono **esattamente** quelli scelti, verificati rileggendo il dato dal database e non dall'interfaccia. La verifica copre più fusi e più ore del giorno, incluse quelle vicine alla mezzanotte, perché è lì che questi difetti si nascondono. E la conferma **avvisa** se il giorno scelto cade in una chiusura dichiarata — senza vietarlo, perché un'eccezione può essere voluta, ma senza lasciarla passare in silenzio.

Sul demo restano **tre appuntamenti nati dalle prove di Luigi**, con date probabilmente sbagliate: individuali e rimuovili, riportando prima e dopo.

## 2. Il QR non nasce con il pet

Il pet creato da «Nuovo cliente» non riceve un `qr_token`; il pulsante «QR Card» risponde *«QR cliente non disponibile. Applica prima la migration dedicata.»* — un messaggio che parla al programmatore, non all'operatore.

**Invarianti**: ogni pet nuovo nasce con il proprio token, generato in modo atomico e idempotente. Backfill solo dove manca; **nessun token esistente cambia**, perché le card già stampate devono continuare a risolvere. I comandi di apertura e stampa compaiono solo quando il token c'è. Nessun messaggio d'errore nomina migration o dettagli interni.

## 3. La richiesta pendente sparisce dalla vista del cliente

Dopo l'invio, tornando alla home il cliente legge «Non hai appuntamenti in programma» e trova «Prenota ora». Crede che l'invio sia fallito e **rimanda la richiesta**: doppioni al salone, e sfiducia al primo uso.

**Invarianti**: finché una richiesta è in attesa, il cliente la vede — con data desiderata, fascia, cosa ha chiesto e quando l'ha mandata. Il vuoto «nessun appuntamento» non compare quando invece qualcosa è stato inviato. Il gesto per una nuova richiesta sullo **stesso pet** non invita a duplicare. Anche l'esito negativo è visibile, con l'invito a scegliere un'altra data.

## 4. Lavorazione e appuntamento non si chiudono insieme

Registrare la visita lascia l'appuntamento `confermato`: l'operatore deve ricordarsi di aprirlo e segnarlo completato, senza che nulla glielo ricordi.

**Invariante**: quando la lavorazione nasce da un appuntamento, **un solo gesto esplicito** chiude entrambe le cose. Se la separazione tecnica va conservata, il secondo gesto è offerto lì, subito, non lasciato alla memoria. La lavorazione registrata senza appuntamento continua a funzionare come oggi.

## 5. L'invito si incolla a mano

Il link si copia; poi l'operatore cambia app, trova la conversazione e incolla. **Il rischio non è il tempo: è incollare il token della persona sbagliata**, perché i token si somigliano tutti.

**Invariante**: accanto a «Copia link» esiste l'apertura diretta di WhatsApp verso **quel** cliente, con il messaggio già composto e il destinatario mostrato prima dell'apertura. «Copia link» resta. Nessun invio massivo: non serve il primo giorno e allarga il rischio.

## 6. «WhatsApp pronto» senza che si apra nulla

L'esito dichiara che il messaggio è pronto, ma nulla si apre e il testo non è più recuperabile. L'operatore può credere di aver avvisato il cliente.

**Invariante**: dopo ogni conferma il messaggio **resta visibile e recuperabile**, con la possibilità di riaprire WhatsApp o copiarlo. Il successo del salvataggio non viene mai formulato come successo della comunicazione: sono due cose diverse e l'app ne controlla una sola.

## 7. I punti non sono leggibili dal cliente

Lo staff vede «0 punti», il cliente non vede nulla: non distingue uno zero da una funzione che non esiste.

**Invariante**: il cliente vede il proprio saldo anche quando è zero, con una frase che spiega come si accumula. **Nessun premio o soglia inventati** oltre a quelli configurati.

## 8. L'anagrafica nasce incompleta e nessuno lo dice

Dopo «Salva cliente» si torna alla dashboard; specie, nascita, sesso, microchip, peso, colore e sterilizzazione restano vuoti, e per completarli bisogna ritrovare il pet.

**Invariante**: dopo il salvataggio il gesto successivo è offerto — completare la scheda — senza rendere obbligatorio nulla nel primo modulo. Chi ha fretta prosegue, chi ha tempo completa.

## 9. Allineamento della card richiesta

Nella card della richiesta la seconda riga (Manto, Età dichiarata) non si allinea alle tre colonne superiori. Stessa griglia su entrambe le righe, alle tre larghezze.

---

## 10. La controproposta — funzione nuova

**Decisione di Davide, riferita da Luigi**: rispondendo a una richiesta il salone deve poter **proporre date e fasce alternative**, invece del solo sì o no.

**Come cambia il flusso.** Tre azioni su una richiesta:

- **Conferma** — giorno, ora e durata: nasce l'appuntamento. Come oggi.
- **Proponi alternative** — due o tre date **scelte dal calendario**, che rispetta le chiusure. La richiesta **resta in attesa**, perché la conversazione è aperta: il cliente risponderà su WhatsApp e allora si conferma con il flusso normale. Viene marcata come «risposto», con quando.
- **Rifiuta** — chiude la richiesta. Serve nei casi reali nominati da Davide: cliente in blacklist, indisponibilità effettiva, chiusura occasionale.

**Invarianti**: la coda distingue a colpo d'occhio **una richiesta mai guardata da una a cui è già stato risposto**, altrimenti dopo tre giorni nessuno sa più quali sono quali. La colonna registra **che il salone ha agito**, non che il messaggio è arrivato: quello succede dentro WhatsApp e non lo sapremo mai — non dichiararlo. Le alternative non possono cadere in giorni o fasce chiuse. **La blacklist è visibile allo staff quando decide, e mai deducibile dal messaggio che il cliente riceve.**

## 11. I sette messaggi, riscritti

Oggi dicono «Buongiorno», nominano il software a ogni frase, parlano di richieste «registrate in Grooming Hub», e oscillano fra «ti contatto» e «ti chiediamo».

**Decisioni di Luigi**: tono confidenziale, **«ciao» al posto di «buongiorno»**; il nome del software **non compare** nei messaggi a chi ha già il salone in rubrica; una **voce sola** — loro sono due, quindi «noi»; e il rifiuto **offre**, non rimanda a un modulo.

Bozze approvate come punto di partenza, da rifinire con Davide:

> **Conferma** — «Ciao {nome}, per {pet} ci siamo: {quando}. A presto!»
> **Rifiuto con alternative** — «Ciao {nome}, purtroppo {quando} siamo pieni. Per {pet} avremmo {alternative} — dimmi tu e blocchiamo.»
> **Promemoria** — «Ciao {nome}, ti aspettiamo {quando} con {pet}.»
> **Contatto** — «Ciao {nome}, ti scriviamo per {pet}.»

**Invarianti**: nessun messaggio nomina tabelle, stati interni o il nome del sistema. Il messaggio dal cliente al salone perde «già registrata in Grooming Hub». **I testi restano in un punto solo**, così cambiarli resta una stringa: Davide li rivedrà.

## 12. Le parole del wizard

**«Servizio» diventa il vocabolario dell'indicazione.** Il cliente non ordina da un listino: segnala un bisogno, e sarà il salone a decidere le lavorazioni guardando il cane. Una parola sola, coerente in wizard, coda e calendario.

**La durata sparisce dai pulsanti.** Al posto di «circa 1 ora» — che è la metà della media reale dichiarata da Davide — **una riga sola, nella voce del salone**:

> «Il cane resta con noi qualche ora. Ti scriviamo appena è pronto.»

Risponde alla domanda vera, che è *se aspettare o tornare*, e non promette un tempo che nessuno può stimare prima di vedere il pelo. **La durata resta nel database**: serve alla conferma e ai conflitti, sparisce dalla vista del cliente. Come il prezzo.

**«Cute sensibile» diventa «Lo porto regolarmente».** Cambia il dato, non la parola: la regolarità predice il lavoro, la sensibilità della pelle no — ed è la distinzione che Davide usa parlando dei tempi, «quando sta bene» contro «quando sta rovinato». Chi ha un cane con la pelle delicata lo scrive nel campo libero, che resta.

Richiede una migration sul vincolo dei cinque codici. **Verificare a 320 px che l'etichetta non vada a capo**; se andasse, il ripiego è «Lo porto spesso», che dice lo stesso ed è più corta di un'etichetta già in uso.

---

## Controprove

Dichiara nel registro, misurate: per ogni punto da 1 a 12, che il difetto non si riproduce, **provato dal gesto reale**; per la data, la rilettura dal database con più orari; le tre larghezze sulle superfici toccate; il giro completo richiesta → controproposta → conferma con pulizia; i tre appuntamenti delle prove di Luigi rimossi con conteggi prima e dopo; suite RLS; build verde.

Ogni fixture rimossa nella stessa sessione, zero residui, nessun account reale toccato.

## Se è troppo

Il perimetro è ampio. **Se una parte non entra, consegna quelle chiuse e dichiara le altre**: cinque punti finiti e verificati valgono più di dodici abbozzati. L'ordine da rispettare è quello del documento — la data che scivola è la sola che, se resta, rende inutilizzabile la funzione centrale del prodotto.

## Chiusura

Registro in `docs/consegne/`, committato col codice, un commit per gruppo coerente. Niente push.
