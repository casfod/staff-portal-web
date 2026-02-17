import React from "react";
import { AlertCircle } from "lucide-react";

interface FormRowProps {
  label: string;
  children: React.ReactNode;
  type?: "normal" | "wide" | "full";
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
}

const FormRow: React.FC<FormRowProps> = ({
  label,
  children,
  type = "normal",
  error,
  icon,
  required,
  className = "",
}) => {
  // Base classes for the container
  const containerClasses = "flex flex-col w-full";

  // Type-specific classes
  const typeClasses = {
    normal: "", // Takes natural width based on content/flex parent
    wide: "col-span-full", // For grid layouts
    full: "w-full", // Forces full width
  }[type];

  return (
    <div className={`${containerClasses} ${typeClasses} ${className}`}>
      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
        {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
        {required && <span className="text-red-500 flex-shrink-0">*</span>}
      </label>

      <div className="relative w-full">
        {/* Clone the child and add full width if it's an input-like element */}
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              ...children.props,
              className: `w-full ${children.props.className || ""}`.trim(),
            })
          : children}

        {/* Error indicator - positioned absolutely */}
        {error && (
          <div className="absolute right-0 top-0 -translate-y-1/2 flex items-center gap-1 text-xs text-red-500 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm border border-red-200">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[200px]">{error}</span>
          </div>
        )}
      </div>

      {/* Error message below (visible on mobile) */}
      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-start gap-1 sm:hidden">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormRow;
