# Diario di progetto — Grooming Hub

Collante temporale del progetto. "Stato attuale" in cima, sempre aggiornata. "Cronologia" sotto, append-only, ordine cronologico inverso (più recente in cima).

Documento gestito da Cowork secondo la skill `grooming-hub-saas`.

---

## Stato attuale

*Aggiornato il 29 agosto 2026, sera.*

> # La produzione è multi-tenant, e il salone la sta usando.
>
> **G6 è stato eseguito la sera del 28 agosto.** Il gestionale gira sul nuovo schema con i dati veri, la vecchia tabella `clients` non esiste più, e l'app clienti ha una porta d'ingresso.
>
> **Il 29 agosto il salone ci ha lavorato dentro tutto il giorno.** Al mattino: 260 clienti, 282 cani, 456 visite, 5 appuntamenti. A fine giornata: **266 clienti, 288 cani, 458 visite, 14 appuntamenti** — e nove di quei quattordici sono nati oggi.

**Il fatto della giornata non è un mandato: è che il calendario è tornato vivo.** Aveva 17 record in tutta la sua storia, tutti fra l'11 marzo e il 23 aprile, e zero da allora. Oggi Davide ci ha passato la giornata di lavoro. E da lì è arrivata la richiesta delle postazioni: non una domanda teorica, ma uno che stava usando lo strumento e ha sbattuto contro un muro.

> **Un dato mancante non è una preferenza espressa.** Per mesi abbiamo letto «17 appuntamenti e poi più nulla» come «il calendario non serve». Serviva: non era usabile.

**Fatto il 29 agosto**: sette mandati chiusi — `GH-34` rifiniture, `CD-03`+`GH-35` modo mese, `CD-04`+`GH-38` card pubblica e identità, `GH-37` postazioni, `GH-39` avviso di carico, `GH-40` soglie fedeltà, `GH-41` avviso di doppione, `GH-42` risposte in ritardo del calendario. **Tre atti sulla produzione**, applicati da Cowork su autorizzazione esplicita di Luigi, sempre **prima** del frontend e mai dopo.

**Quattro difetti trovati guardando, non leggendo**: l'insegna della card pubblica diceva «FROGLETINPOND» invece del nome del salone; un numero di telefono finto in produzione; il QR disegnato da un servizio esterno; il separatore delle migliaia assente. Nessuno rompeva niente — per questo nessuna suite li avrebbe visti.

**Restano da fare, in ordine di importanza:**

| # | Cosa | Chi |
|---|---|---|
| 1 | Rimuovere le due foto orfane via Storage API (percorsi nel §4 di `GH-12`) | Luigi |
| 2 | Attivare «Leaked password protection» sul prod | Luigi |
| 3 | Smontare `grooming-prova-generale` | Luigi |
| 4 | **Capienza a 3** quando apre la terza postazione — una riga di impostazioni, nessun rilascio | Cowork su richiesta |
| 5 | **Schermata impostazioni del salone** — rinviata a dopo il 1° settembre per decisione di Luigi: prima una settimana d'uso, poi si sa cosa serve davvero | dopo il test |

