import React, { useId } from 'react';
import './Modal.css';

export default function Modal({
  title,
  children,
  footer,
  onClose,
  closeDisabled = false,
  narrow = false,
  variant = 'default',
}) {
  const titleId = useId();
  const side = variant === 'side';
  const requestClose = () => {
    if (!closeDisabled) onClose();
  };
  return (
    <div
      className={`gh-modal-scrim${side ? ' gh-modal-scrim--side' : ''}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <section
        className={`gh-modal${narrow ? ' gh-modal--narrow' : ''}${side ? ' gh-modal--side' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="gh-modal__head">
          <h2 className="gh-calendar-modal-title" id={titleId}>{title}</h2>
          <button className="gh-modal__close" type="button" onClick={requestClose} disabled={closeDisabled}>Chiudi</button>
        </header>
        <div className="gh-modal__body">{children}</div>
        {footer && <footer className="gh-modal__foot">{footer}</footer>}
      </section>
    </div>
  );
}
