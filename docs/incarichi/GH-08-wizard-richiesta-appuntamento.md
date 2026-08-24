# Incarico GH-08 — Wizard richiesta appuntamento `/u/book` (G4)

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 21 agosto 2026
**Base:** HEAD post GH-07-bis (`f5cd321`) — dichiarare l'effettiva. Branch `feat/customer-app`, DB demo. Prod intoccabile. Niente push.

## Fonti vincolanti (leggerle tutte prima di iniziare)

1. `docs/incarichi/GH-03-R1-handoff.md` — la composizione di CD: impianto single-page a 4 sezioni, `DesiredDateStrip`, `WarmNotice`, riepilogo con CTA, pagina esito, stati, micro-copy. **È il disegno visivo: si implementa, non si reinterpreta.**
2. `docs/incarichi/GH-03-brief-claude-design.md` — aggiornamenti 18-21/8: campi Davide (condizioni manto auto-dichiarate, età solo se mancante), **tre chip orarie facoltative** Mattina (9–13) / Pomeriggio (13–19) / «Per me è uguale», niente prezzi, niente slot.
3. `docs/workflows/flussi-operativi-salone.md` §11 — la fonte congelata: mai bloccare, pending-only, risposta su WhatsApp.
4. Decisioni collaterali già prese: token `--color-whatsapp` come alias di `--color-success-text`; `.ics` solo post-conferma (non alla richiesta); avviso periodo di piena con lista costante nel codice (Capodanno, Ferragosto, Natale — fonte §11) in attesa di `tenants.settings`.

## Fase 0 — Atterraggio DB (checkpoint, consegna intermedia)

Misura lo stato reale: le richieste oggi sono `appointments` pending con servizio/fascia dentro `notes` (parsing in `CustomerRequests.jsx`). Il wizard porta campi nuovi: `desired_date`, preferenza oraria (3 valori), condizioni manto (chips multi + testo libero), età dichiarata se mancante. Proponi l'atterraggio in **mezza pagina**: colonne nuove su `appointments` vs tabella `appointment_requests` dedicata vs notes strutturate — con regole RLS, impatto sulla pagina staff esistente e sorte delle richieste legacy eventualmente presenti sul demo. Raccomandata + compromessi delle alternative, poi **fermati**: l'ok di Luigi (via Cowork) sblocca le fasi successive. Autorizzata fin d'ora **al più una migration additiva** nella forma che la proposta approvata definirà.

## Fase 1 — Dati (dopo l'ok)

Migration eventuale + RPC `submit_appointment_request` (SECURITY INVOKER, invocabile dal customer autenticato sul proprio tenant/pet — guard esplicita; validazioni: pet del customer, servizio esistente, data futura; **nessun controllo di disponibilità**: la richiesta nasce `pending` sempre). Se l'età dichiarata arriva per pet senza `birth_date`, salvarla in forma dichiarata (proposta in Fase 0), senza sovrascrivere anagrafica staff.

## Fase 2 — Wizard UI

Implementazione fedele dell'handoff CD: 4 sezioni numerate serif, card pet con `?petId=` preselezione e blocco età condizionale, card servizio senza prezzi (lista placeholder dichiarata dell'handoff finché il salone non fornisce la reale), `DesiredDateStrip` (12 desktop / 6 mobile, nessuna semantica libero/occupato), chip orarie facoltative, chips manto + testo libero, `WarmNotice` per preavviso <7gg e periodo di piena (mai bloccanti), riepilogo sticky desktop / CTA flottante mobile, CTA «Invia la richiesta», pagina esito «Ci pensiamo noi da qui.» con StatusBadge pending, CTA WhatsApp verde (token alias) e nota .ics post-conferma. Componenti nuovi in `shared/ui`: `WarmNotice`, `DesiredDateStrip` (non chiamarlo DatePicker). Guard modifiche non salvate integrata con `UnsavedChangesProvider` esistente.

## Fase 3 — Lato staff

`CustomerRequests.jsx` deve mostrare le richieste nuove con i campi propri (servizio, data desiderata, fascia, manto) senza parsing di testo; le azioni approva/rifiuta esistenti restano funzionanti. Adeguamento minimo, nessun redesign.

## Cosa NON fare

Niente slot/disponibilità/calendario orario; niente prezzi; niente notifiche push; niente auto-conferma; niente `.ics` alla richiesta; niente boutique/fedeltà; nessuna esposizione della regola interna "ultima lavorazione ore 18".

## Controprove di consegna

1. Flusso completo Mario: da scheda Luna → `?petId` preselezionato → servizio → data a 3 giorni → `WarmNotice` preavviso visibile e CTA attiva → chips → invio → esito pending.
2. La richiesta compare a staff in `CustomerRequests` con tutti i campi leggibili senza parsing; approva/rifiuta funzionano.
3. RLS: Luca non vede le richieste di Mario; Mario non aggiorna lo stato della propria richiesta; suite GH-06 riestesa e verde (ciclo sonda completo).
4. Data in periodo di piena → secondo `WarmNotice`, invio consentito.
5. Pet senza `birth_date` → blocco età appare; con `birth_date` → mai.
6. Zero prezzi nel DOM del wizard (grep). Zero riferimenti a disponibilità/slot nel copy.
7. F5 a metà compilazione → guard modifiche non salvate. Responsive 390/320 senza overflow.
8. Build verde, zero warning nuovi.

Registro in `docs/consegne/` (Fase 0 e consegna finale, anche separati): base, tabella esaustiva, hash, esiti misurati, eccezioni, fuori-istruzione. Interruzione motivata sempre valida.
