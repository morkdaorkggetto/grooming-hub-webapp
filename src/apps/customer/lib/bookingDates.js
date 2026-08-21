export function getBookingFullPeriod(dateValue) {
  if (!dateValue) return null;
  const [, month, day] = dateValue.split('-').map(Number);
  if ((month === 12 && day >= 27) || (month === 1 && day <= 6)) return 'Capodanno';
  if (month === 8 && day >= 8 && day <= 18) return 'Ferragosto';
  if (month === 12 && day >= 15 && day <= 26) return 'Natale';
  return null;
}
