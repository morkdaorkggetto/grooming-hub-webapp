export function currentAlternativeResponse(request) {
  if (!['accepted', 'declined'].includes(request?.customer_response)) return null;
  if (!request.customer_responded_at) return null;
  // A newer proposal starts a new round even if the RPC retained the old choice.
  if (new Date(request.staff_responded_at).getTime() > new Date(request.customer_responded_at).getTime()) return null;
  if (request.customer_response === 'accepted' && !request.proposed_alternatives?.some(
    (slot) => slot.date === request.chosen_date && slot.time_preference === request.chosen_time_preference
  )) return null;
  return request.customer_response;
}

export function isRecentlyConfirmed(appointment, now = Date.now()) {
  const age = now - new Date(appointment?.created_at).getTime();
  return appointment?.appointment_source === 'customer'
    && appointment.approval_status === 'approved'
    && appointment.status === 'scheduled'
    && age >= 0 && age < 72 * 60 * 60 * 1000;
}

export function alternativeResponseError(error) {
  if (error?.code === '22023') return 'Questa alternativa non è più disponibile. Aggiorna le proposte e riprova.';
  if (error?.code === '23514') return 'Il salone ha già aggiornato questa richiesta. Aggiorna per vedere la risposta.';
  if (error?.code === '42501' || error?.code === 'PGRST301') return 'Non riusciamo ad accedere a questa richiesta. Rientra nella tua area e riprova.';
  return 'Non riusciamo a verificare la tua risposta. Aggiorna le proposte prima di riprovare.';
}
