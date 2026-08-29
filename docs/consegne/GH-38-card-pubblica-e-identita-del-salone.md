# Consegna GH-38 - Card pubblica e identita del salone

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree applicativo: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base dichiarata: `e21349f`.
- Database ammesso e usato: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`).
- Produzione `azgehoseiojodltcttfb`: fuori perimetro, non letta e non scritta.
- Rotta mantenuta: `/client-card/:qrToken`; nessuna rotta nuova.
- Nessun push, merge o deploy.

## Esito

GH-38 e' completato. La card pubblica usa la composizione CD-04, legge nome e
telefono dal tenant del pet, nasconde WhatsApp quando il recapito manca e
mantiene l'accesso pubblico anonimo. Il QR viene generato interamente nel
browser, senza inviare il token a servizi esterni. I materiali CD-04 sono stati
versionati nell'handoff customer, non in quello staff.

La frase `Vedi le visite di {nome}` e' stata conservata dopo verifica del
consumer reale: `/u/pet/:petId` legge e rende lo storico con `usePetVisits`.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `package.json` | modificato | Aggiunge `qrcode-generator@2.0.4`, versione esatta e licenza MIT. |
| `package-lock.json` | modificato | Blocca la dipendenza QR senza dipendenze runtime transitive. |
| `design_handoff_customer_app/cd04-public-card/CD-04 Card Pubblica.html` | aggiunto | Canvas CD-04 originale versionato. |
| `design_handoff_customer_app/cd04-public-card/CD-04-handoff.md` | aggiunto | Handoff CD-04 originale versionato. |
| `design_handoff_customer_app/cd04-public-card/cd04-card-kit.jsx` | aggiunto | Kit di composizione CD-04 originale. |
| `design_handoff_customer_app/cd04-public-card/cd04-card-note.jsx` | aggiunto | Tavole e decisioni CD-04 originali. |
| `design_handoff_customer_app/cd04-public-card/cd04-card-viste.jsx` | aggiunto | Cinque stati CD-04 e confronto storico, solo come materiale di handoff. |
| `src/apps/customer/pages/Book.jsx` | modificato | Legge il telefono tenant per richiesta e fallback; nasconde il gesto se assente. |
| `src/apps/customer/pages/Home.jsx` | modificato | Rimuove il numero finto e usa il telefono tenant per aggiungere un pet. |
| `src/apps/staff/components/ClientQrImage.jsx` | aggiunto | Risolve in locale il QR asincrono mantenendo dimensioni stabili a schermo e stampa. |
| `src/apps/staff/lib/database.js` | modificato | Espone le due proiezioni pubbliche card e identita salone. |
| `src/apps/staff/lib/qrCode.js` | modificato | Sostituisce `api.qrserver.com` con matrice QR locale e canvas a dimensione arbitraria. |
| `src/apps/staff/lib/whatsapp.js` | modificato | Rimuove numero e variabile build globali; tutti i generatori ricevono il telefono tenant. |
| `src/apps/staff/pages/ClientCard.jsx` | modificato | Usa il QR locale a 280 px e attende quello a 900 px per il PNG. |
| `src/apps/staff/pages/ClientDetail.jsx` | modificato | Usa il componente QR locale nella scheda staff. |
| `src/apps/staff/pages/CustomerPortal.jsx` | modificato | Propaga il telefono tenant alle superfici WhatsApp del portale storico e le nasconde se assente. |
| `src/apps/staff/pages/PublicPetCard.jsx` | modificato | Implementa i sei componenti CD-04, i cinque stati, il ruolo del visitatore e lo stato token non valido. |
| `src/apps/staff/pages/PublicPetCard.css` | aggiunto | Colonna 390 px, medaglione 132 px, gesti minimi 54 px e ancoraggio in fondo. |
| `src/shared/tenant/config.js` | aggiunto | Centralizza lo slug del tenant pilota gia deliberato. |
| `src/shared/tenant/contact.js` | aggiunto | Estrae il recapito WhatsApp dalle impostazioni tenant senza ripieghi. |
| `src/shared/tenant/TenantProvider.jsx` | modificato | Riusa lo slug centralizzato senza cambiare il contratto del provider. |
| `src/shared/tokens/tokens.css` | modificato | Porta a runtime i tre token metallici gia dichiarati e approvati in GH-15. |
| `supabase/migrations/20260829091550_gh38_public_card_tenant_identity.sql` | aggiunto | Salva il telefono demo, corregge `get_public_pet_card` e aggiunge la proiezione pubblica minima per lo stato invalido. |
| `docs/consegne/GH-38-card-pubblica-e-identita-del-salone.md` | aggiunto | Registro unico della consegna. |

Nessun altro file e' stato creato o modificato da Codex.

## Database demo

- Migration applicata e ledger locale/remoto allineato alla versione
  `20260829091550`, nome `gh38_public_card_tenant_identity`.
- `tenants.name`: `Grooming HUB`.
- `tenants.settings.whatsapp_phone`: `393332979797` dopo tutte le prove.
- `get_public_pet_card(text)` mantiene firma `jsonb`, owner e ACL:
  `anon`, `authenticated`, `service_role` conservano `EXECUTE`.
- La funzione restituisce in piu' `salonPhone` e `firstVisitDate`; il nome
  pubblico arriva dal tenant collegato al pet, non da `profiles`.
- Controprova isolata: pet fixture con proprietario sonda avente
  `profiles.business_name = [DEMO] Sonda staff GH-04`; la card ha restituito
  `businessName = Grooming HUB`, uguale a `tenants.name`.
- `get_public_salon_identity(text)` espone ai soli ruoli applicativi nome e
  telefono, necessari allo stato con token non valido; non espone l'intero
  oggetto `settings`.
- Chiamata diretta con sola anon key a `get_public_pet_card`: PASS, nessuna
  sessione, `Luna`, `Grooming HUB`, telefono presente.

## QR locale

- Libreria finale: `qrcode-generator@2.0.4`, MIT, nessuna dipendenza runtime.
- Il pacchetto costruito e i sorgenti eseguibili non contengono
  `api.qrserver.com`.
- La card ha reso correttamente con tutte le richieste di rete esterne
  bloccate; non e' stata osservata alcuna richiesta QR o immagine verso terzi.
  Il font Google e' stato volutamente bloccato nella prova e il fallback locale
  ha mantenuto la composizione.
- QR a schermo: PNG data URL locale, `280x280`.
- QR per stampa: PNG data URL locale, `900x900`.
- PNG retro card scaricato: `retro-card-luna.png`.
- Vision/macOS ha riletto dai tre file immagine lo stesso contenuto, senza
  dedurlo dal sorgente:
  `http://127.0.0.1:4175/client-card/ghp_aa50feee90304fb6a72666fca7aa332b`.
  La sola differenza rispetto alla prova precedente e' l'origine del server
  locale attivo; path e token sono identici al contratto storico.
