import React from 'react';

/**
 * Skeleton — placeholder con shimmer base. Step 2 minimal.
 *
 * Props: width, height (numeri o stringhe CSS). Default 100% × 16px.
 *
 * L'animazione è inline via CSS keyframes inietttate dal componente.
 * Nessun file CSS aggiuntivo: si evita di toccare il bundle styles.
 * In Step 3+ andrebbe estratta in shared/tokens/ insieme agli altri keyframes.
 */

const SHIMMER_KEYFRAMES = `@keyframes gh-skeleton-shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}`;

let injected = false;
function ensureKeyframes() {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = SHIMMER_KEYFRAMES;
  document.head.appendChild(style);
  injected = true;
}

export default function Skeleton({ width = '100%', height = 16, style, ...rest }) {
  ensureKeyframes();
  const skStyle = {
    display: 'inline-block',
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: '8px',
    background:
      'linear-gradient(90deg, var(--color-surface-soft, #f3ece8) 0%, var(--color-surface-muted, #e5d7d8) 50%, var(--color-surface-soft, #f3ece8) 100%)',
    backgroundSize: '200px 100%',
    animation: 'gh-skeleton-shimmer 1.4s ease-in-out infinite',
    ...(style || {}),
  };
  return <span style={skStyle} aria-hidden="true" {...rest} />;
}
