# Incarico GH-09 — Allineamento Scheda pet al prototipo del bundle

**Per:** Codex · **Da:** Luigi (via Cowork) · **Data:** 21 agosto 2026
**Ordine:** dopo la consegna di GH-08. Base = HEAD post GH-08, da dichiarare. Branch `feat/customer-app`. Nessuna migration, demo solo per verifica visiva. Niente push.

## Perché

La Scheda pet (GH-02-ter) è stata composta da Codex senza confrontarsi con il prototipo esistente `design_handoff_customer_app/reference/pet-page.jsx` (847 righe), che con `04-schermate.md §04.2` e `05-design-tokens.md` è la composizione di riferimento. Misure Cowork: 45 blocchi stile inline e 2 colori fuori palette (`#3f6658`, `#8f3f49`) non presenti nel bundle.

## Fase 1 — Confronto misurato (nel registro, prima di toccare codice)

Tabella degli scostamenti `Pet.jsx` vs prototipo+§04.2+token: gerarchia e dimensioni hero (atteso Fraunces ~56px desktop / ~40 mobile), ordine e presenza sezioni, pattern riga visita, colori, spaziature. Per ogni scostamento: `allineare` / `tenere` (con motivo) / `decisione a Luigi`.

## Fase 2 — Allineamento

- Il prototipo decide, TRANNE le eccezioni dell'errata (`design_handoff_customer_app/00-ERRATA.md`, dichiarare le voci applicate): **niente prezzi** (voce 3 — il prototipo li mostra, è datato); i 2 colori si riconducono ai token (voce 8); le funzionalità nuove (edit inline, guard, upload foto, stati) si conservano.
- **Adozione proposta, da confermare in Fase 1**: il dettaglio *operatore in riga visita* del prototipo («Bagno · Giulia») — coerente con l'accoglienza; verificare che il dato esista/derivi dallo schema `visits`, altrimenti voce `decisione a Luigi`.
- Riduzione degli stili inline dove il passaggio a componenti shared/token è meccanico; nessun refactor architetturale.

## Controprove

1. Tabella scostamenti completa con esito per riga.
2. Zero hex fuori `tokens.css` in `Pet.jsx` (grep).
3. Zero prezzi (grep, come GH-06).
4. Verifica visiva 1440/390: hero alle dimensioni da token, nessun overflow.
5. Le controprove funzionali di GH-02-ter ancora verdi (edit, guard, foto, F5).
6. Build verde, zero warning nuovi.

Registro in `docs/consegne/`, commit atomici, eccezioni e fuori-istruzione. Interruzione motivata valida.
