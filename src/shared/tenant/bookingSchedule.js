const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const TIME_PREFERENCES = ['morning', 'afternoon'];

const TIME_PREFERENCE_LABELS = {
  morning: 'Mattina chiusa',
  afternoon: 'Pomeriggio chiuso',
};

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
    : closedTimePreferences.map((preference) => TIME_PREFERENCE_LABELS[preference]).join(' · ');

  return { isClosed, closedTimePreferences, label };
};

export const isTimePreferenceClosed = (preference, closure) =>
  Boolean(preference && closure.closedTimePreferences.includes(preference));
