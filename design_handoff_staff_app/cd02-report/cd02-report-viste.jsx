// ═══════════════════════════════════════════════════════════
// CD-02 · VISTE REPORT — composte partendo dai due estremi, come chiede il brief:
// la settimana da 1 visita, la settimana da 58, la settimana futura vuota.
// La settimana media viene per ultima, perché è la più facile.
// ═══════════════════════════════════════════════════════════

// ⚠ visits.treatments è un diario: dentro ci sono anche le assenze. Verbatim, sempre.
const W_MEDIA = {
  label: '17 – 23 agosto 2026', prev: 402, eur: 468, n: 18,
  days: [
    { dow: 'lun', d: '17', n: 4, eur: 100 },
    { dow: 'mar', d: '18', n: 6, eur: 160 },
    { dow: 'mer', d: '19', n: 3, eur: 70 },
    { dow: 'gio', d: '20', n: 2, eur: 60 },
    { dow: 'ven', d: '21', n: 3, eur: 78 },
    { dow: 'sab', d: '22', n: 0, eur: 0 },
    { dow: 'dom', d: '23', n: 0, eur: 0, chiuso: true },
  ],
  visits: [
    { day: 'lunedì 17', items: [
      { pet: 'Luna', owner: 'Chiara Esposito', text: 'bagnetto e taglio', eur: 30 },
      { pet: 'Nina', owner: 'Rosa Pagano', text: 'bagnetto', eur: 20 },
      { pet: 'Pepe', owner: 'Anna Verde', text: 'bagnetto', eur: 20 },
      { pet: 'Kira', owner: 'Luca Amato', text: 'taglio', eur: 30 },
    ] },
    { day: 'martedì 18', items: [
      { pet: 'Argo', owner: 'Fabio Cirillo', text: 'taglio', eur: 30 },
      { pet: 'Briciola', owner: 'Serena Ferrara', text: 'bagnetto (molto infeltrita, ci è voluto il doppio)', eur: 25, issue: 'nodi' },
      { pet: 'Zoe', owner: 'Marta Ievoli', text: 'ha saltato l’appuntamento senza avvisare', eur: 0, assenza: true, issue: 'no-show' },
      { pet: 'Miele', owner: 'Davide Rullo', text: 'bagnetto', eur: 20 },
      { pet: 'Rocky', owner: 'Gennaro Ruggiero', text: 'bagnetto (paga 15 euro perché è la prima volta)', eur: 15 },
      { pet: 'Otto', owner: 'Sara Guida', text: 'taglio', eur: 30 },
    ] },
    { day: 'mercoledì 19', items: [
      { pet: 'Bella', owner: 'Ciro Palma', text: 'bagnetto', eur: 20 },
      { pet: 'Nuvola', owner: 'Ilaria Renna', text: 'appuntamento rimandato per ciclo', eur: 0, assenza: true },
      { pet: 'Ettore', owner: 'Paolo Sasso', text: 'bagnetto e unghie', eur: 25 },
    ] },
  ],
};

const W_UNA = {
  label: '10 – 16 agosto 2026', prev: 468, eur: 20, n: 1,
  days: [
    { dow: 'lun', d: '10', n: 0, eur: 0, chiuso: true }, { dow: 'mar', d: '11', n: 0, eur: 0, chiuso: true },
    { dow: 'mer', d: '12', n: 1, eur: 20 }, { dow: 'gio', d: '13', n: 0, eur: 0, chiuso: true },
    { dow: 'ven', d: '14', n: 0, eur: 0, chiuso: true }, { dow: 'sab', d: '15', n: 0, eur: 0, chiuso: true },
    { dow: 'dom', d: '16', n: 0, eur: 0, chiuso: true },
  ],
  visits: [{ day: 'mercoledì 12', items: [{ pet: 'Luna', owner: 'Chiara Esposito', text: 'bagnetto veloce prima della chiusura', eur: 20 }] }],
};

