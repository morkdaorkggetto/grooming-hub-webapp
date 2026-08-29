import { getBookingTimePreferenceName } from '../tenant/bookingSchedule.js';

const validDate = (value, suffix = '') => {
  if (!value) return null;
  const date = new Date(`${value}${suffix}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isRequest = (item) =>
  item?.request_kind === 'structured'
  || item?.request_kind === 'legacy'
  || Boolean(item?.desired_date)
  || item?.approval_status === 'pending';

const bookingDate = (item) => {
  if (item?.request_kind === 'structured' || item?.desired_date) {
    return validDate(item.desired_date, 'T12:00:00');
  }
  return item?.scheduled_at ? new Date(item.scheduled_at) : null;
};

const isOpenBooking = (item, now) => {
  if (!item?.pet_id) return false;
  if (isRequest(item)) return item.status === 'pending' || item.approval_status === 'pending';
  const date = bookingDate(item);
  return Boolean(
    date
    && !Number.isNaN(date.getTime())
    && date.getTime() > now.getTime()
    && item.status !== 'cancelled'
    && item.approval_status !== 'rejected'
  );
};

export const findOpenPetBooking = (
  bookings,
  petId,
  { excludeAppointmentId = null, excludeRequestId = null, now = new Date() } = {}
) => (bookings || [])
  .filter((item) => item.pet_id === petId)
  .filter((item) => !(item.request_kind === 'structured' && item.id === excludeRequestId))
  .filter((item) => !(item.request_kind !== 'structured' && item.id === excludeAppointmentId))
  .filter((item) => isOpenBooking(item, now))
  .sort((left, right) => {
    const leftTime = bookingDate(left)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightTime = bookingDate(right)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  })[0] || null;

const formatDay = (date, includeMonth) => date.toLocaleDateString('it-IT', {
  weekday: 'long',
  day: 'numeric',
  ...(includeMonth ? { month: 'long' } : {}),
});

const formatTime = (date) => date.toLocaleTimeString('it-IT', {
  hour: '2-digit',
  minute: '2-digit',
});

export const formatOpenPetBookingWhen = (booking, { includeMonth = false } = {}) => {
  const date = bookingDate(booking);
  if (!date || Number.isNaN(date.getTime())) return '';
  const day = formatDay(date, includeMonth);
  if (!isRequest(booking)) return `${day} alle ${formatTime(date)}`;
  if (booking.request_kind === 'structured' || booking.desired_date) {
    const preference = getBookingTimePreferenceName(booking.time_preference).toLowerCase();
    return preference ? `${day}, ${preference}` : day;
  }
  return `${day} alle ${formatTime(date)}`;
};

export const getStaffPetBookingMessage = (booking, petName) => {
  if (!booking) return '';
  const when = formatOpenPetBookingWhen(booking);
  return isRequest(booking)
    ? `${petName || 'Questo pet'} ha già una richiesta per ${when}.`
    : `${petName || 'Questo pet'} ha già un appuntamento ${when}.`;
};

export const getCustomerPetBookingMessage = (booking, petName) => {
  if (!booking) return '';
  const when = formatOpenPetBookingWhen(booking, { includeMonth: true });
  return isRequest(booking)
    ? `Hai già una richiesta per ${petName || 'questo pet'}: ${when}.`
    : `Hai già un appuntamento per ${petName || 'questo pet'}: ${when}.`;
};

export const isOpenPetBookingRequest = isRequest;
