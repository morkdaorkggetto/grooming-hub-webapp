// ───────────────────────────────────────────────────────────
// PROTO APP — core
// Context globale, router, AppShell con viewport switcher desktop/mobile,
// transizioni morbide tra schermate.
// ───────────────────────────────────────────────────────────

const { createContext, useContext, useState, useEffect, useRef, useMemo } = React;

// ─── Stato iniziale (sessione: si resetta al refresh) ─────────────────────
const INITIAL_STATE = {
  route: { name: 'login', params: {} },
  viewport: 'desktop', // 'desktop' | 'mobile'
  user: null, // { name, email, phone? }
  pets: [], // [{ id, name, breed, birthdate, tier, coins }]
  appointments: [], // [{ id, petId, service, date, time, status, location }]
  orders: [], // [{ id, items: [], total, status }]
  cart: [], // [{ productId, qty }]
  toast: null,
};

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─── Catalogo prodotti (mock) ─────────────────────────────────────────────
const PRODUCTS = [
  { id: 'p1', name: 'Shampoo delicato lungo pelo', brand: 'Maison Canina', price: 18.50, size: '300ml',
    hue: 140, stock: 'in-stock', forLuna: true, reason: 'Consigliato per Golden Retriever' },
  { id: 'p2', name: 'Crocchette grain-free pollo', brand: 'Nord Pet', price: 42.00, size: '3kg',
    hue: 30, stock: 'in-stock', forLuna: true, reason: 'Formula per taglia media' },
  { id: 'p3', name: 'Biscotti funzionali denti', brand: 'Piccolo Forno', price: 8.90, size: '150g',
    hue: 50, stock: 'low', forLuna: true, reason: 'Ottimi per la routine di Luna' },
  { id: 'p4', name: 'Spazzola deshedding', brand: 'Atelier Nord', price: 24.00,
    hue: 200, stock: 'in-stock', forLuna: true, reason: 'Pensata per il pelo lungo' },
  { id: 'p5', name: 'Pettorina imbottita taglia M', brand: 'Atelier Nord', price: 39.00,
    hue: 320, stock: 'in-stock', forLuna: true, reason: 'Per taglia media' },
  { id: 'p6', name: 'Balsamo distric lucidante', brand: 'Maison Canina', price: 16.00, size: '250ml',
    hue: 170, stock: 'in-stock' },
  { id: 'p7', name: 'Palla gomma resistente', brand: 'Nord Pet', price: 9.50,
    hue: 10, stock: 'out' },
  { id: 'p8', name: 'Cuccia memory foam L', brand: 'Atelier Nord', price: 89.00,
    hue: 40, stock: 'in-stock' },
  { id: 'p9', name: 'Salviette pulizia zampe', brand: 'Maison Canina', price: 6.50, size: '40pz',
    hue: 100, stock: 'in-stock' },
  { id: 'p10', name: 'Snack naturali pollo', brand: 'Piccolo Forno', price: 11.90, size: '200g',
    hue: 20, stock: 'low' },
];
const productById = (id) => PRODUCTS.find(p => p.id === id);

// ─── Provider ─────────────────────────────────────────────────────────────
const AppProvider = ({ children }) => {
  const [state, setState] = useState(INITIAL_STATE);
  const set = (patch) => setState(s => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));

  const nav = (name, params = {}) => set({ route: { name, params } });

  const toast = (msg, kind = 'success') => {
    set({ toast: { msg, kind, id: Date.now() } });
    setTimeout(() => setState(s => s.toast && s.toast.msg === msg ? { ...s, toast: null } : s), 3500);
  };

  // Cart helpers
  const addToCart = (productId, qty = 1) => {
    set(s => {
      const existing = s.cart.find(i => i.productId === productId);
      if (existing) {
        return { cart: s.cart.map(i => i.productId === productId ? { ...i, qty: i.qty + qty } : i) };
      }
      return { cart: [...s.cart, { productId, qty }] };
    });
  };
  const removeFromCart = (productId) => set(s => ({ cart: s.cart.filter(i => i.productId !== productId) }));
  const setCartQty = (productId, qty) => set(s => ({
    cart: qty <= 0
      ? s.cart.filter(i => i.productId !== productId)
      : s.cart.map(i => i.productId === productId ? { ...i, qty } : i),
  }));

  const value = {
    ...state, set, nav, toast,
    addToCart, removeFromCart, setCartQty,
  };

  return React.createElement(AppCtx.Provider, { value }, children);
};

// ─── Viewport switcher (chrome top bar) ───────────────────────────────────
const ViewportSwitcher = () => {
  const { viewport, set } = useApp();
  const Btn = ({ v, label, icon }) => (
    <button
      onClick={() => set({ viewport: v })}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '7px 14px', fontSize: 13, fontWeight: 600,
        background: viewport === v ? 'rgba(255,255,255,0.14)' : 'transparent',
        color: viewport === v ? '#fff' : 'rgba(255,255,255,0.65)',
        border: 'none', borderRadius: 999, cursor: 'pointer',
        transition: 'all .18s',
      }}
    >
      {icon}<span>{label}</span>
    </button>
  );
  return (
    <div style={{
      display: 'inline-flex', background: 'rgba(255,255,255,0.08)',
      padding: 3, borderRadius: 999,
    }}>
      <Btn v="desktop" label="Desktop" icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="13" rx="1"/><path d="M8 21h8M12 17v4"/>
        </svg>
      }/>
      <Btn v="mobile" label="Mobile" icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>
        </svg>
      }/>
    </div>
  );
};

