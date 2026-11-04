# GH-112 - Interruzione al preflight

## Ripresa del 04/11/2026 alle 12:20-12:21 CET

**Esito: ancora interrotto, per una nuova differenza misurata.** Il collegamento al demo `qttpinkslhenxrsbhhhg` ora funziona: `select 1 as verifica;` ha restituito `1` sia nel SQL Editor sia tramite il connettore Supabase. Il precedente `28P01` non si riproduce. Non e stata cambiata alcuna password o impostazione.

Il progetto dichiara ora il canone **1.3**, coincidente con la fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md` (SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43`, misurato alle 12:21 CET). La base applicativa resta `a9b7f8c`: HEAD `3cbb43b` aggiunge soltanto questo registro (`git diff --name-status a9b7f8c..HEAD`). Nessun file applicativo e cambiato rispetto alla base.

Alle 12:21 CET ho rieseguito **identica** la query di preflight riportata sotto, sul solo demo, con `supabase_execute_sql`. Confronto con le impronte MD5 del prodotto citate da Cowork nel mandato (04/11/2026, 11:30:24 Europe/Rome):

| Oggetto | Prodotto, MD5 citato | Demo, MD5 misurato | Esito |
| --- | --- | --- | --- |
| `complete_appointment_with_visit(text,date,text,text,numeric,uuid)` | `848d3557add8cfc69b1e367dc161ca67` | `848d3557add8cfc69b1e367dc161ca67` | coincide |
| `create_staff_visit(uuid,date,numeric,text,text,numeric,uuid,text)` | `9d87519547e553d211bba15a3845a003` | `9d87519547e553d211bba15a3845a003` | coincide |
| `gh103_finance_bridge()` | `bc62652be087008365c615bee911012d` | **riga assente** | **differisce** |
| `set_staff_appointment_status(text,text)` | `47946d65580eda6691340f0b0ba3deec` | `47946d65580eda6691340f0b0ba3deec` | coincide |

La query restituisce **3 righe, non 4**. In base alla guardia del mandato ("se una riga differisce, fermati"), non ho iniziato l'implementazione e non ho cercato di ricreare la funzione. Serve una decisione documentata su questa assenza: riallineare il demo alla definizione misurata nel prodotto, oppure rettificare il preflight se la funzione non e una premessa di GH-112; poi rifare il confronto. La prima opzione tocca lo schema e non e autorizzata da questa ripresa.

**File e atti della ripresa:** modificato solo questo registro. Nessuna migrazione applicata, fixture, suite RLS, build, lettura del prodotto, push o deploy. Le cartelle private del salone, il mandato e la migrazione non versionati restano intatti e fuori stage. Recuperi: 1 (differenza gia visibile nella query richiesta dal mandato); passaggi richiesti a Luigi: 1 (decisione sul riallineamento); tempo aggiunto dal controllo: circa 1 minuto. Fuori istruzione: nessuno.

## Interruzione originaria del 04/11/2026 alle 12:01-12:03 CET

**Canone adottato dal progetto: 1.2; fonte corrente letta: 1.3 (SHA-256 `f3f6fc1918eb97dce16c75e066ff1bc00fba58113f7a0e84e5e516e005079e43`).** Misura del 04/11/2026, 12:01-12:03 CET, fonte `/Users/luigimaisto/Desktop/_metodo/CANONE.md`. Base effettiva `a9b7f8c64c8bb0b6ba9ead68280700699a40ecb2`, branch `main`, verificata con `git rev-parse HEAD` prima di qualsiasi modifica.

## Esito e confine

La query di preflight prescritta dal mandato, eseguita **due volte sul solo demo `qttpinkslhenxrsbhhhg`** tramite Supabase `execute_sql`, ha restituito in entrambi i casi `FATAL: 28P01: password authentication failed for user "postgres"`. Nessuna riga o MD5 e stata ottenuta. Le quattro impronte di produzione riportate nel mandato restano **citazioni di Cowork del 04/11/2026 alle 11:30:24 Europe/Rome**, non confronti verificati da Codex. Il requisito "rifalla identica sul demo prima di cominciare; se una riga differisce, fermati" non consente di iniziare senza il confronto. Non ho inferito concordanza dai file locali.

Query da rieseguire, identica al mandato:

```sql
select p.oid::regprocedure::text obj, md5(pg_get_functiondef(p.oid)) md5
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('complete_appointment_with_visit','create_staff_visit','set_staff_appointment_status','gh103_finance_bridge')
order by 1;
```

**Ripresa:** ripristinare l'autenticazione PostgreSQL del collegamento al demo, oppure far eseguire a Luigi questa query nel SQL Editor del solo demo e riportare le quattro righe con ora e metodo. Prima di cambiare codice o schema, Codex deve rifare la misura dal proprio collegamento, confrontarla riga per riga con il mandato e fermarsi se diverge. Non occorre inviare password in chat.

## File e atti

| File | Stato |
| --- | --- |
| `docs/consegne/GH-112-un-appuntamento-chiuso-ha-la-sua-visita-esito.md` | Solo questo registro di interruzione. |

Nessun file applicativo o migrazione creato/modificato; nessuna fixture, nessuna scrittura al demo, nessun accesso alla produzione. Nessuna build o suite RLS eseguita, perche l'implementazione non e iniziata. I file non versionati preesistenti, incluso il mandato GH-112, la migrazione di Cowork `supabase/migrations/20261104_gh112_reopen_leo_labrador.sql` e le cartelle private del salone restano fuori da modifiche, stage e commit. Diario intatto. Recuperi: 0; passaggi richiesti a Luigi: 1 (ripristino connessione o risultato della query); tempo aggiunto dal controllo: circa 2 minuti. Fuori istruzione: nessuno. Nessun push, merge o deploy.
