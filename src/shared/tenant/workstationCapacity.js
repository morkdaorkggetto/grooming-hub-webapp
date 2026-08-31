import { getBookingTimeWindowForTime } from './bookingSchedule.js';

export const APPOINTMENT_CAPACITY_MESSAGE =
  'Le postazioni sono tutte occupate nella fascia scelta.';

const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_WORKSTATION_CAPACITY = 1;

export const getWorkstationCapacity = (settings) => {
  const value = Number(settings?.workstation_capacity);
  return Number.isInteger(value) && value > 0
    ? value
    : DEFAULT_WORKSTATION_CAPACITY;
};

const occupiesWorkstation = (appointment) =>
  appointment?.status !== 'cancelled' &&
  (!appointment?.approval_status || appointment.approval_status === 'approved');

const toInterval = (appointment, fallbackId) => {
  if (!occupiesWorkstation(appointment)) return null;
  const startsAt = new Date(appointment.scheduled_at).getTime();
  const durationMinutes = Number(appointment.duration_minutes) || DEFAULT_DURATION_MINUTES;
  if (!Number.isFinite(startsAt) || durationMinutes <= 0) return null;
  return {
    id: appointment.id || fallbackId,
    startsAt,
    endsAt: startsAt + durationMinutes * 60000,
  };
};

const getIntervals = (appointments, excludedId = null) =>
  (appointments || [])
    .filter((appointment) => appointment?.id !== excludedId)
    .map((appointment, index) => toInterval(appointment, `appointment-${index}`))
    .filter(Boolean);

const getPeakConcurrency = (intervals) => {
  const events = intervals.flatMap((interval) => [
    { at: interval.startsAt, delta: 1 },
    { at: interval.endsAt, delta: -1 },
  ]);
  events.sort((left, right) => left.at - right.at || left.delta - right.delta);

  let concurrent = 0;
  let peak = 0;
  events.forEach((event) => {
    concurrent += event.delta;
    peak = Math.max(peak, concurrent);
  });
  return peak;
};

export const getAppointmentWindowLoad = ({
  appointments,
  date,
  window,
  capacity,
}) => {
  const normalizedCapacity = Number.isInteger(Number(capacity)) && Number(capacity) > 0
    ? Number(capacity)
    : DEFAULT_WORKSTATION_CAPACITY;
  if (!date || !window?.start || !window?.end) {
    return { occupied: 0, available: normalizedCapacity, capacity: normalizedCapacity };
  }

  const startsAt = new Date(`${date}T${window.start}`).getTime();
  const endsAt = new Date(`${date}T${window.end}`).getTime();
  const intervals = getIntervals(appointments).filter((interval) => (
    interval.startsAt < endsAt && interval.endsAt > startsAt
  ));
  const occupied = getPeakConcurrency(intervals);
  return {
    occupied,
    available: Math.max(0, normalizedCapacity - occupied),
    capacity: normalizedCapacity,
  };
};

export const findFirstCapacityAvailableTime = ({
  appointments,
  date,
  window,
  durationMinutes = DEFAULT_DURATION_MINUTES,
  capacity,
}) => {
  if (!date || !window?.start || !window?.end) return window?.start || '';
  const duration = Number(durationMinutes) || DEFAULT_DURATION_MINUTES;
  const end = new Date(`${date}T${window.end}`).getTime();
  let candidateStart = new Date(`${date}T${window.start}`);

  while (candidateStart.getTime() + duration * 60000 <= end) {
    const candidate = {
      scheduled_at: candidateStart.toISOString(),
      duration_minutes: duration,
    };
    if (isAppointmentCapacityAvailable({ candidate, appointments, capacity })) {
      return toLocalTimeString(candidateStart);
    }
    candidateStart = new Date(candidateStart.getTime() + 15 * 60000);
  }

  return window.start;
};

export const isAppointmentCapacityAvailable = ({
  candidate,
  appointments,
  capacity,
  excludedId = null,
}) => {
  const candidateInterval = toInterval(
    { ...candidate, status: 'scheduled', approval_status: 'approved' },
    'candidate'
  );
  if (!candidateInterval) return true;
  const relevant = getIntervals(appointments, excludedId).filter(
    (interval) =>
      interval.startsAt < candidateInterval.endsAt &&
      interval.endsAt > candidateInterval.startsAt
  );
  return getPeakConcurrency([...relevant, candidateInterval]) <= capacity;
};

