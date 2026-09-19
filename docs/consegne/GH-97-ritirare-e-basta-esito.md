# GH-97 - Ritirare, e basta: esito

## Esito

Mandato eseguito su `main`, base **43611195830bcd149387f1fe23c838c9ea8cabad**.
Commit previsto: `fix: keep customers in place after withdrawal (GH-97)`.
Hash risolvibile con `git log -1 --format=%H -- docs/consegne/GH-97-ritirare-e-basta-esito.md`.

Dopo il ritiro la persona resta nella Home, vede l'esito e decide se fermarsi o scegliere un'altra data. Nessun database contattato, nessuna migrazione, rotta o dipendenza; nessun push, merge o deploy.

## File del commit

| File | Motivo |
|---|---|
| `src/apps/customer/components/PendingRequest.jsx` | Esito locale e riprenotazione facoltativa senza `replace` |
| `docs/consegne/GH-97-ritirare-e-basta-esito.md` | Registro |
| `docs/consegne/evidenze/GH-97/browser-check.mjs` | Banco con fixture in memoria |
| `docs/consegne/evidenze/GH-97/browser.json` | Esiti e misure |
| `docs/consegne/evidenze/GH-97/withdrawn-stay-375.png` | Stato concluso a 375 px |
| `docs/consegne/evidenze/GH-97/ui-invariants.sha256` | Impronte superfici escluse |

Fuori da modifiche, stage e commit: mandato `GH-97`, `nomi-da-recuperare/`, `qr-gadget/` e `docs/diario-progetto.md`; quest'ultimo è una modifica parallela di Luigi/Cowork autorizzata da Luigi.

## Testi e controprove

Testi esatti:

- domanda: `Vuoi ritirare questa richiesta?`
- esito: `Richiesta ritirata. Per ora è tutto.`
- comando: `Scegli un’altra data`

Misure:

- URL prima e dopo: identico, `/u/home?case=stay`;
- cronologia: dopo il ritiro, indietro torna a `/u/promotions`, come prima;
- il comando facoltativo porta a `/u/book?petId=97979797-2222-4222-8222-979797979797`;
- richiesta aperta dopo il ritiro: non visibile; conferma visibile;
- annullamento conferma: **0 RPC**; conferma ritiro: **1 RPC**;
- richiesta già gestita: `23514 / GH96_ALREADY_RESOLVED`; testo invariato: `Il salone ha già risposto a questa richiesta. Aggiorna la pagina per vedere cosa è cambiato.`;
- viewport 375 x 812: overflow **0**, troncamenti **0**, nessun bersaglio sotto **44 px**;
- `src/apps/staff`: diff vuoto;
- altre superfici customer/staff: **67/67** impronte identiche alla base;
- `git diff --check`: verde;
- `npm run build`: **167 moduli**, Vite **1,22 s**, verde. Restano i soli avvisi preesistenti su `caniuse-lite` e chunk oltre 500 kB.

Banco browser: **3,322 s**, 0 errori pagina e 0 richieste impreviste. Suite RLS non rieseguita, come prescritto; ultima misura dichiarata: GH-96, **60 PASS** del 19/9.

## Passo Luigi

Resta la prova da telefono prevista dal mandato e la domanda: **«cosa non ti torna?»**.
