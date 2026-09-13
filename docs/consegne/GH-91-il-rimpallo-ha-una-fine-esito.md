# GH-91 - Il rimpallo ha una fine: esito

## Esito e perimetro

**Mandato eseguito.** Il primo rifiuto puo' portare una data e una fascia
nuove; dal secondo giro restano le scelte e compare il contatto diretto col
salone. La dashboard mostra le attese senza trasformarle in allarmi e, dopo
48 ore, suggerisce di telefonare. Pallino e suono restano invariati.

Root `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree `webapp/`.
Base `main`: **9988f445fcdd1184a4e51b3b6377db3bfdfa7da1**.
Commit previsto: `feat: end appointment alternative loop (GH-91)`.
Hash risolvibile con
`git log -1 --format=%H -- docs/consegne/GH-91-il-rimpallo-ha-una-fine-esito.md`.

Solo il demo **grooming-hub-demo**, ref **qttpinkslhenxrsbhhhg**, e' stato
letto e scritto per le fixture temporanee. Stato preflight:
`ACTIVE_HEALTHY`; firma RPC a sette argomenti presente. Produzione mai letta
o scritta. Nessun account creato o modificato, nessuna password cambiata,
nessuna migrazione applicata, nessuna policy, rotta o dipendenza aggiunta.
Nessun push, merge o deploy.

## Tabella esaustiva dei file del commit

| File | Intervento / motivo |
|---|---|
| `src/apps/customer/components/PendingRequest.jsx` | Primo rifiuto con data/fascia facoltative, nuova firma RPC, limite dei giri e contatto WhatsApp |
| `src/apps/customer/components/BookingTimePreferenceChips.jsx` | Fasce di `Book.jsx` estratte in un componente riusato dai due flussi |
| `src/apps/customer/hooks/useAppointmentRequests.js` | Lettura di `alternatives_round` |
| `src/apps/customer/lib/appointmentRequestFlow.js` | Unico posto per limite 1, soglia 48 ore, eta' dell'attesa ed errori rifiuto non tecnici |
| `src/apps/customer/lib/bookingDates.js` | Generatore delle stesse date usato da prenotazione e rifiuto |
| `src/apps/customer/pages/Book.jsx` | Usa i due elementi estratti; comportamento prenotazione invariato e controprovato |
| `src/apps/staff/lib/database.js` | Lettura di `alternatives_round` nella SELECT unica delle richieste |
| `src/apps/staff/pages/Dashboard.jsx` | Pannello neutro delle attese e sollecito testuale oltre soglia |
| `supabase/migrations/20260913_gh91_decline_carries_a_date.sql` | Fonte Cowork autorizzata; inclusa immutata e non applicata da Codex |
| `docs/consegne/GH-91-il-rimpallo-ha-una-fine-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-91/browser-check.mjs` | Banco browser riproducibile con app e SDK reali, HTTP in memoria |
| `docs/consegne/evidenze/GH-91/browser.json` | Payload, giri, dashboard, suono, WhatsApp e misure mobile |
| `docs/consegne/evidenze/GH-91/customer-decline-date-375.png` | Primo rifiuto con data e fascia a 375 px |
| `docs/consegne/evidenze/GH-91/customer-round-two-375.png` | Secondo giro con scelte e `Meglio sentirci` a 375 px |
| `docs/consegne/evidenze/GH-91/dashboard-waiting-375.png` | Attesa recente nella dashboard |
| `docs/consegne/evidenze/GH-91/dashboard-follow-up-375.png` | Attesa oltre soglia nella dashboard |
| `docs/consegne/evidenze/GH-91/live-demo-check.mjs` | Due fixture vive con account esistenti e pulizia nel `finally` |
| `docs/consegne/evidenze/GH-91/live-demo.json` | Valori riletti dal demo e conteggi finali |
| `docs/consegne/evidenze/GH-91/rls-summary.txt` | Esito, durata e pulizia della suite RLS |
| `docs/consegne/evidenze/GH-91/ui-invariants.sha256` | 32 coppie di impronte delle altre viste/componenti customer e staff |

Fuori da modifica, stage e commit:
`docs/incarichi/GH-91-il-rimpallo-ha-una-fine.md`, documento Cowork indicato
da Luigi. Nessun diario, altro mandato o brief CD toccato.

La migrazione GH-91 entra per autorizzazione espressa, ma Codex non l'ha
modificata ne' applicata. SHA-256 iniziale e finale:
`3b591336585c36a9912aaf2f96667fc52b4076bd4af9c18fd3041fdc908a056f`.
Dichiarazione di Luigi/Cowork: applicata in produzione e al demo prima del
mandato. Codex non ha verificato la produzione; sul demo ha misurato colonna,
firma e comportamento vivo.

## Testi nuovi completi

Lato proprietario:

- `Quando ti andrebbe bene invece?`
- `Se vuoi, indica una nuova data: aiuta il salone a proporti orari più adatti.`
- `Invia la nuova disponibilità`
- `Rifiuta senza indicare una data`
- `Torna agli orari`
- `Meglio sentirci`
- fallback senza numero: `Meglio sentirci: contatta direttamente il salone.`
- conferma: `Hai indicato {data}, {fascia}. Ora tocca al salone proporti un’alternativa.`
- giorno chiuso: `Quel giorno il salone è chiuso. Scegli un’altra data.`
- data non futura: `Scegli una data futura per la tua nuova disponibilità.`
- messaggio WhatsApp: `Ciao! Per {pet} non riusciamo a trovare una fascia adatta. Possiamo sentirci?`

Lato salone:

- eyebrow: `Risposte attese`
- recente singolare: `1 persona deve ancora rispondere`
- recente plurale: `{n} persone devono ancora rispondere`
- oltre soglia singolare: `1 risposta tarda ad arrivare`
- oltre soglia plurale: `{n} risposte tardano ad arrivare`
- comando: `Vedi richieste`
- riga recente: `{pet} · proposto il {gg/mm} alle {hh:mm} · da {n ore} · {slot}`
- riga oltre soglia: `{pet} · nessuna risposta da {n giorni}: conviene telefonare · {slot}`

I testi esistenti delle scelte, della prenotazione e del cambio risposta non
sono stati riscritti. La lingua continua a parlare di persona/proprietario,
mai di cliente nel nuovo flusso.

## Un rifiuto, poi il contatto

`MAX_ALTERNATIVE_DECLINE_ROUNDS = 1` vive soltanto in
`src/apps/customer/lib/appointmentRequestFlow.js`. La prova pura restituisce:
giro 0 `true`, giro 1 `true`, giro 2 `false`. Il caso storico accettato con
alternative e contatore 0 conserva quindi un rifiuto disponibile.

Al primo giro lo schermo contiene `Nessuna di queste mi va bene`. Toccandolo
appaiono lo stesso `DesiredDateStrip` di `/u/book` e lo stesso componente di
fasce estratto da `Book.jsx`; le chiusure continuano a venire dagli helper
`bookingSchedule`. Restano anche il percorso senza data e il ritorno agli
orari. Al secondo giro il pulsante del rifiuto e' assente, tutte e tre le
scelte sono abilitate e compare `Meglio sentirci`.

Il link misurato usa il numero letto da `tenant.settings.whatsapp_phone`:
`https://wa.me/393330000091?...` nella fixture in memoria. Nessun numero e'
hard-coded nel prodotto. La controprova di regressione su `/u/book` ha
selezionato pet `Rumba`, indicazione `Bagno`, data `15/09` e fascia `morning`:
tutto operativo dopo l'estrazione.

