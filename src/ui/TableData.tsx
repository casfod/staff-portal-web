import React from "react";

const TableData = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <td
      className={`px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm   uppercase truncate ${className}`}
    >
      {children}
    </td>
  );
};

export default TableData;
