import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, addVisit } from '../lib/database';
import { DEMO_MODE, DEMO_WRITE_BLOCK_MESSAGE } from '../lib/demoMode';

/**
 * AddVisit — Pagina form aggiunta visita per un cliente
 * Accetta: date, treatments, issues, cost
 */
export default function AddVisit() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    treatments: '',
    issues: '',
    cost: '',
  });

  /**
   * Carica cliente all'avvio per mostrare le info
   */
  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getClientById(clientId);
      setClient(data);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Invia il form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validazioni
    if (!formData.date) {
      setError('La data è obbligatoria');
      return;
    }

    const cost = parseFloat(formData.cost);
    if (!formData.cost || cost <= 0) {
      setError('Il costo è obbligatorio e deve essere un numero positivo');
      return;
    }

    setSubmitting(true);

    try {
      await addVisit(clientId, {
        date: formData.date,
        treatments: formData.treatments || null,
        issues: formData.issues || null,
        cost: cost,
      });

      // Navigazione automatica dopo successo
      navigate(`/client/${clientId}`);
    } catch (err) {
      setError(err.message || 'Errore nell\'aggiunta della visita');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Annulla e torna al dettaglio cliente
   */
  const handleCancel = () => {
    navigate(`/client/${clientId}`);
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

  return (
    <div style={{ backgroundColor: '#faf3f0' }} className="min-h-screen">
      {/* Header */}
      <header
        style={{ backgroundColor: '#d4a574' }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Nuova Visita</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition"
          >
            ← Indietro
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {DEMO_MODE && (
          <div
            className="mb-6 p-4 rounded-lg border"
            style={{ backgroundColor: '#fff7ed', borderColor: '#f59e0b', color: '#9a3412' }}
          >
            <p className="font-medium">{DEMO_WRITE_BLOCK_MESSAGE}</p>
          </div>
        )}

        {/* Errore globale */}
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

        {/* Info cliente */}
        {client && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ backgroundColor: '#ffffff', borderLeft: '4px solid #d4a574' }}
          >
            <p style={{ color: '#8b5a3c' }} className="text-sm">
              Aggiungendo una visita a:
            </p>
            <h2 style={{ color: '#5a3a2a' }} className="text-lg font-bold">
              {client.name}
            </h2>
            <p style={{ color: '#8b5a3c' }} className="text-sm">
              {client.breed} • {client.owner}
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data (obbligatorio) */}
            <div>
              <label
                htmlFor="date"
                style={{ color: '#5a3a2a' }}
                className="block text-sm font-bold mb-2"
              >
                Data della visita *
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                disabled={DEMO_MODE || submitting}
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

            {/* Trattamenti */}
            <div>
              <label
                htmlFor="treatments"
                style={{ color: '#5a3a2a' }}
                className="block text-sm font-bold mb-2"
              >
                Trattamenti eseguiti
              </label>
              <textarea
                id="treatments"
                placeholder="Es. Bagno, taglio, asciugatura, spazzolatura..."
                value={formData.treatments}
                onChange={(e) =>
                  setFormData({ ...formData, treatments: e.target.value })
                }
                disabled={DEMO_MODE || submitting}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition resize-none"
                style={{
                  borderColor: '#e8d5c4',
                  color: '#5a3a2a',
                }}
                rows="4"
              />
              <p style={{ color: '#8b5a3c' }} className="text-xs mt-1">
                Descrivi i trattamenti eseguiti durante questa visita
              </p>
            </div>

            {/* Problematiche */}
            <div>
              <label
                htmlFor="issues"
                style={{ color: '#5a3a2a' }}
                className="block text-sm font-bold mb-2"
              >
                Problematiche riscontrate
              </label>
              <textarea
                id="issues"
                placeholder="Es. Pelle irritata, nodi, unghie sporche, comportamento agitato..."
                value={formData.issues}
                onChange={(e) =>
                  setFormData({ ...formData, issues: e.target.value })
                }
                disabled={DEMO_MODE || submitting}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition resize-none"
                style={{
                  borderColor: '#e8d5c4',
                  color: '#5a3a2a',
                }}
                rows="4"
              />
              <p style={{ color: '#8b5a3c' }} className="text-xs mt-1">
                Registra eventuali problemi riscontrati per il follow-up
              </p>
            </div>

            {/* Costo (obbligatorio) */}
            <div>
              <label
                htmlFor="cost"
                style={{ color: '#5a3a2a' }}
                className="block text-sm font-bold mb-2"
              >
                Costo (€) *
              </label>
              <div className="flex items-center gap-2">
                <span style={{ color: '#5a3a2a' }} className="text-lg font-bold">
                  €
                </span>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  disabled={DEMO_MODE || submitting}
                  required
                  className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition"
                  style={{
                    borderColor: '#e8d5c4',
                    color: '#5a3a2a',
                  }}
                />
              </div>
              <p style={{ color: '#8b5a3c' }} className="text-xs mt-1">
                Campo obbligatorio
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={DEMO_MODE || submitting}
                title={DEMO_MODE ? DEMO_WRITE_BLOCK_MESSAGE : 'Salva visita'}
                className="flex-1 py-4 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#d4a574' }}
              >
                {submitting ? (
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
                  '✅ Salva Visita'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
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
              💡 <strong>Suggerimento:</strong> La data e il costo sono
              obbligatori. Compila i campi per i trattamenti e le problematiche
              solo se necessario, ma ricorda che i dettagli aiutano nel
              follow-up!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
