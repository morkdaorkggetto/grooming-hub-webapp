// ───────────────────────────────────────────────────────────
// PROTO · Shop (griglia, dettaglio, carrello, conferma ordine)
// ───────────────────────────────────────────────────────────

const { useState: useStateShop } = React;

const stockDef = {
  'in-stock': { label: 'In negozio', color: '#4f8b67' },
  'low':      { label: 'Ultimi pezzi', color: '#b88b2a' },
  'out':      { label: 'Esaurito', color: '#9a9191' },
};

const ProductTile = ({ product, onClick, showLunaBadge }) => {
  const out = product.stock === 'out';
  const s = stockDef[product.stock];
  return (
    <button onClick={onClick} disabled={out} style={{
      background: 'var(--color-surface-main)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--r-lg)', padding: 14,
      textAlign: 'left', cursor: out ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit', color: 'inherit',
      display: 'flex', flexDirection: 'column',
      opacity: out ? 0.55 : 1,
      position: 'relative',
    }}>
      {showLunaBadge && product.forLuna && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 1,
          background: 'var(--color-secondary)', color: '#FBF6F3',
          padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.06em',
        }}>per Luna</div>
      )}
      <div style={{
        aspectRatio: '1 / 1', borderRadius: 'var(--r-md)',
        background: `hsl(${product.hue}, 30%, 88%)`,
        display: 'grid', placeItems: 'center', marginBottom: 12,
        fontSize: 42,
      }}>
        <span style={{ opacity: 0.65 }}>📦</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {product.brand}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 6, flex: 1 }}>
        {product.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>€{product.price.toFixed(2)}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
      </div>
    </button>
  );
};

// ─── SHOP grid ────────────────────────────────────────────────────────────
const ShopScreen = () => {
  const { viewport, nav, pets, cart } = useApp();
  const isMobile = viewport === 'mobile';
  const luna = pets[0];
  const forLuna = PRODUCTS.filter(p => p.forLuna);
  const all = PRODUCTS;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const [tab, setTab] = useStateShop('forLuna');
  const list = tab === 'forLuna' ? forLuna : all;

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="shop"/>}

      <div style={{ padding: isMobile ? '18px 22px 24px' : '40px 48px 60px', maxWidth: isMobile ? 'unset' : 1200, margin: '0 auto' }}>

        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <AuthBrandmark size={26}/>
            <button onClick={() => nav('cart')} style={{
              position: 'relative',
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border)',
              width: 40, height: 40, borderRadius: 999, cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'grid', placeItems: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--color-primary)', color: '#FBF6F3',
                  width: 18, height: 18, borderRadius: 9,
                  fontSize: 10, fontWeight: 700,
                  display: 'grid', placeItems: 'center',
                }}>{cartCount}</span>
              )}
            </button>
          </div>
        )}

        {!isMobile && cartCount > 0 && (
          <button onClick={() => nav('cart')} style={{
            position: 'fixed', top: 80, right: 48, zIndex: 5,
            background: 'var(--color-primary)', color: '#FBF6F3',
            border: 'none', borderRadius: 999,
            padding: '10px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.25)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
            Carrello · {cartCount}
          </button>
        )}

        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--color-text-secondary)',
          marginBottom: 10,
        }}>La boutique</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: isMobile ? 32 : 52, fontWeight: 500,
          lineHeight: 1.05, letterSpacing: '-0.02em',
          margin: '0 0 10px',
        }}>Scelti <em style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>per {luna?.name || 'il tuo pet'}</em>.</h1>
        <p style={{
          fontSize: isMobile ? 14 : 16, color: 'var(--color-text-secondary)',
          margin: '0 0 22px', maxWidth: 520, lineHeight: 1.5,
        }}>Ordina online, ritiri al prossimo appuntamento. Nessuna spedizione, nessuna attesa.</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[
            { id: 'forLuna', label: `Per ${luna?.name || 'il pet'}` },
            { id: 'all', label: 'Catalogo completo' },
          ].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                background: active ? 'var(--color-text-primary)' : 'transparent',
                color: active ? '#FBF6F3' : 'var(--color-text-secondary)',
                border: '1px solid ' + (active ? 'var(--color-text-primary)' : 'var(--color-border)'),
                borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
              }}>{t.label}</button>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: isMobile ? 10 : 16,
        }}>
          {list.map(p => (
            <ProductTile key={p.id} product={p} showLunaBadge={tab !== 'forLuna'}
              onClick={() => nav('product', { id: p.id })}/>
          ))}
        </div>
      </div>

      {isMobile && <BottomNav active="shop"/>}
    </div>
  );
};

