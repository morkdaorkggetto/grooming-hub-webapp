import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

export async function readAppointmentRequests(client, tenantId, includeHistory = false) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    let query = client.from('appointment_requests')
      .select('id, pet_id, desired_date, time_preference, coat_condition_codes, coat_condition_notes, status, appointment_id, withdrawn_at, staff_responded_at, proposed_alternatives, alternatives_round, chosen_date, chosen_time, chosen_time_preference, customer_response, customer_responded_at, created_at, service:services(id, name), pet:pets(id, name)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });
    if (!includeHistory) query = query.in('status', ['pending', 'rejected']);
    const result = await query.range(offset, offset + 499);
    if (result.error) throw result.error;
    rows.push(...(result.data || []));
    if ((result.data || []).length < 500) return rows;
  }
}

export function useAppointmentRequests({ includeHistory = false } = {}) {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user || !tenantId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let fetchError = null;
    try {
      setData(await readAppointmentRequests(supabase, tenantId, includeHistory));
    } catch (err) {
      fetchError = err;
      setError(err);
      setData([]);
    }
    setLoading(false);
    return !fetchError;
  }, [tenantId, user, includeHistory]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchRequests();
  }, [authLoading, tenantLoading, fetchRequests]);

  return {
    data: includeHistory ? data.filter(row => ['pending', 'rejected'].includes(row.status)) : data,
    history: data,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchRequests,
  };
}
