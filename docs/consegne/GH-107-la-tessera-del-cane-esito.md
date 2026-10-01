# GH-107 — La tessera del cane

## Atto per Cowork, non ancora eseguito in produzione

La sola chiave nuova di primo livello di `tenants.settings` e':

```json
"fidelity_projection": {
  "history_start": "2026-03-06",
  "tiers": ["bronze"]
}
```

**`fidelity_tiers` resta immutato. Nessuna migration o policy.** Nel prodotto scrive Cowork, non Codex. Ordine consigliato: completare le verifiche sotto, verifica indipendente e deploy di Luigi, poi atto di Cowork sulla sola chiave nuova e conteggio. Senza chiave il codice conserva i livelli precedenti.

Query di verifica dopo l'atto: [conteggio-bronzo-cowork.sql](/Users/luigimaisto/Desktop/grooming-hub-web/webapp/docs/consegne/evidenze/GH-107/conteggio-bronzo-cowork.sql). Sostituire l'UUID con quello del salone di produzione. Distingue **soddisfa la soglia Bronzo per visite** da **ha esattamente il livello effettivo Bronzo**: chi e' Argento/Oro non va contato come livello effettivo Bronzo. Nessuna attesa di 46 imposta al risultato: e' una misura storica di Cowork, non rimisurata da Codex in produzione.

## Stato e base

**IMPLEMENTATO E VERIFICATO SUL DEMO. Suite RLS: 62 PASS, 0 FAIL, 0 SKIP; rotte vive: 11 PASS, zero errori JS. Fixture e impostazioni ripristinate, 18/18 misure uguali alla base. Le sole17 differenze di impronta sono accettate da Luigi. Restano il collaudo indipendente e le prove sul telefono di Luigi/Davide: non e' una promozione in produzione.**

- Root `/Users/luigimaisto/Desktop/grooming-hub-web/`; repo `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch `main`, base `fc3acb90ff9f58af61182c7e40d009986fa89fe8`.
- Canone adottato e letto: 1.2; SHA-256 `28a1c8d407c3bb624a4c0d499e14aee926472843e5192e3f70d4e961f8b82e71` della fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md`.
- Mandato locale GH-107, Correzioni 1 e 2 recepite. Argento/Oro invariati, nessun vincolo di anzianita'.
- Solo demo `qttpinkslhenxrsbhhhg`. Produzione mai letta o scritta. Nessun account/password modificato, nessun push/merge/deploy.
- Commit: questo registro viaggia insieme al codice; hash ricavabile con `git log -1 --format=%H -- docs/consegne/GH-107-la-tessera-del-cane-esito.md` e comunicato nella consegna in chat. Mandati e altri file di Luigi/Cowork esclusi.

### Prerequisito iniziale e soluzione consigliata

Le letture della tessera aggiungono `qr_token` e `awarded_fidelity_tier`: GH-107 richiede quindi la suite RLS. `ISTRUZIONI.md` e canone impongono prima il confronto delle impronte. L'allegato `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/docs/incarichi/GH-103-impronte-produzione.md:4` dichiara esplicitamente **prima di ogni atto GH-103**: non certifica la produzione attuale.

Richiesta inviata a Luigi per Cowork. Proposta concreta: usare [impronte-proposte.sql](/Users/luigimaisto/Desktop/grooming-hub-web/webapp/docs/consegne/evidenze/GH-107/impronte-proposte.sql), sola lettura di metadati, e allegare esito, ora e query. Codex ripetera' la stessa query sul demo, dichiarera' eventuali differenze, poi eseguira' la suite esistente e le rotte autenticate finali. Non serve cambiare schema o concedere accesso alla produzione. Non si puo' dedurre l'allineamento dalle migration locali.

### Ripresa 1/10, 12:27:39 CEST: confronto eseguito

Ricevuto `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/docs/incarichi/GH-107-impronte-produzione.md`, misura Cowork delle **12:24:27 CEST**; documento lasciato immutato e fuori dal futuro commit. SHA-256 locale `a7d5a2d6019f7b9053e5a1d08e00adf5270baf132ae53eba04887f85aa74409e`.

