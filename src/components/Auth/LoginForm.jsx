import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { DEMO_MODE } from '../../lib/demoMode';
import { ensureOperatorProfile } from '../../lib/database';

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
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-main) 0%, var(--color-surface-muted) 100%)',
        }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              🐕 Grooming Hub
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
              Accesso operatori
            </p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-lg p-8"
            style={{
              borderTop: '4px solid var(--color-primary)',
              boxShadow: '0 18px 40px rgba(91, 67, 54, 0.10)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3 text-center" style={{ color: 'var(--color-text-primary)' }}>
              Completa accesso
            </h2>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--color-secondary)' }}>
              Sessione attiva ({currentUser.email}). Completa l'accesso all'area operatori.
            </p>

            {error && (
              <div
                className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200"
                style={{ color: 'var(--color-danger-text)' }}
              >
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleContinueAsOperator}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Continua come operatore
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-main) 0%, var(--color-surface-muted) 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            🐕 Grooming Hub
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
            Gestisci i tuoi clienti a quattro zampe
          </p>
        </div>

        {/* Card Form */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8"
          style={{
            borderTop: '4px solid var(--color-primary)',
            boxShadow: '0 18px 40px rgba(91, 67, 54, 0.10)',
          }}
        >
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {isSignUp ? 'Crea Account' : 'Accedi'}
          </h2>

          {/* Messaggio di errore */}
          {error && (
            <div
              className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200"
              style={{ color: 'var(--color-danger-text)' }}
            >
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Messaggio di successo */}
          {successMessage && (
            <div
              className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200"
              style={{ color: 'var(--color-success-text)' }}
            >
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="esempio@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: 'var(--color-border)',
                  focusRingColor: 'var(--color-primary)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface-main)',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Almeno 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: 'var(--color-border)',
                  focusRingColor: 'var(--color-primary)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface-main)',
                }}
              />
            </div>

            {!isSignUp && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-sm underline"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  Password dimenticata?
                </button>
              </div>
            )}

            {/* Pulsante Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Caricamento...
                </span>
              ) : isSignUp ? (
                'Registrati'
              ) : (
                'Accedi'
              )}
            </button>
          </form>

          {/* Toggle tra SignUp e SignIn */}
          {!DEMO_MODE && (
            <div className="mt-6 text-center">
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm">
                {isSignUp
                  ? 'Hai già un account? '
                  : 'Non hai un account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="font-bold underline hover:opacity-80 transition"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {isSignUp ? 'Accedi' : 'Registrati'}
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          className="mt-6 text-center text-xs"
          style={{ color: 'var(--color-secondary)' }}
        >
          <p>🔒 I tuoi dati sono protetti con Supabase</p>
          <p className="mt-1">Made with ❤️ for groomers</p>
        </div>
      </div>
    </div>
  );
}
