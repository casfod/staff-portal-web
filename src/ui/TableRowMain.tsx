import React from "react";

interface TableRowMainProps {
  children: React.ReactNode;
  toggleViewItems: (requestId: string) => void;
  requestId: string;
}

const TableRowMain = ({
  requestId,
  toggleViewItems,
  children,
}: TableRowMainProps) => {
  return (
    <tr
      onClick={() => toggleViewItems(requestId)}
      className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]"
    >
      {children}
    </tr>
  );
};

export default TableRowMain;
