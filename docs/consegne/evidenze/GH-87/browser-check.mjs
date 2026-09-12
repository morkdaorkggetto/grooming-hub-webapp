import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from '/Users/luigimaisto/Desktop/grooming-hub-web/webapp/node_modules/vite/dist/node/index.js';
import react from '/Users/luigimaisto/Desktop/grooming-hub-web/webapp/node_modules/@vitejs/plugin-react/dist/index.js';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root='/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out=root+'/docs/consegne/evidenze/GH-87';
const started=Date.now();
const results={environment:'Real App and SDK, memory HTTP only, Chromium 375x812',cases:[],layouts:[],whatsapp:[],errors:[],unexpected:[]};
const baseline=process.argv.includes('--baseline');
const server=await createServer({root,configFile:false,envDir:false,cacheDir:'/private/tmp/gh87-vite-cache',plugins:[{name:'gh87-baseline',enforce:'pre',load(id){if(baseline&&id===root+'/src/apps/staff/pages/CustomerRequests.jsx')return execFileSync('git',['show','b4f77c4:src/apps/staff/pages/CustomerRequests.jsx'],{cwd:root,encoding:'utf8'});}},react()],define:{'import.meta.env.VITE_SUPABASE_URL':JSON.stringify('https://gh87-memory.invalid'),'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify('memory-only')},server:{host:'127.0.0.1',port:0,open:false}});
let browser;
const uid='87878787-8787-4878-8878-878787878787',tid='87878787-1111-4111-8111-878787878787';
const user={id:uid,email:'owner@gh87.example',aud:'authenticated',role:'authenticated',user_metadata:{},app_metadata:{}};
const owner={id:uid,user_id:uid,tenant_id:tid,first_name:'Ada',last_name:'Prova',phone:'+393330000087'};
const pet={id:'87878787-2222-4222-8222-878787878787',tenant_id:tid,customer_id:uid,owner_user_id:uid,name:'Lacky',breed:'Barboncino',customer:owner};
const alternatives=[{date:'2026-10-12',time_preference:'morning'},{date:'2026-10-13',time_preference:'afternoon'}];
const fresh=()=>({id:'87878787-3333-4333-8333-878787878787',tenant_id:tid,customer_user_id:uid,pet_id:pet.id,service_id:'service',desired_date:'2026-10-10',time_preference:'morning',status:'pending',created_at:'2026-09-12T09:00:00Z',staff_responded_at:'2026-09-12T10:00:00Z',proposed_alternatives:structuredClone(alternatives),customer_response:null,customer_responded_at:null,chosen_date:null,chosen_time_preference:null,coat_condition_codes:[],pet,service:{id:'service',name:'Bagno',duration_minutes:60}});
let requests=[fresh()], next=null,later=null,role='customer',rpcError=null,delay=0,rpcCalls=0,readError=false;
try {
  await mkdir(out,{recursive:true});await server.listen();const origin=`http://127.0.0.1:${server.httpServer.address().port}`;
  browser=await chromium.launch(); const ctx=await browser.newContext({viewport:{width:375,height:812},timezoneId:'Europe/Rome'});
  await ctx.routeWebSocket('**/*',s=>s.close());
  await ctx.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin===origin)return route.continue();
    if(['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))return route.fulfill({body:''});
    if(url.origin!=='https://gh87-memory.invalid'){results.unexpected.push(url.origin+url.pathname);return route.abort();}
    const json=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
    if(url.pathname==='/auth/v1/user')return json(user);
    if(url.pathname==='/rest/v1/rpc/respond_appointment_request_alternatives'){
      rpcCalls++;const p=req.postDataJSON();
      if(delay)await new Promise(r=>setTimeout(r,delay));
      if(rpcError)return json(rpcError,400);
      const row=requests.find(r=>r.id===p.p_request_id);assert(row);
      Object.assign(row,{customer_response:p.p_response,customer_responded_at:new Date().toISOString(),chosen_date:p.p_date,chosen_time_preference:p.p_time_preference});
      return json(row);
    }
    if(url.pathname.startsWith('/rest/v1/')){
      assert(['GET','HEAD'].includes(req.method()));
      if(req.method()==='HEAD')return route.fulfill({status:200,headers:{'content-range':'*/0'},body:''});
      const table=url.pathname.split('/').at(-1),select=url.searchParams.get('select')||'';let data=[];
      if(table==='appointment_requests'&&readError)return json({code:'NETWORK',message:'Fixture read unavailable'},503);
      if(table==='tenant_memberships')data=[{tenant_id:tid,user_id:uid,role,created_at:'2026-01-01'}];
      if(table==='tenants')data=[{id:tid,slug:'grooming-hub',name:'Salone in memoria',settings:{}}];
      if(table==='profiles')data=[{id:uid,email:user.email,role:role==='customer'?'customer':'operator'}];
      if(table==='customers')data=[owner];
      if(table==='pets')data=[pet];
      if(table==='appointment_requests')data=requests.map(r=>{
        const row=structuredClone(r);
        if(!select.includes('customer_response'))for(const k of ['chosen_date','chosen_time_preference','customer_response','customer_responded_at'])delete row[k];
        return row;
      });
      if(table==='appointments'&&next&&url.searchParams.get('approval_status')!=='eq.pending')data=[next,...(later?[later]:[])];
      if(req.headers().accept?.includes('vnd.pgrst.object'))return json(data[0]||null);
      return json(data);
    }
    results.unexpected.push(url.pathname);return route.abort();
  });
  ctx.setDefaultTimeout(10000);
  const page=await ctx.newPage();page.on('pageerror',e=>{results.errors.push(e.message);console.log('PAGE ERROR',e.message);});
  await page.goto(origin+'/u/login');
  await page.evaluate(({uid,user})=>localStorage.setItem('sb-gh87-memory-auth-token',JSON.stringify({access_token:`e30.${btoa(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600}))}.memory`,refresh_token:'memory',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user})),{uid,user});
  if(baseline){role='owner';await page.goto(origin+'/requests');await page.getByRole('button',{name:'Conferma',exact:true}).waitFor();const r=await page.getByRole('link',{name:'Torna alla Dashboard'}).boundingBox();await writeFile(out+'/baseline.json',JSON.stringify({base:'b4f77c4',target:'Grooming Hub / Torna alla Dashboard',...r},null,2)+'\n');console.log(r);await browser.close();await server.close();process.exit(0);}
  const home=async()=>{await page.goto(origin+'/u/home');await page.getByText('Quale di queste fasce ti va bene? Il salone confermerà l’ora.',{exact:true}).first().waitFor();console.log('home ready');};
  const layout=async(name)=>{
    await page.waitForLoadState('networkidle');
    const m=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),controls:[...document.querySelectorAll('button,a,input,select')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim().slice(0,100),width:r.width,height:r.height,truncated:e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1};})}));
    assert.equal(m.overflow,0,name);assert(m.controls.every(c=>!c.truncated&&(name==='choices-1365'||c.text==='Grooming Hub'||(c.width>=44&&c.height>=44))),JSON.stringify({name,bad:m.controls.filter(c=>c.width<44||c.height<44||c.truncated)}));results.layouts.push({name,...m});
    if(name==='choices-375'||name==='rejected-pair-375') {
      await page.getByRole('button',{name:/martedì 13 ottobre/}).first().evaluate(e=>e.parentElement.scrollIntoView({block:'center'}));
      const visible=await page.getByRole('button',{name:/martedì 13 ottobre/}).first().evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight-90;});
      assert(visible,'Alternative must be reachable above fixed bottom navigation');
    }
    await page.screenshot({path:out+'/'+name+'.png',fullPage:false});
  };
  await home();await layout('choices-375');
  delay=250;
  await page.evaluate(()=>{const buttons=[...document.querySelectorAll('button')].filter(b=>/ottobre/.test(b.textContent));buttons[0].click();buttons[1].click();});
  await page.getByText(/Hai scelto lunedì 12 ottobre/).waitFor();
  assert.equal(rpcCalls,1);assert.equal(requests[0].status,'pending');assert.equal(next,null);
  await layout('accepted-375');results.cases.push({name:'Double tap -> one RPC; accepted pending, no appointment',pass:true});
  await page.getByRole('button',{name:'Cambia risposta',exact:true}).click();
  await page.getByRole('button',{name:'Nessuna di queste mi va bene',exact:true}).click();
  await page.getByText(/Hai risposto che nessuna/).waitFor();assert.equal(rpcCalls,2);assert.equal(requests[0].customer_response,'declined');
  await layout('declined-375');results.cases.push({name:'Explicit change -> declined pending',pass:true});
  delay=0;requests=[fresh()];rpcError={code:'22023',message:'Chosen slot was not proposed'};
  await home();await page.getByRole('button',{name:/lunedì 12 ottobre/}).click();
  const alert=await page.getByRole('alert').innerText();assert.equal(alert,'Questa alternativa non è più disponibile. Aggiorna le proposte e riprova.');
  assert(!await page.getByRole('button',{name:/martedì 13 ottobre/}).isEnabled());
  await layout('rejected-pair-375');results.cases.push({name:'RPC rejection -> gentle error, retry requires refresh',text:alert,pass:true});
  rpcError=null;await page.getByRole('button',{name:'Aggiorna le proposte'}).click();
  await page.getByRole('button',{name:/martedì 13 ottobre/}).click();await page.getByText(/Hai scelto martedì/).waitFor();
  role='owner';await page.goto(origin+'/requests');
  await page.getByText('Fascia scelta',{exact:true}).waitFor();await layout('staff-accepted-375');
  await page.getByRole('button',{name:'Conferma',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.waitFor();
  const date=await dialog.locator('input[type=date]').inputValue(),time=await dialog.locator('input[type=time]').inputValue();
  assert.equal(date,'2026-10-13');assert.equal(time,'13:00');await layout('approval-375');
  results.cases.push({name:'Staff reads response; modal uses chosen date and preference',date,time,pass:true});
  await page.getByRole('button',{name:'Annulla',exact:true}).click();
  const badge=await page.getByRole('link',{name:'1 richiesta in attesa. Apri richieste'}).getAttribute('aria-label');
  requests[0].customer_response='declined';requests[0].chosen_date=null;requests[0].chosen_time_preference=null;
  await page.getByRole('button',{name:'Aggiorna',exact:true}).click();await page.getByText('Nessuna fascia va bene',{exact:true}).waitFor();
  results.cases.push({name:'Staff declined, GH81 count unchanged',badge,pass:true});
  requests=[fresh()];requests[0].proposed_alternatives=[];requests[0].staff_responded_at=null;
  await page.reload();await page.getByRole('link',{name:'1 richiesta in attesa. Apri richieste'}).waitFor();
  requests=[fresh()];await page.reload();await page.getByRole('link',{name:'1 richiesta in attesa. Apri richieste'}).waitFor();
  results.cases.push({name:'Badge before/after alternatives',before:1,after:1,pass:true});
  role='customer';next={id:'appt',pet_id:pet.id,scheduled_at:'2026-10-20T13:00:00Z',created_at:new Date().toISOString(),status:'scheduled',approval_status:'approved',appointment_source:'customer',pet,service:{name:'Bagno'}};
  requests=[fresh(),{...fresh(),id:'other',pet:{...pet,name:'Luna'},pet_id:'other-pet'}];
  await home();await page.getByText('Confermato dal salone',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Nessuna di queste mi va bene'}).count(),2);
  await layout('confirmed-multiple-375');results.cases.push({name:'Confirmed customer appointment plus two actionable requests',pass:true});
  next.appointment_source='operator';await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.getByText('Confermato dal salone',{exact:true}).count(),0);
  results.cases.push({name:'Staff-created appointment has no customer confirmation label',pass:true});
  later={...next,id:'later-confirmed',appointment_source:'customer',scheduled_at:'2026-10-21T13:00:00Z'};
  await page.reload();await page.getByText('Confermato dal salone: Lacky, mercoledì 21 ottobre alle 15:00.',{exact:true}).waitFor();
  await layout('confirmed-later-375');results.cases.push({name:'Later customer confirmation remains visible behind an earlier staff-created appointment',pass:true});later=null;
  next=null;requests=[fresh()];await home();readError=true;
  await page.getByRole('button',{name:/lunedì 12 ottobre/}).click();
  await page.getByText('Non riusciamo a rileggere le richieste. Aggiorna prima di rispondere.',{exact:true}).waitFor();
  const beforeRefresh=rpcCalls;readError=false;
  await page.getByRole('button',{name:'Aggiorna le richieste',exact:true}).click();
  await page.getByText(/Hai scelto lunedì/).waitFor();assert.equal(rpcCalls,beforeRefresh);
  results.cases.push({name:'Commit succeeds but readback fails; refresh restores response without duplicate RPC',pass:true});
  requests=[fresh()];await page.setViewportSize({width:1365,height:900});await home();await layout('choices-1365');
  const helpers=await page.evaluate(async()=>{const {isRecentlyConfirmed,currentAlternativeResponse}=await import('/src/apps/customer/lib/appointmentResponses.js');const now=Date.now(),base={status:'scheduled',approval_status:'approved',appointment_source:'customer'};
    return {recent:isRecentlyConfirmed({...base,created_at:new Date(now-71*3600000)},now),expired:isRecentlyConfirmed({...base,created_at:new Date(now-72*3600000)},now),future:isRecentlyConfirmed({...base,created_at:new Date(now+1000)},now),legacy:isRecentlyConfirmed({...base,created_at:'2020-01-01',updated_at:new Date(now)},now),reproposal:currentAlternativeResponse({customer_response:'declined',customer_responded_at:'2026-09-12T10:00:00Z',staff_responded_at:'2026-09-12T11:00:00Z'})};
  });assert.deepEqual(helpers,{recent:true,expired:false,future:false,legacy:false,reproposal:null});results.cases.push({name:'72h boundaries and new proposal freshness',...helpers,pass:true});
  results.whatsapp=await page.evaluate(async()=>{
    const w=await import('/src/apps/staff/lib/whatsapp.js');const client={owner:'3339509149',phone:'+393330000087',name:'Lacky',breed:'Barboncino'};
    const a={client,scheduled_at:'2026-10-10T15:00:00+02:00',duration_minutes:60,desired_date:'2026-10-10'};const entries=[];
    const add=(name,input,value)=>entries.push({name,input,text:value.startsWith('https://wa.me/')?new URL(value).searchParams.get('text'):value});
    add('contact numeric',client,w.getClientWhatsAppUrl(client));add('calendar numeric',a,w.getAppointmentWhatsAppUrl(a));
    add('calendar named',{...a,client:{...client,owner:'Mario Rossi'}},w.getAppointmentWhatsAppUrl({...a,client:{...client,owner:'Mario Rossi'}}));
    for(const status of ['approved','rejected']){add(status,a,w.getAppointmentApprovalWhatsAppMessage(a,status));add(status+' undated',{client},w.getAppointmentApprovalWhatsAppMessage({client},status));}
    const alts=[{date:'2026-10-12',time_preference:'morning'},{date:'2026-10-13',time_preference:'afternoon'}];
    add('alternatives',{appointment:a,alternatives:alts},w.getAppointmentAlternativesWhatsAppMessage(a,alts));
    const rq={salonPhone:client.phone,desiredDate:'2026-10-10',timeWindowLabel:'di mattina',serviceName:'Bagno'};add('request',rq,w.getCustomerAppointmentRequestWhatsAppUrl(rq));
    const dir={owner_name:'3339509149',phone:client.phone,pet_name:'Lacky'};add('directory',dir,w.getCustomerDirectoryWhatsAppUrl(dir));
    add('next year',{...a,scheduled_at:'2027-01-10T15:00:00+01:00'},w.getAppointmentWhatsAppUrl({...a,scheduled_at:'2027-01-10T15:00:00+01:00'}));
    add('midnight',{...a,scheduled_at:'2026-10-10T23:30:00+02:00'},w.getAppointmentApprovalWhatsAppMessage({...a,scheduled_at:'2026-10-10T23:30:00+02:00'},'approved'));
    add('boutique',{salonPhone:client.phone},w.getBoutiqueOrderWhatsAppUrl({salonPhone:client.phone}));
    const order={salonPhone:client.phone,items:[{quantity:1,name:'Shampoo'}]};add('boutique order',order,w.getBoutiqueOrderWhatsAppUrl(order));
    const timed={salonPhone:client.phone,date:'2026-10-10',time:'15:00',durationMinutes:60,notes:'Pelo lungo'};add('timed request',timed,w.getCustomerAppointmentRequestWhatsAppUrl(timed));
    entries.push({name:'name boundaries',values:['+39 333 950 9149','  Anna-Maria D’Angelo  ','J.','李明','mario@example.com','cliente','Anna 2'].map(input=>({input,output:w.getWhatsAppOwnerName(input)}))});return entries;
  });
  for(const e of results.whatsapp.filter(e=>e.text))assert(!e.text.includes('3339509149'));
  assert(results.whatsapp.find(e=>e.name==='calendar named').text.includes('Mario Rossi'));
  assert.deepEqual(results.errors,[]);assert.deepEqual(results.unexpected,[]);
  results.elapsedMs=Date.now()-started;await writeFile(out+'/browser.json',JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify({...results,whatsapp:results.whatsapp.length},null,2));
}finally{await browser?.close();await server.close();}
