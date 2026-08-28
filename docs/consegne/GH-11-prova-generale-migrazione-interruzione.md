# GH-11 - Prova generale migrazione: interruzione ai prerequisiti

**Stato:** interrotto correttamente prima della Fase 1
**Data:** 24 agosto 2026
**Branch:** `feat/customer-app`
**Base dichiarata:** `a72daadd286c449fdc269b6ddb94caa68481f9e3`
**Commit:** commit documentale GH-11; hash riportato nella risposta per evitare
un riferimento circolare
**Database interrogati o modificati:** nessuno
**Push:** non eseguito

## Mandato letto

Fonte: `docs/incarichi/GH-11-prova-generale-migrazione.md`.

Il mandato richiede, prima di qualsiasi restore:

1. i tre dump prod del 21/8 sulla Scrivania;
2. un progetto Supabase temporaneo `grooming-prova-generale` creato da Luigi
   nell'organizzazione free;
3. accesso Codex al temporaneo con lo stesso meccanismo del demo.

Il progetto e dichiarato usa-e-getta, ma la sua creazione resta espressamente
un gesto di Luigi. Codex non e autorizzato a sostituirsi a quel gesto.

## Verifiche eseguite

### Git

- branch corretta `feat/customer-app`;
- worktree iniziale pulito;
- HEAD locale `a72daadd286c449fdc269b6ddb94caa68481f9e3`, un commit
  avanti a `origin/feat/customer-app` per GH-10 non ancora pushato;
- nessuna modifica locale inattesa.

### Dump

| File | Dimensione | SHA-256 | Esito |
|---|---:|---|---|
| `grooming-prod-dump-20260821.sql` | 29.965 byte | `27c75ce2d01c42387110651243a479ba7e677cb4a712027c62b4be896597c5c7` | presente, SQL testuale ASCII |
| `grooming-prod-data-20260821.sql` | 1.327.527 byte | `c2c7fdb64edabc4d925814896fc0542382a1e6535c06645498a9c612678bd3a6` | presente, SQL testuale ASCII |
| `grooming-prod-auth-20260821.sql` | 117.907 byte | `7e3ac7d775f2e195cac892df0cf68101b61c737e3716c49407969c0bb7e5f3c6` | presente, SQL testuale ASCII |

Il dump schema crea le otto tabelle pubbliche pre-Gate 2 attese:
`appointments`, `clients`, `contacts`, `customer_client_links`,
`customer_invitations`, `profiles`, `reward_points`, `visits`.

Il dump dati contiene atti per quelle tabelle, Storage e Auth; il dump Auth
contiene gli atti Auth separati. Nessuna riga Auth, hash password, token o altro
contenuto sensibile e stato stampato o copiato nel repository.

### Accesso Supabase

La lista progetti accessibile via collegamento Supabase restituisce soltanto:

- `grooming-hub-demo`, ref `qttpinkslhenxrsbhhhg`, stato
  `ACTIVE_HEALTHY`.

Il progetto `grooming-prova-generale` non e presente e non e accessibile.
Demo e produzione non sono stati interrogati oltre alla lista dei progetti;
nessuna query o modifica dati e stata eseguita.

## Blocco misurato

La Fase 1 non puo iniziare: manca il progetto temporaneo previsto dai
prerequisiti. Un restore sul demo violerebbe il perimetro e rischierebbe di
sovrascrivere l'ambiente di lavoro; un restore sul prod e esplicitamente
vietato. Creare autonomamente un progetto introdurrebbe inoltre un costo e
contraddirebbe il gesto assegnato a Luigi.

Questa e quindi un'interruzione valida, non un fallimento della catena.

## Soluzione consigliata a Luigi e Cowork

1. Luigi crea `grooming-prova-generale` nell'organizzazione free
   `morkdaorkggetto's Org`, senza collegamento GitHub e con password DB salvata
   nel password manager.
2. Attende lo stato `ACTIVE_HEALTHY` e comunica a Codex soltanto il nuovo
   project ref; non deve incollare la password in chat o nel repository.
3. Verifica che il progetto compaia nello stesso collegamento Supabase usato
   per il demo. Se non compare, concede accesso al progetto al medesimo account
   OAuth.
4. Codex riprende dalla stessa base Git e dichiara nuovamente le impronte dei
   dump prima del restore.

Metodo restore raccomandato alla ripresa: usare il collegamento Supabase OAuth
sul solo progetto temporaneo, applicando schema, dati e Auth nell'ordine del
mandato e annotando durata e cardinalita dopo ogni atto. La CLI Supabase 2.75.0
e disponibile, ma non va collegata con password in shell se il canale OAuth e
sufficiente. Se il payload dati richiede suddivisione, spezzare solo ai confini
degli statement SQL, mai dentro un `INSERT` o una transazione.

## Controprove da eseguire alla ripresa

- project ref verificato e diverso da demo e prod;
- restore schema -> dati -> Auth senza errori ignorati;
- cardinalita 296 `clients`, 464 `visits`, 301 `contacts`, 6 utenti;
- impronte e durata di ogni atto;
- catena prod-safe, preflight GH-07-bis, casi manuali risolti, suite RLS,
  smoke app e teardown come da mandato.

## File esaustivi

| File | Intervento | Commit |
|---|---|---|
| `docs/consegne/GH-11-prova-generale-migrazione-interruzione.md` | registro del prerequisito mancante e procedura di ripresa | questo commit |

## Eccezioni e fuori istruzione

- Nessuna migration, seed, query, restore, build, login, deploy o push.
- Nessun progetto creato, trasferito, pausato o eliminato.
- Nessun file applicativo o dump modificato.
- Nessun secret letto, scritto o committato.
- Le cardinalita dei dump non sono state dichiarate come verificate: vanno
  misurate sul database dopo il restore, come prescritto dal mandato.
