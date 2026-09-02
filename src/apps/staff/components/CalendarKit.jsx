import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getBookingTimePreferenceName } from '../../../shared/tenant/bookingSchedule';
import Icon from '../../../shared/ui/Icon';
import { Button, StateTag } from './StaffKit';

const formatWindowTime = (value) => {
  const [hours, minutes] = String(value || '').split(':');
  return minutes === '00' ? String(Number(hours)) : `${Number(hours)}:${minutes}`;
};

const formatWindowRange = (window) =>
  `${formatWindowTime(window.start)}–${formatWindowTime(window.end)}`;

function ItemTags({ item }) {
  return (item.tags || []).map((tag) => (
    <StateTag tone={tag.tone} key={`${item.id}-${tag.label}`}>{tag.label}</StateTag>
  ));
}

function AppointmentChip({ item, onOpen }) {
  const isMatch = item?.isSearchMatch;
  return (
    <button
      className={`gh-planning-chip gh-planning-chip--appointment${isMatch ? ' gh-planning-chip--search-match' : ''}`}
      type="button"
      onClick={() => onOpen(item)}
    >
      <span className="gh-planning-chip__time">{item.time}</span>
      <span className="gh-planning-chip__copy">
        <strong>{item.petName}</strong>
        <small>Appuntamento · {item.duration_minutes}′</small>
        {item.serviceLabel ? (
          <small
            className="gh-planning-chip__service"
            title={item.serviceLabel}
            aria-label={`Servizio: ${item.serviceLabel}`}
          >
            {item.serviceLabel}
          </small>
        ) : null}
      </span>
      <span className="gh-planning-chip__tags"><ItemTags item={item} /></span>
    </button>
  );
}

function RequestChip({ item, onOpen }) {
  const isMatch = item?.isSearchMatch;
  return (
    <button
      className={`gh-planning-chip gh-planning-chip--request${isMatch ? ' gh-planning-chip--search-match' : ''}`}
      type="button"
      onClick={() => onOpen(item)}
    >
      <span className="gh-planning-chip__band">
        {getBookingTimePreferenceName(item.preference).toLowerCase() || 'a piacere'}
      </span>
      <span className="gh-planning-chip__copy">
        <strong>{item.petName}</strong>
        <small>{item.leadTimeLabel || 'Da confermare'}</small>
      </span>
    </button>
  );
}

function PlanningMargin({ load }) {
  const full = load.available === 0;
  return (
    <div className={`gh-planning-margin${full ? ' gh-planning-margin--tight' : ''}`}>
      <Icon name="paw" size={14} />
      <span>{full ? 'Nessuna libera per chi arriva' : <><b className="gh-num">{load.available}</b> {load.available === 1 ? 'libera' : 'libere'} per chi arriva</>}</span>
    </div>
  );
}

function WalkInFooter({ visits, onOpen, detailed = false }) {
  return (
    <div className={`gh-planning-walkins${visits.length ? ' gh-planning-walkins--filled' : ''}${detailed ? ' gh-planning-walkins--detailed' : ''}`}>
      <div className="gh-planning-walkins__summary">
        <span className="gh-planning-walkins__dots" aria-hidden="true">
          {Array.from({ length: Math.min(visits.length, 6) }, (_, index) => <i key={index} />)}
        </span>
        <span><b className="gh-num">{visits.length}</b> {visits.length === 1 ? 'lavorato' : 'lavorati'} sul momento</span>
      </div>
      {detailed && visits.map((visit) => (
        <button className="gh-planning-walkin-row" type="button" onClick={() => onOpen(visit)} key={visit.id}>
          <i aria-hidden="true" />
          <strong>{visit.petName}</strong>
          <span>«{visit.treatments || 'Nessun dettaglio registrato'}»</span>
          <small>Registrato a fine serata</small>
        </button>
      ))}
    </div>
  );
}

function CancelledFooter({ appointments, onOpen }) {
  if (!appointments.length) return null;
  const label = `${appointments.length} ${appointments.length === 1 ? 'annullato' : 'annullati'}`;
  if (appointments.length === 1) {
    return (
      <button className="gh-planning-cancelled" type="button" onClick={() => onOpen(appointments[0])}>
        <span><b className="gh-num">1</b> annullato</span>
        <small>{appointments[0].petName} · apri</small>
      </button>
    );
  }
  return (
    <details className="gh-planning-cancelled gh-planning-cancelled--many">
      <summary>{label}</summary>
      <div>
        {appointments.map((appointment) => (
          <button type="button" onClick={() => onOpen(appointment)} key={appointment.id}>
            {appointment.petName}
          </button>
        ))}
      </div>
    </details>
  );
}

