// ───────────────────────────────────────────────────────────
// BOUTIQUE · /u/shop · e-commerce click & collect
// Pattern già stabilito: submit = richiesta, conferma entro 24h.
// "Pronto per il ritiro" (verde) · "In preparazione" (giallo).
// Personalizzazione Luna: badge "perfetto per il tuo Golden".
// Stock visibile: in negozio / ultima scorta / esaurito.
// ───────────────────────────────────────────────────────────

const SHOP_CATALOG = [
  {
    id: 'shamp-royal',
    cat: 'Shampoo',
    name: 'Shampoo Royal Coat',
    sub: 'Pelo lungo · Oli essenziali',
    price: 22, priceOld: null,
    stock: 'available',
    forLuna: true,
    reason: 'Perfetto per i Golden a pelo lungo',
    hue: 32, glyph: 'bottle',
    rating: 4.8,
    brand: 'Maison Canina',
  },
  {
    id: 'cond-silk',
    cat: 'Shampoo',
    name: 'Balsamo Silk Touch',
    sub: 'Districante · Dopo shampoo',
    price: 18,
    stock: 'available',
    forLuna: true,
    reason: 'Districa il pelo del Golden senza appesantire',
    hue: 200, glyph: 'tube',
    rating: 4.6,
    brand: 'Maison Canina',
  },
  {
    id: 'food-salmon',
    cat: 'Cibo',
    name: 'Crocchette Salmone & Riso',
    sub: 'Adult · 3 kg · Senza cereali',
    price: 34,
    stock: 'low',
    forLuna: true,
    reason: 'Formula consigliata per taglia media',
    hue: 18, glyph: 'bag',
    rating: 4.9,
    brand: 'Nord Pet',
  },
  {
    id: 'treat-liver',
    cat: 'Snack',
    name: 'Biscotti al fegato',
    sub: 'Monoproteico · 200 g',
    price: 8,
    stock: 'available',
    forLuna: false,
    hue: 14, glyph: 'bone',
    rating: 4.7,
    brand: 'Piccolo Forno',
  },
  {
    id: 'acc-leash',
    cat: 'Accessori',
    name: 'Guinzaglio in corda marina',
    sub: 'Sabbia · 180 cm',
    price: 42,
    stock: 'available',
    forLuna: false,
    hue: 40, glyph: 'leash',
    rating: 4.5,
    brand: 'Atelier Nord',
  },
  {
    id: 'acc-collar',
    cat: 'Accessori',
    name: 'Collare in cuoio cucito a mano',
    sub: 'Cognac · Taglia M',
    price: 58,
    stock: 'low',
    forLuna: true,
    reason: 'Taglia giusta per Luna',
    hue: 24, glyph: 'collar',
    rating: 4.8,
    brand: 'Atelier Nord',
  },
  {
    id: 'perf-neutra',
    cat: 'Shampoo',
    name: 'Profumo Neutra',
    sub: 'Essenza leggera · 50 ml',
    price: 16,
    stock: 'available',
    forLuna: false,
    hue: 180, glyph: 'perfume',
    rating: 4.4,
    brand: 'Maison Canina',
  },
  {
    id: 'food-light',
    cat: 'Cibo',
    name: 'Crocchette Light',
    sub: 'Controllo peso · 2 kg',
    price: 28,
    stock: 'out',
    forLuna: false,
    hue: 120, glyph: 'bag',
    rating: 4.6,
    brand: 'Nord Pet',
  },
  {
    id: 'treat-dental',
    cat: 'Snack',
    name: 'Stick dentali',
    sub: '7 pezzi · Taglia media',
    price: 11,
    stock: 'available',
    forLuna: true,
    reason: 'Taglia media, come Luna',
    hue: 100, glyph: 'stick',
    rating: 4.5,
    brand: 'Piccolo Forno',
  },
  {
    id: 'acc-brush',
    cat: 'Accessori',
    name: 'Spazzola furminator',
    sub: 'Pelo medio-lungo',
    price: 26,
    stock: 'available',
    forLuna: true,
    reason: 'Ideale per i sotto-pelo del Golden',
    hue: 220, glyph: 'brush',
    rating: 4.9,
    brand: 'Atelier Nord',
  },
];

const SHOP_CATS = ['Tutti', 'Shampoo', 'Cibo', 'Snack', 'Accessori'];

const CART_MOCK = [
  { id: 'shamp-royal', qty: 1 },
  { id: 'treat-dental', qty: 2 },
  { id: 'acc-brush', qty: 1 },
];

// ───────────────────────────────────────────────────────────
// Mini-building blocks
// ───────────────────────────────────────────────────────────

