import React from 'react';

/**
 * PromoBadge — Componente badge promozioni
 * Mostra il badge di sconto basato sul numero di visite
 *
 * Props:
 * - promo: { count, discount, message } (oggetto calcolato da getClientPromos)
 *
 * Logica promozioni:
 * - 0 visite: nessun badge
 * - 1-4 visite: messaggio "X visite per lo sconto!"
 * - 5-9 visite: 10% sconto
 * - 10+ visite: 20% sconto
 */
export default function PromoBadge({ promo }) {
  if (!promo || promo.count === 0) {
    return null; // Non mostra nulla se nessuna visita
  }

  // Determina il colore e l'emoji basato sul livello di sconto
  let badgeColor = '#fbbf24'; // giallo di default
  let emoji = '⭐';

  if (promo.discount === 20) {
    badgeColor = '#f97316'; // arancione scuro per 20%
    emoji = '🎉';
  } else if (promo.discount === 10) {
    badgeColor = '#fb923c'; // arancione medio per 10%
    emoji = '🌟';
  }

  return (
    <div
      className="mb-6 p-6 rounded-2xl text-center shadow-md"
      style={{
        backgroundColor: badgeColor,
      }}
    >
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2">
        {promo.message}
      </h3>
      {promo.discount > 0 && (
        <p className="text-white text-opacity-90 text-sm">
          Sconto disponibile: <strong>{promo.discount}%</strong>
        </p>
      )}
    </div>
  );
}
