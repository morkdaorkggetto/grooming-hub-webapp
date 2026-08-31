// ═══════════════════════════════════════════════════════════
// CD-05 · VISTE — composte da zero, una, due. Il quattro viene per ultimo:
// con 1,6 visite di media per cane, la galleria piena è il caso raro.
// ═══════════════════════════════════════════════════════════

const SHOTS4 = [
  { d: '18 agosto', rel: 'due settimane fa' },
  { d: '2 luglio', rel: 'un mese e mezzo fa' },
  { d: '14 maggio', rel: 'tre mesi fa' },
  { d: '28 marzo', rel: 'cinque mesi fa' },
];
const SHOTS1 = [{ d: '18 agosto', rel: 'due settimane fa' }];
const SHOTS2 = SHOTS4.slice(0, 2);

// ═══ APP CLIENTI · la scheda del cane a /u/pet/:id ═══
// Protagonista: il ritratto del proprietario. Il riconoscimento è il controcampo.
const PetOwner = ({ pet = 'Nina', breed = 'Shih Tzu', ritratto, banco, shots = [], sheet, aperta, invito }) => (
  <Phone>
    <div style={{ width: '100%', flex: 1, background: GH.page, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 0' }}>
        <button style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${GH.bd}`, background: '#fff', cursor: 'pointer', color: GH.mute, fontSize: 15, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', fontWeight: 700, color: 'var(--color-primary)' }}>Grooming Hub</div>
        <div style={{ width: 38 }}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 22px 0', gap: 14 }}>
        <DualMedallion main={ritratto} side={banco} tier="base"/>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, color: GH.ink, lineHeight: 1.1, letterSpacing: '-.02em', ...GH.serifL }}>{pet}</div>
          <div style={{ fontSize: 14, color: GH.mute, marginTop: 4 }}>{breed}</div>
        </div>
        {banco && (
          <div style={{ fontSize: 11.5, color: GH.mute, textAlign: 'center', lineHeight: 1.5, textWrap: 'pretty', maxWidth: 280 }}>
            La foto piccola è quella che usiamo noi al banco per riconoscerlo. <b>Toccala</b> per scambiarle.
          </div>
        )}
        {invito && (
          <div style={{ width: '100%', border: `1px dashed ${GH.bd}`, borderRadius: 14, padding: '13px 15px', textAlign: 'center', background: '#fff' }}>
            <div style={{ fontSize: 14.5, color: GH.ink, lineHeight: 1.45, ...GH.serif }}>Questa è la foto che facciamo noi, per riconoscerlo.</div>
            <div style={{ fontSize: 12.5, color: GH.mute, marginTop: 5, lineHeight: 1.5, textWrap: 'pretty' }}>Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto.</div>
            <div style={{ marginTop: 11 }}><BigGesture icon="camera">Metti la tua foto</BigGesture></div>
          </div>
        )}
        <div style={{ width: 44, height: 1, background: GH.bd }}/>
        <RelationLine visite={shots.length ? 4 : 0} da={shots.length ? 'marzo' : null}/>
      </div>
      <div style={{ padding: '22px 22px 20px', display: 'flex', flexDirection: 'column', gap: 9, marginTop: 'auto' }}>
        {shots.length > 0 && <AlbumGesture n={shots.length} pet={pet}/>}
        <BigGesture primary icon="whatsapp" sub="rispondiamo qui, non su moduli">Scrivici su WhatsApp</BigGesture>
        {shots.length === 0 && (
          <div style={{ fontSize: 11.5, color: GH.mute, textAlign: 'center', marginTop: 4, lineHeight: 1.55, textWrap: 'pretty' }}>
            Dopo il prossimo bagno troverai qui la sua foto.
          </div>
        )}
      </div>
      {sheet && <AlbumSheet shots={shots} pet={pet} aperta={aperta}/>}
    </div>
  </Phone>
);

const OwnerVuoto = () => <PetOwner/>;
const OwnerUna = () => <PetOwner ritratto="ritratto" banco="banco" shots={SHOTS1}/>;
const OwnerAlbum1 = () => <PetOwner ritratto="ritratto" banco="banco" shots={SHOTS1} sheet/>;
const OwnerAlbum4 = () => <PetOwner ritratto="ritratto" banco="banco" shots={SHOTS4} sheet/>;
const OwnerAperta = () => <PetOwner ritratto="ritratto" banco="banco" shots={SHOTS4} sheet aperta/>;
const OwnerSoloBanco = () => <PetOwner ritratto="banco" shots={SHOTS2} invito/>;

// ═══ GESTIONALE · la stessa scheda al banco ═══
// Protagonista: il riconoscimento. Il ritratto è il controcampo, e costa
// un ventesimo di spazio per l'unica cosa che dà: «ah, è Nina».
const PetStaff = ({ pet = 'Nina', breed = 'Shih Tzu', owner = 'Rosa Pagano', ritratto, banco, shots = [] }) => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <Hero title="Scheda cliente" sub={`${pet} · ${owner} · ${breed}`} right={<HeroBtn>← Indietro</HeroBtn>}/>
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Panel pad={14}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            <DualMedallion size={104} main={banco} side={ritratto}/>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 24, color: GH.ink, letterSpacing: '-.015em', ...GH.serifL }}>{pet}</div>
              <div style={{ fontSize: 13, color: GH.mute, marginTop: 2 }}>{breed}</div>
              <div style={{ display: 'flex', gap: 18, marginTop: 9 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 650, color: GH.ink }}><Icon name="user" size={14} color={GH.mute}/>{owner}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: GH.mute }}><Icon name="bell" size={14} color={GH.mute}/><span style={GH.num}>328 664 1108</span></span>
              </div>
              <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 11, lineHeight: 1.5, textWrap: 'pretty' }}>
                {ritratto
                  ? <>La pastiglia è <b>la foto messa dal proprietario</b>. Sta lì per il «ah, è Nina», non per lavorare: <b>al centro resta la vostra</b>, e nessun aggiornamento del cliente può spostarla.</>
                  : <>Il proprietario non ha messo una sua foto. <b>Il medaglione non si muove</b>: nessuno spazio vuoto in attesa.</>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <Btn variant="primary" icon="plus">Registra visita</Btn>
            <Btn icon="camera">Cambia foto di riconoscimento</Btn>
            <Btn icon="whatsapp">WhatsApp</Btn>
            <Btn icon="qr">QR Card</Btn>
          </div>
        </Panel>

        <Panel pad={0} eyebrow="Registra visita · 29 agosto" title="Il gesto di fine serata"
          right={<span style={{ fontSize: 11.5, color: GH.mute }}>estratto</span>}>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
              La foto dell’album <b>si allega qui</b>, dentro la registrazione, non in una schermata sua. È il posto dove il salone passa comunque a fine serata — e il verbo è <b>allega</b>: la fotografia esiste già, l’hanno fatta per mandarla su WhatsApp.
            </div>
            <AttachSlot/>
            <AttachSlot done/>
            <div style={{ fontSize: 11.5, color: GH.mute, lineHeight: 1.5, textWrap: 'pretty', paddingTop: 3 }}>
              Facoltativo, e <b>senza sollecito</b>: una registrazione senza foto è una registrazione completa. Se allegare diventa un dovere, a fine serata si smette di registrare.
            </div>
          </div>
        </Panel>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Panel pad={13} eyebrow="Album del proprietario" title={shots.length ? `${shots.length} foto inviate` : 'Nessuna foto'}>
          {shots.length ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
                {shots.map((s, i) => (
                  <div key={i}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}><Ph kind="album" r={8} bare/></div>
                    <div style={{ fontSize: 9.5, color: GH.mute, textAlign: 'center', marginTop: 4, ...GH.num }}>{s.d.replace(/ (\w{3})\w*/, ' $1')}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${GH.bdSoft}`, lineHeight: 1.5, textWrap: 'pretty' }}>
                In sola lettura, e in piccolo: al banco l’album <b>non serve a lavorare</b>. Sta qui solo perché sappiate cosa vede il proprietario.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: GH.mute, lineHeight: 1.5, textWrap: 'pretty' }}>Nessuna foto allegata alle visite di {pet}.</div>
          )}
        </Panel>
        <Panel pad={13} eyebrow="Le tre fotografie" title="Chi mette cosa">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[['Riconoscimento', 'la mettete voi · una sola · resta al centro qui', 'banco'], ['Ritratto', 'la mette il proprietario · una sola · resta al centro nella sua pagina', 'ritratto'], ['Album', 'la allegate voi · una per lavorazione · solo per il proprietario', 'album']].map(([n, d, k]) => (
              <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><Ph kind={k} r={8} bare/></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: GH.ink }}>{n}</div>
                  <div style={{ fontSize: 11, color: GH.mute }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  </div>
);

const StaffDue = () => <PetStaff banco="banco" ritratto="ritratto" shots={SHOTS4}/>;
const StaffSola = () => <PetStaff banco="banco" ritratto={null} shots={SHOTS1}/>;

Object.assign(window, { SHOTS1, SHOTS2, SHOTS4, PetOwner, OwnerVuoto, OwnerUna, OwnerAlbum1, OwnerAlbum4, OwnerAperta, OwnerSoloBanco, PetStaff, StaffDue, StaffSola });
