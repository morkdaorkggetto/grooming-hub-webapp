import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

/**
 * LoginForm — Componente autenticazione
 * Gestisce signup e signin con Supabase Auth
 *
 * Props:
 * - onSuccess: callback dopo autenticazione riuscita
 */
export default function LoginForm({ onSuccess }) {
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
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            business_name: email.split('@')[0], // nome di default dal prefix email
          });

        if (profileError) {
          console.error('Errore creazione profilo:', profileError.message);
          // Non interrompiamo, continua anche se profilo non creato
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
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      setSuccessMessage('Login riuscito! Caricamento...');
      setEmail('');
      setPassword('');

      // Chiama callback dopo login
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(`Errore login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isSignUp ? handleSignUp : handleSignIn;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#5a3a2a' }}>
            🐕 Grooming Hub
          </h1>
          <p className="text-sm" style={{ color: '#8b5a3c' }}>
            Gestisci i tuoi clienti a quattro zampe
          </p>
        </div>

        {/* Card Form */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8"
          style={{ borderTop: '4px solid #d4a574' }}
        >
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: '#5a3a2a' }}
          >
            {isSignUp ? 'Crea Account' : 'Accedi'}
          </h2>

          {/* Messaggio di errore */}
          {error && (
            <div
              className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200"
              style={{ color: '#991b1b' }}
            >
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Messaggio di successo */}
          {successMessage && (
            <div
              className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200"
              style={{ color: '#166534' }}
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
                style={{ color: '#5a3a2a' }}
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
                  borderColor: '#e8d5c4',
                  focusRingColor: '#d4a574',
                  color: '#5a3a2a',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: '#5a3a2a' }}
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
                  borderColor: '#e8d5c4',
                  focusRingColor: '#d4a574',
                  color: '#5a3a2a',
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
                  style={{ color: '#8b5a3c' }}
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
              style={{ backgroundColor: '#d4a574' }}
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
          <div className="mt-6 text-center">
            <p style={{ color: '#8b5a3c' }} className="text-sm">
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
                style={{ color: '#d4a574' }}
              >
                {isSignUp ? 'Accedi' : 'Registrati'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div
          className="mt-6 text-center text-xs"
          style={{ color: '#8b5a3c' }}
        >
          <p>🔒 I tuoi dati sono protetti con Supabase</p>
          <p className="mt-1">Made with ❤️ for groomers</p>
        </div>
      </div>
    </div>
  );
}
