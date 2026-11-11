import React from 'react';
import {
  BOOKING_TIME_PREFERENCES,
  BOOKING_TIME_WINDOWS,
  formatRangeHour,
  isTimePreferenceClosed,
} from '../../../shared/tenant/bookingSchedule';
import '../pages/Book.css';

export default function BookingTimePreferenceChips({ value, closure, onChange }) {
  return (
    <div className="gh-book-time-preference-block">
      <p className="gh-book-time-preference-title">Mattina o pomeriggio? (facoltativo)</p>
      <div className="gh-book-chip-row gh-book-time-preference-row" aria-label="Preferenza oraria facoltativa">
        {BOOKING_TIME_PREFERENCES.map((item) => {
          const window = BOOKING_TIME_WINDOWS[item.value];
          const disabled = isTimePreferenceClosed(item.value, closure);
          return (
            <button
              key={item.value}
              type="button"
              className="gh-book-chip"
              aria-label={disabled && window ? `${window.name} ${window.closedState}` : item.label}
              aria-pressed={value === item.value}
              disabled={disabled}
              onClick={() => onChange(value === item.value ? '' : item.value)}
            >
              {window ? <>
                <span className="gh-book-chip-name">{window.name}</span>
                <span className="gh-book-chip-detail">{disabled
                  ? window.closedState
                  : `${formatRangeHour(window.start)}–${formatRangeHour(window.end)}`}</span>
              </> : <>
                <span className="gh-book-chip-name">Per me</span>
                <span className="gh-book-chip-name">è uguale</span>
              </>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
