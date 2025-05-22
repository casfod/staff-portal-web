import React from "react";

const TableData = ({ children }: { children: React.ReactNode }) => {
  return (
    <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase truncate">
      {children}
    </td>
  );
};

export default TableData;
