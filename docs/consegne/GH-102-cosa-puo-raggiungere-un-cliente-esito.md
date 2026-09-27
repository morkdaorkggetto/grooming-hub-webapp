# GH-102 — Cosa puo raggiungere un cliente

## Esito vigente dopo Emendamento 1: NO al via libera

**Non possiamo ancora invitare 320 persone con la garanzia richiesta.**
E stata dimostrata sul demo una fuga fra clienti: **Luca riceve il telefono
di Mario nel messaggio d'errore di `accept_customer_invite`**, pur non
potendolo leggere con una SELECT diretta. Non e il rilievo economico: e un
dato personale di un altro cliente. Scatta quindi l'arresto obbligatorio
previsto anche dall'Emendamento 1. Dopo la prova, solo pulizia e registro.

### Prima del lancio: priorita e prove

1. **P1, osservato: telefono altrui nell'errore di riscatto invito.**
   Precondizioni: account customer autenticato e possesso di un link valido,
   non scaduto e non ancora usato, destinato a una scheda gia collegata a un
   altro utente. Non e un'enumerazione libera di telefoni o un accesso anonimo.
   Il test simula precisamente l'inoltro di un link o l'uso con account
   cliente sbagliato. Il collegamento viene rifiutato, ma il corpo dell'errore
   contiene il telefono completo del destinatario.
2. **P1 da chiarire, possibile: riscatto con destinatario non verificato.**
   Nella definizione viva la RPC legge l'email del chiamante ma non la
   confronta con `customer_email` dell'invito; per una scheda non collegata
   procede all'adozione. La presa di possesso di una scheda non collegata da
   chi riceve un link inoltrato non e stata eseguita: la prova precedente ha
   imposto lo stop. Serve una decisione esplicita sull'identificazione del
   destinatario, non assumere che il solo login basti.
3. **P2, osservato e gia deciso da Luigi: importi/sconti accessibili al
   customer.** Restano i tre campi economici misurati nella ripresa precedente;
   correzione prima del lancio con dati economici staff-only. Nessun nuovo
   approfondimento o tentativo di riparazione in questo giro.

Il precedente problema QR e superato dal riallineamento, come documentato
sotto. La questione backup resta chiusa da Cowork: non e stata riaperta.

### Prova della fuga e causa

Base della ripresa: `129ec3aeaa2cc0e75cb67258ba20bfba25aecb54`, branch `main`.
Root `/Users/luigimaisto/Desktop/grooming-hub-web`, worktree `webapp/`.
Unico ambiente: demo `qttpinkslhenxrsbhhhg`; produzione mai interrogata.
Fonte operativa: GH-102 + `GH-102-emendamento-1.md`, letto integralmente.

Tre login API distinti: Mario, Luca e sonda staff esistenti. Le credenziali
sono lette localmente in memoria; niente password, JWT, telefoni, nomi reali
o token invito nei log/registro. La sonda crea un invito temporaneo per il
customer di Mario, usando il modello di fixture di `scripts/rls-tests/run.mjs`.

| Controprova viva | Misura | Classificazione |
|---|---|---|
| Luca SELECT phone sul customer Mario | 0 righe, nessun errore | esclusa lettura diretta per questa riga |
| Luca riscatta invito fresco per Mario | errore P0001, nessun risultato JSON di successo | riscatto rifiutato |
| Confronto in memoria error.message con telefono Mario | recipientPhoneInError = true | **osservata fuga cross-customer** |
| Confronto customer, profili e membership prima/dopo | stessa impronta SHA-256 del contenuto ordinato | nessuna modifica ai dati originali dei due account |