La tabella dell'allegato, ricalcolata localmente, contiene **271 righe**, MD5 d'insieme **`9b84214d27393f2b0f7ac65c6c35b5e6`**: entrambi coincidono con quanto dichiarato. Stessa query eseguita sul demo: **254 righe**, MD5 **`06f3a372e14ba984a62276258561d9a4`**. Il digest e' stato ricalcolato anche direttamente dal database alle **12:30:03,092067 CEST**, con `md5(string_agg(kind||'|'||name||'|'||md5, E'\n' order by kind,name))`: identico al calcolo locale.

**254 oggetti comuni identici, 0 impronte diverse negli oggetti comuni, 0 oggetti solo demo, 17 righe solo produzione:**

| Oggetto solo produzione | Righe di impronta |
|---|---|
| `public.gh78_customer_phone_backup` | `backed_up_at`, `customer_id`, `normalized_phone`, `original_phone`, `tenant_id` (5) |
| `public.gh95_customer_name_backup` | `backed_up_at`, `first_name`, `id`, `last_name`, `phone` (5) |
| `public.pets_breed_backup_gh70` | `breed_originale`, `pet_id`, `salvato_il` (3) |
| `public.services.price_cents` | 1 colonna |
| `public.visits.cost` | 1 colonna |
| `public.visits.discount_percent` | 1 colonna |
| `public.gh103_finance_bridge()` | 1 funzione |

Le prime13 sono **metadati** dei backup gia' esclusi dall'audit, non dati letti nei backup. Le altre4 sono coerenti con l'atto B GH-103 gia' sul demo e dichiarato ancora assente in produzione dall'allegato. Nessun oggetto ricreato e nessuna interrogazione alla produzione.

**Confine confermato da Luigi il1/10:** accettate esattamente queste17 differenze, nessun'altra. Il cancello e' superato con254 definizioni comuni identiche; suite RLS autorizzata. Nessun riallineamento dei database, nessuna riapertura della verifica dei backup.

Evidenze riproducibili: `impronte-demo.json`, `confronta-impronte.mjs`, `confronto-impronte.json`. Il primo estrattore dell'involucro MCP ha intercettato il delimitatore citato nel preambolo invece dei dati; corretto il parser e ripetuta la sola query di metadati, nessun effetto sul DB.

## Implementazione e scelte

- `/u/card/:petId`: tessera personale, ritratto `owner_photo_url`, QR reale, un solo pulsante pieno. Modalita' banco bianca, QR nero da 300px, chiusura/focus/Escape e wake lock opportunistico senza promessa a schermo.
- Home: una striscia per pet al posto del blocco Punti. `/u/card` va all'unico pet, oppure alla Home con ancoraggio alle strisce. Navigazione a tre voci e altre superfici invariate.
- Funzione fidelity unica in shared; quattro consumer staff cambiano solo import. Restano re-export nei vecchi percorsi per gli altri consumer, senza modificarli.
- Generatore QR spostato **identico al byte**: SHA-256 `9c03982c60b2101b9ec6060b1e2a1575fd46df60444858ad5faa892e53d21ea0`. Il nero puro del banco e' ottenuto sulla resa CSS, senza cambiare il generatore del cartoncino.
- Letture paginate, tenant e pet espliciti; errore su una pagina successiva non diventa un totale parziale. Nessun costo/foto di riconoscimento nella query nuova.
- Manifest base: sola shortcut. La tessera propone un manifest con `start_url` e `id` dedicati al pet, icone assolute; all'uscita ripristina il manifest precedente. Il suggerimento d'installazione compare solo dopo la preparazione riuscita.
- Mesi osservati: anniversari di calendario e frazione fra due anniversari, giorno di Roma. Al 1/10 sono **6,833333 mesi**, non i 6,87 stimati nel mandato: soglia 4 identica. **5 dal 7/11/2026, 6 dal 7/1/2027; dal 6/3/2027 finestra mobile originale.** La query allegata usa la stessa convenzione. Al giorno iniziale H=0 la formula letterale prescritta produce soglia 0: non introdotto un minimo non autorizzato; per questa attivazione retrodatata il caso non ricorre.
- Parole proposte: **«Ogni visita da noi e' un timbro · contano quelle dal 6 marzo 2026.»** Nel DOM gli accenti sono quelli italiani. Per le finestre mature: «…contano quelle degli ultimi 12 mesi.» Quando il prossimo traguardo e' Argento/Oro, sono mostrati rispettivamente i suoi 24/36 mesi.

## Misure e controprove

Evidenze in `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/docs/consegne/evidenze/GH-107/`.

