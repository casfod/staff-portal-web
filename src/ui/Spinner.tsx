import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

const Spinner: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <BiLoaderAlt className="w-32 h-32 animate-spin text-gray-300" />
    </div>
  );
};

export default Spinner;