La stringa dell'errore ha forma `Phone [TELEFONO DESTINATARIO] gia associato
ad altro utente ...`. Il dato e restituito al chiamante dalla RPC, non letto
da Codex con privilegi amministrativi per simulare un risultato cliente.
Il confronto usa il valore del customer destinatario ed esclude che sia il
telefono di Luca; il contenuto non viene stampato.

Causa nella definizione SQL viva, riscontrabile anche in
`supabase/migrations/20260827170005_gh25_accept_customer_invite_membership.sql:97`:
`RAISE EXCEPTION 'Phone % ...', v_invitation.phone`. La funzione SECURITY
DEFINER puo leggere l'invito e il customer; il controllo di appartenenza
nega correttamente l'adozione ma incorpora un dato riservato nell'errore.
Le policy della tabella non filtrano quel messaggio.

**Soluzione minima consigliata a Cowork:** nuova correzione della RPC, senza
riscrivere la migration storica: conservare il rifiuto e l'atomicita, ma
restituire un codice stabile e un messaggio generico senza telefono, nome,
email o identificativi in message/details/hint. Non basta mascherarlo nella
UI: il corpo HTTP resta leggibile. Ripetere la prova Luca->invito Mario e
controllare l'intero errore, oltre all'assenza di mutazioni. Il rischio
residuo dell'invito inoltrato su scheda non collegata va valutato nello
stesso mandato; l'eventuale vincolo deve verificare davvero il destinatario
(canale verificato o conferimento staff), non solo un'email auto-dichiarata.
Cowork verifichi separatamente il codice in produzione: qui non e provato
che abbia lo stesso difetto. Nessuna correzione applicata da Codex.

### Controprove completate prima dello stop

| Caso | Prova | Esito |
|---|---|---|
| respond_appointment_request_slot altrui | Luca su richiesta pending di Mario | 42501, nessun dato restituito, riga intera invariata |
| withdraw_appointment_request altrui | Luca sulla stessa richiesta | 42501, nessun dato restituito, riga intera invariata |
| Invito scaduto | fixture scaduta, riscatto Luca | P0001 / GH_INVITE_EXPIRED |
| Invito gia usato, stesso account | fixture accepted_by Mario, chiamata Mario | already_accepted, customer proprio |
| Invito gia usato, altro account | stessa fixture, chiamata Luca | P0001 / GH_INVITE_ALREADY_USED |
| Sessione staff preesistente | invito fresco, chiamata sonda staff | P0001 / GH_INVITE_STAFF_ACCOUNT |
| Account customer diverso dal destinatario | invito fresco per Mario, chiamata Luca | rifiuto con fuga telefono: STOP |

Limiti: lo stato «gia usato» e stato predisposto dalla fixture, non ottenuto
con un primo riscatto riuscito; verifica il ramo idempotente ma non l'intero
doppio riscatto. La richiesta altrui non aveva alternative: il controllo
proprietario e stato esercitato prima della validazione delle alternative.
Nessuna modifica customer e stata accettata su quella richiesta.

I cinque casi invito hanno quindi copertura **parziale**, non cinque PASS:
inoltro/account gia presente provati nel caso di destinatario gia collegato;
gia usato e scaduto come sopra; sessione diversa verificata via RPC, non con
browser. Nel codice letto, `CustomerInvite.jsx:40` chiama automaticamente il
riscatto nel useEffect usando la sessione corrente: rischio di account
sbagliato **possibile**, non prova interattiva. Nessuna ulteriore chiamata di
audit dopo la fuga. Restano non percorsi whitelist completa, matrice
scritture restante, confine delle tre rotte staff e browser inviti. Non li
dichiaro sicuri e non li considero chiusi dall'arresto.

La suite intera non e stata eseguita: questo giro aggiunge controprove
mirate ai suoi pattern di fixture. Il controllo che mancava e sul **contenuto
dell'errore** di un invito fresco destinato a un customer gia collegato:
un semplice assert «il riscatto fallisce» avrebbe promosso il caso vulnerabile.

### Pulizia, file e tempi Emendamento 1

Create solo fixture temporanee: **1 pet di test per Mario, 1 richiesta,
3 inviti** (scaduto, gia usato, fresco). Cancellati nella stessa esecuzione
in finally; rilettura degli ID: **0 inviti, 0 richieste, 0 pet residui**,
nessun errore di cancellazione/verifica. Pet tenant tornati a **7**.
Customer/profili/membership originali Mario e Luca identici prima/dopo;
nessun account nuovo, password cambiata, fixture Storage o appuntamento
creato. Tre sessioni temporanee chiuse; sonde permanenti conservate.
Exit 2 della sonda significa arresto intenzionale CROSS_CUSTOMER_INVITE,
non fallimento della pulizia.

| File toccato | Destino |
|---|---|
| docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md | unico file del commit, nuovo esito in testa e storico conservato |
| /private/tmp/gh102-amendment-probe.mjs | script temporaneo senza credenziali incorporate, fuori repo e rimosso a fine giro |

Mandato, Emendamento 1, SQL di riallineamento e tre cartelle riservate fuori
stage/commit. SQL di riallineamento non letto o eseguito. Nessuna modifica a
src, migration, policy o funzioni; nessun push, merge, deploy. Nessuna
attivita fuori istruzione: la ripresa si arresta per la precisa eccezione
cross-customer dell'emendamento. Le verifiche di teardown non sono una
prosecuzione dell'audit oltre lo stop.

Tempo misurato: **176 s**, 27/9/2026 **05:15:17–05:18:13 Europe/Rome**,
dalla lettura preparatoria alle prove e al teardown; redazione/commit esclusi.
Nessun rallentamento bloccante. Build/browser non eseguiti. Diff check,
stage del solo registro e stato finale Git verificati prima della consegna;
hash definitivo in chat.

---

## Storico della ripresa precedente

## Ripresa 27/9: secondo rilievo, audit ancora incompleto

**Da decidere/correggere prima del lancio: i campi economici sono leggibili
dal cliente attraverso la Data API.** Con login reale Mario, senza passare
dalla UI, `visits.select('cost,discount_percent')` restituisce **6 righe,
6 importi positivi e 1 sconto positivo**. `services.select('price_cents')`
restituisce **2 righe, entrambe con prezzo positivo**. Nessun valore monetario
o identificativo personale e riportato qui.

**Osservato:** accesso diretto ai dati economici, contrario alla decisione
«Nessun prezzo lato customer, mai» in `design_handoff_customer_app/00-ERRATA.md`,
voce 3, e al contratto GH-09. **Non osservato:** lettura di visite o dati
personali appartenenti ad altri clienti. Non equiparo questi due rischi.
Se Luigi intendeva la decisione come solo vincolo grafico, serve dichiararlo:
la riservatezza degli importi, oggi, non e garantita dal database.

Il mandato impone l'arresto al primo buco: **nuova interruzione dopo le prove
di lettura**, nessuna riparazione. Non posso dare un via libera agli inviti:
il rilievo richiede una decisione e restano da completare scritture e inviti.

### Riallineamento e perimetro della ripresa

- Base `943de921a56256b4ed22e9fcafa85d67ddb5b892`, branch `main`.
- Root/worktree invariati; solo demo `qttpinkslhenxrsbhhhg`.
- Le sei impronte demo/prod sono **verificate da Cowork, secondo Luigi**:
  non le presento come confronto indipendente effettuato da Codex sul prod.
- **Osservato sul demo:** `get_public_pet_card` ora seleziona
  `p.owner_photo_url AS photo_url`, senza fallback salone; il campo
  `awarded_fidelity_tier` esiste. Il blocco precedente e superato.
- Il file `supabase/demo-riallineamento-2026-09-27.sql` e di Luigi/Cowork,
  gia eseguito da Luigi: non letto, modificato, rieseguito o messo in stage.
- Domanda backup **chiusa da Cowork in produzione per istruzione di Luigi**:
  nessuna ricerca o verifica specifica nella ripresa. Le misure precedenti
  rimangono sotto come storico, non come nuova attivita.
- Inventario demo: 16 tabelle tutte con RLS, 35 policy, 14 SECURITY DEFINER,
  4 funzioni eseguibili da anon, 23 da authenticated.

### Matrice di lettura viva

Richieste `select('*', {count:'exact'}).limit(1000)` con tre client separati:
Mario, Luca e anon senza sessione. Tutti i conteggi restituiti coincidono con
le righe ricevute: nessuna pagina troncata. Password caricate da `.env.local`
in memoria, nessun token o valore di riga nei log. Sonda staff esistente
usata solo per ottenere i token QR demo in memoria.

| Tabella | Mario: righe | Luca: righe | Anon | Scritture cliente/anon |
|---|---:|---:|---|---|
| appointments | 1 | 0 | 42501 | non provate |
| appointment_requests | 0 | 0 | 42501 | non provate |
| contacts | 0 | 0 | 42501 | non provate |
| customer_account_unlink_audit | 0 | 0 | 42501 | non provate |
| customer_invitations | 0 | 0 | 42501 | non provate |
| customer_staff_notes | 0 | 0 | 42501 | non provate |
| customers | 1 | 1 | 42501 | non provate |
| pet_staff_notes | 0 | 0 | 42501 | non provate |
| pets | 2 | 0 | 42501 | non provate |
| profiles | 1 | 1 | 42501 | non provate |
| promotions | 0 | 0 | 42501 | non provate |
| reward_points | 0 | 0 | 42501 | non provate |
| services | 2 | 2 | 42501 | non provate |
| tenant_memberships | 1 | 1 | 42501 | non provate |
| tenants | 1 | 1 | 42501 | non provate |
| visits | 6 | 0 | 42501 | non provate |

**Escluso nel campione letto:** righe di customers/profiles/membership con
utente diverso dal login; pet non appartenenti ai customer del login;
visite/appuntamenti/punti riferiti a pet estranei; richieste di altro utente.
Controlli effettuati sugli identificativi, senza stamparli. **Limite:** Luca
non ha pet e varie tabelle restituiscono zero righe senza fixture positive;
questi zeri non provano da soli tutti i casi negativi richiesti dal mandato.
Gli errori anon 42501 attestano il rifiuto, non distinguono da soli ACL di
tabella da permessi mancanti sulle funzioni usate nelle policy.

Le risposte includono anche colonne di servizio (`no_show_score`,
`is_blacklisted`, `tenants.settings`): visibilita osservata, classificazione
di riservatezza da chiarire, non un ulteriore buco dichiarato senza requisito.

### Quattro funzioni pubbliche

| Funzione | Prova HTTP anon | Esito |
|---|---|---|
| get_public_pet_card | 7 token esistenti | 7 successi, medesime 18 chiavi dello storico; photo uguale a owner_photo_url |
| get_public_pet_card | null, stringa vuota, token inesistente | 3 risposte null senza errore |
| get_public_salon_identity | slug demo valido | solo businessName e salonPhone |
| get_public_salon_identity | slug inesistente e null | risposta null |
| ensure_pet_qr_token | RPC senza parametri | PGRST202, nessun risultato |
| prevent_duplicate_pending_appointment_request | RPC senza parametri | PGRST202, nessun risultato |

**Escluso nel percorso HTTP provato:** invocazione diretta dei due trigger
come RPC. Non e una prova SQL con SET ROLE, ne una prova delle operazioni
INSERT che attivano quei trigger. I grant EXECUTE da soli non attestano una
RPC utilizzabile. La correzione foto e verificata sulla definizione viva e
sui dati esistenti, non con nuove fixture fotografiche.

La generazione osservata nel trigger usa `ghp_` + UUID v4 casuale senza
trattini: **122 bit casuali**, circa 5,32 x 10^36 combinazioni. Assumendo 351
token generati cosi, probabilita per tentativo casuale circa 6,60 x 10^-35.
Questo calcolo non certifica token legacy assegnati manualmente e non
protegge dalla condivisione di un QR valido. Nessun brute force eseguito.

### Causa e proposta a Cowork

`src/apps/customer/hooks/usePetVisits.js:25` omette correttamente cost e
discount_percent. GH-09 aveva verificato query e DOM, non il divieto di
lettura diretta. La policy `visits_customer_select` limita **le righe**, non
le colonne: il cliente puo cambiare la select. Lo stesso accade con
`services_customer_select_active` e `price_cents`. Non serve una service key:
la normale sessione cliente basta. La prova mirata ha richiesto proprio le
sole colonne economiche e ha ricevuto valori, non soltanto nomi di campo.

**Raccomandazione:** prima formalizzare se il requisito e di riservatezza,
come suggerisce il testo vigente. Se confermato, separare i dati economici
in relazioni staff-only con RLS, seguendo il modello gia usato per le note
interne; mantenere sulle relazioni customer solo le informazioni autorizzate.
Il nuovo mandato deve censire e adattare scritture visita, completamento
appuntamento, report/incassi e catalogo staff; deve conservare atomicita e
valori esistenti, con prove di riconciliazione prima/dopo. Nessuna migration
o bozza eseguibile e stata prodotta da questo audit.

Alternativa da valutare se la separazione risultasse troppo invasiva: negare
la lettura diretta delle colonne a `authenticated` e fornire percorsi staff
protetti. Staff e cliente condividono quel ruolo Postgres, quindi non basta
una revoca indiscriminata: rompe anche il gestionale. Una view/proiezione
customer **senza revocare il percorso alla tabella sorgente non chiude nulla**.

Controprove minime del futuro intervento: select esplicita dei tre campi
economici e select `*` negate/depurate lato cliente; incassi staff immutati;
storico e catalogo customer ancora funzionanti; RLS cross-customer e
cross-tenant; nessuna fuga via join, view o RPC. Solo dopo riprendere GH-102.

### Residui, file e tempi della ripresa

Suite RLS non eseguita: arresto sul rilievo in lettura, senza scritture.
Restano **non provati** whitelist colonna per colonna, creazione/cancellazione,
modifiche dirette, RPC su richieste altrui, cinque casi invito e rotte staff.
Le definizioni lette non sostituiscono quelle controprove. Nessuna prova
browser o build: niente modifiche applicative o rilascio.

| File toccato nella ripresa | Destino |
|---|---|
| docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md | unico file del commit; nuovo esito anteposto, storico conservato |
| /private/tmp/gh102-read.mjs | sonda locale temporanea di sola lettura, senza credenziali incorporate; fuori repo, rimossa a fine giro |

Le tre cartelle riservate e il mandato restano esclusi come nella prima
consegna; si aggiunge il SQL di riallineamento autorizzato in chat. Nessun
dato reale acquisito da quelle cartelle, nessuna interrogazione del prod.
Fixture create: **0**, residui di fixture di questo giro: **0 per assenza di
scritture applicative**. Tutte le sessioni Auth di prova sono state chiuse;
sonde permanenti preservate. Nessuna riparazione o attivita fuori istruzione.

Due tentativi iniziali non hanno prodotto prove: import del client corretto
tramite risoluzione del package e DNS bloccato nel sandbox. Il secondo
problema e stato superato con esecuzione autorizzata fuori sandbox; i login
successivi di Mario, Luca e staff sono riusciti. Non e un guasto Supabase
ne un rallentamento del Mac.

Tempo misurato dall'avvio della ripresa alla chiusura delle prove: **185 s**,
27/9/2026 **05:00:51–05:03:56 Europe/Rome**; redazione e commit esclusi.
Verifiche finali previste/eseguite prima del commit: diff check, stage del
solo registro, confronto dello stato Git. Hash definitivo comunicato in chat.

---

## Storico: prima interruzione (superata dal riallineamento)

**Prima degli inviti va risolta una divergenza di sicurezza sul demo:**
`get_public_pet_card(text)`, eseguibile senza autenticazione, contiene ancora
`COALESCE(p.owner_photo_url, p.photo_url)`. La foto tecnica del salone rimane
quindi una sorgente della scheda pubblica, contrariamente al requisito GH-77.

**Osservato:** definizione SQL viva precedente alla correzione e RPC anonima
raggiungibile. **Possibile:** divulgazione della foto tecnica quando presente
e senza ritratto owner. **Non osservato:** una foto effettivamente divulgata;
i sette pet demo hanno entrambe le colonne fotografiche vuote. Non e una
prova di violazione in produzione, che non e stata interrogata.

Mi fermo in applicazione di «Se trovi un buco, fermati e scrivilo». L'audit
completo resta da riprendere: **non ci sono prove sufficienti per autorizzare
l'invito di 320 persone**, ne per affermare che siano gia avvenute esposizioni.

## Perimetro e base

- Root: `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree `webapp/`.
- Mandato locale GH-102 di Luigi, 27/9/2026; audit, nessuna riparazione.
- Branch `main`, base `eb0b7492cd90da1beb9800e797fe9df8f8f6a3c7`.
- Unico DB interrogato: demo `qttpinkslhenxrsbhhhg`.
- Nessuna lettura o scrittura sul prod, nessun push, merge o deploy.
- Nessun account creato, nessuna password cambiata.