- Bundle JS prima: `645.34 kB`, gzip `179.70 kB`.
- Bundle JS dopo: `664.83 kB`, gzip `187.76 kB`.
- Incremento: `19.49 kB`, gzip `8.06 kB`.
- La prima candidata `qrcode@1.5.4` e' stata scartata prima della chiusura per
  le dipendenze CLI transitive; non resta nel lockfile.

## Stati CD-04 e geometria

| Stato | Dato demo | Esito vivo |
| --- | --- | --- |
| Norma, nessuna foto | Luna, 3 visite | Medaglione neutro, relazione `E' venuto 3 volte da noi`, primo mese visibile. |
| Zero visite | `[DEMO GH-38] Prima visita` | Copy approvato `Non ci siamo ancora conosciuti...`. |
| Con foto | `[DEMO GH-38] Con foto` | Immagine dentro lo stesso medaglione, forma invariata. |
| Con livello | `[DEMO GH-38] Livello`, 100 punti | Tier Bronzo e anello `--tier-bronze` resi. |
| Accesso attivo | login Mario, card Luna | Il solo secondo gesto diventa `Entra nella sua pagina`. |
| Token non valido | `gh38_token_non_valido` | Insegna, frase sobria e gesto WhatsApp resi; stato dichiarato provvisorio per CD-05. |

