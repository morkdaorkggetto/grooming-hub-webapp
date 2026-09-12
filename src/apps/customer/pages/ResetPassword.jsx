import React from 'react';
import { Link } from 'react-router-dom';
import usePasswordReset from '../../../shared/auth/usePasswordReset';
import RecoveryLayout, { recoveryStyles as styles } from '../components/RecoveryLayout';

const MESSAGES = {
  invalid: 'Questo link non è valido o è scaduto. Richiedine uno nuovo per scegliere la tua password.',
  missing: 'Scrivi e conferma la tua nuova password.',
  short: 'Scegli una password di almeno 6 caratteri.',
  mismatch: 'Le password non coincidono. Controlla e riprova.',
  success: 'La tua password è stata aggiornata. Ora puoi accedere alla tua area.',
  updateError: () => 'Non siamo riusciti ad aggiornare la tua password. Riprova o richiedi un nuovo link.',
};

export default function ResetPassword() {
  const {
    password, setPassword, confirmPassword, setConfirmPassword,
    loading, checkingSession, hasSession, error, success, handleSubmit,
  } = usePasswordReset({ loginPath: '/u/login', messages: MESSAGES, requireSession: true });

  return (
    <RecoveryLayout title="Scegli la tua nuova password" description="Usa almeno 6 caratteri per proteggere la tua area.">
      {error && <p role="alert" style={{ ...styles.feedback, color: 'var(--color-danger-text)' }}>{error}</p>}
      {success && <p role="status" style={styles.feedback}>{success}</p>}
      {checkingSession ? <p role="status" style={styles.feedback}>Stiamo verificando il tuo link...</p> : (
        hasSession && !success && <form onSubmit={handleSubmit} style={styles.form} aria-busy={loading}>
          <label style={styles.label}>
            Nuova password
            <input type="password" autoComplete="new-password" value={password}
              onChange={(event) => setPassword(event.target.value)} disabled={loading} style={styles.input} />
          </label>
          <label style={styles.label}>
            Conferma la nuova password
            <input type="password" autoComplete="new-password" value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)} disabled={loading} style={styles.input} />
          </label>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Salvataggio in corso...' : 'Salva la nuova password'}
          </button>
        </form>
      )}
      {!checkingSession && !success && <Link to="/u/forgot" style={styles.link}>Richiedi un nuovo link</Link>}
    </RecoveryLayout>
  );
}
