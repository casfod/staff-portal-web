const StatusBadge = ({ status }: { status: string }) => {
<<<<<<< HEAD
  const getStatusStyles = () => {
    const baseStyles =
      "inline-flex items-center justify-center px-2.5 py-1 text-sm font-medium rounded-md whitespace-nowrap";

    switch (status.toLowerCase()) {
      case "draft":
        return `${baseStyles} border border-gray-400 text-gray-700`;
      case "pending":
        return `${baseStyles} bg-amber-500 text-white`;
      case "approved":
        return `${baseStyles} bg-teal-600 text-white`;
      case "rejected":
        return `${baseStyles} bg-red-500 text-white`;
      case "reviewed":
        return `${baseStyles} bg-[#0B6DA2] text-white`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

  return <span className={getStatusStyles()}>{status.toUpperCase()}</span>;
=======
  const statusStyles = {
    draft: "border border-gray-400",
    pending: "bg-amber-500 text-white",
    approved: "bg-teal-600 text-white",
    rejected: "bg-red-500 text-white",
    reviewed: "bg-[#0B6DA2] text-white",
  };

  return (
    <div
      className={`w-fit h-fit px-2 py-0.5 whitespace-nowrap rounded-lg uppercase mb-1 ${
        statusStyles[status as keyof typeof statusStyles]
      }`}
    >
      <p>{status}</p>
    </div>
  );
>>>>>>> main
};

export default StatusBadge;
