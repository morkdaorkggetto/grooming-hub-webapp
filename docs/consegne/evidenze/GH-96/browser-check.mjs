import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-96`;
const started = Date.now();
const results = { customer: {}, staff: {}, layouts: [], errors: [], unexpected: [] };
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: '/private/tmp/gh96-vite-cache',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh96-memory.invalid'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});

const uid = '96969696-9696-4969-8969-969696969696';
const tid = '96969696-1111-4111-8111-969696969696';
const user = { id: uid, email: 'owner@gh96.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const owner = { id: uid, user_id: uid, tenant_id: tid, first_name: 'Ada', last_name: 'Prova', phone: '+393330000096' };
const pet = {
  id: '96969696-2222-4222-8222-969696969696', tenant_id: tid, customer_id: uid,
  owner_user_id: uid, name: 'Rumba', breed: 'Barboncino', photo_url: null,
  birth_date: '2022-01-01', customer: owner, visits: [], staff_notes: [],
};
const service = { id: '96969696-5555-4555-8555-969696969696', tenant_id: tid, name: 'Bagno', duration_minutes: 60, is_active: true };
const makeRequest = (overrides = {}) => ({
  id: '96969696-3333-4333-8333-969696969696', tenant_id: tid, customer_user_id: uid,
  pet_id: pet.id, service_id: service.id, desired_date: '2026-09-21', time_preference: 'morning',
  coat_condition_codes: [], coat_condition_notes: null, declared_pet_age: null,
  status: 'pending', appointment_id: null, withdrawn_at: null, staff_responded_at: null,
  proposed_alternatives: null, alternatives_round: 0, chosen_date: null, chosen_time: null,
  chosen_time_preference: null, customer_response: null, customer_responded_at: null,
  created_at: '2026-09-19T07:00:00Z', updated_at: '2026-09-19T07:00:00Z',
  service, appointment: null, pet,
  ...overrides,
});
const openRequest = makeRequest();
const withdrawnRequest = makeRequest({
  id: '96969696-4444-4444-8444-969696969696',
  pet: { ...pet, id: '96969696-7777-4777-8777-969696969696', name: 'Moka' },
  pet_id: '96969696-7777-4777-8777-969696969696',
  status: 'withdrawn', withdrawn_at: '2026-09-19T08:15:00Z',
});
const appointment = {
  id: '96969696-6666-4666-8666-969696969696', tenant_id: tid, pet_id: pet.id,
  scheduled_at: '2026-09-22T08:00:00Z', duration_minutes: 60, status: 'scheduled',
  approval_status: 'approved', appointment_source: 'customer', notes: null,
  service, pet,
};

let role = 'customer';
let customerRequest = makeRequest();
let pendingRows = [openRequest];
let showAppointment = false;
let withdrawalMode = 'success';
let withdrawalCalls = 0;
let browser;

try {
  await mkdir(out, { recursive: true });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, timezoneId: 'Europe/Rome' });
  await context.addInitScript(() => {
    window.__gh96ToneStarts = 0;
    class FakeAudioContext {
      constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
      resume() { return Promise.resolve(); }
      createOscillator() {
        return { type: '', frequency: { setValueAtTime() {} }, connect() {}, start() { window.__gh96ToneStarts += 1; }, stop() {} };
      }
      createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
    }
    window.AudioContext = FakeAudioContext;
  });
  await context.routeWebSocket('**/*', (socket) => socket.close());
  await context.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === origin) return route.continue();
    if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ body: '' });
    if (url.origin !== 'https://gh96-memory.invalid') {
      results.unexpected.push(url.origin + url.pathname);
      return route.abort();
    }
    const json = (data, status = 200, headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.pathname === '/auth/v1/user') return json(user);
    if (url.pathname === '/rest/v1/rpc/withdraw_appointment_request') {
      withdrawalCalls += 1;
      if (withdrawalMode === 'resolved') return json({ code: '23514', details: 'GH96_ALREADY_RESOLVED', message: 'Appointment request already resolved' }, 400);
      customerRequest = { ...customerRequest, status: 'withdrawn', withdrawn_at: '2026-09-19T09:00:00Z' };
      return json(customerRequest);
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
      if (req.method() === 'HEAD') return json([], 200, { 'content-range': '*/0' });
      const table = url.pathname.split('/').at(-1);
      const statusFilter = url.searchParams.get('status') || '';
      const select = url.searchParams.get('select') || '';
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role, created_at: '2026-01-01' }];
      if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { whatsapp_phone: '+393330000096', booking_schedule: {} } }];
      if (table === 'profiles') data = [{ id: uid, email: user.email, role: role === 'customer' ? 'customer' : 'operator' }];
      if (table === 'customers') data = [owner];
      if (table === 'pets') data = role === 'customer' ? [pet] : [pet, withdrawnRequest.pet];
      if (table === 'services') data = [service];
      if (table === 'appointment_requests') {
        if (role === 'customer') data = customerRequest.status === 'pending' ? [structuredClone(customerRequest)] : [];
        else if (statusFilter.includes('withdrawn')) data = [structuredClone(withdrawnRequest)];
        else data = structuredClone(pendingRows);
      }
      if (table === 'appointments') data = role === 'customer' && showAppointment ? [appointment] : [];
      if (['visits', 'promotions', 'reward_points'].includes(table)) data = [];
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
    localStorage.setItem('sb-gh96-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user }));
  }, { uid, user });

  const layout = async (name) => {
    await page.waitForTimeout(120);
    const measured = await page.evaluate(() => ({
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      controls: [...document.querySelectorAll('button,a,input,select')]
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            text: element.textContent.trim().slice(0, 100), width: box.width, height: box.height,
            truncated: element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1,
          };
        }),
    }));
    assert.equal(measured.overflow, 0, name);
    const bad = measured.controls.filter((control) => control.text !== 'Grooming Hub' && (control.width < 44 || control.height < 44 || control.truncated));
    assert.deepEqual(bad, [], `${name}: ${JSON.stringify(bad)}`);
    results.layouts.push({ name, ...measured });
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  };

  await page.goto(`${origin}/u/home`);
  await page.getByText('Puoi ancora correggerla: appena ti rispondiamo, l’orario è fissato.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Correggi data' }).click();
  await page.getByText('Vuoi ritirare questa richiesta? Potrai sceglierne subito una nuova.', { exact: true }).waitFor();
  assert.equal(withdrawalCalls, 0);
  await page.getByRole('button', { name: 'No, lasciala' }).click();
  assert.equal(withdrawalCalls, 0);
  await page.getByRole('button', { name: 'Correggi data' }).click();
  await layout('customer-confirm-375');
  await page.getByRole('button', { name: 'Sì, ritirala' }).click();
  await page.waitForURL(`**/u/book?petId=${pet.id}`);
  assert.equal(withdrawalCalls, 1);
  await page.getByRole('button', { name: /Rumba/ }).waitFor();
  results.customer.withdraw = { confirmations: 1, canceledCalls: 0, totalCalls: withdrawalCalls, destination: new URL(page.url()).pathname + new URL(page.url()).search };
  await layout('customer-rebook-375');

  customerRequest = makeRequest();
  withdrawalMode = 'resolved';
  await page.goto(`${origin}/u/home?case=resolved`);
  await page.getByRole('button', { name: 'Correggi data' }).click();
  await page.getByRole('button', { name: 'Sì, ritirala' }).click();
  const friendlyError = await page.getByRole('alert').innerText();
  assert.equal(friendlyError, 'Il salone ha già risposto a questa richiesta. Aggiorna la pagina per vedere cosa è cambiato.');
  results.customer.resolved = { databaseCode: '23514', databaseDetail: 'GH96_ALREADY_RESOLVED', screenText: friendlyError };

  customerRequest = makeRequest({ status: 'withdrawn', withdrawn_at: '2026-09-19T09:00:00Z' });
  showAppointment = true;
  await page.goto(`${origin}/u/home?case=confirmed`);
  const confirmedText = 'Se non riesci più a venire, scrivici il prima possibile: proviamo a dare il posto a qualcun altro.';
  await page.getByText(confirmedText, { exact: true }).waitFor();
  const whatsapp = page.getByRole('link', { name: 'Scrivici su WhatsApp' });
  const whatsappHref = await whatsapp.getAttribute('href');
  assert.match(whatsappHref, /wa\.me\/393330000096/);
  assert.match(new URL(whatsappHref).searchParams.get('text'), /Non riesco più a venire all’appuntamento di Rumba/);
  assert.equal(await page.getByRole('button', { name: /disdici|annulla/i }).count(), 0);
  results.customer.confirmed = { text: confirmedText, whatsappHref, appCancellationControls: 0 };
  await layout('customer-confirmed-375');

  role = 'owner';
  showAppointment = false;
  pendingRows = [openRequest];
  await page.goto(`${origin}/requests`);
  await page.getByText('Ritirata', { exact: true }).waitFor();
  const stats = await page.locator('.gh-stat-strip').innerText();
  assert.match(stats, /DA GESTIRE\s+1/);
  const withdrawnCard = page.locator('.gh-request-card').filter({ hasText: 'Moka' });
  assert.match(await withdrawnCard.innerText(), /Ritirata il/);
  assert.equal(await withdrawnCard.locator('button').count(), 0);
  results.staff.requests = { visibleDays: 5, marker: 'Ritirata', stats: stats.replace(/\s+/g, ' ').trim(), actionButtons: 0 };
  await layout('staff-withdrawn-375');

  await page.goto(`${origin}/dashboard?case=before`);
  await page.getByText('1 da gestire', { exact: true }).waitFor();
  const before = { badge: await page.locator('.gh-request-alert__count').count(), tones: await page.evaluate(() => window.__gh96ToneStarts) };
  pendingRows = [];
  await page.goto(`${origin}/dashboard?case=after`);
  await page.getByText('0 da gestire', { exact: true }).waitFor();
  const after = { badge: await page.locator('.gh-request-alert__count').count(), tones: await page.evaluate(() => window.__gh96ToneStarts) };
  assert(after.badge <= before.badge);
  assert.equal(after.tones, before.tones);
  results.staff.alerts = { before, after };

  const allCopy = await page.locator('body').innerText();
  assert.doesNotMatch(allCopy, /altrimenti|penale|conseguenz/i);
  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({ customer: results.customer, staff: results.staff, layouts: results.layouts.length, elapsedMs: results.elapsedMs }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
