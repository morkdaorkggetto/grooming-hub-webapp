import React from 'react';
import Icon from './Icon';

export default function PetAvatar({
  name = 'Pet',
  photo,
  size = 38,
  tier = 'base',
  className = '',
}) {
  const normalizedTier = {
    argento: 'silver',
    oro: 'gold',
    bronzo: 'bronze',
  }[tier] || tier;

  return (
    <span
      className={`gh-avatar gh-avatar--${normalizedTier} ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden={photo ? undefined : 'true'}
    >
      {photo ? (
        <img className="gh-avatar__image" src={photo} alt={name} />
      ) : (
        <Icon name="paw" size={Math.max(16, Math.round(size * 0.48))} />
      )}
    </span>
  );
}
