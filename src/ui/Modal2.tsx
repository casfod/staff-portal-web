import React, { ReactNode } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

const Modal2: React.FC<ModalProps> = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="  fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className=" w-screen md:w-max bg-white bg-opacity-5 relative rounded shadow-lg  overflow-y-scroll ">
        <button
          className="text-xs md:text-sm bg-white absolute top-2 right-2 m-2 text-red-500 border border-red-500 py-1 px-4 rounded-lg "
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal2;
