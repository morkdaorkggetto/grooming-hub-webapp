import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-92`;
const base = '147875586819f057d394c2ada9f9142a74f442c8';
const cssPath = `${root}/src/apps/staff/styles/gh15-staff.css`;
const pagePath = `${root}/src/apps/staff/pages/CustomerRequests.jsx`;
const started = Date.now();
const results = {
  environment: 'Real app and SDK, memory HTTP only, Chromium Europe/Rome',
  base,
  approval: {},
  alternatives: {},
  errors: [],
  unexpected: [],
};

const uid = '92929292-9292-4292-8292-929292929292';
const tid = '92929292-1111-4111-8111-929292929292';
const user = {
  id: uid,
  email: 'staff@gh92.example',
  aud: 'authenticated',
  role: 'authenticated',
  user_metadata: {},
  app_metadata: {},
};
const owner = {
  id: uid,
  user_id: uid,
  tenant_id: tid,
  first_name: 'Ada',
  last_name: 'Prova',
  email: user.email,
  phone: '+393330000092',
};
const pet = {
  id: '92929292-2222-4222-8222-929292929292',
  tenant_id: tid,
  customer_id: uid,
  owner_user_id: uid,
  name: 'Rumba',
  breed: 'Barboncino',
  photo_url: null,
  no_show_score: 0,
  is_blacklisted: false,
  birth_date: '2022-01-01',
  customer: owner,
};
const request = {
  id: '92929292-3333-4333-8333-929292929292',
  tenant_id: tid,
  customer_user_id: uid,
  pet_id: pet.id,
  service_id: 'service',
  desired_date: '2026-09-21',
  time_preference: 'morning',
  duration_minutes: 60,
  coat_condition_codes: [],
  coat_condition_notes: null,
  declared_pet_age: null,
  status: 'pending',
  appointment_id: null,
  staff_responded_at: '2026-09-13T08:00:00Z',
  proposed_alternatives: [
    { date: '2026-09-21', time: '10:00', time_preference: 'morning' },
    { date: '2026-09-22', time: '11:00', time_preference: 'morning' },
  ],
  alternatives_round: 1,
  chosen_date: '2026-09-21',
  chosen_time: '10:00',
  chosen_time_preference: 'morning',
  customer_response: 'accepted',
  customer_responded_at: '2026-09-13T09:00:00Z',
  created_at: '2026-09-13T07:00:00Z',
  updated_at: '2026-09-13T09:00:00Z',
  service: { id: 'service', name: 'Bagno', duration_minutes: 60 },
  appointment: null,
  pet,
};

const rounded = (value) => Math.round(value * 1000) / 1000;

async function measureVariant({ baseline, viewport, screenshot }) {
  const host = baseline ? 'gh92-before.invalid' : 'gh92-after.invalid';
  const plugin = {
    name: baseline ? 'gh92-baseline' : 'gh92-current',
    enforce: 'pre',
    load(id) {
      if (!baseline || (id !== cssPath && id !== pagePath)) return null;
      const relative = id.slice(root.length + 1);
      return execFileSync('git', ['show', `${base}:${relative}`], { cwd: root, encoding: 'utf8' });
    },
  };
  const server = await createServer({
    root,
    configFile: false,
    envDir: false,
    cacheDir: `/private/tmp/gh92-vite-${baseline ? 'before' : 'after'}-${viewport.width}`,
    plugins: [plugin, react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(`https://${host}`),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('memory-only'),
    },
    server: { host: '127.0.0.1', port: 0, open: false },
  });
  let browser;
  try {
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport, timezoneId: 'Europe/Rome' });
    await context.routeWebSocket('**/*', (socket) => socket.close());
    await context.route('**/*', async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin === origin) return route.continue();
      if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ body: '' });
      if (url.hostname !== host) {
        results.unexpected.push(url.origin + url.pathname);
        return route.abort();
      }
      const json = (data, headers = {}) => route.fulfill({
        status: 200,
        headers,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
      if (url.pathname === '/auth/v1/user') return json(user);
      if (url.pathname.startsWith('/rest/v1/')) {
        assert(['GET', 'HEAD'].includes(req.method()), `${req.method()} ${url.pathname}`);
        if (req.method() === 'HEAD') return json([], { 'content-range': '*/0' });
        const table = url.pathname.split('/').at(-1);
        let data = [];
        if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role: 'owner', created_at: '2026-01-01' }];
        if (table === 'tenants') data = [{ id: tid, slug: 'grooming-hub', name: 'Salone in memoria', settings: { workstation_capacity: 3, booking_schedule: {} } }];
        if (table === 'profiles') data = [{ id: uid, email: user.email, role: 'owner' }];
        if (table === 'appointment_requests') data = [request];
        if (table === 'appointments') data = [];
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
    await page.evaluate(({ uid: userId, user: authUser, hostName }) => {
      const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 }));
      localStorage.setItem(`sb-${hostName.split('.')[0]}-auth-token`, JSON.stringify({
        access_token: `e30.${payload}.memory`,
        refresh_token: 'memory',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: authUser,
      }));
    }, { uid, user, hostName: host });
    await page.goto(`${origin}/requests`);
    await page.getByRole('button', { name: 'Conferma', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();

    const measureDialog = async () => page.evaluate(() => {
      const modal = document.querySelector('[role=dialog]');
      const grid = modal.querySelector('.gh-dialog-fields');
      const inputs = [...grid.querySelectorAll('input')];
      const labels = [...grid.querySelectorAll('.gh-field-label')];
      const lineCount = (element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top * 10) / 10)).size;
      };
      const controls = [...modal.querySelectorAll('button,a,input,select')]
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            name: element.getAttribute('aria-label') || element.textContent.trim() || element.type,
            width: box.width,
            height: box.height,
            truncated: element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1,
          };
        });
      return {
        columns: getComputedStyle(grid).gridTemplateColumns,
        alignItems: getComputedStyle(grid).alignItems,
        inputTop: inputs.map((input) => input.getBoundingClientRect().top),
        inputBottom: inputs.map((input) => input.getBoundingClientRect().bottom),
        labelText: labels.map((label) => label.textContent.trim()),
        labelLines: labels.map(lineCount),
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        controls,
      };
    });

    const normal = await measureDialog();
    if (screenshot) await page.screenshot({ path: `${out}/${screenshot}`, fullPage: false });
    const longLabel = await dialog.locator('.gh-field-label').nth(0).evaluate((element) => {
      element.textContent = 'Giorno richiesto con una etichetta volutamente molto lunga';
      return element.textContent;
    });
    const forced = await measureDialog();
    assert.equal(forced.labelText[0], longLabel);
    if (screenshot && !baseline && viewport.width === 1365) {
      await page.screenshot({ path: `${out}/approval-after-forced-label-1365.png`, fullPage: false });
    }

    await dialog.getByRole('button', { name: 'Annulla' }).click();
    await page.getByRole('button', { name: 'Proponi alternative' }).click();
    const alternativesDialog = page.getByRole('dialog');
    await alternativesDialog.waitFor();
    const alternatives = await alternativesDialog.evaluate((modal) => ({
      rows: [...modal.querySelectorAll('.gh-dialog-fields')].map((row) => ({
        columns: getComputedStyle(row).gridTemplateColumns,
        inputTop: [...row.querySelectorAll('input')].map((input) => input.getBoundingClientRect().top),
      })),
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    }));

    const normalize = (measurement) => ({
      ...measurement,
      inputTop: measurement.inputTop.map(rounded),
      inputBottom: measurement.inputBottom.map(rounded),
      controls: measurement.controls.map((control) => ({
        ...control,
        width: rounded(control.width),
        height: rounded(control.height),
      })),
    });
    return {
      normal: normalize(normal),
      forced: normalize(forced),
      alternatives: {
        ...alternatives,
        rows: alternatives.rows.map((row) => ({ ...row, inputTop: row.inputTop.map(rounded) })),
      },
    };
  } finally {
    await browser?.close();
    await server.close();
  }
}

