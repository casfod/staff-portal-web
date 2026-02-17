import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { truncateText } from "../utils/truncateText";
import { X } from "lucide-react"; // Import an icon for the clear button

interface Option {
  id: string;
  name: string;
}

interface SelectProps {
  label?: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  customLabel: string;
  optionsHeight?: number | string;
  optionsWeight?: number | string;
  disabled?: boolean;
  filterable?: boolean;
  clearable?: boolean; // New prop to enable/disable clear button
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  customLabel,
  optionsHeight = "auto",
  filterable = false,
  clearable = true, // Default to true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>(value);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = filterable
    ? options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Sync with external value changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the selected option when dropdown opens
  useEffect(() => {
    if (isOpen && optionsRef.current && selectedValue) {
      const selectedIndex = filteredOptions.findIndex(
        (o) => o.id === selectedValue
      );
      if (selectedIndex >= 0) {
        setFocusedIndex(selectedIndex);
      }
    }
  }, [isOpen, selectedValue, filteredOptions]);

  const handleSelect = (val: string) => {
    setSelectedValue(val);
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  // New reset function
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the select open/close
    setSelectedValue(null);
    onChange("");
    setSearchTerm("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex].id);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      default:
        if (filterable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setSearchTerm((prev) => prev + e.key);
          setFocusedIndex(0);
        }
        break;
    }
  };

  const selectedOption = options.find((option) => option.id === selectedValue);

  return (
    <div
      className="  relative w-full md:w-[250px]"
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* Label */}
      {label && (
        <label htmlFor={id} className="block mb-1 font-bold text-sm  ">
          {label}
        </label>
      )}

      {/* Select Trigger */}
      <div
        id={id}
        className={`w-full h-10 px-4 py-1.5 rounded-md border ${
          isOpen ? "border-primary" : "border-gray-300"
        } focus:outline-none shadow-sm   flex items-center justify-between cursor-pointer bg-white`}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <span className="truncate">
          {selectedOption
            ? truncateText(selectedOption.name, 70, "...")
            : customLabel}
        </span>

        <div className="flex items-center gap-1">
          {/* Clear button (only shown when there's a selected value and clearable is true) */}
          {clearable && selectedValue && (
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-400 hover:  transition-colors"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          )}
          <span
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Options Dropdown */}
      {isOpen && (
        <div
          className="absolute z-10 w-full max-h-52 mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
          // className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
          style={{
            maxHeight:
              typeof optionsHeight === "number"
                ? `${optionsHeight}px`
                : optionsHeight,
          }}
          role="listbox"
          ref={optionsRef}
        >
          {/* Search input when filterable */}
          {filterable && (
            <div className="sticky top-0 bg-white p-2 border-b">
              <input
                type="text"
                className="w-full p-2 border rounded text-sm"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.id}
                className={` bg-gray-50 px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                  selectedValue === option.id ? "bg-blue-50 font-medium" : ""
                } ${focusedIndex === index ? "bg-gray-200" : ""}`}
                onClick={() => handleSelect(option.id)}
                role="option"
                aria-selected={selectedValue === option.id}
              >
                {truncateText(option.name, 70, "...")}
              </div>
            ))
          ) : (
            <div className="px-4 py-2   text-center">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
