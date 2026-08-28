import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthProvider';
import { supabase } from '../../../shared/supabase/client';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Icon from '../../../shared/ui/Icon';
import './Redeem.css';

const VIEW_COPY = {
  missing: {
    eyebrow: 'Invito non disponibile',
    title: 'Manca il codice invito',
    body: 'Apri il link completo ricevuto dal salone. Se non lo trovi più, chiedi un nuovo invito.',
    tone: 'warning',
  },
  not_found: {
    eyebrow: 'Invito non riconosciuto',
    title: 'Questo link non è valido',
    body: 'Il codice non corrisponde a un invito del salone. Controlla di aver aperto il link completo.',
    tone: 'danger',
  },
  expired: {
    eyebrow: 'Invito scaduto',
    title: 'Serve un nuovo link',
    body: 'Per proteggere la tua scheda, gli inviti hanno una durata limitata. Chiedine uno nuovo al salone.',
    tone: 'warning',
  },
  used: {
    eyebrow: 'Invito già utilizzato',
    title: 'Questo link è già stato collegato',
    body: 'L’invito appartiene a un account già registrato. Accedi con quell’account oppure contatta il salone.',
    tone: 'warning',
  },
  already: {
    eyebrow: 'Scheda già collegata',
    title: 'È tutto a posto',
    body: 'Questo invito era già associato al tuo account. Puoi continuare nella tua area cliente.',
    tone: 'success',
  },
  staff: {
    eyebrow: 'Account staff riconosciuto',
    title: 'Usa un account cliente separato',
    body: 'La scheda non è stata modificata. Esci e accedi con l’account personale destinato all’area cliente.',
    tone: 'danger',
  },
  success: {
    eyebrow: 'Collegamento completato',
    title: 'Benvenuto nella tua area',
    body: 'La scheda del tuo pet è ora collegata. Ti portiamo alla home cliente.',
    tone: 'success',
  },
};

function viewFromError(error) {
  const message = error?.message || '';
  if (message.includes('GH_INVITE_NOT_FOUND')) return 'not_found';
  if (message.includes('GH_INVITE_EXPIRED')) return 'expired';
  if (message.includes('GH_INVITE_ALREADY_USED')) return 'used';
  if (message.includes('GH_INVITE_STAFF_ACCOUNT')) return 'staff';
  return 'error';
}

function InviteMessage({ view, error, user, onUseAnotherAccount }) {
  const copy = VIEW_COPY[view] || {
    eyebrow: 'Collegamento non riuscito',
    title: 'Non siamo riusciti a completare l’invito',
    body: error || 'Riprova tra poco o contatta il salone.',
    tone: 'danger',
  };

  return (
    <section className={`gh-redeem-message gh-redeem-message--${copy.tone}`} aria-live="polite">
      <span className="gh-redeem-message-icon">
        <Icon name={copy.tone === 'success' ? 'check' : 'paw'} size={24} />
      </span>
      <p className="gh-redeem-eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="gh-redeem-copy">{copy.body}</p>
      <div className="gh-redeem-actions">
        {(view === 'success' || view === 'already') && (
          <Link className="gh-redeem-button gh-redeem-button--primary" to="/u/home">
            Apri la mia area
            <Icon name="arrow" size={17} />
          </Link>
        )}
        {user && ['staff', 'used', 'expired', 'not_found', 'error'].includes(view) && (
          <button
            className="gh-redeem-button gh-redeem-button--primary"
            type="button"
            onClick={onUseAnotherAccount}
          >
            Usa un altro account
          </button>
        )}
        {!user && view !== 'success' && view !== 'already' && (
          <Link className="gh-redeem-button gh-redeem-button--secondary" to="/u/login">
            Vai all’accesso
          </Link>
        )}
      </div>
    </section>
  );
}

