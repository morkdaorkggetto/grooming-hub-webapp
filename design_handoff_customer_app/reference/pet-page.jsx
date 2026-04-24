// ───────────────────────────────────────────────────────────
// SCHEDA PET · /u/pet/:id · 2 VARIANTI
// V1 · Editoriale   → continua il linguaggio della dashboard
// V2 · Tabbed       → struttura utility con tab, meno scroll
// Entrambe: desktop + mobile. Fedeltà PER PET. No QR pubblico.
// Foto profilo singola sostituibile. Anagrafica: editabili solo
// campi non-ufficiali (peso, note).
// ───────────────────────────────────────────────────────────

const PET = {
  id: 1,
  name: 'Luna',
  breed: 'Golden Retriever',
  sex: 'Femmina',
  birth: '2022-03-14',
  age: '4 anni',
  microchip: '380260002104567',
  color: 'Dorato',
  // editabili dall'utente
  weight_kg: 27.4,
  favouriteFood: 'Salmone, mela a pezzetti, formaggio grana',
  notes: 'È un po\' timida col phon, ama le carezze sulla testa.',
  // stato
  tier: 'gold',
  points: 420,
  pointsToNext: 80,
  visitsCount: 28,
  lastVisitDate: '2026-04-11',
  // appuntamenti
  nextAppointment: {
    status: 'confirmed',
    scheduled_at: '2026-04-30T10:30:00',
    service: 'Bagno & tosatura',
    operator: 'Giulia',
    duration: 90,
  },
  visits: [
    { date: '2026-04-11', service: 'Bagno', operator: 'Giulia', price: 25, note: 'Tranquilla' },
    { date: '2026-03-15', service: 'Bagno & tosatura', operator: 'Giulia', price: 45, note: 'Pelo in forma' },
    { date: '2026-02-28', service: 'Trattamento completo', operator: 'Giulia', price: 55 },
    { date: '2026-02-02', service: 'Taglio unghie', operator: 'Marco', price: 12 },
    { date: '2026-01-08', service: 'Bagno', operator: 'Giulia', price: 25 },
    { date: '2025-12-14', service: 'Bagno & tosatura', operator: 'Giulia', price: 45 },
  ],
};

const fmtLongDate = (iso) => new Date(iso).toLocaleDateString('it-IT',
  { weekday: 'long', day: 'numeric', month: 'long' });
const fmtTimeIt = (iso) => new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const calcAge = (isoBirth) => {
  const d = new Date(isoBirth);
  const years = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
  return `${Math.floor(years)} anni`;
};

// ───────────────────────────────────────────────────────────
// Blocchi condivisi
// ───────────────────────────────────────────────────────────

// Grande avatar editabile con overlay "cambia foto"
const PetHeroAvatar = ({ name, tier, size = 140 }) => (
  <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
    <PetAvatar name={name} tier={tier} size={size}/>
    <div style={{
      position: 'absolute', bottom: 6, right: 6,
      width: 36, height: 36, borderRadius: '50%',
      background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
      boxShadow: '0 3px 10px rgba(42,31,22,.12)',
      display: 'grid', placeItems: 'center', cursor: 'pointer',
    }}>
      <Icon name="camera" size={16} color="var(--color-text-primary)"/>
    </div>
  </div>
);

// Riga dato anagrafica. Se editable, mostra lapis e stile hover.
const DataRow = ({ label, value, editable = false, unit = '' }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '11px 0',
    borderBottom: '1px solid var(--color-border)',
  }}>
    <span style={{
      fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
      color: 'var(--color-text-secondary)', fontWeight: 600,
    }}>{label}</span>
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 14, fontWeight: 500,
      color: 'var(--color-text-primary)',
    }}>
      {value}{unit && ` ${unit}`}
      {editable && (
        <Icon name="pencil" size={13} color="var(--color-primary)"/>
      )}
    </span>
  </div>
);

