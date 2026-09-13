import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-91`;
const started = Date.now();
const results = {
  environment: 'Real app and SDK, memory HTTP only, Chromium 375x812 Europe/Rome',
  customer: {},
  dashboard: {},
  requests: {},
  limits: {},
  layouts: [],
  errors: [],
  unexpected: [],
};
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: '/private/tmp/gh91-vite-cache',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh91-memory.invalid'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});

const uid = '91919191-9191-4191-8191-919191919191';
const tid = '91919191-1111-4111-8111-919191919191';
const user = { id: uid, email: 'owner@gh91.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const owner = { id: uid, user_id: uid, tenant_id: tid, first_name: 'Ada', last_name: 'Prova', phone: '+393330000091' };
const pet = {
  id: '91919191-2222-4222-8222-919191919191', tenant_id: tid, customer_id: uid,
  owner_user_id: uid, name: 'Rumba', breed: 'Barboncino', photo_url: null,
  no_show_score: 0, is_blacklisted: false, birth_date: '2022-01-01', customer: owner,
  visits: [], staff_notes: [],
};
const alternatives = [
  { date: '2026-09-15', time: '11:00', time_preference: 'morning' },
  { date: '2026-09-16', time: '10:30', time_preference: 'morning' },
  { date: '2026-09-18', time: '09:00', time_preference: 'morning' },
];
const fresh = ({ round = 1, ageHours = 2 } = {}) => ({
  id: '91919191-3333-4333-8333-919191919191', tenant_id: tid, customer_user_id: uid,
  pet_id: pet.id, service_id: 'service', desired_date: '2026-09-14', time_preference: 'morning',
  coat_condition_codes: [], coat_condition_notes: null, declared_pet_age: null,
  status: 'pending', appointment_id: null,
  staff_responded_at: new Date(Date.now() - ageHours * 60 * 60 * 1000).toISOString(),
  proposed_alternatives: structuredClone(alternatives), alternatives_round: round,
  chosen_date: null, chosen_time: null, chosen_time_preference: null,
  customer_response: null, customer_responded_at: null,
  created_at: '2026-09-13T04:00:00Z', updated_at: '2026-09-13T04:00:00Z',
  service: { id: 'service', name: 'Bagno', duration_minutes: 60 }, appointment: null, pet,
});

let role = 'customer';
let request = fresh();
let includeRequest = true;
let responseError = null;
let respondPayload = null;
let browser;

try {
  await mkdir(out, { recursive: true });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, timezoneId: 'Europe/Rome' });
  await context.addInitScript(() => {
    window.__gh91ToneStarts = 0;
    class FakeAudioContext {
      constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
      resume() { return Promise.resolve(); }
      createOscillator() {
        return { type: '', frequency: { setValueAtTime() {} }, connect() {}, start() { window.__gh91ToneStarts += 1; }, stop() {} };
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
    if (url.origin !== 'https://gh91-memory.invalid') {
      results.unexpected.push(url.origin + url.pathname);
      return route.abort();
    }
    const json = (data, status = 200, headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.pathname === '/auth/v1/user') return json(user);
    if (url.pathname === '/rest/v1/rpc/respond_appointment_request_slot') {
      respondPayload = req.postDataJSON();
      if (responseError) return json(responseError, 400);
      const respondedAt = new Date().toISOString();
      Object.assign(request, {
        chosen_date: respondPayload.p_date,
        chosen_time: respondPayload.p_time,
        chosen_time_preference: respondPayload.p_time_preference,
        customer_response: respondPayload.p_response,
        customer_responded_at: respondedAt,
        desired_date: respondPayload.p_new_desired_date || request.desired_date,
        time_preference: respondPayload.p_new_desired_date ? respondPayload.p_new_time_preference : request.time_preference,
      });
      return json(request);
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
      if (req.method() === 'HEAD') return json([], 200, { 'content-range': '*/0' });
      const table = url.pathname.split('/').at(-1);
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role, created_at: '2026-01-01' }];
      if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { whatsapp_phone: '+393330000091', booking_schedule: { closed_weekdays: ['wednesday'] } } }];
      if (table === 'profiles') data = [{ id: uid, email: user.email, role: role === 'customer' ? 'customer' : 'operator' }];
      if (table === 'customers') data = [owner];
      if (table === 'pets') data = [pet];
      if (table === 'appointment_requests') data = includeRequest ? [structuredClone(request)] : [];
      if (table === 'services') data = [{ id: 'service', tenant_id: tid, name: 'Bagno', duration_minutes: 60, is_active: true }];
      if (table === 'appointments' || table === 'promotions' || table === 'reward_points') data = [];
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
    localStorage.setItem('sb-gh91-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user }));
  }, { uid, user });

  const layout = async (name, fullPage = true) => {
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
    await page.screenshot({ path: `${out}/${name}.png`, fullPage });
  };

  const flowLimits = await page.evaluate(async () => {
    const flow = await import('/src/apps/customer/lib/appointmentRequestFlow.js');
    const now = Date.now();
    return {
      maxDeclineRounds: flow.MAX_ALTERNATIVE_DECLINE_ROUNDS,
      followUpHours: flow.WAITING_CUSTOMER_FOLLOW_UP_HOURS,
      round0: flow.canDeclineAppointmentAlternatives({ alternatives_round: 0 }),
      round1: flow.canDeclineAppointmentAlternatives({ alternatives_round: 1 }),
      round2: flow.canDeclineAppointmentAlternatives({ alternatives_round: 2 }),
      hour47: flow.getWaitingCustomerAge({ staff_responded_at: new Date(now - 47 * 60 * 60 * 1000) }, now).needsFollowUp,
      hour48: flow.getWaitingCustomerAge({ staff_responded_at: new Date(now - 48 * 60 * 60 * 1000) }, now).needsFollowUp,
    };
  });
  assert.deepEqual(flowLimits, { maxDeclineRounds: 1, followUpHours: 48, round0: true, round1: true, round2: false, hour47: false, hour48: true });
  results.limits = flowLimits;

  request = fresh({ round: 1 }); role = 'customer'; respondPayload = null;
  await page.goto(`${origin}/u/home?case=round-one`);
  await page.getByRole('button', { name: 'Nessuna di queste mi va bene' }).click();
  await page.getByText('Quando ti andrebbe bene invece?', { exact: true }).waitFor();
  assert.equal(await page.locator('.gh-desired-date').count(), 12);
  assert.equal(await page.getByRole('button', { name: /mercoledì 16 settembre, Chiuso/ }).isDisabled(), true);
  await page.getByRole('button', { name: /venerdì 18 settembre/ }).click();
  await page.getByRole('button', { name: 'Mattina (9–13)' }).click();
  await layout('customer-decline-date-375');
  await page.getByRole('button', { name: 'Invia la nuova disponibilità' }).click();
  await page.getByText(/Hai indicato venerdì 18 settembre, Mattina/).waitFor();
  assert.deepEqual(respondPayload, {
    p_request_id: request.id, p_response: 'declined', p_date: null, p_time: null,
    p_time_preference: null, p_new_desired_date: '2026-09-18', p_new_time_preference: 'morning',
  });
  results.customer.declineWithDate = { payload: respondPayload, desiredDate: request.desired_date, timePreference: request.time_preference, status: request.status };

  request = fresh({ round: 1 }); const originalDate = request.desired_date; respondPayload = null;
  await page.reload();
  await page.getByRole('button', { name: 'Nessuna di queste mi va bene' }).click();
  await page.getByRole('button', { name: 'Rifiuta senza indicare una data' }).click();
  await page.getByText(/Hai indicato lunedì 14 settembre/).waitFor();
  assert.equal(request.desired_date, originalDate);
  assert.equal(respondPayload.p_new_desired_date, null);
  results.customer.declineWithoutDate = { before: originalDate, after: request.desired_date, payload: respondPayload };

  request = fresh({ round: 1 }); responseError = { code: '22023', message: 'New desired date falls in a declared closure' };
  await page.reload();
  await page.getByRole('button', { name: 'Nessuna di queste mi va bene' }).click();
  await page.getByRole('button', { name: /venerdì 18 settembre/ }).click();
  await page.getByRole('button', { name: 'Invia la nuova disponibilità' }).click();
  const closureText = await page.getByRole('alert').innerText();
  assert.equal(closureText, 'Quel giorno il salone è chiuso. Scegli un’altra data.');
  results.customer.closedDate = { databaseMessage: responseError.message, screenText: closureText };
  responseError = null;

  request = fresh({ round: 2 });
  await page.reload();
  const contact = page.getByRole('link', { name: 'Meglio sentirci' });
  await contact.waitFor();
  assert.equal(await page.getByRole('button', { name: 'Nessuna di queste mi va bene' }).count(), 0);
  const choices = page.locator('button').filter({ hasText: /settembre alle/ });
  assert.equal(await choices.count(), 3);
  for (let index = 0; index < 3; index += 1) assert.equal(await choices.nth(index).isEnabled(), true);
  const contactHref = await contact.getAttribute('href');
  assert.match(contactHref, /wa\.me\/393330000091/);
  await contact.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await layout('customer-round-two-375', false);
  results.customer.roundTwo = { declineButtons: 0, enabledChoices: 3, contactText: await contact.innerText(), contactHref };

  role = 'owner'; request = fresh({ round: 1, ageHours: 2 });
  await page.goto(`${origin}/dashboard?case=recent-wait`);
  await page.getByText('1 persona deve ancora rispondere', { exact: true }).waitFor();
  const recentText = await page.getByText(/Rumba · proposto il/).innerText();
  assert.match(recentText, /da 2 ore/);
  assert.equal(await page.locator('.gh-request-alert__count').count(), 0);
  assert.equal(await page.evaluate(() => window.__gh91ToneStarts), 0);
  await layout('dashboard-waiting-375');
  results.dashboard.recent = { title: '1 persona deve ancora rispondere', row: recentText, badge: 0, toneStarts: 0 };

  request = fresh({ round: 1, ageHours: 50 });
  await page.goto(`${origin}/dashboard?case=late-wait`);
  await page.getByText('1 risposta tarda ad arrivare', { exact: true }).waitFor();
  const lateText = await page.getByText(/Rumba · nessuna risposta/).innerText();
  assert.match(lateText, /da 2 giorni: conviene telefonare/);
  assert.equal(await page.locator('.gh-request-alert__count').count(), 0);
  assert.equal(await page.evaluate(() => window.__gh91ToneStarts), 0);
  await layout('dashboard-follow-up-375');
  results.dashboard.followUp = { title: '1 risposta tarda ad arrivare', row: lateText, badge: 0, toneStarts: 0 };

  request = fresh({ round: 1 });
  Object.assign(request, { desired_date: '2026-09-18', time_preference: 'morning', customer_response: 'declined', customer_responded_at: new Date().toISOString() });
  await page.goto(`${origin}/requests?case=new-date`);
  await page.getByText('Proposte rifiutate', { exact: true }).waitFor();
  const requestCard = await page.locator('.gh-request-card').innerText();
  assert.match(requestCard, /Data desiderata\s+venerdì 18 settembre 2026/i);
  assert.doesNotMatch(requestCard, /lunedì 14 settembre/);
  results.requests.newDate = { stateTag: 'Proposte rifiutate', displayed: 'venerdì 18 settembre', initial: 'lunedì 14 settembre', initialAbsent: true };

  role = 'customer'; includeRequest = false;
  await page.goto(`${origin}/u/book?petId=${pet.id}`);
  await page.getByRole('button', { name: /Rumba/ }).waitFor();
  await page.getByRole('button', { name: /Rumba/ }).click();
  await page.getByRole('button', { name: 'Bagno' }).click();
  await page.getByRole('button', { name: /martedì 15 settembre/ }).click();
  const morning = page.getByRole('button', { name: 'Mattina (9–13)' });
  await morning.click();
  assert.equal(await morning.getAttribute('aria-pressed'), 'true');
  results.customer.bookingReuse = { pet: 'Rumba', service: 'Bagno', date: '2026-09-15', timePreference: 'morning', selected: true };

  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({ customer: results.customer, dashboard: results.dashboard, requests: results.requests, limits: results.limits, layouts: results.layouts.length, elapsedMs: results.elapsedMs }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
