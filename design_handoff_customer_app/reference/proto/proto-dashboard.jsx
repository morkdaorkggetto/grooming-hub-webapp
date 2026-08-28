// ───────────────────────────────────────────────────────────
// PROTO · Navigation primitives + Dashboard + Pet page
// ───────────────────────────────────────────────────────────

// ─── Top nav (desktop) ────────────────────────────────────────────────────
const TopNav = ({ active }) => {
  const { user, nav } = useApp();
  const items = [
    { key: 'dashboard', label: 'Home' },
    { key: 'pet',       label: 'I miei pet' },
    { key: 'shop',      label: 'Boutique' },
    { key: 'profile',   label: 'Profilo' },
  ];
  const initials = (user?.name || 'U').slice(0, 1).toUpperCase();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 48px', borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-surface-main)',
    }}>
      <button onClick={() => nav('dashboard')} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: 0, fontFamily: 'inherit',
      }}>
        <AuthBrandmark size={32}/>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {items.map(it => {
          const isActive = active === it.key;
          return (
            <button key={it.key} onClick={() => nav(it.key === 'pet' ? 'pet' : it.key, it.key === 'pet' ? { id: 'luna' } : {})}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 18px', fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                borderRadius: 999, fontFamily: 'inherit',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                borderRadius: 0,
              }}>
              {it.label}
            </button>
          );
        })}
      </div>
      <button onClick={() => nav('profile')} style={{
        background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)',
        width: 40, height: 40, borderRadius: 999,
        cursor: 'pointer', fontSize: 14, fontWeight: 700,
        fontFamily: 'inherit', color: 'var(--color-text-primary)',
      }}>{initials}</button>
    </div>
  );
};

// ─── Bottom nav (mobile) ──────────────────────────────────────────────────
const BottomNav = ({ active }) => {
  const { nav } = useApp();
  const items = [
    { key: 'dashboard', label: 'Home',     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9z"/></svg> },
    { key: 'pet',       label: 'Pet',      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="9" r="2"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/><path d="M7 15c0-3 2-5 5-5s5 2 5 5c0 2.5-2 4-5 4s-5-1.5-5-4z"/></svg> },
    { key: 'shop',      label: 'Boutique', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg> },
    { key: 'profile',   label: 'Profilo',  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg> },
  ];
  return (
    <div style={{
      position: 'sticky', bottom: 0,
      background: 'var(--color-surface-main)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex', padding: '10px 8px 28px',
      justifyContent: 'space-around',
    }}>
      {items.map(it => {
        const isActive = active === it.key;
        return (
          <button key={it.key} onClick={() => nav(it.key === 'pet' ? 'pet' : it.key, it.key === 'pet' ? { id: 'luna' } : {})}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontFamily: 'inherit', fontSize: 10, fontWeight: 600, padding: '4px 8px',
            }}>
            {it.icon}
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Pet avatar/tier helpers ──────────────────────────────────────────────
const PetAvatarProto = ({ pet, size = 56 }) => {
  const tierBg = {
    gold:   '#F4E3A1',
    silver: '#E5E7EB',
    bronze: '#EBC9A7',
    base:   '#f5eadf',
  }[pet?.tier] || '#f5eadf';
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.max(12, size / 4),
      background: tierBg, display: 'grid', placeItems: 'center',
      fontSize: size * 0.5, flexShrink: 0,
    }}>🐕</div>
  );
};

const TierBadge = ({ tier }) => {
  const map = {
    bronze: { bg: '#f6e7d7', fg: '#8a5a2a', label: 'Bronzo' },
    silver: { bg: '#eceef2', fg: '#4a5668', label: 'Argento' },
    gold:   { bg: '#faedc4', fg: '#7a5a0a', label: 'Oro' },
  };
  const s = map[tier];
  if (!s) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: 11, fontWeight: 700,
    }}>{s.label}</span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    pending:   { bg: '#efe3de', fg: '#7f5d60', label: 'In attesa di conferma' },
    confirmed: { bg: '#e3f0e7', fg: '#4f8b67', label: 'Confermato' },
    done:      { bg: '#eceef2', fg: '#4a5668', label: 'Completato' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: s.fg }}/>
      {s.label}
    </span>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────
const formatAppt = (a) => {
  const d = new Date(a.date);
  const day = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  return day.charAt(0).toUpperCase() + day.slice(1);
};

