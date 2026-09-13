-- gh89b_drop_legacy_respond_and_require_time
-- Seconda metà di GH-89. Applicata in produzione (azgehoseiojodltcttfb) il 13/09/2026,
-- DOPO il push e non prima: finché l'app pubblicata era la precedente, la vecchia
-- funzione serviva.
--
-- Prova che ha autorizzato la rimozione: il bundle servito dalla produzione,
-- index-X4vt5R8F.js, contiene `respond_appointment_request_slot` e NON contiene
-- `respond_appointment_request_alternatives`.
--
-- Da applicare al demo (qttpinkslhenxrsbhhhg) dall'editor SQL.

drop function if exists public.respond_appointment_request_alternatives(uuid, text, date, text);

-- L'ora nelle proposte diventa obbligatoria. Le proposte già in tabella senza ora
-- restano rispondibili, perché respond_appointment_request_slot le confronta per fascia.
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
