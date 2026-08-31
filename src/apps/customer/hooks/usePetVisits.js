import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

/** Storico visite del pet, filtrato dalla RLS customer sul database. */
export function usePetVisits(petId) {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    if (!user || !tenantId || !petId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data: rows, error: fetchError } = await supabase
      .from('visits')
      .select('id, tenant_id, pet_id, date, treatments, issues, photo_url, created_at')
      .eq('tenant_id', tenantId)
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (fetchError) {
      setData([]);
      setError(fetchError);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [user, tenantId, petId]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchVisits();
  }, [authLoading, tenantLoading, fetchVisits]);

  return {
    data,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchVisits,
  };
}
