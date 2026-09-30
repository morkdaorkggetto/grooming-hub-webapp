import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = new URL('../../../../', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');
const db = read('src/apps/staff/lib/database.js');
const calendar = read('src/apps/staff/pages/Calendar.jsx');
const response = read('src/apps/customer/lib/appointmentResponses.js');
const base = execFileSync('git', ['show', '8b51c0e:src/apps/staff/lib/database.js'], { cwd: root, encoding: 'utf8' });
const results = [];
const record = (name, value) => results.push({ name, value });
const dates = vm.createContext({ Intl, Date });
vm.runInContext(db.slice(db.indexOf('export const getRomeDate'), db.indexOf('export const getClientById'))
  .replaceAll('export const ', 'globalThis.'), dates);
for (const [instant, expected] of [
  ['2026-09-30T14:00:00Z', '2026-09-29T22:00:00.000Z'],
  ['2026-01-15T12:00:00Z', '2026-01-14T23:00:00.000Z'],
  ['2026-03-29T12:00:00Z', '2026-03-28T23:00:00.000Z'],
  ['2026-10-25T12:00:00Z', '2026-10-24T22:00:00.000Z'],
  ['2026-09-30T22:30:00Z', '2026-09-30T22:00:00.000Z'],
]) {
  assert.equal(dates.getRomeDayStart(instant), expected);
  record('Rome midnight', { instant, expected });
}
vm.runInContext(calendar.slice(calendar.indexOf('const toLocalDateString'), calendar.indexOf('const addDays'))
  .replaceAll('const ', 'var '), dates);
for (const invalid of ['bad', '2026-02-30', '2026-13-01', '', null, '2026-9-30', '2026-09-30T12:00:00']) {
  assert.equal(dates.getQueryDay(invalid), dates.todayString());
}
assert.equal(dates.getQueryDay('2028-02-29'), '2028-02-29');
record('Calendar query', '7 invalid values -> today; leap day accepted');

async function queryFilters(code, petId) {
  const calls = [];
  const context = vm.createContext({
    requireStaff: async () => ({ tenantId: 'tenant' }),
    APPOINTMENT_REQUEST_SELECT: 'requests', APPOINTMENT_SELECT: 'appointments',
    mapAppointmentRequest: x => x, mapLegacyAppointmentRequest: x => x,
    supabase: { from(table) {
      const call = { table, filters: [] };
      calls.push(call);
      const q = { select() { return q; }, eq(...args) { call.filters.push(args); return q; },
        order() { return q; }, then(done) { return Promise.resolve({ data: [] }).then(done); } };
      return q;
    } },
  });
  const start = code.includes('const readPendingAppointmentRequests')
    ? code.indexOf('const readPendingAppointmentRequests') : code.indexOf('export const getPendingAppointmentRequests');
  vm.runInContext(code.slice(start, code.indexOf('export const getAppointmentRequestsForStaff'))
    .replaceAll('export const ', 'var ').replace('const readPendingAppointmentRequests', 'var readPendingAppointmentRequests'), context);
  if (petId) await context.readPendingAppointmentRequests('tenant', petId);
  else await context.getPendingAppointmentRequests();
  return JSON.parse(JSON.stringify(calls));
}
const oldFilters = await queryFilters(base);
assert.deepEqual(await queryFilters(db), oldFilters);
assert.deepEqual(await queryFilters(db, 'pet'), oldFilters.map(q => ({ ...q, filters: [...q.filters, ['pet_id', 'pet']] })));
record('Dashboard premise and reuse', { base: oldFilters, unchanged: true, petFilterOnly: true });

const action = vm.createContext({});
vm.runInContext(response.slice(0, response.indexOf('export function isRecentlyConfirmed')).replace('export ', '')
  + db.slice(db.indexOf('export const APPOINTMENT_REQUEST_STAFF_ACTION'), db.indexOf('const withAppointmentRequestStaffAction'))
    .replaceAll('export const ', 'var '), action);
const proposed = [{ date: '2026-10-01', time: '09:00' }, { date: '2026-10-02', time: '10:00' }];
const pending = { status: 'pending', proposed_alternatives: proposed, staff_responded_at: '2026-09-30T08:00:00Z' };
const accepted = { ...pending, customer_response: 'accepted', customer_responded_at: '2026-09-30T09:00:00Z', chosen_date: '2026-10-01', chosen_time: '09:00:00' };
for (const [request, expected] of [
  [{ status: 'pending' }, 'needs_response'], [pending, 'waiting_customer'],
  [accepted, 'needs_booking'], [{ ...accepted, customer_response: 'declined' }, 'needs_response'],
  [{ ...accepted, staff_responded_at: '2026-09-30T10:00:00Z' }, 'waiting_customer'],
  [{ request_kind: 'legacy' }, 'needs_response'],
]) assert.equal(action.getAppointmentRequestStaffAction(request), expected);
record('Request classification', '6/6 existing classifications including stale response and legacy');
const oldCalendar = execFileSync('git', ['show', '8b51c0e:src/apps/staff/pages/Calendar.jsx'], { cwd: root, encoding: 'utf8' });
const clientEffect = text => text.slice(text.indexOf("    const clientId = searchParams.get('clientId');"), text.indexOf('}, [openManual, searchParams]);') + 32);
assert.equal(clientEffect(calendar), clientEffect(oldCalendar));
assert.equal(execFileSync('git', ['diff', '8b51c0e', '--', 'src/apps/customer'], { cwd: root, encoding: 'utf8' }), '');
record('Invariants', 'clientId effect byte-identical; customer diff empty');
for (const size of [0, 3, 1001]) {
  const source = Array.from({ length: size }, (_, id) => ({ id }));
  const ranges = [];
  const paged = vm.createContext({ getRomeDayStart: () => '2026-09-29T22:00:00Z',
    APPOINTMENT_SELECT: '*', mapAppointment: x => x,
    supabase: { from() {
      const q = { select() { return q; }, eq() { return q; }, gte() { return q; }, order() { return q; },
        range(start, end) { ranges.push([start, end]); return Promise.resolve({ data: source.slice(start, Math.min(end + 1, start + 100)), count: size }); } };
      return q;
    } },
  });
  vm.runInContext(db.slice(db.indexOf('const readUpcomingPetAppointments'), db.indexOf('export const getClientById'))
    .replace('const readUpcomingPetAppointments', 'var readUpcomingPetAppointments'), paged);
  const actual = await paged.readUpcomingPetAppointments('tenant', 'pet');
  assert.equal(actual.length, size);
  assert.equal(new Set(actual.map(x => x.id)).size, size);
  record('Server pagination (simulated 100-row cap)', { requested: size, returned: actual.length, pages: ranges.length });
}
console.log(JSON.stringify({ timezone: process.env.TZ || 'system', results }, null, 2));
