import React from "react";

const TextHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1
      className="md:text-xl 2xl:text-2xl font-semibold text-gray-600"
      style={{ fontFamily: "Lato", letterSpacing: "2px" }}
    >
      {children}
    </h1>
  );
};

export default TextHeader;
