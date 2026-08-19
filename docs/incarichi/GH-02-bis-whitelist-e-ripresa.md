# Incarico GH-02-bis — Migration whitelist pets + ripresa Scheda pet

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Nuovo mandato** che risponde alla condizione di ripresa della consegna `docs/consegne/GH-02-scheda-pet-interruzione.md`. Perimetro: questo incarico soltanto — branch `feat/customer-app`, DB demo `grooming-hub-demo` (ref `qttpinkslhenxrsbhhhg`). Prod `grooming`: non interrogare, non toccare.

## Decisione di Luigi (18/8, registrata a diario)

Autorizzata **una** migration di protezione whitelist sui `pets`: per gli attori senza accesso staff sul tenant, ogni colonna torna al valore OLD **tranne** `owner_notes`, `coat_preferences`, `photo_url`. Il DB deve far rispettare esattamente il contratto che GH-02 dichiarava — non la blacklist minima (microchip+peso), che lascerebbe l'anagrafica scoperta.

**Riconoscimento (Cowork, controprova del 18/8):** l'interruzione era fondata. `pets_customer_update` concede UPDATE full-row (commento esplicito in `20260424142000_rls_pets.sql`); il trigger di M `20260511070742` protegge solo `internal_notes`. L'affermazione contraria in GH-02 era un errore di Cowork, scritto di memoria e non misurato.

## Parte 1 — Migration (unica autorizzata)

- File in `supabase/migrations/`, idempotente (`CREATE OR REPLACE FUNCTION` + `DROP TRIGGER IF EXISTS`), con **fonte in commento**: «GH-02-bis, decisione Luigi 18/8/2026, a valle di consegna GH-02-interruzione».
- Funzione `SECURITY DEFINER` con `search_path` pinnato (pattern già in uso in M `20260511070742`).
- Logica: `BEFORE UPDATE ON public.pets`; se `NOT has_tenant_any_staff_access(NEW.tenant_id)`, ricostruire NEW da OLD conservando da NEW solo le tre colonne whitelisted. Staff passa invariato.
- Il vecchio trigger `trg_pets_protect_internal_notes` è superato dalla whitelist (che copre anche `internal_notes`): sostituirlo dichiarandolo nel registro. Il trigger sui `customers` non si tocca.
- Applicazione **solo sul demo**. Se applichi via MCP `apply_migration`, il timestamp lo genera lui: rinomina il file nel repo per allinearlo (pattern M11-bis documentato a diario).
- **Controprova viva obbligatoria** post-applicazione, come `mario.rossi@test.example` sul proprio pet: (a) UPDATE su `owner_notes` → passa; (b) UPDATE su `microchip` → valore invariato; (c) UPDATE su `name` → valore invariato; (d) da staff, UPDATE su `microchip` → passa. Esiti misurati nel registro.

## Parte 2 — Ripresa A1-A4

A migration verificata, esegui A1-A4 **esattamente come da `docs/incarichi/GH-02-scheda-pet.md`** (disegno, vincoli, cosa NON fare, nota ambienti), con una correzione al testo dell'incarico: la frase «il trigger DB già li protegge» diventa vera solo *dopo* la Parte 1 — la UI mostra read-only i campi non whitelisted, e il DB ora lo garantisce davvero.

## Condizioni di consegna

Unico registro in `docs/consegne/` (convenzione del README): Parte 1 e Parte 2 distinte, base dichiarata, tabella esaustiva file, hash commit, esiti delle quattro controprove trigger, verifiche UI (login Mario, RLS-reject Luca), eccezioni e fuori-istruzione. Niente push senza ok di Luigi. Un'ulteriore interruzione motivata resta una consegna buona.
