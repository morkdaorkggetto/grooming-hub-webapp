import React from 'react';

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

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col"
      style={{
        borderTop: '4px solid #d4a574',
      }}
    >
      {/* Header con foto */}
      <div
        className="h-32 flex items-center justify-center"
        style={{ backgroundColor: '#d4a574' }}
      >
        {client.photo ? (
          <img
            src={client.photo}
            alt={client.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🐕</span>
        )}
      </div>

      {/* Contenuto */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Nome */}
        <h3
          style={{ color: '#5a3a2a' }}
          className="text-xl font-bold mb-2 truncate"
        >
          {client.name}
        </h3>

        {/* Razza */}
        <p
          style={{ color: '#8b5a3c' }}
          className="text-sm mb-3 truncate"
        >
          {client.breed || 'Razza non specificata'}
        </p>

        {/* Proprietario */}
        {client.owner && (
          <p
            style={{ color: '#8b5a3c' }}
            className="text-sm mb-4 truncate"
          >
            <strong>👤</strong> {client.owner}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{
              backgroundColor: noShowScore < 0 ? '#fff1f2' : '#ecfdf5',
              color: noShowScore < 0 ? '#be123c' : '#166534',
            }}
          >
            Score affidabilita: {noShowScore}
          </span>

          {client.is_blacklisted && (
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
            >
              BLACKLIST
            </span>
          )}
        </div>

        {/* Conteggio visite */}
        <div
          className="mt-auto pt-4 border-t"
          style={{ borderColor: '#e8d5c4' }}
        >
          <p
            style={{ color: '#d4a574' }}
            className="text-sm font-bold"
          >
            📅 {visitsText}
          </p>
        </div>
      </div>

      {/* Footer con pulsante */}
      <div
        className="px-5 py-4 text-center text-sm font-medium transition"
        style={{
          backgroundColor: '#faf3f0',
          color: '#d4a574',
        }}
      >
        Visualizza dettagli →
      </div>
    </div>
  );
}
