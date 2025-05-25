const UserBadge = ({
  isDeleted,
  status,
}: {
  isDeleted: boolean;
  status: string;
}) => {
  const baseClasses = `text-center px-1.5 py-0.5 border uppercase rounded ${
    isDeleted ? "text-red-500 border-red-500" : "text-teal-500 border-teal-500"
  }`;
  return <div className={baseClasses}>{status}</div>;
};

export default UserBadge;
