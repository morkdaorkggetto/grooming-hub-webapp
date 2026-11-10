import { getDateClosure } from '../../../shared/tenant/bookingSchedule.js';

export const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const atNoon = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
const monthIndex = (date) => date.getFullYear() * 12 + date.getMonth();

export const getBookingDateHorizon = (today, schedule) => {
  const lastDay = new Date(today.getFullYear(), today.getMonth() + schedule.maxMonthsAhead + 1, 0).getDate();
  return new Date(today.getFullYear(), today.getMonth() + schedule.maxMonthsAhead,
    Math.min(today.getDate(), lastDay), 12);
};

export const getBookingDateStatus = (date, today, schedule, horizon = getBookingDateHorizon(today, schedule)) => {
  const value = toLocalDateValue(date);
  if (value <= toLocalDateValue(today)) return 'past';
  if (value > toLocalDateValue(horizon)) return 'beyond';
  return getDateClosure(date, schedule).isClosed ? 'closed' : 'available';
};

export const getFirstBookingMonth = (today, schedule) => {
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12);
  let requestable = 0;
  for (let date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12);
    date <= end; date.setDate(date.getDate() + 1)) {
    if (getBookingDateStatus(date, today, schedule) === 'available') requestable += 1;
  }
  return monthIndex(today) + (requestable < 7 ? 1 : 0);
};

export const getLastRequestableDate = (today, schedule) => {
  const horizon = getBookingDateHorizon(today, schedule);
  for (let date = atNoon(horizon); date > today; date.setDate(date.getDate() - 1)) {
    if (getBookingDateStatus(date, today, schedule, horizon) === 'available') return atNoon(date);
  }
  return null;
};

export const getBookingCalendarDays = (month) => {
  const year = Math.floor(month / 12);
  const monthOfYear = month % 12;
  const offset = (new Date(year, monthOfYear, 1).getDay() + 6) % 7;
  const count = new Date(year, monthOfYear + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, index) =>
    index >= offset && index < offset + count
      ? new Date(year, monthOfYear, index - offset + 1, 12)
      : null);
};

export function getBookingFullPeriod(dateValue) {
  if (!dateValue) return null;
  const [, month, day] = dateValue.split('-').map(Number);
  if ((month === 12 && day >= 27) || (month === 1 && day <= 6)) return 'Capodanno';
  if (month === 8 && day >= 8 && day <= 18) return 'Ferragosto';
  if (month === 12 && day >= 15 && day <= 26) return 'Natale';
  return null;
}