await mkdir(out, { recursive: true });
results.approval.before1365 = await measureVariant({ baseline: true, viewport: { width: 1365, height: 900 }, screenshot: 'approval-before-1365.png' });
results.approval.after1365 = await measureVariant({ baseline: false, viewport: { width: 1365, height: 900 }, screenshot: 'approval-after-1365.png' });
results.approval.after375 = await measureVariant({ baseline: false, viewport: { width: 375, height: 812 }, screenshot: 'approval-after-375.png' });
results.alternatives.after1365 = results.approval.after1365.alternatives;
results.alternatives.after375 = results.approval.after375.alternatives;

assert.notDeepEqual(results.approval.before1365.normal.inputTop, [results.approval.before1365.normal.inputTop[0], results.approval.before1365.normal.inputTop[0], results.approval.before1365.normal.inputTop[0]]);
assert.equal(new Set(results.approval.after1365.normal.inputTop).size, 1);
assert.equal(new Set(results.approval.after1365.forced.inputTop).size, 1);
assert.deepEqual(results.approval.after1365.normal.labelLines, [1, 1, 1]);
assert.deepEqual(results.approval.after375.normal.labelLines, [1, 1, 1]);
assert.equal(results.approval.after375.normal.columns.trim().split(/\s+/).length, 1);
assert.equal(results.alternatives.after1365.rows.every((row) => new Set(row.inputTop).size === 1), true);
assert.equal(results.alternatives.after375.rows[0].columns.trim().split(/\s+/).length, 1);
assert.equal(results.approval.after1365.normal.overflow, 0);
assert.deepEqual(
  results.approval.after1365.normal.controls.map(({ height, truncated }) => ({ height, truncated })),
  results.approval.before1365.normal.controls.map(({ height, truncated }) => ({ height, truncated })),
);
assert.equal(results.approval.after375.normal.overflow, 0);
assert.deepEqual(
  results.approval.after375.normal.controls.filter((control) => control.width < 44 || control.height < 44 || control.truncated),
  [],
);
assert.deepEqual(results.errors, []);
assert.deepEqual(results.unexpected, []);
results.elapsedMs = Date.now() - started;
await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({
  before: results.approval.before1365.normal.inputTop,
  after: results.approval.after1365.normal.inputTop,
  forced: results.approval.after1365.forced.inputTop,
  labelLines375: results.approval.after375.normal.labelLines,
  columns375: results.approval.after375.normal.columns,
  elapsedMs: results.elapsedMs,
}, null, 2));
