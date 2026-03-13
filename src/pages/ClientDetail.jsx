import React, { useState, useEffect, useRef } from 'react';
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
} from '../lib/database';
import { getClientWhatsAppUrl } from '../lib/whatsapp';
import PromoBadge from '../components/PromoBadge';
import VisitCard from '../components/VisitCard';

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
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const editCameraInputRef = useRef(null);
  const editGalleryInputRef = useRef(null);

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
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Seleziona un file immagine valido');
      return;
    }

    if (editPhotoPreview) {
      URL.revokeObjectURL(editPhotoPreview);
    }

    setEditPhotoPreview(URL.createObjectURL(file));
    setEditForm((prev) => ({
      ...prev,
      photoFile: file,
      removePhoto: false,
    }));
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

  const handleOpenWhatsApp = () => {
    const whatsappUrl = getClientWhatsAppUrl(client);
    if (!whatsappUrl) {
      setError('Inserisci un numero di telefono per usare WhatsApp.');
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#faf3f0' }}
      >
        <div className="text-center">
          <div
            className="animate-spin h-12 w-12 rounded-full border-4 border-solid mx-auto mb-4"
            style={{
              borderColor: '#d4a574',
              borderTopColor: 'transparent',
            }}
          ></div>
          <p style={{ color: '#8b5a3c' }}>Caricamento cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#faf3f0' }}
      >
        <div className="text-center">
          <p style={{ color: '#8b5a3c' }}>Cliente non trovato</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#d4a574' }}
          >
            Torna alla lista
          </button>
        </div>
      </div>
    );
  }

  const promo = getClientPromos(client);

  return (
    <div style={{ backgroundColor: '#faf3f0' }} className="min-h-screen pb-20">
      {/* Header */}
      <header
        style={{ backgroundColor: '#d4a574' }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Dettagli Cliente</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition"
          >
            ← Indietro
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Errore */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p style={{ color: '#991b1b' }} className="font-medium">
              {error}
            </p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm underline"
              style={{ color: '#991b1b' }}
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
              style={{ backgroundColor: '#d4a574' }}
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
                style={{ color: '#5a3a2a' }}
              >
                {client.name}
              </h2>
              <p style={{ color: '#8b5a3c' }} className="mb-3 text-lg">
                {client.breed || 'Razza non specificata'}
              </p>
              <div className="space-y-2 mb-4">
                <p style={{ color: '#8b5a3c' }}>
                  👤 <strong>{client.owner}</strong>
                </p>
                {client.phone && (
                  <p style={{ color: '#8b5a3c' }}>📱 {client.phone}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleOpenEditModal}
                  className="px-4 py-2 rounded-lg font-medium transition text-white"
                  style={{ backgroundColor: '#d4a574' }}
                >
                  ✏️ Modifica
                </button>
                <button
                  onClick={() => navigate(`/calendar?clientId=${clientId}`)}
                  className="px-4 py-2 rounded-lg font-medium transition text-white"
                  style={{ backgroundColor: '#8b5a3c' }}
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
                  onClick={handleDeleteClient}
                  className="px-4 py-2 rounded-lg font-medium transition text-white bg-red-500 hover:bg-red-600"
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Promozione */}
        {promo.count > 0 && <PromoBadge promo={promo} />}

        {/* Note */}
        {client.notes && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-6 mb-6">
            <h3 style={{ color: '#5a3a2a' }} className="font-bold mb-2">
              📝 Note Importanti
            </h3>
            <p style={{ color: '#8b5a3c' }} className="whitespace-pre-wrap">
              {client.notes}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 style={{ color: '#5a3a2a' }} className="text-xl font-bold mb-3">
            ⚖️ Affidabilita appuntamenti
          </h3>
          <p style={{ color: '#8b5a3c' }} className="mb-4">
            Score attuale: <strong>{client.no_show_score ?? 0}</strong> · Stato:{' '}
            <strong>{client.is_blacklisted ? 'BLACKLIST' : 'Attivo'}</strong>
          </p>
          <p style={{ color: '#8b5a3c' }} className="text-sm mb-4">
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
            style={{ color: '#5a3a2a' }}
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
            <p style={{ color: '#8b5a3c' }} className="italic text-center py-8">
              Nessuna visita registrata
            </p>
          )}
        </div>
      </main>

      {/* FAB Aggiungi Visita */}
      <button
        onClick={() => setShowAddVisitModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full text-white text-2xl shadow-lg transform transition duration-200 hover:scale-110 flex items-center justify-center"
        style={{ backgroundColor: '#d4a574' }}
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
            <h2 style={{ color: '#5a3a2a' }} className="text-2xl font-bold mb-6">
              Nuova Visita
            </h2>

            <form onSubmit={handleAddVisit} className="space-y-4">
              {/* Data */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
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
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                />
              </div>

              {/* Trattamenti */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                  Trattamenti
                </label>
                <textarea
                  value={visitForm.treatments}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, treatments: e.target.value })
                  }
                  placeholder="Es. Bagno, taglio, asciugatura..."
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                  rows="3"
                />
              </div>

              {/* Problematiche */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                  Problematiche
                </label>
                <textarea
                  value={visitForm.issues}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, issues: e.target.value })
                  }
                  placeholder="Es. Pelle irritata, nodi..."
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                  rows="3"
                />
              </div>

              {/* Costo */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
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
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-bold text-white transition"
                  style={{ backgroundColor: '#d4a574' }}
                >
                  Salva Visita
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="flex-1 py-3 rounded-lg font-bold border-2 transition"
                  style={{
                    borderColor: '#d4a574',
                    color: '#5a3a2a',
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
            <h2 style={{ color: '#5a3a2a' }} className="text-2xl font-bold mb-6">
              Modifica Cliente
            </h2>

            <form onSubmit={handleUpdateClient} className="space-y-4">
              {/* Nome */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
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
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                />
              </div>

              {/* Razza */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                  Razza
                </label>
                <input
                  type="text"
                  value={editForm.breed}
                  onChange={(e) =>
                    setEditForm({ ...editForm, breed: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                />
              </div>

              {/* Proprietario */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
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
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                />
              </div>

              {/* Telefono */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                />
              </div>

              {/* Note */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                  Note
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: '#e8d5c4', color: '#5a3a2a' }}
                  rows="3"
                />
              </div>

              {/* Foto */}
              <div>
                <label style={{ color: '#5a3a2a' }} className="block text-sm font-medium mb-2">
                  Foto del cane
                </label>

                {(editForm.photo || editPhotoPreview) && (
                  <div className="mb-3 relative">
                    <img
                      src={editPhotoPreview || editForm.photo}
                      alt="Anteprima foto"
                      className="w-full h-40 object-cover rounded-lg border-2"
                      style={{ borderColor: '#d4a574' }}
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
                  style={{ borderColor: '#d4a574' }}
                >
                  <input
                    ref={editCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleEditPhotoSelect}
                    className="hidden"
                  />
                  <input
                    ref={editGalleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoSelect}
                    className="hidden"
                  />
                  <p style={{ color: '#8b5a3c' }} className="text-sm font-medium">
                    {editForm.photo || editPhotoPreview
                      ? 'Sostituisci foto del cane'
                      : 'Aggiungi foto del cane'}
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => editCameraInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg font-medium text-white transition"
                      style={{ backgroundColor: '#d4a574' }}
                    >
                      Scatta foto
                    </button>
                    <button
                      type="button"
                      onClick={() => editGalleryInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg font-medium border-2 transition"
                      style={{ borderColor: '#d4a574', color: '#5a3a2a' }}
                    >
                      Galleria
                    </button>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-bold text-white transition"
                  style={{ backgroundColor: '#d4a574' }}
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
                    borderColor: '#d4a574',
                    color: '#5a3a2a',
                  }}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
