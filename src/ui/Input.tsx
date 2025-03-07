import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | number; // Renamed to `inputSize`
}

const Input: React.FC<InputProps> = ({ inputSize = "default", ...props }) => {
  const baseClasses =
    "text-gray-600 text-[16px]  border-2 border-gray-300 bg-white rounded-lg px-2 py-1";
  const wideClasses = inputSize ? `w-[${inputSize}]` : "w-full";

  return <input className={`${baseClasses} ${wideClasses}`} {...props} />;
};

export default Input;
