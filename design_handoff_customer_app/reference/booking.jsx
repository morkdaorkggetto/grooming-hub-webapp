// ───────────────────────────────────────────────────────────
// PRENOTAZIONE · /u/book · single-page
// Staff conferma manualmente → submit = richiesta, non booking.
// 3 entry: 'from-pet' | 'generic' | 'from-service'.
// Calendario-mese + fasce orarie preferite (mattina / pomeriggio).
// Note libere + codice promo.
// Submit → schermata conferma con riepilogo.
// ───────────────────────────────────────────────────────────

const PETS_FOR_BOOKING = [
  { id: 1, name: 'Luna', breed: 'Golden Retriever', tier: 'gold' },
  { id: 2, name: 'Miele', breed: 'Persiano', tier: 'bronze' },
];

const SERVICES_FOR_BOOKING = [
  { key: 'bath', name: 'Bagno', desc: 'Shampoo + asciugatura', from: 25, duration: 45, icon: 'bath' },
  { key: 'cut', name: 'Tosatura', desc: 'Bagno + taglio completo', from: 35, duration: 75, icon: 'scissors' },
  { key: 'nails', name: 'Taglio unghie', desc: 'Rapido e indolore', from: 12, duration: 15, icon: 'drop' },
  { key: 'full', name: 'Trattamento completo', desc: 'Il rituale della casa', from: 55, duration: 120, icon: 'sparkle' },
];

// ───────────────────────────────────────────────────────────
// Calendario mese
// ───────────────────────────────────────────────────────────

