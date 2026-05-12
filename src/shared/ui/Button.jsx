import React from 'react';

/**
 * Button — componente shared minimal Step 2.
 *
 * Variants:
 *   - 'primary'   (CTA principali, color-primary)
 *   - 'secondary' (CTA secondarie, color-secondary)
 *   - 'ghost'     (transparent, link-style)
 *
 * Props:
 *   variant, loading, disabled, type, onClick, children, ...rest
 *
 * Lo stile usa le CSS vars già definite in src/index.css del repo staff
 * (--color-primary, --color-secondary, --r-md, --shadow-sm, ecc.).
 * Aggiunti via style inline per evitare nuovi file CSS in questo step.
 */

const baseStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 18px',
  border: 'none',
  borderRadius: 'var(--r-md, 16px)',
  fontSize: '15px',
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'transform 150ms ease, background-color 150ms ease, opacity 150ms ease',
  textDecoration: 'none',
};

const variantStyles = {
  primary: {
    background: 'var(--color-primary, #6f9792)',
    color: '#fff',
  },
  secondary: {
    background: 'var(--color-secondary, #67383f)',
    color: '#fff',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary, #6f9792)',
    border: '1px solid var(--color-border, #cfc1c4)',
  },
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  ...rest
}) {
  const isInactive = loading || disabled;
  const style = {
    ...baseStyle,
    ...(variantStyles[variant] || variantStyles.primary),
    opacity: isInactive ? 0.6 : 1,
    cursor: isInactive ? 'not-allowed' : 'pointer',
  };

  return (
    <button type={type} onClick={onClick} disabled={isInactive} style={style} {...rest}>
      {loading ? '…' : children}
    </button>
  );
}
