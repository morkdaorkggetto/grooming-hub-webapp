# 06 · Procedura di approvazione

Regola d'oro: **mai scrivere codice applicativo senza approvazione esplicita degli artefatti DB.**

## Ordine tassativo

### Gate 1 — Schema baseline
Consegna: `supabase/docs/schema-baseline.md` (vedi `02-database.md` passo 0).
**Aspetta l'OK** prima di procedere.

### Gate 2 — Migration `tenant_id` (due step)
Consegna in un'unica pull review, ma file separati:
1. `<timestamp>_add_tenant_id_nullable.sql`
2. `<timestamp>_add_tenant_id_enforce.sql`

Spiegare quali tabelle tocca e perché. L'autore può chiedere di escluderne qualcuna.
**Aspetta l'OK.** Applica su branch dev, non produzione.

### Gate 3 — Nuove tabelle, una per volta
Ordine consigliato:
1. `tenants` + seed tenant pilota
2. `tenant_memberships`
3. `profiles` + trigger auto-create
4. `customers`
5. `promotions`

Ogni tabella = una migration. Ogni migration va in pull con l'autore e aspetta OK prima della successiva.

### Gate 4 — Policy RLS
Per ogni tabella (nuova **o** esistente a cui è stato aggiunto `tenant_id`), un file `<timestamp>_rls_<tabella>.sql`.
Consegnare insieme alla migration della tabella corrispondente, o subito dopo. RLS **deve essere attiva** prima di scrivere query lato client.

### Gate 5 — RPC / funzioni DB critiche
Almeno due RPC da definire, firmare, approvare prima di implementarle:
- `available_slots(tenant_id, service_id, date) returns setof slot`
- `book_appointment(tenant_id, customer_id, pet_id, service_id, scheduled_at, notes) returns uuid`

Mostrare firma + logica (pseudocodice) all'autore. OK → implementazione.

### Gate 6 — Scaffolding codice
A DB verde, prima di scrivere le schermate:
- refactor del repo in `src/apps/staff/` + `src/apps/customer/` + `src/shared/*`
- `AuthProvider`, `TenantProvider`, routing split `/dashboard` ↔ `/u/*`
- componenti UI shared di base (`Button`, `Card`, `Input`, `Skeleton`)

Consegnare una PR di scaffolding **vuota di feature**, verificata con login/logout funzionanti e routing navigabile con pagine placeholder. OK → procedere con le schermate.

### Gate 7 — Schermate, una per volta
Ordine consigliato (dalla più semplice alla più complessa):
1. **Promozioni** (sola lettura, minimi stati — utile come prova del circuito completo)
2. **Dashboard utente**
3. **Scheda pet** (read-only prima, poi inline edit in un commit separato)
4. **Prenotazione** (lo step tecnicamente più delicato, per ultimo)

Per ogni schermata:
- PR dedicata
- Screenshot/GIF mobile + desktop allegati in PR
- Checklist stati confermata (loading/error/empty presenti e testati)
- RLS ri-verificate con almeno due account fittizi

L'autore approva visivamente prima del merge.

---

## Comunicazione durante lo sviluppo

- Dubbi **di design**: tornare dall'autore con screenshot, possibilmente due opzioni da comparare. Non improvvisare.
- Dubbi **tecnici** (es. libreria DatePicker, pattern di form, strategia upload): proposta + alternativa + consiglio del dev. Decisione finale all'autore.
- Dubbi **di scope** ("sembra piccolo, aggiungo anche X?"): **no**, chiedere. Lo scope è stretto di proposito.

---

## Criteri di "fatto" per chiudere la Fase 1

- [ ] Le 4 schermate sono navigabili end-to-end partendo da login reale
- [ ] RLS testate: account A non vede dati di account B, né quelli di altri tenant
- [ ] Tutti gli stati (loading/error/empty) rendono qualcosa di sensato in ciascuna schermata
- [ ] Nessun warning console né errore non gestito al flusso happy path
- [ ] Mobile Lighthouse: Accessibility ≥ 90, Performance ≥ 80 (soglia morbida, non blocker)
- [ ] README della branch aggiornato con: come avviare, come seeddare, come testare RLS
- [ ] Changelog delle migration applicate in un file `supabase/docs/migrations-log.md`
