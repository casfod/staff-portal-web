import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = value || placeholder;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="w-full h-8 px-4 text-left text-sm rounded-md border border-gray-300 focus:border-primary focus:outline-none shadow-sm bg-white flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        id={id}
      >
        <span
          className={`truncate ${value ? "text-gray-900" : "text-gray-500"}`}
        >
          {selectedOption}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {required || (
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-500"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              >
                {placeholder}
              </button>
            )}
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                  value === option
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900"
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
