import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

export function useRewardPoints() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    if (!user || !tenantId) {
      setMovements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('reward_points')
      .select('id, pet_id, points, reason, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError);
      setMovements([]);
    } else {
      setMovements(data || []);
    }
    setLoading(false);
  }, [tenantId, user]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchPoints();
  }, [authLoading, tenantLoading, fetchPoints]);

  const total = useMemo(
    () => movements.reduce((sum, movement) => sum + Number(movement.points || 0), 0),
    [movements]
  );

  return {
    total,
    movements,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchPoints,
  };
}
