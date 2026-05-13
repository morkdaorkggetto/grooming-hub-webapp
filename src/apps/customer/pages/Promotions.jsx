import React from 'react';
import { Link } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { usePromotions } from '../hooks/usePromotions';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Skeleton from '../../../shared/ui/Skeleton';

/**
 * /u/promotions — Step 3.
 *
 * Lista delle promozioni attive del tenant. Sola lettura.
 * Copy aligned to product decision pre-Gate-3: 'Promozioni del momento',
 * niente framing su tier fedeltà.
 *
 * Stati: loading (3 skeleton) / empty / error (con retry) / success.
 * Layout: mobile stack, desktop ≥960px griglia 2 colonne (CSS grid auto-fit).
 *
 * Riferimenti: design_handoff_customer_app/04-schermate.md §04.4 +
 * diario entry 'Chiusura pre-Gate 3' (11 maggio 2026).
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

function PromotionCard({ promo }) {
  const validUntil = formatValidUntil(promo.valid_to);
  const hasCta = promo.cta_label && promo.cta_url;
  const isInternalCta = hasCta && promo.cta_url.startsWith('/');

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {promo.image_url && (
        <img
          src={promo.image_url}
          alt=""
          style={{
            width: '100%',
            height: 160,
            objectFit: 'cover',
            borderRadius: 'var(--r-md, 16px)',
          }}
        />
      )}
      <h2 style={{ margin: 0, fontSize: 20, color: 'var(--color-text-primary, #2b2525)' }}>
        {promo.title}
      </h2>
      {promo.body && (
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-secondary, #7f6f73)',
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          {promo.body}
        </p>
      )}
      {validUntil && (
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-secondary, #7f6f73)',
            fontSize: 13,
            fontStyle: 'italic',
          }}
        >
          {validUntil}
        </p>
      )}
      {hasCta && (
        <div style={{ marginTop: 8 }}>
          {isInternalCta ? (
            <Link to={promo.cta_url} style={{ textDecoration: 'none' }}>
              <Button variant="primary">{promo.cta_label}</Button>
            </Link>
          ) : (
            <a
              href={promo.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="primary">{promo.cta_label}</Button>
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

export default function Promotions() {
  const { loading: authLoading } = useRequireCustomer();
  const { data, error, loading, refetch } = usePromotions();

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              margin: '0 0 4px',
              fontSize: 28,
              color: 'var(--color-text-primary, #2b2525)',
            }}
          >
            Promozioni del momento
          </h1>
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary, #7f6f73)',
              fontSize: 15,
            }}
          >
            Le iniziative attive del salone.
          </p>
        </header>

        {/* Loading: 3 skeleton */}
        {(authLoading || loading) && !error && (
          <div style={gridStyle}>
            {[0, 1, 2].map((i) => (
              <Card key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Skeleton width="60%" height={22} />
                <Skeleton width="100%" height={14} />
                <Skeleton width="80%" height={14} />
                <Skeleton width="40%" height={12} />
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && !authLoading && error && (
          <Card>
            <p style={{ margin: '0 0 16px', color: 'var(--color-danger-text, #b85e69)' }}>
              Non siamo riusciti a caricare le promozioni.
            </p>
            <Button variant="primary" onClick={refetch}>
              Riprova
            </Button>
          </Card>
        )}

        {/* Empty */}
        {!loading && !authLoading && !error && data.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p
              style={{
                margin: 0,
                color: 'var(--color-text-secondary, #7f6f73)',
                fontSize: 16,
              }}
            >
              Nessuna promozione attiva al momento. Torna a trovarci.
            </p>
          </Card>
        )}

        {/* Success */}
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

const pageStyle = {
  minHeight: '100vh',
  padding: '32px 16px',
  background: 'var(--color-bg-main, #f2ece9)',
};

const containerStyle = {
  maxWidth: 980,
  margin: '0 auto',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
  gap: 16,
};
