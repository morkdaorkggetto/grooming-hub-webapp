import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';

const PET_FIELDS = `
  id, tenant_id, customer_id, owner_user_id, name, species, breed,
  birth_date, sex, microchip, weight_kg, neutered, color,
  coat_preferences, owner_notes, photo_url, owner_photo_url, created_at, updated_at
`;

/** Fetch e update whitelist della singola scheda pet customer. */
export function usePet(petId) {
  const { user, loading: authLoading } = useAuth();
  const { tenantId, loading: tenantLoading } = useTenant();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPet = useCallback(async () => {
    if (!user || !tenantId || !petId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data: row, error: fetchError } = await supabase
      .from('pets')
      .select(PET_FIELDS)
      .eq('id', petId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (fetchError) {
      setData(null);
      setError(fetchError);
    } else {
      setData(row || null);
    }
    setLoading(false);
  }, [user, tenantId, petId]);

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    fetchPet();
  }, [authLoading, tenantLoading, fetchPet]);

  const updatePet = useCallback(
    async (updates) => {
      if (!user || !tenantId || !petId) {
        throw new Error('Sessione o pet non disponibili.');
      }

      const writableFields = ['owner_notes', 'coat_preferences', 'owner_photo_url'];
      const payload = Object.fromEntries(
        Object.entries(updates || {}).filter(([key]) => writableFields.includes(key))
      );
      if (!Object.keys(payload).length) throw new Error('Nessuna modifica disponibile.');
      const { data: updated, error: updateError } = await supabase
        .from('pets')
        .update(payload)
        .eq('id', petId)
        .eq('tenant_id', tenantId)
        .select(PET_FIELDS)
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updated) throw new Error('Pet non trovato o accesso negato.');

      setData(updated);
      return updated;
    },
    [user, tenantId, petId]
  );

  return {
    data,
    error,
    loading: loading || authLoading || tenantLoading,
    refetch: fetchPet,
    updatePet,
  };
}
