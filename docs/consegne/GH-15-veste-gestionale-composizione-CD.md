# GH-15 — Consegna: la veste del gestionale (composizione Claude Design)

**Stato:** completato · **Data:** 24 agosto 2026
**Esecutore:** Claude Design (non Codex) · **Verifica:** Cowork
**Mandato:** `docs/incarichi/GH-15-brief-claude-design-veste-staff.md`

> Registro di un incarico eseguito da Claude Design. Serve a chiudere la numerazione: senza, GH-15 risulterebbe aperto e la convenzione «ultimo elaborato» lo tratterebbe come lavoro pendente.

## Cosa è stato chiesto

Comporre la veste di tre schermate del gestionale, ereditando il vocabolario visivo dell'app customer in un registro più denso, senza riorganizzare i flussi. Nove requisiti espliciti, dal file di composizione misurabile alla marcatura dei campi che potrebbero non esistere.

Il calendario è stato escluso dal giro dopo una misura sul prod: 17 appuntamenti in tutto, tutti fra l'11 marzo e il 23 aprile, zero da maggio, contro 464 visite registrate. Al suo posto è entrata la registrazione visita.

## Cosa è stato consegnato

Bundle in `design_handoff_staff_app/`: handoff che risponde ai nove requisiti punto per punto; `gh15-ed-kit.jsx` con i valori normativi; un file di composizione per ciascuna delle tre schermate; `gh15-ed-riferimenti.jsx`; `gh15-staff.css` con le stesse regole già in forma CSS; canvas HTML di riferimento visivo.

Precedenza dichiarata da CD: se CSS e JSX divergono, vince il CSS.

## Verifica Cowork

**Requisiti coperti**: tutti e nove, con valori numerici e non aggettivi — altezze, ritmo verticale, geometria, scala tipografica, punto di rottura unico a 640px, stati completi.

**Colori**: nessuno inventato. Tre nuovi dichiarati per nome e valore (`--gh-bridge`, e due opacità nominate di un token esistente). Tabella dei letterali attuali con la destinazione di ciascuno, incluso il `#7c2d12` della Dashboard che Cowork aveva misurato il 21/8.

**Campi ⚠**: dodici campi marcati come possibilmente inesistenti invece che dati per scontati. Verificati da Cowork sullo schema reale in `docs/incarichi/GH-15-verifica-schema-campi-dubbi.md` — quattro cadono (operatore, durata, foto visita, prezzo sul chip servizio), l'importo regge ed è il campo meglio alimentato dello storico, due si rivelano doppi (`treatments`/`issues`, `status`/`approval_status`). **Questa è la voce che rende la consegna solida**: è lo stesso tipo di campo che in GH-09 era arrivato fino all'implementazione prima di essere fermato.

**Fuori richiesta, di valore**: il §10 sulla direzione delle richieste customer, con tre conseguenze di progetto sul calendario — fatti e desiderata non possono avere lo stesso trattamento visivo; «in attesa» diventa lo stato cardine; la conferma esce dall'applicazione, quindi «Conferma» dovrebbe includere l'invio del messaggio invece di essere due gesti separati. Non era mandato di CD e lo dichiara: serve a non consolidare come definitiva una vista calendario che dovrà reggere un carico diverso.

**Correzione accettata al brief**: il brief dava `CustomerPortal.jsx`, `CustomerLogin.jsx` e `CustomerInvite.jsx` per peso morto da rimuovere. CD ha obiettato che i QR già stampati e gli inviti già spediti devono continuare a risolvere. Obiezione accolta: la rimozione esce da questo giro e diventa una decisione separata. Divieto recepito nel mandato GH-16.

## Domande aperte lasciate a Luigi

Risposte da Cowork con misura: lo score di affidabilità **non** è funzione morta (11 clienti su 296 con score diverso da zero, 1 in blacklist); `reward_points` esiste ma conta 6 righe in tutto.

Restano per Davide, non rispondibili dai dati: se guardi «ultima visita»; se «Salva e nuova» serve, cioè se si registra a fine giornata in blocco; se il calendario popolato a ritroso verrebbe guardato; se in salone esiste un tablet.

Aggiunta di Cowork, non nella lista di CD: `visits.discount_percent` è valorizzata in **0 visite su 464**. Lo sconto è nello schema e non è mai stato usato. Da decidere se togliere prima di vestirlo.

## Seguito

Mandato `GH-16` a Codex: Fase 1 di confronto con checkpoint, poi esecuzione a tappe. Il bundle di CD è il riferimento compositivo; eventuali superamenti futuri andranno annotati in un ERRATA accanto al bundle, con la stessa regola dell'app customer — le righe si aggiungono, non si cancellano.
