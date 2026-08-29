import React from 'react';
import { getBookingTimePreferenceName } from '../../../shared/tenant/bookingSchedule';
import Icon from '../../../shared/ui/Icon';
import PetAvatar from '../../../shared/ui/PetAvatar';
import { Button, EmptyState, Panel, SkeletonRow, StateTag } from './StaffKit';

export function CalendarWhen({ kind, time, preference }) {
  return (
    <span className={`gh-calendar-when gh-calendar-when--${kind}`}>
      {kind === 'appointment' && <span className="gh-calendar-time">{time}</span>}
      {kind === 'request' && (
        <span className="gh-calendar-band">
          {getBookingTimePreferenceName(preference).toLowerCase() || preference || 'a piacere'}
        </span>
      )}
      {kind === 'visit' && <span className="gh-calendar-visit-mark" aria-label="Senza orario" />}
    </span>
  );
}

export function CalendarRow({ item, onOpen, compact = false }) {
  const tags = item.tags || [];
  return (
    <div className={`gh-calendar-row gh-calendar-row--${item.kind}${compact ? ' gh-calendar-row--compact' : ''}`}>
      <button className="gh-calendar-row__main" type="button" onClick={() => onOpen(item)}>
        <CalendarWhen kind={item.kind} time={item.time} preference={item.preference} />
        <PetAvatar name={item.petName} photo={item.photo} size={30} tier="base" />
        <span className="gh-calendar-row__copy">
          <span className="gh-calendar-row__title">
            <span>{item.petName}</span>
            {item.kind === 'request' && <StateTag tone="warning">In attesa</StateTag>}
            {tags.map((tag) => (
              <StateTag tone={tag.tone} key={`${item.id}-${tag.label}`}>{tag.label}</StateTag>
            ))}
          </span>
          <span className={`gh-calendar-row__meta${item.kind === 'visit' ? ' gh-calendar-row__meta--verbatim' : ''}`}>
            {item.subtitle}
          </span>
        </span>
        <Icon className="gh-calendar-row__chevron" name="chevron" size={15} />
      </button>
      {item.kind === 'request' && !compact && (
        <Button staff className="gh-calendar-row__action" onClick={() => onOpen(item)}>
          Conferma
        </Button>
      )}
      {item.kind === 'appointment' && !compact && (
        <span className="gh-calendar-confirmed-dot" title="Appuntamento confermato" />
      )}
    </div>
  );
}

