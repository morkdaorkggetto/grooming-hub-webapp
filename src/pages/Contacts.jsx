import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import {
  addContact,
  getAllContacts,
  updateContactStatus,
  VALID_CONTACT_SOURCES,
} from '../lib/database';
import { getContactWhatsAppUrl } from '../lib/whatsapp';

const SOURCE_LABELS = {
  manual: 'Manuale',
  whatsapp: 'WhatsApp',
  qr: 'QR pubblico',
};

const STATUS_LABELS = {
  new: 'Nuovo',
  contacted: 'Contattato',
  converted: 'Convertito',
  archived: 'Archiviato',
};

const STATUS_STYLES = {
  new: {
    backgroundColor: 'var(--color-warning-bg)',
    color: 'var(--color-text-primary)',
  },
  contacted: {
    backgroundColor: 'var(--color-info-bg, #EAF1F8)',
    color: 'var(--color-secondary)',
  },
  converted: {
    backgroundColor: 'var(--color-success-bg)',
    color: 'var(--color-success-text)',
  },
  archived: {
    backgroundColor: 'var(--color-surface-muted)',
    color: 'var(--color-secondary)',
  },
};

const INITIAL_FORM = {
  pet_name: '',
  owner_name: '',
  phone: '',
  source: 'whatsapp',
  notes: '',
};

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (err) {
      setError(err.message || 'Errore caricamento contatti');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesQuery =
        !query ||
        contact.pet_name?.toLowerCase().includes(query) ||
        contact.owner_name?.toLowerCase().includes(query) ||
        contact.phone?.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query);

      if (!matchesQuery) return false;
      if (activeFilter === 'all') return true;
      return contact.status === activeFilter;
    });
  }, [contacts, searchTerm, activeFilter]);

  const counts = useMemo(
    () => ({
      all: contacts.length,
      new: contacts.filter((contact) => contact.status === 'new').length,
      contacted: contacts.filter((contact) => contact.status === 'contacted').length,
      archived: contacts.filter((contact) => contact.status === 'archived').length,
    }),
    [contacts]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await addContact(form);
      setForm(INITIAL_FORM);
      setShowCreateForm(false);
      await loadContacts();
    } catch (err) {
      setError(err.message || 'Errore creazione contatto');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (contactId, status) => {
    setError('');

    try {
      await updateContactStatus(contactId, status);
      await loadContacts();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento contatto');
    }
  };

  const handleOpenWhatsApp = (contact) => {
    const whatsappUrl = getContactWhatsAppUrl(contact);
    if (!whatsappUrl) {
      setError('Inserisci un numero di telefono per aprire WhatsApp.');
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConvertToClient = (contact) => {
    navigate('/add-client', {
      state: {
        sourceContactId: contact.id,
        pet_name: contact.pet_name || '',
        owner_name: contact.owner_name || '',
        phone: contact.phone || '',
        notes: contact.notes || '',
        returnTo: '/contacts',
      },
    });
  };

  const handleOpenLinkedClient = (contact) => {
    if (!contact.linked_client_id) return;
    navigate(`/client/${contact.linked_client_id}`);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)' }} className="min-h-screen">
      <AppHeader
        title="Contatti"
        subtitle="Rubrica veloce per richieste WhatsApp, QR pubblico e nuovi contatti da registrare."
        rightContent={
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition"
            style={{
              backgroundColor: 'rgba(251, 246, 243, 0.16)',
              color: '#FBF6F3',
              border: '1px solid rgba(251, 246, 243, 0.22)',
            }}
          >
            {showCreateForm ? 'Chiudi form' : 'Nuovo contatto'}
          </button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {error ? (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p style={{ color: 'var(--color-danger-text)' }} className="font-medium">
              {error}
            </p>
          </div>
        ) : null}

        {showCreateForm ? (
          <section className="bg-white rounded-3xl shadow-lg border p-6 mb-6" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold" style={{ color: 'var(--color-secondary)' }}>
                  Nuovo contatto
                </p>
                <h2 className="text-2xl font-semibold mt-2" style={{ color: 'var(--color-text-primary)' }}>
                  Inserisci una richiesta in rubrica
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Nome cane *
                </span>
                <input
                  type="text"
                  value={form.pet_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, pet_name: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border bg-white"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="Es. Fido"
                  required
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Proprietario
                </span>
                <input
                  type="text"
                  value={form.owner_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, owner_name: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border bg-white"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="Es. Luigi Rossi"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Telefono
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border bg-white"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="Es. +39 3331234567"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Origine
                </span>
                <select
                  value={form.source}
                  onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border bg-white"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  {VALID_CONTACT_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {SOURCE_LABELS[source]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Note
                </span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border bg-white min-h-[120px]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="Richiesta, appunto veloce o dettaglio utile"
                />
              </label>

              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {saving ? 'Salvataggio...' : 'Salva contatto'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setShowCreateForm(false);
                  }}
                  className="px-5 py-3 rounded-xl font-medium border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                >
                  Annulla
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-lg border p-6" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs uppercase tracking-[0.24em] font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
              Ricerca e filtri
            </p>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 border bg-white"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              placeholder="Cerca per cane, proprietario, telefono o note"
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                ['all', 'Tutti', counts.all],
                ['new', 'Nuovi', counts.new],
                ['contacted', 'Contattati', counts.contacted],
                ['archived', 'Archiviati', counts.archived],
              ].map(([key, label, count]) => {
                const isActive = activeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition"
                    style={{
                      borderColor: isActive ? 'transparent' : 'var(--color-border)',
                      backgroundColor: isActive ? 'var(--color-primary)' : '#fffaf6',
                      color: isActive ? '#fff' : 'var(--color-secondary)',
                    }}
                  >
                    {label} · {count}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 border" style={{ backgroundColor: 'var(--color-surface-main)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs uppercase tracking-[0.24em] font-bold" style={{ color: 'var(--color-secondary)' }}>
                Da gestire
              </p>
              <p className="text-3xl font-semibold mt-3" style={{ color: 'var(--color-text-primary)' }}>
                {counts.new}
              </p>
            </div>
            <div className="rounded-3xl p-5 border" style={{ backgroundColor: 'var(--color-success-bg)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs uppercase tracking-[0.24em] font-bold" style={{ color: 'var(--color-secondary)' }}>
                Contattati
              </p>
              <p className="text-3xl font-semibold mt-3" style={{ color: 'var(--color-text-primary)' }}>
                {counts.contacted}
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-lg border p-8 text-center" style={{ borderColor: 'var(--color-border)' }}>
            <p style={{ color: 'var(--color-secondary)' }}>Caricamento contatti...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border p-8 text-center" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Nessun contatto da mostrare
            </h2>
            <p style={{ color: 'var(--color-secondary)' }}>
              Aggiungi il primo contatto oppure cambia filtro per vedere richieste archiviate o già gestite.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContacts.map((contact) => {
              const statusStyle = STATUS_STYLES[contact.status] || STATUS_STYLES.new;
              return (
                <article
                  key={contact.id}
                  className="bg-white rounded-3xl shadow-lg border p-6"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {contact.pet_name}
                        </h2>
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={statusStyle}
                        >
                          {STATUS_LABELS[contact.status]}
                        </span>
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: '#fffaf6', color: 'var(--color-secondary)' }}
                        >
                          {SOURCE_LABELS[contact.source] || contact.source}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>
                            Proprietario
                          </p>
                          <p style={{ color: 'var(--color-text-primary)' }}>
                            {contact.owner_name || 'Non indicato'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>
                            Telefono
                          </p>
                          <p style={{ color: 'var(--color-text-primary)' }}>
                            {contact.phone || 'Non indicato'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>
                            Creato il
                          </p>
                          <p style={{ color: 'var(--color-text-primary)' }}>
                            {new Date(contact.created_at).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>

                      {contact.notes ? (
                        <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-main)' }}>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-secondary)' }}>
                            {contact.notes}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full lg:w-auto lg:min-w-[240px] flex flex-col gap-3">
                      <button
                        onClick={() => handleOpenWhatsApp(contact)}
                        className="px-4 py-3 rounded-xl text-white font-semibold"
                        style={{ backgroundColor: '#16a34a' }}
                      >
                        Apri WhatsApp
                      </button>

                      {contact.status !== 'converted' ? (
                        <button
                          onClick={() => handleConvertToClient(contact)}
                          className="px-4 py-3 rounded-xl font-semibold text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          Converti in cliente
                        </button>
                      ) : null}

                      {contact.status === 'converted' && contact.linked_client_id ? (
                        <button
                          onClick={() => handleOpenLinkedClient(contact)}
                          className="px-4 py-3 rounded-xl font-medium border"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-secondary)',
                          }}
                        >
                          Apri cliente
                        </button>
                      ) : null}

                      {contact.status !== 'contacted' ? (
                        <button
                          onClick={() => handleStatusChange(contact.id, 'contacted')}
                          className="px-4 py-3 rounded-xl font-medium border"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                        >
                          Segna contattato
                        </button>
                      ) : null}

                      {contact.status !== 'new' ? (
                        <button
                          onClick={() => handleStatusChange(contact.id, 'new')}
                          className="px-4 py-3 rounded-xl font-medium border"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                        >
                          Riporta a nuovo
                        </button>
                      ) : null}

                      {contact.status !== 'archived' ? (
                        <button
                          onClick={() => handleStatusChange(contact.id, 'archived')}
                          className="px-4 py-3 rounded-xl font-medium text-white"
                          style={{ backgroundColor: 'var(--color-secondary)' }}
                        >
                          Archivia
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