const MonthCalendar = ({ selected = '2026-04-30', onSelect = () => {} }) => {
  // Aprile 2026 (hardcoded per mockup coerente)
  // 1 apr = mercoledì → 2 celle vuote prima (lun/mar)
  const month = 'Aprile 2026';
  const daysInMonth = 30;
  const startOffset = 2;  // lun=0, mar=1, mer=2
  const selectedDay = parseInt(selected.split('-')[2], 10);
  const today = 22;       // "oggi" mock
  const unavailable = [5, 12, 19, 26];  // domeniche chiuse

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14,
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500,
          textTransform: 'capitalize',
        }}>{month}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={navBtn}>
            <Icon name="chevron" size={14} color="var(--color-text-primary)" style={{ transform: 'rotate(180deg)' }}/>
          </button>
          <button style={navBtn}>
            <Icon name="chevron" size={14} color="var(--color-text-primary)"/>
          </button>
        </div>
      </div>

      {/* weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {['L','M','M','G','V','S','D'].map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 10, letterSpacing: '.12em',
            fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase',
            padding: '6px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i}/>;
          const isSelected = d === selectedDay;
          const isToday = d === today;
          const isUnavail = unavailable.includes(d) || d < today;
          return (
            <div key={i} onClick={() => !isUnavail && onSelect(d)}
              style={{
                aspectRatio: '1', display: 'grid', placeItems: 'center',
                borderRadius: 12, position: 'relative',
                fontSize: 13, fontWeight: isSelected ? 700 : 500,
                cursor: isUnavail ? 'not-allowed' : 'pointer',
                background: isSelected
                  ? 'var(--color-primary)'
                  : (isToday ? 'var(--color-surface-soft)' : 'transparent'),
                color: isSelected
                  ? '#FBF6F3'
                  : (isUnavail ? 'var(--color-border)' : 'var(--color-text-primary)'),
                border: isToday && !isSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
              }}>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const navBtn = {
  width: 30, height: 30, borderRadius: '50%',
  background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
  display: 'grid', placeItems: 'center', cursor: 'pointer',
};

// ───────────────────────────────────────────────────────────
// Selettore pet (card orizzontali)
// ───────────────────────────────────────────────────────────

const PetSelector = ({ selected = 1 }) => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
    {PETS_FOR_BOOKING.map(p => {
      const isSel = p.id === selected;
      return (
        <div key={p.id} style={{
          padding: '10px 14px 10px 10px', borderRadius: 18,
          background: isSel ? 'var(--color-surface-main)' : 'var(--color-bg-main)',
          border: isSel ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          minWidth: 170,
        }}>
          <PetAvatar name={p.name} tier={p.tier} size={40}/>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, lineHeight: 1 }}>
              {p.name}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              {p.breed}
            </div>
          </div>
          {isSel && (
            <div style={{ marginLeft: 'auto' }}>
              <Icon name="check" size={16} color="var(--color-primary)"/>
            </div>
          )}
        </div>
      );
    })}
    <div style={{
      padding: '10px 14px', borderRadius: 18,
      background: 'transparent', border: '1px dashed var(--color-border)',
      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 600,
    }}>
      <Icon name="plus" size={14} color="var(--color-text-secondary)"/> Nuovo pet
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────
// Selettore servizio
// ───────────────────────────────────────────────────────────

const ServiceSelector = ({ selected = 'cut', compact = false }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : '1fr 1fr',
    gap: 10,
  }}>
    {SERVICES_FOR_BOOKING.map(s => {
      const isSel = s.key === selected;
      return (
        <div key={s.key} style={{
          padding: compact ? 12 : 14, borderRadius: 16,
          background: isSel ? 'var(--color-surface-main)' : 'var(--color-bg-main)',
          border: isSel ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
          cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: isSel ? 'var(--color-primary)' : 'var(--color-surface-soft)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name={s.icon} size={16}
              color={isSel ? '#FBF6F3' : 'var(--color-primary)'}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 500 }}>
                da {s.from}€
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              {s.desc} · ~{s.duration} min
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ───────────────────────────────────────────────────────────
// Fasce orarie
// ───────────────────────────────────────────────────────────

const TimeSlotPicker = ({ selected = 'morning' }) => {
  const slots = [
    { key: 'morning', label: 'Mattina', range: '9:00 – 13:00' },
    { key: 'afternoon', label: 'Pomeriggio', range: '15:00 – 19:00' },
    { key: 'any', label: 'Qualsiasi', range: 'decidete voi' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {slots.map(s => {
        const isSel = s.key === selected;
        return (
          <div key={s.key} style={{
            padding: '12px 14px', borderRadius: 14,
            background: isSel ? 'var(--color-surface-main)' : 'var(--color-bg-main)',
            border: isSel ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            cursor: 'pointer', textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              {s.range}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// Entry header (contextual)
// ───────────────────────────────────────────────────────────

const ContextualHeader = ({ entry, compact = false }) => {
  // entry: 'from-pet' | 'generic' | 'from-service'
  const H = compact ? 20 : 28;
  if (entry === 'from-pet') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: compact ? '10px 14px' : '14px 18px', borderRadius: 18,
        background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
        marginBottom: compact ? 18 : 22,
      }}>
        <PetAvatar name="Luna" tier="gold" size={compact ? 40 : 52}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
            color: 'var(--color-primary)', fontWeight: 700,
          }}>Stai prenotando per</div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: compact ? 20 : 26, fontWeight: 500,
            lineHeight: 1.1, marginTop: 3,
          }}>Luna</div>
        </div>
        <span style={{
          fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline',
        }}>cambia</span>
      </div>
    );
  }
  if (entry === 'from-service') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: compact ? '10px 14px' : '14px 18px', borderRadius: 18,
        background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
        marginBottom: compact ? 18 : 22,
      }}>
        <div style={{
          width: compact ? 40 : 52, height: compact ? 40 : 52, borderRadius: 14,
          background: 'var(--color-surface-soft)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name="sparkle" size={compact ? 18 : 22} color="var(--color-primary)"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
            color: 'var(--color-primary)', fontWeight: 700,
          }}>Servizio scelto</div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: compact ? 20 : 26, fontWeight: 500,
            lineHeight: 1.1, marginTop: 3,
          }}>Trattamento completo <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>da 55€</span></div>
        </div>
        <span style={{
          fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline',
        }}>cambia</span>
      </div>
    );
  }
  return null;  // generic → niente header speciale, il form parte da pet
};

// ───────────────────────────────────────────────────────────
// DESKTOP · BOOKING PAGE
// ───────────────────────────────────────────────────────────

const BookingPageDesktop = ({ entry = 'generic' }) => (
  <div style={{
    width: 1280, height: 860, background: 'var(--color-surface-main)',
    fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }}>
    <TopBar active="Agenda"/>

    <div style={{ padding: '28px 44px 36px', overflow: 'hidden', flex: 1 }}>
      <Breadcrumb label="Nuova prenotazione" parent="Agenda"/>

      {/* Title row */}
      <section style={{ marginBottom: 22 }}>
        <div style={{
          fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8,
        }}>Nuova richiesta</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 48, lineHeight: 1,
          fontWeight: 400, letterSpacing: '-.03em', margin: 0,
        }}>
          Quando ci portate <em style={{ color: 'var(--color-primary)' }}>Luna</em>?
        </h1>
        <p style={{
          marginTop: 10, fontSize: 14, color: 'var(--color-text-secondary)',
          maxWidth: 640, lineHeight: 1.6,
        }}>
          Scegli cosa serve e una data che vi va bene. Vi rispondiamo entro 24 ore
          per confermare operatore e orario esatto.
        </p>
      </section>

      {/* 2 colonne: form + riepilogo sticky */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <ContextualHeader entry={entry}/>

          {entry !== 'from-pet' && (
            <FormField label="Per chi" hint="Seleziona il pet">
              <PetSelector selected={1}/>
            </FormField>
          )}

          {entry !== 'from-service' && (
            <FormField label="Cosa serve" hint="Scegli un servizio, puoi cambiarlo dopo">
              <ServiceSelector selected="cut"/>
            </FormField>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <FormField label="Quando" hint="I giorni grigi sono chiusi o già passati">
              <div style={{
                padding: 18, borderRadius: 18,
                background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
              }}>
                <MonthCalendar selected="2026-04-30"/>
              </div>
            </FormField>

            <FormField label="Preferenza oraria" hint="Lo staff scelera l'orario esatto">
              <TimeSlotPicker selected="morning"/>

              <div style={{ marginTop: 18 }}>
                <div style={{
                  fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 8,
                }}>Codice promo</div>
                <div style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <Icon name="gift" size={16} color="var(--color-text-secondary)"/>
                  <input placeholder="Hai un codice? Inseriscilo qui" style={{
                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    fontSize: 13, color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                  }}/>
                  <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
                    Applica
                  </span>
                </div>
              </div>
            </FormField>
          </div>

          <FormField label="Note per lo staff" hint="Opzionale. Allergie, ansia, richieste particolari…">
            <textarea
              placeholder="Es. Luna è un po' ansiosa col phon, meglio se asciugate poco alla volta."
              defaultValue="Luna è un po' ansiosa col phon."
              style={{
                width: '100%', minHeight: 70, padding: 14, borderRadius: 14,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-main)',
                fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
                resize: 'vertical', outline: 'none',
                color: 'var(--color-text-primary)',
              }}/>
          </FormField>

          <FormField
            label="Cibo preferito di Luna"
            hint="Ci serve per capire i gusti del pet e organizzare il magazzino. Puoi aggiornarlo anche dalla scheda di Luna.">
            <textarea
              placeholder="Es. Salmone, pollo, mela a pezzetti, premi al formaggio…"
              defaultValue="Salmone, mela a pezzetti, formaggio grana"
              style={{
                width: '100%', minHeight: 56, padding: 14, borderRadius: 14,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-main)',
                fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
                resize: 'vertical', outline: 'none',
                color: 'var(--color-text-primary)',
              }}/>
          </FormField>
        </div>

        {/* RIEPILOGO STICKY */}
        <aside style={{
          padding: 22, borderRadius: 24,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          alignSelf: 'flex-start', position: 'sticky', top: 0,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'var(--color-primary)', fontWeight: 700,
          }}>La tua richiesta</div>

          <SummaryRow label="Pet" value="Luna"/>
          <SummaryRow label="Servizio" value="Tosatura" sub="~75 min · da 35€"/>
          <SummaryRow label="Data" value="Giovedì 30 aprile" sub="mattina (9:00 – 13:00)"/>
          <SummaryRow label="Note" value="Ansiosa col phon"/>

          <div style={{
            marginTop: 4, padding: '14px 16px', borderRadius: 14,
            background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
            fontSize: 12, lineHeight: 1.5,
          }}>
            <strong>Non è ancora confermato.</strong><br/>
            Vi rispondiamo entro 24 ore con operatore e orario esatto.
          </div>

          <button style={{
            padding: '14px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--color-primary)', color: '#FBF6F3',
            fontSize: 14, fontWeight: 700, marginTop: 4,
          }}>Invia richiesta →</button>

          <span style={{
            fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center',
          }}>
            Nessun addebito · pagamento in negozio
          </span>
        </aside>
      </div>
    </div>
  </div>
);

