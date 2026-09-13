-- gh91_decline_carries_a_date
-- Il rimpallo fra salone e persona ha una fine, e un rifiuto porta informazione.
-- Trovato da Luigi il 13/09/2026 usando GH-90 in produzione.
--
-- Due cambi:
--   1. `alternatives_round` conta quante volte il salone ha proposto. Oggi non
--      esiste modo di saperlo: senza contatore l'app non può smettere di offrire
--      il rifiuto dopo il secondo giro.
--   2. rifiutare può portare una nuova data desiderata, così il salone non deve
--      indovinare di nuovo. La data nuova sostituisce quella vecchia: la richiesta
--      è la domanda della persona, ed è legittimo che cambi.

alter table public.appointment_requests
  add column if not exists alternatives_round smallint not null default 0;

-- propose: incrementa il giro. Resto identico a gh89b.
create or replace function public.propose_appointment_request_alternatives(
  p_request_id uuid,
  p_alternatives jsonb
)
returns public.appointment_requests
language plpgsql
set search_path to ''
as $function$
declare
  v_request public.appointment_requests;
  v_settings jsonb;
  v_alternative jsonb;
  v_date date;
  v_time time;
  v_preference text;
  v_weekday text;
  v_seen text[] := array[]::text[];
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into v_request
  from public.appointment_requests ar
  where ar.id = p_request_id
  for update;

  if not found or not public.has_tenant_any_staff_access(v_request.tenant_id) then
    raise exception 'Appointment request not available to current staff user'
      using errcode = '42501';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Appointment request already resolved' using errcode = '23514';
  end if;

  if jsonb_typeof(p_alternatives) <> 'array'
     or jsonb_array_length(p_alternatives) not in (2, 3) then
    raise exception 'Choose two or three alternatives' using errcode = '22023';
  end if;

  select coalesce(t.settings #> '{booking_schedule}', '{}'::jsonb)
    into v_settings
  from public.tenants t
  where t.id = v_request.tenant_id;

  for v_alternative in select value from jsonb_array_elements(p_alternatives)
  loop
    begin
      v_date := (v_alternative ->> 'date')::date;
    exception when others then
      raise exception 'Invalid alternative date' using errcode = '22023';
    end;

    if (v_alternative ->> 'time') is null then
      raise exception 'Each alternative needs a time' using errcode = '22023';
    end if;
    begin
      v_time := (v_alternative ->> 'time')::time;
    exception when others then
      raise exception 'Invalid alternative time' using errcode = '22023';
    end;

    v_preference := v_alternative ->> 'time_preference';

    if v_date <= current_date or v_preference not in ('morning', 'afternoon') then
      raise exception 'Invalid alternative' using errcode = '22023';
    end if;

    if (v_date::text || ':' || v_time::text) = any(v_seen) then
      raise exception 'Alternatives must be distinct' using errcode = '22023';
    end if;
    v_seen := array_append(v_seen, v_date::text || ':' || v_time::text);

    v_weekday := (array[
      'sunday', 'monday', 'tuesday', 'wednesday',
      'thursday', 'friday', 'saturday'
    ])[extract(dow from v_date)::integer + 1];

    if coalesce(v_settings -> 'closed_weekdays', '[]'::jsonb) ? v_weekday
       or coalesce(v_settings #> array['closed_time_preferences', v_weekday], '[]'::jsonb) ? v_preference then
      raise exception 'Alternative falls in a declared closure' using errcode = '22023';
    end if;
  end loop;

  update public.appointment_requests
     set proposed_alternatives = p_alternatives,
         staff_responded_at = now(),
         alternatives_round = coalesce(alternatives_round, 0) + 1,
         chosen_date = null,
         chosen_time = null,
         chosen_time_preference = null,
         customer_response = null,
         customer_responded_at = null
   where id = v_request.id
   returning * into v_request;

  return v_request;
end;
$function$;

-- respond: rifiutando si può indicare una nuova data desiderata.
create or replace function public.respond_appointment_request_slot(
  p_request_id uuid,
  p_response text,
  p_date date default null,
  p_time time default null,
  p_time_preference text default null,
  p_new_desired_date date default null,
  p_new_time_preference text default null
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

  select coalesce(t.settings #> '{booking_schedule}', '{}'::jsonb)
    into v_settings
  from public.tenants t
  where t.id = v_request.tenant_id;

  if p_response = 'declined' then
    -- La nuova data, se indicata, deve reggere gli stessi controlli di una
    -- richiesta nuova: futura e non in una chiusura dichiarata.
    if p_new_desired_date is not null then
      if p_new_desired_date <= current_date then
        raise exception 'New desired date must be in the future' using errcode = '22023';
      end if;

      if p_new_time_preference is not null
         and p_new_time_preference not in ('morning', 'afternoon', 'flexible') then
        raise exception 'Invalid time preference' using errcode = '22023';
      end if;

      v_weekday := (array[
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday'
      ])[extract(dow from p_new_desired_date)::integer + 1];

      if coalesce(v_settings -> 'closed_weekdays', '[]'::jsonb) ? v_weekday then
        raise exception 'New desired date falls in a declared closure' using errcode = '22023';
      end if;

      if p_new_time_preference is not null
         and coalesce(v_settings #> array['closed_time_preferences', v_weekday], '[]'::jsonb) ? p_new_time_preference then
        raise exception 'New desired date falls in a declared closure' using errcode = '22023';
      end if;
    end if;

    update public.appointment_requests
       set chosen_date = null,
           chosen_time = null,
           chosen_time_preference = null,
           customer_response = 'declined',
           customer_responded_at = now(),
           desired_date = coalesce(p_new_desired_date, desired_date),
           time_preference = case
             when p_new_desired_date is not null then p_new_time_preference
             else time_preference
           end
     where id = v_request.id
     returning * into v_request;
    return v_request;
  end if;

  if p_date is null then
    raise exception 'A date is required' using errcode = '22023';
  end if;

  select exists (
    select 1
    from pg_catalog.jsonb_array_elements(v_request.proposed_alternatives) as alt(value)
    where (alt.value ->> 'date')::date = p_date
      and (
        case
          when (alt.value ->> 'time') is not null
            then p_time is not null and (alt.value ->> 'time')::time = p_time
          else p_time_preference is not null
               and alt.value ->> 'time_preference' = p_time_preference
        end
      )
  ) into v_match;

  if not v_match then
    raise exception 'Chosen slot was not proposed' using errcode = '22023';
  end if;

  if p_date <= current_date then
    raise exception 'Chosen slot is no longer in the future' using errcode = '22023';
  end if;

  v_weekday := (array[
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday'
  ])[extract(dow from p_date)::integer + 1];

  if coalesce(v_settings -> 'closed_weekdays', '[]'::jsonb) ? v_weekday then
    raise exception 'Chosen slot falls in a declared closure' using errcode = '22023';
  end if;

  if p_time_preference is not null
     and coalesce(v_settings #> array['closed_time_preferences', v_weekday], '[]'::jsonb) ? p_time_preference then
    raise exception 'Chosen slot falls in a declared closure' using errcode = '22023';
  end if;

  update public.appointment_requests
     set chosen_date = p_date,
         chosen_time = p_time,
         chosen_time_preference = p_time_preference,
         customer_response = 'accepted',
         customer_responded_at = now()
   where id = v_request.id
   returning * into v_request;

  return v_request;
end;
$function$;

-- La firma cambia: la versione a 5 argomenti va rimossa, altrimenti PostgREST
-- trova due candidati e la chiamata diventa ambigua. Si può fare subito perché
-- il client pubblicato passa argomenti per nome e la nuova firma li accetta tutti.
drop function if exists public.respond_appointment_request_slot(uuid, text, date, time, text);

revoke all on function public.respond_appointment_request_slot(uuid, text, date, time, text, date, text) from public;
revoke execute on function public.respond_appointment_request_slot(uuid, text, date, time, text, date, text) from anon;
grant execute on function public.respond_appointment_request_slot(uuid, text, date, time, text, date, text) to authenticated;
