import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { createServer, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const evidence = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('development', root, '');
const ref = 'qttpinkslhenxrsbhhhg';
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname, `${ref}.supabase.co`);
const marker = '[DEMO GH-104]';
const checked = ({ data, error }) => { if (error) throw error; return data; };
const results = [];
const record = (name, value) => { results.push({ name, value }); console.log(JSON.stringify({ name, value })); };
const ids = { pets: [], appointments: [], requests: [] };
const errors = [];
const startedAt = new Date().toISOString();
let server, browser, staff, page, origin, fixture, sibling;
let passed = false;
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });
const day = n => new Date(Date.parse(`${today}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const beforeCode = execFileSync('git', ['show', '8b51c0e:src/apps/staff/lib/database.js'], { cwd: root, encoding: 'utf8' });
const oldId = `${root}/src/apps/staff/lib/database-gh104-before.js`;
const dbCall = (name, args = [], old = false) => page.evaluate(async ({ name, args, old }) => {
  const db = await import(old ? '/src/apps/staff/lib/database-gh104-before.js' : '/src/apps/staff/lib/database.js');
  return db[name](...args);
}, { name, args, old });
const detail = async () => {
  await page.goto(`${origin}/client/${fixture.id}`);
  await page.getByRole('heading', { name: 'Prossimo appuntamento', exact: true }).waitFor();
};
const panel = () => page.locator('.gh-next-appointments');
const agenda = () => panel().getByRole('list', { name: 'Appuntamenti in agenda' });
async function calendarOn(date) {
  const expected = new Date(`${date}T12:00:00Z`).toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long',
  });
  await page.getByRole('button', { name: 'Giorno', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Giorno', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.waitForFunction(expected => document.querySelector('.gh-planning-range__wide')?.textContent === expected, expected);
  return expected;
}
try {
  staff = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const auth = checked(await staff.auth.signInWithPassword({ email: 'staff.sonda@test.example', password: env.GH_RLS_STAFF_PASSWORD }));
  const customer = checked(await staff.from('customers').select('id,tenant_id,user_id').eq('email', 'mario.rossi@test.example').single());
  const service = checked(await staff.from('services').select('id,name').eq('tenant_id', customer.tenant_id).eq('is_active', true).order('display_order').limit(1).single());
  for (const name of ['Ritorno', 'Fratello']) {
    const pet = checked(await staff.from('pets').insert({
      tenant_id: customer.tenant_id, customer_id: customer.id, owner_user_id: customer.user_id,
      name: `${marker} ${name}`, species: 'dog', birth_date: '2022-01-01',
    }).select('id').single());
    ids.pets.push(pet.id);
  }
  fixture = { id: ids.pets[0] };
  sibling = { id: ids.pets[1] };
  server = await createServer({ root, configFile: false, envDir: false, plugins: [react(), {
    name: 'gh104-before-code',
    resolveId(id) { if (id.endsWith('/database-gh104-before.js')) return oldId; },
    load(id) { if (id === oldId) return beforeCode; },
  }], define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify('false'),
  }, server: { host: '127.0.0.1', port: 0, open: false }, cacheDir: '/private/tmp/gh104-vite-cache' });
  await server.listen();
  origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 1000 }, timezoneId: 'Europe/Rome' });
  await context.route('**/*.supabase.co/**', route => new URL(route.request().url()).hostname === `${ref}.supabase.co` ? route.continue() : route.abort());
  await context.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
    key: `sb-${ref}-auth-token`, session: auth.session,
  });
  page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await detail();
  assert(await panel().getByText('Nessun appuntamento in agenda', { exact: true }).isVisible());
  record('Empty', await panel().innerText());
  for (const width of [375, 1365]) {
    await page.setViewportSize({ width, height: 1000 });
    const empty = await panel().evaluate(el => {
      const button = el.querySelector('button').getBoundingClientRect();
      return { width: innerWidth, documentWidth: document.documentElement.scrollWidth,
        buttonWidth: button.width, buttonHeight: button.height,
        overflow: [...el.querySelectorAll('*')].some(n => n.clientWidth > 0 && n.scrollWidth > n.clientWidth + 1) };
    });
    assert(empty.documentWidth <= width && !empty.overflow && empty.buttonWidth >= 44 && empty.buttonHeight >= 44);
    record('Empty layout', empty);
  }
  await panel().getByRole('button', { name: 'Appuntamento', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  assert(new URL(page.url()).searchParams.get('clientId') === fixture.id);
  assert((await page.getByRole('dialog').getByRole('combobox').first().inputValue()).includes(`${marker} Ritorno`));
  record('Empty booking action', 'existing clientId opens Nuovo appuntamento with the same pet; no save');
  await detail();
  const timings = { before: [], after: [] };
  for (let i = 0; i < 3; i++) for (const old of [true, false]) {
    const start = performance.now();
    await dbCall('getClientById', [fixture.id], old);
    timings[old ? 'before' : 'after'].push(Math.round(performance.now() - start));
  }
  record('Load milliseconds (3 interleaved samples)', timings);
  const at = async (date, hour) => {
    const start = await dbCall('getRomeDayStart', [`${date}T12:00:00Z`]);
    return new Date(Date.parse(start) + hour * 3600000).toISOString();
  };
  async function appointment(date, hour, extra = {}) {
    const id = `gh104-${crypto.randomUUID()}`;
    const row = { id, tenant_id: customer.tenant_id, user_id: auth.user.id, pet_id: fixture.id,
      service_id: service.id, scheduled_at: await at(date, hour), duration_minutes: 15,
      status: 'scheduled', approval_status: 'approved', appointment_source: 'operator', notes: marker, ...extra };
    checked(await staff.from('appointments').insert(row));
    ids.appointments.push(id);
    return row;
  }
  const tomorrow = await appointment(day(1), 9);
  await detail();
  assert.equal(await agenda().getByRole('listitem').count(), 1);
  const tomorrowText = await agenda().innerText();
  assert(tomorrowText.includes('09:00') && tomorrowText.includes(service.name));
  await agenda().getByRole('link').click();
  assert.equal(new URL(page.url()).searchParams.get('date'), day(1));
  record('Tomorrow', { text: tomorrowText, calendarDay: await calendarOn(day(1)) });
  const third = await appointment(day(3), 11);
  const second = await appointment(day(2), 10);
  await detail();
  const readThree = await dbCall('getClientById', [fixture.id]);
  assert.deepEqual(readThree.upcomingAppointments.map(x => x.id), [tomorrow.id, second.id, third.id]);
  assert.equal(await agenda().getByRole('listitem').count(), 3);
  record('Three', { database: 3, rendered: 3, text: await agenda().innerText(), ordered: true });
  const morning = await appointment(today, 7);
  assert(Date.parse(morning.scheduled_at) < Date.now(), 'Run this live probe after 07:00 Rome');
  await appointment(day(-1), 7);
  for (const [i, status] of ['cancelled', 'no_show', 'completed'].entries()) await appointment(day(5), 7 + i, { status });
  await appointment(day(4), 7, { pet_id: sibling.id });
  await appointment(day(6), 7, { approval_status: 'rejected' });
  await detail();
  const readFour = await dbCall('getClientById', [fixture.id]);
  assert.deepEqual(readFour.upcomingAppointments.map(x => x.id), [morning.id, tomorrow.id, second.id, third.id]);
  assert.equal(await agenda().getByRole('listitem').count(), 4);
  assert.equal(readFour.noShowAppointments.length, 1);
  record('Today and exclusions', { shown: 4, morning: true, excluded: ['yesterday', 'cancelled', 'no_show', 'completed', 'same-owner-other-pet', 'rejected'], absenceHistory: 1 });
  const requestBase = { tenant_id: customer.tenant_id, pet_id: fixture.id, customer_user_id: customer.user_id,
    service_id: service.id, desired_date: day(7), time_preference: 'morning',
    coat_condition_codes: ['regular_grooming'], coat_condition_notes: marker, declared_pet_age: null };
  for (const status of ['withdrawn', 'approved', 'rejected', 'pending']) {
    const id = crypto.randomUUID();
    checked(await staff.from('appointment_requests').insert({ ...requestBase, id, status,
      ...(status === 'withdrawn' ? { withdrawn_at: new Date().toISOString() } : {}) }));
    ids.requests.push(id);
  }
  const openId = ids.requests.at(-1);
  const proposals = [{ date: day(8), time: '09:00' }, { date: day(9), time: '10:00' }];
  for (const [patch, action, label, dashboardText] of [
    [{}, 'needs_response', 'Da rispondere', 'da rispondere'],
    [{ proposed_alternatives: proposals, staff_responded_at: new Date(Date.now() - 2000).toISOString() }, 'waiting_customer', 'In attesa della persona', 'ancora rispondere'],
    [{ customer_response: 'accepted', customer_responded_at: new Date().toISOString(), chosen_date: day(8), chosen_time: '09:00:00' }, 'needs_booking', 'Da prenotare', 'da prenotare'],
  ]) {
    if (Object.keys(patch).length) checked(await staff.from('appointment_requests').update(patch).eq('id', openId));
    await detail();
    const requests = panel().getByRole('list', { name: 'Richieste aperte' });
    assert.equal(await requests.getByRole('listitem').count(), 1);
    assert((await requests.innerText()).includes(`Richiesta · ${label}`));
    const dashboardRequests = await dbCall('getPendingAppointmentRequests');
    assert.equal(dashboardRequests.find(r => r.id === openId)?.staff_action, action);
    const detailText = await requests.innerText();
    await page.goto(`${origin}/dashboard`);
    const dashboardItem = page.locator('.gh-dashboard-pending__item, .gh-panel .gh-body').filter({ hasText: `${marker} Ritorno` }).first();
    await dashboardItem.waitFor();
    const actualDashboard = action === 'waiting_customer'
      ? await dashboardItem.evaluate(el => `${el.closest('.gh-panel').querySelector('.gh-panel__head').innerText}\n${el.innerText}`)
      : await dashboardItem.innerText();
    assert(actualDashboard.includes(dashboardText), actualDashboard);
    record('Request concordance', { action, detail: detailText, dashboard: actualDashboard, closedRequestsExcluded: 3 });
  }
  await detail();
  await panel().getByRole('list', { name: 'Richieste aperte' }).getByRole('link').click();
  await page.waitForURL('**/requests');
  await page.locator('.gh-request-card').filter({ hasText: `${marker} Ritorno` }).filter({ hasText: 'Da prenotare' }).waitFor();
  record('Request destination', '/requests');
  await detail();
  await page.locator('.gh-identity-panel').getByRole('button', { name: 'Appuntamento', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  assert((await page.getByRole('dialog').getByRole('combobox').first().inputValue()).includes(`${marker} Ritorno`));
  record('Identity Appuntamento', { clientId: new URL(page.url()).searchParams.get('clientId') === fixture.id, petSelected: true, saved: false });
  for (const invalid of ['bad', '2026-02-30']) {
    await page.goto(`${origin}/calendar?date=${invalid}`);
    record('Invalid date', { invalid, opens: await calendarOn(today) });
  }
  for (const width of [375, 1365]) {
    await page.setViewportSize({ width, height: 1000 });
    await detail();
    await panel().scrollIntoViewIfNeeded();
    const measure = await panel().evaluate(el => ({
      viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
      overflow: [...el.querySelectorAll('*')].filter(n => n.scrollWidth > n.clientWidth + 1 && n.clientWidth > 0).length,
      targets: [...el.querySelectorAll('a,button')].map(n => ({ width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height })),
      truncated: [...el.querySelectorAll('*')].some(n => getComputedStyle(n).textOverflow === 'ellipsis'),
      contentRight: Math.max(...[...el.querySelectorAll('.gh-next-appointments__copy, .gh-next-appointments__link > svg')].map(n => n.getBoundingClientRect().right)),
      fabLeft: document.querySelector('.gh-fab')?.getBoundingClientRect().left ?? innerWidth,
    }));
    assert(measure.documentWidth <= width && measure.overflow === 0 && !measure.truncated, JSON.stringify(measure));
    assert(measure.targets.every(x => x.width >= 44 && x.height >= 44));
    assert(measure.contentRight <= measure.fabLeft, 'New row contents must stay clear of the existing floating action');
    await page.screenshot({ path: path.join(evidence, `detail-${width}.png`) });
    record('Layout', measure);
  }
  assert.deepEqual(errors, []);
  record('Browser errors', errors);
  passed = true;
} catch (error) {
  record('FAILED', { message: error.message, code: error.code || null });
  process.exitCode = 1;
} finally {
  // Only IDs created by this run are modified; existing demo actors remain untouched.
  if (staff) {
    try {
      if (ids.requests.length) checked(await staff.from('appointment_requests').delete().in('id', ids.requests));
      if (ids.appointments.length) {
        checked(await staff.from('appointments').update({ status: 'cancelled', appointment_source: 'operator' }).in('id', ids.appointments));
        for (const id of ids.appointments) checked(await staff.rpc('delete_staff_appointment', { p_appointment_id: id }));
      }
      if (ids.pets.length) checked(await staff.from('pets').delete().in('id', ids.pets));
      const remaining = {};
      for (const [table, key] of [['pets', 'pets'], ['appointments', 'appointments'], ['appointment_requests', 'requests']]) {
        remaining[table] = ids[key].length ? checked(await staff.from(table).select('id').in('id', ids[key])).length : 0;
      }
      assert(Object.values(remaining).every(n => n === 0));
      record('Cleanup', { created: Object.fromEntries(Object.entries(ids).map(([key, list]) => [key, list.length])), remaining });
    } catch (error) { record('CLEANUP_FAILED', { message: error.message, ids }); process.exitCode = 1; }
    await staff.auth.signOut({ scope: 'local' });
  }
  await browser?.close();
  await server?.close();
  fs.writeFileSync(path.join(evidence, 'browser-results.json'), JSON.stringify({ startedAt, finishedAt: new Date().toISOString(), passed: passed && !process.exitCode, results }, null, 2) + '\n');
}