## Evidenze misurate

Cataloghi `pg_class`, `pg_policies`, `pg_proc`, ACL e definizioni SQL letti
tramite collegamento Supabase ripristinato. Nessuna query ai dati reali.

| Misura | Mandato/Cowork | Demo vivo |
|---|---:|---:|
| Tabelle public | 19 | 16 |
| Tabelle senza RLS | 0 | 0 |
| Policy | 45 | 35 |
| Funzioni SECURITY DEFINER | 14 | 14 |
| SECURITY DEFINER senza search_path fissato | 0 | 0 |
| Funzioni eseguibili da anon | 4 | 4 |
| Funzioni eseguibili da authenticated | 23 | 23 |

Non attribuisco automaticamente la differenza a un ambiente specifico: le
misure Cowork restano dichiarate, non verificate in produzione da Codex.

La misura `md5(pg_get_functiondef('public.get_public_pet_card(text)'::regprocedure))`
restituisce `e3bc0f5c4b98a58fc39f29c8b1a1a6b2`: la stessa impronta finale
pre-correzione documentata da GH-77. La colonna `pets.awarded_fidelity_tier`
e **assente**. Il registro GH-77 documentava infatti prove rollback-only,
non l'applicazione permanente della migration: non emerge una regressione
rispetto a quella consegna, ma un disallineamento rispetto all'assunto GH-102.

