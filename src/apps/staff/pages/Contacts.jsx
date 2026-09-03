import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  Hero,
  HeroButton,
  Panel,
  Pill,
  SearchBar,
  SkeletonRow,
  StateTag,
  StatStrip,
} from '../components/StaffKit';
import {
  getCustomerDirectory,
  updateCustomerRelationshipStatus,
  upsertCustomerLead,
  VALID_ACQUISITION_SOURCES,
} from '../lib/database';
import { DEMO_MODE } from '../lib/demoMode';
import { getCustomerDirectoryWhatsAppUrl } from '../lib/whatsapp';

const SOURCE_LABELS = {
  manual: 'Manuale',
  whatsapp: 'WhatsApp',
  qr: 'QR pubblico',
};

const STATUS_LABELS = {
  lead: 'Lead',
  contacted: 'Contattato',
  active: 'Cliente',
  archived: 'Archiviato',
};

const STATUS_TONES = { lead: 'warning', contacted: 'neutral', active: 'success', archived: 'neutral' };

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
  const [selectedPetIds, setSelectedPetIds] = useState({});

  useEffect(() => {
    loadDirectory();
  }, []);

  const loadDirectory = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getCustomerDirectory();
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
      lead: contacts.filter((contact) => contact.status === 'lead').length,
      contacted: contacts.filter((contact) => contact.status === 'contacted').length,
      active: contacts.filter((contact) => contact.status === 'active').length,
      archived: contacts.filter((contact) => contact.status === 'archived').length,
    }),
    [contacts]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await upsertCustomerLead(form);
      setForm(INITIAL_FORM);
      setShowCreateForm(false);
      await loadDirectory();
    } catch (err) {
      setError(err.message || 'Errore creazione contatto');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (customerId, status) => {
    setError('');

    try {
      await updateCustomerRelationshipStatus(customerId, status);
      await loadDirectory();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento contatto');
    }
  };

  const handleOpenWhatsApp = async (contact) => {
    const whatsappUrl = getCustomerDirectoryWhatsAppUrl(contact);
    if (!whatsappUrl) {
      setError('Inserisci un numero di telefono per aprire WhatsApp.');
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    if (DEMO_MODE || contact.status !== 'lead') return;

    try {
      await updateCustomerRelationshipStatus(contact.id, 'contacted');
      await loadDirectory();
    } catch (err) {
      setError(err.message || 'Errore aggiornamento contatto');
    }
  };

  const handleConvertToClient = (contact) => {
    navigate('/add-client', {
      state: {
        sourceCustomerId: contact.id,
        pet_name: contact.pet_name || '',
        owner_name: contact.owner_name || '',
        phone: contact.phone || '',
        notes: contact.notes || '',
        returnTo: '/contacts',
      },
    });
  };

  const handleOpenPet = (contact) => {
    const petId = selectedPetIds[contact.id] || contact.pets[0]?.id;
    if (!petId) return;
    navigate(`/client/${petId}`);
  };

  const filters = [
    ['all', 'Tutti', counts.all],
    ['lead', 'Lead', counts.lead],
    ['contacted', 'Contattati', counts.contacted],
    ['active', 'Clienti', counts.active],
    ['archived', 'Archiviati', counts.archived],
  ];

  return (
    <div className="gh-page gh-directory-page">
      <Hero
        title="Contatti"
        subtitle="Tutti i contatti del salone, e come richiamarli."
        right={(
          <HeroButton onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? 'Chiudi form' : 'Nuovo contatto'}
          </HeroButton>
        )}
      />

      <main className="gh-page-shell gh-directory-stack">
        {error && <ErrorState title="I dati inseriti restano nel form" body={error} />}

        {showCreateForm && (
          <Panel eyebrow="Nuovo contatto" title="Aggiungi un contatto alla rubrica">
            <form onSubmit={handleSubmit} className="gh-directory-form">
              <Field label="Nome cane" value={form.pet_name} onChange={(e) => setForm((prev) => ({ ...prev, pet_name: e.target.value }))} placeholder="Es. Fido" />
              <Field label="Proprietario *" value={form.owner_name} onChange={(e) => setForm((prev) => ({ ...prev, owner_name: e.target.value }))} placeholder="Es. Luigi Rossi" required />
              <Field label="Telefono *" type="tel" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Es. +39 3331234567" required />
              <Field label="Origine" as="select" value={form.source} onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}>
                {VALID_ACQUISITION_SOURCES.map((source) => <option key={source} value={source}>{SOURCE_LABELS[source]}</option>)}
              </Field>
              <Field className="gh-directory-form__wide" label="Note" area value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Richiesta, appunto veloce o dettaglio utile" />
              <div className="gh-directory-form__wide gh-inline-actions">
                <Button staff type="submit" loading={saving}>Salva contatto</Button>
                <Button staff type="button" variant="ghost" onClick={() => { setForm(INITIAL_FORM); setShowCreateForm(false); }}>Annulla</Button>
              </div>
            </form>
          </Panel>
        )}

        <div className="gh-directory-overview">
          <Panel eyebrow="Ricerca e filtri">
            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cerca per cane, proprietario, telefono o note" />
            <div className="gh-pill-list gh-directory-filters">
              {filters.map(([key, label, count]) => <Pill key={key} count={count} pressed={activeFilter === key} onClick={() => setActiveFilter(key)}>{label}</Pill>)}
            </div>
          </Panel>
          <StatStrip items={[{ label: 'Da gestire', value: counts.lead }, { label: 'Contattati', value: counts.contacted }]} />
        </div>

        {loading ? (
          <Panel flush>{Array.from({ length: 5 }, (_, index) => <SkeletonRow key={index} />)}</Panel>
        ) : filteredContacts.length === 0 ? (
          <Panel><EmptyState title="Nessun contatto da mostrare" body="Aggiungi il primo contatto oppure cambia filtro per vedere richieste archiviate o già gestite." action={<Button staff onClick={() => setShowCreateForm(true)}>Nuovo contatto</Button>} /></Panel>
        ) : (
          <div className="gh-contact-list">
            {filteredContacts.map((contact) => {
              const selectedPet = contact.pets.find((pet) => pet.id === selectedPetIds[contact.id]) || contact.pets[0];
              return (
                <Panel
                  className="gh-contact-card"
                  title={contact.owner_name || 'Cliente senza nome'}
                  right={(contact.status !== 'active' || contact.source !== 'manual') && (
                    <div className="gh-contact-card__tags">
                      {contact.status !== 'active' && <StateTag tone={STATUS_TONES[contact.status] || 'warning'}>{STATUS_LABELS[contact.status]}</StateTag>}
                      {contact.source !== 'manual' && <span className="gh-contact-source">{SOURCE_LABELS[contact.source] || contact.source}</span>}
                    </div>
                  )}
                  key={contact.id}
                >
                  <div className="gh-contact-card__layout">
                    <div className="gh-contact-card__copy">
                      <dl className="gh-contact-facts">
                        <div><dt>Pet</dt><dd>{contact.pet_name || 'Da associare'}</dd></div>
                        {selectedPet?.breed?.trim() && <div><dt>Razza</dt><dd>{selectedPet.breed}</dd></div>}
                        <div><dt>Telefono</dt><dd className="gh-num">{contact.phone || 'Non indicato'}</dd></div>
                        <div><dt>Creato il</dt><dd className="gh-num">{new Date(contact.created_at).toLocaleDateString('it-IT')}</dd></div>
                      </dl>
                      {contact.notes && <p className="gh-contact-notes gh-pre-wrap">{contact.notes}</p>}
                    </div>
                    <div className="gh-contact-card__actions">
                      <Button staff wide variant="whatsapp" onClick={() => handleOpenWhatsApp(contact)}>Apri WhatsApp</Button>
                      {contact.pets.length === 0 && <Button staff wide onClick={() => handleConvertToClient(contact)}>Aggiungi pet</Button>}
                      {contact.pets.length > 1 && (
                        <Field label="Scegli pet" as="select" value={selectedPetIds[contact.id] || contact.pets[0].id} onChange={(event) => setSelectedPetIds((current) => ({ ...current, [contact.id]: event.target.value }))}>
                          {contact.pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                        </Field>
                      )}
                      {contact.pets.length > 0 && <Button staff wide variant="outline" onClick={() => handleOpenPet(contact)}>Apri scheda pet</Button>}
                      {contact.pets.length === 0 && contact.status !== 'contacted' && <Button staff wide variant="outline" onClick={() => handleStatusChange(contact.id, 'contacted')}>Segna contattato</Button>}
                      {contact.pets.length === 0 && contact.status !== 'lead' && <Button staff wide variant="ghost" onClick={() => handleStatusChange(contact.id, 'lead')}>Riporta a lead</Button>}
                      {contact.pets.length === 0 && contact.status !== 'archived' && <Button staff wide variant="secondary" onClick={() => handleStatusChange(contact.id, 'archived')}>Archivia</Button>}
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
