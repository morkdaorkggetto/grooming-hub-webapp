# Incarico GH-04 — Sonda staff usa-e-getta sul demo

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Micro-mandato** propedeutico a G3 (Gate 5 + Gate 4). Perimetro: solo demo `grooming-hub-demo` (ref `qttpinkslhenxrsbhhhg`), solo atti di dato (nessuna migration di schema). Prod intoccabile. Nessun file applicativo. Niente push.

## Perché

Le controprove staff di G3 richiedono un accesso staff. L'account operatore vero resta di Luigi (canone: le credenziali sono sue) e il workaround di GH-02-ter (promozione temporanea di Mario) mescolava i ruoli di un account customer. Da qui in avanti: sonda dedicata, riconoscibile, smontabile.

## Disegno

- Atto di dato idempotente sul demo, fonte in commento («GH-04, decisione Luigi 18/8»): utente `staff.sonda@test.example` in `auth.users` + `auth.identities`, password di prova dichiarata nel registro (è una sonda, non un segreto), riga in `public.tenant_memberships` con ruolo staff sul tenant `grooming-hub`, eventuale `profiles` se lo schema lo richiede. Ogni testo marcato `[DEMO]`.
- **Controprove**: (a) login API della sonda → token rilasciato; (b) la sonda legge i pet del tenant (RLS staff); (c) `mario.rossi` NON vede nulla di nuovo (nessun effetto lato customer); (d) la sonda NON compare tra i customer.
- Lo script/atto va registrato nel repo in `supabase/seeds/` (come il seed GH-02) per poterla ricreare e smontare a piacere.

## Ciclo di vita (vincolante)

La sonda vive per la durata di G3. Alla chiusura di G3 la consegna deve includere lo smontaggio: sospensione/rimozione dell'utente + password bruciata, con verifica misurata (login → fallisce). Se G3 si allunga oltre una settimana, lo smontaggio e la ricreazione sono preferibili alla sonda perenne.

## Cosa NON fare

Non toccare l'account operatore esistente. Non promuovere/demolire account customer. Non creare policy o funzioni. Non usare la sonda per lavori fuori G3.

## Consegna

Registro in `docs/consegne/`: atto eseguito, 4 controprove misurate, file seed aggiunto, eccezioni. Commit `chore:` del solo file seed.
