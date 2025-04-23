import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoXCircle } from "react-icons/go";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  minDate?: Date | null; // New prop for minimum date limit
  maxDate?: Date | null; // New prop for maximum date limit
  dependsOn?: string | Date | null | undefined; // New prop for conditional disabling
}

export default function DatePicker({
  selected,
  onChange,
  placeholder = "Date - dd-mm-yyyy",
  className = "",
  clearable = true,
  variant = "primary",
  size = "md",
  disabled = false,
  minDate = null, // Default to no minimum date
  maxDate = null, // Default to no maximum date
  dependsOn = null, // Default to no dependency
}: DatePickerProps) {
  const variantClasses = {
    primary: "border-gray-50 text-gray-50",
    secondary: "border-gray-300 text-gray-600",
  };

  const sizeClasses = {
    sm: "py-0.5 px-2 text-sm",
    md: "py-1 px-3 text-base",
    lg: "py-2 px-4 text-lg",
  };

  // Determine if the picker should be disabled
  const isDisabled = disabled || (dependsOn === null && !!dependsOn);

  return (
    <div
      className={`relative flex flex-col items-center border-2 w-full max-w-[200px] bg-inherit rounded-lg focus-within:border-2 ${variantClasses[variant]} ${className}`}
    >
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="dd-MM-yyyy"
        className={`w-full text-center bg-inherit placeholder:text-gray-500 border-none focus:outline-none rounded-md ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        placeholderText={placeholder}
        disabled={isDisabled}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        selectsStart={!!minDate} // Indicates this picker selects the start date
        selectsEnd={!!maxDate} // Indicates this picker selects the end date
      />
      {clearable && selected && !isDisabled && (
        <span
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110 ${variantClasses[variant]}`}
          onClick={() => onChange(null)}
        >
          <GoXCircle />
        </span>
      )}
    </div>
  );
}