// ─── PRODUCT DETAIL ───────────────────────────────────────────────────────
const ProductScreen = (params) => {
  const { viewport, nav, addToCart, toast, pets } = useApp();
  const isMobile = viewport === 'mobile';
  const p = productById(params?.id);
  const luna = pets[0];
  const [qty, setQty] = useStateShop(1);

  if (!p) return null;
  const out = p.stock === 'out';

  const add = () => {
    addToCart(p.id, qty);
    toast(`${p.name} aggiunto al carrello`);
  };

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="shop"/>}

      <div style={{ padding: isMobile ? '18px 22px 140px' : '40px 48px 60px', maxWidth: isMobile ? 'unset' : 1100, margin: '0 auto' }}>
        <button onClick={() => nav('shop')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: 13, color: 'var(--color-text-secondary)',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginBottom: 18, fontFamily: 'inherit',
        }}>← Boutique</button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 20 : 40,
        }}>
          <div style={{
            aspectRatio: '1 / 1', borderRadius: 'var(--r-xl)',
            background: `hsl(${p.hue}, 30%, 88%)`,
            display: 'grid', placeItems: 'center',
            fontSize: isMobile ? 72 : 120,
          }}>
            <span style={{ opacity: 0.6 }}>📦</span>
          </div>

          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--color-text-secondary)',
              marginBottom: 10,
            }}>{p.brand}</div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 28 : 40, fontWeight: 500,
              lineHeight: 1.1, letterSpacing: '-0.01em',
              margin: '0 0 14px',
            }}>{p.name}</h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 500 }}>€{p.price.toFixed(2)}</span>
              {p.size && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{p.size}</span>}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 999,
                background: p.stock === 'in-stock' ? 'var(--color-success-bg)' : p.stock === 'low' ? 'var(--color-warning-bg)' : '#eceef2',
                color: p.stock === 'in-stock' ? 'var(--color-success-text)' : p.stock === 'low' ? 'var(--color-warning-text)' : '#4a5668',
                fontSize: 11, fontWeight: 700,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }}/>
                {stockDef[p.stock].label}
              </span>
            </div>

            {p.forLuna && luna && (
              <div style={{
                background: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--r-md)', padding: 14,
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 20,
              }}>
                <PetAvatarProto pet={luna} size={40}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Perché per {luna.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{p.reason}</div>
                </div>
              </div>
            )}

            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 22px' }}>
              Prodotto selezionato dal nostro staff. Disponibile per ritiro in negozio al tuo prossimo appuntamento — nessuna spedizione, nessun costo aggiuntivo.
            </p>

            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'var(--color-surface-main)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--r-md)',
                }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                    width: 44, height: 44, background: 'none', border: 'none',
                    fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
                  }}>−</button>
                  <div style={{ width: 30, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{qty}</div>
                  <button onClick={() => setQty(q => q + 1)} style={{
                    width: 44, height: 44, background: 'none', border: 'none',
                    fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
                  }}>+</button>
                </div>
                <button onClick={add} disabled={out} style={{
                  flex: 1, height: 48,
                  background: out ? 'var(--color-border)' : 'var(--color-primary)',
                  color: '#FBF6F3', border: 'none', borderRadius: 'var(--r-md)',
                  fontSize: 15, fontWeight: 700,
                  cursor: out ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}>{out ? 'Non disponibile' : 'Aggiungi al carrello'}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 390 - 16, padding: '14px 18px 22px',
          background: 'var(--color-surface-main)',
          borderTop: '1px solid var(--color-border)',
          borderRadius: '20px 20px 0 0',
          display: 'flex', gap: 10, alignItems: 'center',
          zIndex: 20,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--color-surface-soft)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--r-md)', height: 44,
          }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
              width: 38, height: '100%', background: 'none', border: 'none',
              fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
            }}>−</button>
            <div style={{ width: 24, textAlign: 'center', fontWeight: 600 }}>{qty}</div>
            <button onClick={() => setQty(q => q + 1)} style={{
              width: 38, height: '100%', background: 'none', border: 'none',
              fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
            }}>+</button>
          </div>
          <button onClick={add} disabled={out} style={{
            flex: 1, height: 44,
            background: out ? 'var(--color-border)' : 'var(--color-primary)',
            color: '#FBF6F3', border: 'none', borderRadius: 'var(--r-md)',
            fontSize: 14, fontWeight: 700,
            cursor: out ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>{out ? 'Non disponibile' : `Aggiungi · €${(p.price * qty).toFixed(2)}`}</button>
        </div>
      )}
    </div>
  );
};

