import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../../shared/ui/Card';

/**
 * /u/redeem/:token — placeholder Step 2.
 *
 * L'integrazione vera con la RPC `accept_customer_invite(token)` arriva in
 * uno step successivo (probabilmente Step 4 dopo l'apertura della Dashboard).
 *
 * Oggi: mostra il token ricevuto in URL e una nota informativa.
 * Riferimenti:
 *   supabase/docs/gate5-design-decisions.md (logica adottiva)
 *   M11-bis: accept_customer_invite(p_token text) → jsonb
 */

export default function Redeem() {
  const { token } = useParams();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--color-bg-main, #f2ece9)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 480 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 24, color: 'var(--color-text-primary, #2b2525)' }}>
          Invito ricevuto
        </h1>
        <p
          style={{
            margin: '0 0 16px',
            color: 'var(--color-text-secondary, #7f6f73)',
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          Stiamo preparando l'accesso al portale. La conferma dell'invito sarà attiva nelle
          prossime versioni dell'app.
        </p>
        {token ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #7f6f73)' }}>
            Codice invito: <code style={{ fontFamily: 'monospace' }}>{token}</code>
          </p>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #7f6f73)' }}>
            Nessun codice nell'URL.
          </p>
        )}
        <p style={{ marginTop: 24, fontSize: 14 }}>
          <Link to="/u/login" style={{ color: 'var(--color-link, #5e8580)' }}>
            Hai già un account? Accedi
          </Link>
        </p>
      </Card>
    </main>
  );
}
