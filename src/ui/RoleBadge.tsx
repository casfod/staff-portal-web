import React from "react";

type Role = "STAFF" | "ADMIN" | "SUPER-ADMIN" | "REVIEWER";

const RoleBadge = ({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) => {
  const baseClasses =
    "w-fit h-fit px-2 whitespace-nowrap rounded-lg uppercase mb-1";
  const roleStyles = {
    STAFF: "border border-gray-400 text-gray-700",
    ADMIN: "bg-secondary text-white",
    "SUPER-ADMIN": "bg-secondary text-white",
    REVIEWER: "bg-buttonColor text-white",
  };

  return (
    <div className={`${baseClasses} ${roleStyles[role] || ""}`}>
      <p style={{ letterSpacing: "1px" }}>{children}</p>
    </div>
  );
};

export default RoleBadge;
