-- GH-109: due proposte contemporanee sintetiche, senza cambiare vincoli.
insert into public.appointment_requests(id,tenant_id,customer_user_id,pet_id,service_id,desired_date,coat_condition_codes,staff_responded_at,proposed_alternatives,alternatives_round)
select ('00000000-0000-4000-8109-'||lpad(n::text,12,'0'))::uuid,tenant_id,customer_user_id,pet_id,service_id,desired_date,coat_condition_codes,now(),'[{"date":"2026-10-06","time":"09:00","time_preference":"morning"},{"date":"2026-10-07","time":"15:00","time_preference":"afternoon"}]',1
from public.appointment_requests cross join generate_series(102,103) n where id='00000000-0000-4000-8109-000000000101';
