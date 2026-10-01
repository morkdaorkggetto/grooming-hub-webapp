import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { getFidelityTierSnapshot } from '../../../shared/lib/fidelity';

async function readAllRows(client, table, columns, tenantId, petId) {
  const rows = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client.from(table).select(columns)
      .eq('tenant_id', tenantId).eq('pet_id', petId)
      .order('id').range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
  }
}

// An explicit projection keeps recognition photos and financial data out of this view.
export async function readPetCard(client, tenantId, petId) {
  const petResult = await client.from('pets')
    .select('id, name, breed, owner_photo_url, qr_token, awarded_fidelity_tier')
    .eq('tenant_id', tenantId).eq('id', petId).maybeSingle();
  if (petResult.error) throw petResult.error;
  if (!petResult.data) return null;
  const visits = await readAllRows(client, 'visits', 'id, date', tenantId, petId);
  const points = await readAllRows(client, 'reward_points', 'points', tenantId, petId);
  return {
    ...petResult.data,
    visits,
    rewardPointsTotal: points.reduce((sum, row) => sum + Number(row.points || 0), 0),
  };
}

export function usePetCard(petId) {
  const { user, loading: authLoading } = useAuth();
  const { tenant, tenantId, loading: tenantLoading } = useTenant();
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const [revision, setRevision] = useState(0);
  const key = user && tenantId && petId ? `${user.id}:${tenantId}:${petId}:${revision}` : null;

  useEffect(() => {
    if (authLoading || tenantLoading || !key) return;
    let cancelled = false;
    readPetCard(supabase, tenantId, petId).then(
      data => { if (!cancelled) setResult({ key, data, error: null }); },
      error => { if (!cancelled) setResult({ key, data: null, error }); },
    );
    return () => { cancelled = true; };
  }, [key, authLoading, tenantLoading, tenantId, petId]);

  const data = key && result.key === key ? result.data : null;
  return {
    data,
    snapshot: data ? getFidelityTierSnapshot(data, tenant?.settings) : null,
    loading: authLoading || tenantLoading || Boolean(key && result.key !== key),
    error: key && result.key === key ? result.error : null,
    refetch: () => setRevision(value => value + 1),
  };
}
