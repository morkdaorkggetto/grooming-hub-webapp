import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getClientCardByToken } from '../lib/database';
import {
  getClientCardCode,
  getClientQrImageUrl,
  getPublicPetUrl,
} from '../lib/qrCode';

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
      const qrImage = await loadImage(getClientQrImageUrl(client.qr_token, 900));

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
      context.fillStyle = '#5B4336';

      context.font = '700 54px "Inter", "Helvetica Neue", Arial, sans-serif';
      context.fillText(client.name, width / 2, 560);

      context.font = '600 38px "Inter", "Helvetica Neue", Arial, sans-serif';
      context.fillStyle = '#866555';
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <p style={{ color: 'var(--color-secondary)' }}>Caricamento card cliente...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <h1 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold mb-3">
            Card cliente non disponibile
          </h1>
          <p style={{ color: 'var(--color-secondary)' }} className="mb-6">
            {error || 'Cliente non trovato'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Torna alla dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      <style>
        {`
          @media print {
            .print-hidden { display: none !important; }
            body { background: #ffffff !important; }
          }
        `}
      </style>

      <div className="max-w-3xl mx-auto">
        <div className="print-hidden flex flex-wrap gap-3 justify-between items-center mb-6">
          <div>
            <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-bold">
              Card Cliente QR
            </h1>
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-1">
              Scheda rapida interna per identificazione e stampa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/client/${client.id}`)}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              Apri cliente
            </button>
            <button
              onClick={() => navigate(`/calendar?clientId=${client.id}`)}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Nuovo appuntamento
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#2563eb' }}
            >
              Stampa
            </button>
            <button
              onClick={handleDownloadBackAsset}
              disabled={downloadingBack}
              className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-60"
              style={{ backgroundColor: '#7c3aed' }}
            >
              {downloadingBack ? 'Generazione PNG...' : 'Scarica retro PNG'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[28px] shadow-xl overflow-hidden border" style={{ borderColor: '#ead7c5' }}>
          <div className="grid md:grid-cols-[1.3fr_1fr]">
            <div className="p-8">
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm uppercase tracking-[0.25em] font-bold mb-3">
                Grooming Hub
              </p>
              <div className="flex gap-5 items-start">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-4xl shrink-0"
                  style={{ backgroundColor: '#f5eadf' }}
                >
                  {client.photo ? (
                    <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    '🐕'
                  )}
                </div>
                <div className="min-w-0">
                  <h2 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-bold leading-tight">
                    {client.name}
                  </h2>
                  <p style={{ color: 'var(--color-secondary)' }} className="text-lg mt-1">
                    {client.breed || 'Razza non specificata'}
                  </p>
                  <p style={{ color: 'var(--color-secondary)' }} className="mt-2">
                    Proprietario: <strong>{client.owner}</strong>
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
                  <p style={{ color: 'var(--color-secondary)' }} className="text-xs uppercase font-bold tracking-wide mb-1">
                    Affidabilita
                  </p>
                  <p style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold">
                    {client.no_show_score ?? 0}
                  </p>
                  <p style={{ color: client.is_blacklisted ? '#b91c1c' : 'var(--color-success-text)' }} className="text-sm mt-1 font-medium">
                    {client.is_blacklisted ? 'Cliente in blacklist' : 'Cliente attivo'}
                  </p>
                </div>

                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
                  <p style={{ color: 'var(--color-secondary)' }} className="text-xs uppercase font-bold tracking-wide mb-1">
                    Storico
                  </p>
                  <p style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold">
                    {client.visitsCount}
                  </p>
                  <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-1">
                    Ultima visita: {formatVisitDate(client.lastVisit?.date)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-4 mt-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
                <p style={{ color: 'var(--color-secondary)' }} className="text-xs uppercase font-bold tracking-wide mb-1">
                  Prossimo appuntamento
                </p>
                <p style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                  {formatAppointmentDate(client.nextAppointment?.scheduled_at)}
                </p>
                {client.nextAppointment?.notes && (
                  <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-2">
                    {client.nextAppointment.notes}
                  </p>
                )}
              </div>

              {client.notes && (
                <div className="rounded-2xl p-4 mt-4 border-l-4" style={{ backgroundColor: '#fffaf0', borderColor: 'var(--color-primary)' }}>
                  <p style={{ color: 'var(--color-secondary)' }} className="text-xs uppercase font-bold tracking-wide mb-1">
                    Nota rapida
                  </p>
                  <p style={{ color: 'var(--color-text-primary)' }} className="text-sm whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l" style={{ borderColor: '#ead7c5', backgroundColor: '#fffaf6' }}>
              <img
                src={getClientQrImageUrl(client.qr_token, 280)}
                alt={`QR ${client.name}`}
                className="w-56 h-56 rounded-2xl border bg-white p-3"
                style={{ borderColor: '#ead7c5' }}
              />
              <p style={{ color: 'var(--color-text-primary)' }} className="text-lg font-bold mt-4">
                Codice {getClientCardCode(client.qr_token)}
              </p>
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm text-center mt-2 break-all">
                {getPublicPetUrl(client.qr_token)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
