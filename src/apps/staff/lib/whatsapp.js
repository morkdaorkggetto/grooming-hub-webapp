import { getBookingTimePreferenceName } from '../../../shared/tenant/bookingSchedule';

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

export const buildWhatsAppUrl = (phone, message) => {
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

const formatDesiredDate = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

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

export const getClientWhatsAppUrl = (client) => {
  const ownerName = client?.owner || 'cliente';
  const petName = client?.name || 'il tuo cane';
  const message = `Ciao ${ownerName}, ti scriviamo per ${petName}.`;
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
    ? `Ciao ${ownerName}, ti aspettiamo ${when} con ${clientName}.`
    : `Ciao ${ownerName}, ti scriviamo per ${clientName}.`;

  return buildWhatsAppUrl(appointment?.client?.phone, message);
};

export const getCustomerAppointmentRequestWhatsAppUrl = ({
  salonPhone,
  petName,
  desiredDate,
  date,
  time,
  durationMinutes,
  serviceName,
  timeWindowLabel,
  notes,
} = {}) => {
  const clientName = petName || 'il mio cane';
  const when = formatAppointmentRange({ date, time, durationMinutes });
  const requestedWindow = timeWindowLabel || when;
  const desiredDateText = formatDesiredDate(desiredDate);
  const dateText = desiredDateText ? ` Data desiderata: ${desiredDateText}.` : '';
  const serviceText = serviceName ? ` Indicazione: ${serviceName}.` : '';
  const noteText = notes ? ` Note: ${notes}.` : '';
  const message = requestedWindow
    ? `Ciao, abbiamo appena inviato una richiesta per ${clientName}.${dateText} Preferenza oraria: ${requestedWindow}.${serviceText}${noteText}`
    : `Ciao, abbiamo appena inviato una richiesta per ${clientName}.${dateText}${serviceText}${noteText}`;

  return buildWhatsAppUrl(salonPhone, message);
};

export const getAppointmentApprovalWhatsAppMessage = (appointment, approvalStatus) => {
  const clientName = appointment?.client?.name || 'il tuo cane';
  const ownerName = appointment?.client?.owner || 'cliente';
  const when = formatAppointmentRange({
    scheduledAt: appointment?.scheduled_at,
    durationMinutes: appointment?.duration_minutes,
  });

  return approvalStatus === 'approved'
      ? when
        ? `Ciao ${ownerName}, per ${clientName} ci siamo: ${when}. A presto!`
        : `Ciao ${ownerName}, per ${clientName} ci siamo. A presto!`
      : when
        ? `Ciao ${ownerName}, purtroppo ${when} siamo pieni. Per ${clientName} troviamo volentieri un'altra fascia: scrivici qui e la blocchiamo.`
        : `Ciao ${ownerName}, per ${clientName} in quella fascia siamo pieni. Scrivici qui e troviamo insieme un'alternativa.`;
};

export const getAppointmentApprovalWhatsAppUrl = (appointment, approvalStatus) =>
  buildWhatsAppUrl(
    appointment?.client?.phone,
    getAppointmentApprovalWhatsAppMessage(appointment, approvalStatus)
  );

export const getAppointmentAlternativesWhatsAppMessage = (appointment, alternatives = []) => {
  const clientName = appointment?.client?.name || 'il tuo cane';
  const ownerName = appointment?.client?.owner || 'cliente';
  const labels = alternatives.map(({ date, time_preference: preference }) => {
    const day = formatDesiredDate(date);
    const windowLabel = getBookingTimePreferenceName(preference).toLowerCase() || 'fascia proposta';
    return `${day} ${windowLabel}`;
  });
  const alternativesText = labels.length === 2
    ? `${labels[0]} oppure ${labels[1]}`
    : `${labels.slice(0, -1).join(', ')} oppure ${labels.at(-1)}`;
  const requestedWhen = formatDesiredDate(appointment?.desired_date) || 'quando ci hai chiesto';
  return `Ciao ${ownerName}, purtroppo ${requestedWhen} siamo pieni. Per ${clientName} avremmo ${alternativesText}: dimmi tu e blocchiamo.`;
};

export const getAppointmentAlternativesWhatsAppUrl = (appointment, alternatives) =>
  buildWhatsAppUrl(
    appointment?.client?.phone,
    getAppointmentAlternativesWhatsAppMessage(appointment, alternatives)
  );

export const getCustomerInviteDurationDays = ({ created_at: createdAt, expires_at: expiresAt } = {}) => {
  const created = new Date(createdAt).getTime();
  const expires = new Date(expiresAt).getTime();
  if (!Number.isFinite(created) || !Number.isFinite(expires) || expires <= created) return null;
  return Math.max(1, Math.round((expires - created) / (24 * 60 * 60 * 1000)));
};

export const getCustomerInviteWhatsAppMessage = (invite = {}) => {
  const salonName = String(invite.salonName || '').trim() || 'il tuo salone';
  const petName = String(invite.petName || '').trim() || 'il tuo cane';
  const inviteUrl = String(invite.inviteUrl || '').trim();
  const durationDays = getCustomerInviteDurationDays(invite);
  const durationText = durationDays
    ? `${durationDays} ${durationDays === 1 ? 'giorno' : 'giorni'}`
    : 'fino alla scadenza indicata';

  return `Ciao! Siamo ${salonName}. Qui trovi l'area dedicata a ${petName}: tutti i tuoi cani, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale ${durationText}. ${inviteUrl}`.trim();
};

export const getCustomerInviteWhatsAppUrl = (invite) =>
  buildWhatsAppUrl(invite?.phone, getCustomerInviteWhatsAppMessage(invite));

export const getCustomerDirectoryWhatsAppUrl = (customer) => {
  const ownerName = customer?.owner_name || 'cliente';
  const petName = customer?.pet_name || customer?.pending_pet_name || 'il tuo cane';
  const message = `Ciao ${ownerName}, ti scriviamo per ${petName}.`;
  return buildWhatsAppUrl(customer?.phone, message);
};

export const getPublicGroomingHubWhatsAppUrl = ({ salonPhone, petName } = {}) => {
  const message = petName
    ? `Ciao, ti scriviamo per ${petName}.`
    : 'Ciao, vorremmo chiedervi un’informazione.';

  return buildWhatsAppUrl(salonPhone, message);
};

export const getBoutiqueOrderWhatsAppUrl = ({ salonPhone, petName, items = [] } = {}) => {
  const itemText = items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(', ');
  const message = itemText
    ? `Ciao, per ${petName || 'il nostro cane'} vorremmo mettere da parte questi prodotti: ${itemText}.`
    : `Ciao, per ${petName || 'il nostro cane'} vorremmo informazioni sulla boutique.`;

  return buildWhatsAppUrl(salonPhone, message);
};
