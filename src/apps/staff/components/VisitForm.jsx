import React, { useEffect, useRef, useState } from 'react';
import WarmNotice from '../../../shared/ui/WarmNotice';
import { Button, DayChip, ErrorState, Field } from './StaffKit';

export const createEmptyVisitForm = () => ({
  date: new Date().toISOString().split('T')[0],
  treatments: '',
  issues: '',
  cost: '',
  photoFile: null,
});

const toDateValue = (daysAgo) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const shortDate = (dateValue) =>
  new Date(`${dateValue}T12:00:00`).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
  });

const weekday = (dateValue) =>
  new Date(`${dateValue}T12:00:00`).toLocaleDateString('it-IT', { weekday: 'short' });

export default function VisitForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  error = '',
  submitting = false,
  modal = false,
  submitLabel = 'Salva Visita',
}) {
  const dateInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const today = toDateValue(0);
  const yesterday = toDateValue(1);
  const beforeYesterday = toDateValue(2);
  const isPresetDate = [today, yesterday, beforeYesterday].includes(value.date);

  useEffect(() => {
    if (!value.photoFile) {
      setPhotoPreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(value.photoFile);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [value.photoFile]);

  const updateField = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) dateInputRef.current.showPicker();
    else dateInputRef.current?.focus();
  };

  return (
    <form className="gh-visit-editor" onSubmit={onSubmit}>
      <div className={modal ? 'gh-modal__body gh-visit-form' : 'gh-visit-form'}>
        {error && (
          <ErrorState body={`${error}. I dati inseriti nel form restano disponibili.`} />
        )}

        <div className="gh-visit-form__section">
          <span className="gh-eyebrow--staff gh-field-label">Quando</span>
          <div className="gh-day-list">
            <DayChip
              label="Oggi"
              sub={shortDate(today)}
              pressed={value.date === today}
              onClick={() => updateField('date', today)}
            />
            <DayChip
              label="Ieri"
              sub={shortDate(yesterday)}
              pressed={value.date === yesterday}
              onClick={() => updateField('date', yesterday)}
            />
            <DayChip
              label={weekday(beforeYesterday)}
              sub={shortDate(beforeYesterday)}
              pressed={value.date === beforeYesterday}
              onClick={() => updateField('date', beforeYesterday)}
            />
            <DayChip
              label="Altra data"
              sub="scegli"
              pressed={!isPresetDate}
              onClick={openDatePicker}
            />
          </div>
          <Field
            className="gh-visit-date-field"
            label="Data della visita *"
            inputRef={dateInputRef}
            type="date"
            value={value.date}
            onChange={(event) => updateField('date', event.target.value)}
            disabled={submitting}
            required
          />
          <WarmNotice staff>
            Puoi registrare anche una visita già conclusa: lo storico conserva la data scelta.
          </WarmNotice>
        </div>

        <Field
          label="Trattamenti eseguiti"
          area
          rows="4"
          placeholder="Es. Bagno, taglio, asciugatura, spazzolatura..."
          value={value.treatments}
          onChange={(event) => updateField('treatments', event.target.value)}
          disabled={submitting}
        />

        <Field
          label="Problematiche riscontrate"
          area
          rows="4"
          placeholder="Es. Pelle irritata, nodi, comportamento agitato..."
          value={value.issues}
          onChange={(event) => updateField('issues', event.target.value)}
          disabled={submitting}
        />

        <div className="gh-visit-photo-field">
          <span className="gh-eyebrow--staff gh-field-label">Foto per il proprietario</span>
          <input
            ref={photoInputRef}
            className="gh-visit-photo-input"
            type="file"
            accept="image/*,.heic,.heif"
            onChange={(event) => updateField('photoFile', event.target.files?.[0] || null)}
            disabled={submitting}
          />
          <div className={`gh-visit-photo-slot${value.photoFile ? ' gh-visit-photo-slot--attached' : ''}`}>
            <div className="gh-visit-photo-slot__thumb">
              {photoPreview ? <img src={photoPreview} alt="Anteprima foto allegata" /> : <span aria-hidden="true">+</span>}
            </div>
            <button
              type="button"
              className="gh-visit-photo-slot__copy"
              onClick={() => photoInputRef.current?.click()}
              disabled={submitting}
            >
              <strong>{value.photoFile ? '1 foto allegata' : 'Allega una foto dalla galleria'}</strong>
              <small>{value.photoFile ? 'la vedrà il proprietario nella sua pagina' : 'quella che avete già mandato su WhatsApp'}</small>
            </button>
            {value.photoFile ? (
              <button type="button" className="gh-visit-photo-slot__action" onClick={() => updateField('photoFile', null)} disabled={submitting}>
                Rimuovi
              </button>
            ) : (
              <button type="button" className="gh-visit-photo-slot__action" onClick={() => photoInputRef.current?.click()} disabled={submitting}>
                Scegli
              </button>
            )}
          </div>
        </div>

        <Field
          className="gh-visit-cost-field"
          label="Costo (€) *"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={value.cost}
          onChange={(event) => updateField('cost', event.target.value)}
          disabled={submitting}
          required
        />
      </div>

      <div className={modal ? 'gh-modal__foot' : 'gh-visit-form__actions'}>
        <Button staff variant="outline" onClick={onCancel} disabled={submitting}>
          Annulla
        </Button>
        <Button staff variant="primary" type="submit" icon="check" disabled={submitting}>
          {submitting ? 'Salvataggio...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
