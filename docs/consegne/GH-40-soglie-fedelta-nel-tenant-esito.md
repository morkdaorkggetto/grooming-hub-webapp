# Consegna GH-40 - Soglie fedelta nel tenant

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `64dfac7`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione Supabase `azgehoseiojodltcttfb`: fuori perimetro, non letta e non
  scritta.
- Nessun push, merge, deploy o nuova rotta.

## Esito

GH-40 e' completato. La scala fedelta vive in un solo oggetto
`tenants.settings.fidelity_tiers`. Il gestionale riceve le impostazioni dal
`TenantProvider`; la card pubblica le legge dal tenant del pet dentro
`get_public_pet_card(text)`. Cambiare la scala non richiede una build.

La configurazione finale del demo e':

| Livello | Visite | Finestra | Punti |
| --- | ---: | ---: | ---: |
| Bronzo | 6 | 12 mesi | 100 |
| Argento | 12 | 24 mesi | 250 |
| Oro | 36 | 36 mesi | 500 |

Le tre progressioni sono validate dal database: tutti i valori devono essere
interi positivi e strettamente crescenti. Chiavi mancanti, aggiuntive o di tipo
errato rendono l'intero oggetto non valido.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `docs/incarichi/GH-40-soglie-fedelta-nel-tenant.md` | aggiunto | Mandato ricevuto e autorizzazione del perimetro demo. |
| `src/apps/staff/lib/fidelity.js` | modificato | Rimuove le soglie statiche e costruisce i livelli da `tenant.settings.fidelity_tiers`. |
| `src/apps/staff/pages/Dashboard.jsx` | modificato | Usa la scala tenant per badge, filtro e conteggio dei clienti fidelizzati. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Passa le impostazioni tenant al calcolo fedelta della scheda staff. |
| `src/apps/staff/pages/ClientCard.jsx` | modificato | Passa la stessa scala alla card identificativa interna. |
| `src/apps/staff/pages/AddVisit.jsx` | modificato | Mantiene coerente il livello mostrato prima di registrare una visita. |
| `src/apps/staff/pages/CustomerPortal.jsx` | modificato | Propaga la scala tenant al portale storico senza duplicarne i valori. |
| `src/apps/staff/components/ClientCard.jsx` | modificato | Espone l'impostazione fedelta al componente riusabile. |
| `supabase/migrations/20260829133811_gh40_tenant_fidelity_thresholds.sql` | aggiunto | Backfill della scala, vincolo di validazione e riscrittura tenant-aware della RPC pubblica. |
| `docs/consegne/GH-40-soglie-fedelta-nel-tenant-esito.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex. I seguenti file sono
modifiche parallele di Cowork, autorizzate da Luigi e lasciate integralmente
fuori dallo stage e dal commit GH-40:

- `docs/consegne/README.md`;
- `docs/incarichi/GH-03-R1-handoff.md`;
- `docs/incarichi/GH-03-brief-claude-design.md`.

## Database demo

- Preflight: progetto `grooming-hub-demo` attivo, un tenant, 7 pet, 90 visite,
  0 reward point e nessun oggetto `fidelity_tiers`.
- Ledger remoto finale: `20260829133811`, nome
  `gh40_tenant_fidelity_thresholds`; il file locale usa la stessa versione.
- Il backfill scrive la scala solo quando la chiave non esiste, quindi una
  riesecuzione non sovrascrive una scelta successiva del salone.
- Il vincolo `tenants_fidelity_tiers_valid` usa
  `public.is_valid_fidelity_tiers(jsonb)` e ha rifiutato Argento a 5 visite
  sotto Bronzo a 6 con SQLSTATE `23514`.
- `get_public_pet_card(text)` conserva firma, owner `postgres`,
  `SECURITY DEFINER`, `search_path` fissato e permesso `EXECUTE` per `anon`,
  `authenticated` e `service_role`.
- La RPC calcola il livello migliore tra visite e punti, coerente con GH-28:
  i punti possono elevare, non declassare.
- Ricerca sulla definizione installata: nessun confronto con 100, 250 o 500 e
  nessun intervallo statico di 12 mesi; le soglie arrivano dal JSON tenant.

Il primo tentativo di applicazione e' stato annullato atomicamente dal vincolo.
La causa misurata era il validatore: `jsonb_object_length` non esiste in
PostgreSQL e l'eccezione veniva trasformata correttamente in configurazione non
valida. Il controllo e' stato sostituito con la sottrazione nativa delle chiavi
JSON; il tentativo fallito non ha lasciato schema, impostazioni o ledger.

## Controprove

### Una sola scala

- `fidelity.js`: nessun `visitsRequired`, `monthsWindow` o `pointsRequired`
  numerico scritto a mano.
- RPC installata: nessun numero soglia scritto nei confronti; legge nove valori
  da `tenant.settings.fidelity_tiers`.
- Dashboard, scheda, card interna, nuova visita e portale storico ricevono la
  stessa impostazione tenant.

### Confronto vivo staff e pubblico

Sul pet demo Pepe (`e5482b14-2525-4883-8377-bbf121da63fd`):

- 8 visite totali;
- 6 visite negli ultimi 12 mesi;
- punti premio: 0;
- gestionale: `Bronzo`;
- card pubblica anonima: `Bronzo`.

Il confronto e' stato eseguito sia sui dati letti via sessione staff sia nel
browser locale. Le due schermate mostrano lo stesso livello e non presentano
overlay Vite.

### Cambio senza build

La sola impostazione tenant e' stata portata temporaneamente alla scala
precedente 12/24/36. Con 6 visite annuali Pepe e' passato a `Base` nella RPC
pubblica senza ricostruire l'app. La scala 6/12/36 e' stata poi ripristinata e
validata; Pepe e' tornato `Bronzo`.

### Integrita e pulizia

- Visite prima: 90.
- Visite dopo: 90.
- Pet fixture GH-40 finali: 0.
- Visite fixture GH-40 finali: 0.
- Sonda staff finale: 0 utenti Auth, 0 profili, 0 membership.
- Scala finale: 6/12/36 visite, 12/24/36 mesi, 100/250/500 punti.

Non sono servite fixture visita: il demo conteneva gia un caso naturale a 6
visite annuali. La sonda GH-04 e' stata ricreata solo per login, confronto staff
e suite RLS, quindi smontata con il teardown canonico.

## Verifiche eseguite

- Test unitario del calcolo tenant: PASS; stesso pet Bronzo a 6 e Base con
  soglia Bronzo a 12.
- `npm run build`: PASS, Vite 5.4.21, 153 moduli trasformati, bundle JS
  666.66 kB (gzip 188.45 kB); warning chunk oltre 500 kB preesistente.
- `git diff --check`: PASS.
- Suite RLS demo: 30 PASS, 0 FAIL, 1 SKIP previsto per secondo tenant assente.
- Browser staff: `Livello Bronzo`, nessun overlay; screenshot locale verificato.
- Browser pubblico anonimo: `Bronzo`, nessun overlay e 0 errori console;
  screenshot locale verificato.
- `npm run lint`: non eseguibile nella base, `eslint: command not found`.
- Advisor Security: 8 warning, invariati rispetto a GH-38: 2 funzioni
  `SECURITY DEFINER` intenzionalmente anonime, 5 routine autenticate e
  protezione password trapelate disattivata.
- Advisor Performance: 110 warning preesistenti: 15 `auth_rls_initplan`,
  15 `unused_index`, 80 `multiple_permissive_policies`.

L'installazione locale di Vite era illeggibile al primo build. `npm ci` ha
ripristinato `node_modules` dal lockfile esistente senza modificare
`package.json` o `package-lock.json`; la build successiva e' verde.

## Eccezioni e fuori istruzione

- Il browser staff ha registrato due `Failed to fetch` transitori nel vecchio
  `getUserProfile` durante la navigazione. La pagina ha comunque caricato tutti
  i dati e reso Bronzo; la card pubblica non ha prodotto errori. Il problema e'
  preesistente e non e' stato corretto per non estendere GH-40.
- Il warning Advisor sulla RPC anonima e' intenzionale: la funzione deve poter
  leggere una card tramite QR senza login. Firma e ACL erano gia presenti e
  sono stati conservati.
- Nessuna policy RLS, visita, reward point, rotta o dipendenza dichiarata e'
  stata modificata.
- Il link locale della CLI Supabase era preesistente e puntava alla produzione.
  Il tentativo di riallinearlo si e' fermato per sessione CLI assente; nessun
  comando CLI dati e' stato eseguito. Tutte le letture e scritture GH-40 hanno
  usato l'integrazione Supabase con `project_id=qttpinkslhenxrsbhhhg`
  esplicito. Il link CLI resta da non usare finche non viene riallineato.
- GH-39 non e' stato assorbito: resta privo di registro e sara il mandato
  successivo secondo la regola del 29/8.
- Nessuna attivita Supabase e' stata eseguita sulla produzione.

## Domanda aperta per Luigi

Che cosa rappresentano i punti premio e chi li assegna? Le soglie punti sono
ora configurabili insieme alle visite, ma il binario resta quasi inerte finche
non e' definita la sua responsabilita operativa.

## Passo umano di Luigi

Dopo il rilascio, aprire nel gestionale la scheda del cane con piu visite e poi
la sua card pubblica. La domanda non e' solo se entrambe si aprono: verificare
che dichiarino esattamente lo stesso livello fedelta.

## Commit

Commit locale della consegna con messaggio `feat: move GH-40 fidelity scale to tenant`.
Nessun push eseguito.
