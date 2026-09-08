import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  Hero,
  HeroButton,
  Panel,
  StateTag,
} from '../components/StaffKit';
import {
  createStaffPromotion,
  getStaffPromotions,
  reorderStaffPromotions,
  updateStaffPromotion,
  validatePromotionImageFile,
} from '../lib/database';
import './PromotionsManager.css';

const EMPTY_FORM = {
  title: '',
  body: '',
  image_url: '',
  original_image_url: '',
  remove_image: false,
  valid_from: '',
  valid_to: '',
  cta_label: '',
  cta_url: '',
  is_active: true,
};

const DATE_FORMAT = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const toLocalInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toForm = (promotion) => ({
  title: promotion.title || '',
  body: promotion.body || '',
  image_url: promotion.image_url || '',
  original_image_url: promotion.image_url || '',
  remove_image: false,
  valid_from: toLocalInput(promotion.valid_from),
  valid_to: toLocalInput(promotion.valid_to),
  cta_label: promotion.cta_label || '',
  cta_url: promotion.cta_url || '',
  is_active: promotion.is_active,
});

const getPromotionState = (promotion) => {
  const now = Date.now();
  const startsAt = promotion.valid_from ? Date.parse(promotion.valid_from) : null;
  const endsAt = promotion.valid_to ? Date.parse(promotion.valid_to) : null;
  if (!promotion.is_active) return { label: 'Disattivata', tone: 'neutral' };
  if (startsAt && startsAt > now) return { label: 'Programmata', tone: 'warning' };
  if (endsAt && endsAt < now) return { label: 'Scaduta', tone: 'neutral' };
  return { label: 'Visibile', tone: 'success' };
};

