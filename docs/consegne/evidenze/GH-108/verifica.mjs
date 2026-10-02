import fs from 'node:fs';
import assert from 'node:assert/strict';
const { chromium } = await import('/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser = await chromium.launch();
const out = new URL('./', import.meta.url), origin = 'http://127.0.0.1:4179/__gh108';
const errors = [], geometry = [], comparisons = [], states = [], devices = [];
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < .15, `${label}: ${actual} != ${expected}`);
const page = await browser.newPage({ deviceScaleFactor: 2 });
page.on('pageerror', e => errors.push(e.message));
await page.route('**/*.supabase.co/**', route => { throw Error('No DB allowed in this local test'); });
async function open(query = '') {
  await page.goto(origin + '?' + query);
  await page.waitForFunction(() => !document.querySelector('.pet-card-show')?.disabled);
  await page.waitForFunction(() => document.querySelector('.pet-card-install'));
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.pet-card-show')).opacity === '1');
}
try {
  for (const width of [320, 375, 1365]) for (const photo of [false, true]) {
    await page.setViewportSize({ width, height: 1000 });
    await open(photo ? 'photo' : '');
    if (photo) await page.locator('.pet-card-portrait img').evaluate(img => img.decode());
    const g = await page.evaluate(() => {
      const el = s => document.querySelector(s), box = s => el(s).getBoundingClientRect(), css = s => getComputedStyle(el(s));
      const card = box('.pet-card-surface'), column = box('.pet-card-page'), name = box('.pet-card-identity h1'), breed = box('.pet-card-identity p'), portrait = el('.pet-card-identity > .pet-card-portrait');
      const brand = box('.pet-card-surface > div:first-child'), title = box('.pet-card-story > p:first-child'), detail = box('.pet-card-story > p:last-child'), stamps = box('.pet-card-stamps'), rule = box('.pet-card-rule'), qr = box('.pet-card-qr'), button = box('.pet-card-show'), invite = box('.pet-card-install'), back = box('.pet-card-back'), header = box('.pet-card-header'), heading = box('.pet-card-header p');
      const rounded = [...document.querySelectorAll('.pet-card-surface *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && parseFloat(getComputedStyle(e).borderTopLeftRadius) >= Math.min(b.width, b.height) / 2; }).map(e => e.className);
      return { width: innerWidth, photo: Boolean(portrait), column: column.width, columnCenter: column.x + column.width / 2, margin: card.x - column.x, paddingX: parseFloat(css('.pet-card-surface').paddingLeft), paddingY: parseFloat(css('.pet-card-surface').paddingTop), headerHeight: header.height, headerColumns: css('.pet-card-header').gridTemplateColumns, headingCenter: heading.x + heading.width / 2, headingFont: css('.pet-card-header p').fontSize, back: { width: back.width, height: back.height, radius: css('.pet-card-back').borderRadius, icon: box('.pet-card-back svg').width },
        brandToIdentity: (portrait ? portrait.getBoundingClientRect().top : name.top) - brand.bottom,
        portraitToName: portrait ? name.top - portrait.getBoundingClientRect().bottom : null,
        nameToBreed: breed.top - name.bottom, identityToTitle: title.top - breed.bottom, titleToDetail: detail.top - title.bottom, detailToStamps: stamps.top - detail.bottom, stampsToRule: rule.top - stamps.bottom, ruleToQr: qr.top - rule.bottom, cardToButton: button.top - card.bottom, buttonToInvite: invite.top - button.bottom,
        portrait: portrait ? { width: portrait.getBoundingClientRect().width, height: portrait.getBoundingClientRect().height, radius: getComputedStyle(portrait).borderRadius } : null,
        button: { height: button.height, font: css('.pet-card-show').fontSize, weight: css('.pet-card-show strong').fontWeight, radius: css('.pet-card-show').borderRadius, background: css('.pet-card-show').backgroundColor, color: css('.pet-card-show').color, opacity: css('.pet-card-show').opacity, labelHeight: box('.pet-card-show strong').height, nowrap: css('.pet-card-show').whiteSpace, overflow: el('.pet-card-show').scrollWidth > el('.pet-card-show').clientWidth },
        qr: { image: box('.pet-card-qr img').width, padding: css('.pet-card-qr').paddingTop, radius: css('.pet-card-qr').borderRadius }, circles: rounded, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    close(g.column, Math.min(width, 390), 'column'); close(g.columnCenter, width / 2, 'center');
    close(g.margin, width === 320 ? 12 : 16, 'page margin'); close(g.paddingX, width === 320 ? 16 : 20, 'padding X'); close(g.paddingY, 24, 'padding Y'); close(g.headerHeight, 56, 'header'); close(g.headingCenter, width / 2, 'title center');
    for (const [key, expected] of Object.entries({ brandToIdentity: 20, nameToBreed: 4, identityToTitle: 24, titleToDetail: 6, detailToStamps: 16, stampsToRule: 12, ruleToQr: 20, cardToButton: 12, buttonToInvite: 12 })) close(g[key], expected, key);
    if (photo) { close(g.portraitToName, 14, 'portrait gap'); assert.deepEqual(g.portrait, { width: 88, height: 88, radius: '18px' }); }
    else assert.deepEqual(g.circles, []);
    assert.deepEqual(g.back, { width: 44, height: 44, radius: '12px', icon: 20 });
    assert.equal(g.button.height, 54); assert.equal(g.button.font, '19px'); assert.equal(g.button.weight, '700'); assert.equal(g.button.labelHeight, 19); assert.equal(g.button.background, 'rgb(94, 133, 128)'); assert.equal(g.button.opacity, '1'); assert.equal(g.button.overflow, false); assert.equal(g.overflow, false);
    assert.deepEqual(g.qr, { image: 76, padding: '6px', radius: '10px' });
    geometry.push(g);
    const stem = `${width}-${photo ? 'foto' : 'senza-foto'}`;
    const actual = await page.screenshot({ fullPage: true });
    await page.goto(origin + '?reference' + (photo ? '&photo' : ''));
    await page.getByText('Mostra al banco', { exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const reference = await page.screenshot({ fullPage: true });
    const comparison = await browser.newPage({ viewport: { width: width * 2, height: 1060 } });
    await comparison.setContent(`<body style="margin:0;display:flex"><section><h3>CD-10 (QR e foto segnaposto)</h3><img width="${width}" src="data:image/png;base64,${reference.toString('base64')}"></section><section><h3>GH-108 (QR reale; immagine locale di prova)</h3><img width="${width}" src="data:image/png;base64,${actual.toString('base64')}"></section></body>`);
    await comparison.screenshot({ path: new URL(`confronto-${stem}.png`, out).pathname, fullPage: true });
    await comparison.close();
    comparisons.push(stem);
  }
  await page.setViewportSize({ width: 375, height: 1000 });
  const tiles = [];
  for (const total of [4, 5, 6, 8, 12, 36]) {
    await open('tiles=' + total + '&strip');
    const measured = await page.locator('[data-test-tiles] .pet-card-stamps').evaluate(e => ({ total: e.children.length, width: e.getBoundingClientRect().width, rowTops: [...new Set([...e.children].map(c => c.getBoundingClientRect().top))], height: e.children[0].getBoundingClientRect().height, ticks: e.classList.contains('pet-card-stamps--ticks') }));
    assert.equal(measured.total, total); assert.equal(measured.width, 343); assert.equal(measured.rowTops.length, total <= 6 ? 1 : 2); assert.equal(measured.height, total <= 6 ? 44 : total <= 12 ? 36 : 14); assert.equal(measured.ticks, total > 12); tiles.push(measured);
    const strip = await page.locator('.pet-card-portrait--compact').evaluate(e => ({ width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height, radius: getComputedStyle(e).borderRadius, icon: e.querySelector('svg').getAttribute('width') }));
    assert.deepEqual(strip, { width: 48, height: 48, radius: '12px', icon: '24' });
    assert.equal(await page.locator('.pet-card-strip').evaluate(e => [e, ...e.querySelectorAll('*')].filter(n => { const b = n.getBoundingClientRect(); return b.width && b.height && parseFloat(getComputedStyle(n).borderTopLeftRadius) >= Math.min(b.width, b.height) / 2; }).length), 0);
  }
  await open('strip&photo');
  assert.equal(await page.locator('.pet-card-portrait--compact img').count(), 1);
  assert.equal(await page.locator('.pet-card-portrait--compact svg').count(), 0);
  for (const [query, count, title, period] of [
    ['date=2026-11-06T12:00:00Z', 4, 'La prossima è quella del Bronzo.', null],
    ['date=2026-11-07T12:00:00Z', 5, 'La prossima è la quarta.', null],
    ['date=2027-03-06T12:00:00Z', 6, null, '12'],
    ['visits=4', 12, 'Nina è Bronzo.', '24'], ['visits=12', 36, 'Nina è Argento.', '36'], ['visits=36', 0, 'Nina è Oro.', 'highest'],
  ]) {
    await open(query);
    assert.equal(await page.locator('.pet-card-stamp').count(), count);
    if (title) assert.equal(await page.locator('.pet-card-story > p:first-child').innerText(), title);
    const rule = await page.locator('.pet-card-rule').innerText();
    if (!period) assert.equal(rule, 'Ogni visita da noi è un timbro.');
    else if (period === 'highest') assert.equal(rule, 'Il livello più alto della tessera.');
    else assert.ok(rule.includes(`ultimi ${period} mesi`));
    assert.ok(!rule.includes('6 marzo'));
    if (count === 4) assert.equal(await page.locator('.pet-card-story > p:last-child').innerText(), '3 visite fatte, ne basta una.');
    states.push({ query, count, title, rule });
  }
  await open('visits=4&photo');
  const chipGap = await page.evaluate(() => document.querySelector('.pet-card-tier').getBoundingClientRect().top - document.querySelector('.pet-card-identity p').getBoundingClientRect().bottom);
  close(chipGap, 12, 'breed to tier');
  const portraitBorder = await page.locator('.pet-card-portrait').evaluate(e => ({ width: getComputedStyle(e).borderTopWidth, color: getComputedStyle(e).borderTopColor }));
  assert.ok(fs.readFileSync(new URL('../../../../src/apps/customer/components/pet-card.css', import.meta.url), 'utf8').includes('border: 1.5px solid transparent'));
  // Headless Chromium quantizes the declared 1.5px border to whole CSS pixels.
  assert.ok(['1px', '1.5px'].includes(portraitBorder.width));
  const buttonStates = [];
  for (const state of ['rest', 'hover', 'focus']) {
    if (state === 'hover') await page.locator('.pet-card-show').hover();
    if (state === 'focus') await page.locator('.pet-card-show').focus();
    await page.waitForTimeout(200);
    const style = await page.locator('.pet-card-show').evaluate(e => ({ background: getComputedStyle(e).backgroundColor, opacity: getComputedStyle(e).opacity }));
    assert.deepEqual(style, { background: 'rgb(94, 133, 128)', opacity: '1' }); buttonStates.push({ state, ...style });
  }
  for (const [device, userAgent, instruction] of [['desktop', 'Mozilla/5.0 Desktop', null], ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'Su iPhone:'], ['Android', 'Mozilla/5.0 (Linux; Android 14)', 'Su Android:']]) {
    const context = await browser.newContext({ userAgent }); const p = await context.newPage();
    await p.goto(origin); await p.locator('.pet-card-install').waitFor();
    const text = await p.locator('.pet-card-install').innerText();
    assert.ok(text.includes('Tienila a portata. Aggiungila alla schermata Home.'));
    if (instruction) assert.ok(text.includes(instruction)); else assert.equal(text.trim(), 'Tienila a portata. Aggiungila alla schermata Home.');
    devices.push({ device, text }); await context.close();
  }
  const luminance = values => values.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
  const contrast = (luminance([251, 246, 243]) + .05) / (luminance([94, 133, 128]) + .05);
  assert.ok(contrast >= 3); assert.deepEqual(errors, []);
  fs.writeFileSync(new URL('verifica.json', out), JSON.stringify({ at: new Date().toISOString(), geometry, tiles, chipGap, portraitBorder, states, buttonStates, contrast, devices, comparisons, errors }, null, 2) + '\n');
  console.log(JSON.stringify({ geometries: geometry.length, tileCases: tiles.length, states: states.length, contrast, errors }));
} finally { await browser.close(); }
