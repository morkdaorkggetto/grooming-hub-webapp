import React from 'react';

/**
 * Icon — vocabolario di icone SVG inline.
 *
 * Pattern dal bundle design (shared-ui.jsx Icon component, righe 7-41).
 * Le icone sono ridotte al minimo necessario per Step 5: paw, clock,
 * sparkle, heart, whatsapp, logout, arrow, chevron, check.
 *
 * Tutte stroke-based con currentColor → si colorano via CSS color del parent.
 */

const PATHS = {
  paw: (
    <g>
      <circle cx="5" cy="9" r="2" />
      <circle cx="9" cy="5" r="2" />
      <circle cx="15" cy="5" r="2" />
      <circle cx="19" cy="9" r="2" />
      <path d="M7 15c0-3 2-5 5-5s5 2 5 5c0 2.5-2 4-5 4s-5-1.5-5-4z" />
    </g>
  ),
  clock: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </g>
  ),
  sparkle: (
    <g>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </g>
  ),
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  whatsapp: (
    <g>
      <path d="M20 12a8 8 0 1 0-3.5 6.6L20 20l-1.4-3.5A8 8 0 0 0 20 12z" />
      <path
        d="M9 10c.5 1.5 2 3 3.5 3.5l1-1c.7.3 1.3.5 2 .5v1.5c-3.5 0-6.5-3-6.5-6.5H10.5c0 .7.2 1.3.5 2l-1 1z"
        fill="currentColor"
        stroke="none"
      />
    </g>
  ),
  logout: (
    <g>
      <path d="M10 17l-5-5 5-5M5 12h12M14 4h5v16h-5" />
    </g>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  check: <path d="M5 13l4 4L19 7" />,
};

export default function Icon({ name, size = 18, stroke = 1.75, style = {}, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
