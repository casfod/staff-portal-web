import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// How far to let people jump when there's no explicit minDate/maxDate.
const DEFAULT_YEARS_PAST = 100;
const DEFAULT_YEARS_FUTURE = 10;

interface DatePickerHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthYearChange: (month: number, year: number) => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  minDate?: Date;
  maxDate?: Date;
}

// Compact, borderless trigger so the month/year selects sit inline in the
// header instead of looking like two separate form fields.
const triggerClassName = cn(
  'h-8 w-auto border-0 bg-transparent px-2 py-1 shadow-none',
  'text-sm font-semibold text-gray-900',
  'hover:bg-gray-100',
  'focus:ring-0 focus:ring-offset-0',
  '[&>span]:line-clamp-1'
);

const DatePickerHeader: React.FC<DatePickerHeaderProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onMonthYearChange,
  isPrevDisabled,
  isNextDisabled,
  minDate,
  maxDate,
}) => {
  const currentYear = currentMonth.getUTCFullYear();
  const currentMonthIndex = currentMonth.getUTCMonth();

  const minYear = minDate ? minDate.getUTCFullYear() : currentYear - DEFAULT_YEARS_PAST;
  const maxYear = maxDate ? maxDate.getUTCFullYear() : currentYear + DEFAULT_YEARS_FUTURE;

  // Make sure the currently displayed year is always selectable, even if
  // it happens to fall outside the computed default window.
  const rangeStart = Math.min(minYear, currentYear);
  const rangeEnd = Math.max(maxYear, currentYear);

  const years: number[] = [];
  for (let y = rangeStart; y <= rangeEnd; y++) years.push(y);

  const isMonthDisabled = (monthIndex: number) => {
    if (minDate && currentYear === minDate.getUTCFullYear() && monthIndex < minDate.getUTCMonth()) {
      return true;
    }
    if (maxDate && currentYear === maxDate.getUTCFullYear() && monthIndex > maxDate.getUTCMonth()) {
      return true;
    }
    return false;
  };

  return (
    <div className="flex items-center justify-between mb-2 gap-1">
      <button
        type="button"
        onClick={onPrevMonth}
        disabled={isPrevDisabled}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-200 flex-shrink-0',
          'hover:bg-gray-100 hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          isPrevDisabled && 'text-gray-300 cursor-not-allowed hover:bg-transparent hover:scale-100'
        )}
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Direct month/year jump so far past/future dates (e.g. a date of
          birth) don't require clicking prev/next dozens or hundreds of times */}
      <div className="flex items-center gap-0.5 min-w-0">
        <Select
          value={String(currentMonthIndex)}
          onValueChange={value => onMonthYearChange(Number(value), currentYear)}
        >
          <SelectTrigger
            className={cn(triggerClassName, 'min-w-[104px]')}
            aria-label="Select month"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, index) => (
              <SelectItem key={name} value={String(index)} disabled={isMonthDisabled(index)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentYear)}
          onValueChange={value => onMonthYearChange(currentMonthIndex, Number(value))}
        >
          <SelectTrigger className={cn(triggerClassName, 'min-w-[76px]')} aria-label="Select year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        onClick={onNextMonth}
        disabled={isNextDisabled}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-200 flex-shrink-0',
          'hover:bg-gray-100 hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          isNextDisabled && 'text-gray-300 cursor-not-allowed hover:bg-transparent hover:scale-100'
        )}
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DatePickerHeader;
