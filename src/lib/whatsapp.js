const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.startsWith('39')) {
    return digits;
  }

  if (digits.length === 10) {
    return `39${digits}`;
  }

  return digits;
};

const buildWhatsAppUrl = (phone, message) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return '';

  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${normalizedPhone}?${params.toString()}`;
};

const formatDateTime = (date) =>
  date.toLocaleString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatAppointmentRange = ({ scheduledAt, date, time, durationMinutes = 60 } = {}) => {
  const start = scheduledAt
    ? new Date(scheduledAt)
    : date && time
      ? new Date(`${date}T${time}`)
      : null;

  if (!start || Number.isNaN(start.getTime())) return '';

  const duration = Number(durationMinutes) || 60;
  const end = new Date(start.getTime() + duration * 60000);
  const endTime = end.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formatDateTime(start)}-${endTime}`;
};

const DEFAULT_PUBLIC_GROOMING_HUB_PHONE = '393332979797';
const PUBLIC_GROOMING_HUB_PHONE =
  import.meta.env.VITE_PUBLIC_GROOMING_WHATSAPP || DEFAULT_PUBLIC_GROOMING_HUB_PHONE;
const PUBLIC_GROOMING_HUB_NAME = import.meta.env.VITE_PUBLIC_GROOMING_HUB_NAME || 'Grooming Hub';

export const getClientWhatsAppUrl = (client) => {
  const ownerName = client?.owner || 'cliente';
  const petName = client?.name || 'il tuo cane';
  const message = `Buongiorno ${ownerName}, ti contatto da Grooming Hub per ${petName}.`;
  return buildWhatsAppUrl(client?.phone, message);
};

export const getAppointmentWhatsAppUrl = (appointment) => {
  const clientName = appointment?.client?.name || 'il tuo cane';
  const ownerName = appointment?.client?.owner || 'cliente';
  const when = appointment?.scheduled_at
    ? new Date(appointment.scheduled_at).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const message = when
    ? `Buongiorno ${ownerName}, ti ricordo l'appuntamento per ${clientName} previsto il ${when}.`
    : `Buongiorno ${ownerName}, ti contatto da Grooming Hub per ${clientName}.`;

  return buildWhatsAppUrl(appointment?.client?.phone, message);
};

export const getDraftAppointmentWhatsAppUrl = ({ client, date, time }) => {
  const clientName = client?.name || 'il tuo cane';
  const ownerName = client?.owner || 'cliente';
  const when = date && time
    ? new Date(`${date}T${time}`).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const message = when
    ? `Buongiorno ${ownerName}, ti propongo l'appuntamento per ${clientName} il ${when}. Fammi sapere se va bene.`
    : `Buongiorno ${ownerName}, ti contatto da Grooming Hub per fissare un appuntamento per ${clientName}.`;

  return buildWhatsAppUrl(client?.phone, message);
};

export const getCustomerAppointmentRequestWhatsAppUrl = ({
  petName,
  date,
  time,
  durationMinutes,
  notes,
} = {}) => {
  const clientName = petName || 'il mio cane';
  const when = formatAppointmentRange({ date, time, durationMinutes });
  const noteText = notes ? ` Note: ${notes}.` : '';
  const message = when
    ? `Ciao, vorrei richiedere un appuntamento per ${clientName} nella fascia ${when}.${noteText}`
    : `Ciao, vorrei richiedere un appuntamento per ${clientName}.${noteText}`;

  return buildWhatsAppUrl(PUBLIC_GROOMING_HUB_PHONE, message);
};

export const getAppointmentApprovalWhatsAppUrl = (appointment, approvalStatus) => {
  const clientName = appointment?.client?.name || 'il tuo cane';
  const ownerName = appointment?.client?.owner || 'cliente';
  const when = formatAppointmentRange({
    scheduledAt: appointment?.scheduled_at,
    durationMinutes: appointment?.duration_minutes,
  });

  const message =
    approvalStatus === 'approved'
      ? when
        ? `Buongiorno ${ownerName}, confermiamo l'appuntamento per ${clientName} nella fascia ${when}.`
        : `Buongiorno ${ownerName}, confermiamo l'appuntamento per ${clientName}.`
      : when
        ? `Buongiorno ${ownerName}, la fascia richiesta per ${clientName} (${when}) non è disponibile. Ti chiediamo di selezionare un'altra fascia oraria dall'area cliente o di scriverci qui.`
        : `Buongiorno ${ownerName}, la fascia richiesta per ${clientName} non è disponibile. Ti chiediamo di selezionare un'altra fascia oraria dall'area cliente o di scriverci qui.`;

  return buildWhatsAppUrl(appointment?.client?.phone, message);
};

export const getContactWhatsAppUrl = (contact) => {
  const ownerName = contact?.owner_name || 'cliente';
  const petName = contact?.pet_name || 'il tuo cane';
  const message = `Buongiorno ${ownerName}, ti contatto da Grooming Hub per ${petName}.`;
  return buildWhatsAppUrl(contact?.phone, message);
};

export const getPublicGroomingHubWhatsAppUrl = ({ petName } = {}) => {
  const message = petName
    ? `Ciao, sto scrivendo dalla card di ${petName}. Vorrei contattare ${PUBLIC_GROOMING_HUB_NAME}.`
    : `Ciao, vorrei contattare ${PUBLIC_GROOMING_HUB_NAME}.`;

  return buildWhatsAppUrl(PUBLIC_GROOMING_HUB_PHONE, message);
};