| Controprova | Esito e limite |
|---|---|
| Prima prova rischiosa, prima della composizione | Demo, 1/10 11:55:21 CEST: quattro pet con 3/4/12/36 visite. API staff `getClientById`, API cliente `readPetCard`, sessioni indipendenti e render React reali: Base/Bronzo/Argento/Oro concordi. `prova-mirata.json`. Non e' una prova browser di login. |
| Senza impostazioni | `node docs/consegne/evidenze/GH-107/regola.mjs`: 308 snapshot equivalenti alla base, escluse solo le due proprieta' additive di proiezione. |
| Con impostazioni | 0/1/3 visite Base, 4 Bronzo, 12 Argento, 36 Oro. Otto configurazioni assenti/invalide disattivano la proiezione. |
| Storico maturo, manuale, punti | Soglia 6 oltre 12 mesi; Bronzo conferito, Argento 250 punti, Oro 500 punti: PASS. Date di cambio soglia misurate giorno per giorno. |
| Tutti gli stati visuali | Banco locale con componenti reali, 11 combinazioni: zero/una/meta'/Bronzo/Argento/Oro/manuale/punti e 3 casi proiettati. Livello staff e tessera concordi, Oro senza timbri, zero «mancano», zero errori JS. Non e' prova delle policy. |
| QR | Apple Vision decodifica immagini cliente 300px, cartoncino 900px, screenshot banco: stesso `http://127.0.0.1:4178/client-card/ghp_gh107_probe_4`, 3/3. Indirizzo non aperto. |
| Banco | A 375px: QR 300x300, pixel esclusivamente `0,0,0` e `255,255,255`, fondo bianco. Escape/Tab/focus restituito e root inert: PASS. |
| Wake lock | Mock browser: assente 0 richieste, rifiutato 1 richiesta/0 rilasci, concesso 1/1, risposta tardiva dopo chiusura 1/1. Non e' prova dello spegnimento fisico del telefono. |
| Manifest | Chromium `Page.getAppManifest`: zero errori, start e shortcut `/u/card/local-synthetic`. iPhone fisico NON provato. |
| Ingombri | 320/375/1365px: colonna 320/375/390px, centrata, zero overflow. CTA alta 64,9375px >=54. Foto non raggiungibile: iniziale; nome molto lungo senza sbordamento. |
| Letture lunghe | Mock locale: 1201 visite e 1001 movimenti letti integralmente; pet assente non avvia letture figlie; errore pagina 2 propagato. Non e' una controprova RLS. |
| Ricerca foto/importi | `rg -n '\bphoto_url\b|cost|discount_percent' src/apps/customer`: solo album preesistente `Pet.jsx` e query `usePetVisits.js` su **visits.photo_url**. Nessuna nuova lettura `pets.photo_url`, nessun importo. La richiesta letterale zero `photo_url` confligge con l'album autorizzato: non rimosso fuori mandato. |
| Build finale | `npm run build`, ripetuta alle12:48: PASS, 180 moduli, 1,25s, JS733,77kB (gzip212,68), CSS138,22kB. Stessi asset della build precedente. Avvisi Browserslist obsoleto e chunk >500kB, non corretti fuori perimetro. |
| Suite RLS esistente | `GH_RLS_EXPECTED_PROJECT_REF=qttpinkslhenxrsbhhhg GH_RLS_SUITE_LABEL='GH-107 - Suite RLS demo' node scripts/rls-tests/run.mjs`: **62 PASS, 0 FAIL, 0 SKIP**, uscita0. Script immutato, hash SHA-256 ed esiti attesi/misurati in `rls-suite.json`. Sonde permanenti conservate. |
| Rotte browser autenticate finali | `node docs/consegne/evidenze/GH-107/rotte-vive.mjs`: **11 PASS, zero pageerror**, Chromium isolato, demo. Login Mario con ritorno alla tessera; 3/4/12/36 visite rendono Base/Bronzo/Argento/Oro; Home→Bronzo→banco; shortcut multi-pet→Home#tessere; manifest personalizzato e ripristinato uscendo via SPA; caricamento, errore rete simulato503 e riprova senza mostrare dati parziali; Luca riceve «Tessera non disponibile.» e nessun nome/QR di Mario. `rotte-vive.json`, `banco-demo-vivo.png`. |

### Ripristino demo

