import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

export default function CustomerInvite() {
  const { token } = useParams();
  return <Navigate to={`/u/redeem/${encodeURIComponent(token)}`} replace />;
}
