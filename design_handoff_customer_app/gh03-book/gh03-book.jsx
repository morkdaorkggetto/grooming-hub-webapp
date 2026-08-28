// GH-03 · Composizione wizard prenotazione /u/book
// Semantica: RICHIESTA (data desiderata), non booking transazionale.
// Campi: pet · servizio · data desiderata · condizioni manto · età (solo se mancante).
// L'app non blocca mai: avvisi informativi, tono caldo.

const BOOK_PETS = [
  { id: 'luna', name: 'Luna', breed: 'Golden Retriever', age: '4 anni', tier: 'gold' },
  { id: 'miele', name: 'Miele', breed: 'Meticcio', age: null, tier: 'bronze' }, // età mancante → campo condizionale
];
const BOOK_SERVICES = [ // PLACEHOLDER — lista reale del salone da iniettare (questione aperta nel brief)
  { id: 's1', name: 'Bagno & asciugatura', dur: '~45 min', icon: 'bath' },
  { id: 's2', name: 'Bagno & tosatura', dur: '~90 min', icon: 'scissors' },
  { id: 's3', name: 'Trattamento completo', dur: '~2 ore', icon: 'sparkle' },
  { id: 's4', name: 'Taglio unghie', dur: '~15 min', icon: 'drop' },
];
const COAT_CHIPS = ['Qualche nodo', 'Molto annodato', 'Perde tanto pelo', 'Cute sensibile', 'Pulito, solo lungo'];