// ─── CART ─────────────────────────────────────────────────────────────────
const CartScreen = () => {
  const { viewport, nav, cart, setCartQty, removeFromCart, pets, set, toast } = useApp();
  const isMobile = viewport === 'mobile';
  const luna = pets[0];
  const items = cart.map(i => ({ ...i, product: productById(i.productId) })).filter(i => i.product);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discount = luna?.tier === 'gold' ? 5 : luna?.tier === 'silver' ? 3 : 0;
  const total = Math.max(0, subtotal - discount);

  const submit = () => {
    const order = {
      id: 'o' + Date.now(),
      items: items.map(i => ({ productId: i.productId, qty: i.qty, name: i.product.name, price: i.product.price })),
      total, status: 'pending',
    };
    set(s => ({ orders: [...s.orders, order], cart: [] }));
    toast('Richiesta inviata!');
    nav('order-confirm', { id: order.id });
  };

  if (items.length === 0) {
    return (
      <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
        {!isMobile && <TopNav active="shop"/>}
        <div style={{ padding: isMobile ? '40px 22px' : '80px 48px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛍️</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, margin: '0 0 10px' }}>Carrello vuoto</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 22px' }}>
            Aggiungi qualcosa dalla boutique per ritirarlo al prossimo appuntamento.
          </p>
          <button onClick={() => nav('shop')} style={{
            background: 'var(--color-primary)', color: '#FBF6F3',
            border: 'none', borderRadius: 'var(--r-md)',
            padding: '12px 22px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Vai alla boutique</button>
        </div>
        {isMobile && <BottomNav active="shop"/>}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="shop"/>}

      <div style={{
        padding: isMobile ? '18px 22px 140px' : '40px 48px 60px',
        maxWidth: isMobile ? 'unset' : 900, margin: '0 auto',
      }}>
        <button onClick={() => nav('shop')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: 13, color: 'var(--color-text-secondary)',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginBottom: 18, fontFamily: 'inherit',
        }}>← Boutique</button>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: isMobile ? 30 : 40, fontWeight: 500,
          margin: '0 0 22px', letterSpacing: '-0.01em',
        }}>Il tuo carrello</h1>

        <div style={{
          background: 'var(--color-surface-main)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden', marginBottom: 20,
        }}>
          {items.map((i, idx) => (
            <div key={i.productId} style={{
              padding: 16,
              borderBottom: idx < items.length - 1 ? '1px solid var(--color-border)' : 'none',
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--r-md)',
                background: `hsl(${i.product.hue}, 30%, 88%)`,
                display: 'grid', placeItems: 'center', flexShrink: 0,
                fontSize: 22,
              }}>📦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {i.product.brand}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{i.product.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--r-sm)', height: 28,
                  }}>
                    <button onClick={() => setCartQty(i.productId, i.qty - 1)} style={{
                      width: 26, height: '100%', background: 'none', border: 'none',
                      fontSize: 14, cursor: 'pointer',
                    }}>−</button>
                    <div style={{ width: 22, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>{i.qty}</div>
                    <button onClick={() => setCartQty(i.productId, i.qty + 1)} style={{
                      width: 26, height: '100%', background: 'none', border: 'none',
                      fontSize: 14, cursor: 'pointer',
                    }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(i.productId)} style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: 12, color: 'var(--color-danger-text)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Rimuovi</button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>
                €{(i.product.price * i.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--color-surface-main)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--r-lg)',
          padding: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotale</span>
              <span style={{ fontWeight: 600 }}>€{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-success-text)' }}>Sconto fedeltà {luna?.tier === 'gold' ? 'Oro' : 'Argento'}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success-text)' }}>−€{discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Ritiro in negozio</span>
              <span style={{ fontWeight: 600 }}>Gratuito</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <span style={{ fontWeight: 700 }}>Totale</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500 }}>€{total.toFixed(2)}</span>
          </div>
          <div style={{
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--r-md)', padding: 12,
            fontSize: 12, color: 'var(--color-warning-text)',
            marginBottom: 16,
          }}>
            Il tuo ordine sarà confermato entro 24h. <strong>Pagamento in negozio</strong> al ritiro.
          </div>
          {!isMobile && (
            <button onClick={submit} style={{
              width: '100%', height: 48,
              background: 'var(--color-primary)', color: '#FBF6F3',
              border: 'none', borderRadius: 'var(--r-md)',
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Invia richiesta di ritiro</button>
          )}
        </div>
      </div>

      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 390 - 16, padding: '14px 18px 22px',
          background: 'var(--color-surface-main)',
          borderTop: '1px solid var(--color-border)',
          borderRadius: '20px 20px 0 0', zIndex: 20,
        }}>
          <button onClick={submit} style={{
            width: '100%', height: 46,
            background: 'var(--color-primary)', color: '#FBF6F3',
            border: 'none', borderRadius: 'var(--r-md)',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Invia richiesta · €{total.toFixed(2)}</button>
        </div>
      )}
    </div>
  );
};

