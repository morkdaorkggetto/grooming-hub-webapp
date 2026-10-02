-- GH-109: secondo pet, rifiuto sintetico per Home multi-pet.
insert into public.appointment_requests(id,tenant_id,customer_user_id,pet_id,service_id,desired_date,coat_condition_codes,status)
select '00000000-0000-4000-8109-000000000201',tenant_id,customer_user_id,'00000000-0000-4000-8109-000000000002',service_id,desired_date,coat_condition_codes,'rejected'
from public.appointment_requests where id='00000000-0000-4000-8109-000000000101';
