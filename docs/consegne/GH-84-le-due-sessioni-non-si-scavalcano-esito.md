# GH-84 - Le due sessioni non si scavalcano

## Esito: interruzione al cancello delle rotte condivise

Root: `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree: `webapp/`.
Base: `main`, `0415e558dc5c89c7dd24db9a0ee43dd1ec03c043`.
Mandato: versione locale non versionata di `docs/incarichi/GH-84-le-due-sessioni-non-si-scavalcano.md`.

**La separazione delle sessioni NON e' implementata.** Il mandato impone di
fermarsi se una rotta serve entrambi i ruoli: il recupero password non ha un
confine di ruolo e anche `/login` gestisce esplicitamente il login customer.
Nessuna modifica al client, alle pagine, alle rotte o all'autenticazione.
Solo letture locali; nessun accesso a demo, produzione o altri progetti.

## Causa misurata

- `src/apps/staff/StaffApp.jsx:147`: `/reset-password` monta `ResetPassword`
  senza `ProtectedRoute` o requisito di ruolo.
- `src/apps/staff/pages/ResetPassword.jsx:17`: controlla solo `getSession()`;
  a riga 59 chiama `updateUser({ password })` sulla sessione corrente, senza
  distinguere operator/customer. A righe 69-70 esce e rimanda a `/login`.
- `src/apps/staff/components/Auth/LoginForm.jsx:23`: il recupero accetta
  l'email inserita e chiama `resetPasswordForEmail` con destinazione
  `/reset-password` (righe 34-35), senza filtro di ruolo. Quindi anche un
  cliente puo' richiedere il recupero da questo form.
- **Distinzione importante:** `/u/forgot` e' ancora un placeholder; non invia
  email. Non esistono due form di recupero funzionanti: esiste un unico
  flusso generico, accessibile da `/login`, non riservato allo staff.
- `LoginForm.jsx:115`: dopo l'accesso riconosce esplicitamente un customer e
  lo manda a `/u/home`. `/login` e' quindi un ingresso staff per intento,
  ma serve gia' entrambi i ruoli per comportamento.
- La scheda pubblica usa anch'essa il ruolo: `PublicPetCard.jsx:152-166`
  distingue customer e staff per aprire la rispettiva area riservata.
  La lettura pubblica non richiede login, ma la pagina non e' neutra rispetto
  alla sessione quando si usa quel pulsante.

Sono evidenze statiche sul codice attuale, non reset password eseguiti su
account reali. Non e' stata attribuita arbitrariamente la rotta condivisa
alla chiave staff solo perche' vive in `StaffApp`.

## Mappa completa delle rotte

Ricerca eseguita:

```sh
rg -n '(<Route\b|path=)' src/App.jsx src/apps/staff/StaffApp.jsx src/apps/customer/CustomerApp.jsx
rg -n 'resetPasswordForEmail|reset-password|PASSWORD_RECOVERY|updateUser|redirectTo' src
```

**23 dichiarazioni in App + StaffApp: 3 + 20.** La colonna sessione e'
classificazione del comportamento, non assegnazione di chiavi gia' applicata.

| File | Rotta | Sessione / superficie | Motivo |
|---|---|---|---|
| App | `/` | Staff | Redirect esplicito a `/login`. |
| App | `/u/*` | Customer | Delega a CustomerApp. |
| App | `/*` | Smistamento misto | Delega a StaffApp, che comprende le eccezioni sotto. |
| StaffApp | `/login` | Staff per intento, entrambi nei fatti | Form autentica entrambi; customer va a `/u/home`. |
| StaffApp | `/reset-password` | Entrambi, BLOCCO | Recupero generico, nessun controllo di ruolo. |
| StaffApp | `/client-card/:qrToken` | Pubblica; azione riservata per entrambi | Lettura anonima, pulsante destinato al ruolo corrente. Nessuna chiave scelta qui. |
| StaffApp | `/portal/login` | Customer per intento | Form cliente; con sessione gia' presente puo' rimandare anche a `/dashboard`. |
| StaffApp | `/portal/invite/:token` | Customer | Accettazione invito e passaggio a `/portal`. |
| StaffApp | `/portal/demo` | Customer/demo pubblico | Anteprima se DEMO_MODE, altrimenti `/portal/login`. |
| StaffApp | `/portal` | Customer | ProtectedRoute con allowedRole customer. |
| StaffApp | `/dashboard` | Staff | ProtectedRoute operator. |
| StaffApp | `/requests` | Staff | ProtectedRoute operator. |
| StaffApp | `/client/:clientId` | Staff | ProtectedRoute operator. |
| StaffApp | `/add-client` | Staff | ProtectedRoute operator. |
| StaffApp | `/client/:clientId/add-visit` | Staff | ProtectedRoute operator. |
| StaffApp | `/calendar` | Staff | ProtectedRoute operator. |
| StaffApp | `/appointments/today` | Staff | ProtectedRoute operator. |
| StaffApp | `/reports/weekly` | Staff | ProtectedRoute operator. |
| StaffApp | `/contacts` | Staff | ProtectedRoute operator. |
| StaffApp | `/promotions` | Staff | ProtectedRoute operator. |
| StaffApp | `/client-card/internal/:qrToken` | Staff | ProtectedRoute operator; non confondere con QR pubblico. |
| StaffApp | `/` | Fallback dipendente dal ruolo | Default autenticato o `/login`; normalmente prevale `/` di App. |
| StaffApp | `*` | Pubblica/404, ritorno staff | Pagina 404 e ancora HTML verso `/dashboard`. |

Per completezza del ramo `/u/*`, CustomerApp dichiara altre **11 Route**:
10 con path e una di layout senza path. Tutte di superficie customer.

| Path completo | Motivo |
|---|---|
| `/u/login` | Login customer; il submit usa signIn generico del provider. |
| `/u/forgot` | Placeholder recupero, nessuna chiamata Auth. |
| `/u/redeem` | Attivazione tramite invito. |
| `/u/redeem/:token` | Attivazione tramite token. |
| Layout senza path | CustomerNav + Outlet, non e' un URL aggiuntivo. |
| `/u/` | Redirect a `/u/home`. |
| `/u/home` | Home cliente. |
| `/u/promotions` | Promozioni cliente. |
| `/u/pet/:petId` | Scheda pet cliente. |
| `/u/book` | Richiesta appuntamento cliente. |
| `/u/*` fallback | Redirect a `/u/home`. |

## Attraversamenti SPA: esistono

Ricerca estesa ai due rami e ai moduli condivisi, poi lettura dei destinatari dinamici:

```sh
rg -n '(to=|navigate\(|href=|location\.(href|assign|replace)|window\.open|redirect)' src/apps src/shared --glob '*.{jsx,js}'
rg -n 'cta_url|function getClientCardPath|const getClientCardPath|returnTo:|to:' src/shared src/apps/staff/lib src/apps/staff/pages/Contacts.jsx
```

| Punto | Attraversamento rilevato |
|---|---|
| StaffApp:48, 63-68, 133, 155, 295 | Guard e redirect autenticati scelgono `/u/home` o `/dashboard` senza reload; include `/login` e `/portal/login`. |
| LoginForm:98-128 | Customer autenticato su `/login` passa a `/u/home`; per staff `redirect` da query non e' confinato alla superficie. |
| customer/pages/Login:32,58; AuthProvider:107-109 | `redirect` da query passato a navigate senza filtro di superficie; signIn non impone ruolo customer. Puo' puntare al QR pubblico o a una rotta staff. |
| PublicPetCard:155-166 | QR pubblico verso `/u/pet/:id`, `/client-card/internal/:token` oppure `/u/login?redirect=...`; tutto con navigate. |
| ResetPassword:70,144 | Dopo recupero generico, navigate/Link a `/login`, anche per sessione customer. |
| customer/pages/Promotions:59,121 | CTA che inizia con `/` usa Link; puo' puntare fuori da `/u`. database.js:1437-1452 accetta path interni senza vincolo di superficie. Possibilita' statica, nessuna misura dei valori nel DB. |

CustomerNav usa `/u/home`, `/u/promotions`, `/u/login`. Inviti/portale legacy
restano nel ramo customer; `getClientCardPath` porta alla scheda interna staff.
WhatsApp, stampa e gli altri link esterni con apertura pagina non sono passaggi
SPA fra le due sessioni. Non e' stato corretto nessun attraversamento.

## Verifiche e limiti

| Verifica richiesta | Esito |
|---|---|
| Mappa completa e reset condiviso | Eseguita, cancello di arresto confermato. |
| Ricerca attraversamenti | Eseguita, casi riportati sopra. |
| Due storageKey nuove / confronto con default | Non implementate; client.js:28 resta createClient senza opzioni. |
| Staff-cliente-staff e simmetrica, chiavi a ogni passo | Non eseguite: richiedono la modifica bloccata. |
| QR con localStorage vuoto | Non eseguita in browser; sola lettura del percorso pubblico nel codice. |
| Vecchia sessione e logout indipendenti | Non eseguite; comportamento non modificato. |
| Pagine e codice invariati | 99 file versionati sotto src confrontati byte per byte con HEAD: 0 differenze. |
| Build e suite RLS | Non eseguite: arresto prima di qualsiasi intervento su Auth. Non si riusa un PASS storico come prova di GH-84. |
| Verifica finale Luigi | Rinviata: il difetto originale resta aperto. |

Impronta aggregata SHA-256 dei **30 file** sotto `src/apps/{staff,customer}/pages/`
(JSX e CSS, ordine `git ls-files`):
`efe46c86c6824ebf5e823ddd9abce162773b2101f51caeff8b10766a913accc5`.
Calcolo: concatenazione, per ciascun file, di `path + NUL + sha256(bytes) + LF`,
poi SHA-256 della concatenazione. Il confronto di tutti i 99 file src con
`git show HEAD:<path>` prova che anche le pagine, incluso ogni hash singolo,
sono identiche alla base. Nessun allegato browser necessario per questo arresto.

## Soluzione consigliata a Cowork, NON applicata

Serve un emendamento che decida i percorsi condivisi prima di scegliere le
chiavi. Raccomando un recupero distinto per superficie, riusando lo stesso
componente: `/reset-password` staff e un alias customer esplicito sotto `/u`.
Questo richiede autorizzare una rotta in piu' e adeguare l'ingresso recupero
customer (oggi placeholder), il redirect dell'email e il ritorno dopo reset.
File coinvolti: App/StaffApp/CustomerApp secondo la collocazione decisa,
ResetPassword, LoginForm, Forgot e il client condiviso. Va anche decisa la
compatibilita' dei vecchi link generici, non inferita dal ruolo dopo che il
client ha gia' scelto dove scrivere la sessione.

Alternativa senza nuova rotta: `/reset-password` con discriminante esplicito
di superficie nella query. Meno routing, ma link storici privi del parametro
e parametri mancanti/alterati richiedono una regola di ingresso; il parametro
non deve mai diventare una prova di autorizzazione. Preferisco percorsi distinti
perche' rendono il confine leggibile al bootstrap e nei link email.

Non basta decidere il reset: il futuro mandato deve chiarire anche il login
del ruolo opposto su `/login` e `/u/login`, il comportamento della scheda QR
aperta da staff/customer/anonimo e quali attraversamenti richiedano reload.
Non propongo di cercare automaticamente una sessione nell'altra chiave: e'
proprio l'accoppiamento da eliminare. I link QR pubblici devono restare pubblici.

Controprove successive: quelle integrali di GH-84, piu' recupero per ciascun
ruolo con l'altra sessione aperta, vecchio link recovery, accesso dal form del
ruolo opposto, ritorno QR e redirect/CTA fuori superficie. Nessuna password
reale da reimpostare per queste prove; definire fixture e autorizzazione prima.
Il solo cambio storageKey non va dichiarato sufficiente per questi flussi.

## File, commit, pulizia e tempi

| File toccato da Codex | Azione |
|---|---|
| `docs/consegne/GH-84-le-due-sessioni-non-si-scavalcano-esito.md` | Unico file creato e incluso nel commit documentale d'interruzione. |

Il commit e' quello che introduce questo registro, recuperabile senza
autocitazione circolare con `git log -1 --format=%H -- docs/consegne/GH-84-le-due-sessioni-non-si-scavalcano-esito.md`;
l'hash effettivo viene comunicato nella risposta finale.

I tre file preesistenti non versionati `docs/incarichi/GH-84-le-due-sessioni-non-si-scavalcano.md`,
`docs/incarichi/GH-85-quante-postazioni-restano.md` e
`docs/incarichi/CD-08-il-planner-accanto-alla-risposta.md` sono documenti di
Luigi, come da sua conferma esplicita: intatti ed esclusi da stage e commit.
Il primo e' stato letto come mandato; gli altri due non eseguiti.
Nessuna fixture creata, nessun dato scritto, nessun secret letto o registrato,
nessun push/merge/deploy. Nessuna attivita' fuori istruzione.

Tempi: finestra strumentata della parte finale di ricognizione e controllo
impronte, 12/9/2026 **09:29:03-09:29:30.931 UTC**, circa **28 s**;
confronto dei 99 file **1,55 s**. Non e' il tempo totale del mandato:
letture precedenti, stesura/commit e pausa per conferma dei documenti non sono
stati cronometrati integralmente e non sono ricostruiti a posteriori.
