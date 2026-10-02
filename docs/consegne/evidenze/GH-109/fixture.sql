-- Solo demo qttpinkslhenxrsbhhhg. Fixture GH-109 sotto l'account di prova Mario.
begin;
insert into public.pets(id,tenant_id,customer_id,owner_user_id,name,breed,qr_token)
select ('00000000-0000-4000-8109-'||lpad(n::text,12,'0'))::uuid,
 '8ad7489b-15f9-44f5-8d50-cc89506c3ac9','82ff8524-4854-4bd5-96cb-a67232ed8a35','578ab8db-6388-4cab-aa1d-58c5b0fb6bb0',
 case when n=1 then 'Nina' else 'Briciola' end,'Shih Tzu','ghp_gh109_probe_'||n
from generate_series(1,2) n;
insert into public.visits(id,tenant_id,pet_id,date)
select 'gh109-probe-'||n||'-'||v,'8ad7489b-15f9-44f5-8d50-cc89506c3ac9',('00000000-0000-4000-8109-'||lpad(n::text,12,'0'))::uuid,'2026-09-01'
from generate_series(1,2) n cross join generate_series(1,3) v;
commit;
