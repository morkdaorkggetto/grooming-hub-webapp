import fs from 'node:fs';
import assert from 'node:assert/strict';
import { currentAlternativeResponse } from '../../../../src/apps/customer/lib/appointmentResponses.js';

const home = fs.readFileSync(new URL('../../../../src/apps/customer/pages/Home.jsx', import.meta.url), 'utf8');
assert.ok(home.includes("const rejectedRequest = requests.find((request) => request.status === 'rejected')"));
assert.ok(home.includes(') : pendingRequest ? (\n            <PendingRequest'));
assert.ok(home.includes(') : rejectedRequest ? ('));
const rejected = { id: 'synthetic-old', pet_id: 'synthetic-pet', status: 'rejected' };
const pending = { id: 'synthetic-new', pet_id: 'synthetic-pet', status: 'pending' };
// Reproduce the measured Home branch precedence, not a new product rule.
const cases = [
  ['rejected alone', [rejected], false, 1],
  ['rejected and newer pending, same pet', [pending, rejected], false, 0],
  ['rejected and next appointment', [rejected], true, 0],
  ['two rejected', [rejected, { ...rejected, id: 'synthetic-second' }], false, 1],
].map(([name, rows, nextAppointment, expected]) => {
  const visible = Number(!nextAppointment && !rows.find(r => r.status === 'pending') && Boolean(rows.find(r => r.status === 'rejected')));
  assert.equal(visible, expected);
  return { name, rejectedReturned: rows.filter(r => r.status === 'rejected').length, rejectedVisibleToday: visible };
});
const slot = { date: '2026-10-10', time: '10:00' };
const proposed = { ...pending, proposed_alternatives: [slot], staff_responded_at: '2026-10-02T09:00:00Z' };
assert.equal(currentAlternativeResponse(proposed), null);
assert.equal(currentAlternativeResponse({ ...proposed, customer_response: 'accepted', customer_responded_at: '2026-10-02T10:00:00Z', chosen_date: slot.date, chosen_time: slot.time }), 'accepted');
const result = { at: new Date().toISOString(), source: new URL('../../../../src/apps/customer/pages/Home.jsx', import.meta.url).pathname, environment: 'local synthetic, no database', cases, proposalResponseHelper: 'PASS', conclusion: 'The set of rejected rows and the set of visible reschedule actions differ. No persisted supersession rule established by this test.' };
fs.writeFileSync(new URL('./preflight.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
