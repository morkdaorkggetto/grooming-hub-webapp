# Consegna GH-25 - La porta dell'app clienti: ripresa

**Esito:** completato
**Data:** 27 agosto 2026
**Root dichiarata:** `/Users/luigimaisto/Desktop/grooming-hub-web/`
**Worktree applicativo:** `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`
**Branch:** `feat/customer-app`
**Base Git:** `a9dfd16f94cddaf874587c31ca2e21797e1f142a`
**Commit:** presente commit; hash finale riportato nella risposta di consegna per
evitare un riferimento circolare nel file committato.
**Database usato:** solo `grooming-hub-demo` (`qttpinkslhenxrsbhhhg`,
`ACTIVE_HEALTHY`, PostgreSQL `17.6.1.084`).

Produzione e progetto temporaneo non sono stati consultati. Nessun deploy e
nessun push.

## Cancello Auth

Prima di ogni modifica e stata verificata la configurazione viva del demo. Il
primo controllo ha misurato `disable_signup=true` e
`mailer_autoconfirm=false`; il giro si e fermato. Dopo il gesto esplicito di
Luigi sul pannello Auth, la ripresa ha misurato:

| Impostazione | Valore richiesto | Valore misurato |
|---|---:|---:|
| Registrazioni disabilitate | `false` | `false` |
| Autoconferma email | `true` | `true` |
| Provider email | `true` | `true` |

La decisione di prodotto del mandato e conservata: il token recapitato sul
numero WhatsApp noto al salone e la credenziale reale del collegamento. Gli
auth user senza membership sono ammessi ma non vedono dati per effetto delle
RLS e devono essere contati.

## File della consegna

| File | Stato | Funzione |
|---|---|---|
| `docs/incarichi/GH-25-porta-app-clienti-ripresa.md` | nuovo, acquisito | Mandato autorizzato da Luigi; non modificato da Codex. |
| `docs/consegne/GH-25-porta-app-clienti-ripresa.md` | nuovo | Registro esaustivo del giro. |
| `supabase/migrations/20260827170005_gh25_accept_customer_invite_membership.sql` | nuovo | Unica migration: membership atomica, guardia ruolo completa, stati token e ACL. |
| `src/shared/auth/AuthProvider.jsx` | modificato | Espone la rilettura esplicita delle membership nella sessione corrente. |
| `src/apps/customer/pages/Redeem.jsx` | riscritto | Pagina invito reale: signup/login, accettazione e stati distinti. |
| `src/apps/customer/pages/Redeem.css` | nuovo | Veste customer responsive senza stili inline o colori letterali. |
| `src/apps/staff/lib/database.js` | modificato | I nuovi inviti generano URL `/u/redeem/:token`. |
| `src/apps/staff/pages/PublicPetCard.jsx` | modificato | Dal QR, customer verso `/u/home`; visitatore verso login con ritorno alla card. |
| `src/App.jsx` | modificato | Dopo le controprove, `/` spostata a `/login` staff. |

`docs/diario-progetto.md` e `scripts/salva.sh` erano modifiche parallele
preesistenti di Cowork, esplicitamente escluse da Luigi. Non sono stati messi
in stage ne inclusi nel commit.

## Migration e contratto RPC

Applicata una sola migration, registrata una sola volta sul demo come
`20260827170005_gh25_accept_customer_invite_membership`.

`public.accept_customer_invite(text)` conserva:

- firma e JSON `jsonb`;
- `SECURITY DEFINER`;
- `search_path=pg_catalog, public, auth`;
- `EXECUTE` solo per `authenticated` e `service_role`;
- logica adottiva customer/pet e atomicita.

La funzione ora:

- blocca la riga invito con `FOR UPDATE`, impedendo due accettazioni
  concorrenti dello stesso token;
- distingue token inesistente, scaduto, usato da altri e gia accettato dallo
  stesso account;
- rifiuta sia `profiles.role=operator` sia qualsiasi membership `owner/staff`;
- inserisce la membership `customer` nella stessa transazione;
- usa il vincolo unico `(tenant_id,user_id,role)` con `ON CONFLICT DO NOTHING`;
- puo essere rieseguita senza duplicare funzione, ACL o membership.

La migration e stata rieseguita come SQL di verifica senza aggiungere una
seconda riga alla cronologia: migration GH-25 misurate `1`, membership customer
della fixture rimaste `1`.

## Controprove

| # | Controprova | Misurato | Esito |
|---:|---|---|---|
| 1 | Signup dal link valido | Sessione immediata, RPC riuscita, nessuna conferma email | PASS |
| 2 | Membership esatta | `1 customer`, totale membership utente `1`, tenant `8ad7489b-15f9-44f5-8d50-cc89506c3ac9` | PASS |
| 3 | Ruolo divergente | Sonda con profilo `customer` e membership `staff` rifiutata; invito intatto; profilo ripristinato `operator` | PASS |
| 4 | Atterraggio | `/u/home` senza reload manuale; scheda `[DEMO GH-25] Porta Pet` visibile e apribile | PASS |
| 5 | Stati token | Valido, gia collegato allo stesso account, inesistente, scaduto e usato da altro account distinti | PASS |
| 6 | QR | Customer autenticato da card pubblica a `/u/home`; visitatore vede la card e va a `/u/login?redirect=/client-card/...` | PASS |
| 7 | Radice e legacy | Solo dopo i passaggi precedenti `/` porta a `/login`; invito nuovo, QR, `/portal/login` e `/portal/invite/:token` riprovati | PASS |
| 8 | Tecnica e cleanup | Advisor, suite RLS, tre larghezze, build e zero residui | PASS con eccezioni dichiarate |