const GhEyebrow = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>{children}</div>
);
const StepHead = ({ n, title, hint, compact }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 12 }}>
    <span style={{ fontFamily: 'var(--font-serif)', fontSize: compact ? 20 : 24, fontStyle: 'italic', color: 'var(--color-primary)', lineHeight: 1 }}>{n}.</span>
    <div>
      <div style={{ fontSize: compact ? 15 : 17, fontWeight: 700 }}>{title}</div>
      {hint && <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>{hint}</div>}
    </div>
  </div>
);
const SelCard = ({ selected, children, style = {}, compact = false }) => (
  <div style={{
    padding: compact ? 11 : 14, borderRadius: 16, cursor: 'pointer',
    background: selected ? 'var(--color-surface-main)' : 'var(--color-bg-main)',
    border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
    ...style,
  }}>{children}</div>
);
const WarmNotice = ({ kind = 'notice', title, children }) => ( // mai punitivo: warning tokens, icona clock
  <div style={{
    display: 'flex', gap: 12, padding: '13px 15px', borderRadius: 14,
    background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)',
    color: 'var(--color-warning-text)', fontSize: 12.5, lineHeight: 1.5,
  }}>
    <Icon name={kind === 'peak' ? 'bell' : 'clock'} size={16} color="var(--color-warning-text)"/>
    <div><strong>{title}</strong> {children}</div>
  </div>
);
const Chip = ({ active, children }) => (
  <span style={{
    padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    background: active ? 'var(--color-primary)' : 'var(--color-bg-main)',
    color: active ? '#FBF6F3' : 'var(--color-text-primary)',
    border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
  }}>{children}</span>
);
const GhInput = ({ placeholder, value, width = '100%' }) => (
  <input defaultValue={value} placeholder={placeholder} style={{
    width, height: 42, padding: '0 13px', background: '#fff',
    border: '1px solid var(--color-border)', borderRadius: 'var(--r-sm)',
    fontSize: 13.5, fontFamily: 'inherit', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box',
  }}/>
);
const DesiredDateStrip = ({ selectedIdx = 4, compact }) => { // data DESIDERATA: nessuna casella occupata/libera
  const days = Array.from({ length: compact ? 6 : 12 }, (_, i) => { const d = new Date(2026, 7, 20 + i); return d; });
  return (
    <div>
      <div style={{ display: 'flex', gap: 7, overflow: 'hidden', paddingBottom: 4 }}>
        {days.map((d, i) => {
          const sel = i === selectedIdx;
          return (
            <div key={i} style={{
              flexShrink: 0, width: compact ? 49 : 58, padding: '8px 0', textAlign: 'center', cursor: 'pointer',
              background: sel ? 'var(--color-primary)' : 'var(--color-bg-main)',
              color: sel ? '#FBF6F3' : 'var(--color-text-primary)',
              border: sel ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              borderRadius: 14,
            }}>
              <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.1em', opacity: .75 }}>
                {d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500 }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 6 }}>
        È la data che <em>preferiresti</em> — la confermiamo noi insieme all'orario.
      </div>
    </div>
  );
};

// ── Form completo (desktop e mobile condividono le sezioni) ──
// sections: array di step da renderizzare (mobile li divide su due artboard)
const BookForm = ({ compact = false, petIdx = 0, shortNotice = false, peak = false, sections = [1, 2, 3, 4] }) => {
  const pet = BOOK_PETS[petIdx];
  const ageMissing = !pet.age;
  const has = (n) => sections.includes(n);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 14 : 24 }}>
      {has(1) && <div>
        <StepHead n="1" title="Per chi?" compact={compact}/>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {BOOK_PETS.map((p, i) => (
            <SelCard key={p.id} selected={i === petIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 10px 10px', minWidth: 160 }}>
              <PetAvatar name={p.name} tier={p.tier} size={40}/>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, lineHeight: 1 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>{p.breed}</div>
              </div>
            </SelCard>
          ))}
        </div>
        {ageMissing && (
          <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Quanti anni ha {pet.name}?</div>
            <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Non ce l'hai ancora detto — ci serve solo la prima volta.</div>
            <GhInput placeholder="Es. 3 anni" width={140}/>
          </div>
        )}
      </div>}

      {has(2) && <div>
        <StepHead n="2" title="Cosa serve?" hint="In negozio decidiamo insieme i dettagli." compact={compact}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BOOK_SERVICES.map((s, i) => (
            <SelCard key={s.id} selected={i === 1} compact={compact} style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 12 }}>
              <div style={{ width: compact ? 28 : 34, height: compact ? 28 : 34, borderRadius: 10, background: 'var(--color-surface-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={s.icon} size={compact ? 13 : 15} color="var(--color-primary)"/>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: compact ? 12 : 13.5, fontWeight: 700, lineHeight: 1.25 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{s.dur}</div>
              </div>
            </SelCard>
          ))}
        </div>
      </div>}

      {has(3) && <div>
        <StepHead n="3" title="Quando ti andrebbe bene?" compact={compact}/>
        <DesiredDateStrip compact={compact} selectedIdx={shortNotice ? 1 : 6}/>
        {shortNotice && (
          <div style={{ marginTop: 12 }}>
            <WarmNotice title="Sei un po' a corto di preavviso.">
              La richiesta parte lo stesso — faremo il possibile per trovarti spazio, e ti diciamo subito su WhatsApp come siamo messi.
            </WarmNotice>
          </div>
        )}
        {peak && (
          <div style={{ marginTop: 12 }}>
            <WarmNotice kind="peak" title="Periodo pieno (Ferragosto):">
              stanno arrivando più richieste del solito, quindi potremmo metterci un po' di più a risponderti. Mandala comunque — le leggiamo tutte.
            </WarmNotice>
          </div>
        )}
      </div>}

      {has(4) && <div>
        <StepHead n="4" title={`Come sta il pelo di ${pet.name}?`} hint="Ci aiuta a prepararci — poi lo guardiamo insieme all'arrivo." compact={compact}/>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {COAT_CHIPS.map((c, i) => <Chip key={c} active={i === 0}>{c}</Chip>)}
        </div>
        <GhInput placeholder="Vuoi aggiungere altro? (facoltativo)"/>
      </div>}
    </div>
  );
};

const RequestRecap = ({ compact = false }) => (
  <div style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 20, padding: compact ? 16 : 20 }}>
    <GhEyebrow>La tua richiesta</GhEyebrow>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, margin: '12px 0 14px', fontSize: 13 }}>
      {[['Pet', 'Luna'], ['Servizio', 'Bagno & tosatura'], ['Data desiderata', 'Mercoledì 26 agosto'], ['Manto', 'Qualche nodo']].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
      Ti rispondiamo noi su WhatsApp con giorno e ora — di solito in pochi minuti.
    </div>
    <button style={{ width: '100%', height: 46, background: 'var(--color-primary)', color: '#FBF6F3', border: 'none', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
      Invia la richiesta
    </button>
  </div>
);

// ── Nav (mimic componenti esistenti CustomerNav) ──
const GhTopNav = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-main)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ fontSize: 20 }}>🐕</span>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500 }}>Grooming Hub</span>
    </div>
    <div style={{ display: 'flex', gap: 26, fontSize: 13 }}>
      {['Home', 'I miei pet', 'Promozioni'].map(l => <span key={l} style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{l}</span>)}
    </div>
    <div style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--color-primary)', color: '#FBF6F3', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>M</div>
  </div>
);
const GhBottomNav = () => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-surface-main)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-around', padding: '9px 8px 22px' }}>
    {[['home', 'Home'], ['paw', 'Pet'], ['calendar', 'Prenota', true], ['gift', 'Promo'], ['user', 'Profilo']].map(([ic, l, a]) => (
      <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: a ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontSize: 9.5, fontWeight: a ? 700 : 500 }}>
        <Icon name={ic} size={19} color={a ? 'var(--color-primary)' : 'var(--color-text-secondary)'}/>{l}
      </div>
    ))}
  </div>
);

