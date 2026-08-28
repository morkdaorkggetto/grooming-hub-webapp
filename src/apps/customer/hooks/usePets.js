import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

/**
 * usePets — fetch dei pet del customer loggato, tenant corrente.
 *
 * RLS server-side (M26 pets_customer_select) filtra automaticamente sui pet
 * il cui customer_id corrisponde alla riga `customers` del chiamante. La
 * query qui è ridondante con la RLS ma esplicita il contratto.
 *
 * Espone: { data: pet[], loading, error, refetch }.
 */
export function usePets() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPets = useCallback(async () => {
    if (!user || !tenantId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: rows, error: fetchError } = await supabase
      .from('pets')
      .select('id, name, species, breed, sex, birth_date, weight_kg, color, photo_url')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (fetchError) {
      setError(fetchError);
      setData([]);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [user, tenantId]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchPets();
  }, [authLoading, tenantLoading, fetchPets]);

  return {
    data,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchPets,
  };
}