const DashboardScreen = () => {
  const { viewport, user, pets, appointments, nav } = useApp();
  const isMobile = viewport === 'mobile';
  const nextAppt = appointments.find(a => a.status !== 'done');
  const luna = pets[0];

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="dashboard"/>}

      <div style={{ padding: isMobile ? '18px 22px 24px' : '40px 48px 60px', maxWidth: isMobile ? 'unset' : 1200, margin: '0 auto' }}>

        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <AuthBrandmark size={28}/>
            <button onClick={() => nav('profile')} style={{
              background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)',
              width: 36, height: 36, borderRadius: 999, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            }}>{(user?.name||'U').slice(0,1).toUpperCase()}</button>
          </div>
        )}

        {/* Eyebrow */}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 14,
        }}>
          <span style={{ width: 24, height: 1, background: 'var(--color-text-secondary)' }}/>
          Bentornata, {user?.name || 'utente'}
        </div>

        {/* Hero */}
        {nextAppt ? (
          <>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 32 : 56, fontWeight: 500,
              lineHeight: 1.05, letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}>
              La giornata di <em style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>{luna?.name || 'il tuo pet'}</em>
            </h1>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 32 : 56, fontWeight: 500,
              lineHeight: 1.05, letterSpacing: '-0.02em',
              margin: '0 0 16px',
              color: 'var(--color-text-secondary)',
            }}>
              inizia {formatAppt(nextAppt).split(' ')[0]}.
            </h1>
            <p style={{
              fontSize: isMobile ? 14 : 16, color: 'var(--color-text-secondary)',
              lineHeight: 1.55, margin: '0 0 20px', maxWidth: 520,
            }}>
              {nextAppt.service} con {nextAppt.groomer} alle {nextAppt.time}.
              Ti aspettiamo in negozio, al solito posto: {nextAppt.location}.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: isMobile ? 28 : 40, flexWrap: 'wrap' }}>
              <button onClick={() => nav('booking')} style={{
                background: 'var(--color-primary)', color: '#FBF6F3',
                border: 'none', borderRadius: 'var(--r-md)',
                padding: '12px 22px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Nuova prenotazione</button>
              <button onClick={() => nav('pet', { id: luna?.id })} style={{
                background: 'transparent', color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)',
                padding: '12px 22px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Vedi scheda di {luna?.name}</button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 32 : 56, fontWeight: 500,
              lineHeight: 1.05, letterSpacing: '-0.02em',
              margin: '0 0 16px',
            }}>
              Bentornata,<br/>
              <em style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>{user?.name || 'utente'}</em>.
            </h1>
            <p style={{
              fontSize: isMobile ? 14 : 16, color: 'var(--color-text-secondary)',
              lineHeight: 1.55, margin: '0 0 20px', maxWidth: 520,
            }}>
              Non hai appuntamenti in programma. Prenota la prossima visita quando vuoi.
            </p>
            <div style={{ marginBottom: isMobile ? 28 : 40 }}>
              <button onClick={() => nav('booking')} style={{
                background: 'var(--color-primary)', color: '#FBF6F3',
                border: 'none', borderRadius: 'var(--r-md)',
                padding: '12px 22px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Prenota una visita</button>
            </div>
          </>
        )}

        {/* Cards row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 1fr',
          gap: 14,
        }}>
          {/* Pet card */}
          {luna && (
            <button onClick={() => nav('pet', { id: luna.id })} style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--r-lg)',
              padding: 20, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', color: 'inherit',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <PetAvatarProto pet={luna} size={56}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                    marginBottom: 2,
                  }}>I tuoi pet</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{luna.name}</span>
                    <TierBadge tier={luna.tier}/>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{luna.breed}</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
              </div>
            </button>
          )}

          {/* Next appt */}
          {nextAppt && (
            <div style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--r-lg)',
              padding: 20,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                marginBottom: 8,
              }}>Prossimo appuntamento</div>
              <div style={{ marginBottom: 8 }}><StatusBadge status={nextAppt.status}/></div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, lineHeight: 1.2, margin: '6px 0' }}>
                {formatAppt(nextAppt)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Ore {nextAppt.time} · {nextAppt.service}
              </div>
            </div>
          )}

          {/* Fedeltà shortcut */}
          <div style={{
            background: 'var(--color-secondary)',
            color: '#FBF6F3',
            borderRadius: 'var(--r-lg)',
            padding: 20,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', opacity: 0.7,
              marginBottom: 8,
            }}>Il club</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, lineHeight: 1.15, marginBottom: 8 }}>
              Livello {luna?.tier === 'gold' ? 'Oro' : luna?.tier === 'silver' ? 'Argento' : 'Bronzo'}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.45 }}>
              {luna?.coins || 0} visite · sconto fedeltà del {luna?.tier === 'gold' ? '15%' : luna?.tier === 'silver' ? '10%' : '5%'} in boutique.
            </div>
          </div>
        </div>

        {/* Shortcut to boutique */}
        <div style={{ marginTop: isMobile ? 22 : 32 }}>
          <button onClick={() => nav('shop')} style={{
            width: '100%', textAlign: 'left',
            background: 'var(--color-surface-soft)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--r-lg)',
            padding: 20, cursor: 'pointer',
            fontFamily: 'inherit', color: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                marginBottom: 6,
              }}>Boutique</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
                Selezione per {luna?.name || 'il tuo pet'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Ordini online, ritiri alla prossima visita.
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>

      {isMobile && <BottomNav active="dashboard"/>}
    </div>
  );
};

