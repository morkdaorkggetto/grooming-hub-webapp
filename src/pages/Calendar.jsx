import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  addAppointment,
  deleteAppointment,
  getAllClients,
  getAppointments,
  updateAppointmentStatus,
  VALID_APPOINTMENT_STATUSES,
} from '../lib/database';

const DEFAULT_DURATION = 60;

const getToday = () => new Date().toISOString().split('T')[0];

const addDays = (dateStr, days) => {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const toIsoDateRange = (fromDate, toDate) => {
  const fromIso = fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : null;
  const toIso = toDate ? new Date(`${toDate}T23:59:59`).toISOString() : null;
  return { fromIso, toIso };
};

const formatDateTime = (iso) => {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toGoogleDate = (iso) => {
  const date = new Date(iso);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const getGoogleCalendarUrl = (appointment) => {
  const start = new Date(appointment.scheduled_at);
  const end = new Date(start.getTime() + appointment.duration_minutes * 60000);
  const clientName = appointment.client?.name || 'Cliente';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Toelettatura - ${clientName}`,
    dates: `${toGoogleDate(start.toISOString())}/${toGoogleDate(end.toISOString())}`,
    details: appointment.notes || `Appuntamento Grooming Hub per ${clientName}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const escapeIcsText = (value = '') =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

const downloadIcs = (appointment) => {
  const start = new Date(appointment.scheduled_at);
  const end = new Date(start.getTime() + appointment.duration_minutes * 60000);
  const clientName = appointment.client?.name || 'Cliente';

  const dtStamp = toGoogleDate(new Date().toISOString());
  const dtStart = toGoogleDate(start.toISOString());
  const dtEnd = toGoogleDate(end.toISOString());
  const summary = escapeIcsText(`Toelettatura - ${clientName}`);
  const description = escapeIcsText(
    appointment.notes || `Appuntamento Grooming Hub per ${clientName}`
  );

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grooming Hub//Calendario//IT',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@groominghub.local`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `appuntamento-${appointment.id}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const getStatusLabel = (status) => {
  if (status === 'completed') return 'Completato';
  if (status === 'cancelled') return 'Annullato';
  if (status === 'no_show') return 'No-show';
  return 'Programmato';
};

const getStatusStyle = (status) => {
  if (status === 'completed') {
    return { backgroundColor: '#dcfce7', color: '#166534' };
  }
  if (status === 'cancelled') {
    return { backgroundColor: '#fef2f2', color: '#991b1b' };
  }
  if (status === 'no_show') {
    return { backgroundColor: '#fff1f2', color: '#be123c' };
  }
  return { backgroundColor: '#eff6ff', color: '#1d4ed8' };
};

export default function Calendar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(addDays(getToday(), 14));

  const [form, setForm] = useState({
    clientId: searchParams.get('clientId') || '',
    date: getToday(),
    time: '09:00',
    durationMinutes: DEFAULT_DURATION,
    notes: '',
  });

  const groupedAppointments = useMemo(() => {
    const groups = {};

    appointments.forEach((appointment) => {
      const dateKey = new Date(appointment.scheduled_at).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
    });

    return Object.entries(groups);
  }, [appointments]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const { fromIso, toIso } = toIsoDateRange(fromDate, toDate);
      const [clientData, appointmentData] = await Promise.all([
        getAllClients(),
        getAppointments({ from: fromIso, to: toIso }),
      ]);

      setClients(clientData);
      setAppointments(appointmentData);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento calendario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fromDate, toDate]);

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.clientId || !form.date || !form.time) {
      setError('Cliente, data e orario sono obbligatori');
      return;
    }

    setSaving(true);

    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
      await addAppointment({
        client_id: form.clientId,
        scheduled_at: scheduledAt,
        duration_minutes: Number(form.durationMinutes) || DEFAULT_DURATION,
        status: 'scheduled',
        notes: form.notes,
      });

      setForm((prev) => ({
        ...prev,
        time: prev.time,
        notes: '',
      }));

      await loadData();
    } catch (err) {
      setError(err.message || 'Errore creazione appuntamento');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    if (!VALID_APPOINTMENT_STATUSES.includes(status)) return;

    try {
      await updateAppointmentStatus(appointmentId, status);
      await loadData();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento stato');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Eliminare questo appuntamento?')) return;

    try {
      await deleteAppointment(appointmentId);
      await loadData();
    } catch (err) {
      setError(err.message || 'Errore eliminazione appuntamento');
    }
  };

  return (
    <div style={{ backgroundColor: '#faf3f0' }} className="min-h-screen">
      <header
        style={{ backgroundColor: '#d4a574' }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Calendario Appuntamenti</h1>
            <p className="text-sm text-white text-opacity-80">
              Pianifica visite e traccia i no-show
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
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p style={{ color: '#991b1b' }} className="font-medium">
              {error}
            </p>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 style={{ color: '#5a3a2a' }} className="text-xl font-bold mb-4">
            Nuovo Appuntamento
          </h2>

          <form onSubmit={handleAddAppointment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                Cliente
              </label>
              <select
                value={form.clientId}
                onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg border-2"
                style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                required
              >
                <option value="">Seleziona cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.owner}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                Data
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg border-2"
                style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                required
              />
            </div>

            <div>
              <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                Ora
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg border-2"
                style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                required
              />
            </div>

            <div>
              <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                Durata (min)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={form.durationMinutes}
                onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg border-2"
                style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                Note
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Es. solo bagno, taglio unghie, richieste particolari"
                className="w-full px-3 py-3 rounded-lg border-2"
                style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 rounded-lg font-bold text-white transition disabled:opacity-70"
                style={{ backgroundColor: '#d4a574' }}
              >
                {saving ? 'Salvataggio...' : 'Aggiungi'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end mb-6">
            <div>
              <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                Dal
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 rounded-lg border-2"
                style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
              />
            </div>

            <div>
              <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                Al
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 rounded-lg border-2"
                style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
              />
            </div>

            <button
              onClick={loadData}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: '#8b5a3c' }}
            >
              Aggiorna
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#8b5a3c' }}>Caricamento appuntamenti...</p>
          ) : appointments.length === 0 ? (
            <p style={{ color: '#8b5a3c' }} className="italic">
              Nessun appuntamento nel periodo selezionato.
            </p>
          ) : (
            <div className="space-y-8">
              {groupedAppointments.map(([dayLabel, dayAppointments]) => (
                <div key={dayLabel}>
                  <h3 style={{ color: '#5a3a2a' }} className="text-lg font-bold mb-3 capitalize">
                    {dayLabel}
                  </h3>

                  <div className="space-y-3">
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="rounded-xl border p-4"
                        style={{ borderColor: '#e8d5c4', backgroundColor: '#fffdfb' }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div>
                            <p style={{ color: '#5a3a2a' }} className="font-bold text-lg">
                              {appointment.client?.name || 'Cliente non trovato'}
                            </p>
                            <p style={{ color: '#8b5a3c' }} className="text-sm mb-1">
                              {appointment.client?.owner || '-'} · {formatDateTime(appointment.scheduled_at)}
                            </p>
                            <p style={{ color: '#8b5a3c' }} className="text-sm">
                              Durata: {appointment.duration_minutes} min
                            </p>
                            {appointment.notes && (
                              <p style={{ color: '#8b5a3c' }} className="text-sm mt-2">
                                Note: {appointment.notes}
                              </p>
                            )}
                            {appointment.client?.is_blacklisted && (
                              <p className="text-sm mt-2" style={{ color: '#b91c1c' }}>
                                Cliente in blacklist (score: {appointment.client.no_show_score ?? 0})
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-2">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold"
                              style={getStatusStyle(appointment.status)}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                disabled={appointment.status === 'completed'}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                                style={{ backgroundColor: '#16a34a' }}
                              >
                                Completato
                              </button>
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'no_show')}
                                disabled={appointment.status === 'no_show'}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                                style={{ backgroundColor: '#e11d48' }}
                              >
                                No-show (-1)
                              </button>
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                disabled={appointment.status === 'cancelled'}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                                style={{ backgroundColor: '#9ca3af' }}
                              >
                                Annulla
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <a
                                href={getGoogleCalendarUrl(appointment)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                style={{ backgroundColor: '#2563eb' }}
                              >
                                Google
                              </a>
                              <button
                                onClick={() => downloadIcs(appointment)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                style={{ backgroundColor: '#7c3aed' }}
                              >
                                iCloud / Apple
                              </button>
                              <button
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                style={{ backgroundColor: '#dc2626' }}
                              >
                                Elimina
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
