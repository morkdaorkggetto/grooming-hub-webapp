import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Card from '../../../shared/ui/Card';

/**
 * /u/forgot — placeholder Step 5.
 *
 * Il flusso real reset password (Supabase resetPasswordForEmail) arriva in
 * uno step successivo. Per ora basta una pagina che non rompe il link
 * "Password dimenticata?" sul login.
 */
export default function Forgot() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-main)',
        position: 'relative',
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <BackgroundDecor />
      <div style={{ marginBottom: 24, zIndex: 1 }}>
        <Brandmark />
      </div>
      <Card radius="xl" padding="36px 40px" style={{ maxWidth: 440, zIndex: 1 }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            margin: '0 0 12px',
          }}
        >
          Recupero password
        </h1>
        <p
          style={{
            margin: '0 0 20px',
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          Il flusso di recupero password arriverà presto. Per il momento, contatta
          direttamente il salone per assistenza.
        </p>
        <Link
          to="/u/login"
          style={{
            color: 'var(--color-link)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          ← Torna al login
        </Link>
      </Card>
    </main>
  );
}
