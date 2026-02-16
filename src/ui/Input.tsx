// Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { inputSize = "default", style, type, onChange, value, min, max, ...props },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        let newValue = e.target.value.replace(/^0+(?=\d)/, ""); // Remove leading zeros
        if (newValue === "") newValue = "0"; // Prevent empty value

        // Apply min/max constraints
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

    return (
      <input
        ref={ref}
        type={type}
        min={min}
        max={max}
        className="border-2 border-gray-300 bg-white rounded-lg px-2 py-1.5 focus:outline-none"
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
