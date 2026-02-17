import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | number;
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = "default",
      style,
      type,
      onChange,
      value,
      min,
      max,
      error,
      className = "",
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        let newValue = e.target.value.replace(/^0+(?=\d)/, "");
        if (newValue === "") newValue = "0";

        const numericValue = parseFloat(newValue);
        if (!isNaN(numericValue)) {
          if (min !== undefined && numericValue < parseFloat(min as string)) {
            newValue = min as string;
          } else if (
            max !== undefined &&
            numericValue > parseFloat(max as string)
          ) {
            newValue = max as string;
          }
        }

        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: newValue,
          },
        };

        onChange?.(newEvent as React.ChangeEvent<HTMLInputElement>);
      } else {
        onChange?.(e);
      }
    };

    const formatValue = (val: any) => {
      if (type === "number" && val !== undefined && val !== null) {
        return String(val).replace(/^0+(?=\d)/, "");
      }
      return val;
    };

    const baseClasses =
      "border-2 rounded-lg px-2 py-1.5 w-full transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-0";
    const normalClasses =
      "border-gray-300 bg-white hover:border-gray-400 focus:border-[#08527A] focus:ring-blue-200";
    const errorClasses =
      "border-red-500 bg-red-50 hover:border-red-600 focus:border-red-500 focus:ring-red-200";

    return (
      <input
        ref={ref}
        type={type}
        min={min}
        max={max}
        className={`${baseClasses} ${
          error ? errorClasses : normalClasses
        } ${className}`}
        style={
          inputSize !== "default"
            ? { width: `${inputSize}px`, ...style }
            : style
        }
        onChange={handleChange}
        value={formatValue(value)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
