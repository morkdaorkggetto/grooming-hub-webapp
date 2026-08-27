import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/luigimaisto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const BASE_URL = process.env.GH18_BASE_URL || 'http://127.0.0.1:4176';
const DEMO_REF = 'qttpinkslhenxrsbhhhg';
const OUTPUT_DIR = '/tmp/gh18-visual';
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const split = line.indexOf('=');
      return [line.slice(0, split), line.slice(split + 1).replace(/^['"]|['"]$/g, '')];
    })
);

if (!env.VITE_SUPABASE_URL?.includes(DEMO_REF)) {
  throw new Error('GH-18 interrotto: .env.local non punta al demo autorizzato.');
}
if (!env.GH_RLS_MARIO_PASSWORD) {
  throw new Error('GH-18 interrotto: credenziale customer demo assente.');
}

fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const collectPageMetrics = async (page, viewport) => page.evaluate((isMobile) => {
  const visible = (element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const targetRect = (element) => {
    const rects = [element, ...element.querySelectorAll('*')]
      .filter(visible)
      .map((item) => item.getBoundingClientRect());
    return {
      left: Math.min(...rects.map((rect) => rect.left)),
      top: Math.min(...rects.map((rect) => rect.top)),
      right: Math.max(...rects.map((rect) => rect.right)),
      bottom: Math.max(...rects.map((rect) => rect.bottom)),
      width: Math.max(...rects.map((rect) => rect.right)) - Math.min(...rects.map((rect) => rect.left)),
      height: Math.max(...rects.map((rect) => rect.bottom)) - Math.min(...rects.map((rect) => rect.top)),
    };
  };
  const interactive = [...document.querySelectorAll('a, button, input, select, textarea, [role="button"]')]
    .filter(visible);
  const shortTargets = isMobile
    ? interactive
      .map((element) => {
        const rect = targetRect(element);
        return {
          tag: element.tagName.toLowerCase(),
          text: (element.getAttribute('aria-label') || element.textContent || element.getAttribute('placeholder') || '')
            .trim().replace(/\s+/g, ' ').slice(0, 55),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter((target) => target.width < 44 || target.height < 44)
    : [];
  const occludedTargets = interactive
    .map((element) => {
      const rect = targetRect(element);
      if (rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth) return null;
      const x = Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2));
      const y = Math.max(0, Math.min(innerHeight - 1, rect.top + Math.min(rect.height / 2, 20)));
      const hit = document.elementFromPoint(x, y);
      if (hit?.closest('nav[aria-label="Navigazione principale"], .gh-pet-booking-sidebar')) return null;
      return hit && (element === hit || element.contains(hit) || hit.contains(element))
        ? null
        : (element.getAttribute('aria-label') || element.textContent || element.tagName).trim().slice(0, 55);
    })
    .filter(Boolean);
  const cardLike = [...document.querySelectorAll('div')]
    .filter(visible)
    .map((element) => {
      const style = getComputedStyle(element);
      return {
        radius: style.borderRadius,
        shadow: style.boxShadow,
        background: style.backgroundColor,
        border: style.borderColor,
      };
    })
    .filter((item) => ['24px', '28px'].includes(item.radius));
  const eyebrows = [...document.querySelectorAll('*')]
    .filter(visible)
    .map((element) => {
      const style = getComputedStyle(element);
      return {
        text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 45),
        fontSize: style.fontSize,
        letterSpacing: style.letterSpacing,
        transform: style.textTransform,
        color: style.color,
      };
    })
    .filter((item) => item.transform === 'uppercase' && item.fontSize === '11px');
  const skeletons = [...document.querySelectorAll('[aria-hidden="true"]')]
    .filter(visible)
    .map((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        radius: style.borderRadius,
        background: style.backgroundImage,
      };
    })
    .filter((item) => item.background.includes('linear-gradient'));
  return {
    overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    shortTargets,
    occludedTargets,
    cardLike,
    eyebrows,
    skeletons,
    bodyTextLength: document.body.innerText.trim().length,
  };
}, viewport < 640);

