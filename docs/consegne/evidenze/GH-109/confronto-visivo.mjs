import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=await import('/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch(), out=new URL('./',import.meta.url), errors=[];
const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
try {
  for(const mode of ['none','proposal','portrait'])for(const [width,height] of [[375,812],[375,667],[320,568]]) {
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:4180/__gh109?'+(mode==='none'?'':mode==='portrait'?'portrait&alert':'alert'));
    await page.getByText('Mostra al banco',{exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);
    const reference=await page.screenshot();
    const actual=fs.readFileSync(new URL(`${mode}-${width}x${height}.png`,out));
    const comparison=await browser.newPage({viewport:{width:width*2,height:height+60}});
    await comparison.setContent(`<body style="margin:0;display:flex;font:14px sans-serif"><section><h3>CD-11: stato 24px, barra 64px</h3><img width="${width}" src="data:image/png;base64,${reference.toString('base64')}"></section><section><h3>GH-109: demo, barra esistente</h3><img width="${width}" src="data:image/png;base64,${actual.toString('base64')}"></section></body>`);
    await comparison.screenshot({path:new URL(`cd11-${mode}-${width}x${height}.png`,out).pathname});await comparison.close();
  }
  assert.deepEqual(errors,[]);console.log('9 confronti CD-11 affiancati, console pulita');
}finally{await browser.close();}
