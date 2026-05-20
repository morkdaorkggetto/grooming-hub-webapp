import React from 'react';
import { Link } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Brandmark from '../../../shared/ui/Brandmark';
import Card from '../../../shared/ui/Card';

/**
 * /u/book — placeholder Step 6.
 *
 * Il wizard di prenotazione (pet → servizio → data/ora → conferma, con RPC
 * available_slots + book_appointment) arriva in Step 8. Per ora basta una
 * pagina che non rompe i CTA "Prenota un nuovo appuntamento" della dashboard.
 */
export default function Book() {
  useRequireCustomer();
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
          Prenotazione
        </h1>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
          Il wizard di prenotazione arriverà nello step successivo: sceglierai
          il pet, il servizio (Bagno o Toelettatura Completa), la data e
          l'ora. Per il momento, contatta il salone direttamente per fissare
          un nuovo appuntamento.
        </p>
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