Prima delle scritture preparati gli atti `01-prova-mirata.sql` e `02-ripristino.sql`. L'atto 01 e' protetto dall'impronta iniziale: non si rilancia sopra fixture presenti; prima ripristinare. Non e' una migration.

Rilettura finale **1/10/2026 12:18:59,514638 CEST**, `supabase_execute_sql` esclusivamente sul demo:

```sql
select now() at time zone 'Europe/Rome' as measured_at,
  md5(settings::text) as settings_md5, settings->'fidelity_projection' as projection,
  (select count(*) from public.pets where name like '[DEMO GH-107]%') as fixture_pets,
  (select count(*) from public.visits where id like 'gh107-probe-%') as fixture_visits
from public.tenants where id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9';
```

**Pet 0; visite 0; projection NULL; MD5 settings `26327442803a6426d07c74c8feca0f33`, uguale al prima.** Quindi anche `fidelity_tiers` invariato. Sonde permanenti preesistenti conservate.

La query di conteggio per Cowork e' stata anche eseguita in sola lettura sul demo pulito, sostituendo soltanto l'UUID: 12:17:22 CEST, soglia6, Bronzo per visite0, effettivo Bronzo0/Argento3/Oro0. Non e' una misura del prodotto e non attiva la proiezione.

### Ripristino conclusivo dopo RLS e browser

Preflight fixture **12:43:01,685619 CEST**: zero residui nelle8 categorie controllate. Snapshot iniziale in `rls-baseline.json`; query esatta in `rls-ripristino-query.sql`.

La suite ha ripulito i propri dati ma lasciato **due audit di scollegamento della fixture GH-44**. Identificati per UUID nuovo, customer di prova, telefono sintetico, autore sonda e orario; rimossi solo quei2 con `rls-audit-cleanup.sql`. Le16 righe di audit preesistenti sono intatte. `rls-ripristino.json`: tutte18 le misure uguali alla base.

Per il browser riusati i4 pet/55 visite gia' autorizzati, poi eseguito `02-ripristino.sql`. Rilettura completata entro **12:47:17 CEST**: pet GH-107=0, visite GH-107=0, settings MD5 originale `26327442803a6426d07c74c8feca0f33`. **18/18 conteggi/impronte uguali al prima**, Storage0, account6 (nessuno creato o rimosso). Digest dei dati: MD5 delle righe JSONB ordinate, escluso `updated_at` e, solo Storage, `last_accessed_at`; non si dichiara il ripristino dei timestamp tecnici o delle sessioni Auth.

Ultima rilettura metadati **12:48:16,215654 CEST**:254 righe, MD5 `06f3a372e14ba984a62276258561d9a4`, identico al preflight. **Nessun'altra differenza introdotta**. `ripristino-finale.json`.

## Tabella esaustiva del lavoro

Percorsi relativi alla root Git dichiarata sopra, non ad altri progetti. **56 file:20 applicativi,35 evidenze,1 registro**; elenco confrontato automaticamente con i file presenti. Nessun file rimosso; due moduli sono diventati re-export compatibili.

