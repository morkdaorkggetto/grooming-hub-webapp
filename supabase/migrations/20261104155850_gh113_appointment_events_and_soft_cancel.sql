-- GH-113, source: docs/incarichi/GH-113-niente-sparisce-dall-agenda.md.
-- The legacy RPC name and argument are retained for the already deployed client.

create table if not exists public.appointment_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default clock_timestamp(),
  actor_user_id uuid,
  action text not null check (action in ('SNAPSHOT', 'PET_NAME', 'INSERT', 'UPDATE', 'DELETE')),
  appointment_id text not null,
  tenant_id uuid not null,
  pet_id uuid,
  pet_name text not null,
  before_state jsonb,
  after_state jsonb
);

create index if not exists appointment_events_tenant_time_idx
  on public.appointment_events (tenant_id, occurred_at desc);
create index if not exists appointment_events_appointment_idx
  on public.appointment_events (appointment_id, id desc);

alter table public.appointment_events enable row level security;
revoke all on public.appointment_events from public, anon, authenticated, service_role;
grant select on public.appointment_events to authenticated;
drop policy if exists appointment_events_staff_select on public.appointment_events;
create policy appointment_events_staff_select on public.appointment_events
  for select to authenticated
  using (public.has_tenant_any_staff_access(tenant_id));

-- Preserve the pet's name for appointments predating this trigger, including cascades.
insert into public.appointment_events
  (action, appointment_id, tenant_id, pet_id, pet_name, after_state)
select 'SNAPSHOT', a.id, a.tenant_id, a.pet_id, coalesce(p.name, '[pet non disponibile]'),
       jsonb_build_object(
         'status', a.status, 'scheduled_at', a.scheduled_at,
         'duration_minutes', a.duration_minutes, 'service_id', a.service_id,
         'pet_id', a.pet_id, 'notes', a.notes)
from public.appointments a
left join public.pets p on p.id = a.pet_id
where not exists (
  select 1 from public.appointment_events e where e.appointment_id = a.id
);

create or replace function public.gh113_capture_appointment_event()
returns trigger language plpgsql security definer set search_path = '' as $function$
declare
  v_row public.appointments%rowtype;
  v_before jsonb;
  v_after jsonb;
  v_pet_name text;
begin
  if tg_op = 'DELETE' then
    v_row := old;
  else
    v_row := new;
  end if;

  if tg_op <> 'INSERT' then
    v_before := jsonb_build_object(
      'status', old.status, 'scheduled_at', old.scheduled_at,
      'duration_minutes', old.duration_minutes, 'service_id', old.service_id,
      'pet_id', old.pet_id, 'notes', old.notes);
  end if;
  if tg_op <> 'DELETE' then
    v_after := jsonb_build_object(
      'status', new.status, 'scheduled_at', new.scheduled_at,
      'duration_minutes', new.duration_minutes, 'service_id', new.service_id,
      'pet_id', new.pet_id, 'notes', new.notes);
  end if;

  select p.name into v_pet_name from public.pets p where p.id = v_row.pet_id;
  if v_pet_name is null then
    select e.pet_name into v_pet_name
    from public.appointment_events e
    where e.appointment_id = v_row.id
    order by e.id desc limit 1;
  end if;

  insert into public.appointment_events
    (actor_user_id, action, appointment_id, tenant_id, pet_id, pet_name, before_state, after_state)
  values
    (auth.uid(), tg_op, v_row.id, v_row.tenant_id, v_row.pet_id,
     coalesce(v_pet_name, '[pet non disponibile]'), v_before, v_after);

  if tg_op = 'DELETE' then return old; end if;
  return new;
exception when others then
  -- Audit is best effort: it must never turn an appointment write into a failure.
  raise warning 'GH113 appointment audit skipped for %: %', coalesce(v_row.id, '?'), sqlerrm;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$function$;

revoke all on function public.gh113_capture_appointment_event() from public, anon, authenticated, service_role;
drop trigger if exists gh113_appointment_event on public.appointments;
create trigger gh113_appointment_event
  after insert or update or delete on public.appointments
  for each row execute function public.gh113_capture_appointment_event();

-- Capture the current pet name before ON DELETE CASCADE removes the pet row.
create or replace function public.gh113_capture_pet_name_before_delete()
returns trigger language plpgsql security definer set search_path = '' as $function$
begin
  insert into public.appointment_events
    (actor_user_id, action, appointment_id, tenant_id, pet_id, pet_name, before_state)
  select auth.uid(), 'PET_NAME', a.id, a.tenant_id, old.id, old.name,
         jsonb_build_object(
           'status', a.status, 'scheduled_at', a.scheduled_at,
           'duration_minutes', a.duration_minutes, 'service_id', a.service_id,
           'pet_id', a.pet_id, 'notes', a.notes)
  from public.appointments a where a.pet_id = old.id;
  return old;
exception when others then
  raise warning 'GH113 pet-name audit skipped for %: %', old.id, sqlerrm;
  return old;
end;
$function$;

revoke all on function public.gh113_capture_pet_name_before_delete() from public, anon, authenticated, service_role;
drop trigger if exists gh113_pet_name_before_delete on public.pets;
create trigger gh113_pet_name_before_delete
  before delete on public.pets
  for each row execute function public.gh113_capture_pet_name_before_delete();

create or replace function public.delete_staff_appointment(p_appointment_id text)
returns text language plpgsql security definer set search_path = '' as $function$
declare
  v_user_id uuid := auth.uid();
  v_appointment public.appointments%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select appointment.* into v_appointment
  from public.appointments as appointment
  where appointment.id = p_appointment_id
  for update;

  if not found or not exists (
    select 1 from public.tenant_memberships as membership
    where membership.user_id = v_user_id
      and membership.tenant_id = v_appointment.tenant_id
      and membership.role in ('owner', 'staff')
  ) then
    raise exception 'Appointment not available to current staff user'
      using errcode = '42501';
  end if;

  if v_appointment.status = 'completed' then
    raise exception 'A completed appointment is part of the service history'
      using errcode = '23514', detail = 'GH58_APPOINTMENT_COMPLETED';
  end if;

  if v_appointment.status = 'no_show' then
    raise exception 'Restore the absence before deleting the appointment'
      using errcode = '23514', detail = 'GH58_APPOINTMENT_NO_SHOW';
  end if;

  if v_appointment.appointment_source <> 'operator' or exists (
    select 1 from public.appointment_requests as request
    where request.appointment_id = v_appointment.id
  ) then
    raise exception 'A customer-originated appointment must remain visible in customer history'
      using errcode = '23514', detail = 'GH58_APPOINTMENT_CUSTOMER_SOURCE';
  end if;

  if exists (
    select 1 from public.visits as visit
    where visit.appointment_id = v_appointment.id
  ) then
    raise exception 'An appointment linked to a visit is part of the service history'
      using errcode = '23514', detail = 'GH58_APPOINTMENT_VISIT_LINKED';
  end if;

  if v_appointment.status <> 'cancelled' then
    update public.appointments as appointment
    set status = 'cancelled', updated_at = now()
    where appointment.id = v_appointment.id;
  end if;
  return v_appointment.id;
end;
$function$;
