// ═══════════════════════════════════════════════════════════
// GH-15 · SCHERMATA 3 — Registra visita  (route: /client/:id/add-visit)
// Si apre DALLA scheda cliente (bottone primario o FAB).
// Desktop: modale 620px. Telefono: schermo pieno.
// «Ieri» e «Altra data» sono di primo livello: è così che il calendario
// si riempie a ritroso senza chiedere a nessuno di cambiare abitudini.
// Campi incerti marcati con ⚠ — vedi handoff §8.
// ═══════════════════════════════════════════════════════════

const DayChip = ({ label, sub, on }) => {
  const t = useTouch();
  return (
    <button style={{ flex: 1, minWidth: 0, height: t ? 54 : 48, borderRadius: GH.r.field, border: `1px solid ${on ? 'var(--color-primary)' : GH.bd}`, background: on ? 'var(--color-primary)' : '#fff', color: on ? '#fbf6f3' : GH.ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 10.5, opacity: .75, ...GH.num }}>{sub}</span>
    </button>
  );
};

// ⚠ operators — l'elenco operatori potrebbe non esistere come tabella
const OpPick = ({ name, on }) => {
  const t = useTouch();
  return (
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: t ? 46 : 40, padding: '0 13px 0 9px', borderRadius: GH.r.field, border: `1px solid ${on ? 'var(--color-secondary)' : GH.bd}`, background: on ? 'rgba(103,56,63,.08)' : '#fff', cursor: 'pointer' }}>
      <PetAvatar size={t ? 28 : 24} tier="base"/>
      <span style={{ fontSize: 12.5, fontWeight: 650, color: on ? 'var(--color-secondary)' : GH.ink }}>{name}</span>
    </button>
  );
};

// ⚠ services[] con prezzo — se il listino non è in tabella, il prezzo si digita a mano
const SvcChip = ({ label, eur, on }) => {
  const t = useTouch();
  return (
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: t ? 44 : 38, padding: '0 12px', borderRadius: 999, border: `1px solid ${on ? 'var(--color-primary)' : GH.bd}`, background: on ? 'var(--color-primary)' : '#fff', color: on ? '#fbf6f3' : GH.ink, fontSize: 12.5, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}<span style={{ fontSize: 11, opacity: .7, ...GH.num }}>{eur} €</span>
    </button>
  );
};

const VisitForm = ({ mobile, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 11 : 13 }}>
    {error && <ErrorState body="Connessione assente. La visita resta in questa schermata: riprova senza perdere i dati inseriti."/>}
    {/* 1 · Quando — quattro chip a peso pari */}
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>Quando</Eyebrow>
      <div style={{ display: 'flex', gap: 7 }}>
        <DayChip label="Oggi" sub="25 ago" on/><DayChip label="Ieri" sub="24 ago"/><DayChip label="Sab" sub="23 ago"/><DayChip label="Altra data" sub="scegli"/>
      </div>
      <div style={{ marginTop: 7 }}>
        <Notice>Registrando una visita passata riempi il calendario a ritroso: lo storico si costruisce da qui.</Notice>
      </div>
    </div>
    {/* 2 · Ora, durata, incasso — ⚠ duration, amount */}
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '110px 110px 1fr', gap: 9 }}>
      <Field label="Ora inizio" value="09:30"/>
      <Field label="Durata" value="60 min"/>
      {!mobile && <Field label="Incasso" value="45 €"/>}
    </div>
    {/* 3 · Chi ha lavorato — ⚠ visit.operator: è IL campo da verificare in schema */}
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>Chi ha lavorato</Eyebrow>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}><OpPick name="Davide" on/><OpPick name="Roby"/></div>
    </div>
    {/* 4 · Servizio */}
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>Servizio</Eyebrow>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <SvcChip label="Toelettatura completa" eur="45" on/><SvcChip label="Bagno e asciugatura" eur="28"/><SvcChip label="Tosatura" eur="40"/><SvcChip label="Taglio unghie" eur="10"/>
      </div>
    </div>
    {mobile && <Field label="Incasso" value="45 €"/>}
    <Field label="Note di lavorazione (facoltative)" placeholder="Nodi, comportamento, prodotti usati…" area/>
    {/* 5 · Foto — ⚠ visit.photos */}
    <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
      <Btn icon="camera">Foto prima / dopo</Btn>
      <span style={{ fontSize: 11.5, color: GH.mute }}>Finisce nella card del cliente</span>
    </div>
  </div>
);

const VisitDesktop = ({ error }) => (
  <div style={{ width: '100%', height: '100%', background: GH.page, fontFamily: 'var(--font-sans)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ filter: 'saturate(.7)', opacity: .5, pointerEvents: 'none' }}><ClientDesktop/></div>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(43,37,37,.34)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: 620, background: GH.page, border: `1px solid ${GH.bd}`, borderRadius: GH.r.strip, boxShadow: '0 24px 60px rgba(43,37,37,.28)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${GH.bdSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <PetAvatar size={38} tier="base"/>
            <div>
              <Eyebrow color="var(--color-primary)">Registra visita</Eyebrow>
              <div style={{ fontSize: 19, color: GH.ink, marginTop: 2, ...GH.serif }}>{PET.pet} · {PET.owner}</div>
            </div>
          </div>
          <Btn variant="ghost">Chiudi</Btn>
        </div>
        <div style={{ padding: 16 }}><VisitForm error={error}/></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderTop: `1px solid ${GH.bdSoft}`, background: GH.soft }}>
          <span style={{ fontSize: 11.5, color: GH.mute }}>Visita n. 5 · porta {PET.pet} a 7 visite da Bronzo</span>
          <div style={{ display: 'flex', gap: 8 }}><Btn>Salva e nuova</Btn><Btn variant="primary" icon="check">Registra visita</Btn></div>
        </div>
      </div>
    </div>
  </div>
);

const VisitMobile = () => (
  <Phone>
    <div style={{ background: GH.page, borderBottom: `1px solid ${GH.bd}`, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <div>
        <Eyebrow color="var(--color-primary)">Registra visita</Eyebrow>
        <div style={{ fontSize: 22, color: GH.ink, marginTop: 3, ...GH.serifL }}>{PET.pet}</div>
      </div>
      <HeroBtn>Chiudi</HeroBtn>
    </div>
    <div style={{ padding: '13px 13px 6px', flex: 1, overflow: 'hidden' }}><VisitForm mobile/></div>
    <div style={{ padding: 13, borderTop: `1px solid ${GH.bdSoft}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 11.5, color: GH.mute, textAlign: 'center' }}>Visita n. 5 · 7 visite da Bronzo</span>
      <Btn variant="primary" icon="check" wide>Registra visita</Btn>
    </div>
  </Phone>
);

Object.assign(window, { DayChip, OpPick, SvcChip, VisitForm, VisitDesktop, VisitMobile });
