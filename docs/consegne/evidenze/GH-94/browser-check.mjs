import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = `${root}/docs/consegne/evidenze/GH-94`;
const started = Date.now();
const uid = '94949494-9494-4494-8494-949494949494';
const tid = '94949494-1111-4111-8111-949494949494';
const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const user = { id: uid, email: 'staff@gh94.example', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const customer = (id, owner, phone) => ({ id: `customer-${id}`, user_id: uid, first_name: owner, last_name: '', email: `${id}@gh94.example`, phone });
const pet = (id, name, breed, owner, phone, photoUrl = null) => ({
  id, tenant_id: tid, customer_id: `customer-${id}`, owner_user_id: uid,
  name, breed, photo_url: photoUrl, no_show_score: 0, is_blacklisted: false,
  customer: customer(id, owner, phone),
});
const pets = [
  pet('p1', 'Barboncino', 'Toy', '3296167453', '3296167453', photo),
  pet('p2', 'barboncino', 'Nano', '3296167453', '3296167453'),
  pet('p3', 'Luna', null, 'Paola Foto', '3330000003', photo),
  pet('p4', 'Nina', null, 'Paola Base', '3330000004'),
  pet('p5', 'MiloUnique', 'Maltese', 'Marco', '3330000005'),
  pet('p6', 'Teo', 'Lagotto', 'Ada Distinta', '3330000006'),
  pet('p7', 'Rocky', 'Meticcio', 'Carlo', '3451112294'),
  pet('p8', 'Pippo', 'Beagle', 'Elena', '3330000008'),
  pet('p9', 'Kira', 'Shih Tzu', 'Fabio', '3330000009'),
  pet('p10', 'Leo', 'Cocker', 'Giada', '3330000010'),
  pet('p11', 'Maya', 'Bichon', 'Irene', '3330000011'),
  pet('p12', 'Ugo', 'Volpino', 'Luca', '3330000012'),
];

let petReads = 0;
let browser;
const results = { environment: 'Real app and SDK, memory HTTP only', uses: {}, cases: {}, search: {}, reads: {}, viewport: {}, errors: [], unexpected: [] };
const reply = (route, data, headers = {}) => route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify(data) });

const inspectList = async (dialog) => dialog.locator('.gh-pet-combobox__list').evaluate((list) => {
  const options = [...list.querySelectorAll('.gh-pet-combobox__option')];
  const box = list.getBoundingClientRect();
  const textNodes = options.flatMap((option) => [...option.querySelectorAll('.gh-pet-combobox__copy > *')]);
  return {
    count: options.length,
    overflowX: Math.max(0, list.scrollWidth - list.clientWidth),
    outsideViewportX: Math.max(0, -box.left) + Math.max(0, box.right - window.innerWidth),
    truncated: textNodes.filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).length,
    minTargetHeight: Math.min(...options.map((option) => option.getBoundingClientRect().height)),
    rows: options.slice(0, 4).map((option) => ({
      name: option.querySelector('strong')?.textContent,
      detail: option.querySelector('.gh-pet-combobox__copy > span')?.textContent,
      image: Boolean(option.querySelector('img')),
      initial: option.querySelector('.gh-pet-combobox__initial')?.textContent.trim() || null,
    })),
  };
});