Prova HTTP con `supabase-js`: accesso della sonda staff esistente riuscito
solo per ottenere in memoria i sette token demo; client separato senza
sessione per le chiamate RPC. Credenziali caricate localmente, mai stampate.

- **Osservato:** 7/7 chiamate anonime senza errore, oggetto non nullo,
  `photo: null`, medesime 18 chiavi. Un token inesistente restituisce `null`.
- Chiavi: `id`, `qrToken`, `name`, `breed`, `photo`, `businessName`,
  `salonPhone`, `firstVisitDate`, `visitsCount`, `visits12Months`,
  `visits24Months`, `visits36Months`, `rewardPointsTotal`, `fidelityMode`,
  `fidelityTier`, `nextTier`, `remainingVisits`, `remainingPoints`.
- **Escluso, limitatamente a questa RPC e ai risultati misurati:** campi
  dedicati a nome, telefono o indirizzo del proprietario. La definizione
  ricava `salonPhone` dalle impostazioni del salone, non da `customers`.
  Questo non certifica il contenuto libero di ogni campo ne altre superfici.
- **Osservato:** 7 pet, 0 foto tecniche, 0 ritratti owner prima/dopo la prova.
  Nessuna fixture fotografica inserita; il ramo con foto non e stato
  esercitato end-to-end. Sessione temporanea della sonda chiusa.
