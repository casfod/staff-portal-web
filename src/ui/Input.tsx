import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | number; // Renamed to `inputSize`
}

const Input: React.FC<InputProps> = ({ inputSize = "default", ...props }) => {
  return (
    <input
      className={`text-gray-600 border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none `}
      {...props}
    />
  );
};

export default Input;
