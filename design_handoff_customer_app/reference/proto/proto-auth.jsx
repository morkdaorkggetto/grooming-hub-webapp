// ───────────────────────────────────────────────────────────
// PROTO · Auth screens (Login, Register, Forgot)
// Shared primitives, reused across viewports. Mobile sits inside the iPhone frame.
// ───────────────────────────────────────────────────────────

const { useState: useStateAuth } = React;

// ─── Shared primitives ────────────────────────────────────────────────────

const AuthBrandmark = ({ size = 36 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: size, height: size, borderRadius: size / 2.8,
      background: 'var(--color-primary)',
      display: 'grid', placeItems: 'center', color: '#FBF6F3',
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="9" r="2"/><circle cx="9" cy="5" r="2"/>
        <circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/>
        <path d="M7 15c0-3 2-5 5-5s5 2 5 5c0 2.5-2 4-5 4s-5-1.5-5-4z"/>
      </svg>
    </div>
    <div style={{
      fontFamily: 'var(--font-serif)', fontSize: size * 0.55, fontWeight: 500,
      letterSpacing: '-0.01em', lineHeight: 1,
    }}>Grooming Hub</div>
  </div>
);

const AuthField = ({ label, type = 'text', value, onChange, placeholder = '', hint, required = true, trailing, autoComplete }) => (
  <label style={{ display: 'block' }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontSize: 13, fontWeight: 600, marginBottom: 6,
    }}>
      <span>{label}{!required && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 6 }}>(opzionale)</span>}</span>
      {trailing}
    </div>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      style={{
        width: '100%', height: 44, padding: '0 14px',
        background: '#fff', border: '1px solid var(--color-border)',
        borderRadius: 'var(--r-md)',
        fontSize: 14, color: 'var(--color-text-primary)',
        fontFamily: 'inherit', outline: 'none',
        boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
      onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
    />
    {hint && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>{hint}</div>}
  </label>
);

const AuthSocialBtn = ({ provider, onClick }) => {
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
    <button onClick={onClick} style={{
      width: '100%', height: 52, padding: '0 16px',
      background: '#fff', border: '1px solid var(--color-border)',
      borderRadius: 'var(--r-md)', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
    }}>
      {icons[provider]}
      <span>Continua con {provider === 'google' ? 'Google' : 'Apple'}</span>
    </button>
  );
};

const AuthDivider = ({ label = 'oppure' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-secondary)', fontSize: 12, margin: '4px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}/>
    <span>{label}</span>
    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}/>
  </div>
);

const AuthSubmit = ({ children, disabled, onClick }) => (
  <button type="button" disabled={disabled} onClick={onClick} style={{
    width: '100%', height: 48,
    background: disabled ? 'var(--color-border)' : 'var(--color-primary)',
    color: '#FBF6F3', border: 'none', borderRadius: 'var(--r-md)',
    fontSize: 15, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
  }}>
    {children}
  </button>
);

