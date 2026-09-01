import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  findOpenPetBooking,
  getStaffPetBookingMessage,
} from '../../../shared/appointments/openPetBookings';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import {
  getBookingSchedule,
  getBookingTimePreferenceDefaultTime,
  getBookingTimeWindowForPreference,
  getBookingTimeWindowForTime,
  getBookingTimeWindows,
  getDateClosure,
} from '../../../shared/tenant/bookingSchedule';
import {
  APPOINTMENT_CAPACITY_MESSAGE,
  findCapacityConflictIds,
  findFirstCapacityAvailableTime,
  findNextCapacityAvailableTime,
  getAppointmentWindowLoad,
  getAppointmentLoadNotice,
  getWorkstationCapacity,
  isAppointmentCapacityAvailable,
} from '../../../shared/tenant/workstationCapacity';
import PetAvatar from '../../../shared/ui/PetAvatar';
import Modal from '../../../shared/ui/Modal';
import WarmNotice from '../../../shared/ui/WarmNotice';
import { Button, Fab, Field, Hero, HeroButton, Panel } from '../components/StaffKit';
import {
  CalendarLoading,
  CalendarNavigation,
  CalendarPetCombobox,
  CalendarPlanningDay,
  CalendarPlanningWeek,
} from '../components/CalendarKit';
import {
  addPetToCustomer,
  addAppointment,
  createCalendarCustomerPet,
  deleteAppointment,
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
const DEFAULT_NEW_PET = { petName: '', ownerName: '', phone: '', phoneNotProvided: false, breed: '' };

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
const formatFullDayLabel = (dateString) => new Date(`${dateString}T12:00:00`).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const formatWeekLabel = (from, to) => {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const startMonth = start.toLocaleDateString('it-IT', { month: 'short' });
  const endMonth = end.toLocaleDateString('it-IT', { month: 'short' });
  return startMonth === endMonth
    ? `${start.getDate()}–${end.getDate()} ${endMonth} ${end.getFullYear()}`
    : `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
};
const formatCompactWeekLabel = (from, to) => {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const startMonth = start.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');
  const endMonth = end.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');
  return startMonth === endMonth
    ? `${start.getDate()}–${end.getDate()} ${endMonth}`
    : `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}`;
};

const getAppointmentEnd = (appointment) => {
  const start = new Date(appointment.scheduled_at);
  return new Date(start.getTime() + (Number(appointment.duration_minutes) || DEFAULT_DURATION) * 60000);
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
  return getBookingTimePreferenceDefaultTime(request.time_preference);
};
const requestLeadTimeLabel = (request) => {
  if (!request.created_at) return '';
  const target = request.scheduled_at
    ? new Date(request.scheduled_at)
    : requestDate(request)
      ? new Date(`${requestDate(request)}T${requestDefaultTime(request)}`)
      : null;
  const created = new Date(request.created_at);
  if (!target || Number.isNaN(target.getTime()) || Number.isNaN(created.getTime())) return '';
  const hours = Math.max(0, Math.round((target.getTime() - created.getTime()) / 3600000));
  return `Preavviso ${hours} ${hours === 1 ? 'ora' : 'ore'}`;
};
const statusLabel = (status) => ({ scheduled: 'Programmato', completed: 'Completato', no_show: 'Assenza', cancelled: 'Annullato' }[status] || status);

function AppointmentLoadNote({ notice }) {
  if (!notice) return null;
  const appointmentLabel = notice.appointmentCount === 1 ? 'lavorazione' : 'lavorazioni';
  const workstationLabel = notice.remainingAtStart === 1 ? 'postazione libera' : 'postazioni libere';
  return (
    <div className="gh-calendar-load-note" role="status">
      <p>{notice.weekday} {notice.windowLabel}: <strong>{notice.appointmentCount} {appointmentLabel}</strong> già in programma.</p>
      {notice.showRemaining ? <p>Alle {notice.time} {notice.remainingAtStart === 1 ? 'resta' : 'restano'} <strong>{notice.remainingAtStart} {workstationLabel}</strong>.</p> : null}
    </div>
  );
}

function PetDuplicateNotice({ booking, petName }) {
  if (!booking) return null;
  return (
    <WarmNotice staff icon="bell" className="gh-calendar-pet-duplicate">
      {getStaffPetBookingMessage(booking, petName)}
    </WarmNotice>
  );
}

export default function Calendar() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [searchParams] = useSearchParams();
  const openedQueryClientRef = useRef('');
  const latestWeekLoadRef = useRef(0);
  const [calendarMode, setCalendarMode] = useState('week');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(todayString()));
  const weekEnd = addDays(weekStart, 6);
  const [selectedDay, setSelectedDay] = useState(todayString());
  const [data, setData] = useState({ appointments: [], requests: [], visits: [], openBookings: [] });
  const [petOptions, setPetOptions] = useState([]);
  const [petsLoaded, setPetsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [whatsappDraft, setWhatsappDraft] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [manualForm, setManualForm] = useState(() => ({ ...DEFAULT_FORM, date: todayString() }));
  const [manualPetCreation, setManualPetCreation] = useState(false);
  const [manualPetDraft, setManualPetDraft] = useState(DEFAULT_NEW_PET);
  const [manualPetError, setManualPetError] = useState('');
  const [manualPhoneConflict, setManualPhoneConflict] = useState(null);
  const [creatingPet, setCreatingPet] = useState(false);
  const [requestForm, setRequestForm] = useState({ date: '', time: '09:00', durationMinutes: DEFAULT_DURATION, message: '' });
  const [detailForm, setDetailForm] = useState({ date: '', time: '', durationMinutes: DEFAULT_DURATION });
  const [deleteError, setDeleteError] = useState('');
  const [workPetId, setWorkPetId] = useState('');
  const bookingSchedule = useMemo(
    () => getBookingSchedule(tenant?.settings),
    [tenant?.settings]
  );
  const workstationCapacity = useMemo(
    () => getWorkstationCapacity(tenant?.settings),
    [tenant?.settings]
  );
  const bookingTimeWindows = useMemo(() => getBookingTimeWindows(), []);

  const loadWeek = useCallback(async () => {
    const requestId = latestWeekLoadRef.current + 1;
    latestWeekLoadRef.current = requestId;
    setLoading(true);
    setError('');
    try {
      const nextData = await getCalendarWeekData({ from: weekStart, to: weekEnd });
      if (requestId !== latestWeekLoadRef.current) return;
      setData(nextData);
    } catch (loadError) {
      if (requestId !== latestWeekLoadRef.current) return;
      setError(loadError.message || 'Non riesco a caricare il calendario');
    } finally {
      if (requestId === latestWeekLoadRef.current) setLoading(false);
    }
  }, [weekEnd, weekStart]);
  useEffect(() => {
    loadWeek();
    return () => { latestWeekLoadRef.current += 1; };
  }, [loadWeek]);
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
  const hasCapacityConflict = useCallback((candidate, excludedId = null) =>
    !isAppointmentCapacityAvailable({
      candidate,
      appointments: data.appointments,
      capacity: workstationCapacity,
      excludedId,
    }), [data.appointments, workstationCapacity]);
  const conflictIds = useMemo(
    () => findCapacityConflictIds(data.appointments, workstationCapacity),
    [data.appointments, workstationCapacity]
  );
  const makeTags = useCallback((source) => {
    const tags = [];
    if (source.client?.is_blacklisted) tags.push({ tone: 'danger', label: 'Blacklist' });
    else if ((source.client?.no_show_score ?? 0) < 0) tags.push({ tone: 'warning', label: 'A rischio' });
    if (source.kind === 'appointment' && conflictIds.has(source.id)) tags.push({ tone: 'danger', label: 'Postazioni piene' });
    if (source.kind === 'appointment' && source.status !== 'scheduled') {
      const statusTone = source.status === 'completed' ? 'success' : source.status === 'cancelled' ? 'neutral' : 'danger';
      tags.push({ tone: statusTone, label: source.status === 'no_show' ? 'No-show' : statusLabel(source.status) });
    }
    return tags;
  }, [conflictIds]);

  const calendarItems = useMemo(() => {
    const requests = data.requests.map((request) => ({
      ...request, kind: 'request', petName: request.client?.name || 'Pet', photo: request.client?.photo,
      preference: request.time_preference || (request.scheduled_at ? formatTime(request.scheduled_at) : 'flexible'),
      leadTimeLabel: requestLeadTimeLabel(request),
      subtitle: [request.service?.name || request.notes || 'Bisogno non specificato', request.client?.owner].filter(Boolean).join(' · '),
    }));
    const appointments = data.appointments.map((appointment) => ({
      ...appointment, kind: 'appointment', petName: appointment.client?.name || 'Pet', photo: appointment.client?.photo,
      time: formatTime(appointment.scheduled_at),
      serviceLabel: appointment.service?.name || 'Appuntamento',
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
    const closure = getDateClosure(date, bookingSchedule);
    const items = calendarItems.filter((item) => {
      const itemDate = item.kind === 'request' ? requestDate(item) : item.kind === 'visit' ? item.date : toLocalDateString(new Date(item.scheduled_at));
      return itemDate === date;
    });
    const appointments = items.filter((item) => item.kind === 'appointment');
    const activeAppointments = appointments.filter((item) => item.status !== 'cancelled');
    const cancelledAppointments = appointments.filter((item) => item.status === 'cancelled');
    const requests = items.filter((item) => item.kind === 'request');
    const visits = items.filter((item) => item.kind === 'visit');
    const bands = bookingTimeWindows.map((window) => ({
      date,
      window,
      isClosed: closure.isClosed || closure.closedTimePreferences.includes(window.value),
      appointments: activeAppointments.filter((item) => getBookingTimeWindowForTime(item.time)?.value === window.value),
      dayAppointments: appointments.filter((item) => getBookingTimeWindowForTime(item.time)?.value === window.value),
      requests: requests.filter((item) => {
        const requestWindow = getBookingTimeWindowForPreference(item.preference)
          || (item.scheduled_at ? getBookingTimeWindowForTime(formatTime(item.scheduled_at)) : null);
        return requestWindow?.value === window.value;
      }),
      load: getAppointmentWindowLoad({ appointments: data.appointments, date, window, capacity: workstationCapacity }),
    }));
    const placedIds = new Set(bands.flatMap((band) => [...band.dayAppointments, ...band.requests]).map((item) => `${item.kind}-${item.id}`));
    return {
      date,
      weekday: parsed.toLocaleDateString('it-IT', { weekday: 'short' }),
      dayNumber: parsed.getDate(),
      isToday: date === todayString(),
      closure,
      bands,
      visits,
      cancelledAppointments,
      unplacedItems: [...requests, ...activeAppointments].filter((item) => !placedIds.has(`${item.kind}-${item.id}`)),
      dayUnplacedItems: [...requests, ...appointments].filter((item) => !placedIds.has(`${item.kind}-${item.id}`)),
    };
  }), [bookingSchedule, bookingTimeWindows, calendarItems, data.appointments, weekStart, workstationCapacity]);

  const openManual = useCallback(async (clientId = '', preset = null) => {
    setError('');
    try {
      await ensurePets();
      const date = preset?.date || (selectedDay >= weekStart && selectedDay <= weekEnd ? selectedDay : todayString());
      setSelectedDay(date);
      setManualForm((current) => ({
        ...current,
        clientId: clientId || current.clientId || '',
        date,
        time: preset?.time || current.time,
      }));
      setManualPetCreation(false);
      setManualPetDraft(DEFAULT_NEW_PET);
      setManualPetError('');
      setManualPhoneConflict(null);
      setModal('manual');
    } catch (loadError) {
      setError(loadError.message || 'Non riesco a caricare i pet');
    }
  }, [ensurePets, selectedDay, weekEnd, weekStart]);

  const openPlanningBand = useCallback((band) => {
    const time = findFirstCapacityAvailableTime({
      appointments: data.appointments,
      date: band.date,
      window: band.window,
      durationMinutes: DEFAULT_DURATION,
      capacity: workstationCapacity,
    });
    openManual('', { date: band.date, time });
  }, [data.appointments, openManual, workstationCapacity]);
  const beginManualPetCreation = (petName) => {
    setManualForm((current) => ({ ...current, clientId: '' }));
    setManualPetDraft({ ...DEFAULT_NEW_PET, petName });
    setManualPetError('');
    setManualPhoneConflict(null);
    setManualPetCreation(true);
  };
  const selectCreatedPet = async (petId) => {
    const pets = await getCalendarPetOptions();
    setPetOptions(pets);
    setPetsLoaded(true);
    setManualForm((current) => ({ ...current, clientId: petId }));
    setManualPetCreation(false);
    setManualPhoneConflict(null);
    setManualPetError('');
    setSuccess('Pet creato e selezionato. Puoi completare l’appuntamento.');
  };
  const createManualPet = async (existingCustomerId = null) => {
    setManualPetError('');
    setSuccess('');
    const petName = manualPetDraft.petName.trim();
    if (!petName) {
      setManualPetError('Il nome del pet e obbligatorio.');
      return;
    }
    if (!existingCustomerId && !manualPetDraft.ownerName.trim()) {
      setManualPetError('Il nome del proprietario e obbligatorio.');
      return;
    }
    if (!existingCustomerId && !manualPetDraft.phoneNotProvided && !manualPetDraft.phone.trim()) {
      setManualPetError('Inserisci il telefono oppure dichiara che non e stato fornito.');
      return;
    }
    setCreatingPet(true);
    try {
      if (existingCustomerId) {
        const created = await addPetToCustomer(existingCustomerId, {
          name: petName,
          breed: manualPetDraft.breed,
        });
        await selectCreatedPet(created.pet_id);
        return;
      }
      const created = await createCalendarCustomerPet(manualPetDraft);
      if (created.outcome === 'phone_conflict') {
        setManualPhoneConflict(created);
        return;
      }
      await selectCreatedPet(created.petId);
    } catch (createError) {
      setManualPetError(createError.message || 'Non riesco a creare il pet.');
    } finally {
      setCreatingPet(false);
    }
  };
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
  const manualConflict = manualCandidate ? hasCapacityConflict(manualCandidate) : false;
  const requestConflict = requestCandidate ? hasCapacityConflict(requestCandidate, selectedItem?.request_kind === 'legacy' ? selectedItem.id : null) : false;
  const detailConflict = detailCandidate ? hasCapacityConflict(detailCandidate, selectedItem?.id) : false;
  const getLoadNotice = useCallback((candidate, excludedId = null) => getAppointmentLoadNotice({
    candidate,
    appointments: data.appointments,
    capacity: workstationCapacity,
    excludedId,
  }), [data.appointments, workstationCapacity]);
  const manualLoadNotice = manualCandidate && !manualConflict ? getLoadNotice(manualCandidate) : null;
  const requestLoadNotice = requestCandidate && !requestConflict
    ? getLoadNotice(requestCandidate, selectedItem?.request_kind === 'legacy' ? selectedItem.id : null)
    : null;
  const detailLoadNotice = detailCandidate && !detailConflict
    ? getLoadNotice(detailCandidate, selectedItem?.id)
    : null;
  const manualPet = petOptions.find((pet) => pet.id === manualForm.clientId) || null;
  const manualDuplicateBooking = !manualConflict
    ? findOpenPetBooking(data.openBookings, manualForm.clientId)
    : null;
  const requestDuplicateBooking = !requestConflict && selectedItem
    ? findOpenPetBooking(data.openBookings, selectedItem.pet_id, {
      excludeAppointmentId: selectedItem.request_kind === 'legacy' ? selectedItem.id : null,
      excludeRequestId: selectedItem.request_kind === 'structured' ? selectedItem.id : null,
    })
    : null;
  const detailDuplicateBooking = !detailConflict && selectedItem
    ? findOpenPetBooking(data.openBookings, selectedItem.pet_id, {
      excludeAppointmentId: selectedItem.id,
    })
    : null;

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
    if (manualConflict) { setError(APPOINTMENT_CAPACITY_MESSAGE); return; }
    setSaving(true);
    try {
      await addAppointment({ pet_id: manualForm.clientId, scheduled_at: manualCandidate.scheduled_at, duration_minutes: manualCandidate.duration_minutes, status: 'scheduled', notes: manualForm.notes });
      const nextTime = findNextCapacityAvailableTime({ date: manualForm.date, time: manualForm.time, durationMinutes: manualForm.durationMinutes, appointments: [...data.appointments, { ...manualCandidate, status: 'scheduled', approval_status: 'approved' }], capacity: workstationCapacity });
      setManualForm((current) => ({ ...current, time: nextTime, notes: '' }));
      setSuccess('Appuntamento creato. Il prossimo orario libero è già pronto.');
      await loadWeek();
    } catch (saveError) { setError(saveError.message || 'Non riesco a creare l’appuntamento'); }
    finally { setSaving(false); }
  };
  const confirmRequest = async () => {
    if (!selectedItem || !requestCandidate) return;
    if (requestConflict) { setError(APPOINTMENT_CAPACITY_MESSAGE); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (selectedItem.request_kind === 'structured') {
        await resolveAppointmentRequest(
          selectedItem.id,
          'approved',
          requestForm.date,
          requestForm.time,
          requestCandidate.duration_minutes
        );
      }
      else { await updateAppointmentSchedule(selectedItem.id, requestCandidate); await updateAppointmentApproval(selectedItem.id, 'approved'); }
      const whatsappUrl = buildWhatsAppUrl(selectedItem.client?.phone, requestForm.message);
      setModal(null); await loadWeek();
      setWhatsappDraft({ url: whatsappUrl, message: requestForm.message, recipient: selectedItem.client?.owner || 'cliente' });
      setSuccess('Richiesta confermata e appuntamento creato. Ora puoi avvisare il cliente.');
    } catch (saveError) { setError(saveError.message || 'Non riesco a confermare la richiesta'); }
    finally { setSaving(false); }
  };
  const rejectRequest = async () => {
    if (!selectedItem) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      if (selectedItem.request_kind === 'structured') await resolveAppointmentRequest(selectedItem.id, 'rejected', null, null, null);
      else await updateAppointmentApproval(selectedItem.id, 'rejected');
      const rejectionMessage = getAppointmentApprovalWhatsAppMessage(selectedItem, 'rejected');
      const rejectionUrl = buildWhatsAppUrl(selectedItem.client?.phone, rejectionMessage);
      setModal(null); await loadWeek();
      setWhatsappDraft({ url: rejectionUrl, message: rejectionMessage, recipient: selectedItem.client?.owner || 'cliente' });
      setSuccess('Richiesta rifiutata. Ora puoi avvisare il cliente.');
    } catch (saveError) { setError(saveError.message || 'Non riesco a rifiutare la richiesta'); }
    finally { setSaving(false); }
  };
  const saveSchedule = async (event) => {
    event.preventDefault();
    if (!selectedItem || !detailCandidate) return;
    if (selectedItem.status === 'no_show') return;
    if (detailConflict) { setError(APPOINTMENT_CAPACITY_MESSAGE); return; }
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
      const previousStatus = selectedItem.status;
      setSelectedItem((current) => ({ ...current, status }));
      setSuccess(
        status === 'no_show'
          ? 'Assenza registrata con la data dell’appuntamento.'
          : previousStatus === 'no_show'
            ? 'Assenza annullata: appuntamento e punteggio sono stati ripristinati.'
            : `Stato aggiornato: ${statusLabel(status)}.`
      );
      await loadWeek();
    } catch (saveError) { setError(saveError.message || 'Non riesco ad aggiornare lo stato'); }
    finally { setSaving(false); }
  };
  const openDeleteConfirmation = () => {
    setDeleteError('');
    setModal('delete');
  };
  const confirmDelete = async () => {
    if (!selectedItem) return;
    setSaving(true); setDeleteError(''); setSuccess('');
    try {
      await deleteAppointment(selectedItem.id);
      setModal(null);
      setSelectedItem(null);
      setSuccess('Appuntamento eliminato: la riga inserita per errore non fa più parte della storia.');
      await loadWeek();
    } catch (deleteFailure) {
      setDeleteError(deleteFailure.message || "Non riesco a eliminare l'appuntamento.");
    } finally {
      setSaving(false);
    }
  };
  const openReminder = () => {
    const url = getAppointmentWhatsAppUrl(selectedItem);
    if (!url) { setError('Numero cliente non disponibile per WhatsApp.'); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const weekIsEmpty = data.requests.length === 0
    && data.visits.length === 0
    && data.appointments.every((item) => item.status === 'cancelled');
  const selectedPlanningDay = weekDays.find((day) => day.date === selectedDay) || weekDays[0];
  const planningSummary = {
    appointments: data.appointments.filter((item) => item.status !== 'cancelled').length,
    requests: data.requests.length,
    walkIns: data.visits.length,
  };
  const selectPlanningDay = (date) => {
    setSelectedDay(date);
    setWeekStart(startOfWeek(date));
    setCalendarMode('day');
  };
  const moveCalendar = (amount) => {
    if (calendarMode === 'week') {
      setWeekStart((current) => addDays(current, amount * 7));
      setSelectedDay((current) => addDays(current, amount * 7));
      return;
    }
    const nextDate = addDays(selectedDay, amount);
    setSelectedDay(nextDate);
    setWeekStart(startOfWeek(nextDate));
  };
  const goToToday = () => {
    const today = todayString();
    setSelectedDay(today);
    setWeekStart(startOfWeek(today));
  };
  const planningRangeLabel = calendarMode === 'week'
    ? formatWeekLabel(weekStart, weekEnd)
    : formatFullDayLabel(selectedDay);
  const compactPlanningRangeLabel = calendarMode === 'week'
    ? formatCompactWeekLabel(weekStart, weekEnd)
    : formatFullDayLabel(selectedDay);

  return (
    <div className={`gh-page${modal === 'manual' || modal === 'detail' ? ' gh-calendar-page--grid-modal-open' : ''}`}>
      <Hero title="Dove lo metto" subtitle="La settimana a colpo d'occhio, per collocare chi arriva al banco" right={(
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
        {whatsappDraft ? (
          <Panel eyebrow="Comunicazione separata" title={`Messaggio per ${whatsappDraft.recipient}`}>
            <p className="gh-body gh-pre-wrap">{whatsappDraft.message}</p>
            <p className="gh-meta">Il salvataggio è concluso; il messaggio non risulta inviato finché non lo mandi da WhatsApp.</p>
            <div className="gh-inline-actions">
              {whatsappDraft.url ? <a className="gh-btn gh-btn--whatsapp" href={whatsappDraft.url} target="_blank" rel="noreferrer">Apri WhatsApp</a> : null}
              <Button staff variant="outline" onClick={() => navigator.clipboard?.writeText(whatsappDraft.message)}>Copia messaggio</Button>
            </div>
          </Panel>
        ) : null}
        <CalendarNavigation
          mode={calendarMode}
          rangeLabel={planningRangeLabel}
          compactRangeLabel={compactPlanningRangeLabel}
          onMode={setCalendarMode}
          onPrevious={() => moveCalendar(-1)}
          onNext={() => moveCalendar(1)}
          onToday={goToToday}
          dateValue={selectedDay}
          onDate={(event) => {
            if (!event.target.value) return;
            setSelectedDay(event.target.value);
            setWeekStart(startOfWeek(event.target.value));
          }}
          summary={planningSummary}
        />
        {weekIsEmpty && calendarMode === 'week' && !loading ? (
          <div className="gh-calendar-future-note" role="status">
            Questa settimana è ancora tutta da riempire: è la condizione normale quando si guarda avanti, non un errore.
          </div>
        ) : null}
        <Panel className="gh-calendar-main" flush>
          {loading ? <CalendarLoading /> : calendarMode === 'week' ? (
            <CalendarPlanningWeek days={weekDays} onOpen={openItem} onBook={openPlanningBand} onSelectDay={selectPlanningDay} />
          ) : (
            <CalendarPlanningDay day={selectedPlanningDay} onOpen={openItem} onBook={openPlanningBand} />
          )}
        </Panel>
      </main>
      <Fab label="Registra lavorazione" icon="pencil" onClick={openWork} />

      {modal === 'manual' && <Modal variant="side" title="Nuovo appuntamento" onClose={() => setModal(null)} footer={<><Button staff variant="ghost" onClick={() => setModal(null)}>Chiudi</Button><Button staff loading={saving} disabled={manualPetCreation || !manualForm.clientId || Boolean(manualConflict)} onClick={submitManual}>Salva appuntamento</Button></>}>
        <form className="gh-calendar-form-stack" onSubmit={submitManual}>
          <CalendarPetCombobox
            options={petOptions}
            selectedId={manualForm.clientId}
            onSelect={(clientId) => {
              setManualForm((current) => ({ ...current, clientId }));
              if (clientId) {
                setManualPetCreation(false);
                setManualPhoneConflict(null);
                setManualPetError('');
              }
            }}
            onCreate={beginManualPetCreation}
          />
          {manualPetCreation && (
            <section className="gh-calendar-new-pet" aria-label="Crea un nuovo pet">
              <header>
                <strong>Nuovo pet</strong>
                <span>Cliente e pet vengono salvati insieme.</span>
              </header>
              <Field label="Nome pet" value={manualPetDraft.petName} onChange={(event) => setManualPetDraft((current) => ({ ...current, petName: event.target.value }))} required />
              <Field label="Proprietario" value={manualPetDraft.ownerName} onChange={(event) => setManualPetDraft((current) => ({ ...current, ownerName: event.target.value }))} required />
              <Field
                label="Telefono"
                type="tel"
                pattern="[0-9+(). /-]*"
                value={manualPetDraft.phone}
                disabled={manualPetDraft.phoneNotProvided}
                onChange={(event) => setManualPetDraft((current) => ({ ...current, phone: event.target.value }))}
              />
              <label className="gh-calendar-phone-absence">
                <input
                  type="checkbox"
                  checked={manualPetDraft.phoneNotProvided}
                  onChange={(event) => setManualPetDraft((current) => ({
                    ...current,
                    phoneNotProvided: event.target.checked,
                    phone: event.target.checked ? '' : current.phone,
                  }))}
                />
                <span>Il telefono non è stato fornito</span>
              </label>
              <Field label="Razza (facoltativa)" value={manualPetDraft.breed} onChange={(event) => setManualPetDraft((current) => ({ ...current, breed: event.target.value }))} />
              {manualPetError && <p className="gh-calendar-new-pet__error" role="alert">{manualPetError}</p>}
              {manualPhoneConflict ? (
                <div className="gh-calendar-phone-conflict" role="status">
                  <p>Questo numero è di <strong>{manualPhoneConflict.existingCustomerName}</strong>. È un altro suo pet?</p>
                  <div className="gh-inline-actions">
                    <Button staff loading={creatingPet} onClick={() => createManualPet(manualPhoneConflict.existingCustomerId)}>Sì, aggiungilo</Button>
                    <Button staff variant="outline" onClick={() => setManualPhoneConflict(null)}>No, correggi il numero</Button>
                  </div>
                </div>
              ) : (
                <div className="gh-inline-actions">
                  <Button staff loading={creatingPet} onClick={() => createManualPet()}>Crea e seleziona il pet</Button>
                  <Button staff variant="ghost" onClick={() => setManualPetCreation(false)}>Annulla</Button>
                </div>
              )}
            </section>
          )}
          <div className="gh-calendar-form-grid gh-calendar-form-grid--three">
            <Field label="Data" type="date" value={manualForm.date} onChange={(event) => setManualForm((current) => ({ ...current, date: event.target.value }))} required />
            <Field label="Ora" type="time" value={manualForm.time} onChange={(event) => setManualForm((current) => ({ ...current, time: event.target.value }))} required />
            <Field label="Durata (min)" type="number" min="15" step="15" value={manualForm.durationMinutes} onChange={(event) => setManualForm((current) => ({ ...current, durationMinutes: event.target.value }))} />
          </div>
          <Field label="Note" area value={manualForm.notes} onChange={(event) => setManualForm((current) => ({ ...current, notes: event.target.value }))} />
          {manualConflict && <p className="gh-calendar-conflict">{APPOINTMENT_CAPACITY_MESSAGE}</p>}
          <AppointmentLoadNote notice={manualLoadNotice} />
          <PetDuplicateNotice booking={manualDuplicateBooking} petName={manualPet?.name} />
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
            <Field label="Durata prevista (min)" type="number" min="15" step="15" value={requestForm.durationMinutes} onChange={(event) => updateRequestTiming('durationMinutes', event.target.value)} />
          </div>
          <p className="gh-calendar-form-helper">Il servizio propone il valore iniziale: adattalo al cane che stai valutando.</p>
          {getDateClosure(requestForm.date, bookingSchedule).label ? (
            <p className="gh-calendar-notice gh-calendar-notice--error" role="status">
              Attenzione: {getDateClosure(requestForm.date, bookingSchedule).isClosed ? 'il salone risulta chiuso in questo giorno' : getDateClosure(requestForm.date, bookingSchedule).label.toLowerCase()}. Puoi confermare comunque se è un’eccezione voluta.
            </p>
          ) : null}
          <Field label="Messaggio WhatsApp" area value={requestForm.message} onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))} />
          {selectedItem.request_kind === 'structured' ? (
            <Button staff variant="secondary" onClick={() => navigate('/requests')}>Proponi alternative dalla coda richieste</Button>
          ) : null}
          {requestConflict && <p className="gh-calendar-conflict">{APPOINTMENT_CAPACITY_MESSAGE}</p>}
          <AppointmentLoadNote notice={requestLoadNotice} />
          <PetDuplicateNotice booking={requestDuplicateBooking} petName={selectedItem.petName} />
        </div>
      </Modal>}

      {modal === 'detail' && selectedItem && <Modal variant="side" title={`Appuntamento · ${selectedItem.petName}`} onClose={() => setModal(null)} footer={<><Button staff variant="ghost" onClick={() => setModal(null)}>Chiudi</Button><Button staff loading={saving} disabled={Boolean(detailConflict) || selectedItem.status === 'no_show'} onClick={saveSchedule}>Salva orario</Button></>}>
        <form className="gh-calendar-form-stack" onSubmit={saveSchedule}>
          <div className="gh-calendar-modal-context"><PetAvatar name={selectedItem.petName} photo={selectedItem.photo} size={42} tier="base" /><div><strong>{selectedItem.petName}</strong><span>{selectedItem.client?.owner || 'Proprietario non indicato'} · {statusLabel(selectedItem.status)}</span></div></div>
          <div className="gh-calendar-form-grid gh-calendar-form-grid--three">
            <Field label="Data" type="date" value={detailForm.date} disabled={selectedItem.status === 'no_show'} onChange={(event) => setDetailForm((current) => ({ ...current, date: event.target.value }))} />
            <Field label="Ora" type="time" value={detailForm.time} disabled={selectedItem.status === 'no_show'} onChange={(event) => setDetailForm((current) => ({ ...current, time: event.target.value }))} />
            <Field label="Durata (min)" type="number" min="15" step="15" value={detailForm.durationMinutes} disabled={selectedItem.status === 'no_show'} onChange={(event) => setDetailForm((current) => ({ ...current, durationMinutes: event.target.value }))} />
          </div>
          {detailConflict && <p className="gh-calendar-conflict">{APPOINTMENT_CAPACITY_MESSAGE}</p>}
          <AppointmentLoadNote notice={detailLoadNotice} />
          <PetDuplicateNotice booking={detailDuplicateBooking} petName={selectedItem.petName} />
          <div className="gh-calendar-detail-actions">
            <Button staff variant="whatsapp" icon="whatsapp" onClick={openReminder}>Promemoria</Button>
            <Button staff variant="outline" icon="calendar" onClick={() => window.open(getGoogleCalendarUrl(selectedItem), '_blank', 'noopener,noreferrer')}>Google</Button>
            <Button staff variant="outline" icon="calendar" onClick={() => downloadIcs(selectedItem)}>Apple</Button>
            <Button staff variant="outline" icon="user" onClick={() => navigate(`/client/${selectedItem.pet_id}`)}>Apri cliente</Button>
            {selectedItem.status === 'scheduled' ? (
              <Button staff variant="success" icon="pencil" onClick={() => navigate(`/client/${selectedItem.pet_id}/add-visit?appointmentId=${selectedItem.id}`)}>
                Registra lavorazione
              </Button>
            ) : null}
            <Button staff variant="outline" icon="plus" onClick={() => { setModal(null); openManual(selectedItem.pet_id); }}>Nuovo per lo stesso cliente</Button>
          </div>
          <div className="gh-calendar-detail-actions">
            {selectedItem.status === 'scheduled' ? (
              <Button staff variant="danger" onClick={() => changeStatus('no_show')}>Segna assenza</Button>
            ) : null}
            {selectedItem.status === 'no_show' ? (
              <Button staff variant="outline" onClick={() => changeStatus('scheduled')}>Annulla assenza</Button>
            ) : null}
            {selectedItem.status !== 'no_show' ? (
              <Button staff variant="danger" disabled={selectedItem.status === 'cancelled'} onClick={() => changeStatus('cancelled')}>Annulla appuntamento</Button>
            ) : null}
            {selectedItem.status === 'cancelled' ? (
              <Button staff variant="ghost" onClick={() => changeStatus('scheduled')}>Ripristina programmato</Button>
            ) : null}
          </div>
          {selectedItem.status !== 'completed'
            && selectedItem.appointment_source === 'operator'
            && !selectedItem.requested_by_customer_id ? (
              <div className="gh-calendar-form-stack">
                <p className="gh-calendar-form-helper">Solo se questa riga è stata inserita per errore.</p>
                <div className="gh-inline-actions">
                  <Button staff variant="ghost" onClick={openDeleteConfirmation}>Elimina</Button>
                </div>
              </div>
            ) : null}
        </form>
      </Modal>}

      {modal === 'delete' && selectedItem && <Modal title="Elimina appuntamento" narrow onClose={() => setModal('detail')} footer={<><Button staff variant="ghost" onClick={() => setModal('detail')}>Torna indietro</Button><Button staff variant="danger" loading={saving} onClick={confirmDelete}>Elimina definitivamente</Button></>}>
        <div className="gh-calendar-form-stack">
          <p className="gh-body"><strong>Elimini l&apos;appuntamento di {selectedItem.petName} di {formatFullDayLabel(toLocalDateString(new Date(selectedItem.scheduled_at)))} alle {formatTime(selectedItem.scheduled_at)}?</strong></p>
          <p className="gh-body">Sparisce del tutto. Se invece il cliente ha disdetto, usa «Annulla appuntamento»: resta come fatto.</p>
          {deleteError ? <p className="gh-calendar-notice gh-calendar-notice--error" role="alert">{deleteError}</p> : null}
        </div>
      </Modal>}
    </div>
  );
}