// Banner fedeltà del SINGOLO pet
const PetFidelityCard = ({ tier, points, pointsToNext, petName, compact = false }) => {
  const accent = tier === 'gold' ? '#C9A24A' : tier === 'silver' ? '#A8A8AC' : '#B2806E';
  const label = tier === 'gold' ? 'Oro' : tier === 'silver' ? 'Argento' : 'Bronzo';
  const progress = points / (points + pointsToNext);
  return (
    <div style={{
      padding: compact ? 18 : 22, borderRadius: 24,
      background: 'var(--color-secondary)', color: '#FBF6F3',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
        fontWeight: 700, opacity: .7,
      }}>Il club di {petName}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: compact ? 38 : 48, fontWeight: 400,
          fontStyle: 'italic', lineHeight: 1, color: accent, letterSpacing: '-.02em',
        }}>{label}</span>
        <span style={{ fontSize: 12, opacity: .8 }}>
          {points} punti · {PET.visitsCount} visite
        </span>
      </div>

      <div>
        <div style={{ height: 4, borderRadius: 10, background: 'rgba(251,246,243,.14)', overflow: 'hidden' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: accent }}/>
        </div>
        <div style={{ fontSize: 11, marginTop: 8, opacity: .75 }}>
          {pointsToNext} punti al prossimo premio
        </div>
      </div>
    </div>
  );
};

const AppointmentCard = ({ appt, compact = false }) => {
  const statusMap = {
    confirmed: { bg: 'var(--color-success-bg)', fg: 'var(--color-success-text)', label: 'Confermato', dot: true },
    pending: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-text)', label: 'In attesa', dot: false },
  };
  const s = statusMap[appt.status];
  return (
    <div style={{
      padding: compact ? 16 : 20, borderRadius: 22,
      background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 14, right: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 11px', borderRadius: 999, background: s.bg, color: s.fg,
          fontSize: 11, fontWeight: 600,
        }}>
          {s.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }}/>}
          {s.label}
        </span>
      </div>
      <div style={{
        fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
        color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8,
      }}>Prossimo appuntamento</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: compact ? 20 : 24, fontWeight: 500,
        lineHeight: 1.15, textTransform: 'capitalize', marginBottom: 4,
      }}>
        {fmtLongDate(appt.scheduled_at)}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
        Ore {fmtTimeIt(appt.scheduled_at)} · {appt.service} · con {appt.operator}
      </div>
    </div>
  );
};

const VisitsTimeline = ({ visits, limit = 999 }) => (
  <div>
    {visits.slice(0, limit).map((v, i) => (
      <div key={i} style={{
        display: 'flex', alignItems: 'flex-start', gap: 16,
        padding: '14px 0',
        borderBottom: i < Math.min(visits.length, limit) - 1 ? '1px solid var(--color-border)' : 'none',
      }}>
        <div style={{
          width: 48, textAlign: 'center', flexShrink: 0,
          fontFamily: 'var(--font-serif)', paddingTop: 2,
        }}>
          <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>
            {new Date(v.date).getDate()}
          </div>
          <div style={{
            fontSize: 10, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 3,
          }}>
            {new Date(v.date).toLocaleDateString('it-IT', { month: 'short' }).replace('.', '')}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{v.service}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            con {v.operator}{v.note ? ` · "${v.note}"` : ''}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500 }}>
          {v.price}€
        </div>
      </div>
    ))}
  </div>
);

