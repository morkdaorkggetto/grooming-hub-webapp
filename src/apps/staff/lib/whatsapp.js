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

const DATE_ZONE = 'Europe/Rome';
const formatDay = (date) => {
  if (Number.isNaN(date.getTime())) return '';
  const year = new Intl.DateTimeFormat('it-IT', { year: 'numeric', timeZone: DATE_ZONE });
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: DATE_ZONE,
    ...(year.format(date) !== year.format(new Date()) ? { year: 'numeric' } : {}),
  }).format(date);
};
const formatTime = (date) => new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit', minute: '2-digit', timeZone: DATE_ZONE,
}).format(date);
const formatDateTime = (date) => formatDay(date) ? `${formatDay(date)} alle ${formatTime(date)}` : '';

const formatDesiredDate = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return formatDay(date);
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
  return formatDay(start) === formatDay(end)
    ? `${formatDay(start)} dalle ${formatTime(start)} alle ${formatTime(end)}`
    : `da ${formatDateTime(start)} a ${formatDateTime(end)}`;
};

export const getWhatsAppOwnerName = (value) => {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  const letters = name.match(/\p{L}/gu) || [];
  if (letters.length < 2 || !/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(name)) return '';
  if (/^(cliente|proprietario|sconosciuto|non indicato|n\.?\s*d\.?)$/i.test(name)) return '';
  return name;
};
const greeting = (value) => {
  const name = getWhatsAppOwnerName(value);
  return name ? `Ciao ${name},` : 'Ciao,';
};

const CUSTOMER_PET_FALLBACK = 'il tuo pet';

const normalizeComparablePetLabel = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .toLocaleLowerCase('it-IT');

export const getCustomerFacingPetName = ({ petName, petBreed } = {}) => {
  const name = String(petName || '').trim();
  const breed = String(petBreed || '').trim();
  if (!name) return CUSTOMER_PET_FALLBACK;
  if (breed && normalizeComparablePetLabel(name) === normalizeComparablePetLabel(breed)) {
    return CUSTOMER_PET_FALLBACK;
  }
  return name;
};

export const getClientWhatsAppUrl = (client) => {
  const petName = getCustomerFacingPetName({
    petName: client?.name,
    petBreed: client?.breed,
  });
  const message = `${greeting(client?.owner)} ti scriviamo per ${petName}.`;
  return buildWhatsAppUrl(client?.phone, message);
};

export const getAppointmentWhatsAppUrl = (appointment) => {
  const clientName = getCustomerFacingPetName({
    petName: appointment?.client?.name,
    petBreed: appointment?.client?.breed,
  });
  const when = appointment?.scheduled_at
    ? formatDateTime(new Date(appointment.scheduled_at))
    : '';

  const message = when
    ? `${greeting(appointment?.client?.owner)} ti aspettiamo ${when} con ${clientName}.`
    : `${greeting(appointment?.client?.owner)} ti scriviamo per ${clientName}.`;

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
  const clientName = petName || 'il mio pet';
  const when = formatAppointmentRange({ date, time, durationMinutes });
  const requestedWindow = timeWindowLabel || when;
  const desiredDateText = formatDesiredDate(desiredDate);
  const dateText = desiredDateText ? ` Ci andrebbe bene ${desiredDateText}.` : '';
  const serviceText = serviceName ? ` Indicazione: ${serviceName}.` : '';
  const noteText = notes ? ` Note: ${notes}.` : '';
  const message = requestedWindow
    ? `Ciao, abbiamo appena inviato una richiesta per ${clientName}.${dateText} Preferenza oraria: ${requestedWindow}.${serviceText}${noteText}`
    : `Ciao, abbiamo appena inviato una richiesta per ${clientName}.${dateText}${serviceText}${noteText}`;

  return buildWhatsAppUrl(salonPhone, message);
};

export const getAppointmentApprovalWhatsAppMessage = (appointment, approvalStatus) => {
  const clientName = getCustomerFacingPetName({
    petName: appointment?.client?.name,
    petBreed: appointment?.client?.breed,
  });
  const hello = greeting(appointment?.client?.owner);
  const when = formatAppointmentRange({
    scheduledAt: appointment?.scheduled_at,
    durationMinutes: appointment?.duration_minutes,
  });

  return approvalStatus === 'approved'
      ? when
        ? `${hello} abbiamo confermato l'appuntamento per ${clientName}: ${when}. A presto!`
        : `${hello} abbiamo confermato l'appuntamento per ${clientName}. A presto!`
      : when
        ? `${hello} purtroppo ${when} siamo pieni. Per ${clientName} scegli un'altra fascia nella tua area e riproviamo.`
        : `${hello} per ${clientName} in quella fascia siamo pieni. Scegli un'altra fascia nella tua area e riproviamo.`;
};

