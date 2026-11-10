// ═══════════════════════════════════════════════════════════
// CD-12 · KIT — il calendario del mese.
// Sostituisce DesiredDateStrip: un mese per volta, frecce, limite del salone.
// Regola di fondo: NON è un sistema di posti liberi. Tutti i giorni che si
// possono chiedere hanno lo stesso aspetto; nessun colore dice «libero» o
// «occupato». Le regole stanno UNA volta, sotto la griglia, non su ogni casella.
// Nessun colore nuovo.
// ═══════════════════════════════════════════════════════════

// ⚠ impostazioni del salone: niente numeri scritti nel componente.
const SAL12 = {
  mesiAvanti: 2,                          // Davide può cambiarlo
  preavvisoGg: 7,
  chiusoDow: [0],                          // domenica
  soloPomDow: [1],                         // lunedì: mattina chiusa
  pieni: [[new Date(2026, 11, 21), new Date(2027, 0, 6)]],  // ⚠ dato del salone
};
const OGGI12 = new Date(2026, 10, 10);

const MESI12 = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const DOW12 = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const sameD = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayN = d => Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
const limite12 = (oggi, s = SAL12) => addMonths(oggi, s.mesiAvanti);
const inPieno = (d, s = SAL12) => s.pieni.some(([a, b]) => dayN(d) >= dayN(a) && dayN(d) <= dayN(b));
const dataLunga = d => `${DOW12[d.getDay()]} ${d.getDate()} ${MESI12[d.getMonth()]}`;

// ── Il primo mese mostrato. ──
// Di norma il mese corrente. Se nel mese corrente restano MENO DI 7 giorni
// che si possono chiedere, si apre sul mese dopo: altrimenti la prima cosa
// che il cliente vede è una griglia quasi tutta spenta.
const primoMese = (oggi, s = SAL12) => {
  const fine = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);
  let n = 0;
  for (let d = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 1); d <= fine; d.setDate(d.getDate() + 1)) {
    if (!s.chiusoDow.includes(d.getDay())) n++;
  }
  return n < 7 ? { y: oggi.getFullYear(), m: oggi.getMonth() + 1 } : { y: oggi.getFullYear(), m: oggi.getMonth() };
};

const stato12 = (d, oggi, s = SAL12) => {
  if (dayN(d) <= dayN(oggi)) return 'passato';
  if (s.chiusoDow.includes(d.getDay())) return 'chiuso';
  if (dayN(d) > dayN(limite12(oggi, s))) return 'oltre';
  return 'si';
};

// 42 caselle, SEMPRE sei righe: l'altezza non cambia tra un mese e l'altro,
// così fasce e avvisi sotto non saltano quando si tocca una freccia.
const celle12 = (y, m) => {
  const off = (new Date(y, m, 1).getDay() + 6) % 7;
  const n = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, i) => (i >= off && i < off + n) ? new Date(y, m, i - off + 1) : null);
};

// ── Una casella. 44 di altezza (54 sul banco largo), il numero in un tondo. ──
const Giorno12 = ({ d, oggi, scelto, h }) => {
  if (!d) return <span style={{ height: h }}/>;
  const st = stato12(d, oggi);
  const on = st === 'si';
  const sel = on && sameD(d, scelto);
  const pieno = on && inPieno(d);
  const eOggi = sameD(d, oggi);
  const t = Math.min(h - 4, 42);
  return (
    <button disabled={!on} style={{ height: h, border: 'none', background: 'transparent', padding: 0, display: 'grid', placeItems: 'center', cursor: on ? 'pointer' : 'default', fontFamily: 'var(--font-sans)' }}>
      <span style={{ position: 'relative', width: t, height: t, borderRadius: 999, display: 'grid', placeItems: 'center', background: sel ? 'var(--color-primary-hover)' : 'transparent', color: sel ? '#fbf6f3' : on ? GH.ink : GH.mute, opacity: on ? 1 : st === 'oltre' ? .32 : .45, fontSize: 15, fontWeight: sel ? 700 : on ? 600 : 500, ...GH.num }}>
        {d.getDate()}
        {eOggi && <span style={{ position: 'absolute', bottom: 4, width: 14, height: 2, borderRadius: 2, background: 'var(--color-primary)' }}/>}
        {pieno && <span style={{ position: 'absolute', bottom: 5, width: 5, height: 5, borderRadius: 999, background: sel ? '#fbf6f3' : 'var(--color-warning-text)' }}/>}
      </span>
    </button>
  );
};

