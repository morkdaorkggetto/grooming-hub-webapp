import React from 'react';

/**
 * BackgroundDecor — due gradient radiali absolute (decoration di sfondo).
 *
 * Pattern dal bundle design (proto-auth.jsx AuthBg, righe 122-135).
 * Top-left: primary 12% opacity / Bottom-right: secondary 8% opacity.
 *
 * pointerEvents: none → non interferisce con i click.
 * Aspettarsi: contenitore parent con position: relative + overflow: hidden
 * (o questa decor si propaga oltre i bordi).
 */
export default function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 620,
          height: 620,
          borderRadius: '50%',
          background:
            'radial-gradient(closest-side, rgba(111,151,146,0.12), transparent 70%)',
          top: -220,
          left: -180,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background:
            'radial-gradient(closest-side, rgba(103,56,63,0.08), transparent 70%)',
          bottom: -180,
          right: -140,
        }}
      />
    </div>
  );
}