Il gesto staff reale ha creato il cliente `[DEMO GH-25] Cliente Porta`, il pet
`[DEMO GH-25] Porta Pet` e un invito che puntava a
`/u/redeem/ghi_*`. Il signup browser ha creato
`gh25.customer@test.example`; la password usa-e-getta non e stata stampata o
scritta in file.

La membership e stata riletta dall'`AuthProvider` prima dell'atterraggio.
L'interfaccia non dichiara successo se la rilettura non restituisce
effettivamente il ruolo `customer`.

## Responsive e frontend

Pagina `/u/redeem/:token` verificata a `1440`, `390` e `320` px:

- nessun overflow orizzontale;
- nessuna sovrapposizione;
- nessun bersaglio sotto `44px` alle larghezze mobili;
- nessun error overlay;
- zero `style=` nel sorgente della pagina;
- zero colori hex/rgb/hsl letterali in `Redeem.jsx` e `Redeem.css`.

Dopo lo spostamento della radice sono stati riprovati tutti gli ingressi
pubblici e legacy senza overlay.

## RLS, advisor e build

- Suite RLS demo: **26 PASS, 0 FAIL, 1 SKIP**. Lo SKIP resta il controllo staff
  fuori tenant: il demo contiene un solo tenant reale.
- Security Advisor: soli warning. Il warning sulla RPC
  `accept_customer_invite` eseguibile dagli autenticati e intenzionale e
  imposto dal contratto; la funzione autentica `auth.uid()`, valida il token,
  applica le guardie ruolo e non e eseguibile da `anon`/`PUBLIC`.
- Restano warning preesistenti su `get_public_pet_card`, helper RLS e protezione
  password compromesse. Riferimento advisor:
  `https://supabase.com/docs/guides/database/database-linter`.
- Performance Advisor: warning preesistenti su init plan RLS, policy
  permissive multiple e indici non ancora usati; nessuno introdotto dalla
  riscrittura di una funzione senza nuovi indici o policy.
- `npm run build`: PASS, `145` moduli trasformati. Warning non bloccante sul
  chunk JavaScript oltre `500 kB` e database Browserslist non aggiornato.
- `git diff --check`: PASS.
- `npm run lint`: non eseguibile perche il comando configurato richiede
  `eslint`, non installato (`eslint: command not found`). Le dipendenze non
  sono state modificate fuori mandato.
- Durante l'uscita dalla dashboard staff e comparso una volta il log
  preesistente `permission denied for table appointment_requests`: una
  richiesta asincrona della dashboard ha terminato dopo il logout. Non ha
  prodotto overlay, scritture o regressioni nel flusso GH-25; la correzione
  del teardown delle richieste staff e fuori perimetro.

## Cleanup e conteggi

Auth user senza membership:

- prima del giro: `0`;
- dopo il signup e l'accettazione: `0`;
- dopo il cleanup: `0`.

La conseguenza ammessa dalla decisione Auth non si e verificata nel percorso
valido, perche membership e invito sono stati committati atomicamente.

Stato finale demo:

- customer totali `7`;
- pet totali `7`;
- inviti GH-25 `0`;
- auth user fixture `0`;
- identities fixture `0`;
- profiles fixture `0`;
- membership fixture `0`;
- customer/pet marker GH-25 `0`;
- sonda staff GH-04 `0`.

Nessun account reale e stato modificato.

## Eccezione QR misurata

Il pet creato dal gesto `Nuovo cliente` non ha ricevuto automaticamente un
`qr_token`; il pulsante `QR Card` ha mostrato il messaggio gia previsto
"QR cliente non disponibile. Applica prima la migration dedicata". GH-25
autorizzava una sola migration, dedicata alla RPC inviti: non e stata estesa.

La controprova di instradamento e stata quindi eseguita su un QR demo reale
preesistente (`Fido`), senza modificarne dati o percorso. I QR stampati
continuano a risolvere su `/client-card/:qrToken`. La generazione automatica
del token per nuovi pet richiede un mandato dati separato.

## Fuori perimetro richiamato

Restano esplicitamente fuori da GH-25:

- conferma email e ritorno al token, disabilitati per decisione di prodotto;
- recupero password customer fino alla nuova sessione;
- login completo dopo QR senza sessione e ritorno effettivo alla card (in
  questo giro e stato verificato il redirect conservato fino al form login);
- consegna reale del link: il gestionale genera e copia, ma un operatore deve
  ancora incollarlo manualmente in WhatsApp.
