// DatePicker.tsx - Enhanced with Radix UI Popover
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  requiredTrigger?: boolean;
}

export default function DatePicker({
  selected,
  onChange,
  placeholder = 'Date - dd-mm-yyyy',
  className = '',
  clearable = true,
  variant = 'primary',
  size = 'md',
  disabled = false,
  minDate,
  maxDate,
  requiredTrigger = true,
}: DatePickerProps) {
  const variantClasses = {
    primary: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
    secondary: 'border-gray-200 focus:border-brand-400 focus:ring-brand-400',
  };

  const sizeClasses = {
    sm: 'py-1 px-2 text-sm h-9',
    md: 'py-1.5 px-3 text-base h-10',
    lg: 'py-2 px-4 text-lg h-12',
  };

  const normalizedMinDate = minDate ? new Date(new Date(minDate).setHours(0, 0, 0, 0)) : undefined;
  const normalizedMaxDate = maxDate
    ? new Date(new Date(maxDate).setHours(23, 59, 59, 999))
    : undefined;

  return (
    <div className={cn('relative w-full max-w-[200px]', className)}>
      <div
        className={cn(
          'relative flex items-center rounded-lg border-2 bg-white transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-offset-1',
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          dateFormat="dd-MM-yyyy"
          className={cn(
            'w-full bg-transparent text-gray-900 border-none focus:outline-none rounded-md placeholder:text-gray-400',
            sizeClasses[size],
            disabled && 'cursor-not-allowed'
          )}
          placeholderText={placeholder}
          disabled={disabled || !requiredTrigger}
          minDate={normalizedMinDate}
          maxDate={normalizedMaxDate}
          selectsStart={!!minDate}
          selectsEnd={!!maxDate}
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={15}
          popperClassName="react-datepicker-popper"
        />

        {clearable && selected && !disabled && requiredTrigger && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
            onClick={() => onChange(null)}
            type="button"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
}
