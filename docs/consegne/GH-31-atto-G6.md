# GH-31 - Atto G6

Stato: **seconda interruzione all'atto 21; atti 4-20 applicati, atto 21 non eseguito**

## Perimetro dichiarato

- Root progetto: `/Users/luigimaisto/Desktop/grooming-hub-web/`
- Worktree Git: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp`
- Branch: `feat/customer-app`
- Base: `2c2a0525b15a4c416c6e3ad27293f30706db7223`
- Progetto Supabase autorizzato: `grooming` (`azgehoseiojodltcttfb`), organizzazione `cponlcsatzifnaubxcbs`
- Progetti esclusi: ogni progetto diverso da `azgehoseiojodltcttfb`
- Push: non autorizzato

## Modifiche parallele preesistenti

Le seguenti modifiche sono attribuite a Cowork/Luigi e restano fuori dallo stage e dal commit GH-31:

- `docs/diario-progetto.md`
- `docs/incarichi/GH-31-atto-G6.md` (la versione locale e' il mandato operativo autorevole)
- `scripts/salva.sh`

`CODEX_HANDOFF.md` non e' un prerequisito: il file non e' mai stato versionato nel worktree e il suo ruolo e' oggi assolto da diario, incarichi e consegne.

## Dump freschi

| Dump | Dimensione | SHA-256 | Esito |
|---|---:|---|---|
| `grooming-prod-dump-20260828.sql` | 29.965 byte | `27c75ce2d01c42387110651243a479ba7e677cb4a712027c62b4be896597c5c7` | conforme; hash identico al dump schema del 21/8 |
| `grooming-prod-data-20260828.sql` | 1.284.135 byte | `26e5886cb6fdee226e6186a7614c2492425e779a5c611d5abc697aece84d0041` | dimensione conforme al mandato |
| `grooming-prod-auth-20260828.sql` | 111.877 byte | `1367d9f6d9a5907506cfbe66afa292e34346bc7418245cd5f39206a2d15d3aa4` | dimensione conforme al mandato |

## Ricetta

- Fonte: `docs/consegne/GH-30-ricetta-g6-ripresa.md`
- Sequenza: 54 atti continui, senza buchi o duplicati
- Catena database Codex: atti 4-45, 42 file
- Impronte locali: 42/42 conformi alla ricetta
- Ordine: incluse le cinque inversioni deliberate documentate dalla ricetta

## Preflight produzione

Eseguito in sola lettura sul solo progetto `azgehoseiojodltcttfb`, stato `ACTIVE_HEALTHY`, PostgreSQL 17.6.1.

| Misura | Atteso | Rilevato | Esito |
|---|---:|---:|---|
| Clienti legacy | 296 | 296 | conforme |
| Visite | 468 | 468 | conforme |
| Contatti | 301 | 301 | conforme |
| Utenti Auth | 6 | 6 | conforme |
| Appuntamenti | 17 | 17 | conforme |
| Profili | 4 | 4 | conforme |
| Oggetti Storage | 51 | 51 | conforme |
| Migrazioni applicate | 10 | 10 | conforme |
| Ultima migrazione | `20260423123000` | `20260423123000` | conforme |

Il preflight non presenta divergenze. La catena G6 e' autorizzata a partire.

## Catena atti 4-45

| Atto | File | SHA-256 | Durata | Esito |
|---:|---|---|---:|---|
| 4 | `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | conforme alla ricetta | 7,824 s | **fallito e annullato**: guardia `Preparazione bloccata: attesi 3 operator legacy, trovati 4.` |

Gli atti 5-45 non sono stati eseguiti. Non sono state tentate correzioni, varianti o ripetizioni.

## Stato prima e dopo l'arresto

Il controllo successivo all'errore e' stato esclusivamente in lettura e ha confermato il rollback completo dell'atto 4.

