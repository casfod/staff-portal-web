// DatePicker.tsx - Fixed for Cross-Platform Consistency
import React, { useState, useEffect, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Label from '@radix-ui/react-label';
import { Calendar, ChevronRight, X } from 'lucide-react';
import { formatDate, isDateInRange } from './dateUtils';
import DatePickerHeader from './DatePickerHeader';
import DatePickerGrid from './DatePickerGrid';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  selected: Date | string | null;
  onChange: (date: Date | null) => void;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  clearable?: boolean;
  requiredTrigger?: boolean;
}

// Helper to normalize date for cross-platform consistency
const normalizeDate = (date: Date | string | null): Date | null => {
  if (!date) return null;
  if (date instanceof Date) {
    // Reset time to midnight UTC to avoid timezone issues
    const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return normalized;
  }
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return null;
    const normalized = new Date(
      Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    );
    return normalized;
  } catch {
    return null;
  }
};

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  label,
  disabled = false,
  className = '',
  error,
  size = 'md',
  variant = 'primary',
  clearable = false,
  requiredTrigger = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<Date | null>(() =>
    normalizeDate(selected)
  );
  const triggerRef = useRef<HTMLDivElement>(null);

  // Get normalized dates for min/max
  const normalizedMinDate = minDate ? normalizeDate(minDate) : null;
  const normalizedMaxDate = maxDate ? normalizeDate(maxDate) : null;

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const date = normalizeDate(selected) || new Date();
    // Reset to first day of month UTC
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  });

  // Sync with external selected prop
  useEffect(() => {
    const newDate = normalizeDate(selected);
    setInternalSelected(newDate);
    if (newDate) {
      setCurrentMonth(new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), 1)));
    }
  }, [selected]);

  // Escape-to-close and click-outside dismissal are already handled by
  // Radix's Popover.Content (via Popover.Root's open/onOpenChange).
  // A manual `mousedown` listener here is dangerous: Popover.Content is
  // rendered through a Portal, so it's outside `triggerRef`'s subtree,
  // and mousedown fires before click — closing the popover (and
  // unmounting the day button) before its onClick ever runs.

  const handleDateSelect = (date: Date) => {
    const normalized = normalizeDate(date);
    if (!normalized) return;

    if (isDateInRange(normalized, normalizedMinDate || undefined, normalizedMaxDate || undefined)) {
      setInternalSelected(normalized);
      onChange(normalized);
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setUTCMonth(newMonth.getUTCMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setUTCMonth(newMonth.getUTCMonth() + 1);
      return newMonth;
    });
  };

  // Lets the header's month/year dropdowns jump straight to a distant
  // date (e.g. a date of birth) instead of stepping one month at a time.
  const handleMonthYearChange = (month: number, year: number) => {
    setCurrentMonth(new Date(Date.UTC(year, month, 1)));
  };

  const isPrevMonthDisabled = (): boolean => {
    if (!normalizedMinDate) return false;
    const prevMonth = new Date(currentMonth);
    prevMonth.setUTCMonth(prevMonth.getUTCMonth() - 1);
    prevMonth.setUTCDate(1);
    return (
      prevMonth <
      new Date(Date.UTC(normalizedMinDate.getFullYear(), normalizedMinDate.getMonth(), 1))
    );
  };

  const isNextMonthDisabled = (): boolean => {
    if (!normalizedMaxDate) return false;
    const nextMonth = new Date(currentMonth);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    nextMonth.setUTCDate(1);
    return (
      nextMonth >
      new Date(Date.UTC(normalizedMaxDate.getFullYear(), normalizedMaxDate.getMonth(), 1))
    );
  };

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm h-9',
    md: 'px-3 py-2 text-sm h-10',
    lg: 'px-4 py-2.5 text-base h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    primary: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    secondary: 'border-gray-200 focus:ring-brand-500 focus:border-brand-500',
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalSelected(null);
    onChange(null);
  };

  const displayDate = internalSelected ? formatDate(internalSelected) : '';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label.Root className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {requiredTrigger && <span className="text-red-500 ml-0.5">*</span>}
        </Label.Root>
      )}

      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <div
            ref={triggerRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-invalid={!!error}
            onKeyDown={e => {
              if (disabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(prev => !prev);
              }
            }}
            className={cn(
              'w-full flex items-center gap-2 rounded-lg border bg-white transition-all duration-200',
              'focus:outline-none focus-visible:outline-none',
              sizeClasses[size],
              variantClasses[variant],
              disabled
                ? 'bg-gray-50 cursor-not-allowed opacity-60'
                : 'hover:border-gray-400 cursor-pointer',
              isOpen && 'ring-2 ring-offset-2 ring-blue-500 border-blue-500',
              error && 'border-red-500 ring-2 ring-red-100',
              'group'
            )}
          >
            <Calendar
              className={cn(
                'flex-shrink-0 transition-colors',
                iconSizeClasses[size],
                error ? 'text-red-500' : 'text-gray-400'
              )}
            />

            <span
              className={cn(
                'flex-1 text-left truncate select-none',
                internalSelected ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {displayDate || placeholder}
            </span>

            {clearable && internalSelected && !disabled && (
              <button
                type="button"
                onClick={clearDate}
                className={cn(
                  'p-0.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                )}
                aria-label="Clear date"
              >
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}

            <ChevronRight
              className={cn(
                'text-gray-400 transition-transform duration-200 flex-shrink-0',
                iconSizeClasses[size],
                isOpen && 'rotate-90'
              )}
            />
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align="start"
            className={cn(
              'z-50 w-[320px] rounded-xl bg-white shadow-lg',
              'border border-gray-200',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0',
              'data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
              'data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2',
              'will-change-transform focus:outline-none',
              'max-w-[calc(100vw-2rem)]'
            )}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <div className="p-4">
              <DatePickerHeader
                currentMonth={currentMonth}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onMonthYearChange={handleMonthYearChange}
                isPrevDisabled={isPrevMonthDisabled()}
                isNextDisabled={isNextMonthDisabled()}
                minDate={normalizedMinDate || undefined}
                maxDate={normalizedMaxDate || undefined}
              />

              <DatePickerGrid
                currentMonth={currentMonth}
                selectedDate={internalSelected}
                minDate={normalizedMinDate || undefined}
                maxDate={normalizedMaxDate || undefined}
                onDateSelect={handleDateSelect}
              />

              <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const normalized = normalizeDate(today);
                    if (normalized) {
                      if (
                        isDateInRange(
                          normalized,
                          normalizedMinDate || undefined,
                          normalizedMaxDate || undefined
                        )
                      ) {
                        handleDateSelect(normalized);
                      }
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 py-0.5"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 py-0.5"
                >
                  Close
                </button>
              </div>
            </div>

            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DatePicker;
