// src/components/ui/select/SelectWrapper.tsx
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '@/lib/utils';

interface SelectWrapperProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string }>;
  customLabel?: string;
  placeholder?: string;
  clearable?: boolean;
  filterable?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SelectWrapper: React.FC<SelectWrapperProps> = ({
  id,
  value,
  onChange,
  options,
  customLabel,
  placeholder = 'Select an option',
  clearable = false,
  filterable = false,
  required = false,
  disabled = false,
  className,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!filterable || !searchTerm) return options;
    return options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm, filterable]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Handle dropdown open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm('');
    } else if (filterable) {
      // Focus the search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Stop propagation to prevent closing the dropdown
  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Prevent search input from losing focus
  const handleSearchMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the dropdown from closing
  };

  return (
    <Select
      value={value}
      onValueChange={onChange}
      onOpenChange={handleOpenChange}
      required={required}
      disabled={disabled}
      open={isOpen}
    >
      <div className="relative">
        <SelectTrigger id={id} className={cn('w-full', !value && 'text-gray-500', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      <SelectContent>
        {customLabel && (
          <SelectGroup>
            <SelectLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">
              {customLabel}
            </SelectLabel>
          </SelectGroup>
        )}

        {/* Search input for filterable */}
        {filterable && (
          <div
            className="px-2 py-1.5 border-b border-gray-100 sticky top-0 bg-white z-10"
            onMouseDown={handleSearchMouseDown}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={handleSearchClick}
              onMouseDown={handleSearchMouseDown}
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <SelectGroup>
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-4 text-sm text-gray-500 text-center">No options found</div>
          ) : (
            filteredOptions.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
