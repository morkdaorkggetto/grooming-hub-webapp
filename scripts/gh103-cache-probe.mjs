import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Solo demo vuoto: nessun contenuto preesistente viene esposto o cancellato.
const ref = 'qttpinkslhenxrsbhhhg';
const keys = JSON.parse(execFileSync('supabase', ['projects', 'api-keys', '--project-ref', ref, '-o', 'json'], { encoding: 'utf8' }));
const key = keys.find(item => item.name === 'service_role')?.api_key;
assert(key, 'Chiave amministrativa demo non disponibile');
const admin = createClient(`https://${ref}.supabase.co`, key, { auth: { persistSession: false, autoRefreshToken: false } });
const bucket = admin.storage.from('client-photos');
const check = ({ data, error }) => { if (error) throw error; return data; };
assert.equal(check(await bucket.list('', { limit: 1 })).length, 0, 'Il bucket deve essere vuoto prima della prova');
const name = `gh103-cache/${crypto.randomUUID()}.png`;
const results = [];
const record = value => { results.push(value); console.log(JSON.stringify(value)); };
let uploaded = false;
try {
  check(await admin.storage.updateBucket('client-photos', { public: true }));
  check(await bucket.upload(name, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lGkAAAAASUVORK5CYII=', 'base64'), { contentType: 'image/png', cacheControl: '3600' }));
  uploaded = true;
  const url = bucket.getPublicUrl(name).data.publicUrl;
  assert((await fetch(url)).ok);
  assert((await fetch(url)).ok);
  const started = Date.now();
  check(await admin.storage.updateBucket('client-photos', { public: false }));
  let denied = false;
  for (let attempt = 0; attempt < 19; attempt++) {
    const response = await fetch(url);
    record({ elapsedMs: Date.now() - started, status: response.status, cache: response.headers.get('cf-cache-status') });
    if (!response.ok) { denied = true; break; }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  assert(denied, 'API private: URL ancora disponibile dopo 90 secondi');
} catch (error) {
  record({ failure: error.message });
  process.exitCode = 1;
} finally {
  check(await admin.storage.updateBucket('client-photos', { public: false }));
  if (uploaded) check(await bucket.remove([name]));
  assert.equal(check(await bucket.list('gh103-cache', { limit: 1 })).length, 0);
  record({ cleanup: 'bucket privato, fixture rimossa; pet-avatars non toccato' });
  writeFileSync(new URL('../docs/consegne/evidenze/GH-103/cache-api.json', import.meta.url), JSON.stringify(results, null, 2));
}
