import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const { createServer } = await import(root + 'node_modules/vite/dist/node/index.js');
const server = await createServer({ root, configFile: false, cacheDir: '/private/tmp/gh107-read-test', server: { middlewareMode: true, watch: null, hmr: false }, optimizeDeps: { noDiscovery: true } });
let supabase;
try {
  supabase = (await server.ssrLoadModule('/src/shared/supabase/client.js')).supabase;
  const { readPetCard } = await server.ssrLoadModule('/src/apps/customer/hooks/usePetCard.js');
  const calls = [];
  let scenario = 'long';
  const client = { from(table) {
    const call = { table, filters: [] }; calls.push(call);
    return {
      select(columns) { call.columns = columns; return this; },
      eq(key, value) { call.filters.push([key, value]); return this; },
      order(key) { call.order = key; return this; },
      async maybeSingle() { return { data: scenario === 'missing' ? null : { id: 'test-pet', name: 'Synthetic' }, error: null }; },
      async range(from, to) {
        call.range = [from, to];
        if (scenario === 'error' && from === 500) return { error: new Error('later page failed'), data: null };
        const length = Math.max(0, Math.min(to + 1, table === 'visits' ? 1201 : 1001) - from);
        return { data: Array.from({ length }, (_, index) => table === 'visits' ? { id: from + index, date: '2026-09-01' } : { points: 1 }), error: null };
      },
    };
  } };
  const pet = await readPetCard(client, 'test-tenant', 'test-pet');
  assert.equal(pet.visits.length, 1201);
  assert.equal(pet.rewardPointsTotal, 1001);
  assert.ok(calls.every(call => call.filters.some(([key, value]) => key === 'tenant_id' && value === 'test-tenant')));
  assert.ok(calls.every(call => !/\bphoto_url\b|cost|discount/.test(call.columns)));
  const paginatedCalls = calls.slice();
  scenario = 'missing'; calls.length = 0;
  assert.equal(await readPetCard(client, 'test-tenant', 'other-pet'), null);
  assert.equal(calls.length, 1);
  scenario = 'error';
  await assert.rejects(readPetCard(client, 'test-tenant', 'test-pet'), /later page failed/);
  const result = { at: new Date().toISOString(), kind: 'local query mock, no RLS claim', visits: pet.visits.length, points: pet.rewardPointsTotal, paginatedCalls, missingPetNoChildRead: true, laterPageErrorNotPartialSuccess: true };
  fs.writeFileSync(new URL('./letture-locali.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ visits: pet.visits.length, points: pet.rewardPointsTotal, missingPet: 'PASS', laterPageError: 'PASS' }));
} finally { supabase?.auth.stopAutoRefresh(); await server.close(); }
