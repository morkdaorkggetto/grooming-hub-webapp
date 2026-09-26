# GH-100 - Dove si perde un appuntamento: esito

## Esito

L'indagine ha trovato **cinque famiglie** distinte. Due punti ciechi sono
particolarmente compatibili con la percezione «l'ho salvato»:

1. nel selettore pet, **scrivere un nome non equivale a selezionarlo**; il
   pulsante resta disabilitato e non spiega il motivo;
2. durante il salvataggio il pulsante mostra `…`, ma il modale si può ancora
   chiudere. L'esito che arriva dopo la chiusura non viene mostrato e, se la
   data è fuori settimana, la ricerca resta vecchia fino al ricaricamento.

È emersa inoltre una quinta famiglia ad alto impatto: eliminare la scheda del
pet cancella a cascata anche tutti i suoi appuntamenti. Il testo di conferma
nomina «cliente e tutte le sue visite», non gli appuntamenti.

Non esiste oggi una traccia durevole del tentativo di salvataggio, dell'errore
o della cancellazione. Perciò nessuna delle tre vicende reali può essere
attribuita con certezza a una singola strada.

## Base e perimetro

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `4dcd7ba67d98cbc0d87ac1fbef58407e74adcfd4`.
- Produzione `azgehoseiojodltcttfb`: **non letta e non scritta**.
- Demo ammesso: `grooming-hub-demo`, ref `qttpinkslhenxrsbhhhg`, solo lettura.
- Nessun file sotto `src/`, migrazione, configurazione o dipendenza modificato.
- Nessun push, merge o deploy.
- Il percorso customer/request è presente nel codice ma **non è attivo per il
  pubblico**: per indicazione di Luigi è escluso come causa dei casi reali.

Il progetto demo è risultato `ACTIVE_HEALTHY`. Due interrogazioni SQL di sola
lettura tramite il collegamento Supabase hanno però restituito
`password authentication failed for user "postgres"`; non sono state
ritentate e non sono stati cambiati collegamenti o credenziali. Tutte le prove
funzionali sono quindi state eseguite nel browser contro componenti reali e
dati esclusivamente in memoria: **0 letture dati di produzione, 0 scritture
Supabase, 0 fixture da smontare**.

## File della consegna

| File | Atto |
|---|---|
| `docs/consegne/GH-100-dove-si-perde-un-appuntamento-esito.md` | Registro dell'indagine |
| `docs/consegne/evidenze/GH-100/browser-check.mjs` | Banco Vite/Chromium con Supabase simulato solo in memoria |
| `docs/consegne/evidenze/GH-100/browser.json` | Esiti strutturati, testi e misure |
| `docs/consegne/evidenze/GH-100/disabled-unselected-375.png` | Nome digitato, nessun pet selezionato, salvataggio muto |
| `docs/consegne/evidenze/GH-100/delete-confirmation-375.png` | Conferma della cancellazione definitiva |
| `docs/consegne/evidenze/GH-100/closed-day-week-1365.png` | Appuntamento fuori fascia nascosto nella settimana chiusa |

Fuori da modifiche, stage e commit: il mandato GH-100 e tutti i file
preesistenti indicati da Luigi (`controlli-salone/`, `CD-09-consegna/`,
`grooming HUB.zip`, i mandati CD-09/GH-99, `nomi-da-recuperare/` e
`qr-gadget/`).

## 1. Il salvataggio non parte

Il pulsante del modale è disabilitato da
`src/apps/staff/pages/Calendar.jsx:977` e da `Button.jsx:66-84` nelle seguenti
condizioni esaustive.

| Condizione | Stato | Cosa vede l'operatore | Prova |
|---|---|---|---|
| Nome digitato ma pet non scelto: `!manualForm.clientId` | **osservato** | **niente**; il pulsante è spento, nessun alert e 0 insert | `CalendarKit.jsx:286-290` azzera l'id a ogni battuta; screenshot e JSON |
| Creazione di un nuovo pet ancora aperta: `manualPetCreation` | **osservato** | `Nuovo pet` e `Crea e seleziona il pet`; motivo comprensibile | browser |
| Capienza esaurita: `manualConflict` | **osservato** | `Le postazioni sono tutte occupate nella fascia scelta.` | browser |
| Richiesta già in corso: `saving`/`loading` | **osservato** | solo `…`; Salva è spento, ma `Chiudi` in testata, `Chiudi` nel piede e lo sfondo restano attivi | `Button.jsx:66-84`, `Modal.jsx:15-31`, browser |

