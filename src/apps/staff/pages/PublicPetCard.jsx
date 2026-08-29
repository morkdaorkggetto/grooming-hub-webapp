import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthProvider';
import Icon from '../../../shared/ui/Icon';
import {
  getPublicPetCardByToken,
  getPublicSalonIdentity,
} from '../lib/database';
import { getPublicGroomingHubWhatsAppUrl } from '../lib/whatsapp';
import './PublicPetCard.css';

const TIER_LABELS = {
  bronze: 'Bronzo',
  silver: 'Argento',
  gold: 'Oro',
};

const FIRST_VISIT_FORMAT = new Intl.DateTimeFormat('it-IT', { month: 'long' });

function SalonMark({ name }) {
  return (
    <header className="gh-public-card__salon">
      <p>Toelettatura</p>
      <h1>{name || 'Il tuo salone'}</h1>
    </header>
  );
}

function Medallion({ name, photo, tier = 'base' }) {
  const ring = tier && tier !== 'base'
    ? `var(--tier-${tier})`
    : 'var(--color-primary-alpha-35)';

  return (
    <div className="gh-public-card__medallion" style={{ '--medallion-ring': ring }}>
      <div className="gh-public-card__portrait">
        {photo ? (
          <img src={photo} alt={`Ritratto di ${name}`} />
        ) : (
          <Icon name="paw" size={54} stroke={1.5} />
        )}
      </div>
    </div>
  );
}

function TierMark({ tier }) {
  if (!TIER_LABELS[tier]) return null;
  return (
    <span className="gh-public-card__tier" style={{ '--tier-color': `var(--tier-${tier})` }}>
      <Icon name="sparkle" size={12} />
      {TIER_LABELS[tier]}
    </span>
  );
}

function RelationLine({ visits, firstVisitDate }) {
  if (!visits) {
    return (
      <p className="gh-public-card__relation gh-public-card__relation--empty">
        Non ci siamo ancora conosciuti.
        <strong>La prima volta è la prossima.</strong>
      </p>
    );
  }

  const firstVisit = firstVisitDate
    ? FIRST_VISIT_FORMAT.format(new Date(`${firstVisitDate}T12:00:00`))
    : '';

  return (
    <p className="gh-public-card__relation">
      {visits === 1 ? 'È venuto una volta da noi' : <>È venuto <strong>{visits} volte</strong> da noi</>}
      {firstVisit ? <span>la prima volta a {firstVisit}</span> : null}
    </p>
  );
}

function BigGesture({ href, onClick, icon, primary = false, subtitle, children }) {
  const className = `gh-public-card__gesture${primary ? ' gh-public-card__gesture--primary' : ''}`;
  const content = (
    <>
      <span><Icon name={icon} size={18} stroke={1.9} />{children}</span>
      {subtitle ? <small>{subtitle}</small> : null}
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <button className={className} type="button" onClick={onClick}>{content}</button>;
}

function CardShell({ children }) {
  return <main className="gh-public-card__shell">{children}</main>;
}

export default function PublicPetCard() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const { user, currentRole } = useAuth();
  const [petCard, setPetCard] = useState(null);
  const [salonIdentity, setSalonIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCard = async () => {
      setLoading(true);
      setError('');

      const [cardResult, identityResult] = await Promise.allSettled([
        getPublicPetCardByToken(qrToken),
        getPublicSalonIdentity(),
      ]);

      if (!active) return;

      if (identityResult.status === 'fulfilled') {
        setSalonIdentity(identityResult.value);
      }

      if (cardResult.status === 'fulfilled') {
        setPetCard(cardResult.value);
      } else {
        setPetCard(null);
        setError(cardResult.reason?.message || 'Card cliente non disponibile');
      }

      if (active) setLoading(false);
    };

    loadCard();
    return () => {
      active = false;
    };
  }, [qrToken]);

  const businessName = petCard?.businessName || salonIdentity?.businessName || 'Il tuo salone';
  const salonPhone = petCard?.salonPhone || salonIdentity?.salonPhone || '';
  const contactUrl = useMemo(
    () => getPublicGroomingHubWhatsAppUrl({ salonPhone, petName: petCard?.name }),
    [petCard?.name, salonPhone]
  );
  const isCustomer = Boolean(user && currentRole === 'customer');
  const isStaff = Boolean(user && ['staff', 'owner', 'operator'].includes(currentRole));

  const handleReservedArea = () => {
    if (isCustomer) {
      navigate(`/u/pet/${petCard.id}`);
      return;
    }

    if (isStaff) {
      navigate(`/client-card/internal/${qrToken}`);
      return;
    }

    navigate(`/u/login?redirect=${encodeURIComponent(`/client-card/${qrToken}`)}`);
  };

  if (loading) {
    return (
      <div className="gh-public-card-page">
        <CardShell>
          <div className="gh-public-card__loading" aria-label="Caricamento card">
            <span className="gh-public-card__loading-medallion" />
            <span />
            <span />
          </div>
        </CardShell>
      </div>
    );
  }

  if (error || !petCard) {
    return (
      <div className="gh-public-card-page">
        <CardShell>
          <SalonMark name={businessName} />
          <section className="gh-public-card__invalid">
            <Medallion name="" />
            <h2>Questo cartoncino non è più valido.</h2>
            <p>Scrivici e controlliamo insieme la scheda giusta.</p>
          </section>
          <div className="gh-public-card__actions">
            {contactUrl ? (
              <BigGesture href={contactUrl} icon="whatsapp" primary subtitle="rispondiamo qui, non su moduli">
                Scrivici su WhatsApp
              </BigGesture>
            ) : null}
            <p className="gh-public-card__closing">
              Questo cartoncino è di {businessName}.
            </p>
          </div>
        </CardShell>
      </div>
    );
  }

  return (
    <div className="gh-public-card-page">
      <CardShell>
        <SalonMark name={businessName} />
        <section className="gh-public-card__identity">
          <Medallion name={petCard.name} photo={petCard.photo} tier={petCard.fidelityTier} />
          <div className="gh-public-card__name">
            <h2>{petCard.name}</h2>
            {petCard.breed ? <p>{petCard.breed}</p> : null}
            <TierMark tier={petCard.fidelityTier} />
          </div>
          <span className="gh-public-card__divider" aria-hidden="true" />
          <RelationLine visits={petCard.visitsCount} firstVisitDate={petCard.firstVisitDate} />
        </section>
        <div className="gh-public-card__actions">
          {contactUrl ? (
            <BigGesture href={contactUrl} icon="whatsapp" primary subtitle="rispondiamo qui, non su moduli">
              Scrivici su WhatsApp
            </BigGesture>
          ) : null}
          <BigGesture
            onClick={handleReservedArea}
            icon={isCustomer ? 'arrow' : 'calendar'}
            subtitle={isCustomer ? '' : 'visite, promemoria, richieste di appuntamento'}
          >
            {isCustomer ? 'Entra nella sua pagina' : `Vedi le visite di ${petCard.name}`}
          </BigGesture>
          <p className="gh-public-card__closing">
            Questo cartoncino è di {businessName}. Il codice sulla card apre solo questa pagina.
          </p>
        </div>
      </CardShell>
    </div>
  );
}
