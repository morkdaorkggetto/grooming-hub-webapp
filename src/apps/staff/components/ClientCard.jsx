import React from 'react';
import {
  getFidelityBadgeStyle,
  getFidelityLabel,
  getFidelityTierSnapshot,
} from '../lib/fidelity';

/**
 * ClientCard — Componente card cliente
 * Mostra un cliente in formato card compatto, riusabile in liste/griglie
 *
 * Props:
 * - client: oggetto cliente con { id, name, breed, owner, photo, visits }
 */
export default function ClientCard({ client }) {
  const visitsCount = client.visits?.length || 0;
  const visitsText =
    visitsCount === 1 ? `${visitsCount} visita` : `${visitsCount} visite`;
  const noShowScore = client.no_show_score ?? 0;
  const hasPhoto = Boolean(client.photo);
  const fidelity = getFidelityTierSnapshot(client);
  const currentTierKey = fidelity.currentTier?.key || 'none';
  const fidelityBadgeStyle = getFidelityBadgeStyle(currentTierKey);

  return (
    <div
      className="bg-white rounded-[28px] shadow-sm transition-shadow overflow-hidden h-full flex flex-col border"
      style={{
        borderColor: 'var(--color-border)',
        boxShadow: '0 14px 28px rgba(43, 37, 37, 0.06)',
      }}
    >
      <div
        className="h-1.5"
        style={{
          backgroundColor: client.is_blacklisted
            ? 'var(--color-danger-text)'
            : noShowScore >= 1
              ? 'var(--color-success-text)'
              : 'var(--color-primary)',
        }}
      />
      {/* Header con foto */}
      <div
        className="h-40 flex items-center justify-center relative"
        style={{ backgroundColor: 'var(--color-surface-muted)' }}
      >
        {hasPhoto ? (
          <img
            src={client.photo}
            alt={client.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🐕</span>
        )}
        <div
          className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold"
          style={{
            backgroundColor: 'rgba(251, 246, 243, 0.88)',
            color: 'var(--color-text-secondary)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {hasPhoto ? 'Profilo attivo' : 'Foto mancante'}
        </div>
      </div>

      {/* Contenuto */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p
              className="text-xs uppercase tracking-[0.2em] font-semibold mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Scheda cliente
            </p>
            <h3
              style={{ color: 'var(--color-text-primary)' }}
              className="text-[1.35rem] font-bold truncate"
            >
              {client.name}
            </h3>
          </div>

          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
            style={fidelityBadgeStyle}
          >
            {getFidelityLabel(currentTierKey)}
          </span>
        </div>

        {/* Nome */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-surface-soft)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {client.breed || 'Razza non specificata'}
          </span>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-bg-main)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {visitsText}
          </span>
        </div>

        {/* Proprietario */}
        {client.owner && (
          <p
            style={{ color: 'var(--color-text-secondary)' }}
            className="text-sm mb-4 truncate"
          >
            <strong>Proprietario:</strong> {client.owner}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: noShowScore < 0 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
              color: noShowScore < 0 ? '#be123c' : 'var(--color-success-text)',
            }}
          >
            Score {noShowScore}
          </span>

          {client.is_blacklisted && (
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }}
            >
              BLACKLIST
            </span>
          )}
        </div>

        {/* Conteggio visite */}
        <div
          className="mt-auto pt-4 border-t flex items-center justify-between gap-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-[0.16em] font-semibold mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Stato scheda
            </p>
            <p
              style={{ color: 'var(--color-secondary)' }}
              className="text-sm font-bold"
            >
              {client.is_blacklisted ? 'Monitoraggio attivo' : 'Cliente in archivio'}
            </p>
          </div>
          <p
            className="text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-primary)' }}
          >
            Apri
          </p>
        </div>
      </div>
    </div>
  );
}
