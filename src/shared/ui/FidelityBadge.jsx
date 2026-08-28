import React from 'react';

const LABELS = {
  base: 'Base',
  none: 'Base',
  bronze: 'Bronzo',
  bronzo: 'Bronzo',
  silver: 'Argento',
  argento: 'Argento',
  gold: 'Oro',
  oro: 'Oro',
};

export default function FidelityBadge({ tier = 'base', compact = false, label }) {
  const normalizedTier = {
    bronzo: 'bronze',
    argento: 'silver',
    oro: 'gold',
    none: 'base',
  }[tier] || tier;
  const visibleLabel = label || LABELS[tier] || LABELS[normalizedTier] || LABELS.base;

  return (
    <span
      className={`gh-fidelity-badge gh-fidelity-badge--${normalizedTier}${
        compact ? ' gh-fidelity-badge--compact' : ''
      }`}
    >
      {compact ? visibleLabel : `Livello ${visibleLabel}`}
    </span>
  );
}
