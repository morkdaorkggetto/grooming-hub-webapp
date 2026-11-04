import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImageCropModal from '../../../shared/ui/ImageCropModal';
import { addCustomerWithPet, addPetToCustomer, findCustomerByPhone } from '../lib/database';
import { isSupportedImageFile } from '../lib/imageFiles';
import { Button, ErrorState, Field, Hero, HeroButton, Panel } from '../components/StaffKit';

/**
 * AddClient — Pagina form aggiunta nuovo cliente
 * Accetta: nome, razza, proprietario, telefono, note, foto
 */
export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    owner: '',
    phone: '',
    notes: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [pendingCropFile, setPendingCropFile] = useState(null);

  const customerConversion = useMemo(() => {
    const state = location.state;
    if (!state?.sourceCustomerId) return null;

    return {
      customerId: state.sourceCustomerId,
      returnTo: state.returnTo || '/contacts',
      petName: state.pet_name || '',
      ownerName: state.owner_name || '',
      phone: state.phone || '',
      notes: state.notes || '',
    };
  }, [location.state]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!customerConversion) return;

    setFormData((prev) => ({
      ...prev,
      name: customerConversion.petName,
      owner: customerConversion.ownerName,
      phone: customerConversion.phone,
      notes: customerConversion.notes,
    }));
  }, [customerConversion]);

  /**
   * Gestisce upload foto cliente
   */
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // Validazione tipo file
    if (!isSupportedImageFile(file)) {
      setError('Seleziona un file immagine');
      return;
    }

    setPendingCropFile(file);
  };

  const handleCropCancel = () => {
    setPendingCropFile(null);
  };

  const handleCropConfirm = ({ file, previewUrl }) => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(previewUrl);
    setPendingCropFile(null);
  };

  const petDataFromForm = () => ({
    name: formData.name,
    breed: formData.breed,
    internal_notes: formData.notes,
    photoFile,
    sex: import.meta.env.DEV && new URLSearchParams(location.search).get('gh05ForcePetError') === '1' ? 'x' : null,
  });

  const handleAddPetToExisting = async () => {
    if (!existingCustomer || !formData.name.trim()) {
      setError('Inserisci il nome del pet prima di aggiungerlo.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const current = await findCustomerByPhone(formData.phone);
      if (current?.id !== existingCustomer.id || current.pets?.length) {
        setExistingCustomer(null);
        throw new Error('La scheda associata a questo telefono è cambiata. Controlla di nuovo il proprietario prima di salvare.');
      }
      const created = await addPetToCustomer(current.id, petDataFromForm());
      if (created.photoUploadError) {
        window.alert(`Pet aggiunto. La foto non è stata caricata: ${created.photoUploadError}`);
      }
      navigate(`/client/${created.pet_id}`);
    } catch (err) {
      setError(err.message || 'Non riesco ad aggiungere il pet al proprietario.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validazioni
    if (!formData.name.trim()) {
      setError('Il nome del cane è obbligatorio');
      return;
    }
    if (!formData.owner.trim()) {
      setError('Il proprietario è obbligatorio');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Il telefono è obbligatorio');
      return;
    }

    setLoading(true);

    try {
      const ownerParts = formData.owner.trim().split(/\s+/);
      const firstName = ownerParts.length === 1 ? ownerParts[0] : ownerParts.slice(0, -1).join(' ');
      const lastName = ownerParts.length === 1 ? null : ownerParts.at(-1);
      const petData = petDataFromForm();
      if (!customerConversion) {
        const existing = await findCustomerByPhone(formData.phone);
        if (existing) {
          if (!existing.pets?.length) {
            setExistingCustomer(existing);
            return;
          }
          const ownerName = [existing.first_name, existing.last_name].filter(Boolean).join(' ');
          throw new Error(`Questo telefono è già di ${ownerName}, che ha una scheda pet. Apri la sua scheda dalla rubrica per aggiungerne un altro.`);
        }
      }
      const created = customerConversion
        ? await addPetToCustomer(customerConversion.customerId, petData)
        : await addCustomerWithPet(
          null,
          {
            first_name: firstName,
            last_name: lastName,
            phone: formData.phone,
          },
          petData
        );

      if (customerConversion) {
        navigate(`/client/${created.pet_id}`);
        return;
      }

      if (created.photoUploadError) {
        window.alert(`Customer e pet creati. La foto non è stata caricata: ${created.photoUploadError}`);
      }

      navigate(`/client/${created.pet_id}`, {
        state: { justCreated: true },
      });
    } catch (err) {
      setError(err.message || 'Errore nell\'aggiunta del cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Annulla e torna a dashboard
   */
  const handleCancel = () => {
    navigate(customerConversion?.returnTo || '/dashboard');
  };

  return (
    <div className="gh-page gh-add-client-page">
      <Hero
        title={customerConversion ? 'Aggiungi pet al lead' : 'Nuovo cliente'}
        subtitle={customerConversion ? 'Completa i dati del pet e attiva il customer senza creare duplicati.' : 'Inserisci i dati essenziali, aggiungi una foto e prepara subito la scheda del cane.'}
        right={<HeroButton onClick={handleCancel}>← Indietro</HeroButton>}
      />

      <main className="gh-page-shell gh-add-client-shell">
        {error && <ErrorState title="Il form non è stato svuotato" body={error} action={<Button staff className="gh-error-state__action" variant="ghost" onClick={() => setError('')}>Chiudi</Button>} />}

        <Panel>
          {customerConversion && (
            <div className="gh-add-client-context">
              <span className="gh-eyebrow--staff">Aggiunta pet</span>
              <p className="gh-body">Stai aggiungendo il pet dichiarato <strong>{customerConversion.petName || 'senza nome'}</strong>. Dopo il salvataggio il customer resterà lo stesso e passerà allo stato attivo.</p>
            </div>
          )}
          {existingCustomer && !customerConversion && (
            <div className="gh-add-client-context" role="status">
              <span className="gh-eyebrow--staff">Proprietario già presente</span>
              <p className="gh-body">Il telefono appartiene a <strong>{[existingCustomer.first_name, existingCustomer.last_name].filter(Boolean).join(' ')}</strong>, che non ha pet nella scheda. Se è la stessa persona, aggiungi il pet a questo proprietario senza crearne uno nuovo.</p>
              <Button staff type="button" variant="outline" disabled={loading} onClick={handleAddPetToExisting}>Aggiungi pet a questo proprietario</Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="gh-add-client-form">
            <section className="gh-add-client-section">
              <h2 className="gh-panel-title">Padrone</h2>
              <div className="gh-add-client-grid">
                <div><Field label="Proprietario *" id="owner" placeholder="Nome del proprietario" value={formData.owner} onChange={(e) => { setExistingCustomer(null); setFormData({ ...formData, owner: e.target.value }); }} required disabled={loading || Boolean(customerConversion)} /><p className="gh-meta">Campo obbligatorio</p></div>
                <div><Field label="Telefono *" id="phone" type="tel" placeholder="Es. 333 123 4567" value={formData.phone} onChange={(e) => { setExistingCustomer(null); setFormData({ ...formData, phone: e.target.value }); }} required disabled={loading || Boolean(customerConversion)} /><p className="gh-meta">Campo obbligatorio</p></div>
              </div>
            </section>

            <section className="gh-add-client-section">
              <h2 className="gh-panel-title">Pet</h2>
              <div className="gh-add-client-grid">
                <div><Field label="Nome del cane *" id="name" placeholder="Es. Bau, Fluffy, Rex..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} /><p className="gh-meta">Campo obbligatorio</p></div>
                <Field label="Razza" id="breed" placeholder="Es. Labrador, Pastore Tedesco..." value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} disabled={loading} />
              </div>
              <Field label="Note (allergie, preferenze, caratteristiche)" id="notes" area placeholder="Es. Allergia ai polli, preferisce toelettature delicate..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </section>

            <section className="gh-add-client-section">
              <h2 className="gh-panel-title">Foto del cane</h2>
              {photoPreview && (
                <div className="gh-add-client-photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <Button staff type="button" variant="danger" icon="trash" aria-label="Rimuovi foto" title="Rimuovi foto" onClick={() => { URL.revokeObjectURL(photoPreview); setPhotoFile(null); setPhotoPreview(''); }} />
                </div>
              )}
              <div className="gh-photo-picker gh-add-client-photo-picker">
                <strong>Foto del cane</strong>
                <p className="gh-meta">Da smartphone puoi scattarla in diretta oppure scegliere dalla galleria.</p>
                <div className="gh-inline-actions">
                  <label className="gh-btn gh-btn--primary gh-file-button">Scatta foto<input id="photo-camera" type="file" accept="image/*,.heic,.heif" capture="environment" onChange={handlePhotoSelect} /></label>
                  <label className="gh-btn gh-btn--outline gh-file-button">Scegli dalla galleria<input id="photo-gallery" type="file" accept="image/*,.heic,.heif" onChange={handlePhotoSelect} /></label>
                </div>
              </div>
            </section>

            <div className="gh-add-client-actions">
              <Button staff type="submit" wide loading={loading} disabled={Boolean(existingCustomer)}>{customerConversion ? '✅ Aggiungi pet' : '✅ Salva Cliente'}</Button>
              <Button staff type="button" wide variant="outline" disabled={loading} onClick={handleCancel}>Annulla</Button>
            </div>
          </form>

          <p className="gh-add-client-tip">💡 <strong>Suggerimento:</strong> Compila il nome, il proprietario e il telefono per iniziare. Puoi aggiungere foto e note in seguito se necessario.</p>
        </Panel>
      </main>

      <ImageCropModal
        open={Boolean(pendingCropFile)}
        file={pendingCropFile}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
