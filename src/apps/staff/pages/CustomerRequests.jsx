import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPendingAppointmentRequests,
  resolveAppointmentRequest,
  updateAppointmentApproval,
} from '../lib/database';
import { getAppointmentApprovalWhatsAppUrl } from '../lib/whatsapp';
import AppHeader from '../components/AppHeader';

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
    <article
      className="rounded-[26px] border p-5 sm:p-6 shadow-sm"
      style={{ backgroundColor: 'var(--color-surface-main)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
            >
              In attesa
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Arrivata il {formatCreatedAt(request.created_at)}
            </span>
          </div>

          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {request.client?.name || 'Cliente'}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-secondary)' }}>
            {request.client?.owner || 'Proprietario non indicato'}
            {request.client?.phone ? ` · ${request.client.phone}` : ''}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            <InfoTile
              label={isStructured ? 'Data desiderata' : 'Quando'}
              value={isStructured ? formatDesiredDate(request.desired_date) : formatDateTime(request.scheduled_at)}
            />
            <InfoTile label="Servizio" value={service} />
            <InfoTile label="Fascia" value={windowLabel || `${request.duration_minutes || 60} minuti`} />
          </div>

          {isStructured ? (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <InfoTile label="Manto" value={coatLabels || 'Indicazione libera'} />
              <InfoTile label="Età dichiarata" value={request.declared_pet_age || 'Già presente in anagrafica'} />
            </div>
          ) : null}

          {request.notes ? (
            <div
              className="rounded-2xl border p-4 mt-4"
              style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs uppercase tracking-[0.16em] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                {isStructured ? 'Dettagli sul manto' : 'Note richiesta'}
              </p>
              <p className="text-sm whitespace-pre-line" style={{ color: 'var(--color-secondary)' }}>
                {request.notes}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 lg:min-w-[220px]">
          <button
            type="button"
            onClick={() => onApproval(request, 'approved')}
            disabled={isUpdating}
            className="rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#16a34a' }}
          >
            {isUpdating ? 'Aggiorno...' : 'Approva e WhatsApp'}
          </button>
          <button
            type="button"
            onClick={() => onApproval(request, 'rejected')}
            disabled={isUpdating}
            className="rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#e11d48' }}
          >
            {isUpdating ? 'Aggiorno...' : 'Rifiuta e WhatsApp'}
          </button>
          <button
            type="button"
            onClick={() => onOpenClient(request.pet_id)}
            className="rounded-xl px-4 py-3 text-sm font-bold border"
            style={{
              backgroundColor: '#fff',
              borderColor: 'var(--color-border)',
              color: 'var(--color-secondary)',
            }}
          >
            Apri scheda cane
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoTile({ label, value }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}
    >
      <p className="text-xs uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      <p className="text-sm font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function ApprovalDialog({ request, busy, onClose, onConfirm }) {
  const defaultTime = request.time_preference === 'afternoon' ? '13:00' : '09:00';
  const [date, setDate] = useState(request.desired_date || '');
  const [time, setTime] = useState(defaultTime);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;

  const submit = (event) => {
    event.preventDefault();
    if (!date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledAt.getTime())) return;
    onConfirm(scheduledAt.toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ backgroundColor: 'rgba(43,37,37,.45)' }}>
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-surface-main)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-xs uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
          Conferma appuntamento
        </p>
        <h2 className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
          Scegli giorno e ora precisi
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          {request.client?.name || 'Pet'} · preferenza cliente: {TIME_PREFERENCE_LABELS[request.time_preference] || 'nessuna'}.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <label className="text-sm font-bold">
            Giorno
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border px-3 py-3 font-normal"
              style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}
            />
          </label>
          <label className="text-sm font-bold">
            Ora
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border px-3 py-3 font-normal"
              style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}
            />
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-60"
            style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={busy || !date || !time}
            className="rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#16a34a' }}
          >
            {busy ? 'Confermo...' : 'Conferma e prepara WhatsApp'}
          </button>
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

  const performApproval = async (request, approvalStatus, scheduledAt = null) => {
    setError('');
    setSuccess('');

    try {
      setUpdatingId(request.id);
      const updatedRequest = request.request_kind === 'structured'
        ? await resolveAppointmentRequest(request.id, approvalStatus, scheduledAt)
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      {approvalRequest ? (
        <ApprovalDialog
          request={approvalRequest}
          busy={updatingId === approvalRequest.id}
          onClose={() => setApprovalRequest(null)}
          onConfirm={(scheduledAt) => performApproval(approvalRequest, 'approved', scheduledAt)}
        />
      ) : null}
      <AppHeader
        title="Richieste clienti"
        subtitle="Un unico punto per gestire richieste arrivate dall'area cliente."
        rightContent={
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: 'rgba(251,246,243,0.16)', border: '1px solid rgba(251,246,243,0.22)' }}
          >
            Dashboard
          </button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error ? (
          <div className="mb-6 rounded-2xl border p-4 bg-red-50 border-red-200">
            <p className="font-medium" style={{ color: 'var(--color-danger-text)' }}>
              {error}
            </p>
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-2xl border p-4 bg-green-50 border-green-200">
            <p className="font-medium" style={{ color: 'var(--color-success-text)' }}>
              {success}
            </p>
          </div>
        ) : null}

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <InfoTile label="Da gestire" value={stats.total} />
          <InfoTile label="Entro 7 giorni" value={stats.nextWeek} />
          <InfoTile label="Con WhatsApp" value={stats.withPhone} />
        </section>

        <section
          className="rounded-[28px] border p-5 sm:p-6 shadow-sm mb-8"
          style={{ backgroundColor: 'var(--color-surface-soft)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Pipeline cliente
              </p>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Appuntamenti ora, boutique dopo
              </h2>
              <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                Questa pagina gestisce le richieste appuntamento reali. Quando gli ordini boutique avranno tabelle dedicate, finiranno qui nello stesso flusso operativo.
              </p>
            </div>
            <button
              type="button"
              onClick={loadRequests}
              className="rounded-xl px-5 py-3 text-sm font-bold border"
              style={{
                backgroundColor: '#fff',
                borderColor: 'var(--color-border)',
                color: 'var(--color-secondary)',
              }}
            >
              Aggiorna
            </button>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-16">
            <p style={{ color: 'var(--color-secondary)' }}>Caricamento richieste...</p>
          </div>
        ) : requests.length === 0 ? (
          <div
            className="rounded-[28px] border p-10 text-center"
            style={{ backgroundColor: 'var(--color-surface-main)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Nessuna richiesta in attesa
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Quando un cliente invia una richiesta appuntamento dall'area cliente, comparira' qui per approvazione o rifiuto.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
