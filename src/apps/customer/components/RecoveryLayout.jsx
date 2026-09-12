import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Card from '../../../shared/ui/Card';

// Keep the existing Forgot shell and the customer login's control dimensions.
export const recoveryStyles = {
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontWeight: 600 },
  input: {
    width: '100%', minWidth: 0, height: 44, padding: '0 14px',
    background: 'var(--color-surface-main)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--r-md)', fontSize: 15, color: 'var(--color-text-primary)',
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  button: {
    width: '100%', minHeight: 48, padding: '12px 14px',
    background: 'var(--color-primary)', color: 'var(--color-surface-main)',
    border: 'none', borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 700,
    fontFamily: 'inherit', cursor: 'pointer', overflowWrap: 'anywhere',
  },
  link: {
    display: 'inline-flex', alignItems: 'center', minHeight: 44,
    color: 'var(--color-link)', fontWeight: 600, textDecoration: 'none', fontSize: 14,
  },
  feedback: { fontSize: 14, lineHeight: 1.55, margin: '0 0 20px', overflowWrap: 'anywhere' },
};

export default function RecoveryLayout({ title, description, children }) {
  return (
    <main style={{
      minHeight: '100vh', background: 'var(--color-bg-main)', position: 'relative',
      padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', boxSizing: 'border-box',
    }}>
      <BackgroundDecor />
      <Link to="/u/home" aria-label="Vai alla home" style={{
        ...recoveryStyles.link, color: 'inherit', marginBottom: 24, zIndex: 1,
      }}>
        <Brandmark />
      </Link>
      <Card radius="xl" padding="36px 40px" style={{ width: '100%', maxWidth: 440, zIndex: 1 }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500,
          lineHeight: 1.15, letterSpacing: 0, margin: '0 0 12px', overflowWrap: 'anywhere',
        }}>{title}</h1>
        <p style={{ ...recoveryStyles.feedback, color: 'var(--color-text-secondary)' }}>{description}</p>
        {children}
        <Link to="/u/login" style={{ ...recoveryStyles.link, marginTop: 24 }}>Torna ad accedere</Link>
      </Card>
    </main>
  );
}