const waitForSettledPage = async (page) => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(
    () => (document.querySelector('main')?.innerText.trim().length || 0) > 80,
    { timeout: 10000 }
  );
  await page.waitForTimeout(500);
};

const authContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const authPage = await authContext.newPage();
await authPage.goto(`${BASE_URL}/u/login`);
await authPage.getByLabel('Email').fill('mario.rossi@test.example');
await authPage.getByLabel('Password').fill(env.GH_RLS_MARIO_PASSWORD);
await authPage.getByRole('button', { name: 'Accedi' }).click();
await authPage.waitForURL(/\/u\/home/, { timeout: 15000 });
await waitForSettledPage(authPage);
const petHref = await authPage.locator('a[href^="/u/pet/"]').first().getAttribute('href');
if (!petHref) throw new Error('Nessuna scheda pet raggiungibile per Mario.');
const storageState = await authContext.storageState();
await authContext.close();

const routes = [
  { key: 'home', path: '/u/home', auth: true },
  { key: 'login', path: '/u/login', auth: false },
  { key: 'promotions', path: '/u/promotions', auth: true },
  { key: 'pet', path: petHref, auth: true },
  { key: 'book', path: '/u/book', auth: true },
  { key: 'redeem', path: '/u/redeem/gh18-regression-token', auth: false },
  { key: 'forgot', path: '/u/forgot', auth: false },
];
const widths = [1440, 390, 320];
const results = [];

for (const route of routes) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width === 1440 ? 1100 : 844 },
      storageState: route.auth ? storageState : undefined,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.goto(`${BASE_URL}${route.path}`);
    await waitForSettledPage(page);

    if (route.key === 'book') {
      const firstDate = page.locator('.gh-desired-date').first();
      if (await firstDate.count()) {
        await firstDate.click();
        await page.waitForTimeout(150);
      }
    }

    const metrics = await collectPageMetrics(page, width);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${route.key}-${width}.png`), fullPage: true });
    results.push({
      route: route.key,
      width,
      finalPath: new URL(page.url()).pathname,
      consoleErrors,
      ...metrics,
      notice: route.key === 'book'
        ? await page.locator('[role="status"]').allTextContents()
        : [],
    });
    await context.close();
  }
}

const loadingContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  storageState,
});
const loadingPage = await loadingContext.newPage();
await loadingPage.route(`${env.VITE_SUPABASE_URL}/rest/v1/**`, async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  await route.continue();
});
const loading = [];
for (const route of routes.filter((item) => item.auth && ['home', 'promotions', 'pet', 'book'].includes(item.key))) {
  await loadingPage.goto(`${BASE_URL}${route.path}`);
  await loadingPage.waitForLoadState('domcontentloaded');
  await loadingPage.waitForTimeout(180);
  const metrics = await collectPageMetrics(loadingPage, 390);
  loading.push({ route: route.key, skeletons: metrics.skeletons });
}
await loadingContext.close();
await browser.close();

const summary = {
  demoRef: DEMO_REF,
  petPath: petHref,
  results,
  loading,
};
fs.writeFileSync('/tmp/gh18-results.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  pages: results.map(({ route, width, finalPath, overflow, shortTargets, occludedTargets, consoleErrors, cardLike, eyebrows, notice }) => ({
    route,
    width,
    finalPath,
    overflow,
    shortTargets,
    occludedTargets,
    consoleErrors,
    cardRadii: [...new Set(cardLike.map((item) => item.radius))],
    cardShadows: [...new Set(cardLike.map((item) => item.shadow))],
    eyebrowSizes: [...new Set(eyebrows.map((item) => item.fontSize))],
    noticeCount: notice.length,
  })),
  loading: loading.map((item) => ({ route: item.route, skeletonCount: item.skeletons.length, skeletons: item.skeletons })),
}, null, 2));
