// ═══════════════════════════════════════════════════════════
// CD-03 · KIT MESE — non ricompone la pagina: dice cosa cambia quando
// l'unità cambia. Riusa CD-02 dove regge; tre componenti nuovi soltanto.
// Nessun colore nuovo: i sei derivati sono ora token per nome.
// ═══════════════════════════════════════════════════════════

// ── L'interruttore. Sta accanto al navigatore, non altrove: ──
// cambiare unità e cambiare periodo sono lo stesso gesto a due scale.
const UnitSwitch = ({ unit }) => {
  const t = useTouch();
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden', background: '#fff' }}>
      {['Settimana', 'Mese'].map(u => {
        const on = u.toLowerCase() === unit;
        return (
          <button key={u} style={{ height: t ? 46 : 34, padding: `0 ${t ? 18 : 14}px`, border: 'none', background: on ? 'var(--color-primary)' : 'transparent', color: on ? '#fbf6f3' : GH.mute, fontSize: 12.5, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>{u}</button>
        );
      })}
    </div>
  );
};

// ── LA RIGA-SETTIMANA. Quattro cose, e i giorni lavorati non sono un ──
// dettaglio: senza di loro «110 contro 67» dice una cosa falsa.
const WeekRow = ({ w, max, i, mobile }) => {
  const ferma = w.n === 0;
  const bar = max ? (w.eur / max) * 100 : 0;
  const peak = w.eur === max && max > 0;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: mobile ? 10 : 14, minHeight: mobile ? 60 : 44, padding: mobile ? '0 13px' : '0 16px', borderTop: i ? `1px solid ${GH.bdSoft}` : 'none', overflow: 'hidden', background: ferma ? 'var(--gh-absent)' : 'transparent' }}>
      {!ferma && <div style={{ position: 'absolute', left: 0, top: 3, bottom: 3, width: `${bar}%`, background: peak ? 'var(--gh-bar-peak)' : 'var(--gh-bar)', borderRadius: '0 8px 8px 0', pointerEvents: 'none' }}/>}
      <span style={{ position: 'relative', fontSize: 15, color: ferma ? GH.mute : GH.ink, minWidth: mobile ? 88 : 104, ...GH.serif }}>{w.label}</span>
      {ferma ? (
        <span style={{ position: 'relative', fontSize: 12.5, color: GH.mute, fontStyle: 'italic' }}>
          settimana ferma — non è passato nessuno
        </span>
      ) : (
        <>
          <span style={{ position: 'relative', fontSize: 12, color: GH.mute, minWidth: mobile ? 56 : 74, ...GH.num }}>{w.g} {w.g === 1 ? 'giorno' : 'giorni'}</span>
          <span style={{ position: 'relative', fontSize: 12, color: GH.mute, minWidth: mobile ? 52 : 70, ...GH.num }}>{w.n} {w.n === 1 ? 'cane' : 'cani'}</span>
        </>
      )}
      <div style={{ flex: 1 }}/>
      {peak && !mobile && <span style={{ position: 'relative', fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '.14em' }}>settimana piena</span>}
      <span style={{ position: 'relative', fontSize: mobile ? 16 : 17, color: ferma ? GH.mute : GH.ink, minWidth: 78, textAlign: 'right', ...GH.num, ...GH.serif }}>{ferma ? '—' : eur(w.eur)}</span>
    </div>
  );
};

// ── La striscia dei mesi. Sei mesi esistono, non dodici: ──
// non disegno sei caselle vuote per far sembrare completa una storia breve.
const MonthTrend = ({ months, sel }) => {
  const max = Math.max(...months.map(m => m.eur), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 58 }}>
        {months.map((m, i) => (
          <div key={i} title={`${m.k} · ${eur(m.eur)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4, height: '100%' }}>
            <div style={{ height: `${Math.max((m.eur / max) * 100, 4)}%`, background: i === sel ? 'var(--color-primary)' : 'var(--gh-trend-off)', borderRadius: '3px 3px 0 0', minHeight: 4, opacity: m.parziale ? .5 : 1, border: m.parziale ? '1px dashed var(--color-primary)' : 'none', borderBottom: 'none' }}/>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
        {months.map((m, i) => (
          <span key={i} style={{ flex: 1, fontSize: 10, textAlign: 'center', color: i === sel ? GH.ink : GH.mute, fontWeight: i === sel ? 700 : 400 }}>{m.k}</span>
        ))}
      </div>
    </div>
  );
};

// ── Il mese incompleto: nessuna proiezione. ──
// Il confronto si fa sullo stesso tratto del mese scorso, non sul mese intero.
const PartialNote = ({ giorni, tot, prevSpan, prevFull }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: GH.r.field, margin: '0 16px 12px' }}>
    <Icon name="clock" size={15} color="var(--color-warning-text)"/>
    <div style={{ fontSize: 12, color: 'var(--color-warning-text)', lineHeight: 1.5, textWrap: 'pretty' }}>
      <b>Agosto non è finito.</b> Questi sono i primi <span style={GH.num}>{giorni}</span> giorni su <span style={GH.num}>{tot}</span>: confrontarli con luglio intero direbbe una cosa falsa. Il confronto qui sopra è con i <b>primi {giorni} giorni di luglio</b> — <span style={GH.num}>{eur(prevSpan)}</span>, non i <span style={GH.num}>{eur(prevFull)}</span> del mese pieno.
    </div>
  </div>
);

Object.assign(window, { UnitSwitch, WeekRow, MonthTrend, PartialNote });
