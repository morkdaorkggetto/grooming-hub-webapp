import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServer, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnv('development', root, '');
const ref = 'qttpinkslhenxrsbhhhg';
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname, `${ref}.supabase.co`);
const marker = '[DEMO GH-103]';
const uiOnly = process.argv.includes('--ui-only');
const finalSchema = uiOnly || process.argv.includes('--final-schema');
const beforeCode = execFileSync('git', ['show', '6c8daa5:src/apps/staff/lib/database.js'], { cwd: root, encoding: 'utf8' });
const oldId = `${root}/src/apps/staff/lib/database-gh103-before.js`;
const actors = {};
const storage = [];
const visitIds = [];
const invitationIds = [];
const appointmentIds = [];
let fixturePet;
let secondPet;
let server;
let browser;
const lineReader = createInterface({ input: process.stdin, terminal: false });
const results = [];
const record = (name, measured) => { results.push({ name, measured }); console.log(JSON.stringify({ name, measured })); };
const checked = ({ data, error }) => { if (error) throw error; return data; };
const cacheHeaders = (response) => Object.fromEntries(['date', 'cache-control', 'cf-cache-status', 'age', 'x-smart-cdn']
  .map(key => [key, response.headers.get(key)]));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lGkAAAAASUVORK5CYII=', 'base64');
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });

async function login(name, email, password) {
  const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const data = checked(await client.auth.signInWithPassword({ email, password }));
  actors[name] = { client, ...data };
}
async function pageFor(name, route = '/u/login') {
  const context = await browser.newContext({ viewport: { width: 1365, height: 1000 } });
  if (name) await context.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
    key: `sb-${ref}-auth-token`, session: actors[name].session,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}${route}`);
  return page;
}
async function dbCall(page, method, args = [], old = false) {
  return page.evaluate(async ({ method, args, old }) => {
    const db = await import(old ? '/src/apps/staff/lib/database-gh103-before.js' : '/src/apps/staff/lib/database.js');
    return db[method](...args);
  }, { method, args, old });
}
try {
  await login('staff', 'staff.sonda@test.example', env.GH_RLS_STAFF_PASSWORD);
  await login('mario', 'mario.rossi@test.example', env.GH_RLS_MARIO_PASSWORD);
  await login('luca', 'luca.bianchi@test.example', env.GH_RLS_LUCA_PASSWORD);
  const s = actors.staff.client;
  const marioCustomer = checked(await actors.mario.client.from('customers').select('id,tenant_id,phone').eq('user_id', actors.mario.user.id).single());
  fixturePet = checked(await s.from('pets').insert({
    tenant_id: marioCustomer.tenant_id, customer_id: marioCustomer.id,
    owner_user_id: actors.mario.user.id, name: `${marker} Ritratto`, species: 'dog', birth_date: '2022-01-01',
  }).select('id,tenant_id').single());
  server = await createServer({ root, configFile: false, envDir: false, plugins: [react(), {
    name: 'gh103-before-code', resolveId(id) { if (id.endsWith('/database-gh103-before.js')) return oldId; },
    load(id) { if (id === oldId) return beforeCode; },
  }], define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify('false'),
  }, server: { host: '127.0.0.1', port: 0, open: false }, cacheDir: '/private/tmp/gh103-vite-cache' });
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const page = await pageFor('staff', '/reports/weekly');
  const before = await dbCall(page, 'getRevenueReportData', [], !finalSchema);
  const legacy = await dbCall(page, 'addVisit', [fixturePet.id, { date: today, cost: 12.34, treatments: `${marker} codice ${finalSchema ? 'nuovo' : 'vecchio'}` }], !finalSchema);
  visitIds.push(legacy.id);
  const copied = checked(await s.from('visit_financials').select('*').eq('visit_id', legacy.id).single());
  assert.equal(Number(copied.cost), 12.34);
  record(finalSchema ? 'Nuovo addVisit schema finale' : 'Vecchio addVisit da git 6c8daa5 sopra atto A', { cost: copied.cost, copy: true });
  const modern = await dbCall(page, 'addVisit', [fixturePet.id, { date: today, cost: 23.45, treatments: `${marker} nuovo codice` }]);
  visitIds.push(modern.id);
  const legacyMirror = checked(await s.from(finalSchema ? 'visit_financials' : 'visits').select('cost').eq(finalSchema ? 'visit_id' : 'id', modern.id).single());
  assert.equal(Number(legacyMirror.cost), 23.45);
  record('Nuovo addVisit', { cost: legacyMirror.cost, legacyMirror: !finalSchema });
  await page.reload();
  await page.getByRole('heading', { name: 'Come è andata' }).waitFor();
  const weekStart = new Date(`${today}T12:00:00`);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const weekStartValue = weekStart.toLocaleDateString('en-CA');
  const baselineWeek = before.filter(v => v.date >= weekStartValue && v.date <= today)
    .reduce((sum, v) => sum + Number(v.cost) * (1 - Number(v.discount_percent || 0) / 100), 0);
  const expectedRevenue = `${Math.round(baselineWeek + 35.79)} €`;
  record('Atteso incassi settimana', { today, weekStartValue, baselineWeek, expectedRevenue });
  await page.waitForFunction(text => document.querySelector('.gh-report-big-number__value')?.textContent === text, expectedRevenue);
  record('Incassi browser prima contract', expectedRevenue);
  const photoPath = `${actors.staff.user.id}/${fixturePet.id}-gh103.png`;
  storage.push(['client-photos', photoPath]);
  checked(await s.storage.from('client-photos').upload(photoPath, png, { contentType: 'image/png', cacheControl: '3600' }));
  const publicUrl = s.storage.from('client-photos').getPublicUrl(photoPath).data.publicUrl;
  checked(await s.from('pets').update({ photo_url: publicUrl }).eq('id', fixturePet.id));
  const oldResponse = await fetch(publicUrl);
  if (uiOnly) assert(!oldResponse.ok, 'Il bucket finale deve essere privato');
  else {
  assert(oldResponse.ok);
  record('Vecchio URL prima bucket privato', { status: oldResponse.status, headers: cacheHeaders(oldResponse) });
  record('READY_FOR_CONTRACT', { visits: visitIds.length, storage: storage.length });
  const input = await new Promise(resolve => lineReader.once('line', resolve));
  assert.equal(input, 'continue', 'Interrotto prima degli atti finali');
  }

  await page.reload();
  await page.waitForFunction(text => document.querySelector('.gh-report-big-number__value')?.textContent === text, expectedRevenue);
  record('Incassi browser dopo contract', expectedRevenue);
  const after = await dbCall(page, 'getRevenueReportData');
  assert.equal(after.length, before.length + 2);
  const cents = rows => rows.reduce((sum, row) => sum + Math.round(Number(row.cost) * 100), 0);
  assert.equal(cents(after) - cents(before), 3579);
  record('Somma al centesimo', { deltaCents: 3579 });
  const current = await dbCall(page, 'addVisit', [fixturePet.id, { date: today, cost: 34.56, treatments: `${marker} dopo contract` }]);
  visitIds.push(current.id);
  assert.equal(Number(checked(await s.from('visit_financials').select('cost').eq('visit_id', current.id).single()).cost), 34.56);
  record('Nuovo salvataggio dopo contract', '34,56 EUR');
  for (const kind of ['owner', 'visits', 'promotions']) {
    const actor = kind === 'owner' ? actors.mario.client : s;
    const publicPath = `${fixturePet.tenant_id}/${fixturePet.id}/${kind}/gh103-${crypto.randomUUID()}.png`;
    storage.push(['pet-avatars', publicPath]);
    checked(await actor.storage.from('pet-avatars').upload(publicPath, png, { contentType: 'image/png' }));
    const response = await fetch(actor.storage.from('pet-avatars').getPublicUrl(publicPath).data.publicUrl);
    assert(response.ok);
    record('pet-avatars pubblico', { kind, status: response.status });
  }
  if (!uiOnly) {
  const cacheStart = Date.now();
  let oldAfter;
  do {
    oldAfter = await fetch(publicUrl);
    record('Cache campione', { elapsedMs: Date.now() - cacheStart, status: oldAfter.status, headers: cacheHeaders(oldAfter) });
    if (!oldAfter.ok) break;
    await new Promise(resolve => setTimeout(resolve, 15000));
  } while (Date.now() - cacheStart < 180000);
  assert(!oldAfter.ok, 'URL pubblico ancora leggibile');
  record('Stesso URL dopo bucket privato', { status: oldAfter.status, headers: cacheHeaders(oldAfter) });
  }
  for (const name of ['mario', 'luca']) {
    const result = await actors[name].client.storage.from('client-photos').createSignedUrl(photoPath, 120);
    assert(result.error && !result.data?.signedUrl);
  }
  const signed = checked(await s.storage.from('client-photos').createSignedUrl(photoPath, 120));
  assert((await fetch(signed.signedUrl)).ok);
  record('Firma foto', 'staff consentito; Mario e Luca rifiutati');
  secondPet = checked(await s.from('pets').insert({
    tenant_id: marioCustomer.tenant_id, customer_id: marioCustomer.id,
    owner_user_id: actors.mario.user.id, name: `${marker} Secondo`, species: 'dog',
  }).select('id').single());
  const secondPath = `${actors.staff.user.id}/${secondPet.id}-gh103.png`;
  storage.push(['client-photos', secondPath]);
  checked(await s.storage.from('client-photos').upload(secondPath, png, { contentType: 'image/png' }));
  checked(await s.from('pets').update({ photo_url: s.storage.from('client-photos').getPublicUrl(secondPath).data.publicUrl }).eq('id', secondPet.id));
  const invitationId = `gh103-${crypto.randomUUID()}`;
  invitationIds.push(invitationId);
  checked(await s.from('customer_invitations').insert({
    id: invitationId, token: invitationId, pet_id: fixturePet.id,
    tenant_id: fixturePet.tenant_id, operator_user_id: actors.staff.user.id,
    phone: '+393260001030', first_name: marker, last_name: 'Collegamento',
    accepted_by: actors.mario.user.id, accepted_at: new Date().toISOString(),
  }));
  const appointmentId = `gh103-${crypto.randomUUID()}`;
  appointmentIds.push(appointmentId);
  const calendarDate = new Date(`${today}T12:00:00`);
  calendarDate.setDate(calendarDate.getDate() - (calendarDate.getDay() === 0 ? 1 : 0));
  checked(await s.from('appointments').insert({
    id: appointmentId, tenant_id: fixturePet.tenant_id, user_id: actors.staff.user.id,
    pet_id: fixturePet.id, scheduled_at: calendarDate.toISOString(), duration_minutes: 60,
    status: 'scheduled', approval_status: 'approved', appointment_source: 'operator', notes: marker,
  }));
  const signedRequests = [];
  page.on('request', request => {
    if (request.url().includes('/object/sign/client-photos') && request.method() === 'POST') {
      signedRequests.push(request.postDataJSON());
    }
  });
  for (const route of [`/client/${fixturePet.id}`, '/dashboard', '/calendar']) {
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}${route}`);
    if (route === '/calendar') {
      await page.getByRole('button').filter({ hasText: `${marker} Ritratto` }).first().click();
    }
      await page.waitForFunction(() => [...document.images].some(img => img.src.includes('/object/sign/client-photos/') && img.complete && img.naturalWidth > 0));
    record('Foto browser', { surface: route.split('/')[1], rendered: true });
  }
  assert(signedRequests.length && signedRequests.every(body => Array.isArray(body.paths)));
  assert(signedRequests.some(body => body.paths.length >= 2), 'Manca prova batch con percorsi distinti');
  record('Firma batch', { requests: signedRequests.length, pathCounts: signedRequests.map(body => body.paths.length) });
  const formContext = await dbCall(page, 'getVisitFormContext', [appointmentId]);
  assert.equal(formContext.services.reduce((sum, service) => sum + service.price_cents, 0), 7500);
  const completion = { p_appointment_id: appointmentId, p_date: today,
    p_treatments: `${marker} completamento`, p_issues: null, p_cost: 0,
    p_service_id: formContext.services[0].id };
  const invalidCompletion = await s.rpc('complete_appointment_with_visit', completion);
  assert.equal(invalidCompletion.error?.code, '22023');
  assert.equal(checked(await s.from('visits').select('id').eq('appointment_id', appointmentId)).length, 0);
  assert.equal(checked(await s.from('appointments').select('status').eq('id', appointmentId).single()).status, 'scheduled');
  completion.p_cost = 7.89;
  const completed = checked(await s.rpc('complete_appointment_with_visit', completion));
  visitIds.push(completed.id);
  const repeated = checked(await s.rpc('complete_appointment_with_visit', { ...completion, p_cost: 99 }));
  assert.equal(repeated.id, completed.id);
  assert.equal(Number(checked(await s.from('visit_financials').select('cost').eq('visit_id', completed.id).single()).cost), 7.89);
  assert.equal(checked(await s.from('appointments').select('status').eq('id', appointmentId).single()).status, 'completed');
  record('Catalogo e completamento', { catalogCents: 7500, invalidCost: '22023 senza effetti', completedCost: 7.89, repeated: 'stesso ID, costo invariato' });
  const marioPage = await pageFor('mario', '/portal');
  await marioPage.waitForURL('**/u/home');
  await marioPage.goto(`http://127.0.0.1:${server.httpServer.address().port}/u/book`);
  await marioPage.getByText('Ritratto', { exact: false }).first().waitFor();
  const anonPage = await pageFor(null, '/portal/login');
  await anonPage.waitForURL('**/u/login');
  await anonPage.goto(`http://127.0.0.1:${server.httpServer.address().port}/portal/invite/gh103-link-test`);
  await anonPage.waitForURL('**/u/redeem/gh103-link-test');
  record('Redirect legacy', ['/portal -> /u/home', '/portal/login -> /u/login', '/portal/invite/gh103-link-test -> /u/redeem/gh103-link-test', '/u/book raggiungibile']);
  for (const width of [375,1365]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/contacts`);
    await page.getByRole('button', { name: /Account collegati/ }).click();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const size = await page.getByRole('button', { name: /Account collegati/ }).boundingBox();
    assert(size.height >= 44 && size.width >= 44);
    await page.getByText('mario.rossi@test.example', { exact: true }).waitFor();
    const linkedRow = (await dbCall(page, 'getCustomerDirectory')).find(row => row.user_id === actors.mario.user.id);
    assert(linkedRow.linked_at?.startsWith(today));
    assert(linkedRow.pets.some(pet => pet.id === fixturePet.id));
    record(`Rubrica ${width}px`, { overflow: false, target: size });
    await page.screenshot({ path: path.join(root, `docs/consegne/evidenze/GH-103/contacts-${width}.png`), fullPage: true });
  }
  record('Collegamento di oggi', 'Mario, email demo, data odierna e pet fixture; invito accettato sintetico, nessun account ricollegato');
  await page.getByRole('button', { name: 'Apri scheda pet', exact: true }).first().click();
  await page.waitForURL(`**/client/${fixturePet.id}`);
  await page.getByRole('button', { name: 'Scollega account', exact: true }).waitFor();
  record('Dalla rubrica allo scollegamento', 'Pulsante raggiunto; non premuto sugli account permanenti');
  const errorPage = await pageFor('luca', '/u/home');
  const raw = 'RAW_GH103 database detail must never be visible';
  for (const [details, expected] of [
    ['GH_INVITE_ASSIGNED_ELSEWHERE', 'Questo invito è già collegato a un altro account'],
    ['GH_UNKNOWN', 'Non siamo riusciti a completare l’invito'],
    ['GH_INVITE_EXPIRED', 'Serve un nuovo link'],
  ]) {
    await errorPage.route('**/rest/v1/rpc/accept_customer_invite', route => route.fulfill({
      status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'P0001', details, message: raw }),
    }));
    await errorPage.goto(`http://127.0.0.1:${server.httpServer.address().port}/u/redeem/gh103-error-${details}`);
    await errorPage.getByRole('heading', { name: expected, exact: true }).waitFor();
    assert(!(await errorPage.locator('body').innerText()).includes(raw));
    record('Errore provocato browser (risposta HTTP sostituita)', { details, expected, rawAbsent: true });
    await errorPage.unroute('**/rest/v1/rpc/accept_customer_invite');
  }
  const assignmentId = `gh103-${crypto.randomUUID()}`;
  invitationIds.push(assignmentId);
  checked(await s.from('customer_invitations').insert({
    id: assignmentId, token: assignmentId, pet_id: fixturePet.id,
    tenant_id: fixturePet.tenant_id, operator_user_id: actors.staff.user.id,
    phone: marioCustomer.phone, first_name: marker, last_name: 'Invito',
  }));
  await errorPage.goto(`http://127.0.0.1:${server.httpServer.address().port}/u/redeem/${assignmentId}`);
  await errorPage.getByRole('heading', { name: 'Questo invito è già collegato a un altro account', exact: true }).waitFor();
  record('Errore reale RPC', 'Luca accetta invito del pet gia collegato a Mario: GH_INVITE_ASSIGNED_ELSEWHERE');
} catch (error) {
  record('Esito negativo', { name: error.name, message: error.message });
  throw error;
} finally {
  const s = actors.staff?.client;
  if (s) {
    for (const [bucket, name] of storage) checked(await s.storage.from(bucket).remove([name]));
    if (invitationIds.length) checked(await s.from('customer_invitations').delete().in('id', invitationIds));
    if (appointmentIds.length) checked(await s.from('appointments').delete().in('id', appointmentIds));
    if (visitIds.length) checked(await s.from('visits').delete().in('id', visitIds));
    if (fixturePet) {
      checked(await s.from('visits').delete().eq('pet_id', fixturePet.id));
      checked(await s.from('pets').delete().eq('id', fixturePet.id));
      assert.equal(checked(await s.from('pets').select('id').eq('id', fixturePet.id)).length, 0);
      assert.equal(checked(await s.from('visit_financials').select('visit_id').in('visit_id', visitIds)).length, 0);
    }
    if (secondPet) {
      checked(await s.from('pets').delete().eq('id', secondPet.id));
      assert.equal(checked(await s.from('pets').select('id').eq('id', secondPet.id)).length, 0);
    }
    record('Teardown GH103 browser', 'pet, visite e relativi importi rimossi; oggetti Storage rimossi');
  }
  await browser?.close();
  await server?.close();
  for (const actor of Object.values(actors)) await actor.client.auth.signOut({ scope: 'local' });
  lineReader.close();
  const out = path.join(root, 'docs/consegne/evidenze/GH-103');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, uiOnly ? 'browser-ui.json' : finalSchema ? 'browser-final.json' : 'browser.json'), JSON.stringify(results, null, 2));
}
