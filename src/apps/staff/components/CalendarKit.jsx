import React from 'react';
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
  return (
    <button className="gh-planning-chip gh-planning-chip--appointment" type="button" onClick={() => onOpen(item)}>
      <span className="gh-planning-chip__time">{item.time}</span>
      <span className="gh-planning-chip__copy">
        <strong>{item.petName}</strong>
        <small>{item.serviceLabel} · {item.duration_minutes}′</small>
      </span>
      <span className="gh-planning-chip__tags"><ItemTags item={item} /></span>
    </button>
  );
}

function RequestChip({ item, onOpen }) {
  return (
    <button className="gh-planning-chip gh-planning-chip--request" type="button" onClick={() => onOpen(item)}>
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

export function CalendarNavigation({ mode, rangeLabel, compactRangeLabel, onMode, onPrevious, onNext, onToday, onDate, dateValue, summary }) {
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
        <label className="gh-calendar-date-jump">
          <span>Vai a data</span>
          <input type="date" value={dateValue} onChange={onDate} />
        </label>
      </div>
      {summary && (
        <div className="gh-planning-summary">
          <span><b className="gh-num">{summary.appointments}</b> prenotati</span>
          {summary.requests > 0 && <span className="gh-planning-summary__pending"><b className="gh-num">{summary.requests}</b> da confermare</span>}
          <span><b className="gh-num">{summary.walkIns}</b> {summary.walkIns === 1 ? 'lavorato' : 'lavorati'} sul momento</span>
        </div>
      )}
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
