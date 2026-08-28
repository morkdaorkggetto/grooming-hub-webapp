// ═══════════════════════════════════════════════════════════
// GH-15 · SCHERMATA 2 — Scheda cliente  (route: /client/:id)
// Le sette sezioni della vista in uso restano tutte, nello stesso ordine di lettura.
// Desktop: due colonne. Telefono: impilate.
// Campi incerti marcati con ⚠ — vedi handoff §8.
// ═══════════════════════════════════════════════════════════

const PET = { pet: 'Fido 3', breed: 'Pastore Tedesco', owner: 'Mork da Ork', tel: '338 433 2863' };

const MetaLine = ({ icon, children, strong }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: strong ? GH.ink : GH.mute, fontWeight: strong ? 650 : 400 }}>
    <Icon name={icon} size={14} color={GH.mute}/>{children}
  </div>
);

// § 1 — Identità e azioni. Sei azioni, stesso ordine, una sola primaria.
const IdentityCard = ({ mobile }) => (
  <Panel pad={mobile ? 13 : 14}>
    <div style={{ display: 'flex', gap: mobile ? 13 : 15, alignItems: 'flex-start' }}>
      <PetAvatar size={mobile ? 64 : 76} tier="base"/>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: mobile ? 26 : 32, color: GH.ink, ...GH.serifL }}>{PET.pet}</span>
          <FidelityBadge tier="base" compact/>
          <StateTag s="attivo"/>
        </div>
        <div style={{ fontSize: 13, color: GH.mute, marginTop: 2 }}>{PET.breed}</div>
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 4 : 18, marginTop: 9 }}>
          <MetaLine icon="user" strong>{PET.owner}</MetaLine>
          <MetaLine icon="bell"><span style={GH.num}>{PET.tel}</span></MetaLine>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 7, marginTop: 13, flexWrap: 'wrap', alignItems: 'center' }}>
      <Btn variant="primary" icon="plus" style={mobile ? { flex: '1 1 100%' } : {}}>Registra visita</Btn>
      <Btn icon="calendar">Appuntamento</Btn>
      <Btn icon="whatsapp">WhatsApp</Btn>
      <Btn icon="pencil">Modifica</Btn>
      <Btn icon="qr">QR Card</Btn>
      <div style={{ flex: mobile ? undefined : 1 }}/>
      <Btn variant="danger">Elimina</Btn>
    </div>
  </Panel>
);

// § 2 — Fidelity. I tre livelli passano da card a righe con barra. ⚠ points, tierProgress
const TierCell = ({ name, soglia, fatte, tot, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40 }}>
    <span style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }}/>
    <div style={{ minWidth: 62 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: GH.ink }}>{name}</div>
      <div style={{ fontSize: 10.5, color: GH.mute, ...GH.num }}>{soglia}</div>
    </div>
    <div style={{ flex: 1, height: 5, borderRadius: 999, background: GH.soft, overflow: 'hidden' }}>
      <div style={{ width: `${(fatte / tot) * 100}%`, height: '100%', background: color }}/>
    </div>
    <span style={{ fontSize: 11.5, color: GH.mute, ...GH.num, minWidth: 74, textAlign: 'right' }}>{tot - fatte} mancanti</span>
  </div>
);

const FidelityPanel = () => (
  <Panel eyebrow="Fidelity cliente" title="Livello Base · 12 visite a Bronzo">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: GH.soft, border: `1px solid ${GH.bdSoft}`, borderRadius: 14, padding: '10px 12px' }}>
      <div>
        <Eyebrow>Punti premio</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 32, lineHeight: 1, color: GH.ink, ...GH.num, ...GH.serifL }}>0</span>
          <span style={{ fontSize: 11.5, color: GH.mute }}>nessun punto: la card usa il fallback sulle visite</span>
        </div>
      </div>
      <Btn>Aggiungi / rimuovi</Btn>
    </div>
    <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TierCell name="Bronzo" soglia="12 visite / 12 mesi" fatte={0} tot={12} color="var(--tier-bronze)"/>
      <TierCell name="Argento" soglia="24 visite / 24 mesi" fatte={0} tot={24} color="var(--tier-silver)"/>
      <TierCell name="Oro" soglia="36 visite / 36 mesi" fatte={0} tot={36} color="var(--tier-gold)"/>
    </div>
  </Panel>
);

// § 3 — QR. Blu letterale → secondary.
const QrPanel = () => (
  <Panel eyebrow="Card identificativa QR" title="Codice FC46DBA7">
    <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 92, height: 92, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name="qr" size={54} color={GH.ink} stroke={1.4}/>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.45, textWrap: 'pretty' }}>Il QR apre la card cliente pubblica. Da area operatore si continua dalla scheda completa.</div>
        <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
          <Btn variant="secondary" icon="arrow">Apri area operatore</Btn>
          <Btn icon="qr">Stampa card</Btn>
        </div>
      </div>
    </div>
  </Panel>
);

// § 4 — Ponte verso l'app customer: unico pannello su fondo --gh-bridge.
const BridgePanel = () => (
  <Panel eyebrow="Area cliente digitale" title="Collega questa scheda a un account" tone={GH.bridge}>
    <div style={{ fontSize: 12, color: GH.mute, lineHeight: 1.45, textWrap: 'pretty' }}>Il cliente vedrà card, fidelity, prossimo appuntamento e contatto WhatsApp — nient’altro.</div>
    <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
      <Field label="Email cliente (facoltativa)" placeholder="nome@esempio.it"/>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}><Btn variant="primary">Genera invito</Btn></div>
    </div>
  </Panel>
);

