# Consegna GH-08 — Fase 0: atterraggio DB richieste appuntamento

**Stato:** checkpoint in attesa di approvazione · **Data:** 21 agosto 2026

**Base dichiarata:** `f5cd321dc2e1cacbafd0192fd04609003ccfe2d2` · branch `feat/customer-app`

**Ambiente misurato:** solo Supabase demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`), tenant `8ad7489b-15f9-44f5-8d50-cc89506c3ac9` · stato `ACTIVE_HEALTHY`
**Produzione:** non consultata e non modificata · **Push:** non eseguito

## Misura reale

- `appointments` ha 8 righe nel tenant demo: tutte di fonte operatore; richieste customer totali/pending/approved/rejected = `0/0/0/0`. Nessuna nota contiene i marker legacy `Servizio richiesto:` o `Fascia preferita:`. Non serve quindi alcun backfill sul demo.
- `scheduled_at` e `duration_minutes` sono `NOT NULL`; non esiste una RPC appuntamenti. `service_id` esiste gia' (FK nullable) e 1/8 appuntamenti la valorizza. I servizi demo sono 2, entrambi attivi.
- La RLS viva consente allo staff `ALL` nel tenant e al customer SELECT sui propri pet, INSERT di righe customer/pending e UPDATE delle proprie righe ancora pending. Il nuovo mandato richiede invece invio mediato da RPC e nessun aggiornamento di stato da parte del customer.
- `CustomerRequests.jsx` ricava servizio e fascia da regex sulle note. `Calendar.jsx` e `DailyAppointments.jsx` caricano anche i pending e usano `scheduled_at` come posizione, durata e base dei conflitti. Il vecchio `CustomerPortal.jsx` genera proprio quei marker e assegna un orario convenzionale.

## Proposta (checkpoint)

**Raccomandata: tabella additiva `appointment_requests`.** Una richiesta non e' ancora un appuntamento: contiene `tenant_id`, `customer_user_id`, `pet_id`, `service_id`, `desired_date`, `time_preference` nullable (`morning | afternoon | flexible`), `coat_condition_codes text[]`, `coat_condition_notes`, `declared_pet_age` testuale nullable, `status` (`pending | approved | rejected`), timestamp e l'eventuale `appointment_id` finale. L'eta' resta la dichiarazione ricevuta in quella richiesta, solo quando `pets.birth_date` manca; non sovrascrive l'anagrafica e non introduce falsa precisione traducendo “circa 3 anni” in una data.

La RPC `submit_appointment_request`, `SECURITY INVOKER`, forza identita' e stato dal contesto autenticato e valida membership customer, pet proprio nello stesso tenant, servizio attivo dello stesso tenant e data futura; niente controllo disponibilita'. Privilegi RPC solo ad `authenticated`. RLS tabella: staff `ALL` nel proprio tenant; customer `SELECT` delle proprie richieste e `INSERT` soltanto per il proprio pet/tenant con stato pending; nessun UPDATE/DELETE customer. In Fase 3 `CustomerRequests` legge i campi direttamente. L'approvazione deve diventare una transazione esplicita: crea l'`appointment` solo dopo che lo staff ha definito `scheduled_at`, collega `appointment_id` e chiude la richiesta; il rifiuto cambia solo stato. Questo e' il costo principale, ma impedisce che una preferenza “mattina/pomeriggio” diventi un orario inventato nel calendario.

**Colonne su `appointments`:** riusa inbox e azioni esistenti, ma non risolve il `scheduled_at NOT NULL`. Servirebbe un timestamp sentinella e i pending oggi comparirebbero come slot e conflitti reali; l'azione “Approva” li trasformerebbe poi in appuntamenti a un orario mai scelto. Per renderla corretta occorrerebbe comunque cambiare calendario, approvazione e semantica della tabella. Scartata.

**Note strutturate:** zero schema iniziale, ma conserva parsing fragile, nessuna FK/validazione/query affidabile e mescola testo libero a dati operativi. E' incompatibile con la controprova “senza parsing”. Scartata.

**Legacy:** sul demo non esistono richieste da migrare. Durante la transizione la pagina staff puo' unire le nuove richieste alla query legacy su `appointments` pending e mantenere le due regex esclusivamente come fallback etichettato legacy; nessuna nuova richiesta scrivera' dati strutturati nelle note. Il fallback andra' rimosso solo dopo un preflight separato sull'ambiente destinatario, senza inferenze o backfill opportunistici.

## Impatto da approvare

La soluzione corretta allarga il minimo adattamento staff: le azioni restano “approva/rifiuta”, ma l'approvazione non puo' restare un semplice cambio stato; deve raccogliere/confermare l'orario preciso e creare atomicamente l'appuntamento. Se GH-08 non deve includere questa piccola estensione funzionale, serve un mandato separato prima della Fase 3; usare un orario sentinella non e' raccomandato.

## File e atti

| File/atto | Stato | Motivo |
|---|---|---|
| `docs/consegne/GH-08-fase0-atterraggio-db.md` | aggiunto | Registro e proposta del checkpoint Fase 0 |
| Codice applicativo | invariato | Fasi 1-3 non sbloccate |
| `supabase/migrations/` | invariato | Nessuna migration autorizzata prima dell'approvazione della proposta |
| DB demo | sola lettura | Schema, constraint, policy, funzioni e conteggi aggregati |

## Verifiche eseguite

| Verifica | Esito |
|---|---|
| HEAD e branch | `f5cd321dc2e1cacbafd0192fd04609003ccfe2d2`, `feat/customer-app` |
| Stato progetto demo | `ACTIVE_HEALTHY` |
| Schema/constraint/FK `appointments` | misurati dal catalogo PostgreSQL vivo |
| Policy RLS `appointments` | 4 policy vive misurate |
| Volumi e forme legacy demo | 8 appuntamenti, 0 richieste customer, 0 marker note |
| Consumer staff/customer | ispezionati `database.js`, `CustomerRequests.jsx`, `Calendar.jsx`, `DailyAppointments.jsx`, `CustomerPortal.jsx` |
| Build/test | non eseguiti: nessun codice o schema modificato in Fase 0 |

## Eccezioni e fuori istruzione

- Nessuna modifica a codice, schema, dati, credenziali, produzione o account.
- Nessun commit creato: il checkpoint contiene solo questo registro e resta in attesa di decisione.
- Modifiche parallele preesistenti di Cowork nei documenti e registri gia' presenti nel worktree non sono state toccate ne' messe in stage; tra queste `docs/workflows/flussi-operativi-salone.md`, fonte esplicitamente richiesta dal mandato GH-08.
- Documentazione Supabase corrente verificata per il contratto previsto: `SECURITY INVOKER` e' il default/raccomandato; l'esecuzione della RPC va revocata a `PUBLIC`/`anon` e concessa esplicitamente ad `authenticated`.

## Decisione richiesta

Approvare o respingere la tabella dedicata `appointment_requests` e, in caso di approvazione, confermare che la Fase 3 possa rendere l'approvazione staff una conversione atomica con scelta dell'orario preciso. Fino a tale conferma, GH-08 resta fermo alla Fase 0.
