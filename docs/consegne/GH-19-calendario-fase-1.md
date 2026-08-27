# Consegna GH-19 - Calendario, inventario funzionale e confronto

**Stato:** Fase 1 completata; fermata obbligatoria applicata.
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
**Branch:** `feat/customer-app`
**Base Git:** `e4374e396c6854ba68e32cd4471b0354902a5919`
**Perimetro:** sola lettura del codice e degli handoff; nessun database,
migration, deploy o push.

## Fonti lette

- `design_handoff_staff_app/cd01-calendario/CD-01-handoff.md` e i tre file
  `cd01-cal-*.jsx`;
- `docs/incarichi/CD-01-verifica-schema-campi-dubbi.md`;
- `design_handoff_staff_app/GH-15-handoff.md`;
- `src/apps/staff/pages/Calendar.jsx`;
- `src/apps/staff/pages/CustomerRequests.jsx`;
- `src/apps/staff/lib/database.js` e `src/apps/staff/lib/whatsapp.js`;
- migration GH-08 gia' versionata, letta soltanto per confermare il contratto
  della RPC `resolve_appointment_request`.

Non e' stata ripetuta la ricognizione Cowork sul database. I numeri storici
del mandato (17 appuntamenti, 464 visite) sono assunti come misura fornita.

## Sintesi

La composizione CD copre bene il nuovo asse principale: tre oggetti distinti,
settimana a righe sul banco, un giorno sul telefono, coda richieste e conferma
in modale. Non puo' pero' sostituire letteralmente il componente corrente:
nelle 1.572 righe esistono funzioni operative non rappresentate, in particolare
creazione manuale, controllo conflitti, riprogrammazione, stati finali,
promemoria WhatsApp ed esportazione calendario.

La transizione consigliata e': adottare grammatica e struttura CD; integrare
la coda oggi su `/requests`; conservare le funzioni operative in modali
secondarie; eliminare solo cio' che dipende dalla vecchia griglia o puo'
creare divergenza tra WhatsApp e dato persistito.

## 1. Inventario funzionale corrente

