import React from 'react';

/**
 * Card — wrapper visivo standard. Step 2 minimal.
 *
 * Stile dai design tokens del repo staff (CSS vars in src/index.css):
 *   --color-surface-main / --r-lg / --shadow-md / --color-border.
 */

const cardStyle = {
  background: 'var(--color-surface-main, #fbf6f3)',
  borderRadius: 'var(--r-lg, 24px)',
  boxShadow: 'var(--shadow-md, 0 4px 16px rgba(43, 37, 37, 0.06))',
  border: '1px solid var(--color-border, #cfc1c4)',
  padding: '24px',
};

export default function Card({ children, style, ...rest }) {
  return (
    <div style={{ ...cardStyle, ...(style || {}) }} {...rest}>
      {children}
    </div>
  );
}
