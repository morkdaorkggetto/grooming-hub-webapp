import React from 'react';

/**
 * Card — wrapper visivo standard, Step 5 con ombra discreta.
 *
 * Props:
 *   - radius: 'md' | 'lg' | 'xl' (default 'lg')
 *   - padding: numero o stringa CSS (default 20)
 *   - elevated: bool (default true) — false rimuove l'ombra
 *
 * Ombra: pattern bundle design (proto-auth.jsx AuthCard, riga 194).
 * Border 1px gray + radius lg di default + padding 20.
 */

const RADIUS_MAP = {
  md: 'var(--r-md, 16px)',
  lg: 'var(--r-lg, 24px)',
  xl: 'var(--r-xl, 28px)',
};

export default function Card({
  children,
  radius = 'lg',
  padding = 20,
  elevated = true,
  style,
  staff = false,
  className = '',
  ...rest
}) {
  const cardStyle = {
    background: staff ? '#fff' : 'var(--color-surface-main)',
    border: `1px solid ${staff ? 'var(--gh-border-60)' : 'var(--color-border)'}`,
    borderRadius: staff ? 'var(--gh-r-panel)' : (RADIUS_MAP[radius] || RADIUS_MAP.lg),
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    boxShadow: elevated && !staff
      ? '0 1px 2px rgba(43,37,37,.04), 0 12px 40px -24px rgba(43,37,37,.25)'
      : 'none',
    ...(style || {}),
  };
  return (
    <div className={`${staff ? 'gh-card--staff' : ''} ${className}`.trim()} style={cardStyle} {...rest}>
      {children}
    </div>
  );
}
