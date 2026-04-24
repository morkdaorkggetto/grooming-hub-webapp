// ───────────────────────────────────────────────────────────
// AUTH — Login / Registrazione / Password dimenticata
// Layout: form centrato, sfondo pieno, minimal. Desktop + Mobile.
// Coerente con il resto: CSS vars, rounded-[16–24], serif per headline.
// ───────────────────────────────────────────────────────────

// --- primitive ----------------------------------------------------------

const AuthShell = ({ width = '100%', height = '100%', children }) => (
  <div style={{
    width, height, background: 'var(--color-bg-main)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-primary)', overflow: 'hidden',
  }}>
    {children}
  </div>
);

const Brandmark = ({ size = 'md' }) => {
  const s = size === 'lg' ? 44 : size === 'sm' ? 28 : 36;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: s, height: s, borderRadius: s / 2.8,
        background: 'var(--color-primary)',
        display: 'grid', placeItems: 'center', color: '#FBF6F3',
      }}>
        <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="9" r="2"/><circle cx="9" cy="5" r="2"/>
          <circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/>
          <path d="M7 15c0-3 2-5 5-5s5 2 5 5c0 2.5-2 4-5 4s-5-1.5-5-4z"/>
        </svg>
      </div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: s * 0.55, fontWeight: 500,
        letterSpacing: '-0.01em', lineHeight: 1,
      }}>
        Grooming Hub
      </div>
    </div>
  );
};

const Field = ({ label, type = 'text', value = '', placeholder = '', hint, required = true, trailing }) => (
  <label style={{ display: 'block' }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)',
      marginBottom: 6,
    }}>
      <span>{label}{!required && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 6 }}>(opzionale)</span>}</span>
      {trailing}
    </div>
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        style={{
          width: '100%', height: 44, padding: '0 14px',
          background: '#fff', border: '1px solid var(--color-border)',
          borderRadius: 'var(--r-md)',
          fontSize: 14, color: 'var(--color-text-primary)',
          fontFamily: 'inherit', outline: 'none',
          transition: 'border-color .15s',
        }}
      />
    </div>
    {hint && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>{hint}</div>}
  </label>
);

const SocialBtn = ({ provider, full }) => {
  const icons = {
    google: (
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.6 0 6.5 5.4 2.5 13.2l7.8 6C12.3 13.7 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.3 5.5-4.8 7.2l7.4 5.8c4.3-4 6.8-9.9 6.8-17.5z"/>
        <path fill="#FBBC05" d="M10.3 28.8c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6C.9 16.7 0 20.2 0 24s.9 7.3 2.5 10.8l7.8-6z"/>
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2 1.4-4.7 2.3-8.5 2.3-6.3 0-11.7-4.2-13.7-10.1l-7.8 6C6.5 42.6 14.6 48 24 48z"/>
      </svg>
    ),
    apple: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
  };
  return (
    <button style={{
      flex: full ? 1 : 'initial',
      width: full ? '100%' : 'auto',
      height: 52, padding: '0 16px',
      background: '#fff', border: '1px solid var(--color-border)',
      borderRadius: 'var(--r-md)', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
      fontFamily: 'inherit',
    }}>
      {icons[provider]}
      <span>Continua con {provider === 'google' ? 'Google' : 'Apple'}</span>
    </button>
  );
};

const Divider = ({ label = 'oppure' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    color: 'var(--color-text-secondary)', fontSize: 12,
    margin: '4px 0',
  }}>
    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}/>
    <span>{label}</span>
    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}/>
  </div>
);

const SubmitBtn = ({ children }) => (
  <button style={{
    width: '100%', height: 48,
    background: 'var(--color-primary)', color: '#FBF6F3',
    border: 'none', borderRadius: 'var(--r-md)',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }}>
    {children}
  </button>
);

