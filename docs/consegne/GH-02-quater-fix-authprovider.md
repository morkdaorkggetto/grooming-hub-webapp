# Consegna GH-02-quater - Fix deadlock AuthProvider su hard reload

**Data:** 18 agosto 2026
**Branch:** `feat/customer-app`
**Base dichiarata del lavoro:** `3254c95`
**Ambiente delle controprove:** solo Supabase demo `grooming-hub-demo`
(`qttpinkslhenxrsbhhhg`)
**Produzione:** non interrogata e non toccata
**Push/deploy:** non eseguiti

## Esito

Il callback `onAuthStateChange` e ora sincrono e aggiorna soltanto la sessione.
Il caricamento delle membership avviene in un `useEffect` separato, dipendente
dall'id dell'utente e protetto da una guard di annullamento.

Il contratto pubblico del provider e invariato:
`session`, `user`, `loading`, `memberships`, `currentRole`, `signIn`, `signOut`.

La relazione tra sessione e membership caricata viene tracciata internamente:
durante un cambio account `loading` resta vero finche le membership non
corrispondono al nuovo user id. In questo modo il ruolo della sessione
precedente non viene esposto ai consumer durante il passaggio.

## File esaustivi

| File | Azione | Commit |
|---|---|---|
| `src/shared/auth/AuthProvider.jsx` | Modificato; callback sincrono e fetch membership separato | incluso |
| `docs/consegne/GH-02-quater-fix-authprovider.md` | Creato; questo registro | escluso dal commit applicativo |

Nessun altro file applicativo e stato modificato da GH-02-quater.

## Commit

`db3e3c23506735a994d1dd399788571cfa23c208`

Messaggio: `fix: avoid auth membership deadlock on reload`

Il commit contiene esclusivamente `src/shared/auth/AuthProvider.jsx`.

Il codice e stato iniziato sul mandato base `3254c95`. Durante l'attesa della
controprova operator e stato eseguito il micro-mandato separato GH-04, con
commit `8588bdd`; per questo il parent Git immediato del commit quater e
GH-04. Il diff quater resta comunque limitato al solo file autorizzato.

## Controprove misurate

| # | Controprova | Esito |
|---|---|---|
| 1 | Mario -> Luna -> hard reload | Superata in 404 ms; Luna e `3 visite` visibili, nessuno skeleton bloccato |
| 2a | Hard reload `/u/home` | Superata in 481 ms; Home di Mario visibile |
| 2b | Hard reload `/u/promotions` | Superata in 54 ms; titolo visibile |
| 3 | Logout e nuovo login Mario | Superata; Home con Luna e Pepe, nessun ruolo o dato obsoleto |
| 4a | Login sonda `staff` verso `/u/home` | Superata; ritorno a `/u/login`, area customer non esposta |
| 4b | Cambio sessione sonda staff -> Mario customer | Superata; ingresso immediato in `/u/home` con Luna e Pepe |

La sonda GH-04 e stata autorizzata espressamente da Luigi per la controprova
di ruolo mancante. L'account operatore reale non e stato usato o modificato.

## Verifiche tecniche

- `npm run build`: riuscito, Vite 5.4.21, 133 moduli.
- Bundle JS: 635.11 kB, gzip 162.48 kB.
- `git diff --check`: pulito.
- Console: zero errori e zero warning nuovi.
- Restano due warning preesistenti React Router sulle future flag v7.
- Restano i warning di build preesistenti su Browserslist e chunk oltre 500 kB.
- `npm run lint`: non eseguibile perche `eslint` non e installato nel progetto
  (`sh: eslint: command not found`).

## Eccezioni e fuori istruzione

- Il login della sonda nella vecchia area staff autentica correttamente ma il
  bootstrap legacy fallisce cercando la tabella assente
  `public.customer_client_links`. La sonda, il profilo e la membership sono
  corretti; il problema e in `src/apps/staff/lib/database.js`.
- Tale problema non appartiene ad `AuthProvider.jsx` e non e stato corretto in
  quater. E stato misurato e trasferito nel mandato GH-05 come Parte 0.
- Nessuna migration, policy o modifica dati e stata eseguita da quater.
- Il seed e i dati GH-04 appartengono al micro-mandato separato e non sono
  inclusi nel commit quater.
- `docs/diario-progetto.md` e gli altri documenti locali preesistenti non sono
  stati modificati o inclusi nel commit.

## Raccomandazione recepita nel mandato successivo

GH-05 deve rimuovere dal bootstrap staff la dipendenza obbligatoria da
`customer_client_links` e usare `tenant_memberships` come fonte canonica del
ruolo, senza promozioni o retrocessioni automatiche basate su tabelle legacy.
La divergenza reale della sonda (`profiles.role = operator`,
`tenant_memberships.role = staff`) deve restare una controprova esplicita.
