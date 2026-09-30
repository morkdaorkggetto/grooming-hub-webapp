import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const evidence = path.dirname(fileURLToPath(import.meta.url));
const phase = process.argv[2] || 'after';
const source = fs.readFileSync(path.join(root, 'src/apps/staff/pages/ClientDetail.jsx'), 'utf8');
const start = source.indexOf('<Panel className="gh-next-appointments"');
const panel = source.slice(start, source.indexOf('</Panel>', start) + 8);
const reliabilityStart = source.indexOf('<Panel\n          eyebrow="Affidabilità appuntamenti"');
assert(start > 0 && reliabilityStart > 0);
const reliability = source.slice(reliabilityStart, source.indexOf('</Panel>', reliabilityStart) + 8);
const entry = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter, Link} from 'react-router-dom';
import {Panel, Button, ScoreScale} from '/src/apps/staff/components/StaffKit.jsx';
import Icon from '/src/shared/ui/Icon';
import '/src/index.css';
import '/src/shared/tokens/tokens.css';
import '/src/apps/staff/styles/gh15-staff.css';
import '/src/apps/staff/pages/ClientDetail.css';
const empty = new URLSearchParams(location.search).has('empty');
const clientId = 'synthetic-local';
const navigate = () => {};
const handleToggleBlacklist = () => {};
const client = {no_show_score:0, is_blacklisted:false, noShowAppointments:[],
 upcomingAppointments:empty?[]:[{id:'local-a',scheduled_at:'2026-10-01T07:00:00Z',service:{name:'Bagno e taglio'}}],
 openRequests:empty?[]:[{id:'local-r',request_kind:'customer',staff_action:'needs_response',desired_date:'2026-10-03',service:{name:'Bagno'}}]};
const REQUEST_ACTION_LABELS = {needs_response:'Da rispondere'};
const getRomeDate = value => new Date(value).toLocaleDateString('en-CA',{timeZone:'Europe/Rome'});
const formatUpcomingDate = value => new Intl.DateTimeFormat('it-IT',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Rome'}).format(new Date(value));
const formatVisitDate = value => new Date(value+'T12:00:00Z').toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'numeric'});
const formatAbsenceDate = formatUpcomingDate;
createRoot(document.getElementById('root')).render(<MemoryRouter><main className="gh-page"><div className="gh-page-shell">
 <div className="comparison">${panel}${reliability}</div>
 <div id="references"><p className="gh-body">Testo corrente</p><p className="gh-body"><strong>Destinatario:</strong></p></div>
</div></main></MemoryRouter>);
`;
console.log('Starting local visual server');
const server = await createServer({ root, configFile:false, envDir:false,
  plugins:[{name:'gh105-local-fragments',
    resolveId(id) { if(id === '/__gh105.jsx') return root + '/__gh105.jsx'; if(id.endsWith('/StaffRequestAlerts') || id === './StaffRequestAlerts') return '\0gh105-alerts'; },
    load(id) { if(id === root + '/__gh105.jsx') return entry; if(id === '\0gh105-alerts') return 'export const STAFF_REQUEST_COUNT_LIMIT=99; export const useStaffRequestAlerts=()=>({pendingCount:0});'; },
    configureServer(server) { server.middlewares.use(async (req,res,next) => {if(req.url.split('?')[0]!=='/__gh105') return next();res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml('/__gh105','<html><head><style>.comparison{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))}#references{display:none}</style></head><body><div id="root"></div><script type="module" src="/__gh105.jsx"></script></body></html>'));}); }
  },react()], server:{host:'127.0.0.1',port:0}, cacheDir:'/private/tmp/gh105-vite-cache' });
let browser;
const results = [];
try {
  await server.listen();
  console.log('Local visual server ready');
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  page.on('console',msg=>{if(msg.type()==='error') console.error(msg.text());});
  const errors = [];
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
  await page.route('**/*', route => ['127.0.0.1','fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  for(const width of [375,1365]) for(const empty of [true,false]) {
    await page.setViewportSize({width,height:900});
    console.log(`Measuring ${phase} ${width} ${empty?'empty':'populated'}`);
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__gh105${empty?'?empty':''}`);
    await page.locator('.gh-next-appointments').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const measured = await page.evaluate(() => {
      const style = el => el ? Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color'].map(k=>[k,getComputedStyle(el)[k]])) : null;
      const panel = document.querySelector('.gh-next-appointments');
      const other = document.querySelector('.comparison > :nth-child(2)');
      return {actual:{eyebrow:style(panel.querySelector('.gh-eyebrow--staff')),empty:style(panel.querySelector('.gh-next-appointments__empty p')),
        date:style(panel.querySelector('[aria-label="Appuntamenti in agenda"] strong')),service:style(panel.querySelector('[aria-label="Appuntamenti in agenda"] .gh-next-appointments__copy > span')),
        request:style(panel.querySelector('[aria-label="Richieste aperte"] strong'))},
        reference:{eyebrow:style(other.querySelector('.gh-eyebrow--staff')),meta:style(other.querySelector('.gh-meta')),body:style(document.querySelector('#references > p')),strong:style(document.querySelector('#references strong'))},
        targets:[...panel.querySelectorAll('a,button')].map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})),
        overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert(!measured.overflow);
    assert(measured.targets.every(t=>t.width>=44&&t.height>=44));
    if(phase === 'after') for(const [key,ref] of Object.entries({eyebrow:'eyebrow',empty:'body',date:'strong',service:'meta',request:'strong'})) {
      if(measured.actual[key]) assert.deepEqual(measured.actual[key],measured.reference[ref],key);
    }
    results.push({width,empty,...measured});
    if(phase === 'after') await page.locator('.comparison').screenshot({path:path.join(evidence,`${empty?'empty':'populated'}-${width}.png`)});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(evidence,`${phase}-styles.json`),JSON.stringify({measuredAt:new Date().toISOString(),method:'Exact JSX panel fragments, real StaffKit and CSS; synthetic local data; external network limited to Google Fonts. Body references reproduce existing gh-body and gh-body strong markup (notes/invitation), absent from reliability panel.',results},null,2)+'\n');
  console.log(`${phase}: 4 visual cases PASS`);
} finally {await browser?.close();await server.close();}
