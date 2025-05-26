import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "very_small" | "small" | "medium" | "large";
  buttonType?: "button" | "submit" | "reset" | "counter";
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  ...props
}) => {
  // Base classes that apply to all buttons
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md shadow-sm transition-colors duration-200";

  // Size classes
  const sizeClasses = {
    very_small: "px-2 py-0.5 text-xs",
    small: "px-2 py-1 text-sm",
    medium: "px-3 py-2 text-sm",
    large: "px-4 py-3 text-base",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "text-white bg-gradient-to-br from-buttonColor to-[#08527A] hover:bg-buttonColorHover border-transparent",
    secondary: "text-white bg-red-500 border hover:bg-red-400",
  };

  // Combine all classes
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button {...props} className={combinedClasses}>
      {children}
    </button>
  );
};

export default Button;
