# GH-102 — Cosa puo raggiungere un cliente

## Esito vigente dopo Emendamento 2: NO, fuga attraverso Storage

**Non possiamo dare il via libera agli inviti, neppure escludendo il rischio
accettato dei link inoltrati.** **Osservato, P1:** Luca enumera il bucket
`pet-avatars` dalla radice, scopre un oggetto tecnico nel percorso del pet
di Mario e ne scarica il contenuto. **Nessun invito, QR, URL oggetto o UUID
del destinatario fornito al percorso di enumerazione.** Bastano il normale
accesso customer e la configurazione pubblica del client Supabase.

La controprova usa esclusivamente un file sintetico, con byte di prova al
posto di una foto reale. Non e stata letta o pubblicata una fotografia reale.
Il file replica il percorso staff previsto dalla suite, fuori da `/owner/`;
non e stato necessario modificare `pets.photo_url` o altre righe del pet.
Il risultato dimostra l'accessibilita degli oggetti, non quantifica le foto
reali esposte in produzione: **la produzione non e stata interrogata**.

Questo e un accesso **senza la chiave d'invito**: resta uno stop obbligatorio
anche con l'Emendamento 2. Dopo il risultato: solo teardown, verifica del
ripristino e registro. Nessuna correzione applicata. Il vecchio arresto per
invito inoltrato e superato dalla decisione di Luigi; resta sotto come storico.

### Base, ambiente e metodo

Root `/Users/luigimaisto/Desktop/grooming-hub-web`, worktree `webapp/`.
Base `c1208810c3e673412d1e004abd0d89b65319c032`, branch `main`.
Fonti: mandato locale GH-102, Emendamenti 1 e 2, convenzione consegne.
Unico database: demo `qttpinkslhenxrsbhhhg`. Nessun account nuovo, password
modificata, migrazione, policy, funzione persistente o codice applicativo
modificato. Backup non ricercati; materia economica non riesaminata.

Tre livelli distinti di prova, da non confondere:

- **API vive:** login reali delle sonde esistenti; suite RLS invariata,
  whitelist di 19 colonne, appuntamento pendente, Storage e prove precedenti.
- **SQL vivo con rollback:** ruolo `authenticated` con claims Mario, oppure
  `anon`; quattro colonne identitarie e matrice CRUD completa. Non sono nuove
  sessioni HTTP: sono controprove supplementari delle ACL/RLS e dei trigger.
  Ogni operazione della matrice viene annullata in una sottotransazione;
  tutta la fixture e poi annullata con `ROLLBACK`. Nessun DDL persistente.
- **Browser vivo:** Chromium headless isolato, app locale e Auth/Data demo;
  sessioni API inserite nel solo contesto temporaneo. Scritture intercettate
  e vietate, salvo RPC d'invito con token verificato inesistente. Nessuna
  sessione di Safari o del browser dell'utente utilizzata.

### Prima del lancio, ordine aggiornato

1. **P1, osservato: enumerazione e lettura foto altrui.** Chiudere il percorso
   Storage, non soltanto nascondere la foto nel QR o nell'interfaccia.
2. **P2, osservato e gia deciso:** separare gli importi/sconti staff-only
   (`visits.cost`, `visits.discount_percent`, `services.price_cents`). Valgono
   le misure precedenti; nessun approfondimento economico aggiunto.
3. **Misure inviti adottate da Luigi, da completare:** avviso di link personale
   nel messaggio, visibilita del collegamento per il salone e scollegamento.
   La verifica SMS resta futura; il rischio del link inoltrato e accettato,
   non viene riproposto come blocco. Demo: default misurato **3 giorni**;
   produzione **7 giorni** e dichiarazione dell'Emendamento, non prova Codex.
4. **Verifiche residue:** completare quanto elencato nei limiti dopo la chiusura
   Storage. Non trasformare l'assenza di una prova in un difetto dimostrato.

### Prova discriminante Storage

Fixture staff in `pet-avatars/<tenant>/<pet-di-Mario>/<file-sintetico>.png`,
schema di percorso gia usato dalla suite. Nessun segreto nei log o registro.

| Passo | Esito misurato |
|---|---|
| Upload sonda staff | riuscito; un solo oggetto per esecuzione |
| Listing dalla radice con client anon | **403**, nessun percorso scoperto |
| Listing dalla radice con sessione Luca | **3 chiamate list**, attraversamento di 2 cartelle, file scoperto |
| URL costruito dal percorso restituito dal listing | nessun token invito/QR necessario |
| GET di quell'URL, senza header Authorization | **HTTP 200**, SHA-256 del corpo uguale ai byte della fixture |
| Teardown staff | oggetto eliminato; rilettura percorso **0** |

