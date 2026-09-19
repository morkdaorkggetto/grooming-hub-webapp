import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { supabase } from '../../../shared/supabase/client';
import { currentAlternativeResponse } from '../../customer/lib/appointmentResponses';
import {
  getBookingSchedule,
  getBookingTimePreferenceDefaultTime,
  getBookingTimePreferenceLabel,
  getBookingTimeWindowForTime,
  getDateClosure,
  isTimePreferenceClosed,
} from '../../../shared/tenant/bookingSchedule';
import {
  APPOINTMENT_CAPACITY_MESSAGE,
  getAppointmentLoadNotice,
  findFirstCapacityAvailableTime,
  getWorkstationCapacity,
  isAppointmentCapacityAvailable,
} from '../../../shared/tenant/workstationCapacity';
import {
  APPOINTMENT_REQUEST_STAFF_ACTION,
  getAppointmentRequestsForStaff,
  proposeAppointmentRequestAlternatives,
  RECENT_WITHDRAWN_REQUEST_DAYS,
  resolveAppointmentRequest,
  summarizePendingAppointmentRequests,
  updateAppointmentApproval,
} from '../lib/database';
import {
  buildWhatsAppUrl,
  getAppointmentAlternativesWhatsAppMessage,
  getAppointmentApprovalWhatsAppMessage,
  getWhatsAppOwnerName,
} from '../lib/whatsapp';
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  Hero,
  HeroButton,
  Panel,
  SkeletonRow,
  StateTag,
  StatStrip,
} from '../components/StaffKit';

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCreatedAt = (iso) =>
  new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDesiredDate = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatSlotTime = (value) => String(value || '').slice(0, 5);
const formatAlternative = (item) => item.time
  ? `${formatDesiredDate(item.date)} alle ${formatSlotTime(item.time)}`
  : `${formatDesiredDate(item.date)} · ${getBookingTimePreferenceLabel(item.time_preference)}`;

const nextDate = (value) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
};

const loadAppointmentsForDate = async (tenantId, date) => {
  const { data, error } = await supabase.from('appointments')
    .select('id, scheduled_at, duration_minutes, status, approval_status')
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', new Date(`${date}T00:00:00`).toISOString())
    .lt('scheduled_at', new Date(`${nextDate(date)}T00:00:00`).toISOString());
  if (error) throw error;
  return data || [];
};

function useAppointmentsByDate(tenantId, dates) {
  const cache = useRef(new Map());
  const mounted = useRef(true);
  const [, redraw] = useState(0);
  const dateKey = [...new Set(dates.filter(Boolean))].sort().join(',');

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (!tenantId) return;
    dateKey.split(',').filter(Boolean).forEach((date) => {
      const key = `${tenantId}:${date}`;
      if (cache.current.has(key)) return;
      cache.current.set(key, { state: 'loading' });
      loadAppointmentsForDate(tenantId, date)
        .then((appointments) => cache.current.set(key, { state: 'ready', appointments }))
        .catch(() => cache.current.set(key, { state: 'error' }))
        .finally(() => { if (mounted.current) redraw((value) => value + 1); });
    });
  }, [dateKey, tenantId]);

  return (date) => {
    const result = cache.current.get(`${tenantId}:${date}`);
    return result?.state === 'ready' ? result.appointments : null;
  };
}