- Telefono `390x844`: shell `390x844`, scroll `844`, quindi nessuno scroll;
  i due gesti misurano `56.3125 px` e il blocco resta in fondo.
- Desktop `1280x900`: shell centrata `390x720`, mai divisa in due colonne.
- Stato con nome fixture lungo verificato senza sovrapposizioni; il secondo
  gesto cresce a `75.6875 px` invece di tagliare il testo.
- Nessun target interattivo sotto 54 px.
- Nessuna barra di progressione e nessun verde WhatsApp nella card.
- Nessun token concettuale nuovo: `--tier-bronze`, `--tier-silver` e
  `--tier-gold` erano gia' nei materiali GH-15 ma mancavano dal CSS caricato;
  sono stati sincronizzati con gli stessi nomi e valori.
- Numero assente: rimosso temporaneamente con ripristino garantito; DOM con
  `0` link `wa.me`, `0` copy WhatsApp e secondo gesto ancora presente. Il
  telefono e' stato ripristinato prima della chiusura.
- Nessun numero e nessun ripiego WhatsApp resta sotto `src/`; il valore
  configurato compare soltanto nella migration che lo scrive nel tenant.

## Verifiche finali

- `npm run build`: PASS, Vite 5.4.21, 152 moduli trasformati.
- `git diff --check`: PASS.
- Browser anonimo finale, telefono e desktop: contenuto presente, nessun
  overlay Vite e nessun errore console.
- Suite RLS demo: `30 PASS, 0 FAIL, 1 SKIP`; SKIP previsto per secondo tenant
  assente. Baseline staff misurata: 7 pet.
- `npm run lint`: non eseguibile nella base, `eslint: command not found`.
- `npm audit --omit=dev`: 4 finding runtime preesistenti (`react-router*` e
  `ws`: 3 moderate, 1 high); `qrcode-generator` non compare nei finding.
- Advisor Security: 8 warning, nessun errore. I due warning
  `anon_security_definer_function_executable` riguardano le due proiezioni
  intenzionalmente pubbliche; l'Advisor segnala anche 5 routine autenticate e
  la protezione password trapelate disattivata. Riferimenti:
  [lint SECURITY DEFINER pubblico](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable),
  [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- Advisor Performance: 110 warning preesistenti (`15 auth_rls_initplan`,
  `15 unused_index`, `80 multiple_permissive_policies`); nessuna tabella,
  policy o indice e' stato modificato da GH-38. Riferimento:
  [RLS init plan](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select).

## Fixture e teardown

- Fixture GH-38 create sul solo demo: tre pet per zero visite, foto e livello;
  un movimento premio; aggiornamento temporaneo e ripristinato del telefono.
- Sonda staff GH-04 ricreata esclusivamente per identita proprietario, suite
  RLS e prova QR staff; nessun account reale modificato.
- Stato finale: `0` pet GH-38, `0` reward GH-38, `0` pet/visite marker suite,
  `0` auth user sonda, `0` identity, `0` profilo e `0` membership sonda.
- Baseline demo finale: 7 pet. Telefono tenant finale: `393332979797`.

## Eccezioni e fuori istruzione

- Lo stato token non valido e' una composizione provvisoria esplicitamente
  destinata a CD-05. Per renderlo utile senza hardcode e' stata aggiunta la
  proiezione pubblica minima `get_public_salon_identity`; il warning Advisor e'
  intenzionale e circoscritto ai due dati pubblici.
- Il comando lint non e' stato riparato perche' richiederebbe una dipendenza
  fuori mandato.
- Per le prove visive e' stato installato Chromium Playwright nella cache
  locale Codex, fuori dal repository e senza modifiche al prodotto.
- La produzione non e' stata consultata ne' modificata. Nessun push, merge o
  deploy. Nessuna attivita fuori perimetro applicativo.

## Passo umano di Luigi

1. Inquadrare un cartoncino gia' stampato: l'insegna deve dire il nome del
   salone.
2. Sul telefono, arrivare in fondo senza scorrere e toccare WhatsApp con il
   pollice.
3. Aprire la card di un cane senza foto e valutare il medaglione nel suo caso
   normale.
