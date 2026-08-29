// ═══════════════════════════════════════════════════════════
// CD-04 · VISTE — composte dal caso normale, che è: telefono, nessuna foto,
// zero progressione. La minoranza fortunata viene dopo.
// ═══════════════════════════════════════════════════════════

const CardBody = ({ pet, breed, foto, visite, da, tier, accesso, salone = 'Grooming Hub' }) => (
  <>
    <SalonMark salone={salone}/>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 22px 0', gap: 14 }}>
      <Medallion foto={foto} tier={tier}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30, color: GH.ink, lineHeight: 1.1, letterSpacing: '-.02em', ...GH.serifL }}>{pet}</div>
        <div style={{ fontSize: 14, color: GH.mute, marginTop: 4 }}>{breed}</div>
        {tier && tier !== 'base' && <div style={{ marginTop: 9 }}><TierMark tier={tier}/></div>}
      </div>
      <div style={{ width: 44, height: 1, background: GH.bd }}/>
      <RelationLine visite={visite} da={da}/>
    </div>
    <div style={{ padding: '22px 22px 20px', display: 'flex', flexDirection: 'column', gap: 9, marginTop: 'auto' }}>
      <BigGesture primary icon="whatsapp" sub="rispondiamo qui, non su moduli">Scrivici su WhatsApp</BigGesture>
      {accesso
        ? <BigGesture icon="arrow">Entra nella sua pagina</BigGesture>
        : <BigGesture icon="calendar" sub="visite, promemoria, richieste di appuntamento">Vedi le visite di {pet}</BigGesture>}
      <div style={{ fontSize: 11, color: GH.mute, textAlign: 'center', marginTop: 5, lineHeight: 1.5 }}>
        Questo cartoncino è di {salone}. Il codice sulla card apre solo questa pagina.
      </div>
    </div>
  </>
);

const CardNorma = () => (
  <Phone><CardShell><CardBody pet="Nina" breed="Shih Tzu" visite={3} da="marzo" tier="base"/></CardShell></Phone>
);

const CardFoto = () => (
  <Phone><CardShell><CardBody pet="Argo" breed="Labrador" foto visite={6} da="marzo" tier="silver"/></CardShell></Phone>
);

const CardPrima = () => (
  <Phone><CardShell><CardBody pet="Fido" breed="Pastore Tedesco" visite={0} tier="base"/></CardShell></Phone>
);

const CardAccesso = () => (
  <Phone><CardShell><CardBody pet="Luna" breed="Barboncino" visite={4} da="aprile" tier="base" accesso/></CardShell></Phone>
);

const CardLarga = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
    <CardShell wide>
      <div style={{ background: 'var(--color-surface-main)', border: `1px solid ${GH.bd}`, borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CardBody pet="Nina" breed="Shih Tzu" visite={3} da="marzo" tier="base"/>
      </div>
      <div style={{ fontSize: 11.5, color: GH.mute, textAlign: 'center', marginTop: 14, lineHeight: 1.5, textWrap: 'pretty' }}>
        A schermo largo la card <b>si centra</b>, non si divide in due colonne: è la stessa composizione dentro un cartoncino. Il telefono qui è il caso normale, il desktop è il caso raro — <b>l’opposto della regola del gestionale</b>.
      </div>
    </CardShell>
  </div>
);

// ── Il «prima», per confronto. Non è una proposta: è la pagina in circolazione. ──
const CardPrimaVeste = () => (
  <Phone>
    <div style={{ width: '100%', minHeight: '100%', background: '#fffaf6', fontFamily: 'var(--font-sans)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>Grooming Hub</div>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 104, height: 104, borderRadius: 999, background: '#f0e7de', display: 'grid', placeItems: 'center' }}>
          <Icon name="paw" size={40} color="#94a3b8"/>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>Nina</div>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>Shih Tzu</div>
      </div>
      <div style={{ background: '#ead7c5', borderRadius: 12, padding: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 9 }}>Livello Base · 3 visite</div>
        {[['Bronzo', '#cd7f32', 12], ['Argento', '#E5E7EB', 24], ['Oro', '#d4a017', 36]].map(([n, c, s]) => (
          <div key={n} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#1f2937' }}><span>{n}</span><span>3 / {s}</span></div>
            <div style={{ height: 7, background: '#F4E3A1', borderRadius: 999, marginTop: 3, overflow: 'hidden' }}>
              <div style={{ width: `${(3 / s) * 100}%`, height: '100%', background: c }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={{ height: 44, borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>Scrivi a Grooming Hub</button>
        <button style={{ height: 44, borderRadius: 10, border: '1px solid #EBC9A7', background: '#fff', color: '#1f2937', fontSize: 14, fontFamily: 'inherit' }}>Area riservata</button>
      </div>
    </div>
  </Phone>
);

Object.assign(window, { CardBody, CardNorma, CardFoto, CardPrima, CardAccesso, CardLarga, CardPrimaVeste });