Prima esecuzione: il 403 anon ha concluso la sonda e attivato il cleanup.
Seconda: distinti gli attori, osservata la fuga con Luca; exit 2 intenzionale
e arresto immediato. Complessivamente due upload sintetici successivi,
entrambi rimossi. Nessun download di oggetti estranei alla fixture.

**Causa misurata:** policy `Pet avatars public read`, `SELECT TO public`,
con sola condizione `bucket_id = 'pet-avatars'`. Non distingue tenant, pet,
proprietario o uso tecnico/pubblico. Il download pubblico resta raggiungibile
anche senza sessione una volta scoperto il percorso. Il fatto che anon non
riesca a elencare non protegge dal cliente autenticato che enumera e condivide
l'URL. Non serve tentare UUID casuali.

**Possibile, non controprovato dopo lo stop:** `client-photos` ha la policy
analoga `Public can view client photos`; la suite ha gia misurato GET pubblici
200 con URL noto, ma la scoperta autonoma customer in questo secondo bucket
non e stata eseguita. Non estendere automaticamente il risultato del primo.

### Soluzione consigliata a Cowork

Separare gli oggetti **tecnici del salone** da quelli **del proprietario
destinati alla scheda pubblica**. Raccomandazione: bucket privato per le foto
tecniche, accesso staff controllato dalla membership e URL firmati brevi;
accesso customer alle sole immagini espressamente previste per il suo pet.
Nel contenitore pubblico delle immagini QR, niente listing globale per i
customer: policy SELECT limitate al proprio pet o allo staff autorizzato.

**Togliere soltanto la policy SELECT non basta per le foto tecniche:** un
oggetto in bucket pubblico puo restare scaricabile a URL noto. La correzione
deve coprire sia enumerazione sia download, comprese le vecchie URL e la cache.
Inventariare e trasferire gli oggetti preesistenti mantenendo i riferimenti
corretti; nessuna cancellazione indiscriminata. Cowork verifica consistenza e
patrimonio in produzione, fuori dal perimetro di questo audit.

Controprove raccomandate: Luca non enumera ne scarica la foto tecnica di Mario,
anche conoscendone il percorso; anon non scarica quel file; staff autorizzato
continua a usarlo; staff di altro tenant e negato; foto owner e QR pubblico
restano funzionanti secondo il contratto; listing proprio limitato; vecchi
URL tecnici non piu pubblici; entrambi i bucket e teardown a zero. Aggiornare
la suite: oggi una prova **si aspetta HTTP 200 pubblico in entrambi i bucket**,
quindi 60 PASS non certificano la riservatezza delle foto.

### Suite e matrice tabelle

`node scripts/rls-tests/run.mjs`: **60 PASS, 0 FAIL, 0 SKIP**. Include fixture
positive di isolamento cliente/tenant, promozioni attive/inattive/future,
note interne, richieste, conferimento/scollegamento e protezione scritture
Storage. Le prove supplementari non sostituiscono quei risultati.

Inventario demo precedente confermato dalla superficie interrogata: **16**
tabelle public, tutte RLS; **35** policy public, **14** SECURITY DEFINER con
search_path, **4** funzioni anon, **23** authenticated. I numeri del prod nel
mandato non sono misure di questa sessione e non riaprono la questione backup.

Letture API Mario/Luca: conteggi sulle righe persistenti misurati nelle riprese
precedenti. Scritture: **128 prove SQL** (16 tabelle x 2 ruoli x CRUD) su
righe presenti, con rollback, integrate dalla suite e dalle API mirate.
`D` = 42501; `0` = nessuna riga modificata; `1` = operazione eseguita su riga
propria/fixture e poi annullata. U non significa che tutte le colonne siano
modificabili: vale il campo provato, con i trigger indicati.

