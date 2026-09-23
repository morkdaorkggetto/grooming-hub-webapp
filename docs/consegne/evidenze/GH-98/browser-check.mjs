import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-98`;
const started = Date.now();
const results = { dates: {}, saves: {}, queue: {}, unfinishedPet: {}, layouts: [], errors: [], unexpected: [] };
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: '/private/tmp/gh98-vite-cache',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh98-memory.invalid'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify('false'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});

const uid = '98989898-9898-4989-8989-989898989898';
const tid = '98989898-1111-4111-8111-989898989898';
const user = { id: uid, email: 'staff@gh98.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const customer = { id: 'customer-gh98', user_id: null, first_name: 'Ada', last_name: 'Prova', email: null, phone: '+393330000098' };
const makePet = (id, name) => ({ id, tenant_id: tid, customer_id: customer.id, owner_user_id: uid, name, breed: 'Barboncino', photo_url: null, no_show_score: 0, is_blacklisted: false, customer });
const petWithVisit = makePet('pet-with-visit', 'ConVisita');
const petWithoutVisit = makePet('pet-without-visit', 'SenzaVisita');
const futurePet = makePet('pet-future', 'Futuro');
let pets = [petWithVisit, petWithoutVisit, futurePet];
const makeAppointment = ({ id, pet, scheduledAt }) => ({
  id, user_id: uid, pet_id: pet.id, tenant_id: tid, scheduled_at: scheduledAt,
  duration_minutes: 60, status: 'scheduled', approval_status: 'approved', appointment_source: 'operator',
  requested_by_customer_id: null, notes: null, external_calendar: null, service_id: 'service',
  created_at: '2026-09-18T08:00:00Z', updated_at: '2026-09-18T08:00:00Z',
  service: { id: 'service', name: 'Bagno', duration_minutes: 60 }, pet,
});
const ghostRows = [
  makeAppointment({ id: 'ghost-with-visit', pet: petWithVisit, scheduledAt: '2026-09-20T08:00:00Z' }),
  makeAppointment({ id: 'ghost-without-visit', pet: petWithoutVisit, scheduledAt: '2026-09-19T09:00:00Z' }),
];
const futureRow = makeAppointment({ id: 'future', pet: futurePet, scheduledAt: '2026-09-24T07:00:00Z' });
let appointments = [...ghostRows, futureRow];
let visits = [{
  id: 'visit-gh98', pet_id: petWithVisit.id, tenant_id: tid, appointment_id: ghostRows[0].id,
  date: '2026-09-20', treatments: 'Bagno', issues: null, cost: 30, discount_percent: 0,
  created_at: '2026-09-20T10:00:00Z', updated_at: '2026-09-20T10:00:00Z', pet: petWithVisit,
}];
let requests = [];
let readLog = [];
let rpcLog = [];
let writeLog = [];
let createdSequence = 0;
let browser;

const dayTime = (date, time) => {
  const value = new Date(`${date}T${time}:00`);
  const year = new Intl.DateTimeFormat('it-IT', { year: 'numeric', timeZone: 'Europe/Rome' });
  const day = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Rome',
    ...(year.format(value) !== year.format(new Date()) ? { year: 'numeric' } : {}),
  }).format(value);
  const hour = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }).format(value);
  return `${day} alle ${hour}`;
};
const relationId = (url) => String(url.searchParams.get('id') || '').replace('eq.', '');
const summarizeReads = (slice) => slice.reduce((counts, item) => ({ ...counts, [item]: (counts[item] || 0) + 1 }), {});
const json = (route, data, status = 200, headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });

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
    if (url.origin !== 'https://gh98-memory.invalid') {
      results.unexpected.push(url.origin + url.pathname);
      return route.abort();
    }
    if (url.pathname === '/auth/v1/user') return json(route, user);
    if (url.pathname === '/rest/v1/rpc/create_calendar_customer_pet') {
      const payload = req.postDataJSON();
      rpcLog.push({ rpc: 'create_calendar_customer_pet', payload });
      const created = makePet(`created-pet-${++createdSequence}`, payload.p_pet_name);
      pets = [...pets, created];
      return json(route, { outcome: 'created', customer_id: customer.id, pet_id: created.id });
    }
    if (url.pathname === '/rest/v1/rpc/resolve_appointment_request_local') {
      const payload = req.postDataJSON();
      rpcLog.push({ rpc: 'resolve_appointment_request_local', payload });
      requests = requests.filter((item) => item.id !== payload.p_request_id);
      return json(route, { id: payload.p_request_id, status: 'approved' });
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      const table = url.pathname.split('/').at(-1);
      if (req.method() === 'POST' && table === 'appointments') {
        const payload = req.postDataJSON();
        writeLog.push({ method: 'POST', table, payload });
        const pet = pets.find((item) => item.id === payload.pet_id) || futurePet;
        const created = makeAppointment({ id: `created-${writeLog.length}`, pet, scheduledAt: payload.scheduled_at });
        appointments = [...appointments, { ...created, ...payload }];
        return req.headers().accept?.includes('vnd.pgrst.object') ? json(route, { id: created.id }) : json(route, [{ id: created.id }]);
      }
      if (req.method() === 'PATCH' && table === 'appointments') {
        const id = relationId(url);
        const payload = req.postDataJSON();
        writeLog.push({ method: 'PATCH', table, id, payload });
        const row = appointments.find((item) => item.id === id);
        Object.assign(row || {}, payload);
        return req.headers().accept?.includes('vnd.pgrst.object') ? json(route, row || null) : json(route, row ? [row] : []);
      }
      if (req.method() === 'DELETE') {
        writeLog.push({ method: 'DELETE', table, query: url.search });
        return json(route, []);
      }
      assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
      readLog.push(table);
      if (req.method() === 'HEAD') return json(route, [], 200, { 'content-range': '*/0' });
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role: 'owner', created_at: '2026-01-01' }];
      if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { workstation_capacity: 3, booking_schedule: {} } }];
      if (table === 'profiles') data = [{ id: uid, email: user.email, role: 'operator' }];
      if (table === 'services') data = [{ id: 'service', name: 'Bagno', duration_minutes: 60, price_cents: 3000, is_active: true, display_order: 1 }];
      if (table === 'pets') {
        const id = relationId(url);
        data = id ? pets.filter((item) => item.id === id) : pets;
      }
      if (table === 'appointment_requests') data = requests;
      if (table === 'visits') data = url.searchParams.has('appointment_id') ? [] : visits;
      if (table === 'appointments') {
        const id = relationId(url);
        const approval = url.searchParams.get('approval_status') || '';
        const status = url.searchParams.get('status') || '';
        if (id) data = appointments.filter((item) => item.id === id);
        else if (approval === 'eq.pending') data = [];
        else if (status === 'eq.scheduled') data = appointments.filter((item) => item.status === 'scheduled');
        else if (status === 'neq.cancelled') data = appointments.filter((item) => item.status !== 'cancelled' && new Date(item.scheduled_at) > new Date());
        else data = appointments;
      }
      const headers = table === 'appointments' ? { 'content-range': data.length ? `0-${data.length - 1}/${data.length}` : '*/0' } : {};
      if (req.headers().accept?.includes('vnd.pgrst.object')) return json(route, data[0] || null, 200, headers);
      return json(route, data, 200, headers);
    }
    results.unexpected.push(url.pathname);
    return route.abort();
  });
  context.setDefaultTimeout(12000);
  const page = await context.newPage();
  page.on('pageerror', (error) => results.errors.push(error.message));
  await page.goto(`${origin}/login`);
  await page.evaluate(({ userId, authUser }) => {
    const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 }));
    localStorage.setItem('sb-gh98-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: authUser }));
  }, { userId: uid, authUser: user });

  const layout = async (name) => {
    await page.waitForTimeout(120);
    const measured = await page.evaluate(() => {
      const queue = document.querySelector('[aria-label="Appuntamenti passati ancora programmati"]');
      const controls = queue ? [...queue.querySelectorAll('button,a')] : [];
      return {
        viewport: { width: innerWidth, height: innerHeight },
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        controls: controls.map((element) => {
          const box = element.getBoundingClientRect();
          return { text: element.textContent.trim().replace(/\s+/g, ' '), width: box.width, height: box.height, truncated: element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1 };
        }),
      };
    });
    assert.equal(measured.overflow, 0, name);
    assert.deepEqual(measured.controls.filter((control) => control.width < 44 || control.height < 44 || control.truncated), [], name);
    results.layouts.push({ name, ...measured });
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  };
  const openManual = async () => {
    await page.getByRole('button', { name: 'Nuovo appuntamento' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    return dialog;
  };
  const choosePet = async (dialog, name = 'Futuro') => {
    const combobox = dialog.getByRole('combobox', { name: 'Pet' });
    await combobox.fill(name);
    await dialog.getByRole('option', { name: new RegExp(`^${name}`) }).click();
  };
  const setField = async (dialog, label, value) => dialog.getByLabel(label, { exact: true }).fill(value);
  const closeDialog = async (dialog) => {
    await dialog.locator('.gh-modal__close').click();
    await dialog.waitFor({ state: 'detached' });
  };

  const fullStart = readLog.length;
  await page.goto(`${origin}/calendar?case=full`);
  await page.getByRole('heading', { name: '2 appuntamenti passati da verificare' }).waitFor();
  await page.getByText('Lavorazione registrata quel giorno', { exact: true }).waitFor();
  await page.getByText('Nessuna lavorazione registrata quel giorno', { exact: true }).waitFor();
  await page.waitForTimeout(150);
  const fullReads = summarizeReads(readLog.slice(fullStart));
  assert.equal(await page.locator('.gh-request-alert__count').count(), 0);
  await layout('queue-full-375');
  await page.setViewportSize({ width: 1365, height: 900 });
  await layout('queue-full-1365');
  await page.setViewportSize({ width: 375, height: 812 });

  const originalAppointments = appointments;
  const originalVisits = visits;
  appointments = [futureRow];
  visits = [];
  const emptyStart = readLog.length;
  await page.reload();
  await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();
  await page.waitForTimeout(150);
  const emptyReads = summarizeReads(readLog.slice(emptyStart));
  assert.equal(await page.getByText(/appuntament[oi] passat[oi] da verificare/).count(), 0);
  assert.deepEqual(emptyReads, fullReads);
  appointments = originalAppointments;
  visits = originalVisits;
  await page.reload();
  await page.getByRole('heading', { name: '2 appuntamenti passati da verificare' }).waitFor();
  results.queue = { count: 2, labels: ['Lavorazione registrata quel giorno', 'Nessuna lavorazione registrata quel giorno'], fullReads, emptyReads, requestBadgeBefore: 0, requestBadgeAfter: 0 };

  let dialog = await openManual();
  await choosePet(dialog);
  const saveButton = dialog.getByRole('button', { name: 'Salva appuntamento' });
  await setField(dialog, 'Data', '2026-09-23');
  await setField(dialog, 'Ora', '08:00');
  assert.equal(await dialog.getByText(/un giorno già passato/).count(), 0);
  assert.equal(await saveButton.isEnabled(), true);
  results.dates.today = { warning: false, saveEnabled: true };

  await setField(dialog, 'Data', '2026-09-22');
  const pastWarning = `Attenzione: stai scegliendo ${dayTime('2026-09-22', '12:00').replace(/ alle 12:00$/, '')}, un giorno già passato. Puoi salvare comunque.`;
  await dialog.getByText(pastWarning, { exact: true }).waitFor();
  assert.equal(await saveButton.isEnabled(), true);
  results.dates.past = { warning: pastWarning, saveEnabled: true };
  await page.screenshot({ path: `${out}/past-date-warning-375.png`, fullPage: false });

  await setField(dialog, 'Data', '2026-09-30');
  assert.equal(await dialog.getByText(/un giorno già passato/).count(), 0);
  results.dates.future = { warning: false };

  const manualCases = [
    { date: '2026-09-23', time: '08:00' },
    { date: '2026-09-30', time: '10:00' },
    { date: '2026-10-23', time: '11:00' },
  ];
  results.saves.manual = [];
  for (const item of manualCases) {
    await setField(dialog, 'Data', item.date);
    await setField(dialog, 'Ora', item.time);
    await saveButton.click();
    const expected = `Appuntamento salvato per ${dayTime(item.date, item.time)}. Il prossimo orario libero è già pronto.`;
    await dialog.getByText(expected, { exact: true }).waitFor();
    results.saves.manual.push(expected);
  }
  await closeDialog(dialog);

  requests = [{
    id: 'request-gh98', tenant_id: tid, customer_user_id: 'customer-user', pet_id: futurePet.id,
    service_id: 'service', desired_date: '2026-09-24', time_preference: 'morning', status: 'pending', appointment_id: null,
    created_at: '2026-09-23T08:00:00Z', service: { id: 'service', name: 'Bagno', duration_minutes: 60 }, pet: futurePet,
  }];
  await page.reload();
  await page.locator('button.gh-planning-chip--request').filter({ hasText: 'Futuro' }).click();
  dialog = page.getByRole('dialog');
  await setField(dialog, 'Data', '2026-09-30');
  await setField(dialog, 'Ora', '12:00');
  await dialog.getByRole('button', { name: 'Conferma e prepara WhatsApp' }).click();
  const requestSuccess = `Richiesta confermata: appuntamento salvato per ${dayTime('2026-09-30', '12:00')}. Ora puoi avvisare il cliente.`;
  await page.getByText(requestSuccess, { exact: true }).waitFor();
  results.saves.request = requestSuccess;

  await page.locator('button.gh-planning-chip--appointment').filter({ hasText: 'Futuro' }).first().click();
  dialog = page.getByRole('dialog');
  await setField(dialog, 'Data', '2026-10-23');
  await setField(dialog, 'Ora', '14:00');
  await dialog.getByRole('button', { name: 'Salva orario' }).click();
  const moveSuccess = `Appuntamento spostato a ${dayTime('2026-10-23', '14:00')}.`;
  await dialog.getByText(moveSuccess, { exact: true }).waitFor();
  results.saves.move = moveSuccess;
  await closeDialog(dialog);

  dialog = await openManual();
  const combobox = dialog.getByRole('combobox', { name: 'Pet' });
  await combobox.fill('Nuovo Pet');
  await dialog.getByRole('option', { name: /Nessun pet per «Nuovo Pet»/ }).click();
  await setField(dialog, 'Proprietario', 'Cliente Prova');
  await dialog.getByLabel('Il telefono non è stato fornito').check();
  await dialog.getByRole('button', { name: 'Crea e seleziona il pet' }).click();
  await dialog.getByText('Pet creato e selezionato. Puoi completare l’appuntamento.', { exact: true }).waitFor();
  await closeDialog(dialog);
  const unfinishedText = 'Pet creato. L’appuntamento non è stato salvato.';
  await page.getByText(unfinishedText, { exact: true }).waitFor();
  assert.equal(writeLog.filter((item) => item.method === 'DELETE').length, 0);
  results.unfinishedPet.created = { text: unfinishedText, deleteCalls: 0 };

  dialog = await openManual();
  await closeDialog(dialog);
  assert.equal(await page.getByText(unfinishedText, { exact: true }).count(), 0);
  results.unfinishedPet.emptyClose = { textVisible: false };

  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.rpcCalls = rpcLog;
  results.writes = writeLog;
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({ dates: results.dates, saves: results.saves, queue: results.queue, unfinishedPet: results.unfinishedPet, layouts: results.layouts.length, elapsedMs: results.elapsedMs }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
