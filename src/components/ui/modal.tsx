// Modal.tsx - Rewritten with Radix UI Dialog (with Redux integration)
import React, { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { closeModal, openModal } from '../../store/modalSlice';
import { RootState } from '../../store/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  return <>{children}</>;
}

// Component to trigger modal opening
interface OpenProps {
  children: React.ReactElement<
    {
      onClick?: React.MouseEventHandler;
    },
    string | React.JSXElementConstructor<unknown>
  >;
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
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  className?: string;
  // Styling overrides — these strip pieces of the DEFAULT look
  // (border, bg, shadow, p-6) that lives in Dialog.tsx's DialogContent.
  // Don't edit Dialog.tsx to change one modal's look — use these instead.
  noBorder?: boolean;
  noPadding?: boolean;
  customPadding?: string;
  customMaxWidth?: string;
  noDefaultStyles?: boolean;
  /**
   * Shorthand variant: strips border, background, and shadow, and hides the
   * close button by default (pass showCloseButton explicitly to override).
   * Padding is left alone — pair with customPadding if you need to adjust it.
   * Equivalent to noBorder + bg-transparent + shadow-none + no close button.
   */
  clean?: boolean;
}

function Window({
  children,
  name,
  title,
  description,
  showCloseButton,
  className = '',
  noBorder = false,
  noPadding = false,
  customPadding,
  customMaxWidth,
  noDefaultStyles = false,
  clean = false,
}: WindowProps) {
  const dispatch = useDispatch();
  const { openName } = useSelector((state: RootState) => state.modal);
  const isOpen = name === openName;

  // `clean` defaults the close button to hidden; an explicit showCloseButton
  // prop always wins.
  const resolvedShowCloseButton = showCloseButton ?? !clean;

  const handleClose = () => {
    dispatch(closeModal());
  };

  // Build custom className based on props
  const getDialogClassName = () => {
    let classes = className;

    if (noBorder) {
      classes += ' border-0';
    }

    if (noPadding) {
      classes += ' p-0';
    }

    if (customPadding) {
      classes += ` ${customPadding}`;
    }

    if (customMaxWidth) {
      classes += ` ${customMaxWidth}`;
    }

    if (noDefaultStyles) {
      // If no default styles, remove border, background, and padding
      classes += ' border-0 bg-transparent shadow-none p-0';
    }

    if (clean) {
      // Border/bg/shadow gone, padding untouched
      classes += ' border-0 bg-transparent shadow-none';
    }

    return classes.trim();
  };

  return createPortal(
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent
        className={`max-h-[80vh] overflow-hiddin ${getDialogClassName()}`}
        hideClose={!resolvedShowCloseButton}
        closeClassName="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100"
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>,
    document.body
  );
}

// Assign subcomponents to Modal
Modal.Open = Open;
Modal.Window = Window;

export default Modal;