// Helpers
const FormField = ({ label, hint, children }) => (
  <div>
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
        color: 'var(--color-text-primary)', fontWeight: 700,
      }}>{label}</div>
      {hint && (
        <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 3 }}>
          {hint}
        </div>
      )}
    </div>
    {children}
  </div>
);

const SummaryRow = ({ label, value, sub }) => (
  <div style={{
    paddingBottom: 12, borderBottom: '1px solid var(--color-border)',
  }}>
    <div style={{
      fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
      color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 4,
    }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>{sub}</div>}
  </div>
);

// ───────────────────────────────────────────────────────────
// TopBar & Breadcrumb (reused, but Breadcrumb accepts label)
// ───────────────────────────────────────────────────────────

// TopBar already defined in pet-page.jsx. Extend Breadcrumb here (different file scope).
const Breadcrumb = ({ label = 'Luna', parent = 'I miei pet' }) => (
  <div style={{
    fontSize: 12, color: 'var(--color-text-secondary)',
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
  }}>
    <span style={{ cursor: 'pointer' }}>{parent}</span>
    <Icon name="chevron" size={12} color="var(--color-text-secondary)"/>
    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{label}</span>
  </div>
);

// ───────────────────────────────────────────────────────────
// DESKTOP · CONFIRMATION
// ───────────────────────────────────────────────────────────

