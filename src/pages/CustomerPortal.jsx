import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomerAppointmentRequest, getCustomerPortalData } from '../lib/database';
import { logout } from '../lib/supabaseClient';
import {
  getCustomerAppointmentRequestWhatsAppUrl,
  getPublicGroomingHubWhatsAppUrl,
} from '../lib/whatsapp';
import { getFidelityBadgeStyle, getFidelityLabel, getFidelityTierSnapshot } from '../lib/fidelity';
import publicPetCardIllustration from '../assets/public-pet-card-illustration.png';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultRequestTime = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return `${`${date.getHours()}`.padStart(2, '0')}:00`;
};

const formatAppointment = (iso) => {
  if (!iso) return 'Nessun appuntamento futuro';

  return new Date(iso).toLocaleString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDateTime = (iso) =>
  new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getPortalStatusBadge = (appointment) => {
  if (appointment.approval_status === 'pending') {
    return {
      label: 'In attesa',
      style: { backgroundColor: '#fef3c7', color: '#92400e' },
    };
  }

  if (appointment.approval_status === 'rejected') {
    return {
      label: 'Rifiutato',
      style: { backgroundColor: '#fee2e2', color: '#991b1b' },
    };
  }

  if (appointment.status === 'completed') {
    return {
      label: 'Completato',
      style: { backgroundColor: '#dcfce7', color: '#166534' },
    };
  }

  if (appointment.status === 'cancelled') {
    return {
      label: 'Annullato',
      style: { backgroundColor: '#f3f4f6', color: '#4b5563' },
    };
  }

  return {
    label: 'Confermato',
    style: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  };
};

function PetPortalCard({
  client,
  onRequestAppointment,
  requestNotice,
  isRequestSubmitting = false,
}) {
  const fidelity = useMemo(() => getFidelityTierSnapshot(client), [client]);
  const recentAppointments = useMemo(
    () =>
      [...(client.appointments || [])]
        .sort((left, right) => new Date(right.scheduled_at) - new Date(left.scheduled_at))
        .slice(0, 5),
    [client.appointments]
  );
  const tierKey = fidelity.currentTier?.key || 'base';
  const badgeStyle = getFidelityBadgeStyle(tierKey);
  const whatsappUrl = getPublicGroomingHubWhatsAppUrl({ petName: client.name });
  const [requestForm, setRequestForm] = useState({
    date: toLocalDateString(new Date()),
    time: getDefaultRequestTime(),
    durationMinutes: 60,
    notes: '',
  });

  useEffect(() => {
    setRequestForm({
      date: toLocalDateString(new Date()),
      time: getDefaultRequestTime(),
      durationMinutes: 60,
      notes: '',
    });
  }, [client.id]);

  const handleSubmitRequest = async (event) => {
    event.preventDefault();
    const ok = await onRequestAppointment(client.id, {
      date: requestForm.date,
      time: requestForm.time,
      duration_minutes: Number(requestForm.durationMinutes) || 60,
      notes: requestForm.notes,
    });

    if (ok) {
      const whatsappUrl = getCustomerAppointmentRequestWhatsAppUrl({
        petName: client.name,
        date: requestForm.date,
        time: requestForm.time,
        durationMinutes: requestForm.durationMinutes,
        notes: requestForm.notes,
      });

      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      setRequestForm((prev) => ({ ...prev, notes: '' }));
    }
  };

  return (
    <article className="bg-white rounded-[28px] shadow-xl overflow-hidden border" style={{ borderColor: '#ead7c5' }}>
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <div className="flex gap-5 items-start">
            <div
              className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center shrink-0"
              style={{ backgroundColor: badgeStyle.backgroundColor }}
            >
              <img
                src={publicPetCardIllustration}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>
                Scheda cane
              </p>
              <h2 className="text-3xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                {client.name}
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--color-secondary)' }}>
                Profilo collegato al tuo account cliente.
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-5 mt-7 border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs uppercase tracking-[0.2em] font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>
              Fidelity
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {getFidelityLabel(tierKey)}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--color-secondary)' }}>
                  {fidelity.mode === 'points'
                    ? `${fidelity.rewardPointsTotal} punti premio registrati`
                    : `${client.visits?.length || 0} visite registrate`}
                </p>
              </div>
              {fidelity.nextTier ? (
                <p className="text-sm font-semibold" style={{ color: 'var(--color-secondary)' }}>
                  Mancano {fidelity.mode === 'points' ? `${fidelity.nextTier.remainingPoints} punti` : `${fidelity.nextTier.remainingVisits} visite`} per {fidelity.nextTier.label}
                </p>
              ) : (
                <p className="text-sm font-semibold" style={{ color: 'var(--color-success-text)' }}>
                  Livello massimo raggiunto
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-5 mt-4" style={{ backgroundColor: 'var(--color-surface-soft)' }}>
            <p className="text-xs uppercase tracking-[0.2em] font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>
              Prossimo appuntamento
            </p>
            <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatAppointment(client.nextAppointment?.scheduled_at)}
            </p>
            {client.nextAppointment?.notes ? (
              <p className="text-sm mt-2" style={{ color: 'var(--color-secondary)' }}>
                {client.nextAppointment.notes}
              </p>
            ) : null}
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col justify-center" style={{ backgroundColor: '#fffaf6' }}>
          <div className="rounded-3xl border p-6 mb-4" style={{ borderColor: '#ead7c5', backgroundColor: 'rgba(255,255,255,0.92)' }}>
            <p className="text-xs uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
              Richiedi appuntamento
            </p>
            <form onSubmit={handleSubmitRequest} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-secondary)' }}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={requestForm.date}
                    min={toLocalDateString(new Date())}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-secondary)' }}>
                    Ora
                  </label>
                  <input
                    type="time"
                    value={requestForm.time}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, time: e.target.value }))}
                    required
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-secondary)' }}>
                  Durata (min)
                </label>
                <select
                  value={requestForm.durationMinutes}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="45">45</option>
                  <option value="60">60</option>
                  <option value="75">75</option>
                  <option value="90">90</option>
                  <option value="120">120</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-secondary)' }}>
                  Note (opzionali)
                </label>
                <input
                  type="text"
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Preferenza oraria o esigenza specifica"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <button
                type="submit"
                disabled={isRequestSubmitting}
                className="inline-flex w-full justify-center px-5 py-3 rounded-xl font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isRequestSubmitting ? 'Invio richiesta...' : 'Invia richiesta'}
              </button>
            </form>

            {requestNotice?.message ? (
              <p
                className="text-sm mt-3 font-medium"
                style={{
                  color:
                    requestNotice.type === 'error'
                      ? 'var(--color-danger-text)'
                      : 'var(--color-success-text)',
                }}
              >
                {requestNotice.message}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border p-6" style={{ borderColor: '#ead7c5', backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
              Contatta Grooming Hub
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--color-secondary)' }}>
              Puoi inviare un messaggio rapido allo staff partendo dalla scheda di {client.name}.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full justify-center px-5 py-3 rounded-xl font-bold text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              Scrivi su WhatsApp
            </a>
          </div>

          <div className="rounded-3xl border p-6 mt-4" style={{ borderColor: '#ead7c5', backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
              Ultimi appuntamenti
            </p>

            {recentAppointments.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                Nessuna richiesta o appuntamento registrato.
              </p>
            ) : (
              <div className="space-y-2">
                {recentAppointments.map((appointment) => {
                  const badge = getPortalStatusBadge(appointment);

                  return (
                    <div
                      key={appointment.id}
                      className="rounded-xl border p-3"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: '#fff' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {formatShortDateTime(appointment.scheduled_at)}
                        </p>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold"
                          style={badge.style}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {appointment.notes ? (
                        <p className="text-xs mt-2" style={{ color: 'var(--color-secondary)' }}>
                          {appointment.notes}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingClientId, setSubmittingClientId] = useState('');
  const [requestNoticeByClient, setRequestNoticeByClient] = useState({});

  const loadPortal = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getCustomerPortalData();
      setClients(data.clients || []);
    } catch (err) {
      setError(err.message || 'Non riesco a caricare il portale cliente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login', { replace: true });
  };

  const handleRequestAppointment = async (clientId, payload) => {
    setRequestNoticeByClient((prev) => ({
      ...prev,
      [clientId]: null,
    }));

    try {
      setSubmittingClientId(clientId);
      await createCustomerAppointmentRequest(clientId, payload);
      await loadPortal();
      setRequestNoticeByClient((prev) => ({
        ...prev,
        [clientId]: {
          type: 'success',
          message: "Richiesta inviata. Ti confermeremo l'appuntamento appena possibile.",
        },
      }));
      return true;
    } catch (err) {
      setRequestNoticeByClient((prev) => ({
        ...prev,
        [clientId]: {
          type: 'error',
          message: err.message || 'Non riesco a inviare la richiesta.',
        },
      }));
      return false;
    } finally {
      setSubmittingClientId('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <p style={{ color: 'var(--color-secondary)' }}>Caricamento area cliente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      <header className="px-4 py-8" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] font-bold text-white/75 mb-2">
              Grooming Hub
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Area cliente
            </h1>
            <p className="text-sm text-white/80 mt-2">
              Card, fidelity e contatto diretto in uno spazio riservato.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'rgba(251,246,243,0.18)', border: '1px solid rgba(251,246,243,0.22)' }}
          >
            Esci
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error ? (
          <div className="mb-6 rounded-xl border p-4 bg-red-50 border-red-200">
            <p className="font-medium" style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        ) : null}

        {clients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Nessuna scheda collegata
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-secondary)' }}>
              Apri il link d'invito ricevuto dal tuo groomer per collegare la scheda del cane a questo account.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {clients.map((client) => (
              <PetPortalCard
                key={client.id}
                client={client}
                onRequestAppointment={handleRequestAppointment}
                requestNotice={requestNoticeByClient[client.id]}
                isRequestSubmitting={submittingClientId === client.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
