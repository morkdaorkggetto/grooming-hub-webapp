import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-100`;
const started = Date.now();
const results = { disabled: {}, failures: {}, acknowledgement: {}, deletion: {}, visibility: {}, errors: [], unexpected: [] };
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: '/private/tmp/gh100-vite-cache',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh100-memory.invalid'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify('false'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});

const uid = '10000000-0000-4000-8000-000000000001';
const tid = '10000000-0000-4000-8000-000000000002';
const user = { id: uid, email: 'staff@gh100.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const customer = (id, first, last) => ({ id, user_id: null, first_name: first, last_name: last, email: null, phone: '+393330000100' });
const makePet = (id, name, owner, breed = 'Meticcio') => ({
  id, tenant_id: tid, customer_id: owner.id, owner_user_id: uid, name, breed, photo_url: null,
  no_show_score: 0, is_blacklisted: false, customer: owner,
});
const ada = customer('customer-ada', 'Ada', 'Verdi');
const bruno = customer('customer-bruno', 'Bruno', 'Blu');
const cloverAda = makePet('pet-clover-ada', 'Clover', ada, 'Meticcio');
const cloverBruno = makePet('pet-clover-bruno', 'Clover', bruno, 'Meticcio');
const futurePet = makePet('pet-future', 'FuoriSettimana', ada, 'Barboncino');
const pets = [cloverAda, cloverBruno, futurePet];
const makeAppointment = ({ id, pet, scheduledAt, status = 'scheduled' }) => ({
  id, user_id: uid, pet_id: pet.id, tenant_id: tid, scheduled_at: scheduledAt,
  duration_minutes: 60, status, approval_status: 'approved', appointment_source: 'operator',
  requested_by_customer_id: null, notes: null, external_calendar: null, service_id: 'service',
  created_at: '2026-09-20T08:00:00Z', updated_at: '2026-09-20T08:00:00Z',
  service: { id: 'service', name: 'Bagno', duration_minutes: 60 }, pet,
});

let appointments = [
  makeAppointment({ id: 'capacity', pet: cloverAda, scheduledAt: '2026-09-26T07:00:00.000Z' }),
  makeAppointment({ id: 'same-name', pet: cloverBruno, scheduledAt: '2026-09-26T08:15:00.000Z' }),
  makeAppointment({ id: 'delete-me', pet: makePet('pet-delete', 'DaEliminare', ada), scheduledAt: '2026-09-26T10:00:00.000Z' }),
  makeAppointment({ id: 'completed', pet: makePet('pet-completed', 'CompletatoVisibile', ada), scheduledAt: '2026-09-26T12:00:00.000Z', status: 'completed' }),
  makeAppointment({ id: 'no-show', pet: makePet('pet-noshow', 'AssenzaVisibile', ada), scheduledAt: '2026-09-26T13:00:00.000Z', status: 'no_show' }),
  makeAppointment({ id: 'cancelled', pet: makePet('pet-cancelled', 'AnnullatoVisibile', ada), scheduledAt: '2026-09-26T14:00:00.000Z', status: 'cancelled' }),
  makeAppointment({ id: 'closed-inside', pet: makePet('pet-closed-in', 'ChiusoDentroFascia', ada), scheduledAt: '2026-09-27T08:00:00.000Z' }),
  makeAppointment({ id: 'closed-outside', pet: makePet('pet-closed-out', 'ChiusoFuoriFascia', ada), scheduledAt: '2026-09-27T18:00:00.000Z' }),
];
let insertMode = 'normal';
let membershipMode = 'normal';
let releaseInsert = null;
let insertGate = null;
const writes = [];
let browser;

const relationId = (url) => String(url.searchParams.get('id') || '').replace('eq.', '');
const stripFilter = (value = '') => value.replace(/^(eq|neq|gt|gte|lt|lte)\./, '');
const json = (route, data, status = 200, headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });
const appointmentForPayload = (payload) => ({
  ...makeAppointment({ id: payload.id, pet: pets.find((item) => item.id === payload.pet_id) || futurePet, scheduledAt: payload.scheduled_at }),
  ...payload,
});

function filterAppointments(url, source) {
  let data = [...source];
  const id = relationId(url);
  if (id) data = data.filter((item) => item.id === id);
  for (const raw of url.searchParams.getAll('scheduled_at')) {
    const operator = raw.split('.', 1)[0];
    if (!['gte', 'lte', 'gt', 'lt'].includes(operator)) continue;
    const target = new Date(stripFilter(raw)).getTime();
    data = data.filter((item) => {
      const value = new Date(item.scheduled_at).getTime();
      return operator === 'gte' ? value >= target : operator === 'lte' ? value <= target : operator === 'gt' ? value > target : value < target;
    });
  }
  const status = url.searchParams.get('status');
  if (status?.startsWith('eq.')) data = data.filter((item) => item.status === stripFilter(status));
  if (status?.startsWith('neq.')) data = data.filter((item) => item.status !== stripFilter(status));
  const approval = url.searchParams.get('approval_status');
  if (approval?.startsWith('eq.')) data = data.filter((item) => item.approval_status === stripFilter(approval));
  return data;
}

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
    if (url.origin !== 'https://gh100-memory.invalid') {
      results.unexpected.push(`${url.origin}${url.pathname}`);
      return route.abort();
    }
    if (url.pathname === '/auth/v1/user') return json(route, user);
    if (url.pathname === '/rest/v1/rpc/delete_staff_appointment') {
      const payload = req.postDataJSON();
      writes.push({ kind: 'delete_rpc', id: payload.p_appointment_id });
      appointments = appointments.filter((item) => item.id !== payload.p_appointment_id);
      return json(route, payload.p_appointment_id);
    }
    if (url.pathname.startsWith('/rest/v1/rpc/')) return json(route, {});
    if (url.pathname.startsWith('/rest/v1/')) {
      const table = url.pathname.split('/').at(-1);
      if (req.method() === 'POST' && table === 'appointments') {
        const payload = req.postDataJSON();
        writes.push({ kind: 'insert_attempt', mode: insertMode, id: payload.id, scheduled_at: payload.scheduled_at });
        if (insertMode === 'networkFailure') return json(route, { message: 'collegamento interrotto' }, 503);
        if (insertMode === 'committedFailure') {
          appointments.push(appointmentForPayload(payload));
          return json(route, { message: 'risposta persa dopo il commit' }, 503);
        }
        if (insertMode === 'delayedSuccess') await insertGate;
        appointments.push(appointmentForPayload(payload));
        const data = { id: payload.id };
        return req.headers().accept?.includes('vnd.pgrst.object') ? json(route, data) : json(route, [data]);
      }
      if (req.method() === 'PATCH' && table === 'appointments') {
        const id = relationId(url);
        const payload = req.postDataJSON();
        writes.push({ kind: 'patch', id, payload });
        const row = appointments.find((item) => item.id === id);
        Object.assign(row || {}, payload);
        return req.headers().accept?.includes('vnd.pgrst.object') ? json(route, row || null) : json(route, row ? [row] : []);
      }
      assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
      if (table === 'tenant_memberships' && membershipMode === 'expired') {
        membershipMode = 'normal';
        return json(route, { message: 'JWT expired' }, 401);
      }
      if (req.method() === 'HEAD') return json(route, [], 200, { 'content-range': '*/0' });
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role: 'owner', created_at: '2026-01-01' }];
      if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { workstation_capacity: 1, booking_schedule: { closed_weekdays: ['sunday'] } } }];
      if (table === 'profiles') data = [{ id: uid, email: user.email, role: 'operator' }];
      if (table === 'services') data = [{ id: 'service', name: 'Bagno', duration_minutes: 60, price_cents: 3000, is_active: true, display_order: 1 }];
      if (table === 'pets') {
        const id = relationId(url);
        data = id ? pets.filter((item) => item.id === id) : pets;
      }
      if (table === 'appointment_requests' || table === 'visits') data = [];
      if (table === 'appointments') data = filterAppointments(url, appointments);
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
    localStorage.setItem('sb-gh100-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: authUser }));
  }, { userId: uid, authUser: user });

  const openCalendar = async () => {
    await page.goto(`${origin}/calendar`);
    await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();
    await page.locator('.gh-planning-week').waitFor();
  };
  const openManual = async () => {
    await page.getByRole('button', { name: 'Nuovo appuntamento' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nuovo appuntamento' });
    await dialog.waitFor();
    return dialog;
  };
  const choosePet = async (dialog, name) => {
    const input = dialog.getByRole('combobox', { name: 'Pet' });
    await input.fill(name);
    await dialog.getByRole('option', { name: new RegExp(`^${name}`) }).first().click();
  };
  const close = async (dialog) => {
    await dialog.locator('.gh-modal__close').click();
    await dialog.waitFor({ state: 'detached' });
  };
  const setField = (dialog, label, value) => dialog.getByLabel(label, { exact: true }).fill(value);

  await openCalendar();
  let dialog = await openManual();
  await setField(dialog, 'Ora', '17:00');
  const petInput = dialog.getByRole('combobox', { name: 'Pet' });
  await petInput.fill('Clover');
  let save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  assert.equal(await save.isDisabled(), true);
  const beforeSilentClick = writes.length;
  await save.evaluate((button) => button.click());
  await page.waitForTimeout(80);
  assert.equal(writes.length, beforeSilentClick);
  assert.equal(await dialog.getByRole('alert').count(), 0);
  results.disabled.typedButUnselected = { disabled: true, visibleReason: 'niente', insertAttempts: 0 };
  await page.screenshot({ path: `${out}/disabled-unselected-375.png`, fullPage: false });
  await close(dialog);

  dialog = await openManual();
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('NuovoPet');
  await dialog.getByRole('option', { name: /Nessun pet per/ }).click();
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  assert.equal(await save.isDisabled(), true);
  await dialog.getByText('Nuovo pet', { exact: true }).waitFor();
  results.disabled.petCreationOpen = { disabled: true, visibleReason: 'Nuovo pet; Crea e seleziona il pet' };
  await close(dialog);

  dialog = await openManual();
  await choosePet(dialog, 'FuoriSettimana');
  await setField(dialog, 'Data', '');
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  assert.equal(await save.isEnabled(), true);
  await save.click();
  const requiredMessage = 'Pet, data e ora sono obbligatori.';
  await dialog.getByText(requiredMessage, { exact: true }).waitFor();
  results.disabled.missingDate = { disabled: false, visibleReasonAfterClick: requiredMessage };
  await close(dialog);

  dialog = await openManual();
  await choosePet(dialog, 'FuoriSettimana');
  await setField(dialog, 'Data', '2026-09-26');
  await setField(dialog, 'Ora', '09:00');
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  const capacityMessage = 'Le postazioni sono tutte occupate nella fascia scelta.';
  assert.equal(await save.isDisabled(), true);
  await dialog.getByText(capacityMessage, { exact: true }).waitFor();
  results.disabled.capacity = { disabled: true, visibleReason: capacityMessage };
  await close(dialog);

  dialog = await openManual();
  await choosePet(dialog, 'FuoriSettimana');
  await setField(dialog, 'Ora', '17:00');
  membershipMode = 'expired';
  await dialog.getByRole('button', { name: 'Salva appuntamento' }).click();
  await dialog.getByText('JWT expired', { exact: true }).waitFor();
  results.failures.expiredSession = { visible: 'JWT expired', resemblesSuccess: false };
  await close(dialog);

  dialog = await openManual();
  await choosePet(dialog, 'FuoriSettimana');
  await setField(dialog, 'Ora', '17:15');
  insertMode = 'networkFailure';
  await dialog.getByRole('button', { name: 'Salva appuntamento' }).click();
  const networkMessage = "Non riesco a creare l'appuntamento: collegamento interrotto";
  await dialog.getByText(networkMessage, { exact: true }).waitFor();
  results.failures.networkBeforeCommit = { visible: networkMessage, resemblesSuccess: false };
  await close(dialog);

  dialog = await openManual();
  await choosePet(dialog, 'FuoriSettimana');
  await setField(dialog, 'Ora', '17:30');
  insertMode = 'committedFailure';
  await dialog.getByRole('button', { name: 'Salva appuntamento' }).click();
  const ambiguousMessage = "Non riesco a creare l'appuntamento: risposta persa dopo il commit";
  await dialog.getByText(ambiguousMessage, { exact: true }).waitFor();
  const ambiguousRow = appointments.at(-1);
  assert.equal(ambiguousRow.pet_id, futurePet.id);
  results.failures.responseLostAfterCommit = { visible: ambiguousMessage, rowExists: true, rowVisibleWithoutReload: false };
  appointments = appointments.filter((item) => item.id !== ambiguousRow.id);
  await close(dialog);

  dialog = await openManual();
  await choosePet(dialog, 'FuoriSettimana');
  await setField(dialog, 'Data', '2026-10-10');
  await setField(dialog, 'Ora', '11:00');
  insertMode = 'delayedSuccess';
  insertGate = new Promise((resolve) => { releaseInsert = resolve; });
  await dialog.getByRole('button', { name: 'Salva appuntamento' }).click();
  await dialog.getByRole('button', { name: '…' }).waitFor();
  assert.equal(await dialog.locator('.gh-modal__close').isEnabled(), true);
  await close(dialog);
  releaseInsert();
  await page.waitForTimeout(250);
  const delayedRow = appointments.at(-1);
  assert.equal(delayedRow.pet_id, futurePet.id);
  assert.equal(await page.getByText(/Appuntamento salvato per/).count(), 0);
  const search = page.getByPlaceholder('pet, proprietario, cell');
  await search.fill('FuoriSettimana');
  await page.getByText('Nessun appuntamento aperto trovato.', { exact: true }).waitFor();
  results.acknowledgement.closedWhileSaving = {
    saveState: '…', closeEnabled: true, rowExists: true, successVisible: false,
    searchBeforeReload: 'Nessun appuntamento aperto trovato.',
  };
  await page.reload();
  await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();
  await page.getByPlaceholder('pet, proprietario, cell').fill('FuoriSettimana');
  await page.getByText(/1 corrispondenza nelle altre settimane/).waitFor();
  results.acknowledgement.closedWhileSaving.searchAfterReload = '1 corrispondenza nelle altre settimane.';
  insertMode = 'normal';

  await page.getByPlaceholder('pet, proprietario, cell').fill('');
  assert.equal(await page.getByText('Clover', { exact: true }).count(), 2);
  assert.equal(await page.getByText('Ada Verdi', { exact: true }).count(), 0);
  assert.equal(await page.getByText('Bruno Blu', { exact: true }).count(), 0);
  results.visibility.homonyms = { cards: 2, ownerNamesOnCards: 0, distinguishableOnlyAfterOpen: true };

  const deleteChip = page.locator('button.gh-planning-chip--appointment').filter({ hasText: 'DaEliminare' });
  await deleteChip.click();
  dialog = page.getByRole('dialog', { name: /Appuntamento · DaEliminare/ });
  const deleteButton = dialog.getByRole('button', { name: 'Elimina', exact: true });
  const cancelButton = dialog.getByRole('button', { name: 'Annulla appuntamento' });
  const positions = await Promise.all([deleteButton.boundingBox(), cancelButton.boundingBox()]);
  await deleteButton.click();
  const deleteDialog = page.getByRole('dialog', { name: 'Elimina appuntamento' });
  const confirmText = "Elimini l'appuntamento di DaEliminare di sabato 26 settembre alle 12:00?";
  await deleteDialog.getByText(confirmText, { exact: true }).waitFor();
  await deleteDialog.getByText('Sparisce del tutto. Se invece il cliente ha disdetto, usa «Annulla appuntamento»: resta come fatto.', { exact: true }).waitFor();
  await page.screenshot({ path: `${out}/delete-confirmation-375.png`, fullPage: false });
  await deleteDialog.getByRole('button', { name: 'Elimina definitivamente' }).click();
  await page.getByText('Appuntamento eliminato: la riga inserita per errore non fa più parte della storia.', { exact: true }).waitFor();
  assert.equal(appointments.some((item) => item.id === 'delete-me'), false);
  results.deletion.direct = {
    touchesFromPlanner: 3,
    firstCommand: 'Elimina',
    confirmation: confirmText,
    warning: 'Sparisce del tutto. Se invece il cliente ha disdetto, usa «Annulla appuntamento»: resta come fatto.',
    finalCommand: 'Elimina definitivamente',
    separatedBelowCancelByPx: Math.round((positions[0].y || 0) - ((positions[1].y || 0) + (positions[1].height || 0))),
    rowExistsAfter: false,
  };

  await page.setViewportSize({ width: 1365, height: 900 });
  await page.reload();
  await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('.gh-planning-day')].some((item) => item.textContent.trim()));
  assert.equal(await page.getByText('ChiusoDentroFascia', { exact: true }).count(), 1);
  assert.equal(await page.getByText('ChiusoFuoriFascia', { exact: true }).count(), 1);
  await page.getByText('fuori orario', { exact: true }).waitFor();
  appointments = appointments.filter((item) => item.id !== 'closed-inside');
  await page.reload();
  await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('.gh-planning-day')].some((item) => item.textContent.trim()));
  assert.equal(await page.getByText('ChiusoFuoriFascia', { exact: true }).count(), 0);
  await page.screenshot({ path: `${out}/closed-day-week-1365.png`, fullPage: true });
  await page.locator('.gh-planning-day__head').nth(6).click();
  await page.getByText('ChiusoFuoriFascia', { exact: true }).waitFor();
  results.visibility.closedDay = {
    insideWindowInWeek: true,
    insideWindowLabel: 'fuori orario',
    outsideWindowInWeekWhenBandedSiblingExists: true,
    outsideWindowInWeek: false,
    outsideWindowInDay: true,
  };

  await page.goto(`${origin}/appointments/today`);
  await page.getByRole('heading', { name: 'Operatività giornaliera' }).waitFor();
  await page.getByLabel('Data', { exact: true }).fill('2026-09-27');
  await page.getByText('ChiusoFuoriFascia', { exact: true }).waitFor();
  results.visibility.closedDay.outsideWindowInDaily = true;
  await page.getByLabel('Data', { exact: true }).fill('2026-09-26');
  const dailyLabels = ['Programmato', 'Completato', 'Assenza', 'Annullato'];
  for (const label of dailyLabels) await page.getByText(label, { exact: true }).first().waitFor();
  results.visibility.dailyStatuses = dailyLabels;

  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.writeSummary = writes;
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({
    disabled: results.disabled,
    failures: results.failures,
    acknowledgement: results.acknowledgement,
    deletion: results.deletion,
    visibility: results.visibility,
    elapsedMs: results.elapsedMs,
  }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
