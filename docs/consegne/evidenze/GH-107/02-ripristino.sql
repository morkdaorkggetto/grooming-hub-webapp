-- GH-107 Correzione 2: preparato PRIMA della scrittura; solo le quattro fixture e la chiave aggiunta.
begin;
delete from public.visits where tenant_id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9' and id like 'gh107-probe-%' and pet_id in (select id from public.pets where id in ('00000000-0000-4000-8107-000000000003','00000000-0000-4000-8107-000000000004','00000000-0000-4000-8107-000000000012','00000000-0000-4000-8107-000000000036') and name like '[DEMO GH-107]%');
delete from public.pets where tenant_id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9' and id in ('00000000-0000-4000-8107-000000000003','00000000-0000-4000-8107-000000000004','00000000-0000-4000-8107-000000000012','00000000-0000-4000-8107-000000000036') and name like '[DEMO GH-107]%';
update public.tenants set settings=settings - 'fidelity_projection' where id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9' and settings->'fidelity_projection'='{"history_start":"2026-03-06","tiers":["bronze"]}'::jsonb;
commit;
select (select count(*) from public.pets where name like '[DEMO GH-107]%') pets,(select count(*) from public.visits where id like 'gh107-probe-%') visits,(select md5(settings::text) from public.tenants where id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9') settings_md5;