const BookingConfirmDesktop = () => (
  <div style={{
    width: 1280, height: 860, background: 'var(--color-surface-main)',
    fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }}>
    <TopBar active="Agenda"/>

    <div style={{
      flex: 1, display: 'grid', placeItems: 'center',
      padding: '40px 44px',
    }}>
      <div style={{ maxWidth: 620, width: '100%', textAlign: 'center' }}>
        {/* Check decorativo */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--color-success-bg)', color: 'var(--color-success-text)',
          display: 'grid', placeItems: 'center', margin: '0 auto 20px',
        }}>
          <Icon name="check" size={32} color="var(--color-success-text)" stroke={2.5}/>
        </div>

        <div style={{
          fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'var(--color-success-text)', fontWeight: 700, marginBottom: 10,
        }}>Richiesta ricevuta</div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 52, lineHeight: 1.05,
          fontWeight: 400, letterSpacing: '-.03em', margin: 0,
        }}>
          Grazie, Martina.<br/>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Ti rispondiamo entro <em style={{ color: 'var(--color-primary)' }}>24 ore</em>.
          </span>
        </h1>

        <p style={{
          marginTop: 14, fontSize: 15, color: 'var(--color-text-secondary)',
          lineHeight: 1.6, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Riceverai un messaggio WhatsApp con l'orario esatto e l'operatore assegnato.
          Puoi sempre seguire lo stato dalla dashboard.
        </p>

        {/* Riepilogo card */}
        <div style={{
          marginTop: 30, padding: 24, borderRadius: 24,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 28px',
        }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>
              Riepilogo richiesta
            </div>
            <span style={{
              padding: '4px 11px', borderRadius: 999,
              background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
              fontSize: 11, fontWeight: 600,
            }}>In attesa di conferma</span>
          </div>
          <ConfirmField label="Pet" value="Luna · Golden Retriever"/>
          <ConfirmField label="Servizio" value="Tosatura · ~75 min"/>
          <ConfirmField label="Data preferita" value="Giovedì 30 aprile"/>
          <ConfirmField label="Fascia oraria" value="Mattina (9:00 – 13:00)"/>
          <div style={{ gridColumn: '1 / -1' }}>
            <ConfirmField label="Note" value='"Luna è un po ansiosa col phon."'/>
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button style={{
            padding: '12px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--color-primary)', color: '#FBF6F3',
            fontSize: 13, fontWeight: 600,
          }}>Torna alla home</button>
          <button style={{
            padding: '12px 22px', borderRadius: 999, cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--color-border)',
            fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
          }}>Vedi le mie richieste</button>
        </div>
      </div>
    </div>
  </div>
);

const ConfirmField = ({ label, value }) => (
  <div>
    <div style={{
      fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
      color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 4,
    }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
  </div>
);

// ───────────────────────────────────────────────────────────
// MOBILE · BOOKING (pre-compilato da pet)
// ───────────────────────────────────────────────────────────

const BookingPageMobile = () => {
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
        <div style={{ fontSize: 13, fontWeight: 600 }}>Nuova prenotazione</div>
        <span style={{ width: 32 }}/>
      </div>

      {/* Scroll area */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '4px 22px 100px' }}>
        {/* Title compat */}
        <div style={{
          fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'var(--color-primary)', fontWeight: 700, marginTop: 6, marginBottom: 8,
        }}>Stai prenotando per Luna</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400,
          letterSpacing: '-.02em', margin: 0, lineHeight: 1.1,
        }}>
          Quando ce la portate?
        </h1>

        <div style={{ marginTop: 20 }}>
          <ContextualHeader entry="from-pet" compact/>
        </div>

        {/* Servizio */}
        <div style={{
          fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--color-text-primary)', fontWeight: 700, marginBottom: 8,
        }}>Servizio</div>
        <ServiceSelector selected="cut" compact/>

        {/* Data */}
        <div style={{
          fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--color-text-primary)', fontWeight: 700, marginTop: 20, marginBottom: 10,
        }}>Quando</div>
        <div style={{
          padding: 14, borderRadius: 18,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
        }}>
          <MonthCalendar selected="2026-04-30"/>
        </div>

        {/* Fasce */}
        <div style={{
          fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--color-text-primary)', fontWeight: 700, marginTop: 18, marginBottom: 10,
        }}>Preferenza</div>
        <TimeSlotPicker selected="morning"/>

        {/* Note */}
        <div style={{
          fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--color-text-primary)', fontWeight: 700, marginTop: 18, marginBottom: 8,
        }}>Note per lo staff</div>
        <textarea
          defaultValue="Luna è un po' ansiosa col phon."
          style={{
            width: '100%', minHeight: 64, padding: 12, borderRadius: 14,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-main)',
            fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            color: 'var(--color-text-primary)',
          }}/>

        <div style={{
          fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--color-text-primary)', fontWeight: 700, marginTop: 18, marginBottom: 4,
        }}>Cibo preferito di Luna</div>
        <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
          Ci serve per organizzare il magazzino e proporti prodotti su misura.
        </div>
        <textarea
          defaultValue="Salmone, mela a pezzetti, formaggio grana"
          style={{
            width: '100%', minHeight: 52, padding: 12, borderRadius: 14,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-main)',
            fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            color: 'var(--color-text-primary)',
          }}/>

        {/* Promo */}
        <div style={{
          marginTop: 12, padding: '11px 14px', borderRadius: 14,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="gift" size={14} color="var(--color-text-secondary)"/>
          <input placeholder="Codice promo (opzionale)" style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, fontFamily: 'inherit', color: 'var(--color-text-primary)',
          }}/>
        </div>

        {/* Warning */}
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 14,
          background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
          fontSize: 12, lineHeight: 1.5,
        }}>
          <strong>Richiesta, non conferma.</strong> Vi rispondiamo entro 24 ore con orario preciso.
        </div>
      </div>

      {/* CTA sticky */}
      <div style={{
        position: 'absolute', bottom: 16, left: 14, right: 14,
        padding: 6, borderRadius: 999,
        background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
        boxShadow: '0 4px 20px rgba(42,31,22,.1)',
      }}>
        <button style={{
          width: '100%', padding: '13px 18px', borderRadius: 999,
          border: 'none', cursor: 'pointer',
          background: 'var(--color-primary)', color: '#FBF6F3',
          fontSize: 13, fontWeight: 700,
        }}>
          Invia richiesta →
        </button>
      </div>
    </div>
  );
  return <IOSDevice width={390} height={844}>{content}</IOSDevice>;
};

