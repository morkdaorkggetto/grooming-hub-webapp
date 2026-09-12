-- gh87_customer_alternative_choice
-- Applicata in produzione (azgehoseiojodltcttfb) il 12/09/2026, versione 20260912165822.
-- Da applicare al demo (qttpinkslhenxrsbhhhg) dall'editor SQL: è idempotente.
--
-- Il cliente può rispondere alle alternative proposte dal salone. Lo stato della
-- richiesta resta 'pending': l'ora la mette il salone, come sempre.
-- Il cliente non ha policy di UPDATE su appointment_requests e non deve averla:
-- questa funzione è l'unico varco, e scrive esattamente quattro colonne.

alter table public.appointment_requests
  add column if not exists chosen_date date,
  add column if not exists chosen_time_preference text,
  add column if not exists customer_response text,
  add column if not exists customer_responded_at timestamptz;

alter table public.appointment_requests
  drop constraint if exists appointment_requests_chosen_time_preference_check,
  add constraint appointment_requests_chosen_time_preference_check
    check (chosen_time_preference is null or chosen_time_preference in ('morning','afternoon'));

alter table public.appointment_requests
  drop constraint if exists appointment_requests_customer_response_check,
  add constraint appointment_requests_customer_response_check
    check (customer_response is null or customer_response in ('accepted','declined'));

create or replace function public.respond_appointment_request_alternatives(
  p_request_id uuid,
  p_response text,
  p_date date default null,
  p_time_preference text default null
)
returns public.appointment_requests
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_request public.appointment_requests;
  v_settings jsonb;
  v_weekday text;
  v_match boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into v_request
  from public.appointment_requests ar
  where ar.id = p_request_id
  for update;

  if not found
     or v_request.customer_user_id <> v_user_id
     or not public.has_tenant_access(v_request.tenant_id, 'customer') then
    raise exception 'Appointment request not available to current customer'
      using errcode = '42501';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Appointment request already resolved' using errcode = '23514';
  end if;

  if pg_catalog.jsonb_array_length(coalesce(v_request.proposed_alternatives, '[]'::jsonb)) = 0 then
    raise exception 'No alternatives were proposed' using errcode = '22023';
  end if;

  if p_response is null or p_response not in ('accepted', 'declined') then
    raise exception 'Invalid response' using errcode = '22023';
  end if;

  if p_response = 'declined' then
    update public.appointment_requests
       set chosen_date = null,
           chosen_time_preference = null,
           customer_response = 'declined',
           customer_responded_at = now()
     where id = v_request.id
     returning * into v_request;
    return v_request;
  end if;

  if p_date is null or p_time_preference is null then
    raise exception 'A date and a time preference are required' using errcode = '22023';
  end if;

  select exists (
    select 1
    from pg_catalog.jsonb_array_elements(v_request.proposed_alternatives) as alt(value)
    where (alt.value ->> 'date')::date = p_date
      and alt.value ->> 'time_preference' = p_time_preference
  ) into v_match;

  if not v_match then
    raise exception 'Chosen slot was not proposed' using errcode = '22023';
  end if;

  if p_date <= current_date then
    raise exception 'Chosen slot is no longer in the future' using errcode = '22023';
  end if;

  select coalesce(t.settings #> '{booking_schedule}', '{}'::jsonb)
    into v_settings
  from public.tenants t
  where t.id = v_request.tenant_id;

  v_weekday := (array[
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday'
  ])[extract(dow from p_date)::integer + 1];

  if coalesce(v_settings -> 'closed_weekdays', '[]'::jsonb) ? v_weekday
     or coalesce(v_settings #> array['closed_time_preferences', v_weekday], '[]'::jsonb) ? p_time_preference then
    raise exception 'Chosen slot falls in a declared closure' using errcode = '22023';
  end if;

  update public.appointment_requests
     set chosen_date = p_date,
         chosen_time_preference = p_time_preference,
         customer_response = 'accepted',
         customer_responded_at = now()
   where id = v_request.id
   returning * into v_request;

  return v_request;
end;
$function$;

-- Il revoke da public non basta: Supabase concede EXECUTE ad anon per default.
revoke all on function public.respond_appointment_request_alternatives(uuid, text, date, text) from public;
revoke execute on function public.respond_appointment_request_alternatives(uuid, text, date, text) from anon;
grant execute on function public.respond_appointment_request_alternatives(uuid, text, date, text) to authenticated;
