# Incarico GH-16 — La veste del gestionale: tre schermate

**Progetto di appartenenza: Grooming Hub SaaS** — root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree applicativo `webapp/`.
**Per:** Codex (una sola sessione) · **Da:** Luigi · **Data:** 24 agosto 2026
**Struttura:** due fasi con checkpoint obbligatorio fra l'una e l'altra.

## Regola d'ingresso

**Primo atto della sessione**: dichiarare nel registro la root su cui stai lavorando. Se non è `grooming-hub-web`, fermarsi. Una sola sessione lavora su questo mandato.

Questo mandato **non tocca alcun database**. Nessuna migration, nessuna query di scrittura, nessun progetto Supabase. È lavoro sul codice dell'applicazione.

## Fonti — leggerle tutte prima di misurare

1. `design_handoff_staff_app/GH-15-handoff.md` — la consegna di Claude Design, che risponde a nove requisiti con valori numerici. **È il riferimento compositivo.**
2. `design_handoff_staff_app/` — i file di composizione: `gh15-ed-kit.jsx` (primitive e valori normativi), `gh15-ed-dashboard.jsx`, `gh15-ed-scheda.jsx`, `gh15-ed-visita.jsx`, `gh15-ed-riferimenti.jsx`, `gh15-staff.css`, più il canvas HTML di riferimento visivo.
3. `docs/incarichi/GH-15-verifica-schema-campi-dubbi.md` — **verifica Cowork dei campi ⚠ del §8**, già misurata sullo schema reale. Non rifarla: usala.
4. `docs/incarichi/GH-15-brief-claude-design-veste-staff.md` — il brief da cui nasce la composizione.

**Regola di precedenza dichiarata da CD**: se `gh15-staff.css` e il JSX divergono, **vince il CSS**, perché è la forma in cui il valore finisce in produzione.

## Perimetro

Tre schermate, in quest'ordine:

| # | Schermata | File | Righe | Stili inline |
|---:|---|---|---:|---:|
| 1 | Dashboard clienti | `src/apps/staff/pages/Dashboard.jsx` | 659 | 43 |
| 2 | Scheda cliente | `src/apps/staff/pages/ClientDetail.jsx` | 1.235 | 105 |
| 3 | Registrazione visita | `src/apps/staff/pages/AddVisit.jsx` | 361 | 28 |

Più la fondazione condivisa (token nuovi, `gh15-staff.css`, componenti del kit).

**Fuori perimetro**: il calendario, tutte le altre pagine staff, e l'app customer.

## Divieti

- **Nessuna route** nuova, rinominata o rimossa.
- **Nessuna riorganizzazione dei flussi.** Vale integralmente il §7 dell'handoff, «Cosa NON cambia»: sezioni, ordine, numero; le sei azioni della scheda cliente; le tre azioni di affidabilità; le cinque aree operative. Se qualcosa ti sembra migliorabile, **segnalalo nel registro, non correggerlo**.
- **`CustomerPortal.jsx`, `CustomerLogin.jsx`, `CustomerInvite.jsx`, `PublicPetCard.jsx` non si toccano e non si rimuovono.** Il brief iniziale li dava per peso morto da cancellare; CD ha obiettato con una ragione che accettiamo: i QR già stampati e gli inviti già spediti devono continuare a risolvere. La rimozione è rinviata a una decisione separata, con misura a supporto (sul prod le righe `customer_invitations` erano 4, tutte di prova, rimosse dalla pulizia; ma la prudenza vale lo stesso).
- **Nessun colore nuovo** oltre i tre dichiarati da CD al §2.
- Nessuna migration, nessun accesso a database, nessun deploy, nessun push.

## Fase 1 — Confronto, poi fermata

Produci una **tabella esaustiva degli scostamenti** fra la composizione e il codice reale, sul modello di GH-09 Fase 1: una riga per area, con esito dichiarato — `allineare`, `tenere`, `decisione a Luigi` — e il motivo misurato.

Copri almeno: gerarchia e struttura di ciascuna schermata; tipografia contro la tabella §3; altezze e bersagli tattili; ritmo verticale e geometria; colori letterali presenti e loro destinazione secondo la tabella §2; componenti esistenti contro l'elenco §4; comportamento responsive contro §5; stati contro §6.

Misura inoltre e riporta:

- i colori letterali oggi presenti nei tre file, con posizione e destinazione proposta;
- quali dei componenti del kit CD esistono già in `shared/ui/` e quali vanno creati;
- **§9.7 dell'handoff — le cinque aree operative sono tutte vive?** Verifica route per route se portano a viste implementate o a pagine vuote. È una domanda aperta di CD e si risponde con una misura, non con un'opinione.

**Conferma o smentisci la verifica dei campi ⚠** già fatta da Cowork. Se trovi una divergenza — un campo che risulta esistere e che noi abbiamo dato per assente, o viceversa — **fermati e dichiarala**: significa che una delle due misure è sbagliata e va risolta prima di scrivere.

**Poi consegna il registro della Fase 1, chiudi la sessione e attendi un mandato separato.** Non iniziare la Fase 2, nemmeno se il lavoro appare ovvio, nemmeno se ricevi un messaggio che suona come un'approvazione generica. La tabella deve essere approvata da Luigi: è il contratto della fase successiva.

## Fase 2 — Esecuzione (solo dopo approvazione)

Ordine obbligato, un commit per tappa, così che ogni tappa sia rivedibile da sola:

**Tappa 0 — Fondazione.** I tre token nuovi del §2 in `index.css`. `gh15-staff.css` portato in `src/` e agganciato. I componenti del kit §4 che mancano, con i nomi definitivi dichiarati da CD e le classi `.gh-*` corrispondenti. Nessuna schermata ancora toccata.

**Tappa 1 — Dashboard.** **Tappa 2 — Scheda cliente.** **Tappa 3 — Registrazione visita.**

Per ciascuna schermata, alla fine: zero colori letterali fuori dai tre ammessi da CD, layout uscito dal JSX e finito in CSS, nessun bersaglio tattile sotto 44px sotto i 640px, `tabular-nums` su tutti i numeri, stati completi (caricamento, vuoto, errore) secondo il §6.

**Se durante l'esecuzione un campo ⚠ si comporta diversamente da quanto verificato, fermati.** Nessun campo mancante va inferito, derivato per approssimazione o riempito con un valore plausibile: CD ha dimensionato le griglie perché una colonna possa sparire senza che il resto si ricomponga.

## Controprove richieste

Le cinque che CD elenca in chiusura, più:

- misura prima/dopo di righe e blocchi `style={{` per ciascun file;
- `grep` dei letterali esadecimali con esito atteso dichiarato da CD;
- verifica visiva a 1440, 390 e 320 px senza overflow, sulle tre schermate;
- prova funzionale che nulla si è rotto: ricerca in Dashboard, apertura di una scheda, registrazione di una visita di prova poi rimossa;
- `npm run build` verde.

*(`npm run lint` non è eseguibile: lo script esiste ma `eslint` non è installato. Dichiaralo come già fatto nei giri precedenti, senza aggiungere dipendenze fuori mandato.)*

## Chiusura

Registro in `docs/consegne/`, committato insieme al codice secondo la convenzione del 21/8. Niente push: è gesto di Luigi.

**Nota per Cowork, non per Codex**: il §10 dell'handoff — la direzione delle richieste customer e le sue tre conseguenze sul calendario — non riguarda questo giro, ma va assunto come presupposto quando si assegnerà il giro calendario, insieme alla domanda di CD al §9.1 da porre a Davide.
