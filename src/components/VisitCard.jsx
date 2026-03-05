import React from 'react';

/**
 * VisitCard — Componente card visita
 * Mostra i dettagli di una singola visita in formato card
 *
 * Props:
 * - visit: oggetto visita con { id, date, treatments, issues, cost }
 * - onDelete: callback opzionale per eliminare la visita
 */
export default function VisitCard({ visit, onDelete }) {
  /**
   * Formatta data in italiano (es. "15 gennaio 2024")
   */
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString; // fallback
    }
  };

  return (
    <div
      className="border-l-4 p-5 rounded-lg"
      style={{
        borderColor: '#d4a574',
        backgroundColor: '#faf3f0',
      }}
    >
      {/* Header: data e costo */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {/* Data */}
          <p
            style={{ color: '#5a3a2a' }}
            className="text-sm font-bold mb-1"
          >
            📅 {formatDate(visit.date)}
          </p>

          {/* Costo */}
          <p
            style={{ color: '#d4a574' }}
            className="text-2xl font-bold"
          >
            €{parseFloat(visit.cost).toFixed(2)}
          </p>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-100 transition"
            title="Elimina visita"
          >
            <span className="text-xl text-red-500">🗑️</span>
          </button>
        )}
      </div>

      {/* Trattamenti */}
      {visit.treatments && (
        <div className="mb-4">
          <p
            style={{ color: '#5a3a2a' }}
            className="text-xs font-bold mb-1 uppercase"
          >
            Trattamenti
          </p>
          <p
            style={{ color: '#8b5a3c' }}
            className="text-sm whitespace-pre-wrap"
          >
            {visit.treatments}
          </p>
        </div>
      )}

      {/* Problematiche */}
      {visit.issues && (
        <div>
          <p
            style={{ color: '#d4534a' }}
            className="text-xs font-bold mb-1 uppercase"
          >
            ⚠️ Problematiche
          </p>
          <p
            style={{ color: '#d4534a' }}
            className="text-sm whitespace-pre-wrap"
          >
            {visit.issues}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!visit.treatments && !visit.issues && (
        <p
          style={{ color: '#8b5a3c' }}
          className="text-sm italic"
        >
          Nessun dettaglio registrato
        </p>
      )}
    </div>
  );
}
