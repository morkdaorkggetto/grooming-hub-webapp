import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import ImageCropModal from '../components/ImageCropModal';
import ClientQrImage from '../components/ClientQrImage';
import VisitForm, { createEmptyVisitForm } from '../components/VisitForm';
import {
  Button,
  EmptyState,
  ErrorState,
  Fab,
  FidelityBadge,
  Field,
  Hero,
  HeroButton,
  Panel,
  PetAvatar,
  ScoreScale,
  SkeletonRow,
  VisitRow,
} from '../components/StaffKit';
import {
  VALID_REWARD_POINT_REASONS,
  addRewardPointMovement,
  addVisit,
  createCustomerPortalInvite,
  deleteClient,
  deleteVisit,
  getClientById,
  getClientPromos,
  setClientBlacklistStatus,
  unlinkCustomerAccount,
  updateClient,
  updateClientNoShowScore,
} from '../lib/database';
import { getFidelityTierSnapshot } from '../lib/fidelity';
import { isSupportedImageFile } from '../lib/imageFiles';
import {
  getClientCardCode,
  getClientCardPath,
  getClientCardUrl,
} from '../lib/qrCode';
import { getClientWhatsAppUrl, getCustomerInviteWhatsAppUrl } from '../lib/whatsapp';

const REWARD_REASON_LABELS = {
  visit: 'Visita',
  manual: 'Premio manuale',
  promotion: 'Promozione',
  redeem: 'Riscatto premio',
  correction: 'Correzione',
};

const formatInviteExpiry = (value) => {
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return 'Scadenza non disponibile.';
  const formatted = new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(expiry);
  return `Scade il ${formatted}.`;
};

