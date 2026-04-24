# 04 · Schermate — Fase 1

Tutte le misure, i colori e gli stati sono mostrati nei file `reference/*.html`. Qui descrivo **cosa deve fare** ogni schermata, **quali dati legge**, **quali stati servono**. I pixel li si leggono dai mockup.

Approccio: **mobile-first**. Breakpoint desktop consigliato `>=960px` (allineare a quello del repo staff se diverso).

---

## 04.1 · Dashboard utente — `/u/home`

**File di riferimento:** `reference/proto/proto-dashboard.jsx`, `reference/Dashboard Utente.html` (section "Dashboard B"), `reference/Grooming Hub - Prototipo.html` (entrypoint → Home).

### Scopo
Punto d'atterraggio dopo login. L'utente capisce in 2 secondi: chi saluta, quando è il prossimo appuntamento, cosa può fare.

### Sezioni (nell'ordine)
1. **Header** — saluto ("Ciao, Marco") + avatar + link profilo (profilo è fuori scope Fase 1 ma l'avatar resta, senza link attivo → non renderizzare il dropdown)
2. **Next appointment card** — prossimo appuntamento confermato: pet, servizio, data/ora, groomer assegnato, CTA "Dettagli" e "Sposta/Annulla" (le due azioni possono aprire un modal minimale con messaggio "contatta il salone" in Fase 1, oppure andare a una route `/u/appointment/:id` — **chiedere all'autore** quale dei due)
3. **CTA principale** — "Prenota un nuovo appuntamento" → `/u/book`
4. **Pet** — una card per ogni pet di proprietà del customer; click → `/u/pet/:petId`
5. **Promozioni attive** — max 3 carousel/stack, link "Vedi tutte" → `/u/promotions`

### Query
- `customers` dove `user_id = auth.uid() and tenant_id = :current` → 1 riga `customerId`
- `pets` dove `owner_id = customerId` (RLS filtra)
- `appointments` dove `customer_id = customerId and status in ('confirmed', 'pending') and scheduled_at >= now()` order by `scheduled_at asc` limit 1
- `promotions` dove `is_active and (valid_to is null or valid_to >= now())` order by `display_order` limit 3

### Stati
- **loading**: skeleton shimmer sulla card prossimo appuntamento e sulle card pet
- **empty — nessun pet**: card "Aggiungi il tuo primo pet" con CTA (la creazione pet può essere un modal inline; se si vuole evitare in Fase 1 e mandare a una pagina `/u/pet/new`, approvare)
- **empty — nessun appuntamento**: card grigia "Nessun appuntamento in programma" + CTA prenota
- **empty — nessuna promo**: non rendere la sezione
- **error**: toast non bloccante; contenuto restante deve comunque apparire

---

## 04.2 · Scheda pet — `/u/pet/:petId`

**File di riferimento:** `reference/pet-page.jsx`, `reference/proto/proto-dashboard.jsx` (sezione pet detail), e la variante "V1 Editoriale" nel canvas `Dashboard Utente.html`.

### Scopo
Profilo completo del pet, storico appuntamenti, preferenze, note. L'utente può modificare **alcuni** campi.

### Sezioni
1. **Hero** — foto pet (placeholder se assente), nome grande (tipografia editoriale — font Fraunces dai tokens), specie/razza/età
2. **Anagrafica** — data di nascita, sesso, microchip, peso, sterilizzato, colore. Layout a lista/griglia.
3. **Preferenze di toelettatura** — taglio preferito, shampoo preferito, tolleranze (es. "non ama il phon"). Campi liberi + qualche checkbox.
4. **Note del proprietario** — textarea, salvataggio esplicito
5. **Storico appuntamenti** — lista degli ultimi N (10?), ordinati desc per data. Ogni riga: data, servizio, groomer, note post-appuntamento (se lo staff ne ha lasciate). Tap → modal/pagina dettaglio appuntamento (in Fase 1 basta un modal read-only).
6. **CTA fisso in fondo (mobile) / sticky nella sidebar (desktop)** — "Prenota per {nome pet}" → `/u/book?petId={id}`

### Modifica
L'utente customer può **editare**: foto, preferenze, note del proprietario.
Non può editare: microchip, data nascita, peso (quelli vengono aggiornati dallo staff durante le visite; il peso può essere letto ma non scritto in Fase 1).

Pattern: **inline edit** con stato `viewing → editing → saving → saved`. Pulsante "Modifica" su ogni sezione modificabile; cambia in "Salva"/"Annulla". Evitare form onnicomprensivi.

### Query
- `pets` where `id = :petId` (RLS applica: se non è tuo, 0 righe → 404)
- `appointments` where `pet_id = :petId` order by `scheduled_at desc` limit 10
- Su save: `update pets set ... where id = :petId` — RLS blocca se non sei l'owner

### Stati
- loading: skeleton hero + sezioni
- error (404 / RLS reject): pagina "Pet non trovato o accesso negato"
- saving (su modifica): spinner sul pulsante, campi disabilitati
- save error: inline sotto la sezione + toast

### Upload foto
Supabase Storage, bucket `pet-avatars`, path `{tenant_id}/{pet_id}.{ext}`. Resize client-side a max 1024px lato lungo prima dell'upload (usare `canvas.toBlob`). Policy bucket: read pubblico o firmato, write solo owner. **Proporre e farsi approvare.**

---

## 04.3 · Prenotazione — `/u/book` + `/u/book/confirm/:id`

**File di riferimento:** `reference/booking.jsx`, `reference/proto/proto-booking.jsx`.

### Scopo
Wizard per prenotare un appuntamento. Può arrivare con query `?petId=` (preselezionato) o senza (sceglie dopo).

### Step
1. **Pet** — scelta tra i pet del customer. Se `?petId=` è presente e valido, skip automatico a step 2.
2. **Servizio** — lista servizi del tenant (query `services` where `tenant_id = :current and is_active`). Raggruppati per categoria se il DB lo prevede. Mostrare prezzo e durata stimata.
3. **Data e ora** — calendario (mese corrente + prossimo) + slot disponibili nel giorno selezionato. Gli slot vanno letti da una **RPC lato DB** (funzione `available_slots(tenant_id, service_id, date)`) che tiene conto di orari apertura, pause, appuntamenti esistenti, durata servizio. **Proporre la firma della funzione e farla approvare** — è una decisione importante.
4. **Riepilogo + conferma** — pet, servizio, data/ora, note libere. CTA "Conferma prenotazione".

Navigazione: stepper in alto, "Indietro" possibile, "Avanti" disabilitato finché lo step corrente non è valido.

### Submit
`insert into appointments (tenant_id, customer_id, pet_id, service_id, scheduled_at, notes, status)`
con `status = 'pending'` (o `'confirmed'` in base alla convenzione del repo staff — ispezionare).

Dopo insert:
- redirect a `/u/book/confirm/:appointmentId`
- stub: chiamare `notifications.sendBookingConfirmation(appointmentId)` (funzione che in Fase 1 logga in console; interfaccia già pronta per provider reale)

### Schermata conferma
- Icona di successo
- Riepilogo grande dell'appuntamento
- "Aggiungi al calendario" (genera file `.ics` lato client — lib: nessuna, basta una funzione `buildICS()` di 30 righe)
- CTA secondaria: "Torna alla home"

### Stati
- loading step 3 (fetch slot): skeleton sulla griglia orari
- conflitto (qualcuno ha prenotato nel frattempo): inline error + re-fetch slot
- submit error: mantieni i dati, mostra banner, riprova

### Edge case importante
**Doppia prenotazione sullo stesso slot** → gestita lato DB con UNIQUE constraint o check via RPC transazionale. Scrivere la funzione `book_appointment(...)` che valida e inserisce in un'unica transazione — **non** fare insert diretto dal client. Proporre la funzione, approvare, poi implementare.

---

## 04.4 · Promozioni — `/u/promotions`

**File di riferimento:** nessun mockup dedicato — derivare il layout dalle card promo presenti in dashboard (`reference/proto/proto-dashboard.jsx`), rendendole full-page.

### Scopo
Lista di tutte le promozioni attive del tenant. Sola lettura in Fase 1.

### Query
`promotions` where `tenant_id = :current and is_active = true and (valid_to is null or valid_to >= now())` order by `display_order`.

### Layout
- Mobile: stack verticale di card
- Desktop: griglia 2 colonne

Ogni card:
- image (se presente)
- title (tipografia editoriale)
- body (testo breve)
- valid_to come scadenza (es. "Fino al 15 maggio")
- cta_label + cta_url se presenti (link esterno → `target="_blank" rel="noopener"`, oppure interno se `cta_url` inizia per `/`)

### Stati
- loading: 3 skeleton card
- empty: illustrazione semplice + "Nessuna promozione al momento. Torna presto." — niente CTA
- error: stato errore pieno pagina con "Riprova"

---

## Componenti condivisi da creare in `src/shared/ui/`

Minimo necessario per Fase 1, da design tokens:
- `Button` — varianti `primary`, `secondary`, `ghost`, `danger`; size `sm/md/lg`; stato `loading`
- `Card` — padding e radius standard
- `Input`, `Textarea`, `Select` — con label, error, helper
- `DatePicker` (può essere una lib scelta dal dev — proporre)
- `Badge` / `Tag`
- `Avatar` — con fallback iniziali
- `Skeleton` — base per shimmer
- `Modal` — se non esiste già nel repo staff
- `Toast` — sistema globale

Tutti devono rispettare i token CSS in `src/shared/tokens/tokens.css`. Se il repo staff ha già alcuni di questi, **estrarli** in shared invece di duplicarli.

---

## Accessibilità — checklist per ogni schermata

- Tutti i controlli raggiungibili da tastiera, `:focus-visible` sempre presente
- Contrasto WCAG AA minimo per ogni coppia testo/sfondo (la palette è già conforme, non inventare colori nuovi)
- `<main>` per il contenuto principale, heading hierarchy corretta (un solo `h1` per pagina)
- Form: ogni input ha `<label>` esplicito; errori annunciati via `aria-live="polite"`
- Immagini: `alt` significativo (non "immagine", non vuoto se è contenuto)
- Nessun div-button: usare `<button>` reali

---

## Fuori scope in Fase 1 (mockup esistono ma non implementare)

Le vedi nei file di reference ma **non** vanno sviluppate ora:
- Shop / Boutique (`reference/shop.jsx`, `reference/proto/proto-shop.jsx`)
- Profilo utente esteso (`reference/proto/proto-profile.jsx`)
- Carrello, richieste ordine
- Programma fedeltà, tier bronze/silver/gold (i token esistono ma non usarli)
- Notifiche push / bell

Non linkarle nella UI finale. Se un pulsante le referenzia nel mockup, va rimosso o reso disabled.
