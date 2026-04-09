import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../lib/supabaseClient';
import { getPublicPetCardByToken } from '../lib/database';
import { getPublicGroomingHubWhatsAppUrl } from '../lib/whatsapp';
import { getFidelityBadgeStyle, getFidelityLabel } from '../lib/fidelity';

function PublicPetIllustration() {
  return (
    <svg
      viewBox="0 0 96 96"
      className="w-16 h-16"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="10" width="84" height="76" rx="24" fill="#F5EADF" />
      <path
        d="M28 58C28 49.7 34.7 43 43 43H55C63.3 43 70 49.7 70 58V60.5C70 62.4 68.4 64 66.5 64H31.5C29.6 64 28 62.4 28 60.5V58Z"
        fill="#7A5A47"
      />
      <circle cx="39" cy="38" r="12" fill="#7A5A47" />
      <path d="M32 30L24 20C22 17.5 22.7 14 25.4 12.6C27.5 11.5 30.1 12 31.6 13.8L37 20.5L32 30Z" fill="#7A5A47" />
      <path d="M46 64V73" stroke="#7A5A47" strokeWidth="5" strokeLinecap="round" />
      <path d="M60 64V73" stroke="#7A5A47" strokeWidth="5" strokeLinecap="round" />
      <path d="M65 50L78 43" stroke="#7A5A47" strokeWidth="5" strokeLinecap="round" />
      <circle cx="42" cy="37" r="1.8" fill="#F5EADF" />
    </svg>
  );
}

const getVisitsLabel = (count) => (count === 1 ? '1 visita registrata' : `${count} visite registrate`);

const getRemainingVisitsMessage = (remainingVisits, nextTier) => {
  if (!nextTier) {
    return 'Hai già raggiunto il livello massimo di fedeltà. Complimenti!';
  }

  if (remainingVisits === 1) {
    return (
      <>
        Ti manca <strong>1 visita</strong> per raggiungere il livello{' '}
        <strong>{getFidelityLabel(nextTier)}</strong>.
      </>
    );
  }

  return (
    <>
      Ti mancano <strong>{remainingVisits}</strong> visite per raggiungere il livello{' '}
      <strong>{getFidelityLabel(nextTier)}</strong>.
    </>
  );
};

export default function PublicPetCard() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [petCard, setPetCard] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCard = async () => {
      setLoading(true);
      setError('');

      try {
        const [cardData, currentUser] = await Promise.all([
          getPublicPetCardByToken(qrToken),
          getCurrentUser(),
        ]);

        setPetCard(cardData);
        setUser(currentUser);
      } catch (err) {
        setError(err.message || 'Errore caricamento card pubblica');
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [qrToken]);

  const fidelityStyle = useMemo(
    () => getFidelityBadgeStyle(petCard?.fidelityTier),
    [petCard?.fidelityTier]
  );

  const contactUrl = useMemo(
    () => getPublicGroomingHubWhatsAppUrl({ petName: petCard?.name }),
    [petCard?.name]
  );

  const handleReservedArea = () => {
    if (user) {
      navigate(`/client-card/internal/${qrToken}`);
      return;
    }

    navigate(`/login?redirect=${encodeURIComponent(`/client-card/${qrToken}`)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <p style={{ color: 'var(--color-secondary)' }}>Caricamento card cliente...</p>
      </div>
    );
  }

  if (error || !petCard) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <h1 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold mb-3">
            Card non disponibile
          </h1>
          <p style={{ color: 'var(--color-secondary)' }} className="mb-6">
            {error || 'Il QR non corrisponde a un cliente disponibile.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Vai all'app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <p style={{ color: 'var(--color-secondary)' }} className="text-xs uppercase tracking-[0.28em] font-bold mb-3">
            {petCard.businessName || 'Grooming Hub'}
          </p>
          <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl sm:text-4xl font-bold">
            Card cliente
          </h1>
          <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-2">
            Profilo del cane e stato fedeltà sempre a portata di scansione.
          </p>
        </div>

        <div className="bg-white rounded-[28px] shadow-xl overflow-hidden border" style={{ borderColor: '#ead7c5' }}>
          <div className="grid md:grid-cols-[1.2fr_0.8fr]">
            <div className="p-8">
              <div className="flex gap-5 items-start">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-4xl shrink-0"
                  style={{ backgroundColor: '#f5eadf' }}
                >
                  <PublicPetIllustration />
                </div>
                <div className="min-w-0">
                  <h2 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-bold leading-tight">
                    {petCard.name}
                  </h2>
                </div>
              </div>

              <div className="rounded-2xl p-5 mt-8" style={{ backgroundColor: 'var(--color-bg-main)' }}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: fidelityStyle.backgroundColor,
                      color: fidelityStyle.color,
                    }}
                  >
                    Livello {getFidelityLabel(petCard.fidelityTier)}
                  </span>
                  <span style={{ color: 'var(--color-secondary)' }} className="text-sm">
                    {getVisitsLabel(petCard.visitsCount)}
                  </span>
                </div>

                <p style={{ color: 'var(--color-text-primary)' }} className="text-base font-medium">
                  {getRemainingVisitsMessage(petCard.remainingVisits, petCard.nextTier)}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {contactUrl ? (
                  <a
                    href={contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl text-white font-semibold transition"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Scrivi a Grooming Hub
                  </a>
                ) : null}

                <button
                  onClick={handleReservedArea}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition border"
                  style={{
                    color: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                    backgroundColor: '#fffaf6',
                  }}
                >
                  {user ? 'Apri scheda completa' : 'Area riservata'}
                </button>
              </div>
            </div>

            <div
              className="p-8 border-t md:border-t-0 md:border-l flex flex-col justify-center"
              style={{ borderColor: '#ead7c5', backgroundColor: '#fffaf6' }}
            >
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#ffffff', border: '1px solid #ead7c5' }}>
                <p style={{ color: 'var(--color-secondary)' }} className="text-xs uppercase font-bold tracking-wide mb-2">
                  Progressione fedeltà
                </p>
                <div className="space-y-3">
                  <div>
                    <p style={{ color: 'var(--color-secondary)' }} className="text-sm">
                      Bronzo
                    </p>
                    <div className="mt-1 h-2 rounded-full" style={{ backgroundColor: '#f0e7de' }}>
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (petCard.visits12Months / 12) * 100)}%`, backgroundColor: '#cd7f32' }} />
                    </div>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-secondary)' }} className="text-sm">
                      Argento
                    </p>
                    <div className="mt-1 h-2 rounded-full" style={{ backgroundColor: '#f0e7de' }}>
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (petCard.visits24Months / 24) * 100)}%`, backgroundColor: '#94a3b8' }} />
                    </div>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-secondary)' }} className="text-sm">
                      Oro
                    </p>
                    <div className="mt-1 h-2 rounded-full" style={{ backgroundColor: '#f0e7de' }}>
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (petCard.visits36Months / 36) * 100)}%`, backgroundColor: '#d4a017' }} />
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--color-secondary)' }} className="text-xs mt-4 leading-relaxed">
                Questa pagina mostra le informazioni pubbliche del cane. Se sei un operatore, puoi continuare dall'area riservata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
