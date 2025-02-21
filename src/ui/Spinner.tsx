import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

const Spinner: React.FC = () => {
  return <BiLoaderAlt className="w-32 h-32 animate-spin text-gray-300" />;
};

export default Spinner;
