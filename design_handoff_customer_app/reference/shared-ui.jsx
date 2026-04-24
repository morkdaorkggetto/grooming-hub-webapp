// ───────────────────────────────────────────────────────────
// SHARED UI — allineato a grooming-hub-webapp/src
// Stessi pattern: CSS vars inline-style, rounded-[28px], eyebrow uppercase.
// Niente Tailwind qui; usiamo le stesse var() che index.css espone.
// ───────────────────────────────────────────────────────────

const Icon = ({ name, size = 18, stroke = 1.75, color = 'currentColor', style = {} }) => {
  const paths = {
    home:     <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9z"/>,
    calendar: <g><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></g>,
    paw:      <g><circle cx="5" cy="9" r="2"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/><path d="M7 15c0-3 2-5 5-5s5 2 5 5c0 2.5-2 4-5 4s-5-1.5-5-4z"/></g>,
    bag:      <g><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></g>,
    gift:     <g><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13"/><path d="M7 8a2.5 2.5 0 1 1 5 0M17 8a2.5 2.5 0 1 0-5 0"/></g>,
    user:     <g><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></g>,
    bell:     <g><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></g>,
    search:   <g><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></g>,
    plus:     <path d="M12 5v14M5 12h14"/>,
    arrow:    <path d="M5 12h14M13 6l6 6-6 6"/>,
    check:    <path d="M5 13l4 4L19 7"/>,
    bath:     <g><path d="M3 11h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4z"/><path d="M6 11V6a2 2 0 0 1 2-2h1"/></g>,
    scissors: <g><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5L21 20M8.5 16.5L21 4"/></g>,
    drop:     <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>,
    sparkle:  <g><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></g>,
    clock:    <g><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>,
    loc:      <g><path d="M12 22s-7-7-7-13a7 7 0 0 1 14 0c0 6-7 13-7 13z"/><circle cx="12" cy="9" r="2.5"/></g>,
    qr:       <g><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1"/></g>,
    whatsapp: <g><path d="M20 12a8 8 0 1 0-3.5 6.6L20 20l-1.4-3.5A8 8 0 0 0 20 12z"/><path d="M9 10c.5 1.5 2 3 3.5 3.5l1-1c.7.3 1.3.5 2 .5v1.5c-3.5 0-6.5-3-6.5-6.5H10.5c0 .7.2 1.3.5 2l-1 1z" fill="currentColor" stroke="none"/></g>,
    heart:    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>,
    camera:   <g><path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></g>,
    pencil:   <g><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></g>,
    chevron:  <path d="M9 6l6 6-6 6"/>,
    logout:   <g><path d="M10 17l-5-5 5-5M5 12h12M14 4h5v16h-5"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, ...style }}>
      {paths[name] || <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
};

// Avatar del pet. Mimic dello stile 'client-card' con rounded-2xl e background caldo.
const PetAvatar = ({ name = 'Luna', size = 56, tier = 'base', photo }) => {
  const tierBg = {
    gold:   '#F4E3A1',
    silver: '#E5E7EB',
    bronze: '#EBC9A7',
    base:   '#f5eadf',
  }[tier] || '#f5eadf';
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.max(12, size / 4),
      background: tierBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, overflow: 'hidden', flexShrink: 0,
    }}>
      {photo ? <img src={photo} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '🐕'}
    </div>
  );
};

// Fidelity tier badge — stessi colori del codice originale
const FidelityBadge = ({ tier = 'bronze', compact = false }) => {
  const map = {
    bronze: { bg: '#f6e7d7', fg: '#8a5a2a', label: 'Bronzo' },
    silver: { bg: '#eceef2', fg: '#4a5668', label: 'Argento' },
    gold:   { bg: '#faedc4', fg: '#7a5a0a', label: 'Oro' },
    base:   { bg: 'var(--color-surface-soft)', fg: 'var(--color-text-secondary)', label: 'Base' },
  };
  const s = map[tier] || map.base;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: compact ? '3px 9px' : '4px 12px',
      borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: compact ? 10 : 12, fontWeight: 700,
    }}>
      {compact ? s.label : `Livello ${s.label}`}
    </span>
  );
};

// Product tile placeholder (per la boutique)
const ProductTile = ({ hue = 200, label = '' }) => (
  <div style={{
    width: '100%', aspectRatio: '1', borderRadius: 'var(--r-md)',
    background: `linear-gradient(145deg, hsl(${hue} 30% 88%), hsl(${hue} 25% 72%))`,
    display: 'flex', alignItems: 'flex-end', padding: 10,
    fontSize: 11, fontWeight: 500, color: 'rgba(0,0,0,.55)',
  }}>{label}</div>
);

Object.assign(window, { Icon, PetAvatar, FidelityBadge, ProductTile });
