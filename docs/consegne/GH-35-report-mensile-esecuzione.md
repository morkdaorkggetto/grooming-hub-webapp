# Consegna GH-35 - Report mensile CD-03

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `a53460c`.
- Dipendenza GH-34: registro presente e commit locale chiuso.
- Database ammesso: solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: fuori perimetro, non letta e non scritta.
- Rotta mantenuta: `/reports/weekly`.
- Nessuna migration, scrittura applicativa, nuova rotta, push, merge o deploy.

## Nota sul contratto dati

Il mandato cita `getWeeklyRevenueReport(from,to)`, ma alla base dichiarata la
funzione non esiste: GH-33 l'ha sostituita con `getRevenueReportData()`, che
legge lo storico all-time una sola volta. L'esecuzione conserva questa fonte
per entrambi i modi e la estende con filtri opzionali `from`/`to`; la seconda
chiamata ammessa da CD-03 viene usata soltanto per il confronto sullo stesso
tratto del mese precedente. Il modo settimana mantiene il contratto corrente.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `design_handoff_staff_app/cd03-report/CD-03 Report Mensile.html` | aggiunto | Canvas CD-03 originale versionato nel worktree. |
| `design_handoff_staff_app/cd03-report/CD-03-handoff.md` | aggiunto | Handoff CD-03 originale versionato nel worktree. |
| `design_handoff_staff_app/cd03-report/cd03-mese-kit.jsx` | aggiunto | Tavola dei componenti CD-03 originale. |
| `design_handoff_staff_app/cd03-report/cd03-mese-note.jsx` | aggiunto | Tavola delle decisioni CD-03 originale. |
| `design_handoff_staff_app/cd03-report/cd03-mese-viste.jsx` | aggiunto | Quattro viste di riferimento CD-03 originali. |
| `src/apps/staff/lib/database.js` | modificato | Mantiene la lettura all-time e accetta anche un intervallo completo opzionale per il confronto parziale. |
| `src/apps/staff/pages/WeeklyRevenue.css` | modificato | Composizione mensile desktop/mobile, righe settimana e striscia mesi secondo CD-03. |
| `src/apps/staff/pages/WeeklyRevenue.jsx` | modificato | Interruttore di unita, aggregazioni mensili misurate, confronto parziale e navigazione conservativa. |
| `src/shared/tokens/tokens.css` | modificato | Sei alias semantici CD-03, tutti derivati da colori gia dichiarati. |
| `docs/consegne/GH-35-report-mensile-esecuzione.md` | aggiunto | Registro unico della consegna. |

I cinque materiali CD-03 hanno permessi `0644`. Nessun altro file e stato
creato o modificato da Codex.

## Controprove

- **Separatore delle migliaia:** nella settimana 27 luglio - 2 agosto il DOM
  mostra `1.495 €`; nel mese di aprile mostra `3.547 €`. La stringa
  precedente `1495 €` non e riproducibile in nessuno dei due modi.
- **Aprile:** 146 cani, 3.547 €, 20 giorni lavorati su 26. Le cinque righe
  sommano `22+34+33+31+26 = 146`, `520+840+810+745+632 = 3.547` e
  `4+5+5+4+2 = 20`.
- **Giugno:** 29 cani, 800 €, 10 giorni lavorati su 26. Le cinque righe
  sommano `9+0+8+6+6 = 29`, `245+0+220+165+170 = 800` e
  `3+0+3+2+2 = 10`. La settimana 8-14 giugno appare come
  `settimana ferma - non e passato nessuno`, non come errore.
- **Agosto incompleto:** 67 cani, 1.745 €, 11 giorni lavorati su 26. Le
  cinque righe sommano `9+20+1+18+19 = 67`,
  `235+520+20+468+502 = 1.745` e `1+2+1+5+2 = 11`. La nota dichiara i primi
  29 giorni, il confronto omogeneo da 2.790 € e il luglio pieno da
  3.030 €, senza proiezioni.
