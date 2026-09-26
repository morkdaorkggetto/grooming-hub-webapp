// ═══════════════════════════════════════════════════════════
// CD-01 · KIT CALENDARIO — riusa gh15-ed-kit.jsx (GH, Hero, Btn, Panel,
// Eyebrow, StateTag, EmptyState, Notice, ErrorState, Phone, Fab, TouchCtx).
// Nessun colore nuovo. Nessun componente sostituito: solo aggiunte.
//
// LA GRAMMATICA DEI TRE OGGETTI — la cella di sinistra è il vocabolario:
//   09:30  cifre serif        → ora decisa dal salone (appuntamento confermato)
//   ⟨mattina⟩ capsula tratteggiata → ora ANCORA da decidere (richiesta pendente)
//   ▬ barretta, nessun campo ora   → ora MAI esistita (lavorazione registrata)
// Due trattamenti distinti per i due oggetti senza ora precisa: la fascia
// promette «da qualche parte qui dentro», e su una lavorazione a posteriori
// quella promessa sarebbe falsa. Vedi tavola «I tre oggetti».
// ═══════════════════════════════════════════════════════════

// ⚠ requests.* — tabella richieste: campi da verificare in schema (vedi tavola campi)
// ⚠ visits.amount — l'incasso per visita non è confermato: le righe reggono la sua assenza
const FASCIA = { mattina: 'mattina', pomeriggio: 'pomeriggio', indifferente: 'a piacere' };

// ── Capsula fascia: tratteggiata = non ancora fissata ──
const CalFascia = ({ f }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 22, padding: '0 8px', borderRadius: 999, border: '1px dashed var(--color-warning-text)', color: 'var(--color-warning-text)', background: 'var(--color-warning-bg)', fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{FASCIA[f]}</span>
);

// ── Cella sinistra: l'unico posto dove i tre oggetti si distinguono per forma ──
const CalWhen = ({ kind, time, fascia, w = 76 }) => (
  <div style={{ width: w, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
    {kind === 'conf' && <span style={{ fontSize: 17, color: GH.ink, ...GH.num, ...GH.serif }}>{time}</span>}
    {kind === 'req' && <CalFascia f={fascia}/>}
    {kind === 'reg' && <span title="registrata a lavoro finito: nessun orario" style={{ width: 14, height: 2, borderRadius: 2, background: GH.bd }}/>}
  </div>
);

// ── Riga oggetto. Il testo del salone si stampa VERBATIM: può essere un diario. ──
const CalRow = ({ o, i, mobile, onAct }) => {
  const t = useTouch();
  const isReg = o.kind === 'reg';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 12, minHeight: t ? 60 : 44, padding: mobile ? '8px 0' : 0, borderTop: i ? `1px solid ${GH.bdSoft}` : 'none', cursor: 'pointer' }}>
      <CalWhen kind={o.kind} time={o.time} fascia={o.fascia} w={mobile ? 66 : 76}/>
      <PetAvatar size={mobile ? 34 : 28} tier="base"/>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: mobile ? 16 : 15, color: GH.ink, whiteSpace: 'nowrap', ...GH.serif }}>{o.pet}</span>
          {o.kind === 'req' && <StateTag s="attesa"/>}
          {o.flag && <StateTag s={o.flag}/>}
        </div>
        <div style={{ fontSize: 12, color: GH.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
          {isReg ? <span style={{ fontStyle: 'italic' }}>«{o.text}»</span> : o.text}
          {o.manto && <span style={{ color: 'var(--color-warning-text)' }}> · {o.manto}</span>}
        </div>
      </div>
      {!mobile && o.kind === 'req' && <Btn variant="primary" style={{ height: 32, fontSize: 11.5 }} onClick={onAct}>Conferma</Btn>}
      {!mobile && o.kind === 'conf' && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--color-success-text)', flexShrink: 0, marginRight: 4 }}/>}
      {!mobile && isReg && <span style={{ fontSize: 11.5, color: GH.mute, ...GH.num }}>{o.eur ? `${o.eur} €` : '—'}</span>}
      {mobile && <Icon name="chevron" size={15} color={GH.mute}/>}
    </div>
  );
};

