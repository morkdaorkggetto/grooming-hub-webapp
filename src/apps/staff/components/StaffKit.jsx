import React from 'react';
import Button from '../../../shared/ui/Button';
import Eyebrow from '../../../shared/ui/Eyebrow';
import FidelityBadge from '../../../shared/ui/FidelityBadge';
import Icon from '../../../shared/ui/Icon';
import PetAvatar from '../../../shared/ui/PetAvatar';
import Skeleton from '../../../shared/ui/Skeleton';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

export function Hero({ title, subtitle, right, className = '' }) {
  return (
    <header className={joinClasses('gh-hero', className)}>
      <div className="gh-hero__copy">
        <Eyebrow staff accent>Grooming Hub</Eyebrow>
        <h1 className="gh-h1">{title}</h1>
        {subtitle && <p className="gh-hero__subtitle">{subtitle}</p>}
      </div>
      {right && <div className="gh-hero__right">{right}</div>}
    </header>
  );
}

export function HeroButton({ children, className = '', ...props }) {
  return (
    <button className={joinClasses('gh-hero-button', className)} type="button" {...props}>
      {children}
    </button>
  );
}

export function Panel({
  eyebrow,
  title,
  right,
  children,
  bridge = false,
  flush = false,
  className = '',
  bodyClassName = '',
}) {
  return (
    <section className={joinClasses('gh-panel', bridge && 'gh-panel--bridge', className)}>
      {(eyebrow || title || right) && (
        <div className="gh-panel__head">
          <div className="gh-panel__heading">
            {eyebrow && (
              <Eyebrow staff accent className="gh-panel__eyebrow">
                {eyebrow}
              </Eyebrow>
            )}
            {title && <h2 className="gh-panel-title">{title}</h2>}
          </div>
          {right}
        </div>
      )}
      {children != null && (
        <div className={joinClasses('gh-panel__body', flush && 'gh-panel__body--flush', bodyClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}

export function Field({ label, area = false, as, className = '', children, inputRef, ...props }) {
  const Control = as || (area ? 'textarea' : 'input');
  const controlClassName = joinClasses('gh-field', area && 'gh-field--area');
  return (
    <label className={joinClasses('gh-field-wrap', className)}>
      {label && (
        <Eyebrow staff className="gh-field-label">
          {label}
        </Eyebrow>
      )}
      {Control === 'input' ? (
        <input ref={inputRef} className={controlClassName} {...props} />
      ) : (
        <Control ref={inputRef} className={controlClassName} {...props}>{children}</Control>
      )}
    </label>
  );
}

export function SearchBar({ className = '', ...props }) {
  return (
    <label className={joinClasses('gh-search', className)}>
      <Icon name="search" size={16} />
      <input className="gh-search__input" type="search" {...props} />
    </label>
  );
}

export function Pill({ children, count, pressed = false, ...props }) {
  return (
    <button className="gh-pill" type="button" aria-pressed={pressed} {...props}>
      <span>{children}</span>
      {count != null && <span className="gh-pill__count">{count}</span>}
    </button>
  );
}

export function StatStrip({ items, columns }) {
  return (
    <div
      className="gh-stat-strip"
      style={{ '--gh-stat-columns': columns || items.length }}
    >
      {items.map((item) => (
        <div
          className={joinClasses(
            'gh-stat-strip__cell',
            item.tone === 'danger' && 'gh-stat-strip__cell--danger'
          )}
          key={item.label}
        >
          <Eyebrow staff>{item.label}</Eyebrow>
          <div className="gh-stat-num">{item.value}</div>
          {item.helper && <div className="gh-stat-strip__note">{item.helper}</div>}
        </div>
      ))}
    </div>
  );
}

export function AreaTile({ eyebrow, title, description, metric, icon, accent, onClick }) {
  return (
    <button
      className="gh-tile"
      type="button"
      onClick={onClick}
      style={{ '--gh-accent': accent }}
    >
      <div className="gh-tile__top">
        <div>
          <Eyebrow staff style={{ color: accent }}>{eyebrow}</Eyebrow>
          <div className="gh-area-title">{title}</div>
        </div>
        <Icon name={icon} size={19} style={{ color: accent }} />
      </div>
      <p className="gh-tile__copy">{description}</p>
      <div className="gh-tile__foot">
        <span className="gh-num">{metric}</span>
        <Icon name="chevron" size={15} style={{ color: accent }} />
      </div>
    </button>
  );
}

export function TierDot({ tier = 'base' }) {
  const normalizedTier = {
    bronzo: 'bronze',
    argento: 'silver',
    oro: 'gold',
    none: 'base',
  }[tier] || tier;
  return <span className={`gh-tier-dot gh-tier-dot--${normalizedTier}`} title={tier} />;
}

export function StateTag({ tone = 'success', children }) {
  return <span className={`gh-state-tag gh-state-tag--${tone}`}>{children}</span>;
}

export function SkeletonRow() {
  return (
    <div className="gh-skeleton-row">
      <Skeleton staff width={30} height={30} style={{ borderRadius: 8 }} />
      <div className="gh-skeleton-row__copy">
        <Skeleton staff width="42%" height={10} />
        <Skeleton staff width="26%" height={8} />
      </div>
      <Skeleton staff width={54} height={9} />
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="gh-empty-state">
      <h3 className="gh-empty-state__title">{title}</h3>
      <p className="gh-empty-state__body">{body}</p>
      {action && <div className="gh-empty-state__action">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Non è stato salvato', body, action }) {
  return (
    <div className="gh-error-state" role="alert">
      <Icon name="bell" size={16} style={{ color: 'var(--color-danger-text)' }} />
      <div>
        <div className="gh-error-state__title">{title}</div>
        <div className="gh-error-state__body">{body}</div>
        {action}
      </div>
    </div>
  );
}

export function ClientRow({ client, tier, state, visitsText, lastVisit, onClick }) {
  const stateTone = state === 'Blacklist' ? 'danger' : state === 'A rischio' ? 'warning' : null;
  return (
    <button className="gh-row gh-client-row" type="button" onClick={onClick}>
      <span className="gh-client-row__identity">
        <PetAvatar name={client.name} photo={client.photo} size={30} tier={tier} />
        <span className="gh-client-row__copy">
          <span className="gh-client-row__name">
            <span className="gh-pet-name--row">{client.name}</span>
            <TierDot tier={tier} />
            {stateTone && <StateTag tone={stateTone}>{state}</StateTag>}
          </span>
          <span className="gh-client-row__sub">
            {client.breed || 'Razza non specificata'}
            <span className="gh-client-row__desktop"> · {client.owner}</span>
          </span>
        </span>
      </span>
      <span className="gh-client-row__cell gh-client-row__cell--strong gh-client-row__desktop">
        {client.owner}
      </span>
      <span className="gh-client-row__cell gh-num gh-client-row__desktop">{client.phone || '—'}</span>
      <span className="gh-client-row__cell gh-client-row__cell--strong gh-num gh-client-row__desktop">
        {visitsText}
      </span>
      <span className="gh-client-row__cell gh-num">{lastVisit}</span>
      <Icon className="gh-client-row__desktop" name="chevron" size={14} />
    </button>
  );
}

export function Fab({ label, icon = 'plus', always = false, ...props }) {
  return (
    <button
      className={joinClasses('gh-fab', always && 'gh-fab--always')}
      type="button"
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} size={24} stroke={2.2} />
    </button>
  );
}

export function ScoreScale() {
  return (
    <span className="gh-score" aria-hidden="true">
      {[-3, -2, -1, 0, 1, 2, 3].map((value) => (
        <span
          className={joinClasses(
            'gh-score__tick',
            value < 0 && 'gh-score__tick--negative',
            value === 0 && 'gh-score__tick--zero'
          )}
          key={value}
        />
      ))}
    </span>
  );
}

export function DayChip({ label, sub, pressed = false, ...props }) {
  return (
    <button className="gh-day-chip" type="button" aria-pressed={pressed} {...props}>
      <span className="gh-day-chip__label">{label}</span>
      <span className="gh-day-chip__sub gh-num">{sub}</span>
    </button>
  );
}

export function VisitRow({ visit, date, onDelete }) {
  const price = Number(visit.cost || 0).toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
  });
  return (
    <div className="gh-visit-row">
      <span className="gh-meta gh-num">{date}</span>
      <span className="gh-visit-row__main">
        <span className="gh-visit-row__treatment">
          {visit.treatments || 'Nessun dettaglio registrato'}
        </span>
        {visit.issues && <span className="gh-visit-row__issues">{visit.issues}</span>}
      </span>
      <span className="gh-price">{price}</span>
      {onDelete && (
        <Button
          staff
          variant="ghost"
          icon="trash"
          aria-label="Elimina visita"
          title="Elimina visita"
          onClick={onDelete}
        />
      )}
    </div>
  );
}

export { Button, FidelityBadge, PetAvatar };
