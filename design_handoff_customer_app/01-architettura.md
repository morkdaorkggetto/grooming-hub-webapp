# 01 · Architettura

## Branch

Tutto il lavoro su `feat/customer-app`. Fork da `main`.

Merge in `main` **solo dopo**:
- approvazione migration
- Fase 1 completa (4 schermate + auth)
- RLS testate (test manuali + almeno un test automatico di isolamento tenant)
- review dell'autore sul look finale

## Struttura cartelle proposta (monorepo-ready)

Oggi è un repo singolo. Va però già organizzato **come se domani si dovesse estrarre in monorepo** (Turborepo, pnpm workspaces, o simili). Quindi tutto ciò che è *condiviso tra staff e customer* va in cartelle esplicitamente "shared".

```
grooming-hub-webapp/
├── src/
│   ├── apps/
│   │   ├── staff/                  ← app esistente, sposta qui quello che c'è
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── routes.tsx
│   │   └── customer/               ← NUOVO
│   │       ├── pages/
│   │       │   ├── Home.tsx
│   │       │   ├── Pet.tsx
│   │       │   ├── Book.tsx
│   │       │   └── Promotions.tsx
│   │       ├── components/         ← componenti specifici customer
│   │       ├── hooks/
│   │       └── routes.tsx
│   ├── shared/                     ← futuri "packages/"
│   │   ├── supabase/
│   │   │   ├── client.ts           ← singleton client Supabase
│   │   │   ├── types.ts            ← generato da `supabase gen types`
│   │   │   └── queries/            ← funzioni di query riusate da entrambe le app
│   │   ├── ui/                     ← design system: Button, Card, Input, Badge, Modal…
│   │   ├── tokens/
│   │   │   └── tokens.css
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── useSession.ts
│   │   ├── tenant/
│   │   │   ├── TenantProvider.tsx  ← risolve il tenant corrente
│   │   │   └── useTenant.ts
│   │   └── utils/
│   ├── App.tsx                     ← router di primo livello: /staff vs /u
│   └── main.tsx
└── supabase/
    ├── migrations/                 ← nuove migration fase 1
    └── seed.sql                    ← seed per dev (tenant pilota + dati fittizi customer)
```

**Regola:** se un file viene o verrà importato da più di un'app, vive in `src/shared/`. Altrimenti sta nell'app che lo usa. Il refactor dell'app staff per spostarla sotto `apps/staff/` può essere fatto in un commit dedicato all'inizio della branch — attenzione ai path relativi.

## Routing

Router di primo livello in `src/App.tsx`. Due sotto-router: staff e customer.

```
/                       → landing / redirect in base al ruolo principale dell'utente
/login                  → login condiviso (il redirect post-login dipende dal ruolo)
/logout                 → logout

# Staff (esistente, non toccare salvo path-rewrite)
/dashboard              → mantieni com'è
/clients/:id
/appointments
...

# Customer (NUOVO, prefisso /u/*)
/u                      → redirect a /u/home
/u/home                 → Dashboard
/u/pet/:petId           → Scheda pet
/u/book                 → Wizard prenotazione
/u/book/confirm/:id     → Conferma
/u/promotions           → Promozioni
```

**Redirect post-login:**
- se l'utente ha `staff_role` per il tenant corrente → `/dashboard`
- se l'utente ha solo `customer` per il tenant corrente → `/u/home`
- se ha entrambi (caso previsto, vedi `03-auth-e-rls.md`) → piccola UI di scelta contesto, o ricorda l'ultimo usato in localStorage

## Sottodominio-ready

Oggi: `/u/*` su stesso dominio. Domani: `clienti.saloneX.groominghub.com`. L'architettura deve rendere il passaggio una **questione di configurazione**, non di refactor.

**Come garantirlo:**
1. Il resolver di tenant è **un'unica funzione**: `resolveTenant(request)`.
   Oggi legge lo slug dalla URL o, in Fase 1, restituisce sempre il tenant pilota.
   Domani leggerà `request.hostname.split('.')[0]`.
2. Il routing dell'app customer non contiene mai `tenant_id` nei path (nessun `/u/:tenant/home`). Il tenant è implicito nel contesto, non nella URL.
3. Il `TenantProvider` espone `{ tenant, tenantId }` via React context. Ogni query Supabase prende `tenantId` dal context, mai da props o URL.
4. Il build non hardcoda il dominio: variabili `.env` per `VITE_STAFF_HOST`, `VITE_CUSTOMER_HOST`, usate solo per link cross-app (es. bottone "Area Staff" nella dashboard customer se applicabile).

## Stack tecnico atteso

Rispettare quello del repo staff. In assenza di informazioni contrarie:
- React 18 + TypeScript + Vite
- Tailwind (se già presente) o CSS variabili pure (come in `tokens.css` allegato)
- React Router v6+
- Supabase JS client v2
- Validazione form: **chiedere all'autore** se usare react-hook-form + zod o mantenere pattern esistente staff

## Data fetching

Pattern: **un hook custom per query**, basato sul client Supabase condiviso.
Non introdurre TanStack Query o SWR in Fase 1 senza approvazione — se il repo staff non li usa, restare coerenti. Se li usa, adottarli anche qui.

Ogni hook deve esporre: `{ data, error, loading, refetch }` come minimo.

## Error boundaries

Almeno uno a livello di app customer (`src/apps/customer/ErrorBoundary.tsx`). Fallback UI minimale ma brandizzata. Stack trace loggato in console in dev, silenzioso in prod.
