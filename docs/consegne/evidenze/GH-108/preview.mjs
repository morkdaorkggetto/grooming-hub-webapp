import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url)).replace(/\/$/, '');
const { createServer, loadEnv } = await import(root + '/node_modules/vite/dist/node/index.js');
const { default: react } = await import(root + '/node_modules/@vitejs/plugin-react/dist/index.js');
const env = loadEnv('development', root, '');
if (new URL(env.VITE_SUPABASE_URL).hostname !== 'qttpinkslhenxrsbhhhg.supabase.co') throw Error('Demo only');
const server = await createServer({ root, configFile: false, envDir: false, cacheDir: '/private/tmp/gh108-vite-cache', plugins: [{
  name: 'gh108-local-proof',
  configureServer(s) { s.middlewares.use(async (req, res, next) => {
    if (!req.url?.startsWith('/__gh108')) return next();
    res.setHeader('Content-Type', 'text/html');
    res.end(await s.transformIndexHtml(req.url, '<!doctype html><html lang="it"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="manifest" href="/manifest.webmanifest"></head><body><div id="root"></div><script type="module" src="/docs/consegne/evidenze/GH-108/preview.jsx"></script></body></html>'));
  }); },
}, react()], define: Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith('VITE_')).map(([k, v]) => ['import.meta.env.' + k, JSON.stringify(v)])), server: { host: '127.0.0.1', port: 4179, strictPort: true, watch: { ignored: ['**/controlli-salone/**', '**/nomi-da-recuperare/**', '**/qr-gadget/**'] } } });
await server.listen();
console.log('GH108 synthetic preview http://127.0.0.1:4179/__gh108');
