import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../../shared/supabase/client';
import { DEMO_MODE } from '../../lib/demoMode';
import { ensureOperatorProfile } from '../../lib/database';
import { Button, ErrorState, Field, Panel } from '../StaffKit';

/**
 * LoginForm — Componente autenticazione
 * Gestisce signup e signin con Supabase Auth
 *
 * Props:
 * - onSuccess: callback dopo autenticazione riuscita
 */
export default function LoginForm({ currentUser = null, currentRole = null, onSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
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
   * Gestisce signup: crea nuovo account + profilo utente
   */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validazione base
    if (!email || !password) {
      setError('Email e password sono obbligatori');
      return;
    }

    if (password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }

    setLoading(true);

    try {
      // 1. Crea account Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Crea profilo utente nella tabella profiles
      if (authData.user) {
        try {
          await ensureOperatorProfile(authData.user);
        } catch (profileError) {
          console.error('Errore creazione profilo:', profileError.message);
          // Non interrompiamo, continua anche se profilo non creato.
        }
      }

      setSuccessMessage(
        'Registrazione completata! Controlla la tua email per confermare.'
      );
      setEmail('');
      setPassword('');

      // Se onSuccess è fornito, attendere un po' prima di chiamare
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      setError(`Errore registrazione: ${error.message}`);
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
      if (signedInUser) {
        await ensureOperatorProfile(signedInUser);
      }

      setSuccessMessage('Login riuscito! Caricamento...');
      setEmail('');
      setPassword('');

      // Chiama callback dopo login
      if (onSuccess) onSuccess();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      await supabase.auth.signOut();
      setError(`Errore login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isSignUp ? handleSignUp : handleSignIn;

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
          <h2 className="gh-login-card-title">{isSignUp ? 'Crea Account' : 'Accedi'}</h2>
          {error && <ErrorState title="Email e password restano inserite" body={error} />}
          {successMessage && <div className="gh-success-state" role="status">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="gh-login-form">
            <Field id="email" label="Email" type="email" placeholder="esempio@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            <Field id="password" label="Password" type="password" placeholder="Almeno 6 caratteri" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />

            {!isSignUp && (
              <div className="gh-login-forgot">
                <button type="button" onClick={handleForgotPassword} disabled={loading} className="gh-login-link">Password dimenticata?</button>
              </div>
            )}

            <Button staff wide type="submit" disabled={loading}>
              {loading ? 'Caricamento...' : isSignUp ? 'Registrati' : 'Accedi'}
            </Button>
          </form>

          {!DEMO_MODE && (
            <div className="gh-login-toggle">
              <p className="gh-body">
                {isSignUp ? 'Hai già un account? ' : 'Non hai un account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="gh-login-link"
                >
                  {isSignUp ? 'Accedi' : 'Registrati'}
                </button>
              </p>
            </div>
          )}
        </Panel>

        <footer className="gh-login-footer">
          <p>🔒 I tuoi dati sono protetti con Supabase</p>
          <p>Made with ❤️ for groomers</p>
        </footer>
      </section>
    </div>
  );
}
