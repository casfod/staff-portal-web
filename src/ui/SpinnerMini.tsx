import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

interface SpinnerMiniProps {
  width?: number;
  height?: number;
}

const SpinnerMini: React.FC<SpinnerMiniProps> = ({ width = 6, height = 6 }) => {
  return <BiLoaderAlt className={`w-${width} h-${height} animate-spin`} />;
};

export default SpinnerMini;
