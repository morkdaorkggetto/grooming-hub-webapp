#!/usr/bin/env python3
import json, subprocess, sys, os, re, html
ROOT='/home/claude/cd13/root/project'; OUT='/home/claude/cd13/misure'
JS = r'''<script>
(async()=>{ const want=__ROBOTO__; if(want){await Promise.all(["500 11.5px Roboto","600 12.5px Roboto","700 13px Roboto","600 12px Roboto"].map(f=>document.fonts.load(f).catch(()=>[])));}
 await document.fonts.load("500 19px Fraunces").catch(()=>[]); await document.fonts.ready;
 const R=x=>+x.toFixed(2); const lines=el=>{const r=document.createRange();r.selectNodeContents(el);return [...new Set([...r.getClientRects()].filter(c=>c.width>0).map(c=>Math.round(c.top)))].length};
 const tw=el=>{const r=document.createRange();r.selectNodeContents(el);return R(Math.max(...[...r.getClientRects()].map(c=>c.width)))};
 const root=document.querySelector('[data-radice]'); const out={h:R(root.getBoundingClientRect().height), scrollW:document.documentElement.scrollWidth, fraunces:document.fonts.check("500 19px Fraunces"), gruppi:[], oggi:[]};
 for(const g of document.querySelectorAll('[data-fasce]')){ const gb=g.getBoundingClientRect(); const o={w:R(gb.width),h:R(gb.height),stato:(g.closest('[data-stato]')||{dataset:{}}).dataset.stato||'', dove:(g.closest('[data-dopo]')||{dataset:{}}).dataset.dopo||'', p:[]};
  for(const b of g.children){const bb=b.getBoundingClientRect(); const cs=getComputedStyle(b); const inner=bb.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-parseFloat(cs.borderLeftWidth)-parseFloat(cs.borderRightWidth);
   o.p.push({f:b.dataset.fascia,pressed:b.getAttribute('aria-pressed'),dis:b.disabled,w:R(bb.width),h:R(bb.height),utile:R(inner),esce:b.scrollWidth>b.clientWidth||b.scrollHeight>b.clientHeight,righe:[...b.querySelectorAll('[data-riga]')].map(s=>({k:s.dataset.riga,t:s.innerText.replace(/\n/g,' / '),n:lines(s),w:tw(s)}))});}
  const bl=g.closest('[data-blocco]'); if(bl){const t=bl.querySelector('[data-titolo]'); o.titolo={n:lines(t),w:tw(t),h:R(t.getBoundingClientRect().height)}; const n=bl.querySelector('[data-tolta]'); if(n) o.tolta={n:lines(n),h:R(n.getBoundingClientRect().height)}; o.blocco=R(bl.getBoundingClientRect().height);}
  out.gruppi.push(o);}
 for(const g of document.querySelectorAll('[data-fasce-oggi]')){const gb=g.getBoundingClientRect(); out.oggi.push({dove:g.closest('[data-prima]').dataset.prima,w:R(gb.width),h:R(gb.height),p:[...g.children].map(b=>{const bb=b.getBoundingClientRect();const r=document.createRange();r.selectNodeContents(b.firstChild);const ln=[...new Set([...r.getClientRects()].map(c=>Math.round(c.top)))].length;return {t:b.firstChild.textContent,w:R(bb.width),h:R(bb.height),righeEtichetta:ln,righeTot:lines(b),esce:b.scrollWidth>b.clientWidth}})});}
 const cal=document.querySelector('[data-calendario]'); if(cal) out.cal={w:R(cal.getBoundingClientRect().width)};
 const d=document.createElement('pre');d.id='m';d.textContent=JSON.stringify(out);document.body.appendChild(d);})();
</script>'''
def run(file, roboto):
    src=open(f'{ROOT}/{file}').read()
    extra='<style>[data-radice]{height:auto!important;overflow:visible!important}</style>'
    if roboto: extra+='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap"><style>:root{--font-sans: Roboto, sans-serif !important}</style>'
    # la copia di misura sta accanto all'originale per risolvere ds/…; l'originale non si tocca
    tmp=f'{ROOT}/_misura_{file}.html'
    open(tmp,'w').write(src.replace('</body>', extra+JS.replace('__ROBOTO__','true' if roboto else 'false')+'</body>'))
    dom=subprocess.run(['timeout','90','google-chrome','--headless=new','--no-sandbox','--disable-gpu','--virtual-time-budget=15000','--window-size=1000,1400','--dump-dom','file://'+tmp],capture_output=True,text=True).stdout
    os.remove(tmp)
    m=re.search(r'<pre id="m">([^<]*)',dom)
    return json.loads(html.unescape(m.group(1)))
files=['Main.dc.html','Riquadro.dc.html','Stati-prenotazione.dc.html','Stati-riquadro.dc.html','Prima-dopo.dc.html']
res={f:{'sistema':run(f,False),'roboto':run(f,True)} for f in files}
json.dump(res,open(f'{OUT}/misure-tavole.json','w'),ensure_ascii=False,indent=1)
if '--altezze' in sys.argv:
    import math
    json.dump({f:int(math.ceil(max(res[f]['sistema']['h'],res[f]['roboto']['h'])))+20 for f in files},open('/home/claude/cd13/gen/altezze.json','w'))
for f in files:
    for car in ('sistema','roboto'):
        r=res[f][car]; print(f'## {f} [{car}] h={r["h"]} scrollW={r["scrollW"]} fraunces={r["fraunces"]} cal={r.get("cal")}')
        for g in r['gruppi']:
            print('  ',g['stato'] or g['dove'] or '-', f'riga {g["w"]}×{g["h"]}', 'titolo',g.get('titolo'),'tolta',g.get('tolta'),'blocco',g.get('blocco'))
            for p in g['p']: print('     ',p['f'],'scelta' if p['pressed']=='true' else ('chiusa' if p['dis'] else 'aperta'),f'{p["w"]}×{p["h"]} utile {p["utile"]} esce={p["esce"]}',' | '.join(f'{x["k"]}: «{x["t"]}» {x["n"]} riga/e, {x["w"]}px' for x in p['righe']))
        for g in r['oggi']:
            print('   OGGI',g['dove'],f'riga {g["w"]}×{g["h"]}',' | '.join(f'«{p["t"]}» {p["w"]}×{p["h"]} righe {p["righeEtichetta"]}/{p["righeTot"]} esce={p["esce"]}' for p in g['p']))
