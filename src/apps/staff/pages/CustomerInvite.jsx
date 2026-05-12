import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, getCurrentUser } from '../lib/supabaseClient';
import {
  acceptCustomerPortalInvite,
  ensureCustomerProfile,
} from '../lib/database';

export default function CustomerInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/portal/invite/${token}`
      : undefined;

  const acceptInviteForCurrentUser = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await getCurrentUser();
      if (!user) return;

      // If the profile was auto-created as operator during email confirmation,
      // force customer role before accepting the invite.
      await ensureCustomerProfile(user);
      await acceptCustomerPortalInvite(token);
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.message || 'Non riesco ad accettare l\'invito.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    acceptInviteForCurrentUser();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (!email || !password) {
        throw new Error('Email e password sono obbligatorie.');
      }

      if (password.length < 6) {
        throw new Error('La password deve contenere almeno 6 caratteri.');
      }

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: inviteUrl,
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage(
            'Account creato. Conferma l\'email e verrai riportato automaticamente su questo invito.'
          );
          return;
        }

        await ensureCustomerProfile(data.user);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        const user = await getCurrentUser();
        await ensureCustomerProfile(user);
      }

      await acceptCustomerPortalInvite(token);
      navigate('/portal', { replace: true });
    } catch (err) {
      await supabase.auth.signOut();
      setError(err.message || 'Accesso non riuscito.');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <p style={{ color: 'var(--color-secondary)' }}>Verifico l'invito cliente...</p>
      </div>
    );
  }

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
            Accedi o crea un account per collegare la scheda del tuo cane.
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder="Almeno 6 caratteri"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {submitting ? 'Collegamento...' : isSignUp ? 'Crea e collega' : 'Accedi e collega'}
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

          <p className="text-xs text-center mt-4" style={{ color: 'var(--color-secondary)' }}>
            Usa sempre questo link invito per completare il collegamento.
          </p>

        </div>
      </div>
    </div>
  );
}
