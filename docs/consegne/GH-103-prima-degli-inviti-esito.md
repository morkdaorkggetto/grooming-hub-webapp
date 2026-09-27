# GH-103 - Prima degli inviti: consegna della ripresa

## Ordine degli atti rispetto al deploy

**Implementazione e prove demo completate. Produzione NON eseguita.**
Non lanciare `salva.sh`/push prima dell'atto A: pubblicherebbe codice che richiede le nuove relazioni.
Mai `supabase db push`: eseguire solo i file nominati, singolarmente.

| Ordine | Atto | Condizione e verifica immediata |
|---|---|---|
| 0 | Cowork conserva definizioni, policy e misura economica corrente; riconfronta le impronte | La misura prod fornita coincideva con il demo in tutte le **37 righe**, prima delle modifiche. Non riusare conteggi storici mentre il salone lavora. |
| A, prima del deploy | `supabase/migrations/20260927051419_gh103_finance_expand.sql` | Solo aggiunte, copia con controllo riga per riga, bridge bidirezionale. Query A sotto: entrambe le divergenze **0**. Vecchio e nuovo salvataggio devono funzionare. |
| Deploy Luigi | Commit contenente questo registro | Firme batch, relazioni economiche, redirect, inviti/errori. Verificare foto e salvataggio, poi **ricaricare tutte le schede staff**, anche sugli altri dispositivi. |
| B, dopo deploy | `supabase/migrations/20260927052224_gh103_finance_contract.sql` | SOLO con tutti i client staff aggiornati; se non sono censibili, restare ad A. Query B: vecchie colonne **0**, importi senza relazione **0**, somme invariate rispetto alla misura immediatamente precedente. |
| C1, dopo verifica firme | **Storage API**: `supabaseAdmin.storage.updateBucket('client-photos', { public: false })` | Deve essere il passaggio **public -> private tramite API**, non soltanto SQL. Prima acquisire un vecchio URL pubblico funzionante, poi sondare LO STESSO URL senza querystring. Misura demo: ultimo 200 a 5,262 s, primo 400 a 10,517 s. Nessuna riapertura pubblica come tentativo di recupero. |
| C2, subito dopo C1 | `supabase/migrations/20260927052231_gh103_recognition_private.sql` | Restringe anche la firma al salone competente. Query C: `client-photos=false`, `pet-avatars=true`; verificare staff, cliente, anonimo e staff estraneo sul vecchio URL e sulla firma. |
| D, dopo deploy e prova wizard | `supabase/migrations/20260927052237_gh103_appointments_request_door_closed.sql` | Query D: due policy legacy assenti. Inserimento/modifica diretti cliente negati; richiesta vera accettata dal salone ancora convertita in appuntamento. |

**C1 e indispensabile:** il solo SQL ha lasciato il vecchio URL in CDN (`HIT`, HTTP 200) all'ultimo campione di **166,907 secondi**, in una finestra di osservazione di 180 s. Non e stata misurata la sua scadenza spontanea. Il successivo esperimento via API ha invece chiuso lo stesso URL entro 10,517 s. Non sono un limite massimo globale ne una promessa per la produzione: Cowork deve ripetere la misura. Se C1 fallisce, un vecchio URL resta 200, oppure il bucket era gia privato senza invalidazione verificata, **fermare il rilascio degli inviti**, non alternare public/private in produzione.

L'istanza `supabaseAdmin` dell'atto C1 deve usare una credenziale server del solo progetto corretto, mai una variabile VITE o codice browser. Lo script `gh103-cache-probe.mjs` e una **prova solo demo vuoto**, NON uno script di rilascio produzione. Ha recuperato la chiave tramite CLI nominando soltanto il ref demo, usandola in memoria, senza salvarla in evidenze.

