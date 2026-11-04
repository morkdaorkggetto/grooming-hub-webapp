# GH-112 - Interruzione al preflight

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
