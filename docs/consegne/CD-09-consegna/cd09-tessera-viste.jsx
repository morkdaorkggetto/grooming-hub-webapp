// ═══════════════════════════════════════════════════════════
// CD-09 · VISTE — composte dall'inizio, perché l'inizio è la norma:
// per mesi la maggior parte dei cani avrà una o due visite su sei.
// ═══════════════════════════════════════════════════════════

const S = {
  inizio: { pet: 'Nina', breed: 'Shih Tzu', done: 1, of: 6, win: 12 },
  meta: { pet: 'Pepe', breed: 'Barboncino', done: 3, of: 6, win: 12 },
  raggiunto: { pet: 'Luna', breed: 'Barboncino', tier: 'bronze', done: 6, of: 12, win: 24, carry: true, foto: true },
  mano: { pet: 'Miele', breed: 'Golden Retriever', tier: 'bronze', done: 3, of: 12, win: 24 },
  oro: { pet: 'Kira', breed: 'Maltese', tier: 'gold', done: 41, of: 36, win: 36 },
  argento: { pet: 'Argo', breed: 'Labrador', tier: 'silver', done: 14, of: 36, win: 36 },
};

// Fuori dalla tessera sta l'AZIENDA; dentro sta il SERVIZIO. Grooming Hub è
// uno dei servizi di ZavaRoby pet station, e la tessera è sua.
const TopBar = () => (
  <div style={{ position: 'relative', padding: '4px 16px 14px', flexShrink: 0, textAlign: 'center' }}>
    <button style={{ position: 'absolute', left: 16, top: 4, width: 44, height: 44, borderRadius: 999, border: `1px solid ${GH.bd}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', color: GH.mute }}><Icon name="chevron-left" size={18}/></button>
    <div style={{ height: 44, display: 'grid', placeItems: 'center' }}>
      <div style={{ fontSize: 18, color: GH.ink, lineHeight: 1.15, ...GH.serifL }}>ZavaRoby pet station</div>
    </div>
  </div>
);

const TesseraPage = ({ s, invito }) => (
  <Phone375>
    <TopBar/>
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
      <Tessera s={s}/>
      <BigGesture primary icon="qr" sub="il codice a tutto schermo, da far leggere a noi">Mostra al banco</BigGesture>
      {invito && (
        <div style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '11px 13px', border: `1px dashed ${GH.bd}`, borderRadius: 14, background: '#fff' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--color-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="tessera" size={20} color="#fbf6f3" stroke={1.9}/></div>
          <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.45, textWrap: 'pretty' }}><b style={{ color: GH.ink }}>Tienila a portata.</b> Aggiungila alla schermata del telefono: si apre da qui, senza cercarla.</div>
        </div>
      )}
    </div>
    <div style={{ height: 18 }}/>
  </Phone375>
);

const TInizio = () => <TesseraPage s={S.inizio} invito/>;
const TMeta = () => <TesseraPage s={S.meta}/>;
const TRaggiunto = () => <TesseraPage s={S.raggiunto}/>;
const TMano = () => <TesseraPage s={S.mano}/>;
const TOro = () => <TesseraPage s={S.oro}/>;
const TArgento = () => <TesseraPage s={S.argento}/>;

// ── AL BANCO: il QR diventa il protagonista, e tutto il resto sparisce. ──
// Schermo bianco pieno: il web non può alzare la luminosità, ma un fondo
// bianco a tutto schermo È la luce più forte che lo schermo può emettere.
const TBanco = () => (
  <Phone375 bg="#ffffff">
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 16px 0' }}>
      <button style={{ height: 44, padding: '0 16px', borderRadius: 999, border: `1px solid ${GH.bd}`, background: '#fff', fontSize: 14, fontWeight: 650, color: GH.ink, cursor: 'pointer', fontFamily: 'inherit' }}>Chiudi</button>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 20px 40px' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.22em', fontWeight: 700, color: 'var(--color-primary)' }}>Grooming Hub</div>
      <FakeQR size={300} seed={4}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, color: '#000', lineHeight: 1, letterSpacing: '-.02em', ...GH.serifL }}>Nina</div>
        <div style={{ fontSize: 14, color: GH.mute, marginTop: 7 }}>Shih Tzu · Chiara Esposito</div>
      </div>
    </div>
  </Phone375>
);

// ── La Home: prima e dopo. La barra non cambia. ──
const HomeGhost = ({ label, h }) => (
  <div style={{ height: h, borderRadius: 18, border: `1px dashed ${GH.bd}`, display: 'grid', placeItems: 'center', fontSize: 11, color: GH.mute }}>{label}</div>
);
const HomeHead = () => (
  <div style={{ padding: '6px 18px 14px', textAlign: 'center' }}>
    <div style={{ fontSize: 18, color: GH.ink, ...GH.serifL }}>ZavaRoby pet station</div>
    <div style={{ fontSize: 25, color: GH.ink, marginTop: 12, ...GH.serifL }}>Buongiorno, Chiara</div>
  </div>
);
const HomePrima = () => (
  <Phone375>
    <HomeHead/>
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <HomeGhost label="prossimo appuntamento · invariato" h={96}/>
      <div style={{ padding: '14px 16px', background: 'var(--color-surface-main)', border: `1px solid ${GH.bd}`, borderRadius: 18, opacity: .7 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: GH.ink }}>Punti</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: GH.ink, marginTop: 3 }}>0 punti</div>
        <div style={{ fontSize: 12, color: GH.mute, marginTop: 3 }}>Si accumulano con le visite e con gli…</div>
      </div>
      <HomeGhost label="i cani · invariato" h={150}/>
    </div>
    <TabBar/>
  </Phone375>
);
const HomeDopo = () => (
  <Phone375>
    <HomeHead/>
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <HomeGhost label="prossimo appuntamento · invariato" h={96}/>
      <HomeStrip s={S.inizio}/>
      <HomeStrip s={S.raggiunto}/>
      <HomeGhost label="i cani · invariato" h={96}/>
    </div>
    <TabBar/>
  </Phone375>
);

Object.assign(window, { S, TopBar, TesseraPage, TInizio, TMeta, TRaggiunto, TMano, TOro, TArgento, TBanco, HomePrima, HomeDopo });
