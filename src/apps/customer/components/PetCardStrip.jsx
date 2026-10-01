import React from 'react';
import { Link } from 'react-router-dom';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import { usePetCard } from '../hooks/usePetCard';
import { petCardCopy } from '../lib/petCardCopy';
import { CardPortrait } from './PetCardParts';

export default function PetCardStrip({ pet }) {
  const { data, snapshot, loading, error } = usePetCard(pet.id);
  const title = loading ? 'Caricamento tessera...' : error || !data ? 'Apri la tessera' : petCardCopy(data, snapshot).title;
  return <Link to={`/u/card/${pet.id}`} className="pet-card-strip" aria-label={`La tessera di ${pet.name}`}>
    <CardPortrait pet={pet} tier={snapshot?.currentTier?.key} compact />
    <div className="pet-card-strip-copy">
      <Eyebrow style={{ color: 'var(--color-primary)', letterSpacing: 0 }}><Icon name="qr" size={14} />La tessera di {pet.name}</Eyebrow>
      <p className="gh-pet-name--row">{title}</p>
    </div>
    <Icon name="chevron" size={18} />
  </Link>;
}