Fonti della scelta: [test ufficiale Storage sul cambio public/private](https://github.com/supabase/storage/blob/master/src/test/bucket.test.ts), [invalidazione CDN e limiti della cache browser](https://supabase.com/docs/guides/storage/cdn/purge-cdn-cache). La cache gia nel browser o un file gia scaricato non sono revocabili. Gli URL firmati sono chiavi al portatore per **120 s**, rinnovate nell'app ogni 90 s: nel passo finale Luigi deve provare in anonimo il **vecchio URL pubblico salvato**, non copiare il nuovo URL firmato dal DOM aspettandosi un rifiuto immediato.

### Query post-atto

A: attese due righe con `divergenze=0`. La migrazione effettua lo stesso controllo sotto lock nella transazione; la SELECT esterna da sola non sostituisce quel controllo.

```sql
select 'visits' as oggetto,count(*) as divergenze
from public.visits v full join public.visit_financials f on f.visit_id=v.id
where v.id is null or f.visit_id is null or v.cost is distinct from f.cost
   or v.discount_percent is distinct from f.discount_percent
union all
select 'services',count(*) from public.services s
full join public.service_financials f on f.service_id=s.id
where s.id is null or f.service_id is null or s.price_cents is distinct from f.price_cents;
```

B: attesi `colonne_legacy=0`, `visite_senza_importo=0`, `servizi_senza_prezzo=0`.

```sql
select
 (select count(*) from information_schema.columns where table_schema='public'
  and ((table_name='visits' and column_name in ('cost','discount_percent'))
   or (table_name='services' and column_name='price_cents'))) as colonne_legacy,
 (select count(*) from public.visits v left join public.visit_financials f on f.visit_id=v.id
  where f.visit_id is null) as visite_senza_importo,
 (select count(*) from public.services s left join public.service_financials f on f.service_id=s.id
  where f.service_id is null) as servizi_senza_prezzo;
select count(*),sum(cost),sum(discount_percent),
 sum(round(cost*(1-coalesce(discount_percent,0)/100),2)) as netto
from public.visit_financials;
select count(*),sum(price_cents) from public.service_financials;
```

Confrontare le somme con una misura delle colonne originali fatta prima di B, tenendo conto delle eventuali scritture concorrenti. B ricontrolla **ogni valore** sotto lock, prima di togliere le colonne. I numeri del demo non sono attese di produzione.

C e D:

```sql
select id,public from storage.buckets where id in ('client-photos','pet-avatars');
-- false / true rispettivamente
select roles,qual from pg_policies where schemaname='storage'
 and tablename='objects' and policyname='Client photos staff select';
-- authenticated; predicato su proprio prefisso staff oppure pet del proprio tenant
select count(*) from pg_policies where schemaname='public' and tablename='appointments'
 and policyname in ('appointments_customer_request_insert','appointments_customer_request_update');
-- 0 dopo D
```

Una SELECT amministrativa non dimostra RLS: affiancare le controprove con sessioni effettive. Per il vecchio URL usare una richiesta HTTP senza header di autorizzazione e senza cache-buster; il risultato atteso e non-2xx. Un `public=false` nel catalogo non basta.

### Fallimenti e ritorno indietro

- A/B/C2/D contengono `BEGIN/COMMIT`: un errore SQL annulla l'intero atto; non proseguire con quello dopo. I file non sono da rieseguire alla cieca dopo successo.
- Se A riesce ma il deploy fallisce, lasciare A: vecchia app e colonne restano operative, bridge mantiene entrambe le copie. Non eliminare le relazioni mentre il codice nuovo puo usarle.
- Se B e gia riuscito, **non ridistribuire direttamente la vecchia app**. In finestra concordata: lock su quattro tabelle; ricreare `visits.cost numeric(10,2)`, `discount_percent numeric(5,2) DEFAULT 0`, `services.price_cents integer`; copiare dalle relazioni economiche con join sugli ID; ripristinare NOT NULL su costo/prezzo e CHECK prezzo >=0; ricreare funzione bridge e quattro trigger prendendo i relativi blocchi da A; verificare query A=0; solo dopo riaprire il vecchio client. Non rieseguire tutto A su tabelle esistenti. Questa procedura inversa e documentata, **non collaudata nel presente giro**; nessuna cancellazione delle relazioni economiche.
- C1 e un atto API separato, non parte della transazione SQL. Se C2 fallisce dopo C1 il bucket resta privato: mantenere nuovo frontend, correggere firma/policy, non riaprire foto pubbliche. Un rollback alla visibilita pubblica ripristinerebbe la fuga e richiede una nuova decisione di Luigi.
- Se D fallisce resta il wizard, correggere e ripetere l'atto fallito. Non riaprire /portal ne le due policy come ripiego. Le definizioni originali vanno conservate da Cowork prima del rilascio per un eventuale rollback esplicitamente autorizzato.

## Esito, base e scelte

Root `/Users/luigimaisto/Desktop/grooming-hub-web`, worktree `webapp/`, branch `main`.
Base della ripresa **`6c8daa5d8964c6df0b8eb6270c8f4e28746593ad`**.
Confronto iniziale ripetuto subito prima di A: **37/37**, zero divergenze, stessa query del documento Cowork; evidenza `evidenze/GH-103/preflight.json`. Produzione mai interrogata. Le impronte della precedente interruzione sotto usavano una serializzazione diversa: non confrontarle con quelle del nuovo preflight.

Quattro migrazioni applicate **solo al demo**; nomi locali riallineati alle versioni assegnate dal servizio, come da README. C e stata applicata inizialmente solo SQL: il difetto CDN trovato ha portato alla controprova API e alla correzione dell'ordine di consegna. Al file C sono stati aggiunti solo commenti operativi, non altro DDL.

Ricontrollo finale con la query originale: solo **7 differenze previste** (bucket client-photos, colonne visits/services, complete_appointment_with_visit, due policy rimosse e Client photos staff select). Tutte le altre impronte originarie restano uguali.

Scelte: dati economici in relazioni RLS con FK cascade; bridge temporaneo bidirezionale transazionale; nuovo `create_staff_visit` SECURITY INVOKER, completamento appuntamento atomico conserva firma e guard; adapter mantiene i campi attesi dai componenti. Filtro **Account collegati** nella rubrica esistente, ordinato per invito accettato piu recente compatibile con account/pet correnti; data assente dichiarata, non inventata. Nessuna pagina nuova.

## Controprove e pulizia

| Prova | Misura/esito |
|---|---|
| Suite RLS aggiornata, demo | **62 PASS, 0 FAIL, 0 SKIP**, esecuzione completa. Include richieste vere -> appuntamento, cliente non scrive direttamente appointments, whitelist pet, Storage e relazioni economiche. |
| Economici espliciti e `*` | Colonne eliminate: richiesta esplicita negata; `*` non contiene valori economici. Relazioni private vuote per Mario/Luca/staff estraneo; nessun privilegio anon concesso; scrittura cliente/RPC negata. Staff legge/scrive. |
| Vecchia app su A | Modulo database letto da `git show 6c8daa5`, non riscritto a mano: salva **12,34**, relazione nuova riceve **12,34**. Nuovo codice su A salva **23,45**, colonna legacy riceve **23,45**. |
| Nuova app dopo B | Salva **34,56** tramite RPC; letture scheda, calendario, report funzionano. |
| Catalogo e completamento | Catalogo letto dall'adapter: **7500 centesimi**. Completamento con costo zero: 22023, nessuna visita e appuntamento ancora scheduled. Con **7,89**: visita/importo e completed; seconda chiamata con 99 restituisce stesso ID e conserva **7,89**. |
| Conti prima/dopo e dopo teardown | **90 visite**, lordo **3984,00**, somma percentuali sconto **10,00**, netto **3981,80**; **2 servizi**, somma prezzi **7500 centesimi**. Copia e pre-contract confrontati riga per riga sotto lock. |
| Settimana 21-27/9 browser | Fixture 12,34 + 23,45 = **35,79**, delta API **3579 centesimi**. Pagina mostra **36 euro prima e dopo** per l'arrotondamento preesistente del riepilogo; nessuna modifica a quel formato. |
| Riconoscimento staff | Immagine firmata caricata (`naturalWidth>0`) in scheda, elenco dashboard, dettaglio nel calendario. Dashboard: **una richiesta batch con 2 percorsi distinti**. Upload/sostituzione/rimozione verificati dalla suite. |
| Riconoscimento non staff | Nuovi URL pubblici negati; firma negata ad anonimo, Mario, Luca e staff estraneo. Vecchio URL gia in cache: problema SQL misurato e prova correttiva API descritti sopra. |
| `pet-avatars` | Bucket/policy invariati. Fixture file di ritratto owner, visita e promozione: **HTTP 200 pubblico per tutti e tre**; upload owner con Mario, altri con staff. Non e una prova di tre nuove schermate promozione. |
| Collegamento odierno | Invito accettato sintetico per Mario/pet fixture, senza ricollegare account: email demo, pet e data odierna visibili. Rubrica -> scheda -> pulsante Scollega raggiunto, non premuto sugli account permanenti. Lo scollegamento effettivo e coperto dalla suite con fixture. |
| Errori browser | Tre risposte HTTP sostituite: `GH_INVITE_ASSIGNED_ELSEWHERE`, `GH_UNKNOWN`, `GH_INVITE_EXPIRED`; messaggio grezzo sentinella sempre assente dal DOM. Inoltre errore **reale RPC**: Luca apre invito con telefono di Mario -> vista assegnato altrove, nessun telefono mostrato. |
| Test mapper errori | `node --test scripts/gh103-errors.test.mjs`: **4 PASS**, zero fallimenti. |
| Vecchi link | Mario `/portal` -> `/u/home`; anonimo `/portal/login` -> `/u/login`; `/portal/invite/gh103-link-test` -> `/u/redeem/gh103-link-test`; `/u/book` raggiunge scelta pet. |
| 375 / 1365 px | Rubrica: niente overflow orizzontale; nuovo filtro **143,27 x 44 px** in entrambe le larghezze. Screenshot verificati; email/data visibili, nessun troncamento dei nuovi dati. Placeholder ricerca preesistente abbreviato a 375 px, non modificato. |
| Build / diff | `npm run build`: PASS, 169 moduli, ultima build **1,54 s**. Warning preesistenti Browserslist e chunk >500 kB. `git diff --check`: PASS. |
| Advisor sicurezza demo | 3 categorie WARN: 2 funzioni anon definer, 10 authenticated definer preesistenti, password compromesse non protetta. Nessun nuovo oggetto GH-103 segnalato. Nessuna modifica Auth fuori mandato. |

[Advisor funzioni anon](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [funzioni authenticated](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [protezione password](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

**Ripristino dati misurato:** customers 7, pets 7, visits 90, services 2, profiles 6, memberships 5, appointments 8, requests 0, invitations 0, audit unlink 16, Storage objects **0**. Nuove relazioni attese 90/2. Marker GH-103 in pet/visite/appuntamenti/inviti **0**. Ogni esecuzione della suite aveva aggiunto due righe di audit: eliminate solo quelle nuove rispetto ai 16 ID iniziali e appartenenti alle fixture, quattro in totale nelle due esecuzioni. Account/password invariati; sonde permanenti conservate. Le migrazioni restano applicate, il ripristino a zero riguarda le fixture, non lo schema. Controllo finale dati e somme: **07:50 CEST**, dopo l'ultima prova browser.

Limiti: prove browser Chromium automatizzate, non Safari nativo; produzione e verifica umana finale affidate a Luigi/Cowork. Durante la costruzione del test corretti selettori e attesa incasso arrotondato; un primo invito-prova usava un telefono nuovo e non raggiungeva il ramo desiderato, poi sostituito col telefono del cliente demo. Nessun residuo lasciato. `browser.json` e `browser-final.json` conservano le prove iniziali, inclusa la mancata chiusura cache SQL; `browser-ui.json` e `cache-api.json` sono gli esiti correttivi finali. Non presentarli tutti come esecuzioni verdi dello stesso scenario.

## Censimenti richiesti

Ricerca economica `rg -n 'cost|discount_percent|price_cents' src`: **7 JS/JSX + 1 CSS**. `database.js` cambia query/scrittura e adatta le relazioni; `ClientDetail.jsx`, `AddVisit.jsx`, `WeeklyRevenue.jsx`, `VisitForm.jsx`, `VisitCard.jsx`, `StaffKit.jsx` mantengono il contratto in memoria; il CSS e solo la classe del campo costo. Nessuna query economica customer residua.

Ricerca errori: `rg -n 'error\.message|err\.message|Error\.message|setError\(|setSaveError\(|setSubmitError\(' src/apps/customer src/apps/staff/pages/PublicPetCard.jsx src/shared/auth/usePasswordReset.js src/shared/ui/ImageCropModal.jsx`. Censiti anche gli hook che conservano oggetti errore interni: non sono da soli un'esposizione DOM.

| Superficie | Testo locale dopo la correzione (ramo) |
|---|---|
| Login | `Email o password non corrette.` per invalid_credentials; codice sconosciuto: `Non riusciamo a completare la richiesta. Riprova tra poco o contatta il salone.` |
| Redeem / legacy invite | `Questo invito è già collegato a un altro account` + `Contatta il salone per verificare il collegamento.`; sconosciuto titolo `Non siamo riusciti a completare l’invito` e fallback generico; scaduto `Serve un nuovo link`. Altri codici usano VIEW_COPY locale, non prosa SQL. |
| Pet: caricamento | `Non riusciamo a caricare la scheda` + fallback generico. |
| Pet: salvataggio | `Non e stato possibile salvare le modifiche.` |
| Pet: riapertura ritratto | `Non e stato possibile riaprire il ritratto.` |
| Pet: upload/rimozione | `Non e stato possibile salvare la foto.` / `Non e stato possibile togliere la foto.` |
| Book: limite / duplicato / altro | `Hai già richieste in attesa presso questo salone. Attendi una risposta prima di inviarne un’altra.` / `Per questo pet c’è già una richiesta in attesa.` / `Riprova tra un momento — o scrivici direttamente su WhatsApp, va benissimo uguale.` |
| PendingRequest | Codice 22023: `Controlla la nuova disponibilità: scegli una data futura e una fascia in cui il salone è aperto.`; altri codici/fallback gia locali in appointmentResponses; aggiunta console tecnica, tolta classificazione per prosa inglese. |
| Cartoncino pubblico | `Card cliente non disponibile` |
| ImageCropModal | `Errore durante il ritaglio della foto. Riprova con un’altra immagine.` |
| Recupero/reset password | Customer gia usa messaggi locali; default hook staff/pubblico reso generico: `Non riusciamo ad aggiornare la password. Riprova tra poco.` Nessuna password modificata nelle prove. |
| Home, Promotions, hook e guard | Errori usati come condizione con copy locale o retry, non interpolati; nessuna modifica necessaria. |

**WhatsApp**, fixture salone `Demo`, pet `Luna`, durata 3 giorni, URL `https://example.invalid/u/redeem/test`:

Prima: `Ciao! Siamo Demo. Qui trovi l'area dedicata a Luna: tutti i tuoi pet, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale 3 giorni. https://example.invalid/u/redeem/test`

Dopo: `Ciao! Siamo Demo. Qui trovi l'area dedicata a Luna: tutti i tuoi pet, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale 3 giorni. Il link è personale: non inoltrarlo. https://example.invalid/u/redeem/test`

**Legacy, estensione autorizzata in chat:** nessun file eliminato fisicamente. `CustomerLogin.jsx` e `CustomerInvite.jsx` svuotati delle schermate e ridotti a redirect; in `database.js` rimossi `createCustomerAppointmentRequest`, `getCustomerPortalData`, `acceptCustomerPortalInvite` e helper cliente non usato. `CustomerPortal.jsx` conserva il prototipo demo; eliminati import e rami di lettura/scrittura live. Prenotazione effettiva solo wizard.

Ricerca `rg -n '/portal/demo|createCustomerAppointmentRequest|appointments_customer_request' src`: **prima**, unico link entrante al demo era in `CustomerLogin.jsx`; nessuna altra pagina staff lo collegava. **Dopo**, resta la definizione della rotta in StaffApp, nessun link entrante. `/portal/demo` e la sua simulazione non sono stati dismessi: decide Luigi. Il file condiviso CustomerPortal e toccato per rimuovere i rami live, non per ridisegnare il demo. Altri accessi diretti al prototipo via URL restano possibili per staff come prima.

## I nove orfani di client-photos

Fonte: **Cowork, produzione 27/9**, sezione omonima di `GH-103-impronte-produzione.md`, riportata su richiesta di Luigi. Non misurati da Codex, non aperti, non cancellati. Solo percorsi:

```text
4f81673e-5ed9-4f42-b2f8-cbbbfd1b5338/f734153c-ed56-4779-833b-6153f40d28fe-1773349964201.jpg
4f81673e-5ed9-4f42-b2f8-cbbbfd1b5338/5c3a7171-d6fd-4f1c-a01a-a7642537e63c-1773383158634.jpg
cb7f316e-65b0-4419-a6df-56367a3d3c0a/04bc45e9-d5f5-47d5-be43-26115fb970ab-1773492470924.jpg
b4019bf1-048b-4bf8-aecf-c0ef9c11186b/641a8ba7-d47c-4a87-b505-3bb04a968ed5-1774603000800.jpg
cb7f316e-65b0-4419-a6df-56367a3d3c0a/301a4643-3ed8-49fc-920e-ba4ca806a927-1775057002870.jpg
cb7f316e-65b0-4419-a6df-56367a3d3c0a/11c92817-8793-42bf-848f-87cb9344047d-1775646161363.jpg
cb7f316e-65b0-4419-a6df-56367a3d3c0a/11c92817-8793-42bf-848f-87cb9344047d-1775646170869.jpg
cb7f316e-65b0-4419-a6df-56367a3d3c0a/11c92817-8793-42bf-848f-87cb9344047d-1775646170948.jpg
cb7f316e-65b0-4419-a6df-56367a3d3c0a/b5e6f86a-a10e-4057-a75d-69005df429bb-1775649095854.jpg
```

## Tabella esaustiva del commit

Percorsi relativi al worktree `webapp/`; M modificato, A nuovo.

| Stato | File | Scopo |
|---|---|---|
| M | `scripts/rls-tests/run.mjs` | Suite economici/Storage/appointments aggiornata |
| A | `scripts/gh103-verify.mjs` | Prove transizione e browser con teardown |
| A | `scripts/gh103-cache-probe.mjs` | Prova CDN API solo demo vuoto |
| A | `scripts/gh103-errors.test.mjs` | Quattro test mapping errori |
| M | `src/apps/customer/components/PendingRequest.jsx` | Dettagli errore solo console |
| M | `src/apps/customer/lib/appointmentRequestFlow.js` | Selezione copy da codice |
| M | `src/apps/customer/pages/Book.jsx` | Errori statici |
| M | `src/apps/customer/pages/Login.jsx` | Errori Auth statici |
| M | `src/apps/customer/pages/Pet.jsx` | Errori lettura/salvataggio/foto statici |
| M | `src/apps/customer/pages/Redeem.jsx` | Codice details, errori statici |
| M | `src/apps/staff/StaffApp.jsx` | Redirect legacy |
| M | `src/apps/staff/lib/database.js` | Economici, RPC, collegamenti, rimozioni legacy |
| M | `src/apps/staff/lib/whatsapp.js` | Invito personale |
| M | `src/apps/staff/pages/ClientDetail.jsx` | Immagini firmate |
| M | `src/apps/staff/pages/Contacts.jsx` | Filtro collegamenti |
| M | `src/apps/staff/pages/CustomerInvite.jsx` | Solo redirect con token |
| M | `src/apps/staff/pages/CustomerLogin.jsx` | Solo redirect login |
| M | `src/apps/staff/pages/CustomerPortal.jsx` | Rimozione rami live, demo preservato |
| M | `src/apps/staff/pages/PublicPetCard.jsx` | Errori statici |
| M | `src/shared/auth/usePasswordReset.js` | Fallback statico |
| M | `src/shared/ui/ImageCropModal.jsx` | Errore statico |
| M | `src/shared/ui/PetAvatar.jsx` | Usa StorageImage |
| A | `src/shared/customerErrors.js` | Mapper codici/copy |
| A | `src/shared/ui/StorageImage.jsx` | Firme batch brevi e rinnovo |
| A | `supabase/migrations/20260927051419_gh103_finance_expand.sql` | Atto A |
| A | `supabase/migrations/20260927052224_gh103_finance_contract.sql` | Atto B |
| A | `supabase/migrations/20260927052231_gh103_recognition_private.sql` | Atto C2, prerequisito C1 commentato |
| A | `supabase/migrations/20260927052237_gh103_appointments_request_door_closed.sql` | Atto D |
| M | `docs/consegne/GH-103-prima-degli-inviti-esito.md` | Questo registro, storico conservato sotto |
| A | `docs/consegne/evidenze/GH-103/preflight.json` | Query e 37 impronte coincidenti |
| A | `docs/consegne/evidenze/GH-103/browser.json` | Transizione A/B iniziale |
| A | `docs/consegne/evidenze/GH-103/browser-final.json` | Finestra cache solo SQL |
| A | `docs/consegne/evidenze/GH-103/cache-api.json` | Chiusura cache API e pulizia |
| A | `docs/consegne/evidenze/GH-103/browser-ui.json` | Prove finali interfaccia |
| A | `docs/consegne/evidenze/GH-103/contacts-375.png` | Evidenza mobile solo demo |
| A | `docs/consegne/evidenze/GH-103/contacts-1365.png` | Evidenza desktop solo demo |

**Esclusi immutati:** mandati GH-102/emendamenti, GH-103 e impronte produzione; riallineamento demo del 27/9; tre SQL GH-102 non versionati. `controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/` mai letti ne inclusi: dati reali fuori perimetro. Nessun altro progetto Supabase letto. Nessun push, merge o deploy. Nessuna attivita fuori istruzione; ampliamento legacy attribuito all'autorizzazione esplicita di Luigi, non al mandato originario.

Tempi: ripresa misurata dal 27/9 **06:57:50 CEST** (timestamp 1790485070833) al controllo finale delle **07:50:04 CEST**: **52 min 13 s**. Include prove, attese tecniche e stesura; esclusi gli ultimi controlli Git/commit successivi a questa misura. Il tempo precedente alla ripresa non e ricostruito. Ultima build **1,54 s**, ultimi test locali **92 ms**; rete demo senza blocchi di autenticazione o file iCloud rilevati in questa ripresa.
Commit della consegna: identificabile con `git log -1 --format=%H -- docs/consegne/GH-103-prima-degli-inviti-esito.md` (registro nello stesso commit del codice).

---

## Storico: prima interruzione, superata dalla ripresa sopra

Il testo seguente fotografa lo stato al commit 6c8daa5: **non e lo stato corrente**.

<details>
<summary>Registro originario di interruzione al preflight</summary>

## Ordine degli atti rispetto al deploy

**NON ESEGUIBILE: preflight incompleto, nessun rilascio preparato.**
Sequenza prescritta dal mandato, non ricetta operativa gia verificata:

1. Prima di modificare codice/schema: confronto delle impronte demo/produzione.
2. Prima del deploy: atto economico solo additivo, copia verificata e compatibilita
   con le scritture della vecchia app.
3. Deploy di Luigi: app con URL firmati, nuovo accesso ai dati economici e
   correzioni inviti/errori; verifica salvataggi, foto e conti.
4. Dopo il deploy: atto economico di chiusura delle colonne legacy.
5. Dopo deploy e verifica del funzionamento degli URL firmati: atto separato
   che rende privato client-photos.
6. Chiusura delle due policy legacy appointments solo dopo la ricerca dei
   consumer e la controprova del percorso richieste; collocazione da verificare.

**Nessun file di migrazione creato:** nomi definitivi, query post-atto e rollback
non sono ancora consegnabili. Non applicare questa sequenza come ricetta.
Non essendo iniziato alcun atto, non occorre rollback ne ripristino di fixture.

## Interruzione al preflight

Root `/Users/luigimaisto/Desktop/grooming-hub-web`, worktree `webapp/`.
Base `9822fa9985e94bafcf9cbdb6514df53e30f5203e`, branch `main`.
Letto integralmente il mandato locale GH-103 nominato da Luigi.
Accesso consentito solo al demo `qttpinkslhenxrsbhhhg`; nessun accesso alla
produzione, nemmeno in lettura.

**Non e stata osservata una divergenza: manca il termine di confronto prod.**
Il mandato riporta conteggi di produzione, non le impronte dei seguenti
oggetti. Le sei parita comunicate per GH-102 e il riallineamento del 27/9
riguardano altri oggetti: non dimostrano la parita di questa funzione/policy.
Ricerca mirata in mandato, registro GH-102, environment-map, diario (sola
lettura) e intestazione dello script di riallineamento: nessuna impronta
prod corrispondente reperita.

### Impronte demo misurate il 27/9

| Oggetto | MD5 demo | Produzione |
|---|---|---|
| public.complete_appointment_with_visit(text,date,text,text,numeric,uuid) | 96951ebfc651744e0fa1cf0be29821a6 | non fornita |
| public.appointments / appointments_customer_request_insert | 44731e892b0572fffe74dff50465c9bc | non fornita |
| public.appointments / appointments_customer_request_update | 4db2578d99030079105793c1364a8e5d | non fornita |
| storage.objects / Client photos staff select | ed7e8d9ab62c4b47d3ba2037628be5dd | non fornita |

La policy Storage e una dipendenza del percorso firmato, non una modifica gia
decisa. Questo e il nucleo minimo certo del preflight, non una dichiarazione
che nessun altro oggetto sara coinvolto nella soluzione definitiva.
Per le funzioni: MD5 di `pg_get_functiondef`. Per le policy, che non sono
funzioni: espressioni `pg_get_expr`, comando, permissivita e nomi dei ruoli
ordinati; niente OID dipendenti dall'ambiente.

### Passo consigliato a Cowork

Eseguire in produzione questa **sola lettura** e riportarne le quattro righe.
Codex non la esegue sulla produzione. Lo stesso testo e stato usato sul demo:

```sql
select 'function' as kind,
       n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as object,
       md5(pg_get_functiondef(p.oid)) as fingerprint
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='complete_appointment_with_visit'
union all
select 'policy',
       n.nspname || '.' || c.relname || '/' || p.polname,
       md5(jsonb_build_object(
         'command',p.polcmd,'permissive',p.polpermissive,
         'roles',(select jsonb_agg(case when r=0 then 'PUBLIC' else pg_get_userbyid(r)::text end order by case when r=0 then 'PUBLIC' else pg_get_userbyid(r)::text end) from unnest(p.polroles) as roles(r)),
         'using',pg_get_expr(p.polqual,p.polrelid),
         'check',pg_get_expr(p.polwithcheck,p.polrelid)
       )::text)
from pg_policy p join pg_class c on c.oid=p.polrelid join pg_namespace n on n.oid=c.relnamespace
where (n.nspname='public' and c.relname='appointments' and p.polname in ('appointments_customer_request_insert','appointments_customer_request_update'))
   or (n.nspname='storage' and c.relname='objects' and p.polname='Client photos staff select')
order by 1,2;
```

Alla ripresa confrontare nuovamente il demo con l'esito prodotto da Cowork:
qualsiasi differenza blocca il lavoro. Prima di toccare ulteriori funzioni o
policy, estendere il confronto anche a quelle. Non dedurre la parita dai
soli nomi, dai file di migrazione o da conteggi coincidenti.

Altro input da fornire per la consegna finale: i **9 percorsi orfani prod**
di client-photos. Il mandato ne indica solo il numero; Codex non puo ricavarli
dal demo o accedere alla produzione. Nessun oggetto Storage da cancellare.

## File, verifiche e limiti

| File toccato | Destino |
|---|---|
| docs/consegne/GH-103-prima-degli-inviti-esito.md | unico file del commit documentale di interruzione |

Mandato GH-103 e tutti i materiali Cowork/Luigi gia esclusi restano immutati,
fuori da stage/commit; cartelle con dati reali non lette. Nessun codice,
migrazione, policy, funzione, account, password o dato applicativo modificato.
Sul demo eseguita **una SELECT di metadati**; zero fixture create, zero residui
di questo giro per costruzione, nessun teardown necessario.

Ricerca iniziale economica sotto src eseguita solo per identificare il target
certo del preflight: non presentata come censimento finale dell'implementazione.
Build, browser e suite RLS non eseguiti: implementazione non iniziata.
Nessun push, merge o deploy. Nessuna attivita fuori mandato.

Tempo misurato dalla ricerca mirata al controllo finale prima della stesura:
**53 secondi**; esclusi lettura iniziale e redazione/commit.
Commit: quello che introduce questo registro, identificabile con
`git log -1 --format=%H -- docs/consegne/GH-103-prima-degli-inviti-esito.md`.

**Stato: interrotto al prerequisito, GH-103 non completato.**

</details>
