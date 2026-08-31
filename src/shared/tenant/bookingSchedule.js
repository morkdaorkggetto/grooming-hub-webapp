const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const BOOKING_TIME_WINDOWS = Object.freeze({
  morning: Object.freeze({
    value: 'morning',
    name: 'Mattina',
    start: '09:00',
    end: '13:00',
    closedLabel: 'Mattina chiusa',
  }),
  afternoon: Object.freeze({
    value: 'afternoon',
    name: 'Pomeriggio',
    start: '13:00',
    end: '19:00',
    closedLabel: 'Pomeriggio chiuso',
  }),
});

const TIME_PREFERENCE_ALIASES = {
  mattina: 'morning',
  pomeriggio: 'afternoon',
  indifferente: 'flexible',
};

const formatRangeHour = (value) => String(Number(value.split(':')[0]));
const toMinutes = (value) => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const normalizeTimePreference = (value) => TIME_PREFERENCE_ALIASES[value] || value;

export const BOOKING_TIME_PREFERENCES = Object.freeze([
  ...Object.values(BOOKING_TIME_WINDOWS).map((window) => Object.freeze({
    value: window.value,
    label: `${window.name} (${formatRangeHour(window.start)}–${formatRangeHour(window.end)})`,
  })),
  Object.freeze({ value: 'flexible', label: 'Per me è uguale' }),
]);

export const getBookingTimePreferenceLabel = (value, flexibleLabel = 'Per me è uguale') => {
  const normalized = normalizeTimePreference(value);
  if (normalized === 'flexible') return flexibleLabel;
  return BOOKING_TIME_PREFERENCES.find((item) => item.value === normalized)?.label || '';
};

export const getBookingTimePreferenceName = (value, flexibleLabel = 'a piacere') => {
  const normalized = normalizeTimePreference(value);
  if (normalized === 'flexible') return flexibleLabel;
  return BOOKING_TIME_WINDOWS[normalized]?.name || '';
};

export const getBookingTimePreferenceDefaultTime = (value) =>
  BOOKING_TIME_WINDOWS[normalizeTimePreference(value)]?.start || BOOKING_TIME_WINDOWS.morning.start;

export const getBookingTimeWindows = () => Object.values(BOOKING_TIME_WINDOWS);

export const getBookingTimeWindowForPreference = (value) =>
  BOOKING_TIME_WINDOWS[normalizeTimePreference(value)] || null;

export const getBookingTimeWindowForTime = (value) => {
  const minutes = toMinutes(value);
  if (minutes === null) return null;
  return Object.values(BOOKING_TIME_WINDOWS).find((window) => (
    minutes >= toMinutes(window.start) && minutes < toMinutes(window.end)
  )) || null;
};

const TIME_PREFERENCES = Object.keys(BOOKING_TIME_WINDOWS);

const parseDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getBookingSchedule = (settings) => {
  const schedule = settings?.booking_schedule;
  const closedWeekdays = Array.isArray(schedule?.closed_weekdays)
    ? schedule.closed_weekdays.filter((day) => WEEKDAYS.includes(day))
    : [];
  const configuredPreferences = schedule?.closed_time_preferences;
  const closedTimePreferences = {};

  if (configuredPreferences && typeof configuredPreferences === 'object') {
    WEEKDAYS.forEach((day) => {
      const values = configuredPreferences[day];
      if (!Array.isArray(values)) return;
      const validValues = values.filter((value) => TIME_PREFERENCES.includes(value));
      if (validValues.length) closedTimePreferences[day] = validValues;
    });
  }

  return { closedWeekdays, closedTimePreferences };
};

export const getDateClosure = (value, schedule) => {
  const date = parseDate(value);
  if (!date) {
    return { isClosed: false, closedTimePreferences: [], label: '' };
  }

  const weekday = WEEKDAYS[date.getDay()];
  const isClosed = schedule.closedWeekdays.includes(weekday);
  const closedTimePreferences = isClosed
    ? [...TIME_PREFERENCES]
    : schedule.closedTimePreferences[weekday] || [];
  const label = isClosed
    ? 'Chiuso'
    : closedTimePreferences.map((preference) => BOOKING_TIME_WINDOWS[preference].closedLabel).join(' · ');

  return { isClosed, closedTimePreferences, label };
};

export const isTimePreferenceClosed = (preference, closure) =>
  Boolean(preference && closure.closedTimePreferences.includes(preference));
