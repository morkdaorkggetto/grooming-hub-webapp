import React, { useState } from 'react';
import Icon from '../../../shared/ui/Icon';
import './pet-card.css';

// The three inks and backgrounds are the CD-09 FidelityBadge palette.
export const CARD_TIERS = {
  bronze: { metal: 'var(--tier-bronze)', background: '#f6e7d7', ink: '#8a5a2a' },
  silver: { metal: 'var(--tier-silver)', background: '#eceef2', ink: '#4a5668' },
  gold: { metal: 'var(--tier-gold)', background: '#faedc4', ink: '#7a5a0a' },
};

export function CardPortrait({ pet, tier, compact = false }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const palette = CARD_TIERS[tier];
  const photo = pet.owner_photo_url && pet.owner_photo_url !== failedUrl;
  if (!photo && !compact) return null;
  return <div className={`pet-card-portrait${compact ? ' pet-card-portrait--compact' : ''}`}
    style={{ borderColor: palette?.metal }}>
    <div>
      {photo ? <img src={pet.owner_photo_url} alt={`Ritratto di ${pet.name}`} onError={() => setFailedUrl(pet.owner_photo_url)} />
        : <Icon name="tessera" size={24} stroke={1.8} />}
    </div>
  </div>;
}

export function CardTier({ tier }) {
  if (!tier) return null;
  const palette = CARD_TIERS[tier.key];
  return <span className="pet-card-tier gh-body" style={{ background: palette.background, color: palette.ink }}>
    <span aria-hidden="true" style={{ background: palette.metal }} /><strong>{tier.label}</strong>
  </span>;
}

export function VisitStamps({ tier }) {
  const total = tier.visitsRequired;
  const done = Math.min(total, tier.visitsInWindow);
  const ticks = total > 12;
  const height = total <= 6 ? 44 : 36;
  return <div className={`pet-card-stamps${ticks ? ' pet-card-stamps--ticks' : ''}`}
    role="img" aria-label={`${done} visite di ${total} verso ${tier.label}`}
    style={{ gridTemplateColumns: ticks ? 'repeat(18, minmax(0, 1fr))' : `repeat(${total <= 6 ? total : Math.ceil(total / 2)}, minmax(0, 1fr))`, gap: ticks ? 4 : 6 }}>
    {Array.from({ length: total }, (_, index) => <span key={index} aria-hidden="true"
      className={`pet-card-stamp${index < done ? ' is-done' : index === done ? ' is-next' : ''}`}
      style={ticks ? undefined : { height }}>
      {!ticks && (index < done ? <Icon name="paw" size={height * .42} stroke={1.8} /> : <span className="gh-body gh-num">{index + 1}</span>)}
    </span>)}
  </div>;
}
