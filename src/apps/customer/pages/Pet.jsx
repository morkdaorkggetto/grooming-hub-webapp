import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { useUnsavedChanges } from '../../../shared/navigation/UnsavedChangesProvider';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';
import { usePet } from '../hooks/usePet';
import { usePetVisits } from '../hooks/usePetVisits';
import {
  ownerPetPhotoPathFromUrl,
  removePetPhoto,
  resizePetPhoto,
  uploadOwnerPetPhoto,
} from '../lib/petPhoto';
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
  };
}

function DualPetMedallion({ pet, swapped, onSwap }) {
  const ownerPhoto = pet.owner_photo_url || null;
  const salonPhoto = pet.photo_url || null;
  const hasBoth = Boolean(ownerPhoto && salonPhoto);
  const defaultMain = ownerPhoto || salonPhoto;
  const defaultSide = hasBoth ? salonPhoto : null;
  const main = swapped && hasBoth ? defaultSide : defaultMain;
  const side = swapped && hasBoth ? defaultMain : defaultSide;

  return (
    <div className="gh-pet-medallion">
      <div className="gh-pet-medallion__main">
        {main ? (
          <img src={main} alt={`Foto di ${pet.name}`} />
        ) : (
          <span aria-label={`Nessuna foto per ${pet.name}`}>
            {(pet.name || '?').charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {side && (
        <button
          type="button"
          className="gh-pet-medallion__side"
          onClick={onSwap}
          aria-label="Scambia le due foto"
          title="Scambia le due foto"
        >
          <img src={side} alt="" />
        </button>
      )}
    </div>
  );
}

const RELATIVE_DATE_FORMAT = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });

function relativeVisitDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const days = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (Math.abs(days) < 31) return RELATIVE_DATE_FORMAT.format(days, 'day');
  const months = Math.round(days / 30.44);
  if (Math.abs(months) < 12) return RELATIVE_DATE_FORMAT.format(months, 'month');
  return RELATIVE_DATE_FORMAT.format(Math.round(months / 12), 'year');
}