// Mini top-bar comune alle varianti
const TopBar = ({ active = 'I miei pet' }) => (
  <header style={{
    padding: '20px 44px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0, background: 'var(--color-surface-main)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 22 }}>🐕</span>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, letterSpacing: '-.01em' }}>
        Grooming Hub
      </span>
    </div>
    <nav style={{ display: 'flex', gap: 32, fontSize: 13 }}>
      {['Home', 'Agenda', 'I miei pet', 'Boutique', 'Fedeltà'].map(l => (
        <span key={l} style={{
          fontWeight: l === active ? 700 : 500, cursor: 'pointer',
          color: l === active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          borderBottom: l === active ? '2px solid var(--color-primary)' : '2px solid transparent',
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
      }}>MG</div>
    </div>
  </header>
);

// Breadcrumb / back link
const Breadcrumb = () => (
  <div style={{
    fontSize: 12, color: 'var(--color-text-secondary)',
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
  }}>
    <span style={{ cursor: 'pointer' }}>I miei pet</span>
    <Icon name="chevron" size={12} color="var(--color-text-secondary)"/>
    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{PET.name}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════
// V1 · EDITORIALE · DESKTOP
// ═══════════════════════════════════════════════════════════
const PetPageV1Desktop = () => (
  <div style={{
    width: 1280, height: 860, background: 'var(--color-surface-main)',
    fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }}>
    <TopBar/>

    <div style={{ padding: '32px 44px', overflow: 'hidden', flex: 1 }}>
      <Breadcrumb/>

      {/* HERO: avatar grande + anagrafica compatta */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 36,
        alignItems: 'flex-start', marginBottom: 32,
      }}>
        <PetHeroAvatar name={PET.name} tier={PET.tier} size={140}/>

        <div>
          <div style={{
            fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase',
            color: 'var(--color-primary)', fontWeight: 700, marginBottom: 10,
          }}>
            Scheda pet
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 1,
            fontWeight: 400, letterSpacing: '-.03em', margin: 0,
          }}>
            {PET.name}
          </h1>
          <p style={{
            marginTop: 10, fontSize: 14, color: 'var(--color-text-secondary)',
            maxWidth: 420, lineHeight: 1.6,
          }}>
            {PET.breed} · {PET.age} · {PET.sex.toLowerCase()} ·
            {' '}ha visto Giulia {PET.visitsCount} volte.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            padding: '13px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--color-primary)', color: '#FBF6F3',
            fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            Prenota per {PET.name}
          </button>
          <button style={{
            padding: '11px 18px', borderRadius: 999,
            background: 'transparent', border: '1px solid var(--color-border)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--color-text-primary)',
          }}>
            Contatta il negozio
          </button>
        </div>
      </section>

      {/* BODY: 3 colonne */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24,
      }}>
        {/* COL 1: Appuntamento + Fedeltà */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AppointmentCard appt={PET.nextAppointment}/>
          <PetFidelityCard
            tier={PET.tier} points={PET.points} pointsToNext={PET.pointsToNext}
            petName={PET.name}
          />
        </div>

        {/* COL 2: Anagrafica */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingBottom: 12, marginBottom: 6,
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>
              Anagrafica
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              alcuni campi gestiti dallo staff
            </span>
          </div>
          <DataRow label="Razza"     value={PET.breed}/>
          <DataRow label="Sesso"     value={PET.sex}/>
          <DataRow label="Data di nascita" value={new Date(PET.birth).toLocaleDateString('it-IT')}/>
          <DataRow label="Microchip" value={PET.microchip}/>
          <DataRow label="Mantello"  value={PET.color}/>
          <DataRow label="Peso"      value={PET.weight_kg} unit="kg" editable/>
          <DataRow label="Cibo preferito" value={PET.favouriteFood} editable/>
          <div style={{ marginTop: 14 }}>
            <div style={{
              fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              color: 'var(--color-text-secondary)', fontWeight: 600,
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              Note per lo staff
              <Icon name="pencil" size={11} color="var(--color-primary)"/>
            </div>
            <div style={{
              padding: '14px 16px', borderRadius: 14,
              background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              fontSize: 13, lineHeight: 1.5, fontStyle: 'italic',
              color: 'var(--color-text-primary)',
            }}>
              "{PET.notes}"
            </div>
          </div>
        </div>

        {/* COL 3: Storico */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingBottom: 12, marginBottom: 6,
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>
              Le sue visite
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Tutte ({PET.visits.length}) →
            </span>
          </div>
          <VisitsTimeline visits={PET.visits} limit={5}/>
        </div>
      </section>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// V1 · EDITORIALE · MOBILE
// ═══════════════════════════════════════════════════════════
const PetPageV1Mobile = () => {
  const content = (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar con back */}
      <div style={{
        padding: '56px 22px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <span style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name="chevron" size={14} color="var(--color-text-primary)"
                  style={{ transform: 'rotate(180deg)' }}/>
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Scheda pet</div>
        <Icon name="bell" size={18} color="var(--color-text-secondary)"/>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '4px 22px 20px' }}>
        {/* Hero mobile: avatar + nome in editoriale */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <PetHeroAvatar name={PET.name} tier={PET.tier} size={88}/>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
              color: 'var(--color-primary)', fontWeight: 700, marginBottom: 4,
            }}>
              Il tuo pet
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1,
              fontWeight: 400, letterSpacing: '-.02em',
            }}>{PET.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              {PET.breed} · {PET.age}
            </div>
          </div>
        </div>

        {/* Prenota CTA */}
        <button style={{
          width: '100%', padding: '14px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'var(--color-primary)', color: '#FBF6F3',
          fontSize: 14, fontWeight: 600, marginBottom: 18,
        }}>
          Prenota per {PET.name} →
        </button>

        {/* Appuntamento */}
        <AppointmentCard appt={PET.nextAppointment} compact/>

        {/* Fedeltà */}
        <div style={{ marginTop: 14 }}>
          <PetFidelityCard
            tier={PET.tier} points={PET.points} pointsToNext={PET.pointsToNext}
            petName={PET.name} compact
          />
        </div>

        {/* Anagrafica compact */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>
            Anagrafica
          </div>
          <div style={{
            background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
            borderRadius: 18, padding: '4px 14px',
          }}>
            <DataRow label="Razza" value={PET.breed}/>
            <DataRow label="Sesso" value={PET.sex}/>
            <DataRow label="Peso" value={PET.weight_kg} unit="kg" editable/>
            <DataRow label="Cibo preferito" value={PET.favouriteFood} editable/>
            <DataRow label="Microchip" value={'…' + PET.microchip.slice(-6)}/>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginTop: 18 }}>
          <div style={{
            fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--color-text-secondary)', fontWeight: 600,
            marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Note per lo staff
            <Icon name="pencil" size={11} color="var(--color-primary)"/>
          </div>
          <div style={{
            padding: 14, borderRadius: 14,
            background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
            fontSize: 12.5, lineHeight: 1.5, fontStyle: 'italic',
          }}>"{PET.notes}"</div>
        </div>
      </div>
    </div>
  );
  return <IOSDevice width={390} height={844}>{content}</IOSDevice>;
};

// ═══════════════════════════════════════════════════════════
// V2 · TABBED · DESKTOP
// ═══════════════════════════════════════════════════════════
const PetPageV2Desktop = () => {
  const [tab, setTab] = React.useState('panoramica');
  return (
    <div style={{
      width: 1280, height: 860, background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <TopBar/>

      <div style={{ padding: '28px 44px 0', flexShrink: 0 }}>
        <Breadcrumb/>

        {/* Hero V2: striscia orizzontale con avatar, nome, stats inline */}
        <section style={{
          display: 'flex', alignItems: 'center', gap: 24,
          padding: '20px 24px', borderRadius: 24,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          marginBottom: 22,
        }}>
          <PetHeroAvatar name={PET.name} tier={PET.tier} size={96}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1.1,
              fontWeight: 500, letterSpacing: '-.02em',
            }}>{PET.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {PET.breed} · {PET.sex} · {PET.age} · microchip {PET.microchip}
            </div>
          </div>

          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 28, paddingRight: 20,
            borderRight: '1px solid var(--color-border)' }}>
            {[
              { l: 'Livello', v: 'Oro', serif: true },
              { l: 'Punti', v: PET.points },
              { l: 'Visite', v: PET.visitsCount },
            ].map(s => (
              <div key={s.l}>
                <div style={{
                  fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)', fontWeight: 600,
                }}>{s.l}</div>
                <div style={{
                  fontSize: s.serif ? 26 : 22, fontWeight: 600, marginTop: 3,
                  fontFamily: s.serif ? 'var(--font-serif)' : 'inherit',
                  fontStyle: s.serif ? 'italic' : 'normal',
                  color: s.serif ? '#C9A24A' : 'var(--color-text-primary)',
                }}>{s.v}</div>
              </div>
            ))}
          </div>

          <button style={{
            padding: '13px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--color-primary)', color: '#FBF6F3',
            fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
          }}>Prenota per {PET.name}</button>
        </section>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 28, borderBottom: '1px solid var(--color-border)',
        }}>
          {[
            ['panoramica', 'Panoramica'],
            ['visite', `Visite (${PET.visits.length})`],
            ['fedelta', 'Fedeltà'],
          ].map(([k, l]) => (
            <span key={k} onClick={() => setTab(k)} style={{
              padding: '14px 2px', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === k ? 700 : 500,
              color: tab === k ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderBottom: tab === k ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: '26px 44px 36px', flex: 1, overflow: 'hidden' }}>
        {tab === 'panoramica' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: '100%' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
                marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--color-border)' }}>
                Anagrafica
              </div>
              <DataRow label="Razza"     value={PET.breed}/>
              <DataRow label="Sesso"     value={PET.sex}/>
              <DataRow label="Data di nascita" value={new Date(PET.birth).toLocaleDateString('it-IT')}/>
              <DataRow label="Mantello"  value={PET.color}/>
              <DataRow label="Peso"      value={PET.weight_kg} unit="kg" editable/>
              <DataRow label="Cibo preferito" value={PET.favouriteFood} editable/>

              <div style={{ marginTop: 20 }}>
                <div style={{
                  fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  Note per lo staff
                  <Icon name="pencil" size={11} color="var(--color-primary)"/>
                </div>
                <div style={{
                  padding: 14, borderRadius: 14,
                  background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
                  fontSize: 13, lineHeight: 1.5, fontStyle: 'italic',
                }}>"{PET.notes}"</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AppointmentCard appt={PET.nextAppointment}/>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
                  marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--color-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  Ultime visite
                  <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => setTab('visite')}>
                    Tutte →
                  </span>
                </div>
                <VisitsTimeline visits={PET.visits} limit={4}/>
              </div>
            </div>
          </div>
        )}

        {tab === 'visite' && (
          <div style={{
            background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
            borderRadius: 20, padding: '6px 22px', maxWidth: 700,
          }}>
            <VisitsTimeline visits={PET.visits}/>
          </div>
        )}

        {tab === 'fedelta' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 820 }}>
            <PetFidelityCard
              tier={PET.tier} points={PET.points} pointsToNext={PET.pointsToNext}
              petName={PET.name}
            />
            <div style={{
              padding: 22, borderRadius: 24, background: 'var(--color-bg-main)',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
                Come accumula punti {PET.name}
              </div>
              {[
                ['Ogni visita', '+20 pt'],
                ['Pacchetto completo', '+40 pt'],
                ['Recensione', '+15 pt'],
                ['Compleanno pet', '+50 pt'],
              ].map(([l, v]) => (
                <div key={l} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                  borderBottom: '1px solid var(--color-border)', fontSize: 13,
                }}>
                  <span>{l}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// V2 · TABBED · MOBILE
// ═══════════════════════════════════════════════════════════
const PetPageV2Mobile = () => {
  const [tab, setTab] = React.useState('panoramica');

  const content = (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '56px 22px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name="chevron" size={13} color="var(--color-text-primary)"
                style={{ transform: 'rotate(180deg)' }}/>
        </span>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{PET.name}</div>
        <Icon name="bell" size={18} color="var(--color-text-secondary)"/>
      </div>

      {/* Hero striscia compatta */}
      <div style={{ padding: '8px 22px 16px' }}>
        <div style={{
          padding: 16, borderRadius: 20,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <PetHeroAvatar name={PET.name} tier={PET.tier} size={64}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, lineHeight: 1.1,
            }}>{PET.name}</div>
            <div style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              {PET.breed} · {PET.age}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <FidelityBadge tier={PET.tier} compact/>
              <span style={{ fontSize: 10.5, color: 'var(--color-text-secondary)',
                display: 'flex', alignItems: 'center' }}>
                {PET.visitsCount} visite
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 18, padding: '0 22px',
        borderBottom: '1px solid var(--color-border)', flexShrink: 0,
      }}>
        {[
          ['panoramica', 'Panoramica'],
          ['visite', 'Visite'],
          ['fedelta', 'Fedeltà'],
        ].map(([k, l]) => (
          <span key={k} onClick={() => setTab(k)} style={{
            padding: '10px 2px', cursor: 'pointer', fontSize: 12.5,
            fontWeight: tab === k ? 700 : 500,
            color: tab === k ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            borderBottom: tab === k ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: -1,
          }}>{l}</span>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 22px 100px' }}>
        {tab === 'panoramica' && (
          <div>
            <AppointmentCard appt={PET.nextAppointment} compact/>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
                Anagrafica
              </div>
              <div style={{
                background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
                borderRadius: 16, padding: '4px 14px',
              }}>
                <DataRow label="Razza" value={PET.breed}/>
                <DataRow label="Peso" value={PET.weight_kg} unit="kg" editable/>
                <DataRow label="Cibo preferito" value={PET.favouriteFood} editable/>
                <DataRow label="Microchip" value={'…' + PET.microchip.slice(-6)}/>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', fontWeight: 600,
                marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Note per lo staff
                <Icon name="pencil" size={11} color="var(--color-primary)"/>
              </div>
              <div style={{
                padding: 13, borderRadius: 14,
                background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
                fontSize: 12.5, lineHeight: 1.5, fontStyle: 'italic',
              }}>"{PET.notes}"</div>
            </div>
          </div>
        )}

        {tab === 'visite' && (
          <div style={{
            background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
            borderRadius: 16, padding: '2px 16px',
          }}>
            <VisitsTimeline visits={PET.visits} limit={5}/>
          </div>
        )}

        {tab === 'fedelta' && (
          <div>
            <PetFidelityCard
              tier={PET.tier} points={PET.points} pointsToNext={PET.pointsToNext}
              petName={PET.name} compact
            />
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {PET.name} accumula punti a ogni visita. Al raggiungimento del livello successivo
              ottieni uno sconto automatico sulle prossime prenotazioni.
            </div>
          </div>
        )}
      </div>

      {/* CTA ancorata in basso */}
      <div style={{
        position: 'absolute', bottom: 16, left: 14, right: 14,
        padding: 6, borderRadius: 999,
        background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
        boxShadow: '0 4px 20px rgba(42,31,22,.1)',
      }}>
        <button style={{
          width: '100%', padding: '12px 18px', borderRadius: 999,
          border: 'none', cursor: 'pointer',
          background: 'var(--color-primary)', color: '#FBF6F3',
          fontSize: 13, fontWeight: 700,
        }}>
          Prenota per {PET.name} →
        </button>
      </div>
    </div>
  );

  return <IOSDevice width={390} height={844}>{content}</IOSDevice>;
};

window.PetPageV1Desktop = PetPageV1Desktop;
window.PetPageV1Mobile = PetPageV1Mobile;
window.PetPageV2Desktop = PetPageV2Desktop;
window.PetPageV2Mobile = PetPageV2Mobile;
