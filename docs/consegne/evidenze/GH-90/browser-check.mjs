import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '/Users/luigimaisto/Desktop/grooming-hub-web/webapp/node_modules/vite/dist/node/index.js';
import react from '/Users/luigimaisto/Desktop/grooming-hub-web/webapp/node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-90`;
const started = Date.now();
const results = {
  environment: 'Real app and SDK, memory HTTP only, Chromium Europe/Rome',
  states: {},
  dashboard: {},
  alerts: {},
  requests: {},
  layouts: [],
  errors: [],
  unexpected: [],
};
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: '/private/tmp/gh90-vite-cache',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh90-memory.invalid'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});

const uid = '90909090-9090-4090-8090-909090909090';
const tid = '90909090-1111-4111-8111-909090909090';
const user = { id: uid, email: 'owner@gh90.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const owner = { id: uid, user_id: uid, tenant_id: tid, first_name: 'Ada', last_name: 'Prova', phone: '+393330000090' };
const alternatives = [
  { date: '2026-09-17', time: '17:30', time_preference: 'afternoon' },
  { date: '2026-09-18', time: '16:00', time_preference: 'afternoon' },
];
const petFor = (name, suffix) => ({
  id: `90909090-2222-4222-8222-90909090${suffix}`,
  tenant_id: tid,
  customer_id: uid,
  owner_user_id: uid,
  name,
  breed: 'Barboncino',
  photo_url: null,
  no_show_score: 0,
  is_blacklisted: false,
  birth_date: '2022-01-01',
  customer: owner,
  staff_notes: [],
  visits: [],
});
const structured = (kind, name = 'Rumba', suffix = '01') => {
  const common = {
    id: `90909090-3333-4333-8333-90909090${suffix}`,
    tenant_id: tid,
    customer_user_id: uid,
    pet_id: petFor(name, suffix).id,
    service_id: 'service',
    desired_date: '2026-09-15',
    time_preference: 'afternoon',
    coat_condition_codes: [],
    coat_condition_notes: null,
    declared_pet_age: null,
    status: 'pending',
    appointment_id: null,
    staff_responded_at: null,
    proposed_alternatives: null,
    chosen_date: null,
    chosen_time: null,
    chosen_time_preference: null,
    customer_response: null,
    customer_responded_at: null,
    created_at: '2026-09-13T04:00:00Z',
    updated_at: '2026-09-13T04:00:00Z',
    service: { id: 'service', name: 'Bagno', duration_minutes: 60 },
    appointment: null,
    pet: petFor(name, suffix),
  };
  if (kind === 'waiting') return { ...common, staff_responded_at: '2026-09-13T05:00:00Z', proposed_alternatives: structuredClone(alternatives) };
  if (kind === 'chosen') return {
    ...common,
    staff_responded_at: '2026-09-13T05:00:00Z',
    proposed_alternatives: structuredClone(alternatives),
    chosen_date: '2026-09-17',
    chosen_time: '17:30:00',
    chosen_time_preference: 'afternoon',
    customer_response: 'accepted',
    customer_responded_at: '2026-09-13T05:01:00Z',
  };
  if (kind === 'declined') return {
    ...common,
    staff_responded_at: '2026-09-13T05:00:00Z',
    proposed_alternatives: structuredClone(alternatives),
    customer_response: 'declined',
    customer_responded_at: '2026-09-13T05:01:00Z',
  };
  if (kind === 'second-round') return {
    ...common,
    staff_responded_at: '2026-09-13T05:02:00Z',
    proposed_alternatives: [{ date: '2026-09-19', time: '10:00', time_preference: 'morning' }, ...structuredClone(alternatives)],
    chosen_date: '2026-09-17',
    chosen_time: '17:30:00',
    chosen_time_preference: 'afternoon',
    customer_response: 'accepted',
    customer_responded_at: '2026-09-13T05:01:00Z',
  };
  return common;
};
const legacy = {
  id: '90909090-4444-4444-8444-909090909090',
  tenant_id: tid,
  pet_id: petFor('Lillo', '05').id,
  scheduled_at: '2026-09-16T08:00:00Z',
  duration_minutes: 60,
  status: 'scheduled',
  approval_status: 'pending',
  appointment_source: 'customer',
  notes: null,
  created_at: '2026-09-13T04:00:00Z',
  pet: petFor('Lillo', '05'),
};

let rows = [structured('new')];
let legacyRows = [];
let browser;

try {
  await mkdir(out, { recursive: true });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, timezoneId: 'Europe/Rome' });
  await context.addInitScript(() => {
    window.__gh90ToneStarts = 0;
    const nativeSetInterval = window.setInterval.bind(window);
    window.setInterval = (callback, delay, ...args) => nativeSetInterval(
      callback,
      location.search.includes('case=sound') ? Math.min(delay, 80) : delay,
      ...args
    );
    class FakeAudioContext {
      constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
      resume() { this.state = 'running'; return Promise.resolve(); }
      createOscillator() {
        return { type: '', frequency: { setValueAtTime() {} }, connect() {}, start() { window.__gh90ToneStarts += 1; }, stop() {} };
      }
      createGain() {
        return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
      }
    }
    window.AudioContext = FakeAudioContext;
  });
  await context.routeWebSocket('**/*', (socket) => socket.close());
  await context.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === origin) return route.continue();
    if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ body: '' });
    if (url.origin !== 'https://gh90-memory.invalid') {
      results.unexpected.push(url.origin + url.pathname);
      return route.abort();
    }
    const json = (data, status = 200, headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.pathname === '/auth/v1/user') return json(user);
    if (url.pathname.startsWith('/rest/v1/')) {
      assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
      if (req.method() === 'HEAD') return json([], 200, { 'content-range': '*/0' });
      const table = url.pathname.split('/').at(-1);
      const select = url.searchParams.get('select') || '';
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role: 'owner', created_at: '2026-01-01' }];
      if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { workstation_capacity: 2, booking_schedule: {} } }];
      if (table === 'profiles') data = [{ id: uid, email: user.email, role: 'operator' }];
      if (table === 'pets') data = [petFor('Archivio', '99')];
      if (table === 'appointment_requests') data = structuredClone(rows);
      if (table === 'appointments' && select.includes('appointment_source')) data = structuredClone(legacyRows);
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
    localStorage.setItem('sb-gh90-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user }));
  }, { uid, user });

  const layout = async (name) => {
    await page.waitForTimeout(120);
    const measured = await page.evaluate(() => {
      const copy = document.querySelector('.gh-hero__copy')?.getBoundingClientRect();
      const right = document.querySelector('.gh-hero__right')?.getBoundingClientRect();
      return {
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      hero: copy && right ? {
        copy: { left: copy.left, right: copy.right, width: copy.width },
        right: { left: right.left, right: right.right, width: right.width },
        overlap: Math.max(0, Math.min(copy.right, right.right) - Math.max(copy.left, right.left)),
      } : null,
      controls: [...document.querySelectorAll('button,a,input,select')]
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            text: element.textContent.trim().slice(0, 100),
            width: box.width,
            height: box.height,
            truncated: element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1,
          };
        }),
      };
    });
    assert.equal(measured.overflow, 0, name);
    if (measured.hero) assert.equal(measured.hero.overlap, 0, `${name}: hero overlap`);
    const bad = measured.controls.filter((control) => control.text !== 'Grooming Hub' && (control.width < 44 || control.height < 44 || control.truncated));
    assert.deepEqual(bad, [], `${name}: ${JSON.stringify(bad)}`);
    results.layouts.push({ name, ...measured });
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  };

  await page.goto(`${origin}/dashboard`);
  const pure = await page.evaluate(async ({ newRequest, waiting, chosen, declined, secondRound }) => {
    const database = await import('/src/apps/staff/lib/database.js');
    const classify = (request) => database.getAppointmentRequestStaffAction(request);
    return {
      newRequest: classify({ ...newRequest, request_kind: 'structured' }),
      waiting: classify({ ...waiting, request_kind: 'structured' }),
      chosen: classify({ ...chosen, request_kind: 'structured' }),
      declined: classify({ ...declined, request_kind: 'structured' }),
      secondRound: classify({ ...secondRound, request_kind: 'structured' }),
      legacy: classify({ request_kind: 'legacy' }),
    };
  }, {
    newRequest: structured('new'),
    waiting: structured('waiting'),
    chosen: structured('chosen'),
    declined: structured('declined'),
    secondRound: structured('second-round'),
  });
  assert.deepEqual(pure, {
    newRequest: 'needs_response',
    waiting: 'waiting_customer',
    chosen: 'needs_booking',
    declined: 'needs_response',
    secondRound: 'waiting_customer',
    legacy: 'needs_response',
  });
  results.states = pure;

  const dashboardCase = async (name, requestRows, expected) => {
    rows = requestRows;
    legacyRows = [];
    await page.goto(`${origin}/dashboard?case=${name}`);
    await page.getByRole('heading', { name: 'Dashboard clienti' }).waitFor();
    await page.getByText(expected.metric, { exact: true }).waitFor();
    const panel = page.locator('.gh-dashboard-pending');
    assert.equal(await panel.count(), expected.panel ? 1 : 0);
    if (expected.panel) {
      await panel.getByText(expected.title, { exact: true }).waitFor();
      await panel.getByText(expected.detail, { exact: true }).waitFor();
    }
    const badge = page.locator('.gh-request-alert__count');
    assert.equal(await badge.count(), expected.badge ? 1 : 0);
    if (expected.badge) assert.equal((await badge.innerText()).trim(), String(expected.badge));
    results.dashboard[name] = { ...expected, panelVisible: Boolean(await panel.count()) };
    await layout(`dashboard-${name}-375`);
  };

  await dashboardCase('new', [structured('new')], {
    metric: '1 da gestire', badge: 1, panel: true,
    title: '1 richiesta a cui rispondere', detail: 'Rumba · 15/09 · da rispondere',
  });
  await dashboardCase('waiting', [structured('waiting')], {
    metric: '0 da gestire · 1 in attesa della persona', badge: 0, panel: false,
  });
  await dashboardCase('chosen', [structured('chosen')], {
    metric: '1 da gestire', badge: 1, panel: true,
    title: '1 richiesta da prenotare', detail: 'Rumba · 17/09 alle 17:30 · da prenotare',
  });
  await dashboardCase('declined', [structured('declined')], {
    metric: '1 da gestire', badge: 1, panel: true,
    title: '1 richiesta a cui rispondere', detail: 'Rumba · proposte rifiutate · da rispondere',
  });
  assert.equal((await page.locator('.gh-dashboard-pending').innerText()).includes('15/09'), false);

  rows = [structured('new', 'Nuova', '11'), structured('waiting', 'Attesa', '12'), structured('chosen', 'Scelta', '13')];
  await page.goto(`${origin}/requests?case=all-three`);
  await page.getByRole('heading', { name: 'Nuova' }).waitFor();
  const cards = page.locator('.gh-request-card');
  assert.equal(await cards.count(), 3);
  assert.equal(await page.getByText('Da rispondere', { exact: true }).count(), 1);
  assert.equal(await page.getByText('In attesa della persona', { exact: true }).count(), 1);
  assert.equal(await page.getByText('Da prenotare', { exact: true }).count(), 2);
  assert.equal((await page.locator('.gh-request-alert__count').innerText()).trim(), '2');
  const stats = await page.locator('.gh-stat-strip').innerText();
  assert.match(stats, /DA GESTIRE\s+2/);
  assert.match(stats, /DA PRENOTARE\s+1/);
  assert.match(stats, /IN ATTESA PERSONA\s+1/);
  results.requests.allThree = { screen: 3, sourceRows: 3, badge: 2, quickCount: 2, labels: ['Da rispondere', 'In attesa della persona', 'Da prenotare'] };
  await layout('requests-three-states-375');

  rows = [];
  legacyRows = [legacy];
  await page.goto(`${origin}/requests?case=legacy`);
  await page.getByRole('heading', { name: 'Lillo' }).waitFor();
  await page.getByText('Da rispondere', { exact: true }).waitFor();
  results.requests.legacy = { state: 'needs_response', screenCount: await page.locator('.gh-request-card').count() };

  rows = [structured('second-round')];
  legacyRows = [];
  await page.goto(`${origin}/requests?case=second-round`);
  await page.getByText('In attesa della persona', { exact: true }).waitFor();
  assert.equal(await page.locator('.gh-request-alert__count').count(), 0);
  results.requests.secondRound = { state: 'waiting_customer', badge: 0 };

  rows = [structured('new')];
  await page.goto(`${origin}/dashboard?case=sound`);
  await page.locator('.gh-request-alert__count').waitFor();
  await page.locator('body').click({ position: { x: 10, y: 200 } });
  assert.equal(await page.evaluate(() => window.__gh90ToneStarts), 0);
  rows = [structured('waiting')];
  await page.locator('.gh-request-alert__count').waitFor({ state: 'detached' });
  await page.waitForTimeout(180);
  const afterProposal = await page.evaluate(() => window.__gh90ToneStarts);
  assert.equal(afterProposal, 0);
  rows = [structured('chosen')];
  await page.locator('.gh-request-alert__count').waitFor();
  await page.waitForFunction(() => window.__gh90ToneStarts === 2);
  const afterChoice = await page.evaluate(() => window.__gh90ToneStarts);
  assert.equal(afterChoice, 2);
  results.alerts = {
    initialLoadTones: 0,
    afterStaffProposal: { count: 0, toneStarts: afterProposal },
    afterCustomerChoice: { count: 1, toneStarts: afterChoice },
    mechanism: 'same two-oscillator sound; only actionable key set changed',
  };

  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({ states: results.states, dashboards: Object.keys(results.dashboard).length, layouts: results.layouts.length, alerts: results.alerts, elapsedMs: results.elapsedMs }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
