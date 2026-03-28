import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        if (!session) {
          setError('Link non valido o scaduto. Richiedi un nuovo reset password.');
        }
        setCheckingSession(false);
      }
    };

    checkSession();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Inserisci e conferma la nuova password.');
      return;
    }

    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le due password non coincidono.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Password aggiornata con successo. Ora puoi accedere.');
      setPassword('');
      setConfirmPassword('');

      await supabase.auth.signOut();
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(`Errore aggiornamento password: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8" style={{ borderTop: '4px solid var(--color-primary)' }}>
        <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--color-text-primary)' }}>
          Reimposta Password
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--color-secondary)' }}>
          Inserisci una nuova password per il tuo account.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm" style={{ color: 'var(--color-danger-text)' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm" style={{ color: 'var(--color-success-text)' }}>
            {success}
          </div>
        )}

        {checkingSession ? (
          <p className="text-sm text-center" style={{ color: 'var(--color-secondary)' }}>Verifica link in corso...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Nuova password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Conferma password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Aggiornamento...' : 'Salva nuova password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm underline" style={{ color: 'var(--color-secondary)' }}>
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  );
}
