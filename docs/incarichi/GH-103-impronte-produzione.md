# GH-103 — Impronte di produzione

**Da:** Cowork · **Per:** Codex · **Data:** 27 settembre 2026
**Allegato a** `GH-103-prima-degli-inviti.md`. Correggo il mandato in un punto: ti chiedevo di confrontare produzione e demo, **ma la produzione non la puoi leggere**. Qui c'è la metà che ti mancava, misurata da Cowork in produzione (`azgehoseiojodltcttfb`) il 27/9, **prima di ogni atto GH-103**.

**Esegui la stessa query sul demo** e confronta riga per riga. Se una riga differisce, o c'è da una parte sola, **fermati e scrivilo**: vale la regola del mandato.

## La query

Identica, carattere per carattere:

```sql
select 'function' kind, p.oid::regprocedure::text obj, left(md5(pg_get_functiondef(p.oid)),10) fp
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('complete_appointment_with_visit','accept_customer_invite','resolve_appointment_request_local','respond_appointment_request_slot','submit_appointment_request','unlink_customer_account','has_tenant_any_staff_access')
union all
select 'policy', schemaname||'.'||tablename||' · '||policyname,
 left(md5(concat_ws('|',cmd,roles::text,permissive,coalesce(qual,''),coalesce(with_check,''))),10)
from pg_policies
where (schemaname='public' and tablename in ('visits','services','appointments','appointment_requests','customer_invitations','customers'))
   or (schemaname='storage' and tablename='objects')
union all
select 'bucket', id, case when public then 'public' else 'private' end from storage.buckets
union all
select 'columns', c.table_name, left(md5(string_agg(c.column_name||':'||c.data_type||':'||c.is_nullable||':'||coalesce(c.column_default,''), ',' order by c.column_name)),10)
from information_schema.columns c where c.table_schema='public' and c.table_name in ('visits','services') group by c.table_name
order by 1,2;
```

## Il risultato in produzione

**37 righe.**

| kind | obj | fp |
|---|---|---|
| bucket | client-photos | public |
| bucket | pet-avatars | public |
| columns | services | e624b1f481 |
| columns | visits | 17287e51bd |
| function | accept_customer_invite(text) | fcfe2fc99d |
| function | complete_appointment_with_visit(text,date,text,text,numeric,uuid) | 96951ebfc6 |
| function | has_tenant_any_staff_access(uuid) | 8c96f9e573 |
| function | resolve_appointment_request_local(uuid,text,date,time without time zone,integer) | 16381d6366 |
| function | respond_appointment_request_slot(uuid,text,date,time without time zone,text,date,text) | 1143698888 |
| function | submit_appointment_request(uuid,uuid,uuid,date,text,text[],text,text) | edb2747019 |
| function | unlink_customer_account(uuid) | 80ecaae4fe |
| policy | public.appointment_requests · appointment_requests_customer_insert | 581b64a31d |
| policy | public.appointment_requests · appointment_requests_customer_select | 1550297461 |
| policy | public.appointment_requests · appointment_requests_staff_all | 968a183a47 |
| policy | public.appointments · appointments_customer_request_insert | 23582872a2 |
| policy | public.appointments · appointments_customer_request_update | f1ed235b27 |
| policy | public.appointments · appointments_customer_select | 041c4d6464 |
| policy | public.appointments · appointments_staff_insert | a5ded5dd74 |
| policy | public.appointments · appointments_staff_select | 240bcc2f40 |
| policy | public.appointments · appointments_staff_update | f06969287d |
| policy | public.customer_invitations · customer_invitations_staff_all | e0fc819f2f |
| policy | public.customers · customers_self_select | b8c9802e17 |
| policy | public.customers · customers_self_update | 31a0309a0f |
| policy | public.customers · customers_staff_all | e0fc819f2f |
| policy | public.services · services_customer_select_active | bc179108d6 |
| policy | public.services · services_staff_all | e0fc819f2f |
| policy | public.visits · visits_customer_select | b3c7d726f3 |
| policy | public.visits · visits_staff_all | e0fc819f2f |
| policy | storage.objects · Client photos staff delete | 33a6d34f4e |
| policy | storage.objects · Client photos staff insert | 0ed36b05c7 |
| policy | storage.objects · Client photos staff select | 9a0f1c7fd3 |
| policy | storage.objects · Client photos staff update | a1915d69c9 |
| policy | storage.objects · Pet avatars customer delete | 98afca01bd |
| policy | storage.objects · Pet avatars customer insert | 0ff24b4748 |
| policy | storage.objects · Pet avatars customer select own | eecbee55d2 |
| policy | storage.objects · Pet avatars customer update | 1c771ec018 |
| policy | storage.objects · Pet avatars staff all | 28b34ad878 |

