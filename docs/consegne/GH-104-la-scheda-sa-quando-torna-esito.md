**Versione del canone: il progetto e il mandato dichiarano 1.1; il CANONE.md corrente e la skill richiedono 1.2. Scarto segnalato, lettura integrale eseguita, prosecuzione consentita dalla skill. Dichiarazione del progetto non modificata.**

# GH-104 — La scheda sa quando torna

## Esito e perimetro

Implementato e verificato sul **solo demo `qttpinkslhenxrsbhhhg`**. Produzione mai letta o scritta. Nessuna migration, policy, colonna, rotta nuova, modifica cliente, push, merge o deploy.

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web/`; worktree: `webapp/`.
- Branch misurata: `main`. Base: **`8b51c0ebc491a3af490e418e31e820432d49b694`**, conforme al mandato.
- Canone letto: `/Users/luigimaisto/Desktop/_metodo/CANONE.md`; impronta **SHA-256** `28a1c8d407c3bb624a4c0d499e14aee926472843e5192e3f70d4e961f8b82e71`.
- Codice, evidenze e questo registro viaggiano nello stesso commit, identificabile senza autoriferimento con `git log -1 --format='%H %s' -- docs/consegne/GH-104-la-scheda-sa-quando-torna-esito.md`. Hash comunicato anche nella consegna in chat.
- Preview locale: `http://127.0.0.1:4177/login`, configurazione demo verificata; login aperto in browser isolato senza errori. Nessuna fixture lasciata per la revisione umana.

## Premessa verificata prima del codice

Una sola definizione della dashboard, composta da due sorgenti compatibili:

| Sorgente | Predicati di apertura |
|---|---|
| `appointment_requests` | `tenant_id = tenant corrente AND status = 'pending'` |
| `appointments`, richieste legacy | `tenant_id = tenant corrente AND approval_status = 'pending' AND appointment_source = 'customer'` |

Prima delle modifiche ho eseguito il query builder reale di `getPendingAppointmentRequests` in un contesto locale che registra i predicati: **PASS**, senza query DB o scritture. Ho poi confrontato calendario, pagina richieste, mapper e classificatore: il calendario limita alcune letture alla settimana; la pagina richieste aggiunge le ritirate in una sezione distinta. Non sono ulteriori definizioni di richiesta aperta.

Il filtro della dashboard ora risiede in `readPendingAppointmentRequests`, richiamato sia dalla funzione pubblica esistente sia dalla scheda con il solo ulteriore filtro `pet_id`. `getAppointmentRequestStaffAction` resta invariato. I test confrontano i predicati attuali con il sorgente della base Git, non con una copia riscritta della definizione.

### Le cinque domande applicate

1. **Fonte:** appuntamenti confermati del singolo pet; richieste aperte dalla stessa lettura della dashboard.
2. **Persistenza:** nessun dato nuovo di prodotto; letture dalle tabelle esistenti.
3. **Accordo:** stesso filtro e classificatore; controprova viva dei tre stati, non un nuovo stato locale.
4. **Fallimenti:** gli errori di lettura raggiungono lo stato di errore esistente della scheda; non diventano un falso “nessun appuntamento”.
5. **Conteggi e visibilità:** tutte le righe, ordinate; conteggio esatto e paginazione della lettura appuntamenti per non nascondere righe oltre il limite API. Misura viva 3/3; prova locale 1001/1001.

## Scelte implementate

- `Panel` esistente subito dopo l'identità: **Prossimo appuntamento**. Righe con data, ora e servizio; richieste sotto un separatore, sempre con la parola **Richiesta**. Nessun nuovo colore o geometria fuori dal pannello.
- Appuntamenti: stesso `pet_id` e tenant, `scheduled/approved`, da mezzanotte di Roma inclusa, ordinati per `scheduled_at` e `id`. Il conteggio API guida le eventuali pagine successive.
- `getRomeDate` legge le parti della data con `Intl` e `Europe/Rome`; `getRomeDayStart` risolve la mezzanotte locale in UTC con due correzioni del calendario locale. Non usa l'ora corrente come soglia né l'offset corrente per tutta la giornata. Il 30/9: **2026-09-29T22:00:00.000Z**.
- Un appuntamento apre `/calendar?date=AAAA-MM-GG`, vista giorno e settimana corrispondente. Validazione stretta e confronto delle componenti: date impossibili tornano a oggi. Anche i cambi della query sulla pagina già montata vengono gestiti.
- Le richieste aprono `/requests`. Per una proposta accettata si vedono la data e l'ora scelte, non la vecchia data desiderata.
- Il pulsante identità **Appuntamento** e l'effetto `clientId` non cambiano; nel caso vuoto lo stesso gesto è disponibile anche nel pannello. Assenze, pallino e suono invariati.
- Mobile: il solo pannello riserva 48px a destra, così il FAB esistente non copre testo o frecce.

