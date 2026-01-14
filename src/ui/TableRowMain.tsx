import React from "react";

interface TableRowMainProps {
  children: React.ReactNode;
  toggleViewItems: (requestId: string) => void;
  requestId: string;
  className?: string;
}

const TableRowMain = ({
  requestId,
  toggleViewItems,
  className,
  children,
}: TableRowMainProps) => {
  return (
    <tr
      onClick={() => toggleViewItems(requestId)}
      className={`h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2] ${className}`}
    >
      {children}
    </tr>
  );
};

export default TableRowMain;