const AuthCard = ({ children, width = 440 }) => (
  <div style={{
    width, background: 'var(--color-surface-main)',
    borderRadius: 'var(--r-xl)',
    border: '1px solid var(--color-border)',
    padding: '36px 40px',
    boxShadow: '0 1px 2px rgba(43,37,37,.04), 0 12px 40px -24px rgba(43,37,37,.25)',
  }}>
    {children}
  </div>
);

const H1 = ({ children, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <h1 style={{
      fontFamily: 'var(--font-serif)',
      fontSize: 30, fontWeight: 500, lineHeight: 1.1,
      letterSpacing: '-0.015em',
      margin: 0, color: 'var(--color-text-primary)',
    }}>{children}</h1>
    {sub && <p style={{
      margin: '8px 0 0', fontSize: 14,
      color: 'var(--color-text-secondary)', lineHeight: 1.5,
    }}>{sub}</p>}
  </div>
);

const FootLink = ({ prefix, link, href = '#' }) => (
  <div style={{
    marginTop: 24, paddingTop: 20,
    borderTop: '1px solid var(--color-border)',
    textAlign: 'center', fontSize: 13,
    color: 'var(--color-text-secondary)',
  }}>
    {prefix}{' '}
    <a href={href} style={{
      color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none',
    }}>{link}</a>
  </div>
);

const BackgroundDecor = () => (
  // texture sottile coerente col mood caldo della dashboard — niente foto, niente slop
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', width: 620, height: 620, borderRadius: '50%',
      background: 'radial-gradient(closest-side, rgba(111,151,146,0.12), transparent 70%)',
      top: -220, left: -180,
    }}/>
    <div style={{
      position: 'absolute', width: 520, height: 520, borderRadius: '50%',
      background: 'radial-gradient(closest-side, rgba(103,56,63,0.08), transparent 70%)',
      bottom: -180, right: -140,
    }}/>
  </div>
);

const LegalFoot = () => (
  <div style={{
    marginTop: 16, fontSize: 11, lineHeight: 1.5,
    color: 'var(--color-text-secondary)', textAlign: 'center',
    maxWidth: 380, margin: '16px auto 0',
  }}>
    Continuando accetti i <a href="#" style={{ color: 'var(--color-link)' }}>Termini</a> e
    la <a href="#" style={{ color: 'var(--color-link)' }}>Privacy</a>.
  </div>
);

// ───────────────────────────────────────────────────────────
// LOGIN · Desktop
// ───────────────────────────────────────────────────────────
const LoginDesktop = () => (
  <AuthShell>
    <div style={{ position: 'absolute', inset: 0 }}><BackgroundDecor/></div>

    <div style={{ position: 'absolute', top: 32, left: 40 }}>
      <Brandmark/>
    </div>

    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AuthCard>
        <H1 sub="Accedi al tuo account per gestire prenotazioni e i tuoi pet.">
          Bentornato
        </H1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <SocialBtn provider="google" full/>
          <SocialBtn provider="apple" full/>
        </div>

        <Divider/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
          <Field label="Email" type="email" placeholder="mario.rossi@email.com"/>
          <Field
            label="Password" type="password" placeholder="••••••••"
            trailing={<a href="#" style={{ fontSize: 12, color: 'var(--color-link)', textDecoration: 'none', fontWeight: 600 }}>Password dimenticata?</a>}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}/>
            <span>Resta connesso su questo dispositivo</span>
          </label>

          <SubmitBtn>Accedi</SubmitBtn>
        </div>

        <FootLink prefix="Non hai un account?" link="Registrati"/>
      </AuthCard>

      <LegalFoot/>
    </div>
  </AuthShell>
);

