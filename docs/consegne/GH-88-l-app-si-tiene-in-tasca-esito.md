# GH-88 - L'app si tiene in tasca: esito

## Esito e perimetro

**Implementazione locale pronta; verifica di lancio NON chiusa.** Manifest,
icone e metadati verificati. Restano senza misura l'installazione reale su
Android/iPhone e il deposito della sessione iOS: non sostituiti con emulazioni.

Root: `/Users/luigimaisto/Desktop/grooming-hub-web`; worktree: `webapp/`.
Mandato nominativo di Luigi, versione locale GH-88 letta integralmente.
Base: `main`, `a9b41c2ae7d06bc208a71f340bf3006cecaadeef`, inizialmente avanti
di 3 commit rispetto al riferimento locale `origin/main` (nessun fetch).
Codice e registro nello stesso commit `feat: add home screen manifest and brand icons (GH-88)`.
Identificativo risolvibile con:
`git log -1 --format=%H -- docs/consegne/GH-88-l-app-si-tiene-in-tasca-esito.md`.

**Zero database letti o scritti**, nessuna suite RLS rieseguita, nessun account,
password, migrazione, policy, dipendenza, rotta, service worker, push, merge o
deploy. GH-84 non riaperto. Ultima RLS nota dal registro GH-86: 60 PASS,
0 FAIL, 0 SKIP; non e' una nuova misura di questo mandato.

## Tabella esaustiva del commit

| File | Intervento / motivo |
|---|---|
| `index.html` | Favicon PNG, apple-touch-icon, manifest, titolo senza emoji, theme-color coerente; metadati Apple per compatibilita' e nome |
| `public/manifest.webmanifest` | Un solo manifest per entrambe le aree |
| `public/icons/icon-192.png` | Icona generica 192, dimensione per installazione Chromium |
| `public/icons/icon-512.png` | Icona generica 512, versione ad alta risoluzione |
| `public/icons/icon-maskable-512.png` | Variante 512 opaca, ritaglio demandato al sistema |
| `public/icons/apple-touch-icon.png` | PNG opaco 180, collegamento Home iOS dedicato |
| `public/icons/favicon-32.png` | PNG 32 per scheda browser, sostituisce il segnaposto assente |
| `docs/consegne/GH-88-l-app-si-tiene-in-tasca-esito.md` | Questo registro, prove e limiti |

Esclusi da modifiche, stage e commit: CD-08, GH-84, GH-85, GH-86, GH-87,
GH-88 in `docs/incarichi/`. Documenti paralleli di Luigi/Cowork, gia'
autorizzati come esclusi. Nessun file del diario toccato.

## Manifest completo e scelte

```json
{
  "id": "/",
  "name": "Grooming Hub",
  "short_name": "Grooming Hub",
  "lang": "it",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#6f9792",
  "background_color": "#f2ece9",
  "icons": [
    {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
```

| Campo | Motivo |
|---|---|
| `id` | Identita' stabile alla radice, condivisa fra staff e proprietario |
| `name`, `short_name` | Marchio esistente, 11 caratteri incluso lo spazio; nessun nome tecnico del repository o abbreviazione inventata |
| `lang` | Interfaccia e nome contestualizzati in italiano |
| `start_url` | `/` prescritto dal mandato; smistamento esistente verificato |
| `scope` | `/` comprende tutte le rotte esistenti delle due aree sulla stessa origine |
| `display` | `standalone`: finestra applicativa senza barra URL, preservando i controlli di sistema; non modalita' immersiva `fullscreen` |
| `theme_color` | Colore primario effettivo, misura sotto |
| `background_color` | `--color-bg-main` esistente, evita un nuovo colore nella fase di avvio |
| `icons[].src` | Percorsi assoluti disponibili anche dalle rotte annidate |
| `icons[].sizes`, `type` | Dimensioni reali misurate e formato PNG, non soltanto dichiarati |
| `icons[].purpose` | `any` conserva il quadrato arrotondato; `maskable` e' un asset distinto, opaco fino ai bordi |

