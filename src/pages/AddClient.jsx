import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addClient, convertContactToClient } from '../lib/database';
import ImageCropModal from '../components/ImageCropModal';
import { isSupportedImageFile } from '../lib/imageFiles';
import AppHeader from '../components/AppHeader';

/**
 * AddClient — Pagina form aggiunta nuovo cliente
 * Accetta: nome, razza, proprietario, telefono, note, foto
 */
export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    owner: '',
    phone: '',
    notes: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [pendingCropFile, setPendingCropFile] = useState(null);

  const contactConversion = useMemo(() => {
    const state = location.state;
    if (!state?.sourceContactId) return null;

    return {
      sourceContactId: state.sourceContactId,
      returnTo: state.returnTo || '/contacts',
      petName: state.pet_name || '',
      ownerName: state.owner_name || '',
      phone: state.phone || '',
      notes: state.notes || '',
    };
  }, [location.state]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!contactConversion) return;

    setFormData((prev) => ({
      ...prev,
      name: contactConversion.petName,
      owner: contactConversion.ownerName,
      phone: contactConversion.phone,
      notes: contactConversion.notes,
    }));
  }, [contactConversion]);

  /**
   * Gestisce upload foto cliente
   */
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // Validazione tipo file
    if (!isSupportedImageFile(file)) {
      setError('Seleziona un file immagine');
      return;
    }

    setPendingCropFile(file);
  };

  const handleCropCancel = () => {
    setPendingCropFile(null);
  };

  const handleCropConfirm = ({ file, previewUrl }) => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(previewUrl);
    setPendingCropFile(null);
  };

  /**
   * Invia il form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validazioni
    if (!formData.name.trim()) {
      setError('Il nome del cane è obbligatorio');
      return;
    }
    if (!formData.owner.trim()) {
      setError('Il proprietario è obbligatorio');
      return;
    }

    setLoading(true);

    try {
      const createdClientId = await addClient({
        ...formData,
        photoFile,
      });

      if (contactConversion?.sourceContactId) {
        await convertContactToClient(contactConversion.sourceContactId, createdClientId);
        navigate(`/client/${createdClientId}`);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Errore nell\'aggiunta del cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Annulla e torna a dashboard
   */
  const handleCancel = () => {
    navigate(contactConversion?.returnTo || '/dashboard');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)' }} className="min-h-screen">
      <AppHeader
        title={contactConversion ? 'Converti in cliente' : 'Nuovo cliente'}
        subtitle={
          contactConversion
            ? 'Completa i dati essenziali e trasforma il contatto in una scheda cliente pronta all’uso.'
            : 'Inserisci i dati essenziali, aggiungi una foto e prepara subito la scheda del cane.'
        }
        maxWidthClass="max-w-2xl"
        rightContent={
          <button
            onClick={handleCancel}
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

      <main className="max-w-2xl mx-auto px-4 py-8">
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

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {contactConversion ? (
            <div
              className="mb-6 p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-surface-soft)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.2em] font-semibold mb-2"
                style={{ color: 'var(--color-secondary)' }}
              >
                Conversione contatto
              </p>
              <p style={{ color: 'var(--color-text-primary)' }}>
                Stai convertendo il contatto di <strong>{contactConversion.petName}</strong>.
                Dopo il salvataggio il contatto verrà segnato come convertito.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome (obbligatorio) */}
            <div>
              <label
                htmlFor="name"
                style={{ color: 'var(--color-text-primary)' }}
                className="block text-sm font-bold mb-2"
              >
                Nome del cane *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Es. Bau, Fluffy, Rex..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <p style={{ color: 'var(--color-secondary)' }} className="text-xs mt-1">
                Campo obbligatorio
              </p>
            </div>

            {/* Razza */}
            <div>
              <label
                htmlFor="breed"
                style={{ color: 'var(--color-text-primary)' }}
                className="block text-sm font-bold mb-2"
              >
                Razza
              </label>
              <input
                id="breed"
                type="text"
                placeholder="Es. Labrador, Pastore Tedesco..."
                value={formData.breed}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Proprietario (obbligatorio) */}
            <div>
              <label
                htmlFor="owner"
                style={{ color: 'var(--color-text-primary)' }}
                className="block text-sm font-bold mb-2"
              >
                Proprietario *
              </label>
              <input
                id="owner"
                type="text"
                placeholder="Nome del proprietario"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <p style={{ color: 'var(--color-secondary)' }} className="text-xs mt-1">
                Campo obbligatorio
              </p>
            </div>

            {/* Telefono */}
            <div>
              <label
                htmlFor="phone"
                style={{ color: 'var(--color-text-primary)' }}
                className="block text-sm font-bold mb-2"
              >
                Telefono
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Es. 333 123 4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="notes"
                style={{ color: 'var(--color-text-primary)' }}
                className="block text-sm font-bold mb-2"
              >
                Note (allergie, preferenze, caratteristiche)
              </label>
              <textarea
                id="notes"
                placeholder="Es. Allergia ai polli, preferisce toelettature delicate..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                rows="4"
              />
            </div>

            {/* Foto */}
            <div>
              <label
                htmlFor="photo"
                style={{ color: 'var(--color-text-primary)' }}
                className="block text-sm font-bold mb-4"
              >
                Foto del cane
              </label>

              {/* Preview foto se caricata */}
              {photoPreview && (
                <div className="mb-4 relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2"
                    style={{ borderColor: 'var(--color-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (photoPreview) {
                        URL.revokeObjectURL(photoPreview);
                      }
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div
                className="border-2 border-dashed rounded-lg p-8 text-center"
                style={{ borderColor: 'var(--color-primary)' }}
              >
                <div>
                  <div className="text-4xl mb-2">📸</div>
                  <p style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                    Foto del cane
                  </p>
                  <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-1">
                    Da smartphone puoi scattarla in diretta oppure scegliere dalla galleria.
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <div
                    className="relative px-4 py-3 rounded-lg font-bold text-white transition inline-flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <input
                      id="photo-camera"
                      type="file"
                      accept="image/*,.heic,.heif"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    Scatta foto
                  </div>
                  <div
                    className="relative px-4 py-3 rounded-lg font-bold border-2 transition inline-flex items-center justify-center overflow-hidden"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-text-primary)' }}
                  >
                    <input
                      id="photo-gallery"
                      type="file"
                      accept="image/*,.heic,.heif"
                      onChange={handlePhotoSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    Scegli dalla galleria
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Salvataggio...
                  </span>
                ) : (
                  contactConversion ? '✅ Converti in cliente' : '✅ Salva Cliente'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-4 rounded-lg font-bold border-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Annulla
              </button>
            </div>
          </form>

          {/* Info footer */}
          <div
            className="mt-8 p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-main)' }}
          >
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm">
              💡 <strong>Suggerimento:</strong> Compila il nome e il proprietario
              per iniziare. Puoi aggiungere foto e note in seguito se necessario.
            </p>
          </div>
        </div>
      </main>

      <ImageCropModal
        open={Boolean(pendingCropFile)}
        file={pendingCropFile}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
