import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_REF = 'qttpinkslhenxrsbhhhg';
const MARKER = '[DEMO GH-96]';
const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const output = path.join(root, 'docs/consegne/evidenze/GH-96/live-demo.json');
const started = Date.now();

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

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const assertNoError = (error, label) => { if (error) throw new Error(`${label}: ${error.code || ''} ${error.message}`.trim()); };
const makeClient = () => createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});
const localDate = (date) => date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
const weekday = (dateValue) => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${dateValue}T12:00:00`).getDay()];
const futureOpenDates = (schedule, count) => {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  for (let offset = 1; dates.length < count && offset < 90; offset += 1) {
    const candidate = new Date(cursor);
    candidate.setDate(cursor.getDate() + offset);
    const value = localDate(candidate);
    const day = weekday(value);
    const closed = (schedule.closed_weekdays || []).includes(day)
      || (schedule.closed_time_preferences?.[day] || []).includes('morning');
    if (!closed) dates.push(value);
  }
  assert(dates.length === count, `Date aperte insufficienti: ${dates.length}/${count}`);
  return dates;
};

assert(new URL(process.env.VITE_SUPABASE_URL).hostname.startsWith(EXPECTED_REF), 'Ref Supabase inatteso');
for (const key of ['GH_RLS_MARIO_PASSWORD', 'GH_RLS_STAFF_PASSWORD']) assert(process.env[key], `Variabile ${key} assente`);

const mario = makeClient();
const staff = makeClient();
const requestIds = new Set();
const results = { projectRef: EXPECTED_REF, marker: MARKER, checks: {}, cleanup: {} };
let tenantId;
let baselineRequests;
let baselineAppointments;

try {
  const [marioAuth, staffAuth] = await Promise.all([
    mario.auth.signInWithPassword({ email: process.env.GH_RLS_MARIO_EMAIL || 'mario.rossi@test.example', password: process.env.GH_RLS_MARIO_PASSWORD }),
    staff.auth.signInWithPassword({ email: process.env.GH_RLS_STAFF_EMAIL || 'staff.sonda@test.example', password: process.env.GH_RLS_STAFF_PASSWORD }),
  ]);
  assertNoError(marioAuth.error, 'Login Mario');
  assertNoError(staffAuth.error, 'Login staff');

  const membership = await staff.from('tenant_memberships').select('tenant_id').in('role', ['owner', 'staff']).limit(1).single();
  assertNoError(membership.error, 'Tenant staff');
  tenantId = membership.data.tenant_id;
  const [tenantResult, customerResult, serviceResult, requestsBaseline, appointmentsBaseline] = await Promise.all([
    staff.from('tenants').select('settings').eq('id', tenantId).single(),
    mario.from('customers').select('id').eq('tenant_id', tenantId).eq('user_id', marioAuth.data.user.id).single(),
    staff.from('services').select('id').eq('tenant_id', tenantId).eq('is_active', true).order('display_order').limit(1).single(),
    staff.from('appointment_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
  ]);
  for (const [label, result] of [['Tenant', tenantResult], ['Customer', customerResult], ['Servizio', serviceResult], ['Baseline richieste', requestsBaseline], ['Baseline appuntamenti', appointmentsBaseline]]) assertNoError(result.error, label);
  baselineRequests = requestsBaseline.count;
  baselineAppointments = appointmentsBaseline.count;

  const petResult = await mario.from('pets').select('id').eq('tenant_id', tenantId).eq('customer_id', customerResult.data.id).limit(1).single();
  assertNoError(petResult.error, 'Pet Mario');
  const dates = futureOpenDates(tenantResult.data.settings?.booking_schedule || {}, 3);
  const submit = async (suffix, date) => {
    const response = await mario.rpc('submit_appointment_request', {
      p_tenant_id: tenantId,
      p_pet_id: petResult.data.id,
      p_service_id: serviceResult.data.id,
      p_desired_date: date,
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

  const first = await submit('RITIRO', dates[0]);
  const withdrawn = await mario.rpc('withdraw_appointment_request', { p_request_id: first.id });
  assertNoError(withdrawn.error, 'Ritiro richiesta');
  const readWithdrawn = await staff.from('appointment_requests').select('status, withdrawn_at, appointment_id').eq('id', first.id).single();
  assertNoError(readWithdrawn.error, 'Rilettura ritiro');
  assert(readWithdrawn.data.status === 'withdrawn' && readWithdrawn.data.withdrawn_at && readWithdrawn.data.appointment_id === null, 'Ritiro non coerente');
  results.checks.withdraw = readWithdrawn.data;

  const second = await submit('RIPRENOTAZIONE', dates[1]);
  results.checks.rebookSamePet = { requestId: second.id, petId: petResult.data.id, desiredDate: dates[1], status: second.status };
  const secondWithdraw = await mario.rpc('withdraw_appointment_request', { p_request_id: second.id });
  assertNoError(secondWithdraw.error, 'Ritiro riprenotazione');

  const handled = await submit('GIA GESTITA', dates[2]);
  const rejected = await staff.rpc('resolve_appointment_request_local', {
    p_request_id: handled.id,
    p_decision: 'rejected',
    p_scheduled_date: null,
    p_scheduled_time: null,
    p_duration_minutes: null,
  });
  assertNoError(rejected.error, 'Rifiuto staff');
  const refusedWithdrawal = await mario.rpc('withdraw_appointment_request', { p_request_id: handled.id });
  assert(refusedWithdrawal.error?.code === '23514', `Codice inatteso: ${refusedWithdrawal.error?.code || 'successo'}`);
  assert(refusedWithdrawal.error?.details === 'GH96_ALREADY_RESOLVED', `Dettaglio inatteso: ${refusedWithdrawal.error?.details}`);
  results.checks.alreadyHandled = { code: refusedWithdrawal.error.code, details: refusedWithdrawal.error.details };

  const appointmentsAfter = await staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId);
  assertNoError(appointmentsAfter.error, 'Appuntamenti dopo le prove');
  assert(appointmentsAfter.count === baselineAppointments, 'La prova ha creato un appuntamento');
  results.checks.appointments = { before: baselineAppointments, after: appointmentsAfter.count };
} finally {
  if (requestIds.size && tenantId) {
    const cleanup = await staff.from('appointment_requests').delete().eq('tenant_id', tenantId).in('id', [...requestIds]);
    if (cleanup.error) results.cleanup.error = `${cleanup.error.code || ''} ${cleanup.error.message}`.trim();
  }
  if (tenantId) {
    const [markerRows, totalRequests, totalAppointments] = await Promise.all([
      staff.from('appointment_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).ilike('coat_condition_notes', `${MARKER}%`),
      staff.from('appointment_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      staff.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    ]);
    results.cleanup = { ...results.cleanup, markerRows: markerRows.count, requests: totalRequests.count, appointments: totalAppointments.count };
  }
  await Promise.all([mario.auth.signOut(), staff.auth.signOut()]);
  results.elapsedMs = Date.now() - started;
  fs.writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
}

assert(!results.cleanup.error, results.cleanup.error);
assert(results.cleanup.markerRows === 0, `Fixture residue: ${results.cleanup.markerRows}`);
assert(results.cleanup.requests === baselineRequests, `Richieste finali ${results.cleanup.requests}, baseline ${baselineRequests}`);
assert(results.cleanup.appointments === baselineAppointments, `Appuntamenti finali ${results.cleanup.appointments}, baseline ${baselineAppointments}`);
console.log(JSON.stringify({ checks: results.checks, cleanup: results.cleanup, elapsedMs: results.elapsedMs }, null, 2));