| Misura | Prima dell'atto 4 | Dopo l'errore | Esito |
|---|---:|---:|---|
| Clienti legacy | 296 | 296 | invariato |
| Visite | 468 | 468 | invariato |
| Contatti | 301 | 301 | invariato |
| Profili | 4 | 4 | invariato |
| Operatori legacy distinti rilevati dalla guardia | non incluso nel preflight numerico | 4 | diverge dall'atteso interno di 3 |
| Migrazioni registrate | 10 | 10 | invariato |
| Ultima migrazione | `20260423123000` | `20260423123000` | invariato |

La divergenza nasce prima di qualunque cambiamento persistente: il file dell'atto 4 contiene una guardia che congela a 3 il numero di utenti Auth distinti collegati a record `clients`, mentre la produzione corrente ne contiene 4. La scelta fra diagnosi e modifica della ricetta spetta a Luigi; nessuna delle due e' stata avviata in questa sessione.

## Emendamento 1 e ripresa

Cowork ha misurato in produzione la causa della divergenza e Luigi ha autorizzato esplicitamente l'Emendamento 1 del mandato. I quattro proprietari di schede legacy esistono fin dal dump del 21/8: due hanno gia un profilo operator, mentre i record di Roby e dell'utente di prova spiegano i due profili mancanti. L'utente di prova viene rimosso integralmente dall'atto 5 prima della costruzione delle membership.

La guardia non e' stata rimossa: la cardinalita attesa e' stata corretta da 3 a 4, mantenendo invariata la soglia di 7 clienti senza telefono.