const formatWindow = (promotion) => {
  const from = promotion.valid_from ? DATE_FORMAT.format(new Date(promotion.valid_from)) : 'subito';
  const to = promotion.valid_to ? DATE_FORMAT.format(new Date(promotion.valid_to)) : 'senza scadenza';
  return `${from} - ${to}`;
};

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageNotice, setImageNotice] = useState('');

  const activeCount = useMemo(
    () => promotions.filter((promotion) => getPromotionState(promotion).label === 'Visibile').length,
    [promotions]
  );

  const loadPromotions = async () => {
    setLoading(true);
    setError('');
    try {
      setPromotions(await getStaffPromotions());
    } catch (loadError) {
      setError(loadError.message || 'Non riesco a caricare le promozioni.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setError('');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setFormOpen(true);
    setError('');
    setImageNotice('');
  };

  const openEdit = (promotion) => {
    setEditingId(promotion.id);
    setForm(toForm(promotion));
    setImageFile(null);
    setFormOpen(true);
    setError('');
    setImageNotice('');
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      validatePromotionImageFile(file);
      setImageFile(file);
      setForm((current) => ({ ...current, image_url: current.original_image_url, remove_image: false }));
      setError('');
    } catch (imageError) {
      setError(imageError.message);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setForm((current) => ({ ...current, image_url: '', remove_image: true }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setImageNotice('');
    try {
      const input = { ...form, imageFile };
      const saved = editingId
        ? await updateStaffPromotion(editingId, input)
        : await createStaffPromotion(input);
      closeForm();
      await loadPromotions();
      if (saved.imageUploadError) setImageNotice(saved.imageUploadError);
    } catch (saveError) {
      setError(saveError.message || 'Non riesco a salvare la promozione.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promotion) => {
    setSaving(true);
    setError('');
    try {
      await updateStaffPromotion(promotion.id, {
        ...promotion,
        is_active: !promotion.is_active,
      });
      await loadPromotions();
    } catch (toggleError) {
      setError(toggleError.message || 'Non riesco a cambiare lo stato della promozione.');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= promotions.length) return;
    const reordered = [...promotions];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setSaving(true);
    setError('');
    try {
      await reorderStaffPromotions(reordered.map(({ id }) => id));
      setPromotions(reordered.map((promotion, position) => ({
        ...promotion,
        display_order: (position + 1) * 10,
      })));
    } catch (moveError) {
      setError(moveError.message || 'Non riesco a riordinare le promozioni.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gh-page gh-promotions-page">
      <Hero
        title="Promozioni"
        subtitle="Iniziative visibili nell'area cliente del salone."
        right={<HeroButton onClick={formOpen ? closeForm : openCreate}>{formOpen ? 'Chiudi' : 'Nuova promozione'}</HeroButton>}
      />

      <main className="gh-page-shell gh-promotions-stack">
        {error && <ErrorState title="La modifica non e stata salvata" body={error} />}
        {imageNotice && <ErrorState title="Promozione salvata, immagine non modificata" body={imageNotice} />}

        {formOpen && (
          <Panel eyebrow={editingId ? 'Modifica' : 'Nuova promozione'} title={editingId ? 'Aggiorna la promozione' : 'Scrivi una promozione'}>
            <form className="gh-promotions-form" onSubmit={handleSubmit}>
              <Field label="Titolo *" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required maxLength={120} />
              <Field label="Testo" area rows={5} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} className="gh-promotions-form__wide" />
              <div className="gh-promotion-image-field gh-promotions-form__wide">
                <span className="gh-eyebrow--staff gh-field-label">Immagine</span>
                {(imagePreview || form.image_url) && (
                  <div className="gh-promotion-image-preview">
                    <img src={imagePreview || form.image_url} alt="Anteprima della promozione" />
                    <Button staff type="button" variant="danger" icon="trash" onClick={handleImageRemove} aria-label="Rimuovi immagine" title="Rimuovi immagine" />
                  </div>
                )}
                <div className="gh-photo-picker">
                  <p className="gh-meta">JPEG, PNG, WebP o GIF, fino a 5 MB.</p>
                  <label className="gh-btn gh-btn--outline gh-file-button">
                    {imagePreview || form.image_url ? 'Sostituisci immagine' : 'Scegli immagine'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} disabled={saving} />
                  </label>
                </div>
              </div>
              <Field label="Visibile dal" type="datetime-local" value={form.valid_from} onChange={(event) => setForm((current) => ({ ...current, valid_from: event.target.value }))} />
              <Field label="Visibile fino al" type="datetime-local" value={form.valid_to} onChange={(event) => setForm((current) => ({ ...current, valid_to: event.target.value }))} />
              <Field label="Testo pulsante" value={form.cta_label} onChange={(event) => setForm((current) => ({ ...current, cta_label: event.target.value }))} placeholder="Es. Prenota ora" />
              <Field label="Indirizzo pulsante" value={form.cta_url} onChange={(event) => setForm((current) => ({ ...current, cta_url: event.target.value }))} placeholder="https://... oppure /u/book" />
              <label className="gh-promotions-toggle gh-promotions-form__wide">
                <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} />
                <span>Promozione attiva</span>
              </label>
              <div className="gh-inline-actions gh-promotions-form__wide">
                <Button staff type="submit" loading={saving}>{editingId ? 'Salva modifiche' : 'Crea promozione'}</Button>
                <Button staff type="button" variant="ghost" onClick={closeForm}>Annulla</Button>
              </div>
            </form>
          </Panel>
        )}

        <Panel
          eyebrow="Area cliente"
          title="Promozioni del salone"
          right={<span className="gh-meta gh-num">{activeCount} visibili ora</span>}
          flush
        >
          {loading ? (
            <div className="gh-promotions-loading" aria-busy="true">Caricamento promozioni...</div>
          ) : promotions.length === 0 ? (
            <EmptyState title="Nessuna promozione" body="Scrivi la prima iniziativa da mostrare ai clienti." action={<Button staff icon="plus" onClick={openCreate}>Nuova promozione</Button>} />
          ) : (
            <div className="gh-promotions-list">
              {promotions.map((promotion, index) => {
                const state = getPromotionState(promotion);
                return (
                  <article className="gh-promotion-row" key={promotion.id}>
                    <div className={`gh-promotion-row__main${promotion.image_url ? ' gh-promotion-row__main--with-image' : ''}`}>
                      {promotion.image_url && <img className="gh-promotion-row__image" src={promotion.image_url} alt="" />}
                      <div className="gh-promotion-row__copy">
                        <div className="gh-promotion-row__title-line">
                          <h3>{promotion.title}</h3>
                          <StateTag tone={state.tone}>{state.label}</StateTag>
                        </div>
                        {promotion.body && <p className="gh-promotion-row__body">{promotion.body}</p>}
                        <div className="gh-promotion-row__meta gh-num">{formatWindow(promotion)}</div>
                        {promotion.cta_label && promotion.cta_url && <div className="gh-promotion-row__cta">{promotion.cta_label} · {promotion.cta_url}</div>}
                      </div>
                    </div>
                    <div className="gh-promotion-row__actions">
                      <Button staff variant="ghost" icon="pencil" aria-label={`Modifica ${promotion.title}`} title="Modifica" onClick={() => openEdit(promotion)} disabled={saving} />
                      <Button staff variant="outline" onClick={() => handleToggle(promotion)} disabled={saving}>{promotion.is_active ? 'Disattiva' : 'Attiva'}</Button>
                      <Button staff variant="ghost" icon="chevron-up" className="gh-promotion-order" aria-label={`Sposta su ${promotion.title}`} title="Sposta su" onClick={() => handleMove(index, -1)} disabled={saving || index === 0} />
                      <Button staff variant="ghost" icon="chevron-down" className="gh-promotion-order" aria-label={`Sposta giu ${promotion.title}`} title="Sposta giu" onClick={() => handleMove(index, 1)} disabled={saving || index === promotions.length - 1} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Panel>
      </main>
    </div>
  );
}
