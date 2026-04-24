// ───────────────────────────────────────────────────────────
// DASHBOARD UTENTE · Variante B (Editorial caldo)
// Desktop 1280 + Mobile 390 affiancati.
// Copy: tu informale ma non infantile.
// Prenotazione: staff conferma manualmente → stati "in attesa"/"confermato".
// Niente pagamenti. Vendita webapp nascosta (solo se profile.type=business).
// ───────────────────────────────────────────────────────────

const MOCK = {
  user: { email: 'martina.greco@example.it', name: 'Martina', initials: 'MG' },
  // Martina ha 2 pet
  pets: [
    { id: 1, name: 'Luna', breed: 'Golden Retriever', age: 4, tier: 'gold',
      visitsCount: 28, points: 420, pointsToNext: 80,
      photo: null, // usa placeholder per ora
      nextAppointment: {
        status: 'confirmed',  // pending | confirmed | completed
        scheduled_at: '2026-04-30T10:30:00',
        service: 'Bagno & tosatura',
        operator: 'Giulia',
        duration: 90,
      },
    },
    { id: 2, name: 'Miele', breed: 'Persiano', age: 2, tier: 'bronze',
      visitsCount: 8, points: 120, pointsToNext: 180,
      photo: null,
      nextAppointment: {
        status: 'pending',
        requested_at: '2026-05-04T00:00:00',
        service: 'Taglio unghie',
        operator: null,
      },
    },
  ],
  visits: [
    { date: '2026-04-11', service: 'Bagno', pet: 'Luna', operator: 'Giulia', price: 25 },
    { date: '2026-04-03', service: 'Taglio unghie', pet: 'Miele', operator: 'Marco', price: 12 },
    { date: '2026-03-15', service: 'Bagno & tosatura', pet: 'Luna', operator: 'Giulia', price: 45 },
    { date: '2026-02-28', service: 'Trattamento completo', pet: 'Luna', operator: 'Giulia', price: 55 },
  ],
  services: [
    { key: 'bath', name: 'Bagno', from: 25, icon: 'bath' },
    { key: 'cut', name: 'Tosatura', from: 35, icon: 'scissors' },
    { key: 'nails', name: 'Taglio unghie', from: 12, icon: 'drop' },
    { key: 'full', name: 'Trattamento completo', from: 55, icon: 'sparkle' },
  ],
};

const fmtDateLong = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
};
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const fmtDateShort = (iso) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

// ───────────────────────────────────────────────────────────
// Bits condivisi fra desktop e mobile
// ───────────────────────────────────────────────────────────

const StatusPill = ({ status, compact = false }) => {
  const map = {
    confirmed: { bg: 'var(--color-success-bg)', fg: 'var(--color-success-text)', label: 'Confermato', dot: true },
    pending: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-text)', label: 'In attesa di conferma', dot: false },
    completed: { bg: 'var(--color-surface-soft)', fg: 'var(--color-text-secondary)', label: 'Concluso', dot: false },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: compact ? '3px 9px' : '4px 11px',
      borderRadius: 999, background: s.bg, color: s.fg,
      fontSize: compact ? 10 : 11, fontWeight: 600,
      letterSpacing: '.02em',
    }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }}/>}
      {s.label}
    </span>
  );
};

