// ───────────────────────────────────────────────────────────
// PROTO · Booking wizard (1 pagina con 4 sezioni) + conferma
// ───────────────────────────────────────────────────────────

const { useState: useStateBk } = React;

const SERVICES = [
  { id: 's1', name: 'Bagno & tosatura completa', duration: '90 min', price: 55, desc: 'Bagno, asciugatura, tosatura, taglio unghie.' },
  { id: 's2', name: 'Solo bagno', duration: '45 min', price: 28, desc: 'Bagno, asciugatura, pulizia orecchie.' },
  { id: 's3', name: 'Toelettatura estetica', duration: '120 min', price: 75, desc: 'Lavoro di sagoma e rifinitura completa.' },
  { id: 's4', name: 'Visita veterinaria', duration: '30 min', price: 45, desc: 'Controllo generale con il nostro veterinario.' },
];

const TIMESLOTS = [
  { id: 'morning', label: 'Mattina', range: '9:00 – 12:00' },
  { id: 'afternoon', label: 'Pomeriggio', range: '14:00 – 17:30' },
  { id: 'any', label: 'Qualsiasi orario', range: 'Accetto la prima disponibilità' },
];

// ─── 7-day strip calendar ─────────────────────────────────────────────────
const DayStrip = ({ value, onChange }) => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
      {days.map((d, i) => {
        const iso = d.toISOString().split('T')[0];
        const isActive = iso === value;
        const dayNum = d.getDate();
        const dow = d.toLocaleDateString('it-IT', { weekday: 'short' });
        return (
          <button key={i} onClick={() => onChange(iso)} style={{
            flexShrink: 0, width: 62, padding: '10px 0',
            background: isActive ? 'var(--color-primary)' : 'var(--color-surface-main)',
            color: isActive ? '#FBF6F3' : 'var(--color-text-primary)',
            border: '1px solid ' + (isActive ? 'var(--color-primary)' : 'var(--color-border)'),
            borderRadius: 'var(--r-md)', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.75 }}>{dow}</div>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{dayNum}</div>
          </button>
        );
      })}
    </div>
  );
};

