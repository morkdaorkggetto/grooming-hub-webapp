import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import VisitForm, { createEmptyVisitForm } from '../components/VisitForm';
import {
  Hero,
  HeroButton,
  Panel,
  PetAvatar,
  SkeletonRow,
} from '../components/StaffKit';
import { addVisit, completeAppointmentWithVisit, getClientById } from '../lib/database';
import { getFidelityTierSnapshot } from '../lib/fidelity';

export default function AddVisit() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(createEmptyVisitForm);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClientById(clientId);
      setClient(data);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

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
        issues: formData.issues || null,
        cost,
      };
      if (appointmentId) await completeAppointmentWithVisit(appointmentId, visitInput);
      else await addVisit(clientId, visitInput);
      navigate(`/client/${clientId}`, {
        state: appointmentId ? { visitCompletedWithAppointment: true } : null,
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

        {appointmentId ? (
          <div className="gh-success-state" role="status">
            Questa lavorazione nasce dall’appuntamento: salvandola, visita e appuntamento verranno chiusi insieme.
          </div>
        ) : null}

        <Panel eyebrow="Storico cliente" title="Registra visita">
          <VisitForm
            value={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            error={error}
            submitting={submitting}
            submitLabel={appointmentId ? 'Salva e chiudi appuntamento' : 'Salva visita'}
          />
        </Panel>
      </main>
    </div>
  );
}
