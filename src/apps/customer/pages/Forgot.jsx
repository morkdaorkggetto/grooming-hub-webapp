import React, { useState } from 'react';
import { supabase } from '../../../shared/supabase/client';
import RecoveryLayout, { recoveryStyles as styles } from '../components/RecoveryLayout';

const RESPONSE = 'Se questo indirizzo è associato al tuo account, riceverai un link per scegliere una nuova password. Controlla anche la posta indesiderata.';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/u/reset-password`,
      });
      if (sendError && (sendError.status >= 500 || sendError.status === 429 || sendError.name === 'AuthRetryableFetchError')) throw sendError;
      setMessage(RESPONSE);
    } catch {
      setError('Non riusciamo a inviare la richiesta in questo momento. Attendi un po’ e riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecoveryLayout title="Recupera la tua password" description="Inserisci l'indirizzo che usi per accedere alla tua area.">
      {message && <p role="status" style={styles.feedback}>{message}</p>}
      {error && <p role="alert" style={{ ...styles.feedback, color: 'var(--color-danger-text)' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form} aria-busy={loading}>
        <label style={styles.label}>
          Il tuo indirizzo email
          <input type="email" required autoComplete="email" value={email}
            onChange={(event) => setEmail(event.target.value)} disabled={loading} style={styles.input} />
        </label>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Invio in corso...' : 'Invia il link'}
        </button>
      </form>
    </RecoveryLayout>
  );
}
