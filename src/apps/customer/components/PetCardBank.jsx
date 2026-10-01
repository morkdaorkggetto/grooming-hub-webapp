import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Eyebrow from '../../../shared/ui/Eyebrow';
import './pet-card.css';

export default function PetCardBank({ pet, qr, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const root = document.getElementById('root');
    const previousInert = root?.inert;
    const previousOverflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'Tab') { event.preventDefault(); closeRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let live = true;
    let lock = null;
    let acquiring = false;
    const release = () => { lock?.release().catch(() => {}); lock = null; };
    const request = async () => {
      if (!live || acquiring || lock || document.visibilityState !== 'visible') return;
      acquiring = true;
      try {
        const acquired = await navigator.wakeLock.request('screen');
        if (!live || document.visibilityState !== 'visible') await acquired.release();
        else {
          lock = acquired;
          acquired.addEventListener('release', () => { if (lock === acquired) lock = null; });
        }
      } catch { /* Screen lock is optional, including when permission is denied. */ }
      finally { acquiring = false; }
    };
    const onVisibility = () => document.visibilityState === 'visible' ? request() : release();
    request();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', onVisibility);
      release();
    };
  }, []);

  return createPortal(<div className="pet-card-bank" role="dialog" aria-modal="true" aria-labelledby="pet-card-bank-name">
    <button ref={closeRef} type="button" className="gh-btn gh-btn--outline pet-card-bank-close" onClick={onClose}>Chiudi</button>
    <div className="pet-card-bank-content">
      <Eyebrow style={{ justifyContent: 'center', color: 'var(--color-primary)' }}>GROOMING HUB</Eyebrow>
      <img className="pet-card-bank-qr" src={qr} alt={`QR della scheda pubblica di ${pet.name}`} />
      <h1 className="gh-pet-name" style={{ fontSize: 'var(--font-size-pet-hero-mobile)' }} id="pet-card-bank-name">{pet.name}</h1>
    </div>
  </div>, document.body);
}
