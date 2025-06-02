const StatusBadge = ({ status }: { status: string }) => {
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
};

export default StatusBadge;
