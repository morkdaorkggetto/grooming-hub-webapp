import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPendingAppointmentRequests,
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

const getRequestService = (notes = '') => {
  const match = String(notes).match(/Servizio richiesto:\s*([^.]*)/i);
  return match?.[1]?.trim() || 'Appuntamento cliente';
};

const getRequestWindow = (notes = '') => {
  const match = String(notes).match(/Fascia preferita:\s*([^.]*)/i);
  return match?.[1]?.trim() || '';
};

function RequestCard({ request, updatingId, onApproval, onOpenClient }) {
  const service = getRequestService(request.notes);
  const windowLabel = getRequestWindow(request.notes);
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
            <InfoTile label="Quando" value={formatDateTime(request.scheduled_at)} />
            <InfoTile label="Servizio" value={service} />
            <InfoTile label="Fascia" value={windowLabel || `${request.duration_minutes || 60} minuti`} />
          </div>

          {request.notes ? (
            <div
              className="rounded-2xl border p-4 mt-4"
              style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs uppercase tracking-[0.16em] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Note richiesta
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
            onClick={() => onOpenClient(request.client_id)}
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

export default function CustomerRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');

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
        const scheduledAt = new Date(request.scheduled_at);
        return scheduledAt >= today && scheduledAt <= nextSevenDays;
      }).length,
      withPhone: requests.filter((request) => Boolean(request.client?.phone)).length,
    };
  }, [requests]);

  const handleApproval = async (request, approvalStatus) => {
    setError('');
    setSuccess('');

    try {
      setUpdatingId(request.id);
      const updatedRequest = await updateAppointmentApproval(request.id, approvalStatus);
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
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Non riesco ad aggiornare la richiesta.');
    } finally {
      setUpdatingId('');
    }
  };

  const handleOpenClient = (clientId) => {
    if (clientId) {
      navigate(`/client/${clientId}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-main)' }}>
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
