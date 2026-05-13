import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthProvider';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Card from '../../../shared/ui/Card';

/**
 * /u/login — form di accesso customer, Step 5 visual refinement.
 *
 * Pattern dal bundle design `proto-auth.jsx` LoginScreen (righe 138-250),
 * adattati alle decisioni di prodotto già prese:
 *   - NIENTE social login (Google / Apple) — Decisione Gate 2 #12: solo invito.
 *   - NIENTE link "Registrati" pubblico — /u/redeem/:token è l'unica via.
 *   - NIENTE checkbox "Resta connesso" — semplificazione Step 5.
 *
 * Layout:
 *   - BackgroundDecor con due gradient radiali
 *   - Brandmark in alto-sinistra (desktop) o centrato (mobile)
 *   - AuthCard centrata: H1 Fraunces "Bentornato", sub asciutto, Field email/password,
 *     "Password dimenticata?" link, Submit "Accedi".
 *   - Footer asciutto (no link "Registrati").
 *
 * Layout responsive via window.matchMedia (no media query CSS perché lo
 * styling è inline; pattern coerente col resto del customer Step 5).
 */

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/u/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message || 'Credenziali non valide.');
      return;
    }
    navigate(redirect, { replace: true });
  };

  return (
    <main
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'var(--color-bg-main)',
        position: 'relative',
        padding: isMobile ? 20 : 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'center',
        boxSizing: 'border-box',
      }}
    >
      <BackgroundDecor />

      {!isMobile && (
        <div style={{ position: 'absolute', top: 28, left: 40, zIndex: 1 }}>
          <Brandmark />
        </div>
      )}
      {isMobile && (
        <div style={{ marginBottom: 18, zIndex: 1 }}>
          <Brandmark size={28} />
        </div>
      )}

      <Card
        radius="xl"
        padding={isMobile ? 8 : '36px 40px'}
        elevated={!isMobile}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 440,
          background: isMobile ? 'transparent' : undefined,
          border: isMobile ? 'none' : undefined,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              margin: 0,
              color: 'var(--color-text-primary)',
            }}
          >
            Bentornato
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Accedi al tuo account per gestire prenotazioni e i tuoi pet.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <FieldLabel label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="mario.rossi@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={fieldStyle}
            />
          </FieldLabel>

          <FieldLabel
            label="Password"
            trailing={
              <Link
                to="/u/forgot"
                style={{
                  fontSize: 12,
                  color: 'var(--color-link)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Password dimenticata?
              </Link>
            }
          >
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={fieldStyle}
            />
          </FieldLabel>

          {error && (
            <div
              role="alert"
              style={{
                color: 'var(--color-danger-text)',
                background: 'var(--color-danger-bg)',
                padding: '10px 12px',
                borderRadius: 'var(--r-sm)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: 48,
              background: submitting ? 'var(--color-border)' : 'var(--color-primary)',
              color: '#FBF6F3',
              border: 'none',
              borderRadius: 'var(--r-md)',
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              marginTop: 4,
            }}
          >
            {submitting ? 'Attendere…' : 'Accedi'}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          Hai ricevuto un invito dal salone?
          <br />
          <Link
            to="/u/redeem"
            style={{
              color: 'var(--color-link)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Usa il link che ti hanno mandato
          </Link>
          .
        </div>
      </Card>
    </main>
  );
}

function FieldLabel({ label, trailing, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 6,
          color: 'var(--color-text-primary)',
        }}
      >
        <span>{label}</span>
        {trailing}
      </div>
      {children}
    </label>
  );
}

const fieldStyle = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};
