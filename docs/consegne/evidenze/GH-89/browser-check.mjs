import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '/Users/luigimaisto/Desktop/grooming-hub-web/webapp/node_modules/vite/dist/node/index.js';
import react from '/Users/luigimaisto/Desktop/grooming-hub-web/webapp/node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-89`;
const started = Date.now();
const results = { environment: 'Real App and SDK, memory HTTP only, Chromium Europe/Rome', cases: [], layouts: [], errors: [], unexpected: [] };
const server = await createServer({
  root, configFile: false, envDir: false, cacheDir: '/private/tmp/gh89-vite-cache', plugins: [react()],
  define: { 'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh89-memory.invalid'), 'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only') },
  server: { host: '127.0.0.1', port: 0, open: false },
});
let browser;
const uid = '89898989-8989-4898-8989-898989898989';
const tid = '89898989-1111-4111-8111-898989898989';
const user = { id: uid, email: 'owner@gh89.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const owner = { id: uid, user_id: uid, tenant_id: tid, first_name: 'Ada', last_name: 'Prova', phone: '+393330000089' };
const pet = { id: '89898989-2222-4222-8222-898989898989', tenant_id: tid, customer_id: uid, owner_user_id: uid, name: 'Lacky', breed: 'Barboncino', customer: owner };
const timedAlternatives = [
  { date: '2026-10-12', time: '17:30', time_preference: 'afternoon' },
  { date: '2026-10-12', time: '18:00', time_preference: 'afternoon' },
  { date: '2026-10-13', time: '10:00', time_preference: 'morning' },
];
const fresh = () => ({
  id: '89898989-3333-4333-8333-898989898989', tenant_id: tid, customer_user_id: uid,
  pet_id: pet.id, service_id: 'service', desired_date: '2026-10-10', time_preference: 'morning',
  duration_minutes: 60, status: 'pending', created_at: '2026-09-12T09:00:00Z', staff_responded_at: '2026-09-12T10:00:00Z',
  proposed_alternatives: structuredClone(timedAlternatives), customer_response: null, customer_responded_at: null,
  chosen_date: null, chosen_time: null, chosen_time_preference: null, coat_condition_codes: [], pet,
  service: { id: 'service', name: 'Bagno', duration_minutes: 60 },
});
const dayAppointments = [
  ...Array.from({ length: 3 }, (_, index) => ({ id: `full-${index}`, scheduled_at: '2026-10-12T14:30:00Z', duration_minutes: 60, status: 'scheduled', approval_status: 'approved' })),
  { id: 'light', scheduled_at: '2026-10-13T08:00:00Z', duration_minutes: 60, status: 'scheduled', approval_status: 'approved' },
];
let request = fresh();
let role = 'owner';
let responseError = null;
let capacityRace = false;
let respondPayload = null;
let proposePayload = null;
const appointmentReadDates = [];

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
    if (url.origin !== 'https://gh89-memory.invalid') { results.unexpected.push(url.origin + url.pathname); return route.abort(); }
    const json = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.pathname === '/auth/v1/user') return json(user);
    if (url.pathname === '/rest/v1/rpc/respond_appointment_request_slot') {
      respondPayload = req.postDataJSON();
      if (responseError) return json(responseError, 400);
      Object.assign(request, {
        customer_response: respondPayload.p_response,
        customer_responded_at: new Date().toISOString(),
        chosen_date: respondPayload.p_date,
        chosen_time: respondPayload.p_time,
        chosen_time_preference: respondPayload.p_time_preference,
      });
      return json(request);
    }
    if (url.pathname === '/rest/v1/rpc/propose_appointment_request_alternatives') {
      proposePayload = req.postDataJSON();
      Object.assign(request, { proposed_alternatives: proposePayload.p_alternatives, staff_responded_at: new Date().toISOString(), customer_response: null, customer_responded_at: null, chosen_date: null, chosen_time: null, chosen_time_preference: null });
      return json(request);
    }
    if (url.pathname === '/rest/v1/rpc/resolve_appointment_request_local') {
      if (capacityRace) return json({ message: 'Le postazioni sono tutte occupate nella fascia scelta.', details: 'GH37_APPOINTMENT_CAPACITY' }, 400);
      return json(request);
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
      if (req.method() === 'HEAD') return route.fulfill({ status: 200, headers: { 'content-range': '*/0' }, body: '' });
      const table = url.pathname.split('/').at(-1);
      const select = url.searchParams.get('select') || '';
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role, created_at: '2026-01-01' }];
      if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { workstation_capacity: 3, booking_schedule: {} } }];
      if (table === 'profiles') data = [{ id: uid, email: user.email, role: role === 'customer' ? 'customer' : 'operator' }];
      if (table === 'customers') data = [owner];
      if (table === 'pets') data = [pet];
      if (table === 'appointment_requests') data = [structuredClone(request)];
      if (table === 'appointments' && select === 'id,scheduled_at,duration_minutes,status,approval_status') {
        const date = new Date(url.searchParams.get('scheduled_at')?.replace('gte.', '') || 0).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
        appointmentReadDates.push(date);
        data = dayAppointments.filter((appointment) => new Date(appointment.scheduled_at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }) === date);
      }
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
  await page.evaluate(({ uid, user }) => localStorage.setItem('sb-gh89-memory-auth-token', JSON.stringify({ access_token: `e30.${btoa(JSON.stringify({ sub: uid, exp: Math.floor(Date.now() / 1000) + 3600 }))}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user })), { uid, user });

  const layout = async (name) => {
    await page.waitForLoadState('networkidle');
    const measured = await page.evaluate(() => ({
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      controls: [...document.querySelectorAll('button,a,input,select')].filter((element) => element.getClientRects().length).map((element) => {
        const box = element.getBoundingClientRect();
        return { text: element.textContent.trim().slice(0, 100), width: box.width, height: box.height, truncated: element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1 };
      }),
    }));
    assert.equal(measured.overflow, 0, name);
    const bad = measured.controls.filter((control) => control.text !== 'Grooming Hub' && (control.width < 44 || control.height < 44 || control.truncated));
    assert.deepEqual(bad, [], `${name}: ${JSON.stringify(bad)}`);
    results.layouts.push({ name, ...measured });
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  };

  await page.goto(`${origin}/requests`);
  await page.getByRole('button', { name: 'Proponi alternative' }).waitFor();
  assert.equal(appointmentReadDates.length, 0);
  await page.getByRole('button', { name: 'Proponi alternative' }).click();
  const dialog = page.getByRole('dialog');
  assert.equal(await dialog.getByText(/postazioni occupate/).count(), 0);
  const dates = dialog.locator('input[type=date]');
  const times = dialog.locator('input[type=time]');
  await dates.nth(0).fill('2026-10-12');
  await times.nth(0).fill('16:30');
  await dialog.getByText('3/3', { exact: true }).waitFor();
  const calendarLoad = await page.evaluate(async (appointments) => {
    const capacity = await import('/src/shared/tenant/workstationCapacity.js');
    const schedule = await import('/src/shared/tenant/bookingSchedule.js');
    const load = capacity.getAppointmentWindowLoad({ appointments, date: '2026-10-12', window: schedule.getBookingTimeWindowForTime('16:30'), capacity: 3 });
    return `${load.occupied}/${load.capacity}`;
  }, dayAppointments);
  assert.equal(calendarLoad, '3/3');
  await dialog.getByRole('button', { name: 'Usa le 17:30' }).click();
  assert.equal(await times.nth(0).inputValue(), '17:30');
  await dialog.getByText('0/3', { exact: true }).waitFor();
  await dates.nth(1).fill('2026-10-12');
  await times.nth(1).fill('18:00');
  await dialog.getByRole('button', { name: 'Aggiungi terza alternativa' }).click();
  await dates.nth(2).fill('2026-10-13');
  await times.nth(2).fill('10:00');
  await dialog.getByText('1/3', { exact: true }).waitFor();
  assert.deepEqual(appointmentReadDates, ['2026-10-12', '2026-10-13']);
  const readsBeforeTimeChange = appointmentReadDates.length;
  await times.nth(1).fill('18:15');
  await page.waitForTimeout(50);
  assert.equal(appointmentReadDates.length, readsBeforeTimeChange);
  await times.nth(1).fill('18:00');
  await layout('staff-alternatives-375');
  await dialog.getByRole('button', { name: 'Registra e prepara WhatsApp' }).click();
  await page.getByText('Alternative registrate. La richiesta resta in attesa della scelta nell’app.', { exact: true }).waitFor();
  assert.deepEqual(proposePayload.p_alternatives, [
    { date: '2026-10-12', time: '17:30', time_preference: 'afternoon' },
    { date: '2026-10-12', time: '18:00', time_preference: 'afternoon' },
    { date: '2026-10-13', time: '10:00', time_preference: 'morning' },
  ]);
  const waText = await page.getByText(/purtroppo sabato 10 ottobre/).innerText();
  assert.equal(waText, "Ciao Ada Prova, purtroppo sabato 10 ottobre siamo pieni. Per Lacky avremmo lunedì 12 ottobre alle 17:30, lunedì 12 ottobre alle 18:00 oppure martedì 13 ottobre alle 10:00. Scegli nella tua area l'orario che preferisci: poi ti confermiamo l'appuntamento.");
  results.cases.push({ name: 'Three timed alternatives, two same date; preference derived; reads cached', reads: appointmentReadDates.slice(), calendarLoad, modalLoad: '3/3 at 16:30; 0/3 at suggested 17:30', payload: proposePayload.p_alternatives, whatsapp: waText, pass: true });

  role = 'customer';
  await page.goto(`${origin}/u/home`);
  await page.getByRole('button', { name: 'lunedì 12 ottobre alle 17:30' }).click();
  await page.getByText("Hai scelto lunedì 12 ottobre alle 17:30. Ora tocca al salone confermare l'appuntamento.", { exact: true }).waitFor();
  assert.deepEqual(respondPayload, { p_request_id: request.id, p_response: 'accepted', p_date: '2026-10-12', p_time: '17:30', p_time_preference: 'afternoon' });
  assert.equal(request.status, 'pending');
  await layout('customer-timed-choice-375');
  results.cases.push({ name: 'Customer accepts exact time; request remains pending', payload: respondPayload, status: request.status, pass: true });

  request = fresh();
  request.proposed_alternatives = [{ date: '2026-10-12', time_preference: 'morning' }, { date: '2026-10-13', time_preference: 'afternoon' }];
  await page.reload();
  await page.getByRole('button', { name: /lunedì 12 ottobre, Mattina/ }).click();
  await page.getByText(/Hai scelto lunedì 12 ottobre, Mattina/).waitFor();
  assert.equal(respondPayload.p_time, null);
  assert.equal(respondPayload.p_time_preference, 'morning');
  await page.getByRole('button', { name: 'Cambia risposta' }).click();
  await page.getByRole('button', { name: 'Nessuna di queste mi va bene' }).click();
  await page.getByText(/Hai risposto che nessuna/).waitFor();
  assert.equal(respondPayload.p_response, 'declined');
  assert.equal(request.status, 'pending');
  results.cases.push({ name: 'Legacy untimed proposal and decline remain supported', legacyTime: null, declinedStatus: request.status, pass: true });

  request = fresh();
  responseError = { code: '22023', message: 'Chosen slot was not proposed' };
  await page.reload();
  await page.getByRole('button', { name: 'lunedì 12 ottobre alle 17:30' }).click();
  const gentleError = await page.getByRole('alert').innerText();
  assert.equal(gentleError, 'Questa alternativa non è più disponibile. Aggiorna le proposte e riprova.');
  results.cases.push({ name: 'Unproposed slot returns non-technical customer message', text: gentleError, pass: true });
  responseError = null;

  role = 'owner';
  request = fresh();
  Object.assign(request, { customer_response: 'accepted', customer_responded_at: '2026-09-13T11:00:00Z', chosen_date: '2026-10-13', chosen_time: '10:00:00', chosen_time_preference: 'morning' });
  appointmentReadDates.length = 0;
  await page.goto(`${origin}/requests`);
  await page.getByRole('button', { name: 'Conferma', exact: true }).click();
  const approval = page.getByRole('dialog');
  assert.equal(await approval.locator('input[type=date]').inputValue(), '2026-10-13');
  assert.equal(await approval.locator('input[type=time]').inputValue(), '10:00');
  await approval.getByText('1/3', { exact: true }).waitFor();
  assert.deepEqual(appointmentReadDates, ['2026-10-13']);
  await approval.locator('input[type=date]').fill('2026-10-12');
  await approval.locator('input[type=time]').fill('16:30');
  await approval.getByRole('button', { name: 'Usa le 17:30' }).waitFor();
  await approval.getByRole('button', { name: 'Usa le 17:30' }).click();
  assert.equal(await approval.locator('input[type=time]').inputValue(), '17:30');
  await approval.locator('input[type=date]').fill('2026-10-13');
  await approval.locator('input[type=time]').fill('11:00');
  await approval.getByText('0/3', { exact: true }).waitFor();
  capacityRace = true;
  await approval.getByRole('button', { name: 'Conferma e prepara WhatsApp' }).click();
  const raceText = await approval.getByRole('alert').innerText();
  assert.equal(raceText, 'Nel frattempo quell’orario si è riempito. Scegli un altro orario e riprova.');
  await layout('staff-approval-race-375');
  results.cases.push({ name: 'Approval starts from chosen date/time; capacity race stays in modal', date: '2026-10-13', time: '10:00', text: raceText, pass: true });

  await approval.getByRole('button', { name: 'Annulla' }).click();
  await page.getByRole('button', { name: 'Proponi alternative' }).click();
  const invalidDialog = page.getByRole('dialog');
  await invalidDialog.locator('input[type=date]').nth(0).fill('2026-10-12');
  await invalidDialog.locator('input[type=time]').nth(0).fill('20:00');
  await invalidDialog.locator('input[type=date]').nth(1).fill('2026-10-13');
  await invalidDialog.locator('input[type=time]').nth(1).fill('10:00');
  await invalidDialog.getByRole('button', { name: 'Registra e prepara WhatsApp' }).click();
  const invalidText = await invalidDialog.getByText('Ogni alternativa deve avere una data e un’ora fra le fasce di apertura: 09:00–19:00.', { exact: true }).innerText();
  await layout('staff-invalid-time-375');
  results.cases.push({ name: 'Invalid time is blocked; inconsistent preference has no input and is derived', text: invalidText, derivedExample: { time: '17:30', time_preference: 'afternoon' }, pass: true });

  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({ cases: results.cases.length, layouts: results.layouts.length, reads: appointmentReadDates, elapsedMs: results.elapsedMs }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