// ─── BOOKING ──────────────────────────────────────────────────────────────
const BookingScreen = (params) => {
  const { viewport, pets, nav, set, appointments, toast } = useApp();
  const isMobile = viewport === 'mobile';

  const [petId, setPetId] = useStateBk(params?.petId || pets[0]?.id);
  const [serviceId, setServiceId] = useStateBk(params?.serviceId || 's1');
  const [date, setDate] = useStateBk('');
  const [slot, setSlot] = useStateBk('morning');
  const [notes, setNotes] = useStateBk('');

  const pet = pets.find(p => p.id === petId) || pets[0];
  const service = SERVICES.find(s => s.id === serviceId);
  const slotDef = TIMESLOTS.find(t => t.id === slot);

  const submit = () => {
    if (!date) { toast('Scegli una data', 'error'); return; }
    const timeGuess = slot === 'morning' ? '10:30' : slot === 'afternoon' ? '15:00' : '11:00';
    const newAppt = {
      id: 'a' + Date.now(), petId: pet.id,
      service: service.name, date, time: timeGuess,
      status: 'pending', groomer: 'Giulia', location: 'Via Po 14, Torino',
    };
    set(s => ({ appointments: [...s.appointments, newAppt] }));
    nav('booking-confirm', { apptId: newAppt.id });
  };

  const Section = ({ n, title, subtitle, children }) => (
    <div style={{ marginBottom: isMobile ? 22 : 28 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12,
      }}>
        <span style={{
          display: 'inline-grid', placeItems: 'center',
          width: 24, height: 24, borderRadius: 999,
          background: 'var(--color-primary)', color: '#FBF6F3',
          fontSize: 12, fontWeight: 700,
        }}>{n}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="dashboard"/>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
        gap: isMobile ? 0 : 32,
        padding: isMobile ? '18px 22px 120px' : '40px 48px 60px',
        maxWidth: isMobile ? 'unset' : 1100, margin: '0 auto',
      }}>
        {/* LEFT form */}
        <div>
          <button onClick={() => nav('dashboard')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 13, color: 'var(--color-text-secondary)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginBottom: 14, fontFamily: 'inherit',
          }}>← Indietro</button>

          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--color-text-secondary)',
            marginBottom: 10,
          }}>Nuova prenotazione</div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: isMobile ? 30 : 44, fontWeight: 500,
            lineHeight: 1.08, letterSpacing: '-0.02em',
            margin: '0 0 28px',
          }}>Organizziamo la prossima visita.</h1>

          <Section n={1} title={`Per chi?`} subtitle="Seleziona il pet.">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {pets.map(p => {
                const active = p.id === petId;
                return (
                  <button key={p.id} onClick={() => setPetId(p.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px 10px 10px',
                    background: active ? 'var(--color-surface-main)' : 'var(--color-surface-soft)',
                    border: '1.5px solid ' + (active ? 'var(--color-primary)' : 'var(--color-border)'),
                    borderRadius: 'var(--r-md)', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>
                    <PetAvatarProto pet={p} size={32}/>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{p.breed}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section n={2} title="Che servizio?" subtitle="Puoi cambiare al momento dell'arrivo.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SERVICES.map(s => {
                const active = s.id === serviceId;
                return (
                  <button key={s.id} onClick={() => setServiceId(s.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, padding: 14,
                    background: active ? 'var(--color-surface-main)' : 'var(--color-surface-soft)',
                    border: '1.5px solid ' + (active ? 'var(--color-primary)' : 'var(--color-border)'),
                    borderRadius: 'var(--r-md)', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left', width: '100%',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.desc} · {s.duration}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>€{s.price}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section n={3} title="Quando?" subtitle="La prima disponibilità è domani.">
            <DayStrip value={date} onChange={setDate}/>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {TIMESLOTS.map(t => {
                const active = t.id === slot;
                return (
                  <button key={t.id} onClick={() => setSlot(t.id)} style={{
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    padding: '10px 14px',
                    background: active ? 'var(--color-surface-main)' : 'var(--color-surface-soft)',
                    border: '1.5px solid ' + (active ? 'var(--color-primary)' : 'var(--color-border)'),
                    borderRadius: 'var(--r-md)', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{t.range}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section n={4} title="Note per lo staff" subtitle="Opzionale.">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Es. ha un po' di ansia al phon, preferisce il box piccolo…"
              style={{
                width: '100%', minHeight: 84, padding: 14,
                background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: 'var(--r-md)', fontSize: 14,
                fontFamily: 'inherit', color: 'var(--color-text-primary)',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}/>
          </Section>
        </div>

        {/* RIGHT summary */}
        {!isMobile && (
          <div>
            <div style={{
              position: 'sticky', top: 20,
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                marginBottom: 12,
              }}>Riepilogo</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <Row label="Pet" value={pet?.name}/>
                <Row label="Servizio" value={service?.name}/>
                <Row label="Data" value={date ? new Date(date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}/>
                <Row label="Fascia" value={slotDef?.label}/>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', margin: '18px 0 14px' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Totale stimato</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500 }}>€{service?.price || 0}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Pagamento in negozio al termine della visita.
              </div>

              <div style={{
                background: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 'var(--r-md)', padding: 12,
                fontSize: 12, color: 'var(--color-warning-text)',
                margin: '18px 0 18px',
              }}>
                La tua richiesta verrà <strong>confermata entro 24h</strong> via email dal nostro staff.
              </div>

              <button onClick={submit} style={{
                width: '100%', height: 48,
                background: 'var(--color-primary)', color: '#FBF6F3',
                border: 'none', borderRadius: 'var(--r-md)',
                fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Invia richiesta</button>
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 390 - 16, maxWidth: 'calc(100vw - 40px)',
          padding: '12px 18px 18px',
          background: 'var(--color-surface-main)',
          borderTop: '1px solid var(--color-border)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 24px -6px rgba(0,0,0,0.08)',
          zIndex: 20,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
          }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Totale stimato</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>€{service?.price || 0}</span>
          </div>
          <button onClick={submit} style={{
            width: '100%', height: 46,
            background: 'var(--color-primary)', color: '#FBF6F3',
            border: 'none', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Invia richiesta</button>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
    <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right' }}>{value}</span>
  </div>
);

// ─── CONFIRM ──────────────────────────────────────────────────────────────
const BookingConfirmScreen = (params) => {
  const { viewport, appointments, pets, nav } = useApp();
  const isMobile = viewport === 'mobile';
  const appt = appointments.find(a => a.id === params?.apptId) || appointments[appointments.length - 1];
  const pet = pets.find(p => p.id === appt?.petId);

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="dashboard"/>}

      <div style={{
        padding: isMobile ? '24px 22px 40px' : '60px 48px',
        maxWidth: isMobile ? 'unset' : 640,
        margin: '0 auto', textAlign: 'center',
      }}>
        <div style={{
          width: 84, height: 84, borderRadius: 42,
          background: 'var(--color-warning-bg)',
          display: 'grid', placeItems: 'center', margin: '0 auto 22px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>

        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--color-warning-text)',
          marginBottom: 10,
        }}>In attesa di conferma</div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: isMobile ? 30 : 44, fontWeight: 500,
          lineHeight: 1.1, letterSpacing: '-0.02em',
          margin: '0 0 14px',
        }}>Richiesta inviata!</h1>

        <p style={{
          fontSize: isMobile ? 14 : 16,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5, margin: '0 0 28px',
        }}>
          Confermeremo entro 24 ore via email. Nel frattempo puoi vedere la richiesta nella scheda di {pet?.name}.
        </p>

        <div style={{
          background: 'var(--color-surface-main)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--r-lg)',
          padding: 20, textAlign: 'left', marginBottom: 24,
        }}>
          <Row label="Pet" value={pet?.name}/>
          <div style={{ height: 10 }}/>
          <Row label="Servizio" value={appt?.service}/>
          <div style={{ height: 10 }}/>
          <Row label="Data" value={appt ? new Date(appt.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}/>
          <div style={{ height: 10 }}/>
          <Row label="Ora" value={appt?.time}/>
          <div style={{ height: 10 }}/>
          <Row label="Dove" value={appt?.location}/>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => nav('pet', { id: pet?.id })} style={{
            background: 'transparent', color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)',
            padding: '12px 22px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Scheda di {pet?.name}</button>
          <button onClick={() => nav('dashboard')} style={{
            background: 'var(--color-primary)', color: '#FBF6F3',
            border: 'none', borderRadius: 'var(--r-md)',
            padding: '12px 22px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Torna alla home</button>
        </div>
      </div>

      {isMobile && <BottomNav active="dashboard"/>}
    </div>
  );
};

registerRoute('booking', BookingScreen);
registerRoute('booking-confirm', BookingConfirmScreen);
