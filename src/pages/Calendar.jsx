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
const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 20;
const HOUR_ROW_HEIGHT = 72;

const formatWeekdayShort = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

const formatTimeOnly = (iso) =>
  new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

const minutesFromTimelineStart = (iso) => {
  const date = new Date(iso);
  return (date.getHours() - TIMELINE_START_HOUR) * 60 + date.getMinutes();
};

const hourLabels = Array.from(
  { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
  (_, index) => TIMELINE_START_HOUR + index
);

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

const formatConflictInterval = (appointment) => {
  const start = formatTimeOnly(appointment.scheduled_at);
  const end = formatTimeOnly(getAppointmentEnd(appointment).toISOString());
  const day = new Date(appointment.scheduled_at).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  return `${day} ${start}-${end}`;
};

export default function Calendar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
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
        `Conflitto con ${draftConflict.client?.name || 'un altro appuntamento'} (${formatConflictInterval(
          draftConflict
        )}).`
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
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment((current) => (current ? { ...current, status } : current));
      }
      await loadData();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento stato');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Eliminare questo appuntamento?')) return;

    try {
      await deleteAppointment(appointmentId);
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(null);
      }
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

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const renderAppointmentCard = (appointment, compact = false) => {
    const hasConflict = conflictIds.has(appointment.id);

    return (
      <div
        key={appointment.id}
        role="button"
        tabIndex={0}
        onClick={() => openAppointmentDetails(appointment)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openAppointmentDetails(appointment);
          }
        }}
        className="rounded-xl border p-4 cursor-pointer transition hover:shadow-md"
        style={{
          borderColor: hasConflict ? '#ef4444' : '#e8d5c4',
          backgroundColor: hasConflict ? '#fff7f7' : '#fffdfb',
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold mb-2"
                style={{ backgroundColor: '#f5eadf', color: '#8b5a3c' }}
              >
                {formatTimeOnly(appointment.scheduled_at)} - {formatTimeOnly(getAppointmentEnd(appointment).toISOString())}
              </p>
              <p style={{ color: '#5a3a2a' }} className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>
                {appointment.client?.name || 'Cliente non trovato'}
              </p>
              <p style={{ color: '#8b5a3c' }} className="text-sm">
                {appointment.client?.owner || '-'}
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold shrink-0"
              style={getStatusStyle(appointment.status)}
            >
              {getStatusLabel(appointment.status)}
            </span>
          </div>

          <div>
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
          <p style={{ color: '#8b5a3c' }} className="text-sm font-medium">
            Apri dettagli →
          </p>
        </div>
      </div>
    );
  };

  const renderWeekTimeline = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[980px]">
        <div className="grid gap-4" style={{ gridTemplateColumns: '72px repeat(7, minmax(120px, 1fr))' }}>
          <div />
          {weekDays.map((day) => (
            <div
              key={day}
              className="rounded-2xl border px-3 py-3"
              style={{ borderColor: '#e8d5c4', backgroundColor: '#fffaf6' }}
            >
              <h3 style={{ color: '#5a3a2a' }} className="font-bold capitalize">
                {formatWeekdayShort(day)}
              </h3>
              <p style={{ color: '#8b5a3c' }} className="text-sm">
                {weeklyAppointments[day]?.length || 0} appuntamenti
              </p>
            </div>
          ))}

          <div className="relative">
            {hourLabels.map((hour) => (
              <div
                key={hour}
                className="text-xs flex items-start justify-end pr-2"
                style={{ height: `${HOUR_ROW_HEIGHT}px`, color: '#8b5a3c' }}
              >
                {`${hour}`.padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {weekDays.map((day) => (
            <div
              key={day}
              className="relative rounded-2xl border overflow-hidden"
              style={{
                borderColor: '#e8d5c4',
                backgroundColor: '#fffdfb',
                height: `${(TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1) * HOUR_ROW_HEIGHT}px`,
              }}
            >
              {hourLabels.map((hour, index) => (
                <div
                  key={`${day}-${hour}`}
                  className="absolute inset-x-0 border-t"
                  style={{
                    top: `${index * HOUR_ROW_HEIGHT}px`,
                    borderColor: '#f3e7da',
                  }}
                />
              ))}

              {(weeklyAppointments[day] || []).map((appointment) => {
                const startOffset = Math.max(0, minutesFromTimelineStart(appointment.scheduled_at));
                const top = (startOffset / 60) * HOUR_ROW_HEIGHT;
                const height = Math.max(
                  44,
                  (appointment.duration_minutes / 60) * HOUR_ROW_HEIGHT
                );
                const hasConflict = conflictIds.has(appointment.id);

                return (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => openAppointmentDetails(appointment)}
                    className="absolute left-2 right-2 rounded-xl px-3 py-2 text-left shadow-sm transition hover:shadow-md"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: hasConflict ? '#ffe4e6' : '#f5eadf',
                      border: `1px solid ${hasConflict ? '#fb7185' : '#d4a574'}`,
                    }}
                  >
                    <p style={{ color: '#5a3a2a' }} className="text-xs font-bold">
                      {formatTimeOnly(appointment.scheduled_at)}
                    </p>
                    <p style={{ color: '#5a3a2a' }} className="text-sm font-bold truncate">
                      {appointment.client?.name || 'Cliente'}
                    </p>
                    <p style={{ color: '#8b5a3c' }} className="text-xs truncate">
                      {appointment.client?.owner || '-'}
                    </p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
                Conflitto rilevato con {draftConflict.client?.name || 'un altro appuntamento'} ({formatConflictInterval(draftConflict)}).
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
            renderWeekTimeline()
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

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
          <div className="w-full max-w-lg h-full overflow-y-auto bg-white shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p style={{ color: '#8b5a3c' }} className="text-sm font-medium">
                  {formatDateTime(selectedAppointment.scheduled_at)}
                </p>
                <h2 style={{ color: '#5a3a2a' }} className="text-2xl font-bold">
                  {selectedAppointment.client?.name || 'Cliente non trovato'}
                </h2>
                <p style={{ color: '#8b5a3c' }}>
                  {selectedAppointment.client?.owner || '-'}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-3 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#8b5a3c' }}
              >
                Chiudi
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#faf3f0' }}>
                <div className="flex flex-wrap gap-3 items-center mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={getStatusStyle(selectedAppointment.status)}
                  >
                    {getStatusLabel(selectedAppointment.status)}
                  </span>
                  {conflictIds.has(selectedAppointment.id) && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                    >
                      Conflitto orario
                    </span>
                  )}
                  {selectedAppointment.client?.is_blacklisted && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                    >
                      Blacklist
                    </span>
                  )}
                </div>
                <p style={{ color: '#8b5a3c' }} className="text-sm">
                  Durata: {selectedAppointment.duration_minutes} minuti
                </p>
                <p style={{ color: '#8b5a3c' }} className="text-sm">
                  Telefono: {selectedAppointment.client?.phone || 'non disponibile'}
                </p>
                <p style={{ color: '#8b5a3c' }} className="text-sm">
                  Score affidabilita: {selectedAppointment.client?.no_show_score ?? 0}
                </p>
                {selectedAppointment.notes && (
                  <p style={{ color: '#8b5a3c' }} className="text-sm mt-3 whitespace-pre-wrap">
                    Note: {selectedAppointment.notes}
                  </p>
                )}
              </div>

              <div>
                <h3 style={{ color: '#5a3a2a' }} className="font-bold mb-3">
                  Comunicazione
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenAppointmentWhatsApp(selectedAppointment)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Promemoria WhatsApp
                  </button>
                  <a
                    href={getGoogleCalendarUrl(selectedAppointment)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#2563eb' }}
                  >
                    Google Calendar
                  </a>
                  <button
                    onClick={() => downloadIcs(selectedAppointment)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#7c3aed' }}
                  >
                    File iCloud / Apple
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ color: '#5a3a2a' }} className="font-bold mb-3">
                  Gestione appuntamento
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Segna completato
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment.id, 'no_show')}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#e11d48' }}
                  >
                    Segna no-show
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#9ca3af' }}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    Elimina
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ color: '#5a3a2a' }} className="font-bold mb-3">
                  Scheda cliente
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/client/${selectedAppointment.client_id}`)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#8b5a3c' }}
                  >
                    Apri cliente
                  </button>
                  <button
                    onClick={() => navigate(`/calendar?clientId=${selectedAppointment.client_id}`)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#d4a574' }}
                  >
                    Nuovo appuntamento per questo cliente
                  </button>
                </div>
                <p style={{ color: '#8b5a3c' }} className="text-sm mt-3">
                  Dalla scheda cliente puoi gestire punteggio affidabilita, blacklist, note e storico visite.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
