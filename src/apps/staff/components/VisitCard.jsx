import React from 'react';
import { Button } from './StaffKit';

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
    <article className="gh-visit-card">
      <div className="gh-visit-card__head">
        <div>
          <p className="gh-row-title gh-num">📅 {formatDate(visit.date)}</p>
          <p className="gh-price gh-num">€{parseFloat(visit.cost).toFixed(2)}</p>
        </div>

        {onDelete && (
          <Button staff variant="ghost" icon="trash" aria-label="Elimina visita" title="Elimina visita" onClick={onDelete} />
        )}
      </div>

      {visit.treatments && (
        <div className="gh-visit-card__section">
          <p className="gh-eyebrow--staff">Trattamenti</p>
          <p className="gh-body gh-pre-wrap">{visit.treatments}</p>
        </div>
      )}

      {visit.issues && (
        <div className="gh-visit-card__section gh-visit-card__section--danger">
          <p className="gh-eyebrow--staff">⚠️ Problematiche</p>
          <p className="gh-body gh-pre-wrap">{visit.issues}</p>
        </div>
      )}

      {!visit.treatments && !visit.issues && <p className="gh-meta gh-visit-card__empty">Nessun dettaglio registrato</p>}
    </article>
  );
}
