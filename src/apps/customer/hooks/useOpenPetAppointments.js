import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { supabase } from '../../../shared/supabase/client';
import { useTenant } from '../../../shared/tenant/TenantProvider';

export function useOpenPetAppointments() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!user || !tenantId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: rows, error: fetchError } = await supabase
      .from('appointments')
      .select('id, pet_id, scheduled_at, status, approval_status')
      .eq('tenant_id', tenantId)
      .gt('scheduled_at', new Date().toISOString())
      .neq('status', 'cancelled')
      .or('approval_status.is.null,approval_status.eq.approved')
      .order('scheduled_at');
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
    fetchAppointments();
  }, [authLoading, tenantLoading, fetchAppointments]);

  return {
    data,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchAppointments,
  };
}
