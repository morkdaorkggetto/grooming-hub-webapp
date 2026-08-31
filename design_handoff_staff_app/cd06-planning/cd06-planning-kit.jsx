// ═══════════════════════════════════════════════════════════
// CD-06 · KIT PLANNING — il quadro sinottico della settimana.
// Grana: MEZZE GIORNATE, non ore. Cinque cani al giorno su tre postazioni
// sono un quinto della capienza: una griglia oraria sarebbe più precisione
// di quanta ne serva, e trasformerebbe il vuoto in un reticolo da riempire.
// Nessun colore nuovo. Nessuna rotazione locale sulle frecce.
// ═══════════════════════════════════════════════════════════

// ⚠ tenants.settings — la capienza è un dato del salone, non una costante.
// Passata da 2 a 3 stamattina: qui entra come parametro, mai scritta a mano.
const CAP = { postazioni: 3, mattina: [9, 13], pomeriggio: [13, 19], bagno: 45, taglio: 90 };

// ── L'interruttore di modo. Stessa posizione e stesso ruolo di CD-03: ──
// in testa al navigatore, prima delle frecce. Decidere e lavorare sono
// due distanze dalla stessa settimana, non due pagine.
const PlanSwitch = ({ modo }) => {
  const t = useTouch();
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden', background: '#fff' }}>
      {['Settimana', 'Giorno'].map(m => {
        const on = m.toLowerCase() === modo;
        return (
          <button key={m} style={{ height: t ? 46 : 34, padding: `0 ${t ? 18 : 14}px`, border: 'none', background: on ? 'var(--color-primary)' : 'transparent', color: on ? '#fbf6f3' : GH.mute, fontSize: 12.5, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>{m}</button>
        );
      })}
    </div>
  );
};

// ── APPUNTAMENTO — ha un'ora, e l'ora è la prima cosa. ──
const ApptChip = ({ a, mobile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minHeight: mobile ? 60 : 44, padding: '0 9px', background: '#fff', border: `1px solid ${GH.bd}`, borderLeft: '3px solid var(--color-primary)', borderRadius: 9, cursor: 'pointer' }}>
    <span style={{ fontSize: 13, color: GH.ink, minWidth: 38, ...GH.num, ...GH.serif }}>{a.h}</span>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 650, color: GH.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.pet}</div>
      <div style={{ fontSize: 10.5, color: GH.mute, ...GH.num }}>{a.svc} · {a.min}′</div>
    </div>
    {a.tag && <StateTag s={a.tag}/>}
  </div>
);

// ── RICHIESTA IN ATTESA — ha un giorno e una fascia, non un'ora. ──
// La capsula tratteggiata di CD-01 promette «da qualche parte qui dentro».
const ReqChip = ({ r, mobile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minHeight: mobile ? 60 : 44, padding: '0 9px', background: 'var(--color-warning-bg)', border: '1px dashed var(--color-warning-border)', borderRadius: 9, cursor: 'pointer' }}>
    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-warning-text)', border: '1px dashed var(--color-warning-text)', borderRadius: 999, padding: '2px 6px', whiteSpace: 'nowrap' }}>{r.fascia}</span>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 650, color: GH.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.pet}</div>
      <div style={{ fontSize: 10.5, color: 'var(--color-warning-text)' }}>da confermare</div>
    </div>
  </div>
);

// ── IL MARGINE — la risposta alla domanda 3. ──
// Non uno spazio vuoto: uno spazio TENUTO. Tratteggiato, con dentro
// scritto per chi è. Riempirlo è una decisione, non un progresso.
const Margine = ({ n, stretto }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minHeight: 38, padding: '0 9px', border: `1px dashed ${stretto ? 'var(--color-danger-text)' : 'rgba(111,151,146,.45)'}`, borderRadius: 9, background: stretto ? 'var(--color-danger-bg)' : 'var(--gh-tint)' }}>
    <Icon name="paw" size={14} color={stretto ? 'var(--color-danger-text)' : 'var(--color-primary)'} stroke={1.8}/>
    <span style={{ fontSize: 11, color: stretto ? 'var(--color-danger-text)' : GH.mute, lineHeight: 1.35 }}>
      {stretto ? 'poco spazio per chi entra' : <>tenuto per chi entra <b style={GH.num}>×{n}</b></>}
    </span>
  </div>
);

// ── LAVORAZIONI SENZA ORA — la risposta alla domanda 2. ──
// Non stanno in una fascia: appartengono al GIORNO. Quindi vivono nel
// piede della colonna, sotto la linea, e non hanno una posizione oraria.
// visits.date è di tipo `date`: la colonna resta muta e non si deduce.
const SenzaOra = ({ n, mobile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: mobile ? 44 : 36, padding: '0 9px', borderTop: `1px dashed ${GH.bd}`, background: 'var(--gh-absent)' }}>
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: Math.min(n, 6) }).map((_, i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: GH.mute, opacity: .75 }}/>
      ))}
    </div>
    <span style={{ fontSize: 11, color: GH.mute, lineHeight: 1.3 }}>
      {n === 0 ? 'nessuno senza appuntamento' : <><b style={GH.num}>{n}</b> {n === 1 ? 'entrato' : 'entrati'} senza appuntamento</>}
    </span>
  </div>
);

// ── Il vuoto toccabile: «prenota qui». Il gesto naturale al banco. ──
const Vuoto = ({ label }) => (
  <button style={{ minHeight: 38, border: `1px dashed ${GH.bdSoft}`, borderRadius: 9, background: 'transparent', cursor: 'pointer', color: GH.mute, fontSize: 11.5, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    <Icon name="plus" size={13} stroke={1.9}/>{label || 'prenota qui'}
  </button>
);

// ── La testa di colonna: giorno, e quanto è già preso. ──
const DayHead = ({ d, oggi, chiuso }) => (
  <div style={{ padding: '9px 10px 8px', borderBottom: `1px solid ${GH.bd}`, background: oggi ? 'var(--gh-bar)' : 'transparent' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 15, color: chiuso ? GH.mute : GH.ink, ...GH.serif }}>{d.dow}</span>
      <span style={{ fontSize: 12.5, color: GH.mute, ...GH.num }}>{d.n}</span>
      {oggi && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '.14em', marginLeft: 'auto' }}>oggi</span>}
    </div>
  </div>
);

// ── La fascia: mezza giornata. Nome, orario, e cosa c'è dentro. ──
const Fascia = ({ nome, ore, appts = [], reqs = [], margine, stretto, chiusa, mobile }) => (
  <div style={{ padding: mobile ? '9px 10px' : '8px 8px 9px', borderBottom: `1px solid ${GH.bdSoft}` }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 7 }}>
      <Eyebrow>{nome}</Eyebrow>
      <span style={{ fontSize: 9.5, color: GH.mute, ...GH.num }}>{ore}</span>
    </div>
    {chiusa ? (
      <div style={{ fontSize: 11.5, color: GH.mute, fontStyle: 'italic', padding: '9px 0' }}>chiuso</div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {reqs.map((r, i) => <ReqChip key={`r${i}`} r={r} mobile={mobile}/>)}
        {appts.map((a, i) => <ApptChip key={`a${i}`} a={a} mobile={mobile}/>)}
        {margine != null && <Margine n={margine} stretto={stretto}/>}
        {!mobile && <Vuoto/>}
      </div>
    )}
  </div>
);

Object.assign(window, { CAP, PlanSwitch, ApptChip, ReqChip, Margine, SenzaOra, Vuoto, DayHead, Fascia });
