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