| File corretto | Impronta precedente | Nuova impronta |
|---|---|---|
| `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | `8e60f6ba5d2d1adc11f4e079d1766527ab08533e5596c1e7203782ef5d5b4ff1` | `8f5d8c65eff4e28eaf4f85b69b828b15e4814ec51c0565e6740b10696cbd762f` |

La nuova impronta e' stata ancorata anche nel §6 di `docs/consegne/GH-30-ricetta-g6-ripresa.md`. Nessun altro atto e' stato modificato. La ripresa parte nuovamente dall'atto 4.

## Ripresa della catena

Il preflight e' stato ripetuto prima della nuova scrittura: 296 `clients`, 468 `visits`, 301 `contacts`, 6 utenti Auth, 17 appuntamenti, 4 profili, 51 oggetti Storage, 4 operatori legacy e 10 migrazioni fino a `20260423123000`. Tutti i valori erano conformi allo stato autorizzato dall'Emendamento 1. Le impronte della catena aggiornata risultavano 42/42 conformi.

| Atto | File | Durata | Esito |
|---:|---|---:|---|
| 4 | `supabase/prod-migrations/20260824110000_prepare_legacy_data_prod.sql` | 6,611 s | riuscito |
| 5 | `supabase/prod-migrations/20260824100000_cleanup_test_records_prod.sql` | 8,191 s | riuscito |
| 6 | `supabase/prod-migrations/20260424120000_split_clients_with_backfill_prod.sql` | 8,814 s | riuscito |
| 7 | `supabase/migrations/20260424121000_tenants.sql` | 25,512 s | riuscito |
| 8 | `supabase/migrations/20260424122000_tenant_memberships.sql` | 5,781 s | riuscito |
| 9 | `supabase/migrations/20260424123000_profiles_auto_create_and_deprecate_role.sql` | 8,072 s | riuscito |
| 10 | `supabase/migrations/20260424124000_helpers_has_tenant_access.sql` | 6,321 s | riuscito |
| 11 | `supabase/migrations/20260424125000_services.sql` | 5,738 s | riuscito |
| 12 | `supabase/migrations/20260424126000_promotions.sql` | 5,632 s | riuscito |
| 13 | `supabase/migrations/20260424130000_tenant_id_nullable_and_backfill.sql` | 6,013 s | riuscito |
| 14 | `supabase/migrations/20260424131000_tenant_id_indexes.sql` | 6,681 s | riuscito |
| 15 | `supabase/migrations/20260424132000_backfill_customers_stub.sql` | 8,715 s | riuscito |
| 16 | `supabase/migrations/20260424133000_tenant_id_enforce_not_null.sql` | 5,663 s | riuscito |
| 17 | `supabase/migrations/20260424140000_rls_tenants.sql` | 5,738 s | riuscito |
| 18 | `supabase/migrations/20260424140500_rls_tenant_memberships.sql` | 7,383 s | riuscito |
| 19 | `supabase/migrations/20260424141000_rls_profiles.sql` | 6,768 s | riuscito |
| 20 | `supabase/migrations/20260424141500_rls_customers.sql` | 8,472 s | riuscito |
| 21 | `supabase/migrations/20260424142000_rls_pets.sql` | 7,059 s | **rifiutato prima dell'esecuzione** |

### Motivo della seconda interruzione

L'atto 21 definisce `pets_customer_update` come `UPDATE` completo sulla riga del pet e dichiara esplicitamente che la whitelist dei campi modificabili e' affidata alla sola UI. L'operazione e' stata rifiutata perche' consentirebbe temporaneamente al customer di modificare anche campi sensibili quali `tenant_id`, `customer_id` e note interne. Nessun SQL dell'atto 21 e' stato eseguito e la migrazione non e' stata registrata.

La procedura GH-31 impone l'arresto al primo errore o rifiuto: gli atti 22-45 non sono stati avviati e non e' stato tentato alcun aggiramento.

### Stato database dopo l'arresto

| Misura | Stato dopo atto 20 |
|---|---:|
| Tabella `clients` | assente, come previsto dopo lo split |
| `customers` | 268 |
| `pets` | 290 |
| `visits` | 466 |
| `contacts` | 295 |
| `profiles` | 3 |
| `tenants` | 1 |
| `tenant_memberships` | 3 |
| utenti Auth | 3 |
| `appointments` | 5 |
| oggetti Storage | 51 |
| migrazioni registrate | 27 |
| ultima migrazione | `g6_20_rls_customers` |

La produzione si trova quindi all'ultimo atto riuscito. Poiche' `clients` e' gia stata rimossa, la finestra prevista dal mandato in cui il frontend precedente non funziona e' aperta. Nessun ripristino e' stato avviato: la decisione spetta a Luigi.

### Soluzione proposta a Cowork, non eseguita

Rendere sicuro l'atto 21 fin dalla sua prima applicazione, portando nel file la stessa whitelist server-side prevista dall'atto 34 (`owner_notes`, `coat_preferences`, `photo_url`) invece di creare una policy volutamente ampia e restringerla tredici atti dopo. L'atto 34 dovra' quindi essere reso idempotente rispetto alla protezione gia presente o trasformato in verifica della guardia. La nuova coppia di file va riprovata sul progetto temporaneo, reimprontata e autorizzata da un nuovo emendamento prima di ripartire dall'atto 21.

## Verifiche finali

Non eseguite, perche' la catena si e' arrestata all'atto 21. La suite RLS, gli Advisor, la prova note, la conferma appuntamento e il postflight sono pertanto fuori dalla presente esecuzione interrotta.

`npm run build` non eseguito: non e' stato modificato codice applicativo e il mandato assegna merge, build, push e promozione a Luigi dopo il completamento della catena. Nessun push e nessun deploy eseguiti.

## Eccezioni e fuori istruzione

Prima eccezione: guardia dell'atto 4 corretta dall'Emendamento 1 dopo la misura documentata dei 4 operatori legacy.

Seconda eccezione: atto 21 rifiutato prima dell'esecuzione per `UPDATE` customer troppo ampio sui pet. L'eccezione e' stata trattata applicando letteralmente la procedura di arresto del mandato.

Nessun file fuori istruzione toccato. Le tre modifiche parallele preesistenti dichiarate sopra restano escluse.

## Commit

Primo commit locale di interruzione: `04144c4` (`docs: record GH-31 production halt`). La ripresa aggiunge il file corretto dell'atto 4, la nuova impronta nella ricetta GH-30 e il presente aggiornamento del registro. Hash definitivo riportato nella comunicazione di chiusura; nessun push.
