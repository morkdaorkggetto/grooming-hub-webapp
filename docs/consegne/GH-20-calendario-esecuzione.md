# Consegna GH-20 - Calendario, esecuzione

**Stato:** completato.
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
**Branch:** `feat/customer-app`
**Base Git:** `b1be861d9eacd9029f332fdb1a3e82651b37dee8`
**Commit applicativo:** `f09f3b47dd9186a34bf1bda740d7b557d4b513f5`
(`feat: rebuild staff calendar workflow`).
**Database usato:** solo demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`), stato iniziale `ACTIVE_HEALTHY`.
**Produzione e progetto temporaneo:** non interrogati e non modificati.
**Migration, deploy e push:** non eseguiti.

## Esito

Il vecchio calendario e' stato sostituito dalla composizione settimanale CD-01:
richieste, appuntamenti e lavorazioni conservano tre forme distinte; la coda
richieste resta visibile; il dettaglio operativo raccoglie le azioni che non
appartengono alla lettura della settimana. Sotto i 640 px viene mostrato un
giorno alla volta.

La lettura non carica piu' tutti i pet con tutto lo storico visite. La nuova
query aggrega soltanto la settimana visibile:

- appuntamenti approvati, compresi `completed`, `cancelled` e `no_show`;
- richieste strutturate GH-08 ancora pendenti;
- richieste customer legacy ancora pendenti;
- lavorazioni comprese tra il primo e l'ultimo giorno della settimana.

L'elenco leggero dei pet viene caricato solo quando serve una creazione
manuale o una nuova lavorazione.

## File della consegna

| File | Tipo | Motivo GH-20 |
|---|---|---|
| `src/apps/staff/lib/database.js` | modificato | query della sola settimana visibile e opzioni pet leggere |
| `src/apps/staff/lib/whatsapp.js` | modificato | messaggio di esito separato dalla URL; rimosso helper draft senza consumer |
| `src/apps/staff/pages/Calendar.jsx` | riscritto | calendario CD-01, coda, modali operative e flussi conservati |
| `src/apps/staff/pages/Calendar.css` | nuovo | resa desktop/tablet/mobile con un solo breakpoint a 640 px |
| `src/apps/staff/components/CalendarKit.jsx` | nuovo | righe, giorni, navigazione, coda, riepilogo e loading |
| `docs/consegne/GH-20-calendario-esecuzione.md` | nuovo | registro unico della consegna |

La modifica parallela a `scripts/salva.sh`, attribuita a Cowork e gia'
presente all'ingresso, non e' stata modificata, messa in stage o inclusa nei
commit GH-20.

## Contratto anti-regressione

| Funzione che deve sopravvivere | Controprova misurata | Esito |
|---|---|---|
| Apertura da `?clientId=` | URL con UUID Pepe ha aperto la modale e preselezionato `Pepe - Mario Rossi` | PASS |
| Creazione manuale | appuntamento `[DEMO GH-20] manuale anti-regressione` creato alle 09:00 dalla UI | PASS |
| Conflitto in creazione | rientro sullo stesso giorno/ora: avviso `Conflitto con Pepe, 09:00-10:00` e salvataggio disabilitato | PASS |
| Prossimo orario libero | dopo la creazione il campo ora e' avanzato automaticamente da 09:00 a 10:00 | PASS |
| Avviso conflitti esistenti | record occupato riletto nella settimana e riconosciuto dal form | PASS |
| Riprogrammazione | durata cambiata da 60 a 75 minuti e riletta dal database | PASS |
| Promemoria WhatsApp | azione presente nel dettaglio e URL costruita dal record persistito; nessun `wa.me` aperto nelle prove | PASS senza invio esterno |
| Export calendario | azioni Google e Apple presenti nel dettaglio; URL Google e payload ICS costruiti dal record | PASS senza apertura esterna |
| Stato completato | gesto UI, feedback `Stato aggiornato: Completato` e dettaglio aggiornato | PASS |
| No-show con punteggio | gesto UI, stato `No-show`, poi ripristino; `no_show_score` finale identico alla baseline `0` | PASS |
| Annullamento | gesto UI ha portato il record a `Annullato`, senza delete; poi ripristino | PASS |
| Apri cliente | gesto UI ha aperto `/client/869bf0fc-9a09-4254-8a98-6220f96383e0` | PASS |
| Nuovo stesso cliente | gesto UI ha riaperto la creazione con Pepe preselezionato | PASS |
| Evidenza imminente | appuntamento del giorno mostrato con tag `Imminente` | PASS |
| Guardia demo | `DEMO_MODE` e `assertDemoWriteAllowed` restano nel percorso di ogni scrittura | PASS da codice; locale live volutamente scrivibile |

Il controllo dei conflitti resta client-side, come accettato nel mandato, e
non elimina il rischio di due scritture simultanee.

## Superfici rimosse

La scansione del codice e la navigazione della pagina confermano che non sono
piu' raggiungibili:

- WhatsApp da appuntamento non ancora persistito;
- filtro permanente `Dal/Al`;
- vista elenco separata;
- griglia oraria 08-20;
- trascinamento;
- cancellazione fisica dell'appuntamento.

L'helper `getDraftAppointmentWhatsAppUrl`, rimasto senza consumer dopo la
riscrittura, e' stato rimosso dal modulo condiviso.

## Ciclo richiesta customer sul demo

Controprova completa eseguita con la fixture Mario e la sonda staff GH-04:

1. login customer Mario;
2. richiesta per Pepe, servizio Bagno, data 28 agosto 2026, fascia mattina,
   marker `[DEMO GH-20] ciclo calendario`;
3. comparsa nel calendario staff come capsula tratteggiata e nella coda;
4. conferma alle 09:00 dalla modale GH-20;
5. trasformazione in appuntamento approvato e scomparsa dalla coda;
6. cancellazione guardata della richiesta e dell'appuntamento di prova.

Per impedire l'apertura accidentale di WhatsApp, durante la sola conferma il
telefono della fixture e' stato sostituito con un valore non componibile e
subito ripristinato al valore originale. La verifica finale ha confermato il
ripristino. Nessun numero, password, token o secret e' riportato nel registro.

Il ramo di errore ha mostrato correttamente: richiesta confermata, messaggio
non preparabile per telefono mancante. Il dato viene quindi salvato prima del
tentativo di comunicazione.

## Controprova manuale e pulizia

La sonda staff e' stata ricreata con il seed idempotente gia' versionato
`supabase/seeds/gh-04-staff-probe-demo.sql`, senza modificare account staff o
customer reali. Sul record manuale marcato sono stati provati creazione,
prossimo slot, conflitto, dettaglio, completato, no-show, annullamento,
ripristino, scheda cliente, stesso cliente e riprogrammazione.

La pulizia finale guardata ha misurato:

| Controllo finale demo | Righe / valore |
|---|---:|
| appuntamenti con marker GH-20 | 0 |
| richieste con marker GH-20 | 0 |
| `auth.users` sonda | 0 |
| `public.profiles` sonda | 0 |
| `public.tenant_memberships` sonda | 0 |
| `no_show_score` della fixture usata | 0, identico alla baseline |

Il tentativo eseguito dopo un primo teardown ha ricevuto correttamente
`Utente non autenticato` e non ha creato righe (`conflict probe` = 0). La
sonda e' stata poi ricreata solo per completare la controprova manuale e
smontata nuovamente.

## Responsive e accessibilita'

| Viewport | Overflow orizzontale | Misura principale | Esito |
|---|---:|---|---|
| 1440 px | 0 | calendario e colonna laterale 746/380 px | PASS |
| 768 px | 0 | colonne 334/380 px; navigazione su due righe senza tagli | PASS |
| 390 px | 0 | un solo giorno visibile; aside nascosta; FAB 56 x 56 px | PASS |

Sotto i 640 px i controlli visibili sotto 44 px sono `0`. Il CSS contiene un
solo `@media (max-width: 640px)`, nessun colore letterale e nessuna seconda
soglia responsive. I numeri usano cifre tabulari; il testo delle lavorazioni
resta verbatim e non viene dedotta alcuna ora.

## Misure prima e dopo

| Misura | Prima | Dopo |
|---|---:|---:|
| `Calendar.jsx` | 1.572 righe | 476 righe |
| stili inline nella pagina | 101 | 0 |
| componenti calendario dedicati | 0 | 185 righe in `CalendarKit.jsx` |
| foglio stile dedicato | 0 | 597 righe in `Calendar.css` |

## Verifiche finali

- `npm run build`: PASS;
- `git diff --check`: PASS;
- scansione superfici rimosse: PASS;
- scansione colori letterali: PASS;
- scansione breakpoint: PASS, uno solo a 640 px;
- caricamento e flusso staff locale: PASS;
- ciclo customer -> richiesta -> conferma -> appuntamento: PASS;
- ciclo manuale e stati: PASS;
- pulizia marker e sonda: PASS;
- errori applicativi console durante il calendario autenticato: 0; presenti
  soltanto gli avvisi di futura compatibilita' di React Router.

`npm run lint` non e' eseguibile nella baseline: lo script richiama `eslint`,
ma `eslint` non e' presente nelle dipendenze del progetto. Non sono state
aggiunte dipendenze o modificati `package.json`/lockfile fuori mandato.

## Note aperte ed eccezioni

I quattro messaggi automatici - proposta, promemoria, conferma e rifiuto -
attendono ancora le parole definitive del salone. Il rifiuto usa per ora il
testo standard deciso in GH-20. Questa consegna non inventa una traccia di
invio: prepara soltanto un messaggio modificabile dopo la persistenza.

Google Calendar, download ICS e WhatsApp non sono stati realmente aperti per
evitare effetti esterni non necessari; la controprova si e' fermata ai
controlli visibili e alla costruzione deterministica dei rispettivi payload.

Fuori istruzione: nessuna modifica applicativa. La sola modifica parallela
preesistente `scripts/salva.sh` resta esclusa. Nessun push eseguito.
