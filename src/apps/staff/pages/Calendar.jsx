import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PetAvatar from '../../../shared/ui/PetAvatar';
import { Button, EmptyState, Fab, Field, Hero, HeroButton, Panel } from '../components/StaffKit';
import {
  CalendarDay,
  CalendarDayStrip,
  CalendarLoading,
  CalendarNavigation,
  CalendarQueue,
  CalendarWeekSummary,
} from '../components/CalendarKit';
import {
  addAppointment,
  getCalendarPetOptions,
  getCalendarWeekData,
  resolveAppointmentRequest,
  updateAppointmentApproval,
  updateAppointmentSchedule,
  updateAppointmentStatus,
  VALID_APPOINTMENT_STATUSES,
} from '../lib/database';
import { DEMO_MODE, DEMO_WRITE_BLOCK_MESSAGE } from '../lib/demoMode';
import {
  buildWhatsAppUrl,
  getAppointmentApprovalWhatsAppMessage,
  getAppointmentWhatsAppUrl,
} from '../lib/whatsapp';
import './Calendar.css';

const DEFAULT_DURATION = 60;
const DEFAULT_FORM = { clientId: '', date: '', time: '09:00', durationMinutes: DEFAULT_DURATION, notes: '' };

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const todayString = () => toLocalDateString(new Date());
const addDays = (dateString, amount) => {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toLocalDateString(date);
};
const startOfWeek = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);
  const weekday = date.getDay();
  date.setDate(date.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  return toLocalDateString(date);
};
const formatTime = (iso) => new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const formatDayLabel = (dateString) => new Date(`${dateString}T12:00:00`).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
const formatWeekLabel = (from, to) => {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const startMonth = start.toLocaleDateString('it-IT', { month: 'short' });
  const endMonth = end.toLocaleDateString('it-IT', { month: 'short' });
  return startMonth === endMonth
    ? `${start.getDate()}–${end.getDate()} ${endMonth} ${end.getFullYear()}`
    : `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
};

const getAppointmentEnd = (appointment) => {
  const start = new Date(appointment.scheduled_at);
  return new Date(start.getTime() + (Number(appointment.duration_minutes) || DEFAULT_DURATION) * 60000);
};
const appointmentsOverlap = (left, right) => {
  const leftStart = new Date(left.scheduled_at).getTime();
  const rightStart = new Date(right.scheduled_at).getTime();
  return leftStart < getAppointmentEnd(right).getTime() && rightStart < getAppointmentEnd(left).getTime();
};
const isConflictCandidate = (appointment) => appointment.status !== 'cancelled';
const formatConflict = (appointment) => `${appointment.client?.name || 'altro pet'}, ${formatTime(appointment.scheduled_at)}–${formatTime(getAppointmentEnd(appointment))}`;
const toLocalTimeString = (date) => `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
const findNextAvailableTime = ({ date, time, durationMinutes, appointments }) => {
  const initial = new Date(`${date}T${time}`);
  if (Number.isNaN(initial.getTime())) return time;
  const duration = Number(durationMinutes) || DEFAULT_DURATION;
  const dayEnd = new Date(`${date}T23:45:00`);
  let candidateStart = new Date(initial.getTime() + duration * 60000);
  while (candidateStart <= dayEnd) {
    const candidate = { scheduled_at: candidateStart.toISOString(), duration_minutes: duration };
    if (!appointments.some((item) => isConflictCandidate(item) && appointmentsOverlap(candidate, item))) return toLocalTimeString(candidateStart);
    candidateStart = new Date(candidateStart.getTime() + 15 * 60000);
  }
  return time;
};

const toGoogleDate = (value) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const getGoogleCalendarUrl = (appointment) => {
  const name = appointment.client?.name || 'Cliente';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Toelettatura - ${name}`,
    dates: `${toGoogleDate(appointment.scheduled_at)}/${toGoogleDate(getAppointmentEnd(appointment))}`,
    details: appointment.notes || `Appuntamento Grooming Hub per ${name}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
const escapeIcsText = (value = '') => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const downloadIcs = (appointment) => {
  const name = appointment.client?.name || 'Cliente';
  const rows = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grooming Hub//Calendario//IT', 'BEGIN:VEVENT',
    `UID:${appointment.id}@groominghub.local`, `DTSTAMP:${toGoogleDate(new Date())}`,
    `DTSTART:${toGoogleDate(appointment.scheduled_at)}`, `DTEND:${toGoogleDate(getAppointmentEnd(appointment))}`,
    `SUMMARY:${escapeIcsText(`Toelettatura - ${name}`)}`,
    `DESCRIPTION:${escapeIcsText(appointment.notes || `Appuntamento Grooming Hub per ${name}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  const url = URL.createObjectURL(new Blob([rows.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `appuntamento-${appointment.id}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const requestDate = (request) => request.desired_date || (request.scheduled_at ? toLocalDateString(new Date(request.scheduled_at)) : '');
const requestDefaultTime = (request) => {
  if (request.scheduled_at) return formatTime(request.scheduled_at);
  return ['afternoon', 'pomeriggio'].includes(request.time_preference) ? '14:00' : '09:00';
};
const statusLabel = (status) => ({ scheduled: 'Programmato', completed: 'Completato', no_show: 'No-show', cancelled: 'Annullato' }[status] || status);

function Modal({ title, children, footer, onClose, narrow = false }) {
  return (
    <div className="gh-modal-scrim" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`gh-modal${narrow ? ' gh-modal--narrow' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="gh-modal__head">
          <h2 className="gh-calendar-modal-title">{title}</h2>
          <button className="gh-calendar-modal-close" type="button" aria-label="Chiudi" onClick={onClose}>×</button>
        </header>
        <div className="gh-modal__body">{children}</div>
        {footer && <footer className="gh-modal__foot">{footer}</footer>}
      </section>
    </div>
  );
}

export default function Calendar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openedQueryClientRef = useRef('');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(todayString()));
  const weekEnd = addDays(weekStart, 6);
  const [selectedDay, setSelectedDay] = useState(todayString());
  const [data, setData] = useState({ appointments: [], requests: [], visits: [] });
  const [petOptions, setPetOptions] = useState([]);
  const [petsLoaded, setPetsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [manualForm, setManualForm] = useState(() => ({ ...DEFAULT_FORM, date: todayString() }));
  const [requestForm, setRequestForm] = useState({ date: '', time: '09:00', durationMinutes: DEFAULT_DURATION, message: '' });
  const [detailForm, setDetailForm] = useState({ date: '', time: '', durationMinutes: DEFAULT_DURATION });
  const [workPetId, setWorkPetId] = useState('');

  const loadWeek = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await getCalendarWeekData({ from: weekStart, to: weekEnd }));
    } catch (loadError) {
      setError(loadError.message || 'Non riesco a caricare il calendario');
    } finally {
      setLoading(false);
    }
  }, [weekEnd, weekStart]);
  useEffect(() => { loadWeek(); }, [loadWeek]);
  useEffect(() => {
    if (selectedDay < weekStart || selectedDay > weekEnd) setSelectedDay(weekStart);
  }, [selectedDay, weekEnd, weekStart]);

  const ensurePets = useCallback(async () => {
    if (petsLoaded) return petOptions;
    const pets = await getCalendarPetOptions();
    setPetOptions(pets);
    setPetsLoaded(true);
    return pets;
  }, [petOptions, petsLoaded]);
  const findConflict = useCallback((candidate, excludedId = null) => data.appointments.find((appointment) =>
    appointment.id !== excludedId && isConflictCandidate(appointment) && appointmentsOverlap(candidate, appointment)
  ) || null, [data.appointments]);
  const conflictIds = useMemo(() => {
    const ids = new Set();
    const candidates = data.appointments.filter(isConflictCandidate);
    candidates.forEach((left, index) => candidates.slice(index + 1).forEach((right) => {
      if (appointmentsOverlap(left, right)) { ids.add(left.id); ids.add(right.id); }
    }));
    return ids;
  }, [data.appointments]);
  const makeTags = useCallback((source) => {
    const tags = [];
    if (source.client?.is_blacklisted) tags.push({ tone: 'danger', label: 'Blacklist' });
    else if ((source.client?.no_show_score ?? 0) < 0) tags.push({ tone: 'warning', label: 'A rischio' });
    if (source.kind === 'appointment' && conflictIds.has(source.id)) tags.push({ tone: 'danger', label: 'Conflitto' });
    if (source.kind === 'appointment' && source.status === 'scheduled') {
      const distance = new Date(source.scheduled_at).getTime() - Date.now();
      if (distance >= 0 && distance <= 86400000) tags.push({ tone: 'warning', label: 'Imminente' });
    }
    if (source.kind === 'appointment' && source.status !== 'scheduled') tags.push({ tone: source.status === 'completed' ? 'success' : 'danger', label: statusLabel(source.status) });
    return tags;
  }, [conflictIds]);

  const calendarItems = useMemo(() => {
    const requests = data.requests.map((request) => ({
      ...request, kind: 'request', petName: request.client?.name || 'Pet', photo: request.client?.photo,
      preference: request.time_preference || (request.scheduled_at ? formatTime(request.scheduled_at) : 'flexible'),
      subtitle: [request.service?.name || request.notes || 'Bisogno non specificato', request.client?.owner].filter(Boolean).join(' · '),
    }));
    const appointments = data.appointments.map((appointment) => ({
      ...appointment, kind: 'appointment', petName: appointment.client?.name || 'Pet', photo: appointment.client?.photo,
      time: formatTime(appointment.scheduled_at),
      subtitle: [appointment.client?.owner, appointment.notes].filter(Boolean).join(' · ') || 'Appuntamento',
    }));
    const visits = data.visits.map((visit) => ({
      ...visit, kind: 'visit', petName: visit.client?.name || 'Pet', photo: visit.client?.photo,
      subtitle: `«${visit.treatments || 'Nessun dettaglio registrato'}»`,
    }));
    return [...requests, ...appointments, ...visits].map((item) => ({ ...item, tags: makeTags(item) }));
  }, [data, makeTags]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const parsed = new Date(`${date}T12:00:00`);
    return {
      date, label: formatDayLabel(date), shortWeekday: parsed.toLocaleDateString('it-IT', { weekday: 'narrow' }), dayNumber: parsed.getDate(),
      items: calendarItems.filter((item) => {
        const itemDate = item.kind === 'request' ? requestDate(item) : item.kind === 'visit' ? item.date : toLocalDateString(new Date(item.scheduled_at));
        return itemDate === date;
      }),
    };
  }), [calendarItems, weekStart]);

  const openManual = useCallback(async (clientId = '') => {
    setError('');
    try {
      await ensurePets();
      setManualForm((current) => ({ ...current, clientId: clientId || current.clientId || '', date: selectedDay >= weekStart && selectedDay <= weekEnd ? selectedDay : todayString() }));
      setModal('manual');
    } catch (loadError) {
      setError(loadError.message || 'Non riesco a caricare i pet');
    }
  }, [ensurePets, selectedDay, weekEnd, weekStart]);
  const openWork = async () => {
    setError('');
    try {
      const pets = await ensurePets();
      setWorkPetId((current) => current || pets[0]?.id || '');
      setModal('work');
    } catch (loadError) {
      setError(loadError.message || 'Non riesco a caricare i pet');
    }
  };
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    if (!clientId || openedQueryClientRef.current === clientId) return;
    openedQueryClientRef.current = clientId;
    openManual(clientId);
  }, [openManual, searchParams]);

  const openItem = (item) => {
    setError(''); setSuccess('');
    if (item.kind === 'visit') { navigate(`/client/${item.pet_id}`); return; }
    setSelectedItem(item);
    if (item.kind === 'request') {
      const date = requestDate(item) || selectedDay;
      const time = requestDefaultTime(item);
      const durationMinutes = Number(item.duration_minutes) || DEFAULT_DURATION;
      setRequestForm({
        date, time, durationMinutes,
        message: getAppointmentApprovalWhatsAppMessage({ ...item, scheduled_at: new Date(`${date}T${time}`).toISOString(), duration_minutes: durationMinutes }, 'approved'),
      });
      setModal('request');
      return;
    }
    const date = new Date(item.scheduled_at);
    setDetailForm({ date: toLocalDateString(date), time: formatTime(item.scheduled_at), durationMinutes: Number(item.duration_minutes) || DEFAULT_DURATION });
    setModal('detail');
  };

  const manualCandidate = useMemo(() => manualForm.date && manualForm.time ? { scheduled_at: new Date(`${manualForm.date}T${manualForm.time}`).toISOString(), duration_minutes: Number(manualForm.durationMinutes) || DEFAULT_DURATION } : null, [manualForm]);
  const requestCandidate = useMemo(() => requestForm.date && requestForm.time ? { scheduled_at: new Date(`${requestForm.date}T${requestForm.time}`).toISOString(), duration_minutes: Number(requestForm.durationMinutes) || DEFAULT_DURATION } : null, [requestForm]);
  const detailCandidate = useMemo(() => detailForm.date && detailForm.time ? { scheduled_at: new Date(`${detailForm.date}T${detailForm.time}`).toISOString(), duration_minutes: Number(detailForm.durationMinutes) || DEFAULT_DURATION } : null, [detailForm]);
  const manualConflict = manualCandidate ? findConflict(manualCandidate) : null;
  const requestConflict = requestCandidate ? findConflict(requestCandidate, selectedItem?.request_kind === 'legacy' ? selectedItem.id : null) : null;
  const detailConflict = detailCandidate ? findConflict(detailCandidate, selectedItem?.id) : null;

  const updateRequestTiming = (field, value) => {
    setRequestForm((current) => {
      const next = { ...current, [field]: value };
      const scheduledAt = new Date(`${next.date}T${next.time}`);
      if (!selectedItem || Number.isNaN(scheduledAt.getTime())) return next;
      return {
        ...next,
        message: getAppointmentApprovalWhatsAppMessage({
          ...selectedItem,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: Number(next.durationMinutes) || DEFAULT_DURATION,
        }, 'approved'),
      };
    });
  };

  const submitManual = async (event) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (!manualForm.clientId || !manualCandidate) { setError('Pet, data e ora sono obbligatori.'); return; }
    if (manualConflict) { setError(`Conflitto con ${formatConflict(manualConflict)}.`); return; }
    setSaving(true);
    try {
      await addAppointment({ pet_id: manualForm.clientId, scheduled_at: manualCandidate.scheduled_at, duration_minutes: manualCandidate.duration_minutes, status: 'scheduled', notes: manualForm.notes });
      const nextTime = findNextAvailableTime({ date: manualForm.date, time: manualForm.time, durationMinutes: manualForm.durationMinutes, appointments: [...data.appointments, { ...manualCandidate, status: 'scheduled' }] });
      setManualForm((current) => ({ ...current, time: nextTime, notes: '' }));
      setSuccess('Appuntamento creato. Il prossimo orario libero è già pronto.');
      await loadWeek();
    } catch (saveError) { setError(saveError.message || 'Non riesco a creare l’appuntamento'); }
    finally { setSaving(false); }
  };
  const confirmRequest = async () => {
    if (!selectedItem || !requestCandidate) return;
    if (requestConflict) { setError(`Conflitto con ${formatConflict(requestConflict)}.`); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (selectedItem.request_kind === 'structured') await resolveAppointmentRequest(selectedItem.id, 'approved', requestCandidate.scheduled_at);
      else { await updateAppointmentSchedule(selectedItem.id, requestCandidate); await updateAppointmentApproval(selectedItem.id, 'approved'); }
      const whatsappUrl = buildWhatsAppUrl(selectedItem.client?.phone, requestForm.message);
      setModal(null); await loadWeek();
      if (whatsappUrl) { window.open(whatsappUrl, '_blank', 'noopener,noreferrer'); setSuccess('Richiesta confermata. Il messaggio WhatsApp è pronto.'); }
      else setError('Richiesta confermata, ma il messaggio non è preparabile: manca il telefono del cliente.');
    } catch (saveError) { setError(saveError.message || 'Non riesco a confermare la richiesta'); }
    finally { setSaving(false); }
  };
  const rejectRequest = async () => {
    if (!selectedItem) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      if (selectedItem.request_kind === 'structured') await resolveAppointmentRequest(selectedItem.id, 'rejected');
      else await updateAppointmentApproval(selectedItem.id, 'rejected');
      const rejectionUrl = buildWhatsAppUrl(selectedItem.client?.phone, getAppointmentApprovalWhatsAppMessage(selectedItem, 'rejected'));
      setModal(null); await loadWeek();
      if (rejectionUrl) { window.open(rejectionUrl, '_blank', 'noopener,noreferrer'); setSuccess('Richiesta rifiutata. Il messaggio per scegliere un’altra fascia è pronto.'); }
      else setError('Richiesta rifiutata, ma il messaggio non è preparabile: manca il telefono del cliente.');
    } catch (saveError) { setError(saveError.message || 'Non riesco a rifiutare la richiesta'); }
    finally { setSaving(false); }
  };
  const saveSchedule = async (event) => {
    event.preventDefault();
    if (!selectedItem || !detailCandidate) return;
    if (detailConflict) { setError(`Conflitto con ${formatConflict(detailConflict)}.`); return; }
    setSaving(true); setError('');
    try {
      const updated = await updateAppointmentSchedule(selectedItem.id, detailCandidate);
      setSelectedItem((current) => ({ ...current, ...updated }));
      setSuccess('Appuntamento riprogrammato.'); await loadWeek();
    } catch (saveError) { setError(saveError.message || 'Non riesco a riprogrammare l’appuntamento'); }
    finally { setSaving(false); }
  };
  const changeStatus = async (status) => {
    if (!selectedItem || !VALID_APPOINTMENT_STATUSES.includes(status)) return;
    setSaving(true); setError('');
    try {
      await updateAppointmentStatus(selectedItem.id, status);
      setSelectedItem((current) => ({ ...current, status }));
      setSuccess(`Stato aggiornato: ${statusLabel(status)}.`); await loadWeek();
    } catch (saveError) { setError(saveError.message || 'Non riesco ad aggiornare lo stato'); }
    finally { setSaving(false); }
  };
  const openReminder = () => {
    const url = getAppointmentWhatsAppUrl(selectedItem);
    if (!url) { setError('Numero cliente non disponibile per WhatsApp.'); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const weekIsEmpty = calendarItems.length === 0;
  const pendingItems = calendarItems.filter((item) => item.kind === 'request');

  return (
    <div className="gh-page">
      <Hero title="Calendario" subtitle="Richieste da decidere, appuntamenti fissati e lavorazioni registrate." right={(
        <div className="gh-calendar-actions">
          <HeroButton onClick={() => navigate('/dashboard')}>Dashboard</HeroButton>
          <HeroButton className="gh-calendar-work-action" onClick={openWork}>Registra lavorazione</HeroButton>
          <Button staff icon="plus" onClick={() => openManual()}>Nuovo appuntamento</Button>
        </div>
      )} />
      <main className="gh-page-shell gh-calendar-shell">
        {DEMO_MODE && <div className="gh-calendar-notice">{DEMO_WRITE_BLOCK_MESSAGE}</div>}
        {error && <div className="gh-calendar-notice gh-calendar-notice--error" role="alert">{error}</div>}
        {success && <div className="gh-calendar-notice gh-calendar-notice--success" role="status">{success}</div>}
        <div className="gh-calendar-layout">
          <Panel className="gh-calendar-main" flush>
            <CalendarNavigation rangeLabel={formatWeekLabel(weekStart, weekEnd)}
              onPrevious={() => setWeekStart(addDays(weekStart, -7))} onNext={() => setWeekStart(addDays(weekStart, 7))}
              onToday={() => { const start = startOfWeek(todayString()); setWeekStart(start); setSelectedDay(todayString()); }}
              dateValue={selectedDay} onDate={(event) => { if (event.target.value) { setWeekStart(startOfWeek(event.target.value)); setSelectedDay(event.target.value); } }} />
            <CalendarDayStrip days={weekDays} selectedDate={selectedDay} onSelect={setSelectedDay} />
            {loading ? <CalendarLoading /> : <>
              {weekIsEmpty && <div className="gh-calendar-week-empty"><EmptyState title="Settimana ancora vuota" body="Puoi fissare un appuntamento ricevuto per telefono o registrare una lavorazione già svolta." action={<div className="gh-calendar-detail-actions"><Button staff onClick={() => openManual()}>Nuovo appuntamento</Button><Button staff variant="outline" onClick={openWork}>Registra lavorazione</Button></div>} /></div>}
              <div className="gh-calendar-week">{weekDays.map((day) => <CalendarDay day={day} today={day.date === todayString()} selected={day.date === selectedDay} onOpen={openItem} key={day.date} />)}</div>
            </>}
          </Panel>
          <aside className="gh-calendar-aside">
            <CalendarQueue items={pendingItems} onOpen={openItem} />
            <CalendarWeekSummary appointments={data.appointments.filter((item) => item.status !== 'cancelled').length} visits={data.visits.length} requests={data.requests.length} onOpenReport={() => navigate('/reports/weekly')} />
          </aside>
        </div>
      </main>
      <Fab label="Registra lavorazione" icon="pencil" onClick={openWork} />

      {modal === 'manual' && <Modal title="Nuovo appuntamento" onClose={() => setModal(null)} footer={<><Button staff variant="ghost" onClick={() => setModal(null)}>Chiudi</Button><Button staff loading={saving} disabled={Boolean(manualConflict)} onClick={submitManual}>Salva appuntamento</Button></>}>
        <form className="gh-calendar-form-stack" onSubmit={submitManual}>
          <Field label="Pet" as="select" value={manualForm.clientId} onChange={(event) => setManualForm((current) => ({ ...current, clientId: event.target.value }))} required>
            <option value="">Seleziona pet</option>{petOptions.map((pet) => <option value={pet.id} key={pet.id}>{pet.name} · {pet.owner || 'senza proprietario'}</option>)}
          </Field>
          <div className="gh-calendar-form-grid gh-calendar-form-grid--three">
            <Field label="Data" type="date" value={manualForm.date} onChange={(event) => setManualForm((current) => ({ ...current, date: event.target.value }))} required />
            <Field label="Ora" type="time" value={manualForm.time} onChange={(event) => setManualForm((current) => ({ ...current, time: event.target.value }))} required />
            <Field label="Durata (min)" type="number" min="15" step="15" value={manualForm.durationMinutes} onChange={(event) => setManualForm((current) => ({ ...current, durationMinutes: event.target.value }))} />
          </div>
          <Field label="Note" area value={manualForm.notes} onChange={(event) => setManualForm((current) => ({ ...current, notes: event.target.value }))} />
          {manualConflict && <p className="gh-calendar-conflict">Conflitto con {formatConflict(manualConflict)}.</p>}
        </form>
      </Modal>}

      {modal === 'work' && <Modal title="Registra lavorazione" narrow onClose={() => setModal(null)} footer={<><Button staff variant="ghost" onClick={() => setModal(null)}>Chiudi</Button><Button staff disabled={!workPetId} onClick={() => navigate(`/client/${workPetId}/add-visit`)}>Continua</Button></>}>
        <div className="gh-calendar-form-stack"><p className="gh-body">Scegli il pet per aprire la registrazione della lavorazione.</p>
          <Field label="Pet" as="select" value={workPetId} onChange={(event) => setWorkPetId(event.target.value)}><option value="">Seleziona pet</option>{petOptions.map((pet) => <option value={pet.id} key={pet.id}>{pet.name} · {pet.owner || 'senza proprietario'}</option>)}</Field>
        </div>
      </Modal>}

      {modal === 'request' && selectedItem && <Modal title="Conferma richiesta" onClose={() => setModal(null)} footer={<><Button staff variant="danger" loading={saving} onClick={rejectRequest}>Rifiuta e prepara WhatsApp</Button><Button staff loading={saving} disabled={Boolean(requestConflict)} onClick={confirmRequest}>Conferma e prepara WhatsApp</Button></>}>
        <div className="gh-calendar-form-stack">
          <div className="gh-calendar-modal-context"><PetAvatar name={selectedItem.petName} photo={selectedItem.photo} size={42} tier="base" /><div><strong>{selectedItem.petName}</strong><span>{selectedItem.client?.owner || 'Proprietario non indicato'} · {selectedItem.service?.name || selectedItem.notes || 'Bisogno non specificato'}</span></div></div>
          <div className="gh-calendar-form-grid gh-calendar-form-grid--three">
            <Field label="Data" type="date" value={requestForm.date} onChange={(event) => updateRequestTiming('date', event.target.value)} />
            <Field label="Ora" type="time" value={requestForm.time} onChange={(event) => updateRequestTiming('time', event.target.value)} />
            <Field label="Durata (min)" type="number" min="15" step="15" value={requestForm.durationMinutes} onChange={(event) => updateRequestTiming('durationMinutes', event.target.value)} />
          </div>
          <Field label="Messaggio WhatsApp" area value={requestForm.message} onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))} />
          {requestConflict && <p className="gh-calendar-conflict">Conflitto con {formatConflict(requestConflict)}.</p>}
        </div>
      </Modal>}

      {modal === 'detail' && selectedItem && <Modal title={`Appuntamento · ${selectedItem.petName}`} onClose={() => setModal(null)} footer={<><Button staff variant="ghost" onClick={() => setModal(null)}>Chiudi</Button><Button staff loading={saving} disabled={Boolean(detailConflict)} onClick={saveSchedule}>Salva orario</Button></>}>
        <form className="gh-calendar-form-stack" onSubmit={saveSchedule}>
          <div className="gh-calendar-modal-context"><PetAvatar name={selectedItem.petName} photo={selectedItem.photo} size={42} tier="base" /><div><strong>{selectedItem.petName}</strong><span>{selectedItem.client?.owner || 'Proprietario non indicato'} · {statusLabel(selectedItem.status)}</span></div></div>
          <div className="gh-calendar-form-grid gh-calendar-form-grid--three">
            <Field label="Data" type="date" value={detailForm.date} onChange={(event) => setDetailForm((current) => ({ ...current, date: event.target.value }))} />
            <Field label="Ora" type="time" value={detailForm.time} onChange={(event) => setDetailForm((current) => ({ ...current, time: event.target.value }))} />
            <Field label="Durata (min)" type="number" min="15" step="15" value={detailForm.durationMinutes} onChange={(event) => setDetailForm((current) => ({ ...current, durationMinutes: event.target.value }))} />
          </div>
          {detailConflict && <p className="gh-calendar-conflict">Conflitto con {formatConflict(detailConflict)}.</p>}
          <div className="gh-calendar-detail-actions">
            <Button staff variant="whatsapp" icon="whatsapp" onClick={openReminder}>Promemoria</Button>
            <Button staff variant="outline" icon="calendar" onClick={() => window.open(getGoogleCalendarUrl(selectedItem), '_blank', 'noopener,noreferrer')}>Google</Button>
            <Button staff variant="outline" icon="calendar" onClick={() => downloadIcs(selectedItem)}>Apple</Button>
            <Button staff variant="outline" icon="user" onClick={() => navigate(`/client/${selectedItem.pet_id}`)}>Apri cliente</Button>
            <Button staff variant="outline" icon="plus" onClick={() => { setModal(null); openManual(selectedItem.pet_id); }}>Nuovo per lo stesso cliente</Button>
          </div>
          <div className="gh-calendar-detail-actions">
            <Button staff variant="success" disabled={selectedItem.status === 'completed'} onClick={() => changeStatus('completed')}>Completato</Button>
            <Button staff variant="outline" disabled={selectedItem.status === 'no_show'} onClick={() => changeStatus('no_show')}>No-show</Button>
            <Button staff variant="danger" disabled={selectedItem.status === 'cancelled'} onClick={() => changeStatus('cancelled')}>Annulla</Button>
            {selectedItem.status !== 'scheduled' && <Button staff variant="ghost" onClick={() => changeStatus('scheduled')}>Ripristina programmato</Button>}
          </div>
        </form>
      </Modal>}
    </div>
  );
}