| # | Funzione corrente | Dove e cosa fa | Dati letti o scritti | Esito rispetto a CD |
|---:|---|---|---|---|
| 1 | Caricamento | All'ingresso e al cambio intervallo carica pet e appuntamenti, con loading/error | `pets` con customer/visite; `appointments` nel range | **coperta**; servira' un caricatore settimanale aggregato |
| 2 | Apertura dal cliente | `?clientId=` preseleziona il pet e porta al form | nessuna scrittura | **non coperta, da conservare**: ponte usato da scheda e card cliente |
| 3 | Creazione manuale | Pet, data, ora, durata e note; crea un appuntamento operatore approvato | INSERT `appointments` | **non coperta, da conservare** per telefono, WhatsApp e clienti senza area customer |
| 4 | Conflitto in creazione | Blocca intervalli sovrapposti | calcolo sui dati caricati | **non coperta, da conservare** |
| 5 | Prossimo orario libero | Dopo il salvataggio avanza al primo slot libero, a passi di 15 minuti | nessuna scrittura ulteriore | **non coperta, da conservare** se resta la creazione manuale |
| 6 | WhatsApp dal draft | Prepara una proposta prima che l'appuntamento sia registrato | apre `wa.me` | **non coperta, da lasciare cadere**: puo' creare una promessa senza record |
| 7 | Filtro Dal/Al | Ricerca intervallo arbitrario, inizialmente oggi + 14 giorni | SELECT `appointments` | **non coperta, da lasciare cadere** nella forma corrente; sostituire con settimana + vai a data |
| 8 | Vista elenco | Raggruppa card per giorno | nessuna scrittura | **non coperta, da lasciare cadere**: assorbita dalla settimana CD |
| 9 | Griglia 08-20 | Sette colonne, blocchi dimensionati sulla durata | nessuna scrittura | **non coperta, da lasciare cadere** come motivato da CD |
| 10 | Navigazione settimana | Prima, dopo e ritorno alla corrente | ricarica SELECT | **coperta** da `CalNav` |
| 11 | Conflitti esistenti | Avviso globale e marcatura delle sovrapposizioni | calcolo locale | **non coperta, da conservare** anche per dati storici incoerenti |
| 12 | Card appuntamento | Intervallo, pet, proprietario, stato, durata, note, blacklist e conflitto | appointment/pet/customer | **coperta in parte**; dettaglio e segnali vanno nella modale |
| 13 | Apertura accessibile | Click, Invio o Spazio aprono il dettaglio | nessuna scrittura | **coperta** dal gesto sulla riga; va definita la destinazione per tipo |
| 14 | Riprogrammazione | Cambia data, ora e durata, bloccando conflitti | UPDATE `appointments` | **non coperta, da conservare** nella modale confermato |
| 15 | Trascinamento | Sposta nella griglia a scatti di 15 minuti | UPDATE `appointments` | **non coperta, da lasciare cadere**: dipende dalla griglia ed e' assente su telefono/tastiera |
| 16 | Promemoria WhatsApp | Prepara promemoria con pet e data/ora | apre `wa.me`, nessuna traccia | **non coperta, da conservare** nel dettaglio |
| 17 | Export calendario | Google Calendar o download `.ics` Apple/iCloud | nessuna scrittura DB | **non coperta, da conservare** nel dettaglio |
| 18 | Approva legacy | Approva un appointment pending e apre WhatsApp | UPDATE `appointments`; `wa.me` | **coperta** dalla conferma CD, ma non copre GH-08 |
| 19 | Rifiuta legacy | Imposta rejected/cancelled e chiede un'altra fascia | UPDATE `appointments`; `wa.me` | **coperta** dalla coda/modale CD |
| 20 | Coda GH-08 | Oggi su `/requests`: bisogno, manto, eta', scelta giorno/ora | SELECT `appointment_requests`; RPC | **coperta**; va integrata riusando l'API esistente |
| 21 | Completato | Marca l'appuntamento concluso | UPDATE `appointments.status` | **non coperta, da conservare**: non equivale a una visita |
| 22 | No-show | Marca il no-show e corregge il punteggio del pet anche nel ritorno | UPDATE appointment + pet | **non coperta, da conservare** |
| 23 | Annullamento | Mantiene il record come cancelled | UPDATE `appointments.status` | **non coperta, da conservare** |
| 24 | Delete definitivo | Conferma browser e cancella | DELETE `appointments` | **non coperta, da lasciare cadere**: perde storia e puo' spezzare il legame GH-08 |
| 25 | Apri cliente | Porta a `/client/:petId` | nessuna scrittura | **non coperta, da conservare** |
| 26 | Nuovo per lo stesso cliente | Riapre calendario con pet preselezionato | nessuna scrittura | **non coperta, da conservare** con il punto 2 |
| 27 | Busy e feedback | Disabilita create/update e mostra successo/errore | nessuna scrittura ulteriore | **coperta in parte**: skeleton non sostituisce feedback di mutazione |
| 28 | Settimana vuota | Oggi una frase per l'intero intervallo | nessuna scrittura | **coperta** e migliorata da CD con i sette giorni visibili |
| 29 | Imminente | Evidenzia scheduled entro 24 ore | calcolo locale | **non coperta, da conservare** come segnale non invasivo |
| 30 | Guardia demo | Le API di scrittura chiamano `assertDemoWriteAllowed` | guardia applicativa | **non coperta, da conservare** nell'API, non nella UI |

### Stati realmente presenti

| Asse | Valori | Nota esecutiva |
|---|---|---|
| Appuntamento | `scheduled`, `completed`, `cancelled`, `no_show` | CD non rappresenta esplicitamente completato e annullato: non vanno persi |
| Approvazione legacy | `pending`, `approved`, `rejected` | rejected e' escluso dalla lettura corrente |
| Richiesta GH-08 | `pending`, `approved`, `rejected` | la RPC crea atomicamente l'appuntamento quando approva |
| Segnali derivati | imminente, conflitto, blacklist/rischio | non sono nuovi stati DB |
| UI | loading, vuoto, errore, successo, saving/updating | tutti necessari |

