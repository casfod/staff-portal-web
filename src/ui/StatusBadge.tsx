const StatusBadge = ({ status }: { status: string }) => {
  return (
    <div
      className={`w-fit h-fit px-2 whitespace-nowrap rounded-lg uppercase mb-1
    ${status === "draft" && "border border-gray-400"} 
    ${status === "pending" && "bg-amber-500 text-white"} ${
        status === "approved" && "bg-teal-600 text-white"
      } 
  ${status === "rejected" && "bg-red-500 text-white"}  ${
        status === "reviewed" && "bg-buttonColor text-white"
      }`}
    >
      <p
        className={``}
        // style={{ letterSpacing: "1px" }}
      >{`${status}`}</p>
    </div>
  );
};

export default StatusBadge;