// Glyph SVG per categoria prodotto. Tutti disegnati dentro viewBox 100x100.
// Usano `fg` per il colore primario (pieno) e `accent` per i dettagli.
const ProductGlyph = ({ kind, fg, accent }) => {
  switch (kind) {
    case 'bottle':  // shampoo con erogatore
      return (
        <g>
          {/* erogatore */}
          <path d="M44 18 h12 v6 h6 v5 h-24 v-5 h6 z" fill={accent}/>
          <rect x="36" y="29" width="28" height="6" rx="1" fill={fg} opacity=".85"/>
          {/* corpo bottiglia */}
          <path d="M32 35 h36 c2 0 4 2 4 4 v40 c0 3-2 5-5 5 h-34 c-3 0-5-2-5-5 V39 c0-2 2-4 4-4 z" fill={fg}/>
          {/* etichetta */}
          <rect x="36" y="48" width="28" height="22" rx="1.5" fill="#fff" opacity=".92"/>
          <rect x="40" y="54" width="20" height="2" fill={fg} opacity=".5"/>
          <rect x="40" y="59" width="14" height="2" fill={fg} opacity=".35"/>
          <rect x="40" y="64" width="16" height="2" fill={fg} opacity=".35"/>
        </g>
      );
    case 'tube':  // balsamo
      return (
        <g>
          <rect x="32" y="18" width="36" height="4" rx="1" fill={accent}/>
          <path d="M30 22 h40 l-4 60 c-.2 3-2 5-5 5 h-22 c-3 0-4.8-2-5-5 z" fill={fg}/>
          <rect x="38" y="40" width="24" height="24" rx="2" fill="#fff" opacity=".9"/>
          <circle cx="50" cy="50" r="5" fill={fg} opacity=".35"/>
          <rect x="40" y="58" width="20" height="2" fill={fg} opacity=".4"/>
        </g>
      );
    case 'bag':  // sacchetto crocchette
      return (
        <g>
          {/* top piegato */}
          <path d="M26 22 h48 l-4 10 h-40 z" fill={accent}/>
          <path d="M26 32 h48 v48 c0 3-2 5-5 5 h-38 c-3 0-5-2-5-5 z" fill={fg}/>
          {/* finestra */}
          <rect x="36" y="44" width="28" height="20" rx="2" fill="#fff" opacity=".9"/>
          {/* crocchette */}
          <circle cx="43" cy="52" r="2.2" fill={fg} opacity=".55"/>
          <circle cx="50" cy="55" r="2.2" fill={fg} opacity=".55"/>
          <circle cx="57" cy="51" r="2.2" fill={fg} opacity=".55"/>
          <circle cx="46" cy="59" r="2.2" fill={fg} opacity=".55"/>
          <circle cx="54" cy="60" r="2.2" fill={fg} opacity=".55"/>
          {/* barra nome brand */}
          <rect x="38" y="70" width="24" height="3" fill="#fff" opacity=".7"/>
        </g>
      );
    case 'bone':  // osso-biscotto
      return (
        <g>
          <path d="M22 48 c0-7 7-11 13-7 c4-4 12-4 15 0 c1 1 1 2 1 3 c5-2 11 2 11 8 c0 6-6 10-11 8 c0 1 0 2-1 3 c-3 4-11 4-15 0 c-6 4-13 0-13-7 c0-2 1-4 3-5 c-2-1-3-3-3-3 z" fill={fg}/>
          <circle cx="34" cy="44" r="1.8" fill={accent} opacity=".55"/>
          <circle cx="48" cy="50" r="1.8" fill={accent} opacity=".55"/>
          <circle cx="40" cy="58" r="1.8" fill={accent} opacity=".55"/>
          <circle cx="56" cy="54" r="1.8" fill={accent} opacity=".55"/>
        </g>
      );
    case 'stick':  // stick dentale
      return (
        <g>
          <path d="M30 56 L70 40" stroke={fg} strokeWidth="12" strokeLinecap="round"/>
          <path d="M30 56 L70 40" stroke={accent} strokeWidth="12" strokeLinecap="round" strokeDasharray="3 5" opacity=".5"/>
          {/* estremità a X */}
          <circle cx="30" cy="56" r="5" fill={fg}/>
          <circle cx="70" cy="40" r="5" fill={fg}/>
        </g>
      );
    case 'leash':  // guinzaglio corda
      return (
        <g>
          {/* manico a D */}
          <path d="M28 28 a10 10 0 1 1 0 20 a10 10 0 1 1 0-20 z" fill="none" stroke={fg} strokeWidth="5"/>
          {/* corda */}
          <path d="M38 38 Q 50 48 62 55 T 78 72" fill="none" stroke={fg} strokeWidth="5" strokeLinecap="round"/>
          <path d="M38 38 Q 50 48 62 55 T 78 72" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeDasharray="2 4" opacity=".55"/>
          {/* moschettone */}
          <rect x="72" y="66" width="10" height="14" rx="2" fill={fg}/>
        </g>
      );
    case 'collar':  // collare a cerchio
      return (
        <g>
          <circle cx="50" cy="54" r="26" fill="none" stroke={fg} strokeWidth="7"/>
          {/* fibbia */}
          <rect x="42" y="25" width="16" height="10" rx="2" fill={accent}/>
          <circle cx="50" cy="30" r="2" fill={fg}/>
          {/* medaglietta */}
          <circle cx="50" cy="82" r="6" fill={fg}/>
          <circle cx="50" cy="82" r="3" fill={accent} opacity=".6"/>
        </g>
      );
    case 'brush':  // spazzola furminator
      return (
        <g>
          {/* manico */}
          <rect x="58" y="18" width="12" height="32" rx="3" fill={accent}/>
          {/* testina */}
          <rect x="26" y="48" width="58" height="18" rx="3" fill={fg}/>
          {/* setole */}
          {[32,40,48,56,64,72,80].map(x => (
            <rect key={x} x={x-1.2} y="66" width="2.4" height="14" rx="1" fill={fg} opacity=".8"/>
          ))}
        </g>
      );
    case 'perfume':  // profumo tozzo
      return (
        <g>
          {/* tappo */}
          <rect x="40" y="18" width="20" height="10" rx="1.5" fill={accent}/>
          <rect x="44" y="28" width="12" height="4" fill={fg} opacity=".7"/>
          {/* corpo */}
          <path d="M30 34 h40 v42 c0 4-3 7-7 7 h-26 c-4 0-7-3-7-7 z" fill={fg}/>
          {/* etichetta */}
          <rect x="36" y="48" width="28" height="16" rx="1" fill="#fff" opacity=".9"/>
          <rect x="40" y="54" width="18" height="2" fill={fg} opacity=".5"/>
          <rect x="40" y="58" width="12" height="2" fill={fg} opacity=".35"/>
        </g>
      );
    default:
      return <rect x="30" y="30" width="40" height="40" rx="6" fill={fg}/>;
  }
};

