import { useEffect, useState } from 'react';

export function useCardManifest(pet) {
  const [readyFor, setReadyFor] = useState(null);
  useEffect(() => {
    if (!pet) return;
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return;
    const previousHref = link.getAttribute('href');
    let live = true;
    let objectUrl;
    // A distinct start URL and id retain this card when installed, not the staff root.
    fetch('/manifest.webmanifest').then(response => {
      if (!response.ok) throw new Error('Manifest non disponibile');
      return response.json();
    }).then(manifest => {
      if (!live) return;
      const cardUrl = new URL(`/u/card/${encodeURIComponent(pet.id)}`, window.location.origin).href;
      const personalized = {
        ...manifest,
        id: cardUrl,
        start_url: cardUrl,
        scope: new URL('/u/', window.location.origin).href,
        name: `La tessera di ${pet.name}`,
        short_name: pet.name,
        icons: manifest.icons.map(icon => ({ ...icon, src: new URL(icon.src, window.location.origin).href })),
        shortcuts: [{ name: 'La tessera', url: cardUrl }],
      };
      objectUrl = URL.createObjectURL(new Blob([JSON.stringify(personalized)], { type: 'application/manifest+json' }));
      link.setAttribute('href', objectUrl);
      setReadyFor(pet.id);
    }).catch(() => {});
    return () => {
      live = false;
      if (objectUrl && link.getAttribute('href') === objectUrl) link.setAttribute('href', previousHref);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pet?.id, pet?.name]);
  return Boolean(pet && readyFor === pet.id);
}
