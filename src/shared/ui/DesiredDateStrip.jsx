import React from 'react';
import './DesiredDateStrip.css';

const WEEKDAY = new Intl.DateTimeFormat('it-IT', { weekday: 'short' });
const FULL_DATE = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function DesiredDateStrip({ dates, value, onChange }) {
  return (
    <div className="gh-desired-date-strip" aria-label="Scegli la data desiderata">
      {dates.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            className="gh-desired-date"
            aria-pressed={selected}
            aria-label={FULL_DATE.format(item.date)}
            onClick={() => onChange(item.value)}
          >
            <span className="gh-desired-date__weekday">
              {WEEKDAY.format(item.date).replace('.', '')}
            </span>
            <span className="gh-desired-date__day">{item.date.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}
