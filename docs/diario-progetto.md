# Diario di progetto — Grooming Hub

Collante temporale del progetto. "Stato attuale" in cima, sempre aggiornata. "Cronologia" sotto, append-only, ordine cronologico inverso (più recente in cima).

Documento gestito da Cowork secondo la skill `grooming-hub-saas`.

---

## Stato attuale

*Aggiornato il 12 maggio 2026.*

- **Schema multi-tenant**: applicato sul DB demo `grooming-hub-demo` (Gate 2 chiuso, 25 aprile 2026). Demo Supabase riattivato manualmente l'11 maggio dopo auto-pause.
- **DB produzione** `grooming`: intatto, schema vecchio (`clients` legacy), 189 clienti reali. `ACTIVE_HEALTHY`.
- **App staff sul demo**: rotta — `webapp/src/lib/database.js` contiene 13 chiamate `from('clients')` su tabella droppata da M11-bis, più 3 chiamate a `customer_client_links` (anch'essa droppata) e 48 occorrenze testuali di `client_id`. Refactor previsto al Gate 5.
- **App customer**: **scaffolding + prima schermata + rifinitura visiva completati** (Step 1-5 della roadmap fast-track). Routing top-level pattern catch-all (`/u/*` → CustomerApp, `/*` → StaffApp). AuthProvider + TenantProvider attivi a livello root. Cinque pagine: `/u/login` (restyled), `/u/home` (restyled placeholder editorial), `/u/redeem/:token` (placeholder), `/u/promotions` (restyled, RLS verificata), `/u/forgot` (stub). UI shared completa: `Button`, `Card` (upgraded con shadow/radius props), `Skeleton`, `Brandmark`, `Eyebrow`, `Icon` (vocabolario SVG inline), `BackgroundDecor`. Tokens shared centralizzati in `src/shared/tokens/tokens.css` con Fraunces (Google Fonts) e radii completi. Build Vite verde (121 moduli). Pre-Gate 3 chiuso, 8 decisioni su 8 prese. Sul demo: 2 customer di test (`mario.rossi@test.example`, `luca.bianchi@test.example`, password `test1234`) e 3 promozioni seed.
- **Refactor monorepo-ready**: completato in Step 1 (commit `6948589`). `webapp/src/` ora ha `apps/staff/` + `apps/customer/` + `shared/{supabase,auth,tenant,ui,tokens,utils}/`. Top-level `App.jsx` thin shell con routing catch-all.
- **Documento partecipato salone**: tre round completati (terzo parziale, maggio 2026). Sezioni 2 e 8 ora hanno la prima risposta di Davide e Roby; restano aperti alcuni dettagli per un eventuale quarto round (pet difficili da fotografare, convenzioni interne, momenti "uffa, di nuovo" del gestionale).
- **Bundle Claude Design** (`design_handoff_customer_app/`): parzialmente superato dalle decisioni di Gate 2 e Gate 5. In particolare il signup pubblico previsto dal bundle è incompatibile con la Decisione 12 di Gate 2 ("no autocreazione customer, solo via invito").

**Prossimo passo**: preview customer consegnabile. URL pubblico aggiornato `https://grooming-hub-webapp-aish-6joizoj4m-morkdaorkggettos-projects.vercel.app` (atterra su `/u/login` per via dell'hotfix routing). Dopo: consegna a Davide e Roby per primo feedback look & feel via WhatsApp. In parallelo: Gate 5 (refactor `database.js` staff) sblocca anche l'app staff sul demo.

---

## Cronologia

### 13 maggio 2026 — Hotfix routing top-level + navigazione minima customer

**Attori**: Luigi (test visivo del deploy + segnalazione), Cowork (proposta), Code (esecuzione).

**Contesto**: prima della consegna al salone sono emersi due problemi di esperienza che andavano corretti.

**Problema 1 — Landing rotto sull'URL root.** Aprendo `https://...vercel.app/` senza prefisso `/u/login`, l'utente atterrava sul login STAFF (per via del catch-all `/*` → StaffApp). La pagina staff sul demo è rotta per Gate 5 mancante: faceva errore "Could not find the table 'public.customer_client_links' in the schema cache". Davide e Roby avrebbero visto l'errore e pensato che l'app non funzioni.

**Fix 1**: in `src/App.jsx` aggiunta una rotta esplicita `/` PRIMA del catch-all che fa `<Navigate to="/u/login" replace />`. La StaffApp resta raggiungibile via path interni (`/dashboard`, `/login`, `/portal`) — non scompare, semplicemente non è più la landing default. Quando Gate 5 sblocca lo staff, valuteremo se cambiare la regola.

**Problema 2 — Le promozioni invisibili.** Dopo login, `/u/home` non aveva alcun link a `/u/promotions`. Davide e Roby sarebbero usciti dalla preview credendo che "non c'è altro" — non avrebbero mai visto il pezzo "vero" di Step 3.

**Fix 2**: aggiunto un CTA secondary sotto la sub copy della home, "Guarda le promozioni del salone" → `/u/promotions`. Reciprocamente, in `/u/promotions` aggiunto link "← Torna alla home" in alto (o brandmark cliccabile, dettaglio cosmetico). Loop esplicito home ↔ promozioni.

NON è stata aggiunta una nav globale (TopNav + BottomNav come da `proto-dashboard.jsx`): sarebbe sovradimensionata per due sole pagine. Quando arriveranno Dashboard reale, Scheda pet, Prenotazione (Step 6+), la nav globale avrà senso.

**Lavori completati**:

- Edit `src/App.jsx` con redirect `/` → `/u/login`. Commit di hotfix routing.
- Edit `src/apps/customer/pages/Home.jsx` con CTA a `/u/promotions`.
- Edit `src/apps/customer/pages/Promotions.jsx` con link "← Torna alla home" in alto.
- Build verde.
- Redeploy preview. Nuovo URL: `https://grooming-hub-webapp-aish-6joizoj4m-morkdaorkggettos-projects.vercel.app`.
- Smoke test HTTP 200 sui path principali.
- Verifica visiva da Luigi: aprendo l'URL pelato si atterra correttamente sul login customer; dopo login si vede la home placeholder editorial; il loop home ↔ promozioni funziona.

**Prossimo passo**:

- Consegna URL a Davide e Roby via WhatsApp (Cowork ha la bozza del messaggio nei turni precedenti).

---

### 13 maggio 2026 — Step 5 della roadmap fast-track: rifinitura visiva customer app

**Attori**: Luigi (segnalazione di gap visivo), Cowork (analisi reference + prompt), Code (implementazione).

**Contesto**: dopo la verifica visiva di Step 4, Luigi ha segnalato che la preview "non parla la lingua" del bundle Design. Cowork ha riconosciuto un gap di calibrazione: aveva letto i sei markdown del bundle ma mai i file della cartella `reference/` (auth.jsx, proto-auth.jsx, proto-dashboard.jsx, shared-ui.jsx, tokens.css). Quei file contenevano il *vocabolario visivo* del prodotto. Step 5 corregge il gap senza riprodurre pixel-perfect i prototipi: estrae pattern e li applica.

**Verifica preliminare**: `src/apps/customer/pages/Login.jsx` era già pagina dedicata (creata in Step 2). Il "🐶 Grooming Hub — Gestisci i tuoi clienti a quattro zampe" + "Made with ❤️ for groomers" che Luigi aveva visto venivano dalla pagina staff `/login`, raggiunta dal catch-all `/*` → StaffApp se si arriva a `/` senza prefisso `/u`. Step 5 quindi è solo restyle visivo, niente porting di logica.

**Pattern estratti dal bundle reference e applicati**:

- **Fraunces** (font-serif Google Fonts) caricata via `@import` nel nuovo file `src/shared/tokens/tokens.css` — separato da `index.css` per non interferire col Tailwind dello staff. Import linkato in `main.jsx`.
- **Radii completi** (`--r-sm/-md/-lg/-xl/-full`) centralizzati nei tokens.
- **Eyebrow** uppercase 11px / letter-spacing 0.22em / weight 700 come marcatore di sezione. Componente nuovo `src/shared/ui/Eyebrow.jsx` con prop `withRule` per la linea breve a sinistra.
- **Brandmark** customer-side: rounded square primary + paw SVG + wordmark "Grooming Hub" in Fraunces. Componente nuovo `src/shared/ui/Brandmark.jsx`.
- **BackgroundDecor**: due gradient radiali (primary 12% top-left, secondary 8% bottom-right). Componente nuovo `src/shared/ui/BackgroundDecor.jsx`.
- **Card upgraded**: shadow discreta (`0 1px 2px + 0 12px 40px -24px`), props `radius` (sm/md/lg/xl) e `padding` configurabili.
- **Icon vocabulary**: paw, clock, sparkle, heart, whatsapp, logout, ecc. — componente nuovo `src/shared/ui/Icon.jsx` derivato da `shared-ui.jsx` del bundle.
- **H1 Fraunces** weight 500 letter-spacing negativo, con italic primary sui nomi (es. *"La tua **area personale**."*).

**Pagine restylate**:

- **`/u/login`**: layout AuthCard centrata, H1 Fraunces "Bentornato", sub "Accedi al tuo account per gestire prenotazioni e i tuoi pet", input height 44 con trailing link "Password dimenticata?" → `/u/forgot`. Footer asciutto con link `/u/redeem` ("Hai ricevuto un invito dal salone?"). NIENTE social buttons, NIENTE link "Registrati" pubblico (Decisione 12 Gate 2), NIENTE checkbox "Resta connesso".
- **`/u/home`**: Brandmark in alto, Eyebrow "BENTORNATO, {NOME}" con rule, H1 Fraunces "La tua area personale." (con italic primary), sub paragraph esplicativo (rimossa la copy dev-facing "Schermata placeholder. La dashboard reale arriva nello step successivo"), CTA secondary outline "Esci" con icona logout in basso a destra.
- **`/u/promotions`**: Brandmark + Eyebrow "PROMOZIONI" + H1 Fraunces italic "del momento". Card promo arricchita: Eyebrow "Promo" + title Fraunces + body + scadenza con icona clock inline + CTA con icona WhatsApp quando l'URL è `wa.me`. Padding 20, radius lg, ombra discreta.

**Pagina nuova creata**: `/u/forgot` come stub (il link "Password dimenticata?" del login era nello spec ma senza target; meglio uno stub di un link rotto). Il flusso reale `resetPasswordForEmail` resta da implementare in step successivo.

**Decisioni operative di Code in autonomia**:

1. **Responsive via `window.matchMedia + state`** invece di CSS media query. Coerente col pattern inline-style del bundle reference (che usava `viewport === 'mobile'` da useApp state) ma non idiomatico React puro — può dare guai con SSR in futuro. Accettabile per ora.
2. **Tokens in file dedicato** (`src/shared/tokens/tokens.css`) invece di toccare `src/index.css` (che ha Tailwind dello staff). Più sicuro.
3. **Stub `/u/forgot`** aggiunto per non lasciare link rotto. Cowork conferma scelta.
4. **Brandmark wordmark in `--color-text-primary`** invece di colore ereditato. Leggibile su entrambi i fondi (chiaro app, gradient decor).

**Lavori completati**:

- 13 file modificati, +881/-168 (al netto di nuovi file UI shared, le tre pagine restylate, tokens nuovi, stub forgot).
- Build verde (121 moduli, 1.00s, 0 errori).
- Commit `bed5eb4`.
- Smoke test HTTP 200 ancora positivo sul deploy `bp91vkrap` di Step 4 (che però serve il *vecchio* aspetto).

**Aperto**:

- **Redeploy preview**: il deploy `bp91vkrap` serve ancora il bundle di Step 4. Un `vercel deploy` rinfresca con la nuova estetica.
- **Test visivo del nuovo aspetto** in browser, da fare dopo il redeploy.
- **Padding chunk size Vite** ancora 589 kB (warning pre-esistente, non bloccante).

**Prossimo passo**:

- Redeploy preview (5 minuti). Poi verifica visiva. Poi consegna URL a Davide e Roby.

---

### 12 maggio 2026 — Step 4 della roadmap fast-track: vercel link + primo deploy preview

**Attori**: Luigi, Cowork, Code.

**Lavori completati**:

- **Vercel link** del main worktree al progetto `grooming-hub-webapp-aish` (preview-only, distinto dal `grooming-hub-webapp` di produzione). `.vercel/` aggiunto a `.gitignore`. Commit `e5aa92c`.
- **Env vars Supabase**: già presenti sul progetto `-aish` da 47 giorni, configurate correttamente sul demo (`qttpinkslhenxrsbhhhg`). Code ha verificato i valori via `vercel env pull --environment=preview` e ha deciso correttamente di NON sovrascrivere.
- **Deploy preview**: completato (`readyState: READY`, build 3.01s). URL: `https://grooming-hub-webapp-aish-bp91vkrap-morkdaorkggettos-projects.vercel.app`.

**Side effect non bloccante ma da gestire — Vercel Deployment Protection**:

Il progetto `-aish` ha la Deployment Protection abilitata (SSO Vercel), default ragionevole per progetti aziendali. Tutti gli URL preview ritornano HTTP 401 con cookie `_vercel_sso_nonce` finché non si entra come `morkdaorkggetto`. I 3 smoke test (`/`, `/u/login`, `/u/promotions`) hanno restituito 401 per questo motivo, NON per problemi di build o env.

**Decisione di prodotto — Deployment Protection differenziata per ambiente**:

- Per `grooming-hub-webapp-aish` (preview-only, dati di test sul demo): **disabilitata**. I dati sono finti (`mario.rossi@test.example`, 3 promozioni seed). Anche se l'URL trapelasse, niente di sensibile esposto. Necessario per poter mostrare la preview al salone con un click.
- Per `grooming-hub-webapp` (production, prod Supabase con 189 clienti reali): **resta abilitata** sempre. Decisione registrata qui per memoria futura — la Deployment Protection di un progetto di produzione non si disabilita.

Azione manuale richiesta a Luigi (1 minuto): Vercel Dashboard → progetto `grooming-hub-webapp-aish` → Settings → Deployment Protection → Disabled. Da fare prima di consegnare l'URL al salone.

**Decisioni operative di Code in autonomia** (accettate):

1. Env vars NON ricreate: già presenti sul progetto da 47 giorni con valori corretti. Sovrascriverle sarebbe stato no-op (best case) o distruttivo (worst case). Verifica via `vercel env pull` invece che add.
2. Anon key legacy JWT mantenuta (coerente con `.env.local` locale e con la config di 47 giorni fa). Migrazione a publishable key `sb_publishable_*` cosmetica, fuori scope di Step 4.
3. Diario non incluso nel commit Step 4: scelta corretta — Cowork stava aggiornando il diario in parallelo. Una entry "Step 4" è scritta da Cowork al ritorno, con URL + nota Deployment Protection (questa).

**Aperto**:

- **Disabilitazione Deployment Protection** sul progetto `-aish` (azione manuale Luigi). Una volta fatta, ri-eseguire i 3 smoke test e confermare 200.
- **Verifica visiva in browser** della preview deployata (Luigi può aprire l'URL e navigare login → home → promozioni una volta tolto l'SSO).
- **Sostituire URL preview con dominio custom** (es. `clienti-demo.groominghub.it` o simile) come refinement futuro, non urgente.
- **Push dei 10+ commit locali** della giornata su `origin/feat/customer-app`. Da decidere quando — consigliato dopo che la preview è pubblica e verificata.

**Prossimo passo**:

- Disabilitazione SSO + smoke test ri-verificati = preview pubblica navigabile. Da lì si può consegnare l'URL a Davide e Roby per il primo "look & feel" feedback. In parallelo, il Gate 5 (refactor `database.js`) può iniziare quando vuoi.

---

### 12 maggio 2026 — Step 3 della roadmap fast-track: seed dati di test + schermata `/u/promotions`

**Attori**: Luigi, Cowork, Code.

**Lavori completati**:

- **Seed sul demo** (via MCP `apply_migration` / `execute_sql`, niente migration files):
  - 2 customer di test: `mario.rossi@test.example`, `luca.bianchi@test.example` (password `test1234`, phone E.164, tenant `grooming-hub`, role `customer`). Righe in `auth.users` + `auth.identities` + `public.customers` + `public.tenant_memberships`.
  - 3 promozioni sul tenant pilota: "Toelettatura primaverile" (attiva, con CTA WhatsApp), "Cliente del mese" (attiva, no CTA), "Promo scaduta (per test empty filter)" (inattiva + scaduta, per verificare il filtro RLS).
- **Schermata `/u/promotions` implementata**: pagina nuova in `apps/customer/pages/Promotions.jsx`, route aggiunta a `CustomerApp.jsx`, hook custom in `apps/customer/hooks/usePromotions.js`.
- **Stati**: loading (3 skeleton card), empty con copy "Nessuna promozione attiva al momento. Torna a trovarci.", error con bottone "Riprova", success.
- **Layout responsive** via CSS grid `repeat(auto-fit, minmax(min(100%, 420px), 1fr))` (decisione autonoma Code, vedi sotto).
- **Auth gate** via `useRequireCustomer()`.
- **Build verde**: 116 moduli, 980ms, 0 errori. Warning chunk size pre-esistente, non bloccante.
- **E2E test via REST API** (no Chrome MCP in sessione):
  1. POST `/auth/v1/token?grant_type=password` con `mario.rossi@test.example` → `access_token` rilasciato ✓
  2. GET `/rest/v1/promotions` con quel token (SENZA filtro `is_active` lato client) → 2 righe ritornate (le due attive). La promo scaduta è esclusa server-side dalla policy RLS `promotions_customer_select_active` di M32.
  3. **RLS verificata funzionante**: la sicurezza non è solo in superficie nel client ma è enforced sul DB.
- Commit `b745e90` (4 file, +262/-2).

**Decisioni operative di Code in autonomia** (accettate, registrate):

1. **Hook in cartella dedicata** `apps/customer/hooks/` invece che inline. Logica non-banale (dipendenza da `useTenant`, doppio filtro con `or` su `valid_to`, refetch), merita estrazione e riusabilità futura per test/storia.
2. **Filtro `is_active` + `valid_to` doppiato client-side** anche se la RLS lo applica già server-side. Difensivo per chiarezza del contratto della query, ma la RLS resta il vero gate di sicurezza (verificato in E2E).
3. **CSS grid `auto-fit minmax(min(100%, 420px), 1fr)`** invece di media query a 960px. Più conciso e robusto su viewport intermedie. *Nota Cowork*: il comportamento differisce leggermente dal bundle Design (che parlava di "Mobile stack / Desktop ≥960px 2 colonne") — col grid auto-fit ci sono 2 colonne già da ~440px, quindi anche su tablet portrait. Per Step 3 va bene, ma quando aggiungeremo Dashboard e Scheda pet vale la pena decidere se uniformare ai breakpoint del Design system o tenere `auto-fit` come pattern generale.

**Aperto**:

- **Test visivo browser** saltato (Chrome MCP non attivo). Luigi può fare un'occhiata con `npm run dev` localmente quando vuole verificare l'estetica.
- Email dei customer di test su dominio `@test.example`: non realistiche ma valide per i test. Per la prima preview reale al salone si valuterà se creare customer demo "vestiti" meglio.
- Filosofia copy / brand voice: la copy "Promozioni del momento" + "Le iniziative attive del salone" è prudente come da decisione di prodotto, ma vale la pena un check da Davide e Roby quando vedranno la preview live.

**Prossimo passo**:

- **Step 4 della roadmap fast-track**: `vercel link` del repo (non ancora linkato sul main worktree) + primo deploy preview con env Supabase del demo. Tempo stimato 30 minuti. Sessione Code dedicata.

---

### 11 maggio 2026 — Step 1 e Step 2 della roadmap fast-track: refactor monorepo + scaffolding customer

**Attori**: Luigi, Cowork, Code.

**Lavori completati**:

- **Step 1** (commit `6948589`): refactor del codice esistente nella struttura monorepo-ready. `webapp/src/` ora ha `apps/staff/` (codice esistente preservato) + `apps/customer/` (placeholder) + `shared/{supabase,auth,tenant,ui,tokens,utils}/` (vuoto). Top-level `App.jsx` thin shell. Build verde. `npm run build` 103 moduli, 1.18s.
- **Step 2** (commit `633d7fe`): scaffolding customer. AuthProvider + `useRequireCustomer` in `shared/auth/`; TenantProvider hardcoded sul tenant pilota in `shared/tenant/`; tre pagine in `apps/customer/pages/` (`Login.jsx`, `Home.jsx`, `Redeem.jsx`); `CustomerApp.jsx` router interno; tre componenti UI shared (`Button`, `Card`, `Skeleton`); supabase client estratto in `shared/supabase/client.js`. Build verde, 114 moduli, 883ms.
- `.gitignore` aggiornato per coprire `.claude/` e `grooming-app/` (embedded repos di lunga data, finalmente fuori da `git status`).

**Decisioni operative di Code in autonomia** (accettate, da registrare):

1. **Routing top-level pattern catch-all**: `/u/*` → CustomerApp, `/*` → StaffApp. Evita la riscrittura di tutti i `<Route>`/`<Link>`/`<Navigate>` interni dello staff (che vivono a `/dashboard`, `/login`, `/portal`, ecc.). Migrazione a `/staff/*` rinviabile come refactor separato se servirà.
2. **Supabase client come shim re-export** in `apps/staff/lib/supabaseClient.js` invece di find-replace su 9 file. Il canonico ora è `shared/supabase/client.js`. Lo shim sparisce al Gate 5.
3. **`AuthContext.currentRole` semplificato in Step 2**: restituisce `'customer'` se l'utente ha questa membership in qualsiasi tenant, altrimenti il role della prima membership. Filtraggio per `tenantId` attivo rinviato a Step 3+ (caso multi-tenant raro ma previsto da `03-auth-e-rls.md`).
4. **StaffApp continua su AuthContext interno proprio**: i provider shared sono attivi top-level ma NON cablati ancora in StaffApp. L'app staff usa ancora `onAuthStateChange` dal vecchio path (via shim). Unificazione di Auth tra staff e customer al Gate 5.

**Aperto**:

- **Test E2E del login customer**: per testarlo serve un customer di test sul demo. Sul demo oggi c'è solo `profiles.role='operator'`, nessun customer. Strategia proposta: creare manualmente 1-2 customer fittizi via SQL diretto su `auth.users` + `customers` + `tenant_memberships` come prerequisito di Step 3. Il flusso reale di redenzione invito (`accept_customer_invite` + Redeem page reale, non placeholder) arriva in step successivo.
- **Gate 5** (refactor `database.js` + cablaggio StaffApp sui provider shared + eliminazione shim Supabase): può procedere in parallelo a Step 3, non blocca la preview customer.
- **Warning chunk size Vite** (589 kB minified): pre-esistente, non bloccante. Da affrontare a Gate "performance" futuro.

**Prossimo passo**:

- **Step 3 della roadmap fast-track**: schermata Promozioni (la "prova del circuito" come da bundle Design gate 7). Prerequisito leggero: customer di test sul demo. Sessione successiva.

---

### 11 maggio 2026 — Chiusura pre-Gate 3: cinque decisioni di prodotto residue

**Attori**: Luigi, Cowork.

**Decisioni prese** (in versione operativa, ognuna pronta per il codice):

1. **Registrazione customer**: solo via `accept_customer_invite(token)`. Route applicativa `/u/redeem/:token`. Nessun `/u/register` pubblico. Coerente con Decisione 12 di Gate 2 e con la postura "il salone mantiene il controllo della relazione".
2. **Comunicazioni**: WhatsApp è il canale primario, l'app usa deep link `https://wa.me/<numero-salone>?text=<pre-fill>` nelle CTA pertinenti (contatto salone, "sposta/annulla appuntamento"). Nessuna chat in-app. Il numero del salone vive in `tenants.settings` (jsonb).
3. **Promozioni Fase 1**: sola lettura. Copy prudente "Promozioni del momento" — non confondere con un futuro programma fedeltà. Tessera fedeltà candidata Fase 2.
4. **Biforcazione 7 giorni nel flusso prenotazione**: SOFT, non hard-block. Sotto 7 giorni la prenotazione è permessa con interstitial *"Per appuntamenti entro una settimana preferiamo contatto diretto. Vuoi mandare comunque la richiesta?"* → procede con `appointments.status = 'pending'` + flag di urgenza visibile allo staff (calcolato a runtime da `requested_at - scheduled_at < 7 days`, oppure colonna esplicita da definire al Gate 5).
5. **Prezzi**: NON mostrati nell'app customer in Fase 1. La prenotazione customer è una *richiesta*, non un acquisto. La schermata mostra pacchetto (Bagno / Toelettatura Completa) + durata indicativa + nota *"prezzo confermato dal salone in base a taglia e pelo del tuo pet"*. Lo staff conferma con prezzo via WhatsApp o al contatto. Coerente con `status='pending'` e con la postura non-transazionale del salone. Fase 2 può aggiungere "a partire da".

**Implicazione**: pre-Gate 3 chiuso, 8 decisioni su 8 prese. Pronti per la fase di scaffolding.

**Prossimo passo**: Step 1 della roadmap fast-track — refactor monorepo `webapp/src/` → `webapp/src/apps/{staff,customer}` + `webapp/src/shared/{supabase,auth,tenant,ui,tokens,utils}`. Sessione Code immediata.

---

### 11 maggio 2026 — Verifica schema notes + enforcement column-level

**Attori**: Luigi (ha confermato le raccomandazioni Cowork), Cowork (analisi), Code (verifica schema demo).

**Decisioni prese**:

- **Niente migration di rinomina dei campi notes.** Lo schema esistente li ha già con nomi più espressivi: `customers.operator_notes`, `pets.owner_notes` (customer-modificabile), `pets.internal_notes` (staff-only). L'UI mapperà "Note" senza esporre la nomenclatura tecnica.
- **Distinzione `owner_notes` / `internal_notes` su pets mantenuta.** Coerente con bundle Design + risposta del salone. `owner_notes` = ciò che il customer condivide; `internal_notes` = ciò che lo staff annota e non condivide.
- **Enforcement column-level via trigger BEFORE UPDATE.** PostgreSQL non offre RLS a livello colonna; le policy attuali (`customers_self_update`, `pets_customer_update`) permettono al customer di toccare anche i campi staff-only. Migration aggiuntiva con due trigger che, se l'attore non ha `has_tenant_any_staff_access(tenant_id)`, ripristinano `OLD.operator_notes` / `OLD.internal_notes`. File: `supabase/migrations/20260511070742_enforce_staff_only_notes_columns.sql`. Applicata al demo nella stessa sessione (commit `d440131`).
- **Discrepanza migration chiusa**: 34 file in repo = 34 entries in `schema_migrations` del demo. Il "33" del piano era refuso testuale ("23 nuovi" → in realtà 24 nuovi). Nessuna azione correttiva.

**Lavori completati**:

- Code ha eseguito sei query di verifica sul DB demo: `information_schema.columns` su customers e pets, `pg_policies` per RLS attive, `supabase_migrations.schema_migrations` per conteggio applicate.
- Cowork ha scritto la migration SQL di enforcement (due trigger BEFORE UPDATE) e l'ha salvata nel main worktree.
- Code ha applicato la migration al demo. Approccio scelto: worktree subordinato (già linkato). `supabase db push` ha però fallito con `password authentication failed for user "postgres"` (password del pooler probabilmente ruotata dopo la riattivazione post-pausa). Fallback usato: `mcp__supabase__apply_migration` via OAuth MCP binding, apply riuscito. Timestamp generato dal MCP a runtime: `20260511070742` — file rinominato di conseguenza nel repo per allineamento (era `20260511120000` come placeholder di Cowork). Trigger verificati: 2 righe in `pg_trigger`. Migration registrata: 1 riga in `schema_migrations`. Test funzionale del trigger col customer-token non eseguito (avrebbe richiesto setup di due sessioni `auth` distinte staff/customer, fuori budget di tempo).
- Commit `d440131` su `feat/customer-app`: `feat(db): enforce staff-only enforcement on notes columns via BEFORE UPDATE triggers` (2 file, +111 / -2). Push NON eseguito.
- Aggiornato lo "Stato attuale" del diario: count delle decisioni prese del pre-Gate 3 passa da 1 a 3 su 8.
- Aggiornato `environment-map.md` con nota operativa sulla password DB ruotata dopo la riattivazione del demo.
- **Verifica del commit orfano `c9a3678` su `main`**: ispezione preventiva da parte di Code prima del cherry-pick → il diff (helper `userOwnsClients` + auto-repair `role='operator'` in `getUserProfile`) risulta **già presente in `feat/customer-app`**, assorbito da merge precedenti (probabilmente via worktree `claude/kind-faraday-956d1a`). Cherry-pick eseguito ma a diff vuoto, chiuso con `--skip`. Il count `git rev-list --left-right` "1 commit solo su main" è metadata SHA-based, non un problema funzionale: il futuro merge `feat → main` non duplicherà la modifica. Blocker chiuso senza ulteriori commit. *Nota collaterale*: la hotfix continua a usare `.from('clients')` come le altre 13 chiamate orfane di `database.js`, sarà sistemata al Gate 5. Commit di chiusura sessione `d587843` con le note finali al diario e a environment-map.

**Aperto**:

- Password DB demo da rigenerare/recuperare dal dashboard Supabase (Settings → Database → Connection string) per riattivare `supabase db push` da CLI. Per ora apply alternativi via MCP funzionano.
- Test funzionale del trigger column-level con due token (staff + customer) rinviato a sessione di test RLS dedicata.
- Verificare interazione tra trigger `SECURITY DEFINER` e `auth.uid()` dentro eventuali RPC future: se una RPC chiamata da customer fa UPDATE su `customers`/`pets`, `auth.uid()` resta del chiamante customer e il trigger blocca correttamente. Comportamento atteso ma da rivedere quando entreranno in scena `book_appointment` e simili.

**Prossimo passo**:

- Sessione chiusa. Restano sul tavolo per le prossime sessioni: 5 decisioni di prodotto residue del pre-Gate 3 (da chiudere rapidamente con un round Chat), `vercel link` da configurare prima del primo deploy preview, password DB demo da recuperare dal dashboard, test funzionale RLS. **Direzione di marcia**: roadmap fast-track verso preview navigabile dell'app customer.

---

### 11 maggio 2026 — Terzo round parziale con Davide e Roby (sezioni 2 e 8)

**Attori**: Luigi (ha inviato le domande via WhatsApp), Davide e Roby (hanno risposto), Cowork (ha integrato risposte nel documento partecipato e nel diario).

**Decisioni emerse dalla risposta del salone**:

- **Foto del pet — esiste una foto principale, con criterio funzionale.** Per il gestionale staff la foto principale di un pet è «quella che descrive meglio le condizioni del cane e la sua riconoscibilità all'atto dell'accoglienza». Non è una foto affettiva: è funzionale, scelta dallo staff, e va riaggiornata con le nuove accoglienze.
- **Foto affettiva del customer — coesistenza approvata.** Sulla app cliente, il proprietario può caricare la sua foto preferita del pet senza che dia fastidio al gestionale. Le due foto sono *due viste* dello stesso pet: vista staff (operativa, da `client-photos`) e vista customer (affettiva, da `pet-avatars`).
- **Note libere su clienti e pet — confermate come pratica quotidiana.** Davide e Roby «aggiungono sempre note sia sul cliente che sul pet». Sono appunti operativi internal-only, da prevedere come campi `notes text` libero su `customers` e su `pets`. Non in conflitto con la Decisione 3 di Gate 5 (che escludeva campi qualitativi *strutturati*, non testo libero).

**Lavori completati**:

- Aggiornato `webapp/docs/workflows/flussi-operativi-salone.md` con un terzo round parziale: sezione 2 (foto pet) + sezione 8 (note libere), e storico revisioni in fondo.
- Aggiornato lo "Stato attuale" del diario per riflettere il terzo round.

**Aperto**:

- **Verifica schema**: confermare se `customers.notes` e `pets.notes` esistono già nel DB demo dopo M11-bis. Il bundle Design li prevedeva (vedi `02-database.md`), il piano Gate 2 non li menziona esplicitamente. Da ispezionare in sessione Code (query su `information_schema.columns` per le due tabelle).
- **Eventuale migration aggiuntiva** se i campi mancano: `ALTER TABLE customers ADD COLUMN notes text;` e/o `ALTER TABLE pets ADD COLUMN notes text;`. Aggiungere policy RLS staff-only (no SELECT customer).
- **Decisione UX fallback foto pet**: nella scheda customer, quando il proprietario non ha caricato la sua foto, mostriamo (a) la foto operativa più recente dello staff, oppure (b) un avatar con iniziali del pet? Proposta Cowork: opzione (b) — la foto operativa potrebbe non essere quella che il cliente vuole vedere come "home page del suo pet". Da confermare in sede di decisione di prodotto pre-Gate 3.
- **Punti residui sezioni 2 e 8 del documento partecipato**: pet difficili da fotografare, convenzioni interne tra staff, momenti "uffa, di nuovo", cosa non vorreste perdere del gestionale attuale. Eventuale quarto round, non urgente.

**Prossimo passo**:

- Sessione Code di verifica schema (`customers.notes` e `pets.notes`) + eventuale migration aggiuntiva. 15-20 minuti.

---

### 11 maggio 2026 — Apertura diario, archiviazione documenti pre-skill, sintesi stato dell'arte

**Attori**: Luigi, Cowork, Code.

**Decisioni prese**:

- Archiviare in un'unica operazione gli 8 file storici (pre-skill, pre-Gate 2) di root e di `/docs/` (root) in `webapp/docs/archivio/2025-2026-iniziali/`. Nessun file referenziato da codice o documenti vivi, verificato via grep da Code.
- Spostare `environment-map.md` in `webapp/docs/` invece di archiviarlo (ancora utile per orientamento ambienti Vercel/Supabase), con TODO in cima sui punti datati.
- Lasciare in piedi temporaneamente la cartella `/docs/` (root) ormai vuota — il sandbox Cowork non ha permessi per rimuoverla; rimozione manuale a carico di Luigi.
- Workflow di lavoro a tre attori (Cowork pianifica, Code esegue sul filesystem nativo macOS) confermato come pattern operativo quando Cowork incontra limiti di sandbox su `.git/`.

**Lavori completati**:

- Creata cartella `webapp/docs/archivio/2025-2026-iniziali/`.
- Archiviati 8 file: `CODEX_HANDOFF.md`, `COWORK_INSTRUCTIONS.md`, `FASE4B_SETUP_INSTRUCTIONS.md`, `PROMPT_COWORK.md`, `STRUTTURA_CARTELLE.md` (dalla root), `api-spec.md`, `schema.md`, `logic.md` (da `/docs/` root).
- Spostato `environment-map.md` da `/docs/` (root) a `webapp/docs/` con TODO di revisione in cima.
- Code ha prodotto un report tecnico/ambientale di stato in `_temp_updates/stato-arte-2026-05-11.md` (verifica livelli git, codice staff, migration Supabase, Vercel, ambienti Supabase).
- Riattivato manualmente il progetto Supabase `grooming-hub-demo` (era `INACTIVE` per auto-pause).
- Commit `11c9162` su `feat/customer-app`: `docs: archive early Cowork instructions and pre-Gate 2 specs` (9 file aggiunti, 1571 righe). Push non eseguito.
- Creato questo diario (`webapp/docs/diario-progetto.md`).

**Aperto**:

- Le 7 decisioni di prodotto del pre-Gate 3, mappate dal report di lettura Cowork ma non ancora discusse. Tra le più strutturali: contraddizione `/u/register` vs Decisione 12 di Gate 2 (no autocreazione customer); biforcazione clienti nuovi/storici nel flusso prenotazione; semplificazione del wizard servizi (due pacchetti, non un menù modulare); distinzione "consiglio condivisibile" vs "nota interna" nelle visite; rapporto tra app e WhatsApp come canale primario; perimetro delle promozioni Fase 1 rispetto all'aspettativa fedeltà del salone.
- Discrepanza migration: il piano dichiara 33 file (10 retrospettivi + 23 nuovi), in repo all'11 maggio ne risultano **34**. Da verificare quale file aggiuntivo e se è applicato sul demo. Richiede query su `supabase_migrations.schema_migrations`.
- Commit orfano su `main`: `c9a3678 Protect operator accounts from customer bootstrap` (25 aprile 2026, hotfix di produzione) mai mergiato in `feat/customer-app`. Da cherry-pickare prima del prossimo merge feat→main.
- `webapp/.vercel/project.json` non esiste — repo non linkato a Vercel localmente. Da fare con `vercel link` prima del primo deploy dell'app customer.
- Sezioni 2 (foto pet identificativa vs operativa) e 8 (zona grigia delle pratiche quotidiane) del documento partecipato `flussi-operativi-salone.md` in attesa di terzo round con Davide e Roby.
- Cartella `/docs/` (root) vuota da rimuovere manualmente: `rmdir /Users/luigimaisto/Desktop/grooming-hub-web/docs`.
- Cleanup di `_temp_updates/stato-arte-2026-05-11.md` (skill §5: cartella di lavoro temporaneo da svuotare a fine uso).
- "Branch zoo" del repo: 12 branch locali, di cui 7 `codex/*` orfane mai mergiate. Cleanup non urgente.

**Prossimo passo**:

- Aprire la sessione sulle 7 decisioni di prodotto aperte del pre-Gate 3 in un futuro file dedicato `webapp/docs/pre-gate3-decisioni.md`. Cowork ha la mappa di partenza nel report di lettura del primo turno di questa sessione (10 documenti letti, 7 punti di tensione identificati).

---

### Aprile 2026 — Sintesi retroattiva pre-Gate 3

> Entry compatta scritta a posteriori l'11 maggio 2026 sulla base dei materiali esistenti (commit history, `migration-plan.md`, `gate5-design-decisions.md`, `flussi-operativi-salone.md`, bundle Claude Design). Non sostituisce una ricostruzione puntuale del lavoro di aprile — è una fotografia di stato al momento dell'apertura del diario.

**Attori**: Luigi, Chat, Code (sintesi a posteriori da Cowork).

**Decisioni prese** (registrate in altri documenti):

- **Gate 2 chiuso**: 19 punti decisionali registrati in `webapp/supabase/docs/migration-plan.md`. Punti chiave: split atomico `clients` → `customers` + `pets` (M11-bis prod-safe con backfill via `legacy_client_id`), nuove tabelle multi-tenant (`tenants`, `tenant_memberships`, `profiles`, `customers`, `promotions`, `services`), RLS per tabella con helper `has_tenant_access`, bucket `pet-avatars` separato da `client-photos`, **no autocreazione customer al signup** (solo via `accept_customer_invite`), schema `customers` Modello B con `phone NOT NULL` in formato E.164.
- **33 file SQL scritti** in `webapp/supabase/migrations/` (10 retrospettivi + 23 nuovi) — applicati sul demo `grooming-hub-demo` il 25 aprile 2026. *Nota*: il count effettivo in repo all'11 maggio è 34, discrepanza da chiarire.
- **Gate 5 preliminare**: 5 decisioni registrate in `webapp/supabase/docs/gate5-design-decisions.md`. Vista staff = lista pet (non clienti); inserimento cliente+pet in schermata unica con transazione DB; `contacts` deprecato e fuso in `customers`; bucket vetrina vs operativo mantenuti separati; `pets.owner_user_id` mantenuto come debito tecnico per Fase 2.
- **Pre-Gate 3 — prima decisione**: prenotazione customer creata in stato `pending` in attesa di conferma staff. Coerente con il posizionamento "il salone mantiene il controllo della relazione" (ISTRUZIONI.md, principio 2).
- **Documento partecipato `flussi-operativi-salone.md`**: due round con Davide e Roby integrati. Nove osservazioni di prodotto fissate (luogo di accoglienza, due fasi di raccolta dati, foto operativa, listino a due pacchetti, visita = singolo appuntamento, biforcazione clienti nuovi/storici, WhatsApp come canale primario, missione naturalistica come postura del salone).

**Lavori completati** (verificati da Code l'11 maggio):

- 22 commit su `feat/customer-app` rispetto a `main` (Gate 2 + fix apply + docs partecipativi).
- 33 (o 34) migration applicate sul DB demo. Stato registrato il 25 aprile in `schema_migrations`: 33 entry.
- Documento partecipato in due round con il salone.
- Bundle Claude Design (`design_handoff_customer_app/`) consegnato come materiale di riferimento per Fase 1 dell'app customer.

**Aperto** (eredità a maggio):

- 7 decisioni di prodotto del pre-Gate 3 (vedi entry dell'11 maggio per il dettaglio).
- Refactor `database.js` staff (Gate 5 vero, ancora da pianificare).
- Migration produzione (Gate "production plan", ancora da definire).
- Sezioni 2 e 8 del documento flussi salone.

**Prossimo passo** (storico):

- Sessione di apertura del diario e ricalibratura, eseguita l'11 maggio 2026 — vedi entry sopra.

---

## Storico revisioni del diario

- **11 maggio 2026** — Diario creato. Sei entry: Step 1 e Step 2 roadmap fast-track, chiusura pre-Gate 3, verifica schema notes + enforcement column-level, terzo round parziale con Davide e Roby (sezioni 2 e 8), apertura diario + archiviazione + sintesi stato dell'arte, entry retroattiva di aprile 2026.

- **12 maggio 2026** — Step 3 e Step 4 della roadmap fast-track: seed customer + seed promozioni sul demo, schermata `/u/promotions` con RLS verificata via E2E REST, vercel link a `grooming-hub-webapp-aish` + primo deploy preview (gated da SSO in attesa di disabilitazione manuale). Settima e ottava entry.

- **13 maggio 2026** — Step 5 della roadmap fast-track: rifinitura visiva customer app basata sui pattern estratti dai prototipi del bundle Design (cartella `reference/`). Fraunces, Eyebrow, Brandmark, BackgroundDecor, Icon vocabulary, Card upgraded. Tre pagine restylate (`/u/login`, `/u/home`, `/u/promotions`) + stub `/u/forgot`. Nona entry. Più: hotfix routing top-level (`/` → `/u/login`) + navigazione minima customer (CTA Home → Promotions + link "Torna alla home"). Decima entry.