Titolo HTML esatto: **Grooming Hub**. Collegamento iOS:
`<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />`.
`apple-mobile-web-app-title` ha lo stesso nome; `apple-mobile-web-app-capable=yes`
mantiene la compatibilita' con l'apertura standalone sui sistemi precedenti.
Non e' stato creato un pacchetto da pubblicare negli store.

## Misura dei colori

Prima: `#d4a574` in `index.html:8` e `tailwind.config.js:13`.
Verde `#6f9792` in `src/index.css:28` (primary), `:36` (header),
`src/shared/ui/Brandmark.jsx:29` (fallback). La configurazione Tailwind sabbia
e' rimasta intatta: nessuna classe della famiglia `*-primary` trovata in `src/`
con confine di token, distinguendola da `--color-text-primary`.

Comandi di ricognizione:
```sh
rg -n -i 'd4a574|212\s*[, ]\s*165\s*[, ]\s*116|6f9792' src index.html public tailwind.config.js
rg -n --pcre2 '(?<![\w-])(?:bg|text|border|ring|outline|fill|stroke|from|to|via|shadow|divide|decoration|accent|caret)-primary\b' src
```

Nel login `/u/login` renderizzato, scansione degli elementi visibili sulle
proprieta' `color`, `backgroundColor`, `borderTopColor`: **2 occorrenze verdi**
(sfondo marchio e bottone Accedi), **0 sabbia**. Primary calcolato `#6f9792`.
Prima il meta era sabbia; dopo e' verde. Proposta applicata: allineare i
metadati al marchio e ai token effettivi, senza cambiare alcuna superficie.
Non e' una dichiarazione che ogni schermata possibile sia stata scansionata.

## Icone e prova del ritaglio

Rasterizzate dal **componente React reale**, non da un disegno simile:
Brandmark a ciascuna dimensione, simbolo al 55%, stroke 1.8, stesse quattro
circonferenze e stesso path; colori `#6f9792` e `#FBF6F3`.
Per `any` e favicon: raggio `size / 2.8`, trasparenza esterna.
Per maskable e Apple: stesso simbolo/scala, fondo quadrato opaco, angoli
ritagliati dal sistema. Nessuna modifica al componente sorgente, impronta:
`8500ee798cdfb92a405f1982d3fa134785e3c805c7d59b3b532422aca45c3334`.

| File in `public/icons/` | Pixel | Byte | SHA-256 |
|---|---:|---:|---|
| `icon-192.png` | 192x192 | 7472 | `5290acfe2ead464420be8ba07364b67b39c0331423aacbebaa9a9580e572be44` |
| `icon-512.png` | 512x512 | 21234 | `8df6a2763e01c151b85c476c5e6bda4933e60a1f35ce8a6a1fc62143d9f1e6d7` |
| `icon-maskable-512.png` | 512x512 | 13390 | `65f0961af0f0f8607051dd038232257dc5f56280c38cd74a140be6649c8ad4cf` |
| `apple-touch-icon.png` | 180x180 | 4384 | `0fe0a9de6df1125cba371c23768ad2128f434f931755976a9405d6320f227134` |
| `favicon-32.png` | 32x32 | 1159 | `124f19131c99e5ff46a8b07037092b4fa083f41497b7e3fa009ec7abeeb8c8d2` |

