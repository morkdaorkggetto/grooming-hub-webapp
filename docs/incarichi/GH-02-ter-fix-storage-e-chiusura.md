# Incarico GH-02-ter — Fix policy Storage pet-avatars + chiusura Scheda pet

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Nuovo mandato** che risponde alla condizione di ripresa di `docs/consegne/GH-02-bis-whitelist-e-ripresa-interruzione.md`. Perimetro: branch `feat/customer-app` (base `f83e8d4`), DB demo `grooming-hub-demo` (ref `qttpinkslhenxrsbhhhg`). Prod `grooming`: intoccabile.

## Decisione di Luigi (18/8, registrata a diario)

Autorizzata **una** migration idempotente che ricrea le tre policy `"Pet avatars customer insert/update/delete"` qualificando il riferimento al path come `storage.objects.name` dentro le subquery `EXISTS`, eliminando la cattura da parte dell'alias `p` (`pets.name`).

**Controprova Cowork sul perimetro (18/8):** il difetto vive solo nelle tre policy customer di `pet-avatars`. Le policy `client-photos` (M `20260423123000`, righe 1345-1380) e la `"Pet avatars staff all"` usano `foldername(name)` fuori da subquery e sono corrette: **non toccarle**.

## Parte 1 — Migration (unica autorizzata)

- File in `supabase/migrations/`, idempotente (`DROP POLICY IF EXISTS` + `CREATE POLICY`), fonte in commento: «GH-02-ter, decisione Luigi 18/8/2026, a valle di consegna GH-02-bis-interruzione».
- Le due condizioni `IS NOT NULL` fuori da EXISTS nella policy INSERT sono già corrette: conservarle identiche.
- Applicazione solo sul demo; se il timestamp lo genera l'MCP, allinea il nome del file nel repo (pattern M11-bis).
- **Controprove vive obbligatorie**: (a) Mario carica su `<tenant_id>/<pet_luna_o_pepe>/...` → riuscito; (b) Mario tenta path con pet_id non suo → 403; (c) Mario tenta path con tenant_id diverso → 403; (d) staff carica su un proprio pet → riuscito. Ripulire gli oggetti di prova a controprova conclusa e dichiararlo nel registro.

## Parte 2 — Chiusura A1-A4

Con A3 sbloccato: verifica nel browser da utente autenticato (il test saltato in GH-02-bis), rifinitura, poi commit atomici del lavoro locale già preparato (Pet.jsx, hook, petPhoto, UnsavedChangesProvider, CustomerNav, Icon, seed). Vincoli invariati da GH-02: build verde, zero warning nuovi, niente push senza ok di Luigi.

## Condizioni di consegna

Registro unico in `docs/consegne/`: esiti delle quattro controprove Storage, verifica browser descritta con misure (stati visti, non raccontati), tabella esaustiva file, hash commit, eccezioni e fuori-istruzione. Un'ulteriore interruzione motivata resta una consegna valida.
