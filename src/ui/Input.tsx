import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | number; // Renamed to `inputSize`
}

const Input: React.FC<InputProps> = ({ inputSize = "default", ...props }) => {
  const baseClasses =
    "text-gray-600 text-[16px] border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"; // Added `focus:outline-none`
  const wideClasses = inputSize ? `w-[${inputSize}px]` : "w-full"; // Ensure `inputSize` is applied correctly

  return <input className={`${baseClasses} ${wideClasses}`} {...props} />;
};

export default Input;
