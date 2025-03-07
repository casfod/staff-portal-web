import React from "react";

interface RowProps {
  type?: "horizontal" | "vertical";
  children: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ type = "horizontal", children }) => {
  // Base classes
  const baseClasses = "flex";

  // Type-specific classes
  const typeClasses =
    type === "horizontal"
      ? "justify-between items-center gap-2" // Horizontal layout
      : "flex-col"; // Vertical layout

  return <div className={`${baseClasses} ${typeClasses}`}>{children}</div>;
};

export default Row;