## Controprove demo

Due richieste `[DEMO GH-91]` create con Mario e gestite con la sonda staff
esistente, senza account nuovi:

| Prova | Misura viva |
|---|---|
| Rifiuto con data | `desired_date 2026-09-15 -> 2026-09-22`; `time_preference=morning`; `customer_response=declined`; `status=pending` |
| Rifiuto senza data | `desired_date 2026-09-15 -> 2026-09-15`; fascia invariata; `customer_response=declined`; `status=pending` |
| Primo giro proposte | `alternatives_round=1` |
| Secondo giro proposte | `alternatives_round=2` |
| Giorno chiuso | tentato `2026-09-14` mattina; SQLSTATE `22023`, `New desired date falls in a declared closure` |
| Atomicita' chiusura | prima/dopo identici: `desired_date=2026-09-15`, `time_preference=morning` |
| Pulizia | marker residui `0`; richieste finali `0`, uguali alla baseline `0` |

Durata prova viva: **5,326 s**. Sullo schermo l'errore tecnico della chiusura
diventa il testo italiano riportato sopra.

In `/requests` il comportamento preesistente rende il cambio distinguibile
senza ampliare la superficie del mandato: tag `Proposte rifiutate`, tile
`Data desiderata = venerdì 18 settembre 2026`; la data iniziale `lunedì 14
settembre` e' assente dalla scheda. `CustomerRequests.jsx` e' immutato.

## Dashboard, pallino e soglia