| File | Intervento |
|---|---|
| `public/manifest.webmanifest` | Shortcut tessera |
| `src/apps/customer/CustomerApp.jsx` | Due rotte |
| `src/apps/customer/pages/Home.jsx` | Strisce e ancoraggio |
| `src/apps/customer/pages/PetCard.jsx` | Nuova pagina e composizione |
| `src/apps/customer/pages/CardShortcut.jsx` | Entrata shortcut |
| `src/apps/customer/components/PetCardBank.jsx` | Banco accessibile, wake lock |
| `src/apps/customer/components/PetCardParts.jsx` | Ritratto, qualifica, timbri |
| `src/apps/customer/components/PetCardStrip.jsx` | Striscia Home |
| `src/apps/customer/components/pet-card.css` | Layout CD-09, classi tipografiche esistenti |
| `src/apps/customer/hooks/usePetCard.js` | Letture esplicite paginate |
| `src/apps/customer/hooks/useCardManifest.js` | Manifest della singola tessera |
| `src/apps/customer/lib/petCardCopy.js` | Parole per gli stati |
| `src/shared/lib/fidelity.js` | Regola unica e proiezione Bronzo |
| `src/shared/lib/qrCode.js` | Generatore spostato identico |
| `src/apps/staff/lib/fidelity.js` | Re-export |
| `src/apps/staff/lib/qrCode.js` | Re-export |
| `src/apps/staff/components/ClientCard.jsx` | Solo import |
| `src/apps/staff/pages/ClientDetail.jsx` | Solo import |
| `src/apps/staff/pages/AddVisit.jsx` | Solo import |
| `src/apps/staff/pages/Dashboard.jsx` | Solo import |
| `docs/consegne/GH-107-la-tessera-del-cane-esito.md` | Questo registro |
| `docs/consegne/evidenze/GH-107/01-prova-mirata.sql` | Setup fixture eseguito |
| `docs/consegne/evidenze/GH-107/02-ripristino.sql` | Cleanup eseguito |
| `docs/consegne/evidenze/GH-107/prova-mirata.json` | Esito prima prova viva |
| `docs/consegne/evidenze/GH-107/regola.mjs` | Banco contro la base Git |
| `docs/consegne/evidenze/GH-107/regola.json` | Risultati regola |
| `docs/consegne/evidenze/GH-107/preview.mjs` | Preview locale riproducibile, guardia demo |
| `docs/consegne/evidenze/GH-107/browser.mjs` | Controlli visivi sintetici |
| `docs/consegne/evidenze/GH-107/browser.json` | Testi e geometrie misurati |
| `docs/consegne/evidenze/GH-107/interazioni.mjs` | Wake lock, fallback, pixel |
| `docs/consegne/evidenze/GH-107/interazioni.json` | Esiti interazioni |
| `docs/consegne/evidenze/GH-107/letture-locali.mjs` | Mock paginazione |
| `docs/consegne/evidenze/GH-107/letture-locali.json` | Esiti paginazione |
| `docs/consegne/evidenze/GH-107/decode-qr.swift` | Decodifica Apple Vision |
| `docs/consegne/evidenze/GH-107/qr-decodifica.json` | Contenuto decodificato |
| `docs/consegne/evidenze/GH-107/qr-customer.png` | QR tessera |
| `docs/consegne/evidenze/GH-107/qr-cartoncino.png` | QR generatore stampa |
| `docs/consegne/evidenze/GH-107/qr-banco.png` | QR screenshot banco |
| `docs/consegne/evidenze/GH-107/banco-375.png` | Screenshot banco |
| `docs/consegne/evidenze/GH-107/tessera-320.png` | Screenshot stretto |
| `docs/consegne/evidenze/GH-107/tessera-375.png` | Screenshot telefono |
| `docs/consegne/evidenze/GH-107/tessera-1365.png` | Screenshot desktop |
| `docs/consegne/evidenze/GH-107/conteggio-bronzo-cowork.sql` | Query sola lettura per Cowork |
| `docs/consegne/evidenze/GH-107/impronte-proposte.sql` | Proposta di query per sbloccare la suite |
| `docs/consegne/evidenze/GH-107/impronte-demo.json` | 254 impronte misurate nel demo |
| `docs/consegne/evidenze/GH-107/confronta-impronte.mjs` | Confronto esatto con la tabella Cowork e digest |
| `docs/consegne/evidenze/GH-107/confronto-impronte.json` | Esito 254 uguali, 17 solo produzione |
| `docs/consegne/evidenze/GH-107/rls-baseline.json` | Snapshot dati prima della suite |
| `docs/consegne/evidenze/GH-107/rls-ripristino-query.sql` | Query riproducibile per18 misure |
| `docs/consegne/evidenze/GH-107/rls-suite.json` | 62 esiti della suite, SHA-256 dello script |
| `docs/consegne/evidenze/GH-107/rls-audit-cleanup.sql` | Pulizia delle sole2 righe di audit nuove |
| `docs/consegne/evidenze/GH-107/rls-ripristino.json` | Ritorno alla base dopo RLS |
| `docs/consegne/evidenze/GH-107/rotte-vive.mjs` | Prova browser autenticata riproducibile |
| `docs/consegne/evidenze/GH-107/rotte-vive.json` | 11 esiti browser |
| `docs/consegne/evidenze/GH-107/banco-demo-vivo.png` | Screenshot con fixture demo reale |
| `docs/consegne/evidenze/GH-107/ripristino-finale.json` | Ripristino dopo browser e ultima impronta schema |

## Eccezioni, recuperi e fuori istruzione

