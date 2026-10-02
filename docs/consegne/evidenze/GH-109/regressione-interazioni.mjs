import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const origin = process.env.GH107_PREVIEW || 'http://127.0.0.1:4178';
const browser = await chromium.launch();
const errors = [];
const results = [];
try {
  for (const mode of ['absent', 'rejected', 'granted', 'pending']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await context.addInitScript(mode => {
      window.wakeCalls = { requests: 0, releases: 0 };
      if (mode === 'absent') { delete Navigator.prototype.wakeLock; return; }
      Object.defineProperty(navigator, 'wakeLock', { value: {
        async request() {
          window.wakeCalls.requests++;
          if (mode === 'rejected') throw new Error('NotAllowedError');
          if (mode === 'pending') await new Promise(resolve => { window.resolveWake = resolve; });
          return { addEventListener() {}, async release() { window.wakeCalls.releases++; } };
        },
      } });
    }, mode);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/__gh107/view?visits=4&project`);
    await page.waitForFunction(() => !document.querySelector('.pet-card-show')?.disabled);
    await page.getByRole('button', { name: /Mostra al banco/ }).click();
    await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
    if (mode === 'pending') await page.evaluate(() => window.resolveWake());
    if (mode === 'granted' || mode === 'pending') await page.waitForFunction(() => window.wakeCalls.releases === 1);
    const measured = await page.evaluate(() => window.wakeCalls);
    assert.equal(measured.requests, mode === 'absent' ? 0 : 1);
    assert.equal(measured.releases, mode === 'granted' || mode === 'pending' ? 1 : 0);
    assert.equal(await page.getByRole('dialog').count(), 0);
    results.push({ mode, ...measured });
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(`${origin}/__gh107/view?visits=0&name=${'NomeLunghissimo'.repeat(8)}&photo=/missing-portrait.png`);
  await page.waitForFunction(() => !document.querySelector('.pet-card-show')?.disabled);
  await page.waitForFunction(() => !document.querySelector('.pet-card-portrait img'));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const pixels = await page.evaluate(async source => {
    const image = new Image(); image.src = source; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set();
    for (let index = 0; index < data.length; index += 4) colors.add([...data.subarray(index, index + 3)].join(','));
    return [...colors];
  }, 'data:image/png;base64,' + fs.readFileSync(new URL('qr-banco.png', import.meta.url)).toString('base64'));
  const colors = new Set(pixels);
  // Fractional x positioning may antialias the screenshot; the module interiors must be black and white.
  assert.ok(colors.has('0,0,0') && colors.has('255,255,255'));
  assert.deepEqual(errors, []);
  const result = { at: new Date().toISOString(), wakeLockMocks: results, portraitErrorFallback: 'PASS', longNameNoOverflow: 'PASS', qrPixelColors: [...colors], errors };
  fs.writeFileSync(new URL('regressione-interazioni.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