const W_PIENA = {
  label: '25 – 31 maggio 2026', prev: 890, eur: 1495, n: 58,
  days: [
    { dow: 'lun', d: '25', n: 9, eur: 230 }, { dow: 'mar', d: '26', n: 11, eur: 285 },
    { dow: 'mer', d: '27', n: 8, eur: 200 }, { dow: 'gio', d: '28', n: 12, eur: 320 },
    { dow: 'ven', d: '29', n: 14, eur: 370 }, { dow: 'sab', d: '30', n: 4, eur: 90 },
    { dow: 'dom', d: '31', n: 0, eur: 0, chiuso: true },
  ],
  visits: [
    { day: 'lunedì 25', items: [
      { pet: 'Luna', owner: 'Chiara Esposito', text: 'bagnetto', eur: 20 },
      { pet: 'Argo', owner: 'Fabio Cirillo', text: 'taglio', eur: 30 },
      { pet: 'Nina', owner: 'Rosa Pagano', text: 'bagnetto', eur: 20 },
      { pet: 'Kira', owner: 'Luca Amato', text: 'taglio', eur: 30 },
      { pet: 'Pepe', owner: 'Anna Verde', text: 'bagnetto', eur: 20 },
      { pet: 'Otto', owner: 'Sara Guida', text: 'bagnetto', eur: 20 },
      { pet: 'Bella', owner: 'Ciro Palma', text: 'taglio', eur: 30 },
      { pet: 'Zoe', owner: 'Marta Ievoli', text: 'bagnetto', eur: 20 },
      { pet: 'Ettore', owner: 'Paolo Sasso', text: 'taglio', eur: 40 },
    ] },
    { day: 'martedì 26', items: [
      { pet: 'Miele', owner: 'Davide Rullo', text: 'bagnetto', eur: 20 },
      { pet: 'Nuvola', owner: 'Ilaria Renna', text: 'taglio', eur: 30 },
      { pet: 'Briciola', owner: 'Serena Ferrara', text: 'bagnetto', eur: 20 },
      { pet: 'Rocky', owner: 'Gennaro Ruggiero', text: 'non è venuto', eur: 0, assenza: true, issue: 'no-show' },
    ] },
  ],
};

const W_FUTURA = { label: '31 ago – 6 settembre 2026', futura: true, prev: 468, eur: 0, n: 0,
  days: [['lun', '31'], ['mar', '1'], ['mer', '2'], ['gio', '3'], ['ven', '4'], ['sab', '5'], ['dom', '6']].map(([dow, d]) => ({ dow, d, n: 0, eur: 0 })), visits: [] };

// 12 settimane per la striscia di andamento (ultima = quella letta)
const TREND = [312, 640, 455, 380, 720, 505, 268, 890, 1495, 402, 20, 468].map((eur, i) => ({ eur, label: `sett. ${i + 1}` }));

const BANDS = [
  { k: 'fino a 19 €', n: 49 }, { k: '20 – 25 €', n: 226, hi: true }, { k: '26 – 29 €', n: 0 },
  { k: '30 – 35 €', n: 150, hi: true }, { k: 'oltre 35 €', n: 31 },
];

const delta = (a, b) => b ? Math.round(((a - b) / b) * 100) : 0;

