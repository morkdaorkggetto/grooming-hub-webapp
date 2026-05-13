import React from 'react';

/**
 * Brandmark customer — rounded square con icona zampa + wordmark "Grooming Hub".
 *
 * Pattern dal bundle design (proto-auth.jsx AuthBrandmark, righe 10-29).
 * Side default 36; varianti consigliate: 28 (mobile), 44 (large).
 *
 * Distinto dal brandmark staff (che ha emoji 🐶 + tagline "Gestisci i tuoi
 * clienti a quattro zampe"). Qui niente emoji, niente tagline: il customer
 * vede solo il marchio.
 */
export default function Brandmark({ size = 36, style = {} }) {
  const svgSize = size * 0.55;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        ...style,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2.8,
          background: 'var(--color-primary, #6f9792)',
          display: 'grid',
          placeItems: 'center',
          color: '#FBF6F3',
          flexShrink: 0,
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="5" cy="9" r="2" />
          <circle cx="9" cy="5" r="2" />
          <circle cx="15" cy="5" r="2" />
          <circle cx="19" cy="9" r="2" />
          <path d="M7 15c0-3 2-5 5-5s5 2 5 5c0 2.5-2 4-5 4s-5-1.5-5-4z" />
        </svg>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: size * 0.55,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          color: 'var(--color-text-primary, #2b2525)',
        }}
      >
        Grooming Hub
      </div>
    </div>
  );
}
