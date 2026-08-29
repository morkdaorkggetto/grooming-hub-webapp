// ═══════════════════════════════════════════════════════════
// CD-02 · KIT REPORT — riusa gh15-ed-kit.jsx. Nessun colore nuovo.
// Nessun componente di GH-15 sostituito: solo aggiunte.
//
// LA DECISIONE PORTANTE: schede giornaliere e grafico erano lo stesso
// dato due volte. Diventano UNA cosa sola — la riga del giorno È la barra.
// Sette righe, non sette schede più sette barre.
// ═══════════════════════════════════════════════════════════

const eur = n => n.toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €';

// ── Numero grande: serif tabulare. Il confronto è dentro, non accanto. ──
const BigNum = ({ k, v, note, delta, tone }) => (
  <div style={{ padding: '11px 14px 12px', background: tone || '#fff', flex: 1, minWidth: 0 }}>
    <Eyebrow>{k}</Eyebrow>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginTop: 3, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 30, lineHeight: 1, color: GH.ink, ...GH.num, ...GH.serifL }}>{v}</span>
      {delta != null && <Delta v={delta}/>}
    </div>
    <div style={{ fontSize: 11, color: GH.mute, marginTop: 5 }}>{note}</div>
  </div>
);

// ── Delta: la risposta a «è andata meglio o peggio?». Mai una freccia sola. ──
const Delta = ({ v, big }) => {
  if (v === 0) return <span style={{ fontSize: big ? 13 : 11.5, fontWeight: 700, color: GH.mute }}>come la scorsa</span>;
  const up = v > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: big ? 13 : 11.5, fontWeight: 700, color: up ? 'var(--color-success-text)' : 'var(--color-danger-text)', background: up ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', borderRadius: 6, padding: '2px 7px', ...GH.num }}>
      {up ? '↑' : '↓'} {Math.abs(v)}%
    </span>
  );
};

// ── LA RIGA-BARRA: giorno, visite, incasso, e la barra è la riga stessa. ──
// Sostituisce insieme le sette schede e il grafico a barre.
const DayBar = ({ d, max, i, mobile, chiuso }) => {
  const w = max ? (d.eur / max) * 100 : 0;
  const peak = d.eur === max && max > 0;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: mobile ? 10 : 14, minHeight: mobile ? 60 : 44, padding: mobile ? '0 13px' : '0 16px', borderTop: i ? `1px solid ${GH.bdSoft}` : 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 3, bottom: 3, width: `${w}%`, background: peak ? 'rgba(111,151,146,.16)' : 'rgba(111,151,146,.08)', borderRadius: '0 8px 8px 0', pointerEvents: 'none' }}/>
      <span style={{ position: 'relative', fontSize: mobile ? 15 : 15, color: chiuso ? GH.mute : GH.ink, minWidth: mobile ? 58 : 72, ...GH.serif }}>{d.dow} {d.d}</span>
      <span style={{ position: 'relative', fontSize: 12, color: GH.mute, minWidth: mobile ? 52 : 68, ...GH.num }}>
        {chiuso ? 'chiuso' : d.n === 0 ? '—' : `${d.n} ${d.n === 1 ? 'cane' : 'cani'}`}
      </span>
      <div style={{ flex: 1 }}/>
      {peak && !mobile && <span style={{ position: 'relative', fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '.14em' }}>giorno pieno</span>}
      <span style={{ position: 'relative', fontSize: mobile ? 16 : 17, color: d.eur ? GH.ink : GH.mute, minWidth: 74, textAlign: 'right', ...GH.num, ...GH.serif }}>{d.eur ? eur(d.eur) : '—'}</span>
    </div>
  );
};

// ── Confronto nel tempo: 12 settimane, senza diventare un cruscotto. ──
// Nessun asse, nessuna griglia: solo la forma, e la settimana letta in evidenza.
const TrendStrip = ({ weeks, sel }) => {
  const max = Math.max(...weeks.map(w => w.eur), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
      {weeks.map((w, i) => (
        <div key={i} title={`${w.label} · ${eur(w.eur)}`} style={{ flex: 1, height: `${Math.max((w.eur / max) * 100, 3)}%`, background: i === sel ? 'var(--color-primary)' : 'rgba(111,151,146,.22)', borderRadius: '3px 3px 0 0', minHeight: 3 }}/>
      ))}
    </div>
  );
};

