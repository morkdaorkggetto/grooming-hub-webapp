// ═══════════════════════════════════════════════════════════
// CD-01 · VISTE CALENDARIO — settimana 24–30 agosto 2026 (oggi: gio 27)
// Composto nell'ordine chiesto dal brief: prima la settimana vuota,
// poi la giornata di solo-registrato, poi la settimana piena.
// ═══════════════════════════════════════════════════════════

// ⚠ Il testo di una lavorazione è il campo libero che il salone usa ANCHE come
// diario: «non è venuto», «rimandato per ciclo». Si stampa verbatim, mai
// riscritto, mai etichettato «servizio». Nessuna classificazione automatica.
const WEEK_FULL = [
  { dow: 'lun', d: '24', o: [
    { kind: 'reg', pet: 'Luna', text: 'bagnetto e taglio', eur: '45' },
    { kind: 'reg', pet: 'Nina', text: 'bagnetto', eur: '25' },
  ] },
  { dow: 'mar', d: '25', o: [
    { kind: 'reg', pet: 'Argo', text: 'taglio', eur: '40' },
    { kind: 'reg', pet: 'Zoe', text: 'ha saltato l’appuntamento senza avvisare', flag: 'noshow' },
  ] },
  { dow: 'mer', d: '26', o: [
    { kind: 'conf', pet: 'Miele', time: '11:00', text: 'Bagno' },
    { kind: 'reg', pet: 'Rocky', text: 'bagnetto (paga 15 euro perché è la prima volta)', eur: '15' },
  ] },
  { dow: 'gio', d: '27', today: true, o: [
    { kind: 'req', pet: 'Briciola', fascia: 'mattina', text: 'Bagno', manto: 'molto infeltrito', nota: 'ha i nodi dietro le orecchie' },
    { kind: 'conf', pet: 'Luna', time: '09:30', text: 'Bagno e taglio' },
    { kind: 'conf', pet: 'Argo', time: '16:00', text: 'Taglio' },
    { kind: 'reg', pet: 'Pepe', text: 'bagnetto', eur: '25' },
  ] },
  { dow: 'ven', d: '28', o: [
    { kind: 'req', pet: 'Zoe', fascia: 'pomeriggio', text: 'Toelettatura', manto: 'perde molto pelo', nota: '', flag: 'rischio' },
    { kind: 'conf', pet: 'Nina', time: '10:00', text: 'Bagno' },
  ] },
  { dow: 'sab', d: '29', o: [
    { kind: 'req', pet: 'Fido 3', fascia: 'indifferente', text: 'Taglio', manto: 'pelle sensibile', nota: 'prima volta da voi' },
  ] },
  { dow: 'dom', d: '30', o: [] },
];

const WEEK_EMPTY = WEEK_FULL.map(d => ({ ...d, o: [] }));
const WEEK_REG = WEEK_FULL.map(d => ({ ...d, o: d.o.filter(x => x.kind === 'reg') }));

const QUEUE = [
  { pet: 'Briciola', owner: 'Serena Ferrara', dayLabel: 'gio 27', fascia: 'mattina', text: 'Bagno', manto: 'molto infeltrito', nota: 'ha i nodi dietro le orecchie' },
  { pet: 'Zoe', owner: 'Marta Ievoli', dayLabel: 'ven 28', fascia: 'pomeriggio', text: 'Toelettatura', manto: 'perde molto pelo', nota: '', flag: 'rischio' },
  { pet: 'Fido 3', owner: 'Mork da Ork', dayLabel: 'sab 29', fascia: 'indifferente', text: 'Taglio', manto: 'pelle sensibile', nota: 'prima volta da voi' },
];

const count = (w, k) => w.reduce((n, d) => n + d.o.filter(x => x.kind === k).length, 0);

