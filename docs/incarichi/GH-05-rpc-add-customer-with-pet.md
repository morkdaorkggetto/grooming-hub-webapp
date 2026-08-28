# Incarico GH-05-rpc — Micro-mandato: RPC `add_customer_with_pet`

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 18 agosto 2026
**Primo dei due atti ordinati** raccomandati in `docs/consegne/GH-05-gate5-staff-refactor-interruzione.md`, adottati da Luigi. Perimetro: **una sola migration** sul demo `grooming-hub-demo`; nessun file applicativo. Prod intoccabile. Niente push. Base: `db3e3c2`.

## Disegno (dalla proposta Codex, adottata)

- Funzione `public.add_customer_with_pet(...)`, **`SECURITY INVOKER`**, guard esplicita `has_tenant_any_staff_access(p_tenant_id)` come prima istruzione: se fallisce, eccezione, nessuna scrittura.
- Customer e pet inseriti **nello stesso corpo SQL** (atomicità garantita dalla funzione), ritorno di entrambi gli UUID.
- `pets.owner_user_id = auth.uid()` come ponte di retrocompatibilità (colonna NOT NULL, misura GH-05: 5 customer su 7 senza account Auth) — dichiarato in commento come valore di transizione, non identità del customer. L'autorizzazione resta tenant-aware via RLS/membership.
- Migration idempotente (`CREATE OR REPLACE`), fonte in commento («GH-05-rpc, decisione Luigi 18/8, a valle di consegna GH-05-interruzione»), `search_path` pinnato, `EXECUTE` concesso ai soli ruoli necessari (pattern advisor di GH-02-bis). Rinomina file per allineamento timestamp MCP (pattern M11-bis).
- La firma esatta (nomi/tipi parametri) la definisci tu e la dichiari nel registro: è calibrazione, non decisione di prodotto.

## Controprove obbligatorie (dalla tua proposta)

1. Sessione sonda staff: creazione customer+pet `[DEMO GH-05]` → riuscita, due UUID ritornati.
2. Sessione Mario (customer): chiamata → rifiutata.
3. Errore pet forzato (dato invalido): **0 customer orfani** misurati dopo il fallimento.
4. Tenant errato: rifiuto.
5. Pulizia dei dati `[DEMO GH-05]` dichiarata e misurata (0 righe residue).

## Consegna

Registro in `docs/consegne/`: firma dichiarata, esiti misurati delle 5 controprove, commit `fix:`/`feat:` del solo file migration, eccezioni. A consegna verificata parte GH-05-bis.