export const getAppointmentApprovalWhatsAppUrl = (appointment, approvalStatus) =>
  buildWhatsAppUrl(
    appointment?.client?.phone,
    getAppointmentApprovalWhatsAppMessage(appointment, approvalStatus)
  );

export const getAppointmentAlternativesWhatsAppMessage = (appointment, alternatives = []) => {
  const clientName = getCustomerFacingPetName({
    petName: appointment?.client?.name,
    petBreed: appointment?.client?.breed,
  });
  const labels = alternatives.map(({ date, time_preference: preference }) => {
    const day = formatDesiredDate(date);
    const windowLabel = getBookingTimePreferenceName(preference).toLowerCase() || 'fascia proposta';
    return `${day} ${preference === 'morning' ? 'di mattina' : preference === 'afternoon' ? 'nel pomeriggio' : windowLabel}`;
  });
  const alternativesText = labels.length > 1
    ? `${labels.slice(0, -1).join(', ')} oppure ${labels.at(-1)}`
    : labels[0] || 'altre fasce';
  const requestedWhen = formatDesiredDate(appointment?.desired_date) || 'nel giorno che ci hai chiesto';
  return `${greeting(appointment?.client?.owner)} purtroppo ${requestedWhen} siamo pieni. Per ${clientName} avremmo ${alternativesText}. Scegli nella tua area la fascia che preferisci: poi ti confermiamo l'ora.`;
};

export const getAppointmentAlternativesWhatsAppUrl = (appointment, alternatives) =>
  buildWhatsAppUrl(
    appointment?.client?.phone,
    getAppointmentAlternativesWhatsAppMessage(appointment, alternatives)
  );

export const getCustomerInviteDurationDays = ({
  created_at: createdAt,
  expires_at: expiresAt,
  durationDays,
} = {}) => {
  const created = new Date(createdAt).getTime();
  const expires = new Date(expiresAt).getTime();
  if (Number.isFinite(created) && Number.isFinite(expires) && expires > created) {
    return Math.max(1, Math.round((expires - created) / (24 * 60 * 60 * 1000)));
  }
  const configuredDuration = Number(durationDays);
  return Number.isInteger(configuredDuration) && configuredDuration > 0
    ? configuredDuration
    : null;
};

export const getCustomerInviteWhatsAppMessage = (invite = {}) => {
  const salonName = String(invite.salonName || '').trim() || 'il tuo salone';
  const petName = getCustomerFacingPetName({
    petName: invite.petName,
    petBreed: invite.petBreed,
  });
  const petArea = petName === CUSTOMER_PET_FALLBACK
    ? "Questa è l'area per il tuo pet"
    : `Qui trovi l'area dedicata a ${petName}`;
  const inviteUrl = String(invite.inviteUrl || '').trim();
  const durationDays = getCustomerInviteDurationDays(invite);
  const durationText = durationDays
    ? `${durationDays} ${durationDays === 1 ? 'giorno' : 'giorni'}`
    : 'fino alla scadenza indicata';

  return `Ciao! Siamo ${salonName}. ${petArea}: tutti i tuoi pet, lo storico completo delle visite, il prossimo appuntamento e le richieste. Il collegamento vale ${durationText}. ${inviteUrl}`.trim();
};

export const getCustomerInviteWhatsAppUrl = (invite) =>
  buildWhatsAppUrl(invite?.phone, getCustomerInviteWhatsAppMessage(invite));

export const getCustomerDirectoryWhatsAppUrl = (customer) => {
  const onlyPet = customer?.pets?.length === 1 ? customer.pets[0] : null;
  const petName = getCustomerFacingPetName({
    petName: customer?.pet_name || customer?.pending_pet_name,
    petBreed: onlyPet?.breed,
  });
  const message = `${greeting(customer?.owner_name)} ti scriviamo per ${petName}.`;
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
    ? `Ciao, per ${petName || 'il nostro pet'} vorremmo mettere da parte questi prodotti: ${itemText}.`
    : `Ciao, per ${petName || 'il nostro pet'} vorremmo informazioni sulla boutique.`;

  return buildWhatsAppUrl(salonPhone, message);
};
