import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Card from '../../../shared/ui/Card';

/**
 * /u/pet/:petId — placeholder Step 6.
 *
 * La scheda pet reale (anagrafica + storico visite + preferenze + foto + note
 * owner) arriva in Step 7. Per ora basta una pagina che non rompe i Link
 * "Vedi la scheda di {petName}" della dashboard.
 */
export default function Pet() {
  useRequireCustomer();
  const { petId } = useParams();
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-main)',
        position: 'relative',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <BackgroundDecor />
      <Link
        to="/u/home"
        style={{
          display: 'inline-block',
          textDecoration: 'none',
          color: 'inherit',
          marginBottom: 24,
          zIndex: 1,
        }}
        aria-label="Vai alla home"
      >
        <Brandmark />
      </Link>
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
          Scheda pet
        </h1>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
          La scheda completa del pet (anagrafica, storico visite, preferenze di
          toelettatura, note) arriverà nello step successivo.
        </p>
        {petId && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Pet: <code style={{ fontFamily: 'monospace' }}>{petId}</code>
          </p>
        )}
        <Link
          to="/u/home"
          style={{ color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}
        >
          ← Torna alla home
        </Link>
      </Card>
    </main>
  );
}
