import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

/**
 * useNextAppointment — fetch del prossimo appuntamento del customer loggato.
 *
 * Divergenza schema rispetto al bundle Design: `appointments` non ha
 * `customer_id`, quindi il filtro "appuntamenti del customer corrente"
 * passa via `pet_id IN (SELECT id FROM pets WHERE customer_id = …)`.
 * La RLS server-side (M28 appointments_customer_select) lo enforza
 * comunque; qui esplicitiamo il filtro client-side per chiarezza.
 *
 * Join con `services` via PostgREST embedding (FK appointments.service_id →
 * services.id installato dalla migration 20260520051506).
 *
 * Filtro: status='scheduled' (l'unico valore funzionale, vista la macchina
 * a stati storica: scheduled / completed / cancelled / no_show), e
 * scheduled_at >= now(). Order ASC su scheduled_at, limit 1.
 *
 * Espone: { data: appointmentOrNull, loading, error, refetch }.
 */
export function useNextAppointment() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNext = useCallback(async () => {
    if (!user || !tenantId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // 1. Recupera i pet_id del customer (per filtro esplicito client-side)
    const { data: customerRow, error: custErr } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (custErr) {
      setError(custErr);
      setData(null);
      setLoading(false);
      return;
    }
    if (!customerRow) {
      setData(null);
      setLoading(false);
      return;
    }

    const { data: petsRows, error: petsErr } = await supabase
      .from('pets')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('customer_id', customerRow.id);

    if (petsErr) {
      setError(petsErr);
      setData(null);
      setLoading(false);
      return;
    }
    const petIds = (petsRows || []).map((p) => p.id);
    if (petIds.length === 0) {
      setData(null);
      setLoading(false);
      return;
    }

    // 2. Prossimo appointment
    const nowIso = new Date().toISOString();
    const { data: apptRows, error: apptErr } = await supabase
      .from('appointments')
      .select(
        `id, scheduled_at, duration_minutes, status, approval_status, notes,
         pet_id, service_id,
         service:services(id, name),
         pet:pets(id, name, breed)`
      )
      .eq('tenant_id', tenantId)
      .in('pet_id', petIds)
      .eq('status', 'scheduled')
      .gte('scheduled_at', nowIso)
      .order('scheduled_at', { ascending: true })
      .limit(1);

    if (apptErr) {
      setError(apptErr);
      setData(null);
    } else {
      setData(apptRows && apptRows.length > 0 ? apptRows[0] : null);
    }
    setLoading(false);
  }, [user, tenantId]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchNext();
  }, [authLoading, tenantLoading, fetchNext]);

  return {
    data,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchNext,
  };
}
