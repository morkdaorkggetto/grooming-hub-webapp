import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url)).replace(/\/$/,'');
const {createServer,loadEnv}=await import(root+'/node_modules/vite/dist/node/index.js');
const {default:react}=await import(root+'/node_modules/@vitejs/plugin-react/dist/index.js');
const env=loadEnv('development',root,'');
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname,'qttpinkslhenxrsbhhhg.supabase.co');
const source=`import React from '/node_modules/.vite/deps/react.js';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import '/src/index.css';
import '/src/shared/tokens/tokens.css';
import '/src/apps/staff/styles/gh15-staff.css';
import {PetCardView} from '/src/apps/customer/pages/PetCard.jsx';
import {getFidelityTierSnapshot} from '/src/shared/lib/fidelity.js';
import StaffCard from '/src/apps/staff/components/ClientCard.jsx';
const query=new URLSearchParams(location.search);
const config={fidelity_tiers:{bronze:{visits_required:6,months_window:12,points_required:100},silver:{visits_required:12,months_window:24,points_required:250},gold:{visits_required:36,months_window:36,points_required:500}}};
if(query.has('project'))config.fidelity_projection={history_start:'2026-03-06',tiers:['bronze']};
const pet={id:'local-synthetic',name:query.get('name')||'Nina',breed:'Shih Tzu',qr_token:'ghp_gh107_probe_4',owner_photo_url:query.get('photo')||null,visits:Array.from({length:Number(query.get('visits')||1)},()=>({date:'2026-09-01'})),rewardPointsTotal:Number(query.get('points')||0),awarded_fidelity_tier:query.get('award')};
window.gh107={pet,settings:config,snapshot:getFidelityTierSnapshot(pet,config,new Date('2026-10-01T12:00:00Z'))};
if(query.has('reference')){
 window.React=React;
 for(const p of ['shared-ui.jsx','gh15-ed-kit.jsx','cd04-card-kit.jsx','cd09-tessera-kit.jsx','cd09-tessera-viste.jsx']) await import(/* @vite-ignore */ '/docs/consegne/CD-09-consegna/'+p);
 createRoot(document.getElementById('root')).render(React.createElement(window.TInizio));
}else{
 createRoot(document.getElementById('root')).render(React.createElement(MemoryRouter,null,React.createElement('main',{className:'pet-card-page'},React.createElement('header',{className:'pet-card-header'},React.createElement('span'),React.createElement('p',{className:'gh-area-title'},'ZavaRoby pet station')),React.createElement(PetCardView,{pet,snapshot:window.gh107.snapshot})),query.has('staff')&&React.createElement(StaffCard,{client:pet,fidelitySettings:config})));
}`;
let server;
server=await createServer({root,configFile:false,envDir:false,cacheDir:'/private/tmp/gh107-vite-cache',plugins:[{
 name:'gh107-local-proof',
 configureServer(s){s.middlewares.use(async(req,res,next)=>{
   if(req.url?.startsWith('/__gh107/view')) {res.setHeader('Content-Type','text/html');res.end(await s.transformIndexHtml(req.url,'<!doctype html><html lang="it"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="manifest" href="/manifest.webmanifest"></head><body><div id="root"></div><script type="module" src="/__gh107/render.jsx"></script></body></html>'));return;}
   next();
 });},
 resolveId(id){if(id==='/__gh107/render.jsx')return id;},
 load(id){if(id==='/__gh107/render.jsx')return source.replace("'/node_modules/.vite/deps/react.js'","'react'");},
},react()],define:Object.fromEntries(Object.entries(env).filter(([k])=>k.startsWith('VITE_')).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),server:{host:'127.0.0.1',port:4178,strictPort:true,open:false,watch:{ignored:['**/docs/**','**/controlli-salone/**','**/nomi-da-recuperare/**','**/qr-gadget/**']}},optimizeDeps:{entries:['src/main.jsx']}});
await server.listen();
console.log('GH107_PREVIEW http://127.0.0.1:4178 (demo only)');