try {
  await mkdir(out, { recursive: true });
  const server = await createServer({
    root, configFile: false, envDir: false, cacheDir: '/private/tmp/gh94-vite-cache', plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gh94-memory.invalid'),
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
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ body: '' });
      if (url.origin !== 'https://gh94-memory.invalid') {
        results.unexpected.push(url.origin + url.pathname);
        return route.abort();
      }
      if (url.pathname === '/auth/v1/user') return reply(route, user);
      if (url.pathname.startsWith('/rest/v1/')) {
        const table = url.pathname.split('/').at(-1);
        if (table === 'pets') petReads += 1;
        let data = [];
        if (table === 'tenant_memberships') data = [{ tenant_id: tid, user_id: uid, role: 'owner', created_at: '2026-01-01' }];
        if (table === 'tenants') data = [{ id: tid, slug: 'gh94', name: 'GH-94 memoria', settings: { workstation_capacity: 3, booking_schedule: {} } }];
        if (table === 'profiles') data = [{ id: uid, email: user.email, role: 'operator' }];
        if (table === 'pets') data = pets;
        const headers = { 'content-range': data.length ? `0-${data.length - 1}/${data.length}` : '*/0' };
        if (request.method() === 'HEAD') return reply(route, [], headers);
        if (request.headers().accept?.includes('vnd.pgrst.object')) return reply(route, data[0] || null, headers);
        return reply(route, data, headers);
      }
      results.unexpected.push(url.pathname);
      return route.abort();
    });

    const page = await context.newPage();
    page.on('pageerror', (error) => results.errors.push(error.message));
    await page.goto(`${origin}/login`);
    await page.evaluate(({ userId, authUser }) => {
      const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 }));
      localStorage.setItem('sb-gh94-memory-auth-token', JSON.stringify({ access_token: `e30.${payload}.memory`, refresh_token: 'memory', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: authUser }));
    }, { userId: uid, authUser: user });
    await page.goto(`${origin}/calendar`);
    await page.getByRole('heading', { name: 'Dove lo metto' }).waitFor();

    await page.locator('.gh-fab').click();
    let dialog = page.getByRole('dialog');
    let input = dialog.getByRole('combobox', { name: 'Pet' });
    await input.fill('');
    await dialog.locator('.gh-pet-combobox__option').nth(11).waitFor();
    results.uses.work = await inspectList(dialog);
    results.cases = Object.fromEntries(results.uses.work.rows.map((row) => [row.name, row]));
    results.reads.afterWork = petReads;
    await page.screenshot({ path: `${out}/work-375.png` });

    const searches = [
      ['name', 'MiloUnique', 'MiloUnique'],
      ['owner', 'Ada Distinta', 'Teo'],
      ['phone', '3451112294', 'Rocky'],
      ['breed', 'Lagotto', 'Teo'],
    ];
    for (const [key, query, expected] of searches) {
      await input.fill(query);
      const names = await dialog.locator('.gh-pet-combobox__option strong').allTextContents();
      assert.deepEqual(names, [expected]);
      results.search[key] = { query, result: expected };
    }
    await dialog.locator('.gh-modal__close').click();

    await page.setViewportSize({ width: 1365, height: 900 });
    await page.getByRole('button', { name: 'Nuovo appuntamento', exact: true }).click();
    dialog = page.getByRole('dialog');
    input = dialog.getByRole('combobox', { name: 'Pet' });
    await input.focus();
    await dialog.locator('.gh-pet-combobox__option').nth(11).waitFor();
    results.uses.appointment = await inspectList(dialog);
    results.reads.afterAppointment = petReads;
    await page.screenshot({ path: `${out}/appointment-1365.png` });

    assert.equal(results.uses.work.count, 12);
    assert.equal(results.uses.appointment.count, 12);
    for (const measure of Object.values(results.uses)) {
      assert.equal(measure.overflowX, 0);
      assert.equal(measure.outsideViewportX, 0);
      assert.equal(measure.truncated, 0);
      assert(measure.minTargetHeight >= 44);
    }
    assert.equal(results.cases.Barboncino.image, true);
    assert.equal(results.cases.barboncino.initial, 'B');
    assert.equal(results.cases.Luna.detail.startsWith('Razza non indicata'), true);
    assert.equal(results.cases.Nina.initial, 'N');
    assert.notEqual(results.cases.Barboncino.detail, results.cases.barboncino.detail);
    assert.equal(results.reads.afterWork, 1);
    assert.equal(results.reads.afterAppointment, 1);
    assert.deepEqual(results.errors, []);
    assert.deepEqual(results.unexpected, []);
    results.viewport = { mobile: '375x812', desktop: '1365x900' };
    results.elapsedMs = Date.now() - started;
    await writeFile(`${out}/browser.json`, `${JSON.stringify(results, null, 2)}\n`);
    console.log(JSON.stringify({ uses: results.uses, search: results.search, reads: results.reads, elapsedMs: results.elapsedMs }, null, 2));
  } finally {
    await browser?.close();
    await server.close();
  }
} catch (error) {
  await browser?.close();
  throw error;
}
