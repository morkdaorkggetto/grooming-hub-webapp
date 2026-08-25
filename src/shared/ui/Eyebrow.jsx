import React from 'react';

/**
 * Eyebrow — occhiello di sezione, uppercase letter-spaced.
 *
 * Pattern dal bundle design (proto-dashboard riga 178-187).
 * 11px / weight 700 / letter-spacing 0.22em / color text-secondary.
 *
 * Prop `withRule` aggiunge una linea breve a sinistra (24×1px), come nell'hero
 * della dashboard prototipo.
 */
export default function Eyebrow({
  children,
  withRule = false,
  staff = false,
  accent = false,
  className = '',
  style = {},
  ...rest
}) {
  return (
    <div
      className={`${staff ? 'gh-eyebrow--staff' : ''}${accent ? ' gh-eyebrow--accent' : ''} ${className}`.trim()}
      style={{
        fontSize: staff ? 9.5 : 11,
        fontWeight: 700,
        letterSpacing: staff ? '0.19em' : '0.22em',
        textTransform: 'uppercase',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: staff ? 0 : 10,
        ...style,
      }}
      {...rest}
    >
      {withRule && (
        <span
          aria-hidden="true"
          style={{ width: 24, height: 1, background: 'var(--color-text-secondary)' }}
        />
      )}
      {children}
    </div>
  );
}
