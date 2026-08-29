// ═══════════════════════════════════════════════════════════
// CD-04 · KIT CARD PUBBLICA — vocabolario app clienti, voce del salone.
// Il telefono è il caso normale: si compone a 390 e si allarga, non il contrario.
// Nessun colore nuovo: i tre metalli erano GIÀ token (--tier-bronze/silver/gold).
// ═══════════════════════════════════════════════════════════

// ── Il medaglione. 240 cani su 282 non hanno foto: il ritratto generico ──
// è la REGOLA, non una mancanza. Quindi ha una cornice sua, non un fondo grigio.
const Medallion = ({ foto, size = 132, tier }) => {
  const ring = tier && tier !== 'base' ? `var(--tier-${tier})` : 'rgba(111,151,146,.30)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `2px solid ${ring}`, padding: 5 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 999, overflow: 'hidden', background: foto ? 'var(--gh-tint)' : 'var(--gh-tint)', display: 'grid', placeItems: 'center' }}>
          {foto
            ? <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#cfc1c4,#a89094)', display: 'grid', placeItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#fbf6f3', letterSpacing: '.12em', textTransform: 'uppercase' }}>foto</span>
              </div>
            : <Icon name="paw" size={size * .42} color="var(--color-primary)" stroke={1.5}/>}
        </div>
      </div>
    </div>
  );
};

// ── Il segno del livello: piccolo, accanto al nome. Non un blocco. ──
const TierMark = ({ tier }) => {
  if (!tier || tier === 'base') return null;
  const nome = { bronze: 'Bronzo', silver: 'Argento', gold: 'Oro' }[tier];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: `var(--tier-${tier})`, border: `1px solid var(--tier-${tier})`, borderRadius: 999, padding: '3px 9px' }}>
      <Icon name="sparkle" size={12}/>{nome}
    </span>
  );
};

// ── La riga della relazione. Sostituisce le tre barre di progressione: ──
// dice quello che è già vero, non quanto manca.
const RelationLine = ({ visite, da }) => {
  if (!visite) return (
    <div style={{ fontSize: 14.5, color: GH.mute, textAlign: 'center', lineHeight: 1.5, textWrap: 'pretty' }}>
      Non ci siamo ancora conosciuti.<br/><span style={{ color: GH.ink }}>La prima volta è la prossima.</span>
    </div>
  );
  return (
    <div style={{ fontSize: 15.5, color: GH.ink, textAlign: 'center', lineHeight: 1.5, textWrap: 'pretty', ...GH.serif }}>
      {visite === 1 ? 'È venuto una volta da noi' : <>È venuto <b style={GH.num}>{visite} volte</b> da noi</>}
      {da && <span style={{ display: 'block', fontSize: 13, color: GH.mute, marginTop: 3, fontFamily: 'var(--font-sans)' }}>la prima volta a {da}</span>}
    </div>
  );
};

// ── I due gesti. Uno è l'azione vera, l'altro è un'offerta. ──
const BigGesture = ({ children, icon, primary, sub }) => (
  <button style={{ width: '100%', minHeight: 54, borderRadius: 14, border: primary ? 'none' : `1px solid ${GH.bd}`, background: primary ? 'var(--color-primary)' : '#fff', color: primary ? '#fbf6f3' : GH.ink, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '9px 14px' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15.5, fontWeight: 650 }}>
      {icon && <Icon name={icon} size={18} stroke={1.9}/>}{children}
    </span>
    {sub && <span style={{ fontSize: 11.5, opacity: primary ? .82 : 1, color: primary ? '#fbf6f3' : GH.mute, fontWeight: 400 }}>{sub}</span>}
  </button>
);

// ── Il guscio: una colonna sola, sempre. A schermo largo si centra, ──
// non si divide in due — il telefono qui è il caso normale.
const CardShell = ({ children, wide }) => (
  <div style={{ width: '100%', minHeight: '100%', flex: wide ? undefined : 1, background: GH.page, display: 'flex', justifyContent: 'center', alignItems: wide ? 'flex-start' : 'stretch', padding: wide ? '40px 24px' : 0 }}>
    <div style={{ width: '100%', maxWidth: 390, display: 'flex', flexDirection: 'column', minHeight: wide ? undefined : '100%' }}>{children}</div>
  </div>
);

// ── L'insegna del salone. È la prima cosa: chi ha inquadrato non sa dove è finito. ──
const SalonMark = ({ salone = 'Grooming Hub' }) => (
  <div style={{ textAlign: 'center', padding: '22px 20px 0' }}>
    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', fontWeight: 700, color: 'var(--color-primary)' }}>toelettatura</div>
    <div style={{ fontSize: 21, color: GH.ink, marginTop: 5, ...GH.serifL }}>{salone}</div>
  </div>
);

Object.assign(window, { Medallion, TierMark, RelationLine, BigGesture, CardShell, SalonMark });
