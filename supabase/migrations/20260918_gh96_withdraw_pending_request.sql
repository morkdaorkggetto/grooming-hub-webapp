-- gh96_withdraw_pending_request
-- Il proprietario può ritirare la propria richiesta finché il salone non l'ha gestita.
-- Deciso con Luigi il 18/09/2026: la finestra non è un numero di ore, è un confine
-- naturale — si corregge finché nessuno ha ancora risposto.
--
-- Dopo la conferma NON si disdice dall'app: si scrive al salone. Decisione presa
-- guardando i numeri di produzione — 9 assenze e 10 annullamenti su 278 appuntamenti:
-- rendere la disdetta costosa sposterebbe gli annullamenti nella colonna delle
-- assenze, dove il posto resta vuoto davvero.
--
-- Il punteggio no_show resta quello che è: lo mette il salone, a mano, a chi non si
-- presenta. Non viene automatizzato e non viene toccato qui.

alter table public.appointment_requests
  add column if not exists withdrawn_at timestamptz;

alter table public.appointment_requests
  drop constraint if exists appointment_requests_status_valid,
  add constraint appointment_requests_status_valid
    check (status = any (array['pending'::text, 'approved'::text, 'rejected'::text, 'withdrawn'::text]));

-- appointment_requests_resolution_consistent impone appointment_id null se lo stato
-- non è 'approved': una richiesta ritirata non ne ha mai avuto uno, quindi regge.

create or replace function public.withdraw_appointment_request(p_request_id uuid)
returns public.appointment_requests
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_request public.appointment_requests;
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

  -- Il confine: finché il salone non l'ha gestita.
  if v_request.status <> 'pending' then
    raise exception 'Appointment request already resolved'
      using errcode = '23514', detail = 'GH96_ALREADY_RESOLVED';
  end if;

  if v_request.appointment_id is not null then
    raise exception 'Appointment already created'
      using errcode = '23514', detail = 'GH96_APPOINTMENT_EXISTS';
  end if;

  update public.appointment_requests
     set status = 'withdrawn',
         withdrawn_at = now()
   where id = v_request.id
   returning * into v_request;

  return v_request;
end;
$function$;

revoke all on function public.withdraw_appointment_request(uuid) from public;
revoke execute on function public.withdraw_appointment_request(uuid) from anon;
grant execute on function public.withdraw_appointment_request(uuid) to authenticated;
