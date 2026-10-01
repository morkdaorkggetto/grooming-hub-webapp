-- GH-107: sola lettura per Cowork DOPO il suo atto fidelity_projection.
-- Non eseguita da Codex in produzione. Sostituire solo l'UUID del salone.
-- Distingue chi soddisfa il Bronzo da chi ha esattamente quel livello effettivo.
with config as (
  select id as tenant_id, settings,
    (now() at time zone 'Europe/Rome')::date as today,
    (settings->'fidelity_projection'->>'history_start')::date as start_date
  from public.tenants where id = '<UUID_DEL_SALONE>'::uuid
), month_distance as (
  select *, ((extract(year from today)-extract(year from start_date))*12
    + extract(month from today)-extract(month from start_date))::int as m
  from config
), anniversary as (
  select *, m - case when start_date + make_interval(months => m) > today then 1 else 0 end as whole_months
  from month_distance
), observed as (
  select *, whole_months +
    (today - (start_date + make_interval(months => whole_months))::date)::numeric /
    ((start_date + make_interval(months => whole_months+1))::date
     - (start_date + make_interval(months => whole_months))::date) as h
  from anniversary
), thresholds as (
  select observed.*, tier.key, tier.rank,
    (settings->'fidelity_tiers'->tier.key->>'visits_required')::int as requested,
    (settings->'fidelity_tiers'->tier.key->>'months_window')::int as w,
    (settings->'fidelity_tiers'->tier.key->>'points_required')::int as points_required
  from observed cross join (values ('bronze',1),('silver',2),('gold',3)) tier(key,rank)
), effective as (
  select *, key='bronze' and start_date <= today and h<w
    and settings->'fidelity_projection'->'tiers' ? 'bronze' as projected
  from thresholds
), scores as (
  select pet.id, pet.awarded_fidelity_tier, effective.*,
    case when projected then ceil(requested*h/w)::int else requested end as required,
    (select count(*) from public.visits v where v.tenant_id=effective.tenant_id and v.pet_id=pet.id
      and case when projected then v.date between start_date and today
        else v.date >= ((date_trunc('month',today)::date - make_interval(months=>w))::date
          + (extract(day from today)::int-1)) end) as visits,
    coalesce((select sum(points) from public.reward_points r
      where r.tenant_id=effective.tenant_id and r.pet_id=pet.id),0) as points
  from effective join public.pets pet on pet.tenant_id=effective.tenant_id
), levels as (
  select id, max(case when visits>=required or points>=points_required then rank else 0 end) as calculated,
    max(case awarded_fidelity_tier when 'bronze' then 1 when 'silver' then 2 when 'gold' then 3 else 0 end) as awarded,
    bool_or(key='bronze' and visits>=required) as bronze_by_visits,
    max(required) filter(where key='bronze') as bronze_threshold
  from scores group by id
)
select (now() at time zone 'Europe/Rome') as measured_at,
  max(bronze_threshold) as bronze_threshold,
  count(*) filter(where bronze_by_visits) as satisfies_bronze_by_visits,
  count(*) filter(where greatest(calculated,awarded)=1) as effective_bronze,
  count(*) filter(where greatest(calculated,awarded)=2) as effective_silver,
  count(*) filter(where greatest(calculated,awarded)=3) as effective_gold
from levels;