// ───────────────────────────────────────────────────────────
// REGISTER · Desktop
// ───────────────────────────────────────────────────────────
const RegisterDesktop = () => (
  <AuthShell>
    <div style={{ position: 'absolute', inset: 0 }}><BackgroundDecor/></div>

    <div style={{ position: 'absolute', top: 32, left: 40 }}>
      <Brandmark/>
    </div>

    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  paddingTop: 60, paddingBottom: 20,
    }}>
      <AuthCard width={520}>
        <H1 sub="Bastano pochi dati per iniziare a prenotare.">
          Crea il tuo account
        </H1>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <SocialBtn provider="google" full/>
          <SocialBtn provider="apple" full/>
        </div>

        <Divider/>

        <div style={{ marginTop: 18 }}>
          {/* Sezione: i tuoi dati */}
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-text-secondary)', marginBottom: 12,
          }}>I tuoi dati</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nome e cognome" placeholder="Mario Rossi"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Email" type="email" placeholder="mario.rossi@email.com"/>
              <Field label="Telefono" type="tel" placeholder="+39 333 123 4567" required={false}/>
            </div>
            <Field
              label="Password" type="password" placeholder="Minimo 8 caratteri"
              hint="Almeno 8 caratteri, una lettera e un numero."
            />
          </div>

          {/* Sezione: il tuo pet */}
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-text-secondary)', margin: '24px 0 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>Il tuo pet</span>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 'normal', textTransform: 'none',
              background: 'var(--color-surface-soft)', color: 'var(--color-text-secondary)',
              padding: '2px 8px', borderRadius: 999,
            }}>Puoi aggiungerne altri dopo</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nome del pet" placeholder="Luna"/>
              <Field label="Razza" placeholder="Es. Golden Retriever"/>
            </div>
            <Field label="Data di nascita" type="date" placeholder=""/>
          </div>

          <div style={{ marginTop: 24 }}>
            <SubmitBtn>Crea account</SubmitBtn>
          </div>
        </div>

        <FootLink prefix="Hai già un account?" link="Accedi"/>
      </AuthCard>

      <LegalFoot/>
    </div>
  </AuthShell>
);

