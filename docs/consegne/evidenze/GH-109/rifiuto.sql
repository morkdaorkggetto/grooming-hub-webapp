-- GH-109: rifiuto sintetico per provare il wizard esistente.
update public.appointment_requests set status='rejected', proposed_alternatives='[]',customer_response=null,customer_responded_at=null,chosen_date=null,chosen_time=null,chosen_time_preference=null where id='00000000-0000-4000-8109-000000000101' and pet_id='00000000-0000-4000-8109-000000000001';
