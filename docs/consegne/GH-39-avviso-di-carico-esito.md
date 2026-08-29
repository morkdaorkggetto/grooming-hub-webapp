# Consegna GH-39 - Avviso di carico e fascia oraria unica

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `8ac4c57`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), trovato `ACTIVE_HEALTHY`.
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessuna migration, nuova rotta, dipendenza, scrittura permanente, push,
  merge o deploy.

## Esito

GH-39 e' completato. Il calendario staff mostra una nota non bloccante appena
data e ora ricadono in una fascia che contiene gia' appuntamenti attivi. La
nota dichiara quante lavorazioni sono gia' in programma nella fascia e, quando
l'orario scelto e' realmente occupato, quante postazioni restano libere.

La nota usa lo stesso modello di GH-37: ignora appuntamenti annullati e
richieste non approvate, rispetta gli intervalli semiaperti ed esclude
l'appuntamento stesso durante una riprogrammazione. Quando la capienza e'
satura compare soltanto il rifiuto esistente e il salvataggio resta disabilitato.

Le fasce attive vivono ora in una definizione condivisa:

| Fascia | Intervallo | Orario staff proposto |
| --- | --- | --- |
| Mattina | 09:00-13:00 | 09:00 |
| Pomeriggio | 13:00-19:00 | 13:00 |

Etichette cliente, calendario, coda richieste, alternative WhatsApp e giorni
di chiusura derivano da quella definizione. Il portale legacy
`CustomerPortal.jsx` e' rimasto intatto come richiesto.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `src/shared/tenant/bookingSchedule.js` | modificato | Centralizza intervalli, etichette, nomi e orari iniziali delle fasce attive. |
| `src/shared/tenant/workstationCapacity.js` | modificato | Calcola il carico della fascia e le postazioni libere all'orario scelto usando le regole GH-37. |
| `src/apps/staff/pages/Calendar.jsx` | modificato | Mostra la nota nelle tre superfici: collocazione manuale, conferma richiesta e riprogrammazione. |
| `src/apps/staff/pages/Calendar.css` | modificato | Distingue visivamente la nota neutra dal rifiuto di capienza. |
| `src/apps/staff/pages/CustomerRequests.jsx` | modificato | Usa etichette e orario predefinito dalla definizione condivisa. |
| `src/apps/staff/components/CalendarKit.jsx` | modificato | Deriva i nomi brevi delle fasce dalla fonte condivisa. |
| `src/apps/staff/lib/whatsapp.js` | modificato | Deriva i nomi delle fasce proposte dalla fonte condivisa. |
| `src/apps/customer/pages/Book.jsx` | modificato | Usa le opzioni orarie condivise senza duplicare gli intervalli. |
| `src/apps/customer/pages/Home.jsx` | modificato | Rende la fascia della richiesta con la stessa etichetta condivisa. |
| `docs/consegne/GH-39-avviso-di-carico-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex. Il worktree era pulito
all'ingresso; non sono emerse modifiche locali inattese.

## Controprove vive sul demo

Fixture usa-e-getta impiegate: tre appuntamenti `gh39-*`, una richiesta
strutturata con marker `[DEMO GH-39]` e la sonda staff canonica GH-04.

| Prova | Atteso | Misurato | Esito |
| --- | --- | --- | --- |
| Fascia vuota | Nessuna nota | 0 note, 0 conflitti | PASS |
| Una lavorazione | Singolare e una postazione libera | `Sabato mattina: 1 lavorazione gia' in programma.` e `Alle 09:00 resta 1 postazione libera.` | PASS |
| Capienza 2 satura | Solo rifiuto | 0 note, messaggio GH-37, salvataggio disabilitato | PASS |
| Collocazione manuale | Nota prima del salvataggio | Nota visibile nel modal `Nuovo appuntamento` | PASS |
| Conferma richiesta | Nota prima della conferma | Nota visibile nel modal `Conferma richiesta` | PASS |
| Modifica dal dettaglio | Nota senza contare l'appuntamento stesso | 1 lavorazione nella fascia, nessun conflitto | PASS |
| Richiesta pomeriggio | Orario iniziale coerente con 13-19 | Campo ora `13:00` | PASS |
| App clienti | Nessun carico interno | Sessione reale Mario su `/u/book`: 0 note e 0 testi su lavorazioni/postazioni | PASS |
| Etichette cliente | Fasce condivise | `Mattina (9-13)` e `Pomeriggio (13-19)` presenti | PASS |

