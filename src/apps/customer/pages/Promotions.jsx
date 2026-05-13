import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { usePromotions } from '../hooks/usePromotions';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Card from '../../../shared/ui/Card';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';

/**
 * /u/promotions — Step 5 visual refinement.
 *
 * Pattern dal bundle design + decisione pre-Gate-3 ("Promozioni del momento",
 * sola lettura, niente framing fedeltà).
 *
 * Layout:
 *   - BackgroundDecor + Brandmark
 *   - Eyebrow "PROMOZIONI" + H1 Fraunces "del momento"
 *   - Sub paragraph "Le iniziative attive del salone."
 *   - Grid responsive (auto-fit, min 420px → 1 col mobile, 2 col desktop)
 *
 * Card promozione:
 *   - Eyebrow "Promo" piccola in cima
 *   - Title Fraunces 20px weight 500
 *   - Body sans 14
 *   - Validity con icona clock
 *   - CTA primary se presente (con icona WhatsApp se URL contiene "wa.me")
 */

const DATE_FMT = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function formatValidUntil(validToIso) {
  if (!validToIso) return null;
  try {
    return `Fino al ${DATE_FMT.format(new Date(validToIso))}`;
  } catch {
    return null;
  }
}

function isWhatsAppUrl(url) {
  if (!url) return false;
  return /(^https?:\/\/)?(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\b/i.test(url);
}

function PromotionCard({ promo }) {
  const validUntil = formatValidUntil(promo.valid_to);
  const hasCta = promo.cta_label && promo.cta_url;
  const isInternalCta = hasCta && promo.cta_url.startsWith('/');
  const whatsapp = hasCta && isWhatsAppUrl(promo.cta_url);

  return (
    <Card padding={24} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {promo.image_url && (
        <img
          src={promo.image_url}
          alt=""
          style={{
            width: '100%',
            height: 160,
            objectFit: 'cover',
            borderRadius: 'var(--r-md)',
          }}
        />
      )}

      <Eyebrow>Promo</Eyebrow>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 22,
          fontWeight: 500,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          margin: 0,
          color: 'var(--color-text-primary)',
        }}
      >
        {promo.title}
      </h2>

      {promo.body && (
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-primary)',
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          {promo.body}
        </p>
      )}

      {validUntil && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--color-text-secondary)',
            fontSize: 12,
          }}
        >
          <Icon name="clock" size={14} />
          <span>{validUntil}</span>
        </div>
      )}

      {hasCta && (
        <div style={{ marginTop: 4 }}>
          {isInternalCta ? (
            <Link to={promo.cta_url} style={{ textDecoration: 'none' }}>
              <CtaButton whatsapp={whatsapp}>{promo.cta_label}</CtaButton>
            </Link>
          ) : (
            <a
              href={promo.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <CtaButton whatsapp={whatsapp}>{promo.cta_label}</CtaButton>
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

function CtaButton({ whatsapp, children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      }}
    >
      {whatsapp && <Icon name="whatsapp" size={16} />}
      <span>{children}</span>
    </span>
  );
}

export default function Promotions() {
  const { loading: authLoading } = useRequireCustomer();
  const { data, error, loading, refetch } = usePromotions();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <main
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'var(--color-bg-main)',
        position: 'relative',
        padding: isMobile ? '24px 16px 40px' : '40px 48px',
        boxSizing: 'border-box',
      }}
    >
      <BackgroundDecor />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 980, margin: '0 auto' }}>
        <header style={{ marginBottom: isMobile ? 28 : 40 }}>
          <Link
            to="/u/home"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              marginBottom: isMobile ? 24 : 32,
            }}
            aria-label="Vai alla home"
          >
            <Brandmark size={isMobile ? 32 : 36} />
          </Link>
          <Eyebrow withRule style={{ marginBottom: 10 }}>
            Promozioni
          </Eyebrow>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 30 : 44,
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
              color: 'var(--color-text-primary)',
            }}
          >
            <em
              style={{
                color: 'var(--color-primary)',
                fontStyle: 'italic',
                fontWeight: 500,
              }}
            >
              del momento
            </em>
          </h1>
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: isMobile ? 14 : 16,
              lineHeight: 1.55,
              maxWidth: 560,
            }}
          >
            Le iniziative attive del salone.
          </p>
        </header>

        {(authLoading || loading) && !error && (
          <div style={gridStyle}>
            {[0, 1, 2].map((i) => (
              <Card key={i} padding={24} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Skeleton width="50px" height={11} />
                <Skeleton width="70%" height={22} />
                <Skeleton width="100%" height={14} />
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={12} />
              </Card>
            ))}
          </div>
        )}

        {!loading && !authLoading && error && (
          <Card padding={28} style={{ textAlign: 'center' }}>
            <Icon name="sparkle" size={28} style={{ color: 'var(--color-text-secondary)' }} />
            <p style={{ margin: '12px 0 16px', color: 'var(--color-danger-text)' }}>
              Non siamo riusciti a caricare le promozioni.
            </p>
            <button
              type="button"
              onClick={refetch}
              style={{
                background: 'var(--color-primary)',
                color: '#FBF6F3',
                border: 'none',
                borderRadius: 'var(--r-md)',
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Riprova
            </button>
          </Card>
        )}

        {!loading && !authLoading && !error && data.length === 0 && (
          <Card padding={48} style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                width: 56,
                height: 56,
                borderRadius: 999,
                background: 'var(--color-surface-soft)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                marginBottom: 16,
              }}
            >
              <Icon name="heart" size={26} />
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 16 }}>
              Nessuna promozione attiva al momento. Torna a trovarci.
            </p>
          </Card>
        )}

        {!loading && !authLoading && !error && data.length > 0 && (
          <div style={gridStyle}>
            {data.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
  gap: 18,
};
