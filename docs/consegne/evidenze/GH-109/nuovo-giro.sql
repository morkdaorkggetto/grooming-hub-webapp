-- GH-109: nuovo giro, solo richiesta sintetica.
update public.appointment_requests set staff_responded_at=now(), customer_response=null,customer_responded_at=null,chosen_date=null,chosen_time=null,chosen_time_preference=null
where id='00000000-0000-4000-8109-000000000101' and pet_id='00000000-0000-4000-8109-000000000001';
select status,customer_response,alternatives_round from public.appointment_requests where id='00000000-0000-4000-8109-000000000101';
