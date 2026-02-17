import React from "react";

type RowProps = {
  children: React.ReactNode;
  cols?: string;
};

const Row: React.FC<RowProps> = ({ cols, children }) => {
  return (
    <div className={`w-full grid ${cols ? cols : "grid-cols-1"} gap-3 z-10`}>
      {children}
    </div>
  );
};
export default Row;
