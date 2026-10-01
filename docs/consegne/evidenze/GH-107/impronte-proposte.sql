-- GH-107: proposta di query identica per Cowork in produzione e Codex nel demo.
-- Solo metadati, nessun dato cliente. MD5 sulle definizioni, non sugli OID.
-- Non e' una migration. Attendere la meta' produzione prima della suite RLS.
with fingerprints as (
  select 'function' as kind,
    n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')' as name,
    md5(pg_get_functiondef(p.oid)) as md5
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prokind in ('f','p')
  union all
  select 'policy', schemaname||'.'||tablename||'.'||policyname,
    md5(jsonb_build_object('permissive',permissive,'roles',roles,'cmd',cmd,'qual',qual,'with_check',with_check)::text)
  from pg_policies where schemaname in ('public','storage')
  union all
  select 'column',table_schema||'.'||table_name||'.'||column_name,
    md5(jsonb_build_object('type',udt_schema||'.'||udt_name,'nullable',is_nullable,'default',column_default,
      'generated',is_generated,'generation',generation_expression)::text)
  from information_schema.columns where table_schema='public'
)
select kind,name,md5 from fingerprints order by kind,name;
