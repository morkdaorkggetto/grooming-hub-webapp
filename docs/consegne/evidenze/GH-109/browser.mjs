import fs from 'node:fs';
import assert from 'node:assert/strict';
import { loadEnv } from 'vite';
const { chromium } = await import('/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const env = loadEnv('development', process.cwd(), '');
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname, 'qttpinkslhenxrsbhhhg.supabase.co');
const mode = process.argv[2] || 'none';
const visualOnly = process.env.GH109_VISUAL_ONLY === '1';
const out = new URL('./', import.meta.url), origin = 'http://127.0.0.1:4179';
const ids = ['00000000-0000-4000-8109-000000000001', '00000000-0000-4000-8109-000000000002'];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await context.newPage(), errors = [], rpc = [], measures = [];
page.on('pageerror', e => errors.push(e.message));
// Only the pet inventory is narrowed for one/two-pet composition. All request
// reads, responses and submissions reach the real demo under customer RLS.
await context.route('**/*.supabase.co/**', async route => {
  const url = new URL(route.request().url());
  assert.equal(url.hostname, 'qttpinkslhenxrsbhhhg.supabase.co');
  if (url.pathname === '/rest/v1/appointment_requests' && route.request().method() === 'GET') {
    const response = await route.fetch();
    const rows = (await response.json()).filter(row => ids.slice(0,mode==='multi'?2:1).includes(row.pet_id));
    if (!['two','three'].includes(mode)) return route.fulfill({ response, json:rows });
    const proposal = rows.find(row => row.status === 'pending' && row.proposed_alternatives?.length);
    assert.ok(proposal);
    return route.fulfill({ response, json: Array.from({length:mode==='two'?2:3},(_,index)=>({...proposal,id:`synthetic-${index}`})) });
  }
  if (url.pathname === '/rest/v1/pets' && !url.searchParams.has('id') && route.request().method() === 'GET') {
    const response = await route.fetch();
    const rows = await response.json();
    assert.ok(Array.isArray(rows));
    return route.fulfill({ response, json: rows.filter(row => ids.slice(0, mode === 'multi' ? 2 : 1).includes(row.id)) });
  }
  return route.continue();
});
page.on('response', async response => {
  if (response.url().includes('/rpc/')) rpc.push({ function: new URL(response.url()).pathname.split('/').pop(), status: response.status() });
});
try {
  await page.goto(origin + '/u/home');
  await page.locator('input[type=email]').fill('mario.rossi@test.example');
  await page.locator('input[type=password]').fill(env.GH_RLS_MARIO_PASSWORD);
  await page.getByRole('button', { name: 'Accedi', exact: true }).click();
  await page.waitForURL('**/u/home');
  if (mode !== 'multi') {
    await page.waitForFunction(() => document.querySelector('.pet-card-show')?.disabled === false);
    assert.equal(await page.locator('.pet-card-show').evaluate(e => getComputedStyle(e).opacity), '1');
    assert.equal(await page.locator('.pet-card-back').count(), 0);
    assert.equal(await page.locator('.pet-card-strip').count(), 0);
    assert.equal(await page.getByText(/Bentornato/).count(), 0);
  } else await page.locator('.pet-card-strip').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  const expected = { proposal: 'Scegli un orario', portrait: 'Scegli un orario', decline: 'Scegli un orario', rejected: "Scegli un'altra data", two: 'Due richieste aspettano te', three: 'Tre richieste aspettano te' }[mode];
  if (expected) await page.locator('.pet-card-alert').filter({ hasText: expected }).waitFor();
  if (['none', 'waiting', 'withdrawn'].includes(mode)) assert.equal(await page.locator('.pet-card-alert').count(), 0);
  if (['none', 'proposal', 'portrait'].includes(mode)) for (const [width, height] of [[375,812],[375,667],[320,568]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo(0,0));
    const geometry = await page.evaluate(() => {
      const box = selector => { const e = document.querySelector(selector); if (!e) return null; const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,width:b.width,height:b.height}; };
      return { width:innerWidth,height:innerHeight,header:box('.pet-card-header'),alert:box('.pet-card-alert'),card:box('.pet-card-surface'),qr:box('.pet-card-qr'),button:box('.pet-card-show'),nav:box('nav'),overflow:document.documentElement.scrollWidth>innerWidth };
    });
    assert.equal(geometry.header.height,56); assert.equal(geometry.button.height,54); assert.equal(geometry.overflow,false);
    if (expected) assert.equal(geometry.alert.height,56);
    measures.push(geometry);
    await page.screenshot({path:new URL(`${mode}-${width}x${height}.png`,out).pathname});
  }
  await page.setViewportSize({width:375,height:812});
  if (mode === 'none') {
    const qr = await page.locator('.pet-card-qr img').getAttribute('src');
    await page.getByRole('button',{name:'Mostra il QR al banco'}).click();
    assert.equal(await page.locator('.pet-card-bank-qr').getAttribute('src'),qr);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Mostra al banco',exact:true}).click();
    assert.equal(await page.locator('.pet-card-bank-qr').getAttribute('src'),qr);
    await page.keyboard.press('Escape');
    assert.ok(await page.getByText('Prossimo appuntamento',{exact:true}).count());
  }
  if (mode === 'withdrawn') {
    await page.getByRole('button',{name:'Correggi data',exact:true}).click();
    await page.getByRole('button',{name:'Sì, ritirala',exact:true}).click();
    await page.getByText('Richiesta ritirata. Per ora è tutto.',{exact:true}).waitFor();
    await page.reload();
    await page.locator('[data-pet-card]').waitFor();
    await page.getByText('Nessun appuntamento in programma.',{exact:true}).waitFor();
    assert.equal(await page.locator('.pet-card-alert').count(),0);
  }
  if (expected) {
    await page.locator('.pet-card-alert').click();
    const dialog = page.locator('.pet-card-request-sheet');
    await dialog.waitFor({state:'visible'});
    await page.screenshot({path:new URL(`${mode}-foglio.png`,out).pathname});
    await dialog.getByRole('button',{name:'Annulla',exact:true}).click();
    await dialog.waitFor({state:'hidden'});
    assert.equal(await page.locator('.pet-card-alert').count(),1);
    await page.locator('.pet-card-alert').click();
    if (mode === 'two' || mode === 'three') {
      assert.equal(await dialog.locator('.pet-card-request-row').count(),mode === 'two'?2:3);
      await dialog.locator('.pet-card-request-row').first().click();
      await dialog.locator('.pet-card-request-content').waitFor();
    }
    if (mode === 'proposal' && !visualOnly) {
      await dialog.getByRole('button',{name:/alle 09:00/}).click();
      await page.locator('.pet-card-alert').waitFor({state:'detached'});
      await page.getByText(/Hai scelto .*Ora tocca al salone/).waitFor();
    }
    if (mode === 'decline' && !visualOnly) {
      await dialog.getByRole('button',{name:'Nessuna di queste mi va bene',exact:true}).click();
      await dialog.getByRole('button',{name:'Rifiuta senza indicare una data',exact:true}).click();
      await page.locator('.pet-card-alert').waitFor({state:'detached'});
      await page.getByText(/Ora tocca al salone proporti/).waitFor();
    }
    if (mode === 'rejected' && !visualOnly) {
      await dialog.getByRole('link',{name:"Scegli un'altra data",exact:true}).click();
      await page.waitForURL('**/u/book?petId='+ids[0]);
      await page.getByText('Bagno',{exact:true}).click();
      if (await page.locator('#declared-pet-age').count()) await page.locator('#declared-pet-age').fill('3 anni');
      await page.locator('.gh-desired-date-strip button:not(:disabled)').first().click();
      await page.getByRole('button',{name:'Pulito, solo lungo',exact:true}).click();
      await page.getByRole('button',{name:/Invia.*richiesta/}).click();
      await page.getByRole('heading',{name:'Ci pensiamo noi da qui.',exact:true}).waitFor();
      await page.goto(origin+'/u/home');
      await page.locator('[data-pet-card]').waitFor();
      await page.getByText(/Inviata il/).first().waitFor();
      assert.equal(await page.locator('.pet-card-alert').count(),0);
    }
  }
  if (mode === 'multi') {
    const requests=page.locator('.pet-card-home-requests');
    await requests.getByText('Nina',{exact:true}).waitFor();
    await requests.getByText('Briciola',{exact:true}).waitFor();
    assert.equal(await page.locator('.pet-card-strip').count(),2);
    const positions=await page.evaluate(()=>({requests:document.querySelector('.pet-card-home-requests').getBoundingClientRect().bottom,strips:document.querySelector('.pet-card-home-strips').getBoundingClientRect().top}));
    assert.ok(positions.requests<=positions.strips);
    await page.screenshot({path:new URL('multi.png',out).pathname});
    await page.locator('.pet-card-strip').first().click();
    await page.getByRole('link',{name:'Torna alla Home',exact:true}).waitFor();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(new URL(`browser-${mode}${visualOnly?'-visual':''}.json`,out),JSON.stringify({at:new Date().toISOString(),mode,visualOnly,inventoryFilter:'synthetic fixture pets only',requestSimulation:['two','three'].includes(mode)?'UI only: duplicated read response, no RPC; live trigger rejects this cardinality':false,measures,rpc,errors,pass:true},null,2)+'\n');
  console.log(JSON.stringify({mode,pass:true,measures:measures.length,rpc}));
} finally { await context.unrouteAll({behavior:'wait'}); await browser.close(); }