**Nota sull'impronta `e0fc819f2f`**, ripetuta quattro volte: è corretta. Quelle quattro policy hanno la stessa definizione (`has_tenant_any_staff_access(tenant_id)` sia in lettura sia in scrittura), e l'impronta non comprende il nome.

## I 9 orfani di `client-photos`

Misurati da Cowork in produzione il 27/9. Un orfano è un oggetto del bucket che **nessun `pets.photo_url` richiama**. I percorsi contengono solo identificativi, nessun dato personale.

| Percorso | Byte | Creato |
|---|---:|---|
| `4f81673e-5ed9-4f42-b2f8-cbbbfd1b5338/f734153c-ed56-4779-833b-6153f40d28fe-1773349964201.jpg` | 275478 | 2026-03-12 |
| `4f81673e-5ed9-4f42-b2f8-cbbbfd1b5338/5c3a7171-d6fd-4f1c-a01a-a7642537e63c-1773383158634.jpg` | 29986 | 2026-03-13 |
| `cb7f316e-65b0-4419-a6df-56367a3d3c0a/04bc45e9-d5f5-47d5-be43-26115fb970ab-1773492470924.jpg` | 146125 | 2026-03-14 |
| `b4019bf1-048b-4bf8-aecf-c0ef9c11186b/641a8ba7-d47c-4a87-b505-3bb04a968ed5-1774603000800.jpg` | 185007 | 2026-03-27 |
| `cb7f316e-65b0-4419-a6df-56367a3d3c0a/301a4643-3ed8-49fc-920e-ba4ca806a927-1775057002870.jpg` | 117427 | 2026-04-01 |
| `cb7f316e-65b0-4419-a6df-56367a3d3c0a/11c92817-8793-42bf-848f-87cb9344047d-1775646161363.jpg` | 91058 | 2026-04-08 |
| `cb7f316e-65b0-4419-a6df-56367a3d3c0a/11c92817-8793-42bf-848f-87cb9344047d-1775646170869.jpg` | 91058 | 2026-04-08 |
| `cb7f316e-65b0-4419-a6df-56367a3d3c0a/11c92817-8793-42bf-848f-87cb9344047d-1775646170948.jpg` | 91058 | 2026-04-08 |
| `cb7f316e-65b0-4419-a6df-56367a3d3c0a/b5e6f86a-a10e-4057-a75d-69005df429bb-1775649095854.jpg` | 77763 | 2026-04-08 |

**Cosa dice la misura**: in tutti e nove il secondo identificativo, quello del pet, **non corrisponde a nessun pet esistente**. Sono foto di pet cancellati, caricate fra marzo e aprile. Che allora la cancellazione di un pet non togliesse la sua foto è una deduzione, non una misura: oggi `database.js` la toglie. I tre del 8/4 con lo stesso pet e la stessa dimensione sono **tre caricamenti ripetuti dello stesso file** nello stesso minuto.

**Non si cancellano in GH-103.** Dopo il bucket privato nessuno li apre più dall'indirizzo pubblico; la loro rimozione la decide Luigi.

## Se il demo non coincide

**Non riallineare da solo.** Scrivi nel registro d'interruzione quali righe differiscono e il valore del demo. Cowork prepara il file di riallineamento, lo incolla Luigi nel demo, e poi riprendi.
