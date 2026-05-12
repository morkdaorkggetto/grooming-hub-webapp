import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getClientById,
  updateClient,
  deleteClient,
  addVisit,
  deleteVisit,
  getClientPromos,
  updateClientNoShowScore,
  setClientBlacklistStatus,
  addRewardPointMovement,
  createCustomerPortalInvite,
  VALID_REWARD_POINT_REASONS,
} from '../lib/database';
import { getClientWhatsAppUrl } from '../lib/whatsapp';
import {
  getClientCardCode,
  getClientCardPath,
  getClientCardUrl,
  getClientQrImageUrl,
} from '../lib/qrCode';
import { getFidelityTierSnapshot } from '../lib/fidelity';
import ImageCropModal from '../components/ImageCropModal';
import PromoBadge from '../components/PromoBadge';
import VisitCard from '../components/VisitCard';
import { isSupportedImageFile } from '../lib/imageFiles';
import AppHeader from '../components/AppHeader';

const REWARD_REASON_LABELS = {
  visit: 'Visita',
  manual: 'Premio manuale',
  promotion: 'Promozione',
  redeem: 'Riscatto premio',
  correction: 'Correzione',
};

/**
 * ClientDetail — Pagina dettaglio cliente
 * Mostra: info cliente, visite, promozioni, form per nuova visita/modifica
 */
