// ═══════════════════════════════════════════════════════════
// CD-09 · KIT TESSERA — app del proprietario, 375px.
// L'avanzamento CONTA IN AVANTI: timbri fatti, e «la prossima».
// Mai una barra in percentuale, mai «ti mancano».
// Nessun colore nuovo: i metalli sono --tier-*, i fondi chiari e gli
// inchiostri sono quelli di FidelityBadge in shared-ui.jsx.
// ═══════════════════════════════════════════════════════════

const TIER = {
  bronze: { c: 'var(--tier-bronze)', bg: '#f6e7d7', fg: '#8a5a2a', n: 'Bronzo' },
  silver: { c: 'var(--tier-silver)', bg: '#eceef2', fg: '#4a5668', n: 'Argento' },
  gold: { c: 'var(--tier-gold)', bg: '#faedc4', fg: '#7a5a0a', n: 'Oro' },
};
// --tier-silver (#94a3b8) su bianco è 2,6:1: va bene per tratti e pieni,
// NON per il testo. Il testo d'argento usa l'inchiostro di FidelityBadge.

const Phone375 = ({ children, bg = GH.page }) => (
  <div style={{ width: 375, height: 812, borderRadius: 30, overflow: 'hidden', background: bg, boxShadow: '0 18px 44px rgba(43,37,37,.16)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)', position: 'relative' }}>
    <div style={{ height: 40, flexShrink: 0 }}/>
    {children}
  </div>
);

// ── Ritratto: la foto del PROPRIETARIO, mai quella del salone. ──
// Senza ritratto (quasi tutti): l'iniziale, sul fondo del livello o neutro.
const Ritratto = ({ pet, size = 76, tier, foto }) => {
  const t = TIER[tier];
  return (
    <div style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, border: `2px solid ${t ? t.c : 'rgba(111,151,146,.30)'}`, padding: 3 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 999, overflow: 'hidden', background: t ? t.bg : 'var(--gh-tint)', display: 'grid', placeItems: 'center' }}>
        {foto
          ? <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#cfc1c4,#9d8a8e)', display: 'grid', placeItems: 'center', fontSize: 8.5, color: '#fbf6f3', letterSpacing: '.12em', textTransform: 'uppercase' }}>ritratto</div>
          : <span style={{ fontSize: size * .42, color: t ? t.fg : 'var(--color-primary)', lineHeight: 1, ...GH.serifL }}>{pet[0]}</span>}
      </div>
    </div>
  );
};

const TierChip = ({ tier, big }) => {
  const t = TIER[tier];
  if (!t) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: big ? 30 : 26, padding: '0 11px', borderRadius: 999, background: t.bg, color: t.fg, fontSize: big ? 13 : 12, fontWeight: 700 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: t.c }}/>{t.n}
    </span>
  );
};

