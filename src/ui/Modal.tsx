import React, { ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { closeModal, openModal } from "../store/modalSlice";
import { RootState } from "../store/store";

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  return <>{children}</>;
}

// Component to trigger modal opening
interface OpenProps {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  open: string;
}

function Open({ children, open }: OpenProps) {
  const dispatch = useDispatch();

  return React.cloneElement(children, {
    onClick: () => dispatch(openModal(open)),
  });
}

// Component for modal window
interface WindowProps {
  children: ReactNode;
  name: string;
}

function Window({ children, name }: WindowProps) {
  const dispatch = useDispatch();
  const { openName } = useSelector((state: RootState) => state.modal);

  if (name !== openName) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur">
      <div
        className="bg-white z-50 relative transition duration-500 rounded-lg max-h-[80vh] overflow-y-auto top-6"
        onClick={(e) => e.stopPropagation()} // Prevent click events from propagating to the backdrop
      >
        <button
          onClick={() => dispatch(closeModal())}
          className="absolute top-3 right-3 text-red-500 hover:text-gray-700"
        >
          &#x2715; {/* Close Icon */}
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

// Assign subcomponents to Modal
Modal.Open = Open;
Modal.Window = Window;

export default Modal;