| Tabella | SELECT API Mario/Luca | INSERT customer | UPDATE customer | DELETE customer |
|---|---:|---|---|---|
| appointments | 1 / 0, propri | 1, proprio pending | 1, note del proprio pending | 0 |
| appointment_requests | 0 / 0; fixture propria visibile | duplicato 23505; inserimento valido nella suite | 0 | 0 |
| contacts | 0 / 0 | D | 0 | 0 |
| customer_account_unlink_audit | 0 / 0 | D | D | D |
| customer_invitations | 0 / 0 | D | 0 | 0 |
| customer_staff_notes | 0 / 0 | D | 0 | 0 |
| customers | 1 / 1, propri | D | 1, first_name; campi operativi protetti nella suite | 0 |
| pet_staff_notes | 0 / 0 | D | 0 | 0 |
| pets | 2 / 0, propri | D | 1, owner_notes; whitelist sotto | 0 |
| profiles | 1 / 1, propri | 23505 su ID proprio gia esistente | 1, business_name | 0 |
| promotions | 0 / 0; solo attiva nella suite | D | 0 | 0 |
| reward_points | 0 / 0; fixture propria visibile | D | 0 | 0 |
| services | 2 / 2, attivi del tenant | D | 0 | 0 |
| tenant_memberships | 1 / 1, proprie | D | 0 anche tentando owner | 0 |
| tenants | 1 / 1, tenant di appartenenza | D | 0 | 0 |
| visits | 6 / 0, proprie | D | 0 | 0 |

Anon: SELECT/INSERT/UPDATE **42501 su tutte le 16 tabelle**; DELETE 42501
su 15, **0 righe su tenant_memberships**. Non e una cancellazione riuscita.
I casi con zero righe iniziali sono stati integrati da fixture positive della
suite o della matrice SQL; il solo vuoto iniziale non dimostrava isolamento.
L'INSERT profiles resta limitato dal duplicato: non e una prova di diniego RLS.

**Osservato fuori copertura suite:** resta aperto il percorso legacy di
INSERT/UPDATE customer su `appointments`, parallelo ad `appointment_requests`.
Un pending proprio si crea via API e le sue note si aggiornano via SQL.
Il tentativo API di spostarlo al pet di Luca, anche **senza RETURNING**, e
respinto **42501** e la riga resta propria. Non e stata provata una fuga da
questa policy. Raccomandazione di hardening: decidere la dismissione esplicita
del percorso legacy, non assumere che tutte le scritture passino dalle RPC.

### Whitelist: tutte le 23 colonne

| Colonne provate singolarmente | Metodo | Esito |
|---|---|---|
| id, tenant_id, customer_id, owner_user_id | SQL ruolo customer, fixture e rollback | tutte invariate, 1 riga elaborata per tentativo |
| name, species, breed, birth_date, sex, microchip, weight_kg, neutered, color | API sessione Mario | tutte invariate |
| photo_url, no_show_score, is_blacklisted, qr_token, created_at, awarded_fidelity_tier | API sessione Mario | tutte invariate |
| owner_notes, coat_preferences, owner_photo_url | API sessione Mario | valore richiesto applicato |
| updated_at | API sessione Mario | timestamp server cambia; valore arbitrario richiesto NON applicato |

Nessuna colonna omessa. Inserimento pet proprio via API: **42501**; DELETE
pet proprio Mario e Luca: **0 righe**, fixture ancora presente fino al teardown
staff. Quattro chiavi testate in transazione per non rendere irrintracciabile
una fixture qualora il controllo fallisse: eccezione metodologica dichiarata,
non presentata come prova HTTP.

### Funzioni, inviti e confine staff

Restano valide le prove vive gia registrate nelle riprese precedenti:

- `respond_appointment_request_slot` e `withdraw_appointment_request` di Luca
  su richiesta Mario: **42501**, nessun dato restituito, impronta riga invariata.
- Correzione telefono nell'errore di `accept_customer_invite`: impronta
  `fcfe2fc99dc56851d5e6f6d308c193fa`, nessun telefono nell'intera risposta.
- `get_public_pet_card`: 7 token demo validi, 18 chiavi; nessun nome, telefono
  o indirizzo del proprietario, solo recapito del salone. Foto owner-only.
  Token null/vuoto/inesistente: null. `get_public_salon_identity`: solo nome
  e telefono del salone; slug invalido/null: null.
- `ensure_pet_qr_token` e `prevent_duplicate_pending_appointment_request`:
  chiamate anon RPC senza argomenti **PGRST202**, non invocabili come normali
  RPC. Non e una nuova funzione esposta per leggere dati.
- Generazione QR: UUID v4, **122 bit casuali**, prefisso `ghp_` senza trattini;
  con 351 token, probabilita per tentativo circa **6,60 x 10^-35**. Stima del
  generatore, non attestazione della qualita di eventuali token legacy.

