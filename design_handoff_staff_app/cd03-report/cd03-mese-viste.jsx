// ═══════════════════════════════════════════════════════════
// CD-03 · VISTE MESE — i mesi veri misurati sulla produzione.
// Composti dagli estremi: aprile (146 cani) e giugno (29), poi l'incompleto.
// ═══════════════════════════════════════════════════════════

const MESI = [
  { k: 'mar', kk: 'marzo 2026', n: 67, eur: 1611, g: 14, gg: 30 },
  { k: 'apr', kk: 'aprile 2026', n: 146, eur: 3547, g: 20, gg: 30 },
  { k: 'mag', kk: 'maggio 2026', n: 37, eur: 1065, g: 10, gg: 31 },
  { k: 'giu', kk: 'giugno 2026', n: 29, eur: 800, g: 10, gg: 30 },
  { k: 'lug', kk: 'luglio 2026', n: 110, eur: 3030, g: 23, gg: 31 },
  { k: 'ago', kk: 'agosto 2026', n: 67, eur: 1745, g: 11, gg: 31, parziale: 29 },
];

const M_APRILE = {
  ...MESI[1], prev: 1611, prevK: 'marzo',
  weeks: [
    { label: '1 – 5 aprile', g: 4, n: 22, eur: 520 },
    { label: '6 – 12 aprile', g: 5, n: 34, eur: 840 },
    { label: '13 – 19 aprile', g: 5, n: 33, eur: 810 },
    { label: '20 – 26 aprile', g: 4, n: 31, eur: 745 },
    { label: '27 – 30 aprile', g: 2, n: 26, eur: 632 },
  ],
};

const M_GIUGNO = {
  ...MESI[3], prev: 1065, prevK: 'maggio',
  weeks: [
    { label: '1 – 7 giugno', g: 3, n: 9, eur: 245 },
    { label: '8 – 14 giugno', g: 0, n: 0, eur: 0 },
    { label: '15 – 21 giugno', g: 3, n: 8, eur: 220 },
    { label: '22 – 28 giugno', g: 2, n: 6, eur: 165 },
    { label: '29 – 30 giugno', g: 2, n: 6, eur: 170 },
  ],
};

const M_AGOSTO = {
  ...MESI[5], prev: 3030, prevK: 'luglio', prevSpan: 2790,
  weeks: [
    { label: '1 – 2 agosto', g: 1, n: 9, eur: 235 },
    { label: '3 – 9 agosto', g: 2, n: 20, eur: 520 },
    { label: '10 – 16 agosto', g: 1, n: 1, eur: 20 },
    { label: '17 – 23 agosto', g: 5, n: 18, eur: 468 },
    { label: '24 – 29 agosto', g: 2, n: 19, eur: 502, corso: true },
  ],
};

const BANDS_M = [
  { k: 'fino a 19 €', n: 11 }, { k: '20 – 25 €', n: 74, hi: true }, { k: '26 – 29 €', n: 0 },
  { k: '30 – 35 €', n: 52, hi: true }, { k: 'oltre 35 €', n: 9 },
];

const MonthNav = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <UnitSwitch unit="mese"/>
    <div style={{ width: 1, height: 22, background: GH.bdSoft }}/>
    <Btn style={{ height: 34, padding: '0 11px' }}>←</Btn>
    <span style={{ fontSize: 16, color: GH.ink, minWidth: 122, textAlign: 'center', ...GH.serif }}>{label}</span>
    <Btn style={{ height: 34, padding: '0 11px' }}>→</Btn>
    <Btn style={{ height: 34 }}>Questo mese</Btn>
  </div>
);

