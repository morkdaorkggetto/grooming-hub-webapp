import { supabase } from '../../../shared/supabase/client';

const MAX_DIMENSION = 1024;
const MAX_BUCKET_BYTES = 5 * 1024 * 1024;
const JPEG_QUALITY = 0.86;

function loadImage(file) {
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Impossibile leggere la foto selezionata.'));
    };
    image.src = objectUrl;
  });
}

export async function resizePetPhoto(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Seleziona un file immagine JPEG, PNG o WebP.');
  }

  const { image, objectUrl } = await loadImage(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Ridimensionamento foto non disponibile.');
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Impossibile preparare la foto.'))),
        'image/jpeg',
        JPEG_QUALITY
      );
    });

    if (blob.size > MAX_BUCKET_BYTES) {
      throw new Error('La foto rimane troppo grande dopo il ridimensionamento.');
    }

    return new File([blob], `pet-${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadPetPhoto({ file, tenantId, petId }) {
  const uniquePart = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  const path = `${tenantId}/${petId}/${Date.now()}-${uniquePart}.jpg`;
  const { error } = await supabase.storage.from('pet-avatars').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;
  const { data } = supabase.storage.from('pet-avatars').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function removePetPhoto(path) {
  if (!path) return;
  await supabase.storage.from('pet-avatars').remove([path]);
}
