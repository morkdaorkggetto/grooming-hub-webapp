# Incarico GH-10 — Security hardening (D1, pre-merge prod)

**Per:** Codex (demo) + Cowork (misure prod, sola lettura) · **Da:** Luigi · **Data:** 21 agosto 2026
**Ordine:** dopo GH-09. Base da dichiarare. DB: **demo** per ogni modifica; prod solo letto da Cowork. Niente push.
**Vincolo dichiarato dal piano (13/5, confermato)**: nessun merge `feat→main` né migration prod senza questo giro chiuso.

## Fase 0 — Misura (prima di ogni fix)

- **Codex sul demo**: advisor Security e Performance via MCP, elenco completo e categorizzato (l'ultima lettura parlava di 21 avvisi security storici: funzioni legacy con `search_path` mutabile, ACL SECURITY DEFINER pregresse, policy permissive multiple).
- **Cowork sul prod**: advisor e stato equivalente, in lettura (nota: il dashboard prod il 21/8 mostrava «Advisor found no issues» — da riverificare via MCP, il pannello può mostrare solo un sottoinsieme).
- Output: tabella unica avviso → gravità → destino (`fix ora sul demo` / `fix nell'atto G6 su prod` / `accettato con motivo`). **Nessun avviso senza destino.**

## Fase 1 — Fix sul demo (una migration `security_hardening`, idempotente)

Perimetro atteso (da confermare con la Fase 0):
- `search_path` pinnato su tutte le funzioni `SECURITY DEFINER` legacy (`accept_customer_invite`, `get_public_pet_card`, `has_tenant_access`, ecc.) — pattern già usato nei trigger di maggio.
- Revisione ACL/`EXECUTE` delle funzioni esposte (pattern GH-05-rpc).
- Storage: verifica policy `client-photos` — la SELECT pubblica è ampia per disegno (QR card pubbliche): se resta, va **dichiarata come scelta** con motivo nel registro, non lasciata come avviso ignorato. `pet-avatars` già sistemata (GH-02-ter).
- Policy permissive multiple: consolidare dove meccanico, dichiarare dove no.
- Cose da NON toccare: RLS verificate dalla suite (GH-06/07-bis) se non per pinning/ACL.

## Fase 2 — Rete di sicurezza

- Suite RLS completa rieseguita post-hardening (ciclo sonda) → risultati nel registro.
- Leaked password protection e MFA: sono **toggle dashboard, gesti di Luigi** — il registro elenca dove cliccare, non li esegue.
- Bozza della **variante prod** della migration hardening (file in `supabase/docs/` o sezione del registro, non applicata): entrerà nell'atto G6.

## Controprove

1. Advisor demo post-fix: zero avvisi nuovi, tabella prima/dopo con delta spiegato riga per riga.
2. Suite RLS: tutti PASS (o FAIL motivati).
3. App customer e staff funzionanti sul demo (smoke: login Mario, login operatore, scheda pet, direttorio).
4. Build verde.

Registro in `docs/consegne/`: tabella avvisi con destino, migration, esiti, eccezioni. Interruzione motivata valida.