const ProductImg = ({ hue = 30, size = '100%', radius = 16, label, compact = false, glyph = 'bottle' }) => {
  const bgStart = `hsl(${hue} 38% 93%)`;
  const bgEnd   = `hsl(${hue} 32% 80%)`;
  const fg      = `hsl(${hue} 55% 42%)`;
  const accent  = `hsl(${(hue + 340) % 360} 45% 38%)`;
  return (
    <div style={{
      width: size, aspectRatio: '1', borderRadius: radius,
      background: `linear-gradient(155deg, ${bgStart} 0%, ${bgEnd} 100%)`,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%"
           style={{ position: 'absolute', inset: 0 }}>
        <ProductGlyph kind={glyph} fg={fg} accent={accent}/>
      </svg>
      {label && !compact && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          fontSize: 9, fontWeight: 700, color: fg,
          letterSpacing: '.12em', textTransform: 'uppercase',
          opacity: .7,
        }}>{label}</div>
      )}
    </div>
  );
};

const StockBadge = ({ stock }) => {
  if (stock === 'out') return (
    <span style={{
      padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: '#f1eded', color: '#8d7a7a',
    }}>Esaurito</span>
  );
  if (stock === 'low') return (
    <span style={{
      padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
    }}>Ultimi 2 pezzi</span>
  );
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: 'var(--color-success-bg)', color: 'var(--color-success-text)',
    }}>In negozio</span>
  );
};

const ForLunaBadge = ({ reason, compact = false }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: compact ? '3px 8px' : '4px 10px',
    borderRadius: 999,
    background: 'var(--color-surface-soft)', color: 'var(--color-primary)',
    fontSize: compact ? 10 : 11, fontWeight: 700,
    border: '1px solid rgba(193,115,76,.2)',
  }}>
    <Icon name="heart" size={compact ? 10 : 11} color="var(--color-primary)" stroke={2.2}/>
    per Luna
  </div>
);

// ───────────────────────────────────────────────────────────
// Product Card (griglia)
// ───────────────────────────────────────────────────────────