// ── Sezione giorno. Ordine di lettura: da decidere → deciso → già accaduto. ──
const CalDay = ({ d, mobile, today, onAct }) => {
  const req = d.o.filter(x => x.kind === 'req'), conf = d.o.filter(x => x.kind === 'conf'), reg = d.o.filter(x => x.kind === 'reg');
  const empty = !d.o.length;
  return (
    <div style={{ padding: mobile ? '0' : '0 16px', borderTop: `1px solid ${GH.bd}`, background: today ? 'rgba(111,151,146,.05)' : 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: mobile ? '11px 0 6px' : '11px 0 6px' }}>
        <span style={{ fontSize: 15, color: today ? 'var(--color-primary)' : GH.ink, ...GH.serif }}>{d.dow} {d.d}</span>
        {today && <Eyebrow color="var(--color-primary)">oggi</Eyebrow>}
        <div style={{ flex: 1 }}/>
        {!!req.length && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-warning-text)' }}>{req.length} da confermare</span>}
        {!req.length && !empty && <span style={{ fontSize: 11, color: GH.mute, ...GH.num }}>{d.o.length} {d.o.length === 1 ? 'voce' : 'voci'}</span>}
        {empty && <span style={{ fontSize: 11, color: GH.mute }}>niente</span>}
      </div>
      {empty ? (
        <div style={{ fontSize: 11.5, color: GH.mute, padding: '0 0 11px', fontStyle: 'italic' }}>Nessuna richiesta, nessuna lavorazione.</div>
      ) : (
        <div style={{ paddingBottom: 9 }}>
          {[...req, ...conf].map((o, i) => <CalRow key={i} o={o} i={i} mobile={mobile} onAct={onAct}/>)}
          {!!reg.length && (
            <div style={{ marginTop: (req.length || conf.length) ? 7 : 0, paddingTop: 6, borderTop: `1px solid ${GH.bd}` }}>
              <Eyebrow style={{ marginBottom: 2 }}>registrato dal salone</Eyebrow>
              {reg.map((o, i) => <CalRow key={i} o={o} i={i} mobile={mobile}/>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Coda delle richieste: l'unica cosa che chiede un'azione. Sta nella spalla. ──
const CalQueue = ({ items, onAct }) => (
  <Panel eyebrow="Da confermare" title={items.length ? `${items.length} richieste in attesa` : 'Nessuna richiesta'} pad={items.length ? 0 : 0}
    right={items.length ? <span style={{ fontSize: 11, color: GH.mute }}>arrivano dall’app</span> : null}>
    {items.length ? items.map((o, i) => (
      <div key={i} style={{ padding: '11px 16px', borderTop: i ? `1px solid ${GH.bdSoft}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <PetAvatar size={30} tier="base"/>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 16, color: GH.ink, ...GH.serif }}>{o.pet}</span>
              {o.flag && <StateTag s={o.flag}/>}
            </div>
            <div style={{ fontSize: 11.5, color: GH.mute }}>{o.owner}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GH.ink, ...GH.num }}>{o.dayLabel}</div>
            <div style={{ marginTop: 3 }}><CalFascia f={o.fascia}/></div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: GH.ink, marginTop: 7 }}>{o.text}</div>
        {o.manto && <div style={{ fontSize: 11.5, color: 'var(--color-warning-text)', marginTop: 2 }}>{o.manto}{o.nota ? ` — «${o.nota}»` : ''}</div>}
        <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
          <Btn variant="primary" style={{ flex: 1 }} onClick={onAct}>Conferma e avvisa</Btn>
          <Btn variant="danger">Rifiuta</Btn>
        </div>
      </div>
    )) : (
      <EmptyState title="Nessuna richiesta in attesa." body="Le richieste arriveranno quando i clienti saranno stati invitati nell’area cliente."/>
    )}
  </Panel>
);

// ── Chiusura settimana: presenze e ritorni, NON denaro. Il denaro ha già una vista. ──
const CalWeekStrip = ({ reg, conf, att }) => (
  <Panel eyebrow="Questa settimana" title="Come è andata" pad={13}>
    <StatStrip items={[
      { k: 'Registrate', v: reg, note: 'a lavoro finito' },
      { k: 'Confermati', v: conf, note: 'con ora' },
      { k: 'In attesa', v: att, note: 'da decidere', fg: att ? 'var(--color-warning-text)' : GH.mute, tone: att ? 'var(--color-warning-bg)' : '#fff' },
    ]}/>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}` }}>
      <span style={{ fontSize: 11.5, color: GH.mute, textWrap: 'pretty' }}>Gli incassi restano dove sono già: <b>Report settimanali</b>.</span>
      <Btn style={{ height: 32, fontSize: 11.5 }} icon="arrow">Apri report</Btn>
    </div>
  </Panel>
);

// ── Navigatore settimana ──
const CalNav = ({ label, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <Btn style={{ height: 34, padding: '0 11px' }}>←</Btn>
    <span style={{ fontSize: 16, color: GH.ink, minWidth: 168, textAlign: 'center', ...GH.serif }}>{label}</span>
    <Btn style={{ height: 34, padding: '0 11px' }}>→</Btn>
    {right}
  </div>
);

// ── Striscia giorni, telefono. Bersaglio 54px, pallini = cosa c'è dentro. ──
const CalDayStrip = ({ days, sel }) => (
  <div style={{ display: 'flex', gap: 6, padding: '0 13px 11px' }}>
    {days.map((d, i) => {
      const on = i === sel, hasReq = d.o.some(x => x.kind === 'req');
      return (
        <button key={i} style={{ flex: 1, minWidth: 0, height: 54, borderRadius: GH.r.field, border: `1px solid ${on ? 'var(--color-primary)' : GH.bd}`, background: on ? 'var(--color-primary)' : '#fff', color: on ? '#fbf6f3' : GH.ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 0 }}>
          <span style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, opacity: .75 }}>{d.dow}</span>
          <span style={{ fontSize: 15, ...GH.num, ...GH.serif }}>{d.d}</span>
          <span style={{ display: 'flex', gap: 2, height: 5, alignItems: 'center' }}>
            {d.o.length ? <span style={{ width: 4, height: 4, borderRadius: 999, background: on ? 'rgba(251,246,243,.9)' : (hasReq ? 'var(--color-warning-text)' : GH.mute) }}/> : null}
          </span>
        </button>
      );
    })}
  </div>
);

Object.assign(window, { FASCIA, CalFascia, CalWhen, CalRow, CalDay, CalQueue, CalWeekStrip, CalNav, CalDayStrip });
