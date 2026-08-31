// ═══════════════════════════════════════════════════════════
// CD-06 · VISTE — composte prima la settimana tipo (tre appuntamenti e
// qualche lavorazione senza ora) e la settimana futura vuota. La piena
// viene per ultima: oggi è il nono decile, non la norma.
// ═══════════════════════════════════════════════════════════

const M = { nome: 'Mattina', ore: '9–13' }, P = { nome: 'Pomeriggio', ore: '13–19' };

// Settimana tipo — quella di oggi, e per mesi
const W_TIPO = {
  label: '31 agosto – 6 settembre', oggi: 0,
  days: [
    { dow: 'lun', n: '31', mChiusa: true, m: {}, p: { appts: [{ h: '15:00', pet: 'Luna', svc: 'Bagno', min: 45 }], margine: 2 }, senza: 3 },
    { dow: 'mar', n: '1', m: { margine: 2 }, p: { appts: [{ h: '16:30', pet: 'Argo', svc: 'Taglio', min: 90 }], margine: 2 }, senza: 4 },
    { dow: 'mer', n: '2', m: { reqs: [{ pet: 'Miele', fascia: 'mattina' }], margine: 2 }, p: { margine: 2 }, senza: 2 },
    { dow: 'gio', n: '3', m: { appts: [{ h: '10:00', pet: 'Nina', svc: 'Bagno', min: 45 }], margine: 2 }, p: { margine: 3 }, senza: 0 },
    { dow: 'ven', n: '4', m: { margine: 2 }, p: { margine: 3 }, senza: 0 },
    { dow: 'sab', n: '5', m: { margine: 2 }, p: { margine: 3 }, senza: 0 },
    { dow: 'dom', n: '6', chiuso: true, senza: 0 },
  ],
};

// Settimana futura — quasi sempre bianca, ed è normale
const W_VUOTA = {
  label: '7 – 13 settembre', oggi: -1, futura: true,
  days: [
    { dow: 'lun', n: '7', mChiusa: true, m: {}, p: { margine: 3 }, senza: 0 },
    ...['mar 8', 'mer 9', 'gio 10', 'ven 11', 'sab 12'].map(s => { const [dow, n] = s.split(' '); return { dow, n, m: { margine: 2 }, p: { margine: 3 }, senza: 0 }; }),
    { dow: 'dom', n: '13', chiuso: true, senza: 0 },
  ],
};

// Settimana piena — il nono decile, 10 cani in un giorno
const W_PIENA = {
  label: '25 – 31 maggio', oggi: -1,
  days: [
    { dow: 'lun', n: '25', mChiusa: true, m: {}, p: { appts: [{ h: '14:00', pet: 'Luna', svc: 'Bagno', min: 45 }, { h: '16:00', pet: 'Pepe', svc: 'Taglio', min: 90 }], margine: 1 }, senza: 5 },
    { dow: 'mar', n: '26', m: { appts: [{ h: '09:30', pet: 'Argo', svc: 'Taglio', min: 90 }, { h: '11:30', pet: 'Kira', svc: 'Bagno', min: 45 }], margine: 0, stretto: true }, p: { appts: [{ h: '15:00', pet: 'Otto', svc: 'Bagno', min: 45 }], margine: 2 }, senza: 6 },
    { dow: 'mer', n: '27', m: { appts: [{ h: '10:00', pet: 'Bella', svc: 'Bagno', min: 45 }], margine: 2 }, p: { appts: [{ h: '17:00', pet: 'Zoe', svc: 'Bagno', min: 45, tag: 'rischio' }], margine: 2 }, senza: 4 },
    { dow: 'gio', n: '28', m: { reqs: [{ pet: 'Ettore', fascia: 'mattina' }], appts: [{ h: '11:00', pet: 'Nuvola', svc: 'Taglio', min: 90 }], margine: 1 }, p: { appts: [{ h: '15:30', pet: 'Rocky', svc: 'Bagno', min: 45, tag: 'blacklist' }], margine: 2 }, senza: 5 },
    { dow: 'ven', n: '29', m: { appts: [{ h: '09:00', pet: 'Nina', svc: 'Bagno', min: 45 }, { h: '10:30', pet: 'Briciola', svc: 'Taglio', min: 90 }], margine: 0, stretto: true }, p: { appts: [{ h: '14:30', pet: 'Miele', svc: 'Bagno', min: 45 }], margine: 2 }, senza: 7 },
    { dow: 'sab', n: '30', m: { margine: 2 }, p: { margine: 3 }, senza: 2 },
    { dow: 'dom', n: '31', chiuso: true, senza: 0 },
  ],
};