// ───────────────────────────────────────────────────────────
// FORGOT · Desktop
// ───────────────────────────────────────────────────────────
const ForgotDesktop = () => (
  <AuthShell>
    <div style={{ position: 'absolute', inset: 0 }}><BackgroundDecor/></div>

    <div style={{ position: 'absolute', top: 32, left: 40 }}>
      <Brandmark/>
    </div>

    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AuthCard>
        <H1 sub="Inserisci la tua email: ti invieremo un link per impostarne una nuova.">
          Reimposta la password
        </H1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Email" type="email" placeholder="mario.rossi@email.com"/>
          <SubmitBtn>Invia link di recupero</SubmitBtn>
        </div>

        <div style={{
          marginTop: 20, padding: 14,
          background: 'var(--color-surface-soft)',
          borderRadius: 'var(--r-md)',
          fontSize: 12, color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}>
          Se non ricevi l'email entro qualche minuto, controlla la cartella spam
          o <a href="#" style={{ color: 'var(--color-link)', fontWeight: 600 }}>contattaci</a>.
        </div>

        <FootLink prefix="Ti sei ricordato?" link="Torna al login"/>
      </AuthCard>
      <LegalFoot/>
    </div>
  </AuthShell>
);

// ───────────────────────────────────────────────────────────
// MOBILE WRAPPER — centrato dentro iPhone frame; pagina "minimal" senza card elevata
// ───────────────────────────────────────────────────────────

const MobileWrap = ({ children }) => (
  <div style={{
    width: '100%', height: '100%',
    background: 'var(--color-bg-main)',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-primary)',
    display: 'flex', flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', inset: 0 }}><BackgroundDecor/></div>
    <div style={{
      position: 'relative', zIndex: 1,
      padding: '20px 24px',
      display: 'flex', justifyContent: 'center',
    }}>
      <Brandmark size="sm"/>
    </div>
    <div style={{
      position: 'relative', zIndex: 1, flex: 1,
      padding: '8px 24px 28px',
      overflow: 'auto',
    }}>
      {children}
    </div>
  </div>
);

const H1Mobile = ({ children, sub }) => (
  <div style={{ marginBottom: 22, marginTop: 12 }}>
    <h1 style={{
      fontFamily: 'var(--font-serif)',
      fontSize: 26, fontWeight: 500, lineHeight: 1.1,
      letterSpacing: '-0.015em',
      margin: 0,
    }}>{children}</h1>
    {sub && <p style={{
      margin: '8px 0 0', fontSize: 14,
      color: 'var(--color-text-secondary)', lineHeight: 1.5,
    }}>{sub}</p>}
  </div>
);

const LoginMobile = () => (
  <MobileWrap>
    <H1Mobile sub="Accedi al tuo account.">Bentornato</H1Mobile>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
      <SocialBtn provider="google" full/>
      <SocialBtn provider="apple" full/>
    </div>

    <Divider/>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
      <Field label="Email" type="email" placeholder="mario.rossi@email.com"/>
      <Field
        label="Password" type="password" placeholder="••••••••"
        trailing={<a href="#" style={{ fontSize: 12, color: 'var(--color-link)', textDecoration: 'none', fontWeight: 600 }}>Password dimenticata?</a>}
      />
      <SubmitBtn>Accedi</SubmitBtn>
    </div>

    <div style={{
      marginTop: 20, paddingTop: 18,
      borderTop: '1px solid var(--color-border)',
      textAlign: 'center', fontSize: 13,
      color: 'var(--color-text-secondary)',
    }}>
      Non hai un account?{' '}
      <a href="#" style={{ color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none' }}>Registrati</a>
    </div>
  </MobileWrap>
);

const RegisterMobile = () => (
  <MobileWrap>
    <H1Mobile sub="Pochi dati, poi puoi prenotare.">Crea il tuo account</H1Mobile>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
      <SocialBtn provider="google" full/>
      <SocialBtn provider="apple" full/>
    </div>

    <Divider/>

    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
      color: 'var(--color-text-secondary)', margin: '16px 0 10px',
    }}>I tuoi dati</div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Nome e cognome" placeholder="Mario Rossi"/>
      <Field label="Email" type="email" placeholder="mario.rossi@email.com"/>
      <Field label="Telefono" type="tel" placeholder="+39 333 123 4567" required={false}/>
      <Field label="Password" type="password" placeholder="Minimo 8 caratteri"/>
    </div>

    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
      color: 'var(--color-text-secondary)', margin: '22px 0 10px',
    }}>Il tuo pet</div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Nome del pet" placeholder="Luna"/>
      <Field label="Razza" placeholder="Es. Golden Retriever"/>
      <Field label="Data di nascita" type="date"/>
    </div>

    <div style={{ marginTop: 20 }}>
      <SubmitBtn>Crea account</SubmitBtn>
    </div>

    <div style={{
      marginTop: 18, paddingTop: 16,
      borderTop: '1px solid var(--color-border)',
      textAlign: 'center', fontSize: 13,
      color: 'var(--color-text-secondary)',
    }}>
      Hai già un account?{' '}
      <a href="#" style={{ color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none' }}>Accedi</a>
    </div>
  </MobileWrap>
);

const ForgotMobile = () => (
  <MobileWrap>
    <H1Mobile sub="Inserisci la tua email: ti invieremo un link per impostarne una nuova.">
      Reimposta la password
    </H1Mobile>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field label="Email" type="email" placeholder="mario.rossi@email.com"/>
      <SubmitBtn>Invia link di recupero</SubmitBtn>
    </div>

    <div style={{
      marginTop: 18, padding: 14,
      background: 'var(--color-surface-soft)',
      borderRadius: 'var(--r-md)',
      fontSize: 12, color: 'var(--color-text-secondary)',
      lineHeight: 1.5,
    }}>
      Se non ricevi l'email entro qualche minuto, controlla la cartella spam.
    </div>

    <div style={{
      marginTop: 20, paddingTop: 16,
      borderTop: '1px solid var(--color-border)',
      textAlign: 'center', fontSize: 13,
    }}>
      <a href="#" style={{ color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none' }}>
        ← Torna al login
      </a>
    </div>
  </MobileWrap>
);

Object.assign(window, {
  LoginDesktop, RegisterDesktop, ForgotDesktop,
  LoginMobile, RegisterMobile, ForgotMobile,
});
