import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_REF = 'qttpinkslhenxrsbhhhg';
const MARKER = '[DEMO GH-91]';
const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const output = path.join(root, 'docs/consegne/evidenze/GH-91/live-demo.json');
const started = Date.now();

function loadEnv() {
  for (const rawLine of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoError(error, label) {
  if (error) throw new Error(`${label}: ${error.code || ''} ${error.message}`.trim());
}

function localDate(date) {
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
}

function weekday(dateValue) {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${dateValue}T12:00:00`).getDay()];
}

function futureDates(schedule, count, { closed = false, preference = 'morning' } = {}) {
  const values = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  for (let offset = 1; values.length < count && offset < 90; offset += 1) {
    const candidate = new Date(cursor);
    candidate.setDate(cursor.getDate() + offset);
    const value = localDate(candidate);
    const day = weekday(value);
    const isClosed = (schedule.closed_weekdays || []).includes(day)
      || (schedule.closed_time_preferences?.[day] || []).includes(preference);
    if (isClosed === closed) values.push(value);
  }
  assert(values.length === count, `Date future insufficienti: ${values.length}/${count}`);
  return values;
}

function makeClient() {
  return createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

loadEnv();
assert(new URL(process.env.VITE_SUPABASE_URL).hostname.startsWith(EXPECTED_REF), 'Ref Supabase inatteso');
for (const key of ['GH_RLS_MARIO_PASSWORD', 'GH_RLS_STAFF_PASSWORD']) assert(process.env[key], `Variabile ${key} assente`);

const mario = makeClient();
const staff = makeClient();
const requestIds = new Set();
const results = { projectRef: EXPECTED_REF, marker: MARKER, fixtures: {}, checks: {}, cleanup: {} };

try {
  const [marioAuth, staffAuth] = await Promise.all([
    mario.auth.signInWithPassword({ email: process.env.GH_RLS_MARIO_EMAIL || 'mario.rossi@test.example', password: process.env.GH_RLS_MARIO_PASSWORD }),
    staff.auth.signInWithPassword({ email: process.env.GH_RLS_STAFF_EMAIL || 'staff.sonda@test.example', password: process.env.GH_RLS_STAFF_PASSWORD }),
  ]);
  assertNoError(marioAuth.error, 'Login Mario');
  assertNoError(staffAuth.error, 'Login staff');

  const membership = await staff.from('tenant_memberships').select('tenant_id').in('role', ['owner', 'staff']).limit(1).single();
  assertNoError(membership.error, 'Tenant staff');
  const tenantId = membership.data.tenant_id;
  const [tenantResult, customerResult, serviceResult, baselineResult] = await Promise.all([
    staff.from('tenants').select('settings').eq('id', tenantId).single(),
    mario.from('customers').select('id').eq('tenant_id', tenantId).eq('user_id', marioAuth.data.user.id).single(),
    staff.from('services').select('id').eq('tenant_id', tenantId).eq('is_active', true).order('display_order').limit(1).single(),
    staff.from('appointment_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
  ]);
  assertNoError(tenantResult.error, 'Impostazioni tenant');
  assertNoError(customerResult.error, 'Customer Mario');
  assertNoError(serviceResult.error, 'Servizio');
  assertNoError(baselineResult.error, 'Baseline richieste');

  const petResult = await mario.from('pets').select('id').eq('tenant_id', tenantId).eq('customer_id', customerResult.data.id).limit(1).single();
  assertNoError(petResult.error, 'Pet Mario');
  const schedule = tenantResult.data.settings?.booking_schedule || {};
  const open = futureDates(schedule, 7);
  const [closedDate] = futureDates(schedule, 1, { closed: true });
  const alternatives = (start) => [
    { date: open[start], time: '10:00', time_preference: 'morning' },
    { date: open[start + 1], time: '11:00', time_preference: 'morning' },
    { date: open[start + 2], time: '12:00', time_preference: 'morning' },
  ];

  const submit = async (suffix, desiredDate) => {
    const response = await mario.rpc('submit_appointment_request', {
      p_tenant_id: tenantId,
      p_pet_id: petResult.data.id,
      p_service_id: serviceResult.data.id,
      p_desired_date: desiredDate,
      p_time_preference: 'morning',
      p_coat_condition_codes: ['regular_grooming'],
      p_coat_condition_notes: `${MARKER} ${suffix}`,
      p_declared_pet_age: null,
    });
    assertNoError(response.error, `Creazione ${suffix}`);
    const row = Array.isArray(response.data) ? response.data[0] : response.data;
    assert(row?.id, `ID ${suffix} assente`);
    requestIds.add(row.id);
    return row;
  };

  const propose = async (id, slots) => {
    const response = await staff.rpc('propose_appointment_request_alternatives', { p_request_id: id, p_alternatives: slots });
    assertNoError(response.error, 'Proposta staff');
    return Array.isArray(response.data) ? response.data[0] : response.data;
  };

  const respond = (id, newDate = null, newPreference = null) => mario.rpc('respond_appointment_request_slot', {
    p_request_id: id,
    p_response: 'declined',
    p_date: null,
    p_time: null,
    p_time_preference: null,
    p_new_desired_date: newDate,
    p_new_time_preference: newPreference,
  });

  const withDate = await submit('CON DATA', open[0]);
  const firstProposal = await propose(withDate.id, alternatives(1));
  assert(firstProposal.alternatives_round === 1, `Primo giro: ${firstProposal.alternatives_round}`);
  const withDateResponse = await respond(withDate.id, open[5], 'morning');
  assertNoError(withDateResponse.error, 'Rifiuto con data');
  const withDateRead = await staff.from('appointment_requests')
    .select('desired_date, time_preference, customer_response, status')
    .eq('id', withDate.id).single();
  assertNoError(withDateRead.error, 'Rilettura rifiuto con data');
  assert(withDateRead.data.desired_date === open[5], 'La data nuova non è stata salvata');
  assert(withDateRead.data.time_preference === 'morning', 'La fascia nuova non è stata salvata');
  assert(withDateRead.data.customer_response === 'declined' && withDateRead.data.status === 'pending', 'Stato rifiuto con data inatteso');
  results.checks.declineWithDate = { before: open[0], ...withDateRead.data };

  const deleteWithDate = await staff.from('appointment_requests').delete().eq('id', withDate.id);
  assertNoError(deleteWithDate.error, 'Pulizia prima richiesta');
  requestIds.delete(withDate.id);

  const withoutDate = await submit('SENZA DATA', open[0]);
  const roundOne = await propose(withoutDate.id, alternatives(1));
  const noDateResponse = await respond(withoutDate.id);
  assertNoError(noDateResponse.error, 'Rifiuto senza data');
  const noDateRead = await staff.from('appointment_requests').select('desired_date, time_preference, customer_response, status').eq('id', withoutDate.id).single();
  assertNoError(noDateRead.error, 'Rilettura rifiuto senza data');
  assert(noDateRead.data.desired_date === open[0], 'Rifiuto senza data ha cambiato desired_date');
  results.checks.declineWithoutDate = { before: open[0], ...noDateRead.data };

  const roundTwo = await propose(withoutDate.id, alternatives(3));
  assert(roundOne.alternatives_round === 1 && roundTwo.alternatives_round === 2, 'Contatore proposte inatteso');
  results.checks.alternativeRounds = { afterFirstProposal: roundOne.alternatives_round, afterSecondProposal: roundTwo.alternatives_round };

  const beforeClosed = await staff.from('appointment_requests').select('desired_date, time_preference').eq('id', withoutDate.id).single();
  assertNoError(beforeClosed.error, 'Prima del giorno chiuso');
  const closedResponse = await respond(withoutDate.id, closedDate, 'morning');
  assert(closedResponse.error?.code === '22023' && /declared closure/i.test(closedResponse.error.message), `Chiusura non rifiutata: ${closedResponse.error?.message || 'successo'}`);
  const afterClosed = await staff.from('appointment_requests').select('desired_date, time_preference').eq('id', withoutDate.id).single();
  assertNoError(afterClosed.error, 'Dopo il giorno chiuso');
  assert(JSON.stringify(beforeClosed.data) === JSON.stringify(afterClosed.data), 'Il rifiuto su chiusura ha modificato la richiesta');
  results.checks.closedDate = { attempted: closedDate, code: closedResponse.error.code, message: closedResponse.error.message, before: beforeClosed.data, after: afterClosed.data };

  results.fixtures = { baselineRequests: baselineResult.count, created: 2, tenantId, openDates: open, closedDate };
} finally {
  if (requestIds.size) {
    const cleanup = await staff.from('appointment_requests').delete().in('id', [...requestIds]);
    if (cleanup.error) results.cleanup.error = `${cleanup.error.code || ''} ${cleanup.error.message}`.trim();
  }
  const membership = await staff.from('tenant_memberships').select('tenant_id').in('role', ['owner', 'staff']).limit(1).maybeSingle();
  if (membership.data?.tenant_id) {
    const [remaining, total] = await Promise.all([
      staff.from('appointment_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', membership.data.tenant_id).ilike('coat_condition_notes', `${MARKER}%`),
      staff.from('appointment_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', membership.data.tenant_id),
    ]);
    results.cleanup = { ...results.cleanup, markerRows: remaining.count, finalRequests: total.count };
  }
  await Promise.all([mario.auth.signOut(), staff.auth.signOut()]);
  results.elapsedMs = Date.now() - started;
  fs.writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
}

assert(!results.cleanup.error, results.cleanup.error);
assert(results.cleanup.markerRows === 0, `Fixture residue: ${results.cleanup.markerRows}`);
assert(results.cleanup.finalRequests === results.fixtures.baselineRequests, `Conteggio finale ${results.cleanup.finalRequests}, baseline ${results.fixtures.baselineRequests}`);
console.log(JSON.stringify({ checks: results.checks, cleanup: results.cleanup, elapsedMs: results.elapsedMs }, null, 2));
