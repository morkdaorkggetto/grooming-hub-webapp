// ═══════════════════════════════════════════════════════════
// GH-15 · KIT — veste editoriale (unica approvata)
// Valori definitivi, nessuna variante: ciò che è scritto qui è ciò che va implementato.
// Serif (Fraunces) = nomi propri e cifre che si guardano.
// Sans = tutto ciò che si scandisce (righe, orari, telefoni, etichette).
// Dipendenze: tokens.css + shared-ui.jsx (Icon, PetAvatar, FidelityBadge)
// ═══════════════════════════════════════════════════════════

const TouchCtx = React.createContext(false);
const useTouch = () => React.useContext(TouchCtx);

// ── Costanti di sistema. Ogni valore è normativo. ──
const GH = {
  bd: 'rgba(207,193,196,.6)',        // = --color-border @ 60%
  bdSoft: 'rgba(207,193,196,.35)',   // = --color-border @ 35%
  bridge: '#f7f1ea',                 // NUOVO token dichiarato: --gh-bridge
  ink: 'var(--color-text-primary)',
  mute: 'var(--color-text-secondary)',
  page: 'var(--color-surface-main)',
  soft: 'var(--color-surface-soft)',
  num: { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' },
  serif: { fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: '-.02em' },
  serifL: { fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '-.02em' },
  r: { field: 12, btn: 14, strip: 16, panel: 20 },
};

const Eyebrow = ({ children, color = GH.mute, style = {} }) => (
  <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.19em', fontWeight: 700, color, ...style }}>{children}</div>
);

// ── Hero: superficie calda, nessuna banda teal piena. H1 serif 32/25. ──
const Hero = ({ title, sub, right, compact }) => (
  <div style={{ background: GH.page, borderBottom: `1px solid ${GH.bd}`, padding: compact ? '14px 18px 16px' : '20px 28px 22px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <Eyebrow color="var(--color-primary)">Grooming Hub</Eyebrow>
        <div style={{ fontSize: compact ? 25 : 32, lineHeight: 1.08, marginTop: 4, color: GH.ink, ...GH.serifL }}>{title}</div>
        <div style={{ fontSize: 12.5, color: GH.mute, marginTop: 4 }}>{sub}</div>
      </div>
      {right}
    </div>
  </div>
);

const HeroBtn = ({ children }) => (
  <button style={{ background: 'transparent', border: `1px solid ${GH.bd}`, color: GH.ink, borderRadius: GH.r.btn, padding: '0 13px', height: 36, fontSize: 12.5, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>{children}</button>
);

// ── Bottone: una sola primaria per gruppo. 38px al banco / 46px sul telefono. ──
const Btn = ({ children, variant = 'outline', icon, wide, style = {} }) => {
  const t = useTouch();
  const v = {
    primary: { bg: 'var(--color-primary)', fg: '#fbf6f3', bd: 'var(--color-primary)' },
    secondary: { bg: 'var(--color-secondary)', fg: '#fbf6f3', bd: 'var(--color-secondary)' },
    outline: { bg: '#fff', fg: GH.ink, bd: GH.bd },
    ghost: { bg: 'transparent', fg: GH.mute, bd: 'transparent' },
    success: { bg: 'var(--color-success-bg)', fg: 'var(--color-success-text)', bd: 'rgba(79,139,103,.35)' },
    danger: { bg: 'transparent', fg: 'var(--color-danger-text)', bd: 'rgba(184,94,105,.5)' },
    whatsapp: { bg: 'var(--color-success-text)', fg: '#fff', bd: 'var(--color-success-text)' },
  }[variant];
  return (
    <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: t ? 46 : 38, padding: `0 ${t ? 16 : 13}px`, width: wide ? '100%' : undefined, background: v.bg, color: v.fg, border: `1px solid ${v.bd}`, borderRadius: GH.r.btn, fontSize: 12.5, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap', ...style }}>
      {icon && <Icon name={icon} size={15} stroke={1.9}/>}{children}
    </button>
  );
};

// ── Pannello: raggio 20, testa 12/16, titolo serif 16. ──
const Panel = ({ eyebrow, title, right, children, pad = 13, tone, style = {} }) => (
  <div style={{ background: tone || '#fff', border: `1px solid ${GH.bd}`, borderRadius: GH.r.panel, overflow: 'hidden', ...style }}>
    {(title || eyebrow) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${GH.bdSoft}` }}>
        <div style={{ minWidth: 0 }}>
          {eyebrow && <Eyebrow color="var(--color-primary)" style={{ marginBottom: 3 }}>{eyebrow}</Eyebrow>}
          {title && <div style={{ fontSize: 16, color: GH.ink, ...GH.serif }}>{title}</div>}
        </div>
        {right}
      </div>
    )}
    {children != null && <div style={{ padding: pad }}>{children}</div>}
  </div>
);

const Field = ({ label, value, placeholder, w, area, children }) => {
  const t = useTouch();
  return (
    <label style={{ display: 'block', width: w || '100%' }}>
      <Eyebrow style={{ marginBottom: 5 }}>{label}</Eyebrow>
      {children || (
        <div style={{ height: area ? 66 : (t ? 46 : 38), border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, background: '#fff', display: 'flex', alignItems: area ? 'flex-start' : 'center', padding: area ? '10px 12px' : '0 12px', fontSize: 13, color: value ? GH.ink : 'var(--color-placeholder)', fontWeight: value ? 600 : 400 }}>{value || placeholder}</div>
      )}
    </label>
  );
};

const SearchBar = () => {
  const t = useTouch();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: t ? 46 : 40, border: `1px solid ${GH.bd}`, background: '#fff', borderRadius: GH.r.field, padding: '0 12px' }}>
      <Icon name="search" size={16} color={GH.mute}/>
      <span style={{ fontSize: 13, color: 'var(--color-placeholder)' }}>Nome cane, proprietario, telefono…</span>
    </div>
  );
};

const Pill = ({ children, n, on }) => {
  const t = useTouch();
  return (
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: t ? 40 : 32, padding: '0 12px', borderRadius: 999, border: `1px solid ${on ? 'var(--color-primary)' : GH.bd}`, background: on ? 'var(--color-primary)' : '#fff', color: on ? '#fbf6f3' : GH.ink, fontSize: 12, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}<span style={{ ...GH.num, fontSize: 11, opacity: .7 }}>{n}</span>
    </button>
  );
};

// ── Striscia numeri: numeri serif 30 tabulari, separatori interni. ──
const StatStrip = ({ items, cols }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols || `repeat(${items.length},1fr)`, border: `1px solid ${GH.bd}`, borderRadius: GH.r.strip, overflow: 'hidden', background: '#fff' }}>
    {items.map((s, i) => (
      <div key={s.k} style={{ padding: '10px 13px 11px', borderLeft: i ? `1px solid ${GH.bdSoft}` : 'none', background: s.tone || '#fff' }}>
        <Eyebrow color={s.fg || GH.mute}>{s.k}</Eyebrow>
        <div style={{ fontSize: 30, lineHeight: 1, marginTop: 3, color: s.fg || GH.ink, ...GH.num, ...GH.serifL }}>{s.v}</div>
        <div style={{ fontSize: 11, color: GH.mute, marginTop: 4 }}>{s.note}</div>
      </div>
    ))}
  </div>
);

// ── Tessera area: la tessera intera è il bersaglio. Nessun bottone «Apri…». ──
const AreaTile = ({ eyebrow, title, desc, meta, icon, accent, children, span }) => (
  <div style={{ gridColumn: span ? `span ${span}` : undefined, background: '#fff', border: `1px solid ${GH.bd}`, borderRadius: GH.r.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 9, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }}/>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
      <div>
        <Eyebrow color={accent}>{eyebrow}</Eyebrow>
        <div style={{ fontSize: 18, color: GH.ink, marginTop: 4, ...GH.serif }}>{title}</div>
      </div>
      <Icon name={icon} size={19} color={accent} stroke={1.8}/>
    </div>
    <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.45, textWrap: 'pretty' }}>{desc}</div>
    {children}
    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 650, color: GH.mute, ...GH.num }}>{meta}</span>
      <Icon name="chevron" size={15} color={accent}/>
    </div>
  </div>
);

// ⚠ campi incerti: slot.operator, slot.state — vedi handoff §8
const SlotRow = ({ time, pet, op, state }) => {
  const c = { fatta: 'var(--color-success-text)', corso: 'var(--color-warning-text)', attesa: GH.mute }[state];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 30, fontSize: 12 }}>
      <span style={{ ...GH.num, fontWeight: 700, color: GH.ink, width: 38 }}>{time}</span>
      <span style={{ fontWeight: 600, color: GH.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pet}</span>
      <span style={{ fontSize: 11, color: GH.mute }}>{op}</span>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: c, flexShrink: 0 }}/>
    </div>
  );
};

const TierDot = ({ tier }) => (
  <span title={tier} style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: { bronzo: 'var(--tier-bronze)', argento: 'var(--tier-silver)', oro: 'var(--tier-gold)', base: GH.bd }[tier] }}/>
);

// ── Stati appuntamento/cliente: vocabolario unico, 8 voci. ──
// CD-06: aggiunte `completato` e `annullato` — la tabella delle etichette le
// tiene entrambe, e mancavano al vocabolario che dichiarava di essere unico.
const STATES = {
  confermato: ['var(--color-success-text)', 'var(--color-success-bg)', 'Confermato'],
  completato: ['var(--color-success-text)', 'var(--color-success-bg)', 'Completato'],
  annullato: ['var(--color-text-secondary)', 'var(--color-surface-soft)', 'Annullato'],
  attesa: ['var(--color-warning-text)', 'var(--color-warning-bg)', 'In attesa'],
  noshow: ['var(--color-danger-text)', 'var(--color-danger-bg)', 'No-show'],
  attivo: ['var(--color-success-text)', 'var(--color-success-bg)', 'Attivo'],
  rischio: ['var(--color-warning-text)', 'var(--color-warning-bg)', 'A rischio'],
  blacklist: ['var(--color-danger-text)', 'var(--color-danger-bg)', 'Blacklist'],
};
// Guardia: una chiave sconosciuta degrada a un'etichetta neutra, non a una
// pagina bianca — questo componente è condiviso da GH-15, CD-01 e CD-06.
const StateTag = ({ s, label }) => {
  const m = STATES[s] || ['var(--color-text-secondary)', 'var(--color-surface-soft)', s];
  return <span style={{ fontSize: 10, fontWeight: 700, color: m[0], background: m[1], borderRadius: 5, padding: '3px 7px', whiteSpace: 'nowrap' }}>{label || m[2]}</span>;
};

// ── Caricamento / vuoto / errore ──
const Skeleton = ({ w = '100%', h = 12, r = 6 }) => (
  <span style={{ display: 'block', width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#efe7e4,#f6f0ed,#efe7e4)', backgroundSize: '200% 100%' }}/>
);
const SkeletonRow = ({ i }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 44, padding: '0 13px', borderTop: i ? `1px solid ${GH.bdSoft}` : 'none' }}>
    <Skeleton w={30} h={30} r={8}/>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}><Skeleton w="42%" h={10}/><Skeleton w="26%" h={8}/></div>
    <Skeleton w={54} h={9}/>
  </div>
);
const EmptyState = ({ title, body, action }) => (
  <div style={{ padding: '26px 16px', textAlign: 'center' }}>
    <div style={{ fontSize: 18, color: GH.ink, marginBottom: 6, ...GH.serif }}>{title}</div>
    <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.5, textWrap: 'pretty', marginBottom: action ? 13 : 0 }}>{body}</div>
    {action}
  </div>
);
const ErrorState = ({ body }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 13, background: 'var(--color-danger-bg)', border: '1px solid rgba(184,94,105,.35)', borderRadius: GH.r.field }}>
    <Icon name="bell" size={16} color="var(--color-danger-text)"/>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-danger-text)' }}>Non è stato salvato</div>
      <div style={{ fontSize: 12, color: GH.mute, marginTop: 3, lineHeight: 1.45, textWrap: 'pretty' }}>{body}</div>
    </div>
  </div>
);
const Notice = ({ children, icon = 'clock' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: 9, padding: '7px 10px' }}>
    <Icon name={icon} size={14}/>{children}
  </div>
);

// ⚠ campi incerti: client.visitCount, client.lastVisit, client.tier, client.state — vedi handoff §8
const CLIENTS = [
  { pet: 'Luna', breed: 'Barboncino', owner: 'Chiara Esposito', tel: '340 118 2277', tier: 'argento', visite: 26, last: '18 ago', state: 'attivo' },
  { pet: 'Miele', breed: 'Golden Retriever', owner: 'Davide Rullo', tel: '333 904 5512', tier: 'bronzo', visite: 14, last: '12 ago', state: 'attivo' },
  { pet: 'Argo', breed: 'Labrador', owner: 'Fabio Cirillo', tel: '347 552 8890', tier: 'oro', visite: 41, last: '21 ago', state: 'attivo' },
  { pet: 'Zoe', breed: 'Maltese', owner: 'Marta Ievoli', tel: '349 771 3320', tier: 'bronzo', visite: 12, last: '5 ago', state: 'rischio' },
  { pet: 'Nina', breed: 'Shih Tzu', owner: 'Rosa Pagano', tel: '328 664 1108', tier: 'base', visite: 7, last: '29 lug', state: 'attivo' },
  { pet: 'Rocky', breed: 'Boxer', owner: 'Gennaro Ruggiero', tel: '351 220 7745', tier: 'base', visite: 3, last: '9 giu', state: 'blacklist' },
  { pet: 'Fido 3', breed: 'Pastore Tedesco', owner: 'Mork da Ork', tel: '338 433 2863', tier: 'base', visite: 0, last: '—', state: 'attivo' },
];

// ── Riga archivio. Desktop: griglia 6 colonne, 44px. Telefono: flex, 60px. ──
// Il tag «Attivo» NON si stampa in lista: è il default, su 129 righe è rumore.
const ClientRow = ({ c, i, mobile }) => (
  <div style={{ display: mobile ? 'flex' : 'grid', gridTemplateColumns: mobile ? undefined : '1.5fr 1.4fr .9fr 84px 74px 20px', alignItems: 'center', gap: mobile ? 10 : 12, minHeight: mobile ? 60 : 44, padding: mobile ? '9px 13px' : '0 13px', borderTop: i ? `1px solid ${GH.bdSoft}` : 'none', background: '#fff', cursor: 'pointer' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, flex: mobile ? 1 : undefined }}>
      <PetAvatar size={mobile ? 38 : 30} tier={{ base: 'base', argento: 'silver', oro: 'gold', bronzo: 'bronze' }[c.tier]}/>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, color: GH.ink, whiteSpace: 'nowrap', ...GH.serif }}>{c.pet}</span>
          <TierDot tier={c.tier}/>
          {c.state !== 'attivo' && <StateTag s={c.state}/>}
        </div>
        <div style={{ fontSize: 11.5, color: GH.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.breed}{mobile ? ` · ${c.owner}` : ''}</div>
      </div>
    </div>
    {!mobile && <div style={{ fontSize: 12.5, color: GH.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.owner}</div>}
    {!mobile && <div style={{ fontSize: 12.5, color: GH.mute, ...GH.num }}>{c.tel}</div>}
    {!mobile && <div style={{ fontSize: 12.5, color: GH.ink, ...GH.num }}>{c.visite} visite</div>}
    <div style={{ fontSize: mobile ? 11.5 : 12.5, color: GH.mute, ...GH.num, textAlign: mobile ? 'right' : 'left' }}>{c.last}</div>
    {!mobile && <Icon name="chevron" size={14} color={GH.mute}/>}
  </div>
);

const Phone = ({ children }) => (
  <TouchCtx.Provider value={true}>
    <div style={{ width: 390, height: 844, background: GH.page, fontFamily: 'var(--font-sans)', borderRadius: 26, overflow: 'hidden', boxShadow: '0 18px 44px rgba(43,37,37,.16)', display: 'flex', flexDirection: 'column', position: 'relative' }}>{children}</div>
  </TouchCtx.Provider>
);

const Fab = () => (
  <button style={{ position: 'absolute', right: 15, bottom: 15, width: 56, height: 56, borderRadius: 999, background: 'var(--color-primary)', border: 'none', color: '#fbf6f3', boxShadow: '0 8px 20px rgba(111,151,146,.45)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="plus" size={24} stroke={2.2}/></button>
);

Object.assign(window, { TouchCtx, useTouch, GH, Eyebrow, Hero, HeroBtn, Btn, Panel, Field, SearchBar, Pill, StatStrip, AreaTile, SlotRow, TierDot, STATES, StateTag, Skeleton, SkeletonRow, EmptyState, ErrorState, Notice, CLIENTS, ClientRow, Phone, Fab });