// ───────────────────────────────────────────────────────────
// MOBILE · CONFIRMATION
// ───────────────────────────────────────────────────────────

const BookingConfirmMobile = () => {
  const content = (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
      background: 'var(--color-surface-main)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '56px 22px 10px',
        display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🐕</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500 }}>
            Grooming Hub
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 22px 100px',
        display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-success-bg)', color: 'var(--color-success-text)',
          display: 'grid', placeItems: 'center', marginTop: 20, marginBottom: 18,
        }}>
          <Icon name="check" size={28} color="var(--color-success-text)" stroke={2.5}/>
        </div>

        <div style={{
          fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'var(--color-success-text)', fontWeight: 700, marginBottom: 8,
        }}>Richiesta inviata</div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.1,
          fontWeight: 400, letterSpacing: '-.02em', margin: 0, textAlign: 'center',
        }}>
          Grazie, Martina.<br/>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 24 }}>
            Ti scriviamo entro 24h.
          </span>
        </h1>

        <p style={{
          marginTop: 10, fontSize: 13, color: 'var(--color-text-secondary)',
          lineHeight: 1.6, textAlign: 'center', maxWidth: 300,
        }}>
          Riceverai un messaggio WhatsApp con orario esatto e operatore assegnato.
        </p>

        {/* Riepilogo */}
        <div style={{
          width: '100%', marginTop: 20, padding: 16, borderRadius: 20,
          background: 'var(--color-bg-main)', border: '1px solid var(--color-border)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingBottom: 10, marginBottom: 6, borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500 }}>
              Riepilogo
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 999,
              background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)',
              fontSize: 10, fontWeight: 600,
            }}>In attesa</span>
          </div>
          <MiniSummary label="Pet" value="Luna"/>
          <MiniSummary label="Servizio" value="Tosatura"/>
          <MiniSummary label="Data" value="Giovedì 30 aprile"/>
          <MiniSummary label="Fascia" value="Mattina" last/>
        </div>
      </div>

      {/* CTA sticky */}
      <div style={{
        position: 'absolute', bottom: 16, left: 14, right: 14,
        padding: 6, borderRadius: 999,
        background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
        boxShadow: '0 4px 20px rgba(42,31,22,.1)',
      }}>
        <button style={{
          width: '100%', padding: '13px 18px', borderRadius: 999,
          border: 'none', cursor: 'pointer',
          background: 'var(--color-primary)', color: '#FBF6F3',
          fontSize: 13, fontWeight: 700,
        }}>
          Torna alla home
        </button>
      </div>
    </div>
  );
  return <IOSDevice width={390} height={844}>{content}</IOSDevice>;
};

const MiniSummary = ({ label, value, last = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0',
    borderBottom: last ? 'none' : '1px solid var(--color-border)',
  }}>
    <span style={{
      fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase',
      color: 'var(--color-text-secondary)', fontWeight: 600,
    }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
  </div>
);

window.BookingPageDesktop = BookingPageDesktop;
window.BookingPageMobile = BookingPageMobile;
window.BookingConfirmDesktop = BookingConfirmDesktop;
window.BookingConfirmMobile = BookingConfirmMobile;
