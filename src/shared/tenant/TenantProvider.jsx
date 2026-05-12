import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../auth/AuthProvider';

/**
 * TenantProvider — risolve il tenant corrente.
 *
 * Step 2: slug hardcoded a 'grooming-hub' (decisione Gate 2 #8).
 * Step futuro: lettura da hostname (sottodominio), vedi
 *   design_handoff_customer_app/01-architettura.md §Sottodominio-ready.
 *
 * Il fetch avviene SOLO se c'è una sessione autenticata, perché la policy
 * `tenants_members_select` consente SELECT solo a chi ha una membership nel
 * tenant. Senza sessione → tenant resta `null` e loading false.
 *
 * Espone: { tenant, tenantId, loading }.
 */

const PILOT_TENANT_SLUG = 'grooming-hub';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setTenant(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from('tenants')
      .select('id, slug, name, settings')
      .eq('slug', PILOT_TENANT_SLUG)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.warn('Errore fetch tenant:', error.message);
          setTenant(null);
        } else {
          setTenant(data || null);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const value = useMemo(
    () => ({
      tenant,
      tenantId: tenant?.id || null,
      loading,
    }),
    [tenant, loading]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (ctx === null) {
    throw new Error('useTenant must be used inside <TenantProvider>');
  }
  return ctx;
}
