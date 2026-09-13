export const MAX_ALTERNATIVE_DECLINE_ROUNDS = 1;
export const WAITING_CUSTOMER_FOLLOW_UP_HOURS = 48;

const HOUR_MS = 60 * 60 * 1000;

export const canDeclineAppointmentAlternatives = (request) =>
  Number(request?.alternatives_round || 0) <= MAX_ALTERNATIVE_DECLINE_ROUNDS;

export const getWaitingCustomerAge = (request, now = Date.now()) => {
  const respondedAt = new Date(request?.staff_responded_at).getTime();
  const ageMs = Number.isFinite(respondedAt) ? Math.max(0, now - respondedAt) : 0;
  const hours = Math.floor(ageMs / HOUR_MS);
  const days = Math.floor(hours / 24);
  return {
    hours,
    needsFollowUp: hours >= WAITING_CUSTOMER_FOLLOW_UP_HOURS,
    label: days >= 2
      ? `da ${days} giorni`
      : hours === 1
        ? 'da 1 ora'
        : `da ${hours} ore`,
  };
};

export const declineAppointmentResponseError = (error) => {
  if (/declared closure/i.test(error?.message || '')) {
    return 'Quel giorno il salone è chiuso. Scegli un’altra data.';
  }
  if (/must be in the future/i.test(error?.message || '')) {
    return 'Scegli una data futura per la tua nuova disponibilità.';
  }
  return null;
};