export const findCapacityConflictIds = (appointments, capacity) => {
  const intervals = getIntervals(appointments);
  const events = intervals
    .flatMap((interval) => [
      { at: interval.startsAt, kind: 'start', interval },
      { at: interval.endsAt, kind: 'end', interval },
    ])
    .sort((left, right) => {
      const eventOrder = { end: 0, start: 1 };
      return left.at - right.at || eventOrder[left.kind] - eventOrder[right.kind];
    });

  const active = new Map();
  const conflicts = new Set();
  let index = 0;

  while (index < events.length) {
    const at = events[index].at;
    const simultaneous = [];
    while (index < events.length && events[index].at === at) {
      simultaneous.push(events[index]);
      index += 1;
    }
    simultaneous
      .filter((event) => event.kind === 'end')
      .forEach((event) => active.delete(event.interval.id));
    simultaneous
      .filter((event) => event.kind === 'start')
      .forEach((event) => active.set(event.interval.id, event.interval));
    if (active.size > capacity) {
      active.forEach((interval) => conflicts.add(interval.id));
    }
  }

  return conflicts;
};

const toLocalTimeString = (date) =>
  `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;

const toLocalDateString = (date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export const getAppointmentLoadNotice = ({
  candidate,
  appointments,
  capacity,
  excludedId = null,
}) => {
  const candidateInterval = toInterval(
    { ...candidate, status: 'scheduled', approval_status: 'approved' },
    'candidate'
  );
  if (!candidateInterval) return null;

  const candidateStart = new Date(candidateInterval.startsAt);
  const window = getBookingTimeWindowForTime(toLocalTimeString(candidateStart));
  if (!window) return null;

  const date = toLocalDateString(candidateStart);
  const windowStartsAt = new Date(`${date}T${window.start}`).getTime();
  const windowEndsAt = new Date(`${date}T${window.end}`).getTime();
  const intervals = getIntervals(appointments, excludedId);
  const appointmentsInWindow = intervals.filter((interval) => (
    interval.startsAt < windowEndsAt && interval.endsAt > windowStartsAt
  ));
  if (!appointmentsInWindow.length) return null;

  const occupiedAtStart = intervals.filter((interval) => (
    interval.startsAt <= candidateInterval.startsAt && interval.endsAt > candidateInterval.startsAt
  )).length;
  const normalizedCapacity = Number.isInteger(Number(capacity)) && Number(capacity) > 0
    ? Number(capacity)
    : DEFAULT_WORKSTATION_CAPACITY;
  const remainingAtStart = Math.max(0, normalizedCapacity - occupiedAtStart);
  const weekday = candidateStart.toLocaleDateString('it-IT', { weekday: 'long' });

  return {
    weekday: capitalize(weekday),
    windowLabel: window.name.toLowerCase(),
    appointmentCount: appointmentsInWindow.length,
    time: toLocalTimeString(candidateStart),
    remainingAtStart,
    showRemaining: occupiedAtStart > 0 && remainingAtStart > 0,
  };
};

export const findNextCapacityAvailableTime = ({
  date,
  time,
  durationMinutes,
  appointments,
  capacity,
}) => {
  const initial = new Date(`${date}T${time}`);
  if (Number.isNaN(initial.getTime())) return time;
  const duration = Number(durationMinutes) || DEFAULT_DURATION_MINUTES;
  const dayEnd = new Date(`${date}T23:45:00`);
  let candidateStart = new Date(initial.getTime() + duration * 60000);

  while (candidateStart <= dayEnd) {
    const candidate = {
      scheduled_at: candidateStart.toISOString(),
      duration_minutes: duration,
    };
    if (isAppointmentCapacityAvailable({ candidate, appointments, capacity })) {
      return toLocalTimeString(candidateStart);
    }
    candidateStart = new Date(candidateStart.getTime() + 15 * 60000);
  }

  return time;
};
