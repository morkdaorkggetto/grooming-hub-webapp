import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getFidelityTierSnapshot as snapshot } from '../../../../src/shared/lib/fidelity.js';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const oldSource=execFileSync('git',['show','fc3acb90ff9f58af61182c7e40d009986fa89fe8:src/apps/staff/lib/fidelity.js'],{cwd:root});
const old=(await import('data:text/javascript;base64,'+oldSource.toString('base64'))).getFidelityTierSnapshot;
const DateOriginal=Date;
const now=new DateOriginal('2026-10-01T12:00:00Z');
globalThis.Date=class extends DateOriginal { constructor(...args){super(...(args.length?args:[now.getTime()]));} static now(){return now.getTime();} };
const settings={fidelity_tiers:{bronze:{visits_required:6,months_window:12,points_required:100},silver:{visits_required:12,months_window:24,points_required:250},gold:{visits_required:36,months_window:36,points_required:500}}};
const projected={...settings,fidelity_projection:{history_start:'2026-03-06',tiers:['bronze']}};
const pet=(n,points=0,award=null)=>({visits:Array.from({length:n},()=>({date:'2026-09-01'})),rewardPointsTotal:points,awarded_fidelity_tier:award});
const legacyShape=value=>JSON.parse(JSON.stringify(value,(key,item)=>['projected','historyStart'].includes(key)?undefined:item));
let checks=0;
try {
  for(const n of [0,1,3,4,5,6,11,12,35,36,40])for(const points of [0,99,100,249,250,499,500])for(const award of [null,'bronze','silver','gold']) {
    assert.deepEqual(legacyShape(snapshot(pet(n,points,award),settings)),old(pet(n,points,award),settings));checks++;
  }
  const cases=[];
  for(const [n,key] of [[0,null],[1,null],[3,null],[4,'bronze'],[12,'silver'],[36,'gold']]) {
    const result=snapshot(pet(n),projected,now);assert.equal(result.currentTier?.key||null,key);
    cases.push({visits:n,level:key||'base',threshold:result.tiers[0].visitsRequired});
  }
  for(const invalid of [null,{}, {history_start:'2026-02-30',tiers:['bronze']},{history_start:'wrong',tiers:['bronze']},{history_start:'2027-03-06',tiers:['bronze']},{history_start:'2026-03-06',tiers:[]},{history_start:'2026-03-06',tiers:'bronze'},{history_start:'2026-03-06',tiers:['silver','gold']}]) {
    assert.deepEqual(legacyShape(snapshot(pet(4),{...settings,fidelity_projection:invalid},now)),old(pet(4),settings));
  }
  const mature={...settings,fidelity_projection:{history_start:'2025-09-01',tiers:['bronze']}};
  assert.deepEqual(legacyShape(snapshot(pet(4),mature,now)),old(pet(4),settings));
  assert.equal(snapshot(pet(0,0,'bronze'),projected,now).currentTier.key,'bronze');
  assert.equal(snapshot(pet(0,250),projected,now).currentTier.key,'silver');
  assert.equal(snapshot(pet(0,500),projected,now).currentTier.key,'gold');
  assert.equal(snapshot(pet(0),projected,new DateOriginal('2026-03-06T12:00:00Z')).tiers[0].visitsRequired,0);
  const changes=[];let prior=4;
  for(let day=new DateOriginal('2026-10-02T12:00:00Z');day<=new DateOriginal('2027-03-07T12:00:00Z');day.setUTCDate(day.getUTCDate()+1)) {
    const bronze=snapshot(pet(0),projected,day).tiers[0];
    if(bronze.visitsRequired!==prior){changes.push({date:day.toISOString().slice(0,10),threshold:bronze.visitsRequired});prior=bronze.visitsRequired;}
  }
  assert.deepEqual(changes,[{date:'2026-11-07',threshold:5},{date:'2027-01-07',threshold:6}]);
  const result={at:new DateOriginal().toISOString(),dateUnderTest:now.toISOString(),legacySnapshotsIdentical:checks,invalidProjectionCases:8,matureHistoryThreshold:snapshot(pet(4),mature,now).tiers[0].visitsRequired,cases,changes,manualAndPoints:'PASS',monthConvention:'calendar anniversaries; fractional month between anniversaries; Europe/Rome day'};
  fs.writeFileSync(new URL('./gh108-regola.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
} finally {globalThis.Date=DateOriginal;}
