# Consegna GH-22 - Orari di chiusura e durata effettiva

**Esito:** completato
**Data:** 27 agosto 2026
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web/`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`
**Branch:** `feat/customer-app`
**Base Git:** `9382817bf721fb9e61cb2eabd722dd272d56ce08`
**Commit:** presente commit; hash finale riportato nella risposta di consegna per evitare un riferimento circolare nel file committato.

## Perimetro ricevuto

Eseguito il mandato `GH-22-orari-di-chiusura.md`: una sola migration additiva sul solo progetto demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`), nessun accesso a produzione o al progetto temporaneo, nessun push, deploy o nuova route. La configurazione tenant deve rappresentare domenica chiusa e lunedi mattina chiuso; wizard e calendario devono leggerla senza orari di business codificati nella UI. La durata lato cliente deve essere una forbice, mentre lo staff deve scegliere la durata effettiva alla conferma.

## File inclusi

| File | Stato | Funzione nella consegna |
|---|---|---|
| `docs/incarichi/GH-22-orari-di-chiusura.md` | acquisito | Mandato ricevuto, non modificato da Codex. |
| `docs/consegne/GH-22-orari-di-chiusura-esito.md` | nuovo | Registro unico della consegna. |
| `supabase/migrations/20260827091536_gh22_booking_schedule_and_staff_duration.sql` | nuovo | Configurazione iniziale del tenant pilota e RPC atomica con durata scelta dallo staff. |
| `src/shared/tenant/bookingSchedule.js` | nuovo | Parser difensivo della configurazione tenant e calcolo delle chiusure complete/parziali. |
| `src/shared/ui/DesiredDateStrip.jsx` | modificato | Giorni chiusi visibili, disabilitati e descritti anche via accessibilita. |
| `src/shared/ui/DesiredDateStrip.css` | modificato | Stato visivo dei giorni non disponibili e breakpoint unico a 640 px. |
| `src/apps/customer/pages/Book.jsx` | modificato | Lettura configurazione tenant, blocco domenica/lunedi mattina e forbice 45 minuti-3 ore. |
| `src/apps/customer/pages/Book.css` | modificato | Stati indisponibili, nota durata e consolidamento al breakpoint 640 px. |
| `src/apps/staff/lib/database.js` | modificato | Conferma strutturata tramite RPC con durata effettiva obbligatoria. |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | Giorni chiusi distinti dai vuoti, senza nascondere le attivita presenti. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Configurazione tenant nel calendario e durata effettiva passata alla conferma. |
| `src/apps/staff/pages/Calendar.css` | modificato | Stati chiuso/parziale, controllo mobile e scorrimento locale dei sette giorni a 320 px. |
| `src/apps/staff/pages/CustomerRequests.jsx` | modificato | Scelta esplicita della durata nella conferma da elenco richieste. |
| `src/apps/staff/styles/gh15-staff.css` | modificato | Griglia a tre campi e riduzione a una colonna sotto 640 px. |

## Database demo

- Progetto verificato `ACTIVE_HEALTHY` prima delle operazioni.
- Applicata una sola migration, `gh22_booking_schedule_and_staff_duration`, esclusivamente a `qttpinkslhenxrsbhhhg`.
- `tenants.settings.booking_schedule` del tenant `grooming-hub` contiene `closed_weekdays = ["sunday"]` e `closed_time_preferences.monday = ["morning"]`. Nessun valore e stato scritto per altri tenant.
- La nuova `resolve_appointment_request_with_duration(uuid,text,timestamptz,integer)` e `SECURITY INVOKER`, non eseguibile da `anon` ed eseguibile da `authenticated`; la RPC precedente resta disponibile con lo stesso profilo ACL, senza overload ambiguo.
- Controprova atomica: fixture `[DEMO GH-22] duration counterproof` approvata per il 8 settembre con 120 minuti; richiesta `approved`, appuntamento `approved/customer`, durata persistita `120`.
- Cleanup nella stessa sessione: residui richiesta `0`, appuntamento `0`.
- Le richieste reali demo sono rimaste invariate: `2` pending, di cui `1` domenicale; nessun rifiuto, spostamento o cancellazione automatica.
- Advisor post-migration: nessun rilievo sulla nuova RPC. Restano warning preesistenti fuori perimetro su funzioni `SECURITY DEFINER`, protezione password compromesse e ottimizzazioni RLS.

## Controprove applicative

| Controprova | Esito misurato |
|---|---|
| Login customer | `mario.rossi@test.example` accede a `/u/book`; nessuna credenziale registrata nel repository. |
| Domenica nel wizard | 30 agosto e 6 settembre visibili come `Chiuso`, con controllo nativo disabilitato; richiesta non inviabile. |
| Lunedi parziale | 31 agosto: `Mattina` disabilitata e marcata `Non disponibile`; pomeriggio e fascia flessibile restano attivi. |
| Giorno normale | 1 settembre: mattina, pomeriggio e fascia flessibile tutti selezionabili. |
| Durata customer | Entrambe le schede servizio mostrano `Da 45 minuti a 3 ore*`; una sola nota lega il tempo a taglia, tipo e condizioni del pelo. |
| Calendario staff | Lunedi mostra `Mattina chiusa`; domenica mostra `Chiuso` e si distingue dal giorno aperto vuoto. |
| Eccezioni in giorno chiuso | La richiesta preesistente di Luna del 6 settembre resta visibile e apribile nella domenica chiusa. |
| Durata staff | Proposta iniziale `60`, modificabile a `120`; il testo WhatsApp passa coerentemente da 14:00 a 16:00 e la RPC persiste 120 minuti. |
| Conflitti | Il candidato usa `duration_minutes` scelto dallo staff; il rilevamento continua a confrontare gli intervalli effettivi degli appuntamenti. |
| 1440 px | Wizard e calendario verificati senza overflow o overlay; chiusure e richiesta domenicale leggibili. |
| 390 px | Nessun overflow; dialogo conferma a una colonna; nessun controllo visibile sotto 44 px. |
| 320 px | Nessun overflow di pagina; selettore settimanale con scorrimento interno; richiesta domenicale visibile; nessun controllo visibile sotto 44 px. |
| Logica calendario | Test deterministico: domenica chiusa, lunedi solo mattina chiusa, martedi aperto (`3/3`). |
| Build | `npm run build` verde, 144 moduli trasformati. |
| Whitespace | `git diff --check` verde. |

## Fixture e sonda

La sonda staff demo `staff.sonda@test.example` e stata usata per le sole controprove e rimossa con il teardown idempotente esistente. Controprova finale: `0` righe in `auth.users`, `auth.identities`, `profiles`, `tenant_memberships`, `customers` e `pets`; login respinto e nessuna sessione creata. Gli account customer non sono stati modificati.

## Eccezioni e fuori istruzione

- `npm run lint` non parte: `eslint: command not found`. Non sono state installate dipendenze fuori mandato; build, test mirato e verifiche browser sono verdi.
- Warning build preesistenti: database Browserslist non aggiornato e chunk principale oltre 500 kB. Nessuna modifica di bundling autorizzata.
- Modifiche parallele preesistenti attribuite a Cowork e autorizzate da Luigi: `docs/diario-progetto.md`, `scripts/salva.sh`, `docs/incarichi/GH-23-verifica-veste-staff.md`. Sono state ignorate e non incluse nello stage o nel commit GH-22.
- Nessuna attivita fuori istruzione eseguita. Nessun push, deploy o accesso a produzione/progetto temporaneo.

## Debito noto

Non esiste ancora una UI staff per modificare gli orari del tenant. La configurazione introdotta e leggibile e multi-tenant, ma finche un mandato dedicato non autorizzera l'editor gli aggiornamenti restano atti dati controllati.
