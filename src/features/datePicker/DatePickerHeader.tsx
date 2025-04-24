import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthYearString } from "./dateUtils";

interface DatePickerHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}

const DatePickerHeader: React.FC<DatePickerHeaderProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  isPrevDisabled,
  isNextDisabled,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        type="button"
        onClick={onPrevMonth}
        disabled={isPrevDisabled}
        className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
          isPrevDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-600"
        }`}
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <h2 className="text-sm font-semibold text-gray-900">
        {getMonthYearString(currentMonth)}
      </h2>

      <button
        type="button"
        onClick={onNextMonth}
        disabled={isNextDisabled}
        className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
          isNextDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-600"
        }`}
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DatePickerHeader;