function CapacityNotice({ appointments, capacity, date, time, durationMinutes, onUseTime }) {
  const window = getBookingTimeWindowForTime(time);
  if (!window || appointments === null) return null;
  const candidate = {
    scheduled_at: new Date(`${date}T${time}`).toISOString(),
    duration_minutes: Number(durationMinutes) || 60,
  };
  const loadNotice = getAppointmentLoadNotice({ candidate, appointments, capacity });
  const occupied = loadNotice ? capacity - loadNotice.remainingAtStart : 0;
  const available = isAppointmentCapacityAvailable({ candidate, appointments, capacity });
  let nextTime = '';
  if (!available) {
    const found = findFirstCapacityAvailableTime({
      appointments,
      date,
      window: { ...window, start: time },
      durationMinutes,
      capacity,
    });
    if (found !== time && isAppointmentCapacityAvailable({
      candidate: { ...candidate, scheduled_at: new Date(`${date}T${found}`).toISOString() },
      appointments,
      capacity,
    })) nextTime = found;
  }
  return (
    <div className={`gh-calendar-notice${available ? '' : ' gh-calendar-notice--error'}`} role="status">
      <p><strong>{occupied}/{capacity}</strong> postazioni occupate</p>
      {!available ? <p>Alle {time} non c'è posto.{nextTime ? ` Il primo momento libero è alle ${nextTime}.` : ''}</p> : null}
      {!available && nextTime ? <Button staff type="button" variant="outline" onClick={() => onUseTime(nextTime)}>Usa le {nextTime}</Button> : null}
    </div>
  );
}

const COAT_CONDITION_LABELS = {
  some_knots: 'Qualche nodo',
  very_matted: 'Molto annodato',
  heavy_shedding: 'Perde tanto pelo',
  regular_grooming: 'Lo porto regolarmente',
  clean_long: 'Pulito, solo lungo',
};

const getRequestService = (notes = '') => {
  const match = String(notes).match(/Servizio richiesto:\s*([^.]*)/i);
  return match?.[1]?.trim() || 'Appuntamento';
};

const getRequestWindow = (notes = '') => {
  const match = String(notes).match(/Fascia preferita:\s*([^.]*)/i);
  return match?.[1]?.trim() || '';
};

function RequestCard({ request, updatingId, onApproval, onAlternatives, onOpenClient }) {
  const isStructured = request.request_kind === 'structured';
  const isWithdrawn = request.status === 'withdrawn';
  const service = request.service?.name || getRequestService(request.notes);
  const windowLabel = isStructured
    ? getBookingTimePreferenceLabel(request.time_preference, 'Nessuna preferenza') || 'Nessuna preferenza'
    : getRequestWindow(request.notes);
  const coatLabels = (request.coat_condition_codes || [])
    .map((value) => COAT_CONDITION_LABELS[value] || value)
    .join(', ');
  const isUpdating = updatingId === request.id;
  const response = currentAlternativeResponse(request);
  const actionLabel = isWithdrawn ? 'Ritirata' : {
    [APPOINTMENT_REQUEST_STAFF_ACTION.NEEDS_RESPONSE]: 'Da rispondere',
    [APPOINTMENT_REQUEST_STAFF_ACTION.WAITING_CUSTOMER]: 'In attesa della persona',
    [APPOINTMENT_REQUEST_STAFF_ACTION.NEEDS_BOOKING]: 'Da prenotare',
  }[request.staff_action];

  return (
    <Panel className="gh-request-card">
      <div className="gh-request-row">
        <div className="gh-request-copy">
          <div className="gh-request-tags">
            <StateTag tone={isWithdrawn ? 'neutral' : request.staff_action === APPOINTMENT_REQUEST_STAFF_ACTION.NEEDS_BOOKING ? 'success' : 'warning'}>
              {actionLabel}
            </StateTag>
            {response === 'declined' ? <StateTag tone="warning">Proposte rifiutate</StateTag> : null}
            {request.client?.is_blacklisted ? <StateTag tone="danger">Blacklist</StateTag> : null}
            <span className="gh-meta gh-num">
              {isWithdrawn
                ? `Ritirata il ${formatCreatedAt(request.withdrawn_at)}`
                : request.staff_responded_at
                ? `Risposto il ${formatCreatedAt(request.staff_responded_at)}`
                : `Arrivata il ${formatCreatedAt(request.created_at)}`}
            </span>
          </div>

          <h2 className="gh-row-title">{request.client?.name || 'Pet'}</h2>
          <p className="gh-body">
            {request.client?.owner || 'Proprietario non indicato'}
            {request.client?.phone ? ` · ${request.client.phone}` : ''}
          </p>

          <div className="gh-request-info-grid gh-request-info-grid--three">
            <InfoTile
              label={isStructured ? 'Data desiderata' : 'Quando'}
              value={isStructured ? formatDesiredDate(request.desired_date) : formatDateTime(request.scheduled_at)}
            />
            <InfoTile label="Indicazione" value={service} />
            <InfoTile label="Fascia" value={windowLabel || `${request.duration_minutes || 60} minuti`} />
          </div>

          {isStructured ? (
            <div className="gh-request-info-grid gh-request-info-grid--three">
              <InfoTile label="Manto" value={coatLabels || 'Indicazione libera'} />
              <InfoTile label="Età dichiarata" value={request.declared_pet_age || 'Già presente in anagrafica'} />
            </div>
          ) : null}

          {request.proposed_alternatives?.length ? (
            <div className="gh-request-notes">
              <p className="gh-eyebrow--staff">Alternative proposte</p>
              <p className="gh-body">
                {request.proposed_alternatives.map(formatAlternative).join(' · ')}
              </p>
            </div>
          ) : null}

          {request.notes ? (
            <div className="gh-request-notes">
              <p className="gh-eyebrow--staff">
                {isStructured ? 'Dettagli sul manto' : 'Note richiesta'}
              </p>
              <p className="gh-body gh-pre-wrap">{request.notes}</p>
            </div>
          ) : null}
          {response ? (
            <div className="gh-request-notes">
              <p className="gh-eyebrow--staff">Risposta ricevuta</p>
              <p className="gh-body">
                {response === 'accepted'
                  ? `Ha scelto ${formatAlternative({ date: request.chosen_date, time: request.chosen_time, time_preference: request.chosen_time_preference })}. Il salone deve ancora prenotare.`
                  : 'Nessuna delle fasce proposte va bene. Serve una nuova proposta.'}
              </p>
              <p className="gh-meta">Risposta del {formatCreatedAt(request.customer_responded_at)}</p>
            </div>
          ) : null}
        </div>

        {!isWithdrawn ? <div className="gh-request-actions">
          <Button staff wide variant="success" onClick={() => onApproval(request, 'approved')} disabled={isUpdating}>
            {isUpdating ? 'Aggiorno...' : 'Conferma'}
          </Button>
          {isStructured ? (
            <Button staff wide variant="secondary" onClick={() => onAlternatives(request)} disabled={isUpdating}>
              Proponi alternative
            </Button>
          ) : null}
          <Button staff wide variant="danger" onClick={() => onApproval(request, 'rejected')} disabled={isUpdating}>
            {isUpdating ? 'Aggiorno...' : 'Rifiuta'}
          </Button>
          <Button staff wide variant="outline" onClick={() => onOpenClient(request.pet_id)}>Apri scheda cane</Button>
        </div> : null}
      </div>
    </Panel>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="gh-request-info">
      <p className="gh-eyebrow--staff">{label}</p>
      <p className="gh-request-info__value">{value}</p>
    </div>
  );
}

function ApprovalDialog({ request, busy, schedule, capacity, actionError, onClearError, onClose, onConfirm }) {
  const hasChoice = currentAlternativeResponse(request) === 'accepted';
  const preference = hasChoice ? request.chosen_time_preference : request.time_preference;
  const defaultTime = getBookingTimePreferenceDefaultTime(preference);
  const [date, setDate] = useState((hasChoice ? request.chosen_date : request.desired_date) || '');
  const [time, setTime] = useState((hasChoice && formatSlotTime(request.chosen_time)) || defaultTime);
  const [durationMinutes, setDurationMinutes] = useState(request.duration_minutes || 60);
  const appointmentsForDate = useAppointmentsByDate(request.tenant_id, [date]);
  const appointments = appointmentsForDate(date);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;

  const submit = (event) => {
    event.preventDefault();
    const duration = Number(durationMinutes);
    if (!date || !time || !Number.isInteger(duration) || duration < 15) return;
    onConfirm(date, time, duration);
  };
  const closure = getDateClosure(date, schedule);
  const window = getBookingTimeWindowForTime(time);
  const candidate = date && time && window ? {
    scheduled_at: new Date(`${date}T${time}`).toISOString(),
    duration_minutes: Number(durationMinutes) || 60,
  } : null;
  const conflict = candidate && appointments !== null
    ? !isAppointmentCapacityAvailable({ candidate, appointments, capacity })
    : false;
  const changeDate = (value) => { onClearError(); setDate(value); };
  const changeTime = (value) => { onClearError(); setTime(value); };
  const changeDuration = (value) => { onClearError(); setDurationMinutes(value); };

  return (
    <div className="gh-dialog-backdrop">
      <form onSubmit={submit} className="gh-dialog" role="dialog" aria-modal="true" aria-labelledby="gh-approval-title">
        <p className="gh-eyebrow--staff">Conferma appuntamento</p>
        <h2 className="gh-panel-title" id="gh-approval-title">Scegli giorno e ora precisi</h2>
        <p className="gh-body">
          {request.client?.name || 'Pet'} · {hasChoice ? 'fascia scelta' : 'preferenza ricevuta'}: {getBookingTimePreferenceLabel(preference, 'nessuna') || 'nessuna'}.
        </p>

        <div className="gh-dialog-fields gh-dialog-fields--three">
          <Field label="Giorno" type="date" min={minDate} value={date} onChange={(event) => changeDate(event.target.value)} required />
          <Field label="Ora" type="time" step="900" value={time} onChange={(event) => changeTime(event.target.value)} required />
          <Field label="Durata (min)" type="number" min="15" step="15" value={durationMinutes} onChange={(event) => changeDuration(event.target.value)} required />
        </div>
        <p className="gh-dialog-helper">Il servizio propone il valore iniziale: adattalo al cane che stai valutando.</p>
        <CapacityNotice appointments={appointments} capacity={capacity} date={date} time={time} durationMinutes={durationMinutes} onUseTime={changeTime} />
        {closure.label ? (
          <p className="gh-calendar-notice gh-calendar-notice--error" role="status">
            Attenzione: {closure.isClosed ? 'il salone risulta chiuso in questo giorno' : closure.label.toLowerCase()}. Puoi confermare comunque se è un’eccezione voluta.
          </p>
        ) : null}
        {actionError ? <p className="gh-calendar-notice gh-calendar-notice--error" role="alert">{actionError}</p> : null}

        <div className="gh-dialog-actions">
          <Button staff type="button" variant="outline" onClick={onClose} disabled={busy}>Annulla</Button>
          <Button staff type="submit" variant="success" disabled={busy || conflict || !date || !time || !window || !Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) < 15}>
            {busy ? 'Confermo...' : 'Conferma e prepara WhatsApp'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AlternativesDialog({ request, busy, schedule, capacity, onClose, onConfirm }) {
  const [rows, setRows] = useState([
    { date: '', time: '' },
    { date: '', time: '' },
  ]);
  const [localError, setLocalError] = useState('');
  const appointmentsForDate = useAppointmentsByDate(request.tenant_id, rows.map((row) => row.date));
  const minDate = new Date().toISOString().slice(0, 10);
  const updateRow = (index, field, value) => {
    setLocalError('');
    setRows((current) => current.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  };
  const addThird = () => setRows((current) => [...current, { date: '', time: '' }]);
  const submit = (event) => {
    event.preventDefault();
    const withPreferences = rows.map((row) => ({
      ...row,
      time_preference: getBookingTimeWindowForTime(row.time)?.value || '',
    }));
    const invalidTime = withPreferences.find((row) => !row.date || !row.time || !row.time_preference);
    if (invalidTime) {
      setLocalError('Ogni alternativa deve avere una data e un’ora fra le fasce di apertura: 09:00–19:00.');
      return;
    }
    const invalidClosure = withPreferences.find((row) => {
      const closure = getDateClosure(row.date, schedule);
      return closure.isClosed || isTimePreferenceClosed(row.time_preference, closure);
    });
    if (invalidClosure) {
      setLocalError('Ogni alternativa deve avere una data e un’ora in cui il salone è aperto.');
      return;
    }
    const keys = new Set(withPreferences.map((row) => `${row.date}:${row.time}`));
    if (keys.size !== withPreferences.length) {
      setLocalError('Le alternative devono essere diverse tra loro.');
      return;
    }
    onConfirm(withPreferences);
  };
  return (
    <div className="gh-dialog-backdrop">
      <form onSubmit={submit} className="gh-dialog" role="dialog" aria-modal="true" aria-labelledby="gh-alternatives-title">
        <p className="gh-eyebrow--staff">Proposta del salone</p>
        <h2 className="gh-panel-title" id="gh-alternatives-title">Proponi due o tre alternative</h2>
        <p className="gh-body">La scelta arriva dall’app. Poi il salone conferma l’ora: fino ad allora la richiesta resta in attesa.</p>
        <div className="gh-calendar-form-stack">
          {rows.map((row, index) => {
            const appointments = appointmentsForDate(row.date);
            return (
              <div className="gh-calendar-form-stack" key={index}>
                <div className="gh-dialog-fields">
                  <Field label={`Data ${index + 1}`} type="date" min={minDate} value={row.date} onChange={(event) => updateRow(index, 'date', event.target.value)} required />
                  <Field label={`Ora ${index + 1}`} type="time" step="900" value={row.time} onChange={(event) => updateRow(index, 'time', event.target.value)} required />
                </div>
                <CapacityNotice appointments={appointments} capacity={capacity} date={row.date} time={row.time} durationMinutes={request.duration_minutes || request.service?.duration_minutes || 60} onUseTime={(time) => updateRow(index, 'time', time)} />
              </div>
            );
          })}
        </div>
        {rows.length === 2 ? <Button staff type="button" variant="outline" onClick={addThird}>Aggiungi terza alternativa</Button> : null}
        {localError ? <p className="gh-calendar-notice gh-calendar-notice--error">{localError}</p> : null}
        <div className="gh-dialog-actions">
          <Button staff type="button" variant="outline" onClick={onClose} disabled={busy}>Annulla</Button>
          <Button staff type="submit" variant="secondary" disabled={busy}>{busy ? 'Registro...' : 'Registra e prepara WhatsApp'}</Button>
        </div>
      </form>
    </div>
  );
}

function WhatsAppHandoff({ draft, onCopy }) {
  if (!draft) return null;
  return (
    <Panel eyebrow="Comunicazione separata" title={`Messaggio per ${draft.recipient}`}>
      <p className="gh-body gh-pre-wrap">{draft.message}</p>
      <p className="gh-meta">Il dato è stato salvato. Il messaggio non risulta inviato finché non lo mandi da WhatsApp.</p>
      <div className="gh-inline-actions">
        {draft.url ? <a className="gh-btn gh-btn--whatsapp" href={draft.url} target="_blank" rel="noreferrer">Apri WhatsApp</a> : null}
        <Button staff variant="outline" onClick={onCopy}>Copia messaggio</Button>
      </div>
    </Panel>
  );
}

export default function CustomerRequests() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [approvalError, setApprovalError] = useState('');
  const [alternativesRequest, setAlternativesRequest] = useState(null);
  const [whatsappDraft, setWhatsappDraft] = useState(null);
  const bookingSchedule = useMemo(() => getBookingSchedule(tenant?.settings), [tenant?.settings]);
  const workstationCapacity = useMemo(() => getWorkstationCapacity(tenant?.settings), [tenant?.settings]);
  const openRequests = useMemo(() => requests.filter((request) => request.status !== 'withdrawn'), [requests]);
  const withdrawnRequests = useMemo(() => requests.filter((request) => request.status === 'withdrawn'), [requests]);

  const loadRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAppointmentRequestsForStaff();
      setRequests(data);
    } catch (err) {
      setRequests([]);
      setError(err.message || 'Non riesco a caricare le richieste.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const stats = useMemo(() => {
    const summary = summarizePendingAppointmentRequests(openRequests);

    return {
      actionable: summary.counts.actionable,
      needsBooking: summary.counts.needsBooking,
      waitingCustomer: summary.counts.waitingCustomer,
    };
  }, [openRequests]);

  const performApproval = async (request, approvalStatus, scheduledDate = null, scheduledTime = null, durationMinutes = null) => {
    setError('');
    setSuccess('');

    try {
      setUpdatingId(request.id);
      const updatedRequest = request.request_kind === 'structured'
        ? await resolveAppointmentRequest(request.id, approvalStatus, scheduledDate, scheduledTime, durationMinutes)
        : await updateAppointmentApproval(request.id, approvalStatus);
      const message = getAppointmentApprovalWhatsAppMessage(updatedRequest, approvalStatus);
      const whatsappUrl = buildWhatsAppUrl(updatedRequest.client?.phone, message);
      setWhatsappDraft({ message, url: whatsappUrl, recipient: getWhatsAppOwnerName(updatedRequest.client?.owner) || 'il proprietario' });

      setSuccess(
        approvalStatus === 'approved'
          ? 'Richiesta approvata e appuntamento creato. Ora puoi avvisare il proprietario.'
          : 'Richiesta rifiutata. Ora puoi avvisare il proprietario.'
      );
      setApprovalRequest(null);
      await loadRequests();
    } catch (err) {
      if (err.message === APPOINTMENT_CAPACITY_MESSAGE) {
        setApprovalError('Nel frattempo quell’orario si è riempito. Scegli un altro orario e riprova.');
      } else {
        setError(err.message || 'Non riesco ad aggiornare la richiesta.');
      }
    } finally {
      setUpdatingId('');
    }
  };

  const performAlternatives = async (request, alternatives) => {
    setError(''); setSuccess(''); setUpdatingId(request.id);
    try {
      const updatedRequest = await proposeAppointmentRequestAlternatives(request.id, alternatives);
      const message = getAppointmentAlternativesWhatsAppMessage(updatedRequest, alternatives);
      setWhatsappDraft({
        message,
        url: buildWhatsAppUrl(updatedRequest.client?.phone, message),
        recipient: getWhatsAppOwnerName(updatedRequest.client?.owner) || 'il proprietario',
      });
      setSuccess('Alternative registrate. La richiesta resta in attesa della scelta nell’app.');
      setAlternativesRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Non riesco a registrare le alternative.');
    } finally { setUpdatingId(''); }
  };

  const handleApproval = (request, approvalStatus) => {
    if (request.request_kind === 'structured' && approvalStatus === 'approved') {
      setError('');
      setSuccess('');
      setApprovalError('');
      setApprovalRequest(request);
      return;
    }
    performApproval(request, approvalStatus);
  };

  const handleOpenClient = (clientId) => {
    if (clientId) {
      navigate(`/client/${clientId}`);
    }
  };

  return (
    <div className="gh-page gh-requests-page">
      {approvalRequest ? (
        <ApprovalDialog
          request={approvalRequest}
          busy={updatingId === approvalRequest.id}
          schedule={bookingSchedule}
          capacity={workstationCapacity}
          actionError={approvalError}
          onClearError={() => { setApprovalError(''); setError(''); }}
          onClose={() => { setApprovalRequest(null); setApprovalError(''); }}
          onConfirm={(date, time, durationMinutes) => performApproval(approvalRequest, 'approved', date, time, durationMinutes)}
        />
      ) : null}
      {alternativesRequest ? (
        <AlternativesDialog
          request={alternativesRequest}
          busy={updatingId === alternativesRequest.id}
          schedule={bookingSchedule}
          capacity={workstationCapacity}
          onClose={() => setAlternativesRequest(null)}
          onConfirm={(alternatives) => performAlternatives(alternativesRequest, alternatives)}
        />
      ) : null}
      <Hero
        title="Richieste"
        subtitle="Le richieste arrivate dall’area dei proprietari."
        right={<HeroButton onClick={() => navigate('/dashboard')}>Dashboard</HeroButton>}
      />

      <main className="gh-page-shell gh-requests-stack">
        {error ? <ErrorState title="Le richieste restano da gestire" body={error} /> : null}
        {success ? <div className="gh-success-state" role="status">{success}</div> : null}
        <WhatsAppHandoff draft={whatsappDraft} onCopy={async () => {
          await navigator.clipboard?.writeText(whatsappDraft.message);
          setSuccess('Messaggio copiato.');
        }} />

        <StatStrip items={[
          { label: 'Da gestire', value: stats.actionable },
          { label: 'Da prenotare', value: stats.needsBooking },
          { label: 'In attesa persona', value: stats.waitingCustomer },
        ]} />

        <Panel
          bridge
          eyebrow="Richieste in arrivo"
          title="Richieste aperte e ritiri recenti"
          right={<Button staff variant="outline" onClick={loadRequests}>Aggiorna</Button>}
        >
          <div className="gh-request-pipeline">
              <p className="gh-body">
                I ritiri recenti restano visibili, separati dalle richieste da gestire e dai conteggi.
              </p>
          </div>
        </Panel>

        {loading ? (
          <Panel flush>{Array.from({ length: 4 }, (_, index) => <SkeletonRow key={index} />)}</Panel>
        ) : requests.length === 0 ? (
          <Panel><EmptyState title="Nessuna richiesta in attesa" body="Quando arriva una richiesta dall’area dei proprietari, la trovi qui." action={<Button staff variant="outline" onClick={loadRequests}>Aggiorna</Button>} /></Panel>
        ) : (
          <div className="gh-request-list">
            {openRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                updatingId={updatingId}
                onApproval={handleApproval}
                onAlternatives={setAlternativesRequest}
                onOpenClient={handleOpenClient}
              />
            ))}
            {withdrawnRequests.length ? <p className="gh-eyebrow--staff">Ritirate negli ultimi {RECENT_WITHDRAWN_REQUEST_DAYS} giorni</p> : null}
            {withdrawnRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                updatingId={updatingId}
                onApproval={handleApproval}
                onAlternatives={setAlternativesRequest}
                onOpenClient={handleOpenClient}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
