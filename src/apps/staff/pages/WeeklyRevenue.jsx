import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { getBookingSchedule, getDateClosure } from '../../../shared/tenant/bookingSchedule';
import {
  Button,
  EmptyState,
  ErrorState,
  Hero,
  HeroButton,
  Panel,
  PetAvatar,
  SkeletonRow,
} from '../components/StaffKit';
import { getRevenueReportData } from '../lib/database';
import './WeeklyRevenue.css';

const WEEK_LENGTH = 7;
const TREND_WEEKS = 12;
const FIRST_MONTH_START = '2026-03-01';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr) => new Date(`${dateStr}T12:00:00`);

const addDays = (dateStr, days) => {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
};

const addMonths = (dateStr, months) => {
  const date = parseLocalDate(dateStr);
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  return toLocalDateString(date);
};

const startOfMonth = (dateStr) => `${dateStr.slice(0, 7)}-01`;

const endOfMonth = (dateStr) => {
  const date = parseLocalDate(startOfMonth(dateStr));
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return toLocalDateString(date);
};

const startOfWeek = (dateStr) => {
  const date = parseLocalDate(dateStr);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return toLocalDateString(date);
};

const todayDate = () => toLocalDateString(new Date());

const groupThousands = (value) =>
  `${Math.round(Number(value) || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const formatCurrency = (value) => `${groupThousands(value)} €`;

const formatDay = (dateStr) =>
  parseLocalDate(dateStr).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
  });

const formatLongDay = (dateStr) =>
  parseLocalDate(dateStr).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const formatWeekRange = (from, to) => {
  const start = parseLocalDate(from);
  const end = parseLocalDate(to);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: sameMonth ? undefined : 'long',
  });
  const endLabel = end.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${startLabel} - ${endLabel}`;
};

const formatMonthLabel = (dateStr) =>
  parseLocalDate(dateStr).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

const formatMonthName = (dateStr) =>
  parseLocalDate(dateStr).toLocaleDateString('it-IT', { month: 'long' });

