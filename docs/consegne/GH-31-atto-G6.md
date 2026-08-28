# GH-31 - Atto G6

Stato: **interrotto all'atto 4; nessuna modifica persistita sul database**

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

## Verifiche finali

Non eseguite, perche' la catena non ha superato il primo atto. La suite RLS, gli Advisor, la prova note, la conferma appuntamento e il postflight sono pertanto fuori dalla presente esecuzione interrotta.

`npm run build` non eseguito: non e' stato modificato codice applicativo e il mandato assegna merge, build, push e promozione a Luigi dopo il completamento della catena. Nessun push e nessun deploy eseguiti.

## Eccezioni e fuori istruzione

Unica eccezione rilevata: guardia dell'atto 4 non conforme allo stato vivo di produzione (4 operatori legacy rilevati contro 3 attesi). L'eccezione e' stata trattata applicando letteralmente la procedura di arresto del mandato.

Nessun file fuori istruzione toccato. Le tre modifiche parallele preesistenti dichiarate sopra restano escluse.

## Commit

Commit locale `docs: record GH-31 production halt`; hash definitivo riportato nella comunicazione di chiusura. Include esclusivamente questo file; nessun push.