- **Escluso sul solo demo:** esistenza delle tre relazioni di backup
  `gh78_customer_phone_backup`, `pets_breed_backup_gh70`,
  `gh95_customer_name_backup`, verificate con `to_regclass`.

## Matrice: inventario e limiti

L'attivazione RLS e misurata; **non equivale a un isolamento dimostrato**.
Per tutte le righe seguenti, letture/scritture dirette cliente e anonimo
restano **non provate**, per arresto sul rilievo QR. Non sono esiti esclusi.

| Tabella demo | RLS viva | Prova diretta cliente/anon |
|---|---|---|
| appointments | si | non eseguita |
| appointment_requests | si | non eseguita |
| contacts | si | non eseguita |
| customer_account_unlink_audit | si | non eseguita |
| customer_invitations | si | non eseguita |
| customer_staff_notes | si | non eseguita |
| customers | si | non eseguita |
| pet_staff_notes | si | non eseguita |
| pets | si | non eseguita; SELECT della sonda staff soltanto |
| profiles | si | non eseguita |
| promotions | si | non eseguita |
| reward_points | si | non eseguita |
| services | si | non eseguita |
| tenant_memberships | si | non eseguita |
| tenants | si | non eseguita |
| visits | si | non eseguita |

Le altre tre funzioni aperte sono `get_public_salon_identity`,
`ensure_pet_qr_token`, `prevent_duplicate_pending_appointment_request`:
ACL/definizioni lette, chiamate effettive non eseguite. Restano aperti la
quantificazione dei token, la whitelist colonna per colonna, le RPC su
richieste altrui, i cinque casi invito e i confini delle rotte staff.
Nessuna sessione cliente Mario/Luca esercitata in questo giro.

