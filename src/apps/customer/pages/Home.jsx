import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { usePets } from '../hooks/usePets';
import { useNextAppointment } from '../hooks/useNextAppointment';
import { usePromotions } from '../hooks/usePromotions';
import { useCurrentCustomer } from '../hooks/useCurrentCustomer';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Card from '../../../shared/ui/Card';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';
import StatusBadge from '../../../shared/ui/StatusBadge';

/**
 * /u/home — Dashboard customer reale.
 *
 * Step 6.5: rimossi Brandmark interno (ora nel TopNav globale via
 * CustomerNav), bottone "Esci" (ora nel dropdown avatar), CTA standalone
 * "Guarda le promozioni" (ora link Promozioni nel TopNav). Saluto editoriale
 * ora usa customers.first_name via useCurrentCustomer (fix del placeholder
 * email-derived di Step 6).
 *
 * Composizione:
 *   - Eyebrow "BENTORNATO, {nome}"
 *   - Hero editoriale Fraunces:
 *       se nextAppt → "La giornata di *{pet}* inizia *{giorno}*."
 *       altrimenti  → "Bentornato, *{nome}*."
 *   - CTA primary "Prenota un nuovo appuntamento" + secondary "Vedi scheda pet"
 *   - Card row: Pet card / Next appt card / Mini-promo (top 3, silenzioso se 0)
 *   - Empty states (decisione 9 Gate 2 sui pet)
 */

const SALON_WHATSAPP = '+393331112233';
const SALON_WHATSAPP_URL = `https://wa.me/${SALON_WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
  'Ciao! Vorrei aggiungere il mio pet alla scheda del salone.'
)}`;

const DAY_FMT = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const TIME_FMT = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });
const RELATIVE_DAY_FMT = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });

function pickGreetingName(customer, user) {
  if (customer?.first_name) return customer.first_name;
  const local = (user?.email || '').split('@')[0] || '';
  if (!local) return '';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function formatRelativeDay(iso) {
  if (!iso) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays >= -1 && diffDays <= 6) {
    return RELATIVE_DAY_FMT.format(diffDays, 'day');
  }
  return DAY_FMT.format(new Date(iso));
}

function getPetInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function PetAvatar({ name, photo_url, size = 56 }) {
  if (photo_url) {
    return (
      <img
        src={photo_url}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(12, size / 4),
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(12, size / 4),
        background: 'var(--color-surface-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
        fontFamily: 'var(--font-serif)',
        fontWeight: 500,
        color: 'var(--color-primary)',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {getPetInitial(name)}
    </div>
  );
}

export default function Home() {
  const { loading: authLoading } = useRequireCustomer();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { customer } = useCurrentCustomer();

  const { data: pets, loading: petsLoading } = usePets();
  const { data: nextAppt, loading: apptLoading } = useNextAppointment();
  const { data: promos, loading: promosLoading } = usePromotions();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const greeting = pickGreetingName(customer, user);
  const firstPet = pets && pets.length > 0 ? pets[0] : null;
  const hasPets = pets && pets.length > 0;
  const visiblePromos = (promos || []).slice(0, 3);

  // Loading state generale
  if (authLoading || !user) {
    return (
      <main style={pageStyle}>
        <BackgroundDecor />
        <div style={{ ...containerStyle, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Skeleton width="180px" height={14} />
            <Skeleton width="80%" height={isMobile ? 42 : 64} />
            <Skeleton width="60%" height={16} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <BackgroundDecor />
      <div style={{ ...containerStyle, position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <Eyebrow withRule style={{ marginBottom: 14 }}>
          {`Bentornato${greeting ? ', ' + greeting : ''}`}
        </Eyebrow>

        {/* Hero */}
        {nextAppt ? (
          <>
            <h1 style={heroH1Style(isMobile)}>
              La giornata di{' '}
              <em style={emStyle}>{nextAppt.pet?.name || 'il tuo pet'}</em> inizia{' '}
              <em style={emStyle}>{formatRelativeDay(nextAppt.scheduled_at)}</em>.
            </h1>
            <p style={subStyle(isMobile)}>
              {nextAppt.service?.name ? `${nextAppt.service.name} alle ` : 'Appuntamento alle '}
              {TIME_FMT.format(new Date(nextAppt.scheduled_at))}. Ti aspettiamo in negozio.
            </p>
          </>
        ) : (
          <>
            <h1 style={heroH1Style(isMobile)}>
              Bentornato, <em style={emStyle}>{greeting || 'cliente'}</em>.
            </h1>
            <p style={subStyle(isMobile)}>
              {tenant?.name ? `Salone: ${tenant.name}. ` : ''}
              Non hai appuntamenti in programma. Prenota la prossima visita quando vuoi.
            </p>
          </>
        )}

        {/* CTA row — solo prenota + scheda pet (logout/promozioni ora nel TopNav) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
            marginBottom: isMobile ? 32 : 40,
          }}
        >
          <Link to="/u/book" style={{ textDecoration: 'none' }}>
            <span style={primaryBtnStyle}>
              <Icon name="sparkle" size={16} />
              Prenota un nuovo appuntamento
            </span>
          </Link>
          {firstPet && (
            <Link to={`/u/pet/${firstPet.id}`} style={{ textDecoration: 'none' }}>
              <span style={secondaryBtnStyle}>Vedi la scheda di {firstPet.name}</span>
            </Link>
          )}
        </div>

        {/* Card row */}
        <div style={gridStyle(isMobile)}>
          {/* PETS card / empty */}
          {petsLoading ? (
            <SkeletonCard />
          ) : hasPets ? (
            <Card padding={20}>
              <Eyebrow style={{ marginBottom: 12 }}>
                {pets.length > 1 ? 'I tuoi pet' : 'Il tuo pet'}
              </Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pets.map((p) => (
                  <Link
                    key={p.id}
                    to={`/u/pet/${p.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <PetAvatar name={p.name} photo_url={p.photo_url} size={48} />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 20,
                          fontWeight: 500,
                          lineHeight: 1.2,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {p.name}
                      </div>
                      {p.breed && (
                        <div
                          style={{
                            fontSize: 13,
                            color: 'var(--color-text-secondary)',
                            marginTop: 2,
                          }}
                        >
                          {p.breed}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : (
            <Card padding={24}>
              <Eyebrow style={{ marginBottom: 12 }}>Nessun pet</Eyebrow>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Non hai ancora un pet registrato. Per aggiungerlo, contatta il
                salone direttamente.
              </p>
              <a href={SALON_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <span style={primaryBtnStyle}>
                  <Icon name="whatsapp" size={16} />
                  Scrivici su WhatsApp
                </span>
              </a>
            </Card>
          )}

          {/* NEXT APPOINTMENT card / empty */}
          {apptLoading ? (
            <SkeletonCard />
          ) : nextAppt ? (
            <Card padding={20}>
              <Eyebrow style={{ marginBottom: 12 }}>Prossimo appuntamento</Eyebrow>
              <div style={{ marginBottom: 12 }}>
                <StatusBadge
                  status={nextAppt.status}
                  approvalStatus={nextAppt.approval_status}
                  compact
                />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  color: 'var(--color-text-primary)',
                  textTransform: 'capitalize',
                }}
              >
                {DAY_FMT.format(new Date(nextAppt.scheduled_at))}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--color-text-secondary)',
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                Ore {TIME_FMT.format(new Date(nextAppt.scheduled_at))}
                {nextAppt.service?.name ? ` · ${nextAppt.service.name}` : ''}
              </div>
              {nextAppt.pet?.name && (
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    marginTop: 4,
                    fontStyle: 'italic',
                  }}
                >
                  per {nextAppt.pet.name}
                </div>
              )}
            </Card>
          ) : (
            <Card padding={20}>
              <Eyebrow style={{ marginBottom: 12 }}>Prossimo appuntamento</Eyebrow>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Nessun appuntamento in programma.
              </p>
              <Link to="/u/book" style={{ textDecoration: 'none' }}>
                <span style={secondaryBtnStyle}>Prenota ora</span>
              </Link>
            </Card>
          )}

          {/* MINI PROMOS card — silenzioso se 0 */}
          {!promosLoading && visiblePromos.length > 0 && (
            <Card padding={20}>
              <Eyebrow style={{ marginBottom: 12 }}>Promozioni attive</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {visiblePromos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      fontSize: 14,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.4,
                    }}
                  >
                    {p.title}
                  </div>
                ))}
              </div>
              <Link
                to="/u/promotions"
                style={{
                  fontSize: 13,
                  color: 'var(--color-link)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Vedi tutte
                <Icon name="arrow" size={14} />
              </Link>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function SkeletonCard() {
  return (
    <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="50%" height={11} />
      <Skeleton width="70%" height={22} />
      <Skeleton width="90%" height={14} />
      <Skeleton width="60%" height={14} />
    </Card>
  );
}

const pageStyle = {
  width: '100%',
  minHeight: '100vh',
  background: 'var(--color-bg-main)',
  position: 'relative',
  padding: '40px 24px',
  boxSizing: 'border-box',
};

const containerStyle = {
  maxWidth: 980,
  margin: '0 auto',
};

function heroH1Style(isMobile) {
  return {
    fontFamily: 'var(--font-serif)',
    fontSize: isMobile ? 32 : 48,
    fontWeight: 500,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    margin: '0 0 16px',
    color: 'var(--color-text-primary)',
    maxWidth: 720,
  };
}

const emStyle = {
  color: 'var(--color-primary)',
  fontStyle: 'italic',
  fontWeight: 500,
};

function subStyle(isMobile) {
  return {
    margin: '0 0 24px',
    fontSize: isMobile ? 15 : 17,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.55,
    maxWidth: 560,
  };
}

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: 'var(--color-primary)',
  color: '#FBF6F3',
  border: 'none',
  borderRadius: 'var(--r-md)',
  padding: '12px 22px',
  fontSize: 14,
  fontWeight: 700,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: 'transparent',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--r-md)',
  padding: '11px 20px',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

function gridStyle(isMobile) {
  if (isMobile) {
    return { display: 'flex', flexDirection: 'column', gap: 14 };
  }
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: 16,
  };
}