Data o ora vuote **non** disabilitano il pulsante. Il tocco entra in
`submitManual` (`Calendar.jsx:750-753`) e mostra nel modale:
`Pet, data e ora sono obbligatori.` È quindi un errore visibile, non una strada
muta.

Altre interruzioni:

- **osservato in GH-98, confermato nel codice**: dopo aver creato un pet, si
  può chiudere senza salvare; compare
  `Pet creato. L’appuntamento non è stato salvato.`
  (`Calendar.jsx:276-283`). Il pet resta e l'appuntamento non nasce;
- **osservato**: chiudendo il modale durante l'attesa, l'insert può concludersi
  ma il successivo successo/errore viene scritto nello stato del modale ormai
  assente. La riga fuori settimana non compare nella ricerca fino al reload;
- **possibile, non riprodotto**: chiusura della pagina o perdita completa del
  processo prima che la richiesta raggiunga il server. Non esiste un evento
  `attempt_started` con cui distinguerla da un mancato tocco;
- **possibile, non riprodotto**: creazione del pet confermata dal database ma
  risposta persa prima di `selectCreatedPet`; resta un pet senza id selezionato
  e quindi senza appuntamento.

## 2. Il salvataggio parte e fallisce

Percorso completo: `Calendar.jsx:750-770` -> `database.js:1106-1125`.
`GH-93` copre l'intero `try`: ogni eccezione sincrona o asincrona arriva nel
`role="alert"` interno al modale (`Calendar.jsx:1060-1061`), **purché il modale
sia ancora aperto**.

| Punto | Stato | Testo misurato o prodotto |
|---|---|---|
| Sessione assente | **possibile, coperto** | `Utente non autenticato` (`database.js:249-255`) |
| JWT/sessione scaduta durante membership | **osservato** | `JWT expired`; visibile, non somiglia a un successo, ma è tecnico |
| Nessuna membership staff | **possibile, coperto** | `Accesso negato: membership non disponibile` |
| Pet non più leggibile, RLS o rete durante rilettura | **possibile, coperto** | messaggio Supabase nel modale |
| Dati invalidi | **osservato/coperto** | `Pet, data e ora sono obbligatori.`, stato non valido o assenza non ammessa |
| Capienza cambiata dopo il controllo UI | **possibile, coperto** | il trigger DB viene tradotto in `Le postazioni sono tutte occupate nella fascia scelta.` (`database.js:124-131`) |
| Constraint, RLS o errore insert | **possibile, coperto** | `Non riesco a creare l'appuntamento: <messaggio>` |
| Collegamento interrotto prima del commit | **osservato** | `Non riesco a creare l'appuntamento: collegamento interrotto`; riga assente |
| Risposta persa dopo il commit | **osservato** | stesso aspetto di errore, ma la riga esiste: esito ambiguo senza idempotenza |

**Escluso**: nel percorso manuale non esiste un errore intercettato che venga
trasformato in un messaggio di successo. Il difetto residuo non è la copertura
di `GH-93`, ma la possibilità di chiudere il contenitore che dovrebbe mostrare
il messaggio.

## 3. La riga esiste e poi sparisce

### Cancellazione diretta dell'appuntamento

**Osservato.** Dal planner servono tre tocchi:

1. scheda dell'appuntamento;
2. `Elimina`, 41 px sotto il gruppo con `Annulla appuntamento`;
3. `Elimina definitivamente` nel secondo modale.

La conferma dice:
`Sparisce del tutto. Se invece il cliente ha disdetto, usa «Annulla appuntamento»: resta come fatto.`

Il comando non è un bersaglio adiacente a un normale salvataggio e un singolo
tocco accidentale non basta. Tuttavia l'RPC
`delete_staff_appointment` cancella davvero la riga
(`20260901060131_gh58_delete_staff_appointment.sql:69-70`). Sono protetti
completati, assenze, origine/richiesta cliente e visite collegate; un
`scheduled` o `cancelled` di origine operatore senza visita viene eliminato e
non lascia audit.

### Cancellazione della scheda pet