export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [customerInviteEmail, setCustomerInviteEmail] = useState('');
  const [customerInvite, setCustomerInvite] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [pendingEditCropFile, setPendingEditCropFile] = useState(null);

  // Form aggiunta visita
  const [visitForm, setVisitForm] = useState({
    date: new Date().toISOString().split('T')[0],
    treatments: '',
    issues: '',
    cost: '',
  });

  // Form modifica cliente
  const [editForm, setEditForm] = useState({
    name: '',
    breed: '',
    owner: '',
    phone: '',
    notes: '',
    photo: '',
    photoFile: null,
    removePhoto: false,
  });
  const [rewardForm, setRewardForm] = useState({
    points: '',
    reason: 'manual',
    note: '',
  });

  /**
   * Carica cliente all'avvio
   */
  useEffect(() => {
    loadClient();
  }, [clientId]);

  useEffect(() => {
    return () => {
      if (editPhotoPreview) {
        URL.revokeObjectURL(editPhotoPreview);
      }
    };
  }, [editPhotoPreview]);

  const loadClient = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getClientById(clientId);
      setClient(data);
      setEditForm({
        name: data.name,
        breed: data.breed || '',
        owner: data.owner,
        phone: data.phone || '',
        notes: data.notes || '',
        photo: data.photo || '',
        photoFile: null,
        removePhoto: false,
      });
      if (editPhotoPreview) {
        URL.revokeObjectURL(editPhotoPreview);
      }
      setEditPhotoPreview('');
    } catch (err) {
      setError(err.message || 'Errore nel caricamento cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestisce upload foto nel form di modifica cliente
   */
  const handleEditPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!isSupportedImageFile(file)) {
      setError('Seleziona un file immagine valido');
      return;
    }

    setPendingEditCropFile(file);
  };

  const handleEditCropCancel = () => {
    setPendingEditCropFile(null);
  };

  const handleEditCropConfirm = ({ file, previewUrl }) => {
    if (editPhotoPreview) {
      URL.revokeObjectURL(editPhotoPreview);
    }

    setEditPhotoPreview(previewUrl);
    setEditForm((prev) => ({
      ...prev,
      photoFile: file,
      removePhoto: false,
    }));
    setPendingEditCropFile(null);
  };

  /**
   * Aggiunge nuova visita
   */
  const handleAddVisit = async (e) => {
    e.preventDefault();

    if (!visitForm.cost || parseFloat(visitForm.cost) <= 0) {
      setError('Il costo deve essere un numero positivo');
      return;
    }

    try {
      await addVisit(clientId, visitForm);
      setShowAddVisitModal(false);
      setVisitForm({
        date: new Date().toISOString().split('T')[0],
        treatments: '',
        issues: '',
        cost: '',
      });
      loadClient(); // Ricarica client con nuova visita
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Elimina una visita
   */
  const handleDeleteVisit = async (visitId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa visita?')) return;

    try {
      await deleteVisit(visitId, clientId);
      loadClient(); // Ricarica
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Aggiorna cliente
   */
  const handleUpdateClient = async (e) => {
    e.preventDefault();

    if (!editForm.name || !editForm.owner) {
      setError('Nome e proprietario sono obbligatori');
      return;
    }

    try {
      await updateClient(clientId, editForm);
      if (editPhotoPreview) {
        URL.revokeObjectURL(editPhotoPreview);
      }
      setEditPhotoPreview('');
      setShowEditModal(false);
      loadClient(); // Ricarica
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenEditModal = () => {
    if (!client) return;
    if (editPhotoPreview) {
      URL.revokeObjectURL(editPhotoPreview);
    }
    setEditPhotoPreview('');
    setEditForm({
      name: client.name,
      breed: client.breed || '',
      owner: client.owner,
      phone: client.phone || '',
      notes: client.notes || '',
      photo: client.photo || '',
      photoFile: null,
      removePhoto: false,
    });
    setShowEditModal(true);
  };

  /**
   * Elimina cliente
   */
  const handleDeleteClient = async () => {
    if (!window.confirm('Eliminerai il cliente e tutte le sue visite. Sei sicuro?'))
      return;

    try {
      await deleteClient(clientId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdjustNoShowScore = async (delta) => {
    try {
      await updateClientNoShowScore(clientId, delta);
      await loadClient();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento punteggio');
    }
  };

  const handleToggleBlacklist = async () => {
    try {
      await setClientBlacklistStatus(clientId, !client.is_blacklisted);
      await loadClient();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento blacklist');
    }
  };

  const handleAddRewardPoints = async (e) => {
    e.preventDefault();

    try {
      await addRewardPointMovement(clientId, rewardForm);
      setRewardForm({
        points: '',
        reason: 'manual',
        note: '',
      });
      setShowRewardModal(false);
      await loadClient();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento punti premio');
    }
  };

  const handleOpenWhatsApp = () => {
    const whatsappUrl = getClientWhatsAppUrl(client);
    if (!whatsappUrl) {
      setError('Inserisci un numero di telefono per usare WhatsApp.');
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenClientCard = () => {
    if (!client?.qr_token) {
      setError('QR cliente non disponibile. Applica prima la migration dedicata.');
      return;
    }

    navigate(getClientCardPath(client.qr_token));
  };

  const handleCreateCustomerInvite = async () => {
    try {
      const invite = await createCustomerPortalInvite(clientId, customerInviteEmail.trim());
      setCustomerInvite(invite);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(invite.inviteUrl);
      }
    } catch (err) {
      setError(err.message || 'Errore creazione invito cliente');
    }
  };

  const handlePrintClientCard = () => {
    if (!client?.qr_token) {
      setError('QR cliente non disponibile. Applica prima la migration dedicata.');
      return;
    }

    window.open(getClientCardUrl(client.qr_token, { print: true }), '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-main)' }}
      >
        <div className="text-center">
          <div
            className="animate-spin h-12 w-12 rounded-full border-4 border-solid mx-auto mb-4"
            style={{
              borderColor: 'var(--color-primary)',
              borderTopColor: 'transparent',
            }}
          ></div>
          <p style={{ color: 'var(--color-secondary)' }}>Caricamento cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-main)' }}
      >
        <div className="text-center">
          <p style={{ color: 'var(--color-secondary)' }}>Cliente non trovato</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Torna alla lista
          </button>
        </div>
      </div>
    );
  }

  const promo = getClientPromos(client);
  const fidelity = getFidelityTierSnapshot(client);

  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)' }} className="min-h-screen pb-20">
      <AppHeader
        title="Scheda cliente"
        subtitle={`${client.name} · ${client.owner}${client.breed ? ` · ${client.breed}` : ''}`}
        maxWidthClass="max-w-4xl"
        rightContent={
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl text-sm font-medium transition"
            style={{
              backgroundColor: 'rgba(251, 246, 243, 0.16)',
              color: '#FBF6F3',
              border: '1px solid rgba(251, 246, 243, 0.22)',
            }}
          >
            ← Indietro
          </button>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Errore */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p style={{ color: 'var(--color-danger-text)' }} className="font-medium">
              {error}
            </p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm underline"
              style={{ color: 'var(--color-danger-text)' }}
            >
              Chiudi
            </button>
          </div>
        )}

        {/* Client Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Foto */}
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {client.photo ? (
                <img
                  src={client.photo}
                  alt={client.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                '🐕'
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {client.name}
              </h2>
              <p style={{ color: 'var(--color-secondary)' }} className="mb-3 text-lg">
                {client.breed || 'Razza non specificata'}
              </p>
              <div className="space-y-2 mb-4">
                <p style={{ color: 'var(--color-secondary)' }}>
                  👤 <strong>{client.owner}</strong>
                </p>
                {client.phone && (
                  <p style={{ color: 'var(--color-secondary)' }}>📱 {client.phone}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleOpenEditModal}
                  className="px-4 py-2 rounded-lg font-medium transition text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  ✏️ Modifica
                </button>
                <button
                  onClick={() => navigate(`/calendar?clientId=${clientId}`)}
                  className="px-4 py-2 rounded-lg font-medium transition text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  📅 Appuntamento
                </button>
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-4 py-2 rounded-lg font-medium transition text-white"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleOpenClientCard}
                  className="px-4 py-2 rounded-lg font-medium transition text-white"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  QR Card
                </button>
                <button
                  onClick={handleDeleteClient}
                  className="px-4 py-2 rounded-lg font-medium transition text-white bg-red-500 hover:bg-red-600"
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Promozione visite legacy: non mostrarla quando la fidelity usa punti manuali. */}
        {fidelity.mode !== 'points' && promo.count > 0 && <PromoBadge promo={promo} />}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold mb-3">
            🏅 Fidelity cliente
          </h3>
          <p style={{ color: 'var(--color-secondary)' }} className="mb-5">
            Livello attuale:{' '}
            <strong>
              {fidelity.currentTier ? fidelity.currentTier.label : 'Base'}
            </strong>
            {fidelity.nextTier && (
              <>
                {' '}· Mancano{' '}
                <strong>
                  {fidelity.mode === 'points'
                    ? `${fidelity.nextTier.remainingPoints} punti`
                    : `${fidelity.nextTier.remainingVisits} visite`}
                </strong>{' '}
                per{' '}
                <strong>{fidelity.nextTier.label}</strong>
              </>
            )}
          </p>

          <div
            className="rounded-2xl p-5 mb-5 border"
            style={{
              backgroundColor: 'var(--color-bg-main)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p
                  className="text-xs uppercase tracking-[0.2em] font-bold mb-2"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  Punti premio
                </p>
                <p className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {fidelity.rewardPointsTotal}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--color-secondary)' }}>
                  {fidelity.mode === 'points'
                    ? 'Il livello fidelity è calcolato sui punti premio.'
                    : 'Nessun punto ancora assegnato: la card usa ancora il fallback sulle visite.'}
                </p>
              </div>
              <button
                onClick={() => setShowRewardModal(true)}
                className="px-5 py-3 rounded-xl font-bold text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Aggiungi / rimuovi punti
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fidelity.tiers.map((tier) => (
              <div
                key={tier.key}
                className="rounded-2xl border p-5"
                style={{
                  backgroundColor: tier.style.backgroundColor,
                  borderColor: tier.style.borderColor,
                }}
              >
                <p
                  className="text-lg font-bold mb-2"
                  style={{ color: tier.style.textColor }}
                >
                  {tier.label}
                </p>
                <p style={{ color: tier.style.textColor }} className="text-sm">
                  {fidelity.mode === 'points'
                    ? `${tier.pointsRequired} punti`
                    : `${tier.visitsRequired} visite in ${tier.monthsWindow} mesi`}
                </p>
                <p
                  style={{ color: tier.style.textColor }}
                  className="text-2xl font-bold mt-3"
                >
                  {fidelity.mode === 'points'
                    ? Math.min(fidelity.rewardPointsTotal, tier.pointsRequired)
                    : tier.visitsInWindow}
                </p>
                <p style={{ color: tier.style.textColor }} className="text-sm mt-1">
                  {tier.achieved
                    ? 'Obiettivo raggiunto'
                    : fidelity.mode === 'points'
                      ? `${tier.remainingPoints} punti mancanti`
                      : `${tier.remainingVisits} visite mancanti`}
                </p>
              </div>
            ))}
          </div>

          {client.rewardPoints?.length > 0 ? (
            <div className="mt-6">
              <p
                className="text-sm font-bold mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Ultimi movimenti punti
              </p>
              <div className="space-y-2">
                {client.rewardPoints.slice(0, 5).map((movement) => (
                  <div
                    key={movement.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border px-4 py-3"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {REWARD_REASON_LABELS[movement.reason] || movement.reason}
                      </p>
                      {movement.note ? (
                        <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                          {movement.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="sm:text-right">
                      <p
                        className="font-bold"
                        style={{
                          color:
                            Number(movement.points) > 0
                              ? 'var(--color-success-text)'
                              : 'var(--color-danger-text)',
                        }}
                      >
                        {Number(movement.points) > 0 ? '+' : ''}
                        {movement.points} punti
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-secondary)' }}>
                        {new Date(movement.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Note */}
        {client.notes && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-6 mb-6">
            <h3 style={{ color: 'var(--color-text-primary)' }} className="font-bold mb-2">
              📝 Note Importanti
            </h3>
            <p style={{ color: 'var(--color-secondary)' }} className="whitespace-pre-wrap">
              {client.notes}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold mb-3">
                🪪 Card identificativa QR
              </h3>
              <p style={{ color: 'var(--color-secondary)' }} className="mb-2">
                Codice card: <strong>{getClientCardCode(client.qr_token)}</strong>
              </p>
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm mb-4">
                Il QR apre la card cliente pubblica. Se sei in area operatore, puoi continuare dalla scheda completa.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleOpenClientCard}
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  Apri area operatore
                </button>
                <button
                  onClick={handlePrintClientCard}
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Stampa card
                </button>
              </div>
            </div>

            {client.qr_token && (
              <div
                className="rounded-2xl border p-4 bg-white shadow-sm"
                style={{ borderColor: '#ead7c5' }}
              >
                <img
                  src={getClientQrImageUrl(client.qr_token, 180)}
                  alt={`QR ${client.name}`}
                  className="w-40 h-40 bg-white rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex-1">
              <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold mb-3">
                Area cliente digitale
              </h3>
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm mb-4">
                Genera un link riservato per collegare questa scheda cane a un account cliente.
                Il cliente vedra solo card, fidelity, prossimo appuntamento e contatto WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={customerInviteEmail}
                  onChange={(event) => setCustomerInviteEmail(event.target.value)}
                  placeholder="Email cliente opzionale"
                  className="flex-1 px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <button
                  onClick={handleCreateCustomerInvite}
                  className="px-5 py-3 rounded-lg font-bold text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Genera invito
                </button>
              </div>
            </div>

            {customerInvite ? (
              <div
                className="lg:w-80 rounded-2xl border p-4"
                style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-xs uppercase tracking-[0.2em] font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>
                  Link invito
                </p>
                <p className="text-sm break-all" style={{ color: 'var(--color-text-primary)' }}>
                  {customerInvite.inviteUrl}
                </p>
                <p className="text-xs mt-3" style={{ color: 'var(--color-secondary)' }}>
                  Link copiato negli appunti. Scade tra 30 giorni.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold mb-3">
            ⚖️ Affidabilita appuntamenti
          </h3>
          <p style={{ color: 'var(--color-secondary)' }} className="mb-4">
            Score attuale: <strong>{client.no_show_score ?? 0}</strong> · Stato:{' '}
            <strong>{client.is_blacklisted ? 'BLACKLIST' : 'Attivo'}</strong>
          </p>
          <p style={{ color: 'var(--color-secondary)' }} className="text-sm mb-4">
            Regola automatica: da -3 in giu il cliente entra in blacklist.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAdjustNoShowScore(-1)}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: '#e11d48' }}
            >
              Segna No-show (-1)
            </button>
            <button
              onClick={() => handleAdjustNoShowScore(1)}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              Segna Presenza (+1)
            </button>
            <button
              onClick={handleToggleBlacklist}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: client.is_blacklisted ? '#2563eb' : '#b91c1c' }}
            >
              {client.is_blacklisted ? 'Rimuovi da blacklist' : 'Inserisci in blacklist'}
            </button>
          </div>
        </div>

        {/* Visite */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3
            style={{ color: 'var(--color-text-primary)' }}
            className="text-2xl font-bold mb-6 flex items-center"
          >
            📅 Visite ({client.visits?.length || 0})
          </h3>

          {client.visits && client.visits.length > 0 ? (
            <div className="space-y-4">
              {client.visits.map((visit) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onDelete={() => handleDeleteVisit(visit.id)}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-secondary)' }} className="italic text-center py-8">
              Nessuna visita registrata
            </p>
          )}
        </div>
      </main>

      {/* FAB Aggiungi Visita */}
      <button
        onClick={() => setShowAddVisitModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full text-white text-2xl shadow-lg transform transition duration-200 hover:scale-110 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        +
      </button>

      {/* Modal Aggiungi Visita */}
      {showAddVisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 sm:items-center sm:justify-center">
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-96 overflow-y-auto"
            style={{ backgroundColor: '#ffffff' }}
          >
            <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold mb-6">
              Nuova Visita
            </h2>

            <form onSubmit={handleAddVisit} className="space-y-4">
              {/* Data */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={visitForm.date}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, date: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Trattamenti */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Trattamenti
                </label>
                <textarea
                  value={visitForm.treatments}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, treatments: e.target.value })
                  }
                  placeholder="Es. Bagno, taglio, asciugatura..."
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  rows="3"
                />
              </div>

              {/* Problematiche */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Problematiche
                </label>
                <textarea
                  value={visitForm.issues}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, issues: e.target.value })
                  }
                  placeholder="Es. Pelle irritata, nodi..."
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  rows="3"
                />
              </div>

              {/* Costo */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Costo (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={visitForm.cost}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, cost: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-bold text-white transition"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Salva Visita
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="flex-1 py-3 rounded-lg font-bold border-2 transition"
                  style={{
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifica Cliente */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 sm:items-center sm:justify-center">
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-96 overflow-y-auto"
            style={{ backgroundColor: '#ffffff' }}
          >
            <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold mb-6">
              Modifica Cliente
            </h2>

            <form onSubmit={handleUpdateClient} className="space-y-4">
              {/* Nome */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Razza */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Razza
                </label>
                <input
                  type="text"
                  value={editForm.breed}
                  onChange={(e) =>
                    setEditForm({ ...editForm, breed: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Proprietario */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Proprietario *
                </label>
                <input
                  type="text"
                  value={editForm.owner}
                  onChange={(e) =>
                    setEditForm({ ...editForm, owner: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Telefono */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Note */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Note
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  rows="3"
                />
              </div>

              {/* Foto */}
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Foto del cane
                </label>

                {(editForm.photo || editPhotoPreview) && (
                  <div className="mb-3 relative">
                    <img
                      src={editPhotoPreview || editForm.photo}
                      alt="Anteprima foto"
                      className="w-full h-40 object-cover rounded-lg border-2"
                      style={{ borderColor: 'var(--color-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (editPhotoPreview) {
                          URL.revokeObjectURL(editPhotoPreview);
                        }
                        setEditPhotoPreview('');
                        setEditForm((prev) => ({
                          ...prev,
                          photo: '',
                          photoFile: null,
                          removePhoto: true,
                        }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center"
                  style={{ borderColor: 'var(--color-primary)' }}
                >
                  <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
                    {editForm.photo || editPhotoPreview
                      ? 'Sostituisci foto del cane'
                      : 'Aggiungi foto del cane'}
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
                    <div
                      className="relative px-4 py-2 rounded-lg font-medium text-white transition inline-flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <input
                        id="edit-photo-camera"
                        type="file"
                        accept="image/*,.heic,.heif"
                        capture="environment"
                        onChange={handleEditPhotoSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      Scatta foto
                    </div>
                    <div
                      className="relative px-4 py-2 rounded-lg font-medium border-2 transition inline-flex items-center justify-center overflow-hidden"
                      style={{ borderColor: 'var(--color-primary)', color: 'var(--color-text-primary)' }}
                    >
                      <input
                        id="edit-photo-gallery"
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={handleEditPhotoSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      Galleria
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-bold text-white transition"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Salva Modifiche
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editPhotoPreview) {
                      URL.revokeObjectURL(editPhotoPreview);
                    }
                    setEditPhotoPreview('');
                    setShowEditModal(false);
                  }}
                  className="flex-1 py-3 rounded-lg font-bold border-2 transition"
                  style={{
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRewardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 sm:items-center sm:justify-center">
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-96 overflow-y-auto"
            style={{ backgroundColor: '#ffffff' }}
          >
            <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold mb-2">
              Punti premio
            </h2>
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm mb-6">
              Usa valori positivi per assegnare punti, negativi per riscatti o correzioni.
            </p>

            <form onSubmit={handleAddRewardPoints} className="space-y-4">
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Punti *
                </label>
                <input
                  type="number"
                  step="1"
                  value={rewardForm.points}
                  onChange={(e) =>
                    setRewardForm({ ...rewardForm, points: e.target.value })
                  }
                  placeholder="Es. 25 oppure -50"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Motivo
                </label>
                <select
                  value={rewardForm.reason}
                  onChange={(e) =>
                    setRewardForm({ ...rewardForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 bg-white"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  {VALID_REWARD_POINT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {REWARD_REASON_LABELS[reason] || reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
                  Nota
                </label>
                <textarea
                  value={rewardForm.note}
                  onChange={(e) =>
                    setRewardForm({ ...rewardForm, note: e.target.value })
                  }
                  placeholder="Dettaglio facoltativo"
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-bold text-white transition"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Salva movimento
                </button>
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 py-3 rounded-lg font-bold border-2 transition"
                  style={{
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImageCropModal
        open={Boolean(pendingEditCropFile)}
        file={pendingEditCropFile}
        onCancel={handleEditCropCancel}
        onConfirm={handleEditCropConfirm}
      />
    </div>
  );
}
