import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * useRequireCustomer — protegge le rotte di /u/*.
 *
 * Mentre l'AuthProvider sta caricando, non fa nulla (la pagina mostrerà uno
 * skeleton/loading). Quando il caricamento è finito:
 *   - se non c'è sessione → redirect a /u/login
 *   - se c'è sessione ma currentRole !== 'customer' → redirect a /u/login
 *     (semplificazione Step 2: nessuna UX di scelta contesto né messaggi
 *     differenziati per "loggato ma operatore". Step 3+ raffinerà.)
 *
 * Restituisce { user, loading } per comodità del caller.
 */
export function useRequireCustomer() {
  const { user, currentRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user || currentRole !== 'customer') {
      const redirect = `${location.pathname}${location.search}`;
      navigate(`/u/login?redirect=${encodeURIComponent(redirect)}`, { replace: true });
    }
  }, [loading, user, currentRole, navigate, location.pathname, location.search]);

  return { user, loading };
}
