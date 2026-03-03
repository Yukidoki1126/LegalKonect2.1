import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface DateTimePickerProps {
  value: string; // format: "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  minDate?: Date;
  bookedDates?: string[]; // ISO date strings (e.g. "2026-02-28") that are booked
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function DateTimePicker({ value, onChange, minDate, bookedDates = [] }: DateTimePickerProps) {
  // Parse initial value
  const parsedDate = value ? new Date(value) : null;

  const [viewYear, setViewYear] = useState(parsedDate?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate?.getMonth() ?? new Date().getMonth());

  const [selectedDay, setSelectedDay] = useState<number | null>(parsedDate?.getDate() ?? null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(parsedDate?.getMonth() ?? null);
  const [selectedYear, setSelectedYear] = useState<number | null>(parsedDate?.getFullYear() ?? null);

  const [hour, setHour] = useState(() => {
    if (!parsedDate) return 9;
    const h = parsedDate.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });
  const [minute, setMinute] = useState(parsedDate?.getMinutes() ?? 0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(() => {
    if (!parsedDate) return 'AM';
    return parsedDate.getHours() >= 12 ? 'PM' : 'AM';
  });

  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, []);

  const minDateNorm = useMemo(() => {
    if (!minDate) return null;
    return { year: minDate.getFullYear(), month: minDate.getMonth(), day: minDate.getDate() };
  }, [minDate]);

  const daysInMonth = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const firstDay = useMemo(() => getFirstDayOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  // Build a Set of booked date keys for fast lookup
  const bookedSet = useMemo(() => {
    const set = new Set<string>();
    for (const d of bookedDates) {
      // Normalize to YYYY-MM-DD
      const key = d.substring(0, 10);
      set.add(key);
    }
    return set;
  }, [bookedDates]);

  const isDayBooked = (day: number) => {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedSet.has(key);
  };

  // Build the calendar grid
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [daysInMonth, firstDay]);

  const emitChange = useCallback((
    day: number, month: number, year: number,
    h: number, m: number, ap: 'AM' | 'PM'
  ) => {
    let hour24 = h;
    if (ap === 'AM' && h === 12) hour24 = 0;
    else if (ap === 'PM' && h !== 12) hour24 = h + 12;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange(dateStr);
  }, [onChange]);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setSelectedMonth(viewMonth);
    setSelectedYear(viewYear);
    emitChange(day, viewMonth, viewYear, hour, minute, ampm);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      emitChange(selectedDay, selectedMonth, selectedYear, newHour, minute, ampm);
    }
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      emitChange(selectedDay, selectedMonth, selectedYear, hour, newMinute, ampm);
    }
  };

  const handleAmpmChange = (newAmpm: 'AM' | 'PM') => {
    setAmpm(newAmpm);
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      emitChange(selectedDay, selectedMonth, selectedYear, hour, minute, newAmpm);
    }
  };

  const isDayDisabled = (day: number) => {
    if (!minDateNorm) return false;
    const cellDate = new Date(viewYear, viewMonth, day);
    const minD = new Date(minDateNorm.year, minDateNorm.month, minDateNorm.day);
    return cellDate < minD;
  };

  const isSelected = (day: number) => {
    return selectedDay === day && selectedMonth === viewMonth && selectedYear === viewYear;
  };

  const isToday = (day: number) => {
    return viewYear === today.year && viewMonth === today.month && day === today.day;
  };

  // Check if prev month button should be disabled
  const isPrevDisabled = minDateNorm
    ? viewYear < minDateNorm.year || (viewYear === minDateNorm.year && viewMonth <= minDateNorm.month)
    : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar */}
      <div className="w-full">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isPrevDisabled
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "hover:bg-muted text-foreground"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-foreground">
            {MONTHS[viewMonth]} {viewYear}
          </h3>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-[11px] sm:text-xs font-semibold text-muted-foreground py-1.5 sm:py-2 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }
            const past = isDayDisabled(day);
            const booked = !past && isDayBooked(day);
            const disabled = past || booked;
            const selected = isSelected(day);
            const todayCell = isToday(day);
            const available = !past && !booked;

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  // Past days
                  past && "bg-muted/40 text-muted-foreground/30 cursor-not-allowed line-through",
                  // Selected day (overrides green/red)
                  selected && "bg-primary text-primary-foreground shadow-md scale-105",
                  // Booked days (red, disabled)
                  booked && !selected && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 cursor-not-allowed opacity-80",
                  // Available days (green)
                  available && !selected && "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 cursor-pointer",
                  // Today ring
                  todayCell && !selected && "ring-2 ring-primary/50 font-bold"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700" />
            Booked
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-muted/40 border border-border" />
            Past
          </span>
        </div>

        {/* Today shortcut */}
        {!isDayDisabled(today.day) || viewMonth !== today.month || viewYear !== today.year ? (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setViewMonth(today.month);
                setViewYear(today.year);
                handleDayClick(today.day);
              }}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Today
            </button>
          </div>
        ) : null}
      </div>

      {/* Time Picker */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Select Time</span>
        </div>

        {/* Time display */}
        <div className="text-center mb-3 p-2.5 sm:p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
          </span>
          <span className="text-base sm:text-lg font-semibold text-primary ml-2">{ampm}</span>
        </div>

        <div className="flex gap-2">
          {/* Hour column */}
          <div className="flex-1">
            <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center mb-1.5 sm:mb-2 uppercase tracking-wider">Hour</div>
            <div className="h-36 sm:h-44 overflow-y-auto rounded-lg border border-border">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourChange(h)}
                  className={cn(
                    "w-full py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-center transition-colors",
                    hour === h
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {String(h).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Minute column */}
          <div className="flex-1">
            <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center mb-1.5 sm:mb-2 uppercase tracking-wider">Min</div>
            <div className="h-36 sm:h-44 overflow-y-auto rounded-lg border border-border">
              {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteChange(m)}
                  className={cn(
                    "w-full py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-center transition-colors",
                    minute === m
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* AM/PM column */}
          <div className="w-14 sm:w-16">
            <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center mb-1.5 sm:mb-2 uppercase tracking-wider">&nbsp;</div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleAmpmChange('AM')}
                className={cn(
                  "py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-colors",
                  ampm === 'AM'
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted text-foreground"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handleAmpmChange('PM')}
                className={cn(
                  "py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-colors",
                  ampm === 'PM'
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted text-foreground"
                )}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Selected datetime summary */}
        {selectedDay !== null && selectedMonth !== null && selectedYear !== null && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-muted/50 border border-border text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Selected</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {MONTHS[selectedMonth]} {selectedDay}, {selectedYear}
            </p>
            <p className="text-xs sm:text-sm text-foreground">
              {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} {ampm}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
