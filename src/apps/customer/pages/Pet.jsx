import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { useUnsavedChanges } from '../../../shared/navigation/UnsavedChangesProvider';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';
import { usePet } from '../hooks/usePet';
import { usePetVisits } from '../hooks/usePetVisits';
import { removePetPhoto, resizePetPhoto, uploadPetPhoto } from '../lib/petPhoto';

const DATE_FORMAT = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
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

function PetAvatar({ pet, previewUrl, size }) {
  const source = previewUrl || pet.photo_url;
  if (source) {
    return (
      <img
        src={source}
        alt={`Foto di ${pet.name}`}
        style={{
          width: size,
          height: size,
          borderRadius: 24,
          objectFit: 'cover',
          border: '1px solid var(--color-border)',
          boxShadow: '0 12px 30px -20px rgba(43,37,37,.45)',
        }}
      />
    );
  }

  return (
    <div
      aria-label={`Nessuna foto per ${pet.name}`}
      style={{
        width: size,
        height: size,
        borderRadius: 24,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--color-surface-soft)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-border)',
        fontFamily: 'var(--font-serif)',
        fontSize: Math.round(size * 0.42),
        fontWeight: 500,
      }}
    >
      {(pet.name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function DataField({ label, value }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--color-border)', minWidth: 0 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-text-secondary)',
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', overflowWrap: 'anywhere' }}>
        {value || 'Non indicato'}
      </div>
    </div>
  );
}

function TextSection({ title, value, emptyText, editing, onChange, rows = 5 }) {
  return (
    <Card padding={24} style={{ height: '100%', boxSizing: 'border-box' }}>
      <Eyebrow style={{ marginBottom: 12 }}>{title}</Eyebrow>
      {editing ? (
        <textarea
          aria-label={title}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          style={textareaStyle}
        />
      ) : (
        <p
          style={{
            margin: 0,
            minHeight: 72,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            fontSize: 14,
            lineHeight: 1.65,
            color: value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {value || emptyText}
        </p>
      )}
    </Card>
  );
}

function VisitRow({ visit, isLast }) {
  const date = new Date(`${visit.date}T00:00:00`);
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 18,
        alignItems: 'flex-start',
        padding: '18px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <div style={{ width: 142, fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, textTransform: 'capitalize' }}>
        {Number.isNaN(date.getTime()) ? visit.date : DATE_FORMAT.format(date)}
      </div>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, overflowWrap: 'anywhere' }}>
          {visit.treatments || 'Trattamento non indicato'}
        </div>
        {visit.issues && (
          <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
            {visit.issues}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <main style={pageStyle}>
      <BackgroundDecor />
      <div style={containerStyle}>
        <Skeleton width={150} height={14} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', marginTop: 32 }}>
          <Skeleton width={132} height={132} style={{ borderRadius: 24 }} />
          <div style={{ flex: '1 1 280px', display: 'grid', gap: 12 }}>
            <Skeleton width="35%" height={13} />
            <Skeleton width="55%" height={52} />
            <Skeleton width="70%" height={16} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18, marginTop: 34 }}>
          <Skeleton height={260} style={{ borderRadius: 24 }} />
          <Skeleton height={260} style={{ borderRadius: 24 }} />
        </div>
      </div>
    </main>
  );
}