// ═══ ARTBOARD: desktop richiesta ═══
const GhBookDesktop = ({ shortNotice = false, peak = false, petIdx = 0, height = 1120 }) => (
  <div style={{ width: 1280, height, background: 'var(--color-surface-main)', fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <GhTopNav/>
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 36, padding: '30px 48px', overflow: 'hidden' }}>
      <div>
        <GhEyebrow>Richiesta di appuntamento</GhEyebrow>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1.08, margin: '10px 0 8px' }}>
          Quando ce lo porti?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 22px', maxWidth: 520 }}>
          Dicci cosa serve e quando preferiresti passare. Poi ci pensiamo noi: ti confermiamo giorno e ora su WhatsApp.
        </p>
        <BookForm petIdx={petIdx} shortNotice={shortNotice} peak={peak}/>
      </div>
      <div style={{ alignSelf: 'start', position: 'sticky', top: 0, paddingTop: 88 }}>
        <RequestRecap/>
      </div>
    </div>
  </div>
);

// ═══ ARTBOARD: desktop esito ═══
const GhBookDoneDesktop = () => (
  <div style={{ width: 1280, height: 860, background: 'var(--color-surface-main)', fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <GhTopNav/>
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '40px 48px' }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: 'var(--color-warning-bg)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <Icon name="whatsapp" size={38} color="var(--color-warning-text)"/>
        </div>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 13px', borderRadius: 999, background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', fontSize: 11.5, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }}/>In attesa di conferma
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 46, fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1.08, margin: '0 0 14px' }}>
          Ci pensiamo noi da qui.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 26px' }}>
          La tua richiesta è arrivata al salone. Ti scriviamo noi su WhatsApp con giorno e ora —
          di solito in pochi minuti. Se preferisci anticiparci, il numero è sempre lo stesso.
        </p>
        <div style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 18, textAlign: 'left', marginBottom: 22 }}>
          {[['Pet', 'Luna'], ['Servizio', 'Bagno & tosatura'], ['Data desiderata', 'Mercoledì 26 agosto'], ['Manto', 'Qualche nodo']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: '#4f8b67', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="whatsapp" size={16} color="#fff"/>Scrivici su WhatsApp
          </button>
          <button style={{ padding: '12px 22px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-primary)' }}>
            Torna alla home
          </button>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 16 }}>
          Quando il salone conferma, qui troverai anche "Aggiungi al calendario" (.ics).
        </div>
      </div>
    </div>
  </div>
);

