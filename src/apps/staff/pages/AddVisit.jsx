import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import VisitForm, { createEmptyVisitForm } from '../components/VisitForm';
import {
  Hero,
  HeroButton,
  ErrorState,
  Panel,
  PetAvatar,
  SkeletonRow,
} from '../components/StaffKit';
import { addVisit, completeAppointmentWithVisit, getAppointmentForVisit, getClientById, getRomeDate } from '../lib/database';
import { getFidelityTierSnapshot } from '../../../shared/lib/fidelity';

export default function AddVisit() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  const [client, setClient] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(createEmptyVisitForm);

  useEffect(() => {
    loadClient();
  }, [clientId, appointmentId]);

  const loadClient = async () => {
    setLoading(true);
    setError('');
    setClient(null);
    setAppointment(null);
    try {
      const [pet, linkedAppointment] = await Promise.all([
        getClientById(clientId),
        appointmentId ? getAppointmentForVisit(appointmentId) : Promise.resolve(null),
      ]);
      setClient(pet);
      setAppointment(linkedAppointment);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (appointmentId && (!appointment || appointment.pet_id !== clientId
      || appointment.status !== 'scheduled' || appointment.approval_status !== 'approved'
      || getRomeDate(new Date(appointment.scheduled_at)) > getRomeDate())) {
      setError('Questo appuntamento non può essere chiuso da qui.');
      return;
    }

    if (!formData.date) {
      setError('La data è obbligatoria');
      return;
    }

    const cost = parseFloat(formData.cost);
    if (!formData.cost || cost <= 0) {
      setError('Il costo è obbligatorio e deve essere un numero positivo');
      return;
    }

    setSubmitting(true);
    try {
      const visitInput = {
        date: formData.date,
        treatments: formData.treatments || null,
        cost,
        service_id: formData.service_id || null,
        photoFile: formData.photoFile || null,
      };
      const result = appointmentId
        ? await completeAppointmentWithVisit(appointmentId, visitInput)
        : await addVisit(clientId, visitInput);
      navigate(`/client/${clientId}`, {
        state: {
          visitCompletedWithAppointment: Boolean(appointmentId),
          visitPhotoUploadError: result?.photoUploadError || null,
        },
      });
    } catch (err) {
      setError(err.message || 'Errore nell’aggiunta della visita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(`/client/${clientId}`);

  if (loading) {
    return (
      <div className="gh-page">
        <Hero title="Nuova visita" subtitle="Caricamento del cliente" />
        <main className="gh-page-shell gh-add-visit-shell" aria-busy="true">
          <Panel eyebrow="Registra visita" title="Caricamento form" flush>
            {Array.from({ length: 5 }, (_, index) => <SkeletonRow key={index} />)}
          </Panel>
        </main>
      </div>
    );
  }

  const fidelity = client ? getFidelityTierSnapshot(client, tenant?.settings) : null;
  const futureAppointment = appointment && getRomeDate(new Date(appointment.scheduled_at)) > getRomeDate();
  const appointmentUnavailable = appointmentId && (
    !appointment || appointment.pet_id !== clientId
    || appointment.status !== 'scheduled' || appointment.approval_status !== 'approved'
  );
  const appointmentDate = appointment && new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(appointment.scheduled_at));
  const appointmentTime = appointment && new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit',
  }).format(new Date(appointment.scheduled_at));

  return (
    <div className="gh-page">
      <Hero
        title="Nuova visita"
        subtitle={
          client
            ? `Registra una visita per ${client.name} e aggiorna subito lo storico.`
            : 'Registra una visita e aggiorna subito lo storico del cliente.'
        }
        right={<HeroButton onClick={handleCancel}>← Indietro</HeroButton>}
      />

      <main className="gh-page-shell gh-add-visit-shell">
        {client && (
          <Panel>
            <div className="gh-add-visit-client">
              <PetAvatar
                name={client.name}
                photo={client.photo}
                size={48}
                tier={fidelity?.currentTier?.key || 'base'}
              />
              <div>
                <span className="gh-eyebrow--staff">Aggiungendo una visita a</span>
                <h2 className="gh-panel-title">{client.name}</h2>
                <p className="gh-meta">{client.breed || 'Razza non specificata'} · {client.owner}</p>
              </div>
            </div>
          </Panel>
        )}

        {appointment && !appointmentUnavailable && !futureAppointment ? (
          <div className="gh-success-state" role="status">
            {client?.name} · {client?.breed || 'Razza non indicata'} · {client?.owner || 'Proprietario non indicato'}
            {' · '}{appointmentDate} ore {appointmentTime}. Visita e appuntamento si chiudono insieme.
          </div>
        ) : null}

        {futureAppointment ? (
          <ErrorState title="Appuntamento non chiudibile" body="Questo appuntamento è di un giorno che non è ancora arrivato." />
        ) : appointmentUnavailable || !client ? (
          <ErrorState title="Appuntamento non disponibile" body={error || 'Questo appuntamento non è disponibile per questo pet.'} />
        ) : <Panel eyebrow="Storico cliente" title="Registra visita">
          <VisitForm
            value={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            error={error}
            submitting={submitting}
            appointmentId={appointmentId}
            submitLabel={appointmentId ? 'Salva e chiudi appuntamento' : 'Salva visita'}
          />
        </Panel>}
      </main>
    </div>
  );
}