// ── Guscio desktop comune ──
const CalDesktop = ({ week, queue, state }) => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <Hero title="Calendario" sub="Le richieste da confermare, gli appuntamenti con l’ora, le lavorazioni registrate dopo"
      right={<div style={{ display: 'flex', gap: 8 }}><HeroBtn>← Dashboard</HeroBtn><Btn variant="primary" icon="plus">Registra lavorazione</Btn></div>}/>
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start', flex: 1, minHeight: 0 }}>
      <Panel pad={0} style={{ overflow: 'hidden' }} eyebrow="Settimana" title="24 – 30 agosto 2026"
        right={<CalNav label="24 – 30 ago" right={<Btn style={{ height: 34 }}>Questa settimana</Btn>}/>}>
        {state === 'load' ? <div style={{ padding: '4px 0' }}>{[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} i={i}/>)}</div>
          : state === 'empty' ? (
            <div>
              <EmptyState title="Questa settimana non è ancora passato nessuno."
                body="Il calendario si riempie da due direzioni: le richieste dei clienti, che confermate assegnando l’ora, e le lavorazioni di chi arriva in negozio, che registrate a lavoro finito. Nessuna delle due va inserita in anticipo."
                action={<div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}><Btn variant="primary" icon="plus">Registra una lavorazione</Btn><Btn icon="calendar">Vai a una settimana passata</Btn></div>}/>
              <div style={{ borderTop: `1px solid ${GH.bd}` }}>
                {week.map((d, i) => <CalDay key={i} d={d} today={d.today}/>)}
              </div>
            </div>
          ) : week.map((d, i) => <CalDay key={i} d={d} today={d.today}/>)}
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <CalQueue items={queue}/>
        <CalWeekStrip reg={count(week, 'reg')} conf={count(week, 'conf')} att={count(week, 'req')}/>
        {state === 'reg' && (
          <Notice icon="clock">Nelle prime settimane la giornata tipo è questa: nessun appuntamento, solo il resoconto di chi è passato.</Notice>
        )}
      </div>
    </div>
  </div>
);

const CalWeekEmpty = () => <CalDesktop week={WEEK_EMPTY} queue={[]} state="empty"/>;
const CalWeekReg = () => <CalDesktop week={WEEK_REG} queue={[]} state="reg"/>;
const CalWeekFull = () => <CalDesktop week={WEEK_FULL} queue={QUEUE} state="full"/>;
const CalWeekLoad = () => <CalDesktop week={WEEK_EMPTY} queue={[]} state="load"/>;

// ── Telefono: un giorno alla volta. La settimana su 390px non si legge. ──
const CalMobileDay = ({ day = 3, week = WEEK_FULL }) => {
  const d = week[day];
  return (
    <Phone>
      <Hero compact title="Calendario" sub="giovedì 27 agosto"
        right={<HeroBtn>←</HeroBtn>}/>
      <div style={{ paddingTop: 11 }}><CalDayStrip days={week} sel={day}/></div>
      <div style={{ padding: '0 13px 13px', flex: 1, overflow: 'hidden' }}>
        <Panel pad={13} eyebrow={d.o.length ? 'Il giorno' : null} title={d.o.length ? `${d.o.length} voci` : null}>
          {d.o.length ? <CalDay d={d} mobile today={d.today}/> : (
            <EmptyState title="Quel giorno non è passato nessuno." body="Puoi registrare una lavorazione anche adesso: il giorno si riempie a ritroso."
              action={<Btn variant="primary" icon="plus" wide>Registra lavorazione</Btn>}/>
          )}
        </Panel>
      </div>
      <Fab/>
    </Phone>
  );
};

const CalMobileEmpty = () => <CalMobileDay day={6} week={WEEK_EMPTY}/>;

