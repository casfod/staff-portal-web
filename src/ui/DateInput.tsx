import { format, parse, isValid } from "date-fns";
import React, { useState, useEffect } from "react";

interface DateInputProps {
  value: string; // Expected format: dd/MM/yyyy
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  label?: string;
  inputSize?: "default" | number;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  required = false,
  id = "",
  label = "",
  inputSize,
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");

  console.log(displayValue);

  const baseClasses =
    "text-gray-600 text-[16px] border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"; // Added `focus:outline-none`
  const wideClasses = inputSize ? `w-[${inputSize}px]` : "w-full"; // Ensure `inputSize` is applied correctly

  // Convert dd/MM/yyyy to yyyy-MM-dd for the input element
  const formatForInput = (dateStr: string): string => {
    if (!dateStr) return "";

    try {
      const date = parse(dateStr, "dd/MM/yyyy", new Date());
      if (isValid(date)) {
        return format(date, "yyyy-MM-dd");
      }
      return "";
    } catch {
      return "";
    }
  };

  // Convert yyyy-MM-dd to dd/MM/yyyy for display and parent component
  const formatForDisplay = (dateStr: string): string => {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      if (isValid(date)) {
        return format(date, "dd/MM/yyyy");
      }
      return "";
    } catch {
      return "";
    }
  };

  // Handle changes from the date input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    const formattedDisplay = formatForDisplay(newValue);
    setDisplayValue(formattedDisplay);
    onChange(formattedDisplay);
  };

  // Sync with external value changes
  useEffect(() => {
    const inputFormatted = formatForInput(value);
    setInternalValue(inputFormatted);
    setDisplayValue(value);
  }, [value]);

  return (
    <div className="date-input-container">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type="date"
        id={id}
        required={required}
        value={internalValue}
        onChange={handleChange}
        className={`date-input ${baseClasses} ${wideClasses}`}
      />
    </div>
  );
};

export default DateInput;
