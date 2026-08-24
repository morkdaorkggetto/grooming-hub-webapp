import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { useUnsavedChanges } from '../../../shared/navigation/UnsavedChangesProvider';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';
import { usePet } from '../hooks/usePet';
import { usePetVisits } from '../hooks/usePetVisits';
import { removePetPhoto, resizePetPhoto, uploadPetPhoto } from '../lib/petPhoto';
import './Pet.css';

const DATE_FORMAT = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const VISIT_MONTH_FORMAT = new Intl.DateTimeFormat('it-IT', {
  month: 'short',
  year: '2-digit',
});
const UNSAVED_MESSAGE = 'Hai modifiche non salvate. Vuoi davvero lasciare la scheda?';

function formatSpecies(species) {
  const labels = { dog: 'Cane', cat: 'Gatto' };
  return labels[species] || species || 'Specie non indicata';
}

function formatSex(sex) {
  if (sex === 'm') return 'Maschio';
  if (sex === 'f') return 'Femmina';
  return 'Non indicato';
}

function formatBoolean(value) {
  if (value === true) return 'Sì';
  if (value === false) return 'No';
  return 'Non indicato';
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) years -= 1;
  return years === 1 ? '1 anno' : `${Math.max(0, years)} anni`;
}

function formatCoatPreferences(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined && item !== '')
      .map(([key, item]) => `${key.replaceAll('_', ' ')}: ${String(item)}`)
      .join('\n');
  }
  return String(value);
}

function draftFromPet(pet) {
  return {
    ownerNotes: pet?.owner_notes || '',
    coatPreferences: formatCoatPreferences(pet?.coat_preferences),
    photoUrl: pet?.photo_url || '',
  };
}

