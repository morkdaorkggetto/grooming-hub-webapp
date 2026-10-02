import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url)).replace(/\/$/, '');
const { loadEnv } = await import(root + '/node_modules/vite/dist/node/index.js');
const env = loadEnv('development', root, '');
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname, 'qttpinkslhenxrsbhhhg.supabase.co');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser = await chromium.launch({ headless: true });
const origin = 'http://127.0.0.1:4178';
const id = n => `00000000-0000-4000-8107-${String(n).padStart(12, '0')}`;
const results = [], errors = [];
async function newPage() {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await context.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    if (host.endsWith('.supabase.co') && host !== 'qttpinkslhenxrsbhhhg.supabase.co') throw new Error('DB fuori perimetro');
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', e => errors.push(e.message));
  return page;
}
async function login(page, who) {
  await page.locator('input[type=email]').fill(`${who}@test.example`);
  const key = who.startsWith('mario') ? 'GH_RLS_MARIO_PASSWORD' : 'GH_RLS_LUCA_PASSWORD';
  await page.locator('input[type=password]').fill(env[key]);
  await page.getByRole('button', { name: 'Accedi', exact: true }).click();
}
try {
  const page = await newPage();
  await page.goto(`${origin}/u/card/${id(4)}`);
  await page.waitForURL('**/u/login?redirect=**');
  await login(page, 'mario.rossi');
  await page.locator('[data-pet-card][data-tier=bronze]').waitFor();
  assert.ok(page.url().endsWith(id(4)));
  results.push({ test: 'login Mario e ritorno alla tessera richiesta', pass: true });
  await page.waitForFunction(() => document.querySelector('link[rel=manifest]')?.href.startsWith('blob:'));
  const manifest = await page.evaluate(async () => (await fetch(document.querySelector('link[rel=manifest]').href)).json());
  assert.equal(manifest.start_url, `${origin}/u/card/${id(4)}`);
  results.push({ test: 'manifest reale dedicato al pet', start_url: manifest.start_url, pass: true });
  for (const [n, tier] of [[3, 'none'], [4, 'bronze'], [12, 'silver'], [36, 'gold']]) {
    await page.goto(`${origin}/u/card/${id(n)}`);
    await page.locator(`[data-pet-card][data-tier=${tier}]`).waitFor();
    assert.equal(await page.locator('[data-pet-card] h1').innerText(), `[DEMO GH-107] ${n}`);
    results.push({ test: 'tessera con dati demo', visits: n, tier, pass: true });
  }
  await page.getByRole('link', { name: 'Torna alla Home', exact: true }).click();
  await page.locator('.pet-card-strip').first().waitFor();
  await page.waitForFunction(() => !document.querySelector('link[rel=manifest]').href.startsWith('blob:'));
  results.push({ test: 'manifest ripristinato su navigazione SPA', pass: true });
  assert.ok(await page.locator('.pet-card-strip').count() >= 4);
  await page.getByRole('link', { name: 'La tessera di [DEMO GH-107] 4', exact: true }).click();
  await page.locator('[data-pet-card][data-tier=bronze]').waitFor();
  await page.getByRole('button', { name: /Mostra al banco/ }).click();
  await page.getByRole('dialog').waitFor();
  await page.screenshot({ path: root + '/docs/consegne/evidenze/GH-109/banco-demo-vivo.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  results.push({ test: 'Home, tessera Bronzo e banco reale', pass: true });
  await page.goto(origin + '/u/card');
  await page.waitForURL('**/u/home#tessere');
  results.push({ test: 'shortcut multi-pet porta alle tessere Home', pass: true });
  let intercepted = false;
  const matcher = url => url.hostname === 'qttpinkslhenxrsbhhhg.supabase.co' && url.pathname === '/rest/v1/visits' && url.searchParams.get('pet_id') === `eq.${id(4)}`;
  await page.route(matcher, async route => {
    intercepted = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'GH107 synthetic network failure' }) });
  });
  await page.goto(`${origin}/u/card/${id(4)}`);
  await page.getByRole('status', { name: 'Caricamento tessera' }).waitFor();
  await page.getByRole('alert').filter({ hasText: 'Non riusciamo a leggere la tessera' }).waitFor();
  assert.equal(intercepted, true);
  assert.equal(await page.locator('[data-pet-card]').count(), 0);
  await page.unroute(matcher);
  await page.getByRole('button', { name: 'Riprova', exact: true }).click();
  await page.locator('[data-pet-card][data-tier=bronze]').waitFor();
  results.push({ test: 'caricamento, errore simulato senza tessera parziale e riprova', pass: true });
  const luca = await newPage();
  await luca.goto(`${origin}/u/card/${id(4)}`);
  await luca.waitForURL('**/u/login?redirect=**');
  await login(luca, 'luca.bianchi');
  await luca.getByText('Tessera non disponibile.', { exact: true }).waitFor();
  assert.equal(await luca.locator('[data-pet-card]').count(), 0);
  assert.equal(await luca.getByText('[DEMO GH-107] 4', { exact: true }).count(), 0);
  results.push({ test: 'Luca non riceve la tessera di Mario', pass: true });
  assert.deepEqual(errors, []);
} finally {
  fs.writeFileSync(root + '/docs/consegne/evidenze/GH-109/rotte-vive.json', JSON.stringify({ at: new Date().toISOString(), results, pageErrors: errors }, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify({ passed: results.length, pageErrors: errors }));