export function CalendarDay({ day, today, selected = false, onOpen }) {
  const requests = day.items.filter((item) => item.kind === 'request');
  const appointments = day.items.filter((item) => item.kind === 'appointment');
  const visits = day.items.filter((item) => item.kind === 'visit');
  return (
    <section className={`gh-calendar-day${today ? ' gh-calendar-day--today' : ''}${selected ? ' gh-calendar-day--selected' : ''}${day.closure?.isClosed ? ' gh-calendar-day--closed' : ''}`}>
      <header className="gh-calendar-day__head">
        <h3>{day.label}</h3>
        {today && <span className="gh-calendar-day__today">Oggi</span>}
        {day.closure?.label && <span className="gh-calendar-day__closure">{day.closure.label}</span>}
        <span className={`gh-calendar-day__count${requests.length ? ' gh-calendar-day__count--pending' : ''}`}>
          {requests.length ? `${requests.length} da confermare` : day.items.length ? `${day.items.length} ${day.items.length === 1 ? 'voce' : 'voci'}` : 'niente'}
        </span>
      </header>
      {!day.items.length ? (
        <p className="gh-calendar-day__empty">
          {day.closure?.isClosed
            ? 'Salone chiuso.'
            : day.closure?.label
              ? `${day.closure.label}. Nessuna attività registrata.`
              : 'Nessuna richiesta, nessuna lavorazione.'}
        </p>
      ) : (
        <div className="gh-calendar-day__items">
          {[...requests, ...appointments].map((item) => (
            <CalendarRow item={item} onOpen={onOpen} key={`${item.kind}-${item.id}`} />
          ))}
          {!!visits.length && (
            <div className="gh-calendar-visits">
              <div className="gh-calendar-visits__label">Registrato dal salone</div>
              {visits.map((item) => (
                <CalendarRow item={item} onOpen={onOpen} key={`${item.kind}-${item.id}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function CalendarNavigation({ rangeLabel, onPrevious, onNext, onToday, onDate, dateValue }) {
  return (
    <div className="gh-calendar-nav">
      <div className="gh-calendar-nav__stepper">
        <Button staff variant="ghost" icon="arrow" aria-label="Settimana precedente" title="Settimana precedente" onClick={onPrevious} />
        <strong>{rangeLabel}</strong>
        <Button staff variant="ghost" icon="arrow" aria-label="Settimana successiva" title="Settimana successiva" className="gh-calendar-next" onClick={onNext} />
      </div>
      <div className="gh-calendar-nav__tools">
        <Button staff variant="outline" onClick={onToday}>Questa settimana</Button>
        <label className="gh-calendar-date-jump">
          <span>Vai a data</span>
          <input type="date" value={dateValue} onChange={onDate} />
        </label>
      </div>
    </div>
  );
}

export function CalendarDayStrip({ days, selectedDate, onSelect }) {
  return (
    <div className="gh-calendar-day-strip" aria-label="Giorni della settimana">
      {days.map((day) => {
        const pending = day.items.some((item) => item.kind === 'request');
        return (
          <button
            type="button"
            className={`gh-calendar-day-chip${selectedDate === day.date ? ' gh-calendar-day-chip--selected' : ''}${day.closure?.isClosed ? ' gh-calendar-day-chip--closed' : ''}`}
            aria-pressed={selectedDate === day.date}
            aria-label={`${day.label}${day.closure?.label ? `, ${day.closure.label}` : ''}`}
            onClick={() => onSelect(day.date)}
            key={day.date}
          >
            <span>{day.shortWeekday}</span>
            <strong>{day.dayNumber}</strong>
            {day.closure?.label && (
              <span className="gh-calendar-day-chip__closure" aria-hidden="true">
                {day.closure.isClosed ? 'Ch.' : 'AM'}
              </span>
            )}
            {!!day.items.length && <i className={pending ? 'gh-calendar-day-chip__dot--pending' : ''} />}
          </button>
        );
      })}
    </div>
  );
}

export function CalendarQueue({ items, onOpen }) {
  return (
    <Panel
      eyebrow="Da confermare"
      title={items.length ? `${items.length} richieste in attesa` : 'Nessuna richiesta'}
      right={items.length ? <span className="gh-meta">arrivano dall'app</span> : null}
      flush
    >
      {items.length ? (
        <div className="gh-calendar-queue">
          {items.map((item) => (
            <div className="gh-calendar-queue__item" key={`queue-${item.id}`}>
              <CalendarRow compact item={item} onOpen={onOpen} />
              <Button staff wide onClick={() => onOpen(item)}>Conferma o rifiuta</Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Coda libera" body="Le nuove richieste compariranno qui e nel giorno scelto." />
      )}
    </Panel>
  );
}

export function CalendarWeekSummary({ appointments, visits, requests, onOpenReport }) {
  return (
    <Panel eyebrow="Chiusura settimana" title="Presenze e ritorni">
      <dl className="gh-calendar-summary">
        <div><dt>Appuntamenti</dt><dd>{appointments}</dd></div>
        <div><dt>Lavorazioni</dt><dd>{visits}</dd></div>
        <div><dt>In attesa</dt><dd>{requests}</dd></div>
      </dl>
      <Button staff variant="outline" wide icon="arrow" onClick={onOpenReport}>Apri il report settimanale</Button>
    </Panel>
  );
}

export function CalendarLoading() {
  return (
    <div className="gh-calendar-loading" aria-busy="true">
      {Array.from({ length: 7 }, (_, index) => (
        <div className="gh-calendar-loading__day" key={index}>
          <SkeletonRow />
        </div>
      ))}
    </div>
  );
}
