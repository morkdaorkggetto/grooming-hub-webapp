select 'pets' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.pets t
union all
select 'visits' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.visits t
union all
select 'customers' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.customers t
union all
select 'appointments' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.appointments t
union all
select 'appointment_requests' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.appointment_requests t
union all
select 'promotions' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.promotions t
union all
select 'reward_points' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.reward_points t
union all
select 'customer_invitations' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.customer_invitations t
union all
select 'pet_staff_notes' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.pet_staff_notes t
union all
select 'customer_staff_notes' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.customer_staff_notes t
union all
select 'tenant_memberships' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.tenant_memberships t
union all
select 'profiles' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.profiles t
union all
select 'tenants' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.tenants t
union all
select 'visit_financials' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.visit_financials t
union all
select 'service_financials' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.service_financials t
union all
select 'customer_account_unlink_audit' as name, count(*)::int as count, md5(coalesce(string_agg((to_jsonb(t)-'updated_at')::text,E'\n' order by (to_jsonb(t)-'updated_at')::text),'')) as business_md5 from public.customer_account_unlink_audit t
union all
select 'storage.objects',count(*)::int,md5(coalesce(string_agg((to_jsonb(t)-'updated_at'-'last_accessed_at')::text,E'\n' order by (to_jsonb(t)-'updated_at'-'last_accessed_at')::text),'')) from storage.objects t
union all
select 'auth.users.count',count(*)::int,null::text from auth.users;