const MeseDesktop = ({ m }) => {
  const max = Math.max(...m.weeks.map(w => w.eur), 0);
  const parz = !!m.parziale;
  const base = parz ? m.prevSpan : m.prev;
  const media = m.g ? Math.round(m.n / m.g) : 0;
  const sel = MESI.findIndex(x => x.k === m.k);
  return (
    <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      <Hero title="Come è andata" sub="Cani passati e incassato, mese per mese" right={<HeroBtn>← Dashboard</HeroBtn>}/>
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel pad={0} eyebrow="Mese" right={<MonthNav label={m.kk}/>}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${GH.bdSoft}` }}>
              <BigNum k="Incassato" v={eur(m.eur)} delta={delta(m.eur, base)}
                note={parz ? `primi ${m.parziale} giorni di ${m.prevK}: ${eur(m.prevSpan)}` : `${m.prevK} ${eur(m.prev)}`}/>
              <div style={{ width: 1, background: GH.bdSoft }}/>
              <BigNum k="Cani passati" v={m.n}
                note={`${m.g} giorni lavorati su ${parz ? m.parziale : m.gg} · ${media} cani al giorno`}/>
            </div>
            {parz && <div style={{ paddingTop: 12 }}><PartialNote giorni={m.parziale} tot={m.gg} prevSpan={m.prevSpan} prevFull={m.prev}/></div>}
            <div style={{ padding: '7px 16px 6px', background: GH.soft, borderBottom: `1px solid ${GH.bdSoft}`, display: 'flex', gap: 14 }}>
              <Eyebrow>Settimana</Eyebrow><Eyebrow>Giorni</Eyebrow><Eyebrow>Cani</Eyebrow>
              <div style={{ flex: 1 }}/><Eyebrow>Incassato</Eyebrow>
            </div>
            <div>{m.weeks.map((w, i) => <WeekRow key={i} w={w} max={max} i={i}/>)}</div>
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${GH.bd}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, color: GH.mute, textWrap: 'pretty' }}>
                Le settimane a cavallo di due mesi sono <b>tagliate al mese</b>: la prima riga di aprile parte dal 1°, non dal lunedì che cade a marzo. Così le righe sommano esattamente al numero grande. Aprendo la riga si vede <b>la settimana intera</b>, giorni di marzo compresi.
              </span>
            </div>
          </Panel>

          <Panel pad={0} eyebrow="Dentro il mese" title="Apri una settimana"
            right={<span style={{ fontSize: 11.5, color: GH.mute }}>tocca una riga qui sopra</span>}>
            <div style={{ padding: '13px 16px', fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
              Toccare una riga-settimana <b>passa al modo settimana su quella settimana</b>: le sette righe-giorno e l’elenco dei cani sono quelli che già conoscete. Il mese non contiene un secondo elenco — <b>è la stessa pagina a un’altra distanza</b>, e scendere di scala vuol dire cambiare unità, non aprire un pannello.
            </div>
          </Panel>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel pad={13} eyebrow="Nel tempo" title="I sei mesi che esistono">
            <MonthTrend months={MESI} sel={sel}/>
            <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
              <b>Sei mesi, non dodici.</b> La storia comincia il <span style={GH.num}>2 marzo 2026</span>: non disegno sei caselle vuote per far sembrare completa una storia breve. La striscia crescerà da sola. Il tratteggio su <b>ago</b> è il mese in corso.<br/><br/>
              <b>Aprile e giugno differiscono di cinque volte</b> — a settimane non si vedeva. Il salone ha stagioni, e questa è la distanza in cui compaiono.
            </div>
          </Panel>

          <Panel pad={13} eyebrow="Quanto si paga" title="Le due gobbe restano">
            <AmountSpread bands={BANDS_M}/>
            <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
              Il vuoto fra 26 e 29 € non cambia con l’unità: è la forma del listino, non del periodo. Dice <b>gli importi, non i servizi</b>.
            </div>
          </Panel>

          <Panel pad={13} eyebrow="Il confronto" title={`Contro ${m.prevK}`}>
            <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
              A mesi il confronto utile è <b>il mese scorso</b>. <b>«Lo stesso mese dell’anno prima» non esiste</b> e non esisterà fino a marzo 2027: non lo prometto e non lascio lo spazio dove starebbe.<br/><br/>
              {parz
                ? <>Per un mese in corso il paragone è <b>sullo stesso tratto</b>: primi {m.parziale} giorni contro primi {m.parziale} giorni. <b>Nessuna proiezione a fine mese</b> — sarebbe un numero inventato con l’aria di essere misurato.</>
                : <>Cinque righe per un mese di {m.gg} giorni: la prima e l’ultima sono <b>settimane tagliate</b> al confine del mese, non settimane corte.</>}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

const MeseAprile = () => <MeseDesktop m={M_APRILE}/>;
const MeseGiugno = () => <MeseDesktop m={M_GIUGNO}/>;
const MeseAgosto = () => <MeseDesktop m={M_AGOSTO}/>;

const MeseMobile = ({ m = M_AGOSTO }) => {
  const max = Math.max(...m.weeks.map(w => w.eur), 0);
  return (
    <Phone>
      <Hero compact title="Come è andata" sub={m.kk} right={<HeroBtn>←</HeroBtn>}/>
      <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'hidden' }}>
        <UnitSwitch unit="mese"/>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn style={{ flex: 1 }}>←</Btn><Btn style={{ flex: 2 }}>Questo mese</Btn><Btn style={{ flex: 1 }}>→</Btn>
        </div>
        <Panel pad={0}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${GH.bdSoft}` }}>
            <BigNum k="Incassato" v={eur(m.eur)} delta={delta(m.eur, m.prevSpan)} note={`primi ${m.parziale} gg di ${m.prevK}: ${eur(m.prevSpan)}`}/>
            <div style={{ width: 1, background: GH.bdSoft }}/>
            <BigNum k="Cani" v={m.n} note={`${m.g} giorni lavorati`}/>
          </div>
          <div>{m.weeks.map((w, i) => <WeekRow key={i} w={w} max={max} i={i} mobile/>)}</div>
        </Panel>
        <Panel pad={11} eyebrow="Nel tempo" title="I sei mesi">
          <MonthTrend months={MESI} sel={5}/>
        </Panel>
      </div>
    </Phone>
  );
};

Object.assign(window, { MESI, M_APRILE, M_GIUGNO, M_AGOSTO, BANDS_M, MonthNav, MeseDesktop, MeseAprile, MeseGiugno, MeseAgosto, MeseMobile });
