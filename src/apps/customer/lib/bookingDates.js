export const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createBookingDateOptions = (length = 12, now = new Date()) =>
  Array.from({ length }, (_, index) => {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index + 1);
    return { date, value: toLocalDateValue(date) };
  });

export function getBookingFullPeriod(dateValue) {
  if (!dateValue) return null;
  const [, month, day] = dateValue.split('-').map(Number);
  if ((month === 12 && day >= 27) || (month === 1 && day <= 6)) return 'Capodanno';
  if (month === 8 && day >= 8 && day <= 18) return 'Ferragosto';
  if (month === 12 && day >= 15 && day <= 26) return 'Natale';
  return null;
}
