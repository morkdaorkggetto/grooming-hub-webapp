# Consegna GH-33 - Report incassi

## Base e perimetro

- Root dichiarata al primo atto: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch di ingresso e consegna: `main`.
- Base dichiarata: `578928d`.
- Database ammesso e usato: solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Migration: nessuna.
- Push, merge e deploy: non eseguiti.
- Commit: registro e codice sono nello stesso commit locale; hash comunicato nella chiusura della sessione.

## Esito

La rotta esistente `/reports/weekly` realizza la composizione CD-02 sui dati reali:
due numeri grandi, riga del giorno che e anche barra, confronto con la settimana
precedente, andamento a dodici settimane, distribuzione degli importi e dettaglio
visite. La pagina resta integralmente in sola lettura.

La domenica viene dichiarata chiusa solo attraverso
`tenants.settings.booking_schedule.closed_weekdays`; il lunedi con sola mattina
chiusa non viene classificato come giorno chiuso. Trattamenti, righe a importo
zero e annotazioni restano dati non categorizzati: testo verbatim, importo neutro
e solo pallino per `issues`.

## File esaustivi

| File | Stato | Contenuto |
|---|---|---|
| `design_handoff_staff_app/cd02-report/CD-02-handoff.md` | aggiunto | Handoff CD-02 versionato |
| `design_handoff_staff_app/cd02-report/cd02-report-kit.jsx` | aggiunto | Kit della composizione versionato |
| `design_handoff_staff_app/cd02-report/cd02-report-viste.jsx` | aggiunto | Sei viste della composizione versionate |
| `design_handoff_staff_app/cd02-report/cd02-report-note.jsx` | aggiunto | Tavole decisionali versionate |
| `design_handoff_staff_app/cd02-report/CD-02 Report Incassi.html` | aggiunto | Canvas CD-02 versionato |
| `src/apps/staff/pages/WeeklyRevenue.jsx` | modificato | Report CD-02, calcoli, stati e responsive |
| `src/apps/staff/pages/WeeklyRevenue.css` | aggiunto | Stili dedicati desktop/telefono |
| `src/apps/staff/lib/database.js` | modificato | Lettura all-time staff con join pet/customer e foto |
| `src/apps/staff/pages/Dashboard.jsx` | modificato | Tessera rinominata in "Come e andata" |
| `src/shared/tokens/tokens.css` | modificato | Sei derivati di opacita dichiarati una volta |
| `src/apps/staff/components/AppHeader.jsx` | rimosso | Ultimo consumer eliminato e misura consumer a zero |
| `docs/consegne/GH-33-report-incassi-esecuzione.md` | aggiunto | Presente registro |

## Misure demo e fixture

Misura iniziale: 90 visite, intervallo `2023-04-01` - `2026-08-26`, massimo
settimanale reale 3 visite, zero visite a costo 0. Configurazione letta:
`closed_weekdays=["sunday"]`, `closed_time_preferences.monday=["morning"]`.

Sono state create 77 visite temporanee con ID `DEMO-GH33-*`:

| Settimana | Righe | Incasso | Scopo |
|---|---:|---:|---|
| 27 luglio - 2 agosto | 58 | 1.495 EUR | settimana piena |
| 10 - 16 agosto | 1 | 468 EUR | settimana da una visita e confronto |
| 17 - 23 agosto | 18 | 468 EUR | settimana media, delta nullo, assenza |

La settimana media aveva lunedi senza visite, domenica chiusa, una riga
`appuntamento rimandato per ciclo` a importo zero e due `issues`.

Teardown nella stessa sessione: 77 righe eliminate. Controprova finale:
0 visite GH-33, 0 utenti sonda, 0 identity, 0 profili, 0 membership,
0 customer sonda; totale visite demo ripristinato a 90.

## Controprove vive

| Controprova | Misura | Esito |
|---|---|---|
| Settimana da 1 visita | 1 riga, 468 EUR, dettaglio non raggruppato | PASS |
| Settimana da 58 visite | 2 giorni/20 righe iniziali, poi 6 giorni/58 righe | PASS |
| Settimana futura | nessun numero e nessun giorno, invito al ritorno | PASS |
| Settimana media | 18 righe, 468 EUR, precedente 468 EUR, "come la scorsa" | PASS |
| Caricamento | skeleton del report resi dal vivo con ritardo locale temporaneo poi rimosso | PASS |
| Telefono 390 x 844 | 1 colonna, 0 overflow; 1 giorno/4 righe, espansione a 5 giorni/18 righe | PASS |
| Giorni chiusi | domenica "chiuso" da schedule; lunedi vuoto "-" | PASS |
| Assenza verbatim | testo integrale presente, importo neutro, nessun filtro | PASS |
| Delta | crescita/calo calcolati; delta nullo reso "come la scorsa" | PASS |
| Token colore | 0 occorrenze `rgba(` nei file del report | PASS |
| `AppHeader` | 0 consumer prima della rimozione, 0 riferimenti finali | PASS |
| Dashboard | titolo e descrizione CD-02 presenti dal vivo | PASS |
| Console browser | 0 errori; 2 warning React Router v7 preesistenti | PASS |
| Suite RLS | 30 PASS, 0 FAIL, 1 SKIP previsto (secondo tenant assente) | PASS |
| Build finale | `npm run build` | PASS |

## Eccezioni e adattamenti

- Il primo avvio della suite RLS e fallito prima del login per DNS negato dal
  sandbox (`ENOTFOUND`). La stessa suite, rieseguita con accesso di rete
  autorizzato, ha prodotto 30 PASS, 0 FAIL e 1 SKIP previsto.
- `npm run lint` non e eseguibile: lo script dichiara `eslint`, ma il binario
  non e installato nel workspace (`eslint: command not found`). Nessuna
  dipendenza e stata aggiunta fuori mandato.
- Sul demo esiste una visita nella fascia 26-29 EUR, mentre la produzione
  misurata da Cowork ha la fascia vuota. Il pannello mantiene la composizione
  ma usa un titolo esplicativo neutro quando i dati non mostrano due gobbe;
  sul dataset con fascia vuota rende il titolo CD-02.
- Il ritardo usato per rendere misurabile lo stato di caricamento e stato
  inserito e rimosso nella stessa sessione; non compare nel diff finale.

## Fuori istruzione e code

- Nessuna attivita fuori istruzione.
- Restano fuori mandato: vista mensile, campo strutturato per il tipo di
  lavorazione, stampa/esportazione e decisione del salone sul conteggio delle
  righe di assenza come "cani passati".
