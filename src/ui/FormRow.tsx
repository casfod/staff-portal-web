import React from "react";

interface FormRowProps {
  label?: string;
  error?: string;
  lebelColor?: string;
  children: React.ReactElement;
  type?: "small" | "medium" | "large" | "wide";
}

const FormRow: React.FC<FormRowProps> = ({
  label,
  error,
  children,
  type,
  lebelColor,
}) => {
  // Base classes
  const baseClasses = "flex flex-col gap-1 text-sm";

  // Type-specific width classes
  const widthClasses = {
    small: "w-1/4", // 25% width
    medium: "w-1/2", // 50% width
    large: "w-3/4", // 75% width
    wide: "w-full", // 100% width
  };

  // Determine the width class based on the `type` prop
  // const widthClass = type ? widthClasses[type] : "w-2/5"; // Default width (40%)
  const widthClass = type ? widthClasses[type] : "w-full"; // Default width (40%)

  return (
    <div className={`${baseClasses} ${widthClass}`}>
      {label && (
        <label
          htmlFor={children.props.id}
          // className={`border min-w-[150px] ${
          className={`${
            lebelColor ? `text-[${lebelColor}]` : "text-gray-600"
          } font-extrabold`}
          style={{ letterSpacing: "1px" }}
        >
          {label}
        </label>
      )}
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default FormRow;
