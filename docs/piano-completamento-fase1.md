# Piano di completamento — Fase 1 Customer App

> Documento di riferimento condiviso per chiudere la Fase 1 della customer app di Grooming Hub e arrivare al merge in produzione. Redatto a valle dello Step 6.5 (commit `90d7e26`, maggio 2026).
>
> Approccio scelto: **bilanciato a fasi** — alternare valore visibile (schermate customer da mostrare al salone) e debito tecnico (sblocco produzione). Non "tutto customer poi tutto backend", né viceversa.
>
> Le stime sono in **sessioni di lavoro** (mezza giornata ciascuna, ~3-4h) e in complessità relativa, non in date di calendario: la cadenza reale dipende dalla disponibilità e dai round di feedback col salone.

---

## Stato attuale (sintesi)

Dettaglio completo in [diario-progetto.md](diario-progetto.md). In breve:

**Fatto e vivo sul demo:**
- Gate 1 (baseline) + Gate 2 (35 migration: multi-tenant, split `clients`→`customers`+`pets`, RLS, storage, trigger note staff-only, `service_id`).
- Customer app Step 1–6.5: monorepo layout, auth login reale, Dashboard reale, Promozioni reali, nav globale, design system minimo.
- Preview Vercel pubblica su progetto `grooming-hub-webapp-aish` (demo Supabase, SSO disattivata).

**Schermate Fase 1 (bundle `design_handoff_customer_app`):**

| # | Schermata | Stato |
|---|---|---|
| 1 | Dashboard `/u/home` | ✅ completa |
| 2 | Scheda pet `/u/pet/:id` | 🔩 stub |
| 3 | Prenotazione `/u/book` | 🔩 stub |
| 4 | Promozioni `/u/promotions` | ✅ completa |

**Debiti aperti noti:** app staff rotta sul demo (Gate 5), test RLS assenti (Gate 4), security hardening, piano migration prod, auth flows stub (redeem, forgot).

---

## Le tre fasi

### FASE A — Quick win customer: Scheda pet (read-only → edit)

Obiettivo: portare a 3/4 le schermate Fase 1 con lavoro a **zero dipendenze DB** (schema `pets` + `visits` già pronti, RLS già attive, bucket `pet-avatars` già creato). Massimo valore visibile per minimo rischio.

| Step | Cosa | Dipendenze | Stima |
|---|---|---|---|
| A1 | **Scheda pet read-only** `/u/pet/:id` — hero (foto o iniziale + nome Fraunces + specie/razza/età), anagrafica (data nascita, sesso, microchip, peso, colore, sterilizzato), preferenze toelettatura (da `coat_preferences` jsonb), note owner, storico visite (query `visits` order by date desc). Hook `usePet(petId)` + `usePetVisits(petId)`. Stati loading/error/404 (RLS reject → "pet non trovato o accesso negato"). | Nessuna (schema pronto) | 1–1.5 sess |
| A2 | **Inline edit** dei campi customer-editable (`owner_notes`, `coat_preferences`, `photo_url`) con pattern viewing→editing→saving→saved. I campi staff-only (`internal_notes`, microchip, peso) restano read-only — il trigger DB già li protegge. | A1 | 1 sess |
| A3 | **Upload foto pet** su bucket `pet-avatars` (path `<tenant_id>/<pet_id>/<file>`), resize client-side ≤1024px via `canvas.toBlob`, RLS già scritta (M34). | A1 | 0.5–1 sess |
| A4 | Seed demo: arricchire Pepe/Luna con `coat_preferences`, note, qualche `visits` storica, per popolare la schermata. | — | 0.25 sess |

Deliverable: `/u/pet/:id` completa, deploy preview, feedback salone possibile.

---

### FASE B — Sblocco produzione: Gate 5 (staff app) + Gate 4 (test RLS)

Obiettivo: rimettere in piedi l'app staff sul nuovo schema e dimostrare l'isolamento multi-tenant. È il blocco che rende la produzione *pensabile*.

| Step | Cosa | Dipendenze | Stima |
|---|---|---|---|
| B1 | **Gate 5 — refactor `apps/staff/lib/database.js`** secondo `supabase/docs/gate5-design-decisions.md`: 45 `.from()` + ~98 rif `client_id` da riorientare su `pets`/`customers`. `getAllPets()` con join, `addCustomerWithPet()`, `convertContactToCustomer`, ecc. Rimuovere lo shim `supabaseClient.js`. | Decisioni Gate 5 già prese | 2–3 sess |
| B2 | Aggiornare le 7 pagine staff che consumano `database.js` (find-replace guidato da build). Verificare login staff + dashboard operativi sul demo. | B1 | 1 sess |
| B3 | **Sotto-migration `contacts`→`customers`** (Decisione 3 Gate 5): migrare i record, deprecare/rimuovere `contacts`. | B1 | 0.5 sess |
| B4 | **Gate 4 — test RLS**: script (JS o pgtap) che logga come Mario, Luca, staff e verifica isolamento (A non vede dati di B; customer non vede altri tenant; staff vede tutto il proprio tenant). Documentare in `supabase/docs/rls-tests.md`. | B1 (staff funzionante) | 1 sess |

