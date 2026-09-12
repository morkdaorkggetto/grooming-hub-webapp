import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { parse } from '@babel/parser';

// All Auth/Data requests are fulfilled in memory; no live Supabase credentials.
const { chromium } = await import(process.env.GH_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'docs/consegne/evidenze/GH-86');
const demo = 'https://qttpinkslhenxrsbhhhg.supabase.co';
const startedAt = new Date();
const base = 'a3e1bbb4c99034906a23a7cac825d63f5a0e5279';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const results = { base, startedAt: startedAt.toISOString(), environment: 'Chromium; real App and SDK; memory HTTP fixtures', cases: [], layouts: [], hashes: {} };
const oldStaffPath = 'src/apps/staff/pages/ResetPassword.jsx';
const oldStaff = execFileSync('git', ['show', `${base}:${oldStaffPath}`], { cwd: root, encoding: 'utf8' });
const server = await createServer({
  root, configFile: false, envDir: false, cacheDir: '/private/tmp/gh86-vite-cache',
  plugins: [{
    name: 'gh86-baseline-only',
    enforce: 'pre',
    resolveId(id) {
      if (id === '/gh86-crop-fixture.jsx') return path.join(root, 'gh86-crop-fixture.jsx');
    },
    load(id) {
      if (id === path.join(root, 'gh86-crop-fixture.jsx')) return `
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import Crop from '${root}/src/shared/ui/ImageCropModal.jsx';
        export async function show() {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 400;
          const blob = await new Promise(resolve => canvas.toBlob(resolve));
          const host = document.createElement('div');
          host.id = 'gh86-crop'; document.body.append(host);
          createRoot(host).render(<Crop open file={new File([blob], 'memory.png', {type:'image/png'})} onCancel={()=>{}} onConfirm={()=>{}} />);
        }
      `;
      if (id === path.join(root, oldStaffPath) && process.env.GH86_BASELINE === '1') return oldStaff;
    },
  }, react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(demo),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('gh86-memory-fixture-not-a-key'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});
let browser;
const requests = [];
const userId = '86868686-8686-4686-8686-868686868686';
const tenantId = '86868686-1111-4111-8111-868686868686';
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'owner@gh86.example', user_metadata: {}, app_metadata: {}, created_at: '2026-09-12T00:00:00Z' };
const token = () => `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })).toString('base64url')}.memory-signature`;
const session = () => ({ access_token: token(), token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'memory-refresh', user });
let recoverMode = 'ok';
let updateMode = 'ok';
let currentRole = 'customer';
let delay = 0;
const response = 'Se questo indirizzo è associato al tuo account, riceverai un link per scegliere una nuova password. Controlla anche la posta indesiderata.';

try {
  await mkdir(evidence, { recursive: true });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  results.origin = origin;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const unexpected = [];
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin) return route.continue();
    if (url.origin !== demo) {
      if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ status: 200, body: '' });
      unexpected.push(url.origin + url.pathname);
      return route.abort();
    }
    const entry = { path: url.pathname, method: request.method() };
    if (url.pathname.endsWith('/recover')) entry.redirectTo = url.searchParams.get('redirect_to');
    requests.push(entry);
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/auth/v1/recover') {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      if (recoverMode === 'network') return route.abort('failed');
      if (recoverMode === 'missing') return json({ code: 'user_not_found', message: 'Private account-specific response' }, 400);
      if (recoverMode === 'service') return json({ message: 'SMTP unavailable' }, 500);
      if (recoverMode === 'rate') return json({ message: 'Rate limit' }, 429);
      return json({});
    }
    if (url.pathname === '/auth/v1/user') {
      if (request.method() === 'PUT') {
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        if (updateMode === 'error') return json({ message: 'Private update error', code: 'weak_password' }, 422);
        const payload = request.postDataJSON();
        assert.deepEqual(Object.keys(payload).filter((key) => payload[key] != null), ['password']);
      }
      return json(user);
    }
    if (url.pathname === '/auth/v1/token') return json(session());
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204 });
    if (url.pathname.startsWith('/rest/v1/')) {
      assert.equal(request.method(), 'GET', 'No database writes in fixture flow');
      const table = url.pathname.split('/').at(-1);
      let data = [];
      if (table === 'tenant_memberships') data = [{ tenant_id: tenantId, user_id: userId, role: currentRole, created_at: '2026-09-12T00:00:00Z' }];
      if (table === 'tenants') data = [{ id: tenantId, slug: 'grooming-hub', name: 'Salone prova', settings: {} }];
      if (table === 'profiles') data = [{ id: userId, role: currentRole === 'customer' ? 'customer' : 'operator', email: user.email }];
      if (table === 'customers') data = [{ id: userId, first_name: 'Ada', last_name: 'Prova', tenant_id: tenantId }];
      if (request.headers().accept?.includes('vnd.pgrst.object')) return json(data[0] || null);
      return json(data);
    }
    unexpected.push(url.pathname);
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  const urls = [];
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) urls.push(frame.url().split('#')[0]); });
  const goto = async (pathname) => { await page.goto(origin + pathname); };
  const waitText = (text) => page.getByText(text, { exact: true }).waitFor();
  const measure = async (name, screenshot = false) => {
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => ({
      width: window.innerWidth,
      overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      controls: [...document.querySelectorAll('input,button,a')].filter((e) => e.getClientRects().length).map((e) => {
        const b = e.getBoundingClientRect();
        return { tag: e.tagName, text: e.textContent.trim(), width: b.width, height: b.height, truncated: e.tagName !== 'INPUT' && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) };
      }),
    }));
    assert.equal(layout.overflow, 0, name);
    assert(layout.controls.every((e) => e.width >= 44 && e.height >= 44 && !e.truncated), JSON.stringify(layout));
    results.layouts.push({ name, ...layout });
    if (screenshot) await page.screenshot({ path: path.join(evidence, `${name}.png`), fullPage: true });
  };
  const recovery = async (staff = false, hash = true) => {
    const s = session();
    const target = staff ? '/reset-password' : '/u/reset-password';
    await goto(target + (hash ? `#access_token=${s.access_token}&refresh_token=${s.refresh_token}&expires_in=3600&token_type=bearer&type=recovery` : ''));
    await page.getByRole('button', { name: staff ? 'Salva nuova password' : 'Salva la nuova password', exact: true }).waitFor();
  };
  const fillPassword = async (a = 'MemoryPass86!', b = a) => {
    await page.locator('input[type=password]').nth(0).fill(a);
    await page.locator('input[type=password]').nth(1).fill(b);
  };

  await goto('/u/login');
  await page.getByRole('link', { name: 'Password dimenticata?' }).click();
  await page.waitForURL('**/u/forgot');
  await measure('forgot-375', true);
  await page.getByRole('button', { name: 'Invia il link' }).click();
  assert.equal(requests.filter((r) => r.path.endsWith('/recover')).length, 0);
  await page.getByLabel('Il tuo indirizzo email').fill('owner@gh86.example');
  delay = 150;
  await page.getByRole('button', { name: 'Invia il link' }).click();
  await page.getByRole('button', { name: 'Invio in corso...' }).waitFor();
  await waitText(response);
  delay = 0;
  const knownText = await page.getByRole('status').innerText();
  const redirectTo = requests.find((r) => r.redirectTo)?.redirectTo;
  assert.equal(redirectTo, origin + '/u/reset-password');
  await measure('forgot-response-375', true);
  recoverMode = 'missing';
  await page.getByLabel('Il tuo indirizzo email').fill('absent@gh86.example');
  await page.getByRole('button', { name: 'Invia il link' }).click();
  await waitText(response);
  assert.equal(await page.getByRole('status').innerText(), knownText);
  results.cases.push({ name: 'Existing vs absent email', knownText, absentText: knownText, redirectTo, pass: true });
  for (const mode of ['service', 'rate', 'network']) {
    recoverMode = mode;
    await page.getByRole('button', { name: 'Invia il link' }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByRole('status').count(), 0);
    await measure(`forgot-${mode}-375`);
  }
  recoverMode = 'ok';
  await recovery();
  await page.reload();
  await page.getByRole('button', { name: 'Salva la nuova password', exact: true }).waitFor();
  await measure('reset-375', true);
  const submit = () => page.getByRole('button', { name: 'Salva la nuova password', exact: true }).click();
  for (const [a, b, text] of [
    ['', '', 'Scrivi e conferma la tua nuova password.'],
    ['short', 'short', 'Scegli una password di almeno 6 caratteri.'],
    ['MemoryPass86!', 'Different86!', 'Le password non coincidono. Controlla e riprova.'],
  ]) {
    await fillPassword(a, b); await submit(); await waitText(text); await measure('reset-validation-375');
  }
  assert.equal(requests.filter((r) => r.method === 'PUT').length, 0);
  updateMode = 'error';
  await fillPassword(); await submit();
  await waitText('Non siamo riusciti ad aggiornare la tua password. Riprova o richiedi un nuovo link.');
  assert(!(await page.locator('body').innerText()).includes('Private update error'));
  updateMode = 'ok'; delay = 150;
  await submit(); await page.getByRole('button', { name: 'Salvataggio in corso...' }).waitFor();
  await waitText('La tua password è stata aggiornata. Ora puoi accedere alla tua area.');
  await page.waitForURL('**/u/login');
  delay = 0;
  await page.getByPlaceholder('mario.rossi@email.com').fill(user.email);
  await page.locator('input[type=password]').fill('MemoryPass86!');
  await page.getByRole('button', { name: 'Accedi', exact: true }).click();
  await page.waitForURL('**/u/home');
  await page.getByRole('heading', { name: /Bentornato/ }).first().waitFor();
  assert(urls.every((url) => new URL(url).pathname.startsWith('/u/')));
  results.cases.push({ name: 'Customer recovery and re-entry', urls: [...urls], pass: true });

  await page.evaluate(() => localStorage.clear());
  await goto('/u/reset-password#error=access_denied&error_code=otp_expired&error_description=Expired');
  await waitText('Questo link non è valido o è scaduto. Richiedine uno nuovo per scegliere la tua password.');
  assert.equal(await page.locator('input[type=password]').count(), 0);
  await measure('expired-375', true);
  await page.getByRole('link', { name: 'Richiedi un nuovo link' }).click();
  await page.waitForURL('**/u/forgot');
  await goto('/u/reset-password');
  await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('input[type=password]').count(), 0);
  results.cases.push({ name: 'Expired and missing recovery session', pass: true });

  await page.setViewportSize({ width: 1365, height: 900 });
  await goto('/u/forgot'); await measure('forgot-1365', true);
  await recovery(); await measure('reset-1365', true);
  await goto('/u/reset-password?error_code=otp_expired');
  await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('input[type=password]').count(), 0);
  results.cases.push({ name: 'Expired link cannot use an existing session', pass: true });

  currentRole = 'owner';
  await recovery(true);
  const staffMarkup = await page.locator('form').evaluate((e) => e.parentElement.outerHTML);
  await fillPassword();
  await page.getByRole('button', { name: 'Salva nuova password', exact: true }).click();
  await waitText('Password aggiornata con successo. Ora puoi accedere.');
  await page.waitForURL('**/login');
  await page.getByRole('button', { name: 'Accedi', exact: true }).waitFor();
  results.cases.push({ name: 'Old staff recovery link still returns to /login', pass: true, markupSha256: sha(staffMarkup) });

  await page.evaluate(async () => (await import('/gh86-crop-fixture.jsx')).show());
  await page.getByAltText('Anteprima ritaglio').waitFor();
  const crop = await page.locator('#gh86-crop').evaluate((host) => {
    const frame = host.querySelector('.border-4');
    const bounds = frame.getBoundingClientRect();
    return { description: host.querySelector('p').textContent, width: bounds.width, height: bounds.height,
      round: frame.classList.contains('rounded-full'), rounded3xl: frame.classList.contains('rounded-3xl'),
      buttons: [...host.querySelectorAll('button')].map((button) => button.textContent.trim()) };
  });
  assert.deepEqual(crop, {
    description: "Trascina l'immagine e regola lo zoom per centrare il muso del cane.",
    width: 280, height: 280, round: false, rounded3xl: true,
    buttons: ['Chiudi', 'Annulla', 'Usa questa foto'],
  });
  results.staffGH79Fingerprint = crop;

  for (const file of ['src/apps/staff/components/Auth/LoginForm.jsx', oldStaffPath, 'src/shared/supabase/client.js', 'src/shared/ui/ImageCropModal.jsx', 'src/shared/media/imageCrop.js']) {
    results.hashes[file] = { before: sha(execFileSync('git', ['show', `${base}:${file}`], { cwd: root })), after: sha(await readFile(path.join(root, file))) };
  }
  const newStaff = await readFile(path.join(root, oldStaffPath), 'utf8');
  const renderedSource = (source) => {
    const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] });
    const component = ast.program.body.find((node) => node.type === 'ExportDefaultDeclaration').declaration;
    const returned = component.body.body.find((node) => node.type === 'ReturnStatement');
    return source.slice(returned.start, returned.end);
  };
  assert.equal(renderedSource(newStaff), renderedSource(oldStaff));
  results.staffRenderSourceSha256 = sha(renderedSource(newStaff));
  assert.deepEqual(unexpected, []);
  assert.deepEqual(errors, []);
  results.requests = requests;
  results.unexpectedNetwork = unexpected;
  results.pageErrors = errors;
  results.finishedAt = new Date().toISOString();
  results.durationSeconds = (Date.now() - startedAt.getTime()) / 1000;
  const resultFile = process.env.GH86_BASELINE === '1' ? 'gh86-staff-baseline.json' : 'gh86-browser-measures.json';
  await writeFile(path.join(evidence, resultFile), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ cases: results.cases, layouts: results.layouts.length, errors, durationSeconds: results.durationSeconds, resultFile }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