// ── Conferma: UN GESTO che contiene l'invio. Qui l'ora si decide. ──
const CalConfirmBody = ({ mobile }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
    <div style={{ background: GH.soft, border: `1px solid ${GH.bdSoft}`, borderRadius: GH.r.field, padding: 13 }}>
      <Eyebrow style={{ marginBottom: 6 }}>cosa ha chiesto il cliente</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: GH.ink }}>Bagno</span>
        <span style={{ fontSize: 12, color: GH.mute }}>· giovedì 27</span>
        <CalFascia f="mattina"/>
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-warning-text)', marginTop: 7 }}>molto infeltrito</div>
      <div style={{ fontSize: 12, color: GH.mute, marginTop: 3, fontStyle: 'italic' }}>«ha i nodi dietro le orecchie»</div>
      <div style={{ fontSize: 11.5, color: GH.mute, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${GH.bdSoft}`, textWrap: 'pretty' }}>
        È l’indicazione del cliente, non la lavorazione: cosa fare lo decidete voi vedendo il cane.
      </div>
    </div>
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>l’ora la decidete voi</Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 7 }}>
        <Field label="Giorno" value="gio 27 ago"/>
        <Field label="Ora" value="09:30"/>
        {!mobile && <Field label="Chi lavora ⚠" placeholder="da verificare in schema"/>}
      </div>
    </div>
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>prima di confermare</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, padding: '10px 12px', background: '#fff' }}>
        <PetAvatar size={30} tier="base"/>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: GH.ink }}>Serena Ferrara · 3 visite</div>
          <div style={{ fontSize: 11.5, color: GH.mute }}>Nessun no-show. Ultima volta il 2 agosto.</div>
        </div>
        <StateTag s="attivo"/>
      </div>
    </div>
    <div style={{ border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', background: GH.soft, borderBottom: `1px solid ${GH.bdSoft}` }}>
        <Eyebrow>il messaggio che parte · modificabile</Eyebrow>
      </div>
      <div style={{ padding: 12, fontSize: 12.5, color: GH.ink, lineHeight: 1.5 }}>
        Ciao Serena! Per Briciola ti aspettiamo <b>giovedì 27 alle 9:30</b>. Visto che il pelo è molto infeltrito potremmo aver bisogno di un po’ più di tempo — ne parliamo qui. A presto!
      </div>
    </div>
    <Notice icon="whatsapp">Confermare <b>è</b> mandare il messaggio: un gesto solo, così non restano richieste confermate a voce e ferme sullo schermo.</Notice>
  </div>
);

const CalConfirmDesktop = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ filter: 'saturate(.7)', opacity: .45, pointerEvents: 'none' }}><CalWeekFull/></div>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(43,37,37,.34)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: 620, background: '#fff', border: `1px solid ${GH.bd}`, borderRadius: GH.r.strip, boxShadow: '0 24px 60px rgba(43,37,37,.28)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 16px', borderBottom: `1px solid ${GH.bdSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <PetAvatar size={38} tier="base"/>
            <div>
              <Eyebrow color="var(--color-primary)">Conferma la richiesta</Eyebrow>
              <div style={{ fontSize: 19, color: GH.ink, marginTop: 2, ...GH.serif }}>Briciola · Serena Ferrara</div>
            </div>
          </div>
          <Btn variant="ghost">Chiudi</Btn>
        </div>
        <div style={{ padding: 16 }}><CalConfirmBody/></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderTop: `1px solid ${GH.bdSoft}`, background: GH.soft }}>
          <Btn variant="danger">Rifiuta la richiesta</Btn>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn>Solo salva l’ora</Btn>
            <Btn variant="primary" icon="whatsapp">Conferma e invia</Btn>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CalConfirmMobile = () => (
  <Phone>
    <div style={{ padding: '14px 15px', borderBottom: `1px solid ${GH.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <div>
        <Eyebrow color="var(--color-primary)">Conferma la richiesta</Eyebrow>
        <div style={{ fontSize: 21, color: GH.ink, marginTop: 3, ...GH.serif }}>Briciola</div>
      </div>
      <HeroBtn>Chiudi</HeroBtn>
    </div>
    <div style={{ padding: 13, flex: 1, overflow: 'hidden' }}><CalConfirmBody mobile/></div>
    <div style={{ padding: 13, borderTop: `1px solid ${GH.bdSoft}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Btn variant="primary" icon="whatsapp" wide>Conferma e invia</Btn>
      <Btn variant="ghost" wide>Rifiuta la richiesta</Btn>
    </div>
  </Phone>
);

Object.assign(window, { WEEK_FULL, WEEK_EMPTY, WEEK_REG, QUEUE, CalDesktop, CalWeekEmpty, CalWeekReg, CalWeekFull, CalWeekLoad, CalMobileDay, CalMobileEmpty, CalConfirmBody, CalConfirmDesktop, CalConfirmMobile });
