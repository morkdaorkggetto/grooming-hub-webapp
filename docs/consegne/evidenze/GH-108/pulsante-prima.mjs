import fs from 'node:fs';
const { chromium } = await import('/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser = await chromium.launch();
const results = [];
try {
  const page = await browser.newPage();
  for (const width of [375, 1365]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4178/__gh107/view?visits=3&project');
    await page.waitForFunction(() => !document.querySelector('.pet-card-show')?.disabled);
    for (const state of ['rest', 'hover']) {
      if (state === 'hover') await page.locator('.pet-card-show').hover();
      else await page.mouse.move(0, 0);
      await page.waitForTimeout(200);
      results.push(await page.locator('.pet-card-show').evaluate((el, args) => {
        const css = getComputedStyle(el);
        const parents = [];
        for (let p = el.parentElement; p; p = p.parentElement) parents.push({ tag: p.tagName, class: p.className, opacity: getComputedStyle(p).opacity });
        return { ...args, background: css.backgroundColor, color: css.color, opacity: css.opacity, height: el.getBoundingClientRect().height, hover: el.matches(':hover'), focus: el.matches(':focus'), parents };
      }, { width, state }));
    }
  }
  fs.writeFileSync(new URL('pulsante-prima.json', import.meta.url), JSON.stringify({ at: new Date().toISOString(), results }, null, 2) + '\n');
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
