import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ensureCustomerProfile } from '../lib/database';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!email || !password) throw new Error('Email e password sono obbligatorie.');
      if (password.length < 6) throw new Error('La password deve contenere almeno 6 caratteri.');

      if (isSignUp) {
        const redirectUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/portal/login`
            : undefined;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage('Account creato. Controlla la tua email per confermare l\'accesso.');
          return;
        }

        await ensureCustomerProfile(data.user);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.message || 'Accesso non riuscito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.28em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
            Grooming Hub
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Area cliente
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-secondary)' }}>
            Accedi per vedere card, fidelity e contatti del tuo cane.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: '#ead7c5' }}>
          <h2 className="text-2xl font-bold mb-5 text-center" style={{ color: 'var(--color-text-primary)' }}>
            {isSignUp ? 'Crea account cliente' : 'Accedi come cliente'}
          </h2>

          {error ? (
            <div className="mb-4 rounded-xl border p-4 bg-red-50 border-red-200">
              <p className="text-sm font-medium" style={{ color: 'var(--color-danger-text)' }}>{error}</p>
            </div>
          ) : null}

          {message ? (
            <div className="mb-4 rounded-xl border p-4 bg-green-50 border-green-200">
              <p className="text-sm font-medium" style={{ color: 'var(--color-success-text)' }}>{message}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder="nome@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder="Almeno 6 caratteri"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Caricamento...' : isSignUp ? 'Crea account' : 'Accedi'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsSignUp((value) => !value)}
            className="w-full mt-5 text-sm font-semibold underline"
            style={{ color: 'var(--color-secondary)' }}
          >
            {isSignUp ? 'Hai gia un account? Accedi' : 'Non hai un account? Crealo'}
          </button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-xs underline" style={{ color: 'var(--color-secondary)' }}>
              Area riservata operatori
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
