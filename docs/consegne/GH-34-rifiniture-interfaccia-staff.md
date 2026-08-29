# Consegna GH-34 - Rifiniture interfaccia staff

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `8ab99b0`.
- Database ammesso: solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: fuori perimetro, non letta e non scritta.
- Nessuna rotta, migration o scrittura applicativa aggiunta.
- Push, merge e deploy: non eseguiti.

## File esaustivi

| File | Stato | Contenuto |
|---|---|---|
| `src/apps/staff/components/StaffKit.jsx` | modificato | Occhiello staff collegato alla Dashboard fuori dalla Dashboard |
| `src/apps/staff/styles/gh15-staff.css` | modificato | Allineamento account/uscita e stati del collegamento nell'occhiello |
| `src/apps/staff/pages/WeeklyRevenue.jsx` | modificato | Riga visita trasformata in collegamento semantico alla scheda pet |
| `src/apps/staff/pages/WeeklyRevenue.css` | modificato | Aspetto invariato, hover discreto e fuoco visibile sulle righe |
| `docs/consegne/GH-34-rifiniture-interfaccia-staff.md` | aggiunto | Presente registro |

## Controprove

| Controprova | Misura | Esito |
|---|---|---|
| Allineamento desktop | viewport 1280 px; centro indirizzo `39 px`, centro pulsante `39 px`, delta `0 px` | PASS |
| Comportamento sotto 640 px | viewport 390 x 844; indirizzo `display:none`, azioni `flex-direction:column`, overflow orizzontale `0 px` | PASS |
| Riga visita ordinaria | click su `[DEMO GH-34] Bagno e spazzolatura` ha aperto `/client/16d14bbe-94ea-4292-8f60-aca6e6cd6d3b`, scheda Fido | PASS |
| Riga di assenza | click su `[DEMO GH-34] appuntamento rimandato per ciclo` ha aperto `/client/2e1c752d-c159-4832-b2eb-f5211afc6596`, scheda Luna | PASS |
| Ritorno da Contatti | link `Torna alla Dashboard`, `href=/dashboard`, atterraggio `/dashboard` | PASS |
| Ritorno da Nuovo cliente | link `Torna alla Dashboard`, `href=/dashboard`, atterraggio `/dashboard` | PASS |
| Ritorno da Nuova visita | link `Torna alla Dashboard`, `href=/dashboard`, atterraggio `/dashboard` | PASS |
| Dashboard | 0 link `.gh-hero__brand-link`; occhiello presente come testo | PASS |
| Superfici escluse | 0 link e 0 Hero staff su login, reset password, scheda pubblica e portale legacy | PASS |
| Tastiera | il link semantico riceve il fuoco; `document.activeElement` e un `A` con nome `Torna alla Dashboard` e outline `solid` | PASS |
| Suite RLS | 30 PASS, 0 FAIL, 1 SKIP previsto per assenza secondo tenant | PASS |
| Build finale | `npm run build`; 147 moduli trasformati | PASS |

## Fixture e teardown

Create sul solo demo due visite temporanee nella settimana 24-30 agosto 2026:

| ID | Pet | Scopo |
|---|---|---|
| `DEMO-GH34-NORMAL` | Fido | navigazione da una visita ordinaria |
| `DEMO-GH34-ABSENCE` | Luna | navigazione da assenza a importo zero |

Per il login e stata usata la sonda idempotente GH-04
`staff.sonda@test.example`, senza modificare account reali. Dopo le prove vive
sono state eliminate le due visite e la sonda. La sonda e stata ricreata una
seconda volta per la suite RLS e nuovamente smontata.

Controprova finale: 0 visite `DEMO-GH34-*`, 0 utenti sonda, 0 identity,
0 profili, 0 membership e 0 customer collegati alla sonda.

## Eccezioni e fuori istruzione

- Il bridge del browser ha portato correttamente il fuoco sui link e ne ha
  misurato l'outline, ma non ha sintetizzato la navigazione predefinita con il
  tasto Invio. L'attivazione e stata quindi controprovata separatamente con il
  click reale su entrambe le novita; la raggiungibilita da tastiera e la
  semantica nativa `a[href]` sono state misurate nel DOM.
- Nessuna attivita fuori istruzione.