| Caso invito | Stato e prova |
|---|---|
| inoltrato a customer senza scheda | **osservato e accettato da Luigi**, adozione riuscita nelle prove precedenti |
| altro customer gia collegato | osservato 23505; verso scheda gia assegnata, errore generico senza telefono |
| scaduto | osservato GH_INVITE_EXPIRED, anche nella suite |
| gia usato | fixture marcata usata: stesso utente already_accepted; altro utente GH_INVITE_ALREADY_USED |
| vero primo riscatto seguito dal secondo sul medesimo link | **non completato**, nuovo stop Storage prima di questa controprova |
| sessione staff con invito valido | rifiuto API GH_INVITE_STAFF_ACCOUNT, prova precedente |
| sessione gia presente nel browser | osservato uso automatico della sessione corrente, come sotto |

Browser: Luca e sonda staff, sia `/u/redeem/:token` sia `/portal/invite/:token`,
invocano la RPC usando il JWT della sessione gia presente senza un nuovo login.
Token **inesistente**: HTTP 400/P0001 GH_INVITE_NOT_FOUND. Nuovo percorso: 1
chiamata; legacy: 2 chiamate nel dev server. Non e una prova browser di
adozione valida o doppio riscatto; quelle chiamate hanno deliberatamente
evitato effetti sui collegamenti. Il riscatto valido con destinatario diverso
resta dimostrato a livello API e gia accettato, non viene ripetuto.

| Rotta | Mario | Luca | Sonda staff | Anon |
|---|---|---|---|---|
| /dashboard | /u/home | /u/home | /dashboard | /login |
| /calendar | /u/home | /u/home | /calendar | /login |
| /contacts | /u/home | /u/home | /contacts | /login |

**Osservato:** 12 navigazioni vive, nessun errore JavaScript non gestito.
La porta staff e chiusa nell'interfaccia **e** nelle tabelle con ACL/RLS
misurate; non autorizza pero un via libera globale, per la fuga Storage.
`getUserProfile` adatta il ruolo dalla membership; `profiles.role` da solo
non costituisce il ruolo effettivo. Non testata in questa ripresa una modifica
arbitraria di `profiles.role`, ne tutte le combinazioni dei 23 entry point auth.

### Ripristino, limiti e file

Suite: fixture principali eliminate; rimosse puntualmente anche le **2 nuove
righe audit** dello scollegamento generate da questo giro, vincolate agli UUID
nuovi e marker della suite. Le **16 righe audit preesistenti** hanno lo stesso
insieme di ID prima/dopo. Nessuna cancellazione generale dell'audit.

Sonda extra: 2 pet e 1 appointment temporanei eliminati, customer originali
identici per impronta prima/dopo. La RPC staff di cancellazione del pending
ha restituito **23514**; la successiva cancellazione dei soli pet fixture ha
rimosso l'appointment per cascata, con rilettura a zero. Il dettaglio non viene
nascosto come se la RPC fosse riuscita. SQL identita/matrice: rollback integrale.
Storage: entrambi gli oggetti sintetici delle due esecuzioni eliminati.

Controllo finale demo: **7 pet, 90 visite, 7 customer, 8 appuntamenti,
0 richieste, 0 inviti, 0 oggetti Storage**, identici alla base del giro;
**0 pet, 0 appuntamenti e 0 oggetti Storage con marker GH-102**.
Sessioni temporanee, Chromium e Vite chiusi. Nessun dato reale nelle evidenze.

Limiti: produzione non verificata; backup chiusi da Cowork; nessun audit
esaustivo di tutte le combinazioni RPC, cache/CDN o concorrenza; vero doppio
riscatto e invito valido end-to-end nel browser ancora da completare dopo la
chiusura Storage. I test mancanti sono dichiarati, non passati per esclusione.
Il mandato resta **interrotto per la nuova fuga**, non completato con successo.

| File/artefatto toccato | Destino |
|---|---|
| docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md | unico file del commit; esito vigente anteposto, storico conservato |
| /private/tmp/gh102-extra.mjs | sonda temporanea API, eliminata |
| /private/tmp/gh102-browser.mjs | sonda temporanea browser, eliminata |
| /private/tmp/gh102-storage.mjs | sonda temporanea Storage, eliminata |
| /private/tmp/gh102-vite-cache/ | cache generata, eliminata |

Esclusi e immutati: mandato GH-102, entrambi gli emendamenti, SQL di
riallineamento e migrazione Cowork della sanificazione errore. Non eseguiti
o inclusi nel commit. Le cartelle `controlli-salone/`, `nomi-da-recuperare/`,
`qr-gadget/` non sono state lette o incluse. Nessun intervento nel diario.