## 2. Letture e scritture da preservare

| Operazione | API corrente | Effetto |
|---|---|---|
| Pet | `getAllPets()` | legge pet, customer e tutte le visite |
| Appuntamenti | `getAppointments({from,to,includePending:true})` | legge il range; esclude rejected salvo opzione |
| Coda | `getPendingAppointmentRequests()` | unisce richieste GH-08 e legacy |
| Risoluzione GH-08 | `resolveAppointmentRequest()` | RPC atomica: risolve e, se approved, crea appointment con ora/durata servizio |
| Crea manuale | `addAppointment()` | inserisce `operator/approved` |
| Sposta | `updateAppointmentSchedule()` | aggiorna ora e durata |
| Stato | `updateAppointmentStatus()` | aggiorna stato e no-show score |
| Approva legacy | `updateAppointmentApproval()` | aggiorna approval e riallinea cancelled/scheduled |
| Elimina | `deleteAppointment()` | delete fisico, proposto fuori dalla nuova UI |
| Visite settimanali | nessuna API dedicata | oggi arrivano annidate in tutti i pet; serve query per range, senza migration |

Per la fase esecutiva raccomando una funzione di lettura calendario che
componga in parallelo appuntamenti, richieste pendenti e visite della sola
settimana. Riutilizzare `getAllPets()` per tutte le visite funzionerebbe ma
scala male e confonde direttorio e calendario. Lo schema attuale basta.

## 3. Conferma degli undici campi

La verifica Cowork e il codice concordano. Nessuna divergenza.

| Campo CD | Conferma dal codice versionato |
|---|---|
| richieste | `appointment_requests` e relativa API esistono |
| fascia | `time_preference`: morning/afternoon/flexible |
| manto | `coat_condition_codes text[]` con cinque codici |
| nota manto | `coat_condition_notes` |
| eta' | `declared_pet_age text` |
| stato richiesta | pending/approved/rejected |
| richiesta -> appuntamento | `appointment_id` unique, valorizzato dalla RPC |
| ora appuntamento | `scheduled_at timestamptz`, usato in lettura/update/export |
| costo visita | `visits.cost numeric`, gia' nel select staff |
| traccia invio | **assente**; si costruisce solo un URL `wa.me` |
| promozioni | tabella vuota secondo Cowork; fuori dal calendario |

`visits.date` resta `date`: nessuna ora puo' essere mostrata o dedotta. Non
esiste un legame tra visite e appuntamenti, quindi non si possono fondere due
righe dello stesso pet/giorno. Non esiste `visit.operator`: "Chi lavora" va
rimosso senza sostituti.

## 4. Scostamenti compositivi

| Area | Esito | Contratto proposto |
|---|---|---|
| Tre oggetti | **allineare** | richiesta, confermato e registrato con le tre forme CD |
| Banco | **allineare** | settimana a righe + spalla 1fr/380 px |
| Telefono | **allineare** | un giorno per volta sotto 640 px |
| Elenco corrente | **allineare** | assorbito dalla nuova settimana, senza toggle |
| Stati | **tenere** | aggiungere al dettaglio completato e annullato |
| Conflitti | **tenere** | controllo e blocco in ogni scelta ora |
| Responsive | **allineare** | breakpoint 640, riga 60 e target >=44 px |
| Modale richiesta | **allineare** | usare RPC GH-08; niente operatore o invio fittizio |
| Modale appuntamento | **decisione a Luigi** | serve per riprogrammare, stati, promemoria, export e cliente |
| Riga lavorazione | **allineare** | giorno, testo verbatim e costo; nessuna ora/durata/operatore |
| Click lavorazione | **decisione a Luigi** | raccomandato aprire scheda pet |
| Coda | **allineare** | structured + legacy, con API esistente |
| Chiusura settimana | **allineare** | registrate/confermate/in attesa; link report, niente incassi duplicati |
| Navigazione | **decisione a Luigi** | frecce, corrente e raccomandato "Vai a data" |
| Vuoto | **allineare** | sette giorni visibili; vuoto del singolo giorno su mobile |
| Loading | **allineare** | `SkeletonRow`, non testo/spinner |
| Errore | **allineare** | distinguere errore dati da WhatsApp non preparabile |
| WhatsApp | **decisione a Luigi** | salva, poi apre testo modificabile; nessun `sent_at` |
| Promozioni | **tenere fuori** | gia' fissato dal mandato |

