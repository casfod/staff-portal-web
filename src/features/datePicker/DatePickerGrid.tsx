import React from "react";
import { getDaysInMonth, isDateInRange, isSameDay } from "./dateUtils";

interface DatePickerGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onDateSelect: (date: Date) => void;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const DatePickerGrid: React.FC<DatePickerGridProps> = ({
  currentMonth,
  selectedDate,
  minDate,
  maxDate,
  onDateSelect,
}) => {
  const today = new Date();

  // Get all days in the current month view
  const daysInMonthArray = getDaysInMonth(currentMonth);

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonthArray.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isInRange = isDateInRange(date, minDate, maxDate);
          const isDisabled = !isCurrentMonth || !isInRange;

          return (
            <button
              key={index}
              type="button"
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={`
                h-8 w-8 flex items-center justify-center text-sm rounded-full transition-all duration-200
                ${
                  isSelected
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : isToday
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : isCurrentMonth
                    ? "text-gray-900 hover:bg-gray-100"
                    : "text-gray-400"
                }
                ${
                  isDisabled
                    ? "cursor-not-allowed opacity-40"
                    : "cursor-pointer"
                }
              `}
              aria-label={date.toDateString()}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePickerGrid;
