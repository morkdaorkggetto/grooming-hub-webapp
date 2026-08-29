import React, { useEffect, useState } from 'react';
import { getClientQrImageUrl } from '../lib/qrCode';

export default function ClientQrImage({ qrToken, size, alt, className = '' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    setSrc('');

    getClientQrImageUrl(qrToken, size)
      .then((dataUrl) => {
        if (active) setSrc(dataUrl);
      })
      .catch(() => {
        if (active) setSrc('');
      });

    return () => {
      active = false;
    };
  }, [qrToken, size]);

  if (!src) {
    return <span className={className} style={{ width: size, height: size }} aria-hidden="true" />;
  }

  return <img src={src} alt={alt} className={className} width={size} height={size} />;
}
