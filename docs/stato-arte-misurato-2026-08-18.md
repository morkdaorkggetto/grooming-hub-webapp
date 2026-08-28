# GH-01 — Stato dell'arte misurato e piano dei giri residui

**Incarico:** GH-01 (primo incarico del canone operativo, cfr. `docs/06-canone-operativo-portabile.md` nella root non versionata)
**Data misura:** 18 agosto 2026 · **Misure eseguite da:** Cowork, su repo locale `webapp/` (branch `feat/customer-app`, HEAD `90d7e26`)
**Scadenza di riferimento:** chiusura Fase 1 a fine agosto 2026

---

## 1. Le dipendenze da Davide e Roby — nominate per prime

Sono le uniche cose che non si comprimono. In ordine di impatto sulla scadenza:

| # | Dipendenza | Quando serve | Latenza storica misurata |
|---|---|---|---|
| D&R-1 | **Finestra di manutenzione per la migration di produzione** (DB `grooming`, 189 clienti reali). Va concordata con anticipo: backup + applicazione + verifica. Senza finestra, niente merge in prod entro il mese. | Da concordare **entro il 24/8** per eseguire il 29–31/8 | Mai richiesta prima — incognita |
| D&R-2 | **Conferma regola prenotazione**: anticipo minimo 7 giorni "strict" (l'app blocca) o "soft" (permette ma segnala). Decisione già impostata come "soft" in pre-Gate 3; serve conferma prima del wizard `/u/book`. | Inizio Fase C (~24/8) | Risposte precedenti: giorni, non ore |
| D&R-3 | **Feedback sulla Scheda pet** quando la consegneremo in preview. Non blocca il codice, blocca l'iterazione. | Dopo giro 2 (~21/8) | «Soddisfatti dell'interfaccia» (20/5): asciutto, giorni |
| D&R-4 | Foto reali del salone. **Non bloccante**: decisione del 20/5, le Unsplash sono scelta finale di Fase 1. | — | Mai arrivate |
| D&R-5 | Quarto round documento partecipato (pet difficili da fotografare, convenzioni interne, momenti "uffa"). **Non bloccante** per Fase 1. | — | — |

Fonte congelata dei dati del salone: `webapp/docs/workflows/flussi-operativi-salone.md` (3 round + sezione 10). Nulla di detto in chat vale come dato senza passare di lì.

## 2. Cosa è nel canone (misurato, non raccontato)

Canone = repo Git `webapp/` (origin `morkdaorkggetto/grooming-hub-webapp`).

| Misura | Valore | Come misurato |
|---|---|---|
| Branch di lavoro | `feat/customer-app` @ `90d7e26` (21/5/2026), **allineata a origin 0/0** | `git rev-list --left-right --count` |
| Distanza da `main` | main +1 / feat +43 commit | idem |
| `main` | `c9a3678` (25/4/2026), = origin/main | `git branch -vv` |
| Migration nel repo | **36 file**, ultima `20260520051506_add_service_id_to_appointments.sql` | `ls supabase/migrations \| wc -l` |
| App customer | 6 pagine reali (`Login`, `Home`, `Promotions`, `Forgot`, `Redeem`, +nav) + 2 stub (`Pet.jsx`, `Book.jsx`); 4 hook | `find src/apps/customer -type f` |
| UI shared | 9 componenti (incl. `CustomerNav.jsx` da Step 6.5) | `ls src/shared/ui` |
| App staff sul demo | **rotta**: 13 × `from('clients')`, 3 × `customer_client_links`, 48 × `client_id` in `src/apps/staff/lib/database.js` | `grep -c` |
| Preview Vercel demo | `https://grooming-hub-webapp-aish.vercel.app` risponde 200 con l'app | fetch 18/8 |
| Branch storiche | 7 `codex/*` + 1 `preview/*` (marzo–aprile), 2 `claude/*` — nessun lavoro ignoto post-21/5 | date ultimo commit per branch |

**Schermate Fase 1: 2 complete su 4** (Dashboard, Promozioni ✅ — Scheda pet, Prenotazione 🔩 stub).

## 3. Cosa è in sospeso o non misurabile oggi

- **Fuori dal canone (untracked):** `webapp/docs/piano-completamento-fase1.md` — il piano A/B/C/D redatto a valle di Step 6.5. Esiste, è buono, ma non è committato. Anche questo documento (GH-01) e il diario aggiornato attendono promozione.
- **Non misurabile da questa sessione:** stato dei progetti Supabase `grooming` (prod) e `grooming-hub-demo`. Il collegamento MCP attuale vede solo l'organizzazione BEA. Dopo ~3 mesi di inattività il demo è presumibilmente in auto-pausa (già successo a maggio). **Riattivazione accesso = gesto di Luigi.**
- **Verifiche non eseguite oggi** (dichiarate, non nascoste): build Vite non rilanciata; smoke test autenticato sulla preview non eseguito; advisor Supabase non re-interrogato (i "30+ WARN" citati nel diario sono del 13/5, da rimisurare).
- **Gate mancanti:** Gate 4 (test RLS), Gate 5 (refactor staff), Gate 5-bis (RPC prenotazione), Fase D (hardening + migration prod + merge).

## 4. Piano dei giri residui verso fine mese

Ruoli (canone §2): **Luigi decide e deploya · Cowork verifica e documenta · Codex implementa · Claude Design compone solo se serve nuova composizione visiva** (il bundle esistente copre le schermate residue). Ogni giro = incarico scritto GH-nn → consegna con registro → verifica → promozione nel canone.

| Giro | Finestra | Contenuto | Incarico a | Dipendenza esterna |
|---|---|---|---|---|
| **G1** | 18/8 (oggi) | Innesto canone: questo documento + diario aggiornato + promozione nel canone di `piano-completamento-fase1.md` e del canone stesso. Luigi: ripristina accesso Supabase org grooming + restore demo se in pausa. | Cowork + Luigi | Accesso Supabase (Luigi) |
| **G2** | 19–21/8 | **Fase A** — Scheda pet: A1 read-only + A2 inline edit + A3 upload foto + A4 seed demo. Deploy preview, consegna a D&R. | Codex (GH-02) | → apre D&R-3 |
| **G3** | 21–24/8 | **Fase B** — Gate 5 refactor staff (B1-B2), migrazione `contacts`→`customers` (B3), Gate 4 test RLS (B4). | Codex (GH-03) | — |
| **G4** | 24–27/8 | **Fase C** — RPC `available_slots`/`book_appointment` (firma approvata da Luigi prima dell'implementazione), wizard `/u/book`, redeem reale, forgot reale. | Codex (GH-04) | D&R-2 (regola 7 giorni) |
| **G5** | 27–28/8 | **Fase D1** — Security hardening: advisor re-interrogato su entrambi i progetti, categorizzazione, migration `security_hardening` prima su demo poi pronta per prod. | Codex + Cowork (GH-05) | — |
| **G6** | 29–31/8 | **Fase D2-D3** — Migration prod-safe su `grooming` nella finestra concordata, checklist "fatto" Fase 1, merge `feat`→`main`, deploy prod. **Push e deploy: gesti di Luigi.** | Tutti (GH-06) | **D&R-1 (finestra)** |

**Margine:** il piano di maggio stimava 13–17 sessioni (~6–9 giornate piene) per A+B+C, esclusa D. Nella finestra 18–31/8 ci stanno solo con ritmo pieno e risposte rapide del salone. Se qualcosa deve cadere, cade nell'ordine: C3-C4 (auth flows rinviabili a settembre) → parte di C2 (wizard ridotto a richiesta-senza-slot) — **mai D1-D2**: non si va in prod senza hardening e senza finestra concordata.

**Griglia delle cinque domande (§3 del canone)** applicata al piano: l'intreccio più rischioso è demo/prod in G6 (variabili che erano "lo stesso numero" — schema demo e schema prod — si separano davvero al momento del backfill: ogni migration va riletta in variante prod-safe, già prevista in `migration-plan.md`). Secondo intreccio: staff e customer leggono lo stesso dato dopo B1 — i test RLS di B4 sono la controprova strumentale.

---

*Storico revisioni: creato 18/8/2026 (consegna GH-01, Cowork).*
