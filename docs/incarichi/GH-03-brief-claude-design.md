# Incarico GH-03 — Brief per Claude Design: wizard prenotazione + calibrazione Scheda pet

**Per:** Claude Design (CD) · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Natura:** incarico di composizione, non di implementazione. CD non vede il filesystem: questo brief è autosufficiente. L'implementazione resta a Codex su mandato separato.

---

## Contesto per CD

Grooming Hub ha adottato il canone operativo BEA: Luigi decide, Cowork verifica e documenta, Codex implementa, **CD compone**. Il tuo bundle `design_handoff_customer_app` è la base viva del design system customer, con due correzioni intervenute dopo la sua stesura: (1) niente signup pubblico — i customer nascono solo via invito (Decisione 12 Gate 2); (2) niente boutique/fedeltà/profilo esteso in Fase 1.

**Stato UI misurato al 18/8** — schermate complete: Login, Home/Dashboard, Promozioni, Scheda pet. Stub: Prenotazione (`/u/book`). Componenti shared esistenti: `Button`, `Card` (shadow/radius props), `Skeleton`, `Brandmark` (paw + wordmark Fraunces), `Eyebrow` (uppercase 11px, letter-spacing 0.22em), `Icon` (vocabolario SVG inline: paw, clock, sparkle, heart, whatsapp, logout, camera, edit), `BackgroundDecor` (2 gradient radiali), `StatusBadge` (pill con dot colorato, pending/confirmed/done), `CustomerNav` (TopNav desktop / BottomNav mobile, avatar con dropdown). Tokens: Fraunces per i display, `--color-primary #6f9792`, radii `--r-sm/md/lg/xl/full`.

**Posizionamento (vincolante, dai contributi del salone)**: il salone è un luogo di accoglienza, non un fornitore — l'app non deve sentirsi transazionale; il salone mantiene il controllo della relazione — nessuna prenotazione auto-confermata; WhatsApp è il canale primario e il prodotto ci dialoga.

## Richiesta 1 — Composizione wizard prenotazione `/u/book` (ora)

**AGGIORNAMENTO 18/8 sera — requisiti confermati a voce da Davide (fonte congelata: `docs/workflows/flussi-operativi-salone.md` §11).** Sostituiscono e precisano il flusso sotto:

- L'app **non blocca mai**: sotto i 7 giorni → avviso non bloccante («sei a corto di preavviso»); nei periodi di piena (Capodanno, Ferragosto, Natale…) → alert informativo. In entrambi i casi la richiesta parte. Parole di Davide: «Non chiudiamo le porte ai clienti… facciamole arrivare tutte e poi rispondiamo noi». Il tono degli avvisi va composto di conseguenza: informativo e caldo, mai punitivo.
- Campi della richiesta: pet, servizio, data desiderata, **condizioni del pelo/manto** (auto-dichiarate — il salone le tratta come indicazione da verificare, non come dato: il micro-copy non deve promettere che bastino), **età del cane solo se mancante in anagrafica** (per i pet registrati l'app la sa già).
- Esito: stato **«in attesa di conferma»** — la risposta vera arriva su WhatsApp, di solito in pochi minuti. La schermata di esito deve dire esattamente questo, come accoglienza: la conferma è una conversazione col salone, non un semaforo.
- Niente slot-picker a disponibilità garantita: il cliente esprime una **data desiderata**, non prenota una casella. La composizione deve riflettere questa semantica (richiesta, non booking transazionale).

Flusso base già deciso: pet → servizio → data → conferma, con `?petId=` per preselezione dalla scheda pet. Pagina esito con possibilità `.ics` alla conferma. Empty state che rimanda a WhatsApp senza tono d'errore.

**AGGIORNAMENTO 21/8 sera — preferenza oraria (fonte: Davide via Luigi, congelata in §11 flussi)**: orario continuato 9–19; i clienti dicono «mattina» o «pomeriggio». Sotto la strip delle date: **tre chip facoltative** — «Mattina (9–13)», «Pomeriggio (13–19)», «Per me è uguale» — micro-copy «l'orario preciso lo concordiamo noi su WhatsApp». Nessuna griglia oraria, nessun orario puntuale. La regola interna "ultima lavorazione avviabile alle 18" NON compare nel modulo.

Da te: composizione delle schermate del wizard (desktop + mobile con BottomNav), gerarchia tipografica per gli step, pattern di selezione slot, il linguaggio della conferma "in attesa del salone" (che deve suonare come accoglienza, non come pratica in coda), stati (loading, conflitto slot, errore submit), micro-copy in italiano nel tono del brand. Output: handoff markdown con riferimenti ai componenti/token esistenti sopra elencati; se servono token o componenti nuovi, dichiarali in una sezione a parte con motivazione.

## Richiesta 2 — ANNULLATA (21/8 sera)

Scoperta di Luigi: la composizione della Scheda pet esiste già nel bundle (`reference/pet-page.jsx`, 847 righe + §04.2 + specifiche token). La calibrazione non richiede quindi un nuovo passaggio da CD: diventa un allineamento misurabile implementazione-vs-prototipo, in carico a Codex con mandato dedicato. Eccezioni dichiarate al prototipo: niente prezzi (decisione 21/8 supera il bundle datato), le funzionalità nuove (edit inline, guard, upload foto) si conservano, i 2 colori fuori palette si riconducono ai token. CD rientra per le composizioni future (restyling staff, Fase 2). Il testo originale della richiesta resta sotto per storia.

## ~~Richiesta 2 — Calibrazione Scheda pet (dopo il redeploy, con URL e screenshot)~~

**AGGIORNAMENTO 21/8 — vincolo nuovo, deciso da Luigi sul test dal vivo**: **nessun prezzo sul lato customer, mai** — nemmeno lo storico nelle righe visite (Davide non fissa prezzi in anticipo: dipendono dalle condizioni del pet; il prezzo storico in app crea ancoraggio). La riga visita va ricomposta senza importo: nella calibrazione indica cosa la sostituisce (es. servizio + durata, o nota descrittiva).

La Scheda pet (`/u/pet/:id`) è stata implementata da Codex senza passaggio di composizione: hero (foto/iniziale + nome Fraunces), anagrafica read-only, preferenze toelettatura, note del proprietario editabili inline (viewing→editing→saving→saved), storico visite. Misure Cowork: 45 blocchi di stile inline e **2 colori fuori token** (`#3f6658`, `#8f3f49`) introdotti ad hoc. Quando Luigi ti darà URL preview e screenshot: critica di composizione (gerarchia, ritmo verticale, coerenza col resto), verdetto sui 2 colori (adottarli come token nuovi o ricondurli alla palette), e correzioni prescrittive che Codex possa applicare senza interpretare.

## Cosa NON fare

Non ricomporre le schermate già calibrate (Login, Home, Promozioni: sono passate dal test visivo di Luigi e dal primo riscontro positivo del salone). Non riaprire decisioni di prodotto chiuse (invito-only, no boutique, pending-only). Non produrre codice: l'implementazione è di Codex.

## Consegna attesa

Handoff markdown (uno per richiesta) che Luigi riporterà nel repo; Cowork lo verserà nel canone e ne ricaverà i mandati Codex. Le questioni aperte vanno nominate, non risolte d'ufficio.