const formatMonthShort = (dateStr) =>
  parseLocalDate(dateStr).toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const formatMonthSegment = (from, to) => {
  const start = parseLocalDate(from);
  const end = parseLocalDate(to);
  return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('it-IT', { month: 'long' })}`;
};

const getNetRevenue = (visit) => {
  const gross = Number(visit.cost) || 0;
  const discountPercent = Number(visit.discount_percent) || 0;
  return gross * (1 - discountPercent / 100);
};

const visitsInRange = (visits, from, to) =>
  visits.filter((visit) => visit.date >= from && visit.date <= to);

const sumRevenue = (visits) =>
  visits.reduce((sum, visit) => sum + getNetRevenue(visit), 0);

const calculateDelta = (current, previous) => {
  if (current === previous) return 0;
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
};

const Delta = ({ value, flatLabel = 'come la scorsa' }) => {
  if (value == null) return null;
  if (value === 0) return <span className="gh-report-delta gh-report-delta--flat">{flatLabel}</span>;
  const positive = value > 0;
  return (
    <span className={`gh-report-delta gh-report-delta--${positive ? 'up' : 'down'}`}>
      {positive ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
};

const BigNumber = ({ label, value, note, delta, flatLabel }) => (
  <div className="gh-report-big-number">
    <Eyebrow staff>{label}</Eyebrow>
    <div className="gh-report-big-number__line">
      <span className="gh-report-big-number__value gh-num">{value}</span>
      <Delta value={delta} flatLabel={flatLabel} />
    </div>
    <div className="gh-report-big-number__note">{note}</div>
  </div>
);

const UnitSwitch = ({ unit, onChange }) => (
  <div className="gh-report-unit-switch" role="group" aria-label="Unità del report">
    {[
      ['week', 'Settimana'],
      ['month', 'Mese'],
    ].map(([value, label]) => (
      <button
        type="button"
        className="gh-report-unit-switch__button"
        aria-pressed={unit === value}
        onClick={() => onChange(value)}
        key={value}
      >
        {label}
      </button>
    ))}
  </div>
);

const ReportNavigation = ({ unit, label, onUnitChange, onPrevious, onCurrent, onNext, previousDisabled }) => {
  const unitLabel = unit === 'week' ? 'Settimana' : 'Mese';
  return (
    <div className="gh-report-navigation">
      <UnitSwitch unit={unit} onChange={onUnitChange} />
      <span className="gh-report-navigation__divider" aria-hidden="true" />
      <div className="gh-report-week-nav" aria-label={`Navigazione ${unitLabel.toLowerCase()}`}>
        <Button
          staff
          variant="outline"
          className="gh-report-week-nav__arrow gh-report-week-nav__previous"
          aria-label={`${unitLabel} precedente`}
          title={`${unitLabel} precedente`}
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          <Icon name="arrow" size={15} className="gh-icon--back" />
        </Button>
        <span className="gh-report-week-nav__label">{label}</span>
        <Button
          staff
          variant="outline"
          className="gh-report-week-nav__arrow gh-report-week-nav__next"
          aria-label={`${unitLabel} successivo`}
          title={`${unitLabel} successivo`}
          onClick={onNext}
        >
          <Icon name="arrow" size={15} />
        </Button>
        <Button staff variant="outline" className="gh-report-week-nav__current" onClick={onCurrent}>
          {unit === 'week' ? 'Questa settimana' : 'Questo mese'}
        </Button>
      </div>
    </div>
  );
};

const WeekRow = ({ row, maxRevenue, index, onOpen }) => {
  const isStill = row.count === 0;
  const isPeak = row.revenue > 0 && row.revenue === maxRevenue;
  const width = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0;
  return (
    <button
      type="button"
      className={`gh-report-month-week${isStill ? ' gh-report-month-week--still' : ''}`}
      onClick={onOpen}
      aria-label={`${row.label}: ${isStill ? 'settimana ferma' : `${row.count} cani, ${formatCurrency(row.revenue)}`}`}
    >
      {!isStill && (
        <span
          className={`gh-report-month-week__fill${isPeak ? ' gh-report-month-week__fill--peak' : ''}`}
          style={{ width: `${width}%` }}
        />
      )}
      <span className="gh-report-month-week__label">{row.label}</span>
      {isStill ? (
        <span className="gh-report-month-week__still-copy">settimana ferma - non è passato nessuno</span>
      ) : (
        <>
          <span className="gh-report-month-week__days gh-num">{row.daysWorked} {row.daysWorked === 1 ? 'giorno' : 'giorni'}</span>
          <span className="gh-report-month-week__count gh-num">{row.count} {row.count === 1 ? 'cane' : 'cani'}</span>
        </>
      )}
      <span className="gh-report-month-week__spacer" />
      {isPeak && <span className="gh-report-month-week__peak">settimana piena</span>}
      <span className="gh-report-month-week__amount gh-num">{isStill ? '—' : formatCurrency(row.revenue)}</span>
      {index > 0 && <span className="sr-only">Settimana {index + 1} del mese</span>}
    </button>
  );
};

const MonthTrend = ({ months, selectedStart }) => {
  const maxRevenue = Math.max(...months.map((month) => month.revenue), 1);
  return (
    <div className="gh-report-month-trend" aria-label="Andamento dei mesi disponibili">
      <div className="gh-report-month-trend__bars">
        {months.map((month) => (
          <span
            className={`gh-report-month-trend__bar${month.start === selectedStart ? ' gh-report-month-trend__bar--selected' : ''}${month.partial ? ' gh-report-month-trend__bar--partial' : ''}`}
            style={{ height: `${Math.max((month.revenue / maxRevenue) * 100, 4)}%` }}
            title={`${formatMonthLabel(month.start)} · ${formatCurrency(month.revenue)}`}
            key={month.start}
          />
        ))}
      </div>
      <div className="gh-report-month-trend__labels">
        {months.map((month) => (
          <span className={month.start === selectedStart ? 'is-selected' : ''} key={month.start}>
            {formatMonthShort(month.start)}
          </span>
        ))}
      </div>
    </div>
  );
};

const PartialNote = ({ monthStart, throughDay, daysInMonth, previousSpan, previousFull, comparisonState }) => {
  const monthName = capitalize(formatMonthName(monthStart));
  const previousName = formatMonthName(addMonths(monthStart, -1));
  return (
    <div className="gh-report-partial-note">
      <Icon name="clock" size={15} />
      {comparisonState === 'success' ? (
        <p>
          <strong>{monthName} non è finito.</strong> Questi sono i primi <span className="gh-num">{throughDay}</span>{' '}
          giorni su <span className="gh-num">{daysInMonth}</span>: il confronto qui sopra è con i primi {throughDay}{' '}
          giorni di {previousName}, <span className="gh-num">{formatCurrency(previousSpan)}</span>, non con i{' '}
          <span className="gh-num">{formatCurrency(previousFull)}</span> del mese pieno.
        </p>
      ) : (
        <p>
          <strong>{monthName} non è finito.</strong> Questi sono i primi <span className="gh-num">{throughDay}</span>{' '}
          giorni su <span className="gh-num">{daysInMonth}</span>. Il confronto sullo stesso tratto{' '}
          {comparisonState === 'error' ? 'non è disponibile' : 'si sta caricando'}: per questo non mostriamo alcun delta.
        </p>
      )}
    </div>
  );
};

const DayBar = ({ row, maxRevenue, index }) => {
  const width = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0;
  const isPeak = row.revenue > 0 && row.revenue === maxRevenue;
  return (
    <div className={`gh-report-day${isPeak ? ' gh-report-day--peak' : ''}`}>
      <span className="gh-report-day__fill" style={{ width: `${width}%` }} />
      <span className="gh-report-day__label">{formatDay(row.date)}</span>
      <span className="gh-report-day__count gh-num">
        {row.closure.isClosed
          ? 'chiuso'
          : row.count === 0
            ? '—'
            : `${row.count} ${row.count === 1 ? 'cane' : 'cani'}`}
      </span>
      <span className="gh-report-day__spacer" />
      {isPeak && <span className="gh-report-day__peak-label">giorno pieno</span>}
      <span className="gh-report-day__amount gh-num">
        {row.revenue > 0 ? formatCurrency(row.revenue) : '—'}
      </span>
      {index > 0 && <span className="sr-only">Giorno {index + 1} della settimana</span>}
    </div>
  );
};

const DayHead = ({ date, visits }) => (
  <div className="gh-report-day-head">
    <span>{formatLongDay(date)}</span>
    <span className="gh-num">{visits.length} {visits.length === 1 ? 'cane' : 'cani'}</span>
    <span className="gh-report-day-head__spacer" />
    <span className="gh-num">{formatCurrency(sumRevenue(visits))}</span>
  </div>
);

const VisitLine = ({ visit, index }) => {
  const revenue = getNetRevenue(visit);
  const zeroAmount = revenue === 0;
  const discountPercent = Number(visit.discount_percent) || 0;
  const pet = visit.pet || visit.client;
  return (
    <Link
      className={`gh-report-visit${zeroAmount ? ' gh-report-visit--zero' : ''}`}
      to={`/client/${visit.pet_id || pet?.id}`}
      aria-label={`Apri la scheda di ${pet?.name || 'questo cane'}`}
    >
      <PetAvatar name={pet?.name || 'Pet'} photo={pet?.photo} size={30} />
      <div className="gh-report-visit__copy">
        <div className="gh-report-visit__identity">
          <span className="gh-report-visit__pet">{pet?.name || 'Pet'}</span>
          <span className="gh-report-visit__owner">{pet?.owner || 'Proprietario non indicato'}</span>
        </div>
        <div className="gh-report-visit__treatment">
          {visit.treatments ? `«${visit.treatments}»` : '—'}
        </div>
      </div>
      {visit.issues && (
        <span
          className="gh-report-visit__issue"
          aria-label="Annotazione del salone presente"
          title="Annotazione del salone presente"
        />
      )}
      <div className="gh-report-visit__price">
        <span className="gh-num">{zeroAmount ? '—' : formatCurrency(revenue)}</span>
        {discountPercent > 0 && <span>Sconto {discountPercent}%</span>}
      </div>
      {index > 0 && <span className="sr-only">Visita {index + 1}</span>}
    </Link>
  );
};

const TrendStrip = ({ weeks, selectedIndex }) => {
  const maxRevenue = Math.max(...weeks.map((week) => week.revenue), 1);
  return (
    <div className="gh-report-trend" aria-label="Andamento delle ultime dodici settimane">
      {weeks.map((week, index) => (
        <span
          key={week.start}
          className={`gh-report-trend__bar${index === selectedIndex ? ' gh-report-trend__bar--selected' : ''}`}
          style={{ height: `${Math.max((week.revenue / maxRevenue) * 100, 3)}%` }}
          title={`${formatWeekRange(week.start, week.end)} · ${formatCurrency(week.revenue)}`}
        />
      ))}
    </div>
  );
};

const AmountSpread = ({ bands }) => {
  const maxCount = Math.max(...bands.map((band) => band.count), 1);
  return (
    <div className="gh-report-spread">
      {bands.map((band) => (
        <div className="gh-report-spread__row" key={band.label}>
          <span className="gh-report-spread__label gh-num">{band.label}</span>
          <span className="gh-report-spread__track">
            <span
              className={`gh-report-spread__fill${band.highlight ? ' gh-report-spread__fill--highlight' : ''}`}
              style={{ width: `${(band.count / maxCount) * 100}%` }}
            />
          </span>
          <span className="gh-report-spread__count gh-num">{band.count}</span>
        </div>
      ))}
    </div>
  );
};

export default function WeeklyRevenue() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [unit, setUnit] = useState('week');
  const [anchorDate, setAnchorDate] = useState(todayDate);
  const [allVisits, setAllVisits] = useState([]);
  const [partialPreviousVisits, setPartialPreviousVisits] = useState([]);
  const [partialComparisonState, setPartialComparisonState] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllVisits, setShowAllVisits] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const currentDate = todayDate();
  const currentWeekStart = startOfWeek(currentDate);
  const currentMonthStart = startOfMonth(currentDate);
  const weekStart = startOfWeek(anchorDate);
  const weekEnd = addDays(weekStart, WEEK_LENGTH - 1);
  const monthStart = startOfMonth(anchorDate);
  const monthEnd = endOfMonth(monthStart);
  const isCurrentMonth = monthStart === currentMonthStart;
  const isFutureWeek = weekStart > currentWeekStart;
  const isFutureMonth = monthStart > currentMonthStart;
  const monthDataEnd = isCurrentMonth ? currentDate : monthEnd;
  const bookingSchedule = useMemo(() => getBookingSchedule(tenant?.settings), [tenant?.settings]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAllVisits(await getRevenueReportData());
    } catch (loadError) {
      setError(loadError.message || 'Errore nel caricamento report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    setShowAllVisits(false);
    setShowMobileDetail(false);
  }, [unit, weekStart]);

  useEffect(() => {
    let active = true;
    if (unit !== 'month' || !isCurrentMonth || loading || error) {
      setPartialPreviousVisits([]);
      setPartialComparisonState('idle');
      return undefined;
    }

    const previousStart = addMonths(monthStart, -1);
    const throughDay = parseLocalDate(currentDate).getDate();
    const previousEnd = addDays(
      previousStart,
      Math.min(throughDay, parseLocalDate(endOfMonth(previousStart)).getDate()) - 1
    );
    setPartialComparisonState('loading');
    getRevenueReportData({ from: previousStart, to: previousEnd })
      .then((visits) => {
        if (!active) return;
        setPartialPreviousVisits(visits);
        setPartialComparisonState('success');
      })
      .catch(() => {
        if (!active) return;
        setPartialPreviousVisits([]);
        setPartialComparisonState('error');
      });

    return () => {
      active = false;
    };
  }, [currentDate, error, isCurrentMonth, loading, monthStart, unit]);

  const selectedVisits = useMemo(
    () => visitsInRange(allVisits, weekStart, weekEnd),
    [allVisits, weekEnd, weekStart]
  );

  const previousVisits = useMemo(
    () => visitsInRange(allVisits, addDays(weekStart, -7), addDays(weekStart, -1)),
    [allVisits, weekStart]
  );

  const selectedRevenue = useMemo(() => sumRevenue(selectedVisits), [selectedVisits]);
  const previousRevenue = useMemo(() => sumRevenue(previousVisits), [previousVisits]);
  const averageRevenue = selectedVisits.length ? selectedRevenue / selectedVisits.length : 0;
  const delta = calculateDelta(selectedRevenue, previousRevenue);

  const dailyRows = useMemo(
    () =>
      Array.from({ length: WEEK_LENGTH }, (_, index) => {
        const date = addDays(weekStart, index);
        const visits = selectedVisits.filter((visit) => visit.date === date);
        return {
          date,
          visits,
          count: visits.length,
          revenue: sumRevenue(visits),
          closure: getDateClosure(date, bookingSchedule),
        };
      }),
    [bookingSchedule, selectedVisits, weekStart]
  );

  const maxDailyRevenue = Math.max(...dailyRows.map((row) => row.revenue), 0);

  const visitGroups = useMemo(
    () =>
      dailyRows
        .filter((row) => row.visits.length > 0)
        .map((row) => ({ date: row.date, visits: row.visits })),
    [dailyRows]
  );

  const groupedDetail = selectedVisits.length > 6;
  const collapseDetail = selectedVisits.length > 20 && !showAllVisits;
  const visibleGroups = collapseDetail ? visitGroups.slice(0, 2) : visitGroups;
  const visibleVisitsCount = visibleGroups.reduce((sum, group) => sum + group.visits.length, 0);

  const trendWeeks = useMemo(
    () =>
      Array.from({ length: TREND_WEEKS }, (_, index) => {
        const start = addDays(weekStart, (index - (TREND_WEEKS - 1)) * WEEK_LENGTH);
        const end = addDays(start, WEEK_LENGTH - 1);
        return {
          start,
          end,
          revenue: sumRevenue(visitsInRange(allVisits, start, end)),
        };
      }),
    [allVisits, weekStart]
  );

  const trendAverage = trendWeeks.reduce((sum, week) => sum + week.revenue, 0) / TREND_WEEKS;
  const trendPeak = trendWeeks.reduce(
    (peak, week) => (week.revenue > peak.revenue ? week : peak),
    trendWeeks[0]
  );

  const selectedMonthVisits = useMemo(
    () => visitsInRange(allVisits, monthStart, monthDataEnd),
    [allVisits, monthDataEnd, monthStart]
  );
  const selectedMonthRevenue = useMemo(() => sumRevenue(selectedMonthVisits), [selectedMonthVisits]);
  const previousMonthStart = addMonths(monthStart, -1);
  const previousMonthEnd = endOfMonth(previousMonthStart);
  const previousMonthVisits = useMemo(
    () => visitsInRange(allVisits, previousMonthStart, previousMonthEnd),
    [allVisits, previousMonthEnd, previousMonthStart]
  );
  const previousMonthRevenue = useMemo(() => sumRevenue(previousMonthVisits), [previousMonthVisits]);
  const monthComparisonRevenue = isCurrentMonth
    ? sumRevenue(partialPreviousVisits)
    : previousMonthRevenue;
  const monthDelta = isCurrentMonth && partialComparisonState !== 'success'
    ? null
    : calculateDelta(selectedMonthRevenue, monthComparisonRevenue);
  const monthThroughDay = parseLocalDate(monthDataEnd).getDate();
  const monthDaysInCalendar = parseLocalDate(monthEnd).getDate();

  const monthRows = useMemo(() => {
    const rows = [];
    let segmentStart = monthStart;
    while (segmentStart <= monthDataEnd) {
      const segmentEnd = [addDays(startOfWeek(segmentStart), 6), monthDataEnd, monthEnd]
        .sort()
        .at(0);
      const visits = visitsInRange(allVisits, segmentStart, segmentEnd);
      rows.push({
        start: segmentStart,
        end: segmentEnd,
        fullWeekStart: startOfWeek(segmentStart),
        label: formatMonthSegment(segmentStart, segmentEnd),
        visits,
        count: visits.length,
        revenue: sumRevenue(visits),
        daysWorked: new Set(visits.map((visit) => visit.date)).size,
      });
      segmentStart = addDays(segmentEnd, 1);
    }
    return rows;
  }, [allVisits, monthDataEnd, monthEnd, monthStart]);

  const maxMonthWeekRevenue = Math.max(...monthRows.map((row) => row.revenue), 0);
  const monthDaysWorked = new Set(selectedMonthVisits.map((visit) => visit.date)).size;
  const monthOpenDays = useMemo(() => {
    let count = 0;
    for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
      if (!getDateClosure(date, bookingSchedule).isClosed) count += 1;
    }
    return count;
  }, [bookingSchedule, monthEnd, monthStart]);
  const monthDailyAverage = monthDaysWorked
    ? Math.round(selectedMonthVisits.length / monthDaysWorked)
    : 0;
  const isPastEmptyMonth = !loading && !isFutureMonth && selectedMonthVisits.length === 0;

  const monthsAvailable = useMemo(() => {
    const months = [];
    for (let start = FIRST_MONTH_START; start <= currentMonthStart; start = addMonths(start, 1)) {
      const end = start === currentMonthStart ? currentDate : endOfMonth(start);
      months.push({
        start,
        revenue: sumRevenue(visitsInRange(allVisits, start, end)),
        partial: start === currentMonthStart,
      });
    }
    return months;
  }, [allVisits, currentDate, currentMonthStart]);
  const monthTrendPeak = monthsAvailable.reduce(
    (peak, month) => (month.revenue > peak.revenue ? month : peak),
    monthsAvailable[0]
  );

  const monthComparisonNote = isCurrentMonth
    ? partialComparisonState === 'success'
      ? `primi ${monthThroughDay} giorni di ${formatMonthName(previousMonthStart)}: ${formatCurrency(monthComparisonRevenue)}`
      : partialComparisonState === 'error'
        ? 'confronto non disponibile'
        : 'confronto sullo stesso tratto in caricamento'
    : `${formatMonthName(previousMonthStart)} ${formatCurrency(previousMonthRevenue)}`;

  const handlePrevious = () => {
    setAnchorDate(unit === 'week' ? addDays(weekStart, -7) : addMonths(monthStart, -1));
  };
  const handleNext = () => {
    setAnchorDate(unit === 'week' ? addDays(weekStart, 7) : addMonths(monthStart, 1));
  };
  const handleCurrent = () => setAnchorDate(currentDate);
  const openMonthWeek = (row) => {
    setAnchorDate(row.fullWeekStart);
    setUnit('week');
  };

  const amountBands = useMemo(() => {
    const bands = [
      { label: 'fino a 19 €', count: 0 },
      { label: '20 - 25 €', count: 0, highlight: true },
      { label: '26 - 29 €', count: 0 },
      { label: '30 - 35 €', count: 0, highlight: true },
      { label: 'oltre 35 €', count: 0 },
    ];
    allVisits.forEach((visit) => {
      const amount = getNetRevenue(visit);
      if (amount < 20) bands[0].count += 1;
      else if (amount < 26) bands[1].count += 1;
      else if (amount < 30) bands[2].count += 1;
      else if (amount < 36) bands[3].count += 1;
      else bands[4].count += 1;
    });
    return bands;
  }, [allVisits]);

  const hasTwoHumps = amountBands[2].count === 0 && amountBands[1].count > 0 && amountBands[3].count > 0;
  const issueCount = selectedVisits.filter((visit) => Boolean(visit.issues)).length;
  const isPastEmptyWeek = !loading && !isFutureWeek && selectedVisits.length === 0;

  return (
    <div className="gh-page gh-report-page">
      <Hero
        title="Come è andata"
        subtitle={`Cani passati e incassato, ${unit === 'week' ? 'settimana' : 'mese'} per ${unit === 'week' ? 'settimana' : 'mese'}`}
        right={(
          <HeroButton onClick={() => navigate('/dashboard')}>
            <Icon name="arrow" size={14} className="gh-icon--back" />
            Dashboard
          </HeroButton>
        )}
      />

      <main className="gh-report-shell">
        <div className="gh-report-main">
          {error && (
            <ErrorState
              title="Il report non è disponibile"
              body={error}
              action={(
                <Button staff variant="ghost" className="gh-report-error-action" onClick={loadReport}>
                  Riprova
                </Button>
              )}
            />
          )}

          {!error && (
            <Panel
              eyebrow={unit === 'week' ? 'Settimana' : 'Mese'}
              right={(
                <ReportNavigation
                  unit={unit}
                  label={unit === 'week' ? formatWeekRange(weekStart, weekEnd) : formatMonthLabel(monthStart)}
                  onUnitChange={setUnit}
                  onPrevious={handlePrevious}
                  onCurrent={handleCurrent}
                  onNext={handleNext}
                  previousDisabled={unit === 'month' && monthStart <= FIRST_MONTH_START}
                />
              )}
              flush
            >
              {loading ? (
                <div className="gh-report-loading" aria-busy="true" aria-label="Caricamento report">
                  {Array.from({ length: unit === 'week' ? 5 : 4 }, (_, index) => <SkeletonRow key={index} />)}
                </div>
              ) : unit === 'week' && isFutureWeek ? (
                <EmptyState
                  title="Questa settimana non è ancora arrivata."
                  body="Il report racconta il lavoro già fatto: si riempirà da solo mano a mano che registrate le lavorazioni."
                  action={(
                    <Button staff variant="outline" onClick={handleCurrent}>
                      Torna a questa settimana
                    </Button>
                  )}
                />
              ) : unit === 'month' && isFutureMonth ? (
                <EmptyState
                  title="Questo mese non è ancora arrivato."
                  body="Il report racconta il lavoro già fatto: il mese si riempirà da solo quando arriverà."
                  action={(
                    <Button staff variant="outline" onClick={handleCurrent}>
                      Torna a questo mese
                    </Button>
                  )}
                />
              ) : unit === 'week' ? (
                <>
                  <div className="gh-report-big-numbers">
                    <BigNumber
                      label="Incassato"
                      value={formatCurrency(selectedRevenue)}
                      delta={delta}
                      note={`la scorsa ${formatCurrency(previousRevenue)}`}
                    />
                    <BigNumber
                      label="Cani passati"
                      value={selectedVisits.length}
                      note={isPastEmptyWeek ? 'nessuno questa settimana' : `${formatCurrency(averageRevenue)} a cane in media`}
                    />
                  </div>
                  {isPastEmptyWeek && (
                    <EmptyState
                      title="Questa settimana non è passato nessuno."
                      body="Capita nei periodi di chiusura. La settimana resta qui, con i suoi sette giorni: non è un errore."
                    />
                  )}
                  <div className="gh-report-days">
                    {dailyRows.map((row, index) => (
                      <DayBar row={row} maxRevenue={maxDailyRevenue} index={index} key={row.date} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="gh-report-big-numbers">
                    <BigNumber
                      label="Incassato"
                      value={formatCurrency(selectedMonthRevenue)}
                      delta={monthDelta}
                      flatLabel="come il mese scorso"
                      note={monthComparisonNote}
                    />
                    <BigNumber
                      label="Cani passati"
                      value={selectedMonthVisits.length}
                      note={`${monthDaysWorked} giorni lavorati su ${monthOpenDays} · ${monthDailyAverage} cani al giorno`}
                    />
                  </div>
                  {isCurrentMonth && (
                    <PartialNote
                      monthStart={monthStart}
                      throughDay={monthThroughDay}
                      daysInMonth={monthDaysInCalendar}
                      previousSpan={monthComparisonRevenue}
                      previousFull={previousMonthRevenue}
                      comparisonState={partialComparisonState}
                    />
                  )}
                  {isPastEmptyMonth && (
                    <EmptyState
                      title="Questo mese non è passato nessuno."
                      body="Capita nei periodi di chiusura. Le settimane restano visibili: non è un errore."
                    />
                  )}
                  <div className="gh-report-month-head" aria-hidden="true">
                    <span>Settimana</span>
                    <span>Giorni</span>
                    <span>Cani</span>
                    <span />
                    <span>Incassato</span>
                  </div>
                  <div className="gh-report-month-weeks">
                    {monthRows.map((row, index) => (
                      <WeekRow
                        row={row}
                        maxRevenue={maxMonthWeekRevenue}
                        index={index}
                        onOpen={() => openMonthWeek(row)}
                        key={row.start}
                      />
                    ))}
                  </div>
                  <p className="gh-report-month-boundary-note">
                    Le settimane a cavallo di due mesi sono <strong>tagliate al mese</strong>: così le righe
                    sommano esattamente al numero grande. Aprendo una riga si vede la settimana intera.
                  </p>
                </>
              )}
            </Panel>
          )}

          {unit === 'week' && !error && !loading && !isFutureWeek && selectedVisits.length > 0 && (
            <Panel
              eyebrow="I cani passati"
              title={`${selectedVisits.length} ${selectedVisits.length === 1 ? 'cane passato' : 'cani passati'}`}
              right={groupedDetail ? <span className="gh-report-group-note">raggruppati per giorno</span> : null}
              flush
            >
              <div className="gh-report-visits">
                {visibleGroups.map((group, groupIndex) => (
                  <div
                    className={groupIndex > 0 && !showMobileDetail ? 'gh-report-visit-group--mobile-hidden' : ''}
                    key={group.date}
                  >
                    {groupedDetail && <DayHead date={group.date} visits={group.visits} />}
                    {group.visits.map((visit, index) => (
                      <VisitLine visit={visit} index={index} key={visit.id} />
                    ))}
                  </div>
                ))}
              </div>
              {visitGroups.length > 1 && (
                <div className="gh-report-mobile-more">
                  <Button
                    staff
                    variant="outline"
                    wide
                    onClick={() => {
                      setShowMobileDetail((value) => !value);
                      if (selectedVisits.length > 20) setShowAllVisits(!showMobileDetail);
                    }}
                  >
                    {showMobileDetail ? 'Mostra solo il primo giorno' : 'Mostra tutte le visite'}
                  </Button>
                </div>
              )}
              {selectedVisits.length > 20 && (
                <div className="gh-report-more">
                  <span>
                    {showAllVisits
                      ? `Tutte le ${selectedVisits.length} visite sono visibili.`
                      : `Restano ${selectedVisits.length - visibleVisitsCount} visite negli altri giorni.`}
                  </span>
                  <Button staff variant="outline" onClick={() => setShowAllVisits((value) => !value)}>
                    {showAllVisits ? 'Mostra meno' : 'Mostra tutte'}
                  </Button>
                </div>
              )}
            </Panel>
          )}
        </div>

        <aside className="gh-report-aside">
          <Panel eyebrow="Nel tempo" title={unit === 'week' ? 'Le ultime dodici settimane' : 'I mesi che esistono'}>
            {loading ? (
              <div className="gh-report-aside-loading"><SkeletonRow /><SkeletonRow /></div>
            ) : unit === 'week' ? (
              <>
                <TrendStrip weeks={trendWeeks} selectedIndex={TREND_WEEKS - 1} />
                <p className="gh-report-fact">
                  Media <strong className="gh-num">{formatCurrency(trendAverage)}</strong> · massimo{' '}
                  <strong className="gh-num">{formatCurrency(trendPeak.revenue)}</strong> nella settimana del{' '}
                  {parseLocalDate(trendPeak.start).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                </p>
                <p className="gh-report-explainer">
                  Nessun asse e nessuna griglia: serve a vedere <strong>la forma</strong>, non a leggere valori.
                  Per quelli c'è la settimana aperta.
                </p>
              </>
            ) : (
              <>
                <MonthTrend months={monthsAvailable} selectedStart={monthStart} />
                <p className="gh-report-fact">
                  Massimo <strong className="gh-num">{formatCurrency(monthTrendPeak.revenue)}</strong> in{' '}
                  {formatMonthName(monthTrendPeak.start)}. La storia utile comincia il{' '}
                  <strong className="gh-num">6 marzo 2026</strong>.
                </p>
                <p className="gh-report-explainer">
                  <strong>{monthsAvailable.length} mesi, non dodici.</strong> La striscia mostra soltanto i mesi
                  che esistono e crescerà con la storia. Il tratteggio indica il mese in corso.
                </p>
              </>
            )}
          </Panel>

          <Panel
            eyebrow="Quanto si paga"
            title={hasTwoHumps ? 'Gli importi hanno due gobbe' : 'Come si distribuiscono gli importi'}
          >
            {loading ? (
              <div className="gh-report-aside-loading"><SkeletonRow /><SkeletonRow /></div>
            ) : (
              <>
                <AmountSpread bands={amountBands} />
                <p className="gh-report-explainer gh-report-explainer--bordered">
                  {hasTwoHumps
                    ? 'Il vuoto fra 26 e 29 € evidenzia due fasce di importo.'
                    : 'Le cinque fasce mostrano come si distribuiscono gli importi registrati.'}{' '}
                  <strong>Questo dice gli importi, non i servizi</strong>: i trattamenti sono scritti a mano.
                </p>
              </>
            )}
          </Panel>

          {unit === 'week' && !loading && !isFutureWeek && (
            <Panel
              eyebrow="Le note del salone"
              title={`${issueCount} ${issueCount === 1 ? 'annotazione' : 'annotazioni'}`}
            >
              <p className="gh-report-note-copy">
                Le righe con il pallino portano una nota scritta da voi. Alcune raccontano{' '}
                <strong>un'assenza, non un lavoro</strong>: restano in elenco a importo zero, perché sono successe.
              </p>
            </Panel>
          )}

          {unit === 'month' && !loading && !isFutureMonth && (
            <Panel eyebrow="Il confronto" title={`Contro ${formatMonthName(previousMonthStart)}`}>
              <p className="gh-report-note-copy">
                {isCurrentMonth ? (
                  <>
                    Il paragone usa <strong>lo stesso tratto del mese precedente</strong>. Nessuna proiezione a
                    fine mese: il numero grande resta misurato, non stimato.
                  </>
                ) : (
                  <>
                    A mesi il confronto utile è <strong>il mese scorso</strong>. Le righe iniziale e finale sono
                    tagliate al confine del mese, ma aprono sempre la settimana completa.
                  </>
                )}
              </p>
            </Panel>
          )}
        </aside>
      </main>
    </div>
  );
}
