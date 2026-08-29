import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import {
  getBookingSchedule,
  getBookingTimePreferenceDefaultTime,
  getBookingTimePreferenceLabel,
  getBookingTimePreferenceName,
  getDateClosure,
  isTimePreferenceClosed,
} from '../../../shared/tenant/bookingSchedule';
import {
  getPendingAppointmentRequests,
  proposeAppointmentRequestAlternatives,
  resolveAppointmentRequest,
  updateAppointmentApproval,
} from '../lib/database';
import {
  buildWhatsAppUrl,
  getAppointmentAlternativesWhatsAppMessage,
  getAppointmentApprovalWhatsAppMessage,
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

const COAT_CONDITION_LABELS = {
  some_knots: 'Qualche nodo',
  very_matted: 'Molto annodato',
  heavy_shedding: 'Perde tanto pelo',
  regular_grooming: 'Lo porto regolarmente',
  clean_long: 'Pulito, solo lungo',
};

const getRequestService = (notes = '') => {
  const match = String(notes).match(/Servizio richiesto:\s*([^.]*)/i);
  return match?.[1]?.trim() || 'Appuntamento cliente';
};

const getRequestWindow = (notes = '') => {
  const match = String(notes).match(/Fascia preferita:\s*([^.]*)/i);
  return match?.[1]?.trim() || '';
};

function RequestCard({ request, updatingId, onApproval, onAlternatives, onOpenClient }) {
  const isStructured = request.request_kind === 'structured';
  const service = request.service?.name || getRequestService(request.notes);
  const windowLabel = isStructured
    ? getBookingTimePreferenceLabel(request.time_preference, 'Nessuna preferenza') || 'Nessuna preferenza'
    : getRequestWindow(request.notes);
  const coatLabels = (request.coat_condition_codes || [])
    .map((value) => COAT_CONDITION_LABELS[value] || value)
    .join(', ');
  const isUpdating = updatingId === request.id;

  return (
    <Panel className="gh-request-card">
      <div className="gh-request-row">
        <div className="gh-request-copy">
          <div className="gh-request-tags">
            <StateTag tone={request.staff_responded_at ? 'success' : 'warning'}>
              {request.staff_responded_at ? 'Risposto' : 'Da leggere'}
            </StateTag>
            {request.client?.is_blacklisted ? <StateTag tone="danger">Blacklist</StateTag> : null}
            <span className="gh-meta gh-num">
              {request.staff_responded_at
                ? `Risposto il ${formatCreatedAt(request.staff_responded_at)}`
                : `Arrivata il ${formatCreatedAt(request.created_at)}`}
            </span>
          </div>

          <h2 className="gh-row-title">{request.client?.name || 'Cliente'}</h2>
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
                {request.proposed_alternatives.map((item) => `${formatDesiredDate(item.date)} · ${getBookingTimePreferenceLabel(item.time_preference)}`).join(' · ')}
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
        </div>

        <div className="gh-request-actions">
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
        </div>
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

function ApprovalDialog({ request, busy, schedule, onClose, onConfirm }) {
  const defaultTime = getBookingTimePreferenceDefaultTime(request.time_preference);
  const [date, setDate] = useState(request.desired_date || '');
  const [time, setTime] = useState(defaultTime);
  const [durationMinutes, setDurationMinutes] = useState(request.duration_minutes || 60);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;

  const submit = (event) => {
    event.preventDefault();
    const duration = Number(durationMinutes);
    if (!date || !time || !Number.isInteger(duration) || duration < 15) return;
    onConfirm(date, time, duration);
  };
  const closure = getDateClosure(date, schedule);

  return (
    <div className="gh-dialog-backdrop">
      <form onSubmit={submit} className="gh-dialog" role="dialog" aria-modal="true" aria-labelledby="gh-approval-title">
        <p className="gh-eyebrow--staff">Conferma appuntamento</p>
        <h2 className="gh-panel-title" id="gh-approval-title">Scegli giorno e ora precisi</h2>
        <p className="gh-body">
          {request.client?.name || 'Pet'} · preferenza cliente: {getBookingTimePreferenceLabel(request.time_preference, 'nessuna') || 'nessuna'}.
        </p>

        <div className="gh-dialog-fields gh-dialog-fields--three">
          <Field label="Giorno" type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} required />
          <Field label="Ora" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          <Field label="Durata prevista (min)" type="number" min="15" step="15" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} required />
        </div>
        <p className="gh-dialog-helper">Il servizio propone il valore iniziale: adattalo al cane che stai valutando.</p>
        {closure.label ? (
          <p className="gh-calendar-notice gh-calendar-notice--error" role="status">
            Attenzione: {closure.isClosed ? 'il salone risulta chiuso in questo giorno' : closure.label.toLowerCase()}. Puoi confermare comunque se è un’eccezione voluta.
          </p>
        ) : null}

        <div className="gh-dialog-actions">
          <Button staff type="button" variant="outline" onClick={onClose} disabled={busy}>Annulla</Button>
          <Button staff type="submit" variant="success" disabled={busy || !date || !time || !Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) < 15}>
            {busy ? 'Confermo...' : 'Conferma e prepara WhatsApp'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AlternativesDialog({ request, busy, schedule, onClose, onConfirm }) {
  const [rows, setRows] = useState([
    { date: '', time_preference: 'morning' },
    { date: '', time_preference: 'afternoon' },
  ]);
  const [localError, setLocalError] = useState('');
  const minDate = new Date().toISOString().slice(0, 10);
  const updateRow = (index, field, value) => setRows((current) => current.map((row, rowIndex) => (
    rowIndex === index ? { ...row, [field]: value } : row
  )));
  const addThird = () => setRows((current) => [...current, { date: '', time_preference: 'morning' }]);
  const submit = (event) => {
    event.preventDefault();
    const invalid = rows.find((row) => {
      const closure = getDateClosure(row.date, schedule);
      return !row.date || closure.isClosed || isTimePreferenceClosed(row.time_preference, closure);
    });
    if (invalid) {
      setLocalError('Ogni alternativa deve avere una data e una fascia in cui il salone è aperto.');
      return;
    }
    const keys = new Set(rows.map((row) => `${row.date}:${row.time_preference}`));
    if (keys.size !== rows.length) {
      setLocalError('Le alternative devono essere diverse tra loro.');
      return;
    }
    onConfirm(rows);
  };
  return (
    <div className="gh-dialog-backdrop">
      <form onSubmit={submit} className="gh-dialog" role="dialog" aria-modal="true" aria-labelledby="gh-alternatives-title">
        <p className="gh-eyebrow--staff">Risposta al cliente</p>
        <h2 className="gh-panel-title" id="gh-alternatives-title">Proponi due o tre alternative</h2>
        <p className="gh-body">La richiesta resta in attesa finché il cliente non sceglie su WhatsApp.</p>
        <div className="gh-calendar-form-stack">
          {rows.map((row, index) => {
            const closure = getDateClosure(row.date, schedule);
            return (
              <div className="gh-dialog-fields" key={index}>
                <Field label={`Data ${index + 1}`} type="date" min={minDate} value={row.date} onChange={(event) => updateRow(index, 'date', event.target.value)} required />
                <Field label="Fascia" as="select" value={row.time_preference} onChange={(event) => updateRow(index, 'time_preference', event.target.value)}>
                  <option value="morning" disabled={isTimePreferenceClosed('morning', closure)}>{getBookingTimePreferenceName('morning')}</option>
                  <option value="afternoon" disabled={isTimePreferenceClosed('afternoon', closure)}>{getBookingTimePreferenceName('afternoon')}</option>
                </Field>
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
  const [alternativesRequest, setAlternativesRequest] = useState(null);
  const [whatsappDraft, setWhatsappDraft] = useState(null);
  const bookingSchedule = useMemo(() => getBookingSchedule(tenant?.settings), [tenant?.settings]);

  const loadRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getPendingAppointmentRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Non riesco a caricare le richieste clienti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);

    return {
      total: requests.length,
      nextWeek: requests.filter((request) => {
        const requestDate = request.desired_date
          ? new Date(`${request.desired_date}T12:00:00`)
          : new Date(request.scheduled_at);
        return requestDate >= today && requestDate <= nextSevenDays;
      }).length,
      withPhone: requests.filter((request) => Boolean(request.client?.phone)).length,
    };
  }, [requests]);

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
      setWhatsappDraft({ message, url: whatsappUrl, recipient: updatedRequest.client?.owner || 'cliente' });

      setSuccess(
        approvalStatus === 'approved'
          ? 'Richiesta approvata e appuntamento creato. Ora puoi avvisare il cliente.'
          : 'Richiesta rifiutata. Ora puoi avvisare il cliente.'
      );
      setApprovalRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Non riesco ad aggiornare la richiesta.');
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
        recipient: updatedRequest.client?.owner || 'cliente',
      });
      setSuccess('Alternative registrate. La richiesta resta in attesa della risposta del cliente.');
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
          onClose={() => setApprovalRequest(null)}
          onConfirm={(date, time, durationMinutes) => performApproval(approvalRequest, 'approved', date, time, durationMinutes)}
        />
      ) : null}
      {alternativesRequest ? (
        <AlternativesDialog
          request={alternativesRequest}
          busy={updatingId === alternativesRequest.id}
          schedule={bookingSchedule}
          onClose={() => setAlternativesRequest(null)}
          onConfirm={(alternatives) => performAlternatives(alternativesRequest, alternatives)}
        />
      ) : null}
      <Hero
        title="Richieste clienti"
        subtitle="Un unico punto per gestire richieste arrivate dall'area cliente."
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
          { label: 'Da gestire', value: stats.total },
          { label: 'Entro 7 giorni', value: stats.nextWeek },
          { label: 'Con WhatsApp', value: stats.withPhone },
        ]} />

        <Panel
          bridge
          eyebrow="Pipeline cliente"
          title="Appuntamenti ora, boutique dopo"
          right={<Button staff variant="outline" onClick={loadRequests}>Aggiorna</Button>}
        >
          <div className="gh-request-pipeline">
              <p className="gh-body">
                Questa pagina gestisce le richieste appuntamento reali. Quando gli ordini boutique avranno tabelle dedicate, finiranno qui nello stesso flusso operativo.
              </p>
          </div>
        </Panel>

        {loading ? (
          <Panel flush>{Array.from({ length: 4 }, (_, index) => <SkeletonRow key={index} />)}</Panel>
        ) : requests.length === 0 ? (
          <Panel><EmptyState title="Nessuna richiesta in attesa" body="Quando un cliente invia una richiesta appuntamento dall'area cliente, comparira' qui per approvazione o rifiuto." action={<Button staff variant="outline" onClick={loadRequests}>Aggiorna</Button>} /></Panel>
        ) : (
          <div className="gh-request-list">
            {requests.map((request) => (
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
