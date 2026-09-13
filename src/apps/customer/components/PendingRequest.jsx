import React, { useRef, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { getBookingTimePreferenceLabel } from '../../../shared/tenant/bookingSchedule';
import Card from '../../../shared/ui/Card';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Button from '../../../shared/ui/Button';
import StatusBadge from '../../../shared/ui/StatusBadge';
import { alternativeResponseError, currentAlternativeResponse } from '../lib/appointmentResponses';

const dateFormat = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const day = (date) => dateFormat.format(new Date(`${date}T12:00:00`));
const slotTime = (value) => String(value || '').slice(0, 5);
const slotLabel = (slot) => slot.time
  ? `${day(slot.date)} alle ${slotTime(slot.time)}`
  : `${day(slot.date)}, ${getBookingTimePreferenceLabel(slot.time_preference)}`;
const textStyle = { margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)' };
const buttonStyle = { minHeight: 44, width: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere' };

export default function PendingRequest({ request, onResponded }) {
  const [saved, setSaved] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const current = saved && new Date(saved.customer_responded_at) >= new Date(request.customer_responded_at || 0)
    && saved.staff_responded_at === request.staff_responded_at ? { ...request, ...saved } : request;
  const response = currentAlternativeResponse(current);
  const alternatives = current.proposed_alternatives || [];

  const respond = async (choice) => {
    if (inFlight.current || error || (response && !editing)) return;
    inFlight.current = true;
    setBusy(true); setError('');
    try {
      const { data, error: rpcError } = await supabase.rpc('respond_appointment_request_slot', {
        p_request_id: request.id,
        p_response: choice ? 'accepted' : 'declined',
        p_date: choice?.date || null,
        p_time: choice?.time || null,
        p_time_preference: choice?.time_preference || null,
      });
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.customer_responded_at) throw new Error('Missing response');
      setSaved(row); setEditing(false);
      if (await onResponded() === false) throw new Error('Refresh failed');
    } catch (err) {
      setError(alternativeResponseError(err));
    } finally {
      inFlight.current = false; setBusy(false);
    }
  };

  return (
    <Card padding={20}>
      <Eyebrow style={{ marginBottom: 12 }}>Richiesta appuntamento</Eyebrow>
      <div style={{ marginBottom: 12 }}><StatusBadge status="scheduled" approvalStatus="pending" compact /></div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, textTransform: 'capitalize' }}>{day(request.desired_date)}</div>
      <p style={textStyle}>{request.pet?.name || 'Il tuo pet'} · {request.service?.name || 'Indicazione non disponibile'} · {getBookingTimePreferenceLabel(request.time_preference, 'Nessuna preferenza') || 'Nessuna preferenza'}</p>
      <p style={{ ...textStyle, fontSize: 13 }}>Inviata il {new Date(request.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
      {alternatives.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }} aria-busy={busy}>
          {response && !editing ? (
            <>
              <p role="status" style={textStyle}>
                {response === 'accepted'
                  ? `Hai scelto ${slotLabel({ date: current.chosen_date, time: current.chosen_time, time_preference: current.chosen_time_preference })}. Ora tocca al salone confermare l'appuntamento.`
                  : 'Hai risposto che nessuna di queste fasce ti va bene. Ora tocca al salone proporti un’alternativa.'}
              </p>
              <Button variant="ghost" style={buttonStyle} disabled={busy} onClick={() => setEditing(true)}>Cambia risposta</Button>
            </>
          ) : (
            <>
              <p style={textStyle}>{editing ? 'Scegli una nuova risposta: sostituirà quella precedente.' : 'Quale di questi orari ti va bene? Il salone confermerà l’appuntamento.'}</p>
              {alternatives.map((slot) => (
                <Button key={`${slot.date}:${slot.time || slot.time_preference}`} variant="ghost" style={buttonStyle} disabled={busy || Boolean(error)} onClick={() => respond(slot)}>{slotLabel(slot)}</Button>
              ))}
              <Button variant="ghost" style={buttonStyle} disabled={busy || Boolean(error)} onClick={() => respond(null)}>Nessuna di queste mi va bene</Button>
              {editing ? <Button variant="ghost" style={buttonStyle} disabled={busy} onClick={() => setEditing(false)}>Annulla modifica</Button> : null}
            </>
          )}
          {busy ? <p role="status" style={textStyle}>Invio della risposta...</p> : null}
          {error ? <>
            <p role="alert" style={textStyle}>{error}</p>
            <Button variant="ghost" style={buttonStyle} disabled={busy} onClick={async () => {
              setBusy(true);
              try {
                if (await onResponded() !== false) { setSaved(null); setError(''); setEditing(false); }
              } finally { setBusy(false); }
            }}>Aggiorna le proposte</Button>
          </> : null}
        </div>
      ) : null}
    </Card>
  );
}
