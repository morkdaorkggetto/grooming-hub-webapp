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

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col"
      style={{
        borderTop: '4px solid #d4a574',
      }}
    >
      {/* Header con foto */}
      <div
        className="h-32 flex items-center justify-center text-5xl"
        style={{ backgroundColor: '#d4a574' }}
      >
        {client.photo ? '📸' : '🐕'}
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