Mascherabile: cerchio sicuro centrato, raggio **204.8 px = 40% di 512**.
20936 pixel diversi dal fondo (antialias incluso), **0 fuori dal cerchio**,
raggio massimo **124.228 px**, margine minimo **80.572 px**, **0 pixel
trasparenti**. Prova a schermo con cerchio minimo e quadrato arrotondato,
ispezionata visivamente: nessuna parte della zampa tagliata.
[Regola della zona sicura, web.dev](https://web.dev/articles/maskable-icon).

![Prova locale del ritaglio, non una Home Android](/private/tmp/gh88-evidence/mask-proof.png)

Screenshot SHA-256: `ef0f48d033f0ca0ca94957bb10cc1e8085a5c80db4227973214cdd06bceec298`.
**Limite degli allegati:** gli screenshot e il banco sono locali in `/private/tmp/`,
non permanenti in Git, per rispettare l'elenco di file ammesso da Luigi.
Le misure sono conservate qui; una prova grafica persistente separata
richiederebbe autorizzare ulteriori file di evidenza, non pubblicarli in `public/`.

## Controprove locali

Banco `/private/tmp/gh88-check.mjs`: Vite con `configFile:false`, `envDir:false`,
URL fittizio `https://gh88-memory.invalid`, chiave fittizia. Applicazione e SDK
reali; HTTP Auth/REST risposto in memoria, WebSocket chiusi, font remoti
neutralizzati. Nessuna richiesta al demo o al prod. Nessuna credenziale reale.
Playwright disponibile nel runtime Codex; agent-browser non installato.

`node /private/tmp/gh88-check.mjs before`, `generate`, `after`:

- Sessione staff con membership `owner`, profilo `operator`: `/` -> `/login` -> **`/dashboard`**.
- Sessione proprietario con membership/profilo `customer`: `/` -> `/login` -> **`/u/home`**.
- Client Auth non modificato; nessuna sessione reale usata per la prova.
- Chromium 151.0.7922.34, `Page.getAppManifest`: **0 errori**, display `kStandalone`, start/scope `/`.
- `Page.getInstallabilityErrors`: **lista vuota**. Non equivale a un'installazione Android o iOS provata.
- **0 pageerror, 0 richieste esterne inattese** nel banco finale.
- Screenshot login 1024x850 prima/dopo: impronta identica `7086e9f44bb00bd9613618c9668f4bf4dafb71d9ab876709d7876b36472a3c2a`.
- Anteprima di `dist/` a 375x812: titolo corretto, overflow orizzontale **0 px**, screenshot ispezionato.
- Tutti e sei gli asset HTTP: **200**, manifest `application/manifest+json`, icone `image/png`.
- Manifest 620 byte, SHA-256 `59869cf8c9672406bcb062206d7aa1a3cd67e6e12ea45f33ce10bc01fc71d32a`.
- Manifest + cinque PNG dentro `dist/`: **6/6 confronti byte-per-byte identici** a `public/`.

Ricerca esaustiva del vecchio riferimento (incluse le fonti documentali):
```sh
rg -l --hidden -g '!.git/**' -g '!node_modules/**' '/vite\.svg' .
```
Prima di questo registro: solo il mandato GH-88; dopo: anche questo registro.
Nessun riferimento eseguibile, neppure nel pacchetto costruito. Documenti
storici esclusi dal commit non alterati per ottenere artificialmente zero match.

Invarianti verificati:
```sh
git diff --name-only a9b41c2 -- src/apps src/shared package.json package-lock.json
git diff --check
```
Primo comando: **nessun file**; secondo: nessun errore.

Build finale:
```sh
/usr/bin/time -p env VITE_SUPABASE_URL=https://gh88-memory.invalid VITE_SUPABASE_ANON_KEY=gh88-memory-not-a-key npm run build
```
**PASS, 163 moduli, 1.21 s Vite / 1.56 s wall**. Avvisi preesistenti:
Browserslist obsoleto e chunk JS oltre 500 kB. Questo `dist/` usa configurazione
fittizia ed e' solo una prova locale: **non va distribuito**. Anteprima asset
su `http://127.0.0.1:4188/`, non utilizzabile per login reale.

## Telefoni: misura mancante e proposta a Cowork

**Android Home: NON ESEGUITA. iPhone Home: NON ESEGUITA. Separazione deposito
iOS: NON MISURATA.** `adb` non disponibile; `xcrun simctl list devices booted`
fallisce per utility assente. Nessun dispositivo mobile controllabile usato.
Il viewport mobile di Chromium non e' Safari iOS ne' un launcher Android.

Atteso dalla configurazione, non osservato su telefono: nome **Grooming Hub**,
icona del marchio, apertura standalone. Il nome finale puo' essere modificato
dalla persona e la resa dipende dal launcher. Su Safari 26 la persona puo'
scegliere di disabilitare l'apertura come web app: non promettere sempre
standalone indipendentemente da quella scelta.
[Comportamento Safari 26](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/).

WebKit documenta la copia dei **cookie** all'aggiunta alla Home da Safari 17.2,
non la condivisione successiva degli altri dati del sito.
[Fonte WebKit](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/).
Il client locale usa `createClient(url,key)` senza storage personalizzato;
l'SDK installato ha `persistSession:true` e usa `globalThis.localStorage`
quando disponibile (`GoTrueClient.ts:170,374`). **Inferenza, non controprova:**
la copia dei cookie non basta a dimostrare che questa sessione segua l'icona.
Non e' corretto dichiarare ne' il riaccesso obbligatorio ne' quello evitato.

**Soluzione consigliata:** non cambiare Auth qui e non riaprire GH-84.
Al rilascio autorizzato, Luigi misura sul link HTTPS vero, annotando modello,
versione OS/browser e stato iniziale, senza rimuovere installazioni esistenti
che potrebbero contenere dati. Su un telefono di prova:
1. Accesso in Safari, aggiunta alla Home, screenshot nome/icona e primo avvio.
2. Registrare se viene richiesto di nuovo l'accesso; se necessario effettuarlo
   dentro la web app, chiuderla e riaprirla, annotando la persistenza.
3. Per distinguere la sola osservazione dell'accesso dall'effettivo deposito,
   un successivo banco controllato puo' usare un marker locale NON sensibile
   tramite Web Inspector, confrontato fra Safari e standalone e poi rimosso.
   Mai copiare o stampare il token Auth come prova.
4. Ripetere nome/icona/modalita' di apertura su Android e il percorso staff/
   proprietario da icona. In seguito farlo fare a Paola senza suggerimenti.

Se il riaccesso e' confermato, la minima azione e' aggiornare le istruzioni
di lancio; eventuale modifica della persistenza richiede un mandato distinto.
Nessuna correzione speculativa, nessun trasferimento di token in URL.
Il passo finale resta: **«cosa non ti torna?»** e **«fra due mesi saprai dove
trovarla?»**. Non sbloccare il lancio solo sulla base dei test desktop.

Rettifica utile dell'input: l'assenza del manifest non dimostrava da sola
l'impossibilita' assoluta di aggiungere un sito alla Home. Qui si rende
esplicita l'identita' installabile; non si implementano notifiche a app
chiusa, offline o registrazione push.

## Tempi, eccezioni e pulizia

Intervallo misurato di ricognizione tecnica/implementazione/prove:
**12/09/2026 17:09:33-17:14:32 UTC, 4 min 59 s**; esclusi lettura iniziale,
attesa conferma documenti, stesura di questo registro e commit.
Banco prima: 2.516 s; rasterizzazione definitiva: 2.959 s;
controprove finali: 2.887 s. Nessun rallentamento persistente di I/O rilevato.

Incidenti del banco, risolti prima della consegna: percorso plugin `.mjs`
invece di `.js`; bind localhost negato dal sandbox e poi autorizzato;
fixture che doveva accettare HEAD oltre a GET; selettore che includeva anche
il wordmark; prima rasterizzazione 512x513 per allineamento subpixel.
Quest'ultima e' stata rilevata dalla prova pixel (512 pixel esterni alla zona)
e corretta fissando il marchio all'origine intera, senza cambiarne geometria.
Un controllo avviato prima che i PNG fossero generati e' fallito per file
assente. **I file finali sono quelli misurati nella tabella**, non le prove
intermedie. Nessuna estensione del codice applicativo fuori mandato.

Browser di verifica chiusi; server del banco chiusi; rimane solo l'anteprima
4188 per ispezionare gli asset. Script temporaneo ed evidenze locali fuori
dal repository; nessuna fixture di dato da smontare. `dist/` generato e non
versionato. Nessun documento di Cowork incluso nel commit.
