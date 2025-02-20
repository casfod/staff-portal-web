import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

const Spinner: React.FC = () => {
  return <BiLoaderAlt className="w-40 h-40 animate-spin text-[#FFA82B]" />;
};

export default Spinner;
