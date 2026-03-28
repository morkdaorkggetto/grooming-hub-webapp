import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClients } from '../lib/database';
import { getCurrentUser, logout } from '../lib/supabaseClient';
import ClientCard from '../components/ClientCard';
import { DEMO_MODE, DEMO_WRITE_BLOCK_MESSAGE } from '../lib/demoMode';

/**
 * Dashboard — Pagina principale
 * Mostra lista clienti, ricerca, filtri, navigazione
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  /**
   * Carica clienti all'avvio e ogni volta che torna a questa pagina
   */
  useEffect(() => {
    loadClients();
  }, []);

  /**
   * Filtra clienti in base al search term
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(lowerSearch) ||
          client.breed?.toLowerCase().includes(lowerSearch) ||
          client.owner.toLowerCase().includes(lowerSearch)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  /**
   * Carica i clienti dall'API
   */
  const loadClients = async () => {
    setLoading(true);
    setError('');

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const data = await getAllClients();
      setClients(data);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento clienti');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(`Errore logout: ${err.message}`);
    }
  };

  /**
   * Naviga al dettaglio di un cliente
   */
  const handleClientClick = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  /**
   * Naviga al form aggiunta cliente
   */
  const handleAddClient = () => {
    navigate('/add-client');
  };

  const handleOpenCalendar = () => {
    navigate('/calendar');
  };

  const handleOpenWeeklyReport = () => {
    navigate('/reports/weekly');
  };

  const handleOpenDailyAppointments = () => {
    navigate('/appointments/today');
  };

  // Stato di caricamento
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
          <p style={{ color: 'var(--color-secondary)' }}>Caricamento clienti...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)' }} className="min-h-screen">
      {/* Header */}
      <header
        style={{ backgroundColor: 'var(--color-primary)' }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                🐕 Grooming Hub
              </h1>
              <p className="text-sm text-white text-opacity-80">
                {clients.length} {clients.length === 1 ? 'cliente' : 'clienti'}
              </p>
              <p className="text-xs text-white text-opacity-80 mt-1">
                Blacklist: {clients.filter((client) => client.is_blacklisted).length}
              </p>
            </div>

            {/* User Info + Logout */}
            <div className="text-right">
              {user && (
                <p className="text-sm text-white text-opacity-90 mb-2">
                  {user.email}
                </p>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Errore */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p style={{ color: 'var(--color-danger-text)' }} className="font-medium">
              {error}
            </p>
            <button
              onClick={loadClients}
              className="mt-2 text-sm underline"
              style={{ color: 'var(--color-danger-text)' }}
            >
              Riprova
            </button>
          </div>
        )}

        {/* Search + Add button */}
        {DEMO_MODE && (
          <div
            className="mb-6 p-4 rounded-xl border"
            style={{ backgroundColor: 'var(--color-warning-bg)', borderColor: 'var(--color-warning-border)', color: 'var(--color-warning-text)' }}
          >
            <p className="font-medium text-sm">
              Demo in sola lettura: puoi esplorare clienti, QR card, fidelity e calendario, ma non creare o modificare dati.
            </p>
          </div>
        )}

        {/* Search + Add button */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Barra ricerca */}
          <input
            type="text"
            placeholder="Cerca cliente per nome, razza, proprietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              backgroundColor: '#ffffff',
            }}
          />

          <button
            onClick={handleOpenCalendar}
            className="px-6 py-3 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 whitespace-nowrap"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            📅 Calendario
          </button>

          <button
            onClick={handleOpenDailyAppointments}
            className="px-6 py-3 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 whitespace-nowrap"
            style={{ backgroundColor: '#b91c1c' }}
          >
            🔴 Operatività Oggi
          </button>

          <button
            onClick={handleOpenWeeklyReport}
            className="px-6 py-3 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 whitespace-nowrap"
            style={{ backgroundColor: 'var(--color-success-text)' }}
          >
            💶 Report Incassi
          </button>

          {/* Pulsante Aggiungi */}
          <button
            onClick={handleAddClient}
            disabled={DEMO_MODE}
            title={DEMO_MODE ? DEMO_WRITE_BLOCK_MESSAGE : 'Aggiungi un nuovo cliente'}
            className="px-6 py-3 rounded-lg font-bold text-white transition duration-200 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            + Nuovo Cliente
          </button>
        </div>

        {/* Lista clienti */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐕</div>
            <p
              style={{ color: 'var(--color-secondary)' }}
              className="text-lg font-medium mb-2"
            >
              {searchTerm ? 'Nessun cliente trovato' : 'Nessun cliente ancora'}
            </p>
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm mb-6">
              {searchTerm
                ? 'Prova a modificare i parametri di ricerca'
                : 'Aggiungi il tuo primo cliente per iniziare'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddClient}
                disabled={DEMO_MODE}
                title={DEMO_MODE ? DEMO_WRITE_BLOCK_MESSAGE : 'Aggiungi il primo cliente'}
                className="inline-block px-6 py-3 rounded-lg font-bold text-white transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Aggiungi Primo Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="cursor-pointer transform transition duration-200 hover:scale-105"
                onClick={() => handleClientClick(client.id)}
              >
                <ClientCard client={client} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