const ShopCard = ({ p, compact = false }) => (
  <div style={{
    padding: compact ? 12 : 16, borderRadius: compact ? 18 : 22,
    background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
    display: 'flex', flexDirection: 'column', gap: compact ? 10 : 12,
    opacity: p.stock === 'out' ? .55 : 1,
    cursor: 'pointer', position: 'relative',
  }}>
    {p.forLuna && (
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
        <ForLunaBadge compact/>
      </div>
    )}
    <ProductImg hue={p.hue} glyph={p.glyph} label={p.brand} radius={compact ? 12 : 14}/>

    <div style={{ minHeight: compact ? 62 : 70 }}>
      <div style={{
        fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase',
        color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: 4,
      }}>{p.cat}</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: compact ? 15 : 17,
        fontWeight: 500, lineHeight: 1.2, marginBottom: 3,
      }}>{p.name}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
        {p.sub}
      </div>
    </div>

    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingTop: compact ? 6 : 8,
      borderTop: '1px solid var(--color-border)',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: compact ? 18 : 22,
          fontWeight: 500, lineHeight: 1,
        }}>
          {p.price}€
        </div>
        <div style={{ marginTop: 4 }}><StockBadge stock={p.stock}/></div>
      </div>
      {p.stock !== 'out' && (
        <button style={{
          width: compact ? 34 : 38, height: compact ? 34 : 38, borderRadius: '50%',
          background: 'var(--color-primary)', color: '#FBF6F3',
          border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name="plus" size={compact ? 14 : 16} color="#FBF6F3" stroke={2.5}/>
        </button>
      )}
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────
// Chips filtri
// ───────────────────────────────────────────────────────────

const CategoryChips = ({ active = 'Tutti', compact = false }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {SHOP_CATS.map(c => {
      const isSel = c === active;
      return (
        <span key={c} style={{
          padding: compact ? '7px 14px' : '9px 18px', borderRadius: 999,
          fontSize: compact ? 12 : 13, fontWeight: 600, cursor: 'pointer',
          background: isSel ? 'var(--color-primary)' : 'var(--color-bg-main)',
          color: isSel ? '#FBF6F3' : 'var(--color-text-primary)',
          border: isSel ? 'none' : '1px solid var(--color-border)',
        }}>{c}</span>
      );
    })}
  </div>
);

// ───────────────────────────────────────────────────────────
// SHOP GRID · DESKTOP
// ───────────────────────────────────────────────────────────

const ShopGridDesktop = () => {
  const cartCount = CART_MOCK.reduce((s, it) => s + it.qty, 0);
  return (
    <div style={{
      width: 1280, height: 860, background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <TopBar active="Boutique"/>

      <div style={{ padding: '28px 44px 36px', overflow: 'hidden', flex: 1 }}>
        {/* Hero */}
        <section style={{
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 32,
          alignItems: 'end', marginBottom: 26,
        }}>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase',
              color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8,
            }}>La nostra boutique</div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 48, lineHeight: 1,
              fontWeight: 400, letterSpacing: '-.03em', margin: 0,
            }}>
              Prodotti scelti<br/>
              <span style={{ color: 'var(--color-text-secondary)' }}>per </span>
              <em style={{ color: 'var(--color-primary)' }}>Luna</em>.
            </h1>
            <p style={{
              marginTop: 12, fontSize: 14, color: 'var(--color-text-secondary)',
              maxWidth: 540, lineHeight: 1.6,
            }}>
              Ordini online, ritiri in negozio alla prossima visita.
              Nessuna spedizione, nessun pagamento anticipato.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              padding: '10px 16px', borderRadius: 999,
              background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 10, minWidth: 260,
            }}>
              <Icon name="search" size={15} color="var(--color-text-secondary)"/>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Cerca shampoo, crocchette…
              </span>
            </div>
            <button style={{
              position: 'relative', padding: '10px 18px 10px 14px', borderRadius: 999,
              background: 'var(--color-primary)', color: '#FBF6F3',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, fontWeight: 600,
            }}>
              <Icon name="bag" size={16} color="#FBF6F3"/>
              Carrello
              <span style={{
                minWidth: 22, height: 22, borderRadius: 11, padding: '0 7px',
                background: '#FBF6F3', color: 'var(--color-primary)',
                display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
              }}>{cartCount}</span>
            </button>
          </div>
        </section>

        {/* Filtri */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 18, gap: 16, flexWrap: 'wrap',
        }}>
          <CategoryChips active="Tutti"/>
          <div style={{
            fontSize: 12, color: 'var(--color-text-secondary)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>Ordina per:</span>
            <span style={{
              color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Consigliati per Luna
              <Icon name="chevron" size={11} color="var(--color-text-primary)"
                    style={{ transform: 'rotate(90deg)' }}/>
            </span>
          </div>
        </div>

        {/* Griglia */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }}>
          {SHOP_CATALOG.slice(0, 8).map(p => (
            <ShopCard key={p.id} p={p}/>
          ))}
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// SHOP GRID · MOBILE
// ───────────────────────────────────────────────────────────

const ShopGridMobile = () => {
  const cartCount = CART_MOCK.reduce((s, it) => s + it.qty, 0);
  const content = (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '56px 20px 10px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🐕</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500 }}>
            Grooming Hub
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name="bag" size={15} color="var(--color-text-primary)"/>
          </span>
          <span style={{
            position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18,
            borderRadius: 9, padding: '0 5px',
            background: 'var(--color-primary)', color: '#FBF6F3',
            display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700,
          }}>{cartCount}</span>
        </div>
      </div>

      {/* Scroll area */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '6px 20px 100px' }}>
        {/* Title */}
        <div style={{
          fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'var(--color-primary)', fontWeight: 700, marginTop: 4, marginBottom: 6,
        }}>Boutique</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400,
          letterSpacing: '-.02em', margin: 0, lineHeight: 1.05,
        }}>
          Prodotti per <em style={{ color: 'var(--color-primary)' }}>Luna</em>.
        </h1>

        {/* Search */}
        <div style={{
          marginTop: 16, padding: '11px 14px', borderRadius: 999,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="search" size={15} color="var(--color-text-secondary)"/>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Cerca nella boutique
          </span>
        </div>

        {/* Chips */}
        <div style={{ marginTop: 16, marginBottom: 14 }}>
          <CategoryChips active="Tutti" compact/>
        </div>

        {/* Promo banner */}
        <div style={{
          padding: '12px 14px', borderRadius: 16, marginBottom: 16,
          background: 'var(--color-surface-soft)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--color-primary)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="heart" size={18} color="#FBF6F3"/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
              5 prodotti scelti per un Golden
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              Suggeriti in base a Luna
            </div>
          </div>
          <Icon name="chevron" size={14} color="var(--color-text-secondary)"/>
        </div>

        {/* Griglia 2 col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SHOP_CATALOG.slice(0, 6).map(p => (
            <ShopCard key={p.id} p={p} compact/>
          ))}
        </div>
      </div>

      {/* Tab bar inferiore */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 20px 26px',
        background: 'var(--color-surface-main)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex', justifyContent: 'space-around',
      }}>
        {[
          { icon: 'home', label: 'Home' },
          { icon: 'calendar', label: 'Agenda' },
          { icon: 'paw', label: 'Pet' },
          { icon: 'bag', label: 'Shop', active: true },
          { icon: 'user', label: 'Profilo' },
        ].map(t => (
          <div key={t.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: t.active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          }}>
            <Icon name={t.icon} size={19} color={t.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}/>
            <span style={{ fontSize: 10, fontWeight: t.active ? 700 : 500 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return <IOSDevice width={390} height={844}>{content}</IOSDevice>;
};

// ───────────────────────────────────────────────────────────
// PRODUCT DETAIL · DESKTOP
// ───────────────────────────────────────────────────────────

const ProductDetailDesktop = () => {
  const p = SHOP_CATALOG[0];  // Shampoo Royal Coat
  const related = SHOP_CATALOG.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3);
  return (
    <div style={{
      width: 1280, height: 860, background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <TopBar active="Boutique"/>

      <div style={{ padding: '26px 44px', overflow: 'hidden', flex: 1 }}>
        {/* Breadcrumb */}
        <div style={{
          fontSize: 12, color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22,
        }}>
          <span style={{ cursor: 'pointer' }}>Boutique</span>
          <Icon name="chevron" size={12} color="var(--color-text-secondary)"/>
          <span style={{ cursor: 'pointer' }}>{p.cat}</span>
          <Icon name="chevron" size={12} color="var(--color-text-secondary)"/>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{p.name}</span>
        </div>

        {/* 2 colonne hero */}
        <section style={{
          display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48,
          marginBottom: 32,
        }}>
          {/* Galleria */}
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 72 }}>
              {[p.hue, p.hue + 20, p.hue + 40, p.hue + 60].map((h, i) => (
                <div key={i} style={{
                  borderRadius: 12,
                  border: i === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  padding: 4, cursor: 'pointer',
                }}>
                  <ProductImg hue={h} glyph={p.glyph} label={p.brand} radius={8} compact/>
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                borderRadius: 28,
                background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
                padding: 28,
              }}>
                <ProductImg hue={p.hue} glyph={p.glyph} label={p.brand} radius={18}/>
              </div>
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
            <div>
              {p.forLuna && <div style={{ marginBottom: 10 }}><ForLunaBadge/></div>}
              <div style={{
                fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: 6,
              }}>{p.brand} · {p.cat}</div>
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1.05,
                fontWeight: 400, letterSpacing: '-.02em', margin: 0,
              }}>{p.name}</h1>
              <div style={{ marginTop: 10, fontSize: 14, color: 'var(--color-text-secondary)' }}>
                {p.sub}
              </div>
            </div>

            {/* Prezzo + rating */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              paddingBottom: 18, borderBottom: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 500, lineHeight: 1,
                }}>{p.price}€</div>
                <div style={{ marginTop: 8 }}>
                  <StockBadge stock={p.stock}/>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--color-text-secondary)',
              }}>
                <span style={{ color: '#c58a3c' }}>★★★★★</span>
                <span>{p.rating} · 48 recensioni</span>
              </div>
            </div>

            {/* Perché per Luna */}
            {p.forLuna && (
              <div style={{
                padding: 16, borderRadius: 18,
                background: 'var(--color-surface-soft)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: 'var(--color-primary)', display: 'grid', placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name="heart" size={16} color="#FBF6F3"/>
                </div>
                <div>
                  <div style={{
                    fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
                    color: 'var(--color-primary)', fontWeight: 700, marginBottom: 4,
                  }}>Perfetto per Luna</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    {p.reason}. La toelettatrice Giulia lo consiglia spesso per
                    i manti lunghi e setosi.
                  </div>
                </div>
              </div>
            )}

            {/* Varianti */}
            <div>
              <div style={{
                fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 8,
              }}>Formato</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['250 ml', '500 ml', '1 L'].map((v, i) => (
                  <span key={v} style={{
                    padding: '10px 18px', borderRadius: 12,
                    background: i === 1 ? 'var(--color-surface-main)' : 'var(--color-bg-main)',
                    border: i === 1 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    fontSize: 13, fontWeight: i === 1 ? 700 : 500, cursor: 'pointer',
                  }}>{v}</span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0 16px', borderRadius: 999,
                background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              }}>
                <Icon name="plus" size={14} color="var(--color-text-primary)"
                      style={{ transform: 'rotate(45deg)' }}/>
                <span style={{ fontSize: 14, fontWeight: 600, minWidth: 14, textAlign: 'center' }}>1</span>
                <Icon name="plus" size={14} color="var(--color-text-primary)"/>
              </div>
              <button style={{
                flex: 1, padding: '14px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'var(--color-primary)', color: '#FBF6F3',
                fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Icon name="bag" size={15} color="#FBF6F3"/>
                Aggiungi al carrello · {p.price}€
              </button>
            </div>

            <div style={{
              fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="bag" size={13} color="var(--color-text-secondary)"/>
              Lo ritiri alla tua prossima visita · pagamento in negozio
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// PRODUCT DETAIL · MOBILE
// ───────────────────────────────────────────────────────────

const ProductDetailMobile = () => {
  const p = SHOP_CATALOG[0];
  const content = (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar flottante sull'immagine */}
      <div style={{
        position: 'absolute', top: 50, left: 0, right: 0,
        padding: '6px 20px', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(251,246,243,.9)', border: '1px solid var(--color-border)',
          display: 'grid', placeItems: 'center', backdropFilter: 'blur(8px)',
        }}>
          <Icon name="chevron" size={14} color="var(--color-text-primary)"
                style={{ transform: 'rotate(180deg)' }}/>
        </span>
        <span style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(251,246,243,.9)', border: '1px solid var(--color-border)',
          display: 'grid', placeItems: 'center', backdropFilter: 'blur(8px)',
        }}>
          <Icon name="heart" size={15} color="var(--color-text-primary)"/>
        </span>
      </div>

      {/* Scroll area */}
      <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 100 }}>
        {/* Hero image */}
        <div style={{
          width: '100%', aspectRatio: '1',
          background: `linear-gradient(155deg, hsl(${p.hue} 38% 93%) 0%, hsl(${p.hue} 32% 80%) 100%)`,
          position: 'relative',
        }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%"
               style={{ position: 'absolute', inset: 0 }}>
            <ProductGlyph kind={p.glyph}
              fg={`hsl(${p.hue} 55% 42%)`}
              accent={`hsl(${(p.hue + 340) % 360} 45% 38%)`}/>
          </svg>
          {/* Dots */}
          <div style={{
            position: 'absolute', bottom: 16, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 6,
          }}>
            {[0, 1, 2, 3].map(i => (
              <span key={i} style={{
                width: i === 0 ? 20 : 6, height: 6, borderRadius: 3,
                background: i === 0 ? 'var(--color-primary)' : 'rgba(42,31,22,.25)',
              }}/>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '20px 22px 0' }}>
          {p.forLuna && <div style={{ marginBottom: 10 }}><ForLunaBadge compact/></div>}
          <div style={{
            fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
            color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: 4,
          }}>{p.brand} · {p.cat}</div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.1,
            fontWeight: 400, letterSpacing: '-.02em', margin: 0,
          }}>{p.name}</h1>
          <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
            {p.sub}
          </div>

          {/* Rating strip */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 14, paddingBottom: 14, borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, lineHeight: 1,
            }}>{p.price}€</div>
            <div style={{
              fontSize: 11.5, color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: '#c58a3c' }}>★★★★★</span> {p.rating}
            </div>
          </div>

          {/* Stock */}
          <div style={{ marginTop: 14 }}>
            <StockBadge stock={p.stock}/>
          </div>

          {/* Perché per Luna */}
          {p.forLuna && (
            <div style={{
              marginTop: 14, padding: 14, borderRadius: 16,
              background: 'var(--color-surface-soft)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'var(--color-primary)', display: 'grid', placeItems: 'center',
                flexShrink: 0,
              }}>
                <Icon name="heart" size={14} color="#FBF6F3"/>
              </div>
              <div>
                <div style={{
                  fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: 'var(--color-primary)', fontWeight: 700, marginBottom: 3,
                }}>Perfetto per Luna</div>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                  {p.reason}.
                </div>
              </div>
            </div>
          )}

          {/* Formato */}
          <div style={{ marginTop: 18 }}>
            <div style={{
              fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 8,
            }}>Formato</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['250 ml', '500 ml', '1 L'].map((v, i) => (
                <span key={v} style={{
                  flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 12,
                  background: i === 1 ? 'var(--color-surface-main)' : 'var(--color-bg-main)',
                  border: i === 1 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  fontSize: 12.5, fontWeight: i === 1 ? 700 : 500, cursor: 'pointer',
                }}>{v}</span>
              ))}
            </div>
          </div>

          {/* Descrizione */}
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 8,
            }}>Descrizione</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
              Shampoo specifico per manti lunghi e folti. Formula delicata
              con oli essenziali di camomilla e cocco.
            </p>
          </div>
        </div>
      </div>

      {/* CTA sticky */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 18px 28px',
        background: 'rgba(251,246,243,.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 12px', height: 44, borderRadius: 999,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
        }}>
          <span style={{ fontSize: 18, color: 'var(--color-text-secondary)' }}>−</span>
          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 12, textAlign: 'center' }}>1</span>
          <span style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>+</span>
        </div>
        <button style={{
          flex: 1, height: 44, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'var(--color-primary)', color: '#FBF6F3',
          fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="bag" size={14} color="#FBF6F3"/>
          Aggiungi · {p.price}€
        </button>
      </div>
    </div>
  );
  return <IOSDevice width={390} height={844}>{content}</IOSDevice>;
};

// ───────────────────────────────────────────────────────────
// CART · DESKTOP
// ───────────────────────────────────────────────────────────

const getCartItems = () => CART_MOCK.map(ci => {
  const p = SHOP_CATALOG.find(x => x.id === ci.id);
  return { ...p, qty: ci.qty };
});

const ShopCartDesktop = () => {
  const items = getCartItems();
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const loyaltyDiscount = 5;  // -5€ livello oro
  const total = subtotal - loyaltyDiscount;

  return (
    <div style={{
      width: 1280, height: 860, background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <TopBar active="Boutique"/>

      <div style={{ padding: '28px 44px 36px', overflow: 'hidden', flex: 1 }}>
        {/* Breadcrumb */}
        <div style={{
          fontSize: 12, color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
        }}>
          <span style={{ cursor: 'pointer' }}>Boutique</span>
          <Icon name="chevron" size={12} color="var(--color-text-secondary)"/>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Carrello</span>
        </div>

        {/* Title */}
        <section style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase',
            color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8,
          }}>Ritiro in negozio</div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1,
            fontWeight: 400, letterSpacing: '-.03em', margin: 0,
          }}>
            Il tuo ordine per <em style={{ color: 'var(--color-primary)' }}>Luna</em>.
          </h1>
        </section>

        {/* 2 colonne */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 36 }}>
          {/* Lista articoli */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {items.map(it => (
              <div key={it.id} style={{
                padding: 18, borderRadius: 22,
                background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
                display: 'flex', gap: 18, alignItems: 'center',
              }}>
                <div style={{ width: 84, flexShrink: 0 }}>
                  <ProductImg hue={it.hue} glyph={it.glyph} label={it.brand} radius={12} compact/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: 3,
                  }}>{it.brand}</div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, lineHeight: 1.15,
                  }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                    {it.sub}
                  </div>
                  {it.forLuna && <div style={{ marginTop: 8 }}><ForLunaBadge compact/></div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0 12px', height: 36, borderRadius: 999,
                    background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
                  }}>
                    <span style={{ fontSize: 16, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>−</span>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 12, textAlign: 'center' }}>
                      {it.qty}
                    </span>
                    <span style={{ fontSize: 16, color: 'var(--color-text-primary)', cursor: 'pointer' }}>+</span>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 70 }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, lineHeight: 1,
                    }}>{it.price * it.qty}€</div>
                    {it.qty > 1 && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                        {it.qty} × {it.price}€
                      </div>
                    )}
                  </div>
                  <span style={{ cursor: 'pointer', marginLeft: 4 }}>
                    <Icon name="plus" size={14} color="var(--color-text-secondary)"
                          style={{ transform: 'rotate(45deg)' }}/>
                  </span>
                </div>
              </div>
            ))}

            {/* CTA continua */}
            <div style={{
              marginTop: 6, padding: '14px 18px', borderRadius: 18,
              background: 'transparent', border: '1px dashed var(--color-border)',
              fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center', cursor: 'pointer',
            }}>
              ← Continua a guardare la boutique
            </div>
          </div>

          {/* Riepilogo sticky */}
          <aside style={{
            padding: 24, borderRadius: 24,
            background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
            alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{
              fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
              color: 'var(--color-primary)', fontWeight: 700,
            }}>Riepilogo ordine</div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 13,
            }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotale</span>
              <span style={{ fontWeight: 600 }}>{subtotal}€</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)' }}>
                <FidelityBadge tier="gold" compact/>
                sconto fedeltà
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>−{loyaltyDiscount}€</span>
            </div>

            {/* Promo */}
            <div style={{
              padding: '10px 12px', borderRadius: 12,
              background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="gift" size={14} color="var(--color-text-secondary)"/>
              <input placeholder="Codice promo" style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 12, fontFamily: 'inherit', color: 'var(--color-text-primary)',
              }}/>
              <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
                Applica
              </span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              paddingTop: 12, borderTop: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Totale</span>
              <span style={{
                fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, lineHeight: 1,
              }}>{total}€</span>
            </div>

            {/* Warning giallo */}
            <div style={{
              padding: '14px 16px', borderRadius: 14,
              background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
              fontSize: 12, lineHeight: 1.5,
            }}>
              <strong>Lo staff conferma entro 24h.</strong><br/>
              Ti diremo quando è pronto per il ritiro.
              Paghi in negozio quando lo vieni a prendere.
            </div>

            <button style={{
              padding: '14px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: 'var(--color-primary)', color: '#FBF6F3',
              fontSize: 14, fontWeight: 700, marginTop: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Invia richiesta di ritiro →
            </button>

            <div style={{
              fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon name="loc" size={12} color="var(--color-text-secondary)"/>
              Ritiro: via Garibaldi 12, Milano
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// CART · MOBILE
// ───────────────────────────────────────────────────────────

const ShopCartMobile = () => {
  const items = getCartItems();
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const loyaltyDiscount = 5;
  const total = subtotal - loyaltyDiscount;

  const content = (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top */}
      <div style={{
        padding: '56px 20px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name="chevron" size={13} color="var(--color-text-primary)"
                style={{ transform: 'rotate(180deg)' }}/>
        </span>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Carrello</div>
        <span style={{ width: 32 }}/>
      </div>

      {/* Scroll */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '6px 20px 150px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400,
          letterSpacing: '-.02em', margin: '6px 0 16px', lineHeight: 1.1,
        }}>
          {items.length} articoli per <em style={{ color: 'var(--color-primary)' }}>Luna</em>
        </h1>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(it => (
            <div key={it.id} style={{
              padding: 12, borderRadius: 18,
              background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ width: 56, flexShrink: 0 }}>
                <ProductImg hue={it.hue} glyph={it.glyph} label={it.brand} radius={10} compact/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 500, lineHeight: 1.2,
                }}>{it.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {it.sub}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 8,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0 10px', height: 28, borderRadius: 999,
                    background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
                  }}>
                    <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>−</span>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 10, textAlign: 'center' }}>
                      {it.qty}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>+</span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500,
                  }}>{it.price * it.qty}€</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Riepilogo */}
        <div style={{
          marginTop: 18, padding: 16, borderRadius: 18,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
            color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12,
          }}>Riepilogo</div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 8,
          }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotale</span>
            <span style={{ fontWeight: 600 }}>{subtotal}€</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 10,
            color: 'var(--color-primary)',
          }}>
            <span>Sconto fedeltà Oro</span>
            <span style={{ fontWeight: 600 }}>−{loyaltyDiscount}€</span>
          </div>
          <div style={{
            paddingTop: 10, borderTop: '1px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Totale</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500 }}>
              {total}€
            </span>
          </div>
        </div>

        {/* Warning */}
        <div style={{
          marginTop: 12, padding: '12px 14px', borderRadius: 14,
          background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
          fontSize: 12, lineHeight: 1.5,
        }}>
          <strong>Ritiro in negozio · pagamento in negozio.</strong>
          <br/>Lo staff conferma entro 24h.
        </div>
      </div>

      {/* CTA sticky */}
      <div style={{
        position: 'absolute', bottom: 16, left: 14, right: 14,
        padding: 6, borderRadius: 999,
        background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
        boxShadow: '0 4px 20px rgba(42,31,22,.1)',
      }}>
        <button style={{
          width: '100%', padding: '13px 18px', borderRadius: 999,
          border: 'none', cursor: 'pointer',
          background: 'var(--color-primary)', color: '#FBF6F3',
          fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Invia richiesta · {total}€
        </button>
      </div>
    </div>
  );
  return <IOSDevice width={390} height={844}>{content}</IOSDevice>;
};

Object.assign(window, {
  ShopGridDesktop, ShopGridMobile,
  ProductDetailDesktop, ProductDetailMobile,
  ShopCartDesktop, ShopCartMobile,
});
