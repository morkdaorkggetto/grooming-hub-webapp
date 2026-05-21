import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useCurrentCustomer } from '../../apps/customer/hooks/useCurrentCustomer';
import Brandmark from './Brandmark';
import Icon from './Icon';

/**
 * CustomerNav — navigazione globale Fase 1 per /u/* (logged-in only).
 *
 * Pattern dal bundle Design `proto/proto-dashboard.jsx` (TopNav + BottomNav),
 * adattati a Fase 1:
 *   - 3 slot nav (vs 4 del proto): Home, Promozioni, Avatar.
 *   - Avatar action: dropdown logout (Profilo esteso fuori scope Fase 1).
 *   - Desktop: TopNav orizzontale.
 *   - Mobile: BottomNav sticky.
 *
 * Wrappabile attorno al children — è un layout component.
 */

const NAV_ITEMS = [
  { to: '/u/home', label: 'Home', iconName: 'paw' },
  { to: '/u/promotions', label: 'Promozioni', iconName: 'sparkle' },
];

function getInitial(customer, user) {
  if (customer?.first_name) return customer.first_name.charAt(0).toUpperCase();
  const local = (user?.email || '').split('@')[0] || '';
  return local ? local.charAt(0).toUpperCase() : '?';
}

function AvatarButton({ initial, onClick, ariaExpanded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={ariaExpanded}
      aria-label="Apri menu utente"
      style={{
        background: 'var(--color-surface-soft)',
        border: '1px solid var(--color-border)',
        width: 40,
        height: 40,
        borderRadius: 999,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'inherit',
        color: 'var(--color-text-primary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initial}
    </button>
  );
}

function MobileProfileButton({ active, onClick, ariaExpanded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={ariaExpanded}
      aria-label="Apri menu utente"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        fontFamily: 'inherit',
        fontSize: 10,
        fontWeight: 600,
        padding: '4px 8px',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
      <span>Profilo</span>
    </button>
  );
}

function LogoutDropdown({ origin, onLogout, onClose, dropdownRef }) {
  // origin: 'top' (sotto l'avatar — desktop) | 'bottom' (sopra il pulsante — mobile)
  const positionStyle =
    origin === 'top'
      ? { position: 'absolute', top: 'calc(100% + 8px)', right: 0 }
      : { position: 'absolute', bottom: 'calc(100% + 8px)', right: 8 };

  return (
    <div
      ref={dropdownRef}
      role="menu"
      style={{
        ...positionStyle,
        background: 'var(--color-surface-main)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--r-md)',
        boxShadow: '0 8px 24px -8px rgba(43,37,37,.18), 0 1px 2px rgba(43,37,37,.04)',
        padding: 6,
        minWidth: 160,
        zIndex: 50,
      }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onLogout();
        }}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '10px 12px',
          borderRadius: 'var(--r-sm)',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'inherit',
          color: 'var(--color-text-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-soft)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Icon name="logout" size={16} />
        Esci
      </button>
    </div>
  );
}

export default function CustomerNav({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { customer } = useCurrentCustomer();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarWrapRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Click-outside per chiudere il dropdown
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      const dd = dropdownRef.current;
      const wrap = avatarWrapRef.current;
      if (dd && dd.contains(e.target)) return;
      if (wrap && wrap.contains(e.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  // Chiudi il dropdown al cambio di rotta
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/u/login', { replace: true });
  };

  const initial = getInitial(customer, user);
  const isActive = (path) => location.pathname.startsWith(path);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Contenuto pagina */}
        <div style={{ flex: 1 }}>{children}</div>

        {/* BottomNav */}
        <nav
          aria-label="Navigazione principale"
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--color-surface-main)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '10px 8px 28px',
            zIndex: 40,
          }}
        >
          {NAV_ITEMS.map((it) => {
            const active = isActive(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontFamily: 'inherit',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '4px 8px',
                }}
              >
                <Icon name={it.iconName} size={22} stroke={1.8} />
                <span>{it.label}</span>
              </Link>
            );
          })}

          <div ref={avatarWrapRef} style={{ position: 'relative' }}>
            <MobileProfileButton
              active={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              ariaExpanded={menuOpen}
            />
            {menuOpen && (
              <LogoutDropdown
                origin="bottom"
                dropdownRef={dropdownRef}
                onLogout={handleLogout}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop
  return (
    <div>
      <nav
        aria-label="Navigazione principale"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-main)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Brandmark cliccabile a sx */}
        <Link to="/u/home" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Vai alla home">
          <Brandmark size={32} />
        </Link>

        {/* Tab al centro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_ITEMS.map((it) => {
            const active = isActive(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                style={{
                  textDecoration: 'none',
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontFamily: 'inherit',
                  borderBottom: active
                    ? '2px solid var(--color-primary)'
                    : '2px solid transparent',
                }}
              >
                {it.label}
              </Link>
            );
          })}
        </div>

        {/* Avatar a dx */}
        <div ref={avatarWrapRef} style={{ position: 'relative' }}>
          <AvatarButton
            initial={initial}
            onClick={() => setMenuOpen((v) => !v)}
            ariaExpanded={menuOpen}
          />
          {menuOpen && (
            <LogoutDropdown
              origin="top"
              dropdownRef={dropdownRef}
              onLogout={handleLogout}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </nav>

      {/* Contenuto pagina */}
      <div>{children}</div>
    </div>
  );
}
