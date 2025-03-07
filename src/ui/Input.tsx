import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | number; // Renamed to `inputSize`
}

const Input: React.FC<InputProps> = ({ inputSize = "default", ...props }) => {
  const baseClasses = "border-2 border-gray-300 bg-white rounded-lg p-1";
  const wideClasses = inputSize ? `w-[${inputSize}]` : "w-full";

  return <input className={`${baseClasses} ${wideClasses}`} {...props} />;
};

export default Input;