**Possibile, non riprodotta sul demo.** `ClientDetail.jsx:534-554` espone
`Elimina` accanto a `Modifica`, `Appuntamento`, `WhatsApp` e `QR Card`.
Seguono un solo `window.confirm` e la cancellazione del pet
(`ClientDetail.jsx:302-309`, `database.js:929-935`). La FK
`appointments.pet_id` è `ON DELETE CASCADE`
(`20260424120000_split_clients_with_backfill.sql:440-445`): spariscono tutti
gli appuntamenti del pet, aggirando le guardie GH-58. La domanda
`Eliminerai il cliente e tutte le sue visite` non nomina gli appuntamenti.

### Altri percorsi

- **possibile solo amministrativamente**: la FK storica `appointments.user_id`
  è `ON DELETE CASCADE`; eliminare l'utente Auth che ha creato le righe può
  eliminarle. Non esiste nell'app un comando che cancelli l'account staff;
- **escluso nel codice applicativo**: nessun job, scadenza o altra
  `.delete()` automatica sugli appuntamenti; l'unica cancellazione diretta
  dell'app passa dall'RPC GH-58;
- annullare, rifiutare o segnare assenza cambia stato: non cancella la riga.

## 4. La riga esiste ma non si vede

| Strada | Stato | Settimana | Giorno | Operatività giornaliera |
|---|---|---|---|---|
| Data sbagliata/fuori settimana | **osservato** | non nella settimana aperta; ricercabile dopo indice | raggiungibile navigando | visibile scegliendo la data |
| Riga appena salvata fuori settimana e modale chiuso durante l'attesa | **osservato** | ricerca vecchia: `Nessun appuntamento aperto trovato.`; dopo reload: `1 corrispondenza nelle altre settimane.` | dopo navigazione/reload | dopo scelta data |
| Appuntamento passato ancora `scheduled` | **escluso come invisibilità stabile** | coda GH-98 con data e visita/non visita | navigabile | visibile sulla data |
| Errore dell'indice globale | **possibile** | coda passata assente; l'errore appare solo dopo una ricerca testuale | settimana corrente resta | non dipende dall'indice |
| Errore dell'indice visite | **possibile** | coda passata trattenuta, con alert esplicito | settimana corrente resta | non dipende dall'indice |
| Giorno interamente chiuso, unica riga fuori dalle fasce 09-19 | **osservato** | **nascosta** dietro `chiuso` | visibile in `Da collocare` | visibile |
| Giorno chiuso con almeno una riga in fascia | **osservato** | righe in fascia e fuori fascia visibili; etichetta `fuori orario` | visibili | visibili |
| Due pet omonimi e stessa razza | **osservato** | schede indistinguibili: 0 nomi proprietario | proprietario visibile solo aprendo | proprietario visibile |
| `cancelled` | **osservato/escluso** | conteggio apribile nel piede | scheda `Annullato` | gruppo `Annullato` |
| `completed` e `no_show` | **osservato/escluso** | schede con stato | schede con stato | gruppi `Completato`/`Assenza` |
| Origine operatore | **escluso** | nessun filtro per origine | nessun filtro | etichetta `Inserito operatore` |

Il residuo «giorno chiuso + unica riga fuori fascia» è la stessa famiglia di
`GH-55` ma non lo stesso caso: `CalendarPlanningWeek` decide di mostrare il
giorno solo se una **fascia** contiene dati (`CalendarKit.jsx:438-452`), mentre
`UnplacedItems` è renderizzato soltanto nel ramo già aperto. Il giorno singolo
lo rende sempre (`CalendarKit.jsx:465-478`).

Il planner carica ogni stato della settimana (`database.js:1177-1184`) e
separa attivi/annullati in `Calendar.jsx:423-461`. L'operatività giornaliera
chiede esplicitamente pending e rejected e raggruppa tutte le righe
(`DailyAppointments.jsx:83-126`). Non è emerso un filtro di stato o origine
capace di nascondere un normale appuntamento operatore nella data corretta.

## 5. Flussi customer/request

Il codice contiene richieste strutturate e legacy. La risoluzione strutturata
usa una RPC atomica; il legacy sposta la riga e poi aggiorna l'approvazione in
due chiamate (`Calendar.jsx:772-791`, `database.js:1325-1356`). Sono percorsi
tecnicamente presenti e mappati per completezza, ma **esclusi dai tre casi**:
Luigi ha confermato che l'area pubblica e la customer request non sono ancora
attive. Nessuna ipotesi sotto attribuisce loro peso causale.

## Compatibilità con i tre casi reali

