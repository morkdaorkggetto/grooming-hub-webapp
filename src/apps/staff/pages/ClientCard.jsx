import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getClientCardByToken } from '../lib/database';
import ClientQrImage from '../components/ClientQrImage';
import {
  getClientCardCode,
  getClientQrImageUrl,
  getPublicPetUrl,
} from '../lib/qrCode';
import {
  getFidelityLabel,
  getFidelityTierSnapshot,
} from '../lib/fidelity';
import {
  Button,
  EmptyState,
  FidelityBadge,
  Panel,
  PetAvatar,
  SkeletonRow,
  StateTag,
} from '../components/StaffKit';

const formatAppointmentDate = (iso) => {
  if (!iso) return 'Nessun appuntamento futuro';
  return new Date(iso).toLocaleString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatVisitDate = (date) => {
  if (!date) return 'Nessuna visita registrata';
  return new Date(`${date}T00:00:00`).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Non riesco a caricare il QR per il download.'));
    image.src = src;
  });

export default function ClientCard() {
  const navigate = useNavigate();
  const { qrToken } = useParams();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingBack, setDownloadingBack] = useState(false);

  useEffect(() => {
    const loadClientCard = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getClientCardByToken(qrToken);
        setClient(data);
      } catch (err) {
        setError(err.message || 'Errore caricamento card cliente');
      } finally {
        setLoading(false);
      }
    };

    loadClientCard();
  }, [qrToken]);

  useEffect(() => {
    if (!client) return;
    if (searchParams.get('print') !== '1') return;

    const timer = window.setTimeout(() => {
      window.print();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [client, searchParams]);

  const handleDownloadBackAsset = async () => {
    if (!client?.qr_token) return;

    setDownloadingBack(true);
    setError('');

    try {
      const qrDataUrl = await getClientQrImageUrl(client.qr_token, 900);
      const qrImage = await loadImage(qrDataUrl);

      const canvas = document.createElement('canvas');
      const width = 1180;
      const height = 760;
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas non disponibile per generare il file.');
      }

      context.clearRect(0, 0, width, height);

      const qrSize = 420;
      const qrX = (width - qrSize) / 2;
      const qrY = 40;
      context.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      context.textAlign = 'center';
      const rootStyle = window.getComputedStyle(document.documentElement);
      context.fillStyle = rootStyle.getPropertyValue('--color-text-primary').trim();

      context.font = '700 54px "Inter", "Helvetica Neue", Arial, sans-serif';
      context.fillText(client.name, width / 2, 560);

      context.font = '600 38px "Inter", "Helvetica Neue", Arial, sans-serif';
      context.fillStyle = rootStyle.getPropertyValue('--color-secondary').trim();
      context.fillText(`Codice ${getClientCardCode(client.qr_token)}`, width / 2, 625);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = (client.name || 'cliente')
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '');
      link.href = dataUrl;
      link.download = `retro-card-${safeName || 'cliente'}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.message || 'Non riesco a generare il file della card.');
    } finally {
      setDownloadingBack(false);
    }
  };

  if (loading) {
    return (
      <div className="gh-page gh-qr-card-page">
        <main className="gh-page-shell gh-card-state-shell">
          <Panel flush>{Array.from({ length: 4 }, (_, index) => <SkeletonRow key={index} />)}</Panel>
        </main>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="gh-page gh-qr-card-page">
        <main className="gh-page-shell gh-card-state-shell">
          <Panel>
            <EmptyState title="Card cliente non disponibile" body={error || 'Cliente non trovato'} action={<Button staff onClick={() => navigate('/dashboard')}>Torna alla dashboard</Button>} />
          </Panel>
        </main>
      </div>
    );
  }

  const fidelity = getFidelityTierSnapshot(client);
  const fidelityTierKey = fidelity.currentTier?.key || 'base';

  return (
    <div className="gh-page gh-qr-card-page">
      <main className="gh-page-shell gh-card-print-shell">
        <header className="print-hidden gh-card-toolbar">
          <div>
            <h1 className="gh-h1">Card Cliente QR</h1>
            <p className="gh-body">Scheda rapida interna per identificazione e stampa.</p>
          </div>
          <div className="gh-card-toolbar__actions">
            <Button staff variant="secondary" onClick={() => navigate(`/client/${client.id}`)}>Apri cliente</Button>
            <Button staff onClick={() => navigate(`/calendar?clientId=${client.id}`)}>Nuovo appuntamento</Button>
            <Button staff variant="outline" onClick={() => window.print()}>Stampa</Button>
            <Button staff variant="outline" onClick={handleDownloadBackAsset} disabled={downloadingBack}>
              {downloadingBack ? 'Generazione PNG...' : 'Scarica retro PNG'}
            </Button>
          </div>
        </header>

        <Panel className="gh-print-card" flush>
          <div className="gh-print-card__grid">
            <div className="gh-print-card__main">
              <p className="gh-eyebrow--staff">Grooming Hub</p>
              <div className="gh-print-card__identity">
                <PetAvatar name={client.name} photo={client.photo} size={96} tier={fidelityTierKey} />
                <div>
                  <h2 className="gh-pet-name">{client.name}</h2>
                  <p className="gh-print-card__breed">{client.breed || 'Razza non specificata'}</p>
                  <p className="gh-body">Proprietario: <strong>{client.owner}</strong></p>
                </div>
              </div>

              <div className="gh-print-card__stats">
                <div className="gh-card-metric">
                  <p className="gh-eyebrow--staff">Affidabilita</p>
                  <p className="gh-card-metric__value gh-num">{client.no_show_score ?? 0}</p>
                  <StateTag tone={client.is_blacklisted ? 'danger' : 'success'}>{client.is_blacklisted ? 'Cliente in blacklist' : 'Cliente attivo'}</StateTag>
                </div>

                <div className="gh-card-metric">
                  <p className="gh-eyebrow--staff">Premio</p>
                  <FidelityBadge tier={fidelityTierKey} label={getFidelityLabel(fidelityTierKey)} />
                  <p className="gh-body gh-num">{fidelity.rewardPointsTotal} punti · {client.visitsCount} visite</p>
                </div>

                <div className="gh-card-metric">
                  <p className="gh-eyebrow--staff">Storico</p>
                  <p className="gh-card-metric__value gh-num">{client.visitsCount}</p>
                  <p className="gh-body gh-num">Ultima visita: {formatVisitDate(client.lastVisit?.date)}</p>
                </div>
              </div>

              <div className="gh-print-card__note">
                <p className="gh-eyebrow--staff">Prossimo appuntamento</p>
                <p className="gh-row-title gh-num">{formatAppointmentDate(client.nextAppointment?.scheduled_at)}</p>
                {client.nextAppointment?.notes && <p className="gh-body">{client.nextAppointment.notes}</p>}
              </div>

              {client.notes && (
                <div className="gh-print-card__note gh-print-card__note--accent">
                  <p className="gh-eyebrow--staff">Nota rapida</p>
                  <p className="gh-body gh-pre-wrap">{client.notes}</p>
                </div>
              )}
            </div>

            <aside className="gh-print-card__qr">
              <ClientQrImage
                qrToken={client.qr_token}
                size={280}
                alt={`QR ${client.name}`}
                className="gh-print-card__qr-image"
              />
              <p className="gh-row-title gh-num">Codice {getClientCardCode(client.qr_token)}</p>
              <p className="gh-print-card__url">{getPublicPetUrl(client.qr_token)}</p>
            </aside>
          </div>
        </Panel>
      </main>
    </div>
  );
}
