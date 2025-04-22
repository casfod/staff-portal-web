import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "medium" | "large";
  buttonType?: "button" | "submit" | "reset" | "counter"; // Renamed to `buttonType`
}

const Button: React.FC<ButtonProps> = ({ children, ...Props }) => {
  return (
    <button
      {...Props}
      className="inline-flex items-center 
      px-2 py-1.5 md:px-4 md:py-2 border border-transparent 
      text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-br from-buttonColor to-[#08527A] hover:bg-buttonColorHover"
    >
      {children}
    </button>
  );
};

export default Button;
