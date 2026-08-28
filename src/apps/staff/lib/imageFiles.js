const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
  'heif',
]);

export const getFileExtensionFromName = (name = '') => {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const isSupportedImageFile = (file) => {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;

  const ext = getFileExtensionFromName(file.name);
  if (ext) return IMAGE_EXTENSIONS.has(ext);

  // Alcuni browser Android restituiscono type vuoto per immagini scattate al momento.
  return true;
};

export const getSafeImageMimeType = (file) => {
  if (file?.type && file.type.startsWith('image/')) {
    return file.type;
  }

  const ext = getFileExtensionFromName(file?.name || '');
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  return 'image/jpeg';
};
