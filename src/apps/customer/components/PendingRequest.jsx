import React, { useMemo, useRef, useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { getTenantWhatsAppPhone } from '../../../shared/tenant/contact';
import {
  getBookingSchedule,
  getBookingTimePreferenceLabel,
  getDateClosure,
  isTimePreferenceClosed,
} from '../../../shared/tenant/bookingSchedule';
import Card from '../../../shared/ui/Card';
import DesiredDateStrip from '../../../shared/ui/DesiredDateStrip';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Button from '../../../shared/ui/Button';
import StatusBadge from '../../../shared/ui/StatusBadge';
import { buildWhatsAppUrl } from '../../staff/lib/whatsapp';
import BookingTimePreferenceChips from './BookingTimePreferenceChips';
import { alternativeResponseError, currentAlternativeResponse } from '../lib/appointmentResponses';
import { createBookingDateOptions } from '../lib/bookingDates';
import {
  canDeclineAppointmentAlternatives,
  declineAppointmentResponseError,
} from '../lib/appointmentRequestFlow';

const dateFormat = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const day = (date) => dateFormat.format(new Date(`${date}T12:00:00`));
const slotTime = (value) => String(value || '').slice(0, 5);
const slotLabel = (slot) => slot.time
  ? `${day(slot.date)} alle ${slotTime(slot.time)}`
  : `${day(slot.date)}, ${getBookingTimePreferenceLabel(slot.time_preference)}`;
const textStyle = { margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)' };
const buttonStyle = { minHeight: 44, width: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere' };
const contactStyle = {
  ...buttonStyle,
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 18px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--r-md, 16px)',
  color: 'var(--color-primary)',
  fontSize: 15,
  fontWeight: 600,
  textDecoration: 'none',
};

export default function PendingRequest({ request, onResponded }) {
  const { tenant } = useTenant();
  const [saved, setSaved] = useState(null);
  const [editing, setEditing] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [newDesiredDate, setNewDesiredDate] = useState('');
  const [newTimePreference, setNewTimePreference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const current = saved && new Date(saved.customer_responded_at) >= new Date(request.customer_responded_at || 0)
    && saved.staff_responded_at === request.staff_responded_at ? { ...request, ...saved } : request;
  const response = currentAlternativeResponse(current);
  const alternatives = current.proposed_alternatives || [];
  const bookingSchedule = useMemo(
    () => getBookingSchedule(tenant?.settings),
    [tenant?.settings]
  );
  const dateOptions = useMemo(() => createBookingDateOptions().map((item) => {
    const closure = getDateClosure(item.date, bookingSchedule);
    return { ...item, disabled: closure.isClosed, unavailableLabel: closure.label };
  }), [bookingSchedule]);
  const selectedDateClosure = getDateClosure(newDesiredDate, bookingSchedule);
  const canDecline = canDeclineAppointmentAlternatives(current);
  const salonWhatsAppUrl = buildWhatsAppUrl(
    getTenantWhatsAppPhone(tenant),
    `Ciao! Per ${current.pet?.name || 'il mio pet'} non riusciamo a trovare una fascia adatta. Possiamo sentirci?`
  );

  const respond = async (choice, newPreference = {}) => {
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
        p_new_desired_date: newPreference.date || null,
        p_new_time_preference: newPreference.timePreference || null,
      });
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.customer_responded_at) throw new Error('Missing response');
      setSaved(row); setEditing(false); setDeclining(false);
      if (await onResponded() === false) throw new Error('Refresh failed');
    } catch (err) {
      setError(declineAppointmentResponseError(err) || alternativeResponseError(err));
    } finally {
      inFlight.current = false; setBusy(false);
    }
  };

  return (
    <Card padding={20}>
      <Eyebrow style={{ marginBottom: 12 }}>Richiesta appuntamento</Eyebrow>
      <div style={{ marginBottom: 12 }}><StatusBadge status="scheduled" approvalStatus="pending" compact /></div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, textTransform: 'capitalize' }}>{day(current.desired_date)}</div>
      <p style={textStyle}>{current.pet?.name || 'Il tuo pet'} · {current.service?.name || 'Indicazione non disponibile'} · {getBookingTimePreferenceLabel(current.time_preference, 'Nessuna preferenza') || 'Nessuna preferenza'}</p>
      <p style={{ ...textStyle, fontSize: 13 }}>Inviata il {new Date(request.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
      {alternatives.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }} aria-busy={busy}>
          {response && !editing ? (
            <>
              <p role="status" style={textStyle}>
                {response === 'accepted'
                  ? `Hai scelto ${slotLabel({ date: current.chosen_date, time: current.chosen_time, time_preference: current.chosen_time_preference })}. Ora tocca al salone confermare l'appuntamento.`
                  : `Hai indicato ${day(current.desired_date)}${current.time_preference ? `, ${getBookingTimePreferenceLabel(current.time_preference, 'senza preferenza oraria')}` : ''}. Ora tocca al salone proporti un’alternativa.`}
              </p>
              <Button variant="ghost" style={buttonStyle} disabled={busy} onClick={() => setEditing(true)}>Cambia risposta</Button>
            </>
          ) : declining ? (
            <>
              <p style={textStyle}>Quando ti andrebbe bene invece?</p>
              <p style={textStyle}>Se vuoi, indica una nuova data: aiuta il salone a proporti orari più adatti.</p>
              <div style={{ marginInline: -3 }}>
                <DesiredDateStrip
                  dates={dateOptions}
                  value={newDesiredDate}
                  onChange={(value) => {
                    const closure = getDateClosure(value, bookingSchedule);
                    setNewDesiredDate(value);
                    setNewTimePreference((currentValue) => isTimePreferenceClosed(currentValue, closure) ? '' : currentValue);
                    setError('');
                  }}
                />
              </div>
              <BookingTimePreferenceChips
                value={newTimePreference}
                closure={selectedDateClosure}
                onChange={(value) => { setNewTimePreference(value); setError(''); }}
              />
              {selectedDateClosure.label && !selectedDateClosure.isClosed ? (
                <p role="status" style={textStyle}>{selectedDateClosure.label}. Per quel giorno scegli un’altra preferenza.</p>
              ) : null}
              <Button
                variant="ghost"
                style={buttonStyle}
                disabled={busy || Boolean(error) || !newDesiredDate || selectedDateClosure.isClosed || isTimePreferenceClosed(newTimePreference, selectedDateClosure)}
                onClick={() => respond(null, { date: newDesiredDate, timePreference: newTimePreference })}
              >
                Invia la nuova disponibilità
              </Button>
              <Button variant="ghost" style={buttonStyle} disabled={busy || Boolean(error)} onClick={() => respond(null)}>Rifiuta senza indicare una data</Button>
              <Button variant="ghost" style={buttonStyle} disabled={busy} onClick={() => { setDeclining(false); setError(''); }}>Torna agli orari</Button>
            </>
          ) : (
            <>
              <p style={textStyle}>{editing ? 'Scegli una nuova risposta: sostituirà quella precedente.' : 'Quale di questi orari ti va bene? Il salone confermerà l’appuntamento.'}</p>
              {alternatives.map((slot) => (
                <Button key={`${slot.date}:${slot.time || slot.time_preference}`} variant="ghost" style={buttonStyle} disabled={busy || Boolean(error)} onClick={() => respond(slot)}>{slotLabel(slot)}</Button>
              ))}
              {canDecline ? (
                <Button variant="ghost" style={buttonStyle} disabled={busy || Boolean(error)} onClick={() => { setDeclining(true); setError(''); }}>Nessuna di queste mi va bene</Button>
              ) : salonWhatsAppUrl ? (
                <a href={salonWhatsAppUrl} target="_blank" rel="noopener noreferrer" style={contactStyle}>Meglio sentirci</a>
              ) : (
                <p style={textStyle}>Meglio sentirci: contatta direttamente il salone.</p>
              )}
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
