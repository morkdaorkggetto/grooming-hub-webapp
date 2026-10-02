import { currentAlternativeResponse } from './appointmentResponses';

export function customerActions(requests) {
  const latest = new Map();
  for (const request of requests) {
    const time = Date.parse(request.created_at);
    latest.set(request.pet_id, Math.max(latest.get(request.pet_id) ?? -Infinity, time));
  }
  return requests.flatMap(request => {
    if (request.status === 'pending' && request.proposed_alternatives?.length && !currentAlternativeResponse(request)) {
      return [{ kind: 'slots', request }];
    }
    if (request.status === 'rejected' && Date.parse(request.created_at) === latest.get(request.pet_id)) {
      return [{ kind: 'date', request }];
    }
    return [];
  });
}

export function customerActionTitle(items) {
  if (items.length === 1) return items[0].kind === 'slots' ? 'Scegli un orario' : "Scegli un'altra data";
  const numbers = ['', 'Una', 'Due', 'Tre', 'Quattro', 'Cinque', 'Sei', 'Sette', 'Otto', 'Nove', 'Dieci'];
  return `${numbers[items.length] || items.length} richieste aspettano te`;
}