La suite RLS non e stata lanciata dopo il rilievo. Non riciclo i suoi PASS
storici come prova corrente. Il caso aggiuntivo necessario e **RPC anonima
con sola foto tecnica**: le prove fotografie della suite lette in
`scripts/rls-tests/run.mjs` verificano scrittura/ripristino staff e separazione
del ritratto owner, ma non attestano quel divieto sulla scheda pubblica viva.

## Soluzione consigliata a Cowork

1. Aprire un mandato circoscritto di allineamento demo. Non fare un `db push`
   indiscriminato: manca il prerequisito GH-73. Confrontare prima lo schema
   vivo con `supabase/migrations/20260908055623_gh73_awarded_fidelity_tier.sql`
   e `supabase/migrations/20260912041539_gh77_public_card_owner_portrait_only.sql`.
2. Raccomandata la sequenza revisionata GH-73 poi GH-77, dopo preflight
   dell'intera prima migration. Alternativa piu stretta: nuova correzione
   della sola sorgente foto, ma lascerebbe irrisolto il disallineamento GH-73.
   Questo registro non autorizza ne applica nessuna delle due strade.
3. Controprove vive: sola foto salone -> `photo: null`; entrambe -> ritratto
   owner; solo owner -> ritratto owner; nessuna -> `null`. Confrontare 18
   chiavi, tutti i token, firma, ACL/search_path e pulizia delle fixture.
