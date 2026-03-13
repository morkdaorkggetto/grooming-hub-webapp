const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Impossibile caricare l\'immagine selezionata.'));
    image.src = src;
  });

export const cropImageSquare = async (
  file,
  { zoom = 1, offsetX = 0, offsetY = 0, outputSize = 960 } = {}
) => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(objectUrl);
    const { naturalWidth, naturalHeight } = image;
    const baseScale = Math.max(1 / naturalWidth, 1 / naturalHeight);
    const effectiveScale = baseScale * zoom;
    const cropSize = 1 / effectiveScale;

    const centeredX = (naturalWidth - cropSize) / 2;
    const centeredY = (naturalHeight - cropSize) / 2;
    const maxOffsetX = Math.max(0, centeredX);
    const maxOffsetY = Math.max(0, centeredY);

    const sx = Math.min(
      Math.max(centeredX - offsetX / effectiveScale, 0),
      naturalWidth - cropSize
    );
    const sy = Math.min(
      Math.max(centeredY - offsetY / effectiveScale, 0),
      naturalHeight - cropSize
    );

    const clampedSx = Math.min(Math.max(sx, 0), naturalWidth - cropSize);
    const clampedSy = Math.min(Math.max(sy, 0), naturalHeight - cropSize);
    const safeCropSize = Math.min(cropSize, naturalWidth, naturalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;

    const context = canvas.getContext('2d');
    context.drawImage(
      image,
      clampedSx,
      clampedSy,
      safeCropSize,
      safeCropSize,
      0,
      0,
      outputSize,
      outputSize
    );

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error('Impossibile generare la foto ritagliata.'));
            return;
          }
          resolve(result);
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        0.92
      );
    });

    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const croppedFile = new File([blob], `cropped-${Date.now()}.${extension}`, {
      type: blob.type,
      lastModified: Date.now(),
    });

    return {
      file: croppedFile,
      previewUrl: URL.createObjectURL(croppedFile),
      meta: {
        naturalWidth,
        naturalHeight,
        maxOffsetX,
        maxOffsetY,
      },
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
