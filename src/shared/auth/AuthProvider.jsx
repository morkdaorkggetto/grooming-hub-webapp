import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase/client';

/**
 * AuthProvider — gestione sessione + memberships condivisa fra staff e customer.
 *
 * Espone:
 *   { session, user, loading, memberships, currentRole, signIn, signOut }
 *
 * `memberships` è l'array delle righe `tenant_memberships` dell'utente corrente
 * (filtrato lato DB via RLS `tenant_memberships_own_select`: WHERE user_id =
 * auth.uid()). `currentRole` è una semplificazione Step 2: ritorna il role
 * della prima membership 'customer' se presente, altrimenti la prima qualsiasi,
 * altrimenti null. In Step 3+ andrà raffinato col tenantId effettivamente attivo
 * (multi-tenant disambiguation).
 *
 * Riferimenti design:
 *   design_handoff_customer_app/03-auth-e-rls.md §AuthProvider condiviso
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carica memberships per l'utente attivo
  const refreshMemberships = async (userId) => {
    if (!userId) {
      setMemberships([]);
      return;
    }
    const { data, error } = await supabase
      .from('tenant_memberships')
      .select('tenant_id, role, created_at')
      .eq('user_id', userId);
    if (error) {
      console.warn('Errore fetch tenant_memberships:', error.message);
      setMemberships([]);
      return;
    }
    setMemberships(data || []);
  };

  useEffect(() => {
    let active = true;

    // 1. getSession iniziale
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      await refreshMemberships(data.session?.user?.id);
      if (active) setLoading(false);
    });

    // 2. subscribe ai cambi di sessione (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!active) return;
      setSession(newSession || null);
      await refreshMemberships(newSession?.user?.id);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const currentRole = useMemo(() => {
    if (!memberships.length) return null;
    const customer = memberships.find((m) => m.role === 'customer');
    if (customer) return 'customer';
    return memberships[0].role;
  }, [memberships]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      loading,
      memberships,
      currentRole,
      signIn,
      signOut,
    }),
    [session, loading, memberships, currentRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