// ─── ORDER CONFIRM ────────────────────────────────────────────────────────
const OrderConfirmScreen = () => {
  const { viewport, nav } = useApp();
  const isMobile = viewport === 'mobile';
  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="shop"/>}
      <div style={{ padding: isMobile ? '40px 22px' : '80px 48px', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
        <div style={{
          width: 84, height: 84, borderRadius: 42,
          background: 'var(--color-warning-bg)',
          display: 'grid', placeItems: 'center', margin: '0 auto 22px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--color-warning-text)',
          marginBottom: 10,
        }}>In preparazione</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: isMobile ? 30 : 40, fontWeight: 500,
          margin: '0 0 12px', letterSpacing: '-0.01em', lineHeight: 1.1,
        }}>Richiesta inviata!</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 28px' }}>
          Ti avviseremo via email quando sarà pronto per il ritiro, al più tardi al tuo prossimo appuntamento.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => nav('shop')} style={{
            background: 'transparent', color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)',
            padding: '12px 22px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Continua lo shopping</button>
          <button onClick={() => nav('dashboard')} style={{
            background: 'var(--color-primary)', color: '#FBF6F3',
            border: 'none', borderRadius: 'var(--r-md)',
            padding: '12px 22px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Torna alla home</button>
        </div>
      </div>
      {isMobile && <BottomNav active="shop"/>}
    </div>
  );
};

registerRoute('shop', ShopScreen);
registerRoute('product', ProductScreen);
registerRoute('cart', CartScreen);
registerRoute('order-confirm', OrderConfirmScreen);