// ─── PET PAGE (V1 Editoriale) ─────────────────────────────────────────────
const PetScreen = (params) => {
  const { viewport, pets, appointments, nav } = useApp();
  const isMobile = viewport === 'mobile';
  const pet = pets.find(p => p.id === params?.id) || pets[0];
  if (!pet) return null;

  const history = appointments
    .filter(a => a.petId === pet.id)
    .sort((a,b) => b.date.localeCompare(a.date));

  const age = pet.birthdate ? (() => {
    const b = new Date(pet.birthdate);
    const diff = (Date.now() - b) / (1000 * 60 * 60 * 24 * 365.25);
    return diff.toFixed(1) + ' anni';
  })() : '—';

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="pet"/>}

      <div style={{ padding: isMobile ? '18px 22px 24px' : '40px 48px 60px', maxWidth: isMobile ? 'unset' : 1040, margin: '0 auto' }}>

        {isMobile && (
          <button onClick={() => nav('dashboard')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 13, color: 'var(--color-text-secondary)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginBottom: 14, fontFamily: 'inherit',
          }}>← Home</button>
        )}

        {/* Hero */}
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 28, alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: isMobile ? 22 : 36,
        }}>
          <PetAvatarProto pet={pet} size={isMobile ? 80 : 140}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>La scheda di</div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 40 : 64, fontWeight: 500,
              lineHeight: 1, letterSpacing: '-0.02em',
              margin: '0 0 10px',
            }}>{pet.name}</h1>
            <div style={{ fontSize: isMobile ? 14 : 16, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              {pet.breed} · {age}
            </div>
            <TierBadge tier={pet.tier}/>
          </div>
          {!isMobile && (
            <button onClick={() => nav('booking', { petId: pet.id })} style={{
              background: 'var(--color-primary)', color: '#FBF6F3',
              border: 'none', borderRadius: 'var(--r-md)',
              padding: '14px 24px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>Prenota per {pet.name}</button>
          )}
        </div>

        {isMobile && (
          <button onClick={() => nav('booking', { petId: pet.id })} style={{
            width: '100%',
            background: 'var(--color-primary)', color: '#FBF6F3',
            border: 'none', borderRadius: 'var(--r-md)',
            padding: '14px 20px', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: 22,
          }}>Prenota per {pet.name}</button>
        )}

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 10, marginBottom: isMobile ? 24 : 36,
        }}>
          {[
            { label: 'Visite totali', value: history.length + 8 },
            { label: 'Ultima visita', value: history[0] ? new Date(history[0].date).toLocaleDateString('it-IT', {day:'numeric', month:'short'}) : '—' },
            { label: 'Fedeltà', value: pet.tier === 'gold' ? 'Oro' : pet.tier === 'silver' ? 'Argento' : 'Bronzo' },
            { label: 'Visite al livello successivo', value: pet.tier === 'gold' ? '—' : '3' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--r-md)', padding: '14px 16px',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                marginBottom: 6,
              }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--color-text-secondary)',
            marginBottom: 12,
          }}>Storico visite</div>
          {history.length === 0 ? (
            <div style={{
              background: 'var(--color-surface-main)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--r-md)', padding: 24,
              textAlign: 'center', color: 'var(--color-text-secondary)',
              fontSize: 14,
            }}>
              Nessun appuntamento ancora. Prenota la prima visita!
            </div>
          ) : (
            <div style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--r-md)', overflow: 'hidden',
            }}>
              {history.map((a, i) => (
                <div key={a.id} style={{
                  padding: '14px 18px',
                  borderBottom: i < history.length - 1 ? '1px solid var(--color-border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{a.service}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {formatAppt(a)} · Ore {a.time} {a.groomer ? `· con ${a.groomer}` : ''}
                    </div>
                  </div>
                  <StatusBadge status={a.status}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobile && <BottomNav active="pet"/>}
    </div>
  );
};

registerRoute('dashboard', DashboardScreen);
registerRoute('pet', PetScreen);

Object.assign(window, {
  TopNav, BottomNav, PetAvatarProto, TierBadge, StatusBadge,
});
