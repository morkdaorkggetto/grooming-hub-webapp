import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addClient } from '../lib/database';

/**
 * AddClient — Pagina form aggiunta nuovo cliente
 * Accetta: nome, razza, proprietario, telefono, note, foto
 */
export default function AddClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    owner: '',
    phone: '',
    notes: '',
    photo: '',
  });

  /**
   * Gestisce upload foto: legge file e lo converte in base64
   */
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione tipo file
    if (!file.type.startsWith('image/')) {
      setError('Seleziona un file immagine');
      return;
    }

    // Leggi il file come data URL (base64)
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({
        ...formData,
        photo: event.target?.result || '',
      });
    };
    reader.onerror = () => {
      setError('Errore nel caricamento della foto');
    };
    reader.readAsDataURL(file);
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
      await addClient(formData);
      // Navigazione automatica dopo successo
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
    navigate('/dashboard');
  };

  return (
    <div style={{ backgroundColor: '#faf3f0' }} className="min-h-screen">
      {/* Header */}
      <header
        style={{ backgroundColor: '#d4a574' }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Nuovo Cliente</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition"
          >
            ← Indietro
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
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

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome (obbligatorio) */}
            <div>
              <label
                htmlFor="name"
                style={{ color: '#5a3a2a' }}
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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: '#e8d5c4',
                  color: '#5a3a2a',
                }}
              />
              <p style={{ color: '#8b5a3c' }} className="text-xs mt-1">
                Campo obbligatorio
              </p>
            </div>

            {/* Razza */}
            <div>
              <label
                htmlFor="breed"
                style={{ color: '#5a3a2a' }}
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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: '#e8d5c4',
                  color: '#5a3a2a',
                }}
              />
            </div>

            {/* Proprietario (obbligatorio) */}
            <div>
              <label
                htmlFor="owner"
                style={{ color: '#5a3a2a' }}
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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: '#e8d5c4',
                  color: '#5a3a2a',
                }}
              />
              <p style={{ color: '#8b5a3c' }} className="text-xs mt-1">
                Campo obbligatorio
              </p>
            </div>

            {/* Telefono */}
            <div>
              <label
                htmlFor="phone"
                style={{ color: '#5a3a2a' }}
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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                style={{
                  borderColor: '#e8d5c4',
                  color: '#5a3a2a',
                }}
              />
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="notes"
                style={{ color: '#5a3a2a' }}
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
                  borderColor: '#e8d5c4',
                  color: '#5a3a2a',
                }}
                rows="4"
              />
            </div>

            {/* Foto */}
            <div>
              <label
                htmlFor="photo"
                style={{ color: '#5a3a2a' }}
                className="block text-sm font-bold mb-4"
              >
                Foto del cane
              </label>

              {/* Preview foto se caricata */}
              {formData.photo && (
                <div className="mb-4 relative">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2"
                    style={{ borderColor: '#d4a574' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photo: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Input file */}
              <label
                className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition hover:bg-amber-50"
                style={{ borderColor: '#d4a574' }}
              >
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div>
                  <div className="text-4xl mb-2">📸</div>
                  <p style={{ color: '#5a3a2a' }} className="font-bold">
                    Scegli una foto
                  </p>
                  <p style={{ color: '#8b5a3c' }} className="text-sm mt-1">
                    Clicca o trascina un'immagine
                  </p>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#d4a574' }}
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
                  '✅ Salva Cliente'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-4 rounded-lg font-bold border-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#d4a574',
                  color: '#5a3a2a',
                }}
              >
                Annulla
              </button>
            </div>
          </form>

          {/* Info footer */}
          <div
            className="mt-8 p-4 rounded-lg"
            style={{ backgroundColor: '#faf3f0' }}
          >
            <p style={{ color: '#8b5a3c' }} className="text-sm">
              💡 <strong>Suggerimento:</strong> Compila il nome e il proprietario
              per iniziare. Puoi aggiungere foto e note in seguito se necessario.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