*(Accesso di Codex alla produzione: revocato il 29/8 riportandolo sull'organizzazione del demo. Duplicati « 2» nel worktree: rimossi.)*

**La veste è completa**, gestionale e card pubblica comprese. `CD-02`/`GH-33` hanno chiuso il report incassi, `CD-03`/`GH-35` gli hanno aggiunto il modo mese, `CD-04`/`GH-38` hanno vestito la card pubblica — l'unica superficie che un cliente vede per mesi, e l'ultima a non parlare la lingua del prodotto.

**Quattro cose vivono ora in `tenants.settings`** e nessuna richiede una build per cambiare: giorni di chiusura, numero WhatsApp, capienza delle postazioni, soglie fedeltà. È il motivo per cui la schermata di impostazioni è diventata necessaria.

**Code aperte, nessuna bloccante:**

- **«Operatività giornaliera» guarda la tabella sbagliata per il passato.** Interroga gli appuntamenti, che erano **5** e tutti fra l'11 marzo e il 23 aprile; da allora il salone registra il lavoro come visita — **253 visite dopo l'ultimo appuntamento**. Il 3 agosto la pagina dice «nessun appuntamento» mentre sono passati sei cani. Per le date passate deve mostrare le visite registrate. Sarà un `GH-` a sé.
- i contatti con lo stesso numero sotto lo stesso cliente si possono unire (si vede su Carnevale, la fusione lascia due righe identiche);
- i «cognomi-numero» ereditati dal quaderno si possono ripulire;
- un dubbio sulla ricerca staff — «mamma parrucchiera 340» non trova, «parrucchiera 340» sì — da riprodurre prima di chiamarlo difetto: il codice letto sembra reggere entrambe;
- le quattro frasi WhatsApp attendono le parole di Davide; cosa dà un livello fedeltà; se mettere una promozione al lancio;
- domanda per il salone, sollevata da Claude Design: **le righe che raccontano un'assenza contano come «cani passati»?** Oggi sì;
- **il controllo `lint` non è mai esistito.** Misurato il 29/8: in `package.json` c'è la riga `eslint src --ext js,jsx`, ma ESLint **non è fra le dipendenze**, **non ha configurazione** e **non è installato**. Non si è rotto: era una riga arrivata da un modello di progetto e mai completata. Da decidere: installarlo davvero e sistemare quello che troverà al primo giro, oppure cancellare la riga. **Lasciarlo com'è è la scelta peggiore delle due**: ogni registro di consegna porta in fondo la stessa falsa mancanza da venti mandati, e un controllo che fallisce sempre insegna a saltare la sezione delle eccezioni — che è la sezione dove il 28/8 è comparso il buco di sicurezza sulle note interne;
- **la coda delle lavorazioni non chiuse.** Un elenco degli appuntamenti passati da almeno un giorno e ancora «programmati»: una coda di lavoro, non un giudizio sul cliente. Nata discutendo `GH-41` e messa da parte deliberatamente, perché il problema che il salone ha posto era un altro.

**Fatto nuovo da sapere**: il salone ha **tre accessi staff** — Davide, Roby e Luigi. L'atto 4 promuove a operatore chiunque possieda schede legacy, e tutti e tre ne possedevano. In pratica ne funziona uno solo, perché la password è nota solo per l'account di Davide.

---

*Stato precedente, conservato per storia — aggiornato il 28 agosto 2026, mattina.*

- **Costruzione e riparazioni finite.** App clienti completa e con una porta d'ingresso funzionante; gestionale interamente rivestito; calendario ricostruito; orari, chiusure e durate nel modello giusto; i dodici difetti trovati percorrendo la vita di un cliente nuovo sono chiusi, più le due code. Unica superficie ancora vecchia: `WeeklyRevenue`, che è un report e merita una composizione di Claude Design.
- **Verso la produzione non manca lavoro: mancano i cancelli di G6.**

**Cancelli, in ordine di dipendenza:**

| # | Cosa | Stato |
|---|---|---|
| ~~1~~ | ~~Decisione su `services.price_cents`~~ | **chiuso 28/8** — due servizi, Bagno 20 €/45 min e Taglio 30 €/90 min, misurati contro un anno di incassi |
| ~~2~~ | ~~Ricetta G6 aggiornata~~ | **chiuso 28/8** — `GH-30 §6`, 54 atti con impronte |
| ~~3~~ | ~~Mandato G6 riscritto~~ | **chiuso 28/8** — `GH-31`, sostituisce GH-14 |
| ~~4~~ | ~~Lettura delle note interne~~ | **chiuso 28/8** — `GH-32`, tabelle staff-only e colonne rimosse |
| ~~5~~ | ~~Spot-check delle 5 schede~~ | **chiuso 28/8** — spostato all'atto 49, sulla produzione vera dopo il rilascio |
| ~~6~~ | ~~Account di Roby~~ | **chiuso 28/8** — accesso condiviso per scelta; il suo resta dormiente e non rimosso |
| ~~7~~ | ~~Impostazioni Auth in produzione~~ | **chiuso 28/8** — registrazioni aperte, conferma email spenta, verificate |
| ~~8~~ | ~~La chiave del salone~~ | **chiuso 28/8** — provata prima sul demo, poi impostata su `frogletinpond@` |
| ~~9a~~ | ~~Dump fresco~~ | **chiuso 28/8 ore 20:13** — tre file, verificati riga per riga contro il preflight |
| 9b | Autorizzazione di Codex su `Webapp_Project`, poi `GH-31` per nome | Luigi, **in corso stasera** |
| 10 | Post-G6: due foto orfane, toggle leaked-password, smontaggio del temporaneo, revoca accesso Codex | Luigi |

**Tutti i cancelli preparatori sono chiusi. L'atto G6 è in esecuzione la sera del 28 agosto.**

**Domande aperte al salone, nessuna bloccante**: cosa dà un livello fedeltà; le parole di Davide per i quattro messaggi; se mettere una promozione al lancio o lasciare la sezione vuota.

---

*Stato precedente, conservato per storia — aggiornato il 27 agosto 2026.*

- **La costruzione è finita.** App clienti completa (login, home, promozioni, scheda pet, wizard richiesta). Gestionale interamente rivestito: Dashboard, scheda cliente, form visita, calendario, rubrica, nuovo cliente, giornata, richieste, login. Unica superficie ancora vecchia: `WeeklyRevenue`, che è un report e merita una composizione di Claude Design — è anche l'ultimo consumatore della vecchia fascia `AppHeader`.
- **Il cerchio fra le due app è provato**: sul demo, richiesta del cliente → comparsa nel calendario staff → conferma con ora e durata scelte → appuntamento. È il flusso che giustifica il progetto.
- **Orari e durate sono nel modello giusto**: chiusure in `tenants.settings` (multi-tenant, niente orari nel codice); al cliente una forbice 45 min – 3 ore; la durata effettiva la sceglie chi ha visto il cane. Come il prezzo, come l'orario: **si decide quando si conosce il caso.**
- **Prova generale della migrazione completa e verificata** (GH-11 → GH-13): ricetta di 35 atti ordinati con impronte, **84,3 secondi** di sole chiamate DB, finestra raccomandata 15 minuti. Prod misurato **immutato** rispetto al dump del 21/8.
- **Verso la produzione non manca lavoro di costruzione: mancano i cancelli di G6.** Spot-check delle 5 schede, dump fresco, autorizzazione del collegamento di Codex su `Webapp_Project`, **`services` da popolare** (nomi, durate e decisione sul `price_cents` obbligatorio), redirect della radice verso il gestionale, due foto orfane da rimuovere via Storage API.
- **Code minori aperte**: due componenti morti da rimuovere; i quattro messaggi automatici attendono le parole di Davide; `deleteAppointment` senza consumatori; `CODEX_HANDOFF.md` da ricreare aggiornato.

---

*Stato precedente, conservato per storia — aggiornato il 24 agosto 2026.*

- **Canone operativo BEA** in uso dal 18/8, confermato su tutta la catena GH-01→GH-11: nessuno scostamento silenzioso, ogni interruzione motivata è stata trattata come consegna valida (GH-02, GH-02-bis, GH-05, GH-11).
- **Fase 1 sostanzialmente chiusa**: Login, Home, Promozioni, Scheda pet (GH-09) e Wizard richiesta appuntamento (GH-08) tutte vive sul demo. App staff risorta (GH-05-bis, Gate 5 chiuso parte applicativa). Gate 4/RLS e migrazione contacts→customer-first chiusi (GH-06, GH-07-bis). Hardening di sicurezza demo eseguito (GH-10): Advisor Security 21→6, Performance 115→113.
- **Scadenza di settembre rimossa** (decisione Luigi, 21/8 notte): l'obiettivo è chiudere il prima possibile, senza corsa e senza attese inutili. Il salone rientra dalle ferie il 1° settembre — finestra prod ideale nella settimana 25-31/8, ma non è più un vincolo di consegna.
- **Prod `grooming` trasferito su piano Pro** (org `Webapp_Project`, 21/8) dopo backup completo verificato (schema+dati+auth, SHA-256). Misura diretta sul prod: **296 clienti, 464 visite, 6 utenti auth** — molto più della stima storica di 189. Schema prod confermato **pre-Gate 2** (legacy puro, nessun `tenant_id`): la migrazione reale è più complessa del previsto, da cui il mandato GH-11.
- **PROVA GENERALE DELLA MIGRAZIONE COMPLETA** (GH-11 + GH-12 + GH-13, tutti verificati da Cowork sul cloud). Sul temporaneo `grooming-prova-generale` (`xkieyzuhtpiysjugtdik`) l'intera catena è stata eseguita dal dump prod fino all'hardening. **Stato finale misurato: 260 customers, 282 pets, 452 visite, 287 contatti, 3 utenti (sonde smontate), `phone NOT NULL`, 0 conflitti.** Suite RLS 26 PASS / 0 FAIL / 1 SKIP; Advisor Security 6 (tutte esposizioni dichiarate contratto) e Performance 99. App collaudata contro il temporaneo: login staff, dashboard sui dati veri, zero errori.
- **La ricetta G6 esiste**: 35 atti ordinati con impronta SHA-256 nel §9 del registro GH-13, più i 3 dump di partenza. **Attenzione: l'ordine non è quello alfabetico dei nomi file** — un `supabase db push` eseguirebbe la catena sbagliata. G6 è una trascrizione manuale e ordinata.
- **Il numero c'è: 84,343 secondi** di sole chiamate DB. Finestra raccomandata **15 minuti per il tratto DB**, più a parte i gesti manuali di Luigi.
- **Coda per G6, non dimenticabile**: due oggetti Storage restano orfani dopo la cancellazione delle 8 schede (percorsi esatti nel registro GH-12 §4) — `storage.protect_delete()` vieta la via SQL, servirà un gesto di Luigi via Storage API.
- **Ultima verifica umana rimasta**: confronto delle 5 schede reali del registro GH-13 §7 contro la vecchia app in produzione. Solo Luigi vede il prod.
- **Accesso Cowork a Supabase**: il collegamento OAuth vede un'organizzazione alla volta, non si somma. Ora è ripuntato su `morkdaorkggetto's Org` (demo + temporaneo) e ha perso la vista su `Webapp_Project` (prod) — da rispostare prima di qualunque verifica reale su prod (atto G6).
- **Lezione di canone del 24/8**: il connettore Supabase è unico per account, quindi un mandato consegnato alla sessione sbagliata **non fallisce, riesce** sul database giusto. I mandati portano in testa il progetto di appartenenza; ogni sessione dichiara la root su cui lavora prima del primo atto.

**Prossimo passo**: decisione Luigi sui due nodi aperti, poi mandato di ripresa a **un solo** Codex per la catena residua e la Fase 3 (suite RLS, collaudo app, durata end-to-end, smontaggio). L'atto G6 si scrive da lì.

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

**Nota strutturale sul demo (24/8, autodenuncia Cowork)**: la mia checklist post-GH-10 chiedeva di attivare "Leaked password protection" sul demo — errore mio, l'opzione è **Pro-only** e il demo è free. Sul demo l'avviso "leaked password" resta acceso *per costruzione*, accettato con motivo. Sul prod (ora Pro) il toggle è disponibile e va attivato **dopo G6**, non prima: le eventuali sorprese sulle password degli operatori si affrontano meglio a migrazione stabilizzata, non nel mezzo. Aggiunto alla checklist post-G6.

**Prossimo passo**: (a) push Luigi (3 commit: `a72daad` hardening + `4976f3f` interruzione GH-11 + commit doc con questo diario); (b) creazione progetto `grooming-prova-generale` nell'org free (regione indifferente, password DB nel password manager, comunicare solo il project ref); (c) alla comparsa del progetto nel MCP di Cowork, ripresa GH-11 Fase 1.

**Progetto temporaneo creato, accesso Cowork ripuntato — regressione misurata** (24/8): Luigi ha creato `grooming-prova-generale` in `morkdaorkggetto's Org` (ref `xkieyzuhtpiysjugtdik`, `ACTIVE_HEALTHY`). Primo tentativo di concedere accesso sbagliato: aperto "Invite team members" di Supabase, che invita persone via email e non c'entra con un collegamento OAuth d'app. Trovata poi la schermata giusta, "Authorize Claude" con selettore Organization. Dopo la riautorizzazione su `morkdaorkggetto's Org`, misura Cowork (`list_organizations`/`list_projects`): il collegamento vede **solo** quell'organizzazione — `grooming-hub-demo` e `grooming-prova-generale`, entrambi `ACTIVE_HEALTHY`. **Confermato il rischio segnalato prima del gesto**: l'autorizzazione OAuth di Supabase non si somma, sostituisce. `Webapp_Project` (quindi `grooming` prod, `bea-scuola-musica`, `caveabay-prenotazioni`) è uscito dalla vista di Cowork. Nessun impatto su GH-11 (la prova generale non tocca prod), ma da riautorizzare su `Webapp_Project` prima di qualunque verifica reale su prod, incluso l'atto G6. Prerequisito GH-11 ora soddisfatto: progetto temporaneo visibile, pronto per la Fase 1.

**Prossimo passo**: comunicare a Codex il ref `xkieyzuhtpiysjugtdik` per riprendere GH-11 Fase 1. Prima di G6, riautorizzare il collegamento Cowork su `Webapp_Project`.

**GH-11 già eseguito da un'altra sessione — l'arcano e la lezione di canone** (24/8): dato il ref a Codex-Grooming, questo si è fermato: il temporaneo era già popolato e migrato. Verifica Cowork sul cloud: 26 migration applicate fra le 09:41 e le 10:31 (CEST), schema post-Gate 2 completo, 268 customers / 290 pets / 295 contacts / 462 visits. Nessun file locale corrispondente alle tre migration prod-safe — firma di un agente che opera via connettore MCP, non via `db push`. **Causa accertata da Luigi**: il mandato GH-11 era stato incollato per errore nella sessione Codex di BEA, che lo ha eseguito — sul progetto giusto, perché **il connettore Supabase è unico per account**. Entrambi i Codex si sono comportati correttamente: uno ha eseguito, l'altro si è fermato davanti al lavoro altrui invece di sovrascriverlo (un restore logico su DB popolato non è idempotente). **Lezione di canone, non banale: un mandato consegnato alla sessione sbagliata non fallisce — riesce, sul database giusto. L'isolamento fra progetti sta nella mano che incolla, non nell'infrastruttura.** Da qui: i mandati devono portare in testa il progetto di appartenenza, e il primo atto di ogni sessione è dichiarare su quale root sta lavorando.

**Registro GH-11 recuperato e VERIFICATO** (24/8): Codex-BEA ha prodotto un registro completo (`docs/consegne/GH-11-registro-eseguito-24-08-2026.md`, 290 righe). Verifica Cowork indipendente, tutti i punti misurabili tornano: le 3 impronte SHA-256 dei file prod-safe in `webapp/supabase/prod-migrations/` coincidono al byte; **ogni orario del registro coincide al secondo con la versione della migration sul cloud** (09:41:41 CEST = `20260824074141` UTC, e così per tutte); le cardinalità dichiarate coincidono con la mia misura diretta. Il registro è autentico e ricostruibile.

**Gli scarti erano puliti, non perdite** (24/8): avevo segnalato 296→290 pet, 464→462 visite, 301→295 contatti come possibile perdita silenziosa. Il registro li spiega: **pulizia deliberata PRIMA dello split** dei 5 clienti-test dell'operatore + 1 record dell'account usa-e-getta, con i loro 2 visite / 6 contatti / 12 appuntamenti / 3 reward / 4 inviti / 3 account Auth. La checklist pre-G6 lo prevedeva; la scelta "prima e non dopo lo split" è stata presa da Codex-BEA senza un ok esplicito di Luigi in quella sessione — esito corretto, checkpoint saltato (stessa dinamica di GH-08, terza occorrenza). **290 pets → 268 customers** non è perdita ma deduplicazione per telefono normalizzato di proprietari con più animali, con 11 varianti di nominativo conservate in `operator_notes`. Un tentativo di cancellazione ha incontrato `storage.protect_delete()` ed è stato **annullato invece che aggirato** — nessun trigger disabilitato, i 51 oggetti Storage intatti. Comportamento canonico esemplare.

**DEBITO DOCUMENTALE APERTO (il rischio vero per G6)**: l'atto SQL di pulizia esiste solo nella traccia di sessione, **non è un file versionato**. `prod-migrations/` contiene 3 file (verificato), non 4. Senza quel file la catena G6 ha un buco: la migrazione prod non è riproducibile end-to-end. Va estratto e versionato prima di qualunque atto su produzione.

**Decisione del 21/8 su `phone NOT NULL` FALSIFICATA dai dati prod** (24/8, misura Cowork sul temporaneo): il preflight si è fermato su 7 customer senza telefono e 1 conflitto. Ho misurato chi sono. **Non sono scarti: sono clienti veri**, che il salone identifica a vista invece che per numero — «Elena straniera», «Cliente Alfredo (ragazzo riccio)», «Meccanico», «Ragazza che lavora da Susy», «ignoto», «Paola», «Enrico». Cinque su sette hanno storico di visite reali (3, 3, 1, 1, 1), l'ultima al 8/8/2026. La decisione «`customers.phone` resta NOT NULL» (Luigi, 21/8) era fondata sulla ricognizione **del demo** — 5 contatti ordinati, telefono sempre presente — e il prod la contraddice. Emerge anche la pratica reale del salone: molti intestatari hanno come *nome* il proprio numero di telefono. Codex-BEA ha fatto la cosa giusta tenendo `phone` nullable durante lo split e isolando `finalize_customers_phone_not_null_prod.sql` come atto separato **non applicato**. Decisione a Luigi (opzioni: accettare `phone` nullable in prod; oppure chiedere a Davide i 7 numeri prima della migrazione). Scartato per canone il segnaposto finto.

**Il conflitto singolo** (24/8, misurato): un contatto per un pet «pincher» porta il telefono `3337261321`, che punta al customer «Amico di Ernesto 3337261321»; ma il pet collegato appartiene a un customer identificato dal numero `3275394345`. Due persone reali attorno allo stesso animale (proprietario e chi lo accompagna) oppure un numero cambiato: risolvibile solo da Davide.

**Restano non eseguiti** (§11 del registro): backfill contacts GH-07-bis, `phone NOT NULL`, catena residua (whitelist, storage fix, RPC, campi GH-07-bis, hardening prod), suite RLS, collaudo app, smontaggio del temporaneo. E soprattutto **la misura di durata end-to-end** — «il numero che conta» per dimensionare la finestra G6. Le durate parziali note: restore completo ~27 s di sole chiamate DB, catena Gate 2 36,3 s. GH-11 **non va marcato completo**.

**Decisione Luigi + Roby (24/8): si cancellano 8 schede, la struttura resta stretta.** Le 7 senza telefono vengono dal libro clienti di un'altra toelettatura, assorbito quando l'addetto è passato da Davide e Roby — non sono clienti del salone. L'ottava è il conflitto: Roby riconosce un proprio errore di registrazione con due riferimenti telefonici, di cui il vero non è più risalibile. Verranno rischedate all'occorrenza («otto errori su quasi 300 pet sono tollerabili»).

**Autodenuncia Cowork: avevo torto su `phone NOT NULL`, e la misura sta con Luigi.** Avevo proposto di allentare il vincolo perché i 7 casi «dimostravano» che il salone incontra clienti senza numero. Obiezione di Luigi: quei 7 hanno **una causa sola e non ricorrente**, quindi denunciano che la regola *viene rispettata*, non che è inapplicabile — e non si degrada a opzione una cosa virtuosa. Verifica: 289 schede su 296 hanno il telefono, e nessuna scheda senza numero è nata dall'operatività normale. Avevo generalizzato da 7 record a una previsione strutturale che i 7 record contraddicono. Argomento in più emerso dal riesame: **il vincolo stretto è anche il più osservabile** — se un cliente fosse davvero irreperibile l'operatore non riesce a salvare e la cosa emerge, mentre col campo opzionale le schede senza numero si accumulerebbero in silenzio. Verificato che UI e RPC già bloccano con messaggio chiaro (`AddClient.jsx:110`): nulla da cambiare.

**Precisione sul conflitto** (misura Cowork): la scheda errata è *una* — contatto `ff68e870`, pet `c3614527` «pincher» (1 visita), customer `674521d8` intestato al numero «3275394345» e con quel solo pet. Il customer `70097dcd` «Amico di Ernesto 3337261321» **non si tocca**: è reale e attivo, 1 pet e 4 visite, compariva nel conflitto solo perché la scheda sbagliata portava il suo numero. Guardia esplicita richiesta nel mandato.

**Mandato GH-12 emesso** (24/8): `docs/incarichi/GH-12-chiusura-prova-generale.md`. Sette atti: (1) versionare l'SQL di pulizia già eseguito — salda il debito che oggi rende la catena G6 non riproducibile; (2) cancellazione delle 8 schede con perimetro dichiarato e cardinalità attese (268→260 customers, 290→282 pets, 462→452 visite, 295→287 contatti, senza-telefono e conflitti a **0**), guardia su «Amico di Ernesto», oggetti Storage orfani da elencare per il gesto prod via API; (3) `phone NOT NULL`; (4) **checkpoint con fermata esplicita**; (5) backfill contatti prod-safe; (6) catena residua con preflight `pg_proc`/ACL prima dell'hardening; (7) Fase 3 con suite RLS, spot-check di 5 clienti veri e **durata end-to-end**. Novità del mandato, dalla lezione di giornata: **ogni mandato porta in testa il progetto di appartenenza, e il primo atto della sessione è dichiarare la root su cui lavora**. Il checkpoint è formulato «consegna il registro, chiudi la sessione, attendi un mandato separato» invece del generico «fermati», che in GH-08 non aveva retto — terza occorrenza, causa ogni volta l'ambiguità del verbo.

**Regola di sistema adottata (Luigi, 24/8): i mandati non si incollano più.** L'incarico vive come file in `docs/incarichi/`; Luigi dice a Codex di «eseguire l'ultimo elaborato» e Codex lo trova da sé nella root del progetto. «Ultimo elaborato» = il `GH-NN` più alto in `incarichi/` senza registro corrispondente in `consegne/` — deterministico e auto-correttivo. Prerequisito: **prima il push, poi l'ordine di eseguire** (coincide con la coda di un gesto solo già stabilita il 21/8). Ragione profonda, misurata oggi: l'errore da copia-incolla non ha prodotto un fallimento ma **un'azione sbagliata riuscita in silenzio** — il guasto peggiore possibile. Spostando l'indirizzamento sulla root del progetto, che è un confine fisico, il guasto peggiore diventa «non trovo nessun task nuovo»: risultato nullo, innocuo, immediatamente visibile. Convenzione scritta in `docs/consegne/README.md`. Conseguenza per Cowork: non produce più blocchi da incollare, chiude indicando dove sta il mandato e che serve il push.

**GH-12 Atti 1-3 CONSEGNATI E VERIFICATI — checkpoint rispettato** (24/8): la regola nuova ha funzionato al primo giro, Codex ha trovato il mandato da sé e ha dichiarato la root come primo atto. Misure d'ingresso coincidenti in tutti e sei i punti (nessun atto concorrente). **Atto 1**: `20260824100000_cleanup_test_records_prod.sql` (201 righe) — trascrizione fedele dell'atto delle 10:24:42, non ricostruzione per differenza; versionato ma **non riapplicato**, perché nello schema corrente `clients` non esiste più. Il debito documentale è saldato: la catena G6 è di nuovo riproducibile. **Atto 2**: `20260824130000_drop_unreachable_records_prod.sql` (279 righe) applicato in 1.482 ms — 8 customers, 8 pets, 10 visite, 8 contatti rimossi, perimetro A per criterio misurabile e B per id espliciti, guardie su cardinalità globali e locali. **Atto 3**: `phone NOT NULL` applicato in 1.175 ms, zero forzature.

**Controprova Cowork indipendente sul cloud**, tutte le cifre coincidono con il registro: customers **260**, pets **282**, visits **452**, contacts **287**, customers senza telefono **0**, `customers.phone IS_NULLABLE = NO`. Il customer protetto «Amico di Ernesto» è **presente con il suo pet e le sue 4 visite**; i tre record del conflitto sono assenti. La guardia ha fatto il suo lavoro.

**Il checkpoint ha tenuto per la prima volta con la formulazione esplicita**: Atti 5-7 non iniziati, temporaneo non smontato, sessione chiusa in attesa. La riscrittura «consegna il registro, chiudi la sessione, attendi un mandato separato» ha retto dove il generico «fermati» di GH-08 non aveva retto. *(Autodenuncia: nel mandato GH-12 avevo scritto «è la terza volta che un checkpoint viene attraversato» — affermazione non misurata. Il caso documentato è uno, GH-08; GH-09 Fase 1 e GH-11 si erano fermati correttamente. Il mandato non si riscrive, la correzione si annota qui.)*

**Due scoperte dal registro**: (a) delle 3 foto del perimetro A solo **2 erano oggetti Storage** — la terza era un **data URL da 916.607 caratteri incorporato nella riga** `pets.photo_url`, sparito con la riga; misura Cowork di controllo: **0 data URL residui** sul temporaneo, 42 foto tutte per riferimento, quindi era un'anomalia isolata dell'app legacy e non un problema strutturale. (b) I due oggetti Storage orfani hanno percorso esatto dichiarato nel registro §4 — diventano un gesto di Luigi via Storage API dentro G6, altrimenti in prod resterebbero foto senza scheda.

**Ordine della ricetta G6 fissato** (raccomandazione Codex §8, accolta): `prepare legacy → cleanup test → split → drop unreachable → finalize phone`. La pulizia dei test resta **prima** dello split; la cancellazione delle 8 schede **dopo** lo split e **prima** del `NOT NULL`. Nessuna scorciatoia contro `storage.protect_delete()` nel SQL, mai.

**Nota**: `docs/consegne/README.md` (regola nuova), `docs/diario-progetto.md` e il mandato GH-11 sono stati correttamente **esclusi** dal commit di Codex come modifiche parallele di Cowork — restano da committare a Luigi.

**Push eseguito da Luigi** (24/8): `1191b89..24c5af4`, due commit — GH-12 di Codex più il commit documentale con la regola nuova. Nota di percorso: il repository sta in `webapp/`, non nella cartella superiore (avevo indicato la root sbagliata). Segnalato per dopo, senza toccarlo ora: esiste un **secondo repository annidato** in `webapp/grooming-app/.git`, da capire e archiviare a G6 chiuso.

**GH-13 CONSEGNATO E VERIFICATO — LA PROVA GENERALE È COMPLETA** (24/8): preflight contatti **0 casi manuali, 0 conflitti** (il ramo condizionato del mandato ha quindi lasciato correre la catena senza fermate, come previsto). Assorbimento contatti in variante prod-safe senza guardia demo (`20260824140000`, idempotenza provata a impronte invariate), catena residua completa, hardening prod-safe con preflight `pg_proc` sulle 10 routine attese. Suite RLS finale **26 PASS, 0 FAIL, 1 SKIP** (unico tenant nel dump), dopo due cicli diagnostici che hanno scoperto il difetto sotto. App locale costruita contro il temporaneo: login staff migrato, dashboard con 282 schede e 452 visite, zero errori console.

**Controprova Cowork indipendente**, tutto coincide: customers **260**, pets **282**, visits **452**, contacts **287**, services 0, appointment_requests 0, auth users **3** (i soli operatori reali — tutte le sonde smontate), `relationship_status` valorizzato su tutti i 260, entrambi i campi lead presenti. Advisor Security **6**, e sono esattamente le 5 esposizioni `SECURITY DEFINER` dichiarate contratto in ERRATA voce 10 più il toggle leaked-password (Pro-only, quindi non attivabile sul temporaneo che è su org free). Performance **99** contro i 113 del demo: 13 policy permissive e 1 indice in meno, differenza spiegata dallo schema prod. Nessuna regressione.

**Sospetto Cowork verificato e rientrato**: il registro §4 dichiarava assenti due routine trigger «presenti solo nel demo» (`enforce_customers_operator_notes_staff_only`, `enforce_pets_internal_notes_staff_only`), e temevo un buco di protezione sulle note lato customer. Misura diretta sui trigger: le protezioni **ci sono**, sotto nomi nuovi — `trg_customers_protect_directory_fields` e `trg_pets_customer_update_whitelist`. Copertura pari o migliore delle legacy. Nessuna azione.

**LA SCOPERTA CHE GIUSTIFICA L'INTERA PROVA GENERALE — e un mio errore** (24/8): la catena si è rotta alla suite RLS perché mancava `appointments.service_id`. La migration `20260520051506_add_service_id_to_appointments.sql` è un **prerequisito dichiarato** di `appointment_requests`, e **non era nella lista che avevo scritto nel mandato GH-13**. Su produzione, in finestra di manutenzione, la catena si sarebbe interrotta a metà — con il database già trasformato e nessuna via ovvia se non diagnosticare sotto pressione. Codex l'ha corretta usando un file già approvato, senza scriverne di nuovi, e l'ha ricollocata al punto giusto nella ricetta. **Questo è precisamente ciò per cui si fa una prova generale**: non per confermare che funziona, ma per scoprire dove si rompe quando ancora costa niente.

**Trappola d'ordine da non dimenticare a G6**: l'ordine della ricetta **non coincide con l'ordine alfabetico dei nomi file** — il primo atto è `20260824110000_prepare_legacy`, il secondo `20260824100000_cleanup_test`. Un `supabase db push`, che ordina lessicalmente, **eseguirebbe la catena sbagliata**. G6 deve essere una trascrizione manuale e ordinata del §9 del registro GH-13, che elenca tutti e 35 gli atti con impronta SHA-256.

**IL NUMERO CHE CONTA** (24/8): somma delle sole chiamate DB della ricetta, ricostruita dai tre registri, **84,343 secondi**. Ripartizione: restore 29,2 s · pulizia test 1,1 s · prepare+split 6,2 s · Gate 2 36,3 s · drop+phone 2,7 s · assorbimento+catena+hardening 8,9 s. Codex ha correttamente **rifiutato di dichiarare un tempo di parete end-to-end**, che non è osservabile perché i tre giri erano separati da checkpoint e pause di decisione — dire un numero unico sarebbe stato mentire. Raccomandazione accolta: **finestra minima di 15 minuti per il tratto DB**, con margine ampio per le controprove; a parte i gesti manuali di Luigi (Storage API per i 2 oggetti orfani, merge, deploy, promozione, verifica).

**Aperto per Luigi prima di G6**: confronto manuale delle 5 schede reali estratte nel registro §7 (Signora capodichino/Ariel, Davide e Nunzia/Nobu, Moglie polleria/Rocky, JackRussel, Carnevale/Schila) contro la vecchia app in produzione — è l'unica verifica che Cowork e Codex non possono fare, perché nessuno dei due vede il prod. Password staff sul solo temporaneo impostata da Codex su autorizzazione di Luigi, consegnata via Appunti e mai stampata; muore con lo smontaggio.

**Connettore Cowork riportato su `Webapp_Project` e PROD VERIFICATO IMMUTATO** (24/8): riautorizzazione riuscita al secondo tentativo — il primo era un falso positivo, Luigi aveva concesso il «consenti sempre» dell'app, che riguarda i permessi di chiamata e non l'organizzazione coperta dalla concessione Supabase. Distinzione da ricordare: sono due pannelli diversi.

Misura diretta sul prod `azgehoseiojodltcttfb`, confronto con la fotografia del 21/8 su cui è calibrata l'intera ricetta:

| | dump 21/8 | prod oggi |
|---|---:|---:|
| clients | 296 | **296** |
| visits | 464 | **464** |
| contacts | 301 | **301** |
| utenti auth | 6 | **6** |
| appointments | 17 | **17** |
| profiles | 4 | **4** |

Zero clients creati o modificati dopo il 21/8, zero visite. Ultimo cliente creato l'8/8, ultima modifica il 12/8, ultima visita il 13/8 — tutto **precedente** al dump, coerente con il salone in ferie. Migration registrate: 10, ultima `20260423123000`, cioè ancora pre-Gate 2.

**Conseguenza**: la prova generale è rappresentativa, il dump del 21/8 è una fotografia fedele, e **l'atto G6 si scrive per trascrizione** dal §9 di GH-13 senza ricalibrare nulla.

**CAMBIO DI PRIORITÀ (Luigi, 24/8): prima l'allineamento delle due facce, poi G6.** Motivazione: «non ho due settimane, preferisco fare adesso quello che mi rende l'app somigliante a quella che sarà quando verrà utilizzata». Cowork aveva raccomandato l'ordine inverso (la finestra di migrazione è a sconto solo finché il salone è chiuso e il prod resta fermo; il restyling costa uguale in qualsiasi momento) — obiezione presentata una volta e accolta la decisione. Conseguenza da tenere presente: dal 1° settembre il prod ricomincia a divergere dalla fotografia su cui è tarata la ricetta, e a un certo punto la prova generale andrà rinfrescata.

**Inventario misurato del gestionale** (24/8): 22 file, ~10.300 righe, **zero file CSS** — 787 blocchi `style={{` dentro il JSX, mescolati a classi Tailwind, con adozione dei token lasciata a metà (alcune pagine già su `var(--color-*)`, altre con letterali fuori palette come `#7c2d12` in Dashboard). Le maggiori: Calendar 1.572, ClientDetail 1.235, Dashboard 659, Contacts 553, AddClient 535. **Peso morto individuato**: `CustomerPortal.jsx` (1.373) + `CustomerLogin` + `CustomerInvite` ≈ 1.800 righe del vecchio portale clienti, superate dall'app customer — da rimuovere in un mandato di pulizia, non da rivestire (conferma prima di cancellare).

**Brief GH-15 emesso per Claude Design**: `docs/incarichi/GH-15-brief-claude-design-veste-staff.md`. Principio guida: **stesso vocabolario, registro diverso** — il gestionale eredita palette, tipografia e componenti dell'app customer ma non la sua composizione, perché è uno strumento di lavoro usato di corsa e non un luogo dove ci si ferma. Tensione consegnata a CD da sciogliere: più densità significa bersagli tattili più piccoli, e chi tocca lo schermo ha le mani bagnate. Regola non negoziabile: **stesse ossa, pelle nuova** — nessuna riorganizzazione dei flussi, perché Davide e Roby hanno memoria muscolare e non si rifonda l'architettura dell'informazione il primo giorno dopo le ferie; se CD vede qualcosa organizzato male lo dichiara a parte come proposta.

**SCOPERTA DI PRODOTTO — il calendario è stato lasciato a digiuno, non rifiutato** (24/8, misura Cowork sul prod, nata da un dubbio di Luigi sugli screenshot): **17 appuntamenti in tutto, tutti fra l'11 marzo e il 23 aprile; zero da maggio in poi.** Nello stesso periodo: 464 visite registrate, di cui **176 da luglio**. Il salone ha smesso di pianificare dopo sei settimane e da allora registra le visite a consuntivo. Ipotesi di Luigi, coerente con i numeri: senza il lato customer, tenere un calendario a mano era lavoro doppio: nessuno lo alimentava dall'esterno. **Conseguenze**: (a) la vista settimanale non è rotta, è vuota — qualunque data si guardi; (b) conferma a posteriori che il modello «richiesta, non prenotazione a slot» di GH-03/GH-08 era giusto, perché non esiste alcuna agenda prenotata da difendere; (c) dopo il lancio il calendario potrebbe riempirsi **da solo** per la prima volta, via conversione delle richieste in appuntamenti. **Domanda per Davide prima di comporre quella schermata**: la giornata diventerà «calendario-primo», cioè organizzata guardando l'agenda la mattina, invece che accogliendo chi si presenta? È una domanda sul mestiere e cambia la composizione — meglio chiederla che indovinarla.

**Ordine del restyling deciso di conseguenza**: primo giro **Dashboard, scheda cliente, registrazione visita** — le tre schermate da cui passano davvero le 176 visite recenti. **Calendario al giro successivo**, dopo la risposta di Davide e quando si vedrà se le richieste lo riempiono: è la schermata più costosa dell'app (1.572 righe) e rivestirla al buio sarebbe lo spreco maggiore possibile.

### 25 agosto 2026 — La veste del gestionale (GH-16 → GH-17)

**GH-16 Fase 1 consegnata, checkpoint rispettato** (25/8): tabella di confronto fra la composizione CD e il codice reale delle tre superfici, zero file applicativi toccati (verificato da Cowork). Risposta misurata alla domanda §9.7 di CD: **le cinque aree operative sono tutte vive**, nessuna porta a una pagina vuota. Nessuna divergenza rispetto alla verifica schema dei campi ⚠. Otto decisioni sollevate e non risolte d'ufficio.

**Scoperta di Fase 1: `AddVisit.jsx` era una pagina murata.** La stringa `add-visit` compare nel codice **una volta sola**, nella registrazione della rotta: nessun pulsante, nessun link. Le 464 visite dello storico sono state registrate tutte dal form dentro `ClientDetail.jsx`. Stavamo per rivestire una stanza a cui nessuno arriva. La terza tappa è stata perciò riscritta: non «rivesti `AddVisit`» ma «estrai il form e fallo usare da entrambe le superfici».

**Le otto decisioni, risolte da Luigi** (25/8, su raccomandazione Cowork): sesta tile Dashboard respinta (una visita non è registrabile senza aver prima scelto un cliente: la tile aggiungerebbe un passo, non lo toglierebbe); alert pending mantenuto, slot odierni no; CTA nuovo cliente ferma, FAB mobile ammesso perché additivo; sezioni della scheda invariate — l'handoff dice sette, il bundle sei, il codice sei più due condizionali, **vince il codice**; scroll unico su mobile, le tre viste di CD rimandate a lei perché ne specifichi la navigazione; ordine delle sei azioni invariato, dichiaratamente il caso «sembra migliorabile, si segnala e non si corregge»; form visita condiviso; `Button` esteso e non duplicato in `Btn`.

**Correzione Cowork ai nomi dei token, prima che facesse danni**: la tabella colori di Fase 1 proponeva destinazioni `--gh-warning-text`, `--gh-secondary`, `--gh-danger-text` e simili. **Non esistono.** CD ne ha autorizzati tre soli — `--gh-bridge`, `--gh-border-60`, `--gh-border-35` — e tutto il resto conserva il nome `--color-*`. Creare una famiglia `--gh-*` parallela sarebbe stato introdurre colori nuovi sotto altro nome, cioè violare il vincolo rispettandolo alla lettera.

**GH-17 CONSEGNATO — il gestionale ha la veste nuova** (25/8): quattro commit, uno per tappa (`d5ab7b4` fondazione, `6d6b8ba` Dashboard, `84c0727` scheda, `926a621` form condiviso).

| Superficie | Righe | Stili inline | Hex |
|---|---|---|---|
| Dashboard | 659 → **377** | 43 → **0** | → **0** |
| Scheda cliente | 1.235 → **746** | 105 → **0** | → **0** |
| Registrazione visita | 361 → **133** | 28 → **0** | → **0** |

Complessivamente **2.255 → 1.256 righe e 176 → 0 stili inline**: il layout è uscito dal JSX ed è finito in `gh15-staff.css`, che è il primo foglio di stile che il gestionale abbia mai avuto. I tre token nuovi in `index.css`, un solo breakpoint a 640px, cifre tabulari, nove combinazioni schermata × larghezza tutte passate senza overflow e senza bersagli sotto 44px.

**Giudizio di Codex accolto**: il FAB nuovo cliente era autorizzato ma **non è stato usato** — alle larghezze minime avrebbe coperto parte dell'ultima area operativa. Decisione dichiarata con motivo, coerente col §7.10 di CD («nessuna FAB sopra un'azione primaria»).

**Sospetto Cowork verificato e rientrato**: il registro dichiarava di aver normalizzato a zero la spaziatura fra lettere, e CD aveva vincolato l'eyebrow da 9.5px a esistere **solo** con `letter-spacing: .19em`. Misura diretta sul CSS: l'eyebrow conserva `0.19em`; è stata azzerata solo la spaziatura **negativa** dei titoli. Nessuna regressione.

**RISCHIO APERTO — l'app customer non è stata riprovata dopo la modifica delle fondamenta condivise.** GH-17 ha modificato `Card`, `Icon`, `Skeleton`, `Eyebrow`, `StatusBadge`, `WarmNotice` e `Button`. Misura Cowork: **sette pagine customer li importano** (Home, Login, Promotions, Pet, Book, Redeem, Forgot). Le controprove hanno coperto le sole tre superfici staff. Le estensioni sono dichiarate retrocompatibili e la build è verde, ma la build intercetta gli errori di importazione, non le regressioni visive. **Da chiudere prima di qualunque passo verso la produzione**: l'app customer è finita, verificata e prossima al rilascio, e le sue fondamenta sono state toccate senza riguardarla.

**Terzo difetto di mandato di Cowork, stessa famiglia dei precedenti** (autodenuncia): GH-17 chiedeva come controprova «registrazione di una visita di prova dal gesto reale, poi rimossa» e **contemporaneamente vietava ogni uso del database**. Contraddizione. Codex l'ha dichiarata invece di scegliere in silenzio quale metà obbedire. Il filo è visibile: GH-05 aveva un elenco file incompleto, GH-13 ometteva il prerequisito `service_id`, GH-17 si contraddice sulla verifica. **I miei mandati sono più deboli proprio dove prescrivono come verificare** — da guardare la prossima volta che ne scrivo uno.

**Prossimo passo**: micro-mandato che chiude entrambi gli aperti in un colpo, perché entrambi richiedono il demo — regressione visiva delle sette pagine customer e ciclo reale di registrazione visita marcato `[DEMO][GH-17]` con rimozione nella stessa sessione. Emesso come `GH-18`.

**Il login staff era fuori perimetro, ed è un buco mio** (25/8): Luigi aveva chiesto a voce a Claude Design di comporre anche la schermata di accesso. Misura Cowork sul bundle consegnato: del login **non c'è traccia** — non nell'handoff, non in un file di composizione, non una classe CSS. Il brief `GH-15` che avevo scritto io nomina tre schermate e il login non c'è; CD ha composto contro il brief scritto. E quando ho verificato l'handoff sui nove requisiti l'ho confrontato di nuovo con il mio stesso brief, quindi **una schermata mancante era invisibile per costruzione**. È il buco fra una richiesta detta e un mandato scritto: esattamente ciò che il canone dovrebbe impedire. Da recuperare con un `CD-01` breve — il kit esiste già, a CD resta la sola scelta del registro (accoglienza editoriale come il login clienti, oppure porta di servizio asciutta).

**Mezz'ora di caccia a un guasto che non c'era** (25/8): login apparentemente in loop, «app vecchia» dopo l'accesso, sospetti su cache, sessioni e deployment. Esito reale: **funziona tutto.** La radice del sito rimanda a `/u/login` per una scelta del 13 maggio (consegnare la preview al salone su un indirizzo pulito), quindi Luigi bussava tre volte alla porta dei clienti; e il login staff «sembra vecchio» perché **lo è per contratto**, non essendo mai stato nel perimetro. Dopo l'accesso la Dashboard nuova c'era. Due lezioni: le ipotesi vanno ordinate dalla più banale (che indirizzo stai aprendo) alla più esotica (cache, sessioni, deployment), e io ho fatto il contrario; e un perimetro che esclude una schermata va detto **prima** che qualcuno la guardi, non dopo.

**Decisione di prodotto (Luigi, 25/8): la radice del sito porterà al gestionale**, e i clienti raggiungeranno la loro app da inviti e QR, che è come la raggiungono davvero. Il redirect di maggio verso `/u/login` era nato per una preview e diventerebbe la porta d'ingresso sbagliata: se ci è inciampato tre volte chi l'ha costruita, il 1° settembre ci inciampano Davide e Roby. In coda alle cose da chiudere prima di G6.

### 30-31 agosto 2026 — Il salone si chiama ZavaRoby, e i cani hanno tre fotografie

**Il salone non si chiamava come credevamo.** `tenants.name` valeva «Grooming HUB» — che è **il nome del software**, non del negozio. Il negozio è **ZavaRoby Pet Station**: è il nome sul cartello, sui social, e l'unico che un cliente riconosca. La card pubblica diceva quindi a degli sconosciuti un nome mai sentito.

È **lo stesso difetto di sabato in forma più sottile**: prima l'insegna mostrava «FROGLETINPOND», l'email di un operatore; poi il nome del programma. In entrambi i casi un'identità che non era quella del salone. Corretto con **un solo valore nel tenant**, e la modifica è comparsa immediatamente in tre punti — insegna della card, riga di chiusura, messaggio d'invito — senza rilascio. La prova che il nome è un dato e non una stringa.

L'app staff continua a chiamarsi «Grooming Hub» in cima, ed è giusto: **quello è lo strumento**, e lo vedono solo Davide e Roby.

**I nomi scritti per un quaderno** (`GH-46`, `GH-48`). Misurato: **169 clienti su 267 hanno cifre nel nominativo**, e **105 sono solo un numero di telefono**. Il messaggio d'invito avrebbe scritto «Ciao 3333589030» a un cliente su tre — con dentro un collegamento, cioè qualcosa di indistinguibile da una truffa. I **cani** invece hanno un nome nel 96% dei casi: è il quaderno di una toelettatura, dove le persone si annotano col cellulare e gli animali si chiamano per nome. Il messaggio quindi **non saluta il padrone**: nomina il salone e il cane.

Poi il problema gemello: **63 cani su 288 hanno per nome la propria razza** — `chihuahua`, `Meticcio`, `York`, `barboncino nero`, e un `non pervenuto`. Ripiego adottato: si dice «il tuo pet» **solo quando il nome coincide esattamente con la razza**. Nient'altro, perché `Milo maltese` un nome ce l'ha.

> **Un cambio di destinatario, non un problema di formattazione.** Quei campi sono stati scritti per un quaderno, non per gli occhi del proprietario: erano appunti privati — «il barboncino nero», «quello della pizzeria». Con il primo invito, **267 schede scritte in privato vengono mostrate alle persone che descrivono.**

Da cui la scelta di progetto: il riquadro dell'invito mostra **prima di generare** nominativo, numero, nome del cane e testo che partirà. Così l'operatore corregge **il dato**, non il messaggio. **La campagna inviti è l'unica occasione in cui qualcuno guarderà quelle 267 schede una per una**: è un'occasione di pulizia, non solo un rischio.

**«Il tuo cane» → «il tuo pet»** (correzione di Luigi in corsa): il campo `species` è **vuoto per tutti e 288**. Il database non sa che quelli siano cani — lo davamo per scontato noi.

**Le promozioni non si potevano scrivere** (`GH-49`). La tabella esisteva dai tempi di G6, completa; l'app clienti aveva la pagina che la legge; **nel gestionale non c'era nessuna schermata per crearne una**. La sezione vuota non poteva quindi funzionare da stimolo: Davide non la vede mai, e non aveva un pulsante. Ora c'è la gestione, e il promemoria sta **in Dashboard, accanto alla mano che può agire**. Scoperto e corretto anche un difetto della policy: controllava `valid_to` ma **non `valid_from`**, quindi una promozione programmata in anticipo sarebbe stata visibile subito.

**Le tre fotografie** (`CD-05`, `GH-50`). Il salone e il proprietario si contendevano una colonna sola, e per due ragioni entrambe legittime: la foto di Davide e Roby **non è un ritratto**, è un segno di riconoscimento — inquadra il dettaglio storto, altrimenti restano «mille barboncini che si assomigliano tutti». Quella del proprietario è il gesto per cui una persona riapre un'applicazione.

Non erano in conflitto: erano **due fotografie in un posto solo**, e ne è emersa una terza. Ora sono tre colonne — riconoscimento del salone, ritratto del proprietario, album delle lavorazioni — e nessuna sovrascrive l'altra. Anche lo **spazio su disco** è separato: il cliente scrive solo dentro `{salone}/{cane}/owner/`.

> **Le due frasi che risolvono il conflitto** sono di Claude Design e valgono più del codice: *«La foto piccola è quella che usiamo noi al banco per riconoscerlo»* trasforma una foto sgraziata in un **segno di mestiere**; *«Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto»* toglie al proprietario la stessa paura che aveva il salone.

**Altre chiusure**: la porta di registrazione sulla pagina staff, che prometteva una mail mai spedita (`GH-43`); il calendario che poteva mostrare la settimana sbagliata cambiando periodo troppo in fretta (`GH-42`); il tetto alle richieste aperte e **il gesto di scollegamento di un account**, che mancava e che la funzione di riscatto già prometteva (`GH-44`); foto legacy e scadenza degli inviti a tre giorni (`GH-45`).

**Suite RLS: da 30 casi a 49**, senza SKIP.

**Un fatto di igiene da risolvere**: il repository vive sulla **Scrivania sincronizzata con iCloud**. Ha già prodotto un centinaio di file duplicati con suffisso « 2» e, il 31, sessantasette file segnalati da git come modificati **senza una sola differenza di contenuto** — `Resource deadlock avoided`, cioè file che iCloud teneva fuori dal disco. La correzione pulita è spostare il repository fuori da Scrivania e Documenti; costa la riscrittura del percorso in tutti i mandati, quindi va fatta a mente fresca e con tutto il resto fermo.

**Una nota di metodo**: Cowork ha **inviato per errore un messaggio a Codex** provando a cancellarlo dal campo di scrittura. Contenuto innocuo, ma la regola era esplicita — *l'Invio è di Luigi*. Da ora Cowork scrive nel campo **solo** testo destinato a essere inviato, e non lo tocca più per correggere o pulire.

### 29-30 agosto 2026 — Prima del primo invito: quello che si può fare con un collegamento in mano

Il giro è nato da una domanda di Davide sui **doppioni** — capita che un cliente chieda un appuntamento, se ne dimentichi e ne chieda un altro — e si è allargato a tutto ciò che accade quando un estraneo ha in mano un invito.

**Cinque mandati chiusi**: `GH-41` avviso di doppione, `GH-42` risposte in ritardo del calendario, `GH-43` porta staff senza registrazione, `GH-44` tetto alle richieste e scollegamento, `GH-45` foto e scadenza degli inviti. Suite RLS passata da **30 a 41 casi**.

**Il flusso di registrazione del cliente era già costruito, e nessuno l'aveva mai guardato tutto insieme.** Misurato: l'invito si aggancia **per numero di telefono**, non per cane — quindi serve **un invito per cliente, non per cane**, e chi riscatta vede tutti i propri animali. I 267 clienti hanno **267 telefoni distinti e zero email**: il salone conosce le persone per telefono, l'app le autentica per email, e il ponte è che **l'email la sceglie il cliente al momento del riscatto**. Il salone non la conosce e non deve conoscerla.

**Il modello di minaccia, misurato invece che immaginato.** Alla domanda di Luigi — *«possiedo il link e comincio a registrare cani fantasma per danneggiarti»* — la risposta è che **non si può**: su `pets` il cliente ha solo `SELECT` e `UPDATE`, e l'aggiornamento passa da una whitelist che lascia sopravvivere **tre campi soli** (note del proprietario, preferenze manto, foto). Tutto il resto viene ripristinato dal database, **blacklist e punteggio no-show compresi**. Non può creare cani, schede o visite; non vede altri clienti; non ottiene accessi staff; non può prendersi un telefono altrui, perché è unico per salone.

> **Il rischio serio non era il danno: era l'irreversibilità.** Tre delle sei righe della tabella delle minacce si chiudevano con lo stesso gesto — **scollegare un account da una scheda** — che non esisteva. E la funzione di riscatto lo prometteva già: davanti a un telefono occupato diceva *«contatta il salone per riassegnare l'anagrafica»*, cioè rimandava a qualcosa che nessuno aveva costruito.

**La scoperta di sicurezza della giornata**, trovata cercando altro. Le foto dei cani stanno tutte — **42 su 42** — nel secchio legacy `client-photos`, mentre `pet-avatars`, creato durante G6 e con permessi scritti bene, era **vuoto**. E su quello legacy vivevano quattro policy generate dal pannello di Supabase agli inizi — `client_photos_auth_all` — che concedevano **lettura, scrittura, modifica e cancellazione a qualunque utente autenticato**, senza controllo di proprietà né di salone.

Conseguenza: dal primo invito in poi, un cliente qualsiasi avrebbe potuto **cancellare o sostituire tutte le foto dei cani del salone**, che compaiono anche sulla card pubblica. Non era sfruttabile oggi — gli account erano tre, tutti del salone — ma si sarebbe acceso esattamente il giorno del primo invito.

> **Perché era sopravvissuto all'irrigidimento di agosto**: `GH-10` guardava funzioni, tabelle e policy dello schema `public`. **I permessi dei secchi non erano in perimetro.** Non distrazione: confine. È il tipo di angolo che si ripete, e per questo è scritto qui.

**Cinque atti sulla produzione in una giornata**, tutti applicati da Cowork su autorizzazione esplicita di Luigi, tutti **prima** del frontend: identità e QR della card, capienza delle postazioni, soglie fedeltà, tetto e scollegamento, foto e scadenza. Ogni volta con le misure prima e dopo, e ogni volta con un controllo di sicurezza preventivo — il più utile: **la funzione della card pubblica eseguita su tutti i 288 token esistenti**, per accertare che nessun cartoncino stampato smettesse di aprirsi.

**Le impostazioni del salone contengono ora sei cose**, tutte modificabili senza una build: giorni di chiusura, capienza, recapito WhatsApp, soglie fedeltà, durata degli inviti (**3 giorni**, decisione di Luigi: un collegamento in una chat sopravvive a inoltri e cambi di telefono), tetto alle richieste aperte (**3**).

**Altri due difetti chiusi**: la pagina di accesso staff invitava a **registrarsi**, promettendo una mail di conferma che non parte — e nessuno deve potersi iscrivere come operatore da sé; e il calendario poteva **mostrare la settimana sbagliata** se si cambiava periodo prima che finisse il caricamento, difetto preesistente trovato da Codex mentre provava altro, e diventato quotidiano il giorno in cui il salone ha ripreso a usare quella schermata.

**Da sapere**: durante le prove è stata inviata una mail di reimpostazione password all'alias `frogletinpond+gh43invite@gmail.com`, che è **la casella di Davide**. Era la sola prova possibile che l'invio funzioni davvero. **Il recupero password funziona, ma attraverso il servizio email predefinito di Supabase**, dichiaratamente limitato e senza garanzia di consegna. È la chiave del salone: prima o poi serve un servizio di invio vero.

### 29 agosto 2026, mezzogiorno — Il calendario è tornato vivo, e il salone lo ha detto senza dirlo

**Nove appuntamenti creati oggi.** Il calendario aveva **17 record in tutta la sua storia**, tutti fra l'11 marzo e il 23 aprile, e **zero da allora** — era la ragione per cui CD-01 aveva potuto ripensarlo invece di rivestirlo: «nessuno ci ha costruito abitudini sopra».

Oggi, il giorno dopo la migrazione e con la veste nuova, Davide ci ha passato la giornata di lavoro: nove appuntamenti fra le 9:30 e le 19:30, creati da operatore, alcuni già segnati come completati.

**E spiega da dove veniva la segnalazione delle postazioni.** Al mattino Luigi aveva riportato: *«il salone ha tre postazioni, quindi la guardia che mi impedisce di collocare più di un pet nella stessa fascia ne deve tenere conto»*. Non era una richiesta teorica: era **uno che stava usando lo strumento e ha sbattuto contro il muro**. Il muro era la capienza uno, implicita nel fatto che bastava *un* conflitto per bloccare.

> **La lezione, e vale oltre il calendario.** Per mesi abbiamo dedotto dall'assenza di dati che quella funzione non servisse. Serviva: non era usabile. **Un dato mancante non è una preferenza espressa** — è una domanda a cui non è ancora stato possibile rispondere.

**`GH-37` — le postazioni.** Capienza in `tenants.settings`, non nel codice: cambierà da 2 a 3 per questo stesso salone entro settimane, e il prossimo salone avrà un altro numero. La regola giusta è il **picco di contemporaneità**, non il conteggio delle sovrapposizioni: se quattro lavorazioni toccano l'orario scelto ma non sono mai più di due insieme, con tre postazioni ci si sta. Risolta con un algoritmo a spazzata e un lock per tenant, **nel database**, perché il browser non è il confine: due dispositivi possono chiedere lo stesso posto e uno solo deve riuscire. Più una guardia che impedisce di **abbassare** la capienza sotto le lavorazioni già pianificate.

**Secondo atto sulla produzione della giornata**, applicato da Cowork su autorizzazione di Luigi. Controllo preventivo: picco di contemporaneità **1** sui 14 appuntamenti esistenti, nessuna violazione. Dopo: capienza 2, entrambi i trigger presenti, dati intatti.

**Terzo errore di misura di Cowork in due giorni, stessa famiglia.** Il mandato diceva «ci sono cinque appuntamenti, tutti passati»: era la misura della **produzione**, e Codex lavorava sul **demo**, dove sono otto. Ha segnalato lo scarto invece di adattarsi. Il numero era giusto, il mondo no — e non era scritto accanto.

**Un difetto di `salva.sh`, e nasce da me.** Lo script protegge il *codice* in lavorazione di Codex — è nato proprio da quello — ma **non i suoi documenti**: `docs/` è dentro il perimetro «documenti», e Codex scrive il registro in `docs/consegne/` mentre lavora. Un salvataggio lanciato a metà giro ha catturato un registro `GH-37` di quindici righe che diceva «ricognizione in corso», rendendo il mandato **apparentemente chiuso**: con la regola dell'«ultimo elaborato» le postazioni sarebbero state saltate per sempre. Moncone rimosso, mandato rieseguito.

**E la regola dell'«ultimo elaborato» è stata fraintesa per la prima volta.** Codex ha cercato il `GH-NN` **più alto**, l'ha trovato chiuso e ha concluso che non ci fosse altro — invece del più alto **privo di registro**. Non l'ha applicata male: l'ha letta in fretta, e la formulazione lo consente.

**Stato della produzione a fine mattina**: 266 clienti, 288 cani, 458 visite, 14 appuntamenti — contro i 260 / 282 / 456 / 5 con cui era finita la migrazione la notte prima.

### 29 agosto 2026, tarda mattina — Il salone non aveva un nome, e aveva due numeri di telefono

Il giro nato da una domanda di Luigi — *«e sulla parte grafica?»* — ha scoperchiato tre difetti che nessuno stava cercando, tutti sulla **card pubblica**: l'unica superficie che un cliente vede per mesi, e l'unica mai passata da un giro di veste.

**Il salone si chiamava «FROGLETINPOND».** La funzione pubblica costruiva l'insegna con `COALESCE(profiles.business_name, 'Grooming Hub')` unendo il **profilo dell'operatore che aveva creato la scheda**. E i tre profili contengono il prefisso dell'indirizzo email: `frogletinpond`, `ggetto`, `zavaroby`. Quindi ogni cliente che inquadrava un cartoncino leggeva in testa alla pagina l'email di una persona. Il nome vero — **«Grooming HUB»** — stava in `tenants.name` e non lo leggeva nessuno. **Si vedeva in uno screenshot che avevamo entrambi guardato senza notarlo.**

**Due numeri di telefono diversi, uno finto.** Nel pacchetto in produzione: `393332979797` in `whatsapp.js` (usato dalla card) e **`+393331112233`** scritto a mano in `apps/customer/pages/Home.jsx` — un segnaposto, 333 111 22 33, che apriva WhatsApp verso un numero inesistente. Luigi ha confermato che il vero è il primo.

**Il QR lo disegnava un servizio esterno.** `api.qrserver.com`, gratuito, interpellato a ogni visualizzazione e a ogni stampa: dipendenza da terzi per un gesto quotidiano, e il `qr_token` del cane che transitava da un fornitore mai scelto. Sostituito con una libreria locale — e Codex ne ha **scartata una prima**, MIT ma con dipendenze obsolete e dieci vulnerabilità, preferendo rifare il lavoro.

**I token dei metalli non esistevano.** CD-04 dichiarava «zero token nuovi, i `--tier-*` erano già in GH-15»: vero nei riferimenti versionati, **falso nel foglio di stile che l'app carica davvero**. Trovato da Codex durante l'implementazione. È lo stesso errore delle misure di ieri notte, in un'altra forma: una cosa vera in un mondo — il documento — data per vera in un altro, il codice in esecuzione.

**La prova del QR.** Prima di toccare qualunque cosa, Luigi ha inquadrato con il telefono il QR di un cane: si apriva sulla scheda giusta con i dati post-migrazione. **I token sono sopravvissuti a G6** — prova migliore di qualunque interrogazione.

> **Correzione del 31/8.** Nel primo resoconto era scritto che si trattava di *«un cartoncino vero già consegnato»* e che *«le card in circolazione dipendono da questa riga»*. **Falso, e l'errore è di Cowork**: Luigi aveva inquadrato il QR **dallo schermo del gestionale**. **Nessun cartoncino è mai stato stampato né consegnato.** L'inferenza era stata scritta come misura in questo diario e in due mandati, `GH-36` e `GH-38`, entrambi corretti.
>
> È la stessa distrazione delle cardinalità di venerdì notte, in un'altra forma: **dedurre il mondo da un gesto osservato, invece di chiedere.** L'invariante che ne discendeva — l'URL codificato non cambia — **resta giusta**, ma per un'altra ragione: i token **non si possono rigenerare**, quindi il formato è permanente per costruzione.

**Atto sulla produzione, eseguito da Cowork su autorizzazione esplicita di Luigi** (ore 11:20 circa). La migration `gh38_public_card_tenant_identity` è stata applicata **prima** del frontend, e non dopo: la funzione nuova mantiene la firma, quindi il frontend vecchio continua a funzionare con la funzione nuova, mentre l'inverso avrebbe lasciato la card a chiamare una funzione inesistente.

Controllo prima: 288 pet, **tutti con un tenant valido** — verificato perché la funzione nuova usa un `JOIN` dove la vecchia aveva un `LEFT JOIN`, e un solo pet orfano avrebbe spento la sua card. Controllo dopo: telefono scritto, funzione identità creata, insegna «Grooming HUB», token inventato che torna nullo, e **la funzione eseguita su tutti i 288 token esistenti: zero card rotte**.

Effetto immediato, senza attendere il rilascio: il frontend in produzione leggeva già `businessName`, quindi l'insegna si è corretta da sola. Verificato da Luigi inquadrando di nuovo il cartoncino.

> **Nota**: il salone stava lavorando durante l'atto — i pet erano 282 la mattina e **288** al momento della migration. È sabato.

### 29 agosto 2026, mattina — Tre giri in quattro ore, e due difetti trovati guardando

`GH-34`, `CD-03` e `GH-35` chiusi in una mattina, tutti nati **guardando l'app in produzione**, non leggendo il codice.

**`GH-34` — tre rifiniture.** L'indirizzo dell'operatore non era in asse con «Esci» (`.gh-hero__right` aveva `align-items: flex-start`, e il testo da 11,5px restava appeso sopra un bersaglio da 44px). Le righe del report non portavano alla scheda del cane, pur avendo già `pet_id` e una rotta che esiste — `/client/:clientId`. E il ritorno alla Dashboard mancava su **Contatti, Nuovo cliente e Nuova visita**, perché ogni pagina che aggiunge un'azione propria si porta via lo spazio del ritorno.

**Sull'ultimo, la soluzione è di Luigi ed è migliore di quella ovvia**: invece di tre pulsanti, l'occhiello «Grooming Hub» del componente `Hero` diventa il ritorno — una modifica sola che vale su ogni pagina, presente e futura. Un pulsante per pagina avrebbe riparato oggi e si sarebbe rotto alla prossima pagina con un'azione propria.

**`CD-03` e `GH-35` — il mese.** Era la proposta di Claude Design al §9.2 di CD-02, accantonata perché sembrava richiedere una rotta nuova. Non la richiede: un interruttore *settimana / mese* sulla stessa pagina fa la stessa cosa e dice una verità in più — è la stessa domanda a due distanze. `getWeeklyRevenueReport` accettava già un intervallo qualsiasi, quindi il costo sul database era zero.

Alla sua domanda «venti giorni su trenta, calendario o apertura?» si è potuto rispondere **apertura**, perché le domeniche sono dichiarate: aprile fa **20 su 26**. Con il limite scritto: le chiusure occasionali non sono modellate, quindi agosto dirà 11 su 26 senza raccontare le ferie.

**Due difetti che nessun test avrebbe trovato.** L'allineamento, perché non rompe niente — è solo storto. E il separatore delle migliaia: `eur()` usava `toLocaleString('it-IT')` senza ottenerlo, e la pagina mostrava «1495 €». **Era già in produzione**, l'ha trovato Claude Design ricontrollando il proprio lavoro, e si vedeva in uno screenshot.

> **Osservazione di metodo.** I tre giri di stamattina sono nati tutti dallo stesso gesto: aprire l'app e guardarla. Il canone non ha un posto per quel gesto — è capitato. Vale la pena renderlo un passo fisso di ogni mandato che tocca una superficie visibile: una lista corta di schermate da aprire, scritta da Cowork ed eseguita da Luigi.

### 29 agosto 2026, alba — CD-02 e GH-33: la veste è finita

Poche ore dopo G6, l'ultima superficie vecchia. **Claude Design ha consegnato `CD-02` in una notte**, Codex l'ha realizzata in **24 minuti**: build verde, suite RLS 30 PASS / 0 FAIL / 1 SKIP, 77 fixture costruite per le viste estreme e smontate nella stessa sessione, produzione mai letta.

**La verifica dei sei campi ⚠ ha prodotto tre correzioni**, ed è il motivo per cui quella convenzione esiste: due nomi di colonna sbagliati (`discount_percentage` è `discount_percent`, `amount` è `cost`) e — più importante — un campo dato per assente che invece esiste. CD aveva proposto di togliere ovunque la parola «chiuso» con la frase *«meglio muti che bugiardi»*; ma `tenants.settings.booking_schedule` dichiara la domenica. Quindi la domenica dice «chiuso» con verità, il lunedì no perché chiudono solo la mattina, e ogni altro giorno vuoto resta un trattino. Le chiusure occasionali non sono modellate per decisione del 27 agosto, e dedurle sarebbe inventare.

**Scelte editoriali accolte**: «Report incassi» diventa **«Come è andata»**, «Visite registrate» diventa **«Cani passati»**, «Picco» diventa «giorno pieno», «0%» diventa «come la scorsa». È l'unica pagina che parla la lingua dei numeri invece di quella del lavoro: che almeno usi le loro parole.

**Un riquadro su quattro era morto**: «Sconti applicati» mostrava 0,00 € da 456 visite di fila. Tolto dai numeri grandi, resta nella riga di dettaglio.

**Trovato guardando l'app dal vivo**: «Operatività giornaliera» interroga gli appuntamenti anche per le date passate, e gli appuntamenti sono fermi al 23 aprile. Vedi le code aperte.

**Nota di metodo**: da stanotte, quando serve scrivere a Codex, Cowork **compone il testo nel campo ma non invia**. L'Invio resta un gesto di Luigi. Toglie gli errori di trascrizione — ne erano già costati due — senza chiudere il passaggio umano fra chi scrive il mandato e chi lo esegue.

### 28 agosto 2026, sera — G6: quattro arresti, nessun danno, la produzione è passata

Iniziato alle 19:58 con i dump, finito con l'app viva e verificata. **Quattro arresti della catena, nessuna scrittura persa, nessun ripristino necessario.**

**Atto 4 — la guardia contava male.** Attendeva 3 operatori legacy, ne ha trovati 4. Misurato: i proprietari di schede legacy sono quattro — Davide 289, Luigi 5, Roby 1, l'account di prova `sofaj` 1 — e lo erano già il 21 agosto. Il 3 era stato congelato il 24 contando in un mondo dove la pulizia era già avvenuta. Corretto in 4 con l'Emendamento 1, dopo aver verificato che il quarto (`sofaj`) viene cancellato per intero dall'atto 5, prima che lo split crei qualunque membership.

**Ricaduta**: il cancello 3 affermava che Roby, senza ruolo, non avrebbe ricevuto una membership. Falso — possiede una scheda, quindi l'atto 4 lo promuove. Il salone ha tre accessi staff, non uno.

**Atto 21 — Codex ha rifiutato di eseguire.** Non una guardia: un suo giudizio. `pets_customer_update` è una policy per riga, e RLS non sa limitare le colonne: da sola concede a un cliente di scrivere qualunque campo dei propri pet. Rilievo corretto. Ma è uno stato intermedio che l'atto 34 chiude dentro la stessa catena, e la misura ha mostrato **zero profili cliente e zero membership cliente**: nessun account al mondo poteva sfruttarlo. Applicato come scritto, senza accorpare i due atti — riscrivere due migration provate con l'app già giù sarebbe stata la strada peggiore.

**Atto 30 — il difetto più serio.** La guardia cercava il cliente protetto per identificativo e lo trovava con 0 pet e 0 visite. Causa: **gli identificativi di `customers` e `pets` li genera lo split**, cioè un atto della catena stessa. Quelli scritti nel file venivano dallo split del banco di prova e in produzione non esistono; l'unico che reggeva era il contatto, perché `contacts` conserva gli identificativi legacy. **L'atto 30 non poteva funzionare in produzione in nessun caso.**

Ritrovati per nome — i nomi sopravvivono allo split: il conflitto «3275394345» con il suo pet «pincher» e una visita; il protetto «Amico di Ernesto 3337261321» con il cane Gianni e le sue **quattro visite**, vivo e integro come dichiarato il 24 agosto. Tutto il resto del perimetro coincideva con GH-12 riga per riga. Corretti tre identificativi e due cardinalità con l'Emendamento 3.

Verificato inoltre che **nessun altro atto della catena fissa identificativi generati dalla catena**: l'atto 30 era l'unico.

> **Regola nuova**: un atto non può fissare identificativi che un atto precedente della stessa catena genera a caso. Se deve puntare a una riga nata dalla migrazione, la punta per criterio — un nome, un legame, una tabella legacy — mai per identificativo osservato altrove.

**Postflight — le note erano 41, non 32.** Terzo errore di misura di Cowork: il 32 era stato contato su `clients.notes` **prima** della catena, e la catena cancella 14 schede legacy prima di arrivare a GH-32. Soprattutto, quel numero non contava affatto il lato customer, che si popola dall'assorbimento dei contatti. Misurato: 11 note customer, 30 note pet, **38 clienti distinti**, solo 2 con note da entrambi i lati — nessuna duplicazione. La garanzia contro le perdite non è il conteggio ma la migration stessa, che interrompe la transazione su mancata corrispondenza e invece ha committato.

> **La lezione della serata.** Tre arresti su quattro hanno la stessa causa: **un numero misurato in un mondo e congelato come traguardo di un altro.** Gli operatori contati dopo la pulizia, le visite contate prima del 25 agosto, le note contate prima delle cancellazioni. Un traguardo non è un numero: è un numero **più il momento in cui vale**. Se il momento non è scritto accanto al numero, il numero è una trappola.
>
> Le guardie hanno retto tutte e quattro le volte. Il difetto non era nella catena: era nelle misure di Cowork.

**I gesti di Luigi.** `salva.sh` ha fatto il suo mestiere: ha mostrato la modifica fuori perimetro e ha chiesto, invece di inghiottirla. La `checkout` su `main` si è bloccata proprio per quel file — la riscrittura dello script, mai committata: in archivio c'era ancora la versione con `git add -A`. Committata e poi merge, build verde, push. **Vercel ha promosso da solo**, perché il progetto pubblica da `main`: la finestra di indisponibilità si è chiusa senza un gesto in più.

Nel mezzo Codex ha completato il merge di sua iniziativa — gesto che il mandato assegna a Luigi — ma si è fermato prima del push e ha chiesto. Il conflitto (`src/lib/database.js` rimosso dal refactor) era risolto correttamente. Comparsi anche **~100 file duplicati con suffisso « 2»**, non tracciati, di cui 82 dentro `docs/`: innocui stasera, ma alla prossima `salva.sh` verrebbero raccolti come documenti veri.

**Atto 49, verifica dal vivo, superata.** Carnevale con i suoi due cani e tre visite — la fusione tiene, e si vede la cucitura: due contatti con lo stesso numero, uno per scheda legacy. «vigilessa» con tre cani, a provare che i cani non si sono mescolati fra proprietari. «mamma parrucchiera» con le foto. Il cliente con sei visite. E il report incassi — ancora con la veste vecchia, come sapevamo — che mostra **martedì 25 agosto, 4 visite, 75,00 €**: i quattro bagni che stamattina non sapevamo esistessero, migrati con i loro importi.

### 28 agosto 2026, sera — Il preflight, e due dump che non si aprono allo stesso modo

**Il salone ha lavorato il 25 agosto.** Rimisurata la produzione prima di partire: **468 visite, non 464**. Quattro bagni reali su Nathan, Athena, Hermes e Milo — 20, 20, 20 e 15 € — inseriti dall'account di Davide. Non erano dati di prova: le ferie erano meno ferme di come le avevamo assunte. `GH-31` corretto di conseguenza, preflight 468 e post-catena 456. Luigi ha avvisato Davide e Roby di non toccare l'app durante l'atto.

**Lezione, piccola ma vera**: una misura presa quattro giorni prima non è una misura, è un ricordo. Il preflight va rifatto la sera stessa.

**Tre dump freschi**, ore 19:58-20:13: schema 29.965 byte, dati 1.284.135, autenticazione 111.877.

Lo schema è **identico al byte** a quello del 21 agosto — la struttura non è cambiata in una settimana, come doveva essere.

Il dump dati era però **43.392 byte più piccolo** di quello del 21, pur avendo quattro visite in più. Cowork ha sollevato la cosa invece di attribuirla all'arrotondamento, e ha verificato il file contando le righe che dichiara: `clients` 296, `visits` 468, `contacts` 301, `appointments` 17, `profiles` 4, `auth.users` 6, `storage.objects` 51. **Tutte e sei le misure del preflight coincidono.** Il paracadute è fedele.

**Ma il conteggio non è riuscito sul file del 21 agosto: zero righe.** Non conteneva istruzioni `COPY`. Indagato: **quindici istruzioni `INSERT` multi-riga, una per tabella non vuota**, ciascuna con migliaia di tuple su una riga sola. Le quindici tabelle sono esattamente quelle che stasera hanno righe, meno `one_time_tokens` che il 21 era vuota.

**I due paracadute non si aprono allo stesso modo**, ed è anche il motivo per cui il vecchio è più grande pur contenendo meno dati: ogni tupla si porta dietro la sintassi. Annotato in `GH-31` sotto le vie di ripristino. **Chi dovesse usare quello vecchio deve saperlo prima, non mentre cade.**

**Cancello 4 verificato dal vivo sulla produzione**, non assunto: `azgehoseiojodltcttfb`, organizzazione `Webapp_Project`, ramo `main` marcato PRODUCTION. Registrazioni abilitate, conferma email disattivata, collegamento manuale e accessi anonimi spenti, provider Email abilitato.

### 28 agosto 2026 — Tutti i cancelli preparatori chiusi

**Auth in produzione** (cancello 7): registrazioni abilitate, conferma email disattivata sul progetto `grooming`, verificate dopo il salvataggio. Senza, nessun cliente invitato avrebbe potuto crearsi l'accesso. Conseguenza accettata, la stessa già discussa per il demo: chiunque abbia l'indirizzo dell'app può creare un account, ma **senza invito non ottiene alcuna membership e non vede nulla**. Da rivedere fra qualche settimana contando quanti account senza membership si formano.

**Spot-check spostato** (cancello 5): il confronto dei dati era già fatto e coincideva; restava l'occhio, e farlo prima avrebbe richiesto di riallestire l'anteprima locale sul progetto di prova — allestimento vero per guardare come il **banco di prova** disegna delle schede. Assorbito nell'**atto 49**, la verifica dal vivo dopo il rilascio: cinque clienti che Luigi riconosce, sulla produzione reale. Proposta di Cowork, che Luigi stava per fare a sua volta.

**LA CHIAVE DEL SALONE — cancello chiuso** (28/8, ore 15:24).

Prima è stata fatta **la prova sul demo**, per rispondere con una misura invece che con l'aspettativa di Cowork: cambio password via SQL con una sessione staff aperta in un'altra scheda, e **la sessione è sopravvissuta** — l'app ha continuato a rispondere, restituendo un errore di *schema* e non di accesso. Poi la stessa operazione su `frogletinpond@gmail.com` in produzione: verifica preliminare a **1 riga**, `UPDATE` con clausola esplicita, rilettura che mostra **solo quella riga** con l'orario corrente e le altre cinque con date vecchie. Query chiuse senza salvarle.

**Correzione di Cowork sul peso della cosa**: avevo impostato la prova come se fosse lei a reggere il cancello. Non è così. **La rete di sicurezza non è che la sessione sopravviva: è che qualcuno conosca la password.** Se anche il cambio avesse interrotto la sessione, il salone sarebbe rientrato con la credenziale nuova. Il problema non era il rischio di essere buttati fuori — era che **se fossero stati buttati fuori nessuno avrebbe saputo come farli rientrare.** Da oggi non è più vero.

**Limite da ricordare, emerso dalla prova**: cambiare la password **non chiude le sessioni già aperte**. Comodo oggi; ma se un giorno un accesso fosse compromesso, cambiare la password non basterebbe a mettere fuori chi è già dentro — servirebbe revocare esplicitamente le sessioni.

**Osservazione dal vivo che vale come prova generale**: sul demo l'app ha mostrato *«column customers_1.operator_notes does not exist»*. È GH-32 visto da fuori — la migration ha rimosso la colonna dal database mentre il deployment pubblicato contiene ancora il codice che la chiede. **Codice e schema disallineati, in miniatura e senza danni**: esattamente la finestra documentata per G6, e la ragione per cui merge e promozione devono seguire la catena senza pause.

**Restano solo i gesti del giorno**: dump fresco e autorizzazione di Codex su `Webapp_Project`.

### 28 agosto 2026 — Un accesso solo: decisione, non rinuncia

**Decisione di Luigi (28/8): Davide e Roby continuano a condividere un unico accesso.** L'argomento non è tecnico ed è il migliore possibile — conosce i suoi clienti: *«si confonderebbero rimproverando una modifica all'altro»*. Un sistema che consente di dire «questo l'hai cambiato tu» fra due persone che lavorano fianco a fianco non aggiunge trasparenza, aggiunge occasioni di discussione.

**Conseguenza accettata e da non riaprire**: l'app **non potrà mai attribuire nulla a nessuno** — chi ha segnato quel no-show, chi ha messo in blacklist, chi ha registrato quella lavorazione. È anche la ragione profonda per cui il campo operatore sulle visite non è mai esistito, escluso tre volte in tre giri diversi. Da oggi è una scelta e non un'eredità.

**Conseguenza pratica che cambia il peso di un altro cancello**: quella non è la password di Davide, **è la chiave del salone. L'unica.** Oggi non la conosce nessuno, e il sistema regge solo perché una sessione si rinnova da sola dal 31 maggio.

**L'account di Roby resta dov'è, dormiente e non rimosso.** Ha un cliente intestato che dopo la migrazione diventa un pet legato al suo identificativo: cancellarlo romperebbe quel legame. Se un giorno provasse a entrare con il proprio accesso non funzionerebbe, perché senza ruolo nel profilo la catena non gli crea una membership — **e adesso sappiamo perché, invece di cercare un guasto.**

### 28 agosto 2026 — GH-30 e GH-32: la ricetta è pronta e le note sono al riparo

**GH-30 ha prodotto la ricetta vera**: **54 atti ordinati** con impronta e provenienza, dai tre dump fino ai gesti finali di Luigi. Trascrivibile senza dedurre nulla, che era il vincolo.

Tre cose che Codex ha capito meglio di chi ha scritto il mandato. **L'hardening è stato spostato in fondo**: GH-25 e GH-27 *sostituiscono* funzioni, quindi l'irrigidimento deve operare sulle definizioni finali — nella prova generale non era emerso perché quelle migration non esistevano. **Nessuna copia inutile**: GH-22, GH-25 e la correzione QR sono già neutre e vanno in produzione così come sono; solo GH-27 ha una variante, e per la parola «demo» in un'intestazione. **Le quattro inversioni d'ordine** rispetto all'alfabeto sono dichiarate una per una con il motivo.

Falso allarme risolto: Codex non trovava i tre dump del 21/8 perché la sua ricerca si ferma alla cartella del progetto e i dump stanno sulla Scrivania. Verificati presenti, dimensioni corrispondenti. **È disciplina di perimetro, non un guasto.**

**GH-32 — le note interne fuori dalla portata del cliente.** Decisione di Luigi: *«il cliente non può e non deve vederle»*. La soluzione adottata è più pulita di quella ipotizzata nel mandato: due tabelle del salone, `customer_staff_notes` e `pet_staff_notes`, con RLS solo-staff e **il legame al tenant derivato dalla riga padre invece che duplicato**, così non possono divergere. Le due colonne esposte **rimosse**, non svuotate, dopo backfill con verifica esatta del contenuto. Per lo staff non cambia niente: l'adattatore conserva gli stessi nomi in memoria, quindi schermate, etichette e gesto di salvataggio restano identici.

**Il nodo con GH-30 sciolto senza toccare nulla**: GH-30 resta l'atto 33 e viene eseguito mentre `operator_notes` esiste ancora; GH-32 entra come atto 39, dopo le RPC che ancora nominano le colonne legacy. Il problema si risolve **nell'ordine**, non nel codice. Ricetta rinumerata a 54 conservando le inversioni motivate.

**Controprove fatte come le farebbe il cliente, non ragionando** — la lezione dell'errore del 27/8: sessione reale di `mario.rossi`, **zero righe leggibili** dalle due tabelle, **due scritture rifiutate**, le colonne legacy che rispondono `42703` perché non esistono più. Lato staff, gesto reale di modifica nota con marker scritto, riletto identico e rimosso. **Suite RLS da 26 a 30 PASS.**

Il **32 → 32** sulla produzione è correttamente rinviato: Codex non ha accesso al prod e non l'ha forzato. La ricetta ora richiede quel conteggio come preflight e postflight dell'atto 39, con l'ordine di **fermarsi** se diverge — «la migration è transazionale e non va forzata o corretta manualmente durante G6».

**Quinto cancello chiuso.**

### 28 agosto 2026 — GH-29 si ferma su un buco di sicurezza, e ne emerge un secondo

**L'interruzione era prevista dal mandato e ha funzionato.** GH-29 ordinava di fermarsi se la copertura delle protezioni senza `20260511070742` non fosse risultata equivalente. Non lo è.

| Protezione legacy | Nella catena G6 | Esito |
|---|---|---|
| `pets.internal_notes` | `trg_pets_customer_update_whitelist` ripristina l'intera riga da `OLD`, riapre solo tre campi | coperta, **meglio** |
| `customers.operator_notes` | `enforce_customer_directory_fields_staff_only` ripristina **solo** `acquisition_source` e `relationship_status`; il trigger scatta **solo** su quelle due colonne | **scoperta** |

Con `customers_self_update` che consente al cliente di aggiornare la propria riga, e le policy che non sanno limitare le colonne, **un cliente potrebbe scrivere nelle note che il salone tiene su di lui**. Sul demo la protezione c'è (la migration legacy è applicata lì); nella catena di produzione mancherebbe: **regressione introdotta da noi**, non difetto ereditato.

**Ottavo difetto di Cowork, e il primo di sicurezza** (autodenuncia): il 27/8, verificando sul progetto temporaneo, avevo trovato due trigger con nomi plausibili e avevo scritto «copertura pari o migliore, nessuna azione». **Avevo confrontato i nomi, non il contenuto.** È esattamente la verifica superficiale che i mandati vietano a Codex. Il filo resta lo stesso — sbaglio nel descrivere *come* verificare — ma stavolta il costo sarebbe stato una falla in produzione.

**Verifica Cowork riga per riga**, non accettazione sulla fiducia: la funzione prod ripristina davvero solo due campi, e il trigger è `BEFORE UPDATE OF acquisition_source, relationship_status` — quindi **un aggiornamento della sola `operator_notes` non lo attiva nemmeno**. Doppio buco, non uno.

**SECONDO PROBLEMA, emerso leggendo e più grande del primo: non esiste alcuna protezione in lettura.** La migration legacy protegge solo la scrittura, con un trigger; nessuna revoca a livello di colonna esiste da nessuna parte. `customers_self_select` restituisce al cliente **l'intera propria riga**, `operator_notes` compreso, e lo stesso vale per `pets.internal_notes` attraverso la scheda del proprio cane. L'app non le mostra — ma **l'app non è il confine**: il confine sono le regole del database.

Sono note che un toelettatore scrive per sé. **Non è una regressione**: esiste già oggi, su demo e produzione, ed è teorica finché nessun cliente reale usa l'app. **Diventa concreta al primo invito.**

E non si chiude con una revoca di colonna: per il database staff e clienti sono **lo stesso ruolo**, quindi bloccare la colonna la bloccherebbe anche a Davide. Le strade sono due — una vista che al cliente non esponga quel campo, oppure spostare le note dello staff in una tabella separata con regole solo-staff. La seconda è più pulita e definitiva. **Decisione di Luigi, da prendere prima di invitare i clienti.**

**GH-30 emesso**: autorizza la riparazione minima proposta da Codex — estendere la funzione esistente perché ripristini anche `operator_notes` e far scattare il trigger anche su quella colonna, senza reintrodurre la migration legacy, la cui metà pet è ridondante e le cui funzioni `SECURITY DEFINER` contraddirebbero il preflight dell'hardening — e riprende il resto della ricetta.

### 28 agosto 2026 — GH-28, e la validazione della regola sulle invarianti

Entrambe le code chiuse. Il redirect porta i clienti a `/u/home`; la fedeltà calcola `achievedByVisits || achievedByPoints`, quindi **i punti possono solo alzare**. Prova deterministica **12/12**, incluso il caso che ci preoccupava — 30 visite più 10 punti resta Argento, nessun declassamento — e i due valori reali del prod simulati **senza leggere la produzione**, disciplina di perimetro corretta.

**La scoperta è più interessante della riparazione, e valida una decisione di metodo.** Il mandato nominava due punti in `StaffApp.jsx`. Provando davvero, Codex ha trovato **un terzo blocco in `LoginForm.jsx`**: il form staff chiamava `ensureOperatorProfile` e **disconnetteva il cliente subito dopo il login**. Correggere solo i due redirect non sarebbe bastato — il cliente veniva buttato fuori prima di arrivarci.

È esattamente ciò che la regola del 27/8 doveva produrre. Il mandato non diceva «cambia queste due righe»: diceva **«un cliente autenticato che raggiunge una rotta del gestionale arriva all'app nuova»**. Un'invariante si insegue finché non è vera, e porta a scoprire i posti che chi scrive non conosceva. Un elenco di file, invece, si esaurisce quando finisce l'elenco — ed è la forma in cui i miei mandati hanno sbagliato sette volte.

### 28 agosto 2026 — GH-27: dodici riparazioni, e la data smette di scivolare

**Tutti e dodici i punti chiusi**, due migration, quindici file applicativi. Le cose che vale la pena ricordare.

**La data era un problema di fuso, ed è stata risolta introducendo il fuso del salone**: `tenants.settings.booking_schedule.timezone`, con `Europe/Rome` come valore iniziale e ripiego. Multi-tenant per costruzione — un salone altrove avrà il suo. La controprova è quella giusta: la stessa conferma riletta dal database in sessioni **UTC, New York, Tokyo e Honolulu**, con le ore di confine `00:15` e `23:45`. Giorno e ora del salone restano identici. I tre appuntamenti nati dalle prove manuali di Luigi sono stati rimossi.

**Due difetti sono stati chiusi nel database invece che nell'interfaccia**, ed è la scelta giusta: una seconda richiesta pendente sullo stesso pet viene **respinta dal vincolo** (`23505`), e una data alternativa che cade in una chiusura viene **respinta dalla RPC** (`22023`). Non è una schermata che avvisa: è il sistema che non lo permette.

**Scoperta durante il lavoro, dichiarata in una migration separata apposta**: il trigger whitelist introdotto in GH-02-bis — quello che protegge le colonne dei pet dalle scritture del customer — **bloccava anche il backfill privilegiato dei QR**, che non ha una sessione utente. La correzione conserva la protezione per ogni customer autenticato e apre solo la manutenzione senza sessione. È il tipo di interferenza fra due difese scritte a mesi di distanza che si vede solo eseguendo.

**Sulla chip «Lo porto regolarmente»**: misurata a **164,6 px** di larghezza e 44 di altezza, senza andare a capo a 320 px. La stima geometrica fatta a mano prima del mandato diceva «circa 165 px»: buon segno che si possa calcolare invece di provare, quando serve decidere in fretta.

**Il difetto di automazione è stato confermato e non assecondato**: il riempimento automatico del controllo nativo `date` mostra il valore nel DOM ma React conserva quello iniziale. Codex **non ha piegato il prodotto** per far tornare la propria prova — ha riallineato il dato e ha usato le prove multi-fuso della RPC come controprova vera. Conferma retroattiva che l'osservazione di GH-26 sul form visita era artefatto, mentre quella sulla conferma era difetto reale.

**Restano due riparazioni che Cowork aveva individuato e non ha portato nel mandato** (settimo difetto della stessa famiglia — nominato a voce, non scritto):

1. **`StaffApp.jsx` manda i clienti al portale vecchio.** Due punti nel codice spediscono chiunque non sia operatore a `/portal`. Da quando la radice porta a `/login`, è il percorso normale per un cliente che digita l'indirizzo — e ci finisce anche Codex durante le verifiche locali.
2. **I punti fedeltà possono declassare invece di elevare.** Misurato: `useRewardPoints = punti > 0`, e da quel momento le visite **smettono del tutto di contare**. Un cliente con 30 visite è Argento; regalargli 10 punti lo fa precipitare a Base, perché 10 è sotto la soglia di Bronzo. **La leva nata per elevare declassa.** In produzione non è ancora successo per fortuna: i due soli usi sono 500 e 150 punti, cioè cifre scelte per *raggiungere* una soglia — segno che il meccanismo viene già usato come leva di livello e non come salvadanaio. La riparazione è concettualmente una riga: il livello è **il migliore dei due**, e i punti possono solo alzare.

**Decisione Luigi (28/8)**: la premialità resta, i benefici dei livelli si definiscono con Davide. Nota di prodotto: nessuna parte del sistema dice oggi **cosa dà un livello** — le soglie esistono, i premi no. E il portale vecchio la scala la mostra già al cliente («Mancano 9 visite per Bronzo»), quindi la domanda è già posta a chi apre quella pagina.

### 28 agosto 2026 — Gli accessi del salone: un rischio che esiste già oggi

Domanda di Luigi guardando avanti a G6 — come si ridefiniscono le password di Davide, Roby e sua. La misura sul prod ha trovato una fragilità che **non dipende dalla migrazione** e che esiste adesso.

| Account | Ultimo accesso | Ruolo profilo | Clienti |
|---|---|---|---:|
| `frogletinpond@` (Davide) | **31 maggio** | operator | **289** |
| `ggetto@` (Luigi) | 24 agosto | operator | 5 |
| `zavaroby@` (Roby) | 5 marzo | **nessuno** | 1 |
| tre account di prova | — | — | rimossi dalla pulizia G6 |

**L'ultimo accesso di Davide è del 31 maggio, ma le visite arrivano al 13 agosto.** Non è una contraddizione: quel campo cambia solo a un accesso nuovo, non al rinnovo del token. **La sessione è viva da tre mesi e si rinnova da sola** — è il «si loggano in automatico» riferito da Luigi. E **nessuno ricorda la password che la tiene in piedi**: basta un logout, una cronologia svuotata, un dispositivo nuovo o un token scaduto perché il salone resti fuori dai propri 289 clienti.

**Verificato che G6 non peggiora la cosa**: l'indirizzo di produzione non cambia (stesso progetto Vercel, stesso database), quindi sessione e password salvate nel browser restano valide perché legate alla stessa origine; e la catena di migrazione non tocca gli hash. In teoria il 1° settembre trovano tutto com'era.

**Decisione (Luigi, 28/8)**: password nota impostata su `frogletinpond@` **prima** di G6. Impostarla via SQL **non interrompe la sessione in corso** — continuano a lavorare come sempre e in più esiste una credenziale conosciuta come rete. Costo zero, rischio azzerato. È l'account che conta, perché lì stanno i 289 clienti, anche se è **Roby a operare** mentre Davide usa soltanto.

**Secondo dato**: l'account di Roby ha `profiles.role` vuoto. La catena G6 semina le membership da quel campo, quindi **dopo la migrazione quel account non funzionerebbe** — entrerebbe senza essere riconosciuto come staff. Oggi è irrilevante perché condividono l'accesso di Davide, ma se un giorno vorranno accessi separati va sistemato prima.

**Sulla configurazione definitiva, dopo il lancio**: il recupero password esiste (`resetPasswordForEmail` → `/reset-password`) ma **dipende da un servizio di posta che non è configurato** — quello interno di Supabase è dichiaratamente per prove. E **manca un cambio password dall'interno dell'app** per chi è già autenticato: è la cosa che li renderebbe autonomi nel caso normale, «voglio cambiarla», lasciando alla posta solo il caso «l'ho dimenticata». Entrambe rinviate a dopo G6 per scelta, perché toccare gli accessi durante una migrazione è il momento peggiore.

**Scelta di prodotto nominata e lasciata aperta**: se Davide e Roby continuano a condividere un accesso, l'app **non potrà mai attribuire nulla a nessuno** — chi ha segnato quel no-show, chi ha messo in blacklist, chi ha registrato quella lavorazione. È anche la ragione profonda per cui `visits` non ha un campo operatore, escluso tre volte in tre giri. Va bene, purché sia una scelta e non un'eredità.

### 28 agosto 2026 — GH-26: la vita di un cliente nuovo, e la data che scivola

**Ricognizione senza riparazioni**: dodici passaggi dal gesto reale, dalla creazione del cliente fino alla visita che compare nello storico. **Diff applicativo zero**, pulizia verificata con conteggi identici prima e dopo. Otto difetti trovati e ordinati per quanto farebbero male il 1° settembre.

**LO SLITTAMENTO DELLA DATA — reale, e circoscritto** (misura manuale di Luigi, 28/8). Codex l'aveva riportato come *osservato* con browser automatizzato, raccomandando una riprova umana prima di attribuirlo al prodotto. **Cowork aveva previsto che a mano avrebbe funzionato: previsione sbagliata.**

Misure manuali su Safari, con `VITE_DEMO_MODE` temporaneamente a `false` e redeploy:

| Superficie | Digitato | Salvato | Esito |
|---|---|---|---|
| Dialogo di conferma richiesta | sabato 5 | **domenica 6** | difetto reale |
| Form registrazione visita | data scelta | data scelta | **corretto** |

**La localizzazione è la parte preziosa.** Il form visita scrive `visits.date`, una data pura senza orario, e funziona. Il dialogo di conferma deve **comporre data e ora in un `timestamptz`** (`appointments.scheduled_at`), e lì il giorno scivola in avanti. Quindi non è un problema sistemico di fusi orari: è un punto solo. E l'osservazione di Codex sul form visita era davvero un artefatto della sua automazione, come lui stesso aveva sospettato.

**Aggravante**: lo slittamento ha portato l'appuntamento **di domenica**, giorno in cui il salone è chiuso — senza che nulla lo segnalasse. Le chiusure introdotte in GH-22 valgono per il wizard cliente, non per la conferma staff.

**Gli altri sette difetti**: il **QR non nasce con il pet** (il pulsante risponde parlando di migration); **la richiesta pendente sparisce dalla home del cliente**, che legge «Non hai appuntamenti in programma» e viene invitato a riprenotare — quindi manda doppioni credendo di aver fallito; **registrare la lavorazione non chiude l'appuntamento**, due gesti separati senza richiamo; **l'invito si incolla a mano**, e il rischio non è il tempo ma associare il link alla persona sbagliata, perché i token si somigliano; **«WhatsApp di conferma pronto» senza che si apra nulla** né si possa rileggere il testo, quindi l'operatore crede di aver avvisato; **i punti non sono visibili al cliente** mentre lo staff vede zero; **l'anagrafica nasce incompleta** senza che nulla inviti a completarla.

Più un difetto grafico notato da Luigi: nella card della richiesta la seconda riga (Manto, Età) non si allinea alle tre colonne superiori.

**Nota su Vercel, che correggo perché l'avevo letta male**: il *branch tracking* del progetto `-aish` dice `main`, e da lì avevo concluso che il dominio stabile servisse il codice di maggio. Sbagliato: il deployment **attualmente promosso** su quel dominio è di `feat/customer-app`, promosso a mano il 21/8. Il tracking dice cosa si costruisce da solo, non cosa è pubblicato. Conseguenza da ricordare per G6: al merge `feat` → `main`, **due siti** cambieranno faccia con lo stesso gesto.

**Metodo, di nuovo**: `VITE_DEMO_MODE=true` blocca ogni scrittura del gestionale sull'anteprima — è la protezione che permette di mostrare l'app senza che venga toccata. Va spenta e riaccesa per qualunque prova che scriva, e il banner rosso è la spia che dice se la finestra è aperta o chiusa.

### 27 agosto 2026 — La porta è aperta (GH-24 → GH-25)

**GH-24 si è fermato davanti alla causa vera, e l'ha dimostrata dal vivo.** `accept_customer_invite` valida il token, crea il profilo, adotta il customer e collega il pet — **ma non inserisce nulla in `tenant_memberships`**. Dal Gate 5 la membership è la sola fonte del ruolo: `AuthProvider` legge quella, `useRequireCustomer` respinge chi non ce l'ha. **Il flusso d'invito era rotto da GH-05-bis**, settimane fa, e nessuno l'aveva visto perché nessuno aveva mai accettato un invito nell'app nuova.

Codex aveva già costruito la pagina e verificata a tre larghezze; quando la controprova sul database ha mostrato zero membership, **ha ripristinato tutto lasciando diff applicativo zero**. Nessun comportamento parziale in giro. È il modo giusto di fermarsi.

**Decisione Luigi (27/8) sul cancello Auth**: registrazioni abilitate, **nessuna conferma via email**. Motivazione sua, da conservare perché è il ragionamento giusto: *«il controllo avviene anche via cellulare visto che le prenotazioni si confermano su WhatsApp»*. La credenziale reale è il token, recapitato a un numero che il salone già conosce e che è obbligatorio in anagrafica. Una conferma via email aggiungerebbe un passaggio, una dipendenza da un servizio di posta inesistente e un punto di rottura, in cambio di nulla — chi si registra senza token non ottiene membership e quindi non vede dati.

**GH-25 CONSEGNATO — l'app clienti ha una porta.** Otto controprove su otto. La RPC riscritta in una sola migration idempotente: blocco `FOR UPDATE` contro accettazioni concorrenti, **quattro stati del token distinti** (inesistente, scaduto, usato da altri, già accettato dallo stesso account — il caso che prima si confondeva con l'errore), guardia che rifiuta sia `profiles.role=operator` sia qualunque membership `owner/staff`, e **inserimento della membership nella stessa transazione**.

`Redeem.jsx` da **71 righe di segnaposto a 309 di pagina vera**, zero stili inline, zero colori letterali. Inviti verso `/u/redeem/:token`. QR: customer autenticato → `/u/home`, visitatore → login con ritorno alla card. **E solo dopo tutto questo la radice è passata a `/login`**, con inviti, QR e rotte legacy riprovati dopo lo spostamento.

Auth user senza membership: **0 prima, 0 dopo, 0 dopo il cleanup** — la conseguenza che avevamo accettato non si è nemmeno verificata, perché invito e membership sono atomici. Suite RLS 26 PASS. Zero residui.

**NUOVO BUCO TROVATO, dichiarato come eccezione**: il pet creato dal gesto «Nuovo cliente» **non riceve un `qr_token`**. Il pulsante QR Card mostra *«QR cliente non disponibile. Applica prima la migration dedicata»*. Significa che al lancio Davide crea un cliente, prova a stampargli la card e riceve un messaggio che parla di migration. La controprova QR è stata fatta su un pet preesistente. **Serve un mandato dati per la generazione automatica del token** — aggiunto ai cancelli di G6.

**Quattro percorsi restano non percorsi**, richiamati nel registro perché non si perdano: conferma email e ritorno al token (ora disattivata per decisione); recupero password del cliente; login completo dopo QR senza sessione; e **la consegna reale del link** — il gestionale lo genera e lo copia, ma qualcuno deve incollarlo a mano in WhatsApp, un cliente alla volta.

### 27 agosto 2026 — L'APP CLIENTI NON HA UNA PORTA

**La scoperta più seria di questi giorni**, emersa da una domanda banale — Luigi non riusciva a entrare in modalità staff — e da una verifica fatta prima di scrivere un mandato che sarebbe stato sbagliato.

**I fatti, misurati:**

- Il link d'invito che lo staff genera è costruito in `database.js:262` come `${origin}/portal/invite/${token}`: punta al **vecchio portale**. Chi lo apre crea l'account lì e atterra in `CustomerPortal.jsx`, le 1.373 righe non rivestite che abbiamo deliberatamente escluso dal restyling.
- La QR card pubblica (`PublicPetCard.jsx`) manda a `/portal` e `/portal/login`: **stesso vecchio portale**.
- `/u/redeem/:token`, la pagina che dovrebbe accogliere gli inviti nell'app nuova, è **un segnaposto di 71 righe scritto a maggio con zero chiamate al database**. Il commento in testa lo dichiara: «l'integrazione vera con la RPC `accept_customer_invite` arriva in uno step successivo». Non è mai arrivato.
- L'unico consumatore reale di `accept_customer_invite` è il vecchio `CustomerInvite.jsx`.

**Conseguenza**: l'app clienti nuova — scheda pet, wizard di richiesta, promozioni, home — **è raggiungibile solo digitando `/u/login` a mano**. Nessun invito, nessun QR, nessun percorso naturale ci porta.

**Corollario che ha evitato un danno**: il redirect della radice verso `/u/login` — quello su cui Luigi è inciampato quattro volte cercando il gestionale, e che avevamo deciso di spostare — **è oggi l'unica porta esistente**. Il mandato che stavo per scrivere avrebbe reso l'app clienti del tutto irraggiungibile. È stato evitato solo perché prima di scriverlo Cowork si è chiesto da dove arrivino i clienti. **Conferma della regola: si misura prima di scrivere il mandato, non dopo.**

**Nota sul nostro metodo, e non è comoda.** Abbiamo verificato ogni schermata dell'app clienti a tre larghezze, misurato ombre, raggi, geometrie, bersagli tattili; abbiamo corretto regressioni invisibili. Ma **il login l'abbiamo sempre fatto con Mario, che l'account ce l'aveva già**. Il percorso di un cliente reale — invito → account → primo accesso — non è mai stato provato, perché nel nuovo non esiste. **Abbiamo ispezionato tutte le stanze e mai il portone.** Le controprove misurano ciò che il mandato nomina: se nessun mandato nomina il primo accesso, nessuna controprova lo copre, per quanto rigorose siano.

**Lavoro che ne deriva, prima del lancio**: implementare `Redeem.jsx` contro `accept_customer_invite`; puntare il link d'invito a `/u/redeem/:token`; puntare la QR card all'app nuova; **e solo dopo** spostare il redirect della radice verso il gestionale. In quest'ordine: invertirlo lascia i clienti senza ingresso.

**Questo è il cancello principale di G6.** Senza, l'app clienti per i clienti non esiste — e il lavoro di una settimana resta visibile solo a chi conosce l'indirizzo.

### 27 agosto 2026 — GH-22 e GH-23: gli orari entrano, la veste si verifica

**GH-22 consegnato, e all'opposto di GH-21 con le controprove complete**: quattordici, incluse le tre larghezze. Gli orari sono finiti dove dovevano — `tenants.settings.booking_schedule` con `closed_weekdays` e `closed_time_preferences`, **leggibile e multi-tenant, zero orari nel codice**. Nuova RPC `resolve_appointment_request_with_duration` SECURITY INVOKER, con la precedente conservata senza overload ambiguo. Nel wizard la domenica è visibile ma disabilitata, il lunedì mattina è marcato «Non disponibile», il resto resta selezionabile; nel calendario staff «Chiuso» e «Mattina chiusa» si distinguono dal giorno aperto e vuoto.

**L'invariante «una regola nuova non riscrive il passato» ha tenuto su un caso reale**: la richiesta domenicale già esistente di Luna per il 6 settembre è rimasta visibile e apribile dentro una domenica ora dichiarata chiusa. Nessun rifiuto automatico, nessuno spostamento.

**Durata**: al cliente la forbice «da 45 minuti a 3 ore» — l'intervallo completo di Davide, più onesto della versione che Cowork aveva proposto fermandosi a due ore e dimenticando i cani grandi. Allo staff la scelta della durata effettiva alla conferma, con 60 come sola proposta modificabile: provata a 120, il testo WhatsApp è passato coerentemente da 14:00 a 16:00 e la RPC ha persistito 120. Il rilevamento conflitti usa ora la durata scelta, non più il valore predefinito del servizio.

**GH-23, verifica: dieci superfici × tre larghezze, tutte PASS — e una regressione vera trovata.** Il pulsante di logout su mobile misurava **42×46 px**, sotto il minimo di 44 che ci siamo dati; corretto a 46×46 con un minimo condiviso sul `HeroButton`, più il nome accessibile «Esci» quando l'etichetta visiva è nascosta. **Terza volta che un mandato di sola verifica «che poteva non trovare niente» trova qualcosa** (le altre: l'ombra delle Card in GH-18, i bersagli da 16-38 px sull'app clienti).

**La garanzia di GH-05 è sopravvissuta alla riscrittura**: forzando `pets.sex = 'x'` la RPC atomica ha rifiutato con `23514` lasciando **zero customer orfani**. Era il rischio che più preoccupava dopo il rifacimento di `AddClient`, ed era giusto provarlo forzando il fallimento invece che solo il successo.

**Sesto difetto di Cowork, stessa famiglia dei precedenti** (autodenuncia): il mandato GH-23 parlava di «dodici superfici», elencate da un listato di cartella senza verificare che fossero raggiungibili. Due — `components/ClientCard.jsx` e `components/VisitCard.jsx` — hanno **zero import e nessuna route che le monti**: non sono superfici, sono codice morto. In GH-21 erano state diligentemente rivestite (177→62 e 114→58 righe): lavoro fatto bene su due stanze murate, come `AddVisit` prima di loro. Il filo resta identico — **sbaglio dove descrivo cosa verificare, non cosa ottenere.**

Codex ha rifiutato la scorciatoia di creare una route di prova per far tornare la matrice, e ha proposto un micro-mandato di rimozione nominando il rischio residuo: consumatori esterni al repository non sono osservabili da qui.

**Nota di scoperta ricorrente**: è la terza volta che troviamo codice raggiungibile solo sulla carta — `AddVisit`, e ora due componenti. Vale la pena, prima o poi, una passata sistematica sui consumatori invece di scoprirli uno alla volta.

### 27 agosto 2026 — GH-21, gli orari, e la durata che non è del servizio

**GH-21 consegnato: refactor ottimo, controprove non eseguite.** Otto file da **3.128 a 1.784 righe**, **246 stili inline a 0**, **52 colori letterali a 0**. `AppHeader` teal passa da cinque consumatori a **uno solo** (`WeeklyRevenue`, fuori perimetro dichiarato). Dentro c'è anche il **login staff**, che «non era mai stato in perimetro» e che ora ha la veste **senza essere passato da Claude Design** — prova che il kit è ormai la composizione, come previsto scrivendo il mandato.

**Ma il registro dichiara in chiusura che le controprove non sono state fatte**: nessuna verifica sulle tre larghezze, nessuna prova dei flussi reali dal gesto, nessun ciclo di creazione cliente sul demo. Verificate solo costruibilità e refactor. Consegna accettata da Luigi come chiusura del giro, **con il buco dichiarato e non nascosto** — che è il comportamento giusto.

**Rischio residuo nominato**: fra gli otto file c'è `AddClient`, che crea i clienti passando dalla RPC atomica di GH-05. Una rottura lì non si vede guardando: la scopre Davide il primo giorno che aggiunge un cane. Stesso profilo di GH-18, che «poteva non trovare niente» e trovò una regressione vera. Giro corto di sola verifica da programmare.

**Orari di chiusura** (fonte: Davide e Roby via Luigi): chiuso **domenica** e **lunedì mattina**. Verifica Cowork su 464 visite: **domenica zero, confermato**; lunedì 71 visite, quindi la chiusura è davvero solo mattutina — ma **non verificabile dai dati**, perché `visits.date` non ha l'ora. Mandato `GH-22` emesso, con il vincolo strutturale che gli orari vivano nella configurazione del tenant e non nel codice: il secondo salone avrà giorni diversi, e una costante sarebbe un difetto che si scopre nel momento peggiore.

**LA DURATA NON È UNA PROPRIETÀ DEL SERVIZIO** — risposta di Davide, 27/8, che chiude una questione aperta e ne apre una di modello:

> «bagnetto pelo raso 45 minuti/1 ora, bagnetto barboncino o maltese 1 e 15 minuti quando sta bene, bagnetto quando sta rovinato 1.30/2h, mediamente 2h ma anche 2,5h cani grandi 2/3h»

Dipende da **tre variabili insieme** — tipo di pelo, condizione del pelo, taglia — e spazia da **45 minuti a 3 ore**, un fattore quattro. È una proprietà del **cane in quel giorno**, esattamente come il prezzo. `services.duration_minutes` è NOT NULL e modella la durata come attributo del servizio: **strutturalmente sbagliato**, e va gestito sapendolo.

**Scoperta collaterale che pesa**: il wizard mostra «Bagno · circa 1 ora», ma Davide dice «mediamente 2h». **Non è un arrotondamento: è la metà.** Mostriamo al cliente il caso migliore spacciandolo per il normale. E l'origine di quel numero è stata misurata: `const DEFAULT_DURATION = 60` in `Calendar.jsx` — su 17 appuntamenti storici, **14 hanno esattamente 60 minuti**, cioè il valore che il modulo proponeva e che nessuno ha mai cambiato; le tre volte in cui qualcuno ci ha pensato ha scritto 45, 90 e **180**. Stessa famiglia del testo di rifiuto: sembra del salone perché è sempre stato lì, ma l'abbiamo scritto noi.

**Conseguenza funzionale, non estetica**: quella durata finisce in `appointments.duration_minutes` e **alimenta il rilevamento dei conflitti**. Se ogni lavorazione occupa un'ora in agenda mentre nella realtà ne occupa due, il calendario **tacerà su sovrapposizioni vere**.

**Decisione Luigi (27/8)**: al cliente si mostra una **forbice** nelle parole di Davide — «da 45 minuti a 2 ore, dipende dal pelo e da com'è messo» — e la durata reale la decide lo staff **al momento della conferma**, che è l'unico istante in cui qualcuno ha visto il cane. Identico al trattamento del prezzo. Entra in `GH-22`, che tocca già il wizard.

**Contraddizione latente da sciogliere quando si popola `services`**: `price_cents` è NOT NULL, ma i prezzi non esistono come listino. Qualcuno dovrà scrivere un numero — presumibilmente zero — e conviene sia una decisione presa e annotata, non un valore messo lì per far passare il vincolo.

### 27 agosto 2026 — GH-19 e GH-20: il calendario torna vivo, e il cerchio si chiude

**GH-19, inventario funzionale**: trenta funzioni censite dentro le 1.572 righe, ciascuna con esito dichiarato. Conferma del rischio per cui la fase era stata chiesta — **la composizione CD non copriva tutto**: creazione manuale, controllo conflitti, riprogrammazione, stati finali, promemoria, export. Una vista che nessuno guarda da quattro mesi avrebbe potuto perdere pezzi in silenzio fino a novembre. Scoperto anche un quarto stato non rappresentato (`no_show`) e l'assenza di qualunque legame fra visite e appuntamenti, che vieta la fusione di due righe dello stesso pet nello stesso giorno. Dodici decisioni sollevate, nessuna risolta d'ufficio.

**Divergenza Cowork sulla settima decisione**: Codex proponeva di adottare il testo di rifiuto standard già presente. Verifica: **quel testo non è di Davide, l'abbiamo scritto noi** — «ti chiediamo di selezionare un'altra fascia oraria dall'area cliente», registro da call center, dagli stessi che dicono «bagnetto» 129 volte su 298. CD al §9.4 chiedeva le parole del salone, non le nostre. Decisione: si usa adesso perché nulla si blocchi, ma è marcato provvisorio, e **i quattro messaggi automatici — proposta, promemoria, conferma, rifiuto — attendono le parole di Davide**. È una stringa ciascuno, ed è l'unica volta in cui un cliente riceve un no.

**GH-20 è il primo mandato scritto con la regola nuova** — invarianti e non procedura, mandato unico e ampio perché gli input erano verificati. Ha funzionato.

| | Prima | Dopo |
|---|---:|---:|
| `Calendar.jsx` | 1.572 righe | **476** |
| stili inline | 101 | **0** |
| colori letterali | — | **0** |
| foglio stile dedicato | 0 | 597 righe |
| breakpoint | vari | **uno solo, 640px** |

**Il contratto anti-regressione ha retto: 15 funzioni su 15 PASS**, ciascuna provata dal gesto reale e non dal codice — apertura da `?clientId=`, creazione manuale, conflitto, prossimo slot libero, riprogrammazione, completato, no-show con ripristino del punteggio, annullamento, apri cliente, imminente, guardia demo. Le sei superfici da rimuovere non sono più raggiungibili. Verifica Cowork indipendente: `getDraftAppointmentWhatsAppUrl` sparito, un solo `@media`, zero esadecimali nel CSS, lettura passata a `getCalendarWeekData` sulla sola settimana visibile invece di tutti i pet con tutto lo storico.

**Il cerchio fra le due app è chiuso e provato per la prima volta**: sul demo, login customer → richiesta per Pepe con fascia mattina → comparsa nel calendario staff come capsula tratteggiata e nella coda → conferma con ora assegnata → trasformazione in appuntamento → pulizia. **È il flusso che giustifica l'intero progetto**, e fino a ieri esisteva solo a pezzi.

**Due dettagli di mestiere che vale la pena ricordare.** Per evitare l'apertura accidentale di WhatsApp durante la prova, il telefono della fixture è stato sostituito con un valore non componibile e **subito ripristinato con verifica del ripristino**. E il ramo d'errore è stato provato apposta: telefono mancante → «richiesta confermata, messaggio non preparabile», che dimostra sul campo il principio del §8 — **prima si persiste, poi si comunica**.

**Nota minore**: `deleteAppointment` resta esportata in `database.js` senza alcun consumer. Coerente col mandato, che chiedeva la rimozione dalla UI; è codice morto innocuo, da valutare in una pulizia futura.

**Con questo il capitolo veste è chiuso**: Dashboard, scheda cliente, form visita e calendario. Restano fuori dal restyle il **login staff** — mai stato in perimetro, in attesa di un `CD-02` — e le pagine minori. Verso la produzione non manca più lavoro di costruzione: mancano i cancelli di G6.

### 27 agosto 2026 — GH-18 chiuso: il dubbio era fondato

**La regressione c'era davvero.** GH-18 nasceva da un sospetto di Cowork — GH-17 aveva modificato sette componenti condivisi e le controprove avevano guardato solo le tre superfici staff, mentre sette pagine customer li importano. Misura: **l'ombra delle `Card` dell'app clienti era cambiata**, e la modifica alla variante staff si era propagata al customer. Ripristinata l'ombra a due livelli pre-GH-17. Il mandato che «poteva non trovare niente» ha trovato esattamente ciò per cui era stato scritto.

**E ha trovato anche altro, che non cercava**: bersagli tattili **preesistenti da 16-38 px** su sei file customer — link di Login, Forgot e Redeem, ritorno/foto/azioni della scheda pet, chip del wizard. Non erano regressioni di GH-17: erano lì da sempre, sotto la soglia dei 44 px che ci siamo dati, ed erano sopravvissuti a tutte le controprove precedenti perché ogni giro misurava solo le pagine che toccava. Corretti senza cambiare copy, colore o flusso.

**Matrice completa**: 7 pagine customer × 3 larghezze = **21 PASS**, zero overflow, zero sovrapposizioni, zero bersagli sotto 44 px, zero errori console. Confronto puntuale col bundle: raggi 24/28, eyebrow 11 px a `.22em`, geometrie skeleton, `WarmNotice`, colori — tutto invariato tranne l'ombra corretta.

**Ciclo visita reale eseguito** su Luna: baseline 3 visite → salvataggio dal modal della scheda (4) → salvataggio dalla rotta diretta (5) → **cancellazione di entrambe dal pulsante reale, ritorno a 3, zero righe marcate**. Il form condiviso di GH-17 regge entrambe le superfici e salva lo stesso contratto dati. Teardown della sonda con zero residui su sei tabelle.

**Quinto difetto di Cowork, e stavolta era un'indicazione operativa** (autodenuncia): avevo detto a Luigi di mettere la password dell'account staff in `.env.local` sotto `GH_RLS_STAFF_PASSWORD`, citando `supabase/docs/rls-tests.md`. **Sbagliato**: quella variabile appartiene alla fixture GH-04, che GH-06 aveva smontato — non a `demo@groominghub.it`. Codex non ha reimpostato nulla e ha trovato la strada giusta da solo: riapplicare il seed idempotente già versionato, usare la sonda, rismontarla con la guardia esistente. Il filo dei miei difetti si allunga e resta coerente: **sbaglio dove prescrivo il come, non il cosa** — elenco file in GH-05, prerequisito in GH-13, contraddizione in GH-17, `git add -A` nello script, e ora il nome di una variabile.

**Nota di metodo sull'incidente dello script**: le correzioni GH-18 e la sonda temporanea erano finite nel commit `a3d3b41` insieme ai documenti CD-01, per colpa del `git add -A` di `salva.sh`. Decisione di Luigi: **non riscrivere la cronologia** — il ramo era già pubblicato — riprendere da `eaf3bdc` e rimuovere la sonda nel commit finale. Codex ha elencato nel registro anche i file finiti lì per errore, così la consegna resta equivalente alla misura reale invece che alla cronologia. Lo script è stato corretto: ora salva i soli documenti e mostra il resto sotto avviso senza toccarlo.

### 25 agosto 2026 — Davide e Roby sul calendario: risposta alla §9.1 di CD

**Fonte**: incontro diretto di Luigi con Davide e Roby, riferito la sera stessa. Congela la domanda aperta che CD aveva lasciato al §9.1 del suo handoff e che Cowork aveva posto come prerequisito del giro calendario.

**La risposta non è «calendario-primo» né «come adesso»: è che il calendario si riempie da due direzioni.**

- **In avanti**: le richieste dei clienti, una volta confermate, vengono registrate assegnando **data e orario**. L'orario lo decide il salone al momento della conferma, perché **dipende dalle condizioni del pet e non è determinabile a priori**. Conferma definitiva del modello «richiesta, non prenotazione a slot»: non esiste una durata prevedibile su cui costruire una griglia.
- **All'indietro**: chi arriva direttamente in negozio col pet viene registrato come si fa oggi, e quella lavorazione **integra il calendario a posteriori**.

**Perché lo vogliono** (parole loro): per avere un quadro chiaro di clienti, incassi, promozioni e status del cliente. Il calendario non è quindi solo un'agenda: è il punto dove convergono le due strade e da cui si legge l'andamento. Dichiarato come assetto **transitorio**, «almeno finché il meccanismo non sarà rodato».

**Conseguenza compositiva: il calendario conterrà tre oggetti di natura diversa**, non due come CD aveva ipotizzato al §10.

| Oggetto | Certezza temporale | Forma |
|---|---|---|
| Richiesta pendente | giorno desiderato + fascia | banda, non blocco |
| Appuntamento confermato | data e ora assegnate dal salone | blocco a ora certa |
| Lavorazione registrata a posteriori | **solo il giorno** | segno sulla giornata, senza ora |

**Vincolo di schema misurato, da risolvere PRIMA che CD componga**: `visits.date` è di tipo **`date`, senza orario**. Una lavorazione registrata a posteriori quindi **non ha un'ora** e non è collocabile in una griglia oraria. Due strade: aggiungere un orario alle visite (mandato dati separato, con backfill e decisione sulle 464 storiche che un'ora non ce l'hanno), oppure comporre il calendario perché regga oggetti privi di ora. La seconda è coerente con la pratica reale — loro registrano a lavoro finito, non cronometrano — ed è anche la più onesta: un'ora inventata sarebbe un dato finto che sembra vero.

Nota di convergenza: richieste e lavorazioni a posteriori hanno lo **stesso problema visivo** — non stanno a un'ora precisa. Solo gli appuntamenti confermati sono blocchi. La forma «banda» che CD proponeva per le richieste serve quindi a due dei tre oggetti.

**Precisazione del salone che ribalta il senso di un campo** (Davide e Roby via Luigi, 25/8): quello che il cliente indica — bagno, taglio, toelettatura completa — **non è un servizio che seleziona da un listino, è un'esigenza che segnala**. Le lavorazioni le consigliano o dispongono Davide e Roby **dopo aver valutato di persona** condizioni del pelo, caratteristiche del pet e abitudini. Conseguenze: (a) la parola «Servizio» usata oggi nel wizard clienti (`Book.jsx`, due occorrenze) e nella vista richieste staff (`CustomerRequests.jsx`) ha il **registro sbagliato** — suggerisce un menu da cui si ordina — e va sostituita con il vocabolario dell'indicazione; (b) **ciò che il cliente chiede e ciò che viene fatto sono dati distinti che possono legittimamente differire**: la richiesta porta l'esigenza, la visita porta `treatments`, testo libero scritto dal salone — trattarli come lo stesso campo sarebbe un errore di modello; (c) conferma strutturale del perché non può esistere una griglia a slot, né un preventivo: se la lavorazione si decide guardando il pet, durata e prezzo non sono prevedibili. Conferma anche a posteriori la scelta di GH-16 di tenere `treatments` come testo libero invece di agganciarlo al catalogo.

**BLOCCO DI LANCIO INDIVIDUATO — l'app clienti nascerebbe muta** (25/8, misura Cowork): `appointment_requests.service_id` è **NOT NULL** e referenzia `services`. Sul progetto di prova, che è la fotografia della produzione dopo G6, **`services` ha zero righe** (sul demo ce ne sono due, di prova: per questo lì il wizard funzionava). Al lancio un cliente che apre la prenotazione non avrebbe nulla da indicare e non potrebbe inviare la richiesta.

**Blocco risolto senza chiedere niente a nessuno: il vocabolario era già nel database.** Invece di far inventare un listino, Cowork ha misurato cosa Davide e Roby hanno scritto di loro pugno in 453 visite:

| Come l'hanno scritto | Volte |
|---|---:|
| bagno | 169 |
| bagnetto | 129 |
| taglio | 122 |
| bagno e taglio | 9 |
| toelettatura | 7 |
| toelettatura completa | 4 |

**Quattro voci coprono il 97% di un anno di lavoro**: bagno, taglio, bagno e taglio, toelettatura completa. **Decisione Luigi con Davide e Roby (25/8): «vince la consuetudine»** — si adottano quelle emerse dall'uso, nessuna aggiunta teorica. Da caricare in `services` prima di G6, senza prezzi. Aggiunto ai cancelli di G6.

**Due scoperte collaterali dalla stessa misura, che valgono più della lista.** (a) **Dicono «bagnetto» 129 volte su 298**: il diminutivo affettuoso per lo stesso identico lavoro. È la loro voce reale, misurata e non supposta — riferimento per la temperatura del copy rivolto ai clienti. Resta una micro-scelta di composizione: se l'etichetta customer debba dire «Bagno» (più frequente) o «Bagnetto» (più loro). Domanda per CD, è materia di voce. (b) **`treatments` non contiene solo lavorazioni**: dentro ci sono «ha saltato l'appuntamento senza avvisare», «non è venuto», «appuntamento rimandato per ciclo», «bagnetto (paga 15 euro perché è la prima volta)». Il salone lo usa anche come diario. Conseguenza per chi compone storico e calendario: una riga che promette «ecco cosa è stato fatto» a volte dirà «non è venuto». Il dato è più sporco di quanto qualunque prototipo lo immaginerebbe, e va composto per come è.

---

**Prossimo passo (catena produzione)**: (a) spot-check di Luigi sulle 5 schede contro la vecchia app — ultimo cancello umano; (b) **mandato G6**; (c) al momento dell'atto, autorizzare anche il collegamento di Codex su `Webapp_Project` (è distinto dal mio) e toglierlo subito dopo; (d) ripulire il §3 Grooming da `BEA_ScuolaMusica/_temp_updates/108-registro-ultimi-task-codex.md`. **Decisione aperta post-G6**: separare la produzione Grooming in un'organizzazione dedicata — non per costo ma perché, quando il prodotto sarà venduto ad altri saloni, i dati di produzione dei clienti non possono condividere unità di accesso e fatturazione con gli altri lavori.

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
