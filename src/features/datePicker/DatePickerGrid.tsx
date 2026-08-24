// DatePickerGrid.tsx - Fixed
import React from 'react';
import { getDaysInMonth, isDateInRange, isSameDay } from './dateUtils';
import { cn } from '@/lib/utils';

interface DatePickerGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onDateSelect: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DatePickerGrid: React.FC<DatePickerGridProps> = ({
  currentMonth,
  selectedDate,
  minDate,
  maxDate,
  onDateSelect,
}) => {
  const today = new Date();
  const daysInMonthArray = getDaysInMonth(currentMonth);

  // For better touch support on mobile
  const handleTouchStart = (date: Date, isDisabled: boolean) => (e: React.TouchEvent) => {
    if (!isDisabled) {
      e.preventDefault();
      onDateSelect(date);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-1 select-none">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonthArray.map((date, index) => {
          const isCurrentMonth = date.getUTCMonth() === currentMonth.getUTCMonth();
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isInRange = isDateInRange(date, minDate, maxDate);
          const isDisabled = !isCurrentMonth || !isInRange;

          return (
            <button
              key={index}
              type="button"
              onClick={() => !isDisabled && onDateSelect(date)}
              onTouchStart={handleTouchStart(date, isDisabled)}
              disabled={isDisabled}
              aria-label={date.toUTCString()}
              className={cn(
                'relative h-8 w-8 flex items-center justify-center text-sm rounded-full',
                'transition-all duration-200 select-none',
                'hover:scale-110 active:scale-95', // Better touch feedback
                isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                  : isToday && !isSelected
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : isCurrentMonth && !isDisabled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300',
                isDisabled && 'cursor-not-allowed opacity-40',
                !isDisabled && !isSelected && 'cursor-pointer',
                isSelected && 'animate-in fade-in-50 zoom-in-95'
              )}
            >
              {date.getUTCDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePickerGrid;