// ── I TIMBRI. Fino a 12 un timbro per visita; il prossimo ha il bordo pieno. ──
// Un timbro vuoto è NEUTRO — bianco, bordo tratteggiato — non spento.
const Timbri = ({ done, of }) => {
  const big = of <= 6;
  const d = big ? 38 : 30;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(6, ${d}px)`, gap: big ? 11 : 9, justifyContent: 'center' }}>
      {Array.from({ length: of }).map((_, i) => {
        const fatto = i < done, prossimo = i === done;
        return (
          <span key={i} style={{ width: d, height: d, borderRadius: 999, display: 'grid', placeItems: 'center', background: fatto ? 'var(--color-primary)' : '#fff', border: fatto ? 'none' : prossimo ? '1.5px solid var(--color-primary)' : '1.5px dashed var(--color-border)' }}>
            {fatto && <Icon name="paw" size={d * .5} color="#fbf6f3" stroke={1.8}/>}
          </span>
        );
      })}
    </div>
  );
};

// Oltre 12 i timbri diventano tacche: 36 cerchi su 375px sarebbero coriandoli.
const Tacche = ({ done, of }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18,1fr)', gap: 4 }}>
    {Array.from({ length: of }).map((_, i) => (
      <span key={i} style={{ height: 14, borderRadius: 3, background: i < done ? 'var(--color-primary)' : '#fff', border: i < done ? 'none' : i === done ? '1.5px solid var(--color-primary)' : '1px dashed var(--color-border)' }}/>
    ))}
  </div>
);

// ── Segnaposto QR: modulo deterministico, NON un codice vero. ──
const FakeQR = ({ size = 72, seed = 7 }) => {
  const n = 25, cells = [];
  let s = seed * 9301;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const finder = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const inFinder = (x, y) => { for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) { const dx = x - fx, dy = y - fy; if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4); } return false; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const on = finder(x, y) ? inFinder(x, y) : rnd() > .52;
    if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02"/>);
  }
  return <svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} style={{ background: '#fff', display: 'block' }} shapeRendering="crispEdges"><g fill="#000">{cells}</g></svg>;
};

// ── Il racconto: una frase che guarda avanti, e una che dice la regola. ──
const racconto = s => {
  if (s.tier === 'gold') return { t: `${s.pet} è Oro.`, sub: `${s.done} visite da noi negli ultimi tre anni.` };
  if (s.tier) {
    const next = { bronze: 'l’Argento', silver: 'l’Oro' }[s.tier];
    return { t: `${s.pet} è ${TIER[s.tier].n}.`, sub: s.carry ? `Queste visite contano già per ${next}: ${s.done} di ${s.of}.` : `Verso ${next}: ${s.done} visite di ${s.of}.` };
  }
  const ord = ['prima', 'seconda', 'terza', 'quarta', 'quinta', 'sesta'];
  if (s.done * 2 === s.of) return { t: 'A metà strada verso il Bronzo.', sub: `${s.done} visite. Il Bronzo è alla ${ord[s.of - 1]}.` };
  return { t: `La prossima è la ${ord[s.done]}.`, sub: `Il Bronzo arriva alla ${ord[s.of - 1]} visita.` };
};

// ── LA TESSERA: un oggetto, non una sezione della pagina. ──
const Tessera = ({ s }) => {
  const r = racconto(s);
  return (
    <div style={{ background: 'var(--color-surface-main)', border: `1px solid ${GH.bd}`, borderRadius: 22, padding: '16px 18px 18px', boxShadow: '0 10px 26px rgba(43,37,37,.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: 14, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.22em', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>Grooming Hub</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Ritratto pet={s.pet} tier={s.tier} foto={s.foto}/>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, color: GH.ink, lineHeight: 1.05, letterSpacing: '-.02em', ...GH.serifL }}>{s.pet}</div>
          <div style={{ fontSize: 13, color: GH.mute, marginTop: 3 }}>{s.breed}</div>
        </div>
        {s.tier && <TierChip tier={s.tier}/>}
      </div>
      <div style={{ height: 1, width: 44, background: GH.bd, margin: '14px auto 12px' }}/>
      <div style={{ fontSize: 19, color: GH.ink, lineHeight: 1.25, textAlign: 'center', ...GH.serif }}>{r.t}</div>
      <div style={{ fontSize: 13, color: GH.mute, marginTop: 4, lineHeight: 1.45, textAlign: 'center', textWrap: 'pretty' }}>{r.sub}</div>
      {s.tier !== 'gold' && (
        <div style={{ marginTop: 14 }}>
          {s.of <= 12 ? <Timbri done={s.done} of={s.of}/> : <Tacche done={s.done} of={s.of}/>}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <div style={{ fontSize: 11, color: GH.mute, lineHeight: 1.45, textAlign: 'center', textWrap: 'pretty' }}>
          {s.tier === 'gold' ? 'Il livello più alto della tessera.' : <>Ogni visita da noi è un timbro · contano quelle degli ultimi {s.win} mesi.</>}
        </div>
        <div style={{ padding: 4, border: `1px solid ${GH.bd}`, borderRadius: 8, background: '#fff' }}><FakeQR size={54} seed={s.pet.length}/></div>
      </div>
    </div>
  );
};

// ── La barra del proprietario: TRE voci, invariata. Nessuna quarta voce. ──
const TabBar = ({ on = 'home' }) => (
  <div style={{ marginTop: 'auto', height: 64, borderTop: `1px solid ${GH.bd}`, background: 'var(--color-surface-main)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', flexShrink: 0 }}>
    {[['home', 'paw', 'Home'], ['promo', 'sparkle', 'Promozioni'], ['profilo', 'user', 'Profilo']].map(([k, ic, l]) => (
      <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: on === k ? 'var(--color-primary)' : GH.mute }}>
        <Icon name={ic} size={21} stroke={1.8}/><span style={{ fontSize: 10.5, fontWeight: 650 }}>{l}</span>
      </div>
    ))}
  </div>
);

// ── L'accesso dalla Home: prende il posto del blocco «Punti · 0 punti». ──
const HomeStrip = ({ s }) => {
  const r = racconto(s);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 76, padding: '11px 14px', background: 'var(--color-surface-main)', border: `1px solid ${GH.bd}`, borderRadius: 18, cursor: 'pointer' }}>
      <Ritratto pet={s.pet} size={48} tier={s.tier} foto={s.foto}/>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="tessera" size={14} color="var(--color-primary)" stroke={1.9}/>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.18em', fontWeight: 700, color: 'var(--color-primary)' }}>la tessera di {s.pet}</span>
        </div>
        <div style={{ fontSize: 15.5, color: GH.ink, marginTop: 4, lineHeight: 1.25, ...GH.serif }}>{r.t}</div>
      </div>
      <Icon name="chevron" size={18} color={GH.mute}/>
    </div>
  );
};

Object.assign(window, { TIER, Phone375, Ritratto, TierChip, Timbri, Tacche, FakeQR, racconto, Tessera, TabBar, HomeStrip });
