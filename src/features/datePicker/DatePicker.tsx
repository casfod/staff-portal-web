import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { formatDate, isDateInRange } from "./dateUtils";
import DatePickerHeader from "./DatePickerHeader";
import DatePickerGrid from "./DatePickerGrid";

export interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  label,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate || new Date()
  );
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update current month view if selected date changes externally
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const handleDateSelect = (date: Date) => {
    if (isDateInRange(date, minDate, maxDate)) {
      onChange(date);
      setIsOpen(false);
    }
  };

  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const isPrevMonthDisabled = (): boolean => {
    if (!minDate) return false;

    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    prevMonth.setDate(1);

    return prevMonth < new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  };

  const isNextMonthDisabled = (): boolean => {
    if (!maxDate) return false;

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);

    return nextMonth > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  };

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div
        className={`flex items-center border rounded-md px-3 py-2 bg-white 
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "cursor-pointer hover:border-blue-500"
          } 
          ${
            isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300"
          }`}
        onClick={toggleCalendar}
      >
        <Calendar className="w-5 h-5 text-gray-500 mr-2" />
        <span
          className={`flex-grow ${
            selectedDate ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <ChevronRight
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute mt-1 z-10 bg-white rounded-lg shadow-lg p-4 border border-gray-200 w-[320px] animate-fadeIn">
          <DatePickerHeader
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            isPrevDisabled={isPrevMonthDisabled()}
            isNextDisabled={isNextMonthDisabled()}
          />

          <DatePickerGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            minDate={minDate}
            maxDate={maxDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