export default function Redeem() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    refreshMemberships,
    signIn,
    signOut,
  } = useAuth();
  const [authMode, setAuthMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState(token ? 'loading' : 'missing');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const attemptedFor = useRef('');
  const redirectTimer = useRef(null);

  const completeInvite = useCallback(async (activeUserId) => {
    setView('loading');
    setError('');

    const { data, error: inviteError } = await supabase.rpc('accept_customer_invite', {
      p_token: token,
    });

    if (inviteError) {
      setError(inviteError.message || 'Non siamo riusciti a completare l’invito.');
      setView(viewFromError(inviteError));
      return;
    }

    const refreshedMemberships = await refreshMemberships(activeUserId);
    if (!refreshedMemberships.some((membership) => membership.role === 'customer')) {
      setError('Il collegamento è riuscito, ma non riusciamo ancora ad aprire la tua area. Riprova tra poco.');
      setView('error');
      return;
    }

    if (data?.status === 'already_accepted') {
      setView('already');
      return;
    }

    setView('success');
    redirectTimer.current = window.setTimeout(() => {
      navigate('/u/home', { replace: true });
    }, 900);
  }, [navigate, refreshMemberships, token]);

  useEffect(() => () => {
    if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
  }, []);

  useEffect(() => {
    if (!token) {
      setView('missing');
      return;
    }
    if (authLoading) return;
    if (!user) {
      setView('form');
      return;
    }

    const attemptKey = `${user.id}:${token}`;
    if (attemptedFor.current === attemptKey) return;
    attemptedFor.current = attemptKey;
    completeInvite(user.id);
  }, [authLoading, completeInvite, token, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const normalizedEmail = email.trim();
      if (password.length < 8) {
        throw new Error('Scegli una password di almeno 8 caratteri.');
      }

      const result = authMode === 'signup'
        ? await supabase.auth.signUp({ email: normalizedEmail, password })
        : await signIn(normalizedEmail, password);

      if (result.error) throw result.error;
      const activeUser = result.data?.user;
      if (!result.data?.session || !activeUser?.id) {
        throw new Error('L’account richiede una conferma non prevista. Contatta il salone.');
      }

      attemptedFor.current = `${activeUser.id}:${token}`;
      await completeInvite(activeUser.id);
    } catch (submitError) {
      setError(submitError.message || 'Accesso non riuscito.');
      setView('form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseAnotherAccount = async () => {
    await signOut();
    attemptedFor.current = '';
    setError('');
    setView(token ? 'form' : 'missing');
  };

  return (
    <main className="gh-redeem-page">
      <BackgroundDecor />
      <div className="gh-redeem-brand"><Brandmark /></div>
      <div className="gh-redeem-shell">
        {view === 'loading' && (
          <section className="gh-redeem-message" aria-live="polite">
            <span className="gh-redeem-spinner" aria-hidden="true" />
            <p className="gh-redeem-eyebrow">Invito cliente</p>
            <h1>Colleghiamo la tua scheda</h1>
            <p className="gh-redeem-copy">La verifica richiede solo un momento.</p>
          </section>
        )}

        {view === 'form' && (
          <section className="gh-redeem-card">
            <p className="gh-redeem-eyebrow">Invito personale</p>
            <h1>Entra nell’area del tuo pet</h1>
            <p className="gh-redeem-copy">
              Crea il tuo accesso oppure usa un account cliente già esistente. Il collegamento avverrà automaticamente.
            </p>

            <div className="gh-redeem-segments" aria-label="Tipo di accesso">
              <button
                type="button"
                aria-pressed={authMode === 'signup'}
                onClick={() => setAuthMode('signup')}
              >
                Crea account
              </button>
              <button
                type="button"
                aria-pressed={authMode === 'signin'}
                onClick={() => setAuthMode('signin')}
              >
                Ho già un account
              </button>
            </div>

            <form className="gh-redeem-form" onSubmit={handleSubmit}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@email.com"
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Almeno 8 caratteri"
                />
              </label>

              {error && <div className="gh-redeem-alert" role="alert">{error}</div>}

              <button
                className="gh-redeem-button gh-redeem-button--primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Collegamento in corso...' : authMode === 'signup' ? 'Crea e collega' : 'Accedi e collega'}
                {!submitting && <Icon name="arrow" size={17} />}
              </button>
            </form>

            <p className="gh-redeem-footnote">
              Questo link collega esclusivamente la scheda preparata dal salone.
            </p>
          </section>
        )}

        {!['loading', 'form'].includes(view) && (
          <InviteMessage
            view={view}
            error={error}
            user={user}
            onUseAnotherAccount={handleUseAnotherAccount}
          />
        )}
      </div>
    </main>
  );
}
