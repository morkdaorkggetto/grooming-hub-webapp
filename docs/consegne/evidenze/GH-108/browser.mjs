import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const origin = process.env.GH107_PREVIEW || 'http://127.0.0.1:4178';
const output = new URL('./', import.meta.url);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page.addInitScript(() => {
  const OriginalDate = Date;
  window.Date = class extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : ['2026-10-01T12:00:00Z'])); }
    static now() { return new OriginalDate('2026-10-01T12:00:00Z').getTime(); }
  };
});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const states = [];
try {
  for (const [query, expected] of [
    ['visits=0', 'none'], ['visits=1', 'none'], ['visits=3', 'none'],
    ['visits=6', 'bronze'], ['visits=12', 'silver'], ['visits=41', 'gold'],
    ['visits=0&award=bronze', 'bronze'], ['visits=0&points=250', 'silver'],
    ['visits=3&project', 'none'], ['visits=4&project', 'bronze'], ['visits=12&project', 'silver'],
  ]) {
    await page.goto(`${origin}/__gh107/view?${query}&staff`);
    await page.getByRole('button', { name: /Mostra al banco/ }).waitFor();
    await page.waitForFunction(() => !document.querySelector('.pet-card-show')?.disabled);
    assert.equal(await page.locator('[data-pet-card]').getAttribute('data-tier'), expected);
    assert.equal(await page.locator('.pet-card-stamps').count(), expected === 'gold' ? 0 : 1);
    const text = await page.locator('[data-pet-card]').innerText();
    const staffText = await page.locator('.gh-client-tile__head').innerText();
    assert.ok(staffText.includes({ none: 'Base', bronze: 'Bronzo', silver: 'Argento', gold: 'Oro' }[expected]));
    assert.ok(!/mancano/i.test(text));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    states.push({ query, expected, text, staffText });
  }
  const geometry = [];
  for (const width of [320, 375, 1365]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${origin}/__gh107/view?visits=3&project`);
    await page.waitForFunction(() => !document.querySelector('.pet-card-show')?.disabled);
    const bounds = await page.locator('.pet-card-page').boundingBox();
    const button = await page.locator('.pet-card-show').boundingBox();
    assert.equal(bounds.width, Math.min(390, width));
    assert.ok(Math.abs(bounds.x - (width - bounds.width) / 2) < 1);
    assert.ok(button.height >= 54);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    geometry.push({ width, cardColumn: bounds, button });
    await page.screenshot({ path: new URL(`tessera-${width}.png`, output).pathname, fullPage: true });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${origin}/__gh107/view?visits=4&project`);
  await page.waitForFunction(() => !document.querySelector('.pet-card-show')?.disabled);
  const cdp = await page.context().newCDPSession(page);
  await page.waitForFunction(() => document.querySelector('link[rel=manifest]').href.startsWith('blob:'));
  const manifestResult = await cdp.send('Page.getAppManifest');
  assert.deepEqual(manifestResult.errors, []);
  const manifest = JSON.parse(manifestResult.data);
  assert.equal(new URL(manifest.start_url).pathname, '/u/card/local-synthetic');
  assert.equal(new URL(manifest.shortcuts[0].url).pathname, '/u/card/local-synthetic');
  const qr = await page.evaluate(async () => {
    const { getClientQrImageUrl, getPublicPetUrl } = await import('/src/shared/lib/qrCode.js');
    return { customer: document.querySelector('.pet-card-qr img').src, printed: await getClientQrImageUrl(window.gh107.pet.qr_token, 900), expected: getPublicPetUrl(window.gh107.pet.qr_token) };
  });
  fs.writeFileSync(new URL('qr-customer.png', output), Buffer.from(qr.customer.split(',')[1], 'base64'));
  fs.writeFileSync(new URL('qr-cartoncino.png', output), Buffer.from(qr.printed.split(',')[1], 'base64'));
  await page.getByRole('button', { name: /Mostra al banco/ }).click();
  const bankQr = await page.locator('.pet-card-bank-qr').boundingBox();
  assert.equal(bankQr.width, 300);
  assert.equal(bankQr.height, 300);
  assert.equal(await page.locator('.pet-card-bank').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
  assert.equal(await page.locator('#root').evaluate(el => el.inert), true);
  await page.locator('.pet-card-bank-qr').screenshot({ path: new URL('qr-banco.png', output).pathname });
  await page.screenshot({ path: new URL('banco-375.png', output).pathname });
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Chiudi');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.locator('#root').evaluate(el => el.inert), false);
  assert.match(await page.evaluate(() => document.activeElement.textContent), /Mostra al banco/);
  assert.deepEqual(errors, []);
  const result = { at: new Date().toISOString(), kind: 'local synthetic component bank, not authenticated route or RLS', states, geometry, bankQr, bankFocusAndEscape: 'PASS', manifest, qrExpected: qr.expected, pageErrors: errors };
  fs.writeFileSync(new URL('browser.json', output), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ states: states.length, geometry, bankQr, manifestErrors: manifestResult.errors, pageErrors: errors }));
} finally { await browser.close(); }