function PlanningBand({ band, onOpen, onBook, showCancelled = false }) {
  const appointments = showCancelled ? band.dayAppointments : band.appointments;
  return (
    <section className={`gh-planning-band${band.isClosed ? ' gh-planning-band--closed' : ''}`}>
      <header className="gh-planning-band__head">
        <div><strong>{band.window.name}</strong><span>{formatWindowRange(band.window)}</span></div>
        {!band.isClosed && <small><b className="gh-num">{band.load.occupied}/{band.load.capacity}</b> postazioni occupate</small>}
      </header>
      {band.isClosed ? (
        <p className="gh-planning-closed">chiuso</p>
      ) : (
        <div className="gh-planning-band__body">
          {band.requests.map((item) => <RequestChip item={item} onOpen={onOpen} key={`request-${item.id}`} />)}
          {appointments.map((item) => <AppointmentChip item={item} onOpen={onOpen} key={`appointment-${item.id}`} />)}
          <PlanningMargin load={band.load} />
          <button className="gh-planning-book" type="button" onClick={() => onBook(band)}>
            <Icon name="plus" size={13} />
            Prenota qui
          </button>
        </div>
      )}
    </section>
  );
}

function UnplacedItems({ items, onOpen }) {
  if (!items.length) return null;
  return (
    <div className="gh-planning-unplaced">
      <span>Da collocare</span>
      {items.map((item) => item.kind === 'request'
        ? <RequestChip item={item} onOpen={onOpen} key={`unplaced-request-${item.id}`} />
        : <AppointmentChip item={item} onOpen={onOpen} key={`unplaced-appointment-${item.id}`} />)}
    </div>
  );
}

const petOptionLabel = (pet) =>
  `${pet.name} · ${pet.owner || 'proprietario non indicato'}`;