## 5. Decisioni richieste a Luigi

Le raccomandazioni non sono state applicate.

1. **Creazione manuale.** Raccomandata come azione secondaria "Nuovo
   appuntamento" in modale compatta, non come form permanente. Serve per
   telefono/WhatsApp e mantiene `?clientId=`. Eliminarla obbligherebbe a creare
   una richiesta customer fittizia.
2. **Griglia, elenco e drag.** Raccomandata la rimozione. La settimana CD
   assorbe la lettura; la riprogrammazione resta esplicita nella modale.
3. **Destinazione delle righe.** Richiesta -> conferma; appuntamento -> gestione;
   lavorazione -> scheda pet. Nessuna route nuova.
4. **Delete.** Raccomandato rimuoverlo dalla UI e usare "Annulla". Se resta,
   va secondario e richiede una controprova sul legame GH-08.
5. **Conflitti.** Conservarli in conferma, creazione e riprogrammazione, usando
   token esistenti. Rischio residuo: il controllo client-side non blocca due
   scritture concorrenti; un vincolo DB richiederebbe mandato separato.
6. **WhatsApp.** Raccomandata l'etichetta "Conferma e prepara WhatsApp": la RPC
   salva prima, poi apre `wa.me`, e l'invio non e' verificabile. Se manca il
   telefono: richiesta confermata, messaggio non preparabile. Rimuovere "Solo
   salva l'ora", che duplica l'esito dati senza garantire l'esito esterno.
7. **Rifiuto.** Adottare il testo standard gia' presente: fascia non
   disponibile, scegliere un'altra fascia nell'area cliente o scrivere qui.
   Resta modificabile in WhatsApp.
8. **WhatsApp dal draft.** Rimuoverlo: prima si persiste, poi si comunica dal
   record reale, evitando due verita' parallele.
9. **Storico.** Frecce, "Questa settimana" e "Vai a data" verso la settimana
   contenente il giorno; nessun limite arbitrario e nessun Dal/Al permanente.
10. **Appuntamento + visita nello stesso giorno.** Mostrarli distinti, senza
    deduplica, nell'ordine CD: da decidere, deciso, gia' accaduto.
11. **Google/Apple.** Conservare export come azione secondaria nel dettaglio.
12. **Route `/requests`.** Calendario come punto operativo; route mantenuta
    temporaneamente come compatibilita' finche' dashboard e link sono migrati.

## 6. Domande CD chiuse dalla misura

1. Promozioni: fuori, tabella vuota secondo Cowork.
2. Invio: apre WhatsApp, senza traccia o verifica.
3. Visita/appuntamento: nessun legame, nessuna fusione.
4. Rifiuto: testo standard gia' in `whatsapp.js`.
5. Storico: tecnicamente illimitato; resta la decisione 9 sull'interazione.
6. Chi lavora: dato assente, campo rimosso.

## File della consegna

| File | Tipo | Motivo |
|---|---|---|
| `docs/consegne/GH-19-calendario-fase-1.md` | nuovo | inventario e contratto decisionale GH-19 |

Le modifiche parallele a `scripts/salva.sh` e
`docs/consegne/README.md`, attribuite a Cowork e autorizzate da Luigi, non
sono state modificate o incluse nel commit GH-19.

## Verifiche ed eccezioni

- root e branch conformi;
- GH-18 presente e chiuso (`f16f854`);
- divergenza sugli undici campi: nessuna;
- inventario da sorgenti, senza avvio app e senza database;
- migration, seed, deploy e push: non eseguiti;
- file applicativi modificati: nessuno;
- Fase 2 non iniziata.

Eccezioni: nessuna. Fuori istruzione: nessuna.
