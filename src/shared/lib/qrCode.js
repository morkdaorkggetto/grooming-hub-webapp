import createQrCode from 'qrcode-generator';

const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL || '').trim();

const getOrigin = () => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

const getPublicAppOrigin = () => {
  if (PUBLIC_APP_URL) {
    return PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  return getOrigin();
};

export const getPublicPetPath = (qrToken) => {
  if (!qrToken) return '/dashboard';
  return `/client-card/${qrToken}`;
};

export const getPublicPetUrl = (qrToken) => {
  const origin = getPublicAppOrigin();
  return `${origin}${getPublicPetPath(qrToken)}`;
};

export const getClientCardPath = (qrToken, options = {}) => {
  if (!qrToken) return '/dashboard';

  const params = new URLSearchParams();
  if (options.print) {
    params.set('print', '1');
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return `/client-card/internal/${qrToken}${suffix}`;
};

export const getClientCardUrl = (qrToken, options = {}) => {
  const origin = getOrigin();
  return `${origin}${getClientCardPath(qrToken, options)}`;
};

export const getClientQrImageUrl = async (qrToken, size = 240) => {
  const targetUrl = getPublicPetUrl(qrToken);
  const qr = createQrCode(0, 'M');
  qr.addData(targetUrl);
  qr.make();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas non disponibile per generare il QR.');

  const outputSize = Math.max(1, Math.round(Number(size) || 240));
  const margin = 4;
  const moduleCount = qr.getModuleCount();
  const gridSize = moduleCount + margin * 2;
  const scale = outputSize / gridSize;

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, outputSize, outputSize);
  context.fillStyle = '#2b2525';

  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (!qr.isDark(row, column)) continue;
      const left = Math.round((column + margin) * scale);
      const top = Math.round((row + margin) * scale);
      const right = Math.round((column + margin + 1) * scale);
      const bottom = Math.round((row + margin + 1) * scale);
      context.fillRect(left, top, right - left, bottom - top);
    }
  }

  return canvas.toDataURL('image/png');
};

export const getClientCardCode = (qrToken) => {
  if (!qrToken) return '';
  return qrToken.replace(/^ghc_/, '').slice(-8).toUpperCase();
};
