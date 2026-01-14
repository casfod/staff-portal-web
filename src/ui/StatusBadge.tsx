const StatusBadge = ({
  status,
  size = "base",
}: {
  status: string;
  size?: "sm" | "base" | "lg";
}) => {
  const statusStyles = {
    draft: "border border-gray-400",
    pending: "bg-amber-500 text-white",
    approved: "bg-teal-600 text-white",
    rejected: "bg-red-500 text-white",
    reviewed: "bg-[#0B6DA2] text-white",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-xs font-medium rounded-lg",
    base: "px-2 py-0.5 text-sm font-semibold rounded-lg",
    lg: "px-3 py-1.5 text-base font-semibold rounded-lg",
  };

  const statusText =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <div
      className={`inline-flex items-center justify-center ${sizeStyles[size]} ${
        statusStyles[status as keyof typeof statusStyles]
      }`}
    >
      <span className={`${size === "sm" ? "text-[10px]" : ""}`}>
        {statusText}
      </span>
    </div>
  );
};

export default StatusBadge;
