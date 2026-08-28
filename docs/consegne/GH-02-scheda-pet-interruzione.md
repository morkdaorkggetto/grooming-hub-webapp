# Consegna GH-02 — Scheda pet customer: interruzione motivata

**Data:** 18 agosto 2026  
**Esecutore:** Codex  
**Incarico di riferimento:** `docs/incarichi/GH-02-scheda-pet.md`

## Natura del mandato

Luigi ha affidato a Codex questo incarico con un **perimetro specifico e una tantum**.

L'autorizzazione valeva esclusivamente per GH-02, sulla branch `feat/customer-app`
alla base dichiarata `90d7e26`, e per le sole operazioni previste sul database demo
`grooming-hub-demo` (ref `qttpinkslhenxrsbhhhg`). Non costituisce
un'autorizzazione permanente o riutilizzabile per altri incarichi, branch,
ambienti, progetti Supabase o attività future.

In particolare, il mandato non autorizzava e non autorizza:

- modifiche al database di produzione `grooming`;
- migrazioni di schema;
- uso o modifica di credenziali e secret;
- push, deploy o merge senza un nuovo consenso esplicito di Luigi;
- estensioni autonome del perimetro oltre A1-A4 di GH-02.

## Base dichiarata

| Voce | Valore verificato |
|---|---|
| Repository locale | `webapp/` |
| Branch | `feat/customer-app` |
| HEAD iniziale e finale | `90d7e26b5f1458e01c4173639436f3fb81106159` |
| Allineamento con origin | `0/0` rispetto a `origin/feat/customer-app` |
| Database autorizzato | solo demo `grooming-hub-demo` |
| Ref demo | `qttpinkslhenxrsbhhhg` |
| Produzione | non interrogata e non modificata |

## Esito

Consegna interrotta prima dell'implementazione, in applicazione della clausola
"Niente migration: se lo schema non basta, fermati e consegna l'interruzione
motivata" dell'incarico.

La policy `pets_customer_update` consente al customer un `UPDATE` completo della
riga `pets`. Il relativo commento dichiara esplicitamente che la limitazione a
`owner_notes`, `coat_preferences` e `photo_url` è applicata dalla UI e non dal DB
(`supabase/migrations/20260424142000_rls_pets.sql`, righe 35-55).

Il trigger presente protegge soltanto `pets.internal_notes`; non protegge
`microchip` e `weight_kg` (`supabase/migrations/20260511070742_enforce_staff_only_notes_columns.sql`,
righe 54-78). Un customer potrebbe quindi modificare direttamente microchip e
peso tramite API, anche se la schermata li rendesse non modificabili.

Poiché GH-02 afferma che questi campi staff-only sono protetti dal DB e vieta di
aggiungere una migration, lo schema non soddisfa il contratto richiesto. A1-A4
non sono stati avviati per evitare una consegna solo apparentemente sicura.

## File toccati

| File | Tipo di intervento | Contenuto |
|---|---|---|
| `docs/consegne/GH-02-scheda-pet-interruzione.md` | aggiunto | questo registro di consegna |

Nessun file applicativo, migration, seed o configurazione è stato modificato.
Le modifiche documentali già presenti nel worktree prima dell'incarico sono
state riconosciute come preesistenti e lasciate intatte.

## Commit

Nessun commit creato. Nessun push, merge o deploy eseguito.

## Verifiche eseguite

| Verifica | Esito |
|---|---|
| Configurazione locale indirizzata al ref demo | riuscita |
| Endpoint Auth demo | HTTP 200 |
| Endpoint REST demo | HTTP 200 |
| Login `mario.rossi@test.example` | riuscito |
| Pet visibili a Mario | 2 |
| Login `luca.bianchi@test.example` | riuscito |
| Lettura da Luca di un pet appartenente a Mario | negata da RLS (0 righe) |
| `npm run build` | riuscito, 128 moduli trasformati |
| Stati UI GH-02 implementati | 0, per interruzione preventiva |
| `npm run lint` | non eseguibile: comando `eslint` non installato |

La build conserva due avvisi preesistenti: dati Browserslist obsoleti e chunk
JavaScript da 617,50 kB superiore alla soglia Vite di 500 kB.

## Eccezioni e fuori-istruzione

- Nessuna operazione eseguita su produzione.
- Nessuna migration creata o applicata.
- Nessun seed A4 scritto sul demo.
- Nessun upload Storage effettuato.
- Nessuna route o navigazione aggiunta.
- Nessun secret letto in output, scritto nei file o committato.
- Le verifiche Auth/RLS sono state non distruttive.

## Condizione per la ripresa

GH-02 può riprendere soltanto con una nuova istruzione esplicita di Luigi che:

1. autorizzi una migration limitata alla protezione DB dei campi staff-only; oppure
2. accetti consapevolmente che `microchip` e `weight_kg` siano protetti soltanto
   dalla UI per questa fase.

Qualunque ripresa costituirà un nuovo mandato e richiederà una nuova verifica di
branch, base, worktree e stato del demo.
