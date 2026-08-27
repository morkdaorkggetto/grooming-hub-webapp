# Consegna GH-18 - Regressione customer e ciclo visita reale

**Stato:** completato.
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
**Branch:** `feat/customer-app`
**Base di ripresa autorizzata:** `eaf3bdc50ded9b1f00bda27de2ab41a4283ef7b1`
**Database usato:** solo demo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`).
**Produzione:** non interrogata e non modificata.
**Migration, deploy e push:** non eseguiti.

## Anomalia di cronologia autorizzata

GH-18 era stato sospeso dopo la Parte 1 in attesa dell'accesso staff. Durante
la sospensione Cowork ha incluso accidentalmente nel commit `a3d3b41` sia le
correzioni GH-18 sia la sonda temporanea
`scripts/verify-gh18-local.mjs`, insieme a documenti CD-01. Luigi ha
riconosciuto l'errore e autorizzato esplicitamente la ripresa da `eaf3bdc`,
senza riscrivere la cronologia, con rimozione della sonda nel commit finale.

I file CD-01 e le modifiche a `docs/diario-progetto.md` presenti in quei due
commit sono attribuiti a Cowork, sono fuori dal perimetro GH-18 e non sono
stati modificati in questa chiusura.

Al momento della chiusura erano inoltre presenti la modifica parallela a
`scripts/salva.sh` e il nuovo file
`docs/incarichi/GH-19-calendario-fase-1.md`. Luigi li ha attribuiti a Cowork e
ha autorizzato a ignorarli: non sono stati modificati, messi in stage o
inclusi nel commit GH-18.

## Parte 1 - Regressione customer

Sessione reale customer sul demo con la fixture Mario. Ogni pagina e' stata
aperta a 1440, 390 e 320 px. La sonda ha misurato larghezza documento,
visibilita' e area effettiva dei controlli, collisioni, errori console e
proprieta' CSS calcolate; i caricamenti sono stati verificati ritardando le
sole richieste REST del demo.

| Pagina | 1440 px | 390 px | 320 px |
|---|---|---|---|
| `/u/home` | PASS | PASS | PASS |
| `/u/login` | PASS | PASS | PASS |
| `/u/promotions` | PASS | PASS | PASS |
| `/u/pet/:id` | PASS | PASS | PASS |
| `/u/book` | PASS | PASS | PASS |
| `/u/redeem/:token` | PASS | PASS | PASS |
| `/u/forgot` | PASS | PASS | PASS |

Per tutte le 21 combinazioni: overflow orizzontale `0`, sovrapposizioni
anomale `0`, target sotto 44 px `0` sotto i 640 px, errori console `0`.

### Confronto puntuale col bundle customer

| Proprieta' | Contratto / baseline | Misura finale | Scostamento |
|---|---|---|---|
| Card principali | raggi 24 px | 24 px | nessuno |
| Card auth | raggi 28 px; mobile senza elevation nel Login | 28 px; Login mobile `none` | nessuno |
| Ombra Card customer | ombra pre-GH-17 a due livelli | `0 1px 2px rgba(43,37,37,.04), 0 12px 40px -24px rgba(43,37,37,.25)` | regressione GH-17 corretta |
| Eyebrow customer | 11 px, `0.22em` | 11 px, 2.42 px calcolati | nessuno |
| Skeleton | raggio 8 px e geometria della pagina | Home 3, Promozioni 15, Pet 7, Book 4; misure coerenti | nessuno |
| Skeleton Pet hero | 88 x 88 mobile, raggio 24 px | 88 x 88, 24 px | nessuno |
| Skeleton Book | 520/310 px, raggio 20 px | 520/310 px, 20 px | nessuno |
| Badge customer | mappa, label e colori non-staff | ramo customer invariato rispetto a pre-GH-17 | nessuno; il demo non esponeva un badge vivo senza creare una richiesta fuori perimetro |
| `WarmNotice` Book | warning customer, non variante staff | reso dopo scelta della prima data, copy e stile customer conservati | nessuno |
| Colori customer | palette del bundle | nessun valore colore modificato dai fix GH-18 | nessuno |

Oltre alla regressione dell'ombra, la misura ha rilevato target mobili
preesistenti da 16-38 px. Poiche' GH-18 richiede esplicitamente almeno 44 px,
sono stati corretti senza cambiare copy, colore o flusso: link Login/Forgot/
Redeem, ritorno/foto/azioni Pet e chip Book. I wrapper Home che contengono un
controllo gia' alto 44 px sono stati misurati sull'area cliccabile effettiva,
non sul solo box inline del link.

## Parte 2 - Ciclo visita reale

L'account `demo@groominghub.it` non accettava la password della variabile
`GH_RLS_STAFF_PASSWORD`: nessun reset e' stato eseguito. Come indicato da
`supabase/docs/rls-tests.md`, la variabile appartiene alla fixture GH-04.
Poiche' GH-06 l'aveva smontata, e' stato riapplicato sul solo demo il seed
idempotente gia' versionato `supabase/seeds/gh-04-staff-probe-demo.sql`.
La sonda e' stata eliminata al termine con la guardia GH-06 esistente.

Pet usato: Luna (`4dd2ce7a-298c-44cc-8a16-206e401fbfc0`).
Data: 27 agosto 2026.

| Checkpoint | Totale visite Luna | Righe `[DEMO][GH-18]` |
|---|---:|---:|
| Baseline | 3 | 0 |
| Salvataggio dal modal della Scheda | 4 | 1 |
| Salvataggio dalla rotta diretta | 5 | 2 |
| Dopo cancellazione UI di entrambe | 3 | 0 |

La prima riga aveva trattamento `[DEMO][GH-18] modal scheda`, problematiche
valorizzate e costo 18,18 euro. La seconda aveva trattamento
`[DEMO][GH-18] rotta diretta`, problematiche valorizzate e costo 19,18 euro.
Le letture RLS staff hanno verificato per entrambe lo stesso contratto:
`date` presente, `treatments` e `issues` stringa, `cost` numerico.

Entrambe le cancellazioni sono state eseguite dal pulsante reale `Elimina
visita` nella Scheda. La pulizia API di emergenza era predisposta ma non e'
stata usata. Errori console nel ciclo: `0`.

### Teardown e zero residui

Dopo il ciclo e' stato eseguito
`scripts/rls-tests/teardown-staff-probe.sql`, con guardia email + UUID.

| Controllo finale | Righe |
|---|---:|
| `auth.users` sonda | 0 |
| `auth.identities` sonda | 0 |
| `public.profiles` sonda | 0 |
| `public.tenant_memberships` sonda | 0 |
| `public.customers` sonda | 0 |
| `public.visits` con marker GH-18 | 0 |

Il login della sonda dopo il teardown restituisce nuovamente HTTP `400`.
Nessun account operatore o customer e' stato modificato.

## File della consegna

Le correzioni applicative, incluse per errore nel commit Cowork `a3d3b41`,
sono elencate per rendere il registro equivalente alla misura reale.

| File | Tipo | Motivo GH-18 |
|---|---|---|
| `src/shared/ui/Card.jsx` | modificato in `a3d3b41` | ripristino ombra customer; variante staff invariata |
| `src/apps/customer/pages/Login.jsx` | modificato in `a3d3b41` | target link mobili 44 px |
| `src/apps/customer/pages/Pet.css` | modificato in `a3d3b41` | ritorno, foto e azioni mobili 44 px |
| `src/apps/customer/pages/Book.css` | modificato in `a3d3b41` | chip selezione 44 px |
| `src/apps/customer/pages/Redeem.jsx` | modificato in `a3d3b41` | link accesso 44 px |
| `src/apps/customer/pages/Forgot.jsx` | modificato in `a3d3b41` | brand link e ritorno 44 px |
| `scripts/verify-gh18-local.mjs` | aggiunto per errore in `a3d3b41`, rimosso | sonda usa-e-getta non destinata al repository |
| `docs/consegne/GH-18-regressione-customer-e-visita-reale.md` | nuovo | registro unico GH-18 |

Nessuna query, mutazione applicativa, route, migration o dipendenza e' stata
modificata.

## Verifiche finali

- matrice customer 7 pagine x 3 larghezze: 21 PASS;
- caricamenti reali e skeleton: PASS;
- `WarmNotice` attivato senza submit di richieste appuntamento: PASS;
- login staff via sonda idempotente: PASS;
- visita modal, lettura storico e cardinalita': PASS;
- visita rotta diretta e stesso contratto dati: PASS;
- cancellazione UI e cardinalita' ripristinata: PASS;
- zero residui visita e sonda: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

## Eccezioni e fuori-istruzione

Per individuare il demo attraverso il connettore e' stato richiesto l'elenco
dei progetti: la risposta ha esposto anche il solo metadato nome/stato del
progetto temporaneo. Non e' stata eseguita alcuna query, lettura di tabelle o
scrittura sul temporaneo. Produzione non era presente nell'elenco e non e'
stata toccata.

Il primo tentativo su `demo@groominghub.it` e quello sulla sonda ancora
smontata hanno restituito HTTP `400`; sono avvenuti prima di ogni scrittura e
non hanno modificato account. Nessun secret, password o token e' stato
stampato, scritto nel registro o committato.
