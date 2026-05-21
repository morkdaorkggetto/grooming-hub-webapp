import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

/**
 * useCurrentCustomer — fetch della riga `customers` per l'utente loggato sul
 * tenant corrente. Permette di accedere a first_name/last_name/email/phone
 * senza derivarli dall'email auth.
 *
 * RLS server-side (M25 customers_self_select: user_id = auth.uid()) filtra
 * automaticamente.
 *
 * Espone: { customer, loading, error, refetch }.
 * `customer` è `null` se l'utente non è loggato, non ha tenant, oppure
 * non ha ancora una riga `customers` (caso: signup ma invito non ancora
 * accettato — Decisione 12 Gate 2 lo rende uno stato improbabile in Fase 1
 * ma gestito).
 */
export function useCurrentCustomer() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    if (!user || !tenantId) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone, marketing_opt_in')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError);
      setCustomer(null);
    } else {
      setCustomer(data || null);
    }
    setLoading(false);
  }, [user, tenantId]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchCustomer();
  }, [authLoading, tenantLoading, fetchCustomer]);

  return {
    customer,
    loading: loading || authLoading || tenantLoading,
    error,
    refetch: fetchCustomer,
  };
}