const Freccia12 = ({ dir, off }) => (
  <button disabled={off} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${GH.bd}`, background: 'var(--color-surface-main)', display: 'grid', placeItems: 'center', cursor: off ? 'default' : 'pointer', opacity: off ? .35 : 1 }}>
    <Icon name={dir === 'prev' ? 'chevron-left' : 'chevron'} size={20} color={GH.ink} stroke={2}/>
  </button>
);

// ── IL CALENDARIO ──
// Testata 44 | mese | 44 · riga dei giorni · 6 righe · una riga di regole.
const Calendario12 = ({ y, m, oggi = OGGI12, scelto, h = 44, bordo = true }) => {
  const lim = limite12(oggi);
  const pm = primoMese(oggi);
  const prevOff = y * 12 + m <= oggi.getFullYear() * 12 + oggi.getMonth();
  const nextOff = y * 12 + m >= lim.getFullYear() * 12 + lim.getMonth();
  const cells = celle12(y, m);
  const haPieni = cells.some(d => d && stato12(d, oggi) === 'si' && inPieno(d));
  const meseLimite = y === lim.getFullYear() && m === lim.getMonth();
  return (
    <div style={{ background: 'var(--color-surface-main)', border: bordo ? `1px solid ${GH.bd}` : 'none', borderRadius: 18, padding: bordo ? '10px 12px 10px' : 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center', marginBottom: 4 }}>
        <Freccia12 dir="prev" off={prevOff}/>
        <div style={{ textAlign: 'center', fontSize: 19, color: GH.ink, ...GH.serifL }}>{MESI12[m]} {y}</div>
        <Freccia12 dir="next" off={nextOff}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 2 }}>
        {['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'].map((g, i) => (
          <span key={g} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: GH.mute, opacity: i === 6 ? .5 : 1, height: 18, lineHeight: '18px' }}>{g}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {cells.map((d, i) => <Giorno12 key={i} d={d} oggi={oggi} scelto={scelto} h={h}/>)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, rowGap: 4, marginTop: 6, paddingTop: 7, borderTop: `1px solid ${GH.bdSoft}`, fontSize: 11.5, color: GH.mute }}>
        <span><b style={{ color: GH.ink }}>lun</b> solo pomeriggio</span>
        <span><b style={{ color: GH.ink }}>dom</b> chiuso</span>
        {haPieni && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--color-warning-text)' }}/>periodo pieno</span>}
        {meseLimite && <span style={{ width: '100%', textAlign: 'center' }}>Si può chiedere fino a {dataLunga(lim)}.</span>}
      </div>
    </div>
  );
};

// ── Sotto il calendario: la data in parole, e gli avvisi della data. ──
// Gli avvisi compaiono SOLO a data scelta (come oggi), legati a lei.
const Avvisi12 = ({ scelto, oggi = OGGI12 }) => {
  if (!scelto) return (
    <div style={{ fontSize: 13, color: GH.mute, textAlign: 'center', padding: '2px 0' }}>Tocca il giorno che ti andrebbe bene.</div>
  );
  const pieno = inPieno(scelto);
  const corto = dayN(scelto) - dayN(oggi) < SAL12.preavvisoGg;
  const riga = (k, b, t) => (
    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 40, padding: '8px 12px', borderRadius: 12, background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)' }}>
      <Icon name={k === 'pieno' ? 'calendar' : 'clock'} size={16} color="var(--color-warning-text)" stroke={2}/>
      <span style={{ fontSize: 13, color: 'var(--color-warning-text)', lineHeight: 1.35 }}><b>{b}</b> {t}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ textAlign: 'center', fontSize: 15, color: GH.ink, ...GH.serif }}>Hai scelto {dataLunga(scelto)}</div>
      {corto && riga('corto', 'Sei un po’ a corto di preavviso.', 'Proviamo lo stesso.')}
      {pieno && riga('pieno', 'Periodo pieno.', 'Potremmo proporti un altro giorno.')}
    </div>
  );
};

// ── Le fasce. Il lunedì la mattina si spegne, e dice perché. ──
const Fasce12 = ({ scelto, fascia }) => {
  const lun = scelto && SAL12.soloPomDow.includes(scelto.getDay());
  const f = [['mat', 'Mattina'], ['pom', 'Pomeriggio'], ['ug', 'Per me è uguale']];
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: GH.mute, marginBottom: 6, textAlign: 'center' }}>Mattina o pomeriggio?</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {f.map(([k, l]) => {
          const off = lun && k === 'mat';
          const on = !off && fascia === k;
          return (
            <div key={k} style={{ minHeight: 54, borderRadius: 12, border: off ? `1px dashed ${GH.bd}` : on ? '2px solid var(--color-primary)' : `1px solid ${GH.bd}`, background: on ? 'var(--gh-tint)' : off ? 'transparent' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 4px', textAlign: 'center' }}>
              <span style={{ fontSize: 13.5, fontWeight: 650, color: off ? GH.mute : GH.ink, lineHeight: 1.2, textWrap: 'balance' }}>{l}</span>
              {off && <span style={{ fontSize: 10.5, color: GH.mute, marginTop: 2 }}>chiusa il lunedì</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Il pulsante fisso di GH-115: grigio + cosa manca, o pieno. ──
const Invia12 = ({ manca }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--color-surface-main)', borderTop: `1px solid ${GH.bdSoft}`, padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 4 }}>
    {manca && <div style={{ textAlign: 'center', fontSize: 12.5, color: GH.mute }}>Manca {manca}</div>}
    <button style={{ height: 54, borderRadius: 14, border: 'none', background: manca ? 'var(--color-border)' : 'var(--color-primary-hover)', color: manca ? GH.mute : '#fbf6f3', fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Invia la richiesta</button>
  </div>
);

// ── Il passo 3, a 375. ──
const Passo3 = ({ y, m, scelto, fascia, manca, oggi = OGGI12, h = 812 }) => (
  <div style={{ width: 375, height: h, borderRadius: 28, overflow: 'hidden', background: GH.page, boxShadow: '0 18px 44px rgba(43,37,37,.16)', fontFamily: 'var(--font-sans)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 24, flexShrink: 0 }}/>
    <div style={{ height: 56, padding: '0 16px', display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center', flexShrink: 0 }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${GH.bd}`, background: 'var(--color-surface-main)', display: 'grid', placeItems: 'center' }}><Icon name="chevron-left" size={20} color={GH.ink} stroke={2}/></span>
      <div style={{ textAlign: 'center', fontSize: 17, color: GH.ink, ...GH.serifL }}>Quando ce lo porti?</div>
      <span/>
    </div>
    <div style={{ padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Passo 3 di 4</div>
        <div style={{ fontSize: 22, color: GH.ink, marginTop: 2, ...GH.serifL }}>Quando ti andrebbe bene?</div>
        <div style={{ fontSize: 12.5, color: GH.mute, marginTop: 2, lineHeight: 1.45 }}>È un desiderio: l’ora te la conferma il salone su WhatsApp.</div>
      </div>
      <Calendario12 y={y} m={m} oggi={oggi} scelto={scelto}/>
      <Avvisi12 scelto={scelto} oggi={oggi}/>
      <Fasce12 scelto={scelto} fascia={fascia}/>
    </div>
    <Invia12 manca={manca}/>
  </div>
);

// ── Il foglio di PendingRequest (CD-11): lo stesso calendario. ──
const Foglio12 = ({ y, m, scelto, fascia, motivo }) => (
  <div style={{ width: 375, height: 812, borderRadius: 28, overflow: 'hidden', background: GH.page, boxShadow: '0 18px 44px rgba(43,37,37,.16)', fontFamily: 'var(--font-sans)', position: 'relative' }}>
    <div style={{ padding: '90px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ height: 56, borderRadius: 14, background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)' }}/>
      <div style={{ height: 300, borderRadius: 22, background: 'var(--color-surface-main)', border: `1px solid ${GH.bd}` }}/>
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(43,37,37,.42)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: 'var(--color-surface-main)', borderRadius: '22px 22px 0 0', padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: GH.bd, margin: '0 auto 2px' }}/>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 21, color: GH.ink, ...GH.serifL }}>Scegli un’altra data</div>
          <div style={{ fontSize: 12.5, color: GH.mute, marginTop: 4 }}>{motivo}</div>
        </div>
        <Calendario12 y={y} m={m} scelto={scelto} h={40} bordo={false}/>
        <Avvisi12 scelto={scelto}/>
        <Fasce12 scelto={scelto} fascia={fascia}/>
        <button style={{ height: 54, borderRadius: 14, border: 'none', background: scelto && fascia ? 'var(--color-primary-hover)' : 'var(--color-border)', color: scelto && fascia ? '#fbf6f3' : GH.mute, fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Invia la richiesta</button>
        <button style={{ height: 40, border: 'none', background: 'transparent', color: GH.mute, fontSize: 14, fontWeight: 650, fontFamily: 'var(--font-sans)' }}>Annulla</button>
      </div>
    </div>
  </div>
);

// ── A 1365: il passo 3 nella colonna del modulo, accanto al riepilogo. ──
const Riga12 = ({ k, v, vuoto }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderTop: `1px solid ${GH.bdSoft}` }}>
    <span style={{ fontSize: 13, color: GH.mute }}>{k}</span>
    <span style={{ fontSize: 13.5, fontWeight: 650, color: vuoto ? GH.mute : GH.ink, textAlign: 'right' }}>{v}</span>
  </div>
);
const Desktop12 = ({ y, m, scelto, fascia }) => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 64, borderBottom: `1px solid ${GH.bdSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: GH.ink, ...GH.serifL }}>ZavaRoby pet station</div>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0,640px) 360px', gap: 32, justifyContent: 'center', padding: '28px 32px', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['1 · Per chi', '2 · Di cosa ha bisogno'].map(t => (
          <div key={t} style={{ height: 52, borderRadius: 14, border: `1px solid ${GH.bd}`, background: 'var(--color-surface-main)', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 14, color: GH.mute }}>{t} <Icon name="check" size={16} color="var(--color-primary)" style={{ marginLeft: 'auto' }}/></div>
        ))}
        <div style={{ borderRadius: 18, border: `1px solid ${GH.bd}`, background: 'var(--color-surface-main)', padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Passo 3 di 4</div>
            <div style={{ fontSize: 24, color: GH.ink, marginTop: 4, ...GH.serifL }}>Quando ti andrebbe bene?</div>
            <div style={{ fontSize: 13, color: GH.mute, marginTop: 4 }}>È un desiderio: l’ora te la conferma il salone su WhatsApp.</div>
          </div>
          <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Calendario12 y={y} m={m} scelto={scelto} h={50}/>
            <Avvisi12 scelto={scelto}/>
            <Fasce12 scelto={scelto} fascia={fascia}/>
          </div>
        </div>
        <div style={{ height: 52, borderRadius: 14, border: `1px dashed ${GH.bd}`, display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 14, color: GH.mute }}>4 · Due righe per noi</div>
      </div>
      <div style={{ borderRadius: 18, border: `1px solid ${GH.bd}`, background: 'var(--color-surface-main)', padding: '18px 20px 20px', position: 'sticky', top: 0 }}>
        <div style={{ fontSize: 18, color: GH.ink, marginBottom: 6, ...GH.serifL }}>La tua richiesta</div>
        <Riga12 k="Per" v="Rumba"/>
        <Riga12 k="Bisogno" v="Bagno"/>
        <Riga12 k="Quando" v={scelto ? dataLunga(scelto) : 'da scegliere'} vuoto={!scelto}/>
        <Riga12 k="Fascia" v={fascia === 'pom' ? 'pomeriggio' : fascia === 'mat' ? 'mattina' : fascia === 'ug' ? 'per me è uguale' : 'da scegliere'} vuoto={!fascia}/>
        <button style={{ marginTop: 14, width: '100%', height: 54, borderRadius: 14, border: 'none', background: 'var(--color-primary-hover)', color: '#fbf6f3', fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Invia la richiesta</button>
      </div>
    </div>
  </div>
);

Object.assign(window, { SAL12, OGGI12, MESI12, primoMese, stato12, celle12, limite12, inPieno, dataLunga, Giorno12, Freccia12, Calendario12, Avvisi12, Fasce12, Invia12, Passo3, Foglio12, Desktop12 });
