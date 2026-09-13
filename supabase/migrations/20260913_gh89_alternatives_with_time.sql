-- gh89_alternatives_with_time
-- Le alternative proposte dal salone portano l'ora, non più solo la mezza giornata.
-- Richiesta di Davide, 13/09/2026: «puoi venire il 17 settembre alle 17:30».
--
-- Il modello NON cambia: a prenotare resta il salone. Il cliente sceglie uno slot
-- preciso, la richiesta resta 'pending', e l'operatore conferma con un tocco.
--
-- Convivenza deliberata: `respond_appointment_request_alternatives` (4 argomenti,
-- GH-87) resta viva perché l'app in produzione la chiama. Non si può affiancare
-- una versione con lo stesso nome: PostgREST risolve per nome dei parametri e
-- due firme diventerebbero ambigue. La vecchia si toglie con una migrazione
-- separata DOPO che GH-89 è pubblicato.

alter table public.appointment_requests
  add column if not exists chosen_time time;

-- Le proposte accettano (e da ora richiedono) l'ora.
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

    -- L'ora è accettata e validata, ma NON ancora obbligatoria: l'app in
    -- produzione propone senza ora, e renderla obbligatoria adesso impedirebbe
    -- al salone di proporre alternative fino alla pubblicazione di GH-89.
    -- L'obbligo arriva con la migrazione gh89b, dopo il push.
    if (v_alternative ->> 'time') is not null then
      begin
        v_time := (v_alternative ->> 'time')::time;
      exception when others then
        raise exception 'Invalid alternative time' using errcode = '22023';
      end;
    else
      v_time := null;
    end if;

    v_preference := v_alternative ->> 'time_preference';

    if v_date <= current_date or v_preference not in ('morning', 'afternoon') then
      raise exception 'Invalid alternative' using errcode = '22023';
    end if;

    -- Distinte per data E ora: due ore diverse lo stesso giorno sono ammesse.
    -- Senza ora si ricade sulla fascia, come faceva la versione precedente.
    if (v_date::text || ':' || coalesce(v_time::text, v_preference)) = any(v_seen) then
      raise exception 'Alternatives must be distinct' using errcode = '22023';
    end if;
    v_seen := array_append(v_seen, v_date::text || ':' || coalesce(v_time::text, v_preference));

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

-- Nota: la coerenza fra l'ora e la fascia (mattina 9-13 / pomeriggio 13-19) NON è
-- verificabile qui, perché gli orari di apertura vivono in
-- src/shared/tenant/bookingSchedule.js e non in tenants.settings. Resta a carico
-- dell'interfaccia. Coda già aperta: portare gli orari nelle settings.

-- Il cliente risponde a uno slot con l'ora.
create or replace function public.respond_appointment_request_slot(
  p_request_id uuid,
  p_response text,
  p_date date default null,
  p_time time default null,
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
           chosen_time = null,
           chosen_time_preference = null,
           customer_response = 'declined',
           customer_responded_at = now()
     where id = v_request.id
     returning * into v_request;
    return v_request;
  end if;

  if p_date is null then
    raise exception 'A date is required' using errcode = '22023';
  end if;

  -- Compatibilità con le proposte già in tabella, che non hanno l'ora:
  -- se lo slot proposto ha un'ora si confronta quella, altrimenti la fascia.
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

  select coalesce(t.settings #> '{booking_schedule}', '{}'::jsonb)
    into v_settings
  from public.tenants t
  where t.id = v_request.tenant_id;

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

revoke all on function public.respond_appointment_request_slot(uuid, text, date, time, text) from public;
revoke execute on function public.respond_appointment_request_slot(uuid, text, date, time, text) from anon;
grant execute on function public.respond_appointment_request_slot(uuid, text, date, time, text) to authenticated;