4. Cowork verifichi separatamente la definizione in produzione, senza
   assumere che coincida col demo. La produzione resta fuori da questa
   sessione. Non usare questa differenza demo come prova di fuga dati prod.
5. Riprendere GH-102 con la matrice completa e utenze cliente reali di test,
   inclusi inviti, Storage e sessione condivisa. La correzione QR da sola
   non basta a dare il via libera agli inviti.

## File, pulizia, verifiche e tempi

| File modificato/aggiunto da Codex | Motivo | Commit |
|---|---|---|
| `docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md` | Registro unico di interruzione | solo questo file |

Commit documentale identificabile con
`git log -1 --format=%H -- docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md`.
L'hash definitivo e comunicato nella consegna in chat, evitando autoriferimenti.

Esclusioni autorizzate da Luigi: mandato GH-102 e cartelle
`controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/`. Le tre cartelle non
sono state lette ne ricercate: nessun loro dato nel registro o in evidenze.
Nessuna modifica a codice, SQL, policy, funzioni o configurazione. Nessuna
fixture creata, quindi zero fixture GH-102 da smontare. Le sonde permanenti
restano intatte. L'accesso Auth produce le normali registrazioni di sessione,
non una modifica della password o dei dati applicativi.

Build e browser non eseguiti: consegna solo documentale e nessun rilascio.
Verifiche finali: `git diff --check`, elenco stage limitato al registro e
controllo dell'albero prima/dopo commit. Nessuna attivita fuori istruzione.

Tempo misurato del segmento inventario/approfondimento fino alla decisione
di arresto: **233 s**, 27/9/2026 **04:39:27–04:43:20 Europe/Rome**.
Letture preliminari, autorizzazione precedente, redazione e commit non sono
inclusi; durata totale non rilevata. Nessun rallentamento bloccante osservato
in questo segmento.
