import React from "react";

interface Option {
  id: string;
  name: string;
}

interface SelectProps {
  label?: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  required?: boolean;
  customLabel: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  required = false,
  customLabel,
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block mb-1 font-bold text-sm text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        className="w-full h-8 md:h-10 px-4 placeholder:text-sm rounded-md border focus:border-primary focus:outline-none shadow-sm text-gray-700"
        id={id}
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">{customLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