Il controllo preventivo ha respinto due bozze di sonde **prima** della
creazione/esecuzione: identita pet con cleanup non garantito e invito valido
browser con ripristino incompleto. Adeguate separando identita in rollback
e usando un token inesistente nel browser. Nessun effetto delle bozze respinte.
Nessuna attivita fuori mandato; nessun push, merge, deploy o build necessaria
per la sola documentazione. Nessun rallentamento bloccante osservato.

Tempo misurato: **897 s**, 27/9/2026 **05:49:21-06:04:18 Europe/Rome**, da
inizio ripresa a verifica finale DB; redazione e commit esclusi. Verifica
`git diff --check` e controllo dello stage prima del commit; hash in chat.

---

## Storico: arresto precedente, superato dall'Emendamento 2

## Esito vigente: errore sanificato, invito inoltrato riscattabile

**NO al via libera per 320 inviti.** La fuga del telefono nell'errore e
chiusa sul demo, ma il caso precedentemente possibile e ora **osservato**:
un account customer esistente, ancora senza scheda, riscatta un invito
indirizzato a un'altra email, adotta la scheda destinataria e ne legge
telefono e pet. Il solo possesso del link conferisce il collegamento;
l'identita del destinatario non viene verificata.

Precondizione importante: serve un **link valido inoltrato/intercettato**,
non basta conoscere l'ID di un customer. Non e un accesso anonimo o
un'enumerazione libera. Tutti i dati della controprova sono fixture demo,
non clienti reali. Per questa lettura dei dati della scheda destinata a
un'altra persona si applica l'arresto dell'Emendamento 1: dopo il risultato,
solo teardown e documentazione. L'audit restante non e stato completato.

### Prima del lancio, ordine aggiornato

1. **P1, osservato:** riscatto del link da destinatario diverso su scheda non
   collegata. Stabilire e imporre la verifica del destinatario prima
   dell'adozione. Il controllo customer gia collegato non copre questo caso.
2. **P2, osservato:** protezione degli importi/sconti, gia decisa da Luigi;
   nessuna nuova prova economica in questo giro.
3. **Verifiche residue, non difetti dimostrati:** completare le prove ancora
   mancanti elencate sotto prima di certificare l'isolamento complessivo.

La fuga nell'errore e **chiusa**, non resta nell'elenco dei difetti aperti.
Le precedenti sezioni sono storico e non rappresentano l'esito corrente.

### Correzione Cowork verificata sul demo

Base `08d4fb9`, branch `main`; root e worktree invariati. DB unico
`qttpinkslhenxrsbhhhg`; nessuna lettura/scrittura del prod. Il riscontro della
produzione e una dichiarazione di Cowork trasmessa da Luigi, non una prova
indipendente di questa sessione.

Impronta MD5 viva della definizione `accept_customer_invite(text)`:
`fcfe2fc99dc56851d5e6f6d308c193fa`, coincide con il prefisso comunicato.
SHA-256: `58e25c726bede0e4b0f85be75e2ed90ab7a7da4af6e1016d1dfe81ed0257506e`.

Controprova API Luca->invito fresco per scheda Mario gia collegata:
`P0001`, detail `GH_INVITE_ASSIGNED_ELSEWHERE`, nessun risultato di successo.
Confronto del telefono con **l'intera risposta serializzata**, inclusi
message/details/hint: **assente**. Customer/profili/membership originali
invariati. Prova riuscita in entrambe le esecuzioni mirate del giro.

### Invito inoltrato: risultato discriminante

Fixture creata tramite la RPC staff `add_customer_with_pet`, come nella
suite: customer con `user_id = null`, email destinataria di Mario, telefono
sintetico e pet sintetico. Invito con la stessa email destinataria. Il
telefono e il token vengono mantenuti in memoria, mai riportati negli output.

| Chiamante e stato iniziale | Risultato API | Lettura successiva |
|---|---|---|
| Luca, gia collegato alla propria scheda | 23505, riscatto rifiutato | nessuna adozione riuscita |
| Sonda customer GH-44 esistente, senza scheda/membership | accepted | da 0 a 1 customer visibile, telefono coincidente con fixture destinataria, 1 pet leggibile |