| Caso | Compatibile | Non compatibile / escluso dai dati disponibili |
|---|---|---|
| **Snoopy** | data inserita sbagliata e invisibilità fuori settimana; eventuale indice/coda non caricati | mancato insert, errore insert, cancellazione diretta o cascata: la riga esiste ancora ed è `scheduled` |
| **fara** | pet creato e modale chiuso prima di Salva; mancata selezione successiva; errore/abbandono prima dell'insert; cancellazione diretta successiva | capienza, già esclusa dalla misura Cowork; data/stato/filtro se la ricerca ha davvero escluso ogni riga; cascata pet, perché il pet esiste ancora |
| **Clover** | nome digitato ma opzione non scelta; errore/abbandono prima dell'insert; chiusura durante l'attesa; cancellazione diretta; possibile selezione di un omonimo diverso | data o stato sbagliati se «nessuna traccia da nessuna parte» è una ricerca per id completa; cascata pet se la scheda Clover attuale è la stessa e non è stata ricreata |

La compatibilità non prova l'accaduto. In particolare, senza un audit non si
può distinguere «mai partito», «fallito prima dell'insert» ed «eliminato dopo».

## Ipotesi più probabile, separata dalle misure

**Ipotesi:** almeno parte degli episodi nasce dal selettore pet. L'operatore
scrive il nome, vede il risultato corretto, ma non tocca la riga; il pulsante
resta disabilitato senza spiegazione. Un tocco sul pulsante inattivo non genera
niente e la chiusura non lascia traccia. È il solo punto ancora muto dopo
GH-93 e GH-98 e riproduce bene un caso come Clover.

Per `fara`, la spiegazione più aderente ai dati resta il percorso già
identificato da GH-98: pet creato dentro il modale e appuntamento mai salvato.
La frase introdotta da GH-98 rende oggi il fatto visibile, ma non registra che
la frase sia stata vista. La cancellazione resta alternativa possibile, non la
più probabile, perché richiede tre azioni esplicite.

## Cosa oggi non si può stabilire

Non si può sapere:

- se Salva sia stato toccato o fosse disabilitato;
- quale pet id, data e ora fossero selezionati al momento del tentativo;
- se la richiesta abbia raggiunto Supabase;
- se una risposta sia andata persa dopo il commit;
- chi e quando abbia cancellato una riga o una scheda pet;
- quale versione dell'app e quale sessione fossero in uso nell'istante.

La traccia minima utile per il prossimo episodio è un `operation_id` generato
prima del salvataggio e un registro append-only con: `attempt_started`,
`insert_committed`, `insert_failed`, `appointment_deleted`, `pet_deleted`,
attore, tenant, pet/customer id, data/ora scelte, errore normalizzato, versione
app e timestamp. Lo stesso `operation_id` dovrebbe rendere l'insert idempotente
e consentire una rilettura dopo una risposta persa. Per il pulsante inattivo
serve inoltre una spiegazione inline e un evento sull'intenzione di premere,
perché un vero elemento HTML `disabled` non riceve il click.

## Verifiche

| Verifica | Esito | Tempo |
|---|---|---:|
| Banco browser reale, fixture solo in memoria | PASS: 0 errori pagina, 0 richieste impreviste | 3,842 s |
| Ispezione screenshot 375/1365 | PASS: testi leggibili, nessuna sovrapposizione | manuale |
| `npm run build` | PASS, Vite 5.4.21, 167 moduli | 1,31 s |
| `git diff --check` | PASS | < 1 s |
| Diff sotto `src/` | vuoto | < 1 s |
| Lettura SQL demo via collegamento Supabase | NON ESEGUIBILE: credenziale postgres rifiutata | 2 tentativi |

Avvisi build non bloccanti e preesistenti: `caniuse-lite` datato e chunk JS
oltre 500 kB. Suite RLS non eseguita: non serve a questa ricognizione e avrebbe
richiesto scritture/sonda estranee al mandato.

## Risposta al passo Luigi

**Sì: al prossimo episodio sappiamo dove guardare, ma oggi l'app non conserva
ancora ciò che serve.** Prima si verifica se il pet era davvero selezionato e
se il modale è stato chiuso durante `…`; poi si cerca una cancellazione diretta
o della scheda pet. Senza il registro append-only proposto, il database finale
continuerà a rendere indistinguibili quelle strade.

## Commit

Commit locale previsto: `docs: map appointment loss paths (GH-100)`.
Hash risolvibile con
`git log -1 --format=%H -- docs/consegne/GH-100-dove-si-perde-un-appuntamento-esito.md`.
Nessun push eseguito.
