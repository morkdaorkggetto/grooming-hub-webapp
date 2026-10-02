import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/ui/Icon';
import PendingRequest from './PendingRequest';
import { customerActionTitle } from '../lib/customerActions';

export default function PetCardRequests({ items, single, onResponded }) {
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const item = items.find(entry => entry.request.id === selected);
  const open = selected === 'list' ? items.length > 0 : Boolean(item);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
    if (!open && selected) setSelected(null);
  }, [open, selected]);
  const close = () => setSelected(null);
  return <>
    {items.length > 0 && (single ? (
      <button type="button" className="pet-card-alert" onClick={() => setSelected(items.length === 1 ? items[0].request.id : 'list')}>
        <span className="pet-card-alert-icon"><Icon name="bell" size={17} />{items.length > 1 && <b>{items.length}</b>}</span>
        <span className="pet-card-alert-text">{customerActionTitle(items)}</span><Icon name="chevron" size={18} />
      </button>
    ) : <section className="pet-card-home-requests" aria-label="Richieste da fare">
      {items.map(entry => <article key={entry.request.id} className="pet-card-home-request">
        <p className="pet-card-request-eyebrow">{entry.kind === 'slots' ? 'Altri orari proposti' : 'Richiesta da riprogrammare'}</p>
        <p className="gh-body">{entry.kind === 'slots'
          ? <>Per <strong>{entry.request.pet?.name || 'il tuo pet'}</strong> il salone propone altri orari.</>
          : <>La data chiesta per <strong>{entry.request.pet?.name || 'il tuo pet'}</strong> non è disponibile. Scegli un’altra data e riproviamo.</>}</p>
        <button type="button" className="gh-btn gh-btn--outline" onClick={() => setSelected(entry.request.id)}>{customerActionTitle([entry])}</button>
      </article>)}
    </section>)}
    <dialog ref={dialog} className="pet-card-request-sheet" aria-labelledby="pet-card-request-title" onCancel={close} onClose={close}>
      <div className="pet-card-sheet-handle" aria-hidden="true" />
      <h2 id="pet-card-request-title" className="gh-area-title">{item ? customerActionTitle([item]) : customerActionTitle(items)}</h2>
      {!single && item && <p className="gh-body">{item.request.pet?.name || 'Il tuo pet'}</p>}
      {item?.kind === 'slots' ? <PendingRequest key={item.request.id} request={item.request} onResponded={onResponded} embedded />
        : item?.kind === 'date' ? <>
          <p className="gh-body">La data chiesta non è disponibile.</p>
          <Link className="gh-btn gh-btn--primary pet-card-request-book" to={`/u/book?petId=${item.request.pet_id}`} onClick={close}>Scegli un'altra data</Link>
        </> : selected === 'list' ? items.map(entry => <button key={entry.request.id} type="button" className="pet-card-request-row" onClick={() => setSelected(entry.request.id)}>
          <span><strong>{customerActionTitle([entry])}</strong><span>{entry.kind === 'slots' ? 'Il salone propone altri orari.' : 'La data chiesta non è disponibile.'}</span></span><Icon name="chevron" size={18} />
        </button>) : null}
      <button type="button" className="gh-btn gh-btn--outline pet-card-sheet-cancel" onClick={close}>Annulla</button>
    </dialog>
  </>;
}
