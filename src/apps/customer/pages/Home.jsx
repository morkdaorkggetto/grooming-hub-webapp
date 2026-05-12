import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Skeleton from '../../../shared/ui/Skeleton';

/**
 * /u/home — placeholder Step 2.
 *
 * Step 3 sostituirà questa pagina con la Dashboard customer reale
 * (prossimo appuntamento, card pet, promozioni). Per ora basta dimostrare
 * che la catena auth + tenant + routing è funzionante.
 */

export default function Home() {
  const { loading } = useRequireCustomer();
  const { user, signOut } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/u/login', { replace: true });
  };

  if (loading || !user) {
    return (
      <main style={pageStyle}>
        <Card style={{ width: '100%', maxWidth: 480 }}>
          <Skeleton width="60%" height={28} />
          <div style={{ height: 12 }} />
          <Skeleton width="40%" height={16} />
        </Card>
      </main>
    );
  }

  const greetingName = user.email || 'cliente';

  return (
    <main style={pageStyle}>
      <Card style={{ width: '100%', maxWidth: 480 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, color: 'var(--color-text-primary, #2b2525)' }}>
          Ciao, {greetingName}
        </h1>
        <p style={{ margin: '0 0 16px', color: 'var(--color-text-secondary, #7f6f73)', fontSize: 15 }}>
          {tenantLoading
            ? 'Carico le informazioni del salone…'
            : tenant
            ? `Salone: ${tenant.name}`
            : 'Salone non disponibile.'}
        </p>
        <p style={{ margin: '0 0 24px', color: 'var(--color-text-secondary, #7f6f73)', fontSize: 14 }}>
          (Schermata placeholder. La dashboard reale arriva nello step successivo: prossimo
          appuntamento, pet, promozioni.)
        </p>
        <Button onClick={handleSignOut} variant="ghost">
          Esci
        </Button>
      </Card>
    </main>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'var(--color-bg-main, #f2ece9)',
};