// Livello fedeltà: tono editoriale, serif, nessuna emoji-slop
const FidelityLevel = ({ tier, points, pointsToNext, petName, variant = 'light' }) => {
  const dark = variant === 'dark';
  const accent = tier === 'gold' ? '#C9A24A' : tier === 'silver' ? '#A8A8AC' : '#B2806E';
  const label = tier === 'gold' ? 'Oro' : tier === 'silver' ? 'Argento' : 'Bronzo';
  const progress = points / (points + pointsToNext);
  return (
    <div style={{
      padding: 22, borderRadius: 26,
      background: dark ? 'var(--color-secondary)' : 'var(--color-bg-main)',
      color: dark ? '#FBF6F3' : 'var(--color-text-primary)',
      border: dark ? 'none' : '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
        fontWeight: 700, opacity: dark ? .7 : 1, color: dark ? undefined : 'var(--color-text-secondary)',
      }}>Il club di {petName}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 400,
          fontStyle: 'italic', lineHeight: 1, color: accent, letterSpacing: '-.02em',
        }}>{label}</span>
        <span style={{ fontSize: 13, opacity: dark ? .75 : 1, color: dark ? undefined : 'var(--color-text-secondary)' }}>
          {points} punti
        </span>
      </div>

      <div>
        <div style={{
          height: 4, borderRadius: 10,
          background: dark ? 'rgba(251,246,243,.14)' : 'var(--color-surface-soft)',
          overflow: 'hidden',
        }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: accent, borderRadius: 10 }}/>
        </div>
        <div style={{ fontSize: 11, marginTop: 8, opacity: dark ? .75 : 1, color: dark ? undefined : 'var(--color-text-secondary)' }}>
          {pointsToNext} punti al prossimo premio
        </div>
      </div>

      <button style={{
        alignSelf: 'flex-start', marginTop: 4,
        padding: '9px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
        background: dark ? accent : 'var(--color-primary)',
        color: dark ? 'var(--color-secondary)' : '#FBF6F3',
        fontSize: 12, fontWeight: 600, letterSpacing: '.02em',
      }}>
        Vedi i premi →
      </button>
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// DESKTOP · 1280 × 860
// ───────────────────────────────────────────────────────────
const DashboardDesktop = () => {
  const luna = MOCK.pets[0];
  return (
    <div style={{
      width: 1280, height: 860,
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Top bar minimale */}
      <header style={{
        padding: '20px 44px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐕</span>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500,
            letterSpacing: '-.01em',
          }}>Grooming Hub</span>
        </div>
        <nav style={{ display: 'flex', gap: 32, fontSize: 13 }}>
          {['Home', 'Agenda', 'I miei pet', 'Boutique', 'Fedeltà'].map((l, i) => (
            <span key={l} style={{
              fontWeight: i === 0 ? 700 : 500, cursor: 'pointer',
              color: i === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderBottom: i === 0 ? '2px solid var(--color-primary)' : '2px solid transparent',
              paddingBottom: 6,
            }}>{l}</span>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Icon name="bell" size={18} color="var(--color-text-secondary)"/>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--color-primary)', color: '#FBF6F3',
            display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12,
          }}>{MOCK.user.initials}</div>
        </div>
      </header>

      {/* HERO editoriale */}
      <section style={{
        padding: '40px 44px 28px',
        display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 40, alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase',
            color: 'var(--color-primary)', fontWeight: 700, marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ width: 24, height: 1, background: 'var(--color-primary)' }}/>
            Bentornata, {MOCK.user.name}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 64, lineHeight: 1.02,
            fontWeight: 400, letterSpacing: '-.03em', margin: 0,
          }}>
            La giornata di <em style={{ color: 'var(--color-primary)' }}>Luna</em><br/>
            <span style={{ color: 'var(--color-text-secondary)' }}>inizia giovedì.</span>
          </h1>
          <p style={{
            marginTop: 18, fontSize: 15, color: 'var(--color-text-secondary)',
            maxWidth: 480, lineHeight: 1.65,
          }}>
            Bagno e tosatura con Giulia alle 10:30. Ti aspettiamo in negozio —
            ci vediamo al solito posto, via Po 14.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
            <button style={{
              padding: '13px 24px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: 'var(--color-primary)', color: '#FBF6F3',
              fontSize: 14, fontWeight: 600,
            }}>Vedi dettagli</button>
            <button style={{
              padding: '13px 24px', borderRadius: 999, cursor: 'pointer',
              background: 'transparent', color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)', fontSize: 14, fontWeight: 500,
            }}>Nuova prenotazione</button>
          </div>
        </div>

        {/* Card appuntamento — la "tessera" */}
        <div style={{
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          borderRadius: 28, padding: 26, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 18, right: 18,
          }}>
            <StatusPill status="confirmed"/>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <PetAvatar name="Luna" size={56} tier="gold"/>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, lineHeight: 1 }}>
                {luna.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                {luna.breed} · {luna.age} anni
              </div>
            </div>
          </div>

          <div style={{
            padding: '14px 16px', background: 'var(--color-surface-main)',
            borderRadius: 16, marginBottom: 12,
          }}>
            <div style={{
              fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'var(--color-text-secondary)', fontWeight: 700,
            }}>Quando</div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, marginTop: 4,
              textTransform: 'capitalize',
            }}>
              {fmtDateLong(luna.nextAppointment.scheduled_at)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Ore {fmtTime(luna.nextAppointment.scheduled_at)} · durata ~{luna.nextAppointment.duration} min
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{
              padding: '12px 14px', background: 'var(--color-surface-main)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', fontWeight: 700 }}>Servizio</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                {luna.nextAppointment.service}
              </div>
            </div>
            <div style={{
              padding: '12px 14px', background: 'var(--color-surface-main)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', fontWeight: 700 }}>Con</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                {luna.nextAppointment.operator}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY: 3 colonne */}
      <section style={{
        padding: '8px 44px 36px',
        display: 'grid', gridTemplateColumns: '1.1fr 0.85fr 1fr', gap: 20,
        flex: 1, minHeight: 0,
      }}>

        {/* Colonna 1 · I tuoi pet */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingBottom: 12, marginBottom: 14,
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>
              I tuoi pet
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
              + Aggiungi
            </span>
          </div>

          {MOCK.pets.map(p => (
            <div key={p.id} style={{
              padding: 16, borderRadius: 20, marginBottom: 12,
              background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer',
            }}>
              <PetAvatar name={p.name} size={54} tier={p.tier}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>
                    {p.name}
                  </div>
                  <FidelityBadge tier={p.tier} compact/>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                  {p.breed} · {p.age} anni · {p.visitsCount} visite
                </div>
                {p.nextAppointment && (
                  <div style={{ marginTop: 8, paddingTop: 8,
                    borderTop: '1px dashed var(--color-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {p.nextAppointment.status === 'confirmed'
                        ? `${fmtDateShort(p.nextAppointment.scheduled_at)} · ${fmtTime(p.nextAppointment.scheduled_at)}`
                        : `Richiesto per ${fmtDateShort(p.nextAppointment.requested_at)}`}
                    </span>
                    <StatusPill status={p.nextAppointment.status} compact/>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Colonna 2 · Fedeltà */}
        <div>
          <div style={{
            paddingBottom: 12, marginBottom: 14,
            borderBottom: '1px solid var(--color-border)',
            fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500,
          }}>Fedeltà</div>
          <FidelityLevel
            tier="gold" points={420} pointsToNext={80}
            petName="Luna" variant="dark"
          />
        </div>

        {/* Colonna 3 · Storico */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingBottom: 12, marginBottom: 14,
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>
              Ultime visite
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Tutte →
            </span>
          </div>
          <div>
            {MOCK.visits.map((v, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderBottom: i < MOCK.visits.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{
                  width: 44, textAlign: 'center', flexShrink: 0,
                  fontFamily: 'var(--font-serif)',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 500, lineHeight: 1 }}>
                    {new Date(v.date).getDate()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 2 }}>
                    {new Date(v.date).toLocaleDateString('it-IT', { month: 'short' }).replace('.', '')}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v.service}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {v.pet} · {v.operator}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500,
                }}>{v.price}€</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// MOBILE · 390 × 844 dentro IOSDevice
// view: 'fold' (above-the-fold) | 'scrolled' (seconda metà)
// ───────────────────────────────────────────────────────────
const DashboardMobile = ({ view = 'fold' }) => {
  const luna = MOCK.pets[0];
  const isFold = view === 'fold';

  const content = (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden',
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '56px 22px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🐕</span>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
            letterSpacing: '-.01em',
          }}>Grooming Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="bell" size={18} color="var(--color-text-secondary)"/>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-primary)', color: '#FBF6F3',
            display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12,
          }}>{MOCK.user.initials}</div>
        </div>
      </div>

      {/* Scroll area — in fold mode mostriamo solo hero+appt+pets. In scrolled: tutto il resto. */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '8px 22px 110px' }}>
      {isFold && (<React.Fragment>
        {/* Eyebrow + hero */}
        <div style={{
          fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'var(--color-primary)', fontWeight: 700, marginTop: 8, marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 18, height: 1, background: 'var(--color-primary)' }}/>
          Bentornata, {MOCK.user.name}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1.05,
          fontWeight: 400, letterSpacing: '-.02em', margin: 0,
        }}>
          La giornata di <em style={{ color: 'var(--color-primary)' }}>Luna</em><br/>
          <span style={{ color: 'var(--color-text-secondary)' }}>inizia giovedì.</span>
        </h1>

        {/* Card appuntamento */}
        <div style={{
          marginTop: 20, padding: 18, borderRadius: 22,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PetAvatar name="Luna" size={40} tier="gold"/>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, lineHeight: 1 }}>
                  Luna
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                  {luna.breed}
                </div>
              </div>
            </div>
            <StatusPill status="confirmed" compact/>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--color-surface-main)', borderRadius: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
              color: 'var(--color-text-secondary)', fontWeight: 700 }}>Quando</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500,
              marginTop: 3, textTransform: 'capitalize' }}>
              {fmtDateLong(luna.nextAppointment.scheduled_at)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Ore {fmtTime(luna.nextAppointment.scheduled_at)} · {luna.nextAppointment.service} · con {luna.nextAppointment.operator}
            </div>
          </div>

          <button style={{
            width: '100%', marginTop: 12, padding: '12px 16px', borderRadius: 999,
            border: 'none', cursor: 'pointer',
            background: 'var(--color-primary)', color: '#FBF6F3',
            fontSize: 13, fontWeight: 600,
          }}>Vedi dettagli</button>
        </div>

        {/* I tuoi pet — swipe hint */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginTop: 24, marginBottom: 10,
        }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>
            I tuoi pet
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
            + Aggiungi
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {MOCK.pets.map(p => (
            <div key={p.id} style={{
              flex: 1, padding: 14, borderRadius: 18,
              background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <PetAvatar name={p.name} size={42} tier={p.tier}/>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500 }}>{p.name}</div>
              {p.nextAppointment && (
                <StatusPill status={p.nextAppointment.status} compact/>
              )}
            </div>
          ))}
        </div>
      </React.Fragment>)}

      {!isFold && (<React.Fragment>
        {/* Hint "scrolled" */}
        <div style={{
          fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'var(--color-text-secondary)', fontWeight: 700, marginTop: 4, marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 18, height: 1, background: 'var(--color-border)' }}/>
          Continua a scorrere
        </div>

        {/* Fedeltà */}
        <div style={{ marginTop: 0 }}>
          <FidelityLevel
            tier="gold" points={420} pointsToNext={80}
            petName="Luna" variant="dark"
          />
        </div>

        {/* Prenota al volo */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginTop: 24, marginBottom: 10,
        }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>
            Prenota al volo
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {MOCK.services.map(s => (
            <div key={s.key} style={{
              padding: 12, borderRadius: 14,
              background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'var(--color-surface-soft)',
                display: 'grid', placeItems: 'center',
              }}>
                <Icon name={s.icon} size={14} color="var(--color-primary)"/>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                  da {s.from}€
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ultime visite compatto */}
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
          marginTop: 24, marginBottom: 8 }}>Ultime visite</div>
        <div style={{
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          borderRadius: 18, padding: '4px 14px',
        }}>
          {MOCK.visits.slice(0, 3).map((v, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0',
              borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none',
            }}>
              <div style={{ width: 36, textAlign: 'center', flexShrink: 0, fontFamily: 'var(--font-serif)' }}>
                <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1 }}>
                  {new Date(v.date).getDate()}
                </div>
                <div style={{ fontSize: 9, color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>
                  {new Date(v.date).toLocaleDateString('it-IT', { month: 'short' }).replace('.', '')}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{v.service}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                  {v.pet} · {v.operator}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 500 }}>
                {v.price}€
              </div>
            </div>
          ))}
        </div>
      </React.Fragment>)}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'absolute', bottom: 16, left: 14, right: 14,
        background: 'var(--color-surface-main)',
        border: '1px solid var(--color-border)',
        borderRadius: 999, padding: 5,
        boxShadow: '0 4px 20px rgba(42,31,22,.1)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        {[
          ['home', 'Home', 'home', true],
          ['pets', 'Pet', 'paw'],
          ['book', 'Prenota', 'plus', false, true],
          ['loyalty', 'Club', 'gift'],
          ['profile', 'Tu', 'user'],
        ].map(([k, l, ic, active, cta]) => (
          <div key={k} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, padding: '8px 4px', cursor: 'pointer', borderRadius: 999,
            background: cta ? 'var(--color-primary)' : (active ? 'var(--color-surface-soft)' : 'transparent'),
            color: cta ? '#FBF6F3' : (active ? 'var(--color-primary)' : 'var(--color-text-secondary)'),
          }}>
            <Icon name={ic} size={16} color={cta ? '#FBF6F3' : (active ? 'var(--color-primary)' : 'var(--color-text-secondary)')}/>
            <div style={{ fontSize: 9, fontWeight: active || cta ? 700 : 500 }}>{l}</div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <IOSDevice width={390} height={844}>
      {content}
    </IOSDevice>
  );
};

window.DashboardDesktop = DashboardDesktop;
window.DashboardMobile = DashboardMobile;