function PetAvatar({ pet, previewUrl }) {
  const source = previewUrl || pet.photo_url;
  if (source) {
    return <img src={source} alt={`Foto di ${pet.name}`} className="gh-pet-avatar" />;
  }

  return (
    <div aria-label={`Nessuna foto per ${pet.name}`} className="gh-pet-avatar gh-pet-avatar--empty">
      {(pet.name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function DataField({ label, value }) {
  return (
    <div className="gh-pet-data-field">
      <div className="gh-pet-data-label">{label}</div>
      <div className="gh-pet-data-value">{value || 'Non indicato'}</div>
    </div>
  );
}

function SectionHeading({ title, editingLocked, onEdit }) {
  return (
    <div className="gh-pet-section-heading">
      <h2>{title}</h2>
      {!editingLocked && onEdit && (
        <button type="button" className="gh-pet-text-action" onClick={onEdit}>
          <Icon name="pencil" size={14} />
          Modifica
        </button>
      )}
    </div>
  );
}

function EditActions({ saving, dirty, onCancel, onSave }) {
  return (
    <div className="gh-pet-edit-actions">
      <button type="button" className="gh-pet-action gh-pet-action--ghost" onClick={onCancel} disabled={saving}>
        Annulla
      </button>
      <button type="button" className="gh-pet-action gh-pet-action--primary" onClick={onSave} disabled={saving || !dirty}>
        {saving ? 'Salvataggio...' : (
          <>
            <Icon name="check" size={16} />
            Salva
          </>
        )}
      </button>
    </div>
  );
}

function EditableTextSection({
  title,
  value,
  emptyText,
  active,
  editingLocked,
  saving,
  dirty,
  onEdit,
  onChange,
  onCancel,
  onSave,
}) {
  return (
    <section className="gh-pet-section">
      <SectionHeading title={title} editingLocked={editingLocked || active} onEdit={onEdit} />
      {active ? (
        <>
          <textarea
            aria-label={title}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={5}
            className="gh-pet-textarea"
            disabled={saving}
          />
          <EditActions saving={saving} dirty={dirty} onCancel={onCancel} onSave={onSave} />
        </>
      ) : (
        <p className={`gh-pet-section-copy${value ? '' : ' gh-pet-section-copy--empty'}`}>
          {value || emptyText}
        </p>
      )}
    </section>
  );
}

function VisitRow({ visit, isLast }) {
  const date = new Date(`${visit.date}T00:00:00`);
  const validDate = !Number.isNaN(date.getTime());

  return (
    <div className={`gh-pet-visit${isLast ? ' gh-pet-visit--last' : ''}`}>
      <time className="gh-pet-visit-date" dateTime={visit.date}>
        <span className="gh-pet-visit-day">{validDate ? date.getDate() : '--'}</span>
        <span className="gh-pet-visit-month">
          {validDate ? VISIT_MONTH_FORMAT.format(date).replace('.', '') : visit.date}
        </span>
      </time>
      <div className="gh-pet-visit-copy">
        <div className="gh-pet-visit-service">{visit.treatments || 'Trattamento non indicato'}</div>
        {visit.issues && <div className="gh-pet-visit-note">{visit.issues}</div>}
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <main className="gh-pet-page">
      <BackgroundDecor />
      <div className="gh-pet-shell gh-pet-shell--loading">
        <Skeleton width={150} height={14} />
        <div className="gh-pet-loading-hero">
          <Skeleton width={140} height={140} style={{ borderRadius: 'var(--r-lg)' }} />
          <div className="gh-pet-loading-copy">
            <Skeleton width="35%" height={13} />
            <Skeleton width="55%" height={56} />
            <Skeleton width="70%" height={16} />
          </div>
        </div>
        <div className="gh-pet-loading-grid">
          <Skeleton height={280} />
          <Skeleton height={280} />
        </div>
      </div>
    </main>
  );
}

function MessagePage({ title, body, onRetry }) {
  return (
    <main className="gh-pet-page gh-pet-page--message">
      <BackgroundDecor />
      <section className="gh-pet-message-card">
        <Eyebrow>Scheda pet</Eyebrow>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="gh-pet-message-actions">
          {onRetry && <button type="button" className="gh-pet-action gh-pet-action--primary" onClick={onRetry}>Riprova</button>}
          <Link to="/u/home" className="gh-pet-action gh-pet-action--ghost">Torna alla home</Link>
        </div>
      </section>
    </main>
  );
}

export default function Pet() {
  const { loading: authLoading } = useRequireCustomer();
  const { petId } = useParams();
  const { tenantId } = useTenant();
  const { data: pet, loading, error, refetch, updatePet } = usePet(petId);
  const { data: visits, loading: visitsLoading, error: visitsError, refetch: refetchVisits } = usePetVisits(petId);
  const [mode, setMode] = useState('viewing');
  const [activeSection, setActiveSection] = useState(null);
  const [draft, setDraft] = useState(draftFromPet(null));
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (pet && mode !== 'editing' && mode !== 'saving') setDraft(draftFromPet(pet));
  }, [pet, mode]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const originalDraft = useMemo(() => draftFromPet(pet), [pet]);
  const isDirty =
    mode === 'editing' &&
    (draft.ownerNotes !== originalDraft.ownerNotes ||
      draft.coatPreferences !== originalDraft.coatPreferences ||
      draft.photoUrl !== originalDraft.photoUrl ||
      Boolean(pendingPhoto));
  const editing = mode === 'editing' || mode === 'saving';
  const saving = mode === 'saving';
  const confirmNavigation = useUnsavedChanges(isDirty || saving, UNSAVED_MESSAGE);

  const beginEditing = (section) => {
    setDraft(draftFromPet(pet));
    setSaveError(null);
    setActiveSection(section);
    setMode('editing');
  };

  const cancelEditing = () => {
    if (isDirty && !window.confirm('Annullare le modifiche non salvate?')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingPhoto(null);
    setDraft(draftFromPet(pet));
    setSaveError(null);
    setActiveSection(null);
    setMode('viewing');
  };

  const beginPhotoEditing = () => {
    if (editing && activeSection !== 'photo') return;
    if (!editing) beginEditing('photo');
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPhotoBusy(true);
    setSaveError(null);
    try {
      const resized = await resizePetPhoto(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPendingPhoto(resized);
      setPreviewUrl(URL.createObjectURL(resized));
    } catch (photoError) {
      setSaveError(photoError.message);
    } finally {
      setPhotoBusy(false);
    }
  };

  const saveChanges = async () => {
    if (photoBusy || !isDirty) return;
    setMode('saving');
    setSaveError(null);
    let uploadedPath = null;

    try {
      let photoUrl = draft.photoUrl || null;
      if (pendingPhoto) {
        const uploaded = await uploadPetPhoto({ file: pendingPhoto, tenantId, petId });
        uploadedPath = uploaded.path;
        photoUrl = uploaded.publicUrl;
      }

      const updated = await updatePet({
        owner_notes: draft.ownerNotes.trim() || null,
        coat_preferences: draft.coatPreferences.trim() || null,
        photo_url: photoUrl,
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingPhoto(null);
      setDraft(draftFromPet(updated));
      setActiveSection(null);
      setMode('saved');
    } catch (updateError) {
      if (uploadedPath) await removePetPhoto(uploadedPath);
      setSaveError(updateError.message || 'Non e stato possibile salvare le modifiche.');
      setMode('editing');
    }
  };

  if (authLoading || loading) return <LoadingPage />;
  if (error) {
    return <MessagePage title="Non riusciamo a caricare la scheda" body={error.message} onRetry={refetch} />;
  }
  if (!pet) {
    return <MessagePage title="Pet non trovato o accesso negato" body="La scheda richiesta non e disponibile per questo account." />;
  }

  const age = calculateAge(pet.birth_date);
  const heroMeta = [formatSpecies(pet.species), pet.breed, age].filter(Boolean).join(' · ');

  return (
    <main className="gh-pet-page">
      <BackgroundDecor />
      <div className="gh-pet-shell">
        <Link
          to="/u/home"
          onClick={(event) => {
            if (!confirmNavigation()) event.preventDefault();
          }}
          className="gh-pet-back-link"
        >
          <Icon name="chevron" size={14} />
          I tuoi pet
        </Link>

        <header className="gh-pet-hero">
          <div className="gh-pet-avatar-wrap">
            <PetAvatar pet={pet} previewUrl={previewUrl} />
            <button
              type="button"
              onClick={beginPhotoEditing}
              disabled={photoBusy || saving || (editing && activeSection !== 'photo')}
              aria-label={`Cambia la foto di ${pet.name}`}
              title="Cambia foto"
              className="gh-pet-photo-button"
            >
              <Icon name="camera" size={17} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="gh-pet-file-input"
            />
          </div>

          <div className="gh-pet-hero-copy">
            <Eyebrow>Scheda pet</Eyebrow>
            <h1>{pet.name}</h1>
            <p>{heroMeta}</p>
            {activeSection === 'photo' && (
              <div className="gh-pet-photo-edit">
                <button type="button" className="gh-pet-text-action" onClick={beginPhotoEditing} disabled={photoBusy || saving}>
                  <Icon name="camera" size={15} />
                  {photoBusy ? 'Preparazione foto...' : 'Scegli una foto'}
                </button>
                <EditActions saving={saving} dirty={isDirty} onCancel={cancelEditing} onSave={saveChanges} />
              </div>
            )}
          </div>
        </header>

        <div className="gh-pet-feedback" aria-live="polite">
          {mode === 'saved' && (
            <span className="gh-pet-feedback-message gh-pet-feedback-message--success">
              <Icon name="check" size={15} />
              Modifiche salvate
            </span>
          )}
          {saveError && <span className="gh-pet-feedback-message gh-pet-feedback-message--error">{saveError}</span>}
        </div>

        <div className="gh-pet-layout">
          <div className="gh-pet-content">
            <section className="gh-pet-section gh-pet-section--first">
              <SectionHeading title="Anagrafica" editingLocked />
              <div className="gh-pet-data-grid">
                <DataField label="Data di nascita" value={pet.birth_date ? DATE_FORMAT.format(new Date(`${pet.birth_date}T00:00:00`)) : null} />
                <DataField label="Sesso" value={formatSex(pet.sex)} />
                <DataField label="Microchip" value={pet.microchip} />
                <DataField label="Peso" value={pet.weight_kg !== null ? `${Number(pet.weight_kg).toLocaleString('it-IT')} kg` : null} />
                <DataField label="Colore" value={pet.color} />
                <DataField label="Sterilizzato" value={formatBoolean(pet.neutered)} />
              </div>
              <p className="gh-pet-readonly-note">Questi dati sono gestiti dal salone.</p>
            </section>

            <EditableTextSection
              title="Preferenze di toelettatura"
              value={draft.coatPreferences}
              emptyText="Nessuna preferenza indicata."
              active={activeSection === 'coat'}
              editingLocked={editing}
              saving={saving}
              dirty={isDirty}
              onEdit={() => beginEditing('coat')}
              onChange={(coatPreferences) => setDraft((current) => ({ ...current, coatPreferences }))}
              onCancel={cancelEditing}
              onSave={saveChanges}
            />

            <EditableTextSection
              title="Note del proprietario"
              value={draft.ownerNotes}
              emptyText="Nessuna nota del proprietario."
              active={activeSection === 'notes'}
              editingLocked={editing}
              saving={saving}
              dirty={isDirty}
              onEdit={() => beginEditing('notes')}
              onChange={(ownerNotes) => setDraft((current) => ({ ...current, ownerNotes }))}
              onCancel={cancelEditing}
              onSave={saveChanges}
            />

            <section className="gh-pet-section">
              <div className="gh-pet-section-heading">
                <h2>Le sue visite</h2>
                {!visitsLoading && !visitsError && (
                  <span className="gh-pet-visit-count">
                    {visits.length} {visits.length === 1 ? 'visita' : 'visite'}
                  </span>
                )}
              </div>

              {visitsLoading ? (
                <div className="gh-pet-visit-loading">
                  <Skeleton height={62} />
                  <Skeleton height={62} />
                </div>
              ) : visitsError ? (
                <div className="gh-pet-visits-error">
                  <p>Non e stato possibile caricare lo storico.</p>
                  <button type="button" className="gh-pet-action gh-pet-action--ghost" onClick={refetchVisits}>Riprova</button>
                </div>
              ) : visits.length === 0 ? (
                <p className="gh-pet-section-copy gh-pet-section-copy--empty">Nessuna visita registrata.</p>
              ) : (
                <div className="gh-pet-visits">
                  {visits.map((visit, index) => (
                    <VisitRow key={visit.id} visit={visit} isLast={index === visits.length - 1} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="gh-pet-booking-sidebar">
            <Link to={`/u/book?petId=${pet.id}`} className="gh-pet-booking-link">
              <Icon name="clock" size={17} />
              Prenota per {pet.name}
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
