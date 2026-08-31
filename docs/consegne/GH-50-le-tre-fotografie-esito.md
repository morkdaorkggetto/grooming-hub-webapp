# Consegna GH-50 - Le tre fotografie

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base accettata: `64e08dd`.
- La base iniziale era `76052b0`; durante il giro e' comparso `64e08dd`, commit
  dei soli cinque materiali CD-05. Luigi ne ha autorizzato esplicitamente
  l'adozione come nuova base.
- Database scritto e letto: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge o deploy.

## Esito

Le tre fotografie hanno ora responsabilita' distinte:

- `pets.photo_url`: riconoscimento del salone, invariata e non scrivibile dal
  customer;
- `pets.owner_photo_url`: ritratto scelto dal proprietario;
- `visits.photo_url`: una foto facoltativa per ogni lavorazione.

La scheda customer mette al centro il ritratto del proprietario e usa la foto
salone come pastiglia scambiabile. La scheda staff fa l'inverso. Se esiste una
sola fotografia non appare alcuna pastiglia vuota. L'album customer e' una
sovrapposizione sulla pagina esistente; nessuna rotta e' stata aggiunta.

La registrazione visita accetta una foto facoltativa gia' presente in galleria,
la salva dopo la visita senza rischiare una seconda registrazione in caso di
errore upload e permette allo staff di rimuoverla senza eliminare la visita.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260831075846_gh50_three_photos.sql` | aggiunto | Due colonne, whitelist customer a tre campi e policy Storage limitate allo spazio `owner` del pet. |
| `scripts/rls-tests/run.mjs` | modificato | Controprove RLS e Storage GH-50 con ripristino dei valori originali. |
| `src/apps/customer/hooks/usePet.js` | modificato | Legge il ritratto e filtra il payload customer sui tre campi ammessi. |
| `src/apps/customer/hooks/usePetVisits.js` | modificato | Legge la foto associata a ogni visita. |
| `src/apps/customer/lib/petPhoto.js` | modificato | Upload e rimozione del ritratto nel percorso tenant/pet/owner. |
| `src/apps/customer/pages/Pet.jsx` | modificato | Medaglione doppio, invito, album, apertura foto e condivisione nativa. |
| `src/apps/customer/pages/Pet.css` | modificato | Composizione responsive di medaglione e bottom sheet. |
| `src/apps/staff/components/StaffKit.jsx` | modificato | Miniatura e rimozione della foto nella riga visita. |
| `src/apps/staff/components/VisitForm.jsx` | modificato | Allegato facoltativo da galleria con anteprima e rimozione prima del salvataggio. |
| `src/apps/staff/lib/database.js` | modificato | Lettura, upload, associazione, rimozione e pulizia delle foto visita. |
| `src/apps/staff/pages/AddVisit.jsx` | modificato | Propaga il file e distingue visita salvata da upload foto fallito. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Medaglione staff, album in sola lettura e azione rimuovi foto visita. |
| `src/apps/staff/styles/gh15-staff.css` | modificato | Layout staff per medaglione, album, form e miniature visita. |
| `docs/consegne/GH-50-le-tre-fotografie-esito.md` | aggiunto | Registro unico del giro. |

I cinque materiali in `design_handoff_customer_app/cd05-three-photos/` sono
gia' presenti nella base accettata `64e08dd`; non vengono duplicati nel commit
GH-50. Nessun altro file appartiene alla consegna.

## Migration e sicurezza

Migration applicata una sola volta sul demo e registrata dal servizio come:

`20260831075846_gh50_three_photos`

Il file locale e' stato rinominato sulla stessa versione registrata. Le policy
customer di `pet-avatars` verificano nel database tenant, pet e proprietario e
ammettono soltanto il terzo segmento `owner`. Gli spazi `salon` e `visits`
restano staff-only tramite le policy staff gia' esistenti.

La whitelist `enforce_pets_customer_update_whitelist()` ripristina la riga a
`OLD` per i non-staff e riapplica esclusivamente `owner_notes`,
`coat_preferences` e `owner_photo_url`.

Advisor post-migration:

- sicurezza: 9 warning preesistenti, nessuno sugli oggetti GH-50;
- prestazioni: 104 warning preesistenti, nessuno sugli oggetti GH-50.

## Controprove dati e RLS

| Prova | Misura | Esito |
| --- | --- | --- |
| Ritratto customer | `owner_photo_url` scritto; `photo_url` salone identico prima/dopo | PASS |
| Scrittura customer su `visits.photo_url` | valore riletto invariato dallo staff | PASS |
| Foto visita staff | upload, URL persistito, HTTP 200, colonna azzerata e oggetto rimosso | PASS |
| Pet e visite altrui | customer: 0 pet e 0 visite leggibili | PASS |
| Spazio Storage `visits` | upload customer rifiutato HTTP 403 | PASS |
| Percorso owner proprio | upload, update e delete riusciti | PASS |
| Percorso pet/tenant altrui | upload customer rifiutati HTTP 403 | PASS |
| Suite RLS estesa | 54 PASS, 0 FAIL, 0 SKIP | PASS |

La suite ha confermato anche che la scrittura owner non sovrascrive la foto
salone a livello di colonna, non soltanto a schermo.

## Otto stati CD-05

| Stato | Misura viva | Esito |
| --- | --- | --- |
| `OwnerVuoto` | nessuna foto; nessun pulsante album; riga vuota presente | PASS |
| `OwnerUna` | ritratto + riconoscimento + una foto visita; scambio URL reale | PASS |
| `OwnerAlbum1` | bottom sheet con una fotografia a larghezza piena | PASS |
| `OwnerAlbum4` | quattro fotografie in griglia a due colonne | PASS |
| `OwnerAperta` | foto aperta, data, tempo relativo e comando `Salva o inoltra` | PASS |
| `OwnerSoloBanco` | sola foto salone, due foto album e invito al ritratto | PASS |
| `StaffDue` | foto salone centrale, ritratto in pastiglia, 4 miniature e 4 rimozioni | PASS |
| `StaffSola` | sola foto salone, nessuna pastiglia, una miniatura album | PASS |

Verifica responsive aggiuntiva: customer a 390x844; staff a 1280x900 e
390x844. Nella scheda staff mobile `scrollWidth` e `clientWidth` erano entrambi
390 px.

## Card pubblica

La RPC pubblica ha mantenuto la chiave `photo`, valorizzata esclusivamente con
la foto salone durante la fixture. Non espone `owner_photo_url`, foto visita,
pastiglie o conteggi album. Nessun file della card pubblica e' stato modificato.

La misura di 42 foto esistenti appartiene alla produzione ed e' ricevuta dal
mandato. Non e' stata riletta per rispettare il divieto assoluto di accesso al
prod. Sul demo la misura verificabile era 0 prima e 0 dopo.

## Verifiche tecniche

| Verifica | Misura | Esito |
| --- | --- | --- |
| Build finale | Vite 5.4.21, 157 moduli, JS 696.21 kB (gzip 196.46 kB) | PASS |
| `git diff --check` | nessun errore | PASS |
| Sintassi suite | `node --check scripts/rls-tests/run.mjs` | PASS |
| Lint | `eslint` non presente nelle dipendenze (`command not found`) | NON ESEGUIBILE |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## Teardown

Le fixture hanno usato Luna di Mario, sei oggetti Storage al massimo e una
quarta visita temporanea marcata `[DEMO GH-50]`. Ogni ciclo e' stato smontato
nella stessa sessione.

| Oggetto demo | Prima | Dopo | Residui GH-50 |
| --- | ---: | ---: | ---: |
| visite totali | 90 | 90 | 0 |
| `pets.owner_photo_url IS NOT NULL` | 0 | 0 | 0 |
| `visits.photo_url IS NOT NULL` | 0 | 0 | 0 |
| oggetti Storage `gh50-ui-*` | 0 | 0 | 0 |
| sonde auth GH-04/GH-44/GH-49 | 0 | 0 | 0 |

Le due righe audit prodotte dalla sonda GH-44 nella suite completa richiedono
un teardown privilegiato: l'ACL staff ne impedisce correttamente la DELETE.
Sono state eliminate per UUID esatto della sonda prima dei teardown custoditi.

## Eccezioni e fuori istruzione

- Il sandbox locale non risolveva il dominio Supabase; le fixture sono state
  eseguite con rete autorizzata e guardia sul ref demo.
- Il primo ciclo visivo aveva tre visite reali. Per rendere fedelmente gli stati
  CD-05 a quattro e a due foto e' stata aggiunta una visita demo temporanea,
  poi rimossa; il conteggio e' tornato da 91 a 90.
- Durante una transizione la sessione browser della sonda e' stata revocata dal
  logout globale del client usa-e-getta; e' stato eseguito un nuovo login, senza
  perdita o modifica di dati applicativi.
- Nessun segreto e' stato stampato o committato.
- Nessuna modifica fuori istruzione.

## Controllo finale di Luigi

Sul telefono restano da guardare, chiedendosi `cosa non mi torna?`:

1. una scheda senza nessuna foto;
2. una scheda con entrambe le foto, toccando la pastiglia e leggendo la riga;
3. l'album con una fotografia sola a larghezza piena.

## Commit

Commit locale previsto con messaggio `feat: separate pet and visit photos`.
L'hash e' riportato nella risposta finale. Nessun push eseguito.
