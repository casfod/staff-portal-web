import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "very_small" | "small" | "medium" | "large";
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  type = "button", // Added default for type prop
  disabled,
  ...props
}) => {
  // Base classes that apply to all buttons
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buttonColor disabled:opacity-50 disabled:cursor-not-allowed";

  // Size classes
  const sizeClasses = {
    very_small: "px-2 py-0.5 text-xs",
    small: "px-2.5 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "text-white bg-gradient-to-br from-buttonColor to-[#08527A] hover:from-buttonColorHover hover:to-[#0a6490] focus:ring-buttonColor border-transparent",
    secondary:
      "text-white bg-red-500 hover:bg-red-600 focus:ring-red-500 border-transparent",
  };

  // Combine all classes
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${
    variantClasses[variant]
  } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
