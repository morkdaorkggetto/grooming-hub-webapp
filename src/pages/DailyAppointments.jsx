import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointments, updateAppointmentStatus } from '../lib/database';
import { DEMO_MODE, DEMO_WRITE_BLOCK_MESSAGE } from '../lib/demoMode';
import { getAppointmentWhatsAppUrl } from '../lib/whatsapp';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeOnly = (iso) =>
  new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatLongDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const getAppointmentEnd = (appointment) => {
  const start = new Date(appointment.scheduled_at);
  return new Date(start.getTime() + appointment.duration_minutes * 60000);
};

const getCardStyle = (status) => {
  if (status === 'completed') {
    return {
      backgroundColor: '#dcfce7',
      borderColor: '#22c55e',
      titleColor: 'var(--color-success-text)',
      textColor: 'var(--color-success-text)',
    };
  }

  if (status === 'cancelled') {
    return {
      backgroundColor: '#f3f4f6',
      borderColor: '#9ca3af',
      titleColor: '#4b5563',
      textColor: '#6b7280',
    };
  }

  if (status === 'no_show') {
    return {
      backgroundColor: '#fff1f2',
      borderColor: '#e11d48',
      titleColor: '#9f1239',
      textColor: '#be123c',
    };
  }

  return {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    titleColor: 'var(--color-danger-text)',
    textColor: '#b91c1c',
  };
};

const getStatusLabel = (status) => {
  if (status === 'completed') return 'Completato';
  if (status === 'cancelled') return 'Annullato';
  if (status === 'no_show') return 'No-show';
  return 'Da fare';
};

export default function DailyAppointments() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const from = new Date(`${selectedDate}T00:00:00`).toISOString();
      const to = new Date(`${selectedDate}T23:59:59`).toISOString();
      const data = await getAppointments({ from, to });
      setAppointments(data);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento appuntamenti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const grouped = useMemo(() => {
    const pending = appointments.filter((item) => item.status === 'scheduled');
    const completed = appointments.filter((item) => item.status === 'completed');
    const other = appointments.filter(
      (item) => item.status !== 'scheduled' && item.status !== 'completed'
    );

    return { pending, completed, other };
  }, [appointments]);

  const counters = useMemo(
    () => ({
      total: appointments.length,
      pending: grouped.pending.length,
      completed: grouped.completed.length,
      other: grouped.other.length,
    }),
    [appointments, grouped]
  );

  const handleMarkCompleted = async (appointmentId) => {
    setSuccess('');
    setError('');

    try {
      setUpdatingId(appointmentId);
      await updateAppointmentStatus(appointmentId, 'completed');
      setSuccess('Appuntamento segnato come completato.');
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento appuntamento');
    } finally {
      setUpdatingId('');
    }
  };

  const handleWhatsApp = (appointment) => {
    const url = getAppointmentWhatsAppUrl(appointment);
    if (!url) {
      setError('Numero cliente non disponibile per WhatsApp.');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderAppointmentRow = (appointment) => {
    const cardStyle = getCardStyle(appointment.status);
    const timeRange = `${formatTimeOnly(appointment.scheduled_at)} - ${formatTimeOnly(
      getAppointmentEnd(appointment).toISOString()
    )}`;

    return (
      <div
        key={appointment.id}
        className="rounded-2xl border p-4 lg:p-5"
        style={{
          backgroundColor: cardStyle.backgroundColor,
          borderColor: cardStyle.borderColor,
        }}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#ffffff', color: cardStyle.titleColor }}
              >
                {timeRange}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: cardStyle.titleColor }}
              >
                {getStatusLabel(appointment.status)}
              </span>
            </div>

            <h3 style={{ color: cardStyle.titleColor }} className="text-xl font-bold">
              {appointment.client?.name || 'Cliente'}
            </h3>
            <p style={{ color: cardStyle.textColor }} className="text-sm mt-1">
              Proprietario: <strong>{appointment.client?.owner || '-'}</strong>
            </p>
            <p style={{ color: cardStyle.textColor }} className="text-sm">
              Telefono: {appointment.client?.phone || 'non disponibile'}
            </p>
            <p style={{ color: cardStyle.textColor }} className="text-sm">
              Durata: {appointment.duration_minutes} min
            </p>
            {appointment.notes && (
              <p style={{ color: cardStyle.textColor }} className="text-sm mt-2">
                Note: {appointment.notes}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              onClick={() => navigate(`/client/${appointment.client_id}`)}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              Apri cliente
            </button>
            <button
              onClick={() => handleWhatsApp(appointment)}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleMarkCompleted(appointment.id)}
              disabled={DEMO_MODE || updatingId === appointment.id || appointment.status === 'completed'}
              title={DEMO_MODE ? DEMO_WRITE_BLOCK_MESSAGE : 'Segna completato'}
              className="px-4 py-2 rounded-lg font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#15803d' }}
            >
              {updatingId === appointment.id ? 'Aggiorno...' : 'Completato'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)' }} className="min-h-screen">
      <header
        style={{ backgroundColor: 'var(--color-primary)' }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Operatività Giornaliera</h1>
            <p className="text-sm text-white text-opacity-80">
              Vista rapida degli appuntamenti del giorno per gli operatori
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {DEMO_MODE && (
          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: 'var(--color-warning-bg)', borderColor: 'var(--color-warning-border)', color: 'var(--color-warning-text)' }}
          >
            <p className="font-medium">
              Demo in sola lettura: la vista operativa è consultabile, ma gli stati non possono essere aggiornati.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p style={{ color: 'var(--color-danger-text)' }} className="font-medium">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg border" style={{ backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' }}>
            <p style={{ color: 'var(--color-success-text)' }} className="font-medium">
              {success}
            </p>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
            <div>
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium mb-1">
                Giorno selezionato
              </p>
              <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold capitalize">
                {formatLongDate(selectedDate)}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <button
                onClick={() => setSelectedDate(toLocalDateString(new Date()))}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#2563eb' }}
              >
                Oggi
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Totale appuntamenti
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-bold mt-2">
              {counters.total}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Da fare
            </p>
            <p style={{ color: 'var(--color-danger-text)' }} className="text-3xl font-bold mt-2">
              {counters.pending}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Completati
            </p>
            <p style={{ color: 'var(--color-success-text)' }} className="text-3xl font-bold mt-2">
              {counters.completed}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Altri stati
            </p>
            <p style={{ color: '#7c2d12' }} className="text-3xl font-bold mt-2">
              {counters.other}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p style={{ color: 'var(--color-secondary)' }}>Caricamento appuntamenti...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p style={{ color: 'var(--color-secondary)' }} className="italic">
                Nessun appuntamento per il giorno selezionato.
              </p>
            </div>
          ) : (
            appointments.map(renderAppointmentRow)
          )}
        </section>
      </main>
    </div>
  );
}