const ChromeBar = () => {
  const { route, user, nav } = useApp();
  return (
    <div style={{
      height: 48, background: '#1d1a1a', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px', fontSize: 12, fontFamily: 'var(--font-sans)',
      flexShrink: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6,
            background: 'var(--color-primary)',
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FBF6F3" strokeWidth="2">
              <circle cx="5" cy="9" r="2"/><circle cx="9" cy="5" r="2"/>
              <circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/>
              <path d="M7 15c0-3 2-5 5-5s5 2 5 5c0 2.5-2 4-5 4s-5-1.5-5-4z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600 }}>Grooming Hub · Prototipo interattivo</span>
        </div>
        <span style={{
          padding: '3px 8px', borderRadius: 4,
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>/{route.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {user && (
          <button onClick={() => { if (confirm('Esci dal prototipo (reset completo)?')) location.reload(); }}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.55)', border: 'none',
              fontSize: 12, cursor: 'pointer' }}
          >
            ↻ Reset
          </button>
        )}
        <ViewportSwitcher/>
      </div>
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────
const Toast = () => {
  const { toast } = useApp();
  if (!toast) return null;
  const bg = toast.kind === 'success' ? '#2b2525' : '#b85e69';
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#FBF6F3',
      padding: '12px 18px', borderRadius: 999,
      fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
      zIndex: 100, animation: 'toastIn .3s ease',
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7"/>
      </svg>
      {toast.msg}
    </div>
  );
};

// ─── Frame — wraps the screen in mobile or desktop chrome ────────────────
const DesktopFrame = ({ children }) => (
  <div style={{
    width: '100%', height: '100%',
    background: 'var(--color-bg-main)',
    overflow: 'auto',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-primary)',
  }}>
    {children}
  </div>
);

const MobileFrame = ({ children }) => (
  <div style={{
    width: '100%', height: '100%',
    display: 'grid', placeItems: 'center',
    background: '#ede9e4',
    padding: 20,
    overflow: 'auto',
  }}>
    <div style={{
      width: 390, height: 'min(844px, calc(100vh - 88px - 40px))',
      background: '#000', borderRadius: 52,
      padding: 8, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.25)',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: 'var(--color-bg-main)',
        borderRadius: 44, overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 30, background: '#000',
          borderRadius: 999, zIndex: 10,
        }}/>
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', fontSize: 14, fontWeight: 600,
          color: 'var(--color-text-primary)',
          zIndex: 5,
        }}>
          <span>9:41</span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="2.5" height="4" rx="0.5"/><rect x="3.5" y="4" width="2.5" height="6" rx="0.5"/><rect x="7" y="2" width="2.5" height="8" rx="0.5"/><rect x="10.5" y="0" width="2.5" height="10" rx="0.5"/></svg>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1 4c2-2 4-3 6-3s4 1 6 3M3 6c1-1 2.5-1.5 4-1.5s3 .5 4 1.5M5.5 8c.5-.5 1-.7 1.5-.7s1 .2 1.5.7"/></svg>
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor"/><rect x="2" y="2" width="15" height="6" rx="1" fill="currentColor"/><rect x="19.5" y="3.5" width="1.5" height="3" rx="0.5" fill="currentColor"/></svg>
          </span>
        </div>
        {/* Content */}
        <div style={{
          width: '100%', height: '100%', paddingTop: 44,
          boxSizing: 'border-box',
          overflow: 'auto',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text-primary)',
        }}>
          {children}
        </div>
      </div>
    </div>
  </div>
);

// ─── Screen transition wrapper ────────────────────────────────────────────
const ScreenTransition = ({ routeKey, children }) => {
  const [display, setDisplay] = useState({ key: routeKey, node: children });
  const [phase, setPhase] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    if (routeKey !== display.key) {
      setPhase('out');
      const t = setTimeout(() => {
        setDisplay({ key: routeKey, node: children });
        setPhase('in');
      }, 160);
      return () => clearTimeout(t);
    } else {
      // same route, update content without animation
      setDisplay({ key: routeKey, node: children });
    }
  }, [routeKey, children]);

  return (
    <div style={{
      width: '100%', height: '100%',
      opacity: phase === 'in' ? 1 : 0,
      transform: phase === 'in' ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity .18s ease, transform .18s ease',
    }}>
      {display.node}
    </div>
  );
};

// Routing: map name → component
const registerRoute = (name, Comp) => {
  window.__routes = window.__routes || {};
  window.__routes[name] = Comp;
};
const getRoute = (name) => (window.__routes || {})[name];

// ─── AppShell ─────────────────────────────────────────────────────────────
const AppShell = () => {
  const { route, viewport } = useApp();
  const Comp = getRoute(route.name) || getRoute('notfound');
  const Frame = viewport === 'mobile' ? MobileFrame : DesktopFrame;
  const routeKey = viewport + ':' + route.name + ':' + (route.params.id || '');

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: '#ede9e4',
    }}>
      <ChromeBar/>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Frame>
          <ScreenTransition routeKey={routeKey}>
            {Comp ? React.createElement(Comp, route.params) : null}
          </ScreenTransition>
        </Frame>
      </div>
      <Toast/>
    </div>
  );
};

Object.assign(window, {
  AppProvider, AppShell, useApp, registerRoute,
  PRODUCTS, productById, INITIAL_STATE,
});