function AlbumSheet({ pet, photos, selected, onSelect, onClose }) {
  const active = selected ? photos.find((photo) => photo.id === selected) : null;
  const onePhoto = photos.length === 1;

  const sharePhoto = async () => {
    if (!active) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${pet.name} dopo il bagno`, url: active.photo_url });
      } catch (error) {
        if (error?.name !== 'AbortError') window.open(active.photo_url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    window.open(active.photo_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="gh-pet-album-scrim" role="presentation" onMouseDown={onClose}>
      <section
        className="gh-pet-album-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-album-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="gh-pet-album-sheet__head">
          <div>
            <Eyebrow>Dopo il bagno</Eyebrow>
            <h2 id="pet-album-title">
              {active ? `${pet.name}, quella volta` : onePhoto ? `${pet.name}, l’ultima volta` : `${pet.name} da noi`}
            </h2>
          </div>
          <button type="button" className="gh-pet-album-close" onClick={onClose} aria-label="Chiudi album">×</button>
        </header>

        <div className="gh-pet-album-sheet__body">
          {active ? (
            <div className="gh-pet-album-opened">
              <img src={active.photo_url} alt={`${pet.name} dopo il bagno`} />
              <div className="gh-pet-album-date">{DATE_FORMAT.format(new Date(`${active.date}T12:00:00`))}</div>
              <div className="gh-pet-album-relative">{relativeVisitDate(active.date)}</div>
              <button type="button" className="gh-pet-album-share" onClick={sharePhoto}>
                <Icon name="arrow" size={18} />
                <span><strong>Salva o inoltra</strong><small>si apre il menù del telefono</small></span>
              </button>
            </div>
          ) : (
            <div className={`gh-pet-album-grid${onePhoto ? ' gh-pet-album-grid--single' : ''}`}>
              {photos.map((photo) => (
                <button type="button" key={photo.id} className="gh-pet-album-shot" onClick={() => onSelect(photo.id)}>
                  <img src={photo.photo_url} alt={`${pet.name}, ${DATE_FORMAT.format(new Date(`${photo.date}T12:00:00`))}`} />
                  <strong>{DATE_FORMAT.format(new Date(`${photo.date}T12:00:00`))}</strong>
                  <span>{relativeVisitDate(photo.date)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
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
  const { data: pet, loading, error, refetch, updatePet } = usePet(petId);
  const { data: visits, loading: visitsLoading, error: visitsError, refetch: refetchVisits } = usePetVisits(petId);
  const [mode, setMode] = useState('viewing');
  const [activeSection, setActiveSection] = useState(null);
  const [draft, setDraft] = useState(draftFromPet(null));
  const [saveError, setSaveError] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photosSwapped, setPhotosSwapped] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [selectedAlbumPhoto, setSelectedAlbumPhoto] = useState(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (pet && mode !== 'editing' && mode !== 'saving') setDraft(draftFromPet(pet));
  }, [pet, mode]);

  const originalDraft = useMemo(() => draftFromPet(pet), [pet]);
  const isDirty =
    mode === 'editing' &&
    (draft.ownerNotes !== originalDraft.ownerNotes ||
      draft.coatPreferences !== originalDraft.coatPreferences);
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
    setDraft(draftFromPet(pet));
    setSaveError(null);
    setActiveSection(null);
    setMode('viewing');
  };

  const saveChanges = async () => {
    if (!isDirty) return;
    setMode('saving');
    setSaveError(null);

    try {
      const updated = await updatePet({
        owner_notes: draft.ownerNotes.trim() || null,
        coat_preferences: draft.coatPreferences.trim() || null,
      });

      setDraft(draftFromPet(updated));
      setActiveSection(null);
      setMode('saved');
    } catch (updateError) {
      setSaveError(updateError.message || 'Non e stato possibile salvare le modifiche.');
      setMode('editing');
    }
  };

  const handleOwnerPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !pet) return;

    setPhotoUploading(true);
    setSaveError(null);
    let uploadedPath = null;
    let photoSaved = false;
    try {
      const prepared = await resizePetPhoto(file);
      const uploaded = await uploadOwnerPetPhoto({
        file: prepared,
        tenantId: pet.tenant_id,
        petId: pet.id,
      });
      uploadedPath = uploaded.path;
      const previousPath = ownerPetPhotoPathFromUrl(
        pet.owner_photo_url,
        pet.tenant_id,
        pet.id
      );
      await updatePet({ owner_photo_url: uploaded.publicUrl });
      photoSaved = true;
      if (previousPath) await removePetPhoto(previousPath).catch(() => {});
      setPhotosSwapped(false);
      setMode('saved');
    } catch (photoError) {
      if (uploadedPath && !photoSaved) await removePetPhoto(uploadedPath).catch(() => {});
      setSaveError(photoError.message || 'Non e stato possibile salvare la foto.');
    } finally {
      setPhotoUploading(false);
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
  const albumPhotos = visits.filter((visit) => visit.photo_url).slice(0, 4);
  const hasBothPortraits = Boolean(pet.owner_photo_url && pet.photo_url);
  const showOwnerPhotoInvite = Boolean(pet.photo_url && !pet.owner_photo_url);

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
          <Icon name="chevron-left" size={14} />
          I tuoi pet
        </Link>

        <header className="gh-pet-hero">
          <div className="gh-pet-photo-column">
            <div className="gh-pet-avatar-wrap">
              <DualPetMedallion
                pet={pet}
                swapped={photosSwapped}
                onSwap={() => setPhotosSwapped((current) => !current)}
              />
            </div>
            {hasBothPortraits && (
              <p className="gh-pet-photo-explainer">
                La foto piccola è quella che usiamo noi al banco per riconoscerlo. <strong>Toccala per scambiarle.</strong>
              </p>
            )}
          </div>

          <div className="gh-pet-hero-copy">
            <Eyebrow>Scheda pet</Eyebrow>
            <h1>{pet.name}</h1>
            <p>{heroMeta}</p>
            {pet.owner_photo_url && pet.photo_url && (
              <button
                type="button"
                className="gh-pet-text-action gh-pet-photo-replace"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
              >
                <Icon name="camera" size={15} />
                {photoUploading ? 'Caricamento...' : 'Cambia la tua foto'}
              </button>
            )}
          </div>
        </header>

        <input
          ref={photoInputRef}
          className="gh-pet-photo-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleOwnerPhoto}
          disabled={photoUploading}
        />

        {showOwnerPhotoInvite && (
          <section className="gh-pet-photo-invite">
            <strong>Questa è la foto che facciamo noi, per riconoscerlo.</strong>
            <p>Se ne hai una che ti piace di più, mettila tu: la nostra resta qui sotto.</p>
            <button
              type="button"
              className="gh-pet-album-gesture"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
            >
              <Icon name="camera" size={19} />
              <span>{photoUploading ? 'Caricamento...' : 'Metti la tua foto'}</span>
            </button>
          </section>
        )}

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

            <section className="gh-pet-section gh-pet-album-section">
              {albumPhotos.length ? (
                <button
                  type="button"
                  className="gh-pet-album-gesture"
                  onClick={() => {
                    setSelectedAlbumPhoto(null);
                    setAlbumOpen(true);
                  }}
                >
                  <Icon name="camera" size={20} />
                  <span>
                    <strong>{albumPhotos.length === 1 ? `La foto di ${pet.name}` : `Le foto di ${pet.name}`}</strong>
                    <small>{albumPhotos.length === 1 ? 'dall’ultima lavorazione' : `le ultime ${albumPhotos.length} lavorazioni`}</small>
                  </span>
                  <Icon name="chevron" size={16} />
                </button>
              ) : (
                <p className="gh-pet-album-empty">Dopo il prossimo bagno troverai qui la sua foto</p>
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
      {albumOpen && (
        <AlbumSheet
          pet={pet}
          photos={albumPhotos}
          selected={selectedAlbumPhoto}
          onSelect={setSelectedAlbumPhoto}
          onClose={() => {
            setAlbumOpen(false);
            setSelectedAlbumPhoto(null);
          }}
        />
      )}
    </main>
  );
}
