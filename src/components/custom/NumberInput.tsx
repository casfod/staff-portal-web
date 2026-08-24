// src/components/ui/number-input/NumberInput.tsx
import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  allowZero?: boolean;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      id,
      disabled,
      value: externalValue,
      onChange,
      min,
      max,
      step = 1,
      placeholder = 'Enter value',
      allowZero = true,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (externalValue !== undefined && externalValue !== null && externalValue !== '') {
        return String(externalValue);
      }
      return '';
    });

    useEffect(() => {
      if (externalValue !== undefined && externalValue !== null && externalValue !== '') {
        setInternalValue(String(externalValue));
      } else {
        setInternalValue('');
      }
    }, [externalValue]);

    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-4 text-base',
    };

    const baseClasses =
      'flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base ring-offset-white transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const stateClasses = error
      ? 'border-red-500 bg-red-50 hover:border-red-600 focus-visible:ring-red-500'
      : 'hover:border-gray-400 focus-visible:ring-brand-500';

    const paddingLeft = leftIcon ? 'pl-10' : '';
    const paddingRight = rightIcon ? 'pr-10' : '';

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        if (rawValue === '') {
          setInternalValue('');
          onChange?.(null);
          return;
        }

        const isValid = /^-?\d*\.?\d*$/.test(rawValue);
        if (!isValid) return;

        const numValue = parseFloat(rawValue);

        if (min !== undefined && numValue < min) return;
        if (max !== undefined && numValue > max) return;

        setInternalValue(rawValue);

        if (rawValue !== '.' && rawValue !== '-') {
          onChange?.(numValue);
        }
      },
      [onChange, min, max]
    );

    const handleBlur = useCallback(() => {
      if (internalValue === '' || internalValue === '.') {
        return;
      }

      const num = parseFloat(internalValue);
      if (!isNaN(num)) {
        if (Number.isInteger(num)) {
          setInternalValue(String(num));
          onChange?.(num);
        } else {
          const formatted = num.toFixed(2);
          setInternalValue(formatted);
          onChange?.(parseFloat(formatted));
        }
      }
    }, [internalValue, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const currentValue = internalValue === '' ? 0 : parseFloat(internalValue);
          if (isNaN(currentValue)) return;

          const stepValue = e.key === 'ArrowUp' ? step : -step;
          let newValue = currentValue + stepValue;

          if (min !== undefined && newValue < min) newValue = min;
          if (max !== undefined && newValue > max) newValue = max;

          if (step !== 1) {
            newValue = Math.round(newValue / step) * step;
          }

          setInternalValue(String(newValue));
          onChange?.(newValue);
        }
      },
      [internalValue, step, min, max, onChange]
    );

    const displayValue = internalValue === '' && !allowZero ? '' : internalValue;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type="text"
            inputMode="decimal"
            className={cn(
              baseClasses,
              sizeClasses[inputSize],
              stateClasses,
              paddingLeft,
              paddingRight,
              className
            )}
            ref={ref}
            id={id}
            disabled={disabled}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        {helper && !error && <p className="mt-1.5 text-sm text-gray-500">{helper}</p>}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
