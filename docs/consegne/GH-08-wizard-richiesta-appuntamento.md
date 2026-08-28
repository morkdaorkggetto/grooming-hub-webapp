# Consegna GH-08 - Wizard richiesta appuntamento `/u/book`

**Stato:** completato e verificato - **Data:** 21 agosto 2026

**Base dichiarata:** `f5cd321dc2e1cacbafd0192fd04609003ccfe2d2` - branch `feat/customer-app`

**Commit implementazione:** `0834c8c882608e972ddaa541431246ed555e3f39` (`feat: add customer appointment request wizard`)

**Ambiente dati:** solo Supabase demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`), tenant `8ad7489b-15f9-44f5-8d50-cc89506c3ac9`
**Produzione:** non consultata e non modificata - **Push:** non eseguito

## Risultato

Il customer puo' partire dalla scheda del pet, aprire `/u/book?petId=...`, compilare la richiesta single-page e inviarla sempre come `pending`, senza generare uno slot fittizio nel calendario. La richiesta e' salvata in `appointment_requests` con campi strutturati. Lo staff la legge senza parsing, puo' rifiutarla o convertirla atomicamente in un appuntamento dopo aver scelto giorno e ora precisi. Le richieste legacy in `appointments` restano leggibili come fallback.

La migration autorizzata e' presente come `20260821090000_gh08_appointment_requests.sql`; sul demo risulta una sola voce di history, versione `20260821070549`, nome `gh08_appointment_requests`. La migration e' stata rieseguita senza errori per provarne l'idempotenza. La differenza tra timestamp locale e timestamp assegnato dal connettore demo e' dichiarata: una futura applicazione sul demo rieseguira' DDL idempotente, mentre sugli altri ambienti la migration locale si applichera' una sola volta.

## File esaustivi

| File | Modifica GH-08 | Commit |
|---|---|---|
| `scripts/rls-tests/run.mjs` | Suite estesa con submit Mario, lettura staff, isolamento Luca, divieto UPDATE customer, tentativo cross-customer, conversione atomica e pulizia | `0834c8c` |
| `src/apps/customer/lib/booking.js` | Query servizi attivi e chiamata RPC customer | `0834c8c` |
| `src/apps/customer/lib/bookingDates.js` | Regola pura periodi pieni Capodanno/Ferragosto/Natale | `0834c8c` |
| `src/apps/customer/pages/Book.css` | Layout wizard, riepilogo sticky e CTA mobile | `0834c8c` |
| `src/apps/customer/pages/Book.jsx` | Wizard a quattro sezioni, preselezione, eta' condizionale, avvisi, guard, esito pending e WhatsApp | `0834c8c` |
| `src/apps/customer/pages/Pet.jsx` | CTA dalla scheda pet a `/u/book?petId=...` | `0834c8c` |
| `src/apps/staff/lib/database.js` | Lettura strutturata + fallback legacy e RPC di risoluzione | `0834c8c` |
| `src/apps/staff/lib/whatsapp.js` | Messaggio customer con data desiderata e preferenza oraria | `0834c8c` |
| `src/apps/staff/pages/CustomerRequests.jsx` | Campi strutturati, rifiuto e dialog di approvazione con giorno/ora | `0834c8c` |
| `src/apps/staff/pages/Dashboard.jsx` | Data desiderata corretta per le nuove richieste, senza epoch fittizio | `0834c8c` |
| `src/index.css` | Alias `--color-whatsapp` | `0834c8c` |
| `src/shared/ui/DesiredDateStrip.css` | 12 date desktop e 6 mobile | `0834c8c` |
| `src/shared/ui/DesiredDateStrip.jsx` | Selettore semantico di data desiderata | `0834c8c` |
| `src/shared/ui/Icon.jsx` | Icone necessarie a servizi e avvisi | `0834c8c` |
| `src/shared/ui/WarmNotice.jsx` | Avviso caldo non bloccante condiviso | `0834c8c` |
| `supabase/migrations/20260821090000_gh08_appointment_requests.sql` | Tabella, constraint, indici, RLS, RPC invoker e grant | `0834c8c` |
| `docs/consegne/GH-08-fase0-atterraggio-db.md` | Checkpoint e decisione dati precedente all'implementazione | commit documentale successivo |
| `docs/consegne/GH-08-wizard-richiesta-appuntamento.md` | Questo registro finale | commit documentale successivo |

## Controprove

| # | Verifica | Esito misurato |
|---|---|---|
| 1 | Mario: scheda Luna -> CTA -> `?petId` -> Bagno -> data +3 giorni -> Mattina -> Qualche nodo -> invio | PASS. Luna preselezionata; `WarmNotice` visibile; CTA attiva; esito `In attesa di conferma` / `Ci pensiamo noi da qui.` |
| 2 | Lettura e azioni staff | PASS. Browser sonda: Luna, 24/08/2026, Bagno, Mattina, Qualche nodo ed eta' anagrafica leggibili senza parsing. Rifiuto UI riuscito; approvazione e creazione appointment provate dalla suite atomica. Dashboard corretta da `01/01, 01:00` a `24/08 - data desiderata`. |
| 3 | RLS estesa, ciclo sonda | PASS: `26 PASS, 0 FAIL, 1 SKIP`. Luca vede 0 richieste Mario; Mario aggiorna 0 righe; Luca riceve `42501` tentando il pet Mario. Lo skip e' la controprova staff cross-tenant, non costruibile nel demo a tenant unico. |
| 4 | Periodi pieni | PASS: helper `4/4` su Capodanno, Ferragosto, Natale e giorno ordinario; il secondo `WarmNotice` e' collegato al risultato e non partecipa a `canSubmit`. |
| 5 | Eta' mancante/presente | PASS. Pepe con `birth_date` temporaneamente `NULL` mostra `Quanti anni ha Pepe?`; ripristinato a `2021-03-15`, il campo torna assente. |
| 6 | Zero prezzi e zero promessa disponibilita' | PASS. DOM: `€=0`, `prezz=0`, `slot=0`, `disponibilit=0`; grep sorgenti senza corrispondenze. |
| 7 | Guard e responsive | PASS. Refresh a form compilato non ha perso lo stato; il dialog nativo non e' esposto dal driver. A 390 px e 320 px: `scrollWidth = clientWidth`, nessun overflow e 6 date visibili. |
| 8 | Build e warning | PASS. `npm run build` verde, 138 moduli. Restano solo i due warning preesistenti: `caniuse-lite` datato e chunk principale oltre 500 kB. Nessun warning nuovo GH-08. |

## Verifiche DB e sicurezza

- `appointment_requests`: RLS attiva, 3 policy vive (`customer_insert`, `customer_select`, `staff_all`), 0 righe finali.
- `submit_appointment_request` e `resolve_appointment_request`: `SECURITY INVOKER`, `search_path=''`, esecuzione `anon=false`, `authenticated=true`.
- Submit customer valida membership, pet proprio, servizio attivo, data futura, manto ed eta' dichiarata solo se necessaria. Non verifica disponibilita' e crea sempre `pending`.
- Conversione staff serializzata con `FOR UPDATE`; l'appuntamento nasce solo dopo un `scheduled_at` futuro preciso. Eliminare in seguito l'appuntamento conserva la richiesta approvata con link nullo.
- Indice FK `service_id` aggiunto dopo Advisor. Restano due warning performance attesi per policy permissive separate staff/customer su SELECT e INSERT; mantenerle separate rende espliciti i due modelli di accesso. L'indice nuovo risulta `unused` solo perche' la tabella finale e' vuota.
- Advisor security: nessun rilievo riferito alle due nuove RPC o alla nuova tabella. I rilievi generali preesistenti del progetto restano fuori GH-08.

## Pulizia demo

La sonda `staff.sonda@test.example` e' stata ricreata soltanto nei cicli autorizzati e smontata dopo ogni prova. Stato finale misurato: `0` auth user, `0` profili, `0` membership, `0` richieste browser, `0` marker suite. La data di nascita di Pepe e' nuovamente `2021-03-15`. Nessun messaggio WhatsApp e' stato inviato.

## Eccezioni e fuori istruzione

- `npm run lint` non e' eseguibile: lo script esiste, ma `eslint` non e' installato nelle dipendenze del workspace (`sh: eslint: command not found`). Non sono state aggiunte dipendenze fuori mandato.
- `CODEX_HANDOFF.md` non era presente nel workspace all'avvio di GH-08; Luigi ha autorizzato esplicitamente la prosecuzione sul mandato specifico.
- Le modifiche parallele preesistenti di Cowork in `docs/diario-progetto.md`, `docs/environment-map.md`, `docs/incarichi/GH-03-brief-claude-design.md`, `docs/incarichi/GH-05-bis-staff-refactor.md`, `docs/workflows/flussi-operativi-salone.md`, negli incarichi/consegne GH-05/06/07/09/10/11 e in `design_handoff_customer_app/00-ERRATA.md` non sono state toccate, messe in stage o incluse nel commit.
- Nessun secret e' stato scritto o committato. Nessun accesso, deploy, modifica o verifica su produzione. Nessun push.

## Suggerimenti per Cowork

1. Prima di promuovere la migration su un altro ambiente, controllare l'assenza di una voce GH-08 equivalente e applicare il file locale una sola volta; sul demo il timestamp history differisce ma il DDL e' idempotente.
2. In un mandato performance separato si possono fondere le policy SELECT/INSERT staff e customer per eliminare i due warning `multiple_permissive_policies`; non e' necessario per correttezza o isolamento.
3. La prova staff cross-tenant richiede un secondo tenant reale/fixture autorizzato; non va simulata alterando il tenant demo corrente.
