import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomerAppointmentRequest, getCustomerPortalData } from '../lib/database';
import { logout } from '../lib/supabaseClient';
import {
  getBoutiqueOrderWhatsAppUrl,
  getCustomerAppointmentRequestWhatsAppUrl,
  getPublicGroomingHubWhatsAppUrl,
} from '../lib/whatsapp';
import { DEMO_MODE } from '../lib/demoMode';
import { getFidelityBadgeStyle, getFidelityLabel, getFidelityTierSnapshot } from '../lib/fidelity';
import publicPetCardIllustration from '../assets/public-pet-card-illustration.png';

const SERVICES = [
  {
    id: 'full-grooming',
    name: 'Bagno e tosatura completa',
    durationMinutes: 90,
    description: 'Percorso completo per rimettere il mantello in ordine.',
  },
  {
    id: 'bath',
    name: 'Solo bagno',
    durationMinutes: 60,
    description: 'Bagno, asciugatura e rifinitura essenziale.',
  },
  {
    id: 'beauty',
    name: 'Toelettatura estetica',
    durationMinutes: 75,
    description: 'Rifiniture, igiene e cura estetica del dettaglio.',
  },
  {
    id: 'check',
    name: 'Controllo rapido',
    durationMinutes: 45,
    description: 'Per piccole esigenze o valutazioni prima del servizio.',
  },
];

const TIME_SLOTS = [
  {
    id: 'morning',
    label: 'Mattina',
    range: '09:00-12:00',
    time: '09:00',
    durationMinutes: 180,
  },
  {
    id: 'afternoon',
    label: 'Pomeriggio',
    range: '14:00-17:30',
    time: '14:00',
    durationMinutes: 210,
  },
  {
    id: 'flexible',
    label: 'Qualsiasi orario',
    range: 'Giornata lavorativa',
    time: '09:00',
    durationMinutes: 60,
  },
];

const PRODUCTS = [
  {
    id: 'shampoo-sensitive',
    name: 'Shampoo cute sensibile',
    category: 'Cura',
    price: 14.9,
    badge: 'Consigliato',
    description: "Detersione delicata per mantenere il mantello morbido tra una visita e l'altra.",
  },
  {
    id: 'brush-soft',
    name: 'Spazzola morbida',
    category: 'Accessori',
    price: 18,
    badge: 'Per casa',
    description: 'Aiuta a sciogliere piccoli nodi senza stressare il cane.',
  },
  {
    id: 'dental-snack',
    name: 'Snack dentale naturale',
    category: 'Snack',
    price: 7.5,
    badge: 'Ritiro rapido',
    description: 'Snack funzionale da chiedere allo staff al prossimo passaggio.',
  },
  {
    id: 'coat-spray',
    name: 'Spray lucidante mantello',
    category: 'Cura',
    price: 12,
    badge: 'Novita',
    description: 'Rinfresca e profuma il mantello dopo passeggiate e giornate fuori.',
  },
];

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'pet', label: 'Scheda' },
  { id: 'booking', label: 'Prenota' },
  { id: 'shop', label: 'Boutique' },
  { id: 'history', label: 'Storico' },
  { id: 'profile', label: 'Profilo' },
];

