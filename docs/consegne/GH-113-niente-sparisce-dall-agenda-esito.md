# GH-113 - Niente sparisce dall'agenda

**Esito:** completato sul solo demo `qttpinkslhenxrsbhhhg`; produzione non letta ne scritta da Codex. Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, repository `webapp/`, branch `main`, base `0cba05a6c4bd3240c7e3fa486dce664c71c2e44b`. Il mandato non versionato e stato ampliato durante il giro ai punti 4 e 5; Luigi ha autorizzato nominativamente `ClientDetail.jsx`, una seconda migration, `AddClient.jsx`, la fixture temporanea e `scripts/rls-tests/run.mjs`. Nessun push, merge o deploy. Il commit e quello che contiene questo registro (`git log -1 --format=%H -- docs/consegne/GH-113-niente-sparisce-dall-agenda-esito.md`); hash comunicato anche a Luigi alla chiusura.

Canone adottato e corrente **1.3**, fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md`, SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43`, rimisurato il 4/11 alle 17:28 CET.

## Ordine degli atti e ritorno

1. Cowork applica **solo nel prodotto**, uno alla volta e con autorizzazione di Luigi, `supabase/migrations/20261104155850_gh113_appointment_events_and_soft_cancel.sql`, poi `20261104160426_gh113_guard_future_pet_appointments.sql`. Ogni atto sul prodotto va verificato vivo prima del successivo. Sul demo entrambi sono gia applicati e verificati; non fare `supabase db push`.
2. Dopo il primo atto, prima del deploy, il client online della base `0cba05a` continua a chiamare `delete_staff_appointment(p_appointment_id)`: la RPC risponde con l'ID, ma porta la riga a `cancelled`. Nell'app online il vecchio pulsante puo ancora chiamarsi «Elimina» fino al deploy, mentre la riga resta fra gli annullati. La controprova sul demo e stata fatta **prima** degli edit UI.
3. Dopo il secondo atto, verificare che l'eliminazione di un pet con appuntamento futuro attivo dia `23514`, dettaglio `GH113_FUTURE_APPOINTMENTS`. Solo dopo pubblicare il codice del gestionale. La versione online intermedia non richiede colonne nuove.

**Verifica dopo gli atti:** sul demo la query seguente ha dato `true` per i quattro controlli, MD5 RPC `ba643d96c49ffbafb177240b38af7cc5`, 8 snapshot per 8 appuntamenti preesistenti. Sul prodotto gli snapshot devono uguagliare il numero di appuntamenti presenti **al momento dell'atto**, non il numero del demo.

```sql
select to_regclass('public.appointment_events') is not null as audit_table,
  exists(select 1 from pg_trigger where tgname='gh113_appointment_event' and tgenabled='O') as appointment_trigger,
  exists(select 1 from pg_trigger where tgname='gh113_pet_name_before_delete' and tgenabled='O') as pet_name_trigger,
  exists(select 1 from pg_trigger where tgname='gh113_guard_pet_delete' and tgenabled='O') as future_guard,
  (select md5(pg_get_functiondef(p.oid)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='delete_staff_appointment' limit 1) as legacy_rpc_md5,
  (select count(*) from public.appointment_events where action='SNAPSHOT') as baseline_snapshots,
  (select count(*) from public.appointments) as appointments;
```

**Ritorno:** in caso di problema al frontend, tornare al bundle `0cba05a`: la RPC compatibile continua a rispondere, ma annulla invece di cancellare. Se un trigger ha un problema operativo, fermare il rilascio e preparare un **nuovo atto numerato** di Cowork che disabiliti quel trigger dopo aver preservato gli eventi gia scritti. Non droppare `appointment_events` ne ripristinare implicitamente la vecchia cancellazione fisica. Un ritorno completo alla RPC GH-58 richiederebbe una decisione esplicita di Luigi, perche reintrodurrebbe la perdita di storia che GH-113 chiude.

