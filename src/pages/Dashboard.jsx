import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClients } from '../lib/database';
import { getCurrentUser, logout } from '../lib/supabaseClient';
import AppHeader from '../components/AppHeader';
import ClientCard from '../components/ClientCard';

/**
 * Dashboard — Pagina principale
 * Mostra lista clienti, ricerca, filtri, navigazione
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
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
   * Filtra clienti in base al search term e ai filtri rapidi
   */
  useEffect(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    const filtered = clients.filter((client) => {
      const matchesSearch =
        !lowerSearch ||
        client.name.toLowerCase().includes(lowerSearch) ||
        client.breed?.toLowerCase().includes(lowerSearch) ||
        client.owner.toLowerCase().includes(lowerSearch) ||
        client.phone?.toLowerCase().includes(lowerSearch);

      if (!matchesSearch) {
        return false;
      }

      switch (activeFilter) {
        case 'reliable':
          return (client.no_show_score ?? 0) >= 1;
        case 'fidelity':
          return (client.visits?.length || 0) >= 12;
        case 'blacklist':
          return Boolean(client.is_blacklisted);
        default:
          return true;
      }
    });

    setFilteredClients(filtered);
  }, [searchTerm, activeFilter, clients]);

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

  const handleOpenContacts = () => {
    navigate('/contacts');
  };

  const totalVisits = clients.reduce(
    (sum, client) => sum + (client.visits?.length || 0),
    0
  );
  const blacklistedCount = clients.filter((client) => client.is_blacklisted).length;
  const reliableClients = clients.filter((client) => (client.no_show_score ?? 0) >= 1).length;
  const fidelityClients = clients.filter((client) => (client.visits?.length || 0) >= 12).length;

  const statCards = [
    {
      label: 'Clienti attivi',
      value: clients.length,
      helper: `${reliableClients} con score positivo`,
      accent: 'var(--color-primary)',
      background: 'var(--color-surface-main)',
    },
    {
      label: 'Storico visite',
      value: totalVisits,
      helper: `${fidelityClients} clienti fidelizzati`,
      accent: 'var(--color-secondary)',
      background: 'var(--color-surface-main)',
    },
    {
      label: 'Blacklist',
      value: blacklistedCount,
      helper:
        blacklistedCount === 0
          ? 'Nessun cliente critico'
          : `${blacklistedCount} da monitorare`,
      accent: 'var(--color-danger-text)',
      background: 'var(--color-danger-bg)',
    },
  ];

  const quickActions = [
    {
      eyebrow: 'Pianificazione',
      title: 'Calendario',
      description: 'Vista completa della settimana e gestione conflitti',
      actionLabel: 'Apri calendario',
      metric: 'Settimana completa',
      onClick: handleOpenCalendar,
      accent: 'var(--color-secondary)',
      surface: 'var(--color-surface-main)',
    },
    {
      eyebrow: 'Team operativo',
      title: 'Operatività oggi',
      description: 'Per gli operatori: appuntamenti del giorno e completamenti rapidi',
      actionLabel: 'Apri operatività',
      metric: 'Focus giornaliero',
      onClick: handleOpenDailyAppointments,
      accent: 'var(--color-danger-text)',
      surface: 'var(--color-danger-bg)',
    },
    {
      eyebrow: 'Controllo business',
      title: 'Report incassi',
      description: 'KPI settimanali, grafico e dettaglio delle visite',
      actionLabel: 'Apri report',
      metric: 'Ultimi 7 giorni',
      onClick: handleOpenWeeklyReport,
      accent: 'var(--color-success-text)',
      surface: 'var(--color-success-bg)',
    },
    {
      eyebrow: 'Rubrica',
      title: 'Contatti',
      description: 'Richieste WhatsApp, lead da QR pubblico e contatti da seguire',
      actionLabel: 'Apri contatti',
      metric: 'Nuove richieste',
      onClick: handleOpenContacts,
      accent: 'var(--color-primary)',
      surface: 'var(--color-surface-soft)',
    },
  ];

  const quickFilters = [
    { key: 'all', label: 'Tutti', count: clients.length },
    { key: 'reliable', label: 'Affidabili', count: reliableClients },
    { key: 'fidelity', label: 'Fidelity', count: fidelityClients },
    { key: 'blacklist', label: 'Blacklist', count: blacklistedCount },
  ];

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
      <AppHeader
        title="Dashboard clienti"
        subtitle="Ricerca, clienti, aree operative e dati chiave."
        rightContent={
          <div className="flex flex-col gap-3 items-end">
            {user && (
              <div className="px-4 py-3 rounded-2xl bg-white/12 border border-white/20 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/60 mb-1">
                  Account attivo
                </p>
                <p className="text-sm text-white font-medium">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium transition"
              style={{
                backgroundColor: 'rgba(251, 246, 243, 0.16)',
                color: '#FBF6F3',
                border: '1px solid rgba(251, 246, 243, 0.22)',
              }}
            >
              Esci
            </button>
          </div>
        }
      />

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
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div
              className="rounded-[28px] border p-6 shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface-main)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.22em] font-semibold mb-3"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Ricerca e panoramica
              </p>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Trova subito il cliente giusto
              </h2>
              <p
                className="text-sm mb-5 max-w-xl"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Cerca per nome, razza o proprietario. La dashboard mette in primo piano
                ciò che serve davvero, senza sovraccaricare la lettura.
              </p>
              <input
                type="text"
                placeholder="Cerca per nome, razza, proprietario o telefono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border focus:outline-none transition"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-main)',
                }}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {quickFilters.map((filter) => {
                  const isActive = activeFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition"
                      style={{
                        backgroundColor: isActive
                          ? 'var(--color-primary)'
                          : 'var(--color-surface-soft)',
                        color: isActive ? '#FBF6F3' : 'var(--color-text-primary)',
                        border: `1px solid ${
                          isActive ? 'var(--color-primary)' : 'var(--color-border)'
                        }`,
                      }}
                    >
                      <span>{filter.label}</span>
                      <span
                        className="inline-flex min-w-6 h-6 items-center justify-center rounded-full px-1.5 text-xs"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(251, 246, 243, 0.18)'
                            : 'var(--color-bg-main)',
                          color: isActive ? '#FBF6F3' : 'var(--color-text-secondary)',
                        }}
                      >
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-[28px] border p-6 shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface-soft)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.22em] font-semibold mb-3"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Stato generale
              </p>
              <div className="space-y-4">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border px-4 py-4"
                    style={{
                      backgroundColor: card.background,
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {card.label}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <p
                        className="text-3xl font-bold"
                        style={{ color: card.accent }}
                      >
                        {card.value}
                      </p>
                      <p
                        className="text-xs text-right"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {card.helper}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div>
              <p
                className="text-xs uppercase tracking-[0.22em] font-semibold mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Aree operative
              </p>
              <h2
                className="text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Accessi rapidi
              </h2>
            </div>
            <button
              onClick={handleAddClient}
              className="px-6 py-3 rounded-2xl font-bold text-white transition"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              + Nuovo Cliente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className="text-left rounded-[26px] border p-6 shadow-sm transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: action.surface,
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="flex items-start justify-between gap-4 mb-5"
                >
                  <div
                    className="w-12 h-12 rounded-2xl"
                    style={{ backgroundColor: action.accent, opacity: 0.14 }}
                  />
                  <span
                    className="text-[11px] uppercase tracking-[0.2em] font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {action.eyebrow}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {action.title}
                </h3>
                <p
                  className="text-sm leading-6 mb-5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {action.description}
                </p>
                <div className="flex items-center justify-between gap-3 mt-auto">
                  <span
                    className="text-xs uppercase tracking-[0.18em] font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {action.metric}
                  </span>
                  <span
                    className="inline-flex px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: action.accent, color: '#FBF6F3' }}
                  >
                    {action.actionLabel}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
            <div>
              <p
                className="text-xs uppercase tracking-[0.22em] font-semibold mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Clienti
              </p>
              <h2
                className="text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Archivio clienti
              </h2>
            </div>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {filteredClients.length} risultati visualizzati
            </p>
          </div>

        {/* Lista clienti */}
        {filteredClients.length === 0 ? (
          <div
            className="text-center py-14 px-6 rounded-[28px] border"
            style={{
              backgroundColor: 'var(--color-surface-main)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="text-6xl mb-4">🐕</div>
            <p
              style={{ color: 'var(--color-text-primary)' }}
              className="text-lg font-medium mb-2"
            >
              {searchTerm ? 'Nessun cliente trovato' : 'Nessun cliente ancora'}
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-6">
              {searchTerm
                ? 'Prova a modificare i parametri di ricerca'
                : 'Aggiungi il tuo primo cliente per iniziare'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddClient}
                className="inline-block px-6 py-3 rounded-2xl font-bold text-white transition duration-200"
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
                className="cursor-pointer transition duration-200 hover:-translate-y-1"
                onClick={() => handleClientClick(client.id)}
              >
                <ClientCard client={client} />
              </div>
            ))}
          </div>
        )}
        </section>
      </main>
    </div>
  );
}
