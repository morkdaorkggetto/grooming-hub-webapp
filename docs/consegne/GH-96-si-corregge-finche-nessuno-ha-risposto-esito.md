# GH-96 - Si corregge finché nessuno ha risposto: esito

## Esito e perimetro

Mandato eseguito su `main`, base **758f127887a5a5aac36e45155767feb0467fe867**.
Commit previsto: `feat: allow customers to withdraw pending requests (GH-96)`.
Hash risolvibile con `git log -1 --format=%H -- docs/consegne/GH-96-si-corregge-finche-nessuno-ha-risposto-esito.md`.

Il cliente può ritirare una richiesta `pending` con una sola conferma e viene portato a `/u/book?petId=...`. Un appuntamento confermato resta non annullabile dall'app e offre il contatto WhatsApp. Lo staff vede per **5 giorni** i ritiri, separati dai conteggi. Produzione non letta né scritta; nessuna migrazione applicata; nessun push, merge o deploy.

## File del commit

| File | Motivo |
|---|---|
| `src/apps/customer/components/PendingRequest.jsx` | Conferma, RPC, errori gentili e ritorno alla prenotazione |
| `src/apps/customer/hooks/useAppointmentRequests.js` | Rilettura `appointment_id` e `withdrawn_at` |
| `src/apps/customer/pages/Home.jsx` | Frase post-conferma e WhatsApp del salone |
| `src/apps/staff/lib/database.js` | Lettura separata dei ritiri recenti; costante unica di 5 giorni |
| `src/apps/staff/pages/CustomerRequests.jsx` | Marca, data, sezione ritiri e conteggi aperti |
| `supabase/migrations/20260918_gh96_withdraw_pending_request.sql` | Fonte DB GH-96, già applicata da altri; inclusa immutata e non applicata da Codex |
| `supabase/migrations/20260915_gh95_strip_phone_from_customer_name.sql` | Bonifica dati GH-95 applicata in produzione il 15/9, non al demo; inclusa immutata perché `salva.sh` non pubblica `supabase/` |
| `docs/consegne/GH-96-si-corregge-finche-nessuno-ha-risposto-esito.md` | Registro |
| `docs/consegne/evidenze/GH-96/browser-check.mjs` | Banco browser riproducibile |
| `docs/consegne/evidenze/GH-96/browser.json` | Esiti browser e misure |
| `docs/consegne/evidenze/GH-96/customer-confirm-375.png` | Conferma a 375 px |
| `docs/consegne/evidenze/GH-96/customer-rebook-375.png` | Atterraggio su nuova prenotazione |
| `docs/consegne/evidenze/GH-96/customer-confirmed-375.png` | Appuntamento e WhatsApp |
| `docs/consegne/evidenze/GH-96/staff-withdrawn-375.png` | Ritiro lato staff |
| `docs/consegne/evidenze/GH-96/live-demo-check.mjs` | Prova demo con teardown |
| `docs/consegne/evidenze/GH-96/live-demo.json` | Stato, rifiuto, riprenotazione e conteggi |
| `docs/consegne/evidenze/GH-96/rls-summary.txt` | Esito suite RLS |
| `docs/consegne/evidenze/GH-96/gh90-functions.sha256` | Impronte delle due funzioni GH-90 |
| `docs/consegne/evidenze/GH-96/ui-invariants.sha256` | Impronte delle 63 superfici non coinvolte |

Fuori da modifiche, stage e commit: i mandati `GH-94` e `GH-96`, `nomi-da-recuperare/` e `qr-gadget/`, tutti attribuiti da Luigi a Luigi/Cowork.

## Testi nuovi

- `Puoi ancora correggerla: appena ti rispondiamo, l’orario è fissato.`
- `Correggi data`
- `Vuoi ritirare questa richiesta? Potrai sceglierne subito una nuova.`
- `Sì, ritirala` / `No, lasciala` / `Ritiro...`
- `Il salone ha già risposto a questa richiesta. Aggiorna la pagina per vedere cosa è cambiato.`
- `Non siamo riusciti a ritirare la richiesta. Aggiorna la pagina e riprova.`
- `Se non riesci più a venire, scrivici il prima possibile: proviamo a dare il posto a qualcun altro.`
- `Scrivici su WhatsApp`
- `Richieste aperte e ritiri recenti`
- `I ritiri recenti restano visibili, separati dalle richieste da gestire e dai conteggi.`
- `Ritirate negli ultimi 5 giorni` / `Ritirata` / `Ritirata il ...`

Il diff dei testi non contiene `altrimenti`, `penale` o `conseguenz`; il banco ha ripetuto il controllo sul DOM.

## Controprove

- Conferma: aprirla non chiama l'RPC; `No, lasciala` lascia **0 chiamate**; `Sì, ritirala` produce **1 chiamata**.
- Demo: riletto `status=withdrawn`, `withdrawn_at=2026-09-19T04:59:02.532455+00:00`, `appointment_id=null`.
- Richiesta già gestita: RPC respinta con `23514 / GH96_ALREADY_RESOLVED`; a schermo compare il testo non tecnico riportato sopra.
- Riprenotazione: stesso pet accettato subito con nuova richiesta `pending`; destinazione UI `/u/book?petId=...`.
- Appuntamenti demo: **8 prima e 8 dopo**; il ritiro non ne crea uno.
- WhatsApp: numero letto da `tenant.settings.whatsapp_phone`, testo precompilato con pet, giorno e ora; nessun comando di annullamento nell'app.
- Staff: ritiro visibile 5 giorni, senza azioni. Con una richiesta aperta e un ritiro: `Da gestire 1`, `Da prenotare 0`, `In attesa persona 0`.
- Pallino dashboard: **1 -> 0**; toni: **0 -> 0**.
- Costante unica: `RECENT_WITHDRAWN_REQUEST_DAYS` in `src/apps/staff/lib/database.js`.
- GH-90: hash prima/dopo identici per `getAppointmentRequestStaffAction` (`12ba0294...b88c6`) e `summarizePendingAppointmentRequests` (`74db1ae2...21b5b`).
- Ricerca `rg -n "no_show_score|is_blacklisted" src/apps/customer`: nessuna occorrenza.
- Altre superfici: **63/63** impronte customer/staff identiche alla base.
- 375 px: 4 viste, overflow **0**, troncamenti **0**, nessun nuovo bersaglio sotto **44 px**. La prova ha corretto il link WhatsApp affinché anche il bersaglio reale, non solo il contenuto, sia alto almeno 44 px.

## Demo, RLS e pulizia

Progetto unico coinvolto: `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`). La sonda `[DEMO GH-96]` ha creato tre richieste in sequenza; teardown finale: marker **0**, richieste **0** come la baseline, appuntamenti **8** come la baseline.

Suite RLS: **60 PASS, 0 FAIL, 0 SKIP**; pulizia fixture PASS. Nessun account o password creato o modificato.

## Verifiche e tempi

- Banco browser: **3,114 s**, 0 page error, 0 richieste impreviste.
- Prova demo: **5,898 s**, pulizia verde.
- Suite RLS: circa **60 s**, verde.
- `git diff --check`: verde.
- `npm run build`: **167 moduli**, Vite **1,25 s**, verde. Avvisi non bloccanti preesistenti: `caniuse-lite` datato e chunk oltre 500 kB.
- `npm run lint`: non eseguito perché il comando configurato non trova `eslint` (`sh: eslint: command not found`); nessuna dipendenza installata fuori mandato.

## Passo Luigi

Resta la prova prevista dal mandato su telefono e gestionale: ritirare, rifare, trovare la via WhatsApp dopo conferma e rispondere a **«cosa non ti torna?»**.
