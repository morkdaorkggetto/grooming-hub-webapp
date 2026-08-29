import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../../shared/supabase/client';
import Icon from '../../../shared/ui/Icon';
import {
  AreaTile,
  Button,
  ClientRow,
  EmptyState,
  ErrorState,
  Hero,
  HeroButton,
  Panel,
  Pill,
  SearchBar,
  SkeletonRow,
  StatStrip,
} from '../components/StaffKit';
import { getAllPets, getPendingAppointmentRequests } from '../lib/database';
import { getFidelityTierSnapshot } from '../lib/fidelity';

const formatRequestTiming = (request) => {
  if (request.desired_date) {
    const desiredDate = new Date(`${request.desired_date}T12:00:00`).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
    });
    return `${desiredDate} · data desiderata`;
  }

  return new Date(request.scheduled_at).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatLastVisit = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    const filtered = clients.filter((client) => {
      const matchesSearch =
        !lowerSearch ||
        client.name.toLowerCase().includes(lowerSearch) ||
        client.breed?.toLowerCase().includes(lowerSearch) ||
        client.owner.toLowerCase().includes(lowerSearch) ||
        client.phone?.toLowerCase().includes(lowerSearch);

      if (!matchesSearch) return false;

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

  const loadClients = async () => {
    setLoading(true);
    setError('');

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const [data, requestData] = await Promise.all([
        getAllPets(),
        getPendingAppointmentRequests(),
      ]);
      setClients(data);
      setPendingRequests(requestData);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento clienti');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(`Errore logout: ${err.message}`);
    }
  };

  const totalVisits = clients.reduce((sum, client) => sum + (client.visits?.length || 0), 0);
  const blacklistedCount = clients.filter((client) => client.is_blacklisted).length;
  const reliableClients = clients.filter((client) => (client.no_show_score ?? 0) >= 1).length;
  const fidelityClients = clients.filter((client) => (client.visits?.length || 0) >= 12).length;

  const statItems = [
    {
      label: 'Clienti attivi',
      value: clients.length,
      helper: `${reliableClients} con score positivo`,
    },
    {
      label: 'Storico visite',
      value: totalVisits,
      helper: `${fidelityClients} clienti fidelizzati`,
    },
    {
      label: 'Blacklist',
      value: blacklistedCount,
      helper: blacklistedCount === 0 ? 'Nessun cliente critico' : `${blacklistedCount} da monitorare`,
      tone: 'danger',
    },
  ];

  const quickActions = [
    {
      eyebrow: 'Pianificazione',
      title: 'Calendario',
      description: 'Vista completa della settimana e gestione conflitti',
      metric: 'Settimana completa',
      icon: 'calendar',
      accent: 'var(--color-secondary)',
      onClick: () => navigate('/calendar'),
    },
    {
      eyebrow: 'Team operativo',
      title: 'Operatività oggi',
      description: 'Per gli operatori: appuntamenti del giorno e completamenti rapidi',
      metric: 'Focus giornaliero',
      icon: 'user',
      accent: 'var(--color-danger-text)',
      onClick: () => navigate('/appointments/today'),
    },
    {
      eyebrow: 'Come è andata',
      title: 'Come è andata',
      description: 'Cani passati e incassato, settimana per settimana',
      metric: 'Ultimi 7 giorni',
      icon: 'sparkle',
      accent: 'var(--color-success-text)',
      onClick: () => navigate('/reports/weekly'),
    },
    {
      eyebrow: 'Rubrica',
      title: 'Contatti',
      description: 'Richieste WhatsApp, lead da QR pubblico e contatti da seguire',
      metric: 'Nuove richieste',
      icon: 'bell',
      accent: 'var(--color-primary)',
      onClick: () => navigate('/contacts'),
    },
    {
      eyebrow: 'Area cliente',
      title: 'Richieste clienti',
      description: 'Appuntamenti richiesti dal portale e prossimi flussi cliente',
      metric: `${pendingRequests.length} da gestire`,
      icon: 'paw',
      accent: 'var(--color-warning-text)',
      onClick: () => navigate('/requests'),
    },
  ];

  const quickFilters = [
    { key: 'all', label: 'Tutti', count: clients.length },
    { key: 'reliable', label: 'Affidabili', count: reliableClients },
    { key: 'fidelity', label: 'Fidelity', count: fidelityClients },
    { key: 'blacklist', label: 'Blacklist', count: blacklistedCount },
  ];

  const clientRows = useMemo(
    () =>
      filteredClients.map((client) => {
        const fidelity = getFidelityTierSnapshot(client);
        const score = client.no_show_score ?? 0;
        return {
          client,
          tier: fidelity.currentTier?.key || 'base',
          state: client.is_blacklisted ? 'Blacklist' : score < 0 ? 'A rischio' : 'Attivo',
          visitsText: `${client.visits?.length || 0} visite`,
          lastVisit: formatLastVisit(client.last_visit_at),
        };
      }),
    [filteredClients]
  );

  const heroRight = (
    <>
      {user?.email && <span className="gh-hero__account">{user.email}</span>}
      <HeroButton aria-label="Esci" title="Esci" onClick={handleLogout}>
        <Icon name="logout" size={14} />
        <span className="gh-dashboard-logout-label">Esci</span>
      </HeroButton>
    </>
  );

  if (loading) {
    return (
      <div className="gh-page">
        <Hero title="Dashboard clienti" subtitle="Ricerca, clienti, aree operative e dati chiave." />
        <main className="gh-page-shell gh-dashboard-stack" aria-busy="true">
          <Panel eyebrow="Archivio clienti" title="Caricamento clienti" flush>
            {Array.from({ length: 7 }, (_, index) => <SkeletonRow key={index} />)}
          </Panel>
        </main>
      </div>
    );
  }

  return (
    <div className="gh-page">
      <Hero
        title="Dashboard clienti"
        subtitle="Ricerca, clienti, aree operative e dati chiave."
        right={heroRight}
      />

      <main className="gh-page-shell gh-dashboard-stack">
        {error && (
          <ErrorState
            title="Non riesco ad aggiornare la dashboard"
            body={`${error}. I dati già visibili restano nella pagina.`}
            action={
              <Button staff variant="danger" onClick={loadClients} className="gh-error-state__action">
                Riprova
              </Button>
            }
          />
        )}

        {pendingRequests.length > 0 && (
          <Panel
            className="gh-dashboard-pending"
            eyebrow="Richieste appuntamento"
            title={
              pendingRequests.length === 1
                ? '1 richiesta cliente da confermare'
                : `${pendingRequests.length} richieste cliente da confermare`
            }
            right={
              <div className="gh-dashboard-pending__actions">
                <Button staff variant="secondary" onClick={() => navigate('/requests')}>
                  Gestisci richieste
                </Button>
                <Button staff variant="outline" onClick={() => navigate('/calendar')}>
                  Vedi calendario
                </Button>
              </div>
            }
          >
            <div className="gh-dashboard-pending__items">
              {pendingRequests.slice(0, 3).map((request) => (
                <span className="gh-dashboard-pending__item gh-num" key={request.id}>
                  {request.client?.name || 'Cliente'} · {formatRequestTiming(request)}
                </span>
              ))}
            </div>
          </Panel>
        )}

        <div className="gh-dashboard-overview">
          <Panel eyebrow="Ricerca e panoramica" title="Trova subito il cliente giusto">
            <SearchBar
              aria-label="Cerca clienti"
              placeholder="Cerca per nome, razza, proprietario o telefono..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <div className="gh-pill-list gh-dashboard-filters">
              {quickFilters.map((filter) => (
                <Pill
                  key={filter.key}
                  count={filter.count}
                  pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </Pill>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Stato generale" title="Il salone in tre numeri">
            <StatStrip items={statItems} />
          </Panel>
        </div>

        <section>
          <div className="gh-dashboard-section-head">
            <div>
              <p className="gh-eyebrow--staff">Aree operative</p>
              <h2 className="gh-area-title">Accessi rapidi</h2>
            </div>
            <Button staff variant="primary" icon="plus" onClick={() => navigate('/add-client')}>
              Nuovo Cliente
            </Button>
          </div>
          <div className="gh-tile-grid">
            {quickActions.map((action) => (
              <AreaTile key={action.title} {...action} />
            ))}
          </div>
        </section>

        <Panel
          eyebrow="Clienti"
          title="Archivio clienti"
          flush
          right={<span className="gh-meta gh-num">{filteredClients.length} risultati visualizzati</span>}
        >
          {filteredClients.length === 0 ? (
            <EmptyState
              title={searchTerm ? 'Nessun cliente trovato' : 'Nessun cliente ancora'}
              body={
                searchTerm
                  ? 'Modifica la ricerca o scegli un altro filtro per ritrovare la scheda.'
                  : 'Crea la prima scheda cliente: da lì potrai registrare visite e appuntamenti.'
              }
              action={
                !searchTerm && (
                  <Button staff variant="primary" icon="plus" onClick={() => navigate('/add-client')}>
                    Aggiungi Primo Cliente
                  </Button>
                )
              }
            />
          ) : (
            <div>
              <div className="gh-client-head" aria-hidden="true">
                <span>Cane</span>
                <span>Proprietario</span>
                <span>Telefono</span>
                <span>Visite</span>
                <span>Ultima</span>
                <span />
              </div>
              {clientRows.map((row) => (
                <ClientRow
                  key={row.client.id}
                  {...row}
                  onClick={() => navigate(`/client/${row.client.id}`)}
                />
              ))}
            </div>
          )}
        </Panel>
      </main>

    </div>
  );
}