Le frasi riportate nella tabella sono trascritte in ASCII; nell'interfaccia la
grafia e' quella italiana prevista dal mandato, con accenti e trattino lungo.

Controllo visivo desktop e mobile a 390 x 844: nota leggibile, testo contenuto
nel modal, nessuna sovrapposizione; il colore resta neutro e distinto dal
rifiuto rosso.

## Una sola definizione

- Ricerca negli active consumer: nessuna copia delle stringhe `Mattina (9-13)`,
  `Pomeriggio (13-19)`, del vecchio `14:00` condizionale o degli intervalli
  legacy.
- Le uniche occorrenze residue di `09:00-12:00` e `14:00-17:30` sono in
  `src/apps/staff/pages/CustomerPortal.jsx`, codice morto escluso
  esplicitamente dal mandato e non modificato.
- Il confine e' verificato anche in codice: `12:59` e' mattina, `13:00` e'
  pomeriggio, `19:00` e' fuori dalle due fasce.

## Integrita e pulizia

- Baseline demo: 7 pet, 8 appuntamenti, 0 richieste, capienza 2.
- Fixture GH-39 finali: 0 appuntamenti, 0 richieste.
- Baseline finale: 8 appuntamenti, 0 richieste.
- Sonda finale: 0 utenti Auth, 0 identity, 0 profili, 0 membership.
- Fixture della suite RLS: 0 residui secondo il teardown interno.
- Nessun dato reale e' stato modificato; nessun segreto e' entrato nei file o
  nel commit.

## Verifiche eseguite

- Controlli puri su carico, annullati, pending, esclusione dettaglio, confine
  delle fasce e predefiniti: `15 PASS`.
- Suite RLS demo: `30 PASS, 0 FAIL, 1 SKIP` previsto per secondo tenant
  assente.
- `npm run build`: PASS, Vite 5.4.21, 153 moduli trasformati, bundle JS
  669.01 kB (gzip 189.19 kB).
- `git diff --check`: PASS.
- Browser staff desktop e mobile: PASS, nessuna sovrapposizione.
- Browser customer reale Mario: PASS, nessun avviso di carico.
- `npm run lint`: non eseguibile nella base, `eslint: command not found`.
- Warning build non bloccanti e preesistenti: Browserslist datato e bundle
  principale sopra 500 kB.

## Eccezioni e fuori istruzione

- Il primo avvio locale della suite RLS non ha raggiunto il dominio demo per
  il DNS isolato della sandbox. La stessa suite e' stata rieseguita con rete
  autorizzata ed e' passata; il tentativo fallito non ha creato fixture.
- Il primo comando di prova pura e' stato interpolato dalla shell e non e'
  partito. L'import ESM interno e' stato poi reso esplicito con estensione
  `.js`; il controllo definitivo e' passato 15/15.
- `CustomerPortal.jsx` non e' stato aggiornato. Le sue vecchie fasce restano
  una testimonianza del portale legacy, non una seconda definizione attiva.
- Nessuna attivita e' stata eseguita sulla produzione. Nessuna azione fuori
  dal perimetro applicativo.

## Passo umano di Luigi

Dopo il rilascio, collocare due cani nella stessa mattina e leggere l'avviso al
secondo. Provare poi il terzo nella stessa sovrapposizione: al posto della nota
deve comparire soltanto il rifiuto di capienza. La domanda da farsi e': il
passaggio fra informazione e impedimento e' immediatamente comprensibile?

## Commit

Commit locale della consegna con messaggio
`feat: add GH-39 booking load notice`. Nessun push eseguito.
