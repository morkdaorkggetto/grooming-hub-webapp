import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createServer, loadEnv } from '/Users/luigimaisto/Desktop/grooming-hub-web/webapp/node_modules/vite/dist/node/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-90/live-browser.json`;
const env = loadEnv('development', root, '');
const expectedRef = 'qttpinkslhenxrsbhhhg';
assert.match(env.VITE_SUPABASE_URL || '', new RegExp(`^https://${expectedRef}\\.supabase\\.co/?$`));
assert.ok(env.VITE_SUPABASE_ANON_KEY, 'Missing demo anon key');
assert.ok(env.GH_RLS_STAFF_PASSWORD, 'Missing documented staff password');

const started = Date.now();
const server = await createServer({
  root,
  cacheDir: '/private/tmp/gh90-live-vite-cache',
  server: { host: '127.0.0.1', port: 0, open: false },
});
let browser;

try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, timezoneId: 'Europe/Rome' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}/login`);
  await page.getByLabel('Email').fill(env.GH_RLS_STAFF_EMAIL || 'staff.sonda@test.example');
  await page.getByLabel('Password').fill(env.GH_RLS_STAFF_PASSWORD);
  await page.getByRole('button', { name: 'Accedi', exact: true }).click();
  await page.waitForURL('**/dashboard');
  await page.goto(`${origin}/requests`);
  await page.getByText('Nessuna richiesta in attesa', { exact: true }).waitFor();
  const result = {
    projectRef: expectedRef,
    route: '/requests',
    cards: await page.locator('.gh-request-card').count(),
    badge: await page.locator('.gh-request-alert__count').count(),
    emptyText: await page.getByText('Nessuna richiesta in attesa', { exact: true }).innerText(),
    pageErrors: errors,
    elapsedMs: Date.now() - started,
  };
  assert.equal(result.cards, 0);
  assert.equal(result.badge, 0);
  assert.deepEqual(result.pageErrors, []);
  await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
