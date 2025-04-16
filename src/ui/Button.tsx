import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "medium" | "large";
  buttonType?: "button" | "submit" | "reset" | "counter"; // Renamed to `buttonType`
}

const Button: React.FC<ButtonProps> = ({
  size = "medium",
  buttonType = "button", // Use `buttonType` instead of `type`
  children,
  ...props
}) => {
  // Base classes
  const baseClasses =
    " inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover gap-2";

  // Size-specific classes
  const sizeClasses = {
    small: "text-sm px-3 py-2 uppercase font-semibold",
    medium: "text-base px-4 py-3 font-medium",
    large: "text-lg px-6 py-4 font-medium",
  };

  // Type-specific classes
  const typeClasses =
    buttonType === "counter" // Use `buttonType` instead of `type`
      ? "flex items-center gap-2 text-sm px-4 py-3 uppercase font-semibold bg-blue-600 hover:bg-blue-700 w-auto"
      : "self-center";

  return (
    <button
      type={buttonType === "counter" ? "button" : buttonType} // Map `counter` to `button`
      className={`${baseClasses} ${sizeClasses[size]} ${typeClasses}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