export function CalendarPetCombobox({ options, selectedId, onSelect, onCreate }) {
  const listId = useId();
  const selected = options.find((pet) => pet.id === selectedId) || null;
  const [query, setQuery] = useState(selected ? petOptionLabel(selected) : '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = query.trim().toLocaleLowerCase('it');
  const selectedLabel = selected ? petOptionLabel(selected) : '';
  const allMatches = useMemo(() => selected && query === selectedLabel ? [selected] : options.filter((pet) => {
    if (!normalizedQuery) return true;
    return [pet.name, pet.owner, pet.phone, pet.breed]
      .some((value) => String(value || '').toLocaleLowerCase('it').includes(normalizedQuery));
  }), [normalizedQuery, options, query, selected, selectedLabel]);
  const matches = allMatches.slice(0, 12);
  const canCreate = Boolean(query.trim());
  const optionCount = matches.length + (canCreate ? 1 : 0);

  useEffect(() => {
    if (selected) setQuery(selectedLabel);
  }, [selected, selectedLabel]);

  const choosePet = (pet) => {
    onSelect(pet.id);
    setQuery(petOptionLabel(pet));
    setOpen(false);
    setActiveIndex(-1);
  };
  const chooseCreate = () => {
    onCreate(query.trim());
    setOpen(false);
    setActiveIndex(-1);
  };
  const moveActive = (amount) => {
    if (!optionCount) return;
    setOpen(true);
    setActiveIndex((current) => {
      if (current < 0) return amount > 0 ? 0 : optionCount - 1;
      return (current + amount + optionCount) % optionCount;
    });
  };
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === 'Enter' && open && activeIndex >= 0) {
      event.preventDefault();
      if (activeIndex < matches.length) choosePet(matches[activeIndex]);
      else chooseCreate();
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      if (selected) setQuery(petOptionLabel(selected));
    }
  };

  return (
    <div
      className="gh-pet-combobox"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label className="gh-pet-combobox__field">
        <span className="gh-eyebrow--staff gh-field-label">Pet</span>
        <input
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          value={query}
          placeholder="Cerca per pet, proprietario o telefono"
          autoComplete="off"
          onFocus={() => {
            setOpen(true);
            setActiveIndex(optionCount ? 0 : -1);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            onSelect('');
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
      </label>
      <span className="gh-sr-only" aria-live="polite">
        {open ? `${allMatches.length} ${allMatches.length === 1 ? 'risultato' : 'risultati'}.` : ''}
      </span>
      {open && optionCount > 0 && (
        <div className="gh-pet-combobox__list" id={listId} role="listbox">
          {matches.map((pet, index) => (
            <button
              id={`${listId}-${index}`}
              className="gh-pet-combobox__option"
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choosePet(pet)}
              key={pet.id}
            >
              <strong>{pet.name}</strong>
              <span>{pet.owner || 'Proprietario non indicato'}</span>
            </button>
          ))}
          {canCreate && (
            <button
              id={`${listId}-${matches.length}`}
              className="gh-pet-combobox__create"
              type="button"
              role="option"
              aria-selected={activeIndex === matches.length}
              onMouseDown={(event) => event.preventDefault()}
              onClick={chooseCreate}
            >
              {matches.length
                ? <>Nessun altro pet per «{query.trim()}» — creane uno nuovo</>
                : <>Nessun pet per «{query.trim()}» — creane uno nuovo</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultMessage({ isSearchMode, count }) {
  if (!isSearchMode) return null;
  if (!count) return <span className="gh-planning-search-feedback">Nessun appuntamento in questa settimana.</span>;
  const plural = count === 1 ? 'corrispondenza' : 'corrispondenze';
  return <span className="gh-planning-search-feedback"><strong>{count}</strong> {plural} in questa settimana.</span>;
}

export function CalendarNavigation({
  mode,
  rangeLabel,
  compactRangeLabel,
  onMode,
  onPrevious,
  onNext,
  onToday,
  onDate,
  onSearch,
  searchValue,
  searchCount,
  dateValue,
  summary,
}) {
  const dateInputRef = useRef(null);
  const datePickerOpenRef = useRef(false);
  const datePickerFrameRef = useRef(null);
  const [calendarPickerUnavailable, setCalendarPickerUnavailable] = useState(false);
  const dateInputId = useId();
  const dateWarningId = useId();

  useEffect(() => () => cancelAnimationFrame(datePickerFrameRef.current), []);

  const openDatePicker = () => {
    const current = dateInputRef.current;
    if (!current) return;
    if (datePickerOpenRef.current) {
      cancelAnimationFrame(datePickerFrameRef.current);
      datePickerOpenRef.current = false;
      current.blur();
      return;
    }
    if (typeof current.showPicker === 'function' && CSS.supports('selector(:open)')) {
      try {
        current.focus();
        current.showPicker();
        if (!current.matches(':open')) throw new Error('Date picker unavailable');
        setCalendarPickerUnavailable(false);
        // Native pickers close before pointerdown and consume Escape without a DOM event.
        const trackPicker = () => {
          datePickerOpenRef.current = current.matches(':open');
          if (datePickerOpenRef.current) {
            datePickerFrameRef.current = requestAnimationFrame(trackPicker);
          }
        };
        trackPicker();
        return;
      } catch {
        // The visible date field remains usable when rapid opening is unavailable.
      }
    }
    setCalendarPickerUnavailable(true);
    current.focus();
  };

  return (
    <div className="gh-planning-toolbar">
      <div className="gh-planning-navigation">
        <div className="gh-planning-switch" aria-label="Vista calendario">
          {['week', 'day'].map((value) => (
            <button type="button" aria-pressed={mode === value} onClick={() => onMode(value)} key={value}>
              {value === 'week' ? 'Settimana' : 'Giorno'}
            </button>
          ))}
        </div>
        <Button staff className="gh-planning-previous" variant="outline" icon="chevron-left" aria-label={mode === 'week' ? 'Settimana precedente' : 'Giorno precedente'} onClick={onPrevious} />
        <button className="gh-planning-range" type="button" aria-label={mode === 'week' ? 'Torna a questa settimana' : 'Torna a oggi'} onClick={onToday}>
          <span className="gh-planning-range__wide">{rangeLabel}</span>
          <span className="gh-planning-range__compact">{compactRangeLabel || rangeLabel}</span>
        </button>
          <Button staff className="gh-planning-next" variant="outline" icon="chevron" aria-label={mode === 'week' ? 'Settimana successiva' : 'Giorno successivo'} onClick={onNext} />
        <div className={`gh-calendar-date-jump${calendarPickerUnavailable ? ' gh-calendar-date-jump--fallback' : ''}`}>
          <label className="gh-sr-only" htmlFor={dateInputId}>Vai a data</label>
          <input
            id={dateInputId}
            ref={dateInputRef}
            className="gh-calendar-date-input"
            type="date"
            tabIndex={calendarPickerUnavailable ? 0 : -1}
            aria-describedby={calendarPickerUnavailable ? dateWarningId : undefined}
            value={dateValue}
            onChange={onDate}
          />
          <button className="gh-calendar-date-jump__button" type="button" aria-label="Vai a data" title="Vai a data" onClick={openDatePicker}>
            <Icon name="calendar" size={16} />
          </button>
          {calendarPickerUnavailable ? <span id={dateWarningId} className="gh-calendar-date-jump__warning" role="status">Il browser non consente l'apertura rapida.</span> : null}
        </div>
        <label className="gh-planning-search">
          <span>Cerca</span>
          <input
            type="search"
            value={searchValue || ''}
            placeholder="pet, proprietario, cell"
            onChange={(event) => onSearch(event.target.value)}
            className="gh-planning-search__input"
          />
        </label>
      </div>
      {summary && (
        <div className="gh-planning-summary">
          <span><b className="gh-num">{summary.appointments}</b> prenotati</span>
          {summary.requests > 0 && <span className="gh-planning-summary__pending"><b className="gh-num">{summary.requests}</b> da confermare</span>}
          <span><b className="gh-num">{summary.walkIns}</b> {summary.walkIns === 1 ? 'lavorato' : 'lavorati'} sul momento</span>
        </div>
      )}
      <SearchResultMessage isSearchMode={Boolean(searchValue)} count={searchCount || 0} />
    </div>
  );
}

export function CalendarPlanningWeek({ days, onOpen, onBook, onSelectDay }) {
  return (
    <div className="gh-planning-week">
      {days.map((day) => (
        <article className={`gh-planning-day${day.isToday ? ' gh-planning-day--today' : ''}${day.closure.isClosed ? ' gh-planning-day--closed' : ''}`} key={day.date}>
          <button className="gh-planning-day__head" type="button" onClick={() => onSelectDay(day.date)}>
            <span>{day.weekday}</span><strong>{day.dayNumber}</strong>
            {day.isToday && <small>Oggi</small>}
          </button>
          {day.closure.isClosed ? (
            <div className="gh-planning-day__closed"><span>chiuso</span></div>
          ) : (
            <>
              {day.bands.map((band) => <PlanningBand band={band} onOpen={onOpen} onBook={onBook} key={band.window.value} />)}
              <UnplacedItems items={day.unplacedItems} onOpen={onOpen} />
            </>
          )}
          <footer className="gh-planning-day__foot">
            <WalkInFooter visits={day.visits} onOpen={onOpen} />
            <CancelledFooter appointments={day.cancelledAppointments} onOpen={onOpen} />
          </footer>
        </article>
      ))}
    </div>
  );
}

export function CalendarPlanningDay({ day, onOpen, onBook }) {
  if (!day) return null;
  return (
    <div className="gh-planning-day-view">
      {day.closure.isClosed ? (
        <section className="gh-planning-day-view__closed"><span>chiuso</span></section>
      ) : (
        <div className="gh-planning-day-view__bands">
          {day.bands.map((band) => <PlanningBand band={band} onOpen={onOpen} onBook={onBook} showCancelled key={band.window.value} />)}
        </div>
      )}
      <UnplacedItems items={day.dayUnplacedItems || day.unplacedItems} onOpen={onOpen} />
      <section className="gh-planning-day-view__walkins">
        <header><span>Lavorati sul momento</span><strong>{day.visits.length} pet, senza ora fissata</strong></header>
        <WalkInFooter visits={day.visits} onOpen={onOpen} detailed />
      </section>
    </div>
  );
}

export function CalendarLoading() {
  return (
    <div className="gh-planning-week gh-planning-week--loading" aria-busy="true">
      {Array.from({ length: 7 }, (_, index) => (
        <div className="gh-planning-day" key={index}>
          <div className="gh-planning-loading-block gh-planning-loading-block--head" />
          <div className="gh-planning-loading-block" />
          <div className="gh-planning-loading-block" />
          <div className="gh-planning-loading-block gh-planning-loading-block--foot" />
        </div>
      ))}
    </div>
  );
}
