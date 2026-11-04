-- GH-113 point 4, added by Cowork on 2026-11-04 after the first demo act.
-- Keep this as a separate additive migration: the first act was already applied.
create or replace function public.gh113_guard_pet_delete_with_future_appointments()
returns trigger language plpgsql security definer set search_path = '' as $function$
begin
  if exists (
    select 1 from public.appointments a
    where a.pet_id = old.id
      and a.scheduled_at > now()
      and a.status <> 'cancelled'
  ) then
    raise exception 'Future appointments must be cancelled or moved before deleting this pet'
      using errcode = '23514', detail = 'GH113_FUTURE_APPOINTMENTS';
  end if;
  return old;
end;
$function$;

revoke all on function public.gh113_guard_pet_delete_with_future_appointments()
  from public, anon, authenticated, service_role;
drop trigger if exists gh113_guard_pet_delete on public.pets;
create trigger gh113_guard_pet_delete
  before delete on public.pets
  for each row execute function public.gh113_guard_pet_delete_with_future_appointments();
