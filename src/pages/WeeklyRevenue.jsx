import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeeklyRevenueReport } from '../lib/database';
import { DEMO_MODE } from '../lib/demoMode';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr, days) => {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
};

const startOfWeek = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toLocalDateString(date);
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value) || 0);

const formatDayLabel = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

const formatLongDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const getNetRevenue = (visit) => {
  const gross = Number(visit.cost) || 0;
  const discountPercent = Number(visit.discount_percent) || 0;
  return gross * (1 - discountPercent / 100);
};

export default function WeeklyRevenue() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(startOfWeek(toLocalDateString(new Date())));
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const loadReport = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getWeeklyRevenueReport({
        from: weekStart,
        to: weekEnd,
      });
      setVisits(data);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [weekStart]);

  const dailyRows = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

    return days.map((day) => {
      const dayVisits = visits.filter((visit) => visit.date === day);
      const revenue = dayVisits.reduce((sum, visit) => sum + getNetRevenue(visit), 0);

      return {
        day,
        count: dayVisits.length,
        revenue,
      };
    });
  }, [visits, weekStart]);

  const totals = useMemo(() => {
    const totalRevenue = visits.reduce((sum, visit) => sum + getNetRevenue(visit), 0);
    const totalDiscount = visits.reduce((sum, visit) => {
      const gross = Number(visit.cost) || 0;
      return sum + (gross - getNetRevenue(visit));
    }, 0);

    return {
      totalRevenue,
      totalDiscount,
      visitsCount: visits.length,
      averageRevenue: visits.length ? totalRevenue / visits.length : 0,
    };
  }, [visits]);

  const chartRows = useMemo(() => {
    const maxRevenue = Math.max(...dailyRows.map((row) => row.revenue), 0);

    return dailyRows.map((row) => ({
      ...row,
      percentage: maxRevenue > 0 ? Math.max(8, (row.revenue / maxRevenue) * 100) : 0,
    }));
  }, [dailyRows]);

  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)' }} className="min-h-screen">
      <header
        style={{ backgroundColor: 'var(--color-primary)' }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Report Settimanale Incassi</h1>
            <p className="text-sm text-white text-opacity-80">
              Vista rapida degli incassi basata sulle visite registrate
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {DEMO_MODE && (
          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: 'var(--color-warning-bg)', borderColor: 'var(--color-warning-border)', color: 'var(--color-warning-text)' }}
          >
            <p className="font-medium">
              Demo attiva: il report usa i dati dimostrativi caricati nell'ambiente demo.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p style={{ color: 'var(--color-danger-text)' }} className="font-medium">
              {error}
            </p>
            <button
              onClick={loadReport}
              className="mt-2 text-sm underline"
              style={{ color: 'var(--color-danger-text)' }}
            >
              Riprova
            </button>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
            <div>
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium mb-1">
                Settimana in analisi
              </p>
              <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold capitalize">
                {formatLongDate(weekStart)} - {formatLongDate(weekEnd)}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                ← Settimana prima
              </button>
              <button
                onClick={() => setWeekStart(startOfWeek(toLocalDateString(new Date())))}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#2563eb' }}
              >
                Questa settimana
              </button>
              <button
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                Settimana dopo →
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Incasso totale
            </p>
            <p style={{ color: 'var(--color-success-text)' }} className="text-3xl font-bold mt-2">
              {formatCurrency(totals.totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Visite registrate
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-bold mt-2">
              {totals.visitsCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Media per visita
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-bold mt-2">
              {formatCurrency(totals.averageRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm font-medium">
              Sconti applicati
            </p>
            <p style={{ color: '#b45309' }} className="text-3xl font-bold mt-2">
              {formatCurrency(totals.totalDiscount)}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold mb-4">
            Andamento giornaliero
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
            {dailyRows.map((row) => (
              <div
                key={row.day}
                className="rounded-2xl border p-4"
                style={{ borderColor: '#ead7c5', backgroundColor: '#fffdfb' }}
              >
                <p style={{ color: 'var(--color-text-primary)' }} className="font-bold capitalize">
                  {formatDayLabel(row.day)}
                </p>
                <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-2">
                  {row.count} {row.count === 1 ? 'visita' : 'visite'}
                </p>
                <p style={{ color: 'var(--color-success-text)' }} className="text-xl font-bold mt-3">
                  {formatCurrency(row.revenue)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-6">
            <div>
              <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold">
                Grafico incassi settimanali
              </h3>
              <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-1">
                Confronto rapido degli incassi giorno per giorno.
              </p>
            </div>
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm">
              Picco settimana: <strong>{formatCurrency(Math.max(...dailyRows.map((row) => row.revenue), 0))}</strong>
            </p>
          </div>

          {chartRows.every((row) => row.revenue === 0) ? (
            <p style={{ color: 'var(--color-secondary)' }} className="italic">
              Nessun incasso disponibile da rappresentare nella settimana selezionata.
            </p>
          ) : (
            <div className="space-y-4">
              {chartRows.map((row) => (
                <div key={`chart-${row.day}`}>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p style={{ color: 'var(--color-text-primary)' }} className="font-bold capitalize min-w-[92px]">
                      {formatDayLabel(row.day)}
                    </p>
                    <p style={{ color: 'var(--color-success-text)' }} className="font-bold text-sm">
                      {formatCurrency(row.revenue)}
                    </p>
                  </div>
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ backgroundColor: '#f5eadf', height: '18px' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${row.percentage}%`,
                        background: 'linear-gradient(90deg, var(--color-primary) 0%, #16a34a 100%)',
                      }}
                      title={`${formatDayLabel(row.day)} · ${formatCurrency(row.revenue)}`}
                    />
                  </div>
                  <p style={{ color: 'var(--color-secondary)' }} className="text-xs mt-1">
                    {row.count} {row.count === 1 ? 'visita' : 'visite'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold mb-4">
            Dettaglio visite della settimana
          </h3>

          {loading ? (
            <p style={{ color: 'var(--color-secondary)' }}>Caricamento report...</p>
          ) : visits.length === 0 ? (
            <p style={{ color: 'var(--color-secondary)' }} className="italic">
              Nessuna visita registrata nella settimana selezionata.
            </p>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => {
                const netRevenue = getNetRevenue(visit);

                return (
                  <div
                    key={visit.id}
                    className="rounded-2xl border p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    style={{ borderColor: '#ead7c5', backgroundColor: '#fffdfb' }}
                  >
                    <div>
                      <p style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                        {visit.client?.name || 'Cliente'} · {visit.client?.owner || '-'}
                      </p>
                      <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-1 capitalize">
                        {formatLongDate(visit.date)}
                      </p>
                      {visit.treatments && (
                        <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-2">
                          Trattamenti: {visit.treatments}
                        </p>
                      )}
                    </div>

                    <div className="text-left lg:text-right">
                      <p style={{ color: 'var(--color-success-text)' }} className="text-2xl font-bold">
                        {formatCurrency(netRevenue)}
                      </p>
                      {(Number(visit.discount_percent) || 0) > 0 && (
                        <p style={{ color: '#b45309' }} className="text-sm mt-1">
                          Sconto: {Number(visit.discount_percent)}%
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
