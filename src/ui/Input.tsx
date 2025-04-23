import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = "default", style, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        min={type === "number" ? 0 : undefined}
        className="text-gray-600 border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"
        style={
          inputSize !== "default"
            ? { width: `${inputSize}px`, ...style }
            : style
        }
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
