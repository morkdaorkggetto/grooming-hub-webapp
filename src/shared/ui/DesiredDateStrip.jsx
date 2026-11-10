import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import {
  getBookingCalendarDays,
  getBookingDateHorizon,
  getBookingDateStatus,
  getFirstBookingMonth,
  getLastRequestableDate,
  getBookingFullPeriod,
  toLocalDateValue,
} from '../../apps/customer/lib/bookingDates';
import './DesiredDateStrip.css';

const FULL_DATE = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const MONTH = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });
const SHORT_DATE = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });
const DAYS = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
const SCHEDULE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const legendItems = (schedule, month, hasFullPeriod) => {
  const items = [];
  SCHEDULE_DAYS.forEach((day, index) => {
    if (schedule.closedWeekdays.includes(day)) items.push(`${DAYS[index]} chiuso`);
  });
  SCHEDULE_DAYS.forEach((day, index) => {
    if (schedule.closedWeekdays.includes(day)) return;
    const closed = schedule.closedTimePreferences[day] || [];
    if (closed.length === 1) {
      items.push(`${DAYS[index]} solo ${closed[0] === 'morning' ? 'pomeriggio' : 'mattina'}`);
    }
  });
  schedule.closedDates.forEach((value) => {
    const date = new Date(`${value}T12:00:00`);
    if (date.getFullYear() * 12 + date.getMonth() === month) {
      items.push(`${SHORT_DATE.format(date)} chiuso`);
    }
  });
  if (hasFullPeriod) items.push('periodo pieno');
  return items;
};

// Kept at the existing import path because only the two customer date pickers use it.
export default function DesiredDateCalendar({ schedule, value, onChange, embedded = false, today = new Date() }) {
  const todayValue = toLocalDateValue(today);
  const currentDay = new Date(`${todayValue}T12:00:00`);
  const firstMonth = getFirstBookingMonth(currentDay, schedule);
  const horizon = getBookingDateHorizon(currentDay, schedule);
  const currentMonth = currentDay.getFullYear() * 12 + currentDay.getMonth();
  const lastMonth = horizon.getFullYear() * 12 + horizon.getMonth();
  const [month, setMonth] = useState(firstMonth);

  useEffect(() => { setMonth(firstMonth); }, [firstMonth]);
  useEffect(() => {
    setMonth((previous) => Math.max(currentMonth, Math.min(previous, lastMonth)));
  }, [todayValue, currentMonth, lastMonth]);

  const shownMonth = Math.max(currentMonth, Math.min(month, lastMonth));
  const monthDate = new Date(Math.floor(shownMonth / 12), shownMonth % 12, 1, 12);
  const days = getBookingCalendarDays(shownMonth);
  const hasFullPeriod = days.some((date) => date
    && getBookingDateStatus(date, currentDay, schedule, horizon) === 'available'
    && getBookingFullPeriod(toLocalDateValue(date)));
  const lastDate = getLastRequestableDate(currentDay, schedule);
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;

  return (
    <div className={`gh-date-calendar${embedded ? ' gh-date-calendar--embedded' : ''}`} aria-label="Scegli la data desiderata">
      <div className="gh-date-calendar__panel">
      <div className="gh-date-calendar__head">
        <button type="button" className="gh-date-calendar__arrow" aria-label="Mese precedente" disabled={shownMonth <= currentMonth} onClick={() => setMonth(shownMonth - 1)}><Icon name="chevron-left" size={20} /></button>
        <strong className="gh-date-calendar__month">{MONTH.format(monthDate)}</strong>
        <button type="button" className="gh-date-calendar__arrow" aria-label="Mese successivo" disabled={shownMonth >= lastMonth} onClick={() => setMonth(shownMonth + 1)}><Icon name="chevron" size={20} /></button>
      </div>
      <div className="gh-date-calendar__weekdays" aria-hidden="true">
        {DAYS.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="gh-date-calendar__grid">
        {days.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} className="gh-date-calendar__cell" aria-hidden="true" />;
          const dateValue = toLocalDateValue(date);
          const status = getBookingDateStatus(date, currentDay, schedule, horizon);
          const full = status === 'available' && Boolean(getBookingFullPeriod(dateValue));
          return (
            <button key={dateValue} type="button" className="gh-date-calendar__cell" data-date={dateValue} data-status={status} disabled={status !== 'available'} aria-pressed={value === dateValue} aria-label={`${FULL_DATE.format(date)}${status === 'closed' ? ', chiuso' : status === 'beyond' ? ', oltre il limite' : status === 'past' ? ', non selezionabile' : full ? ', periodo pieno' : ''}`} onClick={() => onChange(dateValue)}>
              <span className="gh-date-calendar__number">
                {date.getDate()}
                {dateValue === todayValue ? <span className="gh-date-calendar__today" aria-hidden="true" /> : null}
                {full ? <span className="gh-date-calendar__dot" aria-hidden="true" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="gh-date-calendar__legend">
        {legendItems(schedule, shownMonth, hasFullPeriod).map((item, index) => (
          <React.Fragment key={item}>
            {index > 0 ? <span aria-hidden="true">·</span> : null}
            <span className={item === 'periodo pieno' ? 'gh-date-calendar__full-legend' : ''}>
              {item === 'periodo pieno' ? <span className="gh-date-calendar__dot" aria-hidden="true" /> : null}{item}
            </span>
          </React.Fragment>
        ))}
        {shownMonth === lastMonth && lastDate ? <span className="gh-date-calendar__limit">Si può chiedere fino a {FULL_DATE.format(lastDate)}.</span> : null}
      </div>
      </div>
      <p className={`gh-date-calendar__selection${selectedDate ? ' gh-date-calendar__selection--chosen' : ''}`} role="status">{selectedDate ? `Hai scelto ${FULL_DATE.format(selectedDate)}` : 'Tocca il giorno che ti andrebbe bene.'}</p>
    </div>
  );
}