## Controprove

Esecuzione viva con staff demo esistente, browser Chromium isolato, fuso Europe/Rome; credenziali solo da `.env.local`, mai salvate nelle evidenze. Nessun account creato e nessuna password o ruolo cambiati. La CLI `agent-browser` non è installata: usato Playwright del runtime disponibile, senza controllare Safari personale.

| Prova | Misura / esito |
|---|---|
| Nessun appuntamento | Testo esatto **Nessun appuntamento in agenda**. **Appuntamento** apre il dialogo esistente con il pet già selezionato; nessun salvataggio dal dialogo. |
| Domani | **1 ottobre 2026 alle ore 09:00**, **Bagno**. Click: `date=2026-10-01`, vista **Giorno**, intestazione **giovedì 1 ottobre**. |
| Tre appuntamenti | **3 in agenda / 3 righe**: 1/10 09:00, 2/10 10:00, 3/10 11:00, tutte Bagno, in ordine nonostante inserimento 1-3-2. |
| Stamattina già passata | 30/9 **07:00** incluso; totale 4 righe dopo la sua aggiunta. |
| Esclusioni | Ieri, cancelled, no_show, completed, rejected e appuntamento dell'altro pet dello stesso Mario: tutti esclusi dal nuovo pannello. L'assenza rimane nello storico esistente: **1**. |
| Richiesta da rispondere | Scheda: **Richiesta · Da rispondere**; dashboard: **[DEMO GH-104] Ritorno · 07/10 · da rispondere**. |
| Richiesta in attesa | Scheda: **Richiesta · In attesa della persona**; dashboard: **RISPOSTE ATTESE / 1 persona deve ancora rispondere**, con il pet e le due proposte. Stesso `staff_action=waiting_customer`. |
| Richiesta da prenotare | Scheda: **Richiesta · Da prenotare / 08 ott 2026 alle 09:00 · Bagno**; dashboard: **[DEMO GH-104] Ritorno · 08/10 alle 09:00 · da prenotare**. |
| Richieste chiuse | Una withdrawn, una approved e una rejected non compaiono nella scheda: **1 sola richiesta aperta**, non 4. Destinazione del click: pagina `/requests`, scheda corretta presente. |
| Giorno non valido | `date=bad` e `date=2026-02-30`: **mercoledì 30 settembre**, nessun errore. Sette valori non validi complessivi e giorno bisestile verificati localmente. |
| `clientId` | Pulsante identità apre Nuovo appuntamento con lo stesso pet selezionato. Effetto di apertura confrontato byte per byte con la base: invariato. |
| 375px | Documento **375px**, overflow **0**, ellissi **0**; link **321×100px** (appuntamenti), **321×76px** (richiesta). Pulsante del vuoto **135,89×46px**. Contenuto destro a 300px, FAB da 304px. |
| 1365px | Documento **1365px**, overflow **0**, ellissi **0**; link **912×76px**. Pulsante del vuoto **141,89×44px**. Screenshot ispezionati. |
| Ora legale e dispositivo | Cinque istanti verificati, inclusi 29/3 e 25/10 e cambio data a Roma; passano anche con `TZ=America/Los_Angeles`. |
| Limite API | Simulazione locale di server con massimo 100 righe: **1001 appuntamenti attesi / 1001 restituiti / 1001 ID distinti**, 11 pagine; casi 0 e 3 in una lettura. Non sono fixture DB. |
| Invarianti | `git diff 8b51c0e -- src/apps/customer`: vuoto. Diff su `src/shared` e `StaffRequestAlerts.jsx`: vuoti. Nessuna nuova route o dipendenza. |
| Build e runtime | `npm run build`: **PASS**, 170 moduli, ultimo build **1,30 s**. Errori JS/console nella prova browser: **0**. `git diff --check`: PASS. |
| RLS | **Non rieseguita**, come richiesto. Le 62 PASS GH-103 sono una misura precedente, non di questo giro. |

### Letture e tempi

Dopo autenticazione/profilo/pet invariati, la scheda passa da **2 a 5 letture parallele**: punti, assenze, appuntamenti, richieste strutturate, richieste legacy. Ogni pagina aggiuntiva degli appuntamenti richiede una lettura ulteriore; tutte le fixture di questo giro rientrano nella prima.

Tre campioni alternati della stessa `getClientById`, codice base e nuovo, stesso pet vuoto e sessione:

| Codice | Campioni ms | Mediana |
|---|---|---|
| Base `8b51c0e` | 417, 419, 419 | **419 ms** |
| GH-104 | 407, 429, 424 | **424 ms** |

Differenza mediana **+5 ms**: nessun rallentamento apprezzabile nel campione. Non è una garanzia sulle latenze di produzione o un benchmark sotto carico.