// ═══ ARTBOARD: mobile richiesta / esito ═══
const GhPhone = ({ children }) => (
  <div style={{ width: 390, height: 844, background: 'var(--color-surface-main)', borderRadius: 44, border: '8px solid #2b2525', overflow: 'hidden', position: 'relative', fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}>
    {children}
  </div>
);
// view 'fold' = step 1-2 · view 'scrolled' = step 3-4 + CTA (stesso pattern fold/scrolled della dashboard)
const GhBookMobile = ({ view = 'fold' }) => (
  <GhPhone>
    <div style={{ height: '100%', overflow: 'hidden', padding: '54px 20px 120px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', display: 'grid', placeItems: 'center' }}>
          <Icon name="chevron" size={13} style={{ transform: 'rotate(180deg)' }}/>
        </span>
        <GhEyebrow>Richiesta di appuntamento</GhEyebrow>
      </div>
      {view === 'fold' ? (
        <React.Fragment>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1.1, margin: '0 0 6px' }}>Quando ce lo porti?</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
            Ti confermiamo giorno e ora su WhatsApp.
          </p>
          <BookForm compact petIdx={1} sections={[1, 2]}/>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '2px 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 1, background: 'var(--color-border)' }}/>Continua a scorrere
          </div>
          <BookForm compact petIdx={1} shortNotice sections={[3, 4]}/>
        </React.Fragment>
      )}
    </div>
    {view === 'scrolled' && (
      <div style={{ position: 'absolute', bottom: 74, left: 14, right: 14 }}>
        <button style={{ width: '100%', height: 46, background: 'var(--color-primary)', color: '#FBF6F3', border: 'none', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 8px 24px -8px rgba(43,37,37,.3)' }}>
          Invia la richiesta
        </button>
      </div>
    )}
    <GhBottomNav/>
  </GhPhone>
);
const GhBookDoneMobile = () => (
  <GhPhone>
    <div style={{ height: '100%', overflow: 'hidden', padding: '80px 24px 90px', boxSizing: 'border-box', textAlign: 'center' }}>
      <div style={{ width: 68, height: 68, borderRadius: 34, background: 'var(--color-warning-bg)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
        <Icon name="whatsapp" size={30} color="var(--color-warning-text)"/>
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', fontSize: 10.5, fontWeight: 700, marginBottom: 12 }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'currentColor' }}/>In attesa di conferma
      </span>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-.02em', margin: '6px 0 10px' }}>Ci pensiamo noi da qui.</h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 20px' }}>
        Ti scriviamo su WhatsApp con giorno e ora — di solito in pochi minuti.
      </p>
      <div style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 14, textAlign: 'left', marginBottom: 16 }}>
        {[['Pet', 'Miele'], ['Servizio', 'Bagno & tosatura'], ['Data desiderata', 'Venerdì 21 agosto']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '5px 0' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <button style={{ width: '100%', height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4f8b67', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit' }}>
        <Icon name="whatsapp" size={15} color="#fff"/>Scrivici su WhatsApp
      </button>
    </div>
    <GhBottomNav/>
  </GhPhone>
);

// ═══ ARTBOARD: stati (avvisi, errore, empty→WhatsApp, loading) ═══
const GhBookStates = () => (
  <div style={{ width: 1280, height: 720, background: 'var(--color-surface-main)', fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)', padding: 40, boxSizing: 'border-box', overflow: 'hidden' }}>
    <GhEyebrow>Stati & avvisi — vocabolario</GhEyebrow>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 28px', marginTop: 20 }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Preavviso corto (&lt;7 giorni) — non blocca</div>
        <WarmNotice title="Sei un po' a corto di preavviso.">La richiesta parte lo stesso — faremo il possibile, e ti diciamo subito su WhatsApp come siamo messi.</WarmNotice>
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Periodo di piena — non blocca</div>
        <WarmNotice kind="peak" title="Periodo pieno (Ferragosto):">più richieste del solito, potremmo metterci un po' di più a risponderti. Mandala comunque — le leggiamo tutte.</WarmNotice>
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Errore submit — riprova o scavalca via WhatsApp</div>
        <div style={{ display: 'flex', gap: 12, padding: '13px 15px', borderRadius: 14, background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', fontSize: 12.5, lineHeight: 1.5, border: '1px solid #e8c3be' }}>
          <Icon name="bell" size={16} color="var(--color-danger-text)"/>
          <div><strong>Non siamo riusciti a inviare la richiesta.</strong> Riprova tra un momento — o scrivici direttamente su WhatsApp, va benissimo uguale.</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Empty (nessun servizio/pet caricabile) — senza tono d'errore</div>
        <div style={{ padding: 20, borderRadius: 16, background: 'var(--color-bg-main)', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Qui non carica, ma noi ci siamo.</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Scrivici su WhatsApp e prenotiamo a voce, come sempre.</div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#4f8b67', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="whatsapp" size={14} color="#fff"/>Apri WhatsApp
          </button>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Loading — skeleton su card servizi e strip date</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 58, borderRadius: 16, background: 'linear-gradient(90deg, var(--color-surface-soft), var(--color-surface-muted), var(--color-surface-soft))' }}/>)}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { GhBookDesktop, GhBookDoneDesktop, GhBookMobile, GhBookDoneMobile, GhBookStates });
