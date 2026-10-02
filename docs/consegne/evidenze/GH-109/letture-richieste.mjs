import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
const server = await createServer({root:process.cwd(),configFile:false,cacheDir:'/private/tmp/gh109-read-test',server:{middlewareMode:true,watch:null,hmr:false},optimizeDeps:{noDiscovery:true}});
let supabase;
try {
  supabase=(await server.ssrLoadModule('/src/shared/supabase/client.js')).supabase;
  const {readAppointmentRequests}=await server.ssrLoadModule('/src/apps/customer/hooks/useAppointmentRequests.js');
  const calls=[]; let fail=false;
  const client={from(table){const call={table,orders:[]};calls.push(call);return {
    select(columns){call.columns=columns;return this;},eq(k,v){call.filter=[k,v];return this;},
    in(k,v){call.statuses=v;return this;},order(k,v){call.orders.push([k,v]);return this;},
    async range(from,to){call.range=[from,to];if(fail&&from===500)return {error:new Error('later page failed')};return {data:Array.from({length:Math.max(0,Math.min(1201,to+1)-from)},(_,i)=>({id:from+i,status:from+i===1200?'withdrawn':'rejected'}))};}
  };}};
  const all=await readAppointmentRequests(client,'test-tenant',true);
  assert.equal(all.length,1201);assert.equal(all.at(-1).status,'withdrawn');
  assert.ok(calls.every(c=>!c.statuses&&c.filter[1]==='test-tenant'&&c.orders[0][0]==='created_at'&&c.orders[1][0]==='id'));
  const historyCalls=calls.splice(0);
  await readAppointmentRequests(client,'test-tenant');
  assert.ok(calls.every(c=>JSON.stringify(c.statuses)==='["pending","rejected"]'));
  fail=true;await assert.rejects(readAppointmentRequests(client,'test-tenant',true),/later page failed/);
  fs.writeFileSync(new URL('letture-richieste.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),historyRows:all.length,lastStatus:all.at(-1).status,historyCalls,legacyFilter:'PASS',laterPageError:'PASS'},null,2)+'\n');
  console.log('1201 righe, tutti gli stati, filtro legacy e errore pagina successiva: PASS');
} finally {supabase?.auth.stopAutoRefresh();await server.close();}
