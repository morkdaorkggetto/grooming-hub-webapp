-- GH-116 · atto sui dati: giorni di chiusura per le feste 2026/2027
--
-- Che cosa fa: scrive cinque date in tenants.settings.booking_schedule.closed_dates
-- per il salone 0211c475-1bc4-4f3f-a212-2f94e440ed2f. Il calendario dell'app cliente
-- (src/shared/tenant/bookingSchedule.js, getBookingSchedule) le spegne come la domenica.
--
-- Fonte delle date: Davide, riferito da Luigi a Cowork l'11/11/2026 alle 06:45.
--   8 dicembre 2026, 25 e 26 dicembre 2026, 1 e 6 gennaio 2027.
--
-- Stato prima dell'atto (misurato l'11/11/2026 alle 06:46, prodotto azgehoseiojodltcttfb):
--   booking_schedule = timezone, closed_weekdays ["sunday"], closed_time_preferences {monday:[morning]}
--   chiave closed_dates assente; md5(settings::text) = c3276b730dd7c2600b6e64ce96995ad2
--   0 appuntamenti e 0 richieste nelle cinque date.
--
-- Idempotente: se le date sono già quelle, non fa nulla.
-- Guardia: se closed_dates esiste già con un contenuto diverso, si ferma.
-- Ritorno indietro: supabase/rollback/gh116-closed-dates-prima-dell-atto.md

do $$
declare
  v_tenant constant uuid := '0211c475-1bc4-4f3f-a212-2f94e440ed2f';
  v_target constant jsonb := '["2026-12-08","2026-12-25","2026-12-26","2027-01-01","2027-01-06"]'::jsonb;
  v_current jsonb;
  v_rows integer;
begin
  select settings #> '{booking_schedule,closed_dates}'
    into v_current
  from public.tenants
  where id = v_tenant
  for update;

  if not found then
    raise exception 'Salone % non trovato: atto non applicato', v_tenant;
  end if;

  if v_current = v_target then
    raise notice 'closed_dates già impostato: nessuna modifica';
    return;
  end if;

  if v_current is not null and v_current <> 'null'::jsonb then
    raise exception 'closed_dates esiste già con un contenuto diverso (%): atto non applicato', v_current;
  end if;

  update public.tenants
     set settings = jsonb_set(settings, '{booking_schedule,closed_dates}', v_target, true)
   where id = v_tenant
     and settings ? 'booking_schedule';

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Attesa 1 riga modificata, trovate %: atto non applicato', v_rows;
  end if;
end $$;