Intervallo di lavoro misurato: **30/9/2026 16:11:00–16:33:22 Europe/Rome**, **22 min 22 s**, fino alle verifiche; nessuna pausa sottratta. Letture preliminari precedenti al primo orologio e successiva redazione/commit non incluse. Ultima suite browser: **33,655 s**, incluse fixture e cleanup (`14:32:31.113Z–14:33:04.768Z`).

## Fixture e pulizia

Ogni ciclo completo crea **2 pet sintetici** dello stesso cliente demo, **10 appuntamenti**, **4 richieste**; marker `[DEMO GH-104]`. Nessuna visita, foto, account o modifica di impostazioni. Le richieste vengono eliminate; i soli appuntamenti di fixture sono normalizzati a cancellati e rimossi tramite `delete_staff_appointment`; infine vengono rimossi i pet. Cleanup in `finally`, anche nei tentativi falliti.

Ultimo esito API: **pet 0 / appuntamenti 0 / richieste 0**. Controllo SQL indipendente successivo, esclusivamente sul demo:

```sql
select
 (select count(*) from public.pets where name like '[DEMO GH-104]%') as pets,
 (select count(*) from public.appointments
  where notes = '[DEMO GH-104]' or id like 'gh104-%') as appointments,
 (select count(*) from public.appointment_requests
  where coat_condition_notes = '[DEMO GH-104]') as requests;
-- pets=0, appointments=0, requests=0
```

Quattro tentativi iniziali del collaudo si sono fermati per selettori/assert del test o percorso del modulo di confronto: valore del combobox invece del testo del dialogo, doppio separatore nel percorso virtuale Vite, intestazione di attesa invece della singola riga dashboard, selettore richiesta non univoco perché includeva anche la ritirata. Corrette le sonde, mai i dati esistenti; pulizia a zero in tutti i tentativi. La prima ispezione visiva ha rilevato la freccia mobile sotto il FAB: corretto soltanto il CSS del nuovo pannello e riprovato. Nessuno di questi tentativi è contato come PASS finale.

## Tabella esaustiva del commit

| File | Modifica |
|---|---|
| `src/apps/staff/lib/database.js` | Lettura richieste condivisa; data Roma; appuntamenti del pet paginati; tre letture aggiunte in parallelo. |
| `src/apps/staff/pages/ClientDetail.jsx` | Pannello, stato vuoto, richieste distinte, link alle destinazioni esistenti. |
| `src/apps/staff/pages/ClientDetail.css` | Stili circoscritti al nuovo pannello, bersagli e spazio FAB mobile. |
| `src/apps/staff/pages/Calendar.jsx` | Query `date`, validazione, selezione giorno/settimana; nessuna modifica al gesto `clientId`. |
| `docs/consegne/evidenze/GH-104/local-checks.mjs` | Prove riproducibili senza DB: predicati, classificazione, Roma, query, invarianti, paginazione. |
| `docs/consegne/evidenze/GH-104/browser-checks.mjs` | Prove browser/demo riproducibili, guard sul ref, fixture limitate e cleanup. |
| `docs/consegne/evidenze/GH-104/browser-results.json` | Risultati e tempi dell'ultima esecuzione completa. |
| `docs/consegne/evidenze/GH-104/detail-375.png` | Evidenza mobile con soli dati demo sintetici. |
| `docs/consegne/evidenze/GH-104/detail-1365.png` | Evidenza desktop con soli dati demo sintetici. |
| `docs/consegne/GH-104-la-scheda-sa-quando-torna-esito.md` | Questo registro. |

## Esclusioni, limiti e passo umano

Preesistenti, lasciati immutati e fuori stage/commit: il mandato GH-104; `controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/` (contenuti **non letti**); `supabase/demo-riallineamento-2026-09-27.sql`; le tre migration GH-102 `invite_error_without_phone`, `pet_avatars_staff_policy_authenticated_only`, `storage_no_listing`; `supabase/rollback/`. Nessun lavoro applicativo fuori istruzione. Solo log/cache temporanei del collaudo fuori dal worktree.

Avvisi build preesistenti: Browserslist vecchio e bundle >500 kB; nessun aggiornamento dipendenze fuori mandato. Nessuna verifica Safari/iPhone reale; le misure responsive sono Chromium. La clausola legacy è verificata tramite predicati e classificatore locali; le prove vive dei tre stati usano richieste strutturate. Le misure di produzione nel mandato restano attribuite a Cowork e non sono state ricontrollate.

**A Luigi con Davide:** aprire un pet che torna la prossima settimana, leggere quando torna senza uscire dalla scheda, toccare la riga e verificare il giorno; poi aprire un pet senza appuntamenti e provare il gesto di creazione. Domanda conclusiva: **«Cosa non ti torna?»**. Questa revisione al banco resta umana; i dati di prova non sono lasciati in piedi.
