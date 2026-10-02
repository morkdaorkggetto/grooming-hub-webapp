-- Preparato prima delle scritture; solo le due identita sintetiche GH-109.
begin;
delete from public.appointment_requests where tenant_id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9'
 and pet_id in ('00000000-0000-4000-8109-000000000001','00000000-0000-4000-8109-000000000002');
delete from public.visits where tenant_id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9' and id like 'gh109-probe-%';
delete from public.pets where tenant_id='8ad7489b-15f9-44f5-8d50-cc89506c3ac9'
 and id in ('00000000-0000-4000-8109-000000000001','00000000-0000-4000-8109-000000000002') and qr_token like 'ghp_gh109_probe_%';
commit;
select (select count(*) from public.pets where qr_token like 'ghp_gh109_probe_%') pets,
 (select count(*) from public.visits where id like 'gh109-probe-%') visits,
 (select count(*) from public.appointment_requests where pet_id in ('00000000-0000-4000-8109-000000000001','00000000-0000-4000-8109-000000000002')) requests;