// ── Guscio desktop ──
const ReportDesktop = ({ w, state }) => {
  const max = Math.max(...w.days.map(d => d.eur), 0);
  const media = w.n ? Math.round(w.eur / w.n) : 0;
  const vuota = !w.n;
  return (
    <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      <Hero title="Come è andata" sub="Cani passati e incassato, settimana per settimana"
        right={<div style={{ display: 'flex', gap: 8 }}><HeroBtn>← Dashboard</HeroBtn></div>}/>
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel pad={0} eyebrow="Settimana" right={<WeekNav label={w.label} futura={w.futura}/>}>
            {w.futura ? (
              <EmptyState title="Questa settimana non è ancora arrivata."
                body="Il report racconta il lavoro già fatto: si riempirà da solo mano a mano che registrate le lavorazioni."
                action={<Btn icon="arrow">Torna a questa settimana</Btn>}/>
            ) : state === 'load' ? (
              <div style={{ padding: '4px 0' }}>{[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} i={i}/>)}</div>
            ) : (
              <>
                <div style={{ display: 'flex', borderBottom: `1px solid ${GH.bdSoft}` }}>
                  <BigNum k="Incassato" v={eur(w.eur)} delta={delta(w.eur, w.prev)} note={`la scorsa ${eur(w.prev)}`}/>
                  <div style={{ width: 1, background: GH.bdSoft }}/>
                  <BigNum k="Cani passati" v={w.n} note={vuota ? 'nessuno questa settimana' : `${media} € a cane in media`}/>
                </div>
                {vuota ? (
                  <EmptyState title="Questa settimana non è passato nessuno."
                    body="Capita nei periodi di chiusura. La settimana resta qui, con i suoi sette giorni: non è un errore."/>
                ) : null}
                <div>{w.days.map((d, i) => <DayBar key={i} d={d} max={max} i={i} chiuso={d.chiuso}/>)}</div>
              </>
            )}
          </Panel>

          {!w.futura && !!w.visits.length && (
            <Panel pad={0} eyebrow="I cani passati" title={`${w.n} ${w.n === 1 ? 'visita registrata' : 'visite registrate'}`}
              right={w.n > 20 ? <span style={{ fontSize: 11.5, color: GH.mute }}>raggruppate per giorno</span> : null}>
              {w.visits.map((g, gi) => (
                <div key={gi}>
                  {w.n > 6 && <DayHead d={g.day} n={g.items.length} tot={g.items.reduce((s, v) => s + v.eur, 0)}/>}
                  {g.items.map((v, i) => <VisitLine key={i} v={v} i={w.n > 6 ? i : gi + i}/>)}
                </div>
              ))}
              {w.n > 20 && (
                <div style={{ padding: '11px 16px', borderTop: `1px solid ${GH.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 12, color: GH.mute }}>Restano {w.n - w.visits.reduce((s, g) => s + g.items.length, 0)} visite negli altri giorni.</span>
                  <Btn style={{ height: 34 }}>Mostra tutte</Btn>
                </div>
              )}
            </Panel>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel pad={13} eyebrow="Nel tempo" title="Le ultime dodici settimane">
            <TrendStrip weeks={TREND} sel={11}/>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${GH.bdSoft}` }}>
              <span style={{ fontSize: 11.5, color: GH.mute, textWrap: 'pretty' }}>Media <b style={GH.num}>472 €</b> · massimo <b style={GH.num}>1.495 €</b> a fine maggio</span>
            </div>
            <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 7, textWrap: 'pretty' }}>Nessun asse e nessuna griglia: serve a vedere <b>la forma</b>, non a leggere valori. Per quelli c’è la settimana aperta.</div>
          </Panel>

          <Panel pad={13} eyebrow="Quanto si paga" title="Gli importi hanno due gobbe">
            <AmountSpread bands={BANDS}/>
            <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
              Il vuoto fra 26 e 29 € è la prova che si vendono <b>due cose</b>: il bagno intorno a 20 €, il taglio intorno a 30 €. <b>Questo dice gli importi, non i servizi</b> — «12 bagni e 6 tagli» sarebbe un numero inventato: i trattamenti sono scritti a mano.
            </div>
          </Panel>

          {!w.futura && (
            <Panel pad={13} eyebrow="Le note del salone" title={state === 'piena' ? '2 annotazioni' : '3 annotazioni'}>
              <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.5, textWrap: 'pretty' }}>
                Le righe con il pallino portano una nota scritta da voi. Alcune raccontano <b>un’assenza, non un lavoro</b>: restano in elenco a 0 €, perché sono successe.
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

const RepMedia = () => <ReportDesktop w={W_MEDIA} state="media"/>;
const RepUna = () => <ReportDesktop w={W_UNA} state="una"/>;
const RepPiena = () => <ReportDesktop w={W_PIENA} state="piena"/>;
const RepFutura = () => <ReportDesktop w={W_FUTURA} state="futura"/>;
const RepLoad = () => <ReportDesktop w={W_MEDIA} state="load"/>;

// ── Telefono: la settimana intera ci sta, il dettaglio si apre ──
const RepMobile = ({ w = W_MEDIA }) => {
  const max = Math.max(...w.days.map(d => d.eur), 0);
  return (
    <Phone>
      <Hero compact title="Come è andata" sub={w.label} right={<HeroBtn>←</HeroBtn>}/>
      <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn style={{ flex: 1 }}>←</Btn><Btn style={{ flex: 2 }}>Questa settimana</Btn><Btn style={{ flex: 1 }}>→</Btn>
        </div>
        <Panel pad={0}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${GH.bdSoft}` }}>
            <BigNum k="Incassato" v={eur(w.eur)} delta={delta(w.eur, w.prev)} note={`la scorsa ${eur(w.prev)}`}/>
            <div style={{ width: 1, background: GH.bdSoft }}/>
            <BigNum k="Cani" v={w.n} note={`${Math.round(w.eur / w.n)} € a cane`}/>
          </div>
          <div>{w.days.map((d, i) => <DayBar key={i} d={d} max={max} i={i} mobile chiuso={d.chiuso}/>)}</div>
        </Panel>
        <Panel pad={0} eyebrow="I cani passati" title={`${w.n} visite`} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {w.visits[1].items.slice(0, 4).map((v, i) => <VisitLine key={i} v={v} i={i} mobile/>)}
        </Panel>
      </div>
    </Phone>
  );
};

Object.assign(window, { W_MEDIA, W_UNA, W_PIENA, W_FUTURA, TREND, BANDS, delta, ReportDesktop, RepMedia, RepUna, RepPiena, RepFutura, RepLoad, RepMobile });
