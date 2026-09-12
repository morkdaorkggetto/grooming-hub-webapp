import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

const STAFF_MESSAGES = {
  invalid: 'Link non valido o scaduto. Richiedi un nuovo reset password.',
  missing: 'Inserisci e conferma la nuova password.',
  short: 'La password deve avere almeno 6 caratteri.',
  mismatch: 'Le due password non coincidono.',
  success: 'Password aggiornata con successo. Ora puoi accedere.',
  updateError: (error) => `Errore aggiornamento password: ${error.message}`,
};

// Extracted from the staff reset page; its defaults preserve the legacy flow.
export default function usePasswordReset({
  loginPath = '/login',
  messages = STAFF_MESSAGES,
  requireSession = false,
} = {}) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          const rejectedLink = requireSession && [window.location.hash.slice(1), window.location.search]
            .some((part) => {
              const params = new URLSearchParams(part);
              return ['error', 'error_code', 'error_description'].some((key) => params.has(key));
            });
          setHasSession(Boolean(session) && !rejectedLink);
          if (!session || rejectedLink) setError(messages.invalid);
          setCheckingSession(false);
        }
      } catch (err) {
        if (!requireSession) throw err;
        if (mounted) {
          setError(messages.invalid);
          setCheckingSession(false);
        }
      }
    };
    checkSession();
    return () => { mounted = false; };
  }, [messages, requireSession]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (requireSession && (checkingSession || !hasSession)) {
      setError(messages.invalid);
      return;
    }
    if (!password || !confirmPassword) {
      setError(messages.missing);
      return;
    }
    if (password.length < 6) {
      setError(messages.short);
      return;
    }
    if (password !== confirmPassword) {
      setError(messages.mismatch);
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(messages.success);
      setPassword('');
      setConfirmPassword('');
      await supabase.auth.signOut();
      setTimeout(() => navigate(loginPath, { replace: true }), 1200);
    } catch (err) {
      setError(messages.updateError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    password, setPassword, confirmPassword, setConfirmPassword,
    loading, checkingSession, hasSession, error, success, handleSubmit,
  };
}