const getDemoPortalClients = () => {
  const now = new Date();
  const nextAppointment = new Date(now);
  nextAppointment.setDate(now.getDate() + 4);
  nextAppointment.setHours(10, 30, 0, 0);

  const pendingAppointment = new Date(now);
  pendingAppointment.setDate(now.getDate() + 8);
  pendingAppointment.setHours(9, 0, 0, 0);

  const completedAppointment = new Date(now);
  completedAppointment.setDate(now.getDate() - 22);
  completedAppointment.setHours(15, 0, 0, 0);

  return [
    {
      id: 'demo-client-luna',
      name: 'Luna',
      notes: 'Preferisce essere accolta con calma. Mantello sensibile: usare prodotti delicati.',
      visits: [
        { id: 'demo-visit-1', client_id: 'demo-client-luna', date: toLocalDateString(completedAppointment) },
        { id: 'demo-visit-2', client_id: 'demo-client-luna', date: toLocalDateString(new Date(now.getTime() - 48 * 24 * 60 * 60 * 1000)) },
      ],
      rewardPoints: [],
      rewardPointsTotal: 180,
      nextAppointment: {
        id: 'demo-appointment-next',
        client_id: 'demo-client-luna',
        scheduled_at: nextAppointment.toISOString(),
        duration_minutes: 90,
        status: 'scheduled',
        approval_status: 'approved',
        appointment_source: 'operator',
        notes: 'Bagno e tosatura completa confermati.',
      },
      appointments: [
        {
          id: 'demo-appointment-next',
          client_id: 'demo-client-luna',
          scheduled_at: nextAppointment.toISOString(),
          duration_minutes: 90,
          status: 'scheduled',
          approval_status: 'approved',
          appointment_source: 'operator',
          notes: 'Bagno e tosatura completa confermati.',
        },
        {
          id: 'demo-appointment-pending',
          client_id: 'demo-client-luna',
          scheduled_at: pendingAppointment.toISOString(),
          duration_minutes: 180,
          status: 'scheduled',
          approval_status: 'pending',
          appointment_source: 'customer',
          notes: 'Servizio richiesto: Bagno e tosatura completa. Fascia preferita: Mattina (09:00-12:00).',
        },
        {
          id: 'demo-appointment-completed',
          client_id: 'demo-client-luna',
          scheduled_at: completedAppointment.toISOString(),
          duration_minutes: 75,
          status: 'completed',
          approval_status: 'approved',
          appointment_source: 'operator',
          notes: 'Toelettatura estetica completata.',
        },
      ],
    },
  ];
};

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateOptions = () =>
  Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: toLocalDateString(date),
      weekday: date.toLocaleDateString('it-IT', { weekday: 'short' }),
      day: date.toLocaleDateString('it-IT', { day: '2-digit' }),
      month: date.toLocaleDateString('it-IT', { month: 'short' }),
    };
  });

const formatAppointment = (iso) => {
  if (!iso) return 'Nessun appuntamento futuro';

  return new Date(iso).toLocaleString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateOnly = (isoOrDate) =>
  new Date(isoOrDate).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

const formatShortDateTime = (iso) =>
  new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCurrency = (value) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value) || 0);

const getPortalStatusBadge = (appointment) => {
  if (appointment.approval_status === 'pending') {
    return {
      label: 'In attesa',
      style: { backgroundColor: '#fef3c7', color: '#92400e' },
    };
  }

  if (appointment.approval_status === 'rejected') {
    return {
      label: 'Rifiutato',
      style: { backgroundColor: '#fee2e2', color: '#991b1b' },
    };
  }

  if (appointment.status === 'completed') {
    return {
      label: 'Completato',
      style: { backgroundColor: '#dcfce7', color: '#166534' },
    };
  }

  if (appointment.status === 'cancelled') {
    return {
      label: 'Annullato',
      style: { backgroundColor: '#f3f4f6', color: '#4b5563' },
    };
  }

  return {
    label: 'Confermato',
    style: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  };
};

const getSortedAppointments = (client) =>
  [...(client?.appointments || [])].sort(
    (left, right) => new Date(right.scheduled_at) - new Date(left.scheduled_at)
  );

const getPendingRequests = (client) =>
  (client?.appointments || []).filter((appointment) => appointment.approval_status === 'pending');

const getLastVisitDate = (client) => {
  const latestVisit = [...(client?.visits || [])].sort(
    (left, right) => new Date(right.date) - new Date(left.date)
  )[0];

  return latestVisit?.date ? formatDateOnly(`${latestVisit.date}T00:00:00`) : 'Non ancora registrata';
};

function SectionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-bold transition"
      style={{
        backgroundColor: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--color-secondary)',
      }}
    >
      {children}
    </button>
  );
}

function EmptyLinkedClients() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Nessuna scheda collegata
      </h2>
      <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-secondary)' }}>
        Apri il link d'invito ricevuto dal tuo groomer per collegare la scheda del cane a questo account.
      </p>
    </div>
  );
}

