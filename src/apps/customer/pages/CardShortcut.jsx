import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { usePets } from '../hooks/usePets';

export default function CardShortcut() {
  const { user, loading: authLoading } = useRequireCustomer();
  const { data: pets, loading } = usePets();
  if (authLoading || loading || !user) return <p className="gh-body" role="status">Caricamento tessera...</p>;
  return <Navigate to={pets?.length === 1 ? `/u/card/${pets[0].id}` : '/u/home#tessere'} replace />;
}
