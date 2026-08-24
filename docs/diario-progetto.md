# Diario di progetto — Grooming Hub

Collante temporale del progetto. "Stato attuale" in cima, sempre aggiornata. "Cronologia" sotto, append-only, ordine cronologico inverso (più recente in cima).

Documento gestito da Cowork secondo la skill `grooming-hub-saas`.

---

## Stato attuale

*Aggiornato il 18 agosto 2026.*

- **Canone operativo BEA adottato** (18/8): Luigi decide; Cowork tiene diario e verifica con misure; il lavoro nasce in incarichi numerati GH-nn con consegna a registro; Codex implementa; Claude Design compone; deploy e credenziali sono di Luigi. Documento: `docs/06-canone-operativo-portabile.md` (root non versionata). L'attore "Code" (Claude CLI) esce dal flusso.
- **Ripresa dopo ~3 mesi di fermo**: ultimo commit `90d7e26` del 21/5 (Step 6.5, nav globale customer), pushato, `feat/customer-app` allineata a origin. Stato misurato completo in `stato-arte-misurato-2026-08-18.md` (consegna GH-01).
- **Schermate Fase 1: 2/4 complete** (Dashboard, Promozioni). Scheda pet e Prenotazione stub. App staff sul demo ancora rotta (Gate 5). Preview `grooming-hub-webapp-aish.vercel.app` risponde.
- **Non misurabile oggi**: stato Supabase demo/prod — il collegamento MCP di questa sessione vede solo l'org BEA. Riattivazione accesso in carico a Luigi (G1).
- **Piano verso fine agosto**: 6 giri G1–G6 (Scheda pet → Gate 5+4 → Prenotazione → hardening → migration prod + merge), dipendenze da Davide e Roby nominate per prime — su tutte la **finestra di manutenzione prod da concordare entro il 24/8**. Dettaglio in `stato-arte-misurato-2026-08-18.md`; base tecnica in `piano-completamento-fase1.md` (da promuovere nel canone).

**Prossimo passo**: chiusura G1 — Luigi promuove nel canone i tre documenti (stato arte, piano, diario), ripristina l'accesso Supabase e il demo se in pausa. Poi incarico GH-02 a Codex (Fase A, Scheda pet).

---

## Stato al 20 maggio 2026 (superato, conservato per storia)