function PetAvatar({ client, size = 'large' }) {
  const fidelity = getFidelityTierSnapshot(client);
  const tierKey = fidelity.currentTier?.key || 'base';
  const badgeStyle = getFidelityBadgeStyle(tierKey);
  const sizeClass = size === 'small' ? 'w-14 h-14 rounded-2xl' : 'w-28 h-28 rounded-[28px]';

  return (
    <div
      className={`${sizeClass} overflow-hidden flex items-center justify-center shrink-0`}
      style={{ backgroundColor: badgeStyle.backgroundColor }}
    >
      <img
        src={publicPetCardIllustration}
        alt=""
        aria-hidden="true"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function HomeView({ client, onNavigate }) {
  const fidelity = useMemo(() => getFidelityTierSnapshot(client), [client]);
  const tierKey = fidelity.currentTier?.key || 'base';
  const pendingRequests = getPendingRequests(client);
  const recentAppointments = getSortedAppointments(client).slice(0, 3);
  const whatsappUrl = getPublicGroomingHubWhatsAppUrl({ petName: client.name });

  return (
    <div className="space-y-6">
      <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5 items-stretch">
        <div
          className="rounded-[28px] border p-6 sm:p-8 shadow-xl"
          style={{ backgroundColor: 'var(--color-surface-main)', borderColor: '#ead7c5' }}
        >
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
            <PetAvatar client={client} />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
                Bentornato
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                {client.name}
              </h2>
              <p className="text-sm mt-3 max-w-xl" style={{ color: 'var(--color-secondary)' }}>
                Scheda cliente collegata al gestionale Grooming Hub.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-7">
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-secondary)' }}>
                Livello
              </p>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
                {getFidelityLabel(tierKey)}
              </p>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-secondary)' }}>
                Visite
              </p>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
                {client.visits?.length || 0}
              </p>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-secondary)' }}>
                Richieste
              </p>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
                {pendingRequests.length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-[28px] border p-6 sm:p-7 shadow-xl flex flex-col justify-between gap-5"
          style={{ backgroundColor: '#fffaf6', borderColor: '#ead7c5' }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
              Prossimo appuntamento
            </p>
            <p className="text-xl font-bold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
              {formatAppointment(client.nextAppointment?.scheduled_at)}
            </p>
            {pendingRequests.length > 0 ? (
              <p className="text-sm mt-3 font-semibold" style={{ color: '#92400e' }}>
                Hai {pendingRequests.length} richiesta{pendingRequests.length === 1 ? '' : 'e'} in attesa di conferma.
              </p>
            ) : (
              <p className="text-sm mt-3" style={{ color: 'var(--color-secondary)' }}>
                Puoi inviare una nuova richiesta scegliendo una fascia oraria.
              </p>
            )}
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => onNavigate('booking')}
              className="w-full rounded-xl px-5 py-3 font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Nuova richiesta
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-xl px-5 py-3 font-bold text-center text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="rounded-[24px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
            Fidelity
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {fidelity.mode === 'points' ? `${fidelity.rewardPointsTotal} punti` : `${client.visits?.length || 0} visite`}
          </p>
          {fidelity.nextTier ? (
            <p className="text-sm mt-3" style={{ color: 'var(--color-secondary)' }}>
              Mancano {fidelity.mode === 'points' ? `${fidelity.nextTier.remainingPoints} punti` : `${fidelity.nextTier.remainingVisits} visite`} per {fidelity.nextTier.label}.
            </p>
          ) : (
            <p className="text-sm mt-3 font-semibold" style={{ color: 'var(--color-success-text)' }}>
              Livello massimo raggiunto.
            </p>
          )}
        </div>

        <div className="rounded-[24px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-xs uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--color-secondary)' }}>
              Ultimi movimenti
            </p>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-sm font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              Vedi tutto
            </button>
          </div>
          {recentAppointments.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
              Nessun appuntamento registrato.
            </p>
          ) : (
            <div className="space-y-2">
              {recentAppointments.map((appointment) => (
                <AppointmentListItem key={appointment.id} appointment={appointment} compact />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PetDetailView({ client, onNavigate }) {
  const fidelity = useMemo(() => getFidelityTierSnapshot(client), [client]);
  const tierKey = fidelity.currentTier?.key || 'base';
  const badgeStyle = getFidelityBadgeStyle(tierKey);

  return (
    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-5">
      <section className="rounded-[28px] border p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-main)', borderColor: '#ead7c5' }}>
        <PetAvatar client={client} />
        <h2 className="text-3xl font-bold mt-6" style={{ color: 'var(--color-text-primary)' }}>
          {client.name}
        </h2>
        <span
          className="inline-flex px-3 py-1 rounded-full text-sm font-bold mt-4"
          style={{ backgroundColor: badgeStyle.backgroundColor, color: badgeStyle.color }}
        >
          Livello {getFidelityLabel(tierKey)}
        </span>
        <p className="text-sm mt-5" style={{ color: 'var(--color-secondary)' }}>
          Questa scheda e' collegata al gestionale: appuntamenti e fidelity sono aggiornati dallo staff.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('booking')}
          className="w-full rounded-xl px-5 py-3 font-bold text-white mt-6"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Richiedi appuntamento
        </button>
      </section>

      <section className="space-y-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatTile label="Visite registrate" value={client.visits?.length || 0} />
          <StatTile label="Ultima visita" value={getLastVisitDate(client)} />
          <StatTile
            label="Punti premio"
            value={fidelity.mode === 'points' ? fidelity.rewardPointsTotal : 'Da attivare'}
          />
        </div>

        <div className="rounded-[24px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
            Appuntamento confermato
          </p>
          <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {formatAppointment(client.nextAppointment?.scheduled_at)}
          </p>
          {client.nextAppointment?.notes ? (
            <p className="text-sm mt-3" style={{ color: 'var(--color-secondary)' }}>
              {client.nextAppointment.notes}
            </p>
          ) : null}
        </div>

        <div className="rounded-[24px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
            Note condivise
          </p>
          <p className="text-sm whitespace-pre-line" style={{ color: 'var(--color-secondary)' }}>
            {client.notes || 'Nessuna nota visibile nel portale cliente.'}
          </p>
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-[22px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
      <p className="text-xs uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--color-secondary)' }}>
        {label}
      </p>
      <p className="text-xl font-bold mt-3 break-words" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function BookingView({
  client,
  onRequestAppointment,
  requestNotice,
  isRequestSubmitting = false,
}) {
  const dateOptions = useMemo(() => getDateOptions(), []);
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [date, setDate] = useState(dateOptions[0]?.value || toLocalDateString(new Date()));
  const [slotId, setSlotId] = useState(TIME_SLOTS[0].id);
  const [notes, setNotes] = useState('');
  const [submittedSummary, setSubmittedSummary] = useState(null);

  useEffect(() => {
    setServiceId(SERVICES[0].id);
    setDate(dateOptions[0]?.value || toLocalDateString(new Date()));
    setSlotId(TIME_SLOTS[0].id);
    setNotes('');
    setSubmittedSummary(null);
  }, [client.id, dateOptions]);

  const selectedService = SERVICES.find((service) => service.id === serviceId) || SERVICES[0];
  const selectedSlot = TIME_SLOTS.find((slot) => slot.id === slotId) || TIME_SLOTS[0];
  const slotLabel = `${selectedSlot.label} (${selectedSlot.range})`;
  const finalNotes = [
    `Servizio richiesto: ${selectedService.name}`,
    `Fascia preferita: ${slotLabel}`,
    notes.trim() ? `Note cliente: ${notes.trim()}` : '',
  ].filter(Boolean).join('. ');

  const handleSubmitRequest = async (event) => {
    event.preventDefault();

    const ok = await onRequestAppointment(client.id, {
      date,
      time: selectedSlot.time,
      duration_minutes: selectedSlot.durationMinutes || selectedService.durationMinutes,
      notes: finalNotes,
    });

    if (ok) {
      const whatsappUrl = getCustomerAppointmentRequestWhatsAppUrl({
        petName: client.name,
        date,
        time: selectedSlot.time,
        durationMinutes: selectedSlot.durationMinutes || selectedService.durationMinutes,
        serviceName: selectedService.name,
        timeWindowLabel: slotLabel,
        notes: notes.trim(),
      });

      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      setSubmittedSummary({
        serviceName: selectedService.name,
        date,
        slotLabel,
      });
      setNotes('');
    }
  };

  if (submittedSummary) {
    return (
      <section
        className="rounded-[28px] border p-6 sm:p-8 shadow-xl"
        style={{ backgroundColor: 'var(--color-surface-main)', borderColor: '#ead7c5' }}
      >
        <p className="text-xs uppercase tracking-[0.22em] font-bold mb-3" style={{ color: 'var(--color-success-text)' }}>
          Richiesta registrata
        </p>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          In attesa di conferma
        </h2>
        <p className="text-sm mt-4 max-w-2xl" style={{ color: 'var(--color-secondary)' }}>
          La richiesta per {client.name} e' stata salvata nel gestionale. Il messaggio WhatsApp serve solo come notifica rapida allo staff.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-7">
          <StatTile label="Servizio" value={submittedSummary.serviceName} />
          <StatTile label="Data" value={formatDateOnly(`${submittedSummary.date}T00:00:00`)} />
          <StatTile label="Fascia" value={submittedSummary.slotLabel} />
        </div>
        <button
          type="button"
          onClick={() => setSubmittedSummary(null)}
          className="rounded-xl px-5 py-3 font-bold text-white mt-6"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Nuova richiesta
        </button>
      </section>
    );
  }

  return (
    <section
      className="rounded-[28px] border p-5 sm:p-7 shadow-xl"
      style={{ backgroundColor: 'var(--color-surface-main)', borderColor: '#ead7c5' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
            Richiedi appuntamento
          </p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Scegli una fascia per {client.name}
          </h2>
        </div>
        <PetAvatar client={client} size="small" />
      </div>

      <form onSubmit={handleSubmitRequest} className="space-y-7">
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            1. Servizio
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {SERVICES.map((service) => {
              const active = serviceId === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setServiceId(service.id)}
                  className="rounded-2xl border p-4 text-left transition"
                  style={{
                    backgroundColor: active ? '#fffaf6' : '#fff',
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >
                  <span className="block font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {service.name}
                  </span>
                  <span className="block text-sm mt-2" style={{ color: 'var(--color-secondary)' }}>
                    {service.description}
                  </span>
                  <span className="block text-xs font-bold mt-3" style={{ color: 'var(--color-primary)' }}>
                    Durata indicativa {service.durationMinutes} min
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            2. Data
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dateOptions.map((option) => {
              const active = date === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDate(option.value)}
                  className="min-w-[82px] rounded-2xl border px-3 py-3 text-center transition"
                  style={{
                    backgroundColor: active ? 'var(--color-primary)' : '#fff',
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                    color: active ? '#fff' : 'var(--color-text-primary)',
                  }}
                >
                  <span className="block text-xs font-bold uppercase">{option.weekday}</span>
                  <span className="block text-2xl font-bold">{option.day}</span>
                  <span className="block text-xs font-semibold">{option.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            3. Fascia oraria
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {TIME_SLOTS.map((slot) => {
              const active = slotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id)}
                  className="rounded-2xl border p-4 text-left transition"
                  style={{
                    backgroundColor: active ? '#fffaf6' : '#fff',
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >
                  <span className="block font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {slot.label}
                  </span>
                  <span className="block text-sm mt-2" style={{ color: 'var(--color-secondary)' }}>
                    {slot.range}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            4. Note per lo staff
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Esigenze specifiche, taglio preferito, disponibilita' alternative..."
            className="w-full rounded-2xl border px-4 py-3 text-sm resize-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: '#fffaf6' }}>
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>
            Riepilogo
          </p>
          <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {selectedService.name} per {client.name}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-secondary)' }}>
            {formatDateOnly(`${date}T00:00:00`)} · {slotLabel}
          </p>
        </div>

        <button
          type="submit"
          disabled={isRequestSubmitting}
          className="inline-flex w-full justify-center px-5 py-3 rounded-xl font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {isRequestSubmitting ? 'Invio richiesta...' : 'Invia richiesta'}
        </button>

        {requestNotice?.message ? (
          <p
            className="text-sm font-medium"
            style={{
              color:
                requestNotice.type === 'error'
                  ? 'var(--color-danger-text)'
                  : 'var(--color-success-text)',
            }}
          >
            {requestNotice.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}

function HistoryView({ client }) {
  const appointments = getSortedAppointments(client);

  return (
    <section className="rounded-[28px] border p-5 sm:p-7 shadow-xl" style={{ backgroundColor: 'var(--color-surface-main)', borderColor: '#ead7c5' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
            Storico
          </p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Appuntamenti di {client.name}
          </h2>
        </div>
        <PetAvatar client={client} size="small" />
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
          Nessuna richiesta o appuntamento registrato.
        </p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentListItem key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </section>
  );
}

function AppointmentListItem({ appointment, compact = false }) {
  const badge = getPortalStatusBadge(appointment);

  return (
    <div
      className={`rounded-2xl border ${compact ? 'p-3' : 'p-4'}`}
      style={{ borderColor: 'var(--color-border)', backgroundColor: '#fff' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {formatShortDateTime(appointment.scheduled_at)}
        </p>
        <span
          className="inline-flex self-start sm:self-auto px-2 py-1 rounded-full text-xs font-bold"
          style={badge.style}
        >
          {badge.label}
        </span>
      </div>
      {appointment.notes && !compact ? (
        <p className="text-sm mt-3 whitespace-pre-line" style={{ color: 'var(--color-secondary)' }}>
          {appointment.notes}
        </p>
      ) : null}
    </div>
  );
}

function BoutiqueView({ client, cartItems, onAddToCart, onRemoveFromCart, onCheckout }) {
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fidelity = getFidelityTierSnapshot(client);
  const hasPerk = fidelity.currentTier?.key === 'gold' || fidelity.currentTier?.key === 'silver';
  const checkoutUrl = getBoutiqueOrderWhatsAppUrl({ petName: client.name, items: cartItems });

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-5">
      <section
        className="rounded-[28px] border p-5 sm:p-7 shadow-xl"
        style={{ backgroundColor: 'var(--color-surface-main)', borderColor: '#ead7c5' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
              Boutique
            </p>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Prodotti per {client.name}
            </h2>
            <p className="text-sm mt-3 max-w-2xl" style={{ color: 'var(--color-secondary)' }}>
              Seleziona i prodotti e invia una richiesta WhatsApp allo staff per metterli da parte.
            </p>
          </div>
          <PetAvatar client={client} size="small" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {PRODUCTS.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border p-4 flex flex-col"
              style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--color-secondary)' }}>
                    {product.category}
                  </p>
                  <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
                    {product.name}
                  </h3>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: '#fffaf6', color: 'var(--color-secondary)' }}>
                  {product.badge}
                </span>
              </div>
              <p className="text-sm mt-3 flex-1" style={{ color: 'var(--color-secondary)' }}>
                {product.description}
              </p>
              <div className="flex items-center justify-between gap-3 mt-5">
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(product.price)}
                </p>
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Aggiungi
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside
        className="rounded-[28px] border p-5 shadow-xl self-start"
        style={{ backgroundColor: '#fffaf6', borderColor: '#ead7c5' }}
      >
        <p className="text-xs uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
          Carrello
        </p>
        {cartItems.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
            Nessun prodotto selezionato.
          </p>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {item.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-secondary)' }}>
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFromCart(item.id)}
                  className="text-xs font-bold underline"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  Rimuovi
                </button>
              </div>
            ))}

            <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Totale indicativo
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(cartTotal)}
                </p>
              </div>
              {hasPerk ? (
                <p className="text-xs mt-2" style={{ color: 'var(--color-success-text)' }}>
                  Livello {getFidelityLabel(fidelity.currentTier.key)}: lo staff potra' applicare eventuali vantaggi fidelity in negozio.
                </p>
              ) : null}
            </div>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onCheckout}
              className="block w-full rounded-xl px-4 py-3 text-center font-bold text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              Richiedi su WhatsApp
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}

function ProfileView({ client, demoPreview }) {
  const fidelity = useMemo(() => getFidelityTierSnapshot(client), [client]);
  const tierKey = fidelity.currentTier?.key || 'base';

  return (
    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
      <section
        className="rounded-[28px] border p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-surface-main)', borderColor: '#ead7c5' }}
      >
        <p className="text-xs uppercase tracking-[0.22em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
          Profilo
        </p>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Area personale
        </h2>
        <p className="text-sm mt-3" style={{ color: 'var(--color-secondary)' }}>
          Dati e preferenze sono collegati alla scheda nel gestionale. Le modifiche anagrafiche restano gestite dallo staff.
        </p>

        <div className="space-y-3 mt-6">
          <ProfileRow label="Scheda attiva" value={client.name} />
          <ProfileRow label="Livello fidelity" value={getFidelityLabel(tierKey)} />
          <ProfileRow
            label="Punti o visite"
            value={fidelity.mode === 'points' ? `${fidelity.rewardPointsTotal} punti` : `${client.visits?.length || 0} visite`}
          />
          <ProfileRow label="Ambiente" value={demoPreview ? 'Anteprima demo' : 'Account cliente'} />
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[24px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
            Preferenze cane
          </p>
          <p className="text-sm whitespace-pre-line" style={{ color: 'var(--color-secondary)' }}>
            {client.notes || 'Nessuna preferenza condivisa al momento.'}
          </p>
        </div>

        <div className="rounded-[24px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
            Azioni rapide
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href={getPublicGroomingHubWhatsAppUrl({ petName: client.name })}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-4 py-3 text-center font-bold text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              Scrivi allo staff
            </a>
            <button
              type="button"
              className="rounded-xl px-4 py-3 text-center font-bold border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
              disabled
            >
              Modifica dati
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--color-secondary)' }}>
            La modifica dati sara' attivata quando avremo deciso quali campi far aggiornare direttamente al cliente.
          </p>
        </div>
      </section>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--color-secondary)' }}>
        {label}
      </p>
      <p className="font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

export default function CustomerPortal({ demoPreview = false }) {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [activeClientId, setActiveClientId] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingClientId, setSubmittingClientId] = useState('');
  const [requestNoticeByClient, setRequestNoticeByClient] = useState({});

  const loadPortal = async () => {
    setLoading(true);
    setError('');

    try {
      const loadedClients = demoPreview ? getDemoPortalClients() : (await getCustomerPortalData()).clients || [];
      setClients(loadedClients);
      setActiveClientId((currentId) =>
        loadedClients.some((client) => client.id === currentId)
          ? currentId
          : loadedClients[0]?.id || ''
      );
    } catch (err) {
      setError(err.message || 'Non riesco a caricare il portale cliente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
  }, []);

  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeClientId) || clients[0] || null,
    [clients, activeClientId]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login', { replace: true });
  };

  const handleAddToCart = (product) => {
    setCartItems((items) => {
      const currentItem = items.find((item) => item.id === product.id);
      if (currentItem) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((items) => items.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    if (demoPreview) {
      setTimeout(() => setCartItems([]), 500);
    }
  };

  const handleRequestAppointment = async (clientId, payload) => {
    setRequestNoticeByClient((prev) => ({
      ...prev,
      [clientId]: null,
    }));

    try {
      setSubmittingClientId(clientId);
      if (demoPreview) {
        const scheduledAtDate = new Date(`${payload.date}T${payload.time}`);
        const demoAppointment = {
          id: `demo-request-${Date.now()}`,
          client_id: clientId,
          scheduled_at: scheduledAtDate.toISOString(),
          duration_minutes: Number(payload.duration_minutes) || 60,
          status: 'scheduled',
          approval_status: 'pending',
          appointment_source: 'customer',
          notes: payload.notes || null,
        };

        setClients((prevClients) =>
          prevClients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  appointments: [demoAppointment, ...(client.appointments || [])],
                }
              : client
          )
        );
      } else {
        await createCustomerAppointmentRequest(clientId, payload);
        await loadPortal();
      }
      setRequestNoticeByClient((prev) => ({
        ...prev,
        [clientId]: {
          type: 'success',
          message: demoPreview
            ? 'Anteprima demo: richiesta aggiunta solo in questa schermata.'
            : "Richiesta inviata. Ti confermeremo l'appuntamento appena possibile.",
        },
      }));
      return true;
    } catch (err) {
      setRequestNoticeByClient((prev) => ({
        ...prev,
        [clientId]: {
          type: 'error',
          message: err.message || 'Non riesco a inviare la richiesta.',
        },
      }));
      return false;
    } finally {
      setSubmittingClientId('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <p style={{ color: 'var(--color-secondary)' }}>Caricamento area cliente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 sm:pb-12" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      <header className="px-4 py-6 sm:py-8" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] font-bold text-white/75 mb-2">
                {demoPreview && DEMO_MODE ? 'Grooming Hub demo' : 'Grooming Hub'}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {demoPreview && DEMO_MODE ? 'Anteprima cliente' : 'Area cliente'}
              </h1>
              <p className="text-sm text-white/80 mt-2">
                Prenotazioni, fidelity e scheda cane collegate al gestionale.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {clients.length > 1 ? (
                <select
                  value={activeClientId}
                  onChange={(event) => setActiveClientId(event.target.value)}
                  className="rounded-xl border px-4 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: 'rgba(251,246,243,0.96)',
                    borderColor: 'rgba(251,246,243,0.24)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              ) : null}

              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: 'rgba(251,246,243,0.18)', border: '1px solid rgba(251,246,243,0.22)' }}
              >
                Esci
              </button>
            </div>
          </div>

          {activeClient ? (
            <nav className="hidden sm:flex gap-2 rounded-full p-1 self-start" style={{ backgroundColor: 'rgba(251,246,243,0.9)' }}>
              {SECTIONS.map((section) => (
                <SectionButton
                  key={section.id}
                  active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </SectionButton>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error ? (
          <div className="mb-6 rounded-xl border p-4 bg-red-50 border-red-200">
            <p className="font-medium" style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        ) : null}

        {!activeClient ? (
          <EmptyLinkedClients />
        ) : (
          <>
            {activeSection === 'home' ? (
              <HomeView client={activeClient} onNavigate={setActiveSection} />
            ) : null}
            {activeSection === 'pet' ? (
              <PetDetailView client={activeClient} onNavigate={setActiveSection} />
            ) : null}
            {activeSection === 'booking' ? (
              <BookingView
                client={activeClient}
                onRequestAppointment={handleRequestAppointment}
                requestNotice={requestNoticeByClient[activeClient.id]}
                isRequestSubmitting={submittingClientId === activeClient.id}
              />
            ) : null}
            {activeSection === 'shop' ? (
              <BoutiqueView
                client={activeClient}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onCheckout={handleCheckout}
              />
            ) : null}
            {activeSection === 'history' ? (
              <HistoryView client={activeClient} />
            ) : null}
            {activeSection === 'profile' ? (
              <ProfileView client={activeClient} demoPreview={demoPreview} />
            ) : null}
          </>
        )}
      </main>

      {activeClient ? (
        <nav
          className="sm:hidden fixed left-3 right-3 bottom-3 grid gap-1 rounded-2xl p-2 shadow-2xl z-20"
          style={{
            backgroundColor: 'rgba(251,246,243,0.98)',
            border: '1px solid var(--color-border)',
            gridTemplateColumns: `repeat(${SECTIONS.length}, minmax(0, 1fr))`,
          }}
        >
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className="rounded-xl px-2 py-3 text-xs font-bold"
              style={{
                backgroundColor: activeSection === section.id ? 'var(--color-primary)' : 'transparent',
                color: activeSection === section.id ? '#fff' : 'var(--color-secondary)',
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
