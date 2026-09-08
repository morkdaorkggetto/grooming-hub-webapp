# GH-74 - La sonda resta

## Esito e perimetro

**Concluso: le sonde attese dalla suite RLS sono permanenti sul demo e la
suite completa e tornata verde.** Nessun file applicativo, migration, policy o
colonna toccati. Nessun push, merge o deploy.

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`, worktree `webapp/`,
  branch `main`.
- Base dichiarata: **`01d716a1322ececcd6e7cd9b6a13e8a28229ab5d`**;
  stato iniziale pulito.
- Unico database letto e scritto: demo `grooming-hub-demo`, ref
  `qttpinkslhenxrsbhhhg`.
- Produzione `azgehoseiojodltcttfb`: mai letta e mai scritta.
- Commit locale: ricavabile con
  `git log -1 --format=%H -- docs/consegne/GH-74-la-sonda-resta-esito.md`
  e comunicato a Luigi alla chiusura.

## Collegamento e metodo

All'inizio `supabase/.temp/project-ref` conteneva
`azgehoseiojodltcttfb`, cioe la produzione. Sono stati quindi eseguiti
**0 comandi CLI remoti**. Tutte le letture e scritture vive hanno indicato
esplicitamente il ref demo tramite il collegamento Supabase.

La verifica del changelog Supabase non ha rilevato cambiamenti pertinenti a
questo atto di dato. La documentazione Auth corrente conferma che le API admin
richiedono una chiave privilegiata lato server; il giro non ha introdotto ne
esposto una `service_role`, e ha usato l'accesso SQL privilegiato gia
autorizzato sul solo demo.

## File del commit

| File relativo a `webapp/` | Intervento |
| --- | --- |
| `scripts/rls-tests/ensure-demo-probes.sql` | Bootstrap idempotente delle tre sonde permanenti con UUID storici e password solo da impostazioni di sessione |
| `docs/consegne/README.md` | Regola permanente sulle sonde RLS demo e distinzione dalle fixture di dato |
| `docs/consegne/GH-74-la-sonda-resta-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-74/gh74-probe-measures.json` | Stato iniziale e doppia esecuzione idempotente |
| `docs/consegne/evidenze/GH-74/gh74-rls-result.json` | Esito suite e pulizia finale |

I tre teardown preesistenti restano invariati. Non e stato toccato alcun file
in `src/`. Lo script nuovo non contiene password: legge i tre valori dalle
impostazioni transazionali `gh_rls.staff_password`,
`gh_rls.gh44_password` e `gh_rls.foreign_staff_password`.

## Stato iniziale

| Identita attesa | Auth | Identity | Profile | Membership | Customer |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mario | 1 | 1 | 1 | 1 | 1 |
| Luca | 1 | 1 | 1 | 1 | 1 |
| Staff GH-04 | 0 | 0 | 0 | 0 | 0 |
| Customer GH-44 | 0 | 0 | 0 | 0 | 0 |
| Staff esterno GH-49 | 0 | 0 | 0 | 0 | 0 |

Il tenant esterno GH-49 era assente. Gli utenti Auth non `@test.example` erano
**1**. Dati demo iniziali: **7 clienti, 7 pet, 90 visite, 8 appuntamenti**.

## Idempotenza

Il bootstrap usa gli UUID fissati nei teardown:

- staff GH-04: `0b33da67-01cd-43f5-8f6b-301084c0c001`;
- customer GH-44: `0b33da67-01cd-43f5-8f6b-301084c0c044`;
- staff esterno GH-49: `0b33da67-01cd-43f5-8f6b-301084c0c049`.

| Misura | Dopo primo lancio | Dopo secondo lancio |
| --- | ---: | ---: |
| Utenti Auth sonda | 3 | 3 |
| Identita Auth | 3 | 3 |
| Profili | 3 | 3 |
| Membership | 2 | 2 |
| Customer collegati | 0 | 0 |
| Tenant esterno | 1 | 1 |
| Impronta completa | `5564046ef030b50bcee2735be781c96a` | `5564046ef030b50bcee2735be781c96a` |

L'impronta comprende le righe complete di utenti Auth, identita, profili,
membership e tenant esterno. La seconda esecuzione non ha quindi cambiato
password cifrate, timestamp o metadati. Gli utenti non-test sono rimasti **1**;
i dati applicativi sono rimasti **7/7/90/8**.

## Suite RLS e pulizia

`node scripts/rls-tests/run.mjs`: **60 PASS, 0 FAIL, 0 SKIP**, tempo reale
**39,03 s**. Sono riusciti tutti e cinque i login attesi, compresi i tre UUID
permanenti, oltre alle prove cross-tenant, Storage, inviti, richieste,
whitelist e assenze.

Dopo la suite:

- sonde permanenti: 3 Auth, 3 identita, 3 profili, 2 membership, 0 customer;
- utenti Auth non `@test.example`: **1**, invariato;
- dati demo: **7 clienti, 7 pet, 90 visite, 8 appuntamenti**, invariati;
- residui temporanei: 0 pet, 0 visite, 0 richieste, 0 promozioni,
  0 appuntamenti GH-52 e 0 oggetti Storage.

Il primo avvio locale e stato bloccato dal sandbox con `ENOTFOUND` in **0,24
s**. Il rilancio autorizzato con rete verso il solo demo ha prodotto la misura
valida sopra. Non era un difetto della suite o un rallentamento del workspace.

Verifiche repository: `git diff --check` **PASS**; entrambi i JSON di evidenza
validi; scansione del diff per password **0 corrispondenze**; `npm run build`
**PASS**, 159 moduli, Vite 1,22 s e **1,63 s reali**. Restano i soli avvisi
preesistenti su Browserslist e sul chunk oltre 500 kB.

## Regola aggiunta al canone

Testo introdotto in `docs/consegne/README.md`:

> **Sonde RLS demo permanenti:** le sonde attese dalla suite RLS restano sul
> demo e i mandati che le usano non le smontano piu; le fixture di dato dei
> singoli mandati continuano a smontarsi.

Da questo giro la suite RLS si puo eseguire quando serve e i mandati che la
richiedono non si fermano piu all'avvio.

## Tempi ed eccezioni

Il tempo totale della sessione non e stato misurato dall'avvio e non viene
ricostruito. Misure puntuali: doppio bootstrap con due fotografie SQL **19,6
s**, suite valida **39,03 s**, fotografia SQL finale **4,3 s**, build **1,63
s reali**.

Nessun account reale toccato, nessun segreto scritto nei file consegnati,
nessuna attivita fuori istruzione. Non resta alcun controllo visivo affidato a
Luigi: GH-74 non modifica il prodotto.
