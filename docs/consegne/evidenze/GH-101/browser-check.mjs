import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-101`;
const started = Date.now();
const results = { selection: {}, disabled: {}, saving: {}, visibility: {}, layout: {}, modal: {}, errors: [], unexpected: [] };
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: '/private/tmp/gh101-vite-cache',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh101-memory.invalid'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify('false'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});

const uid = '10100000-0000-4000-8000-000000000001';
const tid = '10100000-0000-4000-8000-000000000002';
const user = { id: uid, email: 'staff@gh101.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const customer = (id, first, last) => ({ id, user_id: null, first_name: first, last_name: last, email: null, phone: '+393330000100' });
const makePet = (id, name, owner, breed = 'Meticcio') => ({
  id, tenant_id: tid, customer_id: owner.id, owner_user_id: uid, name, breed, photo_url: null,
  no_show_score: 0, is_blacklisted: false, customer: owner,
});
const ada = customer('customer-ada', 'Ada', 'Verdi');
const bruno = customer('customer-bruno', 'Bruno', 'Blu');
const clover = makePet('pet-clover', 'Clover', ada, 'Maltese');
const leoAda = makePet('pet-leo-ada', 'Leo', ada, 'Meticcio');
const leoBruno = makePet('pet-leo-bruno', 'Leo', bruno, 'Meticcio');
const futurePet = makePet('pet-future', 'FuoriSettimana', ada, 'Barboncino');
const pets = [clover, leoAda, leoBruno, futurePet];
const makeAppointment = ({ id, pet, scheduledAt, status = 'scheduled' }) => ({
  id, user_id: uid, pet_id: pet.id, tenant_id: tid, scheduled_at: scheduledAt,
  duration_minutes: 60, status, approval_status: 'approved', appointment_source: 'operator',
  requested_by_customer_id: null, notes: null, external_calendar: null, service_id: 'service',
  created_at: '2026-09-20T08:00:00Z', updated_at: '2026-09-20T08:00:00Z',
  service: { id: 'service', name: 'Bagno', duration_minutes: 60 }, pet,
});

const capacityAppointment = makeAppointment({ id: 'capacity', pet: leoAda, scheduledAt: '2026-09-26T07:00:00.000Z' });
const noShowAppointment = makeAppointment({ id: 'no-show', pet: futurePet, scheduledAt: '2026-09-26T12:00:00.000Z', status: 'no_show' });
const closedOutsideAppointment = makeAppointment({ id: 'closed-outside', pet: makePet('pet-closed-out', 'FuoriFascia', ada), scheduledAt: '2026-09-27T18:00:00.000Z' });
let appointments = [capacityAppointment, noShowAppointment, closedOutsideAppointment];
let insertMode = 'normal';
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
    if (url.origin !== 'https://gh101-memory.invalid') {
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
    localStorage.setItem('sb-gh101-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: authUser }));
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
  const close = async (dialog) => {
    await dialog.locator('.gh-modal__close').click();
    await dialog.waitFor({ state: 'detached' });
  };
  const setField = (dialog, label, value) => dialog.getByLabel(label, { exact: true }).fill(value);

  await openCalendar();
  let dialog = await openManual();
  await setField(dialog, 'Ora', '17:00');
  const petInput = dialog.getByRole('combobox', { name: 'Pet' });
  const chooseMessage = 'Scegli un pet dall’elenco per salvare l’appuntamento.';
  let save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  assert.equal(await save.isDisabled(), true);
  await dialog.getByText(chooseMessage, { exact: true }).waitFor();
  results.disabled.petMissing = { disabled: true, visibleBeforeClick: chooseMessage };

  await petInput.fill('Clover');
  await page.waitForFunction(() => !document.querySelector('button.gh-btn--primary[disabled]'));
  assert.equal(await petInput.inputValue(), 'Clover · Maltese · Ada Verdi');
  assert.equal(await save.isEnabled(), true);
  await page.screenshot({ path: `${out}/clover-autoselected-375.png`, fullPage: false });
  await save.click();
  const cloverSuccess = 'Appuntamento salvato per sabato 26 settembre alle 17:00. Il prossimo orario libero è già pronto.';
  await dialog.getByText(cloverSuccess, { exact: true }).waitFor();
  assert.equal(appointments.filter((item) => item.pet_id === clover.id).length, 1);
  results.selection.clover = {
    typed: 'Clover', clickedOption: false, selectedLabel: await petInput.inputValue(),
    saveEnabled: true, insertCount: 1, visibleOutcome: cloverSuccess,
  };
  await close(dialog);

  dialog = await openManual();
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('Leo');
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  assert.equal(await save.isDisabled(), true);
  await dialog.getByText(chooseMessage, { exact: true }).waitFor();
  assert.equal(await dialog.locator('.gh-pet-combobox__option').count(), 2);
  await dialog.getByText('Meticcio · Ada Verdi', { exact: true }).waitFor();
  await dialog.getByText('Meticcio · Bruno Blu', { exact: true }).waitFor();
  results.selection.homonyms = {
    typed: 'Leo', clickedOption: false, automaticSelection: false,
    options: ['Leo · Meticcio · Ada Verdi', 'Leo · Meticcio · Bruno Blu'],
    visibleReason: chooseMessage,
  };
  await page.screenshot({ path: `${out}/homonyms-guidance-375.png`, fullPage: false });
  await close(dialog);

  dialog = await openManual();
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('NuovoPet');
  await dialog.getByRole('option', { name: /Nessun pet per/ }).click();
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  assert.equal(await save.isDisabled(), true);
  const petCreationMessage = 'Completa o annulla la creazione del pet prima di salvare.';
  await dialog.getByText(petCreationMessage, { exact: true }).waitFor();
  results.disabled.petCreationOpen = { disabled: true, visibleBeforeClick: petCreationMessage };
  await close(dialog);

  dialog = await openManual();
  await setField(dialog, 'Ora', '19:30');
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('Clover');
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  await page.waitForTimeout(80);
  assert.equal(await save.isEnabled(), true);
  await setField(dialog, 'Data', '');
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  assert.equal(await save.isEnabled(), true);
  await save.click();
  const requiredMessage = 'Pet, data e ora sono obbligatori.';
  await dialog.getByText(requiredMessage, { exact: true }).waitFor();
  results.disabled.missingDate = { disabled: false, visibleReasonAfterClick: requiredMessage };
  await close(dialog);

  dialog = await openManual();
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('Clover');
  await setField(dialog, 'Data', '2026-09-26');
  await setField(dialog, 'Ora', '09:00');
  save = dialog.getByRole('button', { name: 'Salva appuntamento' });
  const capacityMessage = 'Le postazioni sono tutte occupate nella fascia scelta.';
  assert.equal(await save.isDisabled(), true);
  await dialog.getByText(capacityMessage, { exact: true }).waitFor();
  results.disabled.capacity = { disabled: true, visibleBeforeClick: capacityMessage };
  await close(dialog);

  const noShowChip = page.locator('button.gh-planning-chip--appointment').filter({ hasText: 'FuoriSettimana' });
  await noShowChip.click();
  dialog = page.getByRole('dialog', { name: /Appuntamento · FuoriSettimana/ });
  const noShowMessage = 'Annulla prima l’assenza per modificare data e ora.';
  await dialog.getByText(noShowMessage, { exact: true }).waitFor();
  assert.equal(await dialog.getByRole('button', { name: 'Salva orario' }).isDisabled(), true);
  results.disabled.noShowSchedule = { disabled: true, visibleBeforeClick: noShowMessage };
  await close(dialog);

  dialog = await openManual();
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('Clover');
  await setField(dialog, 'Data', '2026-09-26');
  await setField(dialog, 'Ora', '18:15');
  insertMode = 'delayedSuccess';
  insertGate = new Promise((resolve) => { releaseInsert = resolve; });
  await dialog.getByRole('button', { name: 'Salva appuntamento' }).click();
  await dialog.getByRole('button', { name: '…' }).waitFor();
  const savingMessage = 'Salvataggio in corso. Attendi l’esito.';
  await dialog.getByText(savingMessage, { exact: true }).waitFor();
  const closeButtons = dialog.getByRole('button', { name: 'Chiudi' });
  assert.equal(await closeButtons.count(), 2);
  assert.equal(await closeButtons.nth(0).isDisabled(), true);
  assert.equal(await closeButtons.nth(1).isDisabled(), true);
  await closeButtons.nth(0).evaluate((button) => button.click());
  assert.equal(await dialog.count(), 1);
  await closeButtons.nth(1).evaluate((button) => button.click());
  assert.equal(await dialog.count(), 1);
  await page.locator('.gh-modal-scrim').dispatchEvent('mousedown');
  assert.equal(await dialog.count(), 1);
  releaseInsert();
  const delayedSuccess = 'Appuntamento salvato per sabato 26 settembre alle 18:15. Il prossimo orario libero è già pronto.';
  await dialog.getByText(delayedSuccess, { exact: true }).waitFor();
  results.saving.success = {
    visibleWhileModalOpen: delayedSuccess,
    headerCloseBlocked: true, footerCloseBlocked: true, scrimCloseBlocked: true,
    visibleDuringFlight: savingMessage,
  };
  await close(dialog);

  dialog = await openManual();
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('FuoriSettimana');
  await setField(dialog, 'Ora', '20:00');
  insertMode = 'networkFailure';
  await dialog.getByRole('button', { name: 'Salva appuntamento' }).click();
  const rejectedMessage = "Non riesco a creare l'appuntamento: collegamento interrotto";
  await dialog.getByText(rejectedMessage, { exact: true }).waitFor();
  assert.equal(await dialog.count(), 1);
  results.saving.rejected = { visibleWhileModalOpen: rejectedMessage, modalStayedOpen: true };
  await close(dialog);
  insertMode = 'normal';

  appointments = [closedOutsideAppointment];
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.reload();
  await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('.gh-planning-day')].some((item) => item.textContent.trim()));
  const closedDay = page.locator('.gh-planning-day').nth(6);
  await closedDay.getByText('FuoriFascia', { exact: true }).waitFor();
  await closedDay.getByText('Da collocare', { exact: true }).waitFor();
  const closedDayRows = await closedDay.locator('button.gh-planning-chip--appointment').count();
  const summaryCount = Number((await page.locator('.gh-planning-summary .gh-num').first().textContent()).trim());
  assert.equal(closedDayRows, 1);
  assert.equal(summaryCount, 1);
  await page.screenshot({ path: `${out}/closed-day-visible-1365.png`, fullPage: true });
  results.visibility.closedDay = {
    outsideWindowOnly: true, visibleInWeek: true, section: 'Da collocare',
    counted: summaryCount, renderedRows: closedDayRows,
  };
  results.layout.desktop = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  assert.equal(results.layout.desktop.overflowX, 0);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();
  dialog = await openManual();
  await dialog.getByRole('combobox', { name: 'Pet' }).fill('Leo');
  await dialog.getByText(chooseMessage, { exact: true }).waitFor();
  const affectedButtons = dialog.getByRole('button', { name: /Chiudi|Salva appuntamento/ });
  const heights = await affectedButtons.evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
  const textClipped = await dialog.getByText(chooseMessage, { exact: true }).evaluate((node) => node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight);
  results.layout.mobile = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  results.layout.mobile.affectedButtonHeights = heights;
  results.layout.mobile.guidanceClipped = textClipped;
  assert.equal(results.layout.mobile.overflowX, 0);
  assert.equal(textClipped, false);
  assert(heights.every((height) => height >= 44));
  await close(dialog);

  const openWork = async () => {
    await page.getByRole('button', { name: 'Registra lavorazione' }).first().click();
    const workDialog = page.getByRole('dialog', { name: 'Registra lavorazione' });
    await workDialog.waitFor();
    return workDialog;
  };
  dialog = await openWork();
  let workCloseButtons = dialog.getByRole('button', { name: 'Chiudi' });
  assert.equal(await workCloseButtons.nth(0).isEnabled(), true);
  assert.equal(await workCloseButtons.nth(1).isEnabled(), true);
  await workCloseButtons.nth(0).click();
  await dialog.waitFor({ state: 'detached' });
  dialog = await openWork();
  workCloseButtons = dialog.getByRole('button', { name: 'Chiudi' });
  await workCloseButtons.nth(1).click();
  await dialog.waitFor({ state: 'detached' });
  dialog = await openWork();
  await page.locator('.gh-modal-scrim').dispatchEvent('mousedown');
  await dialog.waitFor({ state: 'detached' });
  results.modal.unchangedWorkModal = {
    headerCloseEnabled: true, footerCloseEnabled: true, scrimCloseEnabled: true,
  };

  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.unexpected, []);
  results.writeSummary = writes;
  results.elapsedMs = Date.now() - started;
  await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify({
    selection: results.selection,
    disabled: results.disabled,
    saving: results.saving,
    visibility: results.visibility,
    layout: results.layout,
    modal: results.modal,
    elapsedMs: results.elapsedMs,
  }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