- **Recuperi del mandato: 2**, Correzioni1/2 (vincolo Argento mai deciso, forma settings vietata dal check). Primo tentativo settings rifiutato dal vincolo e transazione annullata; nessun aggiramento. Dopo Correzione2, prove e ripristino misurati.
- Errori del banco Codex corretti: import Vite CJS senza `loadEnv`, percorso Sharp non disponibile; usati ESM e canvas del browser. Il primo errore vivo ha comunque eseguito la pulizia. `listen EPERM` del websocket Vite in sandbox non era un errore applicativo; test locale poi ripetuto fuori sandbox, PASS.
- In prova iniziale attesa di circa80s segnalata, causa non attribuita senza misura. Build finale1,35s: nessuna prova di un rallentamento generalizzato attuale.
- **Scoperta:** la premessa «iPhone ignora start_url» non e' garantita. [Apple WWDC23](https://developer.apple.com/videos/play/wwdc2023/10120/) descrive l'avvio da start_url e precisa che la sessione web puo' non essere copiata nell'app installata. Manifest dedicato verificato in Chromium; telefono reale ancora da provare, incluso il ritorno alla tessera dopo login.
- Insegna ZavaRoby sulla nuova tessera; Home e nav esistenti non ribattezzate, per rispettare l'invariante Home invariata salvo striscia. Nessun intervento sul cartoncino pubblico o sulle sue soglie: escluso dal mandato.
- File paralleli intatti ed esclusi: mandati GH-106/GH-107, `supabase/demo-riallineamento-2026-09-27.sql`, tre migration GH-102 del27/9, `supabase/rollback/`. Le cartelle `controlli-salone/`, `nomi-da-recuperare/`, `qr-gadget/` non lette, non copiate, non inventariate internamente. Diario e brief CD intatti.
- Confine strutturale, non un difetto vivo misurato: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/src/apps/staff/lib/database.js:1461` legge i punti senza paginazione. Oltre il limite di righe del servizio potrebbe divergere dal totale completo della tessera. Proposta separata: paginare quella lettura staff con conteggio atteso e prova sopra il limite; rischio se lasciata cosi': totale/livello a punti diverso su uno storico molto lungo. Il file non e' nel perimetro e non e' stato modificato. I quattro casi demo misurati coincidono.
- **Fuori istruzione eseguito: nessuno.** Proposta impronte e note di confine non autorizzano nuove operazioni DB.
- Passaggi a Luigi documentati:4 (Correzioni1/2, allegato impronte, accettazione17 eccezioni), tutti chiusi. Tempi aggiunti da ciascun controllo non cronometrati separatamente, non ricostruiti.

## Tempi e ripresa

Inizio misurato **1/10 11:35:54 CEST**; ripresa Correzione2 **11:53:36**. Ultima misura demo **12:18:59**; ora locale riletta con `date` **12:23:11**. Intervallo fin qui **47m17s**, comprensivo di attese e pause non separate; non e' tempo netto di esecuzione.

Preview locale: `http://127.0.0.1:4178/__gh107/view?visits=4&project&name=%5BDEMO%5D%20Nina`, dati locali sintetici, nessuna fixture DB lasciata. Il server si riproduce con `node docs/consegne/evidenze/GH-107/preview.mjs`; i banchi browser usano Playwright del runtime Codex, sovrascrivibile con `PLAYWRIGHT_MODULE`.

Nuovo segmento iniziato alle **12:27:39 CEST**; misura SQL conclusiva confronto alle **12:30:03 CEST**: 2m24s fino alla misura, distinto dall'intervallo precedente. Solo letture e documentazione, nessuna nuova fixture.

Ultimo segmento: **12:38:47 → 12:48:16 CEST**, 9m29s fino alla misura conclusiva di DB; documentazione e commit successivi non inclusi. Suite senza rallentamenti anomali osservati; build1,25s. Nessun tempo netto complessivo inventato sommando le pause della conversazione.

**Passaggio a Luigi/Davide:** confrontare lo stesso pet4visite fra tessera e gestionale, scansione QR al banco, icona sul telefono e ritorno dopo login, «cosa non ti torna?». Il demo e' pulito: per una nuova prova viva servono fixture temporanee esplicitamente predisposte; la preview sintetica resta disponibile senza dati DB. Installazione su iPhone e scansione dal telefono di Davide non sono sostituite dai controlli automatici.
