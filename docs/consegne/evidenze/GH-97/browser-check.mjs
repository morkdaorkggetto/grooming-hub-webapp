import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-97`;
const started = Date.now();
const results = { cases: {}, layouts: [], errors: [], unexpected: [] };
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: '/private/tmp/gh97-vite-cache',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh97-memory.invalid'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});

const uid = '97979797-9797-4979-8979-979797979797';
const tid = '97979797-1111-4111-8111-979797979797';
const user = { id: uid, email: 'owner@gh97.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const owner = { id: uid, user_id: uid, tenant_id: tid, first_name: 'Ada', last_name: 'Prova', phone: '+393330000097' };
const pet = { id: '97979797-2222-4222-8222-979797979797', tenant_id: tid, customer_id: uid, owner_user_id: uid, name: 'Rumba', breed: 'Barboncino', photo_url: null, birth_date: '2022-01-01', customer: owner, visits: [], staff_notes: [] };
const service = { id: '97979797-5555-4555-8555-979797979797', tenant_id: tid, name: 'Bagno', duration_minutes: 60, is_active: true };
const freshRequest = () => ({
  id: '97979797-3333-4333-8333-979797979797', tenant_id: tid, customer_user_id: uid,
  pet_id: pet.id, service_id: service.id, desired_date: '2026-09-21', time_preference: 'morning',
  coat_condition_codes: [], coat_condition_notes: null, declared_pet_age: null,
  status: 'pending', appointment_id: null, withdrawn_at: null, staff_responded_at: null,
  proposed_alternatives: null, alternatives_round: 0, chosen_date: null, chosen_time: null,
  chosen_time_preference: null, customer_response: null, customer_responded_at: null,
  created_at: '2026-09-19T07:00:00Z', updated_at: '2026-09-19T07:00:00Z', service, appointment: null, pet,
});

let request = freshRequest();
let mode = 'success';
let withdrawalCalls = 0;
let browser;

try {
  await mkdir(out, { recursive: true });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, timezoneId: 'Europe/Rome' });
  await context.routeWebSocket('**/*', (socket) => socket.close());
  await context.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === origin) return route.continue();
    if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ body: '' });
    if (url.origin !== 'https://gh97-memory.invalid') {
      results.unexpected.push(url.origin + url.pathname);
      return route.abort();
    }
    const json = (data, status = 200, headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.pathname === '/auth/v1/user') return json(user);
    if (url.pathname === '/rest/v1/rpc/withdraw_appointment_request') {
      withdrawalCalls += 1;
      if (mode === 'resolved') return json({ code: '23514', details: 'GH96_ALREADY_RESOLVED', message: 'Appointment request already resolved' }, 400);
      request = { ...request, status: 'withdrawn', withdrawn_at: '2026-09-19T09:00:00Z' };
      return json(request);
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
      if (req.method() === 'HEAD') return json([], 200, { 'content-range': '*/0' });
      const table = url.pathname.split('/').at(-1);
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role: 'customer', created_at: '2026-01-01' }];
      if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { whatsapp_phone: '+393330000097', booking_schedule: {} } }];
      if (table === 'profiles') data = [{ id: uid, email: user.email, role: 'customer' }];
      if (table === 'customers') data = [owner];
      if (table === 'pets') data = [pet];
      if (table === 'services') data = [service];
      if (table === 'appointment_requests') data = request.status === 'pending' ? [structuredClone(request)] : [];
      if (['appointments', 'visits', 'promotions', 'reward_points'].includes(table)) data = [];
      if (req.headers().accept?.includes('vnd.pgrst.object')) return json(data[0] || null);
      return json(data);
    }
    results.unexpected.push(url.pathname);
    return route.abort();
  });
  context.setDefaultTimeout(10000);
  const page = await context.newPage();
  page.on('pageerror', (error) => results.errors.push(error.message));
  await page.goto(`${origin}/login`);
  await page.evaluate(({ uid, user }) => {
    const payload = btoa(JSON.stringify({ sub: uid, exp: Math.floor(Date.now() / 1000) + 3600 }));
    localStorage.setItem('sb-gh97-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user }));
  }, { uid, user });

  const layout = async (name) => {
    await page.waitForTimeout(120);
    const measured = await page.evaluate(() => ({
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      controls: [...document.querySelectorAll('button,a,input,select')]
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const box = element.getBoundingClientRect();
          return { text: element.textContent.trim().slice(0, 100), width: box.width, height: box.height, truncated: element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1 };
        }),
    }));
    assert.equal(measured.overflow, 0, name);
    const bad = measured.controls.filter((control) => control.text !== 'Grooming Hub' && (control.width < 44 || control.height < 44 || control.truncated));
    assert.deepEqual(bad, [], `${name}: ${JSON.stringify(bad)}`);
    results.layouts.push({ name, ...measured });
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  };

  await page.goto(`${origin}/u/promotions?origin=history`);
  await page.goto(`${origin}/u/home?case=stay`);
  const beforeUrl = page.url();
  await page.getByRole('button', { name: 'Correggi data' }).click();
  assert.equal(withdrawalCalls, 0);
  await page.getByRole('button', { name: 'No, lasciala' }).click();
  assert.equal(withdrawalCalls, 0);
  await page.getByRole('button', { name: 'Correggi data' }).click();
  await page.getByText('Vuoi ritirare questa richiesta?', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Sì, ritirala' }).click();
  await page.getByText('Richiesta ritirata. Per ora è tutto.', { exact: true }).waitFor();
  const afterUrl = page.url();
  assert.equal(afterUrl, beforeUrl);
  assert.equal(withdrawalCalls, 1);
  assert.equal(await page.getByRole('button', { name: 'Correggi data' }).count(), 0);
  await layout('withdrawn-stay-375');
  await page.goBack();
  assert.equal(new URL(page.url()).pathname, '/u/promotions');
  results.cases.stay = { beforeUrl, afterUrl, canceledCalls: 0, totalCalls: withdrawalCalls, backDestination: '/u/promotions', openRequestVisible: false };

  request = freshRequest();
  mode = 'success';
  await page.goto(`${origin}/u/home?case=optional-rebook`);
  await page.getByRole('button', { name: 'Correggi data' }).click();
  await page.getByRole('button', { name: 'Sì, ritirala' }).click();
  await page.getByRole('button', { name: 'Scegli un’altra data' }).click();
  await page.waitForURL(`**/u/book?petId=${pet.id}`);
  results.cases.optionalRebook = { destination: new URL(page.url()).pathname + new URL(page.url()).search };

  request = freshRequest();
  mode = 'resolved';
  await page.goto(`${origin}/u/home?case=resolved`);
  await page.getByRole('button', { name: 'Correggi data' }).click();
  await page.getByRole('button', { name: 'Sì, ritirala' }).click();
  const friendlyError = await page.getByRole('alert').innerText();
  assert.equal(friendlyError, 'Il salone ha già risposto a questa richiesta. Aggiorna la pagina per vedere cosa è cambiato.');
  results.cases.resolved = { code: '23514', detail: 'GH96_ALREADY_RESOLVED', screenText: friendlyError };

  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({ cases: results.cases, layouts: results.layouts.length, elapsedMs: results.elapsedMs }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
