# GH-102 — Cosa puo raggiungere un cliente

## Esito: interruzione motivata, lancio non validato

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
