import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import type { InsightsPeriod, InsightsRange } from '../api';

const PRESETS: InsightsPeriod[] = ['24h', '7d', '30d'];

interface TimeFilterProps {
  value: InsightsRange;
  onChange: (range: InsightsRange) => void;
}

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function todayUTC(): Date {
  return startOfDayUTC(new Date());
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function safeDate(value: string | Date | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? fallback : startOfDayUTC(d);
}

function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

function sameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}

interface CalendarProps {
  visibleMonth: Date;
  onChangeVisibleMonth: (d: Date) => void;
  from: Date | null;
  to: Date | null;
  onPick: (d: Date) => void;
  min: Date;
  max: Date;
  locale: string;
}

function Calendar({ visibleMonth, onChangeVisibleMonth, from, to, onPick, min, max, locale }: CalendarProps) {
  const monthStart = new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth(), 1));
  const dayOfWeek = (monthStart.getUTCDay() + 6) % 7; // Mon=0
  const gridStart = new Date(monthStart);
  gridStart.setUTCDate(monthStart.getUTCDate() - dayOfWeek);

  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    cells.push(d);
  }

  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(monthStart);
  const dayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
    const base = new Date(Date.UTC(2024, 0, 1)); // Mon Jan 1 2024
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setUTCDate(base.getUTCDate() + i);
      return fmt.format(d);
    });
  }, [locale]);

  const canPrev = addMonths(monthStart, 0) > new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth(), 1));
  const canNext = addMonths(monthStart, 0) < new Date(Date.UTC(max.getUTCFullYear(), max.getUTCMonth(), 1));

  return (
    <div className="cal">
      <div className="cal-header">
        <button
          type="button"
          className="cal-nav"
          onClick={() => onChangeVisibleMonth(addMonths(monthStart, -1))}
          disabled={!canPrev}
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="cal-title">{monthLabel}</span>
        <button
          type="button"
          className="cal-nav"
          onClick={() => onChangeVisibleMonth(addMonths(monthStart, 1))}
          disabled={!canNext}
          aria-label="Next month"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      <div className="cal-weekdays">
        {dayNames.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d) => {
          const outside = d.getUTCMonth() !== monthStart.getUTCMonth();
          const disabled = d < min || d > max;
          const isFrom = !!from && sameDay(d, from);
          const isTo = !!to && sameDay(d, to);
          const between = !!from && !!to && d > from && d < to;
          return (
            <button
              key={d.toISOString()}
              type="button"
              className={
                'cal-day' +
                (outside ? ' outside' : '') +
                (disabled ? ' disabled' : '') +
                (isFrom || isTo ? ' edge' : '') +
                (between ? ' between' : '')
              }
              disabled={disabled}
              onClick={() => onPick(d)}
            >
              {d.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TimeFilter({ value, onChange }: TimeFilterProps) {
  const { t, i18n } = useTranslation();
  const { merchant } = useAuth();
  const min = safeDate(merchant?.createdAt, todayUTC());
  const max = todayUTC();

  const [open, setOpen] = useState(false);
  const initFrom = value.kind === 'custom' ? safeDate(value.from, max) : max;
  const initTo = value.kind === 'custom' ? safeDate(value.to, max) : max;

  const [from, setFrom] = useState<Date | null>(initFrom);
  const [to, setTo] = useState<Date | null>(initTo);
  const [picking, setPicking] = useState<'from' | 'to'>('from');
  const [visibleMonth, setVisibleMonth] = useState<Date>(initFrom);

  useEffect(() => {
    if (!open) return;
    setFrom(initFrom);
    setTo(initTo);
    setPicking('from');
    setVisibleMonth(initFrom);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isCustom = value.kind === 'custom';
  const dateFmt = new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'short', timeZone: 'UTC' });
  const longFmt = new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const customLabel = isCustom && from && to
    ? `${dateFmt.format(safeDate(value.from, max))} – ${dateFmt.format(safeDate(value.to, max))}`
    : t('insights.periods.custom');

  const handlePick = (d: Date) => {
    if (picking === 'from') {
      setFrom(d);
      if (to && d > to) setTo(d);
      setPicking('to');
    } else {
      if (from && d < from) {
        setFrom(d);
        setTo(from);
      } else {
        setTo(d);
      }
      setPicking('from');
    }
  };

  const canApply = !!from && !!to && to >= from;

  const handleApply = () => {
    if (!canApply || !from || !to) return;
    onChange({
      kind: 'custom',
      from: `${toISO(from)}T00:00:00.000Z`,
      to: `${toISO(to)}T23:59:59.999Z`,
    });
    setOpen(false);
  };

  return (
    <>
      <div className="insights-time-filter" role="tablist" aria-label={t('insights.periodLabel')}>
        {PRESETS.map((preset) => {
          const selected = value.kind === 'preset' && value.preset === preset;
          return (
            <button
              key={preset}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`insights-period-btn${selected ? ' active' : ''}`}
              onClick={() => onChange({ kind: 'preset', preset })}
            >
              {t(`insights.periods.${preset}`)}
            </button>
          );
        })}
        <button
          type="button"
          role="tab"
          aria-selected={isCustom}
          className={`insights-period-btn insights-period-btn-custom${isCustom ? ' active' : ''}`}
          onClick={() => setOpen(true)}
        >
          <span className="material-symbols-outlined">date_range</span>
          {customLabel}
        </button>
      </div>

      {open && (
        <div className="insights-range-sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            className="insights-range-sheet"
            role="dialog"
            aria-label={t('insights.periods.custom')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="insights-range-sheet-header">
              <h3>{t('insights.periods.custom')}</h3>
              <button
                type="button"
                className="insights-range-sheet-close"
                aria-label={t('common.close')}
                onClick={() => setOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="insights-range-sheet-body">
              <div className="insights-range-summary">
                <button
                  type="button"
                  className={`insights-range-chip${picking === 'from' ? ' active' : ''}`}
                  onClick={() => setPicking('from')}
                >
                  <span className="insights-range-chip-label">{t('insights.rangeFrom')}</span>
                  <span className="insights-range-chip-value">{from ? longFmt.format(from) : '—'}</span>
                </button>
                <button
                  type="button"
                  className={`insights-range-chip${picking === 'to' ? ' active' : ''}`}
                  onClick={() => setPicking('to')}
                >
                  <span className="insights-range-chip-label">{t('insights.rangeTo')}</span>
                  <span className="insights-range-chip-value">{to ? longFmt.format(to) : '—'}</span>
                </button>
              </div>

              <Calendar
                visibleMonth={visibleMonth}
                onChangeVisibleMonth={setVisibleMonth}
                from={from}
                to={to}
                onPick={handlePick}
                min={min}
                max={max}
                locale={i18n.language}
              />

              <p className="insights-range-hint">
                {t('insights.rangeHint', { date: longFmt.format(min) })}
              </p>
            </div>
            <div className="insights-range-sheet-footer">
              <button
                type="button"
                className="insights-range-cancel"
                onClick={() => setOpen(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="insights-range-apply"
                onClick={handleApply}
                disabled={!canApply}
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
