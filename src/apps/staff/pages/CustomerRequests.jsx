import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPendingAppointmentRequests,
  resolveAppointmentRequest,
  updateAppointmentApproval,
} from '../lib/database';
import { getAppointmentApprovalWhatsAppUrl } from '../lib/whatsapp';
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

const TIME_PREFERENCE_LABELS = {
  morning: 'Mattina (9–13)',
  afternoon: 'Pomeriggio (13–19)',
  flexible: 'Per me è uguale',
};

const COAT_CONDITION_LABELS = {
  some_knots: 'Qualche nodo',
  very_matted: 'Molto annodato',
  heavy_shedding: 'Perde tanto pelo',
  sensitive_skin: 'Cute sensibile',
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

function RequestCard({ request, updatingId, onApproval, onOpenClient }) {
  const isStructured = request.request_kind === 'structured';
  const service = request.service?.name || getRequestService(request.notes);
  const windowLabel = isStructured
    ? TIME_PREFERENCE_LABELS[request.time_preference] || 'Nessuna preferenza'
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
            <StateTag tone="warning">In attesa</StateTag>
            <span className="gh-meta gh-num">
              Arrivata il {formatCreatedAt(request.created_at)}
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
            <InfoTile label="Servizio" value={service} />
            <InfoTile label="Fascia" value={windowLabel || `${request.duration_minutes || 60} minuti`} />
          </div>

          {isStructured ? (
            <div className="gh-request-info-grid">
              <InfoTile label="Manto" value={coatLabels || 'Indicazione libera'} />
              <InfoTile label="Età dichiarata" value={request.declared_pet_age || 'Già presente in anagrafica'} />
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
            {isUpdating ? 'Aggiorno...' : 'Approva e WhatsApp'}
          </Button>
          <Button staff wide variant="danger" onClick={() => onApproval(request, 'rejected')} disabled={isUpdating}>
            {isUpdating ? 'Aggiorno...' : 'Rifiuta e WhatsApp'}
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

function ApprovalDialog({ request, busy, onClose, onConfirm }) {
  const defaultTime = request.time_preference === 'afternoon' ? '13:00' : '09:00';
  const [date, setDate] = useState(request.desired_date || '');
  const [time, setTime] = useState(defaultTime);
  const [durationMinutes, setDurationMinutes] = useState(request.duration_minutes || 60);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;

  const submit = (event) => {
    event.preventDefault();
    const duration = Number(durationMinutes);
    if (!date || !time || !Number.isInteger(duration) || duration < 15) return;
    const scheduledAt = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledAt.getTime())) return;
    onConfirm(scheduledAt.toISOString(), duration);
  };

  return (
    <div className="gh-dialog-backdrop">
      <form onSubmit={submit} className="gh-dialog" role="dialog" aria-modal="true" aria-labelledby="gh-approval-title">
        <p className="gh-eyebrow--staff">Conferma appuntamento</p>
        <h2 className="gh-panel-title" id="gh-approval-title">Scegli giorno e ora precisi</h2>
        <p className="gh-body">
          {request.client?.name || 'Pet'} · preferenza cliente: {TIME_PREFERENCE_LABELS[request.time_preference] || 'nessuna'}.
        </p>

        <div className="gh-dialog-fields gh-dialog-fields--three">
          <Field label="Giorno" type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} required />
          <Field label="Ora" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          <Field label="Durata prevista (min)" type="number" min="15" step="15" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} required />
        </div>
        <p className="gh-dialog-helper">Il servizio propone il valore iniziale: adattalo al cane che stai valutando.</p>

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

export default function CustomerRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [approvalRequest, setApprovalRequest] = useState(null);

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

  const performApproval = async (request, approvalStatus, scheduledAt = null, durationMinutes = null) => {
    setError('');
    setSuccess('');

    try {
      setUpdatingId(request.id);
      const updatedRequest = request.request_kind === 'structured'
        ? await resolveAppointmentRequest(request.id, approvalStatus, scheduledAt, durationMinutes)
        : await updateAppointmentApproval(request.id, approvalStatus);
      const whatsappUrl = getAppointmentApprovalWhatsAppUrl(updatedRequest, approvalStatus);

      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } else {
        setError('Richiesta aggiornata, ma manca il numero cliente per WhatsApp.');
      }

      setSuccess(
        approvalStatus === 'approved'
          ? 'Richiesta approvata. WhatsApp di conferma pronto.'
          : 'Richiesta rifiutata. WhatsApp per nuova fascia pronto.'
      );
      setApprovalRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Non riesco ad aggiornare la richiesta.');
    } finally {
      setUpdatingId('');
    }
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
          onClose={() => setApprovalRequest(null)}
          onConfirm={(scheduledAt, durationMinutes) => performApproval(approvalRequest, 'approved', scheduledAt, durationMinutes)}
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
                onOpenClient={handleOpenClient}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
