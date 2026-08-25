// ═══════════════════════════════════════════════════════════
// GH-15 · SCHERMATA 1 — Dashboard clienti  (route: /dashboard)
// Ordine sezioni invariato rispetto alla vista in uso.
// Campi incerti marcati con ⚠ — vedi handoff §8.
// ═══════════════════════════════════════════════════════════

const AREAS = [
  { eyebrow: 'Pianificazione', title: 'Calendario e appuntamenti', desc: 'Chi fa cosa e a che ora: giornata in corso, settimana avanti, settimane passate.', meta: 'Oggi 6 visite · 2 operatori', icon: 'calendar', accent: 'var(--color-primary)' },
  { eyebrow: 'Team operativo', title: 'Operatività del salone', desc: 'Turni, carico per operatore, tempi medi di lavorazione.', meta: 'Davide 4 · Roby 2', icon: 'user', accent: 'var(--color-secondary)' },
  { eyebrow: 'Controllo business', title: 'Report e andamento', desc: 'Visite registrate, incassi, ricorrenza clienti.', meta: '464 visite storiche', icon: 'sparkle', accent: 'var(--color-success-text)' },
  { eyebrow: 'Rubrica', title: 'Contatti e recapiti', desc: 'Numeri, WhatsApp, note di contatto.', meta: '132 contatti', icon: 'bell', accent: 'var(--color-text-secondary)' },
  { eyebrow: 'Area cliente', title: 'Richieste dai clienti', desc: 'Richieste di appuntamento arrivate dall’area cliente digitale.', meta: '2 da leggere', icon: 'paw', accent: 'var(--color-warning-text)' },
];

const TABLE_COLS = '1.5fr 1.4fr .9fr 84px 74px 20px';

const DashDesktop = ({ state = 'ready' }) => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <Hero title="Dashboard clienti" sub="Archivio, fidelity e operatività del salone" right={
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <Eyebrow>Account attivo</Eyebrow>
          <div style={{ fontSize: 12.5, fontWeight: 650, marginTop: 2, color: GH.ink }}>davide@groominghub.it</div>
        </div>
        <HeroBtn><Icon name="logout" size={14}/>Esci</HeroBtn>
      </div>
    }/>
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1 · Ricerca e panoramica + 2 · Stato generale */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, alignItems: 'start' }}>
        <Panel eyebrow="Ricerca e panoramica" title="Trova un cliente">
          <SearchBar/>
          <div style={{ display: 'flex', gap: 7, marginTop: 11, flexWrap: 'wrap' }}>
            <Pill on n={132}>Tutti</Pill><Pill n={118}>Affidabili</Pill><Pill n={46}>Fidelity</Pill><Pill n={3}>Blacklist</Pill>
          </div>
        </Panel>
        <Panel eyebrow="Stato generale" title="Il salone in tre numeri">
          <StatStrip items={[
            { k: 'Clienti attivi', v: 129, note: '+4 questo mese' },
            { k: 'Storico visite', v: 464, note: 'da apr. 2025' },
            { k: 'Blacklist', v: 3, note: 'score ≤ −3', fg: 'var(--color-danger-text)', tone: 'var(--color-danger-bg)' },
          ]}/>
        </Panel>
      </div>
      {/* 3 · Aree operative */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
          <Eyebrow>Aree operative</Eyebrow>
          <span style={{ fontSize: 11.5, color: GH.mute }}>Tocca la tessera per entrare</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <AreaTile {...AREAS[0]} span={2}>
            {/* ⚠ slot.operator, slot.state — campi incerti */}
            <div style={{ borderTop: `1px solid ${GH.bdSoft}`, paddingTop: 5 }}>
              <SlotRow time="09:30" pet="Luna · toelettatura completa" op="Davide" state="fatta"/>
              <SlotRow time="11:00" pet="Miele · bagno e asciugatura" op="Roby" state="corso"/>
              <SlotRow time="15:00" pet="Argo · tosatura estiva" op="Davide" state="attesa"/>
            </div>
          </AreaTile>
          <AreaTile {...AREAS[1]}/>
          <AreaTile {...AREAS[2]}/>
          <AreaTile {...AREAS[3]}/>
          <AreaTile {...AREAS[4]} span={2}/>
          <AreaTile eyebrow="Registrazione" title="Registra una visita" desc="Il gesto di ogni giorno: anche a lavoro finito, anche per una visita di ieri." meta="Ultima: 20 min fa" icon="plus" accent="var(--color-primary)"/>
        </div>
      </div>
      {/* 4 · Archivio clienti */}
      <Panel eyebrow="Archivio clienti" title={state === 'loading' ? 'Caricamento…' : '132 schede'} pad={0} right={
        <div style={{ display: 'flex', gap: 7 }}><Btn variant="ghost" icon="arrow">Esporta</Btn><Btn variant="primary" icon="plus">Nuova scheda</Btn></div>
      }>
        <div style={{ display: 'grid', gridTemplateColumns: TABLE_COLS, gap: 12, padding: '7px 13px', background: GH.soft, borderBottom: `1px solid ${GH.bdSoft}` }}>
          {['Cane', 'Proprietario', 'Telefono', 'Visite', 'Ultima', ''].map(h => <Eyebrow key={h}>{h}</Eyebrow>)}
        </div>
        {state === 'loading' ? [0, 1, 2, 3, 4, 5, 6].map(i => <SkeletonRow key={i} i={i}/>)
          : state === 'empty' ? <EmptyState title="Nessun cliente in archivio." body="Le schede si creano da qui, o si compilano registrando la prima visita." action={<Btn variant="primary" icon="plus">Nuova scheda</Btn>}/>
          : CLIENTS.map((c, i) => <ClientRow key={c.pet} c={c} i={i}/>)}
      </Panel>
    </div>
  </div>
);

const DashMobile = () => (
  <Phone>
    <Hero compact title="Dashboard clienti" sub="Archivio e operatività" right={<HeroBtn><Icon name="logout" size={14}/></HeroBtn>}/>
    <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', flex: 1 }}>
      <div>
        <SearchBar/>
        <div style={{ display: 'flex', gap: 6, marginTop: 9, overflow: 'hidden' }}>
          <Pill on n={132}>Tutti</Pill><Pill n={118}>Affidabili</Pill><Pill n={46}>Fidelity</Pill>
        </div>
      </div>
      <StatStrip items={[
        { k: 'Attivi', v: 129, note: '+4' },
        { k: 'Visite', v: 464, note: 'storico' },
        { k: 'Black', v: 3, note: '≤ −3', fg: 'var(--color-danger-text)', tone: 'var(--color-danger-bg)' },
      ]}/>
      <Panel eyebrow="Pianificazione" title="Oggi in salone" pad={11} right={<span style={{ fontSize: 11, fontWeight: 650, color: GH.mute }}>6 visite</span>}>
        <SlotRow time="09:30" pet="Luna · completa" op="Davide" state="fatta"/>
        <SlotRow time="11:00" pet="Miele · bagno" op="Roby" state="corso"/>
        <SlotRow time="15:00" pet="Argo · tosatura" op="Davide" state="attesa"/>
      </Panel>
      <Panel eyebrow="Archivio clienti" title="132 schede" pad={0} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {CLIENTS.slice(0, 4).map((c, i) => <ClientRow key={c.pet} c={c} i={i} mobile/>)}
      </Panel>
    </div>
    <Fab/>
  </Phone>
);

Object.assign(window, { AREAS, TABLE_COLS, DashDesktop, DashMobile });