function MessagePage({ title, body, onRetry }) {
  return (
    <main style={{ ...pageStyle, display: 'grid', placeItems: 'center' }}>
      <BackgroundDecor />
      <Card padding="32px" style={{ width: 'min(100%, 480px)', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Scheda pet</Eyebrow>
        <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500 }}>
          {title}
        </h1>
        <p style={{ margin: '0 0 20px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{body}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {onRetry && <Button onClick={onRetry}>Riprova</Button>}
          <Link to="/u/home" style={ghostLinkStyle}>Torna alla home</Link>
        </div>
      </Card>
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
  const [draft, setDraft] = useState(draftFromPet(null));
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : false
  );
  const fileInputRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
  const confirmNavigation = useUnsavedChanges(isDirty || mode === 'saving', UNSAVED_MESSAGE);

  const beginEditing = () => {
    setDraft(draftFromPet(pet));
    setSaveError(null);
    setMode('editing');
  };

  const cancelEditing = () => {
    if (isDirty && !window.confirm('Annullare le modifiche non salvate?')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingPhoto(null);
    setDraft(draftFromPet(pet));
    setSaveError(null);
    setMode('viewing');
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
      setMode('saved');
    } catch (updateError) {
      if (uploadedPath) await removePetPhoto(uploadedPath);
      setSaveError(updateError.message || 'Non è stato possibile salvare le modifiche.');
      setMode('editing');
    }
  };

  if (authLoading || loading) return <LoadingPage />;
  if (error) {
    return <MessagePage title="Non riusciamo a caricare la scheda" body={error.message} onRetry={refetch} />;
  }
  if (!pet) {
    return (
      <MessagePage
        title="Pet non trovato o accesso negato"
        body="La scheda richiesta non è disponibile per questo account."
      />
    );
  }

  const age = calculateAge(pet.birth_date);
  const heroMeta = [formatSpecies(pet.species), pet.breed, age].filter(Boolean).join(' · ');
  const editing = mode === 'editing' || mode === 'saving';
  const avatarSize = isMobile ? 112 : 132;

  return (
    <main style={pageStyle}>
      <BackgroundDecor />
      <div style={containerStyle}>
        <Link
          to="/u/home"
          onClick={(event) => {
            if (!confirmNavigation()) event.preventDefault();
          }}
          style={backLinkStyle}
        >
          <Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} />
          I tuoi pet
        </Link>

        <section style={heroStyle}>
          <div style={{ position: 'relative', width: avatarSize, flexShrink: 0 }}>
            <PetAvatar pet={pet} previewUrl={previewUrl} size={avatarSize} />
            {editing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoBusy || mode === 'saving'}
                aria-label={`Cambia la foto di ${pet.name}`}
                title="Cambia foto"
                style={photoButtonStyle}
              >
                <Icon name="camera" size={17} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ flex: isMobile ? '1 1 150px' : '1 1 260px', minWidth: 0 }}>
            <Eyebrow style={{ marginBottom: 10 }}>Scheda pet</Eyebrow>
            <h1 style={{ ...heroTitleStyle, fontSize: isMobile ? 38 : 48 }}>{pet.name}</h1>
            <p style={heroMetaStyle}>{heroMeta}</p>
            {editing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoBusy || mode === 'saving'}
                style={textActionStyle}
              >
                <Icon name="camera" size={15} />
                {photoBusy ? 'Preparazione foto…' : 'Scegli una nuova foto'}
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flex: isMobile ? '1 1 100%' : '0 1 auto',
              flexWrap: 'wrap',
              gap: 9,
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
            }}
          >
            {mode === 'viewing' || mode === 'saved' ? (
              <Button onClick={beginEditing}>
                <Icon name="pencil" size={16} />
                Modifica
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={cancelEditing} disabled={mode === 'saving'}>Annulla</Button>
                <Button onClick={saveChanges} loading={mode === 'saving'} disabled={!isDirty || photoBusy}>
                  <Icon name="check" size={16} />
                  Salva
                </Button>
              </>
            )}
          </div>
        </section>

        <div aria-live="polite" style={{ minHeight: 28, marginBottom: 6 }}>
          {mode === 'saved' && (
            <div style={successStyle}>
              <Icon name="check" size={15} />
              Modifiche salvate
            </div>
          )}
          {saveError && <div style={errorStyle}>{saveError}</div>}
        </div>

        <section style={topGridStyle}>
          <Card padding={24}>
            <Eyebrow style={{ marginBottom: 4 }}>Anagrafica</Eyebrow>
            <div style={dataGridStyle}>
              <DataField label="Data di nascita" value={pet.birth_date ? DATE_FORMAT.format(new Date(`${pet.birth_date}T00:00:00`)) : null} />
              <DataField label="Sesso" value={formatSex(pet.sex)} />
              <DataField label="Microchip" value={pet.microchip} />
              <DataField label="Peso" value={pet.weight_kg !== null ? `${Number(pet.weight_kg).toLocaleString('it-IT')} kg` : null} />
              <DataField label="Colore" value={pet.color} />
              <DataField label="Sterilizzato" value={formatBoolean(pet.neutered)} />
            </div>
            <p style={readOnlyNoteStyle}>Questi dati sono gestiti dal salone.</p>
          </Card>

          <div style={notesGridStyle}>
            <TextSection
              title="Preferenze del mantello"
              value={draft.coatPreferences}
              emptyText="Nessuna preferenza indicata."
              editing={editing}
              onChange={(coatPreferences) => setDraft((current) => ({ ...current, coatPreferences }))}
            />
            <TextSection
              title="Le tue note"
              value={draft.ownerNotes}
              emptyText="Nessuna nota del proprietario."
              editing={editing}
              onChange={(ownerNotes) => setDraft((current) => ({ ...current, ownerNotes }))}
            />
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <Card padding={24}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
              <Eyebrow>Storico visite</Eyebrow>
              {!visitsLoading && !visitsError && (
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {visits.length} {visits.length === 1 ? 'visita' : 'visite'}
                </span>
              )}
            </div>

            {visitsLoading ? (
              <div style={{ display: 'grid', gap: 14, paddingTop: 18 }}>
                <Skeleton height={62} />
                <Skeleton height={62} />
              </div>
            ) : visitsError ? (
              <div style={{ paddingTop: 18 }}>
                <p style={{ margin: '0 0 12px', color: 'var(--color-error-text, #8f3f49)' }}>
                  Non è stato possibile caricare lo storico.
                </p>
                <Button variant="ghost" onClick={refetchVisits}>Riprova</Button>
              </div>
            ) : visits.length === 0 ? (
              <p style={{ margin: '18px 0 0', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Nessuna visita registrata.
              </p>
            ) : (
              <div style={{ marginTop: 4 }}>
                {visits.map((visit, index) => (
                  <VisitRow key={visit.id} visit={visit} isLast={index === visits.length - 1} />
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}

const pageStyle = {
  width: '100%',
  minHeight: '100vh',
  boxSizing: 'border-box',
  position: 'relative',
  background: 'var(--color-bg-main)',
  padding: '34px 24px 52px',
};

const containerStyle = {
  width: '100%',
  maxWidth: 1040,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
};

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  marginBottom: 24,
  color: 'var(--color-text-secondary)',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};

const ghostLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 18px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--r-md)',
  color: 'var(--color-primary)',
  fontSize: 15,
  fontWeight: 600,
  textDecoration: 'none',
};

const heroStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 26,
  marginBottom: 12,
};

const heroTitleStyle = {
  margin: 0,
  fontFamily: 'var(--font-serif)',
  fontSize: 48,
  lineHeight: 1,
  letterSpacing: 0,
  fontWeight: 500,
  color: 'var(--color-text-primary)',
  overflowWrap: 'anywhere',
};

const heroMetaStyle = {
  margin: '10px 0 0',
  color: 'var(--color-text-secondary)',
  fontSize: 15,
  lineHeight: 1.5,
};

const photoButtonStyle = {
  position: 'absolute',
  right: -8,
  bottom: -8,
  width: 38,
  height: 38,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-main)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 5px 16px rgba(43,37,37,.16)',
  cursor: 'pointer',
};

const textActionStyle = {
  marginTop: 12,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  border: 0,
  background: 'transparent',
  color: 'var(--color-primary)',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const topGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 430px), 1fr))',
  gap: 18,
};

const dataGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
  columnGap: 22,
};

const notesGridStyle = {
  display: 'grid',
  gridTemplateRows: '1fr 1fr',
  gap: 18,
};

const textareaStyle = {
  width: '100%',
  minHeight: 112,
  resize: 'vertical',
  boxSizing: 'border-box',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--r-sm)',
  background: 'var(--color-bg-main)',
  color: 'var(--color-text-primary)',
  padding: '12px 14px',
  fontFamily: 'inherit',
  fontSize: 14,
  lineHeight: 1.55,
  outlineColor: 'var(--color-primary)',
};

const readOnlyNoteStyle = {
  margin: '14px 0 0',
  fontSize: 12,
  color: 'var(--color-text-secondary)',
};

const successStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  color: 'var(--color-success-text, #3f6658)',
  fontSize: 13,
  fontWeight: 700,
};

const errorStyle = {
  color: 'var(--color-error-text, #8f3f49)',
  fontSize: 13,
  fontWeight: 600,
};
