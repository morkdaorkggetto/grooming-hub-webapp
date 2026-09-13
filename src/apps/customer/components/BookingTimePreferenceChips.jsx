import React from 'react';
import {
  BOOKING_TIME_PREFERENCES,
  isTimePreferenceClosed,
} from '../../../shared/tenant/bookingSchedule';
import '../pages/Book.css';

export default function BookingTimePreferenceChips({ value, closure, onChange }) {
  return (
    <div className="gh-book-chip-row" aria-label="Preferenza oraria facoltativa">
      {BOOKING_TIME_PREFERENCES.map((item) => {
        const disabled = isTimePreferenceClosed(item.value, closure);
        return (
          <button
            key={item.value}
            type="button"
            className="gh-book-chip"
            aria-pressed={value === item.value}
            disabled={disabled}
            onClick={() => onChange(value === item.value ? '' : item.value)}
          >
            {item.label}
            {disabled ? <small>Non disponibile</small> : null}
          </button>
        );
      })}
    </div>
  );
}