const AuthH1 = ({ children, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <h1 style={{
      fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500,
      lineHeight: 1.1, letterSpacing: '-0.015em', margin: 0,
    }}>{children}</h1>
    {sub && <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{sub}</p>}
  </div>
);

const AuthBg = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
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

// ─── LOGIN ────────────────────────────────────────────────────────────────
const LoginScreen = () => {
  const { viewport, nav, set, toast } = useApp();
  const [email, setEmail] = useStateAuth('martina@grooming.it');
  const [password, setPassword] = useStateAuth('demo1234');

  const signIn = () => {
    if (!email || !password) {
      toast('Inserisci email e password', 'error');
      return;
    }
    // Demo: accetta qualsiasi valore, precompila Martina+Luna
    set({
      user: { name: 'Martina', email, phone: '+39 333 123 4567' },
      pets: [{
        id: 'luna', name: 'Luna', breed: 'Golden Retriever',
        birthdate: '2020-06-15', tier: 'gold', coins: 14,
      }],
      appointments: [{
        id: 'a1', petId: 'luna', service: 'Bagno & tosatura',
        date: '2025-04-30', time: '10:30', status: 'confirmed',
        groomer: 'Giulia', location: 'Via Po 14, Torino',
      }],
      route: { name: 'dashboard', params: {} },
    });
    toast('Bentornata, Martina 👋');
  };

  const isMobile = viewport === 'mobile';

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'var(--color-bg-main)',
      position: 'relative', padding: isMobile ? 20 : 40,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center',
      boxSizing: 'border-box',
    }}>
      <AuthBg/>
      {!isMobile && (
        <div style={{ position: 'absolute', top: 28, left: 40, zIndex: 1 }}>
          <AuthBrandmark/>
        </div>
      )}
      {isMobile && (
        <div style={{ marginBottom: 18, zIndex: 1 }}>
          <AuthBrandmark size={28}/>
        </div>
      )}

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        background: isMobile ? 'transparent' : 'var(--color-surface-main)',
        border: isMobile ? 'none' : '1px solid var(--color-border)',
        borderRadius: 'var(--r-xl)',
        padding: isMobile ? 8 : '36px 40px',
        boxShadow: isMobile ? 'none' : '0 1px 2px rgba(43,37,37,.04), 0 12px 40px -24px rgba(43,37,37,.25)',
        boxSizing: 'border-box',
      }}>
        <AuthH1 sub="Accedi al tuo account per gestire prenotazioni e i tuoi pet.">
          Bentornato
        </AuthH1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <AuthSocialBtn provider="google" onClick={signIn}/>
          <AuthSocialBtn provider="apple" onClick={signIn}/>
        </div>

        <AuthDivider/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
          <AuthField label="Email" type="email" value={email} onChange={setEmail}
            placeholder="mario.rossi@email.com" autoComplete="email"/>
          <AuthField label="Password" type="password" value={password} onChange={setPassword}
            placeholder="••••••••" autoComplete="current-password"
            trailing={<a href="#" onClick={e => { e.preventDefault(); nav('forgot'); }}
              style={{ fontSize: 12, color: 'var(--color-link)', textDecoration: 'none', fontWeight: 600 }}>
              Password dimenticata?
            </a>}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}/>
            <span>Resta connesso su questo dispositivo</span>
          </label>

          <AuthSubmit onClick={signIn}>Accedi</AuthSubmit>
        </div>

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)',
        }}>
          Non hai un account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); nav('register'); }}
            style={{ color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none' }}>
            Registrati
          </a>
        </div>
      </div>

      {!isMobile && (
        <div style={{
          marginTop: 16, fontSize: 11, lineHeight: 1.5, zIndex: 1,
          color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 380,
        }}>
          Questo è un prototipo demo. Qualsiasi email/password funziona.
        </div>
      )}
    </div>
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────
const RegisterScreen = () => {
  const { viewport, nav, set, toast } = useApp();
  const [form, setForm] = useStateAuth({
    name: '', email: '', phone: '', password: '',
    petName: '', petBreed: '', petBirth: '',
  });
  const upd = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.name && form.email && form.password && form.petName;

  const doRegister = () => {
    if (!valid) { toast('Compila i campi richiesti', 'error'); return; }
    set({
      user: { name: form.name, email: form.email, phone: form.phone || null },
      pets: [{
        id: 'pet1', name: form.petName || 'Il mio pet',
        breed: form.petBreed || '—',
        birthdate: form.petBirth || null,
        tier: 'bronze', coins: 0,
      }],
      appointments: [],
      route: { name: 'dashboard', params: {} },
    });
    toast('Account creato · benvenuto!');
  };

  const isMobile = viewport === 'mobile';

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'var(--color-bg-main)',
      position: 'relative', padding: isMobile ? 20 : 40,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'flex-start' : 'flex-start',
      paddingTop: isMobile ? 20 : 80,
      boxSizing: 'border-box',
    }}>
      <AuthBg/>
      {!isMobile && <div style={{ position: 'absolute', top: 28, left: 40, zIndex: 1 }}><AuthBrandmark/></div>}
      {isMobile && <div style={{ marginBottom: 18, zIndex: 1 }}><AuthBrandmark size={28}/></div>}

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: isMobile ? 440 : 520,
        background: isMobile ? 'transparent' : 'var(--color-surface-main)',
        border: isMobile ? 'none' : '1px solid var(--color-border)',
        borderRadius: 'var(--r-xl)',
        padding: isMobile ? 8 : '36px 40px',
        boxShadow: isMobile ? 'none' : '0 1px 2px rgba(43,37,37,.04), 0 12px 40px -24px rgba(43,37,37,.25)',
        boxSizing: 'border-box',
      }}>
        <AuthH1 sub="Bastano pochi dati per iniziare a prenotare.">
          Crea il tuo account
        </AuthH1>

        <div style={{ display: isMobile ? 'flex' : 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1 }}><AuthSocialBtn provider="google" onClick={doRegister}/></div>
          <div style={{ flex: 1 }}><AuthSocialBtn provider="apple" onClick={doRegister}/></div>
        </div>

        <AuthDivider/>

        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--color-text-secondary)', margin: '18px 0 12px',
        }}>I tuoi dati</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AuthField label="Nome e cognome" value={form.name} onChange={upd('name')} placeholder="Mario Rossi"/>
          {isMobile ? (
            <>
              <AuthField label="Email" type="email" value={form.email} onChange={upd('email')} placeholder="mario.rossi@email.com"/>
              <AuthField label="Telefono" type="tel" value={form.phone} onChange={upd('phone')} placeholder="+39 333 123 4567" required={false}/>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AuthField label="Email" type="email" value={form.email} onChange={upd('email')} placeholder="mario.rossi@email.com"/>
              <AuthField label="Telefono" type="tel" value={form.phone} onChange={upd('phone')} placeholder="+39 333 123 4567" required={false}/>
            </div>
          )}
          <AuthField label="Password" type="password" value={form.password} onChange={upd('password')}
            placeholder="Minimo 8 caratteri" hint="Almeno 8 caratteri, una lettera e un numero."/>
        </div>

        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--color-text-secondary)', margin: '24px 0 12px',
        }}>Il tuo pet</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isMobile ? (
            <>
              <AuthField label="Nome del pet" value={form.petName} onChange={upd('petName')} placeholder="Luna"/>
              <AuthField label="Razza" value={form.petBreed} onChange={upd('petBreed')} placeholder="Es. Golden Retriever"/>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AuthField label="Nome del pet" value={form.petName} onChange={upd('petName')} placeholder="Luna"/>
              <AuthField label="Razza" value={form.petBreed} onChange={upd('petBreed')} placeholder="Es. Golden Retriever"/>
            </div>
          )}
          <AuthField label="Data di nascita" type="date" value={form.petBirth} onChange={upd('petBirth')} required={false}/>
        </div>

        <div style={{ marginTop: 24 }}>
          <AuthSubmit onClick={doRegister}>Crea account</AuthSubmit>
        </div>

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)',
        }}>
          Hai già un account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); nav('login'); }}
            style={{ color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none' }}>
            Accedi
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── FORGOT (dead-end finto) ──────────────────────────────────────────────
const ForgotScreen = () => {
  const { viewport, nav, toast } = useApp();
  const [email, setEmail] = useStateAuth('');
  const [sent, setSent] = useStateAuth(false);

  const send = () => {
    if (!email) { toast('Inserisci la tua email', 'error'); return; }
    setSent(true);
  };

  const isMobile = viewport === 'mobile';

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'var(--color-bg-main)',
      position: 'relative', padding: isMobile ? 20 : 40,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'flex-start' : 'center',
      boxSizing: 'border-box',
    }}>
      <AuthBg/>
      {!isMobile && <div style={{ position: 'absolute', top: 28, left: 40, zIndex: 1 }}><AuthBrandmark/></div>}
      {isMobile && <div style={{ marginBottom: 18, zIndex: 1 }}><AuthBrandmark size={28}/></div>}

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        background: isMobile ? 'transparent' : 'var(--color-surface-main)',
        border: isMobile ? 'none' : '1px solid var(--color-border)',
        borderRadius: 'var(--r-xl)',
        padding: isMobile ? 8 : '36px 40px',
        boxShadow: isMobile ? 'none' : '0 1px 2px rgba(43,37,37,.04), 0 12px 40px -24px rgba(43,37,37,.25)',
        boxSizing: 'border-box',
      }}>
        {!sent ? (
          <>
            <AuthH1 sub="Inserisci la tua email: ti invieremo un link per impostarne una nuova.">
              Reimposta la password
            </AuthH1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AuthField label="Email" type="email" value={email} onChange={setEmail}
                placeholder="mario.rossi@email.com"/>
              <AuthSubmit onClick={send}>Invia link di recupero</AuthSubmit>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              background: 'var(--color-success-bg)',
              display: 'grid', placeItems: 'center', margin: '0 auto 20px',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-success-text)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l9 6 9-6M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7M3 7l9 6 9-6"/>
              </svg>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500,
              margin: '0 0 8px', lineHeight: 1.2,
            }}>Controlla la tua casella</h2>
            <p style={{
              fontSize: 14, color: 'var(--color-text-secondary)',
              lineHeight: 1.5, margin: 0,
            }}>
              Se esiste un account collegato a <strong>{email}</strong>,
              riceverai un link per reimpostare la password.
            </p>
          </div>
        )}

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center', fontSize: 13,
        }}>
          <a href="#" onClick={e => { e.preventDefault(); nav('login'); }}
            style={{ color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none' }}>
            ← Torna al login
          </a>
        </div>
      </div>
    </div>
  );
};

registerRoute('login', LoginScreen);
registerRoute('register', RegisterScreen);
registerRoute('forgot', ForgotScreen);