// ── Distribuzione degli importi: due gobbe e il buco in mezzo. ──
// NON dice «12 bagni e 6 tagli»: quel numero sarebbe inventato. Dice gli importi.
const AmountSpread = ({ bands }) => {
  const max = Math.max(...bands.map(b => b.n), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {bands.map(b => (
        <div key={b.k} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 26 }}>
          <span style={{ fontSize: 12, color: b.n ? GH.ink : GH.mute, minWidth: 62, ...GH.num }}>{b.k}</span>
          <div style={{ flex: 1, height: 8, background: GH.soft, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(b.n / max) * 100}%`, height: '100%', background: b.hi ? 'var(--color-primary)' : 'rgba(111,151,146,.35)', borderRadius: 999 }}/>
          </div>
          <span style={{ fontSize: 12, color: b.n ? GH.ink : GH.mute, minWidth: 30, textAlign: 'right', ...GH.num }}>{b.n}</span>
        </div>
      ))}
    </div>
  );
};

// ── Riga visita del dettaglio. A volte racconta un'assenza, non un lavoro. ──
// ⚠ visit.discount — mai stato usato: se lo schema non lo regge, la riga non cambia
const VisitLine = ({ v, i, mobile }) => {
  const assenza = v.assenza;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 13, minHeight: mobile ? 60 : 44, padding: mobile ? '8px 13px' : '0 16px', borderTop: i ? `1px solid ${GH.bdSoft}` : 'none', background: assenza ? 'rgba(207,193,196,.12)' : 'transparent' }}>
      <PetAvatar size={mobile ? 34 : 28} tier="base"/>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: mobile ? 16 : 15, color: assenza ? GH.mute : GH.ink, ...GH.serif }}>{v.pet}</span>
          {!mobile && <span style={{ fontSize: 11.5, color: GH.mute }}>{v.owner}</span>}
        </div>
        <div style={{ fontSize: 11.5, color: GH.mute, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>«{v.text}»</div>
      </div>
      {v.issue && <span title={v.issue} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-warning-text)', flexShrink: 0 }}/>}
      <span style={{ fontSize: mobile ? 15 : 15, color: assenza ? GH.mute : GH.ink, minWidth: 58, textAlign: 'right', ...GH.num, ...GH.serif }}>{v.eur ? eur(v.eur) : '—'}</span>
    </div>
  );
};

// ── Intestazione di giorno dentro il dettaglio: serve a 58 righe, non a 6. ──
const DayHead = ({ d, n, tot }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '9px 16px 6px', background: GH.soft, borderTop: `1px solid ${GH.bd}` }}>
    <span style={{ fontSize: 13, color: GH.ink, ...GH.serif }}>{d}</span>
    <span style={{ fontSize: 11, color: GH.mute, ...GH.num }}>{n} {n === 1 ? 'cane' : 'cani'}</span>
    <div style={{ flex: 1 }}/>
    <span style={{ fontSize: 12, color: GH.mute, ...GH.num }}>{eur(tot)}</span>
  </div>
);

// ── Navigatore settimana ──
const WeekNav = ({ label, futura }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <Btn style={{ height: 34, padding: '0 11px' }}>←</Btn>
    <span style={{ fontSize: 16, color: futura ? GH.mute : GH.ink, minWidth: 176, textAlign: 'center', ...GH.serif }}>{label}</span>
    <Btn style={{ height: 34, padding: '0 11px' }}>→</Btn>
    <Btn style={{ height: 34 }}>Questa settimana</Btn>
  </div>
);

Object.assign(window, { eur, BigNum, Delta, DayBar, TrendStrip, AmountSpread, VisitLine, DayHead, WeekNav });