const formatVisitDate = (dateString) => {
  try {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTenant();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [customerInviteEmail, setCustomerInviteEmail] = useState('');
  const [customerInvite, setCustomerInvite] = useState(null);
  const [unlinkingCustomerAccount, setUnlinkingCustomerAccount] = useState(false);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [pendingEditCropFile, setPendingEditCropFile] = useState(null);
  const [visitForm, setVisitForm] = useState(createEmptyVisitForm);
  const [editForm, setEditForm] = useState({
    name: '',
    breed: '',
    species: '',
    birth_date: '',
    sex: '',
    microchip: '',
    weight_kg: '',
    color: '',
    neutered: '',
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

  useEffect(() => {
    loadClient();
  }, [clientId]);

  useEffect(() => {
    return () => {
      if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
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
        species: data.species || '',
        birth_date: data.birth_date || '',
        sex: data.sex || '',
        microchip: data.microchip || '',
        weight_kg: data.weight_kg || '',
        color: data.color || '',
        neutered: data.neutered == null ? '' : String(data.neutered),
        owner: data.owner,
        phone: data.phone || '',
        notes: data.notes || '',
        photo: data.photo || '',
        photoFile: null,
        removePhoto: false,
      });
      if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
      setEditPhotoPreview('');
    } catch (err) {
      setError(err.message || 'Errore nel caricamento cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhotoSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!isSupportedImageFile(file)) {
      setError('Seleziona un file immagine valido');
      return;
    }
    setPendingEditCropFile(file);
  };

  const handleEditCropConfirm = ({ file, previewUrl }) => {
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoPreview(previewUrl);
    setEditForm((previous) => ({
      ...previous,
      photoFile: file,
      removePhoto: false,
    }));
    setPendingEditCropFile(null);
  };

  const handleAddVisit = async (event) => {
    event.preventDefault();
    if (!visitForm.cost || parseFloat(visitForm.cost) <= 0) {
      setError('Il costo deve essere un numero positivo');
      return;
    }
    try {
      await addVisit(clientId, visitForm);
      setShowAddVisitModal(false);
      setVisitForm(createEmptyVisitForm());
      loadClient();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVisit = async (visitId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa visita?')) return;
    try {
      await deleteVisit(visitId, clientId);
      loadClient();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateClient = async (event) => {
    event.preventDefault();
    if (!editForm.name || !editForm.owner) {
      setError('Nome e proprietario sono obbligatori');
      return;
    }
    try {
      await updateClient(clientId, editForm);
      if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
      setEditPhotoPreview('');
      setShowEditModal(false);
      loadClient();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenEditModal = () => {
    if (!client) return;
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoPreview('');
    setEditForm({
      name: client.name,
      breed: client.breed || '',
      species: client.species || '',
      birth_date: client.birth_date || '',
      sex: client.sex || '',
      microchip: client.microchip || '',
      weight_kg: client.weight_kg || '',
      color: client.color || '',
      neutered: client.neutered == null ? '' : String(client.neutered),
      owner: client.owner,
      phone: client.phone || '',
      notes: client.notes || '',
      photo: client.photo || '',
      photoFile: null,
      removePhoto: false,
    });
    setShowEditModal(true);
  };

  const handleDeleteClient = async () => {
    if (!window.confirm('Eliminerai il cliente e tutte le sue visite. Sei sicuro?')) return;
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

  const handleAddRewardPoints = async (event) => {
    event.preventDefault();
    try {
      await addRewardPointMovement(clientId, rewardForm);
      setRewardForm({ points: '', reason: 'manual', note: '' });
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
      setError('Il QR non è ancora disponibile. Ricarica la scheda e riprova.');
      return;
    }
    navigate(getClientCardPath(client.qr_token));
  };

  const handleCreateCustomerInvite = async () => {
    try {
      const invite = await createCustomerPortalInvite(clientId, customerInviteEmail.trim());
      setCustomerInvite(invite);
    } catch (err) {
      setError(err.message || 'Errore creazione invito cliente');
    }
  };

  const handleUnlinkCustomerAccount = async () => {
    if (!client?.customer?.id || !client.customer.user_id) return;
    const confirmed = window.confirm(
      'Scollegare questo account? Il cliente non vedra piu le sue schede, ma anagrafica, cani, visite e account non verranno cancellati.'
    );
    if (!confirmed) return;

    setUnlinkingCustomerAccount(true);
    setError('');
    try {
      await unlinkCustomerAccount(client.customer.id);
      setCustomerInvite(null);
      setCustomerInviteEmail('');
      await loadClient();
    } catch (err) {
      setError(err.message || 'Errore scollegamento account cliente');
    } finally {
      setUnlinkingCustomerAccount(false);
    }
  };

  const handlePrintClientCard = () => {
    if (!client?.qr_token) {
      setError('Il QR non è ancora disponibile. Ricarica la scheda e riprova.');
      return;
    }
    window.open(getClientCardUrl(client.qr_token, { print: true }), '_blank', 'noopener,noreferrer');
  };

  const closeEditModal = () => {
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoPreview('');
    setShowEditModal(false);
  };

  const removeEditPhoto = () => {
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoPreview('');
    setEditForm((previous) => ({
      ...previous,
      photo: '',
      photoFile: null,
      removePhoto: true,
    }));
  };

  if (loading) {
    return (
      <div className="gh-page">
        <Hero title="Scheda cliente" subtitle="Caricamento della scheda completa" />
        <main className="gh-page-shell gh-detail-stack" aria-busy="true">
          <Panel eyebrow="Cliente" title="Caricamento dati" flush>
            {Array.from({ length: 6 }, (_, index) => <SkeletonRow key={index} />)}
          </Panel>
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="gh-page">
        <Hero title="Scheda cliente" subtitle="La scheda richiesta non è disponibile" />
        <main className="gh-page-shell">
          <Panel>
            <EmptyState
              title="Cliente non trovato"
              body="Torna all’archivio e apri una scheda disponibile."
              action={
                <Button staff variant="primary" onClick={() => navigate('/dashboard')}>
                  Torna alla lista
                </Button>
              }
            />
          </Panel>
        </main>
      </div>
    );
  }

  const promo = getClientPromos(client);
  const fidelity = getFidelityTierSnapshot(client, tenant?.settings);
  const currentTier = fidelity.currentTier?.key || 'base';
  const visitsTotal = client.visits?.length || 0;
  const visitsValue = client.visits?.reduce((sum, visit) => sum + Number(visit.cost || 0), 0) || 0;
  const customerAccountLinked = Boolean(client.customer?.user_id);

  return (
    <div className="gh-page gh-detail-page">
      <Hero
        title="Scheda cliente"
        subtitle={`${client.name} · ${client.owner}${client.breed ? ` · ${client.breed}` : ''}`}
        right={<HeroButton onClick={() => navigate('/dashboard')}>← Indietro</HeroButton>}
      />

      <main className="gh-page-shell gh-detail-stack">
        {location.state?.justCreated ? (
          <div className="gh-success-state" role="status">
            Cliente creato. Puoi completare ora la scheda oppure tornare alla dashboard.
            <div className="gh-inline-actions">
              <Button staff variant="primary" onClick={handleOpenEditModal}>Completa la scheda</Button>
              <Button staff variant="outline" onClick={() => navigate('/dashboard')}>Più tardi</Button>
            </div>
          </div>
        ) : null}
        {location.state?.visitCompletedWithAppointment ? (
          <div className="gh-success-state" role="status">Visita registrata e appuntamento chiuso insieme.</div>
        ) : null}
        {error && (
          <ErrorState
            title="Operazione non completata"
            body={`${error}. La scheda e i dati già inseriti restano visibili.`}
            action={
              <Button staff variant="danger" className="gh-error-state__action" onClick={() => setError('')}>
                Chiudi
              </Button>
            }
          />
        )}

        <Panel className="gh-identity-panel">
          <div className="gh-identity">
            <PetAvatar name={client.name} photo={client.photo} size={112} tier={currentTier} />
            <div className="gh-identity__copy">
              <div className="gh-identity__title-line">
                <div>
                  <h2 className="gh-pet-name">{client.name}</h2>
                  <p className="gh-identity__breed">{client.breed || 'Razza non specificata'}</p>
                </div>
                <FidelityBadge tier={currentTier} />
              </div>
              <div className="gh-identity__meta">
                <span><strong>{client.owner}</strong></span>
                {client.phone && <span className="gh-num">{client.phone}</span>}
              </div>
              <div className="gh-identity__actions">
                <Button staff variant="primary" icon="pencil" onClick={handleOpenEditModal}>
                  Modifica
                </Button>
                <Button
                  staff
                  variant="secondary"
                  icon="calendar"
                  onClick={() => navigate(`/calendar?clientId=${clientId}`)}
                >
                  Appuntamento
                </Button>
                <Button staff variant="whatsapp" icon="whatsapp" onClick={handleOpenWhatsApp}>
                  WhatsApp
                </Button>
                <Button staff variant="outline" icon="qr" onClick={handleOpenClientCard}>
                  QR Card
                </Button>
                <Button staff variant="danger" icon="trash" onClick={handleDeleteClient}>
                  Elimina
                </Button>
              </div>
            </div>
          </div>
        </Panel>

        {promo.count > 0 && (
          <Panel className="gh-promo-panel" eyebrow="Promozione visite" title={promo.message}>
            <p className="gh-body">
              {promo.discount > 0
                ? `Sconto disponibile: ${promo.discount}%`
                : 'Il vantaggio si aggiorna automaticamente con le visite registrate.'}
            </p>
          </Panel>
        )}

        <Panel
          eyebrow="Fidelity cliente"
          title={`Livello ${fidelity.currentTier?.label || 'Base'}`}
          right={
            <Button staff variant="outline" onClick={() => setShowRewardModal(true)}>
              Aggiungi / rimuovi punti
            </Button>
          }
        >
          <div className="gh-fidelity-summary">
            <div>
              <span className="gh-eyebrow--staff">Punti premio</span>
              <div className="gh-stat-num">{fidelity.rewardPointsTotal}</div>
            </div>
            <p className="gh-meta">
              {fidelity.hasRewardPoints
                ? 'Il livello considera il risultato migliore tra visite e punti premio.'
                : 'Nessun punto ancora assegnato: la card usa ancora il fallback sulle visite.'}
            </p>
          </div>

          <div className="gh-tier-list">
            {fidelity.tiers.map((tier) => {
              const visitsProgress = Math.min(tier.visitsInWindow / tier.visitsRequired, 1);
              const pointsProgress = Math.min(fidelity.rewardPointsTotal / tier.pointsRequired, 1);
              const bestProgress = Math.max(visitsProgress, pointsProgress) * 100;
              const achievedWith = [
                tier.achievedByVisits ? 'visite' : '',
                tier.achievedByPoints ? 'punti' : '',
              ].filter(Boolean).join(' e ');
              return (
                <div className="gh-tier-row" key={tier.key}>
                  <FidelityBadge tier={tier.key} compact />
                  <div className="gh-tier-row__progress">
                    <progress max={100} value={bestProgress} />
                    <span className="gh-meta gh-num">
                      {tier.visitsInWindow} / {tier.visitsRequired} visite in {tier.monthsWindow} mesi
                      {' · '}{fidelity.rewardPointsTotal} / {tier.pointsRequired} punti
                    </span>
                  </div>
                  <span className="gh-meta gh-num">
                    {tier.achieved
                      ? `Raggiunto con ${achievedWith}`
                      : `${tier.remainingVisits} visite oppure ${tier.remainingPoints} punti`}
                  </span>
                </div>
              );
            })}
          </div>

          {client.rewardPoints?.length > 0 && (
            <div className="gh-reward-list">
              <span className="gh-eyebrow--staff">Ultimi movimenti punti</span>
              {client.rewardPoints.slice(0, 5).map((movement) => {
                const positive = Number(movement.points) > 0;
                return (
                  <div className="gh-reward-row" key={movement.id}>
                    <div>
                      <strong>{REWARD_REASON_LABELS[movement.reason] || movement.reason}</strong>
                      {movement.note && <p className="gh-meta">{movement.note}</p>}
                    </div>
                    <div className="gh-reward-row__value">
                      <strong className={positive ? 'gh-text-success' : 'gh-text-danger'}>
                        {positive ? '+' : ''}{movement.points} punti
                      </strong>
                      <span className="gh-meta gh-num">
                        {new Date(movement.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {client.notes && (
          <Panel className="gh-notes-panel" eyebrow="Note importanti" title="Indicazioni operatore">
            <p className="gh-body gh-pre-wrap">{client.notes}</p>
          </Panel>
        )}

        <Panel className="gh-detail-half" eyebrow="Card identificativa QR" title={client.qr_token ? `Codice ${getClientCardCode(client.qr_token)}` : 'QR in preparazione'}>
          <div className="gh-qr-layout">
            <div className="gh-qr-copy">
              <p className="gh-body">
                Il QR apre la card cliente pubblica. Se sei in area operatore, puoi continuare dalla scheda completa.
              </p>
              {client.qr_token ? <div className="gh-inline-actions">
                <Button staff variant="secondary" icon="arrow" onClick={handleOpenClientCard}>
                  Apri area operatore
                </Button>
                <Button staff variant="outline" icon="qr" onClick={handlePrintClientCard}>
                  Stampa card
                </Button>
              </div> : <p className="gh-meta">Ricarica la scheda tra un momento.</p>}
            </div>
            {client.qr_token && (
              <div className="gh-qr-image">
                <ClientQrImage qrToken={client.qr_token} size={180} alt={`QR ${client.name}`} />
              </div>
            )}
          </div>
        </Panel>

        <Panel
          className="gh-detail-half"
          bridge
          eyebrow="Area cliente digitale"
          title={customerAccountLinked ? 'Account cliente collegato' : 'Collega questa scheda a un account'}
        >
          <div className="gh-bridge-layout">
            {customerAccountLinked ? (
              <div>
                <p className="gh-body">
                  L'account {client.customer.email || 'cliente'} puo vedere le schede collegate a questa anagrafica.
                </p>
                <p className="gh-meta">
                  Scollegandolo non cancelli anagrafica, cani, visite o account. Potrai generare subito un nuovo invito.
                </p>
                <div className="gh-inline-actions">
                  <Button
                    staff
                    variant="danger"
                    onClick={handleUnlinkCustomerAccount}
                    disabled={unlinkingCustomerAccount}
                  >
                    {unlinkingCustomerAccount ? 'Scollegamento...' : 'Scollega account'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="gh-body">
                  Genera un link riservato per collegare questa scheda cane a un account cliente.
                  Il cliente vedrà solo card, fidelity, prossimo appuntamento e contatto WhatsApp.
                </p>
                <div className="gh-bridge-form">
                  <Field
                    aria-label="Email cliente opzionale"
                    type="email"
                    value={customerInviteEmail}
                    onChange={(event) => setCustomerInviteEmail(event.target.value)}
                    placeholder="Email cliente opzionale"
                  />
                  <Button staff variant="primary" onClick={handleCreateCustomerInvite}>
                    Genera invito
                  </Button>
                </div>
              </div>
            )}
            {!customerAccountLinked && customerInvite && (
              <div className="gh-invite-result">
                <span className="gh-eyebrow--staff">Link invito</span>
                <p className="gh-body"><strong>Destinatario:</strong> {customerInvite.recipient} · {customerInvite.phone}</p>
                <p className="gh-invite-result__url">{customerInvite.inviteUrl}</p>
                <p className="gh-meta">{formatInviteExpiry(customerInvite.expires_at)}</p>
                <div className="gh-inline-actions">
                  <a className="gh-btn gh-btn--whatsapp" href={getCustomerInviteWhatsAppUrl(customerInvite)} target="_blank" rel="noreferrer">Apri WhatsApp</a>
                  <Button staff variant="outline" onClick={() => navigator.clipboard?.writeText(customerInvite.inviteUrl)}>Copia link</Button>
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel
          eyebrow="Affidabilità appuntamenti"
          title={`Score ${client.no_show_score ?? 0} · ${client.is_blacklisted ? 'BLACKLIST' : 'Attivo'}`}
        >
          <div className="gh-score-copy">
            <ScoreScale />
            <p className="gh-meta">Regola automatica: da -3 in giù il cliente entra in blacklist.</p>
          </div>
          <div className="gh-inline-actions gh-score-actions">
            <Button staff variant="danger" onClick={() => handleAdjustNoShowScore(-1)}>
              Segna No-show (-1)
            </Button>
            <Button staff variant="success" icon="check" onClick={() => handleAdjustNoShowScore(1)}>
              Segna Presenza (+1)
            </Button>
            <Button staff variant="ghost" onClick={handleToggleBlacklist}>
              {client.is_blacklisted ? 'Rimuovi da blacklist' : 'Inserisci in blacklist'}
            </Button>
          </div>
        </Panel>

        <Panel
          eyebrow="Visite"
          title={`${visitsTotal} registrate · ${visitsValue.toLocaleString('it-IT', {
            style: 'currency',
            currency: 'EUR',
          })} nel periodo`}
          flush
          right={
            <Button staff variant="ghost" icon="plus" onClick={() => setShowAddVisitModal(true)}>
              Registra
            </Button>
          }
        >
          {client.visits?.length > 0 ? (
            client.visits.map((visit) => (
              <VisitRow
                key={visit.id}
                visit={visit}
                date={formatVisitDate(visit.date)}
                onDelete={() => handleDeleteVisit(visit.id)}
              />
            ))
          ) : (
            <EmptyState
              title="Nessuna visita registrata"
              body="Registra la prima visita da qui, anche se il lavoro è già stato concluso."
              action={
                <Button staff variant="primary" icon="plus" onClick={() => setShowAddVisitModal(true)}>
                  Registra la prima visita
                </Button>
              }
            />
          )}
        </Panel>
      </main>

      <Fab label="Registra visita" always onClick={() => setShowAddVisitModal(true)} />

      {showAddVisitModal && (
        <div className="gh-modal-scrim" role="presentation">
          <section className="gh-modal" role="dialog" aria-modal="true" aria-labelledby="visit-modal-title">
            <div className="gh-modal__head">
              <div>
                <span className="gh-eyebrow--staff gh-eyebrow--accent">Registra visita</span>
                <h2 className="gh-panel-title" id="visit-modal-title">{client.name}</h2>
              </div>
              <Button staff variant="ghost" onClick={() => setShowAddVisitModal(false)}>Chiudi</Button>
            </div>
            <VisitForm
              modal
              value={visitForm}
              onChange={setVisitForm}
              onSubmit={handleAddVisit}
              onCancel={() => setShowAddVisitModal(false)}
              error={error}
            />
          </section>
        </div>
      )}

      {showEditModal && (
        <div className="gh-modal-scrim" role="presentation">
          <section className="gh-modal gh-modal--narrow" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
            <div className="gh-modal__head">
              <div>
                <span className="gh-eyebrow--staff gh-eyebrow--accent">Scheda cliente</span>
                <h2 className="gh-panel-title" id="edit-modal-title">Modifica Cliente</h2>
              </div>
              <Button staff variant="ghost" onClick={closeEditModal}>Chiudi</Button>
            </div>
            <form onSubmit={handleUpdateClient}>
              <div className="gh-modal__body gh-form-stack">
                {error && (
                  <ErrorState body={`${error}. Le modifiche inserite restano disponibili.`} />
                )}
                <Field label="Nome *" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} required />
                <Field label="Specie" value={editForm.species} onChange={(event) => setEditForm({ ...editForm, species: event.target.value })} placeholder="Es. cane" />
                <Field label="Razza" value={editForm.breed} onChange={(event) => setEditForm({ ...editForm, breed: event.target.value })} />
                <Field label="Data di nascita" type="date" value={editForm.birth_date} onChange={(event) => setEditForm({ ...editForm, birth_date: event.target.value })} />
                <Field label="Sesso" as="select" value={editForm.sex} onChange={(event) => setEditForm({ ...editForm, sex: event.target.value })}>
                  <option value="">Non indicato</option><option value="m">Maschio</option><option value="f">Femmina</option>
                </Field>
                <Field label="Microchip" value={editForm.microchip} onChange={(event) => setEditForm({ ...editForm, microchip: event.target.value })} />
                <Field label="Peso (kg)" type="number" min="0" step="0.1" value={editForm.weight_kg} onChange={(event) => setEditForm({ ...editForm, weight_kg: event.target.value })} />
                <Field label="Colore" value={editForm.color} onChange={(event) => setEditForm({ ...editForm, color: event.target.value })} />
                <Field label="Sterilizzato" as="select" value={editForm.neutered} onChange={(event) => setEditForm({ ...editForm, neutered: event.target.value })}>
                  <option value="">Non indicato</option><option value="true">Sì</option><option value="false">No</option>
                </Field>
                <Field label="Proprietario *" value={editForm.owner} onChange={(event) => setEditForm({ ...editForm, owner: event.target.value })} required />
                <Field label="Telefono" type="tel" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
                <Field label="Note" area rows="3" value={editForm.notes} onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })} />

                <div>
                  <span className="gh-eyebrow--staff gh-field-label">Foto del cane</span>
                  {(editForm.photo || editPhotoPreview) && (
                    <div className="gh-edit-photo-preview">
                      <img src={editPhotoPreview || editForm.photo} alt="Anteprima foto" />
                      <Button staff variant="danger" icon="trash" onClick={removeEditPhoto} aria-label="Rimuovi foto" />
                    </div>
                  )}
                  <div className="gh-photo-picker">
                    <p className="gh-meta">
                      {editForm.photo || editPhotoPreview ? 'Sostituisci foto del cane' : 'Aggiungi foto del cane'}
                    </p>
                    <div className="gh-inline-actions">
                      <label className="gh-btn gh-btn--primary gh-file-button">
                        <input type="file" accept="image/*,.heic,.heif" capture="environment" onChange={handleEditPhotoSelect} />
                        Scatta foto
                      </label>
                      <label className="gh-btn gh-btn--outline gh-file-button">
                        <input type="file" accept="image/*,.heic,.heif" onChange={handleEditPhotoSelect} />
                        Galleria
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gh-modal__foot">
                <Button staff variant="outline" onClick={closeEditModal}>Annulla</Button>
                <Button staff variant="primary" type="submit">Salva Modifiche</Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showRewardModal && (
        <div className="gh-modal-scrim" role="presentation">
          <section className="gh-modal gh-modal--narrow" role="dialog" aria-modal="true" aria-labelledby="reward-modal-title">
            <div className="gh-modal__head">
              <div>
                <span className="gh-eyebrow--staff gh-eyebrow--accent">Fidelity</span>
                <h2 className="gh-panel-title" id="reward-modal-title">Punti premio</h2>
              </div>
              <Button staff variant="ghost" onClick={() => setShowRewardModal(false)}>Chiudi</Button>
            </div>
            <form onSubmit={handleAddRewardPoints}>
              <div className="gh-modal__body gh-form-stack">
                {error && (
                  <ErrorState body={`${error}. Il movimento inserito resta disponibile.`} />
                )}
                <p className="gh-meta">Usa valori positivi per assegnare punti, negativi per riscatti o correzioni.</p>
                <Field
                  label="Punti *"
                  type="number"
                  step="1"
                  value={rewardForm.points}
                  onChange={(event) => setRewardForm({ ...rewardForm, points: event.target.value })}
                  placeholder="Es. 25 oppure -50"
                  required
                />
                <Field
                  as="select"
                  label="Motivo"
                  value={rewardForm.reason}
                  onChange={(event) => setRewardForm({ ...rewardForm, reason: event.target.value })}
                >
                  {VALID_REWARD_POINT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{REWARD_REASON_LABELS[reason] || reason}</option>
                  ))}
                </Field>
                <Field
                  label="Nota"
                  area
                  rows="3"
                  value={rewardForm.note}
                  onChange={(event) => setRewardForm({ ...rewardForm, note: event.target.value })}
                  placeholder="Dettaglio facoltativo"
                />
              </div>
              <div className="gh-modal__foot">
                <Button staff variant="outline" onClick={() => setShowRewardModal(false)}>Annulla</Button>
                <Button staff variant="primary" type="submit">Salva movimento</Button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ImageCropModal
        open={Boolean(pendingEditCropFile)}
        file={pendingEditCropFile}
        onCancel={() => setPendingEditCropFile(null)}
        onConfirm={handleEditCropConfirm}
      />
    </div>
  );
}
