# Incarico GH-02 — Scheda pet customer (Fase A completa)

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Base:** branch `feat/customer-app` @ `90d7e26` · **Giro:** G2 del piano in `docs/stato-arte-misurato-2026-08-18.md`
**Prerequisito dichiarato:** demo Supabase attivo e raggiungibile. Non partire se il demo non risponde.

## Nota ambienti (aggiornamento 18/8, decisione Luigi)

La configurazione Supabase è cambiata rispetto a quanto il repo racconta:

- **Prod `grooming`** (189 clienti reali): trasferito — o in corso di trasferimento — in una **org Pro nuova dedicata** (`grooming-hub`). Il transfer non cambia ref né connection string. Per questo incarico resta ciò che è sempre stato: **intoccabile**.
- **Demo `grooming-hub-demo`**: **resta nell'org free attuale**, con auto-pausa dopo 7 giorni di inattività. Ref e credenziali invariate, `.env` e Vercel non cambiano. Se durante il lavoro il demo risulta in pausa, il restore è un gesto di Luigi: fermati e segnala, non aggirare.
- Tutto il lavoro di GH-02 (A1–A4, seed compreso) avviene **esclusivamente sul demo**.

---

## Perché

Delle 4 schermate di Fase 1 ne esistono 2 (Dashboard, Promozioni). La Scheda pet è il quick win a **zero dipendenze DB**: schema `pets` + `visits` pronti, RLS attive, bucket `pet-avatars` creato (M34), trigger staff-only sulle note già in funzione. È la prossima cosa da mostrare a Davide e Roby.

## Disegno

Quattro passi, nell'ordine:

**A1 — `/u/pet/:petId` read-only.** Sostituisce lo stub `src/apps/customer/pages/Pet.jsx`. Hero (foto da `photo_url` o iniziale + nome in Fraunces + specie/razza/età), anagrafica (nascita, sesso, microchip, peso, colore, sterilizzato), preferenze toelettatura da `coat_preferences` (jsonb), note del proprietario (`owner_notes`), storico visite (`visits` order by date desc). Hook nuovi `usePet(petId)` e `usePetVisits(petId)` accanto agli esistenti in `src/apps/customer/hooks/`. Stati: loading (Skeleton), error, 404/RLS-reject → «pet non trovato o accesso negato». Layout dentro `CustomerNav` come Home/Promotions; pattern visivi dal bundle `design_handoff_customer_app/reference/` e componenti shared esistenti (`Card`, `Eyebrow`, `Icon`, `StatusBadge`).

**A2 — Inline edit** dei soli campi customer-editable: `owner_notes`, `coat_preferences`, `photo_url`. Ciclo viewing→editing→saving→saved. I campi staff-only (`internal_notes`, microchip, peso) restano read-only nella UI — il trigger DB li protegge comunque: la UI non deve mai suggerire che siano modificabili.

**A3 — Upload foto pet** su bucket `pet-avatars`, path `<tenant_id>/<pet_id>/<file>`, resize client-side ≤1024px via `canvas.toBlob`. RLS storage già scritta.

**A4 — Seed demo** per Pepe/Luna: `coat_preferences`, note, 2-3 `visits` storiche. Dati di prova riconoscibili come tali (canone: mai un dato finto che possa sembrare vero).

## Vincoli misurabili

- Branch `feat/customer-app`, commit atomici prefissati (`feat:`, `fix:`, `chore:`). **Niente push** senza conferma di Luigi.
- Build Vite verde a ogni commit; zero warning nuovi in console sulla pagina.
- Seed solo sul demo, con fonte in commento. **Prod `grooming` non si tocca.**
- La griglia delle cinque domande (canone §3) va applicata all'intreccio A2: viewing/editing/saving sono stati che si separano — in particolare la n.5 («uscendo per guardare, si perde il lavoro?») su navigazione via nav globale con edit non salvato.

## Cosa NON fare

- Niente creazione pet customer-side (Decisione 9 Gate 2: empty state → contatto salone via WhatsApp).
- Niente campi qualitativi strutturati nuovi (Decisione 3 Gate 5: testo libero).
- Niente nav aggiuntiva, niente route nuove oltre `/u/pet/:petId`, niente refactor di ciò che funziona.
- Niente migration: se lo schema non basta, **fermati e consegna l'interruzione motivata** — è una consegna buona.

## Condizioni di consegna

Registro che risponde punto per punto: base dichiarata, tabella esaustiva dei file toccati, hash dei commit, cifre rimisurate (esito build, conteggio stati resi), verifiche eseguite (login come `mario.rossi@test.example`, RLS-reject provato con `luca.bianchi@test.example` su pet altrui), eccezioni e fuori-istruzione dichiarati, note aperte. Cowork verifica nel proprio ambiente prima della promozione; il deploy preview è di Luigi.
