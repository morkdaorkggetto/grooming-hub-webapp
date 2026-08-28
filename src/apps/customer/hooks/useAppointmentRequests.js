import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

export function useAppointmentRequests() {
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
    const { data: rows, error: fetchError } = await supabase
      .from('appointment_requests')
      .select('id, pet_id, desired_date, time_preference, coat_condition_codes, coat_condition_notes, status, staff_responded_at, proposed_alternatives, created_at, service:services(id, name), pet:pets(id, name)')
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'rejected'])
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError);
      setData([]);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [tenantId, user]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchRequests();
  }, [authLoading, tenantLoading, fetchRequests]);

  return {
    data,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchRequests,
  };
}