- **Schema multi-tenant**: applicato sul DB demo `grooming-hub-demo` (Gate 2 chiuso, 25 aprile 2026). Demo Supabase riattivato manualmente l'11 maggio dopo auto-pause.
- **DB produzione** `grooming`: intatto, schema vecchio (`clients` legacy), 189 clienti reali. `ACTIVE_HEALTHY`.
- **App staff sul demo**: rotta — `webapp/src/lib/database.js` contiene 13 chiamate `from('clients')` su tabella droppata da M11-bis, più 3 chiamate a `customer_client_links` (anch'essa droppata) e 48 occorrenze testuali di `client_id`. Refactor previsto al Gate 5.
- **App customer**: **scaffolding + prima schermata + rifinitura visiva completati** (Step 1-5 della roadmap fast-track). Routing top-level pattern catch-all (`/u/*` → CustomerApp, `/*` → StaffApp). AuthProvider + TenantProvider attivi a livello root. Cinque pagine: `/u/login` (restyled), `/u/home` (restyled placeholder editorial), `/u/redeem/:token` (placeholder), `/u/promotions` (restyled, RLS verificata), `/u/forgot` (stub). UI shared completa: `Button`, `Card` (upgraded con shadow/radius props), `Skeleton`, `Brandmark`, `Eyebrow`, `Icon` (vocabolario SVG inline), `BackgroundDecor`. Tokens shared centralizzati in `src/shared/tokens/tokens.css` con Fraunces (Google Fonts) e radii completi. Build Vite verde (121 moduli). Pre-Gate 3 chiuso, 8 decisioni su 8 prese. Sul demo: 2 customer di test (`mario.rossi@test.example`, `luca.bianchi@test.example`, password `test1234`) e 3 promozioni seed.
- **Refactor monorepo-ready**: completato in Step 1 (commit `6948589`). `webapp/src/` ora ha `apps/staff/` + `apps/customer/` + `shared/{supabase,auth,tenant,ui,tokens,utils}/`. Top-level `App.jsx` thin shell con routing catch-all.
- **Documento partecipato salone**: tre round completati (terzo parziale, maggio 2026). Sezioni 2 e 8 ora hanno la prima risposta di Davide e Roby; restano aperti alcuni dettagli per un eventuale quarto round (pet difficili da fotografare, convenzioni interne, momenti "uffa, di nuovo" del gestionale).
- **Bundle Claude Design** (`design_handoff_customer_app/`): parzialmente superato dalle decisioni di Gate 2 e Gate 5. In particolare il signup pubblico previsto dal bundle è incompatibile con la Decisione 12 di Gate 2 ("no autocreazione customer, solo via invito").

**Preview consegnata al salone (13 maggio)**: `https://grooming-hub-webapp-aish-29dw1o8av-morkdaorkggettos-projects.vercel.app`. Atterra su `/u/login` (redirect top-level). Credenziali test: `mario.rossi@test.example` / `test1234`. Branch `feat/customer-app` pushata su `origin` con 19 commit.

**Primo riscontro Davide e Roby (20 maggio)**: «soddisfatti dell'interfaccia». Risposta informale, asciutta — coerente con la natura essenziale della preview consegnata. Nessuna iterazione richiesta. Niente foto inviate: le due immagini Unsplash sulle promozioni vengono promosse a scelta finale di Fase 1. Dettagli e nota di contesto in `flussi-operativi-salone.md` (nuova sezione 10) e nella entry di cronologia corrispondente.

**Prossimo passo**: Step 6 della roadmap — Dashboard customer reale (sostituisce la `/u/home` placeholder). Sezioni: header con saluto, next appointment card con stato, CTA "Prenota", lista pet del cliente, mini-stack promozioni (riuso `usePromotions`). Decisione 9 Gate 2 applicata: empty state "nessun pet" rimanda a contatto salone via WhatsApp, niente add pet customer-side. Prerequisito leggero: seed di 1-2 pet per Mario Rossi sul demo + 1 appuntamento futuro. Tempo stimato: 2-3 ore Code. In parallelo, da pianificare: Gate 5 (refactor `database.js` staff) e sessione "Security hardening" PRIMA del merge feat→main su prod.

---

## Cronologia

### 18 agosto 2026 — Adozione del canone operativo BEA + stato dell'arte misurato (GH-01)

**Attori**: Luigi (decisione di riorganizzazione), Cowork (misure + consegna).

**Decisioni prese**:
- Il progetto adotta il canone operativo maturato in BEA (`docs/06-canone-operativo-portabile.md`). Nuova squadra: Luigi decide/deploya, Cowork verifica/documenta, Codex implementa, Claude Design compone. L'attore "Code" esce dal flusso; le sezioni della skill e di ISTRUZIONI.md sul workflow a tre attori sono superate e andranno revisionate.
- Scadenza dichiarata: chiusura Fase 1 a fine agosto 2026.
- **Supabase passa a piano Pro su organizzazione nuova dedicata Grooming Hub** (decisione Luigi, 18/8, raffinata in giornata): org Pro nuova (~$25/mese) con dentro **solo il prod `grooming`**, trasferito previo backup; **il demo `grooming-hub-demo` resta su org free** accettando l'auto-pausa (tollerabile in demo, e la demo è la prova generale delle migration, non un candidato a diventare prod). La prima ipotesi "trasferisco entrambi" è superata per costo (~$10/mese di compute del secondo progetto, senza possibilità di pausa sui piani paid). Motivazione del Pro: basta auto-pausa sul prod, backup giornalieri per i 189 clienti reali, fatturazione separata da BEA. Transfer da eseguire ora, mai sotto la scadenza di G6. Gesti su account e billing: Luigi; Cowork verifica dopo.

**Lavori completati**:
- Incarico GH-01 consegnato: `stato-arte-misurato-2026-08-18.md` — misure su repo (36 migration, 2/4 schermate, staff rotta: 13 `from('clients')`), preview viva, piano G1–G6, dipendenze D&R nominate per prime.

**Scostamenti dichiarati** (canone: zero scostamenti silenziosi):
- Il messaggio d'innesto citava `docs/canone-operativo-cowork.md`; il file reale è `docs/06-canone-operativo-portabile.md`.
- Stato Supabase demo/prod non misurabile: il collegamento MCP della sessione vede solo l'org BEA. Demo presumibilmente in auto-pausa dopo 3 mesi (non verificato).
- Diario trovato fermo al 20/5 mentre il repo arrivava al 21/5 (`90d7e26`, Step 6.5): la entry unificata Step 6+6.5 non era mai stata scritta. Lezione: la consegna non è chiusa finché il diario non la registra.
- Build, smoke test autenticato e advisor Supabase non rimisurati oggi: dichiarati come verifiche mancanti in GH-01, da recuperare nei giri.

**GH-02 interrotto da Codex, e l'interruzione era giusta** (18/8, pomeriggio): la policy `pets_customer_update` concede al customer UPDATE full-row; il trigger di M `20260511070742` protegge solo `internal_notes`. Microchip, peso e tutta l'anagrafica pets erano modificabili via API. Controprova Cowork sui file migration: confermato. **Autodenuncia Cowork**: GH-02 affermava «il trigger DB li protegge» — scritto di memoria, non misurato, falso. L'interruzione di Codex ha intercettato l'errore: il canone ha funzionato al primo giro. Consegna in `docs/consegne/GH-02-scheda-pet-interruzione.md`; istituita la cartella `docs/consegne/` con README di convenzione (sede permanente delle consegne Codex).

**Decisione Luigi (18/8)**: migration **whitelist** — per i non-staff ogni colonna di `pets` torna a OLD tranne `owner_notes`, `coat_preferences`, `photo_url`. Scartate la blacklist minima (lasciava scoperta l'anagrafica) e l'accettazione della protezione solo-UI. Nuovo mandato emesso: `docs/incarichi/GH-02-bis-whitelist-e-ripresa.md` (Parte 1 migration + controprove vive, Parte 2 ripresa A1-A4).

**GH-02-bis: Parte 1 riuscita, Parte 2 interrotta su secondo difetto reale** (18/8, sera): migration whitelist `20260818060158` applicata al demo con 4 controprove vive passate (commit `f83e8d4`, locale). A1-A4 preparati localmente ma non committati: l'upload Storage customer fallisce con 403 perché nelle tre policy `pet-avatars customer` il riferimento `name` dentro `EXISTS` è catturato dall'alias `p` → `storage.foldername(p.name)` (il nome del pet!) invece del path. Controprova Cowork sul sorgente: confermato; misurato anche il perimetro — `client-photos` e `staff all` sono sane, il bug è solo nelle 3 policy customer. Fuori-istruzione dichiarati da Codex accettati (metadati prod visti via `list_projects` senza query; REVOKE advisor consolidato nella stessa migration).

**Decisione Luigi (18/8)**: autorizzato GH-02-ter — migration che ricrea le 3 policy qualificando `storage.objects.name`, poi chiusura A1-A4 con verifica browser e commit. Scartato il rinvio di A3 al G5. Incarico: `docs/incarichi/GH-02-ter-fix-storage-e-chiusura.md`.

**Lezione di giornata**: due interruzioni motivate, due difetti veri di schema trovati prima di scrivere codice sopra. Il costo del metodo (tre mandati per una schermata) è il prezzo dell'affidabilità — in BEA lo chiamavano «la controprova della controprova».

**Affinamento convenzione consegne (Luigi, 18/8)**: il README di `docs/consegne/` ora chiede che ogni consegna con blocco includa una **soluzione consigliata a Cowork** — causa misurata, modifica minima, file coinvolti, controprove, rischi residui, e la strada raccomandata se ce n'è più d'una. Proposta informativa, mai autorizzativa. Nato dall'attrito di GH-02-bis, dove il mandato successivo è stato ricostruito dalla diagnosi invece che da una proposta già formata.

**Aperto**: promozione nel canone dei documenti di oggi + `piano-completamento-fase1.md` (untracked) + commit locale `f83e8d4` da pushare a fine giro; ripuntamento collegamento Supabase di Cowork sull'org nuova; finestra manutenzione prod da chiedere a Davide e Roby entro il 24/8.

**GH-02-ter consegnato e verificato** (18/8, sera): migration `20260818063103` corregge le 3 policy Storage (5 controprove vive passate, oggetti di prova ripuliti), A1-A4 completi con verifica browser (7 stati, responsive 390/320 senza overflow, resize foto 1600→1024 misurato). Commit `4d87e22`, `4e57b77`, `3254c95`; HEAD `3254c95`, 4 avanti su origin, nessun push. Verifica Cowork sul repo: commit e tabella file corrispondenti, migration limitata alle 3 policy, scan secret pulito; controprove vive accettate dal registro (MCP Cowork ancora su org BEA). **Scheda pet completa: 3/4 schermate Fase 1.**

**Eccezione diagnosticata da Codex (fuori perimetro, non toccata)**: deadlock su hard reload con sessione esistente — `onAuthStateChange` async in `AuthProvider.jsx` attende `refreshMemberships()` sullo stesso client (caso documentato nella guida Supabase). Skeleton infinito su F5. Soluzione minima consigliata nel registro secondo la convenzione nuova: callback sincrono + `useEffect` separato con guard.

**Decisione Luigi (18/8)**: autorizzato GH-02-quater — fix AuthProvider secondo la soluzione consigliata da Codex, un solo file, 4 controprove, PRIMA del push. Scartato il push immediato con F5 rotto. Incarico: `docs/incarichi/GH-02-quater-fix-authprovider.md`.

**Claude Design entra nel giro (Luigi, 18/8)**: constatato che Codex ha composto la Scheda pet in autonomia (misure Cowork: 45 stili inline, 2 colori fuori token `#3f6658`/`#8f3f49`), il cappello della composizione torna a CD. Brief `docs/incarichi/GH-03-brief-claude-design.md`: Richiesta 1 subito (composizione wizard `/u/book` prima dell'implementazione in G4), Richiesta 2 dopo il redeploy (calibrazione Scheda pet su URL e screenshot veri).

**GH-04 consegnato e verificato** (18/8): sonda staff `staff.sonda@test.example` viva sul demo (commit `8588bdd`, solo seed; 4 controprove passate, baseline Mario rimisurata, due tentativi SQL respinti e dichiarati). Password sonda pubblica e usa-e-getta, smontaggio previsto a chiusura G3 secondo la raccomandazione nel registro. L'account operatore reale (`demo@groominghub.it`, email fittizia) non è stato toccato; Luigi imposta la propria password via SQL Editor (gesto suo).

**Proposta G3 di Codex ricevuta e adottata** (18/8): la sonda ha misurato il sintomo d'ingresso della staff app (`customer_client_links` assente interrogata dal bootstrap). Decisione di calibrazione Cowork: G3 spezzato in **GH-05** (bootstrap 6 punti + refactor `database.js` per Decisioni Gate 5 + 7 pagine staff, nessuna migration) e **GH-06** (migrazione `contacts`→`customers`, test RLS Gate 4, smontaggio sonda). GH-05 parte solo dopo la consegna di GH-02-quater, la cui ultima controprova (routing di ruolo) è ora sbloccata dalla sonda.

**GH-02-quater consegnato e verificato** (18/8): commit `db3e3c2`, diff limitato ad AuthProvider.jsx, callback sincrono, 6 controprove con tempi misurati (reload 404/481/54 ms), routing di ruolo provato con la sonda. **G2 tecnicamente chiuso**: 6 commit locali in attesa del push di Luigi + redeploy preview.

**GH-05 interrotto da Codex — errore di mandato di Cowork, seconda autodenuncia di giornata** (18/8): il mandato chiedeva insieme `addCustomerWithPet` transazionale, controprova UI e nessuna migration — ma sul demo non esiste alcuna RPC (misurato in `pg_proc`) e due INSERT dal browser non sono una transazione. La griglia delle cinque domande, applicata da Codex prima di scrivere, ha trovato anche: `AddClient.jsx` fuori dall'elenco ma necessario; 6 consumer dello shim non elencati; `pets.last_visit_at` inesistente (l'ordinamento della Decisione 1 poggiava su una colonna fantasma); `owner_user_id` NOT NULL con 5 customer su 7 senza account Auth. Lezione: i mandati si scrivono misurando lo schema, non citando i documenti di design.

**Decisione Luigi (18/8)**: adottato il percorso raccomandato da Codex — due atti ordinati: `GH-05-rpc` (migration RPC `add_customer_with_pet`, SECURITY INVOKER, guard staff, 5 controprove tra cui zero-orfani) e `GH-05-bis` (refactor con elenco file completo, ruolo adattato in memoria senza UPDATE al DB, ordinamento derivato da `visits` lato client per il pilota). Scartata l'alternativa a due INSERT compensati.

**Prima conversazione a voce del progetto — prenotazioni con Davide** (18/8, sera): Claude voice mode ha condotto, Davide ha risposto, Luigi presente. **D&R-2 chiusa**: avviso non bloccante sotto i 7 giorni (parola di Davide: «la seconda scelta mi sembra la migliore»); l'app non blocca mai, nemmeno nei periodi di piena («facciamole arrivare tutte e poi rispondiamo noi»). Requisiti nuovi: campi condizioni pelo (da verificare, mai affidabile) ed età se mancante; alert periodi di piena; stato «in attesa di conferma» con risposta su WhatsApp; niente promemoria agli abituali; notifiche solo per promozioni e scatti dei tre livelli fedeltà (conferma di direzione Fase 2, fuori scope Fase 1). Fonte congelata: `flussi-operativi-salone.md` §11 + trascrizione e sintesi in `workflows/conversazioni/2026-08-18-prenotazioni/`. Brief CD (GH-03, Richiesta 1) aggiornato con i requisiti confermati: il wizard è una **richiesta con data desiderata**, non un booking a slot garantiti — semantica da riflettere nella composizione.

**Consegna CD — GH-03 Richiesta 1 (19/8)**: handoff `docs/incarichi/GH-03-R1-handoff.md`, 7 artboard approvati a vista da Luigi. Verifica Cowork: coerente con la §11 congelata su tutti i punti vincolanti; semantica richiesta-non-booking portata fino in fondo (niente stato "conflitto slot", `DesiredDateStrip` senza semantica libero/occupato, CTA "Invia la richiesta"); componenti nuovi dichiarati (`WarmNotice`, `DesiredDateStrip`); zero colori fuori palette. Questioni aperte nominate: prezzi in-app sì/no, vocabolario chips manto e fascia oraria (→ Davide), token `--color-whatsapp` come alias di success (→ Luigi), numero WhatsApp e periodi di piena in `tenants.settings` (→ prodotto/DB, già annotato in §11). **Aperto**: canvas `GH-03 Wizard Prenotazione.html` + `gh03-book.jsx` non ancora nel repo — Luigi li salva in `design_handoff_customer_app/gh03-book/`. La calibrazione Scheda pet (Richiesta 2) resta in attesa del redeploy.

**Decisioni Luigi sulle questioni aperte dell'handoff CD (19/8)**: (1) **niente prezzi in-app** — coerente col posizionamento non transazionale; (2) **vocabolario chips manto di CD confermato** così com'è; (3) **fascia oraria: sì**, come preferenza non vincolante nella richiesta — mattina 9:30–13:00 divisa in **due** fasce, pomeriggio 15:00–19:00 diviso in **tre** fasce (5 chips totali, stesso pattern chips dell'handoff, stessa semantica "desiderata"); (4) token `--color-whatsapp` approvato come alias di `--color-success-text`. Nota di canone: gli orari di apertura sono un dato del salone riferito da Luigi — da confermare con Davide nel prossimo messaggio WhatsApp prima di considerarli congelati (lezione g38→g39: i dati veri hanno fonte citata).

**G2 CHIUSA** (19/8): Luigi ha eseguito dal Terminale il suo primo giro Git completo — commit documentale `0356f77` (canone, incarichi GH-01..GH-05, consegne, conversazione prenotazioni, handoff CD, canvas in `design_handoff_customer_app/gh03-book/`) e push dei 7 commit su `origin/feat/customer-app`. Working tree pulito, origin allineata. **Lezione riconfermata a caro prezzo zero**: il sandbox Cowork può creare `.git/index.lock` ma non rimuoverlo — un test di `git add` ha bloccato il repo finché Luigi non ha ripulito da Terminale. Regola definitiva: **Cowork non esegue mai operazioni Git di scrittura**; prepara, verifica, e i gesti Git sono di Luigi (o di Codex nei suoi mandati).

**GH-05-rpc consegnato e verificato** (21/8): RPC `add_customer_with_pet` sul demo — commit `a3d40e8` a file unico, `SECURITY INVOKER`, guard staff come prima istruzione, `search_path=''`, ACL esplicita, firma a 20 parametri dichiarata (4 obbligatori), telefono via `normalize_phone_it`. 5 controprove passate: creazione da sonda ok, rifiuto customer `42501` prima di ogni scrittura, atomicità provata (`23514` sul pet → 0 orfani), rifiuto tenant estraneo, pulizia a zero residui con baseline identica (7+7). Le 5 indicazioni operative del registro sono state innestate nel mandato GH-05-bis (telefono obbligatorio in AddClient, split nome col criterio M11-bis, controprova atomicità UI, foto come passo successivo non compensato).

**Assetto Supabase ricapitolato una volta per tutte** (21/8, da screenshot dashboard): `grooming` e `grooming-hub-demo` vivono entrambi nell'org personale free `morkdaorkggetto's Org`; `Webapp_Project` è l'org **Pro** di BEA + Caveabay (i documenti precedenti sbagliavano); org nuova mai creata. **Decisione Luigi (21/8, supera la 18/8)**: `grooming` → `Webapp_Project` Pro, +~$10/mese (Nano fatturato come Micro su org paid, credito già assorbito da BEA); niente org dedicata per ora. Demo resta su free. Rischio nominato: con il salone in ferie la prod free rischia l'auto-pausa — il transfer lo elimina. Assetto congelato in `environment-map.md` (tabella = fonte). Prerequisito G6 aggiunto: **prova generale della migration su dump fresco di prod** in progetto temporaneo free (lo slot si libera col transfer); foto Storage fuori dal dump SQL, annotato.

**Dump + transfer prod eseguiti e verificati** (21/8 mattina, gesti di Luigi guidati passo passo): tre file sulla Scrivania — schema 29K, **dati 1,3 MB**, auth 115K (`grooming-prod-{dump,data,auth}-20260821.sql`). Password DB resettata due volte (la prima è finita per errore in chat → bruciata e sostituita, ciclo sonda). Transfer `grooming` → `Webapp_Project` (Pro) completato senza downtime percepito; app Vercel prod verificata viva (`main` @ `c9a3678`). Nota: il dashboard prod mostrava "No backups" — il dump manuale era l'unico paracadute possibile, e ora sul Pro partono i backup giornalieri.

**Capacità di verifica Cowork sul prod RIPRISTINATA** (21/8): il binding MCP (org Webapp_Project) ora vede `grooming` `ACTIVE_HEALTHY`. Prime misure dirette: **296 clienti** (+107 da aprile!), **464 visite** (+259), 6 utenti auth, 4 operatori. Il "vedo solo 5 clienti" di Luigi spiegato: l'app legacy scopa i clienti per operatore — Davide (`frogletinpond@`) ne ha 289, Luigi 5 (test), Roby 1. Disciplina dichiarata: sul prod Cowork **legge e misura soltanto**; ogni scrittura resta atto numerato in mandato (non prima di G6). Demo ancora fuori vista MCP (org free): verifica via registri Codex.

**Per la checklist prova generale / pre-G6** (nuove voci): ripulire i 5 clienti test di Luigi prima del backfill; eliminare l'account `sofaj99831@izkat.com` (contesto chiarito da Luigi: lo scoping per operatore era la loro disciplina artigianale per non toccare i dati veri durante i test UI — l'account usa-e-getta è con ogni probabilità un artefatto di quelle prove, conferma finale da Luigi/Davide); i volumi reali per la migration sono 296/464, non più 189/205.

**Preview promossa e verificata da Luigi** (21/8): auto-deploy da push ora attivo sul progetto `-aish` (production branch già `feat/customer-app`); deployment `0356f77` promosso a Production sul dominio stabile; Scheda pet viva in preview, F5 pulito (fix quater battezzato in produzione-preview).

**Decisione Luigi (21/8, dal test dal vivo)**: **niente prezzi sul lato customer, da nessuna parte** — estende il "no prezzi in-app" del wizard (19/8) anche allo storico visite della Scheda pet, dove Codex aveva reso il prezzo storico. Motivazione: Davide non fissa prezzi in anticipo, dipende sempre dalle condizioni del pet (pratica nota del salone, da confermare con lui nel prossimo giro per congelarla); il prezzo storico in app creerebbe ancoraggio. Lato staff i prezzi restano. **Fix in coda**: rimozione riga prezzo da `Pet.jsx` (visita) — micro-intervento da accorpare al prossimo mandato Codex post GH-05-bis, insieme alle correzioni R2 di CD.

**GH-05-bis CONSEGNATO E VERIFICATO — GATE 5 CHIUSO (parte applicativa)** (21/8): l'app staff è risorta sul demo dopo 5 mesi. Due commit atomici (`9317b78` gateway+pagine, `50a41b5` rimozione shim), `database.js` −950 righe nette, `tenant_memberships` fonte canonica con ruolo adattato in memoria, creazione cliente+pet via RPC atomica (errore forzato → 0 orfani), 7 controprove passate incluso il network scan (zero chiamate legacy nella finestra di prova). Verifica Cowork sui sorgenti: 0 `from('clients')`, 0 `customer_client_links`, 0 `client_id` nell'intero `src/apps/staff/`, shim assente, commit = tabella file. Restano per GH-06: migrazione `contacts`→`customers`, test RLS Gate 4, smontaggio sonda. `ClientDetail.jsx` non ha richiesto modifiche (mapping compatibile del gateway).

**Push + promozione GH-05 eseguiti da Luigi** (21/8): `0356f77..50a41b5` su origin, build auto, promozione manuale. App completa in preview. Luigi ha verificato il lato staff dal vivo: la "vecchia UI" sul demo è attesa e voluta — Gate 5 era motore, non carrozzeria; il restyling staff è capitolo post-Fase 1 via CD. Password `demo@groominghub.it` impostata sul demo (gesto Luigi via SQL Editor).

**GH-06 CONSEGNATO E VERIFICATO — G3 COMPLETAMENTE CHIUSO** (21/8): Gate 4 fatto — suite RLS ripetibile (`scripts/rls-tests/run.mjs`, 546 righe): **17 PASS, 0 FAIL, 1 SKIP** (staff cross-tenant, manca secondo tenant demo — nominato, con proposta di fixture futura); esiti e procedura in `supabase/docs/rls-tests.md`; isolamento bidirezionale reso non-vacuo con pet temporaneo per Luca, ripulito. Prezzo e sconto rimossi dallo storico visite customer (13 righe, 0 riferimenti residui misurati). Sonda GH-04 smontata con guardia email+UUID, 0 residui su 5 tabelle, login → `invalid_credentials`, teardown idempotente provato (`scripts/rls-tests/teardown-staff-probe.sql`). Commit `728f4df`, `6ee31f6`, `c65601b`. Password fixture solo in `.env.local` non versionato. Verifica Cowork: commit = tabella, grep prezzo = 0, nessuna credenziale nei sorgenti.

**GH-07 (ricognizione contacts) consegnato e verificato** (21/8): Fase 1 in sola lettura, esemplare. Scoperte chiave: il modello ammette già il customer senza pet (1 esiste sul demo); le note contacts demo sono duplicati delle note pet (copia cieca = errore evitato); matching demo 5/5 su tre segnali concordi, nome pet mai chiave (2/5 ambigui); automatismo rubrica già spento da GH-05-bis; residuo prod 13/301. Proposta: modello **customer-first** (lead = customer senza pet, `relationship_status` + `acquisition_source`), sequenza expand/contract in 10 passi, drop separato a valle di osservazione.

**Decisione Luigi (21/8): customer-first adottato** — una sola anagrafica, niente `inquiries`, `phone` resta NOT NULL, residui manuali prima del drop. Contesto: le richieste al salone arrivano via WhatsApp, il telefono c'è sempre. Mandato Fase 2 emesso: `GH-07-bis` (migration additiva + backfill demo + refactor Contatti in direttorio customer; prod e drop esclusi; preflight prod read-only in carico a Cowork pre-G6).

**GH-07-bis CONSEGNATO E VERIFICATO — contacts assorbita sul demo** (21/8, sera): migration `20260821055259` (455 righe: due campi operativi con trigger anti-scrittura customer, RPC `upsert_customer_lead` SECURITY INVOKER, backfill transazionale con **guardia hardcoded sul tenant demo** — inapplicabile al prod per costruzione); mapping 5/5 contacts assorbiti su customer esistenti, zero copie di note (erano duplicati delle note pet, come previsto dalla ricognizione), impronte dati invariate alla riesecuzione; `Contacts.jsx` ora è direttorio customer (lead senza pet, multi-pet con scelta esplicita, WhatsApp su customer); zero `from('contacts')` nel codice; suite RLS estesa: **20 PASS, 0 FAIL, 1 SKIP**; ciclo sonda completo. Commit `ae9819f`, `efa1c7b`, `f5cd321`. Eccezione dichiarata: primo apply rifiutato su `pg_catalog.least`, rollback integrale, correzione, secondo apply pulito. La §8 del registro consegna a Cowork la checklist di 10 misure per il preflight prod sulle 301 righe — base dell'atto G6.

**D&R-1 e prezzi risolti** (21/8, riferiti da Luigi da conversazione diretta con Davide — fonte: Luigi, non frase estemporanea): **rientro dalle ferie il 1° settembre** → salone chiuso fino ad allora → la finestra di migrazione prod si esegue **a salone fermo nella settimana del 25-31/8**, senza coordinamento d'urgenza; al rientro troveranno il sistema nuovo. **Prezzi: modello "solo incassi"** — nessun listino esposto, i prezzi esistono solo come incassi registrati a consuntivo; lato customer nessuna esposizione, mai (già implementato in GH-06); lato staff lo storico incassi resta (da confermare con Luigi, assunto sì). Resta UNA sola domanda per Davide: le fasce orarie (conferma 9:30-13/15-19 e validità sui giorni).

**Orari confermati da Davide (21/8, via Luigi) — D&R-2bis chiusa**: orario continuato 9–19, ultima lavorazione avviabile alle 18 (regola interna, non esposta al cliente); i clienti dicono «mattina/pomeriggio». **Decisione Luigi**: tre chip facoltative Mattina (9–13) / Pomeriggio (13–19) / «Per me è uguale», micro-copy «l'orario preciso lo concordiamo noi su WhatsApp». **Supera la decisione a 5 fasce del 19/8**, che poggiava su orari non confermati — la nota di canone che la marcava "da confermare con la fonte" ha fatto il suo lavoro. Congelato in §11; brief GH-03 aggiornato. Con questo, **tutte le dipendenze dal salone per la Fase 1 sono risolte**: nessuna domanda aperta resta verso Davide e Roby.

**R2 di CD annullata — il prototipo c'era già** (21/8, notte, su domanda di Luigi): `reference/pet-page.jsx` (847 righe) + §04.2 + specifiche token compongono già la Scheda pet. Misure Cowork: i 2 colori fuori palette NON vengono dal bundle (invenzione Codex, da ricondurre ai token); il prototipo mostra i prezzi nelle visite (datato: la decisione "solo incassi" lo supera) ma rivela il dettaglio **operatore accanto alla visita** («Bagno · Giulia»), coerente con l'accoglienza — da valutare nell'allineamento. La calibrazione diventa un confronto meccanico implementazione-vs-prototipo per Codex (futuro micro-mandato GH-09, dopo GH-08); niente screenshot, CD rientra per composizioni nuove. Brief GH-03 aggiornato.

**Coda della settimana finale scritta per intero** (21/8, notte): `00-ERRATA.md` creato in testa al bundle Design (9 voci: cosa dei prototipi è superato e da quale fonte — prezzi, slot, fasce, signup, colori spuri; regola: le righe si aggiungono, mai si cancellano). Mandati emessi: **GH-08** (wizard, checkpoint Fase 0 su atterraggio DB — le richieste oggi vivono come appointments pending con dati nel testo note), **GH-09** (allineamento Pet.jsx ↔ `pet-page.jsx` con eccezioni errata + candidatura "operatore in riga visita"), **GH-10** (hardening D1: misura advisor demo+prod → migration demo → bozza variante prod; toggle dashboard = gesti Luigi), **GH-11** (prova generale: preflight contacts Cowork sulle 301 righe, ricostruzione dal dump 21/8 su progetto temporaneo free, catena prod-safe completa, durata misurata che dimensiona la finestra; l'atto G6 si scriverà da quel registro).

**Scadenza del 1/9 rimossa** (Luigi, 21/8 notte): la data di rientro non è più un vincolo di consegna, resta solo un utile punto di riferimento. **Nuovo obiettivo: chiudere il prima possibile**, senza corsa e senza attese inutili. Sequenza tecnica invariata (GH-08 fatto → GH-09 → GH-10 → GH-11 → atto G6 → merge/deploy), ma senza date target predefinite: ogni giro parte non appena il precedente è verificato. Il salone in ferie resta la condizione ideale per la finestra prod — coglierla quando la catena è pronta, non un giorno prima. Unico dettaglio esterno residuo, non bloccante: se l'orario continuato 9–19 vale identico tutti i giorni o qualche giorno cambia (riga WhatsApp leggera a Davide, utile per il copy delle chip ma non per la struttura).

**GH-08 CONSEGNATO E VERIFICATO — G4 CHIUSO, WIZARD VIVO** (21/8, sera tardi): commit `0834c8c` (16 file, +1673 righe, nuova tabella `appointment_requests` con RLS e 2 RPC SECURITY INVOKER `submit_appointment_request` + `resolve_appointment_request` transazionale, wizard 4 sezioni, componenti shared `DesiredDateStrip` e `WarmNotice`, `.ics` post-conferma, chip orarie); staff `CustomerRequests.jsx` legge senza parsing, approvazione con dialog giorno/ora obbligatorio (Codex ha giustamente esteso il perimetro invece di forzare uno slot fittizio); 8/8 controprove PASS, suite RLS **26 PASS 0 FAIL 1 SKIP**; zero prezzi/slot nei sorgenti misurato; sonda usa-e-getta. Advisor: 2 warning `multiple_permissive_policies` attesi (staff/customer tenuti espliciti), nessun nuovo problema.

**Due note di metodo (autodenuncia)**: (a) Codex ha eseguito la Fase 0 (raccomandato tabella dedicata) e proseguito le Fasi 1-3 senza l'ok esplicito Luigi-via-Cowork richiesto dal mandato — probabilmente ha letto «GH-08 completato» come autorizzazione retroattiva. Esito buono perché la raccomandazione era quella corretta, ma il checkpoint è saltato: prossima volta il mandato deve dire *«consegna il registro Fase 0, chiudi la sessione, aspetta un mandato Fase 1 separato»* invece di *«fermati»*. (b) Per la prima volta Codex ha committato i propri registri (`bdecf94`): il README consegne (Luigi, 16/8) dice «restano locali»; convenzione da chiarire una volta per tutte.

**Decisione Luigi (21/8)**: **registri sempre committati** (nello stesso commit del codice, o in un `docs: record GH-NN delivery` consecutivo). README consegne aggiornato con la nuova convenzione e nota che formalizza quanto Codex ha già fatto con `bdecf94`. Il push resta gesto di Luigi. Da ora la coda del giorno è UN gesto solo: `git push`.

**GH-09 Fase 1 consegnata — checkpoint rispettato** (24/8): tabella scostamenti `Pet.jsx` vs prototipo+§04.2+token, 22 aree misurate, motivi espliciti (`allineare`/`tenere`/`decisione`). Misure vere: 704 righe, 60 prop `style` (42 letterali + 18 riferite), 17 oggetti `*Style`, hero attuale 132/48 → target 140/56 desktop e 88/40 mobile da token; 2 hex fuori palette confermati; `cost` ancora selezionato dall'hook customer nonostante il DOM sia già pulito da GH-06 (da chiudere).

Codex ha rispettato il checkpoint (lezione GH-08 assorbita) e ha nominato una sola vera decisione: l'operatore in riga visita (candidatura del prototipo) **non è implementabile senza inventare il dato** — lo schema `visits` non ha operatore.

**Decisione Luigi (24/8): Fase 2 approvata come da tabella, operatore ESCLUSO**. Coerente con il canone «mai un dato finto che possa sembrare vero» (g38→g39). Se in futuro si vorrà, sarà un micro-mandato dati dedicato (`visits.performed_by_user_id` + backfill + RLS) — non un cerotto in UI. Il prototipo mostrava il dettaglio; l'ERRATA lo ereditava candidato, ma la misura di Codex sullo schema chiude la questione.

**Preflight prod tentato — scoperta importante che ricalibra GH-11** (24/8, Cowork, sola lettura sul prod): tentate le 10 misure §8 GH-07-bis, respinte dal fatto strutturale. Misure vere di prod: 10 migration registrate (ultima `20260423123000`, cioè pre-Gate 2); tabelle prod = `clients`/`contacts`/`visits`/`profiles`/`appointments` **puramente legacy** (nessun `tenant_id`, `contacts.linked_client_id` non `linked_pet_id`, zero `pets`/`customers`/`tenant_memberships`/`tenants`); funzioni `normalize_phone_it` e `has_tenant_access` **assenti**. Il preflight `contacts` come scritto nel §8 **NON è eseguibile sui dati grezzi**: parla la lingua post-Gate 2.

**Ricalibrazione GH-11 (Cowork, 24/8)**: la Fase 0 come descritta era mal posta — non "preflight sui dati vivi" ma "preflight sullo stato **dopo** il restore + Gate 2 applicato nel progetto temporaneo". Sequenza corretta: (1) Luigi crea temporaneo free; (2) Codex restore dei tre dump; (3) Codex applica la catena Gate 2 in variante prod-safe (backfill `clients`→`customers`+`pets`, seed memberships, helper, ecc.); (4) **solo allora** le 10 misure §8 hanno senso e classificano le 301 righe con le regole reali; (5) risoluzione manuale dei residui (~13 attesi); (6) catena Fase 1 completa. Alternativa scartata: riscrivere le regole in "lingua legacy" per misurare sui dati grezzi — lavoro monouso che non guadagna nulla. Mandato GH-11 da aggiornare di conseguenza prima di darlo a Codex.

**GH-09 CHIUSO — Scheda pet allineata al prototipo** (24/8): commit unico `ce962f1` con codice + registro (nuova convenzione applicata al primo colpo). Fase 2 fedele alla tabella accettata: gerarchia V1 su hero e righe visita, hero 56/40 da token, avatar 140/88, CTA `Prenota per Luna` sticky desktop e fissa mobile sopra la nav, anagrafica editoriale con 6 campi reali, editing inline **per sezione** (superato il form globale), foto contestuale con resize/preview/cleanup, storico senza prezzo e senza operatore (dato assente, decisione confermata). **Pet.jsx: 704→654 righe, style={{ 60→1** (dinamico legittimo), +414 righe di `Pet.css` — il layout è uscito dal JSX come chiesto; `cost`/`discount_percent` rimossi anche dalla query hook. 12/12 controprove PASS, verifiche 1440/390/320 senza overflow, F5 conserva, guard opera, foto ciclo pulito. Pulizia demo: nota Luna, `photo_url` e oggetto Storage ripristinati. Verifica Cowork spot: 0 hex, 0 cost, 0 operator — tabella file = misura.

**GH-10 CHIUSO — hardening demo eseguito** (24/8): commit `a72daad` (migration `20260824090000_security_hardening.sql` + registro). Advisor demo Security da **21 → 6**, Performance **115 → 113**. Fatto: `search_path` pinnato su 10 funzioni `SECURITY DEFINER` legacy + 2 invoker (`update_timestamp`, `normalize_phone_it`); revoca `PUBLIC EXECUTE` con re-grant minimo per ruolo; 2 indici FK aggiunti (`customer_invitations.accepted_by`, `customers.user_id`). Restano per scelta dichiarata: 5 helper esposti che sono contratto (registrati in ERRATA voce 10); 15 `auth_rls_initplan` (fix richiederebbe riscrittura RLS, fuori mandato); 80 `multiple_permissive_policies` (idem); bucket pubblici (necessari QR/pet-avatars). Suite RLS post-fix: **26 PASS, 0 FAIL, 1 SKIP**. Bozza variante prod condizionale, non "applica alla cieca": richiede preflight `pg_proc`/ACL prod. Toggle dashboard (leaked-password, MFA) elencati come gesti Luigi.

**GH-11 avviato e interrotto ai prerequisiti come previsto** (24/8): commit `4976f3f` documentale. Dump del 21/8 verificati con SHA-256 (schema 29K, dati 1,3M, auth 115K — presenti, integri, formato SQL ASCII). Progetto temporaneo `grooming-prova-generale` **non esiste** — la creazione resta gesto di Luigi (canone: le credenziali sono di Luigi, i progetti nascono dalle sue mani). Interruzione pulita, zero azioni sul demo o prod.

**Prossimo passo**: (a) push Luigi (2 commit: `a72daad` + `4976f3f`) + toggle "Leaked password protection" sul demo dal dashboard Supabase; (b) creazione progetto `grooming-prova-generale` nell'org free `morkdaorkggetto's Org` (regione indifferente, password DB nel password manager, comunicare a Codex solo il project ref); (c) alla comparsa del progetto nel MCP di Cowork, ripresa GH-11 Fase 1.

---

### 20 maggio 2026 — Primo riscontro positivo dal salone + avvio Step 6

**Attori**: Luigi (raccolta feedback informale via WhatsApp), Cowork (registrazione).

**Feedback Davide e Roby**: «Soddisfatti dell'interfaccia.» Risposta informale, asciutta. La preview che avevamo consegnato il 13 maggio era volutamente essenziale — login, home placeholder, due card promozioni. Non c'era abbastanza materiale per osservazioni articolate, e probabilmente Davide e Roby avrebbero faticato a "valutare" qualcosa di così minimo. Il loro "soddisfatti" registra accettazione del registro visivo e del tono, non entra nei dettagli che ancora non esistevano. Il prossimo riscontro sostanziale arriverà quando avremo mostrato loro Dashboard reale (Step 6) e Scheda pet (Step 7).

**Decisione collaterale — foto Unsplash promosse a scelta finale Fase 1**: Davide e Roby non hanno mandato foto del loro lavoro. Le due URL Unsplash sulle promozioni attive non sono più transitorie. Se in futuro arriveranno foto reali del salone, sostituiremo; ma il prodotto non si blocca aspettando. Coerente con la postura "la fotografia è parte del lavoro del salone, e arriva quando arriva".

**Documenti aggiornati**:
- `flussi-operativi-salone.md`: nuova sezione 10 "Primo riscontro sulla preview dell'app (maggio 2026)" con le parole esatte del salone + nota di contesto Cowork + decisione foto.
- Storico revisioni del documento partecipato aggiornato.

**Prossimo passo**: Step 6 della roadmap — Dashboard customer reale. Sostituisce la `/u/home` placeholder con una dashboard funzionante. Vedi "Prossimo passo" dello "Stato attuale" per il dettaglio.

---

### 13 maggio 2026 — Consegna preview customer al salone

**Attori**: Luigi (test visivo + decisioni di calibrazione), Cowork (analisi reference + entry diario), Code (esecuzione fix + deploy + seed).

**Contesto**: chiusura della giornata di lavoro intensiva. Preview customer pronta per primo feedback "look & feel" da Davide e Roby. La consegna è onesta sul perimetro: mostra autenticamente quello che è stato fatto in Step 1-5, niente di più.

**URL preview definitivo**:
`https://grooming-hub-webapp-aish-29dw1o8av-morkdaorkggettos-projects.vercel.app`

L'URL pelato atterra su `/u/login` (redirect del routing top-level). Credenziali test: `mario.rossi@test.example` / `test1234`.

**Cosa contiene la preview consegnata**:

- `/u/login` con brand customer dedicato (BackgroundDecor a gradient radiali, AuthCard centrata, H1 Fraunces "Bentornato", Field con focus border primary, footer asciutto con link a `/u/redeem`).
- `/u/home` placeholder editoriale (saluto in Eyebrow, H1 Fraunces "La tua *area personale*" con italic primary, sub esplicativo, CTA primary "Guarda le promozioni" con icon sparkle + CTA secondary outline "Esci").
- `/u/promotions` funzionante: 2 card promozioni con foto Unsplash placeholder, title Fraunces, body, validità con icon clock inline, CTA WhatsApp deep link sulla prima promo. RLS verificata via E2E REST in Step 3. Brandmark in alto cliccabile → `/u/home`.
- `/u/forgot` e `/u/redeem/:token` placeholder/stub.
- Pattern visivo coerente al bundle Design `reference/`: Fraunces, Eyebrow, Brandmark con paw SVG, BackgroundDecor, Card con shadow discreta, Icon vocabulary inline SVG.

**Calibrazioni post-test della giornata** (ognuna nata da una piccola osservazione visiva di Luigi):

1. **Hotfix routing top-level** (commit `937e051`): URL root `/` → `Navigate to="/u/login"`. Senza, chi atterra sull'URL pelato finiva sul login staff, rotto sul demo per Gate 5 mancante.
2. **Nav minima Home ↔ Promotions** (commit `3260387`): CTA primary su home con icon sparkle "Guarda le promozioni" + link back su promotions. Decisione autonoma di Code: primary filled invece di secondary outline, per gerarchia visiva pulita.
3. **Brandmark cliccabile** (commit `4da1d29`): sostituisce il link testuale "← Torna alla home" che, accanto al wordmark, creava sovrapposizione visiva. Pattern standard universale (logo cliccabile = home). Applicato a `/u/promotions` e `/u/forgot`, NON a `/u/login` (no home raggiungibile pre-auth) né a `/u/home` (sarebbe no-op).
4. **H1 unico "Promozioni del momento"** (commit `d2744dc`): rimossa Eyebrow "PROMOZIONI" + `<em>del momento</em>` orfano. Sostituiti con H1 unico Fraunces italic primary tutto sulla stessa riga (o wrap naturale su mobile). Più leggibile, niente registro spezzato fra eyebrow e sotto-frase.
5. **Foto Unsplash sulle 2 promozioni** (solo seed DB demo, niente commit codice): URL stabili imgix CDN con `cache-control: max-age=31536000`. `Promotions.jsx` aveva già il render `image_url` dallo Step 5, quindi nessun deploy aggiuntivo necessario.

**URL Unsplash per memoria storica** (placeholder, da sostituire con foto reali quando il salone le invierà):
- "Toelettatura primaverile": `https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80&auto=format&fit=crop`
- "Cliente del mese": `https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80&auto=format&fit=crop`

**Stato repo a chiusura giornata**: branch `feat/customer-app` con **18 commit locali della giornata 11-13 maggio 2026**, ora pushati su `origin/feat/customer-app` (vedi push action di questa sessione di chiusura). Branch `main` invariata, prod `grooming` Supabase intoccato.

**Aperto**:

- **Feedback Davide e Roby**: messaggio WhatsApp da inviare con l'URL preview + credenziali test + invito ad osservare tono / leggibilità / dettagli + richiesta di 2-3 foto loro per sostituire le Unsplash placeholder. Bozza messaggio nei materiali Cowork dei turni precedenti.
- **Security hardening (PRIORITÀ ALTA pre-merge prod)**: 30+ avvisi WARN dell'advisor Supabase su entrambi i progetti. Funzioni `SECURITY DEFINER` con `search_path` non pinnato (`accept_customer_invite`, `get_public_pet_card`, `has_tenant_access`, altre), bucket `client-photos` e `pet-avatars` con SELECT troppo larga, leaked password protection disattivata. Demo non urgente (dati finti). Prod ha 189 clienti reali — da chiudere PRIMA di qualunque merge `feat → main`. Sessione dedicata da pianificare: interrogazione completa advisor → categorizzazione → migration `security_hardening` applicata prima sul demo poi su prod.
- **Gate 5**: refactor `database.js` staff + cablaggio StaffApp sui provider shared + rimozione shim Supabase. Sblocca app staff sul demo. Può procedere in parallelo o dopo primo feedback salone.
- **Step 6+**: Dashboard reale, Scheda pet, Prenotazione. Da affrontare con calma, in base al feedback salone e all'eventuale terzo round documento partecipato.
- **Sezioni 2 e 8 documento partecipato**: punti residui (pet difficili da fotografare, convenzioni interne staff, momenti "uffa, di nuovo", cosa non vorreste perdere del gestionale attuale). Non urgenti.

**Prossimo passo**: invio messaggio WhatsApp a Davide e Roby. Attendere feedback (giorni, non ore). Quando arriva: integrazione nel documento partecipato + decisione su iterazione/Step 6.

---

### 13 maggio 2026 — Hotfix routing top-level + navigazione minima customer

**Attori**: Luigi (test visivo del deploy + segnalazione), Cowork (proposta), Code (esecuzione).

**Contesto**: prima della consegna al salone sono emersi due problemi di esperienza che andavano corretti.

**Problema 1 — Landing rotto sull'URL root.** Aprendo `https://...vercel.app/` senza prefisso `/u/login`, l'utente atterrava sul login STAFF (per via del catch-all `/*` → StaffApp). La pagina staff sul demo è rotta per Gate 5 mancante: faceva errore "Could not find the table 'public.customer_client_links' in the schema cache". Davide e Roby avrebbero visto l'errore e pensato che l'app non funzioni.

**Fix 1**: in `src/App.jsx` aggiunta una rotta esplicita `/` PRIMA del catch-all che fa `<Navigate to="/u/login" replace />`. La StaffApp resta raggiungibile via path interni (`/dashboard`, `/login`, `/portal`) — non scompare, semplicemente non è più la landing default. Quando Gate 5 sblocca lo staff, valuteremo se cambiare la regola.

**Problema 2 — Le promozioni invisibili.** Dopo login, `/u/home` non aveva alcun link a `/u/promotions`. Davide e Roby sarebbero usciti dalla preview credendo che "non c'è altro" — non avrebbero mai visto il pezzo "vero" di Step 3.

**Fix 2**: aggiunto un CTA primary (icona sparkle) sotto la sub copy della home, "Guarda le promozioni del salone" → `/u/promotions`. Reciprocamente, in `/u/promotions` aggiunto inizialmente un link testuale "← Torna alla home", poi sostituito da **Brandmark cliccabile** dopo test visivo: il link testuale e il Brandmark vicini creavano confusione visiva. Soluzione finale: Brandmark "Grooming Hub" cliccabile → `/u/home`, pattern standard universale. Loop esplicito home ↔ promozioni.

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

- **13 maggio 2026** — Step 5 della roadmap fast-track: rifinitura visiva customer app basata sui pattern estratti dai prototipi del bundle Design (cartella `reference/`). Fraunces, Eyebrow, Brandmark, BackgroundDecor, Icon vocabulary, Card upgraded. Tre pagine restylate (`/u/login`, `/u/home`, `/u/promotions`) + stub `/u/forgot`. Nona entry. Più: hotfix routing top-level (`/` → `/u/login`) + navigazione minima customer (CTA Home → Promotions + link "Torna alla home"). Decima entry. Più: calibrazioni post-test (Brandmark cliccabile, H1 unico "Promozioni del momento", foto Unsplash placeholder sulle promo) e consegna preview customer al salone — URL definitivo `29dw1o8av`. Branch `feat/customer-app` pushata su `origin` con 18 commit. Undicesima entry — consegna del giorno.

- **20 maggio 2026** — Primo riscontro positivo dal salone («soddisfatti dell'interfaccia») + decisione collaterale foto Unsplash promosse a scelta finale Fase 1 + avvio Step 6 (Dashboard customer reale). Aggiornata sezione 10 di `flussi-operativi-salone.md`. Dodicesima entry.