Deliverable: staff app di nuovo verde sul demo, isolamento tenant provato, `owner_user_id` candidato a cleanup Fase 2 verificato non più necessario dalle RLS.

---

### FASE C — Chiusura customer: Prenotazione + auth flows

Obiettivo: completare la 4ª schermata (la più delicata) e i flussi auth residui. Richiede le RPC del Gate 5-bis.

| Step | Cosa | Dipendenze | Stima |
|---|---|---|---|
| C1 | **Gate 5-bis — RPC prenotazione**: firmare + implementare `available_slots(tenant_id, service_id, date)` e `book_appointment(tenant_id, customer_id, pet_id, service_id, scheduled_at, notes)` transazionale (anti doppia-prenotazione). Firma da approvare prima dell'implementazione (procedura bundle §Gate 5). | services + appointments (pronti) | 1.5–2 sess |
| C2 | **Wizard `/u/book`**: step pet→servizio→data/ora→conferma, `?petId=` preselezione, stati (loading slot, conflitto, submit error), pagina conferma `/u/book/confirm/:id` con `.ics`. Biforcazione clienti (decisione pre-Gate-3: anticipo minimo 7 giorni "soft"). | C1 | 2 sess |
| C3 | **Redeem invito reale** `/u/redeem/:token`: wiring su RPC `accept_customer_invite` (già esistente), gestione esiti (adottato / nuovo / phone collision). | RPC esistente | 0.5 sess |
| C4 | **Forgot password reale**: `resetPasswordForEmail` + pagina `/reset`. Notifiche = stub loggante (bundle: no provider reali in Fase 1). | — | 0.5 sess |

Deliverable: 4/4 schermate Fase 1 complete, flussi auth end-to-end.

---

### FASE D — Pre-produzione (Gate a sé, prima del merge in `main`/prod)

Non parte finché A–C non sono verdi. Elencata per completezza.

| Step | Cosa | Note |
|---|---|---|
| D1 | **Security hardening** — priorità dichiarata nel diario prima di ogni merge prod. Audit RLS, review policy legacy residue, verifica SECURITY DEFINER/search_path, esposizione anon key, storage policy. | Da dettagliare in doc dedicato |
| D2 | **Piano migration produzione** `grooming` (189 clients reali): variante prod-safe del Gate 2 (backfill `clients`→`customers`+`pets` con `legacy_client_id`, seed `tenant_memberships` da `profiles.role`, batch UPDATE, `CREATE INDEX CONCURRENTLY`, finestra di manutenzione). Riferimento: sezione "Considerazioni per l'applicazione su produzione" in `migration-plan.md`. | Il più rischioso — richiede backup + finestra concordata col salone |
| D3 | Criteri "fatto" Fase 1 (bundle §06): 4 schermate navigabili da login reale, RLS testate, tutti gli stati resi, no warning console, Lighthouse mobile A11y≥90/Perf≥80, README branch, changelog migration. | Checklist finale |

---

## Sequenza raccomandata

```
A1 → A2 → A3 → A4        (Scheda pet: quick win, deploy, feedback salone)
      ↓
B1 → B2 → B3 → B4        (Gate 5 staff + test RLS: sblocco tecnico)
      ↓
C1 → C2 → C3 → C4        (Prenotazione + auth: chiusura customer)
      ↓
D1 → D2 → D3             (Pre-produzione: hardening + migration prod)
```

**Perché quest'ordine:**
- **A prima di tutto**: zero dipendenze, valore immediato, tiene caldo il canale col salone mentre si affronta il backend.
- **B prima di C**: il refactor `database.js` (B1) e le RPC di prenotazione (C1) toccano lo stesso strato dati; farli in fila evita context-switch e riduce il rischio di scrivere due volte pattern simili. Inoltre i test RLS (B4) danno la rete di sicurezza prima di introdurre `book_appointment` (C1), che scrive.
- **D per ultimo**: hardening e migration prod hanno senso solo su un sistema feature-complete e testato.

## Stima complessiva

~13–17 sessioni (~6–9 giornate piene), esclusa la Fase D che dipende fortemente dalle scelte di sicurezza e dalla finestra di manutenzione concordata col salone.

## Decisioni ancora da prendere (non bloccanti per l'avvio di Fase A)

1. **Firma RPC `available_slots`/`book_appointment`** — da approvare a inizio Fase C (procedura Gate 5 del bundle: firma + pseudocodice → OK → implementazione).
2. **Sorte di `contacts`** — confermare rimozione tabella dopo migrazione a `customers` (B3), o tenerla come inbox lead staff distinta. La Decisione 3 Gate 5 propende per l'unificazione.
3. **Biforcazione prenotazione** — anticipo minimo 7 giorni "strict" (l'app blocca) vs "soft" (permette ma segnala). Da confermare col salone in Fase C.
4. **`tenants.settings`** — quando spostarci il numero WhatsApp e le regole di prenotazione (ora hardcoded). Candidato a inizio Fase C.

## Fuori scope Fase 1 (Fase 2+)

Shop/boutique, programma fedeltà/tier, profilo esteso, notifiche push, recensioni, self-registration customer senza invito, cleanup `pets.owner_user_id`, code-splitting bundle, self-hosting Fraunces.
