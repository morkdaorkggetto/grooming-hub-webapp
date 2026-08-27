import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAppointments,
  updateAppointmentApproval,
  updateAppointmentStatus,
} from '../lib/database';
import {
  getAppointmentApprovalWhatsAppUrl,
  getAppointmentWhatsAppUrl,
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

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeOnly = (iso) =>
  new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatLongDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const getAppointmentEnd = (appointment) => {
  const start = new Date(appointment.scheduled_at);
  return new Date(start.getTime() + appointment.duration_minutes * 60000);
};

const getAppointmentTone = (appointment) => {
  if (appointment.approval_status === 'pending') return 'warning';
  if (appointment.approval_status === 'rejected') return 'neutral';
  if (appointment.status === 'completed') return 'success';
  if (appointment.status === 'cancelled') return 'neutral';
  if (appointment.status === 'no_show') return 'danger';
  return 'danger';
};

const getStatusLabel = (appointment) => {
  if (appointment.approval_status === 'pending') return 'Richiesta in attesa';
  if (appointment.approval_status === 'rejected') return 'Richiesta rifiutata';
  if (appointment.status === 'completed') return 'Completato';
  if (appointment.status === 'cancelled') return 'Annullato';
  if (appointment.status === 'no_show') return 'No-show';
  return 'Programmato';
};

const getSourceLabel = (appointment) =>
  appointment.appointment_source === 'customer' ? 'Richiesta cliente' : 'Inserito operatore';

export default function DailyAppointments() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const from = new Date(`${selectedDate}T00:00:00`).toISOString();
      const to = new Date(`${selectedDate}T23:59:59`).toISOString();
      const data = await getAppointments({
        from,
        to,
        includePending: true,
        includeRejected: true,
      });
      setAppointments(data);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento appuntamenti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const grouped = useMemo(() => {
    const pendingRequests = appointments.filter((item) => item.approval_status === 'pending');
    const scheduledApproved = appointments.filter(
      (item) => item.approval_status === 'approved' && item.status === 'scheduled'
    );
    const completed = appointments.filter(
      (item) => item.approval_status === 'approved' && item.status === 'completed'
    );
    const other = appointments.filter(
      (item) =>
        item.approval_status !== 'pending' &&
        !(
          item.approval_status === 'approved' &&
          (item.status === 'scheduled' || item.status === 'completed')
        )
    );

    return { pendingRequests, scheduledApproved, completed, other };
  }, [appointments]);

  const counters = useMemo(
    () => ({
      total: appointments.length,
      pendingRequests: grouped.pendingRequests.length,
      scheduledApproved: grouped.scheduledApproved.length,
      completed: grouped.completed.length,
      other: grouped.other.length,
    }),
    [appointments, grouped]
  );

  const handleMarkCompleted = async (appointmentId) => {
    setSuccess('');
    setError('');

    try {
      setUpdatingId(appointmentId);
      await updateAppointmentStatus(appointmentId, 'completed');
      setSuccess('Appuntamento segnato come completato.');
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento appuntamento');
    } finally {
      setUpdatingId('');
    }
  };

  const handleApproval = async (appointment, approvalStatus) => {
    setSuccess('');
    setError('');

    try {
      setUpdatingId(appointment.id);
      const updatedAppointment = await updateAppointmentApproval(appointment.id, approvalStatus);
      const whatsappUrl = getAppointmentApprovalWhatsAppUrl(updatedAppointment, approvalStatus);

      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } else {
        setError('Richiesta aggiornata, ma numero cliente non disponibile per WhatsApp.');
      }

      setSuccess(
        approvalStatus === 'approved'
          ? 'Richiesta appuntamento approvata. WhatsApp di conferma pronto.'
          : 'Richiesta appuntamento rifiutata. WhatsApp per nuova fascia pronto.'
      );
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento richiesta');
    } finally {
      setUpdatingId('');
    }
  };

  const handleWhatsApp = (appointment) => {
    const url = getAppointmentWhatsAppUrl(appointment);
    if (!url) {
      setError('Numero cliente non disponibile per WhatsApp.');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderAppointmentRow = (appointment) => {
    const tone = getAppointmentTone(appointment);
    const timeRange = `${formatTimeOnly(appointment.scheduled_at)} - ${formatTimeOnly(
      getAppointmentEnd(appointment).toISOString()
    )}`;
    const isPendingRequest = appointment.approval_status === 'pending';
    const canMarkCompleted =
      appointment.approval_status === 'approved' && appointment.status === 'scheduled';

    return (
      <Panel key={appointment.id} className={`gh-appointment-card gh-appointment-card--${tone}`}>
        <div className="gh-appointment-row">
          <div className="gh-appointment-copy">
            <div className="gh-appointment-tags">
              <span className="gh-time-tag gh-num">{timeRange}</span>
              <StateTag tone={tone}>{getStatusLabel(appointment)}</StateTag>
              <StateTag tone={appointment.appointment_source === 'customer' ? 'customer' : 'operator'}>
                {getSourceLabel(appointment)}
              </StateTag>
            </div>
            <h3 className="gh-row-title">{appointment.client?.name || 'Cliente'}</h3>
            <p className="gh-body">Proprietario: <strong>{appointment.client?.owner || '-'}</strong></p>
            <p className="gh-body">Telefono: {appointment.client?.phone || 'non disponibile'}</p>
            <p className="gh-body">Durata: <span className="gh-num">{appointment.duration_minutes} min</span></p>
            {appointment.notes && <p className="gh-appointment-notes gh-pre-wrap">Note: {appointment.notes}</p>}
          </div>

          <div className="gh-appointment-actions">
            <Button staff variant="secondary" onClick={() => navigate(`/client/${appointment.pet_id}`)}>Apri cliente</Button>
            <Button staff variant="whatsapp" onClick={() => handleWhatsApp(appointment)}>WhatsApp</Button>
            {isPendingRequest ? (
              <>
                <Button staff variant="success" onClick={() => handleApproval(appointment, 'approved')} disabled={updatingId === appointment.id}>
                  {updatingId === appointment.id ? 'Aggiorno...' : 'Approva'}
                </Button>
                <Button staff variant="danger" onClick={() => handleApproval(appointment, 'rejected')} disabled={updatingId === appointment.id}>
                  {updatingId === appointment.id ? 'Aggiorno...' : 'Rifiuta'}
                </Button>
              </>
            ) : (
              <Button staff variant="success" onClick={() => handleMarkCompleted(appointment.id)} disabled={updatingId === appointment.id || !canMarkCompleted}>
                {updatingId === appointment.id ? 'Aggiorno...' : 'Completato'}
              </Button>
            )}
          </div>
        </div>
      </Panel>
    );
  };

  return (
    <div className="gh-page gh-daily-page">
      <Hero
        title="Operatività giornaliera"
        subtitle="Lista appuntamenti del giorno."
        right={<HeroButton onClick={() => navigate('/dashboard')}>← Dashboard</HeroButton>}
      />

      <main className="gh-page-shell gh-daily-stack">
        {error && <ErrorState title="L'elenco non è stato modificato" body={error} />}
        {success && <div className="gh-success-state" role="status">{success}</div>}

        <Panel>
          <div className="gh-date-toolbar">
            <div>
              <p className="gh-eyebrow--staff">Giorno selezionato</p>
              <h2 className="gh-panel-title gh-capitalize">
                {formatLongDate(selectedDate)}
              </h2>
            </div>
            <div className="gh-date-toolbar__controls">
              <Field label="Data" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <Button staff onClick={() => setSelectedDate(toLocalDateString(new Date()))}>Oggi</Button>
            </div>
          </div>
        </Panel>

        <StatStrip columns={5} items={[
          { label: 'Totale appuntamenti', value: counters.total },
          { label: 'Richieste in attesa', value: counters.pendingRequests },
          { label: 'Programmati', value: counters.scheduledApproved },
          { label: 'Completati', value: counters.completed },
          { label: 'Altri stati', value: counters.other },
        ]} />

        <section className="gh-appointment-list">
          {loading ? (
            <Panel flush>{Array.from({ length: 5 }, (_, index) => <SkeletonRow key={index} />)}</Panel>
          ) : appointments.length === 0 ? (
            <Panel>
              <EmptyState
                title="Nessun appuntamento per il giorno selezionato."
                body="Scegli un'altra data oppure torna a oggi per controllare l'operatività corrente."
                action={<Button staff onClick={() => setSelectedDate(toLocalDateString(new Date()))}>Vai a oggi</Button>}
              />
            </Panel>
          ) : (
            appointments.map(renderAppointmentRow)
          )}
        </section>
      </main>
    </div>
  );
}
