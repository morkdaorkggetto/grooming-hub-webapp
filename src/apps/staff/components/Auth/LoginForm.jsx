import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../../shared/supabase/client';
import { ensureOperatorProfile, getUserProfile } from '../../lib/database';
import { Button, ErrorState, Field, Panel } from '../StaffKit';

/**
 * LoginForm — Componente autenticazione
 * Gestisce l'accesso dello staff con Supabase Auth
 *
 * Props:
 * - onSuccess: callback dopo autenticazione riuscita
 */
export default function LoginForm({ currentUser = null, currentRole = null, onSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotPassword = async () => {
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Inserisci prima la tua email.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccessMessage('Ti ho inviato il link per reimpostare la password.');
    } catch (err) {
      setError(`Errore reset password: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsOperator = async () => {
    if (!currentUser) return;
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await ensureOperatorProfile(currentUser);
      if (onSuccess) onSuccess();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      await supabase.auth.signOut();
      setError(`Errore login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      setError(`Errore logout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestisce signin: accede con credenziali esistenti
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('Email e password sono obbligatori');
      return;
    }

    setLoading(true);

    try {
      const redirectTo = searchParams.get('redirect') || '/dashboard';

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();
      let destination = redirectTo;
      if (signedInUser) {
        const profile = await getUserProfile(signedInUser.id);
        if (profile?.role === 'customer') {
          destination = '/u/home';
        } else {
          await ensureOperatorProfile(signedInUser);
        }
      }

      setSuccessMessage('Login riuscito! Caricamento...');
      setEmail('');
      setPassword('');

      // Chiama callback dopo login
      if (onSuccess) onSuccess();
      navigate(destination, { replace: true });
    } catch (error) {
      await supabase.auth.signOut();
      setError(`Errore login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser && !currentRole) {
    return (
      <div className="gh-page gh-login-page">
        <section className="gh-login-shell">
          <div className="gh-login-brand">
            <h1 className="gh-login-title">🐕 Grooming Hub</h1>
            <p className="gh-login-subtitle">Accesso operatori</p>
          </div>

          <Panel className="gh-login-card">
            <div className="gh-login-heading">
              <h2 className="gh-login-card-title">Completa accesso</h2>
              <p className="gh-body">Sessione attiva ({currentUser.email}). Completa l'accesso all'area operatori.</p>
            </div>
            {error && <ErrorState title="La sessione resta disponibile" body={error} />}
            <div className="gh-login-actions">
              <Button staff wide type="button" onClick={handleContinueAsOperator} disabled={loading}>Continua come operatore</Button>
              <Button staff wide type="button" variant="outline" onClick={handleLogout} disabled={loading}>Esci</Button>
            </div>
          </Panel>
        </section>
      </div>
    );
  }

  return (
    <div className="gh-page gh-login-page">
      <section className="gh-login-shell">
        <div className="gh-login-brand">
          <h1 className="gh-login-title">🐕 Grooming Hub</h1>
          <p className="gh-login-subtitle">Gestisci i tuoi clienti a quattro zampe</p>
        </div>

        <Panel className="gh-login-card">
          <h2 className="gh-login-card-title">Accedi</h2>
          {error && <ErrorState title="Email e password restano inserite" body={error} />}
          {successMessage && <div className="gh-success-state" role="status">{successMessage}</div>}

          <form onSubmit={handleSignIn} className="gh-login-form">
            <Field id="email" label="Email" type="email" placeholder="esempio@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            <Field id="password" label="Password" type="password" placeholder="Almeno 6 caratteri" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />

            <div className="gh-login-forgot">
              <button type="button" onClick={handleForgotPassword} disabled={loading} className="gh-login-link">Password dimenticata?</button>
            </div>

            <Button staff wide type="submit" disabled={loading}>
              {loading ? 'Caricamento...' : 'Accedi'}
            </Button>
          </form>

          <div className="gh-login-toggle">
            <p className="gh-body">L'accesso allo staff viene attivato dal salone.</p>
          </div>
        </Panel>

        <footer className="gh-login-footer">
          <p>🔒 I tuoi dati sono protetti con Supabase</p>
          <p>Made with ❤️ for groomers</p>
        </footer>
      </section>
    </div>
  );
}
