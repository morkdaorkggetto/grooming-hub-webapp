import assert from 'node:assert/strict';
import test from 'node:test';
import { customerErrorCode, customerErrorMessage } from '../src/shared/customerErrors.js';
import { declineAppointmentResponseError } from '../src/apps/customer/lib/appointmentRequestFlow.js';

test('il codice in details prevale sul messaggio', () => {
  assert.equal(customerErrorCode({ details: 'GH_INVITE_ASSIGNED_ELSEWHERE', message: 'GH_INVITE_EXPIRED: testo privato' }), 'GH_INVITE_ASSIGNED_ELSEWHERE');
});
test('codici legacy riconosciuti senza usare il testo', () => {
  assert.equal(customerErrorCode({ message: 'GH_INVITE_EXPIRED: testo privato' }), 'GH_INVITE_EXPIRED');
  assert.equal(customerErrorCode({ message: 'testo GH_INVITE_EXPIRED: privato' }), '');
});
test('Auth e codice sconosciuto producono solo copy locale', () => {
  assert.equal(customerErrorMessage({ code: 'invalid_credentials', message: 'PRIVATE' }), 'Email o password non corrette.');
  assert.equal(customerErrorMessage({ code: 'UNKNOWN', message: 'PRIVATE' }, 'Riprova.'), 'Riprova.');
  assert.equal(customerErrorMessage({ code: 'constructor', message: 'PRIVATE' }, 'Riprova.'), 'Riprova.');
});
test('rifiuto disponibilita usa il codice, non la prosa del server', () => {
  assert.equal(declineAppointmentResponseError({ code: '22023', message: 'PRIVATE' }), 'Controlla la nuova disponibilità: scegli una data futura e una fascia in cui il salone è aperto.');
  assert.equal(declineAppointmentResponseError({ message: 'declared closure' }), null);
});