const PlanNav = ({ label, modo = 'settimana' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <PlanSwitch modo={modo}/>
    <div style={{ width: 1, height: 22, background: GH.bdSoft }}/>
    <Btn style={{ height: 34, padding: '0 11px' }}><Icon name="chevron-left" size={14}/></Btn>
    <span style={{ fontSize: 16, color: GH.ink, minWidth: 178, textAlign: 'center', ...GH.serif }}>{label}</span>
    <Btn style={{ height: 34, padding: '0 11px' }}><Icon name="chevron" size={14}/></Btn>
    <Btn style={{ height: 34 }}>Questa settimana</Btn>
  </div>
);

// ═══ DESKTOP · il quadro sinottico. Sette colonne, due fasce, un piede. ═══
const PlanDesktop = ({ w }) => {
  const presi = w.days.reduce((s, d) => s + ((d.m?.appts || []).length + (d.p?.appts || []).length), 0);
  const inAttesa = w.days.reduce((s, d) => s + ((d.m?.reqs || []).length + (d.p?.reqs || []).length), 0);
  const senza = w.days.reduce((s, d) => s + d.senza, 0);
  return (
    <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      <Hero title="Dove lo metto" sub="La settimana a colpo d’occhio, per collocare chi arriva al banco"
        right={<HeroBtn>← Dashboard</HeroBtn>}/>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <PlanNav label={w.label}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: GH.mute }}><b style={{ color: GH.ink, ...GH.num }}>{presi}</b> prenotati</span>
            {inAttesa > 0 && <span style={{ fontSize: 12, color: 'var(--color-warning-text)' }}><b style={GH.num}>{inAttesa}</b> da confermare</span>}
            <span style={{ fontSize: 12, color: GH.mute }}><b style={{ color: GH.ink, ...GH.num }}>{senza}</b> entrati senza appuntamento</span>
            <span style={{ fontSize: 12, color: GH.mute, ...GH.num }}>{CAP.postazioni} postazioni</span>
          </div>
        </div>

        {w.futura && (
          <Notice icon="clock">Questa settimana è ancora tutta da riempire — è la condizione normale quando si guarda avanti, non un errore.</Notice>
        )}

        <div style={{ border: `1px solid ${GH.bd}`, borderRadius: GH.r.panel, overflow: 'hidden', background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {w.days.map((d, i) => (
            <div key={i} style={{ borderLeft: i ? `1px solid ${GH.bd}` : 'none', display: 'flex', flexDirection: 'column', background: d.chiuso ? 'var(--gh-absent)' : 'transparent' }}>
              <DayHead d={d} oggi={i === w.oggi} chiuso={d.chiuso}/>
              {d.chiuso ? (
                <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '26px 8px' }}>
                  <span style={{ fontSize: 11.5, color: GH.mute, fontStyle: 'italic' }}>chiuso</span>
                </div>
              ) : (
                <>
                  <Fascia {...M} {...d.m} chiusa={d.mChiusa}/>
                  <Fascia {...P} {...d.p}/>
                  <div style={{ marginTop: 'auto' }}><SenzaOra n={d.senza}/></div>
                </>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center', padding: '2px 2px 0' }}>
          {[
            ['appuntamento · ha un’ora', '#fff', 'var(--color-primary)', 'solid'],
            ['richiesta · ha una fascia', 'var(--color-warning-bg)', 'var(--color-warning-border)', 'dashed'],
            ['margine · tenuto per chi entra', 'var(--gh-tint)', 'rgba(111,151,146,.45)', 'dashed'],
            ['entrati senza appuntamento · nessuna ora', 'var(--gh-absent)', GH.bd, 'dashed'],
          ].map(([t, bg, bc, st]) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: GH.mute }}>
              <span style={{ width: 20, height: 13, borderRadius: 4, background: bg, border: `1px ${st} ${bc}`, borderLeft: st === 'solid' ? `3px solid ${bc}` : undefined }}/>{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlanTipo = () => <PlanDesktop w={W_TIPO}/>;
const PlanVuota = () => <PlanDesktop w={W_VUOTA}/>;
const PlanPiena = () => <PlanDesktop w={W_PIENA}/>;

// ═══ TELEFONO · la settimana cambia FORMA: scorre in verticale. ═══
// Sette colonne su 390px non si leggono. Il giorno diventa una riga,
// le fasce due sotto-righe. Stessi oggetti, stessa grammatica.
const PlanMobile = ({ w = W_TIPO }) => (
  <Phone>
    <Hero compact title="Dove lo metto" sub={w.label} right={<HeroBtn>←</HeroBtn>}/>
    <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 11, flex: 1, overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, alignSelf: 'flex-start' }}><PlanSwitch modo="settimana"/></div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Btn style={{ flex: 1 }}><Icon name="chevron-left" size={14}/></Btn>
        <Btn style={{ flex: 3 }}>Questa settimana</Btn>
        <Btn style={{ flex: 1 }}><Icon name="chevron" size={14}/></Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', minHeight: 0 }}>
        {w.days.slice(0, 2).map((d, i) => (
          <div key={i} style={{ flexShrink: 0, border: `1px solid ${GH.bd}`, borderRadius: GH.r.field, overflow: 'hidden', background: d.chiuso ? 'var(--gh-absent)' : '#fff' }}>
            <DayHead d={d} oggi={i === w.oggi} chiuso={d.chiuso}/>
            <Fascia {...M} {...d.m} chiusa={d.mChiusa} mobile/>
            <Fascia {...P} {...d.p} mobile/>
            <SenzaOra n={d.senza} mobile/>
          </div>
        ))}
      </div>
    </div>
  </Phone>
);

// ═══ Il modo «Giorno» — non una pagina diversa, la stessa a un'altra distanza ═══
const PlanGiorno = () => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
    <Hero title="Dove lo metto" sub="Martedì 1 settembre · la giornata da lavorare" right={<HeroBtn>← Dashboard</HeroBtn>}/>
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PlanNav label="martedì 1 settembre" modo="giorno"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Panel eyebrow="Mattina" title="9–13" pad={13}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Margine n={2}/><Vuoto label="prenota alle 9:00"/><Vuoto label="prenota alle 10:30"/>
          </div>
        </Panel>
        <Panel eyebrow="Pomeriggio" title="13–19" pad={13}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <ApptChip a={{ h: '16:30', pet: 'Argo', svc: 'Taglio', min: 90 }}/>
            <Margine n={2}/><Vuoto label="prenota alle 13:30"/>
          </div>
        </Panel>
      </div>
      <Panel eyebrow="Entrati senza appuntamento" title="4 cani, nessuna ora" pad={0}>
        <div style={{ padding: 13, fontSize: 12.5, color: GH.mute, lineHeight: 1.55, textWrap: 'pretty' }}>
          Qui il modo giorno fa una cosa che la settimana non può fare: <b>elencarli</b>. Restano senza ora — <span style={GH.num}>visits.date</span> è di tipo <span style={GH.num}>date</span> e la colonna resta muta — ma in una giornata sola c’è spazio per i nomi, e i nomi sono ciò che serve a lavorare.
        </div>
        {[['Pepe', 'bagnetto'], ['Kira', 'taglio'], ['Bella', 'bagnetto'], ['Otto', 'bagnetto e unghie']].map(([pet, t], i) => (
          <div key={pet} style={{ display: 'flex', alignItems: 'center', gap: 11, minHeight: 44, padding: '0 13px', borderTop: `1px solid ${GH.bdSoft}` }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: GH.mute, opacity: .75 }}/>
            <span style={{ fontSize: 14, color: GH.ink, minWidth: 74, ...GH.serif }}>{pet}</span>
            <span style={{ fontSize: 12, color: GH.mute, fontStyle: 'italic' }}>«{t}»</span>
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 11.5, color: GH.mute }}>registrato a fine serata</span>
          </div>
        ))}
      </Panel>
    </div>
  </div>
);

Object.assign(window, { W_TIPO, W_VUOTA, W_PIENA, M, P, PlanNav, PlanDesktop, PlanTipo, PlanVuota, PlanPiena, PlanMobile, PlanGiorno });
