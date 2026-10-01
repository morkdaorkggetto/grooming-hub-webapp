-- GH-107, prova mirata autorizzata dal mandato del 1/10/2026. Solo demo qttpinkslhenxrsbhhhg.
begin;
do $$
begin
 if (select md5(settings::text) from public.tenants where id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9') <> '26327442803a6426d07c74c8feca0f33' then
   raise exception 'Impostazioni diverse dalla base misurata: non procedere';
 end if;
end $$;
update public.tenants set settings=jsonb_set(settings,'{fidelity_projection}','{"history_start":"2026-03-06","tiers":["bronze"]}') where id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9';
insert into public.pets(id,tenant_id,customer_id,owner_user_id,name,qr_token)
select ('00000000-0000-4000-8107-'||lpad(n::text,12,'0'))::uuid,'8ad7489b-15f9-44f5-8d50-cc89506c3ac9','82ff8524-4854-4bd5-96cb-a67232ed8a35','578ab8db-6388-4cab-aa1d-58c5b0fb6bb0','[DEMO GH-107] '||n,'ghp_gh107_probe_'||n
from unnest(array[3,4,12,36]) n;
insert into public.visits(id,tenant_id,pet_id,date)
select 'gh107-probe-'||n||'-'||v,'8ad7489b-15f9-44f5-8d50-cc89506c3ac9',('00000000-0000-4000-8107-'||lpad(n::text,12,'0'))::uuid,'2026-09-01'::date
from unnest(array[3,4,12,36]) n cross join lateral generate_series(1,n) v;
commit;