`WAITING_CUSTOMER_FOLLOW_UP_HOURS = 48` vive nello stesso unico file di
configurazione. A 47 ore `needsFollowUp=false`; a 48 ore `true`.

Caso recente misurato:

> Rumba · proposto il 13/09 alle 05:42 · da 2 ore · 15/09 alle 11:00 · 16/09 alle 10:30 · 18/09 alle 09:00

Caso oltre soglia:

> Rumba · nessuna risposta da 2 giorni: conviene telefonare · 15/09 alle 11:00 · 16/09 alle 10:30 · 18/09 alle 09:00

Il pannello e' un `Panel` ordinario, senza classe terracotta e senza colori
nuovi. In entrambi i casi: pallino **0**, avvii oscillatore **0**. La
classificazione resta esclusivamente quella di GH-90:
`getAppointmentRequestStaffAction` + `summarizePendingAppointmentRequests`.
`StaffRequestAlerts.jsx` non ha diff e conserva la sua impronta.

## Browser, RLS e invarianti

Banco finale: Chromium 375x812, fuso `Europe/Rome`, app e Supabase SDK reali,
Auth/REST in memoria, WebSocket chiusi e font remoti neutralizzati. Cinque
casi customer, due dashboard, una vista `/requests`, limiti 1/48 e
regressione `/u/book`; **0 page error, 0 destinazioni impreviste**. Durata
finale **3,455 s**.

Quattro viste misurate a 375 px: overflow massimo **0 px**, troncamenti **0**,
altezza minima dei target **44 px**, larghezza minima **44,328 px**. Il primo
giro aveva misurato 43,328 px sulle sei date dentro la card: il solo nuovo
contenitore riceve `marginInline: -3`, usando spazio del padding interno e
portando i bersagli oltre 44 px. Nessun CSS, colore o geometria globale e'
stato modificato; prenotazione e `DesiredDateStrip` restano invariati.

Suite RLS viva sul demo:

```text
60 PASS, 0 FAIL, 0 SKIP
real 26.08 s; user 1.09 s; sys 0.18 s
```

Pulizia suite: 0 residui per pet, visite, customer, richieste, note,
promozioni e appuntamenti GH-52. Script RLS immutato, SHA-256
`e0d6bfe12333148486fe6494414c78d03224d29fd0950db2913d73c5510ca7bc`.

`currentAlternativeResponse` e' immutata insieme all'intero file:
`ed167d97f5e5afc49e6f5a11c43ad193a0b076194a7e09ecd2d120f096b98bac`.
`StaffRequestAlerts.jsx` prima/dopo:
`4bae30007e3266179fd2a7d58201fb1202c33f5494f5dea5e051ac46c437ed77`.
Altre 32 viste/componenti customer e staff coincidono con la base; coppie di
impronte in `ui-invariants.sha256`. Nessun file CSS, manifest o lockfile ha
diff.

`npm run build`: **167 moduli**, Vite **1,18 s**, totale **1,55 s**, verde. Avvisi non bloccanti
preesistenti: `caniuse-lite` datato e chunk JS oltre 500 kB. `npm run lint`
tentato ma non eseguibile: `eslint: command not found`; nessuna dipendenza e'
stata installata per aggirare il limite.

Finestra dalla prima modifica applicativa al banco finale: **07:32:15-
07:42:51 CEST, 10 min 36 s**; esclude ricognizione iniziale e stesura del
registro. Misure isolate: browser 3,455 s, demo 5,326 s, RLS 26,08 s, build
1,55 s. La suite ha superato 30 secondi di attesa del runner, ma ha concluso
normalmente; nessun rallentamento persistente di disco o browser osservato.

## Fonti, eccezioni e passo finale

Consultata la documentazione Supabase corrente su `rpc()`, funzioni
`SECURITY DEFINER`, `search_path` e privilegi. La funzione demo ha
`security_definer=true` e `search_path=""`; le controprove RLS verificano il
varco autenticato. Nessun DDL prodotto o applicato da Codex.
L'indice `https://supabase.com/changelog.md` non e' stato leggibile dal fetch
per `content-type text/markdown`; non incide su questa modifica applicativa.

Nessuna estensione funzionale fuori mandato. L'SQL Cowork e' l'unico file
aggiuntivo autorizzato. L'aggiustamento locale di 3 px e' dichiarato sopra:
serve esclusivamente a soddisfare la controprova dei target a 44 px e non
tocca fogli stile o superfici esistenti.

Resta la prova umana prescritta: gestionale e telefono, rifiuto con data
nuova, secondo giro, dashboard d'attesa. La domanda da annotare e':
**cosa non ti torna?**
