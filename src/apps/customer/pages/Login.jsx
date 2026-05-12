import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthProvider';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';

/**
 * /u/login — form di accesso customer.
 *
 * Step 2 minimal: solo email + password. Niente register (decisione Gate 2 #12:
 * il customer entra solo via accept_customer_invite con token). Niente forgot
 * password ancora.
 *
 * Su signIn riuscito, redirect a `?redirect=<path>` se presente, altrimenti
 * /u/home.
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--color-bg-main, #f2ece9)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, color: 'var(--color-text-primary, #2b2525)' }}>
          Accedi
        </h1>
        <p style={{ margin: '0 0 24px', color: 'var(--color-text-secondary, #7f6f73)', fontSize: 15 }}>
          Entra con le credenziali del tuo salone.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
            <span>Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>

          {error && (
            <div
              role="alert"
              style={{
                color: 'var(--color-danger-text, #b85e69)',
                background: 'var(--color-danger-bg, #f8e6e9)',
                padding: '10px 12px',
                borderRadius: 'var(--r-sm, 10px)',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <Button type="submit" loading={submitting} variant="primary">
            Entra
          </Button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--color-text-secondary, #7f6f73)' }}>
          Hai ricevuto un invito dal salone?{' '}
          <Link to="/u/redeem/" style={{ color: 'var(--color-link, #5e8580)' }}>
            Usa il link che ti hanno mandato
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}

const inputStyle = {
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: 'inherit',
  border: '1px solid var(--color-border, #cfc1c4)',
  borderRadius: 'var(--r-sm, 10px)',
  background: '#fff',
  color: 'var(--color-text-primary, #2b2525)',
};
