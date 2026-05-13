import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';

/**
 * /u/home — Step 5 visual refinement.
 *
 * Pattern dal bundle design (proto-dashboard.jsx hero editoriale, righe 178-247).
 * Resta una pagina placeholder per Step 5 (la dashboard reale arriva nei prossimi
 * step con prossimo appuntamento, card pet, promo nella home).
 *
 * Layout:
 *   - BackgroundDecor + Brandmark in alto
 *   - Eyebrow "BENTORNATO" con linea breve
 *   - H1 Fraunces grande con il nome utente in italic primary
 *   - Sub paragraph descrittivo (cosa arriverà)
 *   - CTA secondary "Esci" piccolo in fondo
 */

function pickGreetingName(user) {
  if (!user) return '';
  const local = (user.email || '').split('@')[0] || '';
  if (!local) return '';
  // capitalize first letter
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function Home() {
  const { loading: authLoading } = useRequireCustomer();
  const { user, signOut } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/u/login', { replace: true });
  };

  const greeting = pickGreetingName(user);

  return (
    <main
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'var(--color-bg-main)',
        position: 'relative',
        padding: isMobile ? '24px 20px 40px' : '40px 48px',
        boxSizing: 'border-box',
      }}
    >
      <BackgroundDecor />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: isMobile ? 32 : 48 }}>
          <Brandmark size={isMobile ? 32 : 36} />
        </header>

        {/* Loading state */}
        {authLoading || !user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Skeleton width="180px" height={14} />
            <Skeleton width="80%" height={isMobile ? 42 : 64} />
            <Skeleton width="60%" height={16} />
          </div>
        ) : (
          <>
            <Eyebrow withRule style={{ marginBottom: 14 }}>
              {`Bentornato${greeting ? ', ' + greeting : ''}`}
            </Eyebrow>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: isMobile ? 32 : 52,
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                margin: '0 0 16px',
                color: 'var(--color-text-primary)',
                maxWidth: 720,
              }}
            >
              La tua{' '}
              <em
                style={{
                  color: 'var(--color-primary)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                }}
              >
                area personale
              </em>
              .
            </h1>

            <p
              style={{
                margin: '0 0 28px',
                fontSize: isMobile ? 15 : 17,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.55,
                maxWidth: 560,
              }}
            >
              Stiamo costruendo la tua area personale. Tra poco vedrai qui il tuo
              prossimo appuntamento, le schede dei tuoi pet e le promozioni del
              momento del salone.
              {tenant?.name && (
                <>
                  <br />
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      opacity: 0.85,
                    }}
                  >
                    Salone: {tenant.name}
                    {tenantLoading && ' · …'}
                  </span>
                </>
              )}
            </p>

            <button
              type="button"
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--r-md)',
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="logout" size={16} />
              Esci
            </button>
          </>
        )}
      </div>
    </main>
  );
}
