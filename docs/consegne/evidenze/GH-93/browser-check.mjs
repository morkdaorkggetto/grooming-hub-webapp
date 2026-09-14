import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-93`;
const started = Date.now();
const capacityMessage = 'Le postazioni sono tutte occupate nella fascia scelta.';
const duplicateMessage = 'Questo appuntamento è già stato rifatto nello stesso orario. L’annullato non serve più e non può essere ripristinato.';
const results = {
  environment: 'Real app and SDK, memory HTTP only, Chromium 375x812 Europe/Rome',
  restore: {},
  otherActions: {},
  outsideModal: {},
  rpcCalls: [],
  errors: [],
  unexpected: [],
};

const uid = '93939393-9393-4393-8393-939393939393';
const tid = '93939393-1111-4111-8111-939393939393';
const user = { id: uid, email: 'staff@gh93.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };

const pet = (id, name, phone = '+393330000093') => ({
  id,
  tenant_id: tid,
  customer_id: `${id}-customer`,
  owner_user_id: uid,
  name,
  breed: 'Barboncino',
  photo_url: null,
  no_show_score: 0,
  is_blacklisted: false,
  customer: {
    id: `${id}-customer`,
    user_id: uid,
    first_name: 'Ada',
    last_name: name,
    email: `${name.toLowerCase()}@gh93.example`,
    phone,
  },
});

const appointment = ({ id, name, time, status = 'scheduled', petId = `pet-${id}`, phone, duration = 60 }) => ({
  id,
  user_id: uid,
  pet_id: petId,
  tenant_id: tid,
  scheduled_at: `2026-09-17T${time}:00+02:00`,
  duration_minutes: duration,
  status,
  approval_status: 'approved',
  appointment_source: 'operator',
  requested_by_customer_id: null,
  notes: null,
  external_calendar: null,
  service_id: null,
  created_at: '2026-09-14T06:00:00Z',
  updated_at: '2026-09-14T06:00:00Z',
  service: null,
  pet: pet(petId, name, phone),
});

const appointments = [
  appointment({ id: 'cancel-twin', name: 'Davide', time: '09:00', status: 'cancelled', petId: 'pet-davide' }),
  appointment({ id: 'active-twin', name: 'Davide', time: '09:00', petId: 'pet-davide' }),
  appointment({ id: 'nine-2', name: 'NoveDue', time: '09:00' }),
  appointment({ id: 'nine-3', name: 'NoveTre', time: '09:00' }),
  appointment({ id: 'cancel-capacity', name: 'Piena', time: '11:00', status: 'cancelled' }),
  appointment({ id: 'eleven-1', name: 'UndiciUno', time: '11:00' }),
  appointment({ id: 'eleven-2', name: 'UndiciDue', time: '11:00' }),
  appointment({ id: 'eleven-3', name: 'UndiciTre', time: '11:00' }),
  appointment({ id: 'cancel-success', name: 'Libera', time: '14:00', status: 'cancelled' }),
  appointment({ id: 'cancel-stale', name: 'UltimaParola', time: '16:00', status: 'cancelled' }),
  appointment({ id: 'move-error', name: 'Sposta', time: '15:00' }),
  appointment({ id: 'no-phone', name: 'Promemoria', time: '17:00', phone: '' }),
  appointment({ id: 'absence', name: 'Assenza', time: '18:00' }),
  appointment({ id: 'delete-error', name: 'Elimina', time: '19:00' }),
];

let failNextWeekLoad = false;
let browser;

const jsonResponse = (route, data, status = 200, headers = {}) => route.fulfill({
  status,
  headers,
  contentType: 'application/json',
  body: JSON.stringify(data),
});

try {
  await mkdir(out, { recursive: true });
  const server = await createServer({
    root,
    configFile: false,
    envDir: false,
    cacheDir: '/private/tmp/gh93-vite-cache',
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh93-memory.invalid'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
      'import.meta.env.VITE_DEMO_MODE': JSON.stringify('false'),
    },
    server: { host: '127.0.0.1', port: 0, open: false },
  });
  try {
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
      if (url.origin !== 'https://gh93-memory.invalid') {
        results.unexpected.push(url.origin + url.pathname);
        return route.abort();
      }
      if (url.pathname === '/auth/v1/user') return jsonResponse(route, user);
      if (url.pathname === '/rest/v1/rpc/set_staff_appointment_status') {
        const payload = req.postDataJSON();
        results.rpcCalls.push({ rpc: 'set_staff_appointment_status', ...payload });
        if (payload.p_appointment_id === 'cancel-stale' && payload.p_status === 'scheduled') {
          return jsonResponse(route, { message: capacityMessage, details: 'GH37_APPOINTMENT_CAPACITY' }, 400);
        }
        const row = appointments.find((item) => item.id === payload.p_appointment_id);
        if (row) row.status = payload.p_status;
        return jsonResponse(route, row || null);
      }
      if (url.pathname === '/rest/v1/rpc/delete_staff_appointment') {
        const payload = req.postDataJSON();
        results.rpcCalls.push({ rpc: 'delete_staff_appointment', ...payload });
        return jsonResponse(route, { message: 'linked visit', details: 'GH58_APPOINTMENT_VISIT_LINKED' }, 400);
      }
      if (url.pathname.startsWith('/rest/v1/')) {
        const table = url.pathname.split('/').at(-1);
        if (table === 'appointments' && req.method() === 'PATCH') {
          const id = String(url.searchParams.get('id') || '').replace('eq.', '');
          if (id === 'move-error') return jsonResponse(route, { message: 'spostamento simulato non disponibile' }, 400);
          const row = appointments.find((item) => item.id === id);
          Object.assign(row || {}, req.postDataJSON());
          return jsonResponse(route, row ? [row] : []);
        }
        assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
        if (req.method() === 'HEAD') return jsonResponse(route, [], 200, { 'content-range': '*/0' });
        let data = [];
        if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role: 'owner', created_at: '2026-01-01' }];
        if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { workstation_capacity: 3, booking_schedule: {} } }];
        if (table === 'profiles') data = [{ id: uid, email: user.email, role: 'operator' }];
        if (table === 'appointment_requests' || table === 'visits') data = [];
        if (table === 'appointments') {
          const id = String(url.searchParams.get('id') || '').replace('eq.', '');
          const approval = url.searchParams.get('approval_status') || '';
          const status = url.searchParams.get('status') || '';
          if (id) data = appointments.filter((item) => item.id === id);
          else if (approval === 'eq.pending') data = [];
          else if (status === 'eq.scheduled' || status === 'neq.cancelled') data = appointments.filter((item) => item.status === 'scheduled');
          else {
            if (failNextWeekLoad) {
              failNextWeekLoad = false;
              return jsonResponse(route, { message: 'caricamento settimana simulato' }, 400);
            }
            data = appointments;
          }
        }
        const headers = table === 'appointments'
          ? { 'content-range': data.length ? `0-${data.length - 1}/${data.length}` : '*/0' }
          : {};
        if (req.headers().accept?.includes('vnd.pgrst.object')) return jsonResponse(route, data[0] || null, 200, headers);
        return jsonResponse(route, data, 200, headers);
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
      localStorage.setItem('sb-gh93-memory-auth-token', JSON.stringify({
        access_token: `e30.${payload}.memory`,
        refresh_token: 'memory',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: authUser,
      }));
    }, { userId: uid, authUser: user });
    await page.goto(`${origin}/calendar`);
    await page.getByText('4 annullati', { exact: true }).waitFor();

    const openCancelled = async (name) => {
      const details = page.locator('details.gh-planning-cancelled--many').first();
      const summary = details.locator('summary');
      if ((await details.getAttribute('open')) === null) await summary.click();
      await details.getByRole('button', { name, exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      return dialog;
    };
    const openActive = async (name) => {
      await page.locator('button.gh-planning-chip').filter({ hasText: name }).first().click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      return dialog;
    };
    const closeDialog = async (dialog) => {
      await dialog.locator('.gh-modal__close').click();
      await dialog.waitFor({ state: 'detached' });
    };
    const modalMeasure = async (dialog, message) => dialog.evaluate((modal, expected) => {
      const messageNode = [...modal.querySelectorAll('[role=alert],[role=status]')]
        .find((node) => node.textContent.trim() === expected);
      const buttons = [...modal.querySelectorAll('button')].filter((button) => button.getClientRects().length);
      const messageBox = messageNode?.getBoundingClientRect();
      const footerBox = modal.querySelector('.gh-modal__foot')?.getBoundingClientRect();
      return {
        messageInsideModal: Boolean(messageNode),
        messageTop: messageBox?.top ?? null,
        messageBottom: messageBox?.bottom ?? null,
        footerTop: footerBox?.top ?? null,
        gapToFooter: messageBox && footerBox ? footerBox.top - messageBox.bottom : null,
        visibleAboveFooter: Boolean(messageBox && footerBox && messageBox.bottom <= footerBox.top),
        visibleInViewport: Boolean(messageBox && messageBox.top >= 0 && messageBox.bottom <= window.innerHeight),
        overflow: Math.max(0, modal.scrollWidth - modal.clientWidth),
        truncatedMessages: [...modal.querySelectorAll('[role=alert],[role=status]')]
          .filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1)
          .length,
        minButtonWidth: Math.min(...buttons.map((button) => button.getBoundingClientRect().width)),
        minButtonHeight: Math.min(...buttons.map((button) => button.getBoundingClientRect().height)),
      };
    }, message);
    const controlMeasure = async (control) => control.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const footer = element.closest('.gh-modal').querySelector('.gh-modal__foot')?.getBoundingClientRect();
      return {
        top: box.top,
        bottom: box.bottom,
        visibleAboveFooter: Boolean(footer && box.bottom <= footer.top),
        visibleInViewport: box.top >= 0 && box.bottom <= window.innerHeight,
      };
    });

    let dialog = await openCancelled('Davide');
    const duplicateButton = dialog.getByRole('button', { name: 'Già rifatto' });
    assert.equal(await duplicateButton.isDisabled(), true);
    await dialog.getByText(duplicateMessage, { exact: true }).waitFor();
    results.restore.samePet = {
      button: await duplicateButton.innerText(),
      disabled: await duplicateButton.isDisabled(),
      buttonMeasure: await controlMeasure(duplicateButton),
      message: duplicateMessage,
      measure: await modalMeasure(dialog, duplicateMessage),
    };
    await page.screenshot({ path: `${out}/restore-same-pet-375.png`, fullPage: false });
    await closeDialog(dialog);
    assert.equal(await page.getByText(duplicateMessage, { exact: true }).count(), 0);
    assert.equal(await page.locator('main [role=alert]').count(), 0);
    results.restore.clearedOnClose = true;

    dialog = await openCancelled('Piena');
    const capacityButton = dialog.getByRole('button', { name: 'Postazioni occupate' });
    assert.equal(await capacityButton.isDisabled(), true);
    await dialog.getByText(capacityMessage, { exact: true }).waitFor();
    results.restore.capacity = {
      button: await capacityButton.innerText(),
      disabled: await capacityButton.isDisabled(),
      buttonMeasure: await controlMeasure(capacityButton),
      message: capacityMessage,
      distinctFromSamePet: capacityMessage !== duplicateMessage,
      measure: await modalMeasure(dialog, capacityMessage),
    };
    await page.screenshot({ path: `${out}/restore-capacity-375.png`, fullPage: false });
    await closeDialog(dialog);

    dialog = await openCancelled('Libera');
    const restoreButton = dialog.getByRole('button', { name: 'Ripristina programmato' });
    assert.equal(await restoreButton.isEnabled(), true);
    await restoreButton.click();
    const restoredMessage = 'Stato aggiornato: Programmato.';
    await dialog.getByText(restoredMessage, { exact: true }).waitFor();
    results.restore.success = {
      buttonBefore: 'Ripristina programmato',
      enabledBefore: true,
      statusAfter: appointments.find((item) => item.id === 'cancel-success').status,
      message: restoredMessage,
      measure: await modalMeasure(dialog, restoredMessage),
    };
    assert.equal(results.restore.success.statusAfter, 'scheduled');
    await closeDialog(dialog);

    dialog = await openCancelled('UltimaParola');
    const staleButton = dialog.getByRole('button', { name: 'Ripristina programmato' });
    assert.equal(await staleButton.isEnabled(), true);
    await staleButton.click();
    await dialog.getByRole('alert').filter({ hasText: capacityMessage }).waitFor();
    results.restore.databaseLastWord = {
      preflightButton: 'Ripristina programmato',
      enabledBefore: true,
      buttonMeasure: await controlMeasure(staleButton),
      message: capacityMessage,
      statusAfter: appointments.find((item) => item.id === 'cancel-stale').status,
      measure: await modalMeasure(dialog, capacityMessage),
    };
    assert.equal(results.restore.databaseLastWord.statusAfter, 'cancelled');
    await page.screenshot({ path: `${out}/restore-database-last-word-375.png`, fullPage: false });
    await closeDialog(dialog);

    dialog = await openActive('Sposta');
    await dialog.locator('input[type=time]').fill('15:15');
    await dialog.getByRole('button', { name: 'Salva orario' }).click();
    const moveError = "Non riesco a spostare l'appuntamento: spostamento simulato non disponibile";
    await dialog.getByRole('alert').filter({ hasText: moveError }).waitFor();
    results.otherActions.move = { message: moveError, location: 'detail modal', measure: await modalMeasure(dialog, moveError) };
    await closeDialog(dialog);

    dialog = await openActive('Promemoria');
    await dialog.getByRole('button', { name: 'Promemoria' }).click();
    const reminderError = 'Numero cliente non disponibile per WhatsApp.';
    await dialog.getByRole('alert').filter({ hasText: reminderError }).waitFor();
    results.otherActions.reminder = { message: reminderError, location: 'detail modal', measure: await modalMeasure(dialog, reminderError) };
    await closeDialog(dialog);

    dialog = await openActive('Assenza');
    await dialog.getByRole('button', { name: 'Segna assenza' }).click();
    const absenceSuccess = 'Assenza registrata con la data dell’appuntamento.';
    await dialog.getByText(absenceSuccess, { exact: true }).waitFor();
    results.otherActions.absence = { message: absenceSuccess, location: 'detail modal', measure: await modalMeasure(dialog, absenceSuccess) };
    await closeDialog(dialog);

    dialog = await openActive('Elimina');
    await dialog.getByRole('button', { name: 'Elimina', exact: true }).click();
    const deleteDialog = page.getByRole('dialog');
    await deleteDialog.getByRole('button', { name: 'Elimina definitivamente' }).click();
    const deleteError = 'Questo appuntamento ha una lavorazione collegata e non si elimina.';
    await deleteDialog.getByRole('alert').filter({ hasText: deleteError }).waitFor();
    results.otherActions.delete = { message: deleteError, location: 'delete modal', measure: await modalMeasure(deleteDialog, deleteError) };
    await deleteDialog.locator('.gh-modal__close').click();
    await page.getByRole('heading', { name: 'Elimina appuntamento' }).waitFor({ state: 'detached' });
    await closeDialog(page.getByRole('dialog'));

    failNextWeekLoad = true;
    await page.getByRole('button', { name: 'Settimana successiva' }).click();
    const loadError = 'Non riesco a caricare gli appuntamenti: caricamento settimana simulato';
    const pageAlert = page.locator('main > [role=alert]').filter({ hasText: loadError });
    await pageAlert.waitFor();
    results.outsideModal = {
      message: await pageAlert.innerText(),
      location: 'main page, no dialog',
      dialogs: await page.getByRole('dialog').count(),
    };
    assert.equal(results.outsideModal.dialogs, 0);

    const mobileMeasures = [
      results.restore.samePet.measure,
      results.restore.capacity.measure,
      results.restore.databaseLastWord.measure,
      results.otherActions.move.measure,
      results.otherActions.reminder.measure,
      results.otherActions.absence.measure,
      results.otherActions.delete.measure,
    ];
    assert.equal(mobileMeasures.every((item) => item.messageInsideModal), true);
    assert.equal(mobileMeasures.every((item) => item.overflow === 0 && item.truncatedMessages === 0), true);
    assert.equal(mobileMeasures.every((item) => item.visibleAboveFooter && item.visibleInViewport), true);
    assert.equal(mobileMeasures.every((item) => item.minButtonWidth >= 44 && item.minButtonHeight >= 44), true);
    assert.equal([
      results.restore.samePet.buttonMeasure,
      results.restore.capacity.buttonMeasure,
      results.restore.databaseLastWord.buttonMeasure,
    ].every((item) => item.visibleAboveFooter && item.visibleInViewport), true);
    assert.deepEqual(results.errors, []);
    assert.deepEqual(results.unexpected, []);
    results.elapsedMs = Date.now() - started;
    await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
    console.log(JSON.stringify({
      restores: Object.keys(results.restore),
      otherActions: Object.keys(results.otherActions),
      rpcCalls: results.rpcCalls.length,
      outsideModal: results.outsideModal,
      elapsedMs: results.elapsedMs,
    }, null, 2));
  } finally {
    await browser?.close();
    await server.close();
  }
} catch (error) {
  await browser?.close();
  throw error;
}
