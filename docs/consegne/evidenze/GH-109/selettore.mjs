import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
const result = await build({ entryPoints: ['src/apps/customer/lib/customerActions.js'], bundle: true, write: false, format: 'esm' });
const { customerActions, customerActionTitle } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
const old = { id: 'old', pet_id: 'a', status: 'rejected', created_at: '2026-10-01T08:00:00Z' };
const slot = { date: '2026-10-05', time: '09:00', time_preference: 'morning' };
const proposal = { ...old, id: 'proposal', status: 'pending', staff_responded_at: '2026-10-01T09:00:00Z', proposed_alternatives: [slot] };
const results = [];
function check(name, rows, ids) { assert.deepEqual(customerActions(rows).map(x => x.request.id), ids); results.push(name); }
check('rifiuto ultimo', [old], ['old']);
for (const status of ['pending', 'rejected', 'approved', 'withdrawn', 'accepted']) {
  check('successiva ' + status, [old, { ...old, id: 'new', status, created_at: '2026-10-02T08:00:00Z' }], status === 'rejected' ? ['new'] : []);
}
check('altro pet non sopprime il rifiuto', [old, { ...old, id: 'other', pet_id: 'b', status: 'withdrawn', created_at: '2026-10-02T08:00:00Z' }], ['old']);
check('attesa del salone', [{ ...old, status: 'pending' }], []);
check('proposta senza risposta', [proposal], ['proposal']);
const answered = { ...proposal, customer_response: 'accepted', customer_responded_at: '2026-10-01T10:00:00Z', chosen_date: slot.date, chosen_time: slot.time };
check('risposta corrente accettata', [answered], []);
check('risposta corrente rifiutata', [{ ...answered, customer_response: 'declined' }], []);
check('nuovo giro dopo risposta', [{ ...answered, staff_responded_at: '2026-10-01T11:00:00Z' }], ['proposal']);
check('vecchia scelta non piu proposta', [{ ...answered, chosen_time: '14:00' }], ['proposal']);
check('nessuna azione', [], []);
check('ordine indipendente', [{ ...old, id: 'new', status: 'withdrawn', created_at: '2026-10-02T08:00:00Z' }, old], []);
assert.equal(customerActionTitle(customerActions([old])), "Scegli un'altra data");
assert.equal(customerActionTitle(customerActions([proposal])), 'Scegli un orario');
for (const [n, word] of [[2, 'Due'], [3, 'Tre'], [10, 'Dieci'], [11, '11']]) assert.equal(customerActionTitle(Array(n).fill({})), `${word} richieste aspettano te`);
fs.writeFileSync(new URL('selettore.json', import.meta.url), JSON.stringify({ at: new Date().toISOString(), results, titles: 'PASS' }, null, 2) + '\n');
console.log(`${results.length} casi e 6 testi PASS`);
