import fs from 'node:fs';
import crypto from 'node:crypto';
const source = new URL('../../../incarichi/GH-107-impronte-produzione.md', import.meta.url);
const document = fs.readFileSync(source, 'utf8');
const production = [...document.matchAll(/^\| (column|function|policy) \| `([^`]+)` \| `([a-f0-9]+)` \|$/gm)]
  .map(([,kind,name,md5]) => ({ kind,name,md5 }));
const demo = JSON.parse(fs.readFileSync(new URL('./impronte-demo.json', import.meta.url), 'utf8'));
const key = row => `${row.kind}|${row.name}`;
const fingerprint = rows => crypto.createHash('md5').update(rows.map(row => `${key(row)}|${row.md5}`).join('\n')).digest('hex');
const prodMap = new Map(production.map(row => [key(row),row]));
const demoMap = new Map(demo.map(row => [key(row),row]));
const result = {
  measuredAt: new Date().toISOString(),
  source: source.pathname,
  sourceSha256: crypto.createHash('sha256').update(document).digest('hex'),
  production: { declaredRows:271, tableRows:production.length, declaredMd5:'9b84214d27393f2b0f7ac65c6c35b5e6', tableMd5InGivenOrder:fingerprint(production) },
  demo: { rows:demo.length, md5InQueryOrder:fingerprint(demo) },
  onlyProduction:production.filter(row=>!demoMap.has(key(row))),
  onlyDemo:demo.filter(row=>!prodMap.has(key(row))),
  changed:production.filter(row=>demoMap.has(key(row))&&row.md5!==demoMap.get(key(row)).md5).map(row=>({...row,demoMd5:demoMap.get(key(row)).md5})),
  identical:production.filter(row=>row.md5===demoMap.get(key(row))?.md5).length,
};
fs.writeFileSync(new URL('./confronto-impronte.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
