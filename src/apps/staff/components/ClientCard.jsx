import React from 'react';
import {
  getFidelityTierSnapshot,
} from '../lib/fidelity';
import { FidelityBadge, PetAvatar, StateTag } from './StaffKit';

/**
 * ClientCard — Componente card cliente
 * Mostra un cliente in formato card compatto, riusabile in liste/griglie
 *
 * Props:
 * - client: oggetto cliente con { id, name, breed, owner, photo, visits }
 */
export default function ClientCard({ client, fidelitySettings }) {
  const visitsCount = client.visits?.length || 0;
  const visitsText =
    visitsCount === 1 ? `${visitsCount} visita` : `${visitsCount} visite`;
  const noShowScore = client.no_show_score ?? 0;
  const hasPhoto = Boolean(client.photo);
  const fidelity = getFidelityTierSnapshot(client, fidelitySettings);
  const currentTierKey = fidelity.currentTier?.key || 'none';
  const stateClass = client.is_blacklisted ? 'danger' : noShowScore >= 1 ? 'success' : 'primary';

  return (
    <article className={`gh-client-tile gh-client-tile--${stateClass}`}>
      <div className="gh-client-tile__photo">
        <PetAvatar name={client.name} photo={client.photo} size={72} tier={currentTierKey} />
        <StateTag tone={hasPhoto ? 'success' : 'neutral'}>{hasPhoto ? 'Profilo attivo' : 'Foto mancante'}</StateTag>
      </div>

      <div className="gh-client-tile__body">
        <div className="gh-client-tile__head">
          <div>
            <p className="gh-eyebrow--staff">Scheda cliente</p>
            <h3 className="gh-row-title gh-client-tile__name">{client.name}</h3>
          </div>
          <FidelityBadge tier={currentTierKey} compact />
        </div>

        <div className="gh-client-tile__tags">
          <span className="gh-contact-source">{client.breed || 'Razza non specificata'}</span>
          <span className="gh-contact-source gh-num">{visitsText}</span>
        </div>

        {client.owner && <p className="gh-body gh-client-tile__owner"><strong>Proprietario:</strong> {client.owner}</p>}

        <div className="gh-client-tile__states">
          <StateTag tone={noShowScore < 0 ? 'danger' : 'success'}>Score <span className="gh-num">{noShowScore}</span></StateTag>
          {client.is_blacklisted && <StateTag tone="danger">BLACKLIST</StateTag>}
        </div>

        <div className="gh-client-tile__foot">
          <div>
            <p className="gh-eyebrow--staff">Stato scheda</p>
            <p className="gh-body"><strong>{client.is_blacklisted ? 'Monitoraggio attivo' : 'Cliente in archivio'}</strong></p>
          </div>
          <span className="gh-client-tile__open">Apri</span>
        </div>
      </div>
    </article>
  );
}