// § 5 — Affidabilità. Un solo token danger per le due azioni negative. ⚠ reliabilityScore
const ScorePanel = ({ mobile }) => (
  <Panel eyebrow="Affidabilità appuntamenti" title="Score 0 · Attivo">
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, color: GH.mute }}>
      <div style={{ display: 'flex', gap: 3 }}>{[-3, -2, -1, 0, 1, 2, 3].map(n => (
        <span key={n} style={{ width: 16, height: 6, borderRadius: 2, background: n < 0 ? 'var(--color-danger-bg)' : n === 0 ? 'var(--color-primary)' : 'var(--color-success-bg)' }}/>
      ))}</div>
      Da −3 in giù il cliente entra in blacklist.
    </div>
    <div style={{ display: 'flex', gap: 7, marginTop: 11, flexWrap: 'wrap' }}>
      <Btn variant="success" icon="check" style={mobile ? { flex: 1 } : {}}>Presenza +1</Btn>
      <Btn variant="danger" style={mobile ? { flex: 1 } : {}}>No-show −1</Btn>
      <Btn variant="ghost" style={{ color: 'var(--color-danger-text)' }}>Inserisci in blacklist</Btn>
    </div>
  </Panel>
);

// § 6 — Visite. ⚠ visit.operator, visit.amount, visit.duration, visit.note
const VISITS = [
  { d: '18 ago', h: '09:30', s: 'Toelettatura completa', op: 'Davide', eur: '45', note: 'Nodi dietro le orecchie' },
  { d: '02 ago', h: '11:15', s: 'Bagno e asciugatura', op: 'Roby', eur: '28', note: '' },
  { d: '14 lug', h: '16:00', s: 'Tosatura estiva', op: 'Davide', eur: '40', note: 'Cliente in ritardo 20′' },
  { d: '28 giu', h: '10:00', s: 'Bagno e taglio unghie', op: 'Roby', eur: '32', note: '' },
];

const VisitRow = ({ v, i, mobile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 9 : 12, minHeight: mobile ? 60 : 44, padding: '0 13px', borderTop: i ? `1px solid ${GH.bdSoft}` : 'none' }}>
    <div style={{ minWidth: 52 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: GH.ink, ...GH.num }}>{v.d}</div>
      <div style={{ fontSize: 10.5, color: GH.mute, ...GH.num }}>{v.h}</div>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: GH.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.s}</div>
      {v.note && <div style={{ fontSize: 11, color: GH.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.note}</div>}
    </div>
    {/* ⚠ visit.operator — se lo schema non lo ha, la colonna sparisce e il resto non si muove */}
    <span style={{ fontSize: 11.5, color: GH.mute }}>{v.op}</span>
    <span style={{ fontSize: 16, color: GH.ink, ...GH.num, ...GH.serif, minWidth: 40, textAlign: 'right' }}>{v.eur} €</span>
  </div>
);

const VisitsPanel = ({ state = 'ready', mobile }) => (
  <Panel eyebrow="Visite" pad={0}
    title={state === 'empty' ? 'Nessuna visita registrata' : state === 'loading' ? 'Caricamento…' : `${VISITS.length} registrate · 145 € nel periodo`}
    right={<Btn variant={state === 'empty' ? 'primary' : 'ghost'} icon="plus">{state === 'empty' ? 'Registra la prima' : 'Registra'}</Btn>}>
    {state === 'loading' ? [0, 1, 2].map(i => <SkeletonRow key={i} i={i}/>)
      : state === 'empty' ? <EmptyState title="Ancora nessuna visita." body="Le visite si registrano da qui, anche a lavoro finito. Puoi inserire anche una visita di ieri o della settimana scorsa."/>
      : VISITS.map((v, i) => <VisitRow key={v.d} v={v} i={i} mobile={mobile}/>)}
  </Panel>
);

const ClientDesktop = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <Hero title="Scheda cliente" sub={`${PET.pet} · ${PET.owner} · ${PET.breed}`} right={<HeroBtn>← Indietro</HeroBtn>}/>
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 440px', gap: 16, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <IdentityCard/><VisitsPanel/><ScorePanel/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FidelityPanel/><QrPanel/><BridgePanel/>
      </div>
    </div>
  </div>
);

// Tre viste, tre schermate: le sette sezioni non stanno in due schermi da 844px.
// 'top' = identità + visite · 'mid' = fidelity + affidabilità · 'bridge' = QR + area cliente
const Stack = ({ children }) => (
  <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', flex: 1 }}>
    {React.Children.map(children, (c, i) => <div key={i} style={{ flexShrink: 0 }}>{c}</div>)}
  </div>
);

const ClientMobile = ({ view = 'top' }) => (
  <Phone>
    <Hero compact title="Scheda cliente" sub={`${PET.pet} · ${PET.owner}`} right={<HeroBtn>←</HeroBtn>}/>
    <Stack>
      {view === 'top' && <IdentityCard mobile/>}
      {view === 'top' && <VisitsPanel mobile/>}
      {view === 'mid' && <FidelityPanel/>}
      {view === 'mid' && <ScorePanel mobile/>}
      {view === 'bridge' && <QrPanel/>}
      {view === 'bridge' && <BridgePanel/>}
    </Stack>
    {/* FAB solo sulla vista 'top': altrove coprirebbe un'azione primaria */}
    {view === 'top' && <Fab/>}
  </Phone>
);

Object.assign(window, { PET, MetaLine, Stack, IdentityCard, TierCell, FidelityPanel, QrPanel, BridgePanel, ScorePanel, VISITS, VisitRow, VisitsPanel, ClientDesktop, ClientMobile });
