const QR_BASE_URL = 'https://api.qrserver.com/v1/create-qr-code/';

const getOrigin = () => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

export const getPublicPetPath = (qrToken) => {
  if (!qrToken) return '/dashboard';
  return `/client-card/${qrToken}`;
};

export const getPublicPetUrl = (qrToken) => {
  const origin = getOrigin();
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

export const getClientQrImageUrl = (qrToken, size = 240) => {
  const targetUrl = getPublicPetUrl(qrToken);
  return `${QR_BASE_URL}?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}`;
};

export const getClientCardCode = (qrToken) => {
  if (!qrToken) return '';
  return qrToken.replace(/^ghc_/, '').slice(-8).toUpperCase();
};
