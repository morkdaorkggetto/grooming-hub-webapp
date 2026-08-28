import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useTenant } from '../../../shared/tenant/TenantProvider';

/**
 * usePromotions — fetch delle promozioni attive del tenant corrente.
 *
 * Filtro client-side ridondante con la policy RLS `promotions_customer_select_active`
 * di M32 (already filters is_active=true e valid_to>=now()), ma esplicitiamo
 * comunque per chiarezza del contratto della query — la RLS resta il vero
 * gate di sicurezza.
 *
 * Ordering: display_order ASC (campo controllato dall'operatore).
 *
 * Espone: { data, error, loading, refetch }.
 */
export function usePromotions() {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    if (!tenantId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const nowIso = new Date().toISOString();
    const { data: rows, error: fetchError } = await supabase
      .from('promotions')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .or(`valid_to.is.null,valid_to.gte.${nowIso}`)
      .order('display_order', { ascending: true });

    if (fetchError) {
      setError(fetchError);
      setData([]);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [tenantId]);

  useEffect(() => {
    if (tenantLoading) return;
    fetchPromotions();
  }, [tenantLoading, fetchPromotions]);

  return { data, error, loading: loading || tenantLoading, refetch: fetchPromotions };
}
