# 05 · Design Tokens

## Principio

I token di Grooming Hub sono **già allineati** al repo staff (`src/index.css`). Non inventarne di nuovi, non alterare la palette, non introdurre shade Tailwind diverse.

Il file `reference/tokens.css` contiene la fonte autorevole per i mockup — va **unificato** con `src/index.css` del repo, non copiato accanto.

### Azione richiesta

1. Aprire `src/index.css` del repo staff
2. Aprire `reference/tokens.css`
3. **Diff manuale**: le variabili `--color-*` devono già combaciare. Se ci sono differenze, segnalarle all'autore prima di decidere quale tenere.
4. Spostare le variabili in `src/shared/tokens/tokens.css` e rimuoverle da `src/index.css`. In `src/index.css` rimane solo l'import: `@import '@/shared/tokens/tokens.css';`
5. Le parti **editoriali** (`--font-serif: 'Fraunces', …` e il `@import` di Google Fonts) vanno aggiunte al file unificato — nuove nel repo ma usate dalla customer app (tipografia scheda pet, hero promozioni).

## Palette

| Token | Valore | Uso |
|---|---|---|
| `--color-primary` | `#6f9792` | CTA primarie, header |
| `--color-primary-hover` | `#5e8580` | hover CTA primarie |
| `--color-secondary` | `#67383f` | Accenti, tag, CTA secondarie scure |
| `--color-secondary-hover` | `#562d33` | hover secondary |
| `--color-bg-main` | `#f2ece9` | sfondo app |
| `--color-surface-main` | `#fbf6f3` | card principale |
| `--color-surface-soft` | `#f3ece8` | card secondarie |
| `--color-surface-muted` | `#e5d7d8` | sfondi disattivi / fasce |
| `--color-border` | `#cfc1c4` | bordi sottili |
| `--color-text-primary` | `#2b2525` | testo body |
| `--color-text-secondary` | `#7f6f73` | testo muted / helper |
| `--color-placeholder` | `#a58f95` | placeholder input |
| `--color-link` | `#5e8580` | link inline |
| `--color-success-text` / `-bg` | `#4f8b67` / `#e3f0e7` | stati positivi |
| `--color-danger-text` / `-bg` | `#b85e69` / `#f8e6e9` | errori |
| `--color-warning-text` / `-bg` / `-border` | `#7f5d60` / `#efe3de` / `#c8a89f` | attenzione |

**Tier fedeltà** (`--tier-bronze/silver/gold`) sono nel file ma **non usarli in Fase 1** — la fedeltà è fuori scope.

## Tipografia

- `--font-sans` → UI standard, form, navigation, body
- `--font-serif` (Fraunces) → **usata solo** per:
  - nome del pet (hero scheda pet)
  - titoli delle promozioni (card e pagina)
  - eventuali titoli di sezione "editoriali" (valutare caso per caso, non abusare)

Tutti i `h1`–`h3` delle schermate funzionali (Dashboard, Prenotazione, Promozioni list header) restano in sans.

Scala suggerita (da validare con il repo staff):
- `h1`: 32px desktop / 28px mobile, weight 600, line-height 1.2
- `h2`: 22px desktop / 20px mobile, weight 600, line-height 1.3
- `h3`: 18px, weight 600
- body: 16px, weight 400, line-height 1.55
- caption / eyebrow: 11px uppercase letter-spacing 0.22em (vedi `.gh-eyebrow` in `tokens.css`)

Hero Fraunces scheda pet: ~56px desktop / ~40px mobile, weight 500.

## Radii

- `--r-sm: 10px` — input, badge
- `--r-md: 16px` — bottoni, card piccole
- `--r-lg: 24px` — card principali
- `--r-xl: 28px` — hero
- `--r-full: 999px` — pill, avatar

## Spacing

Non c'è scala formalizzata nel repo staff, vale a dire: **proporla e farsela approvare**. Default sensato (4px base):

| Token | px |
|---|---|
| `--sp-1` | 4 |
| `--sp-2` | 8 |
| `--sp-3` | 12 |
| `--sp-4` | 16 |
| `--sp-5` | 24 |
| `--sp-6` | 32 |
| `--sp-7` | 48 |
| `--sp-8` | 64 |

## Shadow / elevation

Grooming Hub è un design tenue, **basso contrasto di elevation**. Ombre discrete.

- `--shadow-sm`: `0 1px 2px rgba(43, 37, 37, 0.04)` — bottoni hover
- `--shadow-md`: `0 4px 16px rgba(43, 37, 37, 0.06)` — card principali
- `--shadow-lg`: `0 12px 32px rgba(43, 37, 37, 0.10)` — modal, popover

Niente ombre colorate, niente glow.

## Stati interattivi — regola generale

- **hover**: leggero `translateY(-1px)` + cambio colore; transition 150ms ease
- **active**: `translateY(0)` + colore più scuro
- **focus-visible**: outline `2px solid var(--color-primary)` con offset `2px`
- **disabled**: opacity 0.5, `cursor: not-allowed`, no hover state

## Motion

Durate:
- micro (hover, cambi colore): 120–150ms
- transizioni UI (apertura modal, slide-in): 220–280ms
- page transition: 300ms max

Easing: `cubic-bezier(0.2, 0, 0, 1)` (material standard-easing) per default. Niente spring eccessivi.

---

## Asset e icone

- **Icone:** se il repo staff usa già una libreria (lucide-react, heroicons, ecc.), adottarla. **Non** mescolare librerie. Se non ne usa nessuna, proporre **lucide-react** (leggera, coerente con tono del brand).
- **Font:** Fraunces da Google Fonts, `@import` in `tokens.css`. In produzione, considerare self-hosting in Fase 2.
- **Foto pet placeholder:** nessuna immagine reale in questo bundle. Usare avatar con iniziali del pet e sfondo derivato dai token (`--color-surface-soft`).
- **Illustrazioni vuote (empty state):** non ci sono asset pronti. In Fase 1 basta un'icona + testo centrato; decidere con l'autore se commissionare illustrazioni in Fase 2.
