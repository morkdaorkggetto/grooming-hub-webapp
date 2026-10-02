import React from 'react';
import { usePetCard } from '../hooks/usePetCard';
import { PetCardView } from '../pages/PetCard';
import Skeleton from '../../../shared/ui/Skeleton';

export default function PetCardHome({ petId }) {
  const { data, snapshot, loading, error, refetch } = usePetCard(petId);
  if (loading) return <div role="status" aria-label="Caricamento tessera"><Skeleton height={380} /></div>;
  if (error) return <div role="alert" className="gh-body">Non riusciamo a leggere la tessera. <button className="gh-btn gh-btn--outline" onClick={refetch}>Riprova</button></div>;
  if (!data) return <p className="gh-body">Tessera non disponibile.</p>;
  return <PetCardView key={data.id} pet={data} snapshot={snapshot} />;
}