**Query di lettura per Cowork** (cambiare tenant e intervallo inclusivo nel CTE; esecuzione amministrativa, non dall'app):

```sql
with bounds as (
  select '8ad7489b-15f9-44f5-8d50-cc89506c3ac9'::uuid tenant_id,
         date '2026-11-04' from_day, date '2026-11-04' through_day
)
select e.occurred_at at time zone 'Europe/Rome' as action_rome,
       e.action, e.appointment_id, e.pet_name,
       ((coalesce(e.before_state,e.after_state)->>'scheduled_at')::timestamptz
         at time zone 'Europe/Rome') as appointment_rome,
       coalesce(u.email, 'sistema') as actor
from public.appointment_events e
cross join bounds b
left join auth.users u on u.id=e.actor_user_id
where e.tenant_id=b.tenant_id
  and e.occurred_at >= (b.from_day::timestamp at time zone 'Europe/Rome')
  and e.occurred_at < ((b.through_day+1)::timestamp at time zone 'Europe/Rome')
  and (e.action='DELETE' or
       (e.action='UPDATE' and e.after_state->>'status'='cancelled'
        and e.before_state->>'status' is distinct from 'cancelled'))
order by e.occurred_at,e.id;
```

Provata sui dati di lavoro prima della pulizia: 5 righe di annullamento/eliminazione, con pet, giorno/ora e attore. Rieseguita dopo la pulizia: 0, atteso. `PET_NAME` e `SNAPSHOT` non compaiono nel risultato.

## Premessa e scelte

Preflight: la query identica del mandato su `pg_get_functiondef` ha dato **5/5 MD5 coincidenti** fra il prodotto citato da Cowork (4/11, 16:48:15 CET) e il demo misurato da Codex prima degli atti: `complete_appointment_with_visit=e11fb0645ab8c0721439ef84e7806ff8`, `delete_staff_appointment=9cafa4463f44b813fa01c79f3255eba1`, `delete_staff_visit_reopen_appointment=980489a4240bc55af73fa20598cba1f9`, `enforce_appointment_workstation_capacity=ee50b77d740c925114c6b7709e057e8b`, `set_staff_appointment_status=e3ed83d0a820a253929de287c688d276`. La differenza dell'atto B GH-103 e l'eccezione gia accettata: i due atti GH-113 non leggono `visits.cost`, `visits.discount_percent`, `services.price_cents` ne `gh103_finance_bridge()`. Il ramo demo privo di quegli oggetti e stato eseguito; quello prodotto con gli oggetti legacy resta da verificare da Cowork all'atto, senza accesso di Codex al prodotto.

Il registro e **append-only per i ruoli app**: solo SELECT staff del proprio tenant, nessun DML app. Il trigger cattura anche le scritture dirette; la `PET_NAME` prima della cascata conserva il nome quando il pet sparisce. Le due funzioni di audit intercettano i propri errori e restituiscono `NEW`/`OLD`: una loro anomalia non trasforma un salvataggio dell'appuntamento in un fallimento. La guardia pet non e best effort: deve rifiutare l'eliminazione rischiosa.

## Controprove

| Prova | Misura sul demo |
| --- | --- |
| Versione online fra atto e deploy | RPC PostgREST con nome e argomento della base: risposta ID, appuntamento sintetico ancora presente `cancelled`, 1 evento UPDATE. Il calendario include gli annullati. |
| Ciclo appuntamento | INSERT, spostamento, cambio stato, annullamento, ripristino e chiusura con visita: una riga per gesto, prima/dopo e attore staff dove presente. |
| Capienza | Due programmati occupano 2/2; il terzo annullato non occupa. Ripristino del terzo rifiutato `GH37_APPOINTMENT_CAPACITY`; liberato un posto, ripristino riuscito. Transazione annullata. |
| Cane con appuntamento futuro | DELETE pet rifiutato `23514/GH113_FUTURE_APPOINTMENTS`; il codice UI prepara l'elenco data/ora, ma non e stata rifatta una schermata dedicata. Dopo annullamento, DELETE riuscito: due eventi DELETE per due appuntamenti e nome pet copiato. |
| Errore nel trigger audit | Vincolo temporaneo simulato in transazione impedisce l'INSERT evento, ma l'INSERT appuntamento riesce. Transazione annullata; nessun vincolo permanente. |
| Permessi audit | Suite: staff proprio tenant legge 1; Mario, anon e staff altro tenant 0. INSERT/UPDATE/DELETE rifiutati per staff, customer e anon: 9 rifiuti. |
| UI calendario, 375 e 1365 px | Conferma esatta: `Annulli l'appuntamento di [DEMO GH-113] Vista di giovedì 12 novembre alle 10:00?`; dopo: `Appuntamento annullato: resta visibile fra gli annullati.` e 0/2 postazioni occupate; ripristino torna `Programmato`. A 375: documento e modal 375 px, nessuno sbordo; a 1365: documento 1365, modal 520 px. |
| Proprietario senza pet, punto 5 | Prima: il form mostrava `customers_tenant_phone_unique`. Dopo: propone `Aggiungi pet a questo proprietario`, nomina il proprietario, niente 409. Azione confermata: **1 customer, 1 pet nuovo collegato allo stesso ID**; nessun duplicato. Con pet gia presente: messaggio leggibile che invita ad aprire la scheda dalla rubrica, form conservato. A 375 px: documento 375, invito 321, scroll interno 318. |
| RLS finale | `node scripts/rls-tests/run.mjs`: **64 PASS, 0 FAIL, 0 SKIP**, inclusa pulizia fixture. |
| Build e statici | `npm run build` riuscito (183 moduli); `git diff --check` riuscito. `npm run lint` **non eseguibile**: `eslint: command not found` nell'ambiente, nessuna dipendenza installata. Avvisi build preesistenti: Browserslist e chunk >500 kB. |
| Advisor | Dopo il primo atto: nessun nuovo rilievo; restano avvisi preesistenti su funzioni definer e leaked-password protection. |

Pulizia amministrativa dichiarata: 54 eventi sintetici GH-113 e 15 prodotti dall'ultima suite rimossi da `appointment_events` con filtro sui soli marker/ID di prova; i ruoli app non potevano farlo. Fixture pet, appuntamento e owner rimossi. **Controllo finale:** 0 owner, 0 pet, 0 appuntamenti, 0 eventi non-SNAPSHOT di prova; **8 appuntamenti, 7 pet, 8 snapshot** di base. Gli 8 appuntamenti preesistenti conservano status e ora dei rispettivi snapshot (0 differenze con confronto `timestamptz`). Le sonde account permanenti della suite restano secondo convenzione.

## File consegnati

| File nel repository `webapp/` | Intervento |
| --- | --- |
| `supabase/migrations/20261104155850_gh113_appointment_events_and_soft_cancel.sql` | Primo atto additivo, registro, trigger e RPC legacy compatibile. |
| `supabase/migrations/20261104160426_gh113_guard_future_pet_appointments.sql` | Secondo atto additivo, guardia server per eliminazione pet. |
| `src/apps/staff/lib/database.js` | Messaggi annullamento, impatto eliminazione, ordine eliminazione/foto, ricerca telefono nel tenant e conflitto leggibile. |
| `src/apps/staff/pages/Calendar.jsx` | Annullamento confermato, ripristino visibile, nessun gesto di eliminazione fisica. |
| `src/apps/staff/pages/DailyAppointments.jsx` | Conferma annullamento e ripristino nella vista giornaliera. |
| `src/apps/staff/pages/ClientDetail.jsx` | Blocco e elenco degli appuntamenti futuri; conferma completa delle perdite. |
| `src/apps/staff/pages/AddClient.jsx` | Punto 5 autorizzato: associare il pet al proprietario senza pet e spiegare i conflitti. |
| `scripts/rls-tests/run.mjs` | ACL audit e pulizia fixture coerente con soft cancel e guardia pet. |
| `docs/consegne/GH-113-niente-sparisce-dall-agenda-esito.md` | Questo registro nello stesso commit del codice. |

**Eccezioni e fuori istruzione:** nessun intervento fuori dal perimetro esteso. Il mandato GH-113 e il successivo GH-114 sono file di Cowork non versionati: non modificati, non in stage. Gli altri SQL non versionati, l'atto dati parallelo di Cowork, il diario e le cartelle private del salone sono esclusi. Nessuna lettura dei materiali personali. Nessun atto sul prodotto. Non e stata misurata una latenza comparativa di carico del trigger: la prova e funzionale (salvataggio non bloccato e UI reattiva), non un benchmark. La prova funzionale sul prodotto dopo il deploy resta a Luigi e Cowork, con i tre gesti finali del mandato.

**Tempo:** prima fase avviata alle 16:52:38 CET; ripresa del punto 5 misurata alle 17:28:37 CET; verifica finale e chiusura registro alle 17:42:30 CET, circa 50 minuti complessivi. Le brevi pause di approvazione non sono state cronometrate separatamente. Scoperte: 2 punti aggiunti mentre il lavoro era in corso; recuperi: 0; passaggi di autorizzazione chiesti a Luigi: 4 (suite, punto 4, login staff demo, punto 5).