- **Giorni di apertura:** il denominatore e calcolato scorrendo le date e
  applicando `booking_schedule` tramite `getDateClosure`; le domeniche sono
  escluse, mentre il lunedi con sola mattina chiusa resta lavorabile. I valori
  26/26/26/26/27/26 non sono costanti scritte nella vista.
- **Storia disponibile:** la striscia contiene soltanto marzo-agosto 2026,
  sei mesi. Su marzo il comando `Mese precedente` risulta disabilitato.
- **Conservazione della data:** dal gesto sulla settimana 27 luglio - 2 agosto
  il passaggio a mese apre luglio e il ritorno ripristina la stessa settimana;
  dalla settimana 17-23 agosto il passaggio apre agosto e il ritorno ripristina
  la stessa settimana. Aprendo la riga 8-14 giugno si passa invece alla
  settimana completa 8-14 giugno.
- **Errore della seconda lettura:** una sonda temporanea ha fatto fallire
  esclusivamente il confronto del mese corrente. Agosto ha continuato a
  mostrare 1.745 €, la dicitura `confronto non disponibile` e nessuna
  percentuale. La sonda e stata rimossa e la lettura reale da 2.790 € e
  tornata visibile prima della build finale.
- **Telefono:** viewport 390x844 verificato visivamente; interruttore su riga
  propria, target da 46 px, righe da almeno 60 px, nessuna sovrapposizione o
  scorrimento orizzontale incoerente.
- **Desktop:** viewport 1440x900 verificato visivamente sulla vista aprile;
  navigazione, numeri, cinque righe e tre pannelli laterali restano leggibili
  senza sovrapposizioni.
- **Componenti CD-02:** `DayBar` e `TrendStrip` restano in uso nel modo
  settimana; `WeekRow` e `MonthTrend` sono componenti distinti.
- **Token:** i sei derivati richiesti sono usati per nome; nessun nuovo colore
  o `rgba` e stato aggiunto nei componenti del report.
- **Build finale:** `npm run build` verde, 147 moduli trasformati. Restano i
  soli avvisi preesistenti su Browserslist e chunk oltre 500 kB.
- **Suite RLS demo:** `30 PASS, 0 FAIL, 1 SKIP`; lo SKIP cross-tenant e quello
  atteso per il demo a tenant singolo. Pulizia interna della suite: zero pet,
  visite, customer, richieste e note marker.

## Fixture e teardown

- Sono state aggiunte 449 visite con identificativo `DEMO-GH35-*` sul solo
  demo, sottraendo i dati baseline gia presenti e componendo esclusivamente le
  cardinalita necessarie alle quattro viste approvate.
- La sonda staff usa-e-getta GH-04 e stata creata dal seed versionato
  `supabase/seeds/gh-04-staff-probe-demo.sql`, usata per login e RLS e smontata
  con il teardown guardato versionato.
- Teardown GH-35: esattamente 449 visite selezionate e rimosse; residuo
  `DEMO-GH35-* = 0`; visite demo complessive dopo la pulizia: 90.
- Teardown finale sonda: `auth.users = 0`, `auth.identities = 0`,
  `profiles = 0`, `tenant_memberships = 0`, `customers = 0`, `pets = 0` per
  l'UUID della sonda. Il conteggio GH-35 e rimasto a zero dopo la suite RLS.

## Eccezioni e fuori istruzione

- `docs/incarichi/GH-35-report-mensile-esecuzione.md` e un documento parallelo
  di Cowork gia presente e resta fuori dallo stage e dal commit, come da
  attribuzione del mandato precedente.
- La prima esecuzione locale della suite RLS non ha raggiunto il DNS del demo
  nel sandbox (`ENOTFOUND`); la riesecuzione autorizzata con rete ha prodotto
  l'esito completo verde riportato sopra. Non e un fallimento applicativo.
- `npm run lint` non e eseguibile nella base dichiarata: lo script esiste ma
  il binario `eslint` non e installato (`eslint: command not found`). Nessuna
  dipendenza e stata aggiunta fuori mandato.
- La produzione non e stata consultata ne modificata. Nessuna migration,
  nuova rotta, push, merge o deploy. Nessun file fuori perimetro toccato.
