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
import {
  getAppointmentWhatsAppUrl,
  getDraftAppointmentWhatsAppUrl,
} from '../lib/whatsapp';

const DEFAULT_DURATION = 60;

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => toLocalDateString(new Date());

const addDays = (dateStr, days) => {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
};

const startOfWeek = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toLocalDateString(date);
};

const getAppointmentEnd = (appointment) => {
  const start = new Date(appointment.scheduled_at);
  return new Date(start.getTime() + appointment.duration_minutes * 60000);
};

const appointmentsOverlap = (left, right) => {
  const leftStart = new Date(left.scheduled_at).getTime();
  const leftEnd = getAppointmentEnd(left).getTime();
  const rightStart = new Date(right.scheduled_at).getTime();
  const rightEnd = getAppointmentEnd(right).getTime();
  return leftStart < rightEnd && rightStart < leftEnd;
};

const isConflictCandidate = (appointment) => appointment.status !== 'cancelled';

const formatWeekdayShort = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

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
  const [viewMode, setViewMode] = useState('week');

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

  const weekStart = useMemo(() => startOfWeek(fromDate), [fromDate]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === form.clientId) || null,
    [clients, form.clientId]
  );

  const conflictIds = useMemo(() => {
    const ids = new Set();
    const candidates = appointments.filter(isConflictCandidate);

    for (let index = 0; index < candidates.length; index += 1) {
      for (let inner = index + 1; inner < candidates.length; inner += 1) {
        if (appointmentsOverlap(candidates[index], candidates[inner])) {
          ids.add(candidates[index].id);
          ids.add(candidates[inner].id);
        }
      }
    }

    return ids;
  }, [appointments]);

  const weeklyAppointments = useMemo(() => {
    const byDay = Object.fromEntries(weekDays.map((day) => [day, []]));

    appointments.forEach((appointment) => {
      const dayKey = appointment.scheduled_at.split('T')[0];
      if (byDay[dayKey]) {
        byDay[dayKey].push(appointment);
      }
    });

    weekDays.forEach((day) => {
      byDay[day].sort(
        (left, right) => new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime()
      );
    });

    return byDay;
  }, [appointments, weekDays]);

  const draftConflict = useMemo(() => {
    if (!form.clientId || !form.date || !form.time) return null;

    const draftStart = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(draftStart.getTime())) return null;

    const draft = {
      scheduled_at: draftStart.toISOString(),
      duration_minutes: Number(form.durationMinutes) || DEFAULT_DURATION,
    };

    return appointments.find(
      (appointment) => isConflictCandidate(appointment) && appointmentsOverlap(draft, appointment)
    ) || null;
  }, [appointments, form.clientId, form.date, form.time, form.durationMinutes]);

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

    if (draftConflict) {
      setError(
        `Conflitto orario con ${draftConflict.client?.name || 'un altro appuntamento'} alle ${new Date(
          draftConflict.scheduled_at
        ).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}.`
      );
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

  const handleOpenAppointmentWhatsApp = (appointment) => {
    const whatsappUrl = getAppointmentWhatsAppUrl(appointment);
    if (!whatsappUrl) {
      setError('Il cliente non ha un numero di telefono utilizzabile per WhatsApp.');
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDraftAppointmentWhatsApp = () => {
    const whatsappUrl = getDraftAppointmentWhatsAppUrl({
      client: selectedClient,
      date: form.date,
      time: form.time,
    });

    if (!whatsappUrl) {
      setError('Seleziona un cliente con numero di telefono per aprire WhatsApp.');
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSetCurrentWeek = () => {
    const start = startOfWeek(getToday());
    setFromDate(start);
    setToDate(addDays(start, 6));
    setViewMode('week');
  };

  const handleShiftWeek = (days) => {
    const nextStart = addDays(weekStart, days);
    setFromDate(nextStart);
    setToDate(addDays(nextStart, 6));
    setViewMode('week');
  };

  const renderAppointmentCard = (appointment, compact = false) => {
    const hasConflict = conflictIds.has(appointment.id);

    return (
      <div
        key={appointment.id}
        className="rounded-xl border p-4"
        style={{
          borderColor: hasConflict ? '#ef4444' : '#e8d5c4',
          backgroundColor: hasConflict ? '#fff7f7' : '#fffdfb',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <p style={{ color: '#5a3a2a' }} className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>
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
            {hasConflict && (
              <p className="text-sm mt-2 font-medium" style={{ color: '#b91c1c' }}>
                Conflitto orario da verificare
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
              <button
                onClick={() => handleOpenAppointmentWhatsApp(appointment)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: '#16a34a' }}
              >
                Promemoria WhatsApp
              </button>
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
    );
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

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 rounded-lg font-bold text-white transition disabled:opacity-70"
                style={{ backgroundColor: '#d4a574' }}
              >
                {saving ? 'Salvataggio...' : 'Aggiungi'}
              </button>
              <button
                type="button"
                onClick={handleOpenDraftAppointmentWhatsApp}
                className="w-full px-4 py-3 rounded-lg font-bold text-white transition"
                style={{ backgroundColor: '#16a34a' }}
              >
                WhatsApp cliente
              </button>
            </div>
          </form>

          {draftConflict && (
            <div className="mt-4 p-4 rounded-xl border" style={{ borderColor: '#fecaca', backgroundColor: '#fff1f2' }}>
              <p style={{ color: '#9f1239' }} className="font-medium">
                Conflitto rilevato con {draftConflict.client?.name || 'un altro appuntamento'} alle{' '}
                {new Date(draftConflict.scheduled_at).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                .
              </p>
              <p style={{ color: '#9f1239' }} className="text-sm mt-1">
                Modifica data, ora o durata prima di salvare.
              </p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-end xl:justify-between mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
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

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: viewMode === 'list' ? '#8b5a3c' : '#caa07a' }}
              >
                Elenco
              </button>
              <button
                onClick={() => setViewMode('week')}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: viewMode === 'week' ? '#8b5a3c' : '#caa07a' }}
              >
                Settimana
              </button>
              <button
                onClick={handleSetCurrentWeek}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#2563eb' }}
              >
                Questa settimana
              </button>
            </div>
          </div>

          {viewMode === 'week' && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => handleShiftWeek(-7)}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#8b5a3c' }}
              >
                ← Settimana prima
              </button>
              <button
                onClick={() => handleShiftWeek(7)}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#8b5a3c' }}
              >
                Settimana dopo →
              </button>
              <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#faf3f0', color: '#8b5a3c' }}>
                {formatWeekdayShort(weekDays[0])} - {formatWeekdayShort(weekDays[6])}
              </div>
            </div>
          )}

          {conflictIds.size > 0 && (
            <div className="mb-6 p-4 rounded-xl border" style={{ borderColor: '#fecaca', backgroundColor: '#fff7f7' }}>
              <p style={{ color: '#b91c1c' }} className="font-medium">
                Sono presenti {conflictIds.size} appuntamenti in sovrapposizione.
              </p>
              <p style={{ color: '#b91c1c' }} className="text-sm mt-1">
                Li trovi evidenziati in rosso nella vista elenco e nella vista settimanale.
              </p>
            </div>
          )}

          {loading ? (
            <p style={{ color: '#8b5a3c' }}>Caricamento appuntamenti...</p>
          ) : appointments.length === 0 ? (
            <p style={{ color: '#8b5a3c' }} className="italic">
              Nessun appuntamento nel periodo selezionato.
            </p>
          ) : viewMode === 'week' ? (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="rounded-2xl border p-4 min-h-[240px]"
                  style={{ borderColor: '#e8d5c4', backgroundColor: '#fffdfb' }}
                >
                  <div className="mb-4 pb-3 border-b" style={{ borderColor: '#f1e4d8' }}>
                    <h3 style={{ color: '#5a3a2a' }} className="font-bold capitalize">
                      {formatWeekdayShort(day)}
                    </h3>
                    <p style={{ color: '#8b5a3c' }} className="text-sm">
                      {weeklyAppointments[day]?.length || 0} appuntamenti
                    </p>
                  </div>

                  {weeklyAppointments[day]?.length ? (
                    <div className="space-y-3">
                      {weeklyAppointments[day].map((appointment) => renderAppointmentCard(appointment, true))}
                    </div>
                  ) : (
                    <p style={{ color: '#8b5a3c' }} className="text-sm italic">
                      Nessun appuntamento
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {groupedAppointments.map(([dayLabel, dayAppointments]) => (
                <div key={dayLabel}>
                  <h3 style={{ color: '#5a3a2a' }} className="text-lg font-bold mb-3 capitalize">
                    {dayLabel}
                  </h3>

                  <div className="space-y-3">
                    {dayAppointments.map((appointment) => renderAppointmentCard(appointment))}
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