Per la seconda riga, `callerDiffersFromInvitedEmail = true`:
email della sessione diversa da `customer_email` dell'invito e da quella
iniziale della scheda. Non e stato creato un account: e la sonda permanente
gia usata dalla suite. **Osservato:** l'adozione modifica il collegamento e
rende leggibili i dati prima invisibili. Non e la ripetizione del precedente
errore telefonico, che resta corretto.

Il caso Luca rifiutato non e una prova sufficiente di sicurezza: dipende
dall'essere gia collegato, mentre il destinatario errato ancora senza scheda
supera il percorso. Il rischio riguarda anche una sessione browser customer
sbagliata prima del primo collegamento. Quest'ultimo scenario resta una
deduzione dal codice di auto-riscatto gia letto, non una prova browser viva.

### Soluzione consigliata a Cowork

La RPC usa il token come unica prova di diritto alla scheda; legge l'email
del chiamante per salvarla, ma non verifica che sia il destinatario.
**Raccomandazione:** vincolare lato server il riscatto a una identita
destinataria verificata prima di aggiornare customer, pet e membership.
Per destinatario gia identificato, usare il suo user ID; per primo invito,
verifica di un canale del destinatario o conferimento esplicito dello staff.
Non considerare sufficiente confrontare un'email auto-dichiarata senza
verificarne il possesso. Gestire esplicitamente gli inviti senza email.

Non bastano conferma grafica dell'account, token piu lungo, scadenza piu
breve o errore generico: un chiamante diretto puo ancora usare la RPC.
Conservare atomicita, controllo staff, scadenza, idempotenza per lo stesso
destinatario e rifiuto generico per gli altri. Controprove: destinatario
verificato riesce; account diverso sia collegato sia non collegato fallisce
senza leggere o mutare dati; inoltro, doppio uso, scadenza e sessione browser
sbagliata; zero residui fixture. Nessuna soluzione implementata nell'audit.

### Ripristino, esclusioni e limiti

Due esecuzioni controllate: complessivamente **2 customer, 2 pet, 4 inviti**
temporanei. Tutti eliminati con rilettura degli ID a zero. Nell'esecuzione
che ha dimostrato l'adozione, lo scollegamento tramite RPC staff ha rimosso
la membership temporanea della sonda e prodotto **1 riga di audit**.
Quella sola riga e stata rimossa tramite SQL demo, vincolato a UUID del
customer fixture e marker esatto; rilettura finale **0 audit, 0 customer,
0 pet**. Nessuna cancellazione generale del registro scollegamenti.

Impronte in memoria: customer/profili/membership originali di Mario e Luca
identici prima/dopo; profilo/membership sonda GH-44 ripristinati esattamente.
Pet tenant tornati a **7**. Sessioni temporanee chiuse; nessun account nuovo
o password modificata, nessuna fixture Storage. Exit 2 della seconda sonda:
arresto intenzionale dopo l'adozione, teardown completato senza errori.

Restano validi i risultati delle riprese precedenti: matrice letture,
quattro RPC pubbliche, due rifiuti sulle richieste altrui, scaduto/gia usato
con i limiti dichiarati. Restano **non provati** whitelist colonna per
colonna, matrice scritture completa, vero doppio riscatto e browser inviti,
tre rotte staff. Nessuna suite completa lanciata: stop cross-customer.
Nessuna ulteriore ricerca dei backup, nessun approfondimento economico.

| File toccato | Destino |
|---|---|
| docs/consegne/GH-102-cosa-puo-raggiungere-un-cliente-esito.md | unico file del commit, esito corrente anteposto allo storico |
| /private/tmp/gh102-invite-recheck.mjs | sonda temporanea senza password incorporate; rimossa a fine giro, fuori repo |

La nuova `supabase/migrations/20260927_gh102_invite_error_without_phone.sql`
corrisponde alla correzione annunciata da Luigi: esclusa, non letta,
modificata o applicata da Codex. Restano escluse tutte le precedenti
modifiche/materiali Luigi-Cowork, comprese le tre cartelle riservate.
Nessuna modifica a src/migration/policy/funzioni, nessun push/merge/deploy.
La cancellazione puntuale della traccia di audit fixture e dichiarata sopra
come parte del ripristino, non come correzione del database.

Tempo misurato: **239 s**, 27/9/2026 **05:35:13–05:39:12 Europe/Rome**, da
inizio verifica a teardown finale; redazione e commit esclusi. Nessun
rallentamento bloccante. Build/browser non eseguiti; diff check e stage del
solo registro verificati prima del commit. Hash definitivo in chat.

---

## Storico: precedente arresto Emendamento 1

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
