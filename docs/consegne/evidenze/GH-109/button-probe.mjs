import fs from 'node:fs';
import assert from 'node:assert/strict';
const { chromium } = await import('/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const phase = process.argv[2] || 'after';
const out = new URL('./', import.meta.url);
const pet = { id: 'local-synthetic', name: 'Nina', breed: 'Shih Tzu', qr_token: 'ghp_gh107_probe_4', owner_photo_url: null, visits: Array.from({length:3},()=>({date:'2026-09-01'})), rewardPointsTotal:0 };
const request = { id:'local-proposal', pet_id:pet.id, pet, status:'pending', created_at:'2026-10-02T06:00:00Z', proposed_alternatives:[{date:'2026-10-05',time:'09:00'}] };
const hooks = {
  'useRequireCustomer.js': 'export const useRequireCustomer=()=>({loading:false});',
  'AuthProvider.jsx': 'export const useAuth=()=>({user:{id:"local-user",email:"synthetic@test.example"},loading:false});',
  'TenantProvider.jsx': 'export const useTenant=()=>({tenant:{name:"Demo",settings:{}},tenantId:"local-tenant",loading:false});',
  'usePets.js': `export const usePets=()=>({data:[${JSON.stringify(pet)}],loading:false});`,
  'useNextAppointment.js': 'export const useNextAppointment=()=>({data:null,appointments:[],loading:false});',
  'usePromotions.js': 'export const usePromotions=()=>({data:[],loading:false});',
  'useCurrentCustomer.js': 'export const useCurrentCustomer=()=>({customer:{first_name:"Synthetic"}});',
  'useAppointmentRequests.js': `export const useAppointmentRequests=()=>({data:[${JSON.stringify(request)}],history:[${JSON.stringify(request)}],loading:false,refetch:()=>{}});`,
  'usePetCard.js': `import {getFidelityTierSnapshot} from '/src/shared/lib/fidelity.js'; const data=${JSON.stringify(pet)}; const settings={fidelity_tiers:{bronze:{visits_required:6,months_window:12,points_required:100},silver:{visits_required:12,months_window:24,points_required:250},gold:{visits_required:36,months_window:36,points_required:500}}}; export const usePetCard=()=>({data,snapshot:getFidelityTierSnapshot(data,settings,new Date('2026-10-02T12:00:00Z')),loading:false});`,
};
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:375,height:812}});
const errors = [], external = [];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(!['127.0.0.1','localhost'].includes(url.hostname)) { external.push(url.origin); return route.abort(); }
  if(url.pathname==='/__gh109') {
    const response=await route.fetch();
    return route.fulfill({response,body:(await response.text()).replace('/preview.jsx','/button-probe.jsx')});
  }
  const mock=hooks[url.pathname.split('/').pop()];
  if(mock && url.pathname.startsWith('/src/')) return route.fulfill({contentType:'application/javascript',body:mock});
  return route.continue();
});
await page.addInitScript(()=>{
  window.framesMeasured=[];
  const measure=()=>{
    const e=document.querySelector('.pet-card-show');
    if(e) {
      const s=getComputedStyle(e), parents=[];
      for(let p=e.parentElement;p;p=p.parentElement) parents.push({tag:p.tagName,opacity:getComputedStyle(p).opacity});
      window.framesMeasured.push({t:performance.now(),disabled:e.disabled,qr:!!document.querySelector('.pet-card-qr img'),opacity:s.opacity,background:s.backgroundColor,transition:s.transition,parents});
    }
    if(window.framesMeasured.length<60) requestAnimationFrame(measure);
  };requestAnimationFrame(measure);
});
try {
  await page.goto('http://127.0.0.1:4180/__gh109?button-proof');
  await page.waitForFunction(()=>window.framesMeasured.length>=60);
  await page.evaluate(()=>document.fonts.ready);
  const frames=await page.evaluate(()=>window.framesMeasured);
  const stable=()=>page.locator('.pet-card-show').evaluate(e=>({disabled:e.disabled,opacity:getComputedStyle(e).opacity,background:getComputedStyle(e).backgroundColor}));
  const states={rest:await stable()};
  await page.locator('.pet-card-show').hover();states.hover=await stable();
  await page.locator('.pet-card-show').focus();states.focus=await stable();
  await page.mouse.down();states.active=await stable();await page.mouse.up();
  await page.keyboard.press('Escape');
  await page.mouse.move(0,0);await page.locator('.pet-card-show').evaluate(e=>e.blur());
  if(phase==='after') {
    assert.ok(frames.some(f=>f.disabled && f.opacity==='0.6'));
    assert.ok(frames.some(f=>!f.disabled));
    assert.ok(frames.filter(f=>!f.disabled).every(f=>f.opacity==='1'));
    for(const state of Object.values(states)) assert.deepEqual(state,{disabled:false,opacity:'1',background:'rgb(94, 133, 128)'});
    await page.screenshot({path:new URL('proposal-375x812-corrected.png',out).pathname});
    const referencePage=await browser.newPage({viewport:{width:375,height:812}});
    await referencePage.goto('http://127.0.0.1:4180/__gh109?alert');
    await referencePage.getByText('Mostra al banco',{exact:true}).waitFor();
    await referencePage.evaluate(()=>document.fonts.ready);
    const reference=await referencePage.screenshot();
    const actual=fs.readFileSync(new URL('proposal-375x812-corrected.png',out));
    const comparison=await browser.newPage({viewport:{width:750,height:872}});
    await comparison.setContent(`<body style="margin:0;display:flex;font:14px sans-serif"><section><h3>CD-11: riferimento</h3><img width="375" src="data:image/png;base64,${reference.toString('base64')}"></section><section><h3>GH-109: Home, dati sintetici locali</h3><img width="375" src="data:image/png;base64,${actual.toString('base64')}"></section></body>`);
    await comparison.screenshot({path:new URL('cd11-proposal-375x812-corrected.png',out).pathname});
    await comparison.close();await referencePage.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(new URL(`button-${phase}.json`,out),JSON.stringify({at:new Date().toISOString(),source:'actual Home and CustomerNav, synthetic local hook responses; no DB',frames,states,errors,externalBlocked:external},null,2)+'\n');
  console.log(JSON.stringify({phase,firstReady:frames.find(f=>!f.disabled),fadedReady:frames.filter(f=>!f.disabled&&f.opacity!=='1').length,states,errors}));
} finally {await browser.close();}
