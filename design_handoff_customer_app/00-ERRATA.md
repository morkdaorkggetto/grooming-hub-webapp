# ERRATA — cosa di questo bundle è superato, e da cosa

**Tenuto da:** Cowork · **Creato:** 21 agosto 2026 · **Regola:** il bundle è la base compositiva storica e NON si riscrive; le decisioni successive lo superano punto per punto. In caso di conflitto vince questo file, e la fonte citata vince su questo file. Chi implementa dichiara nel registro quale voce dell'errata ha applicato.

| # | Nel bundle | Superato da | Fonte |
|---|---|---|---|
| 1 | Signup pubblico customer (proto-auth) | Customer solo via invito (`accept_customer_invite`); nessuna route di registrazione | Decisione 12 Gate 2 |
| 2 | Boutique/shop (proto-shop, shop.jsx), livelli fedeltà, profilo esteso, notifiche | Fuori scope Fase 1; fedeltà a 3 livelli confermata come direzione Fase 2 | Pre-Gate 3; §11 flussi (conferma Davide 18/8) |
| 3 | **Prezzi visibili al customer** — visite in `pet-page.jsx` (righe 38-43), eventuali prezzi servizi in booking | **Nessun prezzo lato customer, mai.** Modello "solo incassi": i prezzi esistono solo come incassi registrati lato staff | Decisione Luigi 21/8 (pratica di Davide), diario; implementato in GH-06 |
| 4 | Booking a slot/disponibilità (proto-booking, booking.jsx) | **Richiesta, non booking**: data desiderata senza semantica libero/occupato, pending-only, conferma su WhatsApp. Composizione vigente: `docs/incarichi/GH-03-R1-handoff.md` | Conversazione Davide 18/8 (§11 flussi); handoff CD 19/8 |
| 5 | Selezione orario puntuale nel booking | Tre chip facoltative: Mattina (9–13) / Pomeriggio (13–19) / «Per me è uguale». Orario reale del salone: continuato 9–19, ultima lavorazione avviabile alle 18 (regola interna, mai esposta) | Davide via Luigi 21/8 (§11 flussi); decisione Luigi 21/8 |
| 6 | Campi richiesta booking originali | Aggiunti: condizioni manto (chips + testo libero, auto-dichiarate "da verificare"), età solo se assente in anagrafica | Conversazione Davide 18/8 (§11 flussi) |
| 7 | `.ics` alla prenotazione | `.ics` solo post-conferma del salone | Handoff GH-03-R1 §4 |
| 8 | Palette: qualunque colore non presente in `tokens.css` | I 2 hex introdotti in implementazione (`#3f6658`, `#8f3f49`) NON sono del bundle: da ricondurre ai token (mandato GH-09) | Misura Cowork 21/8 |
| 9 | — (novità, non superamento) | Token nuovo `--color-whatsapp` come alias di `--color-success-text` | Decisione Luigi 19/8 su proposta CD |

**Cosa del bundle resta pienamente valido**: tokens.css, shared-ui, proto-dashboard/auth/core come riferimento compositivo, `pet-page.jsx` per la Scheda pet (al netto delle voci 3 e 8 — e col dettaglio *operatore in riga visita* candidato all'adozione in GH-09).

*Manutenzione: ogni decisione futura che contraddice il bundle aggiunge una riga qui, con fonte. Non si cancellano righe.*
